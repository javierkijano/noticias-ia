import { NextRequest, NextResponse } from "next/server";
import {
  createClient,
  supabaseConfigured,
} from "@/lib/supabase/server";

export async function GET() {
  try {
    if (!supabaseConfigured()) {
      return NextResponse.json({
        history: [],
        mode: "memory",
        note: "Auth/history require Supabase — see BLOCKERS.md",
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
      .from("query_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return NextResponse.json({ history: data ?? [], mode: "supabase" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!supabaseConfigured()) {
      return NextResponse.json(
        { error: "Supabase required for history", stub: true },
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
    const body = (await req.json()) as { query?: string; meta?: object };
    if (!body.query?.trim()) {
      return NextResponse.json({ error: "query required" }, { status: 400 });
    }
    const { data, error } = await supabase
      .from("query_history")
      .insert({
        user_id: user.id,
        query: body.query.trim(),
        meta: body.meta ?? {},
      })
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json({ entry: data }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
