"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    try {
      if (
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ) {
        setStatus(
          "Supabase no configurado. Rellena .env (ver .env.example / BLOCKERS.md). OAuth stubs listos cuando haya proyecto."
        );
        return;
      }
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
      setStatus("Revisa tu correo para el magic link.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Error de auth");
    } finally {
      setBusy(false);
    }
  }

  async function oauthStub(provider: "google" | "github") {
    setStatus(
      `OAuth (${provider}) stub: habilitar provider en Supabase Auth cuando el proyecto Metaverse esté cableado vía Secrets Manager.`
    );
  }

  return (
    <div className="card mx-auto max-w-md p-6">
      <h2 className="mb-2 text-xl font-semibold">Entrar</h2>
      <p className="mb-4 text-sm text-[#9aabcb]">
        Magic link por email (Supabase Auth). Favoritos e historial requieren
        sesión.
      </p>
      <form onSubmit={sendMagicLink} className="flex flex-col gap-3">
        <input
          type="email"
          required
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-white/10 bg-[#0b1020] px-3 py-2"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-gradient-to-r from-[#5b8cff] to-[#7c5cff] px-4 py-2 font-semibold disabled:opacity-60"
        >
          {busy ? "Enviando…" : "Enviar magic link"}
        </button>
      </form>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => oauthStub("google")}
          className="flex-1 rounded-lg border border-white/15 px-3 py-2 text-sm hover:bg-white/5"
        >
          Google (stub)
        </button>
        <button
          type="button"
          onClick={() => oauthStub("github")}
          className="flex-1 rounded-lg border border-white/15 px-3 py-2 text-sm hover:bg-white/5"
        >
          GitHub (stub)
        </button>
      </div>
      {status && <p className="mt-4 text-sm text-[#9aabcb]">{status}</p>}
    </div>
  );
}
