import { supabaseAdmin } from "./supabase";

/**
 * DB-based rate limiting — works across all serverless instances.
 * Counts chat_messages created in the last 60 seconds for a given rental.
 * For higher scale, swap this for Upstash Redis.
 */
export async function checkRateLimit(
  rentalId: string,
  limitPerMinute = 60
): Promise<{ allowed: boolean; remaining: number }> {
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();

  const { count } = await supabaseAdmin
    .from("chat_messages")
    .select("*", { count: "exact", head: true })
    .eq("rental_id", rentalId)
    .gte("created_at", oneMinuteAgo);

  const used = count ?? 0;
  const remaining = Math.max(0, limitPerMinute - used);

  return { allowed: used < limitPerMinute, remaining };
}
