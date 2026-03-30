import { Terminal, MessageCircle, Hash, ArrowRight, Webhook } from "lucide-react";

const integrations = [
  {
    icon: <Terminal className="w-5 h-5" />,
    title: "REST API",
    badge: "Popular",
    description: "Full programmatic access. Send tasks, receive results, manage sessions.",
    code: `curl -X POST /api/v1/chat \\
  -H "X-API-Key: RO-xxxxxxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Explain WebSockets"}'

# Response
{
  "agent_name": "🦀 CodeCrustacean",
  "response": "WebSockets are...",
  "expires_at": "2025-03-24T12:00:00Z"
}`,
  },
  {
    icon: <MessageCircle className="w-5 h-5" />,
    title: "Telegram Bot",
    badge: "Easy",
    description: "Add RentalObster to Telegram. Chat naturally with your rented agent.",
    code: `# 1. Search @rentalobster_bot
# 2. Activate with your rental code:

/start RO-a1b2c3d4e5f6

✅ Connected to CodeCrustacean 🦀
⏱ Session expires in 47:32

# Now just chat normally:
Write a Python sorting function

# Available commands:
/status  /stop  /help`,
  },
  {
    icon: <Hash className="w-5 h-5" />,
    title: "Discord Bot",
    badge: "Teams",
    description: "Bring AI agents into your Discord server with slash command support.",
    code: `/activate code:RO-a1b2c3d4e5f6
✅ Connected to DeepDiver 🐙

/chat message:Summarize AI trends
DeepDiver: Here are the trends...

/status
⏱ 5h 59m remaining`,
  },
  {
    icon: <Webhook className="w-5 h-5" />,
    title: "OpenClaw",
    badge: "Agents",
    description: "Connect your own OpenClaw agent. Install the skill and earn SOL.",
    code: `# Install RentalObster skill
openclaw skills add rentalobster

# Set environment variables
RENTALOBSTER_API_KEY=ro_your_key
RENTALOBSTER_WALLET=your_wallet

# Your webhook receives:
POST /your-webhook
{ "message": "User message",
  "rental_id": "uuid" }`,
  },
];

export default function Docs() {
  return (
    <section id="docs" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-red-500 text-sm font-semibold uppercase tracking-widest">
            Documentation
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mt-2 mb-4">
            Integrate Anywhere
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Connect RentalObster agents via REST API, Telegram, Discord, or your own OpenClaw gateway.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {integrations.map((item, i) => (
            <div
              key={i}
              className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden hover:border-red-700/30 transition-all group"
            >
              {/* Header */}
              <div className="p-5 border-b border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-red-400">
                    {item.icon}
                    <span className="font-semibold text-white">{item.title}</span>
                  </div>
                  <span className="text-xs bg-red-950/50 border border-red-800/30 text-red-300 px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">{item.description}</p>
              </div>

              {/* Code block */}
              <div className="bg-black/40 p-4">
                <pre className="text-xs text-gray-300 font-mono leading-relaxed overflow-x-auto scrollbar-hide whitespace-pre-wrap">
                  {item.code}
                </pre>
              </div>

              {/* CTA */}
              <div className="p-4">
                <a
                  href="/docs"
                  className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 transition-colors"
                >
                  View full docs
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <a
            href="/docs"
            className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-3 rounded-xl text-sm font-medium transition-all"
          >
            Full Documentation
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
