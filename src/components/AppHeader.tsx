import Link from "next/link";

const links = [
  { href: "/", label: "Noticias" },
  { href: "/favorites", label: "Favoritos" },
  { href: "/history", label: "Historial" },
  { href: "/login", label: "Entrar" },
];

export function AppHeader() {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-5">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#5b8cff] to-[#7c5cff] text-lg font-bold shadow-[0_4px_20px_rgba(91,140,255,0.35)]">
          N
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Noticias IA</h1>
          <p className="text-sm text-[#9aabcb]">
            IA · robótica · hardware / manufacturing
          </p>
        </div>
      </div>
      <nav className="flex flex-wrap gap-2">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-[#e8eefc] hover:border-[#5b8cff]/50 hover:bg-white/5"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
