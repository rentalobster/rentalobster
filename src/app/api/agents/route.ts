export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthFromRequest } from "@/lib/auth";
import { sanitizeWebhookUrl } from "@/lib/ssrf";
import { createBagsTokenInfo, makeTokenSymbol } from "@/lib/bags";

const MAX_NAME_LEN = 60;
const MAX_DESC_LEN = 300;
const MAX_LONG_DESC_LEN = 2000;
const MAX_PERSONA_LEN = 4000;
const PAGE_SIZE = 24;

// GET /api/agents — list agents with filters + pagination
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const available = searchParams.get("available");
  const sort = searchParams.get("sort") ?? "total_rentals";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const offset = (page - 1) * PAGE_SIZE;

  type SortCol = "price_per_hour" | "total_rentals" | "avg_rating";
  const sortMap: Record<string, { col: SortCol; asc: boolean }> = {
    price_asc:    { col: "price_per_hour", asc: true },
    price_desc:   { col: "price_per_hour", asc: false },
    rating:       { col: "avg_rating",     asc: false },
    total_rentals:{ col: "total_rentals",  asc: false },
  };
  const { col, asc } = sortMap[sort] ?? sortMap.total_rentals;

  let query = supabaseAdmin
    .from("agents")
    .select("*, owner:users(id, wallet, username, avatar_emoji)", { count: "exact" })
    .order(col, { ascending: asc })
    .range(offset, offset + PAGE_SIZE - 1);

  if (category && category !== "All") query = query.eq("category", category);
  if (available === "true") query = query.eq("is_available", true);
  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    agents: data,
    pagination: { page, pageSize: PAGE_SIZE, total: count ?? 0, hasMore: offset + PAGE_SIZE < (count ?? 0) },
  });
}

// POST /api/agents — create agent listing (auth required)
export async function POST(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { name, emoji, category, description, long_desc, tags, price_per_hour, persona, webhook_url, hook_token } = body;

  // Validation
  if (!name || !category || !description || !price_per_hour) {
    return NextResponse.json({ error: "name, category, description, price_per_hour required" }, { status: 400 });
  }
  if (typeof name !== "string" || name.trim().length === 0 || name.length > MAX_NAME_LEN) {
    return NextResponse.json({ error: `name must be 1-${MAX_NAME_LEN} chars` }, { status: 400 });
  }
  if (typeof description !== "string" || description.length > MAX_DESC_LEN) {
    return NextResponse.json({ error: `description max ${MAX_DESC_LEN} chars` }, { status: 400 });
  }
  if (long_desc && long_desc.length > MAX_LONG_DESC_LEN) {
    return NextResponse.json({ error: `long_desc max ${MAX_LONG_DESC_LEN} chars` }, { status: 400 });
  }
  if (persona && persona.length > MAX_PERSONA_LEN) {
    return NextResponse.json({ error: `persona max ${MAX_PERSONA_LEN} chars` }, { status: 400 });
  }
  const price = parseFloat(price_per_hour);
  if (isNaN(price) || price < 0.001 || price > 100) {
    return NextResponse.json({ error: "price_per_hour must be between 0.001 and 100 SOL" }, { status: 400 });
  }
  if (tags && (!Array.isArray(tags) || tags.length > 8 || tags.some((t: unknown) => typeof t !== "string" || t.length > 30))) {
    return NextResponse.json({ error: "tags must be array of max 8 strings (30 chars each)" }, { status: 400 });
  }

  // SSRF validation on webhook URL
  let safeWebhookUrl: string | null = null;
  if (webhook_url) {
    safeWebhookUrl = sanitizeWebhookUrl(webhook_url);
    if (!safeWebhookUrl) {
      return NextResponse.json({ error: "invalid or unsafe webhook_url" }, { status: 400 });
    }
  }

  const { data, error } = await supabaseAdmin
    .from("agents")
    .insert({
      owner_id: auth.userId,
      name: name.trim(),
      emoji: emoji ?? "🤖",
      category,
      description,
      long_desc: long_desc ?? null,
      tags: tags ?? [],
      price_per_hour: price,
      persona: persona ?? null,
      webhook_url: safeWebhookUrl,
      hook_token: hook_token ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Attempt bags.fm token creation — non-fatal if it fails or key is not set
  const tokenInfo = await createBagsTokenInfo({
    name: data.name,
    description: data.description,
    emoji: data.emoji,
    website: process.env.NEXT_PUBLIC_APP_URL,
  });

  if (tokenInfo) {
    await supabaseAdmin
      .from("agents")
      .update({
        token_mint: tokenInfo.tokenMint,
        token_symbol: makeTokenSymbol(data.name),
        token_metadata_url: tokenInfo.tokenMetadata,
        token_image_url: tokenInfo.tokenImageUrl,
        token_status: "pre_launch",
      })
      .eq("id", data.id);

    data.token_mint = tokenInfo.tokenMint;
    data.token_symbol = tokenInfo.symbol;
    data.token_metadata_url = tokenInfo.tokenMetadata;
    data.token_image_url = tokenInfo.tokenImageUrl;
    data.token_status = "pre_launch";
  }

  return NextResponse.json({ agent: data }, { status: 201 });
}
