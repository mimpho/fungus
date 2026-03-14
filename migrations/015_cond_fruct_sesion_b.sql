-- Familia Bankeraceae

-- esp-174 Sarcodon imbricatus
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Clima frío (10°C); especie de montaña que aparece en pinares silíceos.",
  "cond_temp_ca": "Clima fred (10°C); espècie de muntanya que apareix en pinars silicis.",
  "cond_temp_en": "Cold climate (10°C); mountain species appearing in siliceous pine forests.",
  "cond_precip_es": "Requiere 75 mm de lluvia y humedad del 80% para desarrollar sus aguijones.",
  "cond_precip_ca": "Requereix 75 mm de pluja i humitat de l’80% per desenvolupar els seus agullons.",
  "cond_precip_en": "Requires 75 mm of rain and 80% humidity to develop its spines.",
  "cond_suelo_es": "Suelos ácidos (pH 4-6) en bosques de coníferas de altura.",
  "cond_suelo_ca": "Sòls àcids (pH 4-6) en boscos de coníferes d’altura.",
  "cond_suelo_en": "Acidic soils (pH 4-6) in high-altitude coniferous forests.",
  "cond_req_es": "Excelente; ciclo de 10 días; requiere choque térmico para su aparición.",
  "cond_req_ca": "Excel·lent; cicle de 10 dies; requereix xoc tèrmic per a la seva aparició.",
  "cond_req_en": "Excellent; 10-day cycle; requires thermal shock for its appearance."
}'::jsonb WHERE id = 'esp-174';

-- esp-175 Sarcodon scabrosus
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Fresco (10°C); fructifica a finales de otoño en zonas sombrías.",
  "cond_temp_ca": "Fresc (10°C); fructifica a finals de tardor en zones ombrívoles.",
  "cond_temp_en": "Cool (10°C); fruits in late autumn in shady areas.",
  "cond_precip_es": "Humedad alta (80%) y lluvias de 75 mm.",
  "cond_precip_ca": "Humitat alta (80%) i pluges de 75 mm.",
  "cond_precip_en": "High humidity (80%) and 75 mm of rain.",
  "cond_suelo_es": "Suelos ácidos (pH 4-6) asociados a pinos o frondosas.",
  "cond_suelo_ca": "Sòls àcids (pH 4-6) associats a pins o frondoses.",
  "cond_suelo_en": "Acidic soils (pH 4-6) associated with pines or broadleaf trees.",
  "cond_req_es": "Tóxica; requiere helada y choque térmico; sabor muy amargo.",
  "cond_req_ca": "Tòxica; requereix gelada i xoc tèrmic; sabor molt amarg.",
  "cond_req_en": "Toxic; requires frost and thermal shock; very bitter taste."
}'::jsonb WHERE id = 'esp-175';

-- esp-176 Hydnellum peckii
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Frío (10°C); destaca por sus exudados rojos en ejemplares jóvenes.",
  "cond_temp_ca": "Fred (10°C); destaca pels seus exudats vermells en exemplars joves.",
  "cond_temp_en": "Cold (10°C); stands out for its red exudates in young specimens.",
  "cond_precip_es": "Humedad del 80% y lluvias de 80 mm en suelos musgosos.",
  "cond_precip_ca": "Humitat de l’80% i pluges de 80 mm en sòls muscosos.",
  "cond_precip_en": "80% humidity and 80 mm of rain in mossy soils.",
  "cond_suelo_es": "Suelos muy ácidos (pH 4-6) en bosques de montaña.",
  "cond_suelo_ca": "Sòls molt àcids (pH 4-6) en boscos de muntanya.",
  "cond_suelo_en": "Very acidic soils (pH 4-6) in mountain forests.",
  "cond_req_es": "No comestible; requiere choque térmico; hongo con forma de corcho.",
  "cond_req_ca": "No comestible; requereix xoc tèrmic; bolet amb forma de suro.",
  "cond_req_en": "Non-edible; requires thermal shock; cork-shaped fungus."
}'::jsonb WHERE id = 'esp-176';

-- Familia Entolomataceae

-- esp-142 Entoloma sinuatum
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Templado (16°C); aparece en verano y otoño en bosques de frondosas.",
  "cond_temp_ca": "Temperat (16°C); apareix a l’estiu i tardor en boscos de frondoses.",
  "cond_temp_en": "Temperate (16°C); appears in summer and autumn in broadleaf forests.",
  "cond_precip_es": "Humedad del 70% y lluvias de 60 mm.",
  "cond_precip_ca": "Humitat del 70% i pluges de 60 mm.",
  "cond_precip_en": "70% humidity and 60 mm of rain.",
  "cond_suelo_es": "Suelos calizos (pH 6-8) bajo hayas, robles o encinas.",
  "cond_suelo_ca": "Sòls calcaris (pH 6-8) sota faigs, roures o alzines.",
  "cond_suelo_en": "Limestone soils (pH 6-8) under beech, oak, or holm oak.",
  "cond_req_es": "Tóxica; ciclo de 7 días; olor harinoso que puede confundir.",
  "cond_req_ca": "Tòxica; cicle de 7 dies; olor farinosa que pot confondre.",
  "cond_req_en": "Toxic; 7-day cycle; mealy odor that can be confusing."
}'::jsonb WHERE id = 'esp-142';

-- esp-145 Entoloma clypeatum
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Primaveral (14°C); asociada a rosáceas silvestres.",
  "cond_temp_ca": "Primaveral (14°C); associada a rosàcies silvestres.",
  "cond_temp_en": "Springtime (14°C); associated with wild Rosaceae.",
  "cond_precip_es": "Requiere 65 mm de lluvia primaveral y humedad del 75%.",
  "cond_precip_ca": "Requereix 65 mm de pluja primaveral i humitat del 75%.",
  "cond_precip_en": "Requires 65 mm of spring rain and 75% humidity.",
  "cond_suelo_es": "Suelos neutros o básicos (pH 6-7.5) cerca de setos o lindes.",
  "cond_suelo_ca": "Sòls neutres o bàsics (pH 6-7.5) a prop de bardisses o marges.",
  "cond_suelo_en": "Neutral or basic soils (pH 6-7.5) near hedges or borders.",
  "cond_req_es": "Buen comestible; ciclo de 6 días; sombrero con mamelón y láminas rosadas.",
  "cond_req_ca": "Bon comestible; cicle de 6 dies; barret amb mamelló i làmines rosades.",
  "cond_req_en": "Good edible; 6-day cycle; capped with an umbo and pink gills."
}'::jsonb WHERE id = 'esp-145';

-- Familia Hygrophoraceae

-- esp-071 Hygrophorus latitabundus
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Templado-fresco (12°C); una de las joyas de los pinares mediterráneos.",
  "cond_temp_ca": "Temperat-fresc (12°C); una de les joies dels pinars mediterranis.",
  "cond_temp_en": "Temperate-cool (12°C); one of the jewels of Mediterranean pine forests.",
  "cond_precip_es": "Necesita 65 mm de lluvia y humedad del 75%.",
  "cond_precip_ca": "Necessita 65 mm de pluja i humitat del 75%.",
  "cond_precip_en": "Needs 65 mm of rain and 75% humidity.",
  "cond_suelo_es": "Suelos calizos (pH 6.5-8) bajo pinos (P. sylvestris).",
  "cond_suelo_ca": "Sòls calcaris (pH 6.5-8) sota pins (P. sylvestris).",
  "cond_suelo_en": "Limestone soils (pH 6.5-8) under pines (P. sylvestris).",
  "cond_req_es": "Excelente; ciclo de 9 días; sombrero muy viscoso y pie grueso.",
  "cond_req_ca": "Excel·lent; cicle de 9 dies; barret molt viscós i peu gruixut.",
  "cond_req_en": "Excellent; 9-day cycle; very slimy cap and thick stem."
}'::jsonb WHERE id = 'esp-071';

-- esp-074 Hygrophorus marzuolus
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Frío (7°C); la primera gran seta tras el invierno.",
  "cond_temp_ca": "Fred (7°C); el primer gran bolet després de l’hivern.",
  "cond_temp_en": "Cold (7°C); the first great mushroom after winter.",
  "cond_precip_es": "Humedad muy alta (82%) y lluvias de 75 mm tras el deshielo.",
  "cond_precip_ca": "Humitat molt alta (82%) i pluges de 75 mm després del desgel.",
  "cond_precip_en": "Very high humidity (82%) and 75 mm of rain after snowmelt.",
  "cond_suelo_es": "Suelos ácidos (pH 4.5-6) en bosques mixtos de pino y haya.",
  "cond_suelo_ca": "Sòls àcids (pH 4.5-6) en boscos mixtos de pi i faig.",
  "cond_suelo_en": "Acidic soils (pH 4.5-6) in mixed pine and beech forests.",
  "cond_req_es": "Excelente; ciclo de 10 días; aparece semienterrada bajo el musgo.",
  "cond_req_ca": "Excel·lent; cicle de 10 dies; apareix semienterrat sota la molsa.",
  "cond_req_en": "Excellent; 10-day cycle; appears semi-buried under moss."
}'::jsonb WHERE id = 'esp-074';

-- Familia Hymenogastraceae

-- esp-146 Hebeloma crustuliniforme
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Templado-fresco (13°C); común en otoño en diversos tipos de bosque.",
  "cond_temp_ca": "Temperat-fresc (13°C); comú a la tardor en diversos tipus de bosc.",
  "cond_temp_en": "Temperate-cool (13°C); common in autumn in various forest types.",
  "cond_precip_es": "Humedad del 72% y lluvias de 60 mm.",
  "cond_precip_ca": "Humitat del 72% i pluges de 60 mm.",
  "cond_precip_en": "72% humidity and 60 mm of rain.",
  "cond_suelo_es": "Indiferente (pH 5.5-7.5); suelos ricos en materia orgánica.",
  "cond_suelo_ca": "Indiferent (pH 5.5-7.5); sòls rics en matèria orgànica.",
  "cond_suelo_en": "Indifferent (pH 5.5-7.5); soils rich in organic matter.",
  "cond_req_es": "Tóxica; ciclo de 7 días; olor característico a rábano.",
  "cond_req_ca": "Tòxica; cicle de 7 dies; olor característica de raves.",
  "cond_req_en": "Toxic; 7-day cycle; characteristic radish smell."
}'::jsonb WHERE id = 'esp-146';

-- esp-147 Hebeloma sinapizans
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Templado (14°C); suele aparecer en grupos en el sotobosque.",
  "cond_temp_ca": "Temperat (14°C); sol aparèixer en grups al sotabosc.",
  "cond_temp_en": "Temperate (14°C); usually appears in groups in the undergrowth.",
  "cond_precip_es": "Humedad del 70% y lluvias de 60 mm.",
  "cond_precip_ca": "Humitat del 70% i pluges de 60 mm.",
  "cond_precip_en": "70% humidity and 60 mm of rain.",
  "cond_suelo_es": "Suelos calizos (pH 6-8) bajo robles o hayas.",
  "cond_suelo_ca": "Sòls calcaris (pH 6-8) sota roures o faigs.",
  "cond_suelo_en": "Limestone soils (pH 6-8) under oaks or beeches.",
  "cond_req_es": "Tóxica; ciclo de 7 días; olor fétido o de rábano muy marcado.",
  "cond_req_ca": "Tòxica; cicle de 7 dies; olor fètida o de raves molt marcada.",
  "cond_req_en": "Toxic; 7-day cycle; foul or very marked radish odor."
}'::jsonb WHERE id = 'esp-147';

-- Familia Physalacriaceae

-- esp-194 Oudemansiella mucida
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Fresco (13°C); parásita o saprófita en troncos de haya.",
  "cond_temp_ca": "Fresc (13°C); paràsita o saprofita en troncs de faig.",
  "cond_temp_en": "Cool (13°C); parasitic or saprophytic on beech trunks.",
  "cond_precip_es": "Alta humedad (82%) y lluvias de 75 mm.",
  "cond_precip_ca": "Alta humitat (82%) i pluges de 75 mm.",
  "cond_precip_en": "High humidity (82%) and 75 mm of rain.",
  "cond_suelo_es": "Lignícola; sobre madera muerta o debilitada de haya (pH 5-7).",
  "cond_suelo_ca": "Lignícola; sobre fusta morta o debilitada de faig (pH 5-7).",
  "cond_suelo_en": "Lignicolous; on dead or weakened beech wood (pH 5-7).",
  "cond_req_es": "Comestible; ciclo de 7 días; extremadamente viscosa y de color blanco.",
  "cond_req_ca": "Comestible; cicle de 7 dies; extremadament viscosa i de color blanc.",
  "cond_req_en": "Edible; 7-day cycle; extremely slimy and white in color."
}'::jsonb WHERE id = 'esp-194';

-- esp-195 Oudemansiella radicata
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Templado (16°C); fructifica sobre raíces enterradas.",
  "cond_temp_ca": "Temperat (16°C); fructifica sobre arrels enterrades.",
  "cond_temp_en": "Temperate (16°C); fruits on buried roots.",
  "cond_precip_es": "Humedad del 75% y lluvias de 60 mm.",
  "cond_precip_ca": "Humitat del 75% i pluges de 60 mm.",
  "cond_precip_en": "75% humidity and 60 mm of rain.",
  "cond_suelo_es": "Suelos profundos ricos en humus (pH 5-7.5).",
  "cond_suelo_ca": "Sòls profunds rics en humus (pH 5-7.5).",
  "cond_suelo_en": "Deep humus-rich soils (pH 5-7.5).",
  "cond_req_es": "Comestible; ciclo de 6 días; pie muy largo que se entierra profundamente.",
  "cond_req_ca": "Comestible; cicle de 6 dies; peu molt llarg que s’enterra profundament.",
  "cond_req_en": "Edible; 6-day cycle; very long stem that buries deeply."
}'::jsonb WHERE id = 'esp-195';

-- esp-196 Strobilurus esculentus
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Frío (7°C); pequeña especie primaveral que nace de piñas.",
  "cond_temp_ca": "Fred (7°C); petita espècie primaveral que neix de pinyes.",
  "cond_temp_en": "Cold (7°C); small spring species that grows from pine cones.",
  "cond_precip_es": "Humedad del 80% y lluvias de 65 mm.",
  "cond_precip_ca": "Humitat de l’80% i pluges de 65 mm.",
  "cond_precip_en": "80% humidity and 65 mm of rain.",
  "cond_suelo_es": "Suelos ácidos (pH 4.5-6.5); crece sobre piñas enterradas de picea.",
  "cond_suelo_ca": "Sòls àcids (pH 4.5-6.5); creix sobre pinyes enterrades de picea.",
  "cond_suelo_en": "Acidic soils (pH 4.5-6.5); grows on buried spruce cones.",
  "cond_req_es": "Comestible; ciclo de 8 días; requiere el deshielo para fructificar.",
  "cond_req_ca": "Comestible; cicle de 8 dies; requereix el desgel per fructificar.",
  "cond_req_en": "Edible; 8-day cycle; requires snowmelt to fruit."
}'::jsonb WHERE id = 'esp-196';

-- Familia Psathyrellaceae

-- esp-166 Coprinus comatus
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Templado-fresco (13°C); aparece en jardines y zonas nitrogenadas.",
  "cond_temp_ca": "Temperat-fresc (13°C); apareix en jardins i zones nitrogenades.",
  "cond_temp_en": "Temperate-cool (13°C); appears in gardens and nitrogenous areas.",
  "cond_precip_es": "Humedad del 70% y lluvias de 50 mm.",
  "cond_precip_ca": "Humitat del 70% i pluges de 50 mm.",
  "cond_precip_en": "70% humidity and 50 mm of rain.",
  "cond_suelo_es": "Suelos muy abonados y removidos (pH 6-8).",
  "cond_suelo_ca": "Sòls molt abonats i remoguts (pH 6-8).",
  "cond_suelo_en": "Very fertilized and disturbed soils (pH 6-8).",
  "cond_req_es": "Excelente; ciclo de 3 días; se consume solo de joven antes de que se vuelva tinta.",
  "cond_req_ca": "Excel·lent; cicle de 3 dies; es consumeix només de jove abans que es torni tinta.",
  "cond_req_en": "Excellent; 3-day cycle; consumed only when young before it turns to ink."
}'::jsonb WHERE id = 'esp-166';