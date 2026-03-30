export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { withCORS, handleOptions } from "@/lib/cors";
import { checkRateLimit } from "@/lib/rateLimit";
import { sanitizeWebhookUrl } from "@/lib/ssrf";

export async function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

/**
 * Public Chat API — OpenClaw only
 *
 * POST /api/v1/chat
 * Headers:
 *   X-API-Key: RO-xxxxxxxxxxxxxxxx  (your rental code)
 *   Content-Type: application/json
 * Body:
 *   { "message": "Hello!" }
 *
 * Response:
 *   { agent_name, response, rental_id, expires_at, source }
 */
export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");

  const apiKey = req.headers.get("x-api-key") ?? req.headers.get("authorization")?.replace("Bearer ", "");
  if (!apiKey) {
    return withCORS(
      NextResponse.json(
        { error: "Missing API key", hint: "Set X-API-Key header to your rental code" },
        { status: 401 }
      ),
      origin
    );
  }

  // Validate rental
  const { data: rental } = await supabaseAdmin
    .from("rentals")
    .select("*, agent:agents(id, name, emoji, webhook_url, hook_token)")
    .eq("session_key", apiKey)
    .eq("status", "active")
    .single();

  if (!rental) {
    return withCORS(
      NextResponse.json({ error: "Invalid or expired rental code" }, { status: 401 }),
      origin
    );
  }

  // Check expiry
  if (rental.ends_at && new Date(rental.ends_at) < new Date()) {
    await supabaseAdmin.from("rentals").update({ status: "completed" }).eq("id", rental.id);
    return withCORS(
      NextResponse.json({ error: "Rental session has expired" }, { status: 403 }),
      origin
    );
  }

  // Rate limiting: 60 req/min per rental
  const { allowed, remaining } = await checkRateLimit(rental.id, 60);
  if (!allowed) {
    return withCORS(
      NextResponse.json(
        { error: "Rate limit exceeded", hint: "Max 60 requests per minute" },
        { status: 429, headers: { "X-RateLimit-Remaining": "0", "Retry-After": "60" } }
      ),
      origin
    );
  }

  const body = await req.json().catch(() => ({}));
  const message = body.message as string | undefined;

  if (!message || typeof message !== "string") {
    return withCORS(
      NextResponse.json({ error: "message field required (string)" }, { status: 400 }),
      origin
    );
  }
  if (message.length > 10000) {
    return withCORS(
      NextResponse.json({ error: "message exceeds 10000 character limit" }, { status: 400 }),
      origin
    );
  }

  const agent = rental.agent as {
    id: string; name: string; emoji: string;
    webhook_url: string | null; hook_token: string | null;
  };

  // Require OpenClaw webhook
  if (!agent.webhook_url || !agent.hook_token) {
    return withCORS(
      NextResponse.json(
        {
          error: "Agent not configured",
          hint: "This agent has not connected an OpenClaw gateway. The agent owner must add a webhook_url and hook_token.",
        },
        { status: 503 }
      ),
      origin
    );
  }

  const safeUrl = sanitizeWebhookUrl(agent.webhook_url);
  if (!safeUrl) {
    return withCORS(
      NextResponse.json({ error: "Agent webhook URL is invalid" }, { status: 502 }),
      origin
    );
  }

  // Forward to OpenClaw gateway
  try {
    const webhookRes = await fetch(safeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${agent.hook_token}`,
        "X-Rental-Id": rental.id,
        "X-Session-Key": apiKey,
      },
      body: JSON.stringify({ message, rental_id: rental.id }),
      signal: AbortSignal.timeout(30000),
    });

    if (!webhookRes.ok) {
      const errText = await webhookRes.text().catch(() => "");
      return withCORS(
        NextResponse.json(
          { error: "Agent gateway returned an error", detail: errText.slice(0, 200) },
          { status: 502 }
        ),
        origin
      );
    }

    const webhookData = await webhookRes.json();
    const reply = webhookData.response ?? webhookData.message ?? webhookData.reply ?? "";

    await supabaseAdmin.from("chat_messages").insert([
      { rental_id: rental.id, role: "user",      content: message },
      { rental_id: rental.id, role: "assistant", content: reply  },
    ]);

    return withCORS(
      NextResponse.json({
        agent_name: `${agent.emoji} ${agent.name}`,
        response: reply,
        rental_id: rental.id,
        expires_at: rental.ends_at,
        source: "openclaw",
        rate_limit_remaining: remaining,
      }),
      origin
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return withCORS(
      NextResponse.json(
        { error: "Failed to reach agent gateway", detail: msg },
        { status: 504 }
      ),
      origin
    );
  }
}
