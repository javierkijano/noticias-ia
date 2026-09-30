import { NextResponse } from "next/server";

/**
 * Stub — Generador de posts bot will consume DB later (paid feature).
 * See handoff-generador-posts.md for the existing selection handoff contract.
 */
export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      stub: true,
      feature: "posts.generate",
      message:
        "Post generation is a future paid feature. Generador de posts bot will read news from Supabase later.",
      planned: {
        input: {
          newsItemIds: ["uuid"],
          format: "linkedin|thread|newsletter",
          language: "es|en",
        },
        output: { draft: "string", handoffVersion: "noticias-ia-seleccion-v1" },
        billing: "paid",
      },
    },
    { status: 501 }
  );
}
