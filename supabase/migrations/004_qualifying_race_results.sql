-- ============================================
-- QUALIFYING RESULTS
-- ============================================
create table public.qualifying_results (
  id uuid primary key default uuid_generate_v4(),
  gp_id uuid not null references public.grand_prix(id) on delete cascade,
  grid_id uuid not null references public.grids(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  is_bot boolean default false,
  bot_name text,
  q1_time float,
  q2_time float,
  q3_time float,
  final_position int not null,
  eliminated_in text,
  created_at timestamptz default now(),

  unique(gp_id, grid_id, profile_id)
);

-- ============================================
-- RACE RESULTS
-- ============================================
create table public.race_results (
  id uuid primary key default uuid_generate_v4(),
  gp_id uuid not null references public.grand_prix(id) on delete cascade,
  grid_id uuid not null references public.grids(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  is_bot boolean default false,
  bot_name text,
  grid_position int not null,
  final_position int,
  points_earned int default 0,
  fastest_lap boolean default false,
  dnf boolean default false,
  dnf_lap int,
  dnf_reason text,
  gap_to_leader float default 0,
  events_log jsonb default '[]'::jsonb,
  is_sprint boolean default false,
  created_at timestamptz default now(),

  unique(gp_id, profile_id, is_sprint)
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table public.qualifying_results enable row level security;
alter table public.race_results enable row level security;

create policy "Qualifying results are publicly readable"
  on public.qualifying_results for select using (true);

create policy "Service role can manage qualifying_results"
  on public.qualifying_results for all using (auth.role() = 'service_role');

create policy "Race results are publicly readable"
  on public.race_results for select using (true);

create policy "Service role can manage race_results"
  on public.race_results for all using (auth.role() = 'service_role');

-- ============================================
-- INDEXES
-- ============================================
create index idx_qualifying_gp on public.qualifying_results(gp_id, final_position);
create index idx_qualifying_grid on public.qualifying_results(grid_id);
create index idx_qualifying_profile on public.qualifying_results(profile_id);

create index idx_race_results_gp on public.race_results(gp_id, final_position);
create index idx_race_results_grid on public.race_results(grid_id);
create index idx_race_results_profile on public.race_results(profile_id);
create index idx_race_results_sprint on public.race_results(gp_id, is_sprint);
