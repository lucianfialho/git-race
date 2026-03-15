-- ============================================
-- DIVISIONS
-- ============================================
create table public.divisions (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  level int not null,
  season_id uuid not null references public.seasons(id) on delete cascade,
  created_at timestamptz default now(),

  unique(season_id, level)
);

-- ============================================
-- GRIDS
-- ============================================
create table public.grids (
  id uuid primary key default uuid_generate_v4(),
  gp_id uuid not null references public.grand_prix(id) on delete cascade,
  division_id uuid not null references public.divisions(id) on delete cascade,
  created_at timestamptz default now()
);

-- ============================================
-- GRID ENTRIES (drivers in a grid)
-- ============================================
create table public.grid_entries (
  id uuid primary key default uuid_generate_v4(),
  grid_id uuid not null references public.grids(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  is_bot boolean default false,
  bot_name text,
  bot_stats jsonb,
  created_at timestamptz default now(),

  unique(grid_id, profile_id)
);

-- ============================================
-- ADD DIVISION TO PROFILES
-- ============================================
alter table public.profiles add column division_id uuid references public.divisions(id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table public.divisions enable row level security;
alter table public.grids enable row level security;
alter table public.grid_entries enable row level security;

-- Divisions: public read
create policy "Divisions are publicly readable"
  on public.divisions for select using (true);

create policy "Service role can manage divisions"
  on public.divisions for all using (auth.role() = 'service_role');

-- Grids: public read
create policy "Grids are publicly readable"
  on public.grids for select using (true);

create policy "Service role can manage grids"
  on public.grids for all using (auth.role() = 'service_role');

-- Grid entries: public read
create policy "Grid entries are publicly readable"
  on public.grid_entries for select using (true);

create policy "Service role can manage grid_entries"
  on public.grid_entries for all using (auth.role() = 'service_role');

-- ============================================
-- INDEXES
-- ============================================
create index idx_grids_gp on public.grids(gp_id);
create index idx_grids_division on public.grids(division_id);
create index idx_grid_entries_grid on public.grid_entries(grid_id);
create index idx_grid_entries_profile on public.grid_entries(profile_id);

-- ============================================
-- SEED DEFAULT DIVISIONS FOR 2025
-- ============================================
do $$
declare
  season_2025_id uuid;
begin
  select id into season_2025_id from public.seasons where slug = 'season-2025';

  if season_2025_id is not null then
    insert into public.divisions (name, level, season_id) values
      ('F3', 1, season_2025_id),
      ('F2', 2, season_2025_id),
      ('F1', 3, season_2025_id);
  end if;
end $$;
