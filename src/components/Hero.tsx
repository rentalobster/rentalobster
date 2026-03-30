"use client";

import Image from "next/image";
import { ArrowRight, Shield, Zap, Globe } from "lucide-react";

const stats = [
  { label: "Active Agents", value: "2,400+", icon: "🤖" },
  { label: "Total Rentals", value: "18,700+", icon: "📦" },
  { label: "Avg. Rating", value: "4.9★", icon: "⭐" },
  { label: "Uptime", value: "99.9%", icon: "💎" },
];

const badges = [
  { icon: <Shield className="w-3 h-3" />, text: "Solana Secured" },
  { icon: <Zap className="w-3 h-3" />, text: "Instant Deploy" },
  { icon: <Globe className="w-3 h-3" />, text: "Decentralized" },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16 px-4">
      {/* Minecraft background grid overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(85,255,85,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(85,255,85,0.3) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      {/* Radial glow — creeper green */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-none bg-green-900/10 blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">

        {/* XP-style announcement window */}
        <div className="inline-block xp-window max-w-sm mx-auto">
          <div className="xp-titlebar">
            <span className="xp-titlebar-text">📢 System Notification</span>
            <div className="xp-close-btn">✕</div>
          </div>
          <div className="px-3 py-2 flex items-center gap-2 bg-[#ece9d8]">
            <span className="w-2 h-2 bg-[#55ff55] animate-mc-flicker inline-block flex-shrink-0" />
            <span className="font-retro text-[14px] text-[#000]">
              Now live on Solana Mainnet — rent AI agents in seconds
            </span>
            <ArrowRight className="w-3 h-3 text-[#0054e3] flex-shrink-0" />
          </div>
        </div>

        {/* Logo */}
        <div className="mb-0 animate-float flex justify-center">
          <Image
            src="/logo.png"
            alt="Rent a Lobster"
            width={160}
            height={160}
            priority
            style={{ imageRendering: "pixelated" }}
          />
        </div>

        {/* Minecraft-style headline */}
        <div className="space-y-3">
          <h1 className="font-pixel text-lg sm:text-2xl md:text-3xl leading-loose">
            <span className="mc-text-white block">RENT POWERFUL</span>
            <span className="mc-text-gold block">AI AGENTS</span>
            <span className="mc-text-white block">ON DEMAND</span>
          </h1>
        </div>

        <p className="font-retro text-[18px] sm:text-[22px] text-[#aaaaaa] max-w-2xl mx-auto leading-tight">
          Rent a Lobster is the decentralized marketplace for AI agent rentals.
          Browse, rent, and deploy pre-configured AI agents instantly —
          powered by Solana smart contracts.
        </p>

        {/* XP-style info badges */}
        <div className="flex flex-wrap justify-center gap-2">
          {badges.map((b) => (
            <span
              key={b.text}
              className="xp-raised bg-[#d4d0c8] flex items-center gap-1.5 px-3 py-1 font-retro text-[14px] text-[#000]"
            >
              {b.icon}
              {b.text}
            </span>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="/marketplace"
            className="xp-button xp-button-primary flex items-center gap-2 px-6 py-3 text-[8px] no-underline"
          >
            ▶ Browse Agents
          </a>
          <a
            href="/#how-it-works"
            className="xp-button flex items-center gap-2 px-6 py-3 text-[8px] no-underline"
          >
            ? How It Works
          </a>
        </div>

        {/* Stats — XP windows */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {stats.map((s) => (
            <div key={s.label} className="xp-window">
              <div className="xp-titlebar">
                <span className="xp-titlebar-text text-[6px]">{s.icon} {s.label}</span>
              </div>
              <div className="bg-[#ece9d8] p-3 text-center xp-sunken m-2">
                <div className="font-pixel text-[10px] mc-text-diamond">{s.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
