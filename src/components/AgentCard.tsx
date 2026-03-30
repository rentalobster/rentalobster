"use client";

import { useState, useEffect } from "react";
import { Star, Zap, Clock, TrendingUp, TrendingDown } from "lucide-react";
import RentModal from "./RentModal";
import type { Agent } from "@/lib/supabase";

interface TokenPrice {
  priceUsd: string;
  change24h: number;
  volume24h: number;
}

type Props = {
  agent: Agent;
};

export default function AgentCard({ agent }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [tokenPrice, setTokenPrice] = useState<TokenPrice | null>(null);

  useEffect(() => {
    if (!agent.token_mint || agent.token_status !== "active") return;
    fetch(`https://api.dexscreener.com/latest/dex/tokens/${agent.token_mint}`)
      .then((r) => r.json())
      .then((data) => {
        const solanaPairs = (data.pairs ?? []).filter(
          (p: { chainId: string }) => p.chainId === "solana"
        );
        if (!solanaPairs.length) return;
        // Pick pair with highest liquidity
        const best = solanaPairs.sort(
          (a: { liquidity?: { usd: number } }, b: { liquidity?: { usd: number } }) =>
            (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0)
        )[0];
        setTokenPrice({
          priceUsd: best.priceUsd ?? "0",
          change24h: best.priceChange?.h24 ?? 0,
          volume24h: best.volume?.h24 ?? 0,
        });
      })
      .catch(() => {});
  }, [agent.token_mint, agent.token_status]);

  const rating =
    agent.rating_count > 0
      ? (agent.rating_sum / agent.rating_count).toFixed(1)
      : "—";

  return (
    <>
      <div className="xp-window card-glow flex flex-col">
        {/* XP Title Bar */}
        <div className="xp-titlebar gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base leading-none flex-shrink-0">{agent.emoji}</span>
            <span className="xp-titlebar-text truncate">{agent.name}</span>
          </div>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {/* XP window chrome buttons */}
            <div className="w-4 h-3.5 bg-[#d4d0c8] border border-[#404040] flex items-center justify-center text-[8px] cursor-pointer"
                 style={{ boxShadow: "inset -1px -1px #808080, inset 1px 1px #fff" }}>
              _
            </div>
            <div className="w-4 h-3.5 bg-[#d4d0c8] border border-[#404040] flex items-center justify-center text-[8px] cursor-pointer"
                 style={{ boxShadow: "inset -1px -1px #808080, inset 1px 1px #fff" }}>
              □
            </div>
            <div className="xp-close-btn">✕</div>
          </div>
        </div>

        {/* Window body */}
        <div className="p-3 flex flex-col gap-3 flex-1 bg-[#ece9d8]">
          {/* Category + status */}
          <div className="flex items-center justify-between">
            <span className="font-pixel text-[6px] text-[#404040]">{agent.category}</span>
            <span className={agent.is_available ? "mc-badge-available" : "mc-badge-busy"}>
              {agent.is_available ? "● ONLINE" : "● BUSY"}
            </span>
          </div>

          {/* Description — use VT323 retro font for body text */}
          <p className="font-retro text-[14px] text-[#333333] leading-tight line-clamp-3 xp-sunken bg-white p-2">
            {agent.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {(agent.tags ?? []).map((t) => (
              <span key={t} className="mc-tag">{t}</span>
            ))}
          </div>

          {/* Bags.fm token badge */}
          {agent.token_mint && agent.token_symbol && (
            <div className="mc-block mc-block-green px-2 py-1 flex items-center justify-between gap-1.5 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="font-pixel text-[6px] mc-text-white">BAGS.FM</span>
                <span className="font-pixel text-[7px] mc-text-gold">${agent.token_symbol}</span>
                {agent.token_status === "active" && (
                  <span className="font-pixel text-[6px] mc-text-diamond">● LIVE</span>
                )}
                {agent.token_status === "pre_launch" && (
                  <span className="font-pixel text-[6px] text-[#aaa]">PRE-LAUNCH</span>
                )}
              </div>
              {tokenPrice && (
                <div className="flex items-center gap-1">
                  <span className="font-retro text-[11px] text-[#ccffcc]">
                    ${parseFloat(tokenPrice.priceUsd) < 0.001
                      ? parseFloat(tokenPrice.priceUsd).toExponential(2)
                      : parseFloat(tokenPrice.priceUsd).toFixed(6)}
                  </span>
                  <span className={`flex items-center font-retro text-[10px] ${tokenPrice.change24h >= 0 ? "text-[#55ff55]" : "text-red-400"}`}>
                    {tokenPrice.change24h >= 0
                      ? <TrendingUp className="w-2.5 h-2.5" />
                      : <TrendingDown className="w-2.5 h-2.5" />}
                    {Math.abs(tokenPrice.change24h).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Meta — rating + speed */}
          <div className="flex items-center justify-between text-[#333] border-t-2 border-[#808080] pt-2 mt-auto"
               style={{ borderBottom: "2px solid #fff" }}>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <span className="font-pixel text-[6px] text-[#222]">{rating}</span>
              <span className="font-retro text-[12px] text-[#666]">({agent.rating_count})</span>
            </div>
            <div className="flex items-center gap-1 text-[#666]">
              <Clock className="w-3 h-3" />
              <span className="font-retro text-[12px]">{agent.response_speed}</span>
            </div>
          </div>

          {/* Price + CTA */}
          <div className="flex items-center justify-between">
            <div className="mc-panel px-2 py-1 mc-block-gold">
              <span className="font-pixel text-[8px] mc-text-gold">{agent.price_per_hour}</span>
              <span className="font-retro text-[12px] text-[#886600] ml-1">SOL/hr</span>
            </div>
            <button
              onClick={() => setShowModal(true)}
              disabled={!agent.is_available}
              className={
                agent.is_available
                  ? "xp-button xp-button-primary flex items-center gap-1.5"
                  : "xp-button flex items-center gap-1.5 opacity-50 cursor-not-allowed"
              }
            >
              <Zap className="w-3 h-3" />
              {agent.is_available ? "RENT NOW" : "BUSY"}
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <RentModal agent={agent} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
