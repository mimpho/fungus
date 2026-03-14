-- Migration 018: cond_req fix (Session D)
-- Corrects ~28 species where Gemini generated morphological/identification text
-- in cond_req instead of ecological requirements (trophic mode, substrate, triggers).
-- Only updates cond_req_es/ca/en — cond_temp/precip/suelo from previous sessions are kept.
--
-- Affected families: Strophariaceae (9), Polyporaceae (9),
--   Tricholomataceae (6), Agaricaceae (3), Pleurotaceae (1)
--
-- Format: extra_data || jsonb_build_object(...) overwrites only the listed keys.

-- ─── STROPHARIACEAE ───────────────────────────────────────────────────────────

-- esp-148 Pholiota squarrosa
UPDATE species
SET extra_data = extra_data || jsonb_build_object(
  'cond_req_es', 'Saprófita o parásita débil. No requiere choque térmico. Crece en la base de árboles vivos o sobre tocones (abedules, chopos, coníferas). Indicadora de podredumbre blanca activa.',
  'cond_req_ca', 'Saprófita o paràsita feble. No requereix xoc tèrmic. Creix en soques d''arbres vius o morts (bedolls, pollancres, coníferes). Indicadora de podridura blanca activa.',
  'cond_req_en', 'Saprotrophic or weak parasite. No thermal shock required. Grows at the base of living trees or on stumps (birch, poplar, conifers). Indicator of active white rot.'
)
WHERE id = 'esp-148';

-- esp-149 Hypholoma fasciculare
UPDATE species
SET extra_data = extra_data || jsonb_build_object(
  'cond_req_es', 'Saprófita lignícola cespitosa. No requiere choque térmico. Muy común sobre madera muerta o enterrada de cualquier especie; tolera temperaturas bajas hasta casi las heladas.',
  'cond_req_ca', 'Saprófita lignícola cespitosa. No requereix xoc tèrmic. Molt comú sobre fusta morta o soterrada de qualsevol espècie; tolera temperatures baixes fins gairebé les gelades.',
  'cond_req_en', 'Caespitose wood saprotroph. No thermal shock required. Very common on dead or buried wood of any species; tolerates low temperatures near freezing.'
)
WHERE id = 'esp-149';

-- esp-150 Hypholoma capnoides
UPDATE species
SET extra_data = extra_data || jsonb_build_object(
  'cond_req_es', 'Saprófita lignícola estricta de coníferas. No requiere choque térmico. Aparece en tocones y raíces de pino y abeto, a menudo a mayor altitud que H. fasciculare.',
  'cond_req_ca', 'Saprófita lignícola estricta de coníferes. No requereix xoc tèrmic. Apareix en soques i arrels de pi i avet, sovint a major altitud que H. fasciculare.',
  'cond_req_en', 'Strict conifer wood saprotroph. No thermal shock required. Appears on pine and fir stumps and roots, often at higher elevation than H. fasciculare.'
)
WHERE id = 'esp-150';

-- esp-151 Stropharia aeruginosa
UPDATE species
SET extra_data = extra_data || jsonb_build_object(
  'cond_req_es', 'Saprófita humícola. No requiere choque térmico. Sustratos ricos en materia orgánica: humus forestal, bordes de caminos, herbazales con mantillo.',
  'cond_req_ca', 'Saprófita humícola. No requereix xoc tèrmic. Substrats rics en matèria orgànica: humus forestal, vores de camins, herbassars amb mantell orgànic.',
  'cond_req_en', 'Humus saprotroph. No thermal shock required. Rich organic substrates: forest humus, roadsides, herb-rich areas with deep litter.'
)
WHERE id = 'esp-151';

-- esp-152 Agrocybe praecox
UPDATE species
SET extra_data = extra_data || jsonb_build_object(
  'cond_req_es', 'Saprófita humícola y nitrófila. No requiere choque térmico. Suelos ricos en nitrógeno: jardines, parques, bordes de caminos y prados herbosos. Especie primaveral.',
  'cond_req_ca', 'Saprófita humícola i nitrófila. No requereix xoc tèrmic. Sòls rics en nitrogen: jardins, parcs, vores de camins i prats herbosos. Espècie primaveral.',
  'cond_req_en', 'Nitrophilous humus saprotroph. No thermal shock required. Nitrogen-rich soils: gardens, parks, roadsides, herb-rich meadows. Spring species.'
)
WHERE id = 'esp-152';

-- esp-153 Agrocybe aegerita
UPDATE species
SET extra_data = extra_data || jsonb_build_object(
  'cond_req_es', 'Saprófita lignícola. No requiere choque térmico. Ligada al chopo (Populus spp.) y otros planifolios de ribera (olmo, sauce); cultivable sobre troncos inoculados.',
  'cond_req_ca', 'Saprófita lignícola. No requereix xoc tèrmic. Lligada al pollancre (Populus spp.) i altres planifolis de ribera (om, salze); cultivable sobre troncs inoculats.',
  'cond_req_en', 'Wood saprotroph. No thermal shock required. Associated with poplar (Populus spp.) and other riparian hardwoods (elm, willow); cultivable on inoculated logs.'
)
WHERE id = 'esp-153';

-- esp-154 Kuehneromyces mutabilis
UPDATE species
SET extra_data = extra_data || jsonb_build_object(
  'cond_req_es', 'Saprófita lignícola cespitosa. No requiere choque térmico. Crece en cepas y madera muerta de hayas, robles y otros planifolios. Prefiere ambientes húmedos.',
  'cond_req_ca', 'Saprófita lignícola cespitosa. No requereix xoc tèrmic. Creix en soques i fusta morta de faigs, roures i altres planifolis. Prefereix ambients humits.',
  'cond_req_en', 'Caespitose wood saprotroph. No thermal shock required. Grows on stumps and dead wood of beech, oak, and other hardwoods. Prefers humid environments.'
)
WHERE id = 'esp-154';

-- esp-156 Cyclocybe cylindracea
UPDATE species
SET extra_data = extra_data || jsonb_build_object(
  'cond_req_es', 'Saprófita lignícola. No requiere choque térmico. Ligada al chopo, olmo y sauce; crece en la base de troncos vivos o sobre tocones. Cultivable.',
  'cond_req_ca', 'Saprófita lignícola. No requereix xoc tèrmic. Lligada al pollancre, om i salze; creix a la base de troncs vius o sobre soques. Cultivable.',
  'cond_req_en', 'Wood saprotroph. No thermal shock required. Associated with poplar, elm, and willow; grows at the base of living trunks or on stumps. Cultivable.'
)
WHERE id = 'esp-156';

-- esp-157 Stropharia coronilla
UPDATE species
SET extra_data = extra_data || jsonb_build_object(
  'cond_req_es', 'Saprófita pratícola. No requiere choque térmico. Prados, pastizales y bordes de caminos en suelos arcillosos con materia orgánica. A menudo entre hierba.',
  'cond_req_ca', 'Saprófita pratícola. No requereix xoc tèrmic. Prats, pastures i vores de camins en sòls argilosos amb matèria orgànica. Sovint entre herba.',
  'cond_req_en', 'Grassland saprotroph. No thermal shock required. Meadows, pastures, and roadsides on clay-rich soils with organic matter. Often found among grass.'
)
WHERE id = 'esp-157';


-- ─── POLYPORACEAE ─────────────────────────────────────────────────────────────

-- esp-077 Panus conchatus
UPDATE species
SET extra_data = extra_data || jsonb_build_object(
  'cond_req_es', 'Saprófita lignícola. No requiere choque térmico. Crece sobre madera muerta de planifolios, especialmente sauce y chopo. Resistente a la desecación; puede revivir con la humedad.',
  'cond_req_ca', 'Saprófita lignícola. No requereix xoc tèrmic. Creix sobre fusta morta de planifolis, especialment salze i pollancre. Resisteix la dessecació i pot reviure amb la humitat.',
  'cond_req_en', 'Wood saprotroph. No thermal shock required. Grows on dead hardwood, especially willow and poplar. Drought-resistant and can revive with moisture.'
)
WHERE id = 'esp-077';

-- esp-128 Laetiporus sulphureus
UPDATE species
SET extra_data = extra_data || jsonb_build_object(
  'cond_req_es', 'Parásita/saprófita que causa podredumbre parda. Requiere choque térmico estival. Ligada a roble, cerezo, castaño y otras latifolias maduras; generalmente a baja-media cota.',
  'cond_req_ca', 'Paràsita/saprófita que causa podridura brava. Requereix xoc tèrmic estival. Lligada al roure, cirerer, castanyer i altres latifolis madurs; generalment a baixa-mitja cota.',
  'cond_req_en', 'Parasite/saprotroph causing brown rot. Requires summer thermal shock. Associated with oak, cherry, chestnut, and other mature hardwoods; typically at low to mid elevation.'
)
WHERE id = 'esp-128';

-- esp-129 Fomes fomentarius
UPDATE species
SET extra_data = extra_data || jsonb_build_object(
  'cond_req_es', 'Saprófita/parásita perenne. No requiere choque térmico; puede encontrarse todo el año. Ligada estrictamente al haya (clima atlántico) y al abedul (clima boreal).',
  'cond_req_ca', 'Saprófita/paràsita perenne. No requereix xoc tèrmic; es pot trobar tot l''any. Lligada estrictament al faig (clima atlàntic) i al bedoll (clima boreal).',
  'cond_req_en', 'Perennial parasite/saprotroph. No thermal shock required; fruits year-round. Strictly associated with beech (Atlantic climate) and birch (boreal climate).'
)
WHERE id = 'esp-129';

-- esp-130 Trametes versicolor
UPDATE species
SET extra_data = extra_data || jsonb_build_object(
  'cond_req_es', 'Saprófita lignícola ubicua. No requiere choque térmico. Muy común sobre tocones y madera muerta de cualquier planifolio. Prefiere superficies expuestas al sol.',
  'cond_req_ca', 'Saprófita lignícola ubiqua. No requereix xoc tèrmic. Molt comú sobre soques i fusta morta de qualsevol planifoli. Prefereix superfícies exposades al sol.',
  'cond_req_en', 'Ubiquitous wood saprotroph. No thermal shock required. Very common on stumps and dead wood of any hardwood. Prefers sun-exposed surfaces.'
)
WHERE id = 'esp-130';

-- esp-131 Trametes gibbosa
UPDATE species
SET extra_data = extra_data || jsonb_build_object(
  'cond_req_es', 'Saprófita lignícola. No requiere choque térmico. Crece sobre tocones y troncos muertos de haya y otras latifolias, a veces también sobre coníferas.',
  'cond_req_ca', 'Saprófita lignícola. No requereix xoc tèrmic. Creix sobre soques i troncs morts de faig i altres latifolis, de vegades també sobre coníferes.',
  'cond_req_en', 'Wood saprotroph. No thermal shock required. Grows on beech and other hardwood stumps and logs, occasionally also on conifers.'
)
WHERE id = 'esp-131';

-- esp-135 Polyporus squamosus
UPDATE species
SET extra_data = extra_data || jsonb_build_object(
  'cond_req_es', 'Saprófita y parásita de planifolios maduros. No requiere choque térmico. Ligada a olmo, nogal, fresno y plátano; especie primaveral-estival con franja altitudinal amplia.',
  'cond_req_ca', 'Saprófita i paràsita de planifolis madurs. No requereix xoc tèrmic. Lligada a l''om, la noguera, el freixe i el plàtan; espècie primaveral-estival amb àmplia franja altitudinal.',
  'cond_req_en', 'Saprotroph and parasite of mature hardwoods. No thermal shock required. Associated with elm, walnut, ash, and plane tree; spring-summer species with wide altitudinal range.'
)
WHERE id = 'esp-135';

-- esp-136 Pycnoporus cinnabarinus
UPDATE species
SET extra_data = extra_data || jsonb_build_object(
  'cond_req_es', 'Saprófita lignícola. No requiere choque térmico. Crece sobre madera muerta de planifolios expuesta al sol. Indicadora de bosque maduro con madera muerta abundante.',
  'cond_req_ca', 'Saprófita lignícola. No requereix xoc tèrmic. Creix sobre fusta morta de planifolis exposada al sol. Indicadora de bosc madur amb fusta morta abundant.',
  'cond_req_en', 'Wood saprotroph. No thermal shock required. Grows on dead hardwood in sun-exposed positions. Indicator of mature forest with abundant deadwood.'
)
WHERE id = 'esp-136';

-- esp-137 Daedalea quercina
UPDATE species
SET extra_data = extra_data || jsonb_build_object(
  'cond_req_es', 'Saprófita perenne ligada estrictamente al roble y otros Quercus. No requiere choque térmico; puede encontrarse todo el año. Causa podredumbre parda de la madera.',
  'cond_req_ca', 'Saprófita perenne lligada estrictament al roure i altres Quercus. No requereix xoc tèrmic; es pot trobar tot l''any. Causa podridura brava de la fusta.',
  'cond_req_en', 'Perennial saprotroph strictly associated with oak and other Quercus. No thermal shock required; found year-round. Causes brown rot of wood.'
)
WHERE id = 'esp-137';

-- esp-199 Trametes hirsuta
UPDATE species
SET extra_data = extra_data || jsonb_build_object(
  'cond_req_es', 'Saprófita lignícola. No requiere choque térmico. Común sobre madera muerta de planifolios en bosques de ribera y zonas abiertas.',
  'cond_req_ca', 'Saprófita lignícola. No requereix xoc tèrmic. Comú sobre fusta morta de planifolis en boscos de ribera i zones obertes.',
  'cond_req_en', 'Wood saprotroph. No thermal shock required. Common on dead hardwood in riparian forests and open areas.'
)
WHERE id = 'esp-199';


-- ─── TRICHOLOMATACEAE ─────────────────────────────────────────────────────────

-- esp-091 Tricholoma portentosum
UPDATE species
SET extra_data = extra_data || jsonb_build_object(
  'cond_req_es', 'Micorrizógena estricta de pinos. Requiere helada y choque térmico. Prefiere pinares maduros de montaña media-alta (600–1600m), a menudo con mantillo profundo.',
  'cond_req_ca', 'Micorrizògena estricta de pins. Requereix gelada i xoc tèrmic. Prefereix pinedes madures de muntanya mitja-alta (600–1600m), sovint amb mantell profund.',
  'cond_req_en', 'Strict mycorrhizal associate of pines. Requires frost and thermal shock. Prefers mature mid-to-high mountain pine forests (600–1600m), often with deep litter.'
)
WHERE id = 'esp-091';

-- esp-093 Tricholoma sulphureum
UPDATE species
SET extra_data = extra_data || jsonb_build_object(
  'cond_req_es', 'Micorrizógena de planifolios (roble, haya) y coníferas. No requiere choque térmico específico. Amplia franja altitudinal (200–1400m); aparece desde verano hasta otoño.',
  'cond_req_ca', 'Micorrizògena de planifolis (roure, faig) i coníferes. No requereix xoc tèrmic específic. Àmplia franja altitudinal (200–1400m); apareix des de l''estiu fins a la tardor.',
  'cond_req_en', 'Mycorrhizal with hardwoods (oak, beech) and conifers. No specific thermal shock required. Wide altitudinal range (200–1400m); appears from summer through autumn.'
)
WHERE id = 'esp-093';

-- esp-094 Tricholoma saponaceum
UPDATE species
SET extra_data = extra_data || jsonb_build_object(
  'cond_req_es', 'Micorrizógena de coníferas y planifolios. No requiere choque térmico. Especie ubiquista con amplia distribución altitudinal (200–1600m); muy variable en coloración y tamaño.',
  'cond_req_ca', 'Micorrizògena de coníferes i planifolis. No requereix xoc tèrmic. Espècie ubiqüista amb àmplia distribució altitudinal (200–1600m); molt variable en coloració i mida.',
  'cond_req_en', 'Mycorrhizal with conifers and hardwoods. No thermal shock required. Ubiquitous species with wide altitudinal range (200–1600m); highly variable in colour and size.'
)
WHERE id = 'esp-094';

-- esp-097 Clitocybe geotropa
UPDATE species
SET extra_data = extra_data || jsonb_build_object(
  'cond_req_es', 'Saprófita de pastos bajo planifolios. Requiere choque térmico otoñal. Forma grandes corros de brujas en bordes de bosque y prados arbolados.',
  'cond_req_ca', 'Saprófita de pastures sota planifolis. Requereix xoc tèrmic tardorenc. Forma grans corrols de bruixes en marges de boscos i prats arborats.',
  'cond_req_en', 'Saprotrophic in grassy areas under hardwoods. Requires autumn thermal shock. Forms large fairy rings at forest edges and wooded pastures.'
)
WHERE id = 'esp-097';

-- esp-099 Clitocybe odora
UPDATE species
SET extra_data = extra_data || jsonb_build_object(
  'cond_req_es', 'Saprófita humícola. No requiere choque térmico. Suelos con hojarasca abundante, preferentemente en hayedos y bosques mixtos. Indicadora de humus maduro.',
  'cond_req_ca', 'Saprófita humícola. No requereix xoc tèrmic. Sòls amb fullaraca abundant, preferentment en fagedes i boscos mixtos. Indicadora d''humus madur.',
  'cond_req_en', 'Humus saprotroph. No thermal shock required. Soils with abundant leaf litter, preferably in beech and mixed forests. Indicator of mature humus.'
)
WHERE id = 'esp-099';

-- esp-100 Clitocybe dealbata
UPDATE species
SET extra_data = extra_data || jsonb_build_object(
  'cond_req_es', 'Saprófita pratícola. No requiere choque térmico. Prados herbosos, bordes de caminos y pastizales. Crece entre hierba, a menudo junto a senderuelas (Marasmius oreades).',
  'cond_req_ca', 'Saprófita pratícola. No requereix xoc tèrmic. Prats herbosos, vores de camins i pastures. Creix entre herba, sovint barrejada amb les senderoles (Marasmius oreades).',
  'cond_req_en', 'Grassland saprotroph. No thermal shock required. Herb-rich meadows, roadsides, and pastures. Grows among grass, often alongside fairy ring champignon (Marasmius oreades).'
)
WHERE id = 'esp-100';


-- ─── AGARICACEAE ──────────────────────────────────────────────────────────────

-- esp-160 Agaricus xanthodermus
UPDATE species
SET extra_data = extra_data || jsonb_build_object(
  'cond_req_es', 'Saprófita humícola y nitrófila. No requiere choque térmico. Aparece en suelos ricos en nitrógeno: jardines, parques, bordes de caminos y zonas con materia orgánica en descomposición.',
  'cond_req_ca', 'Saprófita humícola i nitrófila. No requereix xoc tèrmic. Apareix en sòls rics en nitrogen: jardins, parcs, vores de camins i zones amb matèria orgànica en descomposició.',
  'cond_req_en', 'Nitrophilous humus saprotroph. No thermal shock required. Appears in nitrogen-rich soils: gardens, parks, roadsides, and areas with decomposing organic matter.'
)
WHERE id = 'esp-160';

-- esp-162 Lepiota cristata
UPDATE species
SET extra_data = extra_data || jsonb_build_object(
  'cond_req_es', 'Saprófita humícola. No requiere choque térmico. Aparece en suelos ricos en materia orgánica: bordes de caminos, jardines, bosques mixtos. Mortal — no confundir con otras lepiotas.',
  'cond_req_ca', 'Saprófita humícola. No requereix xoc tèrmic. Apareix en sòls rics en matèria orgànica: vores de camins, jardins, boscos mixtos. Mortal — no confondre amb altres lèpiotes.',
  'cond_req_en', 'Humus saprotroph. No thermal shock required. Appears in organic-rich soils: roadsides, gardens, mixed forests. Deadly — do not confuse with other Lepiota species.'
)
WHERE id = 'esp-162';

-- esp-165 Leucoagaricus leucothites
UPDATE species
SET extra_data = extra_data || jsonb_build_object(
  'cond_req_es', 'Saprófita humícola pratícola. No requiere choque térmico. Prados, jardines y suelos ricos en nitrógeno. Precaución: riesgo de confusión con Amanita verna o A. virosa.',
  'cond_req_ca', 'Saprófita humícola pratícola. No requereix xoc tèrmic. Prats, jardins i sòls rics en nitrogen. Precaució: risc de confusió amb Amanita verna o A. virosa.',
  'cond_req_en', 'Grassland humus saprotroph. No thermal shock required. Meadows, gardens, nitrogen-rich soils. Caution: risk of confusion with deadly Amanita verna or A. virosa.'
)
WHERE id = 'esp-165';


-- ─── PLEUROTACEAE ─────────────────────────────────────────────────────────────

-- esp-071 Pleurotus eryngii
UPDATE species
SET extra_data = extra_data || jsonb_build_object(
  'cond_req_es', 'Saprófita/parásita de raíces de umbelíferas (Eryngium, Ferula, Thapsia). No requiere choque térmico. Típica de estepas, matorrales y dehesas mediterráneas secas (0–1200m).',
  'cond_req_ca', 'Saprófita/paràsita d''arrels d''umbel·líferes (Eryngium, Ferula, Thapsia). No requereix xoc tèrmic. Típica d''estepes, matollars i deveses mediterrànies seques (0–1200m).',
  'cond_req_en', 'Saprotroph/parasite on umbellifer roots (Eryngium, Ferula, Thapsia). No thermal shock required. Typical of Mediterranean steppes, scrubland, and dehesas (0–1200m).'
)
WHERE id = 'esp-071';


-- ─── VERIFICATION ─────────────────────────────────────────────────────────────
-- Run after executing to confirm all 28 species have correct ecological content:
--
-- SELECT id, scientific_name,
--   extra_data->>'cond_req_es' AS cond_req_es
-- FROM species
-- WHERE id IN (
--   'esp-148','esp-149','esp-150','esp-151','esp-152','esp-153','esp-154','esp-156','esp-157',
--   'esp-077','esp-128','esp-129','esp-130','esp-131','esp-135','esp-136','esp-137','esp-199',
--   'esp-091','esp-093','esp-094','esp-097','esp-099','esp-100',
--   'esp-160','esp-162','esp-165',
--   'esp-071'
-- )
-- ORDER BY family, id;
