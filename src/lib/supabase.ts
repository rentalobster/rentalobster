import { createClient } from "@supabase/supabase-js";

// These are resolved at runtime, not build time
function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder";
  return createClient(url, anonKey);
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    "placeholder";
  return createClient(url, serviceKey);
}

// Client-side Supabase (anon key)
export const supabase = getSupabaseClient();

// Server-side Supabase (service role — bypasses RLS)
export const supabaseAdmin = getSupabaseAdmin();

// ─── Types ────────────────────────────────────────────────
export type User = {
  id: string;
  wallet: string;
  username: string | null;
  avatar_emoji: string;
  created_at: string;
};

export type Agent = {
  id: string;
  owner_id: string;
  name: string;
  emoji: string;
  category: string;
  description: string;
  long_desc: string | null;
  tags: string[];
  price_per_hour: number;
  is_available: boolean;
  total_rentals: number;
  rating_sum: number;
  rating_count: number;
  response_speed: string;
  persona: string | null;
  webhook_url: string | null;
  hook_token: string | null;
  token_mint: string | null;
  token_symbol: string | null;
  token_metadata_url: string | null;
  token_image_url: string | null;
  token_status: string | null;
  created_at: string;
  owner?: User;
};

export type Rental = {
  id: string;
  agent_id: string;
  renter_id: string;
  duration_hrs: number;
  total_cost: number;
  platform_fee: number;
  status: "pending" | "active" | "completed" | "disputed" | "refunded";
  session_key: string | null;
  tx_signature: string | null;
  started_at: string | null;
  ends_at: string | null;
  created_at: string;
  agent?: Agent;
  renter?: User;
};

export type Review = {
  id: string;
  rental_id: string;
  agent_id: string;
  renter_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  renter?: User;
};

export type ChatMessage = {
  id: string;
  rental_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};
