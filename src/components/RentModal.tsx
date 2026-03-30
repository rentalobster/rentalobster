"use client";

import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import {
  PublicKey,
  Transaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { useAuth } from "@/context/AuthContext";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Zap, Clock, Lock, Loader2, Copy, Check, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Agent } from "@/lib/supabase";

const PLATFORM_FEE = parseFloat(process.env.NEXT_PUBLIC_PLATFORM_FEE ?? "0.02");

const DURATIONS = [
  { label: "1 Hour",  hours: 1  },
  { label: "3 Hours", hours: 3  },
  { label: "6 Hours", hours: 6  },
  { label: "12 Hours",hours: 12 },
  { label: "24 Hours",hours: 24 },
  { label: "72 Hours",hours: 72 },
];

type Props  = { agent: Agent; onClose: () => void };
type Step   = "configure" | "paying" | "success";

export default function RentModal({ agent, onClose }: Props) {
  const { publicKey, sendTransaction, connected } = useWallet();
  const { connection } = useConnection();
  const { user, signIn } = useAuth();
  const { setVisible } = useWalletModal();

  const [duration,   setDuration]   = useState(1);
  const [step,       setStep]       = useState<Step>("configure");
  const [error,      setError]      = useState("");
  const [sessionKey, setSessionKey] = useState("");
  const [copied,     setCopied]     = useState(false);

  const agentCost = agent.price_per_hour * duration;
  const total     = parseFloat((agentCost + PLATFORM_FEE).toFixed(4));

  async function handleRent() {
    if (!connected) { setVisible(true); return; }
    if (!user)      { await signIn();   return; }
    if (!publicKey) return;

    setError("");
    setStep("paying");

    try {
      const { getEscrowProgramId, buildCreateRentalIx, findEscrowPDA } = await import("@/lib/escrow");
      const programId = getEscrowProgramId();

      if (!programId) {
        throw new Error("Escrow program not configured. Contact the platform admin.");
      }

      const agentLamports = Math.round(agentCost * LAMPORTS_PER_SOL);
      const feeLamports   = Math.round(PLATFORM_FEE * LAMPORTS_PER_SOL);

      // 1. Generate random 8-byte nonce
      const nonce = globalThis.crypto.getRandomValues(new Uint8Array(8));
      const nonceHex = Array.from(nonce).map(b => b.toString(16).padStart(2, "0")).join("");

      // 2. Fetch agent owner's wallet
      const agentOwnerRes = await fetch(`/api/agents/${agent.id}`, { credentials: "include" });
      const agentData = await agentOwnerRes.json();
      const agentOwnerWallet: string = agentData?.agent?.owner?.wallet;
      if (!agentOwnerWallet) throw new Error("Could not resolve agent owner wallet.");

      // 3. Build create_rental instruction
      const ix = await buildCreateRentalIx(
        programId,
        publicKey,
        new PublicKey(agentOwnerWallet),
        nonce,
        BigInt(agentLamports),
        BigInt(feeLamports),
      );

      // 4. Send transaction
      const tx = new Transaction().add(ix);
      const { blockhash } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;
      const txSignature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(txSignature, "confirmed");

      // 5. Derive escrow PDA
      const [escrowPDA] = findEscrowPDA(publicKey, nonce, programId);
      const escrowPubkey = escrowPDA.toBase58();

      // 6. Create rental in DB
      const res = await fetch("/api/rentals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          agent_id:     agent.id,
          duration_hrs: duration,
          escrow_pubkey: escrowPubkey,
          nonce_hex:     nonceHex,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create rental");

      const sk: string = data.session_key;
      try {
        localStorage.setItem(`agent_${sk}`, JSON.stringify({ name: agent.name, emoji: agent.emoji }));
      } catch {}

      setSessionKey(sk);
      setStep("success");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(msg.includes("rejected") || msg.includes("cancelled") ? "Transaction cancelled." : msg);
      setStep("configure");
    }
  }

  function copyKey() {
    navigator.clipboard.writeText(sessionKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Escrow is always required — check program ID is real
  const escrowReady = Boolean(
    process.env.NEXT_PUBLIC_ESCROW_PROGRAM_ID &&
    process.env.NEXT_PUBLIC_ESCROW_PROGRAM_ID !== "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: "rgba(0,0,0,0.75)" }}>
      <div className="xp-window w-full max-w-md">
        {/* XP Title Bar */}
        <div className="xp-titlebar">
          <div className="flex items-center gap-2">
            <span className="text-base leading-none">{agent.emoji}</span>
            <span className="xp-titlebar-text">Rent Agent — {agent.name}</span>
          </div>
          <button onClick={onClose} className="xp-close-btn">✕</button>
        </div>

        {/* Window body */}
        <div className="bg-[#ece9d8]">

          {step === "configure" && (
            <div className="p-4 space-y-4">
              {/* Duration picker */}
              <div>
                <div className="font-pixel text-[7px] text-[#000] mb-2">Select Duration:</div>
                <div className="grid grid-cols-3 gap-1.5">
                  {DURATIONS.map((d) => (
                    <button
                      key={d.hours}
                      onClick={() => setDuration(d.hours)}
                      className={cn(
                        "xp-button font-retro text-[14px]",
                        duration === d.hours
                          ? "xp-button-primary"
                          : ""
                      )}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cost breakdown — sunken panel */}
              <div className="xp-sunken bg-white p-3 space-y-1.5 font-retro text-[14px] text-[#333]">
                <div className="flex justify-between">
                  <span>Agent rate ({duration}h × {agent.price_per_hour} SOL)</span>
                  <span className="font-bold">{agentCost.toFixed(4)} SOL</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform fee</span>
                  <span className="font-bold">{PLATFORM_FEE} SOL</span>
                </div>
                <div className="flex justify-between border-t-2 border-[#808080] pt-1 mt-1"
                     style={{ borderBottom: "2px solid #fff" }}>
                  <span className="font-pixel text-[7px] text-[#000]">TOTAL</span>
                  <span className="font-pixel text-[8px] mc-text-gold">{total} SOL</span>
                </div>
              </div>

              {/* Info tags */}
              <div className="flex gap-2 flex-wrap">
                <span className="xp-raised bg-[#d4d0c8] flex items-center gap-1 px-2 py-1 font-retro text-[12px] text-[#000]">
                  <Clock className="w-3 h-3" />
                  {duration}h session
                </span>
                <span className="xp-raised bg-[#d4d0c8] flex items-center gap-1 px-2 py-1 font-retro text-[12px] text-[#000]">
                  <Lock className="w-3 h-3" />
                  On-chain escrow
                </span>
                <span className="xp-raised bg-[#d4d0c8] flex items-center gap-1 px-2 py-1 font-retro text-[12px] text-[#000]">
                  <Zap className="w-3 h-3" />
                  Instant key
                </span>
              </div>

              {escrowReady ? (
                <div className="mc-panel mc-block-green p-2 flex items-center gap-2">
                  <Lock className="w-3 h-3 text-[#55ff55] shrink-0" />
                  <span className="font-retro text-[13px] mc-text-green">
                    SOL locked in Solana program PDA — auto-released when rental ends. You are protected.
                  </span>
                </div>
              ) : (
                <div className="mc-panel p-2 flex items-center gap-2"
                     style={{ borderColor: "#ff5555 #8b0000 #8b0000 #ff5555", background: "#3d1a1a" }}>
                  <Lock className="w-3 h-3 text-[#ff5555] shrink-0" />
                  <span className="font-retro text-[13px] mc-text-red">
                    Escrow program not deployed yet — rentals are disabled until the admin configures it.
                  </span>
                </div>
              )}

              {error && (
                <div className="mc-panel mc-block p-2"
                     style={{ borderColor: "#ff5555 #8b0000 #8b0000 #ff5555", background: "#3d1a1a" }}>
                  <span className="font-retro text-[14px] mc-text-red">{error}</span>
                </div>
              )}

              <button
                onClick={handleRent}
                disabled={!escrowReady}
                className="xp-button xp-button-primary w-full flex items-center justify-center gap-2 py-3 text-[8px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap className="w-4 h-4" />
                {!escrowReady
                  ? "ESCROW NOT CONFIGURED"
                  : !connected ? "CONNECT WALLET TO RENT"
                  : !user ? "SIGN IN TO RENT"
                  : `RENT FOR ${total} SOL`}
              </button>
              <p className="text-center font-retro text-[12px] text-[#666]">
                By renting you agree to our Terms of Service
              </p>
            </div>
          )}

          {step === "paying" && (
            <div className="p-10 flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 text-[#0054e3] animate-spin" />
              <div className="font-pixel text-[8px] text-[#000]">Processing Rental...</div>
              <div className="font-retro text-[15px] text-[#555] text-center">
                Locking SOL in on-chain escrow... please confirm in your wallet.
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="p-4 space-y-4">
              {/* Success header */}
              <div className="xp-window">
                <div className="xp-titlebar" style={{ background: "linear-gradient(180deg, #55cc55 0%, #228822 100%)" }}>
                  <span className="xp-titlebar-text">✔ Agent Rented Successfully!</span>
                  <div className="xp-close-btn" style={{ background: "linear-gradient(180deg, #88ff88 0%, #228822 100%)" }}>✕</div>
                </div>
                <div className="bg-[#ece9d8] p-3 text-center">
                  <div className="text-4xl mb-1">🎉</div>
                  <div className="font-retro text-[16px] text-[#000]">
                    {agent.name} is ready for {duration} hour{duration > 1 ? "s" : ""}
                  </div>
                </div>
              </div>

              {/* Rental Code */}
              <div className="xp-sunken bg-black p-3">
                <div className="font-pixel text-[6px] text-[#aaa] mb-1">YOUR RENTAL CODE:</div>
                <div className="flex items-center gap-2">
                  <code className="mc-text-green font-mono text-sm font-bold flex-1 break-all">
                    {sessionKey}
                  </code>
                  <button onClick={copyKey} className="xp-button p-1">
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="font-pixel text-[6px] mc-text-red mt-2">
                  ⚠ SAVE THIS CODE — NOT SHOWN AGAIN
                </p>
              </div>

              {/* Access options */}
              <div className="space-y-2">
                <div className="font-pixel text-[6px] text-[#000] mb-1">HOW TO ACCESS YOUR AGENT:</div>
                <div className="xp-sunken bg-black p-2 font-mono text-[11px]">
                  <div className="text-[#aaa] mb-0.5"># REST API</div>
                  <div className="text-[#55ff55] break-all">
                    curl -H &quot;X-API-Key: {sessionKey}&quot; \{"\n"}
                    {"     "}-d &apos;&#123;&quot;message&quot;:&quot;Hello!&quot;&#125;&apos; \{"\n"}
                    {"     "}{typeof window !== "undefined" ? window.location.origin : ""}/api/v1/chat
                  </div>
                </div>
                <div className="xp-sunken bg-black p-2 font-mono text-[11px]">
                  <div className="text-[#aaa] mb-0.5"># Telegram</div>
                  <div className="text-[#55ff55]">@rentalobster_bot → /start {sessionKey}</div>
                </div>
              </div>

              <a
                href={`/chat?session=${sessionKey}`}
                className="xp-button xp-button-primary w-full flex items-center justify-center gap-2 py-3 text-[8px] no-underline"
              >
                <Zap className="w-4 h-4" />
                OPEN WEB CHAT
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href="/dashboard"
                className="xp-button w-full flex items-center justify-center text-[7px] py-2 no-underline"
              >
                View in Dashboard →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
