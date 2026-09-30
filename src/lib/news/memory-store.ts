import type { NewsItem } from "@/types/news";
import type { GenerateForDayResult } from "./generate";
import { getNewsProvider } from "./providers";
import { hashUrl, hostFromUrl, normalizeTitle } from "./dedupe";

type DayRecord = {
  day: string;
  provider: string;
  items: NewsItem[];
};

const days = new Map<string, DayRecord>();
const globalHashes = new Set<string>();
const globalTitles = new Set<string>();

function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function memoryGenerateForDay(
  dayInput?: string | null
): Promise<GenerateForDayResult> {
  const day = dayInput && /^\d{4}-\d{2}-\d{2}$/.test(dayInput)
    ? dayInput
    : todayISODate();

  const existing = days.get(day);
  if (existing) {
    return {
      day,
      idempotent: true,
      provider: existing.provider,
      inserted: 0,
      skippedDuplicates: 0,
      items: existing.items,
      message: `Day ${day} already generated (memory store) — returning existing items.`,
    };
  }

  const provider = getNewsProvider();
  const candidates = await provider.generateForDay(day);
  const items: NewsItem[] = [];
  let skippedDuplicates = 0;

  for (const c of candidates) {
    const url_hash = hashUrl(c.url);
    const normalized_title = normalizeTitle(c.title);
    if (globalHashes.has(url_hash) || globalTitles.has(normalized_title)) {
      skippedDuplicates += 1;
      continue;
    }
    globalHashes.add(url_hash);
    globalTitles.add(normalized_title);
    items.push({
      id: crypto.randomUUID(),
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
      created_at: new Date().toISOString(),
    });
  }

  days.set(day, { day, provider: provider.name, items });
  return {
    day,
    idempotent: false,
    provider: provider.name,
    inserted: items.length,
    skippedDuplicates,
    items,
    message: `Generated ${items.length} items for ${day} via ${provider.name} in memory store (${skippedDuplicates} duplicates skipped).`,
  };
}

export function memoryListByDay(day: string): NewsItem[] {
  return days.get(day)?.items ?? [];
}

export function memoryGetById(id: string): NewsItem | null {
  for (const rec of days.values()) {
    const found = rec.items.find((i) => i.id === id);
    if (found) return found;
  }
  return null;
}

export function memoryReset() {
  days.clear();
  globalHashes.clear();
  globalTitles.clear();
}
