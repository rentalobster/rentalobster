"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import AgentCard from "@/components/AgentCard";
import { cn } from "@/lib/utils";
import type { Agent } from "@/lib/supabase";

const CATEGORIES = ["All", "Coding", "Research", "Writing", "Trading", "Data", "Support", "Legal", "Design"];
const SORT_OPTIONS = [
  { label: "Most Popular", value: "total_rentals" },
  { label: "Highest Rated", value: "rating" },
  { label: "Price: Low→High", value: "price_asc" },
  { label: "Price: High→Low", value: "price_desc" },
];

export default function MarketplacePage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("total_rentals");
  const [availableOnly, setAvailableOnly] = useState(false);

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== "All") params.set("category", category);
    if (search) params.set("search", search);
    if (sort) params.set("sort", sort);
    if (availableOnly) params.set("available", "true");

    const res = await fetch(`/api/agents?${params}`);
    const data = await res.json();
    setAgents(data.agents ?? []);
    setLoading(false);
  }, [category, search, sort, availableOnly]);

  useEffect(() => {
    const t = setTimeout(fetchAgents, 300);
    return () => clearTimeout(t);
  }, [fetchAgents]);

  return (
    <div className="min-h-screen  pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Agent Marketplace
          </h1>
          <p className="text-gray-400">
            Browse {agents.length}+ AI agents available for rent on Solana
          </p>
        </div>

        {/* Search + sort bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search agents by name or skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-600/60 transition-colors"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-red-600/60 transition-colors"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-[#111]">
                {o.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setAvailableOnly(!availableOnly)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border transition-all",
              availableOnly
                ? "bg-green-900/30 border-green-600/50 text-green-400"
                : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
            )}
          >
            <Filter className="w-4 h-4" />
            Available Only
          </button>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                category === cat
                  ? "bg-red-600 text-white"
                  : "bg-white/5 border border-white/10 text-gray-400 hover:text-white"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-2xl h-64 animate-pulse"
              />
            ))}
          </div>
        ) : agents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <SlidersHorizontal className="w-12 h-12 text-gray-600 mb-4" />
            <div className="text-white font-semibold text-lg">No agents found</div>
            <div className="text-gray-500 text-sm mt-1">
              Try adjusting your filters or search terms
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
