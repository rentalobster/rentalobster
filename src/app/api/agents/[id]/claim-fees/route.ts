export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import { BagsSDK } from "@bagsfm/bags-sdk";
import bs58 from "bs58";

type Params = { params: Promise<{ id: string }> };

function getBagsSDK() {
  const apiKey = process.env.BAGS_FM_API_KEY;
  if (!apiKey) return null;
  const rpc = process.env.SOLANA_RPC_URL ?? clusterApiUrl("mainnet-beta");
  return new BagsSDK(apiKey, new Connection(rpc));
}

// POST /api/agents/[id]/claim-fees
// Returns serialized claim transactions for the agent owner to sign with Phantom
export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const sdk = getBagsSDK();
  if (!sdk) return NextResponse.json({ error: "BAGS_FM_API_KEY not configured" }, { status: 503 });

  // Get agent + verify ownership
  const { data: agent } = await supabaseAdmin
    .from("agents")
    .select("id, owner_id, token_mint, token_status")
    .eq("id", id)
    .single();

  if (!agent) return NextResponse.json({ error: "agent not found" }, { status: 404 });
  if (agent.owner_id !== auth.userId) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!agent.token_mint) return NextResponse.json({ error: "agent has no token" }, { status: 400 });

  // Get owner wallet
  const { data: user } = await supabaseAdmin
    .from("users")
    .select("wallet")
    .eq("id", auth.userId)
    .single();

  if (!user) return NextResponse.json({ error: "user not found" }, { status: 404 });

  try {
    const txs = await sdk.fee.getClaimTransactions(
      new PublicKey(user.wallet),
      new PublicKey(agent.token_mint)
    );

    if (!txs || txs.length === 0) {
      return NextResponse.json({ error: "No fees to claim" }, { status: 400 });
    }

    // Serialize each legacy Transaction to Base58 for client signing
    const serialized = txs.map((tx) => {
      const bytes = tx.serialize({ requireAllSignatures: false, verifySignatures: false });
      return bs58.encode(bytes);
    });

    return NextResponse.json({ transactions: serialized });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to get claim transactions";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
