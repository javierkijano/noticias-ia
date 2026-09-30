-- Noticias IA — initial schema
-- Scope: AI + robotics + AI-related manufacturing/hardware
-- Apply with Supabase CLI or SQL editor (Metaverse account).

-- Extensions
create extension if not exists "pgcrypto";

-- Profiles (tied to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- News days (one generation batch per calendar day)
create table if not exists public.news_days (
  day date primary key,
  generated_at timestamptz not null default now(),
  provider text not null default 'mock',
  item_count integer not null default 0,
  status text not null default 'ready' check (status in ('ready', 'generating', 'failed'))
);

-- News items with cross-day dedupe keys
create table if not exists public.news_items (
  id uuid primary key default gen_random_uuid(),
  day date not null references public.news_days (day) on delete cascade,
  title text not null,
  summary text,
  url text not null,
  url_hash text not null,
  normalized_title text not null,
  source_name text,
  source_host text,
  image_url text,
  focus text check (focus is null or focus in ('sector', 'producto', 'investigacion', 'tecnico')),
  impact integer check (impact is null or (impact >= 1 and impact <= 10)),
  topics text[] not null default '{}',
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Global unique dedupe: same URL or same normalized title never stored twice
create unique index if not exists news_items_url_hash_uidx
  on public.news_items (url_hash);

create unique index if not exists news_items_normalized_title_uidx
  on public.news_items (normalized_title);

create index if not exists news_items_day_idx
  on public.news_items (day desc);

create index if not exists news_items_impact_idx
  on public.news_items (impact desc nulls last);

-- Favorites
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  news_item_id uuid not null references public.news_items (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, news_item_id)
);

create index if not exists favorites_user_idx on public.favorites (user_id, created_at desc);

-- Query history
create table if not exists public.query_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  query text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists query_history_user_idx
  on public.query_history (user_id, created_at desc);

-- RLS
alter table public.profiles enable row level security;
alter table public.news_days enable row level security;
alter table public.news_items enable row level security;
alter table public.favorites enable row level security;
alter table public.query_history enable row level security;

-- Profiles: users manage own row
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id);
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id);

-- News: readable by authenticated (and anon for public feed if desired)
create policy news_days_select_authenticated on public.news_days
  for select to authenticated using (true);
create policy news_days_select_anon on public.news_days
  for select to anon using (true);

create policy news_items_select_authenticated on public.news_items
  for select to authenticated using (true);
create policy news_items_select_anon on public.news_items
  for select to anon using (true);

-- Writes to news_* go through service role (API generate endpoint)
-- No insert/update/delete policies for anon/authenticated on news tables.

-- Favorites: own rows only
create policy favorites_select_own on public.favorites
  for select using (auth.uid() = user_id);
create policy favorites_insert_own on public.favorites
  for insert with check (auth.uid() = user_id);
create policy favorites_delete_own on public.favorites
  for delete using (auth.uid() = user_id);

-- Query history: own rows only
create policy query_history_select_own on public.query_history
  for select using (auth.uid() = user_id);
create policy query_history_insert_own on public.query_history
  for insert with check (auth.uid() = user_id);
create policy query_history_delete_own on public.query_history
  for delete using (auth.uid() = user_id);
