export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthFromRequest } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

// GET /api/rentals/[id]
export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: rental, error } = await supabaseAdmin
    .from("rentals")
    .select("*, agent:agents(*), renter:users(id, wallet, username)")
    .eq("id", id)
    .single();

  if (error || !rental) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (rental.renter_id !== auth.userId) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  return NextResponse.json({ rental });
}

// PATCH /api/rentals/[id] — end rental / dispute
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { status } = await req.json();
  if (!["completed", "disputed"].includes(status)) {
    return NextResponse.json({ error: "invalid status" }, { status: 400 });
  }

  const { data: rental } = await supabaseAdmin
    .from("rentals")
    .select("*")
    .eq("id", id)
    .single();

  if (!rental) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (rental.renter_id !== auth.userId) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { data, error } = await supabaseAdmin
    .from("rentals")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ rental: data });
}
