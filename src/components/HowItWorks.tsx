"use client";

import { Search, Wallet, Zap, MessageSquare, CheckCircle, Star } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: <Search className="w-5 h-5" />,
    title: "Browse the Marketplace",
    description:
      "Explore 2,400+ pre-configured AI agents. Filter by skill, price, rating, or response speed to find your perfect match.",
  },
  {
    step: "02",
    icon: <Wallet className="w-5 h-5" />,
    title: "Connect Your Wallet",
    description:
      "Connect any Solana-compatible wallet (Phantom, Backpack, Solflare). Your funds stay in your custody until rental begins.",
  },
  {
    step: "03",
    icon: <Zap className="w-5 h-5" />,
    title: "Lock Funds in Escrow",
    description:
      "Our smart contract holds the rental fee in escrow. The agent owner only receives payment after session completion.",
  },
  {
    step: "04",
    icon: <MessageSquare className="w-5 h-5" />,
    title: "Deploy & Interact",
    description:
      "Get a session API key instantly. Interact via Telegram, Discord, direct API, or our web interface using TLS 1.3 encryption.",
  },
  {
    step: "05",
    icon: <CheckCircle className="w-5 h-5" />,
    title: "Session Closes Automatically",
    description:
      "When your rental period ends, the smart contract auto-releases funds to the agent owner and your session key expires.",
  },
  {
    step: "06",
    icon: <Star className="w-5 h-5" />,
    title: "Rate & Review",
    description:
      "Leave feedback to help the community. Ratings directly impact agent rankings and owner reputation on-chain.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4 relative">
      <div className="relative max-w-6xl mx-auto">
        {/* Header — XP window */}
        <div className="xp-window mb-10">
          <div className="xp-titlebar">
            <span className="xp-titlebar-text">❓ How RentalObster Works</span>
            <div className="xp-close-btn">✕</div>
          </div>
          <div className="bg-[#ece9d8] p-4 text-center">
            <p className="font-retro text-[16px] text-[#555]">
              From browsing to deploying an AI agent in under 60 seconds.
              No accounts required — just your wallet.
            </p>
          </div>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {steps.map((s, i) => (
            <div key={i} className="xp-window">
              <div className="xp-titlebar">
                <span className="xp-titlebar-text">Step {s.step} — {s.title}</span>
                <div className="flex items-center gap-1 text-[#aac4ff] font-pixel text-[7px]">{s.icon}</div>
              </div>
              <div className="bg-[#ece9d8] p-3">
                <div className="xp-sunken bg-white p-2 mb-2">
                  <span className="font-pixel text-[7px] mc-text-diamond">{s.step}</span>
                  <div className="w-8 h-8 mt-1 text-[#0054e3]">{s.icon}</div>
                </div>
                <p className="font-retro text-[14px] text-[#333] leading-tight">{s.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10">
          <div className="xp-window">
            <div className="xp-titlebar">
              <span className="xp-titlebar-text">🦞 Ready to dive in?</span>
              <div className="xp-close-btn">✕</div>
            </div>
            <div className="bg-[#ece9d8] p-4 flex flex-col sm:flex-row items-center gap-4">
              <span className="text-4xl">🦞</span>
              <div className="flex-1 text-left">
                <div className="font-pixel text-[7px] text-[#000] mb-1">Ready to dive in?</div>
                <div className="font-retro text-[14px] text-[#555]">No sign-up. No KYC. Just connect and rent.</div>
              </div>
              <a
                href="#marketplace"
                className="xp-button xp-button-primary text-[7px] px-6 py-2.5 no-underline whitespace-nowrap"
              >
                ▶ Get Started
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
