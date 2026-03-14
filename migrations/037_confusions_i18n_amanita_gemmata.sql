-- =============================================================================
-- 037_confusions_i18n_amanita_gemmata.sql
-- Adds diff_ca / diff_en to all confusion entries from 012_confusions_amanita_gemmata.sql
-- Full replacement per species.
--
-- Amanita gemmata (esp-066): new species in 012, no prior confusions.
-- Amanita muscaria (esp-056): had 1 entry from 031 (vs caesarea).
--   Here we do a FULL REPLACEMENT including both entries:
--   - vs esp-055 Amanita caesarea (from 006/031)
--   - vs esp-066 Amanita gemmata (from 012, bidirectional)
-- Amanita pantherina (esp-060): had 4 entries from 031 (rubescens, excelsa, spissa, gemmata).
--   Already covered in 031 — the gemmata entry was included there (esp-066).
--   031 was generated with full content from migration 006 plus gemmata from 012.
--   NO update needed here for pantherina or citrina.
-- =============================================================================

-- esp-066  Amanita gemmata (new: no confusions existed before 012)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-056',
    'diff',    'A. muscaria tiene forma roja típica, pero su forma amarilla (f. aureola/f. formosa) es muy similar a gemmata. muscaria suele ser mayor, con sombrero más vivo y pie más robusto. Ambas tóxicas (muscimol): síndrome panteriniano con efectos neurológicos.',
    'diff_ca', 'A. muscaria té forma roja típica, però la seva forma groga (f. aureola/f. formosa) és molt similar a gemmata. muscaria sol ser major, amb barret més viu i peu més robust. Ambdues tòxiques (muscimol): síndrome panterinià amb efectes neurològics.',
    'diff_en', 'A. muscaria has a typical red form, but its yellow form (f. aureola/f. formosa) is very similar to gemmata. muscaria is usually larger, with a more vivid cap and more robust stem. Both toxic (muscimol): pantherina syndrome with neurological effects.'),
  jsonb_build_object('with_species_id', 'esp-060',
    'diff',    'A. pantherina tiene sombrero pardo-grisáceo (no amarillo), anillo estriado por encima y volva con crestas concéntricas. Más tóxica que gemmata — el síndrome panteriniano puede ser grave. Nunca consumir ninguna de las dos.',
    'diff_ca', 'A. pantherina té barret marró-grisós (no groc), anell estriat per sobre i volva amb crestes concèntriques. Més tòxica que gemmata — el síndrome panterinià pot ser greu. Mai consumir cap de les dues.',
    'diff_en', 'A. pantherina has a grayish-brown cap (not yellow), a striate ring on the upper surface, and a volva with concentric crests. More toxic than gemmata — pantherina syndrome can be severe. Never consume either.'),
  jsonb_build_object('with_species_id', 'esp-065',
    'diff',    'A. citrina tiene sombrero amarillo-limón a blanquecino con olor a patata cruda (harinoso). Anillo amplio colgante, volva en copa bien definida. Menos peligrosa (precaución), pero la confusión con gemmata induce a subestimar el riesgo.',
    'diff_ca', 'A. citrina té barret groc-llimona a blanquinós amb olor a patata crua (farinós). Anell ampli penjant, volva en copa ben definida. Menys perillosa (precaució), però la confusió amb gemmata indueix a subestimar el risc.',
    'diff_en', 'A. citrina has a lemon-yellow to whitish cap with a raw potato smell (floury). Wide hanging ring, well-defined cup-shaped volva. Less dangerous (caution), but confusion with gemmata leads to underestimating the risk.')
)) WHERE scientific_name = 'Amanita gemmata';

-- esp-056  Amanita muscaria — FULL REPLACEMENT (includes caesarea from 006/031 + gemmata from 012)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-055',
    'diff',    'A. caesarea tiene sombrero naranja-rojizo sin escamas blancas (o muy pocas), volva en forma de copa abierta amarillenta, laminillas y pie amarillo-dorados. El ovo siempre amarillo por dentro. Excelente comestible.',
    'diff_ca', 'A. caesarea té barret taronja-rogenc sense escames blanques (o molt poques), volva en forma de copa oberta groguenca, làmines i peu groc-daurats. L''ou sempre groc per dins. Excel·lent comestible.',
    'diff_en', 'A. caesarea has an orange-reddish cap without white scales (or very few), a yellowish open cup-shaped volva, and golden-yellow gills and stem. The egg is always yellow inside. Excellent edible.'),
  jsonb_build_object('with_species_id', 'esp-066',
    'diff',    'A. gemmata tiene sombrero amarillo-ocre pálido, más pequeña y con pie más frágil. La forma amarilla de muscaria (f. aureola) puede confundirse fácilmente. Ambas tóxicas (muscimol). Verrugas blancas presentes en ambas, fácilmente lavables por la lluvia.',
    'diff_ca', 'A. gemmata té barret groc-ocre pàl·lid, més petita i amb peu més fràgil. La forma groga de muscaria (f. aureola) pot confondre''s fàcilment. Ambdues tòxiques (muscimol). Berrugues blanques presents en ambdues, fàcilment rentables per la pluja.',
    'diff_en', 'A. gemmata has a pale yellow-ochre cap, is smaller, and has a more fragile stem. The yellow form of muscaria (f. aureola) can easily be confused. Both toxic (muscimol). White warts present in both, easily washed away by rain.')
)) WHERE scientific_name = 'Amanita muscaria';

-- =============================================================================
-- Verificación
-- =============================================================================
SELECT scientific_name,
       jsonb_array_length(extra_data->'confusions') AS n_confusions
FROM   species
WHERE  scientific_name IN ('Amanita gemmata', 'Amanita muscaria')
ORDER  BY scientific_name;
