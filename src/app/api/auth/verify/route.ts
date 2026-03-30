export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyWalletSignature, signToken, isValidSolanaAddress, COOKIE_OPTIONS } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { wallet, signature, message } = body;

  if (!wallet || !signature || !message) {
    return NextResponse.json({ error: "wallet, signature, and message required" }, { status: 400 });
  }
  if (!isValidSolanaAddress(wallet)) {
    return NextResponse.json({ error: "invalid Solana wallet address" }, { status: 400 });
  }
  if (typeof signature !== "string" || typeof message !== "string") {
    return NextResponse.json({ error: "invalid request body" }, { status: 400 });
  }

  // Verify nonce exists and is not expired
  const { data: nonceRow } = await supabaseAdmin
    .from("auth_nonces")
    .select("*")
    .eq("wallet", wallet)
    .single();

  if (!nonceRow || new Date(nonceRow.expires_at) < new Date()) {
    return NextResponse.json({ error: "nonce expired or not found — request a new one" }, { status: 401 });
  }

  // Nonce must appear in the signed message
  if (!message.includes(nonceRow.nonce)) {
    return NextResponse.json({ error: "message nonce mismatch" }, { status: 401 });
  }

  // Verify signature
  const valid = verifyWalletSignature(message, signature, wallet);
  if (!valid) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  // Consume nonce (delete immediately to prevent replay)
  await supabaseAdmin.from("auth_nonces").delete().eq("wallet", wallet);

  // Upsert user
  const { data: user, error: userError } = await supabaseAdmin
    .from("users")
    .upsert({ wallet }, { onConflict: "wallet" })
    .select()
    .single();

  if (userError || !user) {
    return NextResponse.json({ error: "failed to create user" }, { status: 500 });
  }

  const token = signToken({ userId: user.id, wallet: user.wallet });

  // Set httpOnly cookie — never exposed to JS
  const response = NextResponse.json({ user });
  response.cookies.set("ro_token", token, COOKIE_OPTIONS);
  return response;
}
