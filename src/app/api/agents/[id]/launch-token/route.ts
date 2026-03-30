export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

const BAGS_BASE = "https://public-api-v2.bags.fm/api/v1";
type Params = { params: Promise<{ id: string }> };

/**
 * POST /api/agents/[id]/launch-token
 * Step 2 — Get fee-share config transactions (to sign with Phantom)
 * Body: { wallet: string }
 */
export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const apiKey = process.env.BAGS_FM_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "BAGS_FM_API_KEY not configured" }, { status: 503 });

  const body = await req.json().catch(() => ({}));
  const { wallet } = body;
  if (!wallet) return NextResponse.json({ error: "wallet required" }, { status: 400 });

  const { data: agent } = await supabaseAdmin
    .from("agents")
    .select("id, owner_id, token_mint, token_status")
    .eq("id", id)
    .single();

  if (!agent) return NextResponse.json({ error: "agent not found" }, { status: 404 });
  if (agent.owner_id !== auth.userId) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!agent.token_mint) return NextResponse.json({ error: "token metadata not created yet" }, { status: 400 });
  if (agent.token_status === "active") return NextResponse.json({ error: "token already launched" }, { status: 400 });

  const res = await fetch(`${BAGS_BASE}/fee-share/config`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey },
    body: JSON.stringify({
      payer: wallet,
      baseMint: agent.token_mint,
      claimersArray: [wallet],   // agent owner gets 100% of trading fees
      basisPointsArray: [10000],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return NextResponse.json({ error: err.error ?? "bags.fm fee-share config failed" }, { status: res.status });
  }

  const data = await res.json();
  if (!data.success) return NextResponse.json({ error: "bags.fm fee-share config failed" }, { status: 500 });

  return NextResponse.json({
    needsCreation: data.response.needsCreation,
    meteoraConfigKey: data.response.meteoraConfigKey,
    transactions: data.response.transactions ?? [],
  });
}

/**
 * PUT /api/agents/[id]/launch-token
 * Step 3 — Get the on-chain launch transaction (to sign with Phantom)
 * Body: { wallet: string, configKey: string, initialBuyLamports?: number }
 */
export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const apiKey = process.env.BAGS_FM_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "BAGS_FM_API_KEY not configured" }, { status: 503 });

  const body = await req.json().catch(() => ({}));
  const { wallet, configKey, initialBuyLamports = 0 } = body;
  if (!wallet || !configKey) return NextResponse.json({ error: "wallet and configKey required" }, { status: 400 });

  const { data: agent } = await supabaseAdmin
    .from("agents")
    .select("id, owner_id, token_mint, token_metadata_url")
    .eq("id", id)
    .single();

  if (!agent) return NextResponse.json({ error: "agent not found" }, { status: 404 });
  if (agent.owner_id !== auth.userId) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!agent.token_mint || !agent.token_metadata_url) {
    return NextResponse.json({ error: "token metadata not created yet" }, { status: 400 });
  }

  const res = await fetch(`${BAGS_BASE}/token-launch/create-launch-transaction`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey },
    body: JSON.stringify({
      ipfs: agent.token_metadata_url,
      tokenMint: agent.token_mint,
      wallet,
      initialBuyLamports,
      configKey,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return NextResponse.json({ error: err.error ?? "bags.fm launch transaction failed" }, { status: res.status });
  }

  const data = await res.json();
  if (!data.success) return NextResponse.json({ error: "bags.fm launch transaction failed" }, { status: 500 });

  // Mark token as active
  await supabaseAdmin.from("agents").update({ token_status: "active" }).eq("id", id);

  return NextResponse.json({ launchTx: data.response });
}
