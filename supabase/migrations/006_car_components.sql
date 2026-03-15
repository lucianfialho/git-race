-- ============================================
-- CAR STATS ON PROFILES
-- ============================================
alter table public.profiles add column car_stats jsonb default '{"power_unit": 0, "aero": 0, "reliability": 0, "tire_mgmt": 0, "strategy": 0}'::jsonb;
alter table public.profiles add column rival_id uuid references public.profiles(id);

-- ============================================
-- COMPONENT SCORES ON ACTIVITY SNAPSHOTS
-- ============================================
alter table public.activity_snapshots add column power_unit_score float default 0;
alter table public.activity_snapshots add column aero_score float default 0;
alter table public.activity_snapshots add column reliability_score float default 0;
alter table public.activity_snapshots add column tire_mgmt_score float default 0;
alter table public.activity_snapshots add column strategy_score float default 0;
