import { NextRequest, NextResponse } from "next/server";
import { generateForDay } from "@/lib/news/generate";
import { memoryGenerateForDay } from "@/lib/news/memory-store";
import {
  createServiceClient,
  supabaseConfigured,
} from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as { day?: string };
    const day = body.day;

    if (!supabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const result = await memoryGenerateForDay(day);
      return NextResponse.json({
        ...result,
        mode: "memory",
        note: "Supabase env missing — used in-memory store. See BLOCKERS.md.",
      });
    }

    const supabase = createServiceClient();
    const result = await generateForDay(supabase, day);
    return NextResponse.json({ ...result, mode: "supabase" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
