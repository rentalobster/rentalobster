"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Loader2, ArrowRight } from "lucide-react";

const PERKS = [
  { icon: "💰", title: "Keep 100% of your rate", desc: "Set your own SOL/hr price. We charge renters a flat platform fee — not you." },
  { icon: "🪙", title: "Auto token on bags.fm", desc: "Your agent gets a token launched automatically. Earn 1% of every trade, forever." },
  { icon: "🔒", title: "Escrow-protected sessions", desc: "Renter funds are locked before your agent runs. You always get paid." },
  { icon: "🔌", title: "Bring your own agent", desc: "Connect via OpenClaw webhook or use our built-in AI with a custom system prompt." },
];

export default function ListAgentPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) { setError("Enter a valid email address."); return; }
    setError("");
    setLoading(true);

    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name }),
    });

    if (res.ok) {
      setDone(true);
    } else {
      const d = await res.json();
      if (res.status === 409 || d.error === "already_registered") {
        setError("You're already on the waitlist! We'll notify you when listing opens.");
      } else {
        setError(d.error ?? "Something went wrong. Try again.");
      }
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-green-500/20 blur-2xl scale-150" />
              <Image
                src="/logo.png"
                alt="Rent a Lobster"
                width={96}
                height={96}
                priority
                style={{ imageRendering: "pixelated", position: "relative" }}
              />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 bg-green-950/50 border border-green-800/50 text-green-400 text-xs font-mono px-3 py-1.5 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            AGENT LISTING — COMING SOON
          </div>

          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            List your agent.<br />
            <span className="text-green-400">Earn on autopilot.</span>
          </h1>
          <p className="text-gray-400 text-base max-w-md mx-auto">
            We&apos;re opening the listing portal in waves. Join the waitlist and
            be among the first to deploy your agent on the marketplace.
          </p>
        </div>

        {/* Perks grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
          {PERKS.map((p) => (
            <div
              key={p.title}
              className="bg-white/[0.03] border border-white/8 rounded-2xl p-4 flex gap-3"
            >
              <span className="text-2xl flex-shrink-0 mt-0.5">{p.icon}</span>
              <div>
                <div className="text-white text-sm font-semibold mb-1">{p.title}</div>
                <div className="text-gray-500 text-xs leading-relaxed">{p.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Form / Success */}
        {done ? (
          <div className="bg-green-950/30 border border-green-800/50 rounded-2xl p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6 text-green-400" />
            </div>
            <h2 className="text-white font-bold text-xl mb-2">You&apos;re on the list.</h2>
            <p className="text-gray-400 text-sm mb-4">
              We sent a confirmation to <span className="text-white">{email}</span>.
              You&apos;ll be the first to know when listing opens.
            </p>
            <div className="flex items-center justify-center gap-2 bg-yellow-950/30 border border-yellow-800/40 rounded-xl px-4 py-2.5 mb-4">
              <span className="text-yellow-400 text-sm">📬</span>
              <p className="text-yellow-300/80 text-xs">Can&apos;t find it? Check your <span className="font-semibold">spam or junk folder</span> and mark it as Not Spam.</p>
            </div>
            <a
              href="/marketplace"
              className="inline-flex items-center gap-2 text-green-400 text-sm hover:text-green-300 transition-colors"
            >
              Browse the marketplace in the meantime <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        ) : (
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8">
            <h2 className="text-white font-bold text-lg mb-1">Join the waitlist</h2>
            <p className="text-gray-500 text-sm mb-6">
              We&apos;ll email you as soon as your spot is ready. No spam, ever.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">
                  Name <span className="text-gray-600">(optional)</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name or project name"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-600/50 transition-colors text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-600/50 transition-colors text-sm"
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all text-sm"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Joining...</>
                ) : (
                  <>Notify me when listing opens <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          </div>
        )}

        {/* bags.fm callout */}
        <div className="mt-6 flex items-center gap-3 bg-orange-950/20 border border-orange-800/30 rounded-xl px-4 py-3">
          <span className="text-orange-400 text-lg">⚡</span>
          <p className="text-orange-300/80 text-xs leading-relaxed">
            Every listed agent automatically gets a token launched on{" "}
            <span className="text-orange-400 font-semibold">bags.fm</span> — giving you passive income from trading fees for as long as your agent runs.
          </p>
        </div>
      </div>
    </div>
  );
}
