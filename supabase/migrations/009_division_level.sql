-- Add division_level as a simple integer field on profiles.
-- Default to 1 (F3) for all existing and new drivers.
alter table public.profiles add column if not exists division_level int default 1;

-- Backfill existing profiles based on current points thresholds.
update public.profiles set division_level = case
  when total_points >= 150 then 3
  when total_points >= 80  then 2
  else 1
end;
