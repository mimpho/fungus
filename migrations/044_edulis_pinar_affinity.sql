-- 044 — Boletus edulis: pinar weight 0.8 -> 1.0 (2026-10-26)
--
-- Correction of 043. The 0.8 for pinar was an estimate that went against the Iberian evidence
-- (in Spain B. edulis is reported mainly with Pinus sylvestris) and against field knowledge:
-- in the Pyrenees black pine, Scots pine and fir are among its best hosts. At a point near La
-- Molina (41 % pinar around it) it cut the forest factor to 0.76 where it would have been 1.0.
-- Only esp-001 changes; the other weights of 043 stay as they were.
--
-- Idempotent (jsonb_set on a fixed key). Apply in the Supabase SQL Editor after checking the
-- connection is the intended database. Rollback at the bottom.

BEGIN;

UPDATE public.species
SET extra_data = jsonb_set(extra_data, '{forest_affinity,pinar}', '1.0'::jsonb)
WHERE id = 'esp-001'
  AND scientific_name = 'Boletus edulis'
  AND extra_data ? 'forest_affinity';

-- Must return exactly 1 row, with "pinar": 1.0
SELECT id, scientific_name, extra_data -> 'forest_affinity' AS forest_affinity
FROM public.species
WHERE id = 'esp-001';

COMMIT;

-- Rollback (back to 043):
-- UPDATE public.species
-- SET extra_data = jsonb_set(extra_data, '{forest_affinity,pinar}', '0.8'::jsonb)
-- WHERE id = 'esp-001';
