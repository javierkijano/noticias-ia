import type { SupabaseClient } from "@supabase/supabase-js";
import { getNewsProvider } from "./providers";
import { hashUrl, hostFromUrl, normalizeTitle } from "./dedupe";
import type { NewsItem } from "@/types/news";

export type GenerateForDayResult = {
  day: string;
  idempotent: boolean;
  provider: string;
  inserted: number;
  skippedDuplicates: number;
  items: NewsItem[];
  message: string;
};

function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function generateForDay(
  supabase: SupabaseClient,
  dayInput?: string | null
): Promise<GenerateForDayResult> {
  const day = (dayInput && /^\d{4}-\d{2}-\d{2}$/.test(dayInput)
    ? dayInput
    : todayISODate());

  // Idempotency: if day already has rows, return them without regenerating
  const { data: existingDay, error: dayErr } = await supabase
    .from("news_days")
    .select("day, generated_at, provider, item_count, status")
    .eq("day", day)
    .maybeSingle();

  if (dayErr) throw dayErr;

  if (existingDay) {
    const { data: items, error: itemsErr } = await supabase
      .from("news_items")
      .select("*")
      .eq("day", day)
      .order("impact", { ascending: false, nullsFirst: false });
    if (itemsErr) throw itemsErr;
    return {
      day,
      idempotent: true,
      provider: existingDay.provider,
      inserted: 0,
      skippedDuplicates: 0,
      items: (items ?? []) as NewsItem[],
      message: `Day ${day} already generated — returning existing items (no regenerate).`,
    };
  }

  const provider = getNewsProvider();
  const candidates = await provider.generateForDay(day);

  // Cross-day dedupe: load existing hashes/titles
  const { data: prior, error: priorErr } = await supabase
    .from("news_items")
    .select("url_hash, normalized_title");
  if (priorErr) throw priorErr;

  const seenHashes = new Set((prior ?? []).map((r) => r.url_hash as string));
  const seenTitles = new Set(
    (prior ?? []).map((r) => r.normalized_title as string)
  );

  const toInsert: Record<string, unknown>[] = [];
  let skippedDuplicates = 0;

  for (const c of candidates) {
    const url_hash = hashUrl(c.url);
    const normalized_title = normalizeTitle(c.title);
    if (seenHashes.has(url_hash) || seenTitles.has(normalized_title)) {
      skippedDuplicates += 1;
      continue;
    }
    seenHashes.add(url_hash);
    seenTitles.add(normalized_title);
    toInsert.push({
      day,
      title: c.title,
      summary: c.summary,
      url: c.url,
      url_hash,
      normalized_title,
      source_name: c.sourceName ?? null,
      source_host: hostFromUrl(c.url),
      image_url: c.imageUrl ?? null,
      focus: c.focus ?? null,
      impact: c.impact ?? null,
      topics: c.topics ?? [],
      raw: c,
    });
  }

  const { error: upsertDayErr } = await supabase.from("news_days").insert({
    day,
    provider: provider.name,
    item_count: toInsert.length,
    status: "ready",
  });
  if (upsertDayErr) throw upsertDayErr;

  let items: NewsItem[] = [];
  if (toInsert.length > 0) {
    const { data: inserted, error: insertErr } = await supabase
      .from("news_items")
      .insert(toInsert)
      .select("*");
    if (insertErr) throw insertErr;
    items = (inserted ?? []) as NewsItem[];
  }

  return {
    day,
    idempotent: false,
    provider: provider.name,
    inserted: items.length,
    skippedDuplicates,
    items,
    message: `Generated ${items.length} items for ${day} via ${provider.name} (${skippedDuplicates} cross-day duplicates skipped).`,
  };
}
