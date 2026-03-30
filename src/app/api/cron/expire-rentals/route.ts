export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { PublicKey } from "@solana/web3.js";
import { connection } from "@/lib/solana";
import {
  getEscrowProgramId,
  sendCompleteRental,
  loadAuthorityKeypair,
} from "@/lib/escrow";

// POST /api/cron/expire-rentals
// Marks expired rentals as completed.
// For escrow rentals: also calls complete_rental on-chain to release funds.
// Secured by CRON_SECRET env var.
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET || !process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const now = new Date().toISOString();
  const programId = getEscrowProgramId();
  const authority  = loadAuthorityKeypair();
  const treasury   = process.env.NEXT_PUBLIC_TREASURY_WALLET ?? "";

  // Fetch expired active rentals with agent owner info
  const { data: expired, error } = await supabaseAdmin
    .from("rentals")
    .select("id, escrow_pubkey, agent:agents(owner:users(wallet))")
    .eq("status", "active")
    .lt("ends_at", now);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results: { id: string; escrow: boolean; onChain?: string; err?: string }[] = [];

  for (const rental of expired ?? []) {
    const rid = rental.id as string;
    const escrowPubkey = rental.escrow_pubkey as string | null;

    // If this is an escrow rental, release funds on-chain first
    if (escrowPubkey && programId && authority && treasury) {
      try {
        const agentOwner = (rental.agent as unknown as { owner: { wallet: string } })?.owner?.wallet;
        if (agentOwner) {
          const sig = await sendCompleteRental(
            connection,
            programId,
            new PublicKey(escrowPubkey),
            agentOwner,
            treasury,
            authority,
          );
          results.push({ id: rid, escrow: true, onChain: sig });
        } else {
          results.push({ id: rid, escrow: true, err: "agent owner wallet not found" });
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        results.push({ id: rid, escrow: true, err: msg });
      }
    } else {
      results.push({ id: rid, escrow: false });
    }
  }

  // Mark all as completed in DB regardless of on-chain outcome
  if ((expired ?? []).length > 0) {
    await supabaseAdmin
      .from("rentals")
      .update({ status: "completed" })
      .eq("status", "active")
      .lt("ends_at", now);
  }

  return NextResponse.json({
    expired: (expired ?? []).length,
    timestamp: now,
    results,
  });
}
