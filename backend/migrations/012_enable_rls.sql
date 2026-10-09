-- Migration 012: Enable Row Level Security on all public tables
-- 2026-06-17
--
-- Context: All tables had RLS disabled, making them publicly accessible
-- via the Supabase anon key. The Fungus backend uses the service_role key
-- exclusively, which bypasses RLS — so enabling RLS with no additional
-- anon policies closes the exposure without any code changes.
--
-- Run this in the Supabase SQL editor or via psql.

ALTER TABLE public.alembic_version         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.climate_history         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mushroom_visual_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores_cache            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.species                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_fav_species        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_followed_zones     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_cache           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_stations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones                   ENABLE ROW LEVEL SECURITY;
