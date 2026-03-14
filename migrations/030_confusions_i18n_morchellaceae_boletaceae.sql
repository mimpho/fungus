-- =============================================================================
-- 030_confusions_i18n_morchellaceae_boletaceae.sql
-- Adds diff_ca / diff_en to all confusion entries from 005_confusions_data.sql
-- Full replacement of confusions array per species.
-- =============================================================================

-- esp-078  Morchella esculenta
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-082',
    'diff',    'Sombrero cerebriforme marrón-rojizo (no alveolado), contiene giromitrinas. Mortal incluso tras cocción. Se confunde con colmenillas (Morchella) y con Helvella lacunosa (precaución).',
    'diff_ca', 'Barret cerebriforme marró-rogenc (no alvèolat), conté giromitrines. Mortal fins i tot cuita. Es confon amb morelles (Morchella) i amb Helvella lacunosa (precaució).',
    'diff_en', 'Brown-reddish cerebral cap (not alveolate), contains gyromitrin. Deadly even after cooking. Confused with morels (Morchella) and Helvella lacunosa (caution).'),
  jsonb_build_object('with_species_id', 'esp-083',
    'diff',    'Sombrero lobulado gris-negro (no alveolado). Contiene giromitrinas; siempre cocinar. Se confunde con Gyromitra esculenta (mortal) y Morchella (excelente).',
    'diff_ca', 'Barret lobulat gris-negre (no alvèolat). Conté giromitrines; sempre cuinar. Es confon amb Gyromitra esculenta (mortal) i Morchella (excel·lent).',
    'diff_en', 'Gray-black lobed cap (not alveolate). Contains gyromitrin; always cook. Confused with Gyromitra esculenta (deadly) and Morchella (excellent).')
)) WHERE scientific_name = 'Morchella esculenta';

-- esp-079  Morchella elata
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-082',
    'diff',    'Sombrero cerebriforme marrón-rojizo (no alveolado), contiene giromitrinas. Mortal incluso tras cocción. Se confunde con colmenillas (Morchella) y con Helvella lacunosa (precaución).',
    'diff_ca', 'Barret cerebriforme marró-rogenc (no alvèolat), conté giromitrines. Mortal fins i tot cuita. Es confon amb morelles (Morchella) i amb Helvella lacunosa (precaució).',
    'diff_en', 'Brown-reddish cerebral cap (not alveolate), contains gyromitrin. Deadly even after cooking. Confused with morels (Morchella) and Helvella lacunosa (caution).'),
  jsonb_build_object('with_species_id', 'esp-083',
    'diff',    'Sombrero lobulado gris-negro (no alveolado). Contiene giromitrinas; siempre cocinar. Se confunde con Gyromitra esculenta (mortal) y Morchella (excelente).',
    'diff_ca', 'Barret lobulat gris-negre (no alvèolat). Conté giromitrines; sempre cuinar. Es confon amb Gyromitra esculenta (mortal) i Morchella (excel·lent).',
    'diff_en', 'Gray-black lobed cap (not alveolate). Contains gyromitrin; always cook. Confused with Gyromitra esculenta (deadly) and Morchella (excellent).')
)) WHERE scientific_name = 'Morchella elata';

-- esp-080  Morchella conica
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-082',
    'diff',    'Sombrero cerebriforme marrón-rojizo (no alveolado), contiene giromitrinas. Mortal incluso tras cocción. Se confunde con colmenillas (Morchella) y con Helvella lacunosa (precaución).',
    'diff_ca', 'Barret cerebriforme marró-rogenc (no alvèolat), conté giromitrines. Mortal fins i tot cuita. Es confon amb morelles (Morchella) i amb Helvella lacunosa (precaució).',
    'diff_en', 'Brown-reddish cerebral cap (not alveolate), contains gyromitrin. Deadly even after cooking. Confused with morels (Morchella) and Helvella lacunosa (caution).'),
  jsonb_build_object('with_species_id', 'esp-083',
    'diff',    'Sombrero lobulado gris-negro (no alveolado). Contiene giromitrinas; siempre cocinar. Se confunde con Gyromitra esculenta (mortal) y Morchella (excelente).',
    'diff_ca', 'Barret lobulat gris-negre (no alvèolat). Conté giromitrines; sempre cuinar. Es confon amb Gyromitra esculenta (mortal) i Morchella (excel·lent).',
    'diff_en', 'Gray-black lobed cap (not alveolate). Contains gyromitrin; always cook. Confused with Gyromitra esculenta (deadly) and Morchella (excellent).')
)) WHERE scientific_name = 'Morchella conica';

-- esp-081  Morchella importuna
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-082',
    'diff',    'Sombrero cerebriforme marrón-rojizo (no alveolado), contiene giromitrinas. Mortal incluso tras cocción. Se confunde con colmenillas (Morchella) y con Helvella lacunosa (precaución).',
    'diff_ca', 'Barret cerebriforme marró-rogenc (no alvèolat), conté giromitrines. Mortal fins i tot cuita. Es confon amb morelles (Morchella) i amb Helvella lacunosa (precaució).',
    'diff_en', 'Brown-reddish cerebral cap (not alveolate), contains gyromitrin. Deadly even after cooking. Confused with morels (Morchella) and Helvella lacunosa (caution).'),
  jsonb_build_object('with_species_id', 'esp-083',
    'diff',    'Sombrero lobulado gris-negro (no alveolado). Contiene giromitrinas; siempre cocinar. Se confunde con Gyromitra esculenta (mortal) y Morchella (excelente).',
    'diff_ca', 'Barret lobulat gris-negre (no alvèolat). Conté giromitrines; sempre cuinar. Es confon amb Gyromitra esculenta (mortal) i Morchella (excel·lent).',
    'diff_en', 'Gray-black lobed cap (not alveolate). Contains gyromitrin; always cook. Confused with Gyromitra esculenta (deadly) and Morchella (excellent).')
)) WHERE scientific_name = 'Morchella importuna';

-- esp-082  Gyromitra esculenta
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-078',
    'diff',    'Colmenilla clásica: sombrero claramente alveolado (celdillas), interior completamente hueco, pie blanco. Excelente comestible pero siempre cocinar. Las crestas más pálidas que las fosas la distinguen.',
    'diff_ca', 'Morella clàssica: barret clarament alvèolat (cel·les), interior completament buit, peu blanc. Excel·lent comestible però sempre cuinar. Les crestes més pàl·lides que les fosses la distingeixen.',
    'diff_en', 'Classic morel: clearly alveolate cap (cells), completely hollow interior, white stem. Excellent edible but always cook. Paler ridges than pits distinguish it.'),
  jsonb_build_object('with_species_id', 'esp-083',
    'diff',    'Sombrero lobulado gris-negro. Contiene giromitrinas; siempre cocinar. Se confunde con Gyromitra esculenta (mortal) y Morchella (excelente).',
    'diff_ca', 'Barret lobulat gris-negre. Conté giromitrines; sempre cuinar. Es confon amb Gyromitra esculenta (mortal) i Morchella (excel·lent).',
    'diff_en', 'Gray-black lobed cap. Contains gyromitrin; always cook. Confused with Gyromitra esculenta (deadly) and Morchella (excellent).')
)) WHERE scientific_name = 'Gyromitra esculenta';

-- esp-083  Helvella lacunosa
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-082',
    'diff',    'Sombrero cerebriforme marrón-rojizo (no alveolado), contiene giromitrinas. Mortal incluso tras cocción. Se confunde con colmenillas (Morchella) y con Helvella lacunosa (precaución).',
    'diff_ca', 'Barret cerebriforme marró-rogenc (no alvèolat), conté giromitrines. Mortal fins i tot cuita. Es confon amb morelles (Morchella) i amb Helvella lacunosa (precaució).',
    'diff_en', 'Brown-reddish cerebral cap (not alveolate), contains gyromitrin. Deadly even after cooking. Confused with morels (Morchella) and Helvella lacunosa (caution).'),
  jsonb_build_object('with_species_id', 'esp-078',
    'diff',    'Colmenilla clásica: sombrero claramente alveolado (celdillas), interior completamente hueco, pie blanco. Excelente comestible pero siempre cocinar. Las crestas más pálidas que las fosas la distinguen.',
    'diff_ca', 'Morella clàssica: barret clarament alvèolat (cel·les), interior completament buit, peu blanc. Excel·lent comestible però sempre cuinar. Les crestes més pàl·lides que les fosses la distingeixen.',
    'diff_en', 'Classic morel: clearly alveolate cap (cells), completely hollow interior, white stem. Excellent edible but always cook. Paler ridges than pits distinguish it.')
)) WHERE scientific_name = 'Helvella lacunosa';

-- =============================================================================
-- BOLETACEAE
-- =============================================================================

-- esp-001  Boletus edulis
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-004',
    'diff',    'Muy similar a B. edulis. Sombrero ocre-amarillento, pie reticulado casi hasta la base. Estival, típico de robledales y bosques caducifolios. Igual de excelente que el cep.',
    'diff_ca', 'Molt similar a B. edulis. Barret ocre-groguenc, peu reticulat gairebé fins a la base. Estival, típic de rouredes i boscos caducifolis. Igual d''excel·lent que el cep.',
    'diff_en', 'Very similar to B. edulis. Ochre-yellowish cap, stem reticulated almost to the base. Summer species, typical of oak and deciduous forests. Equally excellent as the porcini.'),
  jsonb_build_object('with_species_id', 'esp-015',
    'diff',    'Poros rojo intenso, pie reticulado con tonos rojos, azulea fuertemente al corte. Olor a carroña en maduros. Bosques calcáreos. Tóxico incluso cocinado.',
    'diff_ca', 'Porus vermell intens, peu reticulat amb tons vermells, blaveja fortament al tall. Olor a carronya en madurs. Boscos calcaris. Tòxic fins i tot cuinat.',
    'diff_en', 'Intense red pores, stem reticulated with red tones, strongly blues when cut. Carrion smell when mature. Limestone forests. Toxic even when cooked.'),
  jsonb_build_object('with_species_id', 'esp-013',
    'diff',    'Poros anaranjados-rojizos, retículo rojo en el pie, azulea muy rápido al corte. Comestible solo con cocción prolongada; tóxico en crudo.',
    'diff_ca', 'Porus ataronjats-rogencs, reticle vermell al peu, blaveja molt ràpid al tall. Comestible només amb cocció prolongada; tòxic en cru.',
    'diff_en', 'Orange-reddish pores, red reticulation on stem, blues very quickly when cut. Edible only with prolonged cooking; toxic raw.'),
  jsonb_build_object('with_species_id', 'esp-014',
    'diff',    'Poros rojo sangre desde joven, azulea instantáneamente al corte. Sin retículo en el pie. Tóxico crudo; comestible con cocción prolongada.',
    'diff_ca', 'Porus vermell sang des de jove, blaveja instantàniament al tall. Sense reticle al peu. Tòxic en cru; comestible amb cocció prolongada.',
    'diff_en', 'Blood-red pores from young age, instantly blues when cut. No reticulation on stem. Toxic raw; edible with prolonged cooking.')
)) WHERE scientific_name = 'Boletus edulis';

-- esp-002  Boletus aereus
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-015',
    'diff',    'Poros rojo intenso, pie reticulado con tonos rojos, azulea fuertemente al corte. Olor a carroña en maduros. Bosques calcáreos. Tóxico incluso cocinado.',
    'diff_ca', 'Porus vermell intens, peu reticulat amb tons vermells, blaveja fortament al tall. Olor a carronya en madurs. Boscos calcaris. Tòxic fins i tot cuinat.',
    'diff_en', 'Intense red pores, stem reticulated with red tones, strongly blues when cut. Carrion smell when mature. Limestone forests. Toxic even when cooked.'),
  jsonb_build_object('with_species_id', 'esp-013',
    'diff',    'Poros anaranjados-rojizos, retículo rojo en el pie, azulea muy rápido al corte. Comestible solo con cocción prolongada; tóxico en crudo.',
    'diff_ca', 'Porus ataronjats-rogencs, reticle vermell al peu, blaveja molt ràpid al tall. Comestible només amb cocció prolongada; tòxic en cru.',
    'diff_en', 'Orange-reddish pores, red reticulation on stem, blues very quickly when cut. Edible only with prolonged cooking; toxic raw.'),
  jsonb_build_object('with_species_id', 'esp-014',
    'diff',    'Poros rojo sangre desde joven, azulea instantáneamente al corte. Sin retículo en el pie. Tóxico crudo; comestible con cocción prolongada.',
    'diff_ca', 'Porus vermell sang des de jove, blaveja instantàniament al tall. Sense reticle al peu. Tòxic en cru; comestible amb cocció prolongada.',
    'diff_en', 'Blood-red pores from young age, instantly blues when cut. No reticulation on stem. Toxic raw; edible with prolonged cooking.')
)) WHERE scientific_name = 'Boletus aereus';

-- esp-003  Boletus pinophilus
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-015',
    'diff',    'Poros rojo intenso, pie reticulado con tonos rojos, azulea fuertemente al corte. Olor a carroña en maduros. Bosques calcáreos. Tóxico incluso cocinado.',
    'diff_ca', 'Porus vermell intens, peu reticulat amb tons vermells, blaveja fortament al tall. Olor a carronya en madurs. Boscos calcaris. Tòxic fins i tot cuinat.',
    'diff_en', 'Intense red pores, stem reticulated with red tones, strongly blues when cut. Carrion smell when mature. Limestone forests. Toxic even when cooked.'),
  jsonb_build_object('with_species_id', 'esp-013',
    'diff',    'Poros anaranjados-rojizos, retículo rojo en el pie, azulea muy rápido al corte. Comestible solo con cocción prolongada; tóxico en crudo.',
    'diff_ca', 'Porus ataronjats-rogencs, reticle vermell al peu, blaveja molt ràpid al tall. Comestible només amb cocció prolongada; tòxic en cru.',
    'diff_en', 'Orange-reddish pores, red reticulation on stem, blues very quickly when cut. Edible only with prolonged cooking; toxic raw.'),
  jsonb_build_object('with_species_id', 'esp-014',
    'diff',    'Poros rojo sangre desde joven, azulea instantáneamente al corte. Sin retículo en el pie. Tóxico crudo; comestible con cocción prolongada.',
    'diff_ca', 'Porus vermell sang des de jove, blaveja instantàniament al tall. Sense reticle al peu. Tòxic en cru; comestible amb cocció prolongada.',
    'diff_en', 'Blood-red pores from young age, instantly blues when cut. No reticulation on stem. Toxic raw; edible with prolonged cooking.')
)) WHERE scientific_name = 'Boletus pinophilus';

-- esp-004  Boletus reticulatus
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-001',
    'diff',    'El cep noble: poros blancos→amarillo-verdosos, no azulea al corte, olor agradable fúngico. Confundible con boletos de poros rojos o que azulean fuertemente.',
    'diff_ca', 'El cep noble: porus blancs→groc-verdosos, no blaveja al tall, olor agradable fúngica. Confusible amb bolets de porus vermells o que blavegen fortament.',
    'diff_en', 'The noble porcini: white→yellow-green pores, does not blue when cut, pleasant fungal smell. Can be confused with boletes with red pores or that strongly blue.'),
  jsonb_build_object('with_species_id', 'esp-015',
    'diff',    'Poros rojo intenso, pie reticulado con tonos rojos, azulea fuertemente al corte. Olor a carroña en maduros. Bosques calcáreos. Tóxico incluso cocinado.',
    'diff_ca', 'Porus vermell intens, peu reticulat amb tons vermells, blaveja fortament al tall. Olor a carronya en madurs. Boscos calcaris. Tòxic fins i tot cuinat.',
    'diff_en', 'Intense red pores, stem reticulated with red tones, strongly blues when cut. Carrion smell when mature. Limestone forests. Toxic even when cooked.'),
  jsonb_build_object('with_species_id', 'esp-013',
    'diff',    'Poros anaranjados-rojizos, retículo rojo en el pie, azulea muy rápido al corte. Comestible solo con cocción prolongada; tóxico en crudo.',
    'diff_ca', 'Porus ataronjats-rogencs, reticle vermell al peu, blaveja molt ràpid al tall. Comestible només amb cocció prolongada; tòxic en cru.',
    'diff_en', 'Orange-reddish pores, red reticulation on stem, blues very quickly when cut. Edible only with prolonged cooking; toxic raw.'),
  jsonb_build_object('with_species_id', 'esp-014',
    'diff',    'Poros rojo sangre desde joven, azulea instantáneamente al corte. Sin retículo en el pie. Tóxico crudo; comestible con cocción prolongada.',
    'diff_ca', 'Porus vermell sang des de jove, blaveja instantàniament al tall. Sense reticle al peu. Tòxic en cru; comestible amb cocció prolongada.',
    'diff_en', 'Blood-red pores from young age, instantly blues when cut. No reticulation on stem. Toxic raw; edible with prolonged cooking.')
)) WHERE scientific_name = 'Boletus reticulatus';

-- esp-013  Suillellus luridus
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-001',
    'diff',    'El cep noble: poros blancos→amarillo-verdosos, no azulea al corte, olor agradable fúngico. Confundible con boletos de poros rojos o que azulean fuertemente.',
    'diff_ca', 'El cep noble: porus blancs→groc-verdosos, no blaveja al tall, olor agradable fúngica. Confusible amb bolets de porus vermells o que blavegen fortament.',
    'diff_en', 'The noble porcini: white→yellow-green pores, does not blue when cut, pleasant fungal smell. Can be confused with boletes with red pores or that strongly blue.')
)) WHERE scientific_name = 'Suillellus luridus';

-- esp-014  Neoboletus erythropus
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-001',
    'diff',    'El cep noble: poros blancos→amarillo-verdosos, no azulea al corte, olor agradable fúngico. Confundible con boletos de poros rojos o que azulean fuertemente.',
    'diff_ca', 'El cep noble: porus blancs→groc-verdosos, no blaveja al tall, olor agradable fúngica. Confusible amb bolets de porus vermells o que blavegen fortament.',
    'diff_en', 'The noble porcini: white→yellow-green pores, does not blue when cut, pleasant fungal smell. Can be confused with boletes with red pores or that strongly blue.')
)) WHERE scientific_name = 'Neoboletus erythropus';

-- esp-015  Rubroboletus satanas
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-001',
    'diff',    'El cep noble: poros blancos→amarillo-verdosos, no azulea al corte, olor agradable fúngico. Confundible con boletos de poros rojos o que azulean fuertemente.',
    'diff_ca', 'El cep noble: porus blancs→groc-verdosos, no blaveja al tall, olor agradable fúngica. Confusible amb bolets de porus vermells o que blavegen fortament.',
    'diff_en', 'The noble porcini: white→yellow-green pores, does not blue when cut, pleasant fungal smell. Can be confused with boletes with red pores or that strongly blue.')
)) WHERE scientific_name = 'Rubroboletus satanas';
