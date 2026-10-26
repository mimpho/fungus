-- 045 — Boletus edulis: soil pH range 5.5-6.5 -> 4.5-6.5 (2026-10-26)
--
-- The catalogue range left out the acid soils where the species is found in the Pyrenees: at a
-- point near La Molina (100 % acid substrate: slate and granite) the soil factor was 0.46, and
-- the same factor would apply to any acid soil. Evidence for the new lower bound:
--   - a strain of B. edulis from Torla (Huesca), under Pinus uncinata, comes from a soil of
--     pH 5.1 (Olaizola et al. 2023, Bioagro 35(2); in vitro growth from pH 2.5 to 7.5);
--   - field survey in Hungary: B. edulis among the acidophilous species, fruiting on soils of
--     pH 4.0-6.0 (Bohus 1973);
--   - Sweden, soil DNA: higher pH negatively associated with Boletaceae (van Lent 2026).
-- The upper bound stays at 6.5. See the draft table "ph_audit_borrador.xlsx" for the other
-- species: only esp-001 changes here.
--
-- Idempotent (jsonb merge on fixed keys). Apply in the Supabase SQL Editor after checking the
-- connection is the intended database. Rollback at the bottom.

BEGIN;

UPDATE public.species
SET extra_data = COALESCE(extra_data, '{}'::jsonb)
                 || '{"ph_suelo_min": 4.5, "ph_suelo_max": 6.5}'::jsonb
WHERE id = 'esp-001' AND scientific_name = 'Boletus edulis';

-- Must return exactly 1 row, with 4.5 and 6.5
SELECT id, scientific_name,
       extra_data -> 'ph_suelo_min' AS ph_min,
       extra_data -> 'ph_suelo_max' AS ph_max
FROM public.species
WHERE id = 'esp-001';

COMMIT;

-- Rollback (back to the previous range):
-- UPDATE public.species
-- SET extra_data = extra_data || '{"ph_suelo_min": 5.5, "ph_suelo_max": 6.5}'::jsonb
-- WHERE id = 'esp-001';
