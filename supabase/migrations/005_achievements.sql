-- ============================================
-- ACHIEVEMENTS
-- ============================================
create table public.achievements (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  description text not null,
  icon text not null,
  criteria jsonb not null,
  category text not null,
  created_at timestamptz default now()
);

-- ============================================
-- PROFILE ACHIEVEMENTS (unlocked)
-- ============================================
create table public.profile_achievements (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  unlocked_at timestamptz default now(),
  gp_id uuid references public.grand_prix(id),

  unique(profile_id, achievement_id)
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table public.achievements enable row level security;
alter table public.profile_achievements enable row level security;

create policy "Achievements are publicly readable"
  on public.achievements for select using (true);

create policy "Service role can manage achievements"
  on public.achievements for all using (auth.role() = 'service_role');

create policy "Profile achievements are publicly readable"
  on public.profile_achievements for select using (true);

create policy "Service role can manage profile_achievements"
  on public.profile_achievements for all using (auth.role() = 'service_role');

-- ============================================
-- INDEXES
-- ============================================
create index idx_profile_achievements_profile on public.profile_achievements(profile_id);
create index idx_profile_achievements_achievement on public.profile_achievements(achievement_id);

-- ============================================
-- SEED ACHIEVEMENTS
-- ============================================
insert into public.achievements (slug, name, description, icon, criteria, category) values
  ('pole_position', 'Pole Position', 'Qualify P1 for a Grand Prix', '🏁', '{"type": "qualifying_position", "value": 1}'::jsonb, 'qualifying'),
  ('race_winner', 'Race Winner', 'Win a Grand Prix', '🏆', '{"type": "race_position", "value": 1}'::jsonb, 'race'),
  ('podium', 'Podium Finish', 'Finish in the top 3', '🥇', '{"type": "race_position", "value": 3, "operator": "lte"}'::jsonb, 'race'),
  ('comeback_king', 'Comeback King', 'Gain 5 or more positions during a race', '🔥', '{"type": "positions_gained", "value": 5}'::jsonb, 'race'),
  ('consistency_is_key', 'Consistency is Key', 'Contribute on GitHub every day of a GP week', '📊', '{"type": "daily_streak", "value": 7}'::jsonb, 'contribution'),
  ('rain_master', 'Rain Master', 'Win a race that had rain', '🌧️', '{"type": "win_with_condition", "condition": "rain"}'::jsonb, 'race'),
  ('senna', 'Senna', 'Take 3 consecutive pole positions', '💛', '{"type": "consecutive_poles", "value": 3}'::jsonb, 'qualifying'),
  ('the_professor', 'The Professor', 'Complete 50+ code reviews in a season', '🎓', '{"type": "season_reviews", "value": 50}'::jsonb, 'contribution'),
  ('rookie_of_the_year', 'Rookie of the Year', 'Score the most points among first-season drivers', '⭐', '{"type": "best_rookie"}'::jsonb, 'season'),
  ('first_points', 'Points!', 'Score your first championship points', '✨', '{"type": "total_points", "value": 1}'::jsonb, 'race'),
  ('first_win', 'First Victory', 'Win your first ever race', '🎉', '{"type": "first_win"}'::jsonb, 'race'),
  ('hat_trick', 'Hat Trick', 'Pole position, race win, and fastest lap in the same GP', '🎩', '{"type": "hat_trick"}'::jsonb, 'race'),
  ('grand_chelem', 'Grand Chelem', 'Pole, win, fastest lap, and lead every lap', '👑', '{"type": "grand_chelem"}'::jsonb, 'race'),
  ('promotion', 'Moving Up', 'Get promoted to a higher division', '📈', '{"type": "division_promotion"}'::jsonb, 'season'),
  ('f1_champion', 'F1 Champion', 'Win the F1 division championship', '🏅', '{"type": "f1_champion"}'::jsonb, 'season'),
  ('sprint_king', 'Sprint King', 'Win 3 sprint races in a season', '⚡', '{"type": "sprint_wins", "value": 3}'::jsonb, 'race');
