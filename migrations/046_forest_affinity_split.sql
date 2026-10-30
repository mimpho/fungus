-- 046 — forest_affinity per pine wood and per other broadleaf (2026-10-31)
--
-- The CREAF raster now has 11 forest classes instead of 5 (backend/app/services/forest_classes.py):
-- `pinar` is split into pinar_carrasco, pinar_silvestre, pinar_pinassa, pinar_negro and
-- pinar_otros, and `otro` into castanar, ribera and caducifolio_otro. In a forest_affinity,
-- `pinar` and `otro` still work as GROUPS: a weight on the group counts for each of its classes
-- that has none of its own. So species NOT touched here behave exactly as before.
--
-- This migration replaces the group weights by per-class weights for the species where the
-- distinction matters. Keys other than `pinar` / `otro` are kept as they are (encinar, hayedo,
-- robledal). Values are ESTIMATES approved by Marcos on 2026-10-30, NOT measured: see
-- claude/propuesta-clases-bosque.md in the Project. For the other species the pinassa column copies
-- the Scots pine one (no data to tell them apart). For B. edulis (esp-001), after Marcos's field
-- knowledge: Aleppo pine 0.1 (no source in the literature found, and a weighted share of 0.1 is
-- already factor 0 in a pure Aleppo pixel), pinassa 0.7 (moderate host; altitude and calcareous
-- soil are penalised again by their own factors, so not lower), Scots and mountain pine 1.0.
-- 2026-10-31, from a second table Marcos brought (an AI text, no sources, taken as a hypothesis):
-- pinophilus carrasco 0.5 -> 0.3 (hosts named: Scots and mountain pine); deliciosus carrasco
-- 1.0 -> 0.8 and otros 1.0 (maritime pine named as host); sanguifluus carrasco 0.8 -> 1.0 (warm
-- Mediterranean pine woods) and negro 0.7 -> 0.5. Acid or calcareous soil is left to the soil factor.
--
-- Included: esp-001 edulis, 002 aereus, 004 reticulatus, 005 badia, 048 cornucopioides (its
-- `pinar` 0.3 stays as a group weight), 055 caesarea (same, `pinar` 0.2), 086 melanosporum,
-- 201 regius, and the three pine-only species 003 pinophilus, 035 deliciosus and 036 sanguifluus
-- (forest_types is only `pinar`, so their affinity is the five pine classes).
-- Not included: R. virescens, R. cyanoxantha and C. cibarius (their base forest_affinity was never
-- applied); every species with no proposal.
-- forest_types is NOT touched.
--
-- Idempotent (drops the group keys and merges the per-class ones). Apply in the Supabase SQL
-- Editor AFTER the new raster and backend are deployed (an old backend drops the new keys and
-- falls back to forest_types for these species), and after checking the connection is the
-- intended database. Rollback at the bottom.

BEGIN;

UPDATE public.species s
SET extra_data = jsonb_set(
      COALESCE(s.extra_data, '{}'::jsonb),
      '{forest_affinity}',
      (COALESCE(s.extra_data -> 'forest_affinity', '{}'::jsonb) - v.drop_keys) || v.children::jsonb
    )
FROM (VALUES
  ('esp-001', 'Boletus edulis', ARRAY['pinar', 'otro'],
   '{"pinar_carrasco": 0.1, "pinar_silvestre": 1.0, "pinar_pinassa": 0.7, "pinar_negro": 1.0, "pinar_otros": 0.5, "castanar": 0.9, "ribera": 0.2, "caducifolio_otro": 0.8}'),
  ('esp-002', 'Boletus aereus', ARRAY['otro'],
   '{"castanar": 0.8, "ribera": 0.2, "caducifolio_otro": 0.5}'),
  ('esp-003', 'Boletus pinophilus', ARRAY['pinar'],
   '{"pinar_carrasco": 0.3, "pinar_silvestre": 1.0, "pinar_pinassa": 1.0, "pinar_negro": 1.0, "pinar_otros": 0.8}'),
  ('esp-004', 'Boletus reticulatus', ARRAY['otro'],
   '{"castanar": 0.9, "ribera": 0.2, "caducifolio_otro": 0.7}'),
  ('esp-005', 'Imleria badia', ARRAY['pinar', 'otro'],
   '{"pinar_carrasco": 0.3, "pinar_silvestre": 1.0, "pinar_pinassa": 1.0, "pinar_negro": 0.9, "pinar_otros": 0.7, "castanar": 0.5, "ribera": 0.1, "caducifolio_otro": 0.4}'),
  ('esp-035', 'Lactarius deliciosus', ARRAY['pinar'],
   '{"pinar_carrasco": 0.8, "pinar_silvestre": 1.0, "pinar_pinassa": 1.0, "pinar_negro": 0.6, "pinar_otros": 1.0}'),
  ('esp-036', 'Lactarius sanguifluus', ARRAY['pinar'],
   '{"pinar_carrasco": 1.0, "pinar_silvestre": 1.0, "pinar_pinassa": 1.0, "pinar_negro": 0.5, "pinar_otros": 0.7}'),
  ('esp-048', 'Craterellus cornucopioides', ARRAY['otro'],
   '{"castanar": 0.7, "ribera": 0.5, "caducifolio_otro": 0.9}'),
  ('esp-055', 'Amanita caesarea', ARRAY['otro'],
   '{"castanar": 0.9, "ribera": 0.1, "caducifolio_otro": 0.3}'),
  ('esp-086', 'Tuber melanosporum', ARRAY['otro'],
   '{"castanar": 0.1, "ribera": 0.1, "caducifolio_otro": 0.6}'),
  ('esp-201', 'Butyriboletus regius', ARRAY['otro'],
   '{"castanar": 0.6, "ribera": 0.1, "caducifolio_otro": 0.4}')
) AS v(id, name, drop_keys, children)
WHERE s.id = v.id AND s.scientific_name = v.name;

-- Must return exactly 11 rows, none with a "pinar" or "otro" key except esp-048 / esp-055 ("pinar")
SELECT id, scientific_name, extra_data -> 'forest_affinity' AS forest_affinity
FROM public.species
WHERE id IN ('esp-001', 'esp-002', 'esp-003', 'esp-004', 'esp-005', 'esp-035', 'esp-036',
             'esp-048', 'esp-055', 'esp-086', 'esp-201')
ORDER BY id;

COMMIT;

-- Rollback (back to the group weights of 042-044; the three pine-only species had no affinity):
-- UPDATE public.species s
-- SET extra_data = jsonb_set(s.extra_data, '{forest_affinity}', v.affinity::jsonb)
-- FROM (VALUES
--   ('esp-001', '{"pinar": 1.0, "encinar": 0.5, "hayedo": 1.0, "robledal": 1.0, "otro": 0.9}'),
--   ('esp-002', '{"robledal": 1.0, "encinar": 1.0, "hayedo": 0.6, "otro": 0.8}'),
--   ('esp-004', '{"encinar": 0.8, "hayedo": 0.4, "robledal": 1.0, "otro": 0.8}'),
--   ('esp-005', '{"pinar": 1.0, "hayedo": 0.5, "robledal": 0.4, "otro": 0.4}'),
--   ('esp-048', '{"pinar": 0.3, "encinar": 0.4, "hayedo": 1.0, "robledal": 0.9, "otro": 0.8}'),
--   ('esp-055', '{"pinar": 0.2, "encinar": 1.0, "hayedo": 0.3, "robledal": 1.0, "otro": 0.6}'),
--   ('esp-086', '{"encinar": 1.0, "robledal": 1.0, "otro": 0.6}'),
--   ('esp-201', '{"encinar": 0.8, "hayedo": 0.5, "robledal": 1.0, "otro": 0.5}')
-- ) AS v(id, affinity) WHERE s.id = v.id;
-- UPDATE public.species SET extra_data = extra_data - 'forest_affinity'
-- WHERE id IN ('esp-003', 'esp-035', 'esp-036');
