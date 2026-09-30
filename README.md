# Noticias IA

App Next.js (App Router) + Supabase para generar y consultar noticias diarias de **IA · robótica · hardware / manufacturing**, con auth (favoritos, historial) y stubs para rewrite / generador de posts (feature de pago futura).

Live (hoy estático): https://noticias.metaversetech.es  
Repo: https://github.com/javierkijano/noticias-ia

## Architecture (phase 1)

1. **`POST /api/news/generate-for-day`** — genera el batch del día pedido (default = hoy). Si el día **ya tiene filas** → **no regenera** (idempotente).
2. **Antiduplicados cross-day** — no inserta si `url_hash` o `normalized_title` ya existen en días anteriores.
3. **Rewrite** — `POST /api/news/rewrite` stub (no es el flujo normal).
4. **Supabase** — migraciones + cliente con placeholders; credenciales vía Secrets Manager (Metaverse).
5. **Auth** — magic link / OAuth stubs; favoritos + `query_history`.
6. **`POST /api/posts/generate`** — stub de feature de pago; el bot Generador de posts consumirá la DB más adelante.
7. Legacy dashboard: `legacy/index.html` (UX de referencia). Handoff: `handoff-generador-posts.md`.

## Local setup

```bash
cd /Users/jq/Projects/noticias-ia   # or your clone
cp .env.example .env.local          # fill when secrets exist; mock works without
npm install
npm run dev
```

Open http://localhost:3000

### Env vars

See `.env.example`. Never commit real secrets.

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | for DB/auth | Metaverse Supabase project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | for DB/auth | public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | for generate writes | server only |
| `NEWS_PROVIDER` | no | `mock` (default) or `openai` |
| `OPENAI_API_KEY` | only if openai | never invent keys |
| `NEXT_PUBLIC_APP_URL` | no | default localhost |

Without Supabase env, APIs fall back to an **in-memory store** (idempotency/dedupe still enforced in-process).

### Migrations

```bash
# Example with Supabase CLI (when linked):
# supabase db push
# Or paste supabase/migrations/20261001000000_init.sql in the SQL editor.
```

### Scripts

- `npm run dev` — development
- `npm run build` / `npm start` — production
- `npm run typecheck` — TypeScript

## API

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/health` | liveness + config flags |
| POST | `/api/news/generate-for-day` | body `{ "day": "YYYY-MM-DD" }` optional; idempotent |
| GET | `/api/news?day=YYYY-MM-DD` | list by day |
| GET | `/api/news/:id` | single item |
| GET/POST | `/api/favorites` | auth required (Supabase) |
| DELETE | `/api/favorites/:id` | auth required |
| GET/POST | `/api/history` | auth required |
| POST | `/api/news/rewrite` | **501 stub** (future paid) |
| POST | `/api/posts/generate` | **501 stub** (future paid) |

## Coolify

Current Coolify app is **static**. Cutover to Node/Next is owned by **Coolify Expert** — see `BLOCKERS.md`. Do not assume this PR changes production hosting.

## Branch

Feature work lands on `feat/api-supabase-app`.
