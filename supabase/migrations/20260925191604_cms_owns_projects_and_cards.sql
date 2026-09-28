-- The CMS owns everything the site shows: projects are no longer pulled from GitHub, and the intro's hover cards
-- (github, x, linkedin) are no longer fetched from those sites. Same access model as before: the public reads
-- published rows, only the server's secret key writes.

-- ── projects ──

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  url text,
  source_url text,
  language text,
  year integer check (year between 1990 and 2100),
  sort integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_sort_idx on public.projects (sort);
create trigger projects_updated_at before update on public.projects for each row execute function public.set_updated_at();

alter table public.projects enable row level security;
revoke all on public.projects from anon, authenticated;
grant select on public.projects to anon, authenticated;
create policy "published projects are public" on public.projects
  for select to anon, authenticated
  using (published);

-- ── the intro's link hover cards: one row per site, its fields as json ──

create table public.link_cards (
  kind text primary key check (kind in ('github', 'x', 'linkedin')),
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
  updated_at timestamptz not null default now()
);

create trigger link_cards_updated_at before update on public.link_cards for each row execute function public.set_updated_at();

alter table public.link_cards enable row level security;
revoke all on public.link_cards from anon, authenticated;
grant select on public.link_cards to anon, authenticated;
create policy "link cards are public" on public.link_cards
  for select to anon, authenticated
  using (true);

-- The per-repo overrides are replaced by projects themselves (their hidden flags are carried over by the import).
