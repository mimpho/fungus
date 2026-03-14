-- =============================================================================
-- 036_confusions_i18n_neoboletus.sql
-- Adds diff_ca / diff_en to all confusion entries from 011_confusions_neoboletus_luridiformis.sql
-- Full replacement per species.
--
-- Neoboletus luridiformis (esp-019): new species in 011, no prior confusions.
-- Neoboletus erythropus (esp-014): had 1 entry from 030 (vs edulis).
--   Here we do a FULL REPLACEMENT including both entries:
--   - vs esp-001 Boletus edulis (from 005/030)
--   - vs esp-019 Neoboletus luridiformis (from 011, bidirectional)
-- =============================================================================

-- esp-019  Neoboletus luridiformis (new: no confusions existed before 011)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-014',
    'diff',    'Prácticamente idéntico: poros rojo sangre, azulea instantáneamente al corte. N. erythropus tiene el pie salpicado de puntitos rojo-granate sin retículo; N. luridiformis tiene el pie más liso y amarillento en la base. Mismo consejo de seguridad: tóxico en crudo, comestible solo con cocción prolongada.',
    'diff_ca', 'Pràcticament idèntic: porus vermell sang, blaveja instantàniament al tall. N. erythropus té el peu esquitxat de puntets vermell-granat sense reticle; N. luridiformis té el peu més llis i groguenc a la base. Mateix consell de seguretat: tòxic en cru, comestible només amb cocció prolongada.',
    'diff_en', 'Practically identical: blood-red pores, instantly blues when cut. N. erythropus has the stem dotted with red-garnet dots without reticulation; N. luridiformis has a smoother and more yellowish stem at the base. Same safety advice: toxic raw, edible only with prolonged cooking.'),
  jsonb_build_object('with_species_id', 'esp-001',
    'diff',    'Cep noble: poros blancos→amarillo-verdosos, no azulea al corte, olor agradable fúngico. Confundible con boletos de poros rojos o que azulean fuertemente.',
    'diff_ca', 'Cep noble: porus blancs→groc-verdosos, no blaveja al tall, olor agradable fúngica. Confusible amb bolets de porus vermells o que blavegen fortament.',
    'diff_en', 'Noble porcini: white→yellow-green pores, does not blue when cut, pleasant fungal smell. Can be confused with boletes with red pores or that strongly blue.'),
  jsonb_build_object('with_species_id', 'esp-015',
    'diff',    'Poros rojo intenso, pie reticulado con tonos rojos, azulea fuertemente al corte. Olor a carroña en maduros. Bosques calcáreos. Tóxico incluso cocinado — más peligroso que N. luridiformis.',
    'diff_ca', 'Porus vermell intens, peu reticulat amb tons vermells, blaveja fortament al tall. Olor a carronya en madurs. Boscos calcaris. Tòxic fins i tot cuinat — més perillós que N. luridiformis.',
    'diff_en', 'Intense red pores, stem reticulated with red tones, strongly blues when cut. Carrion smell when mature. Limestone forests. Toxic even when cooked — more dangerous than N. luridiformis.'),
  jsonb_build_object('with_species_id', 'esp-013',
    'diff',    'Poros anaranjados-rojizos, retículo rojo visible en el pie, azulea muy rápido al corte. Comestible solo con cocción prolongada; tóxico en crudo.',
    'diff_ca', 'Porus ataronjats-rogencs, reticle vermell visible al peu, blaveja molt ràpid al tall. Comestible només amb cocció prolongada; tòxic en cru.',
    'diff_en', 'Orange-reddish pores, visible red reticulation on stem, blues very quickly when cut. Edible only with prolonged cooking; toxic raw.')
)) WHERE scientific_name = 'Neoboletus luridiformis';

-- esp-014  Neoboletus erythropus — FULL REPLACEMENT (includes edulis from 005/030 + luridiformis from 011)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-001',
    'diff',    'El cep noble: poros blancos→amarillo-verdosos, no azulea al corte, olor agradable fúngico. Confundible con boletos de poros rojos o que azulean fuertemente.',
    'diff_ca', 'El cep noble: porus blancs→groc-verdosos, no blaveja al tall, olor agradable fúngica. Confusible amb bolets de porus vermells o que blavegen fortament.',
    'diff_en', 'The noble porcini: white→yellow-green pores, does not blue when cut, pleasant fungal smell. Can be confused with boletes with red pores or that strongly blue.'),
  jsonb_build_object('with_species_id', 'esp-019',
    'diff',    'Prácticamente idéntico: poros rojo sangre, azulea instantáneamente al corte. N. luridiformis tiene el pie liso y amarillento en la base, sin la punteadura rojo-granate característica de N. erythropus. Mismo consejo de seguridad: tóxico en crudo, comestible solo con cocción prolongada.',
    'diff_ca', 'Pràcticament idèntic: porus vermell sang, blaveja instantàniament al tall. N. luridiformis té el peu llis i groguenc a la base, sense la punteadura vermell-granat característica de N. erythropus. Mateix consell de seguretat: tòxic en cru, comestible només amb cocció prolongada.',
    'diff_en', 'Practically identical: blood-red pores, instantly blues when cut. N. luridiformis has a smooth and yellowish stem at the base, without the characteristic red-garnet dotting of N. erythropus. Same safety advice: toxic raw, edible only with prolonged cooking.')
)) WHERE scientific_name = 'Neoboletus erythropus';

-- =============================================================================
-- Verificación
-- =============================================================================
SELECT scientific_name,
       jsonb_array_length(extra_data->'confusions') AS n_confusions
FROM   species
WHERE  scientific_name IN ('Neoboletus luridiformis', 'Neoboletus erythropus')
ORDER  BY scientific_name;
