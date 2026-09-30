import type { NewsItem } from "@/types/news";

export function NewsCard({ item }: { item: NewsItem }) {
  return (
    <article className="card flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-base font-semibold leading-snug">{item.title}</h2>
        {item.impact != null && (
          <span className="badge shrink-0">Impacto {item.impact}</span>
        )}
      </div>
      {item.summary && (
        <p className="text-sm leading-relaxed text-[#9aabcb]">{item.summary}</p>
      )}
      <div className="mt-auto flex flex-wrap items-center gap-2 text-xs text-[#9aabcb]">
        {item.focus && <span className="badge">{item.focus}</span>}
        {item.source_host && <span>{item.source_host}</span>}
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="ml-auto text-[#8eb0ff] hover:underline"
        >
          Leer fuente →
        </a>
      </div>
    </article>
  );
}
