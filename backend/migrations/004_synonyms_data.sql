-- =============================================================================
-- Species Taxonomy Synonyms Migration
-- =============================================================================
-- Run this SQL after migrating the schema to populate synonyms.
-- Based on SPECIES_SYNONYMS from src/data/species.js
-- =============================================================================

-- Boletaceae
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('synonyms', 
  ARRAY['Dictyopus edulis (Bull.) Quél.', 'Tubiporus edulis (Bull.) Rauschert', 'Boletus solidus Sowerby']
) WHERE scientific_name = 'Boletus edulis';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('synonyms', 
  ARRAY['Boletus aestivalis Krombh. (en parte)', 'Dictyopus aereus (Bull.) Quél.']
) WHERE scientific_name = 'Boletus aereus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('synonyms', 
  ARRAY['Boletus pinicola (Vittad.) Venturi', 'Tubiporus pinicola Henn.', 'Boletus pinophilus var. pinicola']
) WHERE scientific_name = 'Boletus pinophilus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('synonyms', 
  ARRAY['Boletus aestivalis (Paulet) Fr.', 'Boletus reticulatus var. pallescens']
) WHERE scientific_name = 'Boletus reticulatus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('synonyms', 
  ARRAY['Boletus badius (Fr.) Fr.', 'Xerocomus badius (Fr.) E.-J. Gilbert', 'Viscipellis badia (Fr.) Quél.']
) WHERE scientific_name = 'Imleria badia';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('synonyms', 
  ARRAY['Boletus scaber Bull.', 'Trachypus scaber (Bull.) Revel', 'Krombholzia scabra (Bull.) Maire']
) WHERE scientific_name = 'Leccinum scabrum';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('synonyms', 
  ARRAY['Boletus versipellis Fr. & Hök', 'Boletus rufescens Secr.', 'Leccinum testaceoscabrum (Secr.) Singer']
) WHERE scientific_name = 'Leccinum versipelle';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('synonyms', 
  ARRAY['Boletus luteus L.', 'Ixocomus luteus (L.) Quél.', 'Viscipellis lutea (L.) Quél.']
) WHERE scientific_name = 'Suillus luteus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('synonyms', 
  ARRAY['Boletus granulatus L.', 'Ixocomus granulatus (L.) Quél.']
) WHERE scientific_name = 'Suillus granulatus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('synonyms', 
  ARRAY['Boletus bellini Inzenga', 'Ixocomus bellini (Inzenga) Kuntze']
) WHERE scientific_name = 'Suillus bellini';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('synonyms', 
  ARRAY['Boletus subtomentosus L.', 'Xerocomus ferrugineus (Schaeff.) Alessio', 'Tubiporus subtomentosus (L.) Rauschert']
) WHERE scientific_name = 'Xerocomus subtomentosus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('synonyms', 
  ARRAY['Boletus calopus Pers.', 'Tubiporus calopus (Pers.) Rauschert']
) WHERE scientific_name = 'Caloboletus calopus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('synonyms', 
  ARRAY['Boletus luridus Schaeff.', 'Tubiporus luridus (Schaeff.) Rauschert']
) WHERE scientific_name = 'Suillellus luridus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('synonyms', 
  ARRAY['Boletus erythropus (Fr.) Fr.', 'Boletus erythropus var. erythropus', 'Dictyopus erythropus (Fr.) Quél.']
) WHERE scientific_name = 'Neoboletus erythropus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('synonyms', 
  ARRAY['Boletus satanas Lenz', 'Tubiporus satanas (Lenz) Rauschert']
) WHERE scientific_name = 'Rubroboletus satanas';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('synonyms', 
  ARRAY['Boletus cyanescens Bull.', 'Leucobolites cyanescens (Bull.) Beck']
) WHERE scientific_name = 'Gyroporus cyanescens';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('synonyms', 
  ARRAY['Boletus castaneus Bull.', 'Leucobolites castaneus (Bull.) Beck']
) WHERE scientific_name = 'Gyroporus castaneus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('synonyms', 
  ARRAY['Boletus piperatus Bull.', 'Ixocomus piperatus (Bull.) Quél.']
) WHERE scientific_name = 'Chalciporus piperatus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('synonyms', 
  ARRAY['Boletus luridiformis Rostk.', 'Boletus erythropus auct. (en parte)', 'Boletus discolor Quél.']
) WHERE scientific_name = 'Neoboletus luridiformis';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('synonyms', 
  ARRAY['Agaricus involutus Batsch', 'Omphalia involuta (Batsch) Gray']
) WHERE scientific_name = 'Paxillus involutus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('synonyms', 
  ARRAY['Boletus gentilis Quél.', 'Pulveroboletus gentilis (Quél.) Singer']
) WHERE scientific_name = 'Aureoboletus gentilis';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('synonyms', 
  ARRAY['Boletus regius Krombh.', 'Tubiporus regius (Krombh.) Rauschert']
) WHERE scientific_name = 'Butyriboletus regius';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('synonyms', 
  ARRAY['Paxillus atrotomentosus (Batsch) Fr.', 'Agaricus atrotomentosus Batsch']
) WHERE scientific_name = 'Tapinella atrotomentosa';

-- Russulaceae
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('synonyms', 
  ARRAY['Agaricus virescens Schaeff.', 'Krombholzia virescens (Schaeff.) Ricken']
) WHERE scientific_name = 'Russula virescens';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('synonyms', 
  ARRAY['Agaricus cyanoxanthus Schaeff.', 'Russula cyanoxantha f. peltereaui Singer']
) WHERE scientific_name = 'Russula cyanoxantha';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('synonyms', 
  ARRAY['Lactarius deliciosus var. delica Fr.', 'Russula chloroides (Krombh.) Bres.']
) WHERE scientific_name = 'Russula delica';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('synonyms', 
  ARRAY['Agaricus foetens Pers.', 'Russula foetentula Peck']
) WHERE scientific_name = 'Russula foetens';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('synonyms', 
  ARRAY['Agaricus nigricans Bull.', 'Russula nigricans f. albonigra (Krombh.) Konrad & Maubl.']
) WHERE scientific_name = 'Russula nigricans';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('synonyms', 
  ARRAY['Agaricus emeticus Schaeff.', 'Krombholzia emetica (Schaeff.) Ricken']
) WHERE scientific_name = 'Russula emetica';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('synonyms', 
  ARRAY['Agaricus xerampelinus Schaeff.', 'Russula erythropoda Pelt.']
) WHERE scientific_name = 'Russula xerampelina';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('synonyms', 
  ARRAY['Agaricus deliciosus L.', 'Lactifluus deliciosus (L.) Kuntze', 'Galorrheus deliciosus (L.) P. Kumm.']
) WHERE scientific_name = 'Lactarius deliciosus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('synonyms', 
  ARRAY['Agaricus sanguifluus Paulet', 'Galorrheus sanguifluus (Paulet) Maire']
) WHERE scientific_name = 'Lactarius sanguifluus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('synonyms', 
  ARRAY['Lactarius deliciosus var. deterrimus (Gröger) Bon']
) WHERE scientific_name = 'Lactarius deterrimus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('synonyms', 
  ARRAY['Lactarius piperatus (L.) Pers.', 'Agaricus piperatus L.', 'Galorrheus piperatus (L.) Kuntze']
) WHERE scientific_name = 'Lactifluus piperatus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('synonyms', 
  ARRAY['Agaricus torminosus Schaeff.', 'Galorrheus torminosus (Schaeff.) P. Kumm.']
) WHERE scientific_name = 'Lactarius torminosus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('synonyms', 
  ARRAY['Agaricus indigo Schwein.', 'Galorrheus indigo (Schwein.) Kuntze']
) WHERE scientific_name = 'Lactarius indigo';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('synonyms', 
  ARRAY['Agaricus volemus Fr.', 'Lactifluus volemus (Fr.) Kuntze']
) WHERE scientific_name = 'Lactarius volemus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('synonyms', 
  ARRAY['Lactarius vellereus (Fr.) Fr.', 'Agaricus vellereus Fr.']
) WHERE scientific_name = 'Lactifluus vellereus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('synonyms', 
  ARRAY['Russula foetens var. laurocerasi (Melzer) Bon']
) WHERE scientific_name = 'Russula laurocerasi';

-- Verify count
SELECT scientific_name, extra_data->>'synonyms' as synonyms_count 
FROM species 
WHERE extra_data ? 'synonyms' 
ORDER BY scientific_name;
