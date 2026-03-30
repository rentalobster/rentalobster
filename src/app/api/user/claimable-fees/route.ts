export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import { BagsSDK } from "@bagsfm/bags-sdk";

function getBagsSDK() {
  const apiKey = process.env.BAGS_FM_API_KEY;
  if (!apiKey) return null;
  const rpc = process.env.SOLANA_RPC_URL ?? clusterApiUrl("mainnet-beta");
  return new BagsSDK(apiKey, new Connection(rpc));
}

// GET /api/user/claimable-fees
// Returns claimable fee positions for all agents owned by the authed user
export async function GET(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const sdk = getBagsSDK();
  if (!sdk) return NextResponse.json({ error: "BAGS_FM_API_KEY not configured" }, { status: 503 });

  // Get user's wallet
  const { data: user } = await supabaseAdmin
    .from("users")
    .select("wallet")
    .eq("id", auth.userId)
    .single();

  if (!user) return NextResponse.json({ error: "user not found" }, { status: 404 });

  // Get all agents owned by this user that have a token
  const { data: agents } = await supabaseAdmin
    .from("agents")
    .select("id, name, emoji, token_mint, token_symbol, token_status")
    .eq("owner_id", auth.userId)
    .not("token_mint", "is", null);

  if (!agents || agents.length === 0) {
    return NextResponse.json({ positions: [], agents: [] });
  }

  // Get all claimable positions for this wallet
  let positions: unknown[] = [];
  try {
    positions = await sdk.fee.getAllClaimablePositions(new PublicKey(user.wallet));
  } catch {
    // No positions or RPC error — return empty
    return NextResponse.json({ positions: [], agents });
  }

  // Match positions to agents by baseMint === token_mint
  const agentMintSet = new Set(agents.map((a) => a.token_mint));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const relevantPositions = (positions as any[]).filter(
    (p) => p.baseMint && agentMintSet.has(p.baseMint)
  );

  // Build per-agent summary
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mintToClaimable: Record<string, number> = {};
  for (const p of relevantPositions) {
    const lamports = p.totalClaimableLamportsUserShare ?? 0;
    mintToClaimable[p.baseMint] = (mintToClaimable[p.baseMint] ?? 0) + lamports;
  }

  // Get lifetime fees per token (best effort)
  const mintToLifetime: Record<string, number> = {};
  await Promise.allSettled(
    agents.map(async (agent) => {
      if (!agent.token_mint) return;
      try {
        const lamports = await sdk.state.getTokenLifetimeFees(new PublicKey(agent.token_mint));
        mintToLifetime[agent.token_mint] = lamports;
      } catch { /* ignore */ }
    })
  );

  const agentFees = agents.map((agent) => ({
    ...agent,
    claimable_lamports: mintToClaimable[agent.token_mint!] ?? 0,
    claimable_sol: ((mintToClaimable[agent.token_mint!] ?? 0) / 1e9).toFixed(6),
    lifetime_lamports: mintToLifetime[agent.token_mint!] ?? 0,
    lifetime_sol: ((mintToLifetime[agent.token_mint!] ?? 0) / 1e9).toFixed(6),
  }));

  return NextResponse.json({ agents: agentFees });
}
