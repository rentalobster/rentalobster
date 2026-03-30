export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { COOKIE_OPTIONS } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set("ro_token", "", { ...COOKIE_OPTIONS, maxAge: 0 });
  return response;
}
