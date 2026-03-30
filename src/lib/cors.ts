import { NextResponse } from "next/server";

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(",") ?? ["*"];

export function corsHeaders(origin?: string | null) {
  const allowedOrigin =
    ALLOWED_ORIGINS.includes("*") ? "*" : (origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]);

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-API-Key, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

export function withCORS(response: NextResponse, origin?: string | null): NextResponse {
  const headers = corsHeaders(origin);
  Object.entries(headers).forEach(([k, v]) => response.headers.set(k, v));
  return response;
}

/** Handles OPTIONS preflight for CORS */
export function handleOptions(req: Request): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(req.headers.get("origin")),
  });
}
