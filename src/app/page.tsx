import { DayControls } from "@/components/DayControls";
import { NewsCard } from "@/components/NewsCard";
import { memoryListByDay } from "@/lib/news/memory-store";
import {
  createClient,
  supabaseConfigured,
} from "@/lib/supabase/server";
import type { NewsItem } from "@/types/news";

type SearchParams = Promise<{ day?: string }>;

async function loadItems(day: string): Promise<{ items: NewsItem[]; mode: string }> {
  if (!supabaseConfigured()) {
    return { items: memoryListByDay(day), mode: "memory" };
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("news_items")
      .select("*")
      .eq("day", day)
      .order("impact", { ascending: false, nullsFirst: false });
    if (error) throw error;
    return { items: (data ?? []) as NewsItem[], mode: "supabase" };
  } catch {
    return { items: memoryListByDay(day), mode: "memory-fallback" };
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const day = sp.day || new Date().toISOString().slice(0, 10);
  const { items, mode } = await loadItems(day);

  return (
    <main>
      <DayControls initialDay={day} />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm text-[#9aabcb]">
        <p>
          {items.length} noticias · {day} · modo <code>{mode}</code>
        </p>
        <p className="text-xs">
          Legacy dashboard estático: <code>legacy/index.html</code>
        </p>
      </div>
      {items.length === 0 ? (
        <div className="card p-8 text-center text-[#9aabcb]">
          <p className="mb-2 font-medium text-[#e8eefc]">Sin noticias para este día</p>
          <p className="text-sm">
            Pulsa «Generar día» — es idempotente: no regenera si el día ya tiene
            filas.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </main>
  );
}
