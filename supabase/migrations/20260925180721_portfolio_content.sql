-- The portfolio's content: experience, writing, photo trips, and per-repo settings for the GitHub projects.
-- The public site reads published rows with the publishable key (RLS below). Only the server writes, from /admin,
-- with the secret key, which bypasses RLS. No write access is granted to anon or authenticated.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── experience: jobs and education ──

create table public.experience (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'work' check (kind in ('work', 'education')),
  title text not null,
  org text not null,
  org_url text,
  location text,
  period text not null,
  summary text,
  highlights jsonb not null default '[]'::jsonb check (jsonb_typeof(highlights) = 'array'),
  sort integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index experience_sort_idx on public.experience (sort);

-- ── writing ──

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  description text not null default '',
  body text not null default '',
  published_at timestamptz not null default now(),
  draft boolean not null default true,
  tags text[] not null default '{}',
  answers text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index posts_published_at_idx on public.posts (published_at desc);

-- ── photos, grouped by trip ──

create table public.trips (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  place text not null,
  start_date date not null,
  end_date date,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.photos (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  -- Object path in the public "photos" storage bucket.
  path text not null,
  alt text not null default '',
  sort integer not null default 0,
  created_at timestamptz not null default now()
);

create index photos_trip_id_idx on public.photos (trip_id, sort);

-- ── projects: GitHub is the source; this only hides, orders, or rewords a repo ──

create table public.project_settings (
  repo_name text primary key,
  hidden boolean not null default false,
  sort integer,
  blurb text,
  updated_at timestamptz not null default now()
);

create trigger experience_updated_at before update on public.experience for each row execute function public.set_updated_at();
create trigger posts_updated_at before update on public.posts for each row execute function public.set_updated_at();
create trigger trips_updated_at before update on public.trips for each row execute function public.set_updated_at();
create trigger project_settings_updated_at before update on public.project_settings for each row execute function public.set_updated_at();

-- ── access: everyone can read what's published; nobody but the server's secret key can write ──

alter table public.experience enable row level security;
alter table public.posts enable row level security;
alter table public.trips enable row level security;
alter table public.photos enable row level security;
alter table public.project_settings enable row level security;

revoke all on public.experience, public.posts, public.trips, public.photos, public.project_settings from anon, authenticated;
grant select on public.experience, public.posts, public.trips, public.photos, public.project_settings to anon, authenticated;

create policy "published experience is public" on public.experience
  for select to anon, authenticated
  using (published);

create policy "published posts are public" on public.posts
  for select to anon, authenticated
  using (not draft);

create policy "published trips are public" on public.trips
  for select to anon, authenticated
  using (published);

create policy "photos of published trips are public" on public.photos
  for select to anon, authenticated
  using (exists (select 1 from public.trips t where t.id = trip_id and t.published));

create policy "project settings are public" on public.project_settings
  for select to anon, authenticated
  using (true);

-- Photos are served straight from a public bucket; uploads go through the server with the secret key.
insert into storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
values ('photos', 'photos', true, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'], 15728640)
on conflict (id) do nothing;
