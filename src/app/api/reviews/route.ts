export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthFromRequest } from "@/lib/auth";

// POST /api/reviews — submit a review for a completed rental
export async function POST(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { rental_id, rating, comment } = await req.json();
  if (!rental_id || !rating) {
    return NextResponse.json({ error: "rental_id and rating required" }, { status: 400 });
  }
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "rating must be 1-5" }, { status: 400 });
  }

  // Verify rental belongs to user and is completed
  const { data: rental } = await supabaseAdmin
    .from("rentals")
    .select("*")
    .eq("id", rental_id)
    .eq("renter_id", auth.userId)
    .single();

  if (!rental) return NextResponse.json({ error: "rental not found" }, { status: 404 });

  // Check not already reviewed
  const { data: existing } = await supabaseAdmin
    .from("reviews")
    .select("id")
    .eq("rental_id", rental_id)
    .single();

  if (existing) return NextResponse.json({ error: "already reviewed" }, { status: 409 });

  const { data: review, error } = await supabaseAdmin
    .from("reviews")
    .insert({
      rental_id,
      agent_id: rental.agent_id,
      renter_id: auth.userId,
      rating,
      comment: comment ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Update agent rating
  const { data: agent } = await supabaseAdmin
    .from("agents")
    .select("rating_sum, rating_count")
    .eq("id", rental.agent_id)
    .single();

  if (agent) {
    await supabaseAdmin
      .from("agents")
      .update({
        rating_sum: agent.rating_sum + rating,
        rating_count: agent.rating_count + 1,
      })
      .eq("id", rental.agent_id);
  }

  return NextResponse.json({ review }, { status: 201 });
}
