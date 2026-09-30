import { NextRequest, NextResponse } from "next/server";
import { memoryListByDay } from "@/lib/news/memory-store";
import {
  createClient,
  supabaseConfigured,
} from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const day =
      req.nextUrl.searchParams.get("day") ||
      new Date().toISOString().slice(0, 10);

    if (!supabaseConfigured()) {
      return NextResponse.json({
        day,
        items: memoryListByDay(day),
        mode: "memory",
      });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("news_items")
      .select("*")
      .eq("day", day)
      .order("impact", { ascending: false, nullsFirst: false });
    if (error) throw error;
    return NextResponse.json({ day, items: data ?? [], mode: "supabase" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
