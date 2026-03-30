export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { withCORS, handleOptions } from "@/lib/cors";

export async function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

/**
 * GET /api/v1/status
 * Check rental status and remaining time
 * Headers: X-API-Key: RO-xxxxxxxx
 */
export async function GET(req: NextRequest) {
  const origin = req.headers.get("origin");
  const apiKey = req.headers.get("x-api-key") ?? req.headers.get("authorization")?.replace("Bearer ", "");
  if (!apiKey) {
    return withCORS(NextResponse.json({ error: "Missing X-API-Key header" }, { status: 401 }), origin);
  }

  const { data: rental } = await supabaseAdmin
    .from("rentals")
    .select("id, status, started_at, ends_at, duration_hrs, agent:agents(name, emoji, category)")
    .eq("session_key", apiKey)
    .single();

  if (!rental) {
    return withCORS(NextResponse.json({ error: "Invalid rental code" }, { status: 401 }), origin);
  }

  const now = new Date();
  const endsAt = rental.ends_at ? new Date(rental.ends_at) : null;
  const isExpired = endsAt ? endsAt < now : false;
  const remainingMs = endsAt ? Math.max(0, endsAt.getTime() - now.getTime()) : 0;
  const remainingMins = Math.floor(remainingMs / 60000);

  const agent = rental.agent as unknown as { name: string; emoji: string; category: string };

  return withCORS(
    NextResponse.json({
      rental_id: rental.id,
      status: isExpired ? "expired" : rental.status,
      agent_name: `${agent.emoji} ${agent.name}`,
      agent_category: agent.category,
      started_at: rental.started_at,
      expires_at: rental.ends_at,
      duration_hrs: rental.duration_hrs,
      remaining_minutes: remainingMins,
      remaining_human: remainingMins > 60
        ? `${Math.floor(remainingMins / 60)}h ${remainingMins % 60}m`
        : `${remainingMins}m`,
    }),
    origin
  );
}
