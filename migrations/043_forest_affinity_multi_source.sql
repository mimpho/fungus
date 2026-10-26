-- 043 — forest_affinity for the species whose hosts several sources agree on (2026-10-25)
--
-- species.extra_data.forest_affinity = how well the species fruits under each forest class of
-- the CREAF raster (pinar, encinar, hayedo, robledal, otro), 0-1; when present it replaces what
-- forest_types says for the Observatory's forest factor (see 042 and
-- backend/app/services/forest_classes.py). A missing class counts 0.
--
-- Which trees are hosts comes from the literature (IUCN Red List assessments, Bioimages, fungi.fr,
-- Van der Linde 2004, Sydowia, ...; see the draft table forest_affinity_borrador.xlsx). The
-- numbers 0-1 are a split made from that information, NOT measured: GBIF has too few precise
-- records in Catalonia to measure them (394 for Boletus edulis, 173 for B. aereus). Review them
-- against field knowledge; any of them can be changed with one UPDATE.
--
-- Not included on purpose:
--   esp-002 Boletus aereus           already in 042
--   esp-003/035/036 pinophilus, deliciosus, sanguifluus (pines only: same as today)
--   every species with a single source or none, and saprotrophs: unchanged
-- forest_types is NOT touched here, so zone filters and the v1 lists stay as they are.
--
-- Idempotent (UPDATE by id and name). Apply in the Supabase SQL Editor after checking the
-- connection is the intended database. Rollback at the bottom.

BEGIN;

UPDATE public.species s
SET extra_data = COALESCE(s.extra_data, '{}'::jsonb)
                 || jsonb_build_object('forest_affinity', v.affinity::jsonb)
FROM (VALUES
  ('esp-001', 'Boletus edulis',
   '{"pinar": 0.8, "encinar": 0.5, "hayedo": 1.0, "robledal": 1.0, "otro": 0.9}'),
  ('esp-004', 'Boletus reticulatus',
   '{"encinar": 0.8, "hayedo": 0.4, "robledal": 1.0, "otro": 0.8}'),
  ('esp-005', 'Imleria badia',
   '{"pinar": 1.0, "hayedo": 0.5, "robledal": 0.4, "otro": 0.4}'),
  ('esp-048', 'Craterellus cornucopioides',
   '{"pinar": 0.3, "encinar": 0.4, "hayedo": 1.0, "robledal": 0.9, "otro": 0.8}'),
  ('esp-055', 'Amanita caesarea',
   '{"pinar": 0.2, "encinar": 1.0, "hayedo": 0.3, "robledal": 1.0, "otro": 0.6}'),
  ('esp-086', 'Tuber melanosporum',
   '{"encinar": 1.0, "robledal": 1.0, "otro": 0.6}'),
  ('esp-201', 'Butyriboletus regius',
   '{"encinar": 0.8, "hayedo": 0.5, "robledal": 1.0, "otro": 0.5}')
) AS v(id, name, affinity)
WHERE s.id = v.id AND s.scientific_name = v.name;

-- Must return exactly 7 rows
SELECT id, scientific_name, extra_data -> 'forest_affinity' AS forest_affinity
FROM public.species
WHERE id IN ('esp-001', 'esp-004', 'esp-005', 'esp-048', 'esp-055', 'esp-086', 'esp-201')
ORDER BY id;

COMMIT;

-- Rollback (back to forest_types alone):
-- UPDATE public.species
-- SET extra_data = extra_data - 'forest_affinity'
-- WHERE id IN ('esp-001', 'esp-004', 'esp-005', 'esp-048', 'esp-055', 'esp-086', 'esp-201');
