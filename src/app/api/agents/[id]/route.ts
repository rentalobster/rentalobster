export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthFromRequest } from "@/lib/auth";
import { sanitizeWebhookUrl } from "@/lib/ssrf";

type Params = { params: Promise<{ id: string }> };

// GET /api/agents/[id] — public, excludes sensitive fields (hook_token, webhook_url)
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  const { data: agent, error } = await supabaseAdmin
    .from("agents")
    .select("id, name, emoji, category, description, long_desc, tags, price_per_hour, is_available, total_rentals, rating_sum, rating_count, avg_rating, response_speed, created_at, owner:users(id, wallet, username, avatar_emoji)")
    .eq("id", id)
    .single();

  if (error || !agent) return NextResponse.json({ error: "agent not found" }, { status: 404 });

  const { data: reviews } = await supabaseAdmin
    .from("reviews")
    .select("id, rating, comment, created_at, renter:users(wallet, username, avatar_emoji)")
    .eq("agent_id", id)
    .order("created_at", { ascending: false })
    .limit(20);

  return NextResponse.json({ agent, reviews: reviews ?? [] });
}

// PATCH /api/agents/[id] — owner only
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: agent } = await supabaseAdmin
    .from("agents")
    .select("owner_id")
    .eq("id", id)
    .single();

  if (!agent || agent.owner_id !== auth.userId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));

  // Validate webhook_url if provided
  if (body.webhook_url !== undefined && body.webhook_url !== null) {
    const safe = sanitizeWebhookUrl(body.webhook_url);
    if (!safe) return NextResponse.json({ error: "invalid or unsafe webhook_url" }, { status: 400 });
    body.webhook_url = safe;
  }

  const allowed = ["name", "description", "long_desc", "tags", "price_per_hour", "is_available", "persona", "webhook_url", "hook_token", "emoji", "response_speed"];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }

  const { data, error } = await supabaseAdmin
    .from("agents")
    .update(updates)
    .eq("id", id)
    .select("id, name, emoji, category, description, long_desc, tags, price_per_hour, is_available, total_rentals, rating_sum, rating_count, avg_rating, response_speed")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ agent: data });
}

// DELETE /api/agents/[id] — owner only
export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: agent } = await supabaseAdmin
    .from("agents")
    .select("owner_id")
    .eq("id", id)
    .single();

  if (!agent || agent.owner_id !== auth.userId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  await supabaseAdmin.from("agents").delete().eq("id", id);
  return NextResponse.json({ success: true });
}
