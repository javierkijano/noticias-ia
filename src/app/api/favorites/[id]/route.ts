import { NextRequest, NextResponse } from "next/server";
import {
  createClient,
  supabaseConfigured,
} from "@/lib/supabase/server";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    if (!supabaseConfigured()) {
      return NextResponse.json(
        { error: "Supabase required for favorites", stub: true },
        { status: 503 }
      );
    }
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
