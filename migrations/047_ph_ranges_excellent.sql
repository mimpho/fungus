-- 047 - soil pH ranges of five excellent mycorrhizal species (2026-11-01)
--
-- Follows 045 (B. edulis). Decisions approved by Marcos on 2026-11-01 from the audit draft
-- claude/auditoria-ph-excelentes.md (Project), checked against the substrate rasters:
--
--   esp-002 B. aereus            5.5-7.0 -> 4.5-7.0  Bohus 1973 (acidophilous group) + Olaizola 2023;
--                                                    chestnut stands (castanar weight 0.8 in 046) sit
--                                                    on ~84 % acid substrate, soil factor 0.54 -> 0.99
--   esp-035 L. deliciosus        5.0-6.5 -> 5.0-7.5  one strain from a P. pinaster stand, soil pH 7.2
--                                                    (Olaizola 2023) + a general source; weak evidence,
--                                                    kept so that calcareous pine woods are not ~0
--   esp-036 L. sanguifluus       5.0-7.0 -> 5.0-8.0  calcareous preference only; the audit's proposed
--                                                    minimum of 5.5 has no source and is NOT applied
--   esp-045 C. cibarius          5.0-6.5 -> 4.0-6.5  Bohus 1973 (soils of pH 4.0-4.2) + Kirov
--   esp-048 C. cornucopioides    5.0-6.5 -> 4.5-7.5  IUCN (calcareous) + Bohus 1973 (pH 4.1-4.7);
--                                                    4.5 and 4.0 are equivalent for the model
--
-- NOT changed: esp-003 B. pinophilus (the only field value, a strain soil of pH 5.2, is already
-- inside 5.0-6.0; the rest is in vitro tolerance).
-- The catalogue ranges are in vitro or single-site evidence, not measured field ranges.
--
-- Safe to re-run: each species is matched only if its current range is either the old one (the
-- audit's) or the new one; if the catalogue differs from the audit for any of the five, the
-- block raises an error and NOTHING is changed. Apply in the Supabase SQL Editor after checking
-- the connection is the intended database. Rollback at the bottom.

BEGIN;

DO $$
DECLARE
  n integer;
BEGIN
  UPDATE public.species s
  SET extra_data = COALESCE(s.extra_data, '{}'::jsonb)
                   || jsonb_build_object('ph_suelo_min', v.new_min, 'ph_suelo_max', v.new_max)
  FROM (VALUES
    ('esp-002', 'Boletus aereus',           5.5, 7.0, 4.5, 7.0),
    ('esp-035', 'Lactarius deliciosus',     5.0, 6.5, 5.0, 7.5),
    ('esp-036', 'Lactarius sanguifluus',    5.0, 7.0, 5.0, 8.0),
    ('esp-045', 'Cantharellus cibarius',    5.0, 6.5, 4.0, 6.5),
    ('esp-048', 'Craterellus cornucopioides', 5.0, 6.5, 4.5, 7.5)
  ) AS v(id, name, old_min, old_max, new_min, new_max)
  WHERE s.id = v.id
    AND s.scientific_name = v.name
    AND (
      ((s.extra_data ->> 'ph_suelo_min')::numeric = v.old_min
        AND (s.extra_data ->> 'ph_suelo_max')::numeric = v.old_max)
      OR
      ((s.extra_data ->> 'ph_suelo_min')::numeric = v.new_min
        AND (s.extra_data ->> 'ph_suelo_max')::numeric = v.new_max)
    );
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 5 THEN
    RAISE EXCEPTION '047: expected 5 species to match, got % (catalogue differs from the audit; nothing was changed)', n;
  END IF;
END $$;

-- Must return exactly 5 rows with the new ranges
SELECT id, scientific_name,
       extra_data -> 'ph_suelo_min' AS ph_min,
       extra_data -> 'ph_suelo_max' AS ph_max
FROM public.species
WHERE id IN ('esp-002', 'esp-035', 'esp-036', 'esp-045', 'esp-048')
ORDER BY id;

COMMIT;

-- Rollback (back to the audit's ranges):
-- UPDATE public.species s
-- SET extra_data = s.extra_data || jsonb_build_object('ph_suelo_min', v.old_min, 'ph_suelo_max', v.old_max)
-- FROM (VALUES
--   ('esp-002', 5.5, 7.0), ('esp-035', 5.0, 6.5), ('esp-036', 5.0, 7.0),
--   ('esp-045', 5.0, 6.5), ('esp-048', 5.0, 6.5)
-- ) AS v(id, old_min, old_max)
-- WHERE s.id = v.id;
