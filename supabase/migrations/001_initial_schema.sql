-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES
-- ============================================
create table public.profiles (
  id uuid primary key default uuid_generate_v4(),
  github_id bigint unique not null,
  github_username text unique not null,
  avatar_url text,
  github_token text,
  car_color text default '#ff0000',
  car_number int,
  total_points int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-assign car number
create or replace function public.assign_car_number()
returns trigger as $$
begin
  if NEW.car_number is null then
    NEW.car_number := (select coalesce(max(car_number), 0) + 1 from public.profiles);
  end if;
  return NEW;
end;
$$ language plpgsql;

create trigger tr_assign_car_number
  before insert on public.profiles
  for each row execute function public.assign_car_number();

-- ============================================
-- ACTIVITY SNAPSHOTS
-- ============================================
create table public.activity_snapshots (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  commits_count int default 0,
  prs_opened int default 0,
  prs_merged int default 0,
  prs_reviewed int default 0,
  issues_opened int default 0,
  issues_closed int default 0,
  lines_added int default 0,
  lines_deleted int default 0,
  repos_contributed_to int default 0,
  speed_score float default 0,
  consistency_score float default 0,
  impact_score float default 0,
  synced_at timestamptz default now(),
  created_at timestamptz default now(),

  unique(profile_id, period_start, period_end)
);

-- ============================================
-- SEASONS
-- ============================================
create table public.seasons (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  start_date date not null,
  end_date date not null,
  is_active boolean default false,
  created_at timestamptz default now()
);

-- ============================================
-- RACES
-- ============================================
create type public.race_status as enum ('upcoming', 'active', 'finished');

create table public.races (
  id uuid primary key default uuid_generate_v4(),
  season_id uuid not null references public.seasons(id) on delete cascade,
  name text not null,
  slug text not null,
  race_number int not null,
  period_start timestamptz not null,
  period_end timestamptz not null,
  status public.race_status default 'upcoming',
  track_config jsonb default '{}',
  created_at timestamptz default now(),

  unique(season_id, race_number)
);

-- ============================================
-- RACE ENTRIES
-- ============================================
create table public.race_entries (
  id uuid primary key default uuid_generate_v4(),
  race_id uuid not null references public.races(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  grid_position int,
  current_position int,
  final_position int,
  lap_progress float default 0,
  speed float default 0,
  pit_stops int default 0,
  fastest_lap boolean default false,
  dnf boolean default false,
  points_earned int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  unique(race_id, profile_id)
);

-- ============================================
-- SHARE CARDS
-- ============================================
create table public.share_cards (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  race_id uuid references public.races(id) on delete set null,
  card_type text not null default 'race_result',
  image_url text,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table public.profiles enable row level security;
alter table public.activity_snapshots enable row level security;
alter table public.seasons enable row level security;
alter table public.races enable row level security;
alter table public.race_entries enable row level security;
alter table public.share_cards enable row level security;

-- Profiles: public read, own write
create policy "Profiles are publicly readable"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (
    auth.uid()::text = id::text
  );

-- Activity snapshots: public read
create policy "Activity snapshots are publicly readable"
  on public.activity_snapshots for select using (true);

-- Seasons: public read
create policy "Seasons are publicly readable"
  on public.seasons for select using (true);

-- Races: public read
create policy "Races are publicly readable"
  on public.races for select using (true);

-- Race entries: public read
create policy "Race entries are publicly readable"
  on public.race_entries for select using (true);

-- Share cards: public read, own write
create policy "Share cards are publicly readable"
  on public.share_cards for select using (true);

create policy "Users can create own share cards"
  on public.share_cards for insert with check (
    auth.uid()::text = profile_id::text
  );

-- Service role policies for cron/admin operations
create policy "Service role can manage activity_snapshots"
  on public.activity_snapshots for all using (
    auth.role() = 'service_role'
  );

create policy "Service role can manage races"
  on public.races for all using (
    auth.role() = 'service_role'
  );

create policy "Service role can manage race_entries"
  on public.race_entries for all using (
    auth.role() = 'service_role'
  );

create policy "Service role can manage seasons"
  on public.seasons for all using (
    auth.role() = 'service_role'
  );

create policy "Service role can manage profiles"
  on public.profiles for all using (
    auth.role() = 'service_role'
  );

-- ============================================
-- INDEXES
-- ============================================
create index idx_activity_profile_period on public.activity_snapshots(profile_id, period_start, period_end);
create index idx_races_season_status on public.races(season_id, status);
create index idx_race_entries_race on public.race_entries(race_id, current_position);
create index idx_race_entries_profile on public.race_entries(profile_id);
create index idx_profiles_github_username on public.profiles(github_username);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$ language plpgsql;

create trigger tr_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger tr_race_entries_updated_at
  before update on public.race_entries
  for each row execute function public.handle_updated_at();
