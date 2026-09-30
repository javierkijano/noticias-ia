import { createHash } from "crypto";

/** Lowercase, strip punctuation, collapse whitespace. */
export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Canonicalize URL lightly then sha256 hex. */
export function hashUrl(url: string): string {
  let canonical = url.trim();
  try {
    const u = new URL(canonical);
    u.hash = "";
    // drop trailing slash on pathname (except root)
    if (u.pathname.length > 1 && u.pathname.endsWith("/")) {
      u.pathname = u.pathname.slice(0, -1);
    }
    canonical = u.toString();
  } catch {
    // keep raw trimmed
  }
  return createHash("sha256").update(canonical).digest("hex");
}

export function hostFromUrl(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}
