import { NextRequest, NextResponse } from "next/server";
import {
  createClient,
  supabaseConfigured,
} from "@/lib/supabase/server";

export async function GET() {
  try {
    if (!supabaseConfigured()) {
      return NextResponse.json({
        favorites: [],
        mode: "memory",
        note: "Auth/favorites require Supabase — see BLOCKERS.md",
      });
    }
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { data, error } = await supabase
      .from("favorites")
      .select("id, created_at, news_item_id, news_items(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ favorites: data ?? [], mode: "supabase" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!supabaseConfigured()) {
      return NextResponse.json(
        { error: "Supabase required for favorites", stub: true },
        { status: 503 }
      );
    }
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = (await req.json()) as { newsItemId?: string };
    if (!body.newsItemId) {
      return NextResponse.json(
        { error: "newsItemId required" },
        { status: 400 }
      );
    }
    const { data, error } = await supabase
      .from("favorites")
      .upsert(
        { user_id: user.id, news_item_id: body.newsItemId },
        { onConflict: "user_id,news_item_id" }
      )
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json({ favorite: data }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
