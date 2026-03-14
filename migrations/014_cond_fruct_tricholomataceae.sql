-- esp-090 Tricholoma equestre
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Fresco (13°C); típica de pinares arenosos durante el otoño tardío.",
  "cond_temp_ca": "Fresc (13°C); típica de pinars sorrencs durant la tardor tardana.",
  "cond_temp_en": "Cool (13°C); typical of sandy pine forests during late autumn.",
  "cond_precip_es": "Requiere 75 mm de lluvia y humedad del 78%.",
  "cond_precip_ca": "Requereix 75 mm de pluja i humitat del 78%.",
  "cond_precip_en": "Requires 75 mm of rain and 78% humidity.",
  "cond_suelo_es": "Suelos muy arenosos y ácidos (pH 5-6.5) bajo Pinus pinaster.",
  "cond_suelo_ca": "Sòls molt sorrencs i àcids (pH 5-6.5) sota Pinus pinaster.",
  "cond_suelo_en": "Very sandy and acidic soils (pH 5-6.5) under Pinus pinaster.",
  "cond_req_es": "Tóxica; requiere choque térmico; color amarillo intenso en láminas y pie.",
  "cond_req_ca": "Tòxica; requereix xoc tèrmic; color groc intens en làmines i peu.",
  "cond_req_en": "Toxic; requires thermal shock; intense yellow color on gills and stem."
}'::jsonb WHERE id = 'esp-090';

-- esp-091 Tricholoma scalpturatum
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Templado-fresco (14°C); muy común en diversos hábitats forestales.",
  "cond_temp_ca": "Temperat-fresc (14°C); molt comú en diversos hàbitats forestals.",
  "cond_temp_en": "Temperate-cool (14°C); very common in various forest habitats.",
  "cond_precip_es": "Humedad del 80% y lluvias acumuladas de 65 mm.",
  "cond_precip_ca": "Humitat de l’80% i pluges acumulades de 65 mm.",
  "cond_precip_en": "80% humidity and accumulated rainfall of 65 mm.",
  "cond_suelo_es": "Indiferente (pH 5.5-7), prefiere suelos algo húmedos.",
  "cond_suelo_ca": "Indiferent (pH 5.5-7), prefereix sòls una mica humits.",
  "cond_suelo_en": "Indifferent (pH 5.5-7), prefers somewhat damp soils.",
  "cond_req_es": "Buen comestible; ciclo de 7 días; amarillea con la edad o al roce.",
  "cond_req_ca": "Bon comestible; cicle de 7 dies; es torna groc amb l’edat o al frec.",
  "cond_req_en": "Good edible; 7-day cycle; yellows with age or when bruised."
}'::jsonb WHERE id = 'esp-091';

-- esp-092 Tricholoma terreum
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Frío (11.5°C); fructifica abundantemente tras las primeras heladas.",
  "cond_temp_ca": "Fred (11.5°C); fructifica abundosament després de les primeres gelades.",
  "cond_temp_en": "Cold (11.5°C); fruits abundantly after the first frosts.",
  "cond_precip_es": "Requiere 78 mm de lluvia y humedad del 65%.",
  "cond_precip_ca": "Requereix 78 mm de pluja i humitat del 65%.",
  "cond_precip_en": "Requires 78 mm of rain and 65% humidity.",
  "cond_suelo_es": "Suelos calizos o neutros (pH 5.5-7) bajo coníferas.",
  "cond_suelo_ca": "Sòls calcaris o neutres (pH 5.5-7) sota coníferes.",
  "cond_suelo_en": "Calcareous or neutral soils (pH 5.5-7) under conifers.",
  "cond_req_es": "Precaución; requiere helada previa; sombrero gris ratón y láminas blancas.",
  "cond_req_ca": "Precaució; requereix gelada prèvia; barret gris ratolí i làmines blanques.",
  "cond_req_en": "Caution; requires previous frost; mouse-grey cap and white gills."
}'::jsonb WHERE id = 'esp-092';

-- esp-093 Tricholoma sulphureum
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Templado (13°C); común en bosques de frondosas durante el otoño.",
  "cond_temp_ca": "Temperat (13°C); comú en boscos de frondoses durant la tardor.",
  "cond_temp_en": "Temperate (13°C); common in broadleaf forests during autumn.",
  "cond_precip_es": "Humedad del 75% y lluvias de 60 mm.",
  "cond_precip_ca": "Humitat del 75% i pluges de 60 mm.",
  "cond_precip_en": "75% humidity and 60 mm of rain.",
  "cond_suelo_es": "Suelos neutros a calizos (pH 5-7) bajo hayas o robles.",
  "cond_suelo_ca": "Sòls neutres a calcaris (pH 5-7) sota faigs o roures.",
  "cond_suelo_en": "Neutral to calcareous soils (pH 5-7) under beech or oak.",
  "cond_req_es": "Tóxica; olor muy fuerte y desagradable a gas o azufre.",
  "cond_req_ca": "Tòxica; olor molt forta i desagradable a gas o sofre.",
  "cond_req_en": "Toxic; very strong and unpleasant gas or sulfur odor."
}'::jsonb WHERE id = 'esp-093';

-- esp-094 Tricholoma saponaceum
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Muy adaptable (13°C); presente en gran variedad de bosques.",
  "cond_temp_ca": "Molt adaptable (13°C); present en gran varietat de boscos.",
  "cond_temp_en": "Very adaptable (13°C); present in a wide variety of forests.",
  "cond_precip_es": "Humedad del 75% y lluvias de 60 mm.",
  "cond_precip_ca": "Humitat del 75% i pluges de 60 mm.",
  "cond_precip_en": "75% humidity and 60 mm of rain.",
  "cond_suelo_es": "Indiferente (pH 5-7), desde suelos muy ácidos a calizos.",
  "cond_suelo_ca": "Indiferent (pH 5-7), des de sòls molt àcids a calcaris.",
  "cond_suelo_en": "Indifferent (pH 5-7), from very acidic to calcareous soils.",
  "cond_req_es": "Tóxica; olor característico a jabón de lavar; color muy variable.",
  "cond_req_ca": "Tòxica; olor característica de sabó de rentar; color molt variable.",
  "cond_req_en": "Toxic; characteristic laundry soap smell; very variable color."
}'::jsonb WHERE id = 'esp-094';

-- esp-097 Infundibulicybe geotropa
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Templado (15.5°C); fructifica en claros de bosque y bordes de prados.",
  "cond_temp_ca": "Temperat (15.5°C); fructifica en clarianes de bosc i marges de prats.",
  "cond_temp_en": "Temperate (15.5°C); fruits in forest clearings and meadow edges.",
  "cond_precip_es": "Requiere 65 mm de lluvia y humedad del 75% para su gran porte.",
  "cond_precip_ca": "Requereix 65 mm de pluja i humitat del 75% per al seu gran port.",
  "cond_precip_en": "Requires 65 mm of rain and 75% humidity for its large size.",
  "cond_suelo_es": "Suelos básicos o neutros (pH 6-7.5) con abundante materia orgánica.",
  "cond_suelo_ca": "Sòls bàsics o neutres (pH 6-7.5) amb abundant matèria orgànica.",
  "cond_suelo_en": "Basic or neutral soils (pH 6-7.5) with abundant organic matter.",
  "cond_req_es": "Buen comestible; ciclo de 9 días; forma de embudo con un mamelón central.",
  "cond_req_ca": "Bon comestible; cicle de 9 dies; forma d’embut amb un mamelló central.",
  "cond_req_en": "Good edible; 9-day cycle; funnel-shaped with a central umbo."
}'::jsonb WHERE id = 'esp-097';

-- esp-098 Clitocybe nebularis
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Fresco (13°C); muy común a finales de otoño formando corros de brujas.",
  "cond_temp_ca": "Fresc (13°C); molt comú a finals de tardor formant erols.",
  "cond_temp_en": "Cool (13°C); very common in late autumn forming fairy rings.",
  "cond_precip_es": "Alta pluviosidad (60 mm) y humedad del 78% en el sotobosque.",
  "cond_precip_ca": "Alta pluviositat (60 mm) i humitat de l’78% al sotabosc.",
  "cond_precip_en": "High rainfall (60 mm) and 78% humidity in the undergrowth.",
  "cond_suelo_es": "Suelos ácidos a neutros (pH 5.5-7.5) con abundante mantillo.",
  "cond_suelo_ca": "Sòls àcids a neutres (pH 5.5-7.5) amb abundant humus.",
  "cond_suelo_en": "Acidic to neutral soils (pH 5.5-7.5) with abundant mulch.",
  "cond_req_es": "Precaución; requiere choque térmico; olor fuerte y característico a moho.",
  "cond_req_ca": "Precaució; requereix xoc tèrmic; olor forta i característica de florit.",
  "cond_req_en": "Caution; requires thermal shock; strong and characteristic musty odor."
}'::jsonb WHERE id = 'esp-098';

-- esp-099 Clitocybe odora
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Templado (13°C); destaca por su color verdoso y fuerte olor a anís.",
  "cond_temp_ca": "Temperat (13°C); destaca pel seu color verdós i forta olor d’anís.",
  "cond_temp_en": "Temperate (13°C); stands out for its greenish color and strong anise smell.",
  "cond_precip_es": "Humedad del 75% y lluvias de 65 mm para su correcto desarrollo.",
  "cond_precip_ca": "Humitat del 75% i pluges de 65 mm pel seu correcte desenvolupament.",
  "cond_precip_en": "75% humidity and 65 mm of rain for its correct development.",
  "cond_suelo_es": "Suelos variados (pH 5-7) en bosques de frondosas o mixtos.",
  "cond_suelo_ca": "Sòls variats (pH 5-7) en boscos de frondoses o mixtos.",
  "cond_suelo_en": "Varied soils (pH 5-7) in broadleaf or mixed forests.",
  "cond_req_es": "Comestible; ciclo de 7 días; excelente como condimento por su aroma.",
  "cond_req_ca": "Comestible; cicle de 7 dies; excel·lent com a condiment pel seu aroma.",
  "cond_req_en": "Edible; 7-day cycle; excellent as a condiment due to its aroma."
}'::jsonb WHERE id = 'esp-099';

-- esp-100 Clitocybe dealbata
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Templado (14°C); especie peligrosa que crece en prados y céspedes.",
  "cond_temp_ca": "Temperat (14°C); espècie perillosa que creix en prats i gespes.",
  "cond_temp_en": "Temperate (14°C); dangerous species that grows in meadows and lawns.",
  "cond_precip_es": "Humedad del 75% con lluvias de 60 mm; aparece tras periodos húmedos.",
  "cond_precip_ca": "Humitat del 75% amb pluges de 60 mm; apareix després de períodes humits.",
  "cond_precip_en": "75% humidity with 60 mm of rain; appears after wet periods.",
  "cond_suelo_es": "Suelos nitrogenados y neutros (pH 5.5-7.5) en áreas abiertas.",
  "cond_suelo_ca": "Sòls nitrogenats i neutres (pH 5.5-7.5) en àrees obertes.",
  "cond_suelo_en": "Nitrogenous and neutral soils (pH 5.5-7.5) in open areas.",
  "cond_req_es": "Mortal; ciclo de 6 días; contiene muscarina; evitar confusión con senderuelas.",
  "cond_req_ca": "Mortal; cicle de 6 dies; conté muscarina; evitar confusió amb carreretes.",
  "cond_req_en": "Deadly; 6-day cycle; contains muscarine; avoid confusion with fairy ring mushrooms."
}'::jsonb WHERE id = 'esp-100';

-- esp-101 Lepista nuda
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Fresco (10°C); fructifica a finales de otoño e incluso con las primeras heladas.",
  "cond_temp_ca": "Fresc (10°C); fructifica a finals de tardor i fins i tot amb les primeres gelades.",
  "cond_temp_en": "Cool (10°C); fruits in late autumn and even with the first frosts.",
  "cond_precip_es": "Necesita 60 mm de lluvia y una humedad del 80% en el mantillo.",
  "cond_precip_ca": "Necessita 60 mm de pluja i una humitat de l’80% en l’humus.",
  "cond_precip_en": "Needs 60 mm of rain and 80% humidity in the mulch.",
  "cond_suelo_es": "Suelos ricos en materia orgánica (pH 5.5-7.5) en diversos bosques.",
  "cond_suelo_ca": "Sòls rics en matèria orgànica (pH 5.5-7.5) en diversos boscos.",
  "cond_suelo_en": "Soils rich in organic matter (pH 5.5-7.5) in various forests.",
  "cond_req_es": "Bueno; requiere choque térmico; destaca por su coloración violeta completa.",
  "cond_req_ca": "Bo; requereix xoc tèrmic; destaca per la seva coloració violeta completa.",
  "cond_req_en": "Good; requires thermal shock; notable for its complete violet coloration."
}'::jsonb WHERE id = 'esp-101';

-- esp-102 Lepista personata
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Frío (9°C); especie tardía que aparece en prados y dehesas.",
  "cond_temp_ca": "Fred (9°C); espècie tardana que apareix en prats i deveses.",
  "cond_temp_en": "Cold (9°C); late species that appears in meadows and pastures.",
  "cond_precip_es": "Requiere 65 mm de lluvia y humedad del 80%; muy resistente al frío.",
  "cond_precip_ca": "Requereix 65 mm de pluja i humitat de l’80%; molt resistent al fred.",
  "cond_precip_en": "Requires 65 mm of rain and 80% humidity; very resistant to cold.",
  "cond_suelo_es": "Suelos básicos o neutros (pH 6-7.5) ricos en nutrientes.",
  "cond_suelo_ca": "Sòls bàsics o neutres (pH 6-7.5) rics en nutrients.",
  "cond_suelo_en": "Basic or neutral soils (pH 6-7.5) rich in nutrients.",
  "cond_req_es": "Comestible; requiere helada y choque térmico; pie violeta y sombrero ocre.",
  "cond_req_ca": "Comestible; requereix gelada i xoc tèrmic; peu violeta i barret ocre.",
  "cond_req_en": "Edible; requires frost and thermal shock; violet stem and ochre cap."
}'::jsonb WHERE id = 'esp-102';