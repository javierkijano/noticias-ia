import { NextResponse } from "next/server";

/**
 * Stub — rewrite is a separate optional feature, NOT the normal generate flow.
 * Future paid / premium path.
 */
export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      stub: true,
      feature: "news.rewrite",
      message:
        "Rewrite endpoint reserved for a future paid feature. Not part of daily generate-for-day flow.",
      planned: {
        input: { newsItemId: "uuid", tone: "neutral|executive|technical" },
        output: { rewrittenSummary: "string", rewrittenTitle: "string" },
      },
    },
    { status: 501 }
  );
}
