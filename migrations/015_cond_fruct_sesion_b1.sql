-- Familia Hygrophoraceae
-- esp-140  Hygrophorus marzuolus
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Especie de finales de invierno y primavera temprana (2–10°C). Su desarrollo óptimo ocurre a los 6°C.",
  "cond_temp_ca": "Espècie de finals d’hivern i primavera primerenca (2–10°C). El seu desenvolupament òptim es dóna als 6°C.",
  "cond_temp_en": "Late winter and early spring species (2–10°C). Optimal development occurs at 6°C.",
  "cond_precip_es": "Precisa lluvias o nieve acumulada de 25–60mm. Requiere un ciclo de 10 días tras el deshielo o las lluvias frías.",
  "cond_precip_ca": "Precisa pluges o neu acumulada de 25–60mm. Requereix un cicle de 10 dies després del desgel o les pluges fredes.",
  "cond_precip_en": "Requires 25–60mm of rain or accumulated snow. Needs a 10-day cycle after snowmelt or cold rains.",
  "cond_suelo_es": "Suelos silíceos o descalcificados (pH 5.5–7) en pinares de montaña y hayedos.",
  "cond_suelo_ca": "Sòls silicis o descalcificats (pH 5.5–7) en pinedes de muntanya i faigedes.",
  "cond_suelo_en": "Siliceous or decalcified soils (pH 5.5–7) in mountain pine and beech forests.",
  "cond_req_es": "Micorrizógeno que requiere obligatoriamente helada y choque térmico. Muy mimetizado con la hojarasca.",
  "cond_req_ca": "Micorrizogen que requereix obligatòriament gelada i xoc tèrmic. Molt mimetitzat amb la fullaraca.",
  "cond_req_en": "Mycorrhizal species that strictly requires frost and thermal shock. Highly camouflaged with leaf litter."
}'::jsonb
WHERE id = 'esp-140';

-- esp-141  Hygrophorus hypothejus
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Fructifica con frío intenso (4–12°C, óptimo 8°C). Es una de las últimas especies del año.",
  "cond_temp_ca": "Fructifica amb fred intens (4–12°C, òptim 8°C). És una de les últimes espècies de l’any.",
  "cond_temp_en": "Fruits in intense cold (4–12°C, optimum 8°C). One of the last species of the year.",
  "cond_precip_es": "Necesita lluvias moderadas de 25–65mm. Ciclo de aparición de 9 días.",
  "cond_precip_ca": "Necessita pluges moderades de 25–65mm. Cicle d’aparició de 9 dies.",
  "cond_precip_en": "Needs moderate rainfall of 25–65mm. 9-day appearance cycle.",
  "cond_suelo_es": "Suelos ácidos (pH 4.5–6.5) bajo pinos. Común en pinares de montaña.",
  "cond_suelo_ca": "Sòls àcids (pH 4.5–6.5) sota pins. Comú en pinedes de muntanya.",
  "cond_suelo_en": "Acidic soils (pH 4.5–6.5) under pines. Common in mountain pine forests.",
  "cond_req_es": "Micorrizógeno tardío. Requiere heladas y choque térmico para brotar masivamente.",
  "cond_req_ca": "Micorrizogen tardà. Requereix gelades i xoc tèrmic per brollar massivament.",
  "cond_req_en": "Late mycorrhizal species. Requires frosts and thermal shock for massive sprouting."
}'::jsonb
WHERE id = 'esp-141';

-- esp-142  Hygrophorus agathosmus
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Prefiere temperaturas frescas (6–14°C, óptimo 10°C). Aparece en el otoño avanzado.",
  "cond_temp_ca": "Prefereix temperatures fresques (6–14°C, òptim 10°C). Apareix a la tardor avançada.",
  "cond_temp_en": "Prefers cool temperatures (6–14°C, optimum 10°C). Appears in late autumn.",
  "cond_precip_es": "Requiere 30–70mm de lluvia acumulada. Ciclo de fructificación de 8 días.",
  "cond_precip_ca": "Requereix 30–70mm de pluja acumulada. Cicle de fructificació de 8 dies.",
  "cond_precip_en": "Requires 30–70mm of accumulated rain. 8-day fruiting cycle.",
  "cond_suelo_es": "Suelos ácidos (pH 4.5–6.5) en bosques mixtos de pino y haya.",
  "cond_suelo_ca": "Sòls àcids (pH 4.5–6.5) en boscos mixtos de pi i faig.",
  "cond_suelo_en": "Acidic soils (pH 4.5–6.5) in mixed pine and beech forests.",
  "cond_req_es": "Micorrizógeno con característico olor a almendras amargas. Requiere helada y choque térmico.",
  "cond_req_ca": "Micorrizogen amb característic olor d’atmetlles amargues. Requereix gelada i xoc tèrmic.",
  "cond_req_en": "Mycorrhizal species with a characteristic bitter almond smell. Requires frost and thermal shock."
}'::jsonb
WHERE id = 'esp-142';

-- Familia Physalacriaceae
-- esp-194  Oudemansiella mucida
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Fructifica en rangos frescos (8–18°C, óptimo 13°C). Típica del otoño húmedo.",
  "cond_temp_ca": "Fructifica en rangos frescos (8–18°C, òptim 13°C). Típica de la tardor humida.",
  "cond_temp_en": "Fruits in cool ranges (8–18°C, optimum 13°C). Typical of humid autumn.",
  "cond_precip_es": "Necesita lluvias constantes (30–75mm). Al ser muy viscosa, requiere alta humedad ambiental.",
  "cond_precip_ca": "Necessita pluges constants (30–75mm). En ser molt viscosa, requereix alta humitat ambiental.",
  "cond_precip_en": "Needs consistent rainfall (30–75mm). Being very slimy, it requires high ambient humidity.",
  "cond_suelo_es": "Madera muerta o debilitada de haya (pH 5–7). Se encuentra en troncos y ramas altas.",
  "cond_suelo_ca": "Fusta morta o debilitada de faig (pH 5–7). Es troba en troncs i branques altes.",
  "cond_suelo_en": "Dead or weakened beech wood (pH 5–7). Found on trunks and high branches.",
  "cond_req_es": "Saprófito o parásito débil ligado estrictamente al haya. No requiere choque térmico.",
  "cond_req_ca": "Sapròfit o paràsit dèbil lligat estrictament al faig. No requereix xoc tèrmic.",
  "cond_req_en": "Saprophyte or weak parasite strictly linked to beech. Does not require thermal shock."
}'::jsonb
WHERE id = 'esp-194';

-- esp-196  Strobilurus esculentus
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Especie de clima frío (2–12°C, óptimo 7°C). Fructifica a principios de primavera.",
  "cond_temp_ca": "Espècie de clima fred (2–12°C, òptim 7°C). Fructifica a principis de primavera.",
  "cond_temp_en": "Cold climate species (2–12°C, optimum 7°C). Fruits in early spring.",
  "cond_precip_es": "Requiere lluvias de 25–65mm. Crece sobre piñas enterradas tras el deshielo.",
  "cond_precip_ca": "Requereix pluges de 25–65mm. Creix sobre pinyes enterrades després del desgel.",
  "cond_precip_en": "Requires 25–65mm of rain. Grows on buried pine cones after snowmelt.",
  "cond_suelo_es": "Sustrato específico de piñas de Picea o Pinus (pH 4.5–6.5).",
  "cond_suelo_ca": "Substrat específic de pinyes de Picea o Pinus (pH 4.5–6.5).",
  "cond_suelo_en": "Specific substrate of Picea or Pinus cones (pH 4.5–6.5).",
  "cond_req_es": "Pequeño saprófito lignícola. No requiere choque térmico, pero sí alta humedad en el suelo.",
  "cond_req_ca": "Petit sapròfit lignícola. No requereix xoc tèrmic, però sí alta humitat al sòl.",
  "cond_req_en": "Small wood-decay saprophyte. Does not require thermal shock, but needs high soil moisture."
}'::jsonb
WHERE id = 'esp-196';

-- Familia Psathyrellaceae
-- esp-166  Coprinus comatus
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Rango templado-fresco (8–18°C, óptimo 13°C). Muy común en prados tras las lluvias.",
  "cond_temp_ca": "Rang temperat-fresc (8–18°C, òptim 13°C). Molt comú en prats després de les pluges.",
  "cond_temp_en": "Temperate-cool range (8–18°C, optimum 13°C). Very common in meadows after rains.",
  "cond_precip_es": "Lluvias moderadas (15–50mm). Ciclo extremadamente rápido de 3 días antes de licuarse.",
  "cond_precip_ca": "Pluges moderades (15–50mm). Cicle extremadament ràpid de 3 dies abans de liquar-se.",
  "cond_precip_en": "Moderate rain (15–50mm). Extremely fast 3-day cycle before deliquescing.",
  "cond_suelo_es": "Suelos muy nitrogenados y removidos (pH 6–8). Bordes de caminos y jardines.",
  "cond_suelo_ca": "Sòls molt nitrogenats i remoguts (pH 6–8). Marges de camins i jardins.",
  "cond_suelo_en": "Highly nitrogenous and disturbed soils (pH 6–8). Roadsides and gardens.",
  "cond_req_es": "Saprófito nitrófilo. No requiere choque térmico. Debe consumirse muy rápido tras brotar.",
  "cond_req_ca": "Sapròfit nitròfil. No requereix xoc tèrmic. S’ha de consumir molt ràpid després de brollar.",
  "cond_req_en": "Nitrophilous saprophyte. Does not require thermal shock. Must be consumed very quickly after sprouting."
}'::jsonb
WHERE id = 'esp-166';

-- Familia Hygrophoraceae (Restantes)
-- esp-143  Hygrophorus pustulatus
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Fructifica en condiciones frescas (6–14°C), con un óptimo de 10°C. Es común en el otoño tardío.",
  "cond_temp_ca": "Fructifica en condicions fresques (6–14°C), amb un òptim de 10°C. És comú a la tardor tardana.",
  "cond_temp_en": "Fruits in cool conditions (6–14°C), with an optimum of 10°C. Common in late autumn.",
  "cond_precip_es": "Precisa lluvias moderadas de 25–65mm. Ciclo de fructificación de 9 días tras las lluvias.",
  "cond_precip_ca": "Precisa pluges moderades de 25–65mm. Cicle de fructificació de 9 dies després de les pluges.",
  "cond_precip_en": "Requires moderate rainfall of 25–65mm. 9-day fruiting cycle after rains.",
  "cond_suelo_es": "Suelos ácidos (pH 4.5–6.5) bajo coníferas y a veces en hayedos. Prefiere zonas con musgo.",
  "cond_suelo_ca": "Sòls àcids (pH 4.5–6.5) sota coníferes i de vegades en faigedes. Prefereix zones amb musgo.",
  "cond_suelo_en": "Acidic soils (pH 4.5–6.5) under conifers and sometimes in beech forests. Prefers mossy areas.",
  "cond_req_es": "Especie micorrizógena que requiere obligatoriamente helada y choque térmico para su aparición.",
  "cond_req_ca": "Espècie micorrizògena que requereix obligatòriament gelada i xoc tèrmic per a la seva aparició.",
  "cond_req_en": "Mycorrhizal species that strictly requires frost and thermal shock to appear."
}'::jsonb
WHERE id = 'esp-143';

-- esp-144  Hygrocybe punicea
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Prefiere temperaturas frescas entre 6–16°C (óptimo 11°C). Típica de prados de montaña.",
  "cond_temp_ca": "Prefereix temperatures fresques entre 6–16°C (òptim 11°C). Típica de prats de muntanya.",
  "cond_temp_en": "Prefers cool temperatures between 6–16°C (optimum 11°C). Typical of mountain meadows.",
  "cond_precip_es": "Necesita lluvias moderadas de 25–65mm. Su ciclo es de 7 días tras episodios de lluvia constante.",
  "cond_precip_ca": "Necessita pluges moderades de 25–65mm. El seu cicle és de 7 dies després d’episodis de pluja constant.",
  "cond_precip_en": "Needs moderate rainfall of 25–65mm. 7-day cycle after consistent rain episodes.",
  "cond_suelo_es": "Suelos herbosos con pH entre 5 y 7. Indicadora de prados antiguos no abonados.",
  "cond_suelo_ca": "Sòls herbosos amb pH entre 5 i 7. Indicadora de prats antics no abonats.",
  "cond_suelo_en": "Grassy soils with pH between 5 and 7. Indicator of old, unfertilized meadows.",
  "cond_req_es": "Especie saprófita pratícola de colores vivos. No requiere choque térmico pero sí alta humedad (65-80%).",
  "cond_req_ca": "Espècie sapròfita de prat de colors vius. No requereix xoc tèrmic però sí alta humitat (65-80%).",
  "cond_req_en": "Brightly colored grassland saprophyte. Does not require thermal shock but needs high humidity (65-80%)."
}'::jsonb
WHERE id = 'esp-144';

-- esp-145  Hygrocybe pratensis
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Rango de fructificación entre 6–16°C. Óptimo de 11°C.",
  "cond_precip_es": "20–60mm de lluvia. Ciclo de maduración de 7 días.",
  "cond_suelo_es": "Prados y pastizales de montaña con pH 5.5–7.",
  "cond_req_es": "Saprófito de prados. Muy apreciado por su carne firme; no requiere choque térmico."
}'::jsonb
WHERE id = 'esp-145';

-- esp-146  Hygrocybe psittacina
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Temperaturas frescas (6–16°C). Óptimo 11°C.",
  "cond_precip_es": "20–60mm de lluvia. Ciclo de 7 días.",
  "cond_suelo_es": "Suelos herbosos húmedos (pH 5–7). Característica por su color verde viscoso.",
  "cond_req_es": "Saprófito de prados. No requiere choque térmico; muy sensible a la desecación."
}'::jsonb
WHERE id = 'esp-146';

-- esp-147  Cuphophyllus virgineus
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Especie tardía (4–14°C). Óptimo a los 9°C.",
  "cond_precip_es": "20–60mm de lluvia. Ciclo de 8 días.",
  "cond_suelo_es": "Prados y zonas herbosas (pH 5.5–7).",
  "cond_req_es": "Saprófito pratícola. Requiere helada y choque térmico para activar su fructificación final."
}'::jsonb
WHERE id = 'esp-147';

-- Familia Physalacriaceae (Restantes)
-- esp-103  Flammulina velutipes
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Hongo de invierno extremo (2–14°C). Su óptimo es de 8°C.",
  "cond_precip_es": "25–65mm. Aparece tras episodios de lluvia o nieve.",
  "cond_suelo_es": "Madera de planifolios (pH 5.5–7.5), especialmente en riberas.",
  "cond_req_es": "Saprófito lignícola. Requiere obligatoriamente helada y choque térmico; soporta la congelación."
}'::jsonb
WHERE id = 'esp-103';

-- esp-104  Armillaria mellea
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Temperaturas suaves (8–18°C). Óptimo 13°C.",
  "cond_precip_es": "20–60mm. Ciclo de 7 días.",
  "cond_suelo_es": "Parásito sobre madera de diversos árboles (pH 5.5–7.5).",
  "cond_req_es": "Parásito agresivo. Requiere choque térmico para fructificar masivamente en otoño."
}'::jsonb
WHERE id = 'esp-104';

-- esp-109  Rhodotus palmatus
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Rango de 6–18°C. Óptimo a los 12°C.",
  "cond_precip_es": "30–70mm de lluvia. Ciclo de 8 días.",
  "cond_suelo_es": "Madera muerta de olmos y otros planifolios (pH 5.5–7.5).",
  "cond_req_es": "Saprófito lignícola raro. No requiere choque térmico; prefiere zonas muy húmedas de ribera."
}'::jsonb
WHERE id = 'esp-109';

-- esp-195  Oudemansiella radicata
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Rango templado (10–22°C, óptimo 16°C). Aparece desde primavera a otoño.",
  "cond_precip_es": "20–60mm. Ciclo de 6 días.",
  "cond_suelo_es": "Sobre raíces enterradas de planifolios (pH 5–7.5).",
  "cond_req_es": "Saprófito con una larga raíz característica. No requiere choque térmico."
}'::jsonb
WHERE id = 'esp-195';

-- Familia Psathyrellaceae (Restantes)
-- esp-167  Coprinellus micaceus
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Temperaturas de 8–24°C (óptimo 16°C).",
  "cond_precip_es": "20–60mm. Respuesta muy rápida (4 días).",
  "cond_suelo_es": "Madera enterrada o tocones degradados (pH 5–7.5).",
  "cond_req_es": "Saprófito lignícola muy común. No requiere choque térmico."
}'::jsonb
WHERE id = 'esp-167';

-- esp-168  Coprinopsis atramentaria
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Rango de 8–22°C. Óptimo 15°C.",
  "cond_precip_es": "20–60mm. Ciclo de 4 días.",
  "cond_suelo_es": "Suelos nitrogenados y restos de madera (pH 5.5–7.5).",
  "cond_req_es": "Saprófito. Tóxico si se consume con alcohol. No requiere choque térmico."
}'::jsonb
WHERE id = 'esp-168';

-- esp-169  Psathyrella candolleana
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Prefiere temperaturas suaves (10–22°C).",
  "cond_precip_es": "20–60mm. Ciclo de 5 días.",
  "cond_suelo_es": "Restos leñosos, jardines y bosques de planifolios (pH 5–7.5).",
  "cond_req_es": "Saprófito muy común. No requiere choque térmico."
}'::jsonb
WHERE id = 'esp-169';

-- esp-170  Panaeolus papilionaceus
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Rango templado (10–22°C).",
  "cond_precip_es": "20–60mm. Ciclo de 4 días.",
  "cond_suelo_es": "Suelos muy nitrogenados o estercolados (pH 6–7.5).",
  "cond_req_es": "Saprófito coprófilo. No requiere choque térmico."
}'::jsonb
WHERE id = 'esp-170';

-- esp-171  Lacrymaria lacrymabunda
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Fructifica entre 10–22°C (óptimo 16°C).",
  "cond_precip_es": "20–60mm. Ciclo de 5 días.",
  "cond_suelo_es": "Suelos removidos, prados y jardines (pH 5.5–7.5).",
  "cond_req_es": "Saprófito de zonas ricas en materia orgánica. No requiere choque térmico."
}'::jsonb
WHERE id = 'esp-171';