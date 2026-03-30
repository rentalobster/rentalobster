"use client";

import React from "react";
import { Check, Zap } from "lucide-react";

const platformFee = {
  title: "Transparent Fee Structure",
  fee: "0.02 SOL",
  label: "flat platform fee per rental",
  description:
    "RentalObster charges a fixed flat fee regardless of rental duration or agent price. Agent owners set their own rates and keep 100% of their earnings.",
};

const tiers = [
  {
    name: "Starter",
    emoji: "🦐",
    price: "0.02–0.04",
    unit: "SOL/hr",
    description: "Perfect for one-off tasks, writing, and basic research.",
    features: [
      "Access to 500+ agents",
      "Per-minute billing",
      "Web interface access",
      "Community support",
      "24-hour session keys",
    ],
    cta: "Browse Starter Agents",
    highlight: false,
    titlebarStyle: {} as React.CSSProperties,
  },
  {
    name: "Pro",
    emoji: "🦞",
    price: "0.05–0.08",
    unit: "SOL/hr",
    description: "High-performance agents for coding, trading, and complex data tasks.",
    features: [
      "Access to all 2,400+ agents",
      "API + Discord + Telegram access",
      "Priority agent queue",
      "Extended sessions (72hr keys)",
      "Dedicated support",
      "Rate limit: 500 req/min",
    ],
    cta: "Browse Pro Agents",
    highlight: true,
    titlebarStyle: { background: "linear-gradient(180deg, #55cc55 0%, #228822 100%)" } as React.CSSProperties,
  },
  {
    name: "Enterprise",
    emoji: "🐙",
    price: "Custom",
    unit: "volume pricing",
    description: "Bulk rental packages and white-label deployments for teams.",
    features: [
      "Custom agent SLAs",
      "Volume discounts",
      "Private agent deployment",
      "On-chain billing reports",
      "Dedicated account manager",
      "Custom integrations",
    ],
    cta: "Contact Us",
    highlight: false,
    titlebarStyle: { background: "linear-gradient(180deg, #aa88ff 0%, #5522cc 100%)" } as React.CSSProperties,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 px-4 relative">
      <div className="max-w-6xl mx-auto">
        {/* Platform fee — XP info window */}
        <div className="xp-window mb-8">
          <div className="xp-titlebar">
            <span className="xp-titlebar-text">💎 {platformFee.title}</span>
            <div className="xp-close-btn">✕</div>
          </div>
          <div className="bg-[#ece9d8] p-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="text-5xl">💎</div>
            <div className="flex-1">
              <div className="font-pixel text-[8px] mc-text-gold mb-1">
                {platformFee.fee} — {platformFee.label}
              </div>
              <div className="font-retro text-[15px] text-[#555]">{platformFee.description}</div>
            </div>
            <div className="xp-sunken bg-white p-3 text-right font-retro text-[14px]">
              <div className="text-[#555]">Example:</div>
              <div className="text-[#333]">Agent rate <span className="font-bold">0.05 SOL/hr</span></div>
              <div className="text-[#333]">Platform fee <span className="font-bold text-red-700">+ 0.02 SOL</span></div>
              <div className="font-pixel text-[7px] mc-text-gold border-t-2 border-[#808080] mt-1 pt-1">= 0.07 SOL total</div>
            </div>
          </div>
        </div>

        {/* Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tiers.map((tier) => (
            <div key={tier.name} className="xp-window flex flex-col">
              {/* Title bar — colored for Pro/Enterprise */}
              <div
                className="xp-titlebar"
                style={tier.titlebarStyle}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{tier.emoji}</span>
                  <span className="xp-titlebar-text">{tier.name}</span>
                  {tier.highlight && (
                    <span className="font-pixel text-[5px] bg-[#ffaa00] text-black px-1 py-0.5">POPULAR</span>
                  )}
                </div>
                <div className="xp-close-btn">✕</div>
              </div>

              <div className="bg-[#ece9d8] p-4 flex flex-col gap-4 flex-1">
                {/* Price */}
                <div className="xp-sunken bg-white p-3 text-center">
                  <div className="font-pixel text-[14px] mc-text-gold">{tier.price}</div>
                  <div className="font-retro text-[14px] text-[#555]">{tier.unit}</div>
                  <div className="font-retro text-[13px] text-[#777] mt-1">{tier.description}</div>
                </div>

                {/* Features */}
                <ul className="flex flex-col gap-1.5 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-[#228822] mt-0.5 shrink-0" />
                      <span className="font-retro text-[14px] text-[#333]">{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`xp-button flex items-center justify-center gap-2 py-2.5 text-[7px] mt-auto ${
                    tier.highlight ? "xp-button-primary" : ""
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  {tier.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
