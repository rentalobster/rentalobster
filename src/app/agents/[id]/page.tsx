"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { Star, Zap, Clock, ArrowLeft, Shield } from "lucide-react";
import RentModal from "@/components/RentModal";
import { cn } from "@/lib/utils";
import type { Agent, Review } from "@/lib/supabase";

export default function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/agents/${id}`);
      if (res.ok) {
        const data = await res.json();
        setAgent(data.agent);
        setReviews(data.reviews ?? []);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen  pt-24 flex items-center justify-center">
        <div className="text-gray-400 animate-pulse">Loading agent...</div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen  pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🦞</div>
          <div className="text-white font-semibold">Agent not found</div>
          <a href="/marketplace" className="text-red-400 text-sm mt-2 block hover:text-red-300">
            ← Back to Marketplace
          </a>
        </div>
      </div>
    );
  }

  const rating = agent.rating_count > 0
    ? (agent.rating_sum / agent.rating_count).toFixed(1)
    : "New";

  return (
    <div className="min-h-screen  pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <a
          href="/marketplace"
          className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-6 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </a>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left — agent info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header card */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
              <div className="flex items-start gap-4 mb-4">
                <span className="text-5xl">{agent.emoji}</span>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-white">{agent.name}</h1>
                  <div className="flex items-center flex-wrap gap-3 mt-1">
                    <span className="text-gray-400 text-sm">{agent.category}</span>
                    <span className="flex items-center gap-1 text-sm">
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      <span className="text-white">{rating}</span>
                      <span className="text-gray-500">({agent.rating_count} reviews)</span>
                    </span>
                    <span className="flex items-center gap-1 text-sm text-gray-400">
                      <Zap className="w-3.5 h-3.5" />
                      {agent.total_rentals} rentals
                    </span>
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        agent.is_available
                          ? "bg-green-900/40 text-green-400 border border-green-700/30"
                          : "bg-yellow-900/40 text-yellow-400 border border-yellow-700/30"
                      )}
                    >
                      {agent.is_available ? "Available Now" : "Busy"}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                {agent.long_desc ?? agent.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {(agent.tags ?? []).map((t) => (
                  <span
                    key={t}
                    className="bg-red-950/40 border border-red-900/30 text-red-300 text-xs px-3 py-1 rounded-full"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Response", value: agent.response_speed, icon: <Clock className="w-4 h-4" /> },
                { label: "Rating", value: rating + "★", icon: <Star className="w-4 h-4" /> },
                { label: "Rentals", value: agent.total_rentals.toString(), icon: <Zap className="w-4 h-4" /> },
              ].map((s) => (
                <div key={s.label} className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-gray-400 flex justify-center mb-1">{s.icon}</div>
                  <div className="text-white font-bold">{s.value}</div>
                  <div className="text-gray-500 text-xs">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Reviews */}
            <div>
              <h2 className="text-white font-semibold text-lg mb-4">
                Reviews ({reviews.length})
              </h2>
              {reviews.length === 0 ? (
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 text-center text-gray-500 text-sm">
                  No reviews yet — be the first to rent and review!
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div
                      key={r.id}
                      className="bg-white/[0.03] border border-white/10 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{r.renter?.avatar_emoji ?? "👤"}</span>
                          <span className="text-sm text-gray-300">
                            {r.renter?.username ?? `${r.renter?.wallet?.slice(0, 6)}...`}
                          </span>
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "w-3.5 h-3.5",
                                i < r.rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-600"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                      {r.comment && (
                        <p className="text-gray-400 text-sm">{r.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right — rent card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
              <div>
                <div className="text-3xl font-extrabold text-white">
                  {agent.price_per_hour} SOL
                </div>
                <div className="text-gray-500 text-sm">per hour</div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Platform fee</span>
                  <span>0.02 SOL</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Payment</span>
                  <span>SOL (Solana)</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Settlement</span>
                  <span>Smart Contract</span>
                </div>
              </div>

              <button
                onClick={() => setShowModal(true)}
                disabled={!agent.is_available}
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all",
                  agent.is_available
                    ? "bg-red-600 hover:bg-red-500 text-white"
                    : "bg-white/5 text-gray-500 cursor-not-allowed"
                )}
              >
                <Zap className="w-4 h-4" />
                {agent.is_available ? "Rent This Agent" : "Currently Unavailable"}
              </button>

              <div className="flex items-start gap-2 bg-green-900/20 border border-green-800/30 rounded-lg p-3">
                <Shield className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                <div className="text-xs text-green-300 leading-relaxed">
                  Funds held in Solana escrow. Auto-released on completion. 24h dispute window.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <RentModal agent={agent} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
