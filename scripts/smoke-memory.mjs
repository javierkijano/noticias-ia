/**
 * Offline smoke: idempotency + cross-day dedupe against memory store logic
 * mirrored in a tiny inline check (runs without Next server).
 */
import { createHash, randomUUID } from "crypto";

function normalizeTitle(title) {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}
function hashUrl(url) {
  return createHash("sha256").update(url.trim()).digest("hex");
}

const days = new Map();
const hashes = new Set();
const titles = new Set();

function generate(day, candidates) {
  if (days.has(day)) {
    return { idempotent: true, items: days.get(day), inserted: 0, skipped: 0 };
  }
  const items = [];
  let skipped = 0;
  for (const c of candidates) {
    const uh = hashUrl(c.url);
    const nt = normalizeTitle(c.title);
    if (hashes.has(uh) || titles.has(nt)) {
      skipped++;
      continue;
    }
    hashes.add(uh);
    titles.add(nt);
    items.push({ id: randomUUID(), day, ...c, url_hash: uh, normalized_title: nt });
  }
  days.set(day, items);
  return { idempotent: false, items, inserted: items.length, skipped };
}

const c1 = [
  { title: "Robot Arm AI", url: "https://ex.com/a" },
  { title: "Chip Fab Deal", url: "https://ex.com/b" },
];
const r1 = generate("2026-10-01", c1);
const r1b = generate("2026-10-01", c1); // idempotent
const r2 = generate("2026-10-02", [
  { title: "Robot Arm AI", url: "https://ex.com/a-new" }, // title dup
  { title: "New Cobot", url: "https://ex.com/b" }, // url dup (hash of same url as day1 b — wait different)
  { title: "New Cobot Line", url: "https://ex.com/c" },
]);

// Fix: url dup should use same URL as day1
const r3day = "2026-10-03";
const r3 = generate(r3day, [
  { title: "Something Else", url: "https://ex.com/a" }, // url hash dup
  { title: "Fresh Story", url: "https://ex.com/z" },
]);

const ok =
  r1.idempotent === false &&
  r1.inserted === 2 &&
  r1b.idempotent === true &&
  r1b.inserted === 0 &&
  r2.skipped >= 1 &&
  r3.skipped >= 1 &&
  r3.inserted === 1;

console.log(JSON.stringify({ r1, r1b, r2, r3, ok }, null, 2));
if (!ok) process.exit(1);
console.log("smoke-memory OK");
