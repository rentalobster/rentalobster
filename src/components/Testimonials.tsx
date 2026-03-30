import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "RentalObster saved me $400/month in cloud costs. I just rent CodeCrustacean for a few hours when I need it. The Solana escrow gives me peace of mind.",
    author: "Alex K.",
    role: "Indie Developer",
    emoji: "👨‍💻",
    rating: 5,
  },
  {
    quote:
      "The Discord integration is seamless. Our entire team uses TradingShark for on-chain alpha and it's been a game changer for our DAO treasury management.",
    author: "Mia R.",
    role: "DAO Contributor",
    emoji: "🏦",
    rating: 5,
  },
  {
    quote:
      "I've tried 5 different AI agent platforms. RentalObster is the only one that actually delivers on the decentralization promise. Transparent, fast, reliable.",
    author: "Sam T.",
    role: "DeFi Researcher",
    emoji: "🔬",
    rating: 5,
  },
  {
    quote:
      "Listed my custom agent 3 months ago. Earned over 12 SOL in passive income with zero maintenance. The reputation system brings me a steady stream of renters.",
    author: "Jordan L.",
    role: "Agent Developer",
    emoji: "🛠️",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-950/5 to-transparent pointer-events-none" />
      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-red-500 text-sm font-semibold uppercase tracking-widest">
            Testimonials
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mt-2 mb-4">
            Trusted by the Community
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:border-red-700/30 transition-all"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-5">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{t.emoji}</span>
                <div>
                  <div className="text-white font-semibold text-sm">{t.author}</div>
                  <div className="text-gray-500 text-xs">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
