-- esp-055  Amanita caesarea
UPDATE species
SET extra_data = extra_data || '{
"cond_temp_es": "Especie termófila con un óptimo de 20°C, necesitando calor ambiental constante para su desarrollo.",
"cond_temp_ca": "Espècie termòfila amb un òptim de 20°C, que necessita calor ambiental constant per al seu desenvolupament.",
"cond_temp_en": "Thermophilic species with an optimum of 20°C, requiring constant environmental heat for development.",
"cond_precip_es": "Fructifica tras lluvias de unos 60 mm, con un tiempo de respuesta de 7 días si el suelo mantiene humedad.",
"cond_precip_ca": "Fructifica després de pluges d’uns 60 mm, amb un temps de resposta de 7 dies si el sòl manté la humitat.",
"cond_precip_en": "Fruits after about 60 mm of rain, with a 7-day response time if the soil retains moisture.",
"cond_suelo_es": "Suelos silíceos y bien drenados (pH 5.5-7) en zonas abiertas de robledales y encinares.",
"cond_suelo_ca": "Sòls silicis i ben drenats (pH 5.5-7) en zones obertes de rouredes i alzinars.",
"cond_suelo_en": "Siliceous and well-drained soils (pH 5.5-7) in open areas of oak and holm oak forests.",
"cond_req_es": "Micorrizógena; requiere choque térmico estival y es típica de áreas mediterráneas soleadas.",
"cond_req_ca": "Micorrizogen; requereix xoc tèrmic estival i és típica d’àrees mediterrànies assolellades.",
"cond_req_en": "Mycorrhizal; requires a summer thermal shock and is typical of sunny Mediterranean areas."
}'::jsonb
WHERE id = 'esp-055';

-- esp-056  Amanita muscaria
UPDATE species
SET extra_data = extra_data || '{
"cond_temp_es": "Prefiere climas frescos y montanos, con un rango óptimo de fructificación de 13°C.",
"cond_temp_ca": "Prefereix climes frescos i montans, amb un rang òptim de fructificació de 13°C.",
"cond_temp_en": "Prefers cool and montane climates, with an optimal fruiting range of 13°C.",
"cond_precip_es": "Requiere humedad constante (78%) y lluvias acumuladas de 60 mm en los días previos.",
"cond_precip_ca": "Requereix humitat constant (78%) i pluges acumulades de 60 mm en els dies previs.",
"cond_precip_en": "Requires constant humidity (78%) and 60 mm of accumulated rain in the preceding days.",
"cond_suelo_es": "Suelos ácidos y silíceos (pH 4.5-6.5) bajo coníferas o abedules en altitudes de hasta 2200 m.",
"cond_suelo_ca": "Sòls àcids i silicis (pH 4.5-6.5) sota coníferes o bedolls en altituds de fins a 2200 m.",
"cond_suelo_en": "Acidic and siliceous soils (pH 4.5-6.5) under conifers or birches at altitudes up to 2200 m.",
"cond_req_es": "Micorrizógena; requiere choque térmico y suele preceder o acompañar la aparición de Boletus edulis.",
"cond_req_ca": "Micorrizogen; requereix xoc tèrmic i sol precedir o acompanyar l’aparició del sureny (Boletus edulis).",
"cond_req_en": "Mycorrhizal; requires thermal shock and often precedes or accompanies the appearance of Boletus edulis."
}'::jsonb
WHERE id = 'esp-056';

-- esp-057  Amanita phalloides
UPDATE species
SET extra_data = extra_data || '{
"cond_temp_es": "Fructifica de forma óptima a 17°C, siendo muy activa durante todo el otoño templado.",
"cond_temp_ca": "Fructifica de forma òptima a 17°C, sent molt activa durant tota la tardor temperada.",
"cond_temp_en": "Fruits optimally at 17°C, being very active throughout the temperate autumn.",
"cond_precip_es": "Necesita unos 60 mm de lluvia y una humedad ambiental del 75% para desarrollar sus carpóforos.",
"cond_precip_ca": "Necessita uns 60 mm de pluja i una humitat ambiental del 75% per desenvolupar els seus carpòfors.",
"cond_precip_en": "Needs about 60 mm of rain and 75% ambient humidity to develop its fruiting bodies.",
"cond_suelo_es": "Suelos neutros o ligeramente ácidos en bosques de planifolios como hayas, robles y encinas.",
"cond_suelo_ca": "Sòls neutres o lleugerament àcids en boscos de planifolis com faigs, roures i alzines.",
"cond_suelo_en": "Neutral or slightly acidic soils in broadleaf forests such as beech, oak, and holm oak.",
"cond_req_es": "Micorrizógena; requiere choque térmico y es extremadamente peligrosa por su toxicidad mortal.",
"cond_req_ca": "Micorrizogen; requereix xoc tèrmic i és extremadament perillosa per la seva toxicitat mortal.",
"cond_req_en": "Mycorrhizal; requires thermal shock and is extremely dangerous due to its deadly toxicity."
}'::jsonb
WHERE id = 'esp-057';

-- esp-058  Amanita verna
UPDATE species
SET extra_data = extra_data || '{
"cond_temp_es": "Especie primaveral que prefiere temperaturas suaves de 19°C y tolera calores tempranos.",
"cond_temp_ca": "Espècie primaveral que prefereix temperatures suaus de 19°C i tolera calors primerenques.",
"cond_temp_en": "Spring species that prefers mild temperatures of 19°C and tolerates early heat.",
"cond_precip_es": "Fructifica rápidamente tras las lluvias de primavera, con unos 60 mm acumulados.",
"cond_precip_ca": "Fructifica ràpidament després de les pluges de primavera, amb uns 60 mm acumulats.",
"cond_precip_en": "Fruits quickly after spring rains, with about 60 mm accumulated.",
"cond_suelo_es": "Suelos silíceos y arenosos de encinares y robledales en cotas bajas.",
"cond_suelo_ca": "Sòls silicis i sorrencs d’alzinars i rouredes en cotes baixes.",
"cond_suelo_en": "Siliceous and sandy soils of holm oak and oak forests at low elevations.",
"cond_req_es": "Micorrizógena; no requiere choque térmico frío y aparece exclusivamente durante los meses de primavera.",
"cond_req_ca": "Micorrizogen; no requereix xoc tèrmic fred i apareix exclusivament durant els mesos de primavera.",
"cond_req_en": "Mycorrhizal; does not require cold thermal shock and appears exclusively during the spring months."
}'::jsonb
WHERE id = 'esp-058';

-- esp-059  Amanita virosa
UPDATE species
SET extra_data = extra_data || '{
"cond_temp_es": "Prefiere el fresco de montaña con un óptimo de 14°C, evitando temperaturas por encima de 18°C.",
"cond_temp_ca": "Prefereix la fresca de muntanya amb un òptim de 14°C, evitant temperatures per sobre dels 18°C.",
"cond_temp_en": "Prefers mountain coolness with an optimum of 14°C, avoiding temperatures above 18°C.",
"cond_precip_es": "Exige precipitaciones altas de 75 mm y una humedad ambiental saturada cercana al 80%.",
"cond_precip_ca": "Exigeix precipitacions altes de 75 mm i una humitat ambiental saturada propera al 80%.",
"cond_precip_en": "Demands high precipitation of 75 mm and saturated ambient humidity near 80%.",
"cond_suelo_es": "Suelos muy ácidos (pH 4.5-6.5) en bosques montanos de pinos o hayas.",
"cond_suelo_ca": "Sòls molt àcids (pH 4.5-6.5) en boscos montans de pins o faigs.",
"cond_suelo_en": "Very acidic soils (pH 4.5-6.5) in montane pine or beech forests.",
"cond_req_es": "Micorrizógena; requiere choque térmico y es característica de bosques de clima atlántico o de alta montaña.",
"cond_req_ca": "Micorrizogen; requereix xoc tèrmic i és característica de boscos de clima atlàntic o d’alta muntanya.",
"cond_req_en": "Mycorrhizal; requires thermal shock and is characteristic of Atlantic or high mountain climate forests."
}'::jsonb
WHERE id = 'esp-059';

-- esp-060  Amanita pantherina
UPDATE species
SET extra_data = extra_data || '{
"cond_temp_es": "Se adapta a un rango de 10-22°C, con una fructificación óptima a los 16°C.",
"cond_temp_ca": "S’adapta a un rang de 10-22°C, amb una fructificació òptima als 16°C.",
"cond_temp_en": "Adapts to a range of 10-22°C, with optimal fruiting at 16°C.",
"cond_precip_es": "Requiere 70 mm de lluvia y una humedad moderada del 75% en el ambiente forestal.",
"cond_precip_ca": "Requereix 70 mm de pluja i una humitat moderada del 75% en l’ambient forestal.",
"cond_precip_en": "Requires 70 mm of rain and moderate humidity of 75% in the forest environment.",
"cond_suelo_es": "Suelos neutros o silíceos (pH 5-7.5) en una gran variedad de bosques mixtos y de planifolios.",
"cond_suelo_ca": "Sòls neutres o silicis (pH 5-7.5) en una gran varietat de boscos mixtos i de planifolis.",
"cond_suelo_en": "Neutral or siliceous soils (pH 5-7.5) in a wide variety of mixed and broadleaf forests.",
"cond_req_es": "Micorrizógena; no requiere choque térmico específico y aparece tanto en verano como en otoño.",
"cond_req_ca": "Micorrizogen; no requereix xoc tèrmic específic i apareix tant a l’estiu com a la tardor.",
"cond_req_en": "Mycorrhizal; does not require specific thermal shock and appears in both summer and autumn."
}'::jsonb
WHERE id = 'esp-060';

-- esp-061  Amanita rubescens
UPDATE species
SET extra_data = extra_data || '{
"cond_temp_es": "Fructifica idealmente a 15°C, tolerando un amplio abanico térmico desde los 10°C.",
"cond_temp_ca": "Fructifica idealment a 15°C, tolerant un ampli ventall tèrmic des dels 10°C.",
"cond_temp_en": "Fruits ideally at 15°C, tolerating a wide thermal range starting from 10°C.",
"cond_precip_es": "Necesita 70 mm de precipitación y humedad constante del 78% para evitar que se agriete.",
"cond_precip_ca": "Necessita 70 mm de precipitació i humitat constant del 78% per evitar que s’esquerdi.",
"cond_precip_en": "Needs 70 mm of precipitation and constant humidity of 78% to prevent cracking.",
"cond_suelo_es": "Indiferente edáfica (pH 5-7), se encuentra en casi cualquier tipo de formación boscosa.",
"cond_suelo_ca": "Indiferent edàfica (pH 5-7), es troba en gairebé qualsevol tipus de formació boscosa.",
"cond_suelo_en": "Edaphic indifferent (pH 5-7), found in almost any type of forest formation.",
"cond_req_es": "Micorrizógena; no requiere choque térmico y es una de las amanitas más comunes y ubicuas.",
"cond_req_ca": "Micorrizogen; no requereix xoc tèrmic i és una de les amanites més comunes i ubiqües.",
"cond_req_en": "Mycorrhizal; does not require thermal shock and is one of the most common and ubiquitous Amanitas."
}'::jsonb
WHERE id = 'esp-061';

-- esp-062  Amanita ovoidea
UPDATE species
SET extra_data = extra_data || '{
"cond_temp_es": "Especie termófila de regiones cálidas que prefiere temperaturas de 20.5°C.",
"cond_temp_ca": "Espècie termòfila de regions càlides que prefereix temperatures de 20.5°C.",
"cond_temp_en": "Thermophilic species of warm regions that prefers temperatures of 20.5°C.",
"cond_precip_es": "Se conforma con lluvias escasas de 50 mm y tolera humedades bajas del 65%.",
"cond_precip_ca": "Es conforma amb pluges escasses de 50 mm i tolera humitats baixes del 65%.",
"cond_precip_en": "Satisfied with sparse rains of 50 mm and tolerates low humidity of 65%.",
"cond_suelo_es": "Suelos calizos y básicos (pH 6.5-8) en pinares y encinares de clima mediterráneo.",
"cond_suelo_ca": "Sòls calcaris i bàsics (pH 6.5-8) en pinedes i alzinars de clima mediterrani.",
"cond_suelo_en": "Limestone and alkaline soils (pH 6.5-8) in pine and holm oak forests of Mediterranean climate.",
"cond_req_es": "Micorrizógena; no requiere choque térmico y es típica de las llanuras litorales soleadas.",
"cond_req_ca": "Micorrizogen; no requereix xoc tèrmic i és típica de les planes litorals assolellades.",
"cond_req_en": "Mycorrhizal; does not require thermal shock and is typical of sunny coastal plains."
}'::jsonb
WHERE id = 'esp-062';

-- esp-063  Amanita spissa
UPDATE species
SET extra_data = extra_data || '{
"cond_temp_es": "Prefiere temperaturas moderadas de 15°C, apareciendo principalmente a mediados de verano.",
"cond_temp_ca": "Prefereix temperatures moderades de 15°C, apareixent principalment a mitjans d’estiu.",
"cond_temp_en": "Prefers moderate temperatures of 15°C, appearing mainly in mid-summer.",
"cond_precip_es": "Necesita lluvias de 70 mm y una humedad ambiental del 75% para su desarrollo.",
"cond_precip_ca": "Necessita pluges de 70 mm i una humitat ambiental del 75% per al seu desenvolupament.",
"cond_precip_en": "Needs rains of 70 mm and ambient humidity of 75% for its development.",
"cond_suelo_es": "Suelos silíceos (pH 5-7) en bosques de pinos, hayas y robles.",
"cond_suelo_ca": "Sòls silicis (pH 5-7) en boscos de pins, faigs i roures.",
"cond_suelo_en": "Siliceous soils (pH 5-7) in pine, beech, and oak forests.",
"cond_req_es": "Micorrizógena; no requiere choque térmico y suele confundirse con Amanita rubescens.",
"cond_req_ca": "Micorrizogen; no requereix xoc tèrmic i sol confondre’s amb l’Amanita rubescens.",
"cond_req_en": "Mycorrhizal; does not require thermal shock and is often confused with Amanita rubescens."
}'::jsonb
WHERE id = 'esp-063';

-- esp-064  Amanita crocea
UPDATE species
SET extra_data = extra_data || '{
"cond_temp_es": "Prefiere el fresco con un óptimo de 15°C, siendo sensible a los calores secos.",
"cond_temp_ca": "Prefereix la fresca amb un òptim de 15°C, sent sensible a les calors seques.",
"cond_temp_en": "Prefers cool conditions with an optimum of 15°C, being sensitive to dry heat.",
"cond_precip_es": "Requiere lluvias frecuentes de 70 mm y una humedad ambiental elevada del 78%.",
"cond_precip_ca": "Requereix pluges freqüents de 70 mm i una humitat ambiental elevada del 78%.",
"cond_precip_en": "Requires frequent rains of 70 mm and a high ambient humidity of 78%.",
"cond_suelo_es": "Suelos silíceos (pH 5-7) en bosques de planifolios de media montaña.",
"cond_suelo_ca": "Sòls silicis (pH 5-7) en boscos de planifolis de mitja muntanya.",
"cond_suelo_en": "Siliceous soils (pH 5-7) in broadleaf forests of medium mountains.",
"cond_req_es": "Micorrizógena; requiere choque térmico y pertenece al grupo de las amanitas sin anillo (Vaginatae).",
"cond_req_ca": "Micorrizogen; requereix xoc tèrmic i pertany al grup de les amanites sense anell (Vaginatae).",
"cond_req_en": "Mycorrhizal; requires thermal shock and belongs to the ringless Amanita group (Vaginatae)."
}'::jsonb
WHERE id = 'esp-064';

-- esp-065  Amanita citrina
UPDATE species
SET extra_data = extra_data || '{
"cond_temp_es": "Fructifica con un óptimo de 15°C, aguantando bien los descensos térmicos del otoño.",
"cond_temp_ca": "Fructifica amb un òptim de 15°C, aguantant bé els descensos tèrmics de la tardor.",
"cond_temp_en": "Fruits with an optimum of 15°C, enduring the autumn temperature drops well.",
"cond_precip_es": "Requiere 70 mm de lluvia y una humedad constante del 75% en el suelo.",
"cond_precip_ca": "Requereix 70 mm de pluja i una humitat constant del 75% al sòl.",
"cond_precip_en": "Requires 70 mm of rain and constant soil humidity of 75%.",
"cond_suelo_es": "Suelos ácidos y arenosos (pH 4.5-7) bajo todo tipo de bosques.",
"cond_suelo_ca": "Sòls àcids i sorrencs (pH 4.5-7) sota tot tipus de boscos.",
"cond_suelo_en": "Acidic and sandy soils (pH 4.5-7) under all types of forests.",
"cond_req_es": "Micorrizógena; no requiere choque térmico y se reconoce por su olor característico a patata cruda.",
"cond_req_ca": "Micorrizogen; no requereix xoc tèrmic i es reconeix per la seva olor característica de patata crua.",
"cond_req_en": "Mycorrhizal; does not require thermal shock and is recognized by its characteristic raw potato smell."
}'::jsonb
WHERE id = 'esp-065';

-- esp-066  Amanita gemmata
UPDATE species
SET extra_data = extra_data || '{
"cond_temp_es": "Se desarrolla bien a 17°C, apareciendo a menudo tras las primeras lluvias de primavera y otoño.",
"cond_temp_ca": "Es desenvolupa bé a 17°C, apareixent sovint després de les primeres pluges de primavera i tardor.",
"cond_temp_en": "Develops well at 17°C, often appearing after the first spring and autumn rains.",
"cond_precip_es": "Necesita lluvias de 60 mm y una humedad ambiental del 75% para fructificar.",
"cond_precip_ca": "Necessita pluges de 60 mm i una humitat ambiental del 75% per fructificar.",
"cond_precip_en": "Needs 60 mm of rain and ambient humidity of 75% to fruit.",
"cond_suelo_es": "Suelos silíceos y arenosos (pH 4.5-6.5) vinculados principalmente a pinares.",
"cond_suelo_ca": "Sòls silicis i sorrencs (pH 4.5-6.5) vinculats principalment a pinedes.",
"cond_suelo_en": "Siliceous and sandy soils (pH 4.5-6.5) primarily linked to pine forests.",
"cond_req_es": "Micorrizógena; no requiere choque térmico y es una de las amanitas más tempranas de la temporada.",
"cond_req_ca": "Micorrizogen; no requereix xoc tèrmic i és una de les amanites més primerenques de la temporada.",
"cond_req_en": "Mycorrhizal; does not require thermal shock and is one of the earliest Amanitas of the season."
}'::jsonb
WHERE id = 'esp-066';

-- esp-067  Amanita strobiliformis
UPDATE species
SET extra_data = extra_data || '{
"cond_temp_es": "Especie amante del calor con un óptimo de 19°C y actividad hasta los 24°C.",
"cond_temp_ca": "Espècie amant de la calor amb un òptim de 19°C i activitat fins als 24°C.",
"cond_temp_en": "Heat-loving species with an optimum of 19°C and activity up to 24°C.",
"cond_precip_es": "Se activa con 60 mm de lluvia y humedades relativas del 70%.",
"cond_precip_ca": "S’activa amb 60 mm de pluja i humitats relatives del 70%.",
"cond_precip_en": "Activates with 60 mm of rain and relative humidity of 70%.",
"cond_suelo_es": "Suelos calizos y arcillosos (pH 6-8) en claros de robledales y encinares.",
"cond_suelo_ca": "Sòls calcaris i argilosos (pH 6-8) en clarianes de rouredes i alzinars.",
"cond_suelo_en": "Limestone and clayey soils (pH 6-8) in clearings of oak and holm oak forests.",
"cond_req_es": "Micorrizógena; no requiere choque térmico y destaca por su gran tamaño y escamas harinosas.",
"cond_req_ca": "Micorrizogen; no requereix xoc tèrmic i destaca per la seva gran mida i escates farinoses.",
"cond_req_en": "Mycorrhizal; does not require thermal shock and is notable for its large size and mealy scales."
}'::jsonb
WHERE id = 'esp-067';

-- esp-068  Amanita eliae
UPDATE species
SET extra_data = extra_data || '{
"cond_temp_es": "Fructifica con temperaturas cálidas de 19°C, siendo típica de finales de primavera.",
"cond_temp_ca": "Fructifica amb temperatures càlides de 19°C, sent típica de finals de primavera.",
"cond_temp_en": "Fruits with warm temperatures of 19°C, being typical of late spring.",
"cond_precip_es": "Requiere lluvias ligeras de unos 55 mm y una humedad ambiental del 70%.",
"cond_precip_ca": "Requereix pluges lleugeres d’uns 55 mm i una humitat ambiental del 70%.",
"cond_precip_en": "Requires light rains of about 55 mm and ambient humidity of 70%.",
"cond_suelo_es": "Suelos calizos o neutros (pH 6-7.5) asociados a bosques de planifolios mediterráneos.",
"cond_suelo_ca": "Sòls calcaris o neutres (pH 6-7.5) associats a boscos de planifolis mediterranis.",
"cond_suelo_en": "Limestone or neutral soils (pH 6-7.5) associated with Mediterranean broadleaf forests.",
"cond_req_es": "Micorrizógena; no requiere choque térmico y es una especie poco frecuente ligada al calor.",
"cond_req_ca": "Micorrizogen; no requereix xoc tèrmic i és una espècie poc freqüent lligada a la calor.",
"cond_req_en": "Mycorrhizal; does not require thermal shock and is an infrequent species linked to heat."
}'::jsonb
WHERE id = 'esp-068';

-- esp-069  Amanita excelsa
UPDATE species
SET extra_data = extra_data || '{
"cond_temp_es": "Temperatura óptima de fructificación de 15°C, evitando los extremos de calor y frío.",
"cond_temp_ca": "Temperatura òptima de fructificació de 15°C, evitant els extrems de calor i fred.",
"cond_temp_en": "Optimal fruiting temperature of 15°C, avoiding heat and cold extremes.",
"cond_precip_es": "Necesita lluvias generosas de 70 mm y una humedad ambiental del 75%.",
"cond_precip_ca": "Necessita pluges generoses de 70 mm i una humitat ambiental del 75%.",
"cond_precip_en": "Needs generous rains of 70 mm and ambient humidity of 75%.",
"cond_suelo_es": "Suelos silíceos (pH 5-7) en una amplia variedad de bosques de pinos y hayas.",
"cond_suelo_ca": "Sòls silicis (pH 5-7) en una àmplia varietat de boscos de pins i faigs.",
"cond_suelo_en": "Siliceous soils (pH 5-7) in a wide variety of pine and beech forests.",
"cond_req_es": "Micorrizógena; no requiere choque térmico y es una especie muy común en verano y otoño.",
"cond_req_ca": "Micorrizogen; no requereix xoc tèrmic i és una espècie molt comú a l’estiu i la tardor.",
"cond_req_en": "Mycorrhizal; does not require thermal shock and is a very common species in summer and autumn."
}'::jsonb
WHERE id = 'esp-069';