export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const start = Date.now();
  let dbOk = false;

  try {
    const { error } = await supabaseAdmin.from("agents").select("id").limit(1);
    dbOk = !error;
  } catch {}

  const latencyMs = Date.now() - start;
  const status = dbOk ? 200 : 503;

  return NextResponse.json(
    {
      status: dbOk ? "ok" : "degraded",
      db: dbOk ? "connected" : "error",
      latency_ms: latencyMs,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? "1.0.0",
    },
    { status }
  );
}
