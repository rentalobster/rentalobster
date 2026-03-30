export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthFromRequest } from "@/lib/auth";
import { withCORS, handleOptions } from "@/lib/cors";
import { sanitizeWebhookUrl } from "@/lib/ssrf";

const PAGE_SIZE = 24;

export async function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

/**
 * Public Agents API — for OpenClaw integration
 *
 * GET    /api/v1/agents               — list all available agents
 * POST   /api/v1/agents               — register agent (auth required)
 * GET    /api/v1/agents?id=[id]       — get single agent
 * PUT    /api/v1/agents?id=[id]       — update agent (owner only)
 * DELETE /api/v1/agents?id=[id]       — remove agent (owner only)
 */

export async function GET(req: NextRequest) {
  const origin = req.headers.get("origin");
  const { searchParams } = req.nextUrl;
  const id = searchParams.get("id");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const offset = (page - 1) * PAGE_SIZE;

  if (id) {
    const { data, error } = await supabaseAdmin
      .from("agents")
      .select("id, name, emoji, category, description, tags, price_per_hour, is_available, total_rentals, avg_rating, response_speed")
      .eq("id", id)
      .single();
    if (error) return withCORS(NextResponse.json({ error: "agent not found" }, { status: 404 }), origin);
    return withCORS(NextResponse.json({ agent: data }), origin);
  }

  const { data, count } = await supabaseAdmin
    .from("agents")
    .select("id, name, emoji, category, description, tags, price_per_hour, is_available, total_rentals, avg_rating, response_speed", { count: "exact" })
    .eq("is_available", true)
    .order("total_rentals", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  return withCORS(
    NextResponse.json({
      agents: data ?? [],
      pagination: { page, pageSize: PAGE_SIZE, total: count ?? 0, hasMore: offset + PAGE_SIZE < (count ?? 0) },
    }),
    origin
  );
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  const auth = getAuthFromRequest(req);
  if (!auth) return withCORS(NextResponse.json({ error: "unauthorized" }, { status: 401 }), origin);

  const body = await req.json().catch(() => ({}));
  const { name, emoji, category, description, long_desc, tags, price_per_hour, persona, webhook_url, hook_token } = body;

  if (!name || !category || !description || !price_per_hour) {
    return withCORS(NextResponse.json({ error: "name, category, description, price_per_hour required" }, { status: 400 }), origin);
  }

  let safeWebhookUrl: string | null = null;
  if (webhook_url) {
    safeWebhookUrl = sanitizeWebhookUrl(webhook_url);
    if (!safeWebhookUrl) {
      return withCORS(NextResponse.json({ error: "invalid or unsafe webhook_url" }, { status: 400 }), origin);
    }
  }

  const { data, error } = await supabaseAdmin
    .from("agents")
    .insert({
      owner_id: auth.userId,
      name, emoji: emoji ?? "🤖", category, description,
      long_desc: long_desc ?? null,
      tags: tags ?? [],
      price_per_hour,
      persona: persona ?? null,
      webhook_url: safeWebhookUrl,
      hook_token: hook_token ?? null,
    })
    .select()
    .single();

  if (error) return withCORS(NextResponse.json({ error: error.message }, { status: 500 }), origin);
  return withCORS(NextResponse.json({ agent: data, message: "Agent registered successfully" }, { status: 201 }), origin);
}

export async function PUT(req: NextRequest) {
  const origin = req.headers.get("origin");
  const auth = getAuthFromRequest(req);
  if (!auth) return withCORS(NextResponse.json({ error: "unauthorized" }, { status: 401 }), origin);

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return withCORS(NextResponse.json({ error: "id required" }, { status: 400 }), origin);

  const { data: existing } = await supabaseAdmin.from("agents").select("owner_id").eq("id", id).single();
  if (!existing || existing.owner_id !== auth.userId) {
    return withCORS(NextResponse.json({ error: "forbidden" }, { status: 403 }), origin);
  }

  const body = await req.json().catch(() => ({}));

  if (body.webhook_url !== undefined && body.webhook_url !== null) {
    const safe = sanitizeWebhookUrl(body.webhook_url);
    if (!safe) return withCORS(NextResponse.json({ error: "invalid or unsafe webhook_url" }, { status: 400 }), origin);
    body.webhook_url = safe;
  }

  const allowed = ["name", "description", "long_desc", "tags", "price_per_hour", "is_available", "persona", "webhook_url", "hook_token", "emoji"];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) if (body[key] !== undefined) updates[key] = body[key];

  const { data, error } = await supabaseAdmin.from("agents").update(updates).eq("id", id).select().single();
  if (error) return withCORS(NextResponse.json({ error: error.message }, { status: 500 }), origin);
  return withCORS(NextResponse.json({ agent: data }), origin);
}

export async function DELETE(req: NextRequest) {
  const origin = req.headers.get("origin");
  const auth = getAuthFromRequest(req);
  if (!auth) return withCORS(NextResponse.json({ error: "unauthorized" }, { status: 401 }), origin);

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return withCORS(NextResponse.json({ error: "id required" }, { status: 400 }), origin);

  const { data: existing } = await supabaseAdmin.from("agents").select("owner_id").eq("id", id).single();
  if (!existing || existing.owner_id !== auth.userId) {
    return withCORS(NextResponse.json({ error: "forbidden" }, { status: 403 }), origin);
  }

  await supabaseAdmin.from("agents").delete().eq("id", id);
  return withCORS(NextResponse.json({ success: true, message: "Agent removed from marketplace" }), origin);
}
