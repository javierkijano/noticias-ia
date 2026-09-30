import { NextRequest, NextResponse } from "next/server";
import { memoryGetById } from "@/lib/news/memory-store";
import {
  createClient,
  supabaseConfigured,
} from "@/lib/supabase/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    if (!supabaseConfigured()) {
      const item = memoryGetById(id);
      if (!item) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json({ item, mode: "memory" });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("news_items")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ item: data, mode: "supabase" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
