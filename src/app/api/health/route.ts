import { NextResponse } from "next/server";
import { supabaseConfigured } from "@/lib/supabase/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "noticias-ia",
    supabaseConfigured: supabaseConfigured(),
    newsProvider: process.env.NEWS_PROVIDER || "mock",
    timestamp: new Date().toISOString(),
  });
}
