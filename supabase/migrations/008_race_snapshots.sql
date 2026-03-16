-- ============================================
-- RACE SNAPSHOTS
-- Stores simulation results by GP slug so pages
-- can load persisted data instead of re-simulating.
-- ============================================
create table public.race_snapshots (
  id uuid primary key default uuid_generate_v4(),
  gp_slug text not null unique,
  qualifying_data jsonb,
  race_data jsonb,
  simulated_at timestamptz default now(),
  created_at timestamptz default now()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table public.race_snapshots enable row level security;

create policy "Race snapshots are publicly readable"
  on public.race_snapshots for select using (true);

create policy "Service role can manage race_snapshots"
  on public.race_snapshots for all using (auth.role() = 'service_role');

-- ============================================
-- INDEXES
-- ============================================
create index idx_race_snapshots_slug on public.race_snapshots(gp_slug);
