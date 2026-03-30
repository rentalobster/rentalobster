"use client";

import { useState } from "react";
import { Star, Zap, Clock, Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

const categories = ["All", "Coding", "Research", "Writing", "Trading", "Data", "Support"];

const agents = [
  {
    id: 1,
    name: "CodeCrustacean",
    emoji: "🦀",
    category: "Coding",
    description: "Full-stack code generation, debugging, and architecture advice. Supports 30+ languages.",
    rating: 4.9,
    reviews: 312,
    pricePerHour: 0.05,
    tags: ["TypeScript", "Python", "Rust"],
    status: "available",
    speed: "~1.2s",
  },
  {
    id: 2,
    name: "DeepDiver",
    emoji: "🐙",
    category: "Research",
    description: "Advanced web research, summarization, and fact-checking with real-time data access.",
    rating: 4.8,
    reviews: 204,
    pricePerHour: 0.04,
    tags: ["Research", "Analysis", "Summaries"],
    status: "available",
    speed: "~0.9s",
  },
  {
    id: 3,
    name: "QuillFish",
    emoji: "🐡",
    category: "Writing",
    description: "Professional copywriting, blog posts, SEO content, and creative storytelling.",
    rating: 4.7,
    reviews: 178,
    pricePerHour: 0.03,
    tags: ["SEO", "Blog", "Creative"],
    status: "available",
    speed: "~0.8s",
  },
  {
    id: 4,
    name: "TradingShark",
    emoji: "🦈",
    category: "Trading",
    description: "On-chain trading signals, portfolio analysis, and DeFi strategy recommendations.",
    rating: 4.9,
    reviews: 509,
    pricePerHour: 0.08,
    tags: ["DeFi", "Signals", "Portfolio"],
    status: "busy",
    speed: "~0.5s",
  },
  {
    id: 5,
    name: "DataOctopus",
    emoji: "🐚",
    category: "Data",
    description: "Complex data analysis, visualization scripts, and ML model training pipelines.",
    rating: 4.8,
    reviews: 133,
    pricePerHour: 0.06,
    tags: ["ML", "Python", "Visualization"],
    status: "available",
    speed: "~1.5s",
  },
  {
    id: 6,
    name: "SupportClam",
    emoji: "🐌",
    category: "Support",
    description: "24/7 customer support automation, ticket routing, and FAQ generation.",
    rating: 4.6,
    reviews: 89,
    pricePerHour: 0.02,
    tags: ["Customer Service", "Automation"],
    status: "available",
    speed: "~0.4s",
  },
];

export default function Marketplace() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = agents.filter((a) => {
    const matchCat = activeCategory === "All" || a.category === activeCategory;
    const matchSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <section id="marketplace" className="py-20 px-4 relative">
      <div className="max-w-7xl mx-auto">
        {/* Header — XP window */}
        <div className="xp-window mb-8">
          <div className="xp-titlebar">
            <span className="xp-titlebar-text">🛒 Agent Marketplace — Browse Available Agents</span>
            <div className="flex gap-0.5">
              <div className="w-4 h-3.5 bg-[#d4d0c8] border border-[#404040] flex items-center justify-center text-[8px]"
                   style={{ boxShadow: "inset -1px -1px #808080, inset 1px 1px #fff" }}>_</div>
              <div className="w-4 h-3.5 bg-[#d4d0c8] border border-[#404040] flex items-center justify-center text-[8px]"
                   style={{ boxShadow: "inset -1px -1px #808080, inset 1px 1px #fff" }}>□</div>
              <div className="xp-close-btn">✕</div>
            </div>
          </div>
          <div className="bg-[#ece9d8] p-4">
            <p className="font-retro text-[16px] text-[#555]">
              Discover and rent specialized AI agents configured for every task.
              Pay only for what you use.
            </p>
          </div>
        </div>

        {/* Search + filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
            <input
              type="text"
              placeholder="Search agents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full xp-sunken bg-white pl-9 pr-4 py-2 font-retro text-[15px] text-[#000] placeholder-[#888] focus:outline-none"
            />
          </div>
          <button className="xp-button flex items-center gap-2 text-[8px]">
            <Filter className="w-3.5 h-3.5" />
            Filters
          </button>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "xp-button text-[7px]",
                activeCategory === cat ? "xp-button-primary" : ""
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Agent grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((agent) => (
            <div key={agent.id} className="xp-window card-glow flex flex-col">
              {/* XP Title bar */}
              <div className="xp-titlebar gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base leading-none flex-shrink-0">{agent.emoji}</span>
                  <span className="xp-titlebar-text truncate">{agent.name}</span>
                </div>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <div className="w-4 h-3.5 bg-[#d4d0c8] border border-[#404040] flex items-center justify-center text-[8px] cursor-pointer"
                       style={{ boxShadow: "inset -1px -1px #808080, inset 1px 1px #fff" }}>_</div>
                  <div className="w-4 h-3.5 bg-[#d4d0c8] border border-[#404040] flex items-center justify-center text-[8px] cursor-pointer"
                       style={{ boxShadow: "inset -1px -1px #808080, inset 1px 1px #fff" }}>□</div>
                  <div className="xp-close-btn">✕</div>
                </div>
              </div>

              {/* Window body */}
              <div className="p-3 flex flex-col gap-3 flex-1 bg-[#ece9d8]">
                {/* Category + status */}
                <div className="flex items-center justify-between">
                  <span className="font-pixel text-[6px] text-[#404040]">{agent.category}</span>
                  <span className={agent.status === "available" ? "mc-badge-available" : "mc-badge-busy"}>
                    {agent.status === "available" ? "● ONLINE" : "● BUSY"}
                  </span>
                </div>

                {/* Description */}
                <p className="font-retro text-[14px] text-[#333] leading-tight xp-sunken bg-white p-2 line-clamp-3">
                  {agent.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {agent.tags.map((t) => (
                    <span key={t} className="mc-tag">{t}</span>
                  ))}
                </div>

                {/* Meta */}
                <div className="flex items-center justify-between border-t-2 border-[#808080] pt-2 mt-auto"
                     style={{ borderBottom: "2px solid #fff" }}>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="font-pixel text-[6px] text-[#222]">{agent.rating}</span>
                    <span className="font-retro text-[12px] text-[#666]">({agent.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#666]">
                    <Clock className="w-3 h-3" />
                    <span className="font-retro text-[12px]">{agent.speed}</span>
                  </div>
                </div>

                {/* Price + CTA */}
                <div className="flex items-center justify-between">
                  <div className="mc-panel px-2 py-1 mc-block-gold">
                    <span className="font-pixel text-[8px] mc-text-gold">{agent.pricePerHour}</span>
                    <span className="font-retro text-[12px] text-[#886600] ml-1">SOL/hr</span>
                  </div>
                  <button
                    disabled={agent.status !== "available"}
                    className={cn(
                      "xp-button flex items-center gap-1.5 text-[7px]",
                      agent.status === "available" ? "xp-button-primary" : "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <Zap className="w-3 h-3" />
                    {agent.status === "available" ? "RENT NOW" : "BUSY"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View all */}
        <div className="text-center mt-8">
          <button className="xp-button text-[8px] px-8 py-3">
            ▼ View All 2,400+ Agents
          </button>
        </div>
      </div>
    </section>
  );
}
