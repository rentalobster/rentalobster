export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/chat/history?session_key=...
export async function GET(req: NextRequest) {
  const session_key = req.nextUrl.searchParams.get("session_key");
  if (!session_key) return NextResponse.json({ error: "session_key required" }, { status: 400 });

  const { data: rental } = await supabaseAdmin
    .from("rentals")
    .select("id, status")
    .eq("session_key", session_key)
    .single();

  if (!rental) return NextResponse.json({ error: "invalid session key" }, { status: 401 });

  const { data: messages } = await supabaseAdmin
    .from("chat_messages")
    .select("*")
    .eq("rental_id", rental.id)
    .order("created_at", { ascending: true });

  return NextResponse.json({ messages: messages ?? [], rental_status: rental.status });
}
