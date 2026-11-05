-- 048 - forest_affinity per class for R. virescens, R. cyanoxantha and C. cibarius (2026-11-02)
--
-- These three never had a forest_affinity (they used forest_types), so this is their base
-- affinity and its split over the 11 raster classes in one step. Weights are ESTIMATES approved
-- by Marcos on 2026-11-02, not measurements. Table and reasoning: claude/propuesta-clases-bosque.md
-- and claude/pesos-bosque-excelentes.md in the Project. What backs each weight:
--
--   esp-023 R. virescens    robledal 1.0 / hayedo 0.4: Bioimages (British checklist) gives Quercus as
--                           main host and Fagus as minor, both uncertain. encinar 0.6, castanar 0.8,
--                           caducifolio_otro 0.5, ribera 0.2: judgement, no source found.
--   esp-024 R. cyanoxantha  hayedo 1.0, robledal 0.8 (was 0.6 in the catalogue): Bioimages lists Fagus
--                           and Quercus as main hosts; JGI describes it with beech, hornbeam, oak and
--                           spruce. castanar 0.5 and caducifolio_otro 0.5: Castanea and Betula as
--                           minor hosts (Bioimages). ribera 0.2: judgement. No encinar or pinar: no
--                           data found for evergreen oak or Mediterranean pines.
--   esp-045 C. cibarius     pinar_silvestre 1.0: it is one of the four main edible species in a Scots
--                           pine stand of the NE Iberian Peninsula (Martinez-Pena et al. 2012) and
--                           Kirov places it mostly in pine woods. pinassa, negro and otros 0.6: no
--                           data, previous group weight kept. carrasco 0.3: no data for Aleppo pine,
--                           in line with how B. pinophilus and I. badia were treated. encinar 0.4: one
--                           Catalan holm-oak record, but Mediterranean oak chanterelles were lumped
--                           under cibarius before C. ilicis was described (2008). hayedo 1.0 and
--                           robledal 1.0: iNaturalist guide and Moore 1989. castanar 0.9,
--                           caducifolio_otro 0.8, ribera 0.2: judgement.
--
-- forest_types is NOT touched (with a forest_affinity the backend uses the affinity for the forest
-- factor; forest_types only matters where the raster is missing).
--
-- Apply AFTER the new back end and the rasters are deployed, like 046: an old back end drops the
-- keys it does not know (castanar, ribera, caducifolio_otro, pinar_*). Safe to re-run: a species is
-- matched only if it has no forest_affinity yet or already has exactly this one; if any of the
-- three has a different one, the block raises an error and NOTHING is changed. Check the connection
-- is the intended database first. Rollback at the bottom.

BEGIN;

DO $$
DECLARE
  n integer;
BEGIN
  UPDATE public.species s
  SET extra_data = COALESCE(s.extra_data, '{}'::jsonb)
                   || jsonb_build_object('forest_affinity', v.affinity::jsonb)
  FROM (VALUES
    ('esp-023', 'Russula virescens',
     '{"robledal": 1.0, "hayedo": 0.4, "encinar": 0.6, "castanar": 0.8, "ribera": 0.2, "caducifolio_otro": 0.5}'),
    ('esp-024', 'Russula cyanoxantha',
     '{"hayedo": 1.0, "robledal": 0.8, "castanar": 0.5, "ribera": 0.2, "caducifolio_otro": 0.5}'),
    ('esp-045', 'Cantharellus cibarius',
     '{"pinar_carrasco": 0.3, "pinar_silvestre": 1.0, "pinar_pinassa": 0.6, "pinar_negro": 0.6, "pinar_otros": 0.6, "encinar": 0.4, "hayedo": 1.0, "robledal": 1.0, "castanar": 0.9, "ribera": 0.2, "caducifolio_otro": 0.8}')
  ) AS v(id, name, affinity)
  WHERE s.id = v.id
    AND s.scientific_name = v.name
    AND (
      (s.extra_data -> 'forest_affinity') IS NULL
      OR (s.extra_data -> 'forest_affinity') = v.affinity::jsonb
    );
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 3 THEN
    RAISE EXCEPTION '048: expected 3 species to match, got % (one already has a different forest_affinity or the id/name differs; nothing was changed)', n;
  END IF;
END $$;

-- Must return exactly 3 rows with the new affinity
SELECT id, scientific_name, extra_data -> 'forest_affinity' AS forest_affinity
FROM public.species
WHERE id IN ('esp-023', 'esp-024', 'esp-045')
ORDER BY id;

COMMIT;

-- Rollback (these three had no forest_affinity before; they go back to forest_types):
-- UPDATE public.species
-- SET extra_data = extra_data - 'forest_affinity'
-- WHERE id IN ('esp-023', 'esp-024', 'esp-045');
