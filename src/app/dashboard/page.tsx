"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Transaction } from "@solana/web3.js";
import bs58 from "bs58";
import {
  Clock, Star, MessageSquare, Copy, Check, Loader2, Coins
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Rental } from "@/lib/supabase";

function shortWallet(w: string) {
  return `${w.slice(0, 6)}...${w.slice(-4)}`;
}

type TabId = "active" | "history" | "tokens";

interface AgentFee {
  id: string;
  name: string;
  emoji: string;
  token_mint: string;
  token_symbol: string;
  token_status: string;
  claimable_sol: string;
  lifetime_sol: string;
}

export default function DashboardPage() {
  const { user, signIn, loading: authLoading } = useAuth();
  const { connected, publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const { setVisible } = useWalletModal();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<TabId>("active");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [reviewModal, setReviewModal] = useState<{ rentalId: string; agentName: string } | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Token fees state
  const [agentFees, setAgentFees] = useState<AgentFee[]>([]);
  const [feesLoading, setFeesLoading] = useState(false);
  const [claiming, setClaiming] = useState<string | null>(null); // agentId being claimed
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    async function load() {
      setLoading(true);
      const res = await fetch("/api/rentals", { credentials: "include" });
      if (res.status === 401) { setLoading(false); return; }
      const data = await res.json();
      setRentals(data.rentals ?? []);
      setLoading(false);
    }
    load();
  }, [user]);

  useEffect(() => {
    if (!user || tab !== "tokens") return;
    async function loadFees() {
      setFeesLoading(true);
      const res = await fetch("/api/user/claimable-fees", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setAgentFees(data.agents ?? []);
      }
      setFeesLoading(false);
    }
    loadFees();
  }, [user, tab]);

  async function handleClaimFees(agentId: string) {
    if (!publicKey || !signTransaction) return;
    setClaiming(agentId);
    setClaimError(null);
    setClaimSuccess(null);

    try {
      const res = await fetch(`/api/agents/${agentId}/claim-fees`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to get claim transactions");

      const { blockhash } = await connection.getLatestBlockhash();
      for (const txBase58 of data.transactions) {
        const txBytes = bs58.decode(txBase58);
        const tx = Transaction.from(txBytes);
        tx.recentBlockhash = blockhash;
        tx.feePayer = publicKey;
        const signed = await signTransaction(tx);
        await connection.sendRawTransaction(signed.serialize(), { skipPreflight: false });
      }
      setClaimSuccess(agentId);
      // Refresh fees
      const updated = await fetch("/api/user/claimable-fees", { credentials: "include" });
      if (updated.ok) setAgentFees((await updated.json()).agents ?? []);
    } catch (e) {
      setClaimError(e instanceof Error ? e.message : "Claim failed");
    } finally {
      setClaiming(null);
    }
  }

  async function endRental(rentalId: string) {
    const res = await fetch(`/api/rentals/${rentalId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status: "completed" }),
    });
    if (res.ok) {
      setRentals((prev) =>
        prev.map((r) => (r.id === rentalId ? { ...r, status: "completed" } : r))
      );
    }
  }

  async function submitReview() {
    if (!reviewModal) return;
    setSubmittingReview(true);
    await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        rental_id: reviewModal.rentalId,
        rating: reviewRating,
        comment: reviewComment,
      }),
    });
    setSubmittingReview(false);
    setReviewModal(null);
    setReviewComment("");
  }

  function copyKey(key: string) {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  const activeRentals = rentals.filter((r) => r.status === "active");
  const pastRentals = rentals.filter((r) => r.status !== "active");

  // Not connected
  if (!connected) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center px-4">
        <div className="xp-window w-full max-w-sm">
          <div className="xp-titlebar"><span className="xp-titlebar-text">🦞 Dashboard — Connect Wallet</span><div className="xp-close-btn">✕</div></div>
          <div className="bg-[#ece9d8] p-6 text-center space-y-4">
            <div className="text-5xl">🦞</div>
            <div className="font-pixel text-[7px] text-[#000]">Connect Your Wallet</div>
            <p className="font-retro text-[14px] text-[#555]">Connect your Solana wallet to access your dashboard and manage rentals.</p>
            <button onClick={() => setVisible(true)} className="xp-button xp-button-primary text-[7px] px-8 py-3">Connect Wallet</button>
          </div>
        </div>
      </div>
    );
  }

  // Connected but not signed in
  if (!user) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center px-4">
        <div className="xp-window w-full max-w-sm">
          <div className="xp-titlebar"><span className="xp-titlebar-text">🔐 Sign In Required</span><div className="xp-close-btn">✕</div></div>
          <div className="bg-[#ece9d8] p-6 text-center space-y-4">
            <div className="text-5xl">🔐</div>
            <div className="font-pixel text-[7px] text-[#000]">Sign In Required</div>
            <p className="font-retro text-[14px] text-[#555]">Sign a message with your wallet to authenticate and access your dashboard.</p>
            <button onClick={signIn} disabled={authLoading} className="xp-button xp-button-primary text-[7px] px-8 py-3 disabled:opacity-60">
              {authLoading ? "Signing..." : "Sign In with Wallet"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-14 pb-16 px-4">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Header — XP window */}
        <div className="xp-window">
          <div className="xp-titlebar">
            <div className="flex items-center gap-2">
              <span className="text-xl">{user?.avatar_emoji ?? "🦞"}</span>
              <span className="xp-titlebar-text">{user?.username ?? shortWallet(user?.wallet ?? "")} — Dashboard</span>
            </div>
            <div className="xp-close-btn">✕</div>
          </div>
          <div className="bg-[#ece9d8] px-4 py-2">
            <span className="font-retro text-[13px] text-[#555]">{user?.wallet}</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Active Rentals", value: activeRentals.length, icon: "⚡" },
            { label: "Total Rentals", value: rentals.length, icon: "📦" },
            { label: "SOL Spent", value: rentals.reduce((s, r) => s + Number(r.total_cost), 0).toFixed(3), icon: "💎" },
            { label: "Agents Rented", value: new Set(rentals.map((r) => r.agent_id)).size, icon: "🤖" },
          ].map((s) => (
            <div key={s.label} className="xp-window">
              <div className="xp-titlebar"><span className="xp-titlebar-text text-[5px]">{s.icon} {s.label}</span></div>
              <div className="bg-[#ece9d8] p-3 xp-sunken m-2 text-center">
                <div className="font-pixel text-[12px] mc-text-diamond">{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap">
          {([
            { id: "active", label: `Active (${activeRentals.length})` },
            { id: "history", label: `History (${pastRentals.length})` },
            { id: "tokens", label: "💰 My Tokens" },
          ] as { id: TabId; label: string }[]).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn("xp-button text-[7px]", tab === t.id ? "xp-button-primary" : "")}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* My Tokens tab */}
        {tab === "tokens" && (
          <div className="space-y-3">
            {feesLoading ? (
              <div className="xp-window h-24 animate-pulse" />
            ) : agentFees.length === 0 ? (
              <div className="xp-window">
                <div className="xp-titlebar"><span className="xp-titlebar-text">💰 No Agent Tokens</span></div>
                <div className="bg-[#ece9d8] p-6 text-center space-y-2">
                  <div className="text-4xl">🪙</div>
                  <p className="font-retro text-[14px] text-[#555]">
                    List an agent and launch its token on bags.fm to see fees here.
                  </p>
                  <a href="/list-agent" className="xp-button xp-button-primary inline-block text-[7px] px-6 py-2 no-underline">
                    ▶ List Agent
                  </a>
                </div>
              </div>
            ) : (
              <>
                {claimError && (
                  <div className="xp-window">
                    <div className="xp-titlebar" style={{ background: "#c0392b" }}>
                      <span className="xp-titlebar-text">⚠ Claim Error</span>
                    </div>
                    <div className="bg-[#ece9d8] p-3">
                      <span className="font-retro text-[13px] text-red-700">{claimError}</span>
                    </div>
                  </div>
                )}
                {agentFees.map((agent) => (
                  <div key={agent.id} className="xp-window">
                    <div className="xp-titlebar gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{agent.emoji}</span>
                        <span className="xp-titlebar-text">{agent.name}</span>
                        <span className="font-pixel text-[6px] mc-text-gold">${agent.token_symbol}</span>
                      </div>
                      <span className={agent.token_status === "active" ? "mc-badge-available" : "mc-badge-busy"}>
                        {agent.token_status === "active" ? "● LIVE" : "PRE-LAUNCH"}
                      </span>
                    </div>
                    <div className="bg-[#ece9d8] p-3 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="xp-sunken bg-white p-3 text-center">
                          <div className="font-pixel text-[6px] text-[#555] mb-1">CLAIMABLE NOW</div>
                          <div className="font-pixel text-[10px] mc-text-green">{agent.claimable_sol} SOL</div>
                        </div>
                        <div className="xp-sunken bg-white p-3 text-center">
                          <div className="font-pixel text-[6px] text-[#555] mb-1">LIFETIME EARNED</div>
                          <div className="font-pixel text-[10px] mc-text-gold">{agent.lifetime_sol} SOL</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {claimSuccess === agent.id ? (
                          <div className="xp-button flex items-center gap-1.5 text-[7px] text-green-700">
                            <Check className="w-3 h-3" /> Claimed!
                          </div>
                        ) : (
                          <button
                            onClick={() => handleClaimFees(agent.id)}
                            disabled={claiming === agent.id || parseFloat(agent.claimable_sol) === 0}
                            className="xp-button xp-button-primary flex items-center gap-1.5 text-[7px] disabled:opacity-50"
                          >
                            {claiming === agent.id ? (
                              <><Loader2 className="w-3 h-3 animate-spin" /> Claiming...</>
                            ) : (
                              <><Coins className="w-3 h-3" /> Claim {agent.claimable_sol} SOL</>
                            )}
                          </button>
                        )}
                        <span className="font-retro text-[11px] text-[#666]">
                          Mint: {agent.token_mint.slice(0, 8)}...{agent.token_mint.slice(-4)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* Rental list — only for active/history tabs */}
        {tab !== "tokens" && loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="xp-window h-24 animate-pulse" />
            ))}
          </div>
        ) : tab !== "tokens" ? (
          <div className="space-y-3">
            {(tab === "active" ? activeRentals : pastRentals).map((rental) => {
              const agent = rental.agent as { name: string; emoji: string; category: string };
              const endsAt = rental.ends_at ? new Date(rental.ends_at) : null;
              const isExpired = endsAt ? endsAt < new Date() : false;

              return (
                <div key={rental.id} className="xp-window">
                  <div className="xp-titlebar gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{agent?.emoji}</span>
                      <span className="xp-titlebar-text">{agent?.name} — {agent?.category}</span>
                    </div>
                    <span className={rental.status === "active" ? "mc-badge-available" : "mc-badge-busy"}>
                      {rental.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="bg-[#ece9d8] p-3 space-y-3">
                    <div className="flex items-center gap-4 flex-wrap font-retro text-[13px] text-[#555]">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{rental.duration_hrs}h rental</span>
                      <span className="mc-text-gold font-pixel text-[7px]">{rental.total_cost} SOL</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {rental.status === "active" && rental.session_key && (
                        <>
                          <a
                            href={`/chat?session=${rental.session_key}`}
                            className="xp-button xp-button-primary flex items-center gap-1.5 text-[7px] no-underline"
                          >
                            <MessageSquare className="w-3 h-3" />Open Chat
                          </a>
                          <button onClick={() => endRental(rental.id)} className="xp-button text-[7px]">
                            End Rental
                          </button>
                        </>
                      )}
                      {rental.status === "completed" && (
                        <button
                          onClick={() => setReviewModal({ rentalId: rental.id, agentName: agent?.name ?? "" })}
                          className="xp-button flex items-center gap-1.5 text-[7px]"
                        >
                          <Star className="w-3 h-3" />Leave Review
                        </button>
                      )}
                    </div>

                    {rental.status === "active" && rental.session_key && (
                      <div className="space-y-2">
                        <div className="xp-sunken bg-black p-2 flex items-center justify-between gap-2">
                          <code className="mc-text-green font-mono text-xs">{rental.session_key}</code>
                          <button onClick={() => copyKey(rental.session_key!)} className="xp-button p-0.5">
                            {copiedKey === rental.session_key ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { icon: "💬", label: "Telegram", code: `/start ${rental.session_key}` },
                            { icon: "🎮", label: "Discord", code: `/activate code:${rental.session_key}` },
                            { icon: "⚡", label: "REST API", code: `X-API-Key: ${rental.session_key.slice(0,10)}...` },
                          ].map((acc) => (
                            <div key={acc.label} className="xp-sunken bg-white p-2 text-center">
                              <div className="text-lg mb-0.5">{acc.icon}</div>
                              <div className="font-pixel text-[5px] text-[#000]">{acc.label}</div>
                              <div className="font-mono text-[9px] text-[#555] mt-0.5 break-all">{acc.code}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {rental.status === "active" && endsAt && (
                      <div className={`font-retro text-[13px] ${isExpired ? "mc-text-gold" : "text-[#555]"}`}>
                        {isExpired ? "⚠ Session expired — please end rental" : `Expires: ${endsAt.toLocaleString()}`}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {(tab === "active" ? activeRentals : pastRentals).length === 0 && (
              <div className="xp-window">
                <div className="xp-titlebar"><span className="xp-titlebar-text">🦞 No Rentals</span></div>
                <div className="bg-[#ece9d8] p-8 text-center space-y-3">
                  <div className="text-4xl">🦞</div>
                  <div className="font-retro text-[15px] text-[#555]">
                    {tab === "active" ? "No active rentals. Browse the marketplace to get started!" : "No past rentals yet."}
                  </div>
                  {tab === "active" && (
                    <a href="/marketplace" className="xp-button xp-button-primary inline-block text-[7px] px-6 py-2 no-underline">
                      ▶ Browse Agents
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Review modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.75)" }}>
          <div className="xp-window w-full max-w-sm">
            <div className="xp-titlebar">
              <span className="xp-titlebar-text">⭐ Rate {reviewModal.agentName}</span>
              <button className="xp-close-btn" onClick={() => setReviewModal(null)}>✕</button>
            </div>
            <div className="bg-[#ece9d8] p-4 space-y-4">
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} onClick={() => setReviewRating(s)}>
                    <Star className={cn("w-7 h-7", s <= reviewRating ? "text-yellow-500 fill-yellow-500" : "text-[#888]")} />
                  </button>
                ))}
              </div>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience (optional)..."
                rows={3}
                className="w-full xp-sunken bg-white p-2 font-retro text-[14px] text-[#000] placeholder-[#888] focus:outline-none resize-none"
              />
              <div className="flex gap-2">
                <button onClick={() => setReviewModal(null)} className="xp-button flex-1 text-[7px] py-2">Cancel</button>
                <button onClick={submitReview} disabled={submittingReview} className="xp-button xp-button-primary flex-1 text-[7px] py-2 disabled:opacity-60">
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
