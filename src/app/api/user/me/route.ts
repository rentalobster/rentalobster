export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthFromRequest } from "@/lib/auth";

// GET /api/user/me — get current user profile + stats
export async function GET(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("id", auth.userId)
    .single();

  if (!user) return NextResponse.json({ error: "user not found" }, { status: 404 });

  // Count active rentals
  const { count: activeRentals } = await supabaseAdmin
    .from("rentals")
    .select("*", { count: "exact", head: true })
    .eq("renter_id", auth.userId)
    .eq("status", "active");

  // Count owned agents
  const { count: ownedAgents } = await supabaseAdmin
    .from("agents")
    .select("*", { count: "exact", head: true })
    .eq("owner_id", auth.userId);

  return NextResponse.json({ user, stats: { activeRentals, ownedAgents } });
}

// PATCH /api/user/me — update profile
export async function PATCH(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { username, avatar_emoji } = await req.json();
  const { data, error } = await supabaseAdmin
    .from("users")
    .update({ username, avatar_emoji })
    .eq("id", auth.userId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ user: data });
}
