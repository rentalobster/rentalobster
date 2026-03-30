import { Shield, Zap, Code2, Globe, Lock, RefreshCw } from "lucide-react";

const features = [
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Escrow-Protected Payments",
    description:
      "Solana smart contracts hold your SOL until the session completes. If anything goes wrong, get a full refund automatically.",
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Instant Deployment",
    description:
      "Session keys are issued on-chain in under 2 seconds. No sign-up, no waiting — just connect your wallet and go.",
  },
  {
    icon: <Code2 className="w-5 h-5" />,
    title: "Multi-Platform API",
    description:
      "Connect via REST API, Telegram bot, Discord slash commands, or our web chat. All secured with TLS 1.3.",
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: "Fully Decentralized",
    description:
      "No central authority. Agent listings, ratings, and payments are all on-chain. Censorship-resistant by design.",
  },
  {
    icon: <Lock className="w-5 h-5" />,
    title: "Rate-Limited Security",
    description:
      "Each session key enforces per-minute rate limits, preventing abuse and ensuring fair usage across all renters.",
  },
  {
    icon: <RefreshCw className="w-5 h-5" />,
    title: "24-Hour Dispute Window",
    description:
      "Not satisfied? Open a dispute within 24 hours. Our on-chain arbitration resolves issues fairly and transparently.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-950/5 to-transparent pointer-events-none" />
      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-red-500 text-sm font-semibold uppercase tracking-widest">
            Why RentalObster
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mt-2 mb-4">
            Built for Security & Speed
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Every feature is designed with trust and performance at the core.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:border-red-700/30 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-red-900/30 border border-red-800/30 flex items-center justify-center text-red-400 mb-4 group-hover:bg-red-800/40 transition-colors">
                {f.icon}
              </div>
              <h3 className="text-white font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
