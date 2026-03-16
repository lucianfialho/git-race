-- GitHub profile stats (stars, repos, followers, languages)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS github_stats jsonb DEFAULT '{}'::jsonb;
