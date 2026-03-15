-- ============================================
-- GRAND PRIX TABLE & F1 2025 CALENDAR
-- ============================================

create type public.gp_status as enum ('upcoming', 'qualifying', 'sprint', 'race_day', 'finished');

create table public.grand_prix (
  id uuid primary key default uuid_generate_v4(),
  season_id uuid not null references public.seasons(id) on delete cascade,
  slug text unique not null,
  name text not null,
  country text not null,
  country_code text not null,
  circuit_name text not null,
  round_number int not null,
  theme_colors jsonb not null default '{}',
  has_sprint boolean default false,
  quali_start timestamptz not null,
  quali_end timestamptz not null,
  sprint_date timestamptz,
  race_date timestamptz not null,
  status public.gp_status default 'upcoming',
  created_at timestamptz default now(),

  unique(season_id, round_number)
);

-- RLS
alter table public.grand_prix enable row level security;

create policy "Grand prix are publicly readable"
  on public.grand_prix for select using (true);

create policy "Service role can manage grand_prix"
  on public.grand_prix for all using (
    auth.role() = 'service_role'
  );

-- Indexes
create index idx_gp_season_status on public.grand_prix(season_id, status);
create index idx_gp_race_date on public.grand_prix(race_date);

-- ============================================
-- SEED: F1 2025 CALENDAR
-- ============================================
-- Note: Season must exist first. This uses a DO block to find/create the season.

do $$
declare
  season_2025_id uuid;
begin
  -- Get or create 2025 season
  select id into season_2025_id from public.seasons where slug = 'season-2025';

  if season_2025_id is null then
    insert into public.seasons (name, slug, start_date, end_date, is_active)
    values ('Season 2025', 'season-2025', '2025-01-01', '2025-12-31', true)
    returning id into season_2025_id;
  end if;

  -- Round 1: Australia
  insert into public.grand_prix (season_id, slug, name, country, country_code, circuit_name, round_number, has_sprint, theme_colors, quali_start, quali_end, race_date, status)
  values (season_2025_id, 'australia-2025', 'Australian Grand Prix', 'Australia', 'AU', 'Albert Park Circuit', 1, false,
    '{"primary": "#00843D", "secondary": "#FFCD00", "accent": "#002B7F", "bg": "#0a1a0f"}'::jsonb,
    '2025-03-10T00:00:00Z', '2025-03-14T23:59:59Z', '2025-03-16T05:00:00Z', 'finished');

  -- Round 2: China (Sprint)
  insert into public.grand_prix (season_id, slug, name, country, country_code, circuit_name, round_number, has_sprint, theme_colors, quali_start, quali_end, sprint_date, race_date, status)
  values (season_2025_id, 'china-2025', 'Chinese Grand Prix', 'China', 'CN', 'Shanghai International Circuit', 2, true,
    '{"primary": "#DE2910", "secondary": "#FFDE00", "accent": "#DE2910", "bg": "#1a0a0a"}'::jsonb,
    '2025-03-17T00:00:00Z', '2025-03-21T23:59:59Z', '2025-03-22T07:00:00Z', '2025-03-23T07:00:00Z', 'finished');

  -- Round 3: Japan
  insert into public.grand_prix (season_id, slug, name, country, country_code, circuit_name, round_number, has_sprint, theme_colors, quali_start, quali_end, race_date, status)
  values (season_2025_id, 'japan-2025', 'Japanese Grand Prix', 'Japan', 'JP', 'Suzuka International Racing Course', 3, false,
    '{"primary": "#BC002D", "secondary": "#FFFFFF", "accent": "#BC002D", "bg": "#1a0a0f"}'::jsonb,
    '2025-03-31T00:00:00Z', '2025-04-04T23:59:59Z', '2025-04-06T06:00:00Z', 'finished');

  -- Round 4: Bahrain
  insert into public.grand_prix (season_id, slug, name, country, country_code, circuit_name, round_number, has_sprint, theme_colors, quali_start, quali_end, race_date, status)
  values (season_2025_id, 'bahrain-2025', 'Bahrain Grand Prix', 'Bahrain', 'BH', 'Bahrain International Circuit', 4, false,
    '{"primary": "#CE1126", "secondary": "#FFFFFF", "accent": "#CE1126", "bg": "#1a0f0a"}'::jsonb,
    '2025-04-07T00:00:00Z', '2025-04-11T23:59:59Z', '2025-04-13T15:00:00Z', 'finished');

  -- Round 5: Saudi Arabia
  insert into public.grand_prix (season_id, slug, name, country, country_code, circuit_name, round_number, has_sprint, theme_colors, quali_start, quali_end, race_date, status)
  values (season_2025_id, 'saudi-arabia-2025', 'Saudi Arabian Grand Prix', 'Saudi Arabia', 'SA', 'Jeddah Corniche Circuit', 5, false,
    '{"primary": "#006C35", "secondary": "#FFFFFF", "accent": "#006C35", "bg": "#0a1a0f"}'::jsonb,
    '2025-04-14T00:00:00Z', '2025-04-18T23:59:59Z', '2025-04-20T17:00:00Z', 'finished');

  -- Round 6: Miami (Sprint)
  insert into public.grand_prix (season_id, slug, name, country, country_code, circuit_name, round_number, has_sprint, theme_colors, quali_start, quali_end, sprint_date, race_date, status)
  values (season_2025_id, 'miami-2025', 'Miami Grand Prix', 'United States', 'US', 'Miami International Autodrome', 6, true,
    '{"primary": "#F4C300", "secondary": "#E8318A", "accent": "#00B8D4", "bg": "#0f1a1a"}'::jsonb,
    '2025-04-28T00:00:00Z', '2025-05-02T23:59:59Z', '2025-05-03T20:00:00Z', '2025-05-04T20:00:00Z', 'finished');

  -- Round 7: Emilia Romagna
  insert into public.grand_prix (season_id, slug, name, country, country_code, circuit_name, round_number, has_sprint, theme_colors, quali_start, quali_end, race_date, status)
  values (season_2025_id, 'emilia-romagna-2025', 'Emilia Romagna Grand Prix', 'Italy', 'IT', 'Autodromo Enzo e Dino Ferrari', 7, false,
    '{"primary": "#008C45", "secondary": "#CD212A", "accent": "#FFFFFF", "bg": "#0a1a0f"}'::jsonb,
    '2025-05-12T00:00:00Z', '2025-05-16T23:59:59Z', '2025-05-18T13:00:00Z', 'finished');

  -- Round 8: Monaco
  insert into public.grand_prix (season_id, slug, name, country, country_code, circuit_name, round_number, has_sprint, theme_colors, quali_start, quali_end, race_date, status)
  values (season_2025_id, 'monaco-2025', 'Monaco Grand Prix', 'Monaco', 'MC', 'Circuit de Monaco', 8, false,
    '{"primary": "#CE1126", "secondary": "#FFFFFF", "accent": "#CE1126", "bg": "#1a0a0a"}'::jsonb,
    '2025-05-19T00:00:00Z', '2025-05-23T23:59:59Z', '2025-05-25T13:00:00Z', 'finished');

  -- Round 9: Spain
  insert into public.grand_prix (season_id, slug, name, country, country_code, circuit_name, round_number, has_sprint, theme_colors, quali_start, quali_end, race_date, status)
  values (season_2025_id, 'spain-2025', 'Spanish Grand Prix', 'Spain', 'ES', 'Circuit de Barcelona-Catalunya', 9, false,
    '{"primary": "#AA151B", "secondary": "#F1BF00", "accent": "#AA151B", "bg": "#1a0f0a"}'::jsonb,
    '2025-05-26T00:00:00Z', '2025-05-30T23:59:59Z', '2025-06-01T13:00:00Z', 'finished');

  -- Round 10: Canada
  insert into public.grand_prix (season_id, slug, name, country, country_code, circuit_name, round_number, has_sprint, theme_colors, quali_start, quali_end, race_date, status)
  values (season_2025_id, 'canada-2025', 'Canadian Grand Prix', 'Canada', 'CA', 'Circuit Gilles Villeneuve', 10, false,
    '{"primary": "#FF0000", "secondary": "#FFFFFF", "accent": "#FF0000", "bg": "#1a0a0a"}'::jsonb,
    '2025-06-09T00:00:00Z', '2025-06-13T23:59:59Z', '2025-06-15T18:00:00Z', 'finished');

  -- Round 11: Austria (Sprint)
  insert into public.grand_prix (season_id, slug, name, country, country_code, circuit_name, round_number, has_sprint, theme_colors, quali_start, quali_end, sprint_date, race_date, status)
  values (season_2025_id, 'austria-2025', 'Austrian Grand Prix', 'Austria', 'AT', 'Red Bull Ring', 11, true,
    '{"primary": "#ED2939", "secondary": "#FFFFFF", "accent": "#ED2939", "bg": "#1a0a0a"}'::jsonb,
    '2025-06-23T00:00:00Z', '2025-06-27T23:59:59Z', '2025-06-28T13:00:00Z', '2025-06-29T13:00:00Z', 'finished');

  -- Round 12: Great Britain
  insert into public.grand_prix (season_id, slug, name, country, country_code, circuit_name, round_number, has_sprint, theme_colors, quali_start, quali_end, race_date, status)
  values (season_2025_id, 'great-britain-2025', 'British Grand Prix', 'Great Britain', 'GB', 'Silverstone Circuit', 12, false,
    '{"primary": "#012169", "secondary": "#C8102E", "accent": "#FFFFFF", "bg": "#0a0f1a"}'::jsonb,
    '2025-06-30T00:00:00Z', '2025-07-04T23:59:59Z', '2025-07-06T14:00:00Z', 'finished');

  -- Round 13: Belgium (Sprint)
  insert into public.grand_prix (season_id, slug, name, country, country_code, circuit_name, round_number, has_sprint, theme_colors, quali_start, quali_end, sprint_date, race_date, status)
  values (season_2025_id, 'belgium-2025', 'Belgian Grand Prix', 'Belgium', 'BE', 'Circuit de Spa-Francorchamps', 13, true,
    '{"primary": "#000000", "secondary": "#FDDA24", "accent": "#EF3340", "bg": "#1a1a0a"}'::jsonb,
    '2025-07-21T00:00:00Z', '2025-07-25T23:59:59Z', '2025-07-26T14:00:00Z', '2025-07-27T13:00:00Z', 'finished');

  -- Round 14: Hungary
  insert into public.grand_prix (season_id, slug, name, country, country_code, circuit_name, round_number, has_sprint, theme_colors, quali_start, quali_end, race_date, status)
  values (season_2025_id, 'hungary-2025', 'Hungarian Grand Prix', 'Hungary', 'HU', 'Hungaroring', 14, false,
    '{"primary": "#CE2939", "secondary": "#FFFFFF", "accent": "#477050", "bg": "#1a0a0a"}'::jsonb,
    '2025-07-28T00:00:00Z', '2025-08-01T23:59:59Z', '2025-08-03T13:00:00Z', 'upcoming');

  -- Round 15: Netherlands
  insert into public.grand_prix (season_id, slug, name, country, country_code, circuit_name, round_number, has_sprint, theme_colors, quali_start, quali_end, race_date, status)
  values (season_2025_id, 'netherlands-2025', 'Dutch Grand Prix', 'Netherlands', 'NL', 'Circuit Zandvoort', 15, false,
    '{"primary": "#FF6600", "secondary": "#FFFFFF", "accent": "#21468B", "bg": "#1a0f0a"}'::jsonb,
    '2025-08-25T00:00:00Z', '2025-08-29T23:59:59Z', '2025-08-31T13:00:00Z', 'upcoming');

  -- Round 16: Italy (Monza)
  insert into public.grand_prix (season_id, slug, name, country, country_code, circuit_name, round_number, has_sprint, theme_colors, quali_start, quali_end, race_date, status)
  values (season_2025_id, 'italy-2025', 'Italian Grand Prix', 'Italy', 'IT', 'Autodromo Nazionale di Monza', 16, false,
    '{"primary": "#008C45", "secondary": "#CD212A", "accent": "#FFFFFF", "bg": "#0a1a0f"}'::jsonb,
    '2025-09-01T00:00:00Z', '2025-09-05T23:59:59Z', '2025-09-07T13:00:00Z', 'upcoming');

  -- Round 17: Azerbaijan
  insert into public.grand_prix (season_id, slug, name, country, country_code, circuit_name, round_number, has_sprint, theme_colors, quali_start, quali_end, race_date, status)
  values (season_2025_id, 'azerbaijan-2025', 'Azerbaijan Grand Prix', 'Azerbaijan', 'AZ', 'Baku City Circuit', 17, false,
    '{"primary": "#0092BC", "secondary": "#E4002B", "accent": "#00AF66", "bg": "#0a1a1a"}'::jsonb,
    '2025-09-15T00:00:00Z', '2025-09-19T23:59:59Z', '2025-09-21T11:00:00Z', 'upcoming');

  -- Round 18: Singapore
  insert into public.grand_prix (season_id, slug, name, country, country_code, circuit_name, round_number, has_sprint, theme_colors, quali_start, quali_end, race_date, status)
  values (season_2025_id, 'singapore-2025', 'Singapore Grand Prix', 'Singapore', 'SG', 'Marina Bay Street Circuit', 18, false,
    '{"primary": "#EF3340", "secondary": "#FFFFFF", "accent": "#EF3340", "bg": "#1a0a0a"}'::jsonb,
    '2025-09-29T00:00:00Z', '2025-10-03T23:59:59Z', '2025-10-05T12:00:00Z', 'upcoming');

  -- Round 19: United States (Sprint)
  insert into public.grand_prix (season_id, slug, name, country, country_code, circuit_name, round_number, has_sprint, theme_colors, quali_start, quali_end, sprint_date, race_date, status)
  values (season_2025_id, 'usa-2025', 'United States Grand Prix', 'United States', 'US', 'Circuit of the Americas', 19, true,
    '{"primary": "#B31942", "secondary": "#0A3161", "accent": "#FFFFFF", "bg": "#0f0a1a"}'::jsonb,
    '2025-10-13T00:00:00Z', '2025-10-17T23:59:59Z', '2025-10-18T19:00:00Z', '2025-10-19T19:00:00Z', 'upcoming');

  -- Round 20: Mexico
  insert into public.grand_prix (season_id, slug, name, country, country_code, circuit_name, round_number, has_sprint, theme_colors, quali_start, quali_end, race_date, status)
  values (season_2025_id, 'mexico-2025', 'Mexico City Grand Prix', 'Mexico', 'MX', 'Autodromo Hermanos Rodriguez', 20, false,
    '{"primary": "#006847", "secondary": "#CE1126", "accent": "#FFFFFF", "bg": "#0a1a0f"}'::jsonb,
    '2025-10-20T00:00:00Z', '2025-10-24T23:59:59Z', '2025-10-26T20:00:00Z', 'upcoming');

  -- Round 21: Brazil (Sprint)
  insert into public.grand_prix (season_id, slug, name, country, country_code, circuit_name, round_number, has_sprint, theme_colors, quali_start, quali_end, sprint_date, race_date, status)
  values (season_2025_id, 'brazil-2025', 'Sao Paulo Grand Prix', 'Brazil', 'BR', 'Autodromo Jose Carlos Pace', 21, true,
    '{"primary": "#009739", "secondary": "#FEDD00", "accent": "#002776", "bg": "#0a1a0f"}'::jsonb,
    '2025-10-27T00:00:00Z', '2025-10-31T23:59:59Z', '2025-11-01T17:00:00Z', '2025-11-02T17:00:00Z', 'upcoming');

  -- Round 22: Las Vegas
  insert into public.grand_prix (season_id, slug, name, country, country_code, circuit_name, round_number, has_sprint, theme_colors, quali_start, quali_end, race_date, status)
  values (season_2025_id, 'las-vegas-2025', 'Las Vegas Grand Prix', 'United States', 'US', 'Las Vegas Strip Circuit', 22, false,
    '{"primary": "#FFD700", "secondary": "#000000", "accent": "#FF1493", "bg": "#1a1a0a"}'::jsonb,
    '2025-11-17T00:00:00Z', '2025-11-21T23:59:59Z', '2025-11-22T06:00:00Z', 'upcoming');

  -- Round 23: Qatar (Sprint)
  insert into public.grand_prix (season_id, slug, name, country, country_code, circuit_name, round_number, has_sprint, theme_colors, quali_start, quali_end, sprint_date, race_date, status)
  values (season_2025_id, 'qatar-2025', 'Qatar Grand Prix', 'Qatar', 'QA', 'Lusail International Circuit', 23, true,
    '{"primary": "#8A1538", "secondary": "#FFFFFF", "accent": "#8A1538", "bg": "#1a0a0f"}'::jsonb,
    '2025-11-24T00:00:00Z', '2025-11-28T23:59:59Z', '2025-11-29T16:00:00Z', '2025-11-30T16:00:00Z', 'upcoming');

  -- Round 24: Abu Dhabi
  insert into public.grand_prix (season_id, slug, name, country, country_code, circuit_name, round_number, has_sprint, theme_colors, quali_start, quali_end, race_date, status)
  values (season_2025_id, 'abu-dhabi-2025', 'Abu Dhabi Grand Prix', 'United Arab Emirates', 'AE', 'Yas Marina Circuit', 24, false,
    '{"primary": "#00732F", "secondary": "#FFFFFF", "accent": "#FF0000", "bg": "#0a1a0f"}'::jsonb,
    '2025-12-01T00:00:00Z', '2025-12-05T23:59:59Z', '2025-12-07T13:00:00Z', 'upcoming');

end $$;
