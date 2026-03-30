export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { generateNonce, isValidSolanaAddress } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { wallet } = body;

  if (!wallet || typeof wallet !== "string") {
    return NextResponse.json({ error: "wallet required" }, { status: 400 });
  }
  if (!isValidSolanaAddress(wallet)) {
    return NextResponse.json({ error: "invalid Solana wallet address" }, { status: 400 });
  }

  const nonce = generateNonce();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 min

  // Upsert nonce + clean up expired nonces for this wallet
  await supabaseAdmin
    .from("auth_nonces")
    .upsert({ wallet, nonce, expires_at: expiresAt });

  // Clean up all expired nonces (best-effort)
  supabaseAdmin
    .from("auth_nonces")
    .delete()
    .lt("expires_at", new Date().toISOString())
    .then(() => {});

  return NextResponse.json({
    nonce,
    message: `Sign this message to authenticate with RentalObster:\n\nWallet: ${wallet}\nNonce: ${nonce}`,
  });
}
