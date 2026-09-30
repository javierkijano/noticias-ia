"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DayControls({ initialDay }: { initialDay: string }) {
  const router = useRouter();
  const [day, setDay] = useState(initialDay);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function generate() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/news/generate-for-day", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generate failed");
      setMsg(data.message || "OK");
      router.push(`/?day=${day}`);
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  function goDay() {
    router.push(`/?day=${day}`);
  }

  return (
    <div className="card mb-6 flex flex-wrap items-end gap-3 p-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-[#9aabcb]">Día</span>
        <input
          type="date"
          value={day}
          onChange={(e) => setDay(e.target.value)}
          className="rounded-lg border border-white/10 bg-[#0b1020] px-3 py-2"
        />
      </label>
      <button
        type="button"
        onClick={goDay}
        className="rounded-lg border border-white/15 px-4 py-2 text-sm hover:bg-white/5"
      >
        Ver
      </button>
      <button
        type="button"
        onClick={generate}
        disabled={busy}
        className="rounded-lg bg-gradient-to-r from-[#5b8cff] to-[#7c5cff] px-4 py-2 text-sm font-semibold disabled:opacity-60"
      >
        {busy ? "Generando…" : "Generar día (idempotente)"}
      </button>
      {msg && <p className="basis-full text-sm text-[#9aabcb]">{msg}</p>}
    </div>
  );
}
