-- 042 — forest_affinity for Boletus aereus (esp-002), first species with per-class weights
--
-- species.extra_data.forest_affinity = how well the species fruits under each forest class of
-- the CREAF raster (pinar, encinar, hayedo, robledal, otro), 0-1. When present it replaces what
-- forest_types says for the Observatory's forest factor (backend/app/services/forest_classes.py);
-- species without it behave exactly as before. No schema change: extra_data is JSONB.
--
-- PLACEHOLDER VALUES, to be confirmed by Marcos from field knowledge (not measured data):
--   robledal 1.0, encinar 1.0   oaks: the main host in the literature
--   hayedo   0.6                beech: a host too; 0.6 is the starting hypothesis
--   otro     0.8                mixed class that holds chestnut (a host) and trees that are not
--                               (riparian, birch...): approximate until the raster splits it
-- forest_types gains 'hayedo' so the zone filters and the v1 zone lists also include it.
--
-- Idempotent (UPDATE by id). Apply in the Supabase SQL Editor. Check first that the connection
-- is the intended database. Rollback at the bottom.

BEGIN;

UPDATE public.species
SET forest_types = ARRAY['encinar', 'robledal', 'hayedo'],
    extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
      'forest_affinity',
      '{"robledal": 1.0, "encinar": 1.0, "hayedo": 0.6, "otro": 0.8}'::jsonb
    )
WHERE id = 'esp-002' AND scientific_name = 'Boletus aereus';

-- Must return exactly 1 row
SELECT id, scientific_name, forest_types, extra_data -> 'forest_affinity' AS forest_affinity
FROM public.species
WHERE id = 'esp-002';

COMMIT;

-- Rollback (back to the previous state):
-- UPDATE public.species
-- SET forest_types = ARRAY['encinar', 'robledal'],
--     extra_data = extra_data - 'forest_affinity'
-- WHERE id = 'esp-002';
