-- esp-158 Agaricus campestris
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Fructifica con temperaturas suaves de 16°C, común en prados tras lluvias primaverales y otoñales.",
  "cond_temp_ca": "Fructifica amb temperatures suaus de 16°C, comú en prats després de pluges primaverals i tardorenques.",
  "cond_temp_en": "Fruits with mild temperatures of 16°C, common in meadows after spring and autumn rains.",
  "cond_precip_es": "Requiere 65 mm de lluvia y humedad del 75%, apareciendo rápido tras el agua.",
  "cond_precip_ca": "Requereix 65 mm de pluja i humitat del 75%, apareixent ràpidament després de l’aigua.",
  "cond_precip_en": "Requires 65 mm of rain and 75% humidity, appearing quickly after precipitation.",
  "cond_suelo_es": "Suelos nitrogenados y básicos (pH 6-7.5), pastizales abonados por ganado.",
  "cond_suelo_ca": "Sòls nitrogenats i bàsics (pH 6-7.5), pastures abonades pel bestiar.",
  "cond_suelo_en": "Nitrogenous and basic soils (pH 6-7.5), pastures fertilized by livestock.",
  "cond_req_es": "Saprófita; ciclo de crecimiento muy veloz de 5 días; evitar zonas contaminadas.",
  "cond_req_ca": "Saprofita; cicle de creixement molt veloç de 5 dies; evitar zones contaminades.",
  "cond_req_en": "Saprophytic; very fast 5-day growth cycle; avoid contaminated areas."
}'::jsonb WHERE id = 'esp-158';

-- esp-159 Agaricus silvicola
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Prefiere ambientes forestales frescos con un óptimo de 13°C.",
  "cond_temp_ca": "Prefereix ambients forestals frescos amb un òptim de 13°C.",
  "cond_temp_en": "Prefers cool forest environments with an optimum of 13°C.",
  "cond_precip_es": "Necesita 65 mm de lluvia acumulada y humedad del 75% para fructificar.",
  "cond_precip_ca": "Necessita 65 mm de pluja acumulada i humitat del 75% per fructificar.",
  "cond_precip_en": "Needs 65 mm of accumulated rain and 75% humidity to fruit.",
  "cond_suelo_es": "Suelos ligeramente ácidos a neutros (pH 5-7) en bosques de pinos o hayas.",
  "cond_suelo_ca": "Sòls lleugerament àcids a neutres (pH 5-7) en boscos de pins o faigs.",
  "cond_suelo_en": "Slightly acidic to neutral soils (pH 5-7) in pine or beech forests.",
  "cond_req_es": "Saprófita; se diferencia por su amarilleamiento al roce y suave olor a anís.",
  "cond_req_ca": "Saprofita; es diferencia pel seu groguejament al frec i suau olor d’anís.",
  "cond_req_en": "Saprophytic; distinguished by yellowing when bruised and mild anise odor."
}'::jsonb WHERE id = 'esp-159';

-- esp-160 Agaricus xanthodermus
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Especie termófila (18°C) que aparece frecuentemente en jardines y zonas habitadas.",
  "cond_temp_ca": "Espècie termòfila (18°C) que apareix sovint en jardins i zones habitades.",
  "cond_temp_en": "Thermophilic species (18°C) frequently appearing in gardens and inhabited areas.",
  "cond_precip_es": "Se conforma con 60 mm de lluvia y una humedad moderada del 70%.",
  "cond_precip_ca": "Es conforma amb 60 mm de pluja i una humitat moderada del 70%.",
  "cond_precip_en": "Settles for 60 mm of rain and a moderate humidity of 70%.",
  "cond_suelo_es": "Suelos nitrogenados y antropizados (pH 6-7.5).",
  "cond_suelo_ca": "Sòls nitrogenats i antropitzats (pH 6-7.5).",
  "cond_suelo_en": "Nitrogenous and anthropized soils (pH 6-7.5).",
  "cond_req_es": "Tóxica; fuerte olor a fenol y amarilleamiento intenso e instantáneo en la base del pie.",
  "cond_req_ca": "Tòxica; forta olor de fenol i groguejament intens i instantani a la base del peu.",
  "cond_req_en": "Toxic; strong phenol odor and intense, instant yellowing at the base of the stem."
}'::jsonb WHERE id = 'esp-160';

-- esp-161 Agaricus augustus
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Templado-fresco (15°C); fructifica principalmente a finales de verano y otoño.",
  "cond_temp_ca": "Temperat-fresc (15°C); fructifica principalment a finals d’estiu i tardor.",
  "cond_temp_en": "Temperate-cool (15°C); fruits mainly in late summer and autumn.",
  "cond_precip_es": "Requiere 65 mm de lluvia y humedad del 75% en el mantillo del bosque.",
  "cond_precip_ca": "Requereix 65 mm de pluja i humitat del 75% en l’humus del bosc.",
  "cond_precip_en": "Requires 65 mm of rain and 75% humidity in the forest mulch.",
  "cond_suelo_es": "Suelos ácidos a neutros (pH 5-7) en bosques de coníferas o mixtos.",
  "cond_suelo_ca": "Sòls àcids a neutres (pH 5-7) en boscos de coníferes o mixtos.",
  "cond_suelo_en": "Acidic to neutral soils (pH 5-7) in coniferous or mixed forests.",
  "cond_req_es": "Saprófita; gran tamaño y escamas pardas; excelente comestible con aroma a almendras.",
  "cond_req_ca": "Saprofita; gran mida i escates marrons; excel·lent comestible amb aroma d’ametlles.",
  "cond_req_en": "Saprophytic; large size and brown scales; excellent edible with almond aroma."
}'::jsonb WHERE id = 'esp-161';

-- esp-162 Lepiota cristata
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Prefiere temperaturas suaves de 16°C; muy común en parques y áreas rurales.",
  "cond_temp_ca": "Prefereix temperatures suaus de 16°C; molt comú en parcs i àrees rurals.",
  "cond_temp_en": "Prefers mild temperatures of 16°C; very common in parks and rural areas.",
  "cond_precip_es": "Humedad del 70% con lluvias de 60 mm; ciclo de crecimiento de 6 días.",
  "cond_precip_ca": "Humitat del 70% amb pluges de 60 mm; cicle de creixement de 6 dies.",
  "cond_precip_en": "70% humidity with 60 mm of rain; 6-day growth cycle.",
  "cond_suelo_es": "Suelos con abundante materia orgánica y detritos (pH 5.5-7.5).",
  "cond_suelo_ca": "Sòls amb abundant matèria orgànica i detritus (pH 5.5-7.5).",
  "cond_suelo_en": "Soils with abundant organic matter and debris (pH 5.5-7.5).",
  "cond_req_es": "Mortal; olor fuerte e ingrato; sombrero con escamas concéntricas características.",
  "cond_req_ca": "Mortal; olor forta i ingrata; barret amb escates concèntriques característiques.",
  "cond_req_en": "Deadly; strong and unpleasant odor; cap with characteristic concentric scales."
}'::jsonb WHERE id = 'esp-162';

-- esp-163 Macrolepiota procera
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Templado (17°C); fructifica en claros de bosque y dehesas al final del verano.",
  "cond_temp_ca": "Temperat (17°C); fructifica en clarianes de bosc i deveses al final de l’estiu.",
  "cond_temp_en": "Temperate (17°C); fruits in forest clearings and meadows in late summer.",
  "cond_precip_es": "Necesita 60 mm de lluvia; la humedad del 74% es crítica para su desarrollo.",
  "cond_precip_ca": "Necessita 60 mm de pluja; la humitat del 74% és crítica pel seu desenvolupament.",
  "cond_precip_en": "Needs 60 mm of rain; 74% humidity is critical for its development.",
  "cond_suelo_es": "Indiferente (pH 5.5-7.5), prefiriendo terrenos silíceos bien drenados.",
  "cond_suelo_ca": "Indiferent (pH 5.5-7.5), preferint terrenys silicis ben drenats.",
  "cond_suelo_en": "Indifferent (pH 5.5-7.5), preferring well-drained siliceous terrains.",
  "cond_req_es": "Saprófita; requiere un choque térmico estival para activar la producción otoñal.",
  "cond_req_ca": "Saprofita; requereix un xoc tèrmic estival per activar la producció tardorenca.",
  "cond_req_en": "Saprophytic; requires a summer thermal shock to trigger autumn production."
}'::jsonb WHERE id = 'esp-163';

-- esp-164 Macrolepiota rhacodes
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Templado-fresco (15°C); habita zonas más sombrías y húmedas que la M. procera.",
  "cond_temp_ca": "Temperat-fresc (15°C); habita zones més ombrívoles i humides que la M. procera.",
  "cond_temp_en": "Temperate-cool (15°C); inhabits shadier and more humid areas than M. procera.",
  "cond_precip_es": "Humedad del 75% con lluvias de 65 mm acumuladas en el sotobosque.",
  "cond_precip_ca": "Humitat del 75% amb pluges de 65 mm acumulades al sotabosc.",
  "cond_precip_en": "75% humidity with 65 mm of rain accumulated in the understory.",
  "cond_suelo_es": "Suelos ricos, profundos y nitrogenados (pH 5-7.5).",
  "cond_suelo_ca": "Sòls rics, profunds i nitrogenats (pH 5-7.5).",
  "cond_suelo_en": "Rich, deep, and nitrogenous soils (pH 5-7.5).",
  "cond_req_es": "Saprófita; carne que vira a rojo al corte; excelente comestible tras cocción.",
  "cond_req_ca": "Saprofita; carn que vira a vermell al tall; excel·lent comestible després de cocció.",
  "cond_req_en": "Saprophytic; flesh that turns red when cut; excellent edible after cooking."
}'::jsonb WHERE id = 'esp-164';

-- esp-165 Leucoagaricus leucothites
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Templado-cálido (18°C); frecuente en prados, jardines y zonas de cultivo.",
  "cond_temp_ca": "Temperat-càlid (18°C); freqüent en prats, jardins i zones de cultiu.",
  "cond_temp_en": "Temperate-warm (18°C); frequent in meadows, gardens, and cultivation areas.",
  "cond_precip_es": "Se conforma con 60 mm de lluvia y una humedad del 70%.",
  "cond_precip_ca": "Es conforma amb 60 mm de pluja i una humitat del 70%.",
  "cond_precip_en": "Settles for 60 mm of rain and 70% humidity.",
  "cond_suelo_es": "Suelos básicos o neutros (pH 6-7.5), ricos en nitrógeno.",
  "cond_suelo_ca": "Sòls bàsics o neutres (pH 6-7.5), rics en nitrogen.",
  "cond_suelo_en": "Basic or neutral soils (pH 6-7.5), rich in nitrogen.",
  "cond_req_es": "Precaución por confusión con Amanitas blancas; láminas que tornan rosa pálido con la edad.",
  "cond_req_ca": "Precaució per confusió amb Amanites blanques; làmines que tornen rosa pàl·lid amb l’edat.",
  "cond_req_en": "Caution due to confusion with white Amanitas; gills that turn pale pink with age."
}'::jsonb WHERE id = 'esp-165';

-- esp-180 Calvatia gigantea
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Óptimo a 16°C; fructifica en prados abonados y claros de bosque.",
  "cond_temp_ca": "Òptim a 16°C; fructifica en prats abonats i clarianes de bosc.",
  "cond_temp_en": "Optimum at 16°C; fruits in fertilized meadows and forest clearings.",
  "cond_precip_es": "Lluvia de 65 mm y humedad del 75%; ciclo de crecimiento largo de 10 días.",
  "cond_precip_ca": "Pluja de 65 mm i humitat del 75%; cicle de creixement llarg de 10 dies.",
  "cond_precip_en": "65 mm of rain and 75% humidity; long 10-day growth cycle.",
  "cond_suelo_es": "Suelos nitrófilos y nitrogenados (pH 5.5-7.5).",
  "cond_suelo_ca": "Sòls nitròfils i nitrogenats (pH 5.5-7.5).",
  "cond_suelo_en": "Nitrophilous and nitrogenous soils (pH 5.5-7.5).",
  "cond_req_es": "Saprófita; fructificación explosiva de gran tamaño; comestible mientras el interior es blanco.",
  "cond_req_ca": "Saprofita; fructificació explosiva de gran mida; comestible mentre l’interior és blanc.",
  "cond_req_en": "Saprophytic; explosive large-scale fruiting; edible as long as the interior is white."
}'::jsonb WHERE id = 'esp-180';

-- esp-181 Lycoperdon perlatum
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Muy adaptable (16°C); presente en casi cualquier tipo de bosque.",
  "cond_temp_ca": "Molt adaptable (16°C); present en gairebé qualsevol tipus de bosc.",
  "cond_temp_en": "Very adaptable (16°C); present in almost any type of forest.",
  "cond_precip_es": "Humedad del 75% con 60 mm de lluvia; soporta variaciones hídricas.",
  "cond_precip_ca": "Humitat del 75% amb 60 mm de pluja; suporta variacions hídriques.",
  "cond_precip_en": "75% humidity with 60 mm of rain; withstands water variations.",
  "cond_suelo_es": "Suelos variados, ricos en humus y materia orgánica (pH 4.5-7).",
  "cond_suelo_ca": "Sòls variats, rics en humus i matèria orgànica (pH 4.5-7).",
  "cond_suelo_en": "Varied soils, rich in humus and organic matter (pH 4.5-7).",
  "cond_req_es": "Saprófita; exoperidio cubierto de pequeñas verrugas piramidales; ciclo de 8 días.",
  "cond_req_ca": "Saprofita; exoperidi cobert de petites verrugues piramidals; cicle de 8 dies.",
  "cond_req_en": "Saprophytic; exoperidium covered with small pyramidal warts; 8-day cycle."
}'::jsonb WHERE id = 'esp-181';

-- esp-182 Lycoperdon pyriforme
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Suave (16°C); fructifica sobre madera en descomposición de diversos árboles.",
  "cond_temp_ca": "Suau (16°C); fructifica sobre fusta en descomposició de diversos arbres.",
  "cond_temp_en": "Mild (16°C); fruits on decaying wood of various trees.",
  "cond_precip_es": "Necesita 60 mm de lluvia y humedad del 75% para su desarrollo.",
  "cond_precip_ca": "Necessita 60 mm de pluja i humitat del 75% pel seu desenvolupament.",
  "cond_precip_en": "Needs 60 mm of rain and 75% humidity for its development.",
  "cond_suelo_es": "Lignícola; sobre troncos caídos o tocones (pH 5-7).",
  "cond_suelo_ca": "Lignícola; sobre troncs caiguts o soces (pH 5-7).",
  "cond_suelo_en": "Lignicolous; on fallen logs or stumps (pH 5-7).",
  "cond_req_es": "Saprófita; crece de forma cespitosa en grandes colonias sobre madera; ciclo de 8 días.",
  "cond_req_ca": "Saprofita; creix de forma cespitosa en grans colònies sobre fusta; cicle de 8 dies.",
  "cond_req_en": "Saprophytic; grows in a caespitose manner in large colonies on wood; 8-day cycle."
}'::jsonb WHERE id = 'esp-182';

-- esp-184 Bovista plumbea
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Templado (16°C); común en pastizales y prados de montaña.",
  "cond_temp_ca": "Temperat (16°C); comú en pastures i prats de muntanya.",
  "cond_temp_en": "Temperate (16°C); common in pastures and mountain meadows.",
  "cond_precip_es": "Humedad moderada (70%) y 60 mm de lluvia acumulada.",
  "cond_precip_ca": "Humitat moderada (70%) i 60 mm de pluja acumulada.",
  "cond_precip_en": "Moderate humidity (70%) and 60 mm of accumulated rain.",
  "cond_suelo_es": "Suelos neutros a básicos (pH 5.5-7.5) en áreas abiertas.",
  "cond_suelo_ca": "Sòls neutres a bàsics (pH 5.5-7.5) en àrees obertes.",
  "cond_suelo_en": "Neutral to basic soils (pH 5.5-7.5) in open areas.",
  "cond_req_es": "Saprófita; endoperidio gris plomizo característico al madurar; ciclo de 8 días.",
  "cond_req_ca": "Saprofita; endoperidi gris plom característic en madurar; cicle de 8 dies.",
  "cond_req_en": "Saprophytic; characteristic lead-grey endoperidium upon ripening; 8-day cycle."
}'::jsonb WHERE id = 'esp-184';