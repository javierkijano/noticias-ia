# Blockers — Secrets Manager / Coolify Expert

Phase 1 scaffolds code only. These items block production go-live.

## Secrets Manager (Metaverse / Javier)

Do **not** create or log into Supabase from agent sessions if credentials are missing.
Provision under Metaverse account `javier.gonzalez@metaversetech.es`:

| Secret | Where used |
|--------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | App + API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser + SSR auth |
| `SUPABASE_SERVICE_ROLE_KEY` | `POST /api/news/generate-for-day` privileged writes |
| `OPENAI_API_KEY` (optional) | Only if `NEWS_PROVIDER=openai` |
| `OPENAI_MODEL` (optional) | Default `gpt-4o-mini` |

Apply SQL in `supabase/migrations/20261001000000_init.sql` to the Supabase project (CLI or SQL editor).

Enable Auth: Email magic link (+ Google/GitHub OAuth if desired). Set redirect URLs to the Coolify domain and `http://localhost:3000`.

## Coolify Expert

Live site today: https://noticias.metaversetech.es (Coolify app `noticias-ia`, **static**).

Required change (out of scope for this PR):

1. Switch Coolify app from static hosting → **Node** (Next.js).
2. Build command: `npm ci && npm run build`
3. Start command: `npm run start` (port from Coolify / `PORT`)
4. Inject env vars from Secrets Manager.
5. Keep `legacy/index.html` only as reference; do not serve it as the primary site after cutover.

## Local offline mode

Without Supabase env vars, generate/list APIs use an **in-memory store** so idempotency and dedupe can be exercised in process. Data is lost on restart. Favorites/history return empty / 503 until Supabase is wired.
