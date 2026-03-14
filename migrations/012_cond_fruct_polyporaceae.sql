-- esp-077 Panus conchatus
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Prefiere ambientes templados con una temperatura óptima de 18°C.",
  "cond_temp_ca": "Prefereix ambients temperats amb una temperatura òptima de 18°C.",
  "cond_temp_en": "Prefers temperate environments with an optimal temperature of 18°C.",
  "cond_precip_es": "Requiere 60 mm de lluvia y una humedad del 75% para fructificar.",
  "cond_precip_ca": "Requereix 60 mm de pluja i una humitat del 75% per fructificar.",
  "cond_precip_en": "Requires 60 mm of rain and 75% humidity to fruit.",
  "cond_suelo_es": "Lignícola; crece sobre tocones de frondosas como robles o hayas (pH 5-7.5).",
  "cond_suelo_ca": "Lignícola; creix sobre soces de frondoses com roures o faigs (pH 5-7.5).",
  "cond_suelo_en": "Lignicolous; grows on stumps of broadleaf trees like oaks or beeches (pH 5-7.5).",
  "cond_req_es": "Saprófita; ciclo de crecimiento de 7 días; sombrero con forma de concha.",
  "cond_req_ca": "Saprofita; cicle de creixement de 7 dies; barret amb forma de petxina.",
  "cond_req_en": "Saprophytic; 7-day growth cycle; shell-shaped cap."
}'::jsonb WHERE id = 'esp-077';

-- esp-128 Laetiporus sulphureus
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Especie termófila con un óptimo de 20°C; aparece en primavera y verano.",
  "cond_temp_ca": "Espècie termòfila amb un òptim de 20°C; apareix a la primavera i l’estiu.",
  "cond_temp_en": "Thermophilic species with an optimum of 20°C; appears in spring and summer.",
  "cond_precip_es": "Humedad del 70% y lluvias moderadas de 60 mm.",
  "cond_precip_ca": "Humitat del 70% i pluges moderades de 60 mm.",
  "cond_precip_en": "70% humidity and moderate rainfall of 60 mm.",
  "cond_suelo_es": "Parásita y saprófita sobre troncos vivos o muertos (pH 5.5-7.5).",
  "cond_suelo_ca": "Paràsita i saprofita sobre troncs vius o morts (pH 5.5-7.5).",
  "cond_suelo_en": "Parasitic and saprophytic on living or dead trunks (pH 5.5-7.5).",
  "cond_req_es": "Comestible de joven; ciclo largo de 14 días; llamativo color amarillo-naranja.",
  "cond_req_ca": "Comestible de jove; cicle llarg de 14 dies; cridaner color groc-taronja.",
  "cond_req_en": "Edible when young; long 14-day cycle; striking yellow-orange color."
}'::jsonb WHERE id = 'esp-128';

-- esp-129 Fomes fomentarius
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Muy resistente; temperatura óptima de 15°C pero tolera grandes rangos.",
  "cond_temp_ca": "Molt resistent; temperatura òptima de 15°C però tolera grans rangs.",
  "cond_temp_en": "Very resistant; optimal temperature of 15°C but tolerates wide ranges.",
  "cond_precip_es": "Humedad del 70% y 60 mm de lluvia; presente todo el año.",
  "cond_precip_ca": "Humitat del 70% i 60 mm de pluja; present tot l’any.",
  "cond_precip_en": "70% humidity and 60 mm of rain; present all year round.",
  "cond_suelo_es": "Lignícola; común sobre hayas y abedules debilitados (pH 5-7.5).",
  "cond_suelo_ca": "Lignícola; comú sobre faigs i bedolls debilitats (pH 5-7.5).",
  "cond_suelo_en": "Lignicolous; common on weakened beech and birch trees (pH 5-7.5).",
  "cond_req_es": "Saprófita; ciclo de 30 días; perenne con forma de pezuña de caballo.",
  "cond_req_ca": "Saprofita; cicle de 30 dies; perenne amb forma de peülla de cavall.",
  "cond_req_en": "Saprophytic; 30-day cycle; perennial with horse-hoof shape."
}'::jsonb WHERE id = 'esp-129';

-- esp-130 Trametes versicolor
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Adaptable, con un óptimo de 16.5°C; fructifica durante todo el año.",
  "cond_temp_ca": "Adaptable, amb un òptim de 16.5°C; fructifica durant tot l’any.",
  "cond_temp_en": "Adaptable, with an optimum of 16.5°C; fruits throughout the year.",
  "cond_precip_es": "Requiere 60 mm de lluvia y humedad del 72% en la madera.",
  "cond_precip_ca": "Requereix 60 mm de pluja i humitat del 72% en la fusta.",
  "cond_precip_en": "Requires 60 mm of rain and 72% humidity in the wood.",
  "cond_suelo_es": "Lignícola; sobre troncos y ramas en descomposición (pH 5-7.5).",
  "cond_suelo_ca": "Lignícola; sobre troncs i branques en descomposició (pH 5-7.5).",
  "cond_suelo_en": "Lignicolous; on decaying trunks and branches (pH 5-7.5).",
  "cond_req_es": "Saprófita; ciclo de 20 días; bandas concéntricas de diversos colores.",
  "cond_req_ca": "Saprofita; cicle de 20 dies; bandes concèntriques de diversos colors.",
  "cond_req_en": "Saprophytic; 20-day cycle; concentric bands of various colors."
}'::jsonb WHERE id = 'esp-130';

-- esp-131 Trametes gibbosa
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Templado (15°C); habitual en bosques de frondosas sombríos.",
  "cond_temp_ca": "Temperat (15°C); habitual en boscos de frondoses ombrívols.",
  "cond_temp_en": "Temperate (15°C); habitual in shady broadleaf forests.",
  "cond_precip_es": "Necesita 60 mm de lluvia y humedad ambiental del 70%.",
  "cond_precip_ca": "Necessita 60 mm de pluja i humitat ambiental del 70%.",
  "cond_precip_en": "Needs 60 mm of rain and 70% ambient humidity.",
  "cond_suelo_es": "Lignícola; especialmente sobre tocones de haya (pH 5-7.5).",
  "cond_suelo_ca": "Lignícola; especialment sobre soces de faig (pH 5-7.5).",
  "cond_suelo_en": "Lignicolous; especially on beech stumps (pH 5-7.5).",
  "cond_req_es": "Saprófita; ciclo de 20 días; poros alargados radialmente.",
  "cond_req_ca": "Saprofita; cicle de 20 dies; porus allargats radialment.",
  "cond_req_en": "Saprophytic; 20-day cycle; radially elongated pores."
}'::jsonb WHERE id = 'esp-131';

-- esp-135 Polyporus squamosus
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Templado (18°C); aparece principalmente en primavera y verano.",
  "cond_temp_ca": "Temperat (18°C); apareix principalment a la primavera i l’estiu.",
  "cond_temp_en": "Temperate (18°C); appears mainly in spring and summer.",
  "cond_precip_es": "Humedad del 70% y lluvias de 60 mm para un rápido desarrollo.",
  "cond_precip_ca": "Humitat del 70% i pluges de 60 mm per a un ràpid desenvolupament.",
  "cond_precip_en": "70% humidity and 60 mm of rain for rapid development.",
  "cond_suelo_es": "Lignícola; sobre troncos de árboles de ribera y frondosas (pH 5.5-7.5).",
  "cond_suelo_ca": "Lignícola; sobre troncs d’arbres de ribera i frondoses (pH 5.5-7.5).",
  "cond_suelo_en": "Lignicolous; on trunks of riparian and broadleaf trees (pH 5.5-7.5).",
  "cond_req_es": "Saprófita y parásita; ciclo de 7 días; olor característico a pepino.",
  "cond_req_ca": "Saprofita i paràsita; cicle de 7 dies; olor característica a pebrot.",
  "cond_req_en": "Saprophytic and parasitic; 7-day cycle; characteristic cucumber smell."
}'::jsonb WHERE id = 'esp-135';

-- esp-136 Pycnoporus cinnabarinus
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Termófila (18°C); prefiere zonas expuestas y soleadas.",
  "cond_temp_ca": "Termòfila (18°C); prefereix zones exposades i assolellades.",
  "cond_temp_en": "Thermophilic (18°C); prefers exposed and sunny areas.",
  "cond_precip_es": "Humedad moderada (65%) y lluvias de 55 mm.",
  "cond_precip_ca": "Humitat moderada (65%) i pluges de 55 mm.",
  "cond_precip_en": "Moderate humidity (65%) and rainfall of 55 mm.",
  "cond_suelo_es": "Lignícola; sobre madera muerta de frondosas (pH 5-7.5).",
  "cond_suelo_ca": "Lignícola; sobre fusta morta de frondoses (pH 5-7.5).",
  "cond_suelo_en": "Lignicolous; on dead wood of broadleaf trees (pH 5-7.5).",
  "cond_req_es": "Saprófita; ciclo de 20 días; color rojo cinabrio muy intenso.",
  "cond_req_ca": "Saprofita; cicle de 20 dies; color vermell cinabri molt intens.",
  "cond_req_en": "Saprophytic; 20-day cycle; very intense cinnabar red color."
}'::jsonb WHERE id = 'esp-136';

-- esp-137 Daedalea quercina
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Resistente (16.5°C); habitual en robledales y encinares.",
  "cond_temp_ca": "Resistent (16.5°C); habitual en rouredes i alzinars.",
  "cond_temp_en": "Resistant (16.5°C); common in oak and holm oak forests.",
  "cond_precip_es": "Humedad del 65% y lluvias de 55 mm; muy persistente.",
  "cond_precip_ca": "Humitat del 65% i pluges de 55 mm; molt persistent.",
  "cond_precip_en": "65% humidity and 55 mm of rain; very persistent.",
  "cond_suelo_es": "Lignícola; casi exclusiva sobre madera de roble (pH 5.5-7.5).",
  "cond_suelo_ca": "Lignícola; gairebé exclusiva sobre fusta de roure (pH 5.5-7.5).",
  "cond_suelo_en": "Lignicolous; almost exclusive to oak wood (pH 5.5-7.5).",
  "cond_req_es": "Saprófita; ciclo largo de 30 días; himenóforo laberíntico muy duro.",
  "cond_req_ca": "Saprofita; cicle llarg de 30 dies; himenòfor laberíntic molt dur.",
  "cond_req_en": "Saprophytic; long 30-day cycle; very hard labyrinthine hymenophore."
}'::jsonb WHERE id = 'esp-137';

-- esp-199 Trametes hirsuta
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Templado-fresco (15.5°C); común en zonas húmedas del bosque.",
  "cond_temp_ca": "Temperat-fresc (15.5°C); comú en zones humides del bosc.",
  "cond_temp_en": "Temperate-cool (15.5°C); common in humid areas of the forest.",
  "cond_precip_es": "Requiere 55 mm de lluvia y humedad del 68%.",
  "cond_precip_ca": "Requereix 55 mm de pluja i humitat del 68%.",
  "cond_precip_en": "Requires 55 mm of rain and 68% humidity.",
  "cond_suelo_es": "Lignícola; sobre troncos de frondosas en descomposición (pH 5-7.5).",
  "cond_suelo_ca": "Lignícola; sobre troncs de frondoses en descomposició (pH 5-7.5).",
  "cond_suelo_en": "Lignicolous; on decaying broadleaf trunks (pH 5-7.5).",
  "cond_req_es": "Saprófita; ciclo de 20 días; superficie del sombrero muy vellosa o hirsuta.",
  "cond_req_ca": "Saprofita; cicle de 20 dies; superfície del barret molt vellosa o hirsuta.",
  "cond_req_en": "Saprophytic; 20-day cycle; very hairy or hirsute cap surface."
}'::jsonb WHERE id = 'esp-199';