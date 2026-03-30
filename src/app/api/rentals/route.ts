export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthFromRequest } from "@/lib/auth";
import { generateSessionKey } from "@/lib/session";
import { getRentalTotal, solToLamports, verifyEscrowAccount } from "@/lib/solana";

// GET /api/rentals — list current user's rentals
export async function GET(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("rentals")
    .select("*, agent:agents(id, name, emoji, category, description, price_per_hour)")
    .eq("renter_id", auth.userId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ rentals: data });
}

// POST /api/rentals — create a new rental
// Escrow-only: requires escrow_pubkey + nonce_hex from the on-chain create_rental tx
export async function POST(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { agent_id, duration_hrs, escrow_pubkey, nonce_hex } = body;

  if (!agent_id || !duration_hrs) {
    return NextResponse.json({ error: "agent_id and duration_hrs required" }, { status: 400 });
  }
  if (!escrow_pubkey || !nonce_hex) {
    return NextResponse.json(
      { error: "escrow_pubkey and nonce_hex required — all rentals must use on-chain escrow" },
      { status: 400 },
    );
  }
  if (typeof escrow_pubkey !== "string" || escrow_pubkey.length < 32) {
    return NextResponse.json({ error: "invalid escrow_pubkey" }, { status: 400 });
  }

  const hrs = parseFloat(duration_hrs);
  if (isNaN(hrs) || hrs < 0.5 || hrs > 720) {
    return NextResponse.json({ error: "duration_hrs must be between 0.5 and 720" }, { status: 400 });
  }

  // Fetch agent
  const { data: agent } = await supabaseAdmin
    .from("agents")
    .select("id, price_per_hour, is_available, owner_id, owner:users(wallet)")
    .eq("id", agent_id)
    .single();

  if (!agent) return NextResponse.json({ error: "agent not found" }, { status: 404 });
  if (!agent.is_available) return NextResponse.json({ error: "agent not available" }, { status: 409 });
  if (agent.owner_id === auth.userId) {
    return NextResponse.json({ error: "cannot rent your own agent" }, { status: 400 });
  }

  // Replay prevention — escrow_pubkey is unique per rental
  const { data: existing } = await supabaseAdmin
    .from("rentals")
    .select("id")
    .eq("escrow_pubkey", escrow_pubkey)
    .single();
  if (existing) {
    return NextResponse.json({ error: "escrow already used" }, { status: 409 });
  }

  // Verify the on-chain escrow PDA holds the correct amount
  const totalCost = getRentalTotal(agent.price_per_hour, hrs);
  const expectedLamports = solToLamports(totalCost);

  const result = await verifyEscrowAccount(escrow_pubkey, auth.wallet, expectedLamports);
  if (!result.valid) {
    return NextResponse.json(
      { error: "on-chain escrow verification failed — account not found, wrong renter, or insufficient funds" },
      { status: 402 },
    );
  }

  // Create rental
  const sessionKey = generateSessionKey();
  const now = new Date();
  const endsAt = new Date(now.getTime() + hrs * 60 * 60 * 1000);

  const { data: rental, error } = await supabaseAdmin
    .from("rentals")
    .insert({
      agent_id,
      renter_id: auth.userId,
      duration_hrs: hrs,
      total_cost: totalCost,
      platform_fee: 0.02,
      status: "active",
      session_key: sessionKey,
      tx_signature: nonce_hex,   // nonce stored as unique identifier
      escrow_pubkey,
      started_at: now.toISOString(),
      ends_at: endsAt.toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await supabaseAdmin.rpc("increment_agent_rentals", { agent_id_param: agent_id });

  return NextResponse.json({ rental, session_key: sessionKey }, { status: 201 });
}
