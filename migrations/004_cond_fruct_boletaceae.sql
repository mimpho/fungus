-- esp-001  Boletus edulis
UPDATE species
SET extra_data = extra_data || '{
"cond_temp_es": "Fructifica idealmente a 15°C, deteniendo su crecimiento si las temperaturas bajan de los 12°C.",
"cond_temp_ca": "Fructifica idealment a 15°C, aturant el seu creixement si les temperatures baixen dels 12°C.",
"cond_temp_en": "Fruits ideally at 15°C, halting growth if temperatures drop below 12°C.",
"cond_precip_es": "Requiere unos 80 mm de lluvia acumulada con un ciclo de respuesta de 7 días tras las precipitaciones.",
"cond_precip_ca": "Requereix uns 80 mm de pluja acumulada amb un cicle de resposta de 7 dies després de les precipitacions.",
"cond_precip_en": "Requires about 80 mm of accumulated rain with a 7-day response cycle after precipitation.",
"cond_suelo_es": "Suelos ácidos (pH 5.5-6.5) con humedad del 80%, frecuentemente bajo pinos, hayas o robles.",
"cond_suelo_ca": "Sòls àcids (pH 5.5-6.5) amb humitat del 80%, freqüentment sota pins, faigs o roures.",
"cond_suelo_en": "Acidic soils (pH 5.5-6.5) with 80% humidity, frequently under pines, beeches, or oaks.",
"cond_req_es": "Micorrizógena; requiere de un choque térmico para activar su producción a finales de verano u otoño.",
"cond_req_ca": "Micorrizogen; requereix un xoc tèrmic per activar la seva producció a finals d’estiu o tardor.",
"cond_req_en": "Mycorrhizal; requires a thermal shock to activate production in late summer or autumn."
}'::jsonb
WHERE id = 'esp-001';

-- esp-002  Boletus aereus
UPDATE species
SET extra_data = extra_data || '{
"cond_temp_es": "Especie termófila que prefiere 18°C y tolera hasta los 22°C, típica de meses cálidos.",
"cond_temp_ca": "Espècie termòfila que prefereix 18°C i tolera fins als 22°C, típica de mesos càlids.",
"cond_temp_en": "Thermophilic species that prefers 18°C and tolerates up to 22°C, typical of warm months.",
"cond_precip_es": "Necesita unos 50 mm de lluvia, aunque tolera ambientes algo más secos con 70% de humedad.",
"cond_precip_ca": "Necessita uns 50 mm de pluja, tot i que tolera ambients una mica més secs amb un 70% d’humitat.",
"cond_precip_en": "Needs about 50 mm of rain, although it tolerates somewhat drier environments with 70% humidity.",
"cond_suelo_es": "Suelos silíceos de encinares y robledales en cotas bajas de hasta 1200 metros.",
"cond_suelo_ca": "Sòls silicis d’alzinars i rouredes en cotes baixes de fins a 1200 metres.",
"cond_suelo_en": "Siliceous soils of holm oak and oak forests at low elevations up to 1200 meters.",
"cond_req_es": "Micorrizógena; requiere choque térmico y se asocia exclusivamente a planifolios mediterráneos y submediterráneos.",
"cond_req_ca": "Micorrizogen; requereix xoc tèrmic i s’associa exclusivament a planifolis mediterranis i submediterranis.",
"cond_req_en": "Mycorrhizal; requires thermal shock and is exclusively associated with Mediterranean and sub-Mediterranean broadleaf trees."
}'::jsonb
WHERE id = 'esp-002';

-- esp-003  Boletus pinophilus
UPDATE species
SET extra_data = extra_data || '{
"cond_temp_es": "Prefiere ambientes frescos con un óptimo de 14°C, apareciendo a menudo en alta montaña.",
"cond_temp_ca": "Prefereix ambients frescos amb un òptim de 14°C, apareixent sovint en alta muntanya.",
"cond_temp_en": "Prefers cool environments with an optimum of 14°C, often appearing in high mountains.",
"cond_precip_es": "Demanda lluvias abundantes de hasta 70 mm y una humedad constante cercana al 78%.",
"cond_precip_ca": "Demana pluges abundants de fins a 70 mm i una humitat constant propera al 78%.",
"cond_precip_en": "Demands abundant rains up to 70 mm and a constant humidity near 78%.",
"cond_suelo_es": "Suelos muy ácidos (pH 5-6) vinculados exclusivamente a bosques de coníferas.",
"cond_suelo_ca": "Sòls molt àcids (pH 5-6) vinculats exclusivament a boscos de coníferes.",
"cond_suelo_en": "Very acidic soils (pH 5-6) exclusively linked to coniferous forests.",
"cond_req_es": "Micorrizógena de pinos; requiere choque térmico y es de los primeros boletus en aparecer en primavera o verano.",
"cond_req_ca": "Micorrizogen de pins; requereix xoc tèrmic i és dels primers surenys a aparèixer a la primavera o l’estiu.",
"cond_req_en": "Mycorrhizal partner of pines; requires thermal shock and is one of the first boletes to appear in spring or summer."
}'::jsonb
WHERE id = 'esp-003';

-- esp-004  Boletus reticulatus
UPDATE species
SET extra_data = extra_data || '{
"cond_temp_es": "Óptimo térmico de 18°C, siendo muy sensible al frío intenso y apareciendo ya a principios de verano.",
"cond_temp_ca": "Òptim tèrmic de 18°C, sent molt sensible al fred intens i apareixent ja a principis d’estiu.",
"cond_temp_en": "Thermal optimum of 18°C, being very sensitive to intense cold and appearing as early as early summer.",
"cond_precip_es": "Requiere 60 mm de precipitación previa con un tiempo de respuesta rápido de 7 días.",
"cond_precip_ca": "Requereix 60 mm de precipitació prèvia amb un temps de resposta ràpid de 7 dies.",
"cond_precip_en": "Requires 60 mm of prior precipitation with a fast response time of 7 days.",
"cond_suelo_es": "Suelos neutros o ligeramente ácidos en bosques de encinas y robles de media montaña.",
"cond_suelo_ca": "Sòls neutres o lleugerament àcids en boscos d’alzines i roures de mitja muntanya.",
"cond_suelo_en": "Neutral or slightly acidic soils in holm oak and oak forests of medium mountains.",
"cond_req_es": "Micorrizógena; requiere choque térmico y destaca por su aparición temprana en la temporada de boletus.",
"cond_req_ca": "Micorrizogen; requereix xoc tèrmic i destaca per la seva aparició primerenca en la temporada de surenys.",
"cond_req_en": "Mycorrhizal; requires thermal shock and stands out for its early appearance in the bolete season."
}'::jsonb
WHERE id = 'esp-004';

-- esp-005  Imleria badia
UPDATE species
SET extra_data = extra_data || '{
"cond_temp_es": "Prefiere el fresco del otoño tardío con un óptimo de 14°C, tolerando mínimos de 10°C.",
"cond_temp_ca": "Prefereix la fresca de la tardor tardana amb un òptim de 14°C, tolerant mínims de 10°C.",
"cond_temp_en": "Prefers the coolness of late autumn with an optimum of 14°C, tolerating minimums of 10°C.",
"cond_precip_es": "Necesita humedad alta (78%) y lluvias acumuladas de unos 70 mm en la semana previa.",
"cond_precip_ca": "Necessita humitat alta (78%) i pluges acumulades d’uns 70 mm en la setmana prèvia.",
"cond_precip_en": "Needs high humidity (78%) and accumulated rainfall of about 70 mm in the preceding week.",
"cond_suelo_es": "Suelos muy ácidos (pH 4.5-6.5), a menudo con musgo, en bosques de pinos y hayas.",
"cond_suelo_ca": "Sòls molt àcids (pH 4.5-6.5), sovint amb molsa, en boscos de pins i faigs.",
"cond_suelo_en": "Very acidic soils (pH 4.5-6.5), often with moss, in pine and beech forests.",
"cond_req_es": "Micorrizógena; requiere choque térmico y es muy común en bosques montanos húmedos.",
"cond_req_ca": "Micorrizogen; requereix xoc tèrmic i és molt comú en boscos montans humits.",
"cond_req_en": "Mycorrhizal; requires thermal shock and is very common in humid montane forests."
}'::jsonb
WHERE id = 'esp-005';

-- esp-006  Leccinum scabrum
UPDATE species
SET extra_data = extra_data || '{
"cond_temp_es": "Se desarrolla bien en ambientes frescos entre 10°C y 18°C durante el verano y otoño.",
"cond_temp_ca": "Es desenvolupa bé en ambients frescos entre 10°C i 18°C durant l’estiu i la tardor.",
"cond_temp_en": "Develops well in cool environments between 10°C and 18°C during summer and autumn.",
"cond_precip_es": "Requiere 70 mm de lluvia y una humedad ambiental alta del 80% para fructificar.",
"cond_precip_ca": "Requereix 70 mm de pluja i una humitat ambiental alta del 80% per fructificar.",
"cond_precip_en": "Requires 70 mm of rain and high ambient humidity of 80% to fruit.",
"cond_suelo_es": "Suelos ácidos en hayedos húmedos, preferiblemente entre 600 y 1800 metros de altitud.",
"cond_suelo_ca": "Sòls àcids en faigedes humides, preferiblement entre 600 i 1800 metres d’altitud.",
"cond_suelo_en": "Acidic soils in humid beech forests, preferably between 600 and 1800 meters in altitude.",
"cond_req_es": "Micorrizógena; requiere choque térmico y se asocia de forma estricta a árboles del género Betula o Fagus.",
"cond_req_ca": "Micorrizogen; requereix xoc tèrmic i s’associa de forma estricta a arbres del gènere Betula o Fagus.",
"cond_req_en": "Mycorrhizal; requires thermal shock and is strictly associated with trees of the genus Betula or Fagus."
}'::jsonb
WHERE id = 'esp-006';

-- esp-007  Leccinum versipelle
UPDATE species
SET extra_data = extra_data || '{
"cond_temp_es": "Prefiere temperaturas frescas, con un rango óptimo que no suele superar los 13-17°C.",
"cond_temp_ca": "Prefereix temperatures fresques, amb un rang òptim que no sol superar els 13-17°C.",
"cond_temp_en": "Prefers cool temperatures, with an optimal range that usually does not exceed 13-17°C.",
"cond_precip_es": "Necesita precipitaciones generosas de 75 mm y una espera de unos 8 días tras la lluvia.",
"cond_precip_ca": "Necessita precipitacions generoses de 75 mm i una espera d’uns 8 dies després de la pluja.",
"cond_precip_en": "Needs generous precipitation of 75 mm and a wait of about 8 days after the rain.",
"cond_suelo_es": "Suelos silíceos con pH de 5 a 7 en bosques mixtos y robledales húmedos.",
"cond_suelo_ca": "Sòls silicis amb pH de 5 a 7 en boscos mixtos i rouredes humides.",
"cond_suelo_en": "Siliceous soils with pH from 5 to 7 in mixed forests and humid oak forests.",
"cond_req_es": "Micorrizógena; requiere choque térmico y se asocia frecuentemente con abedules en zonas de montaña.",
"cond_req_ca": "Micorrizogen; requereix xoc tèrmic i s’associa freqüentment amb bedolls en zones de muntanya.",
"cond_req_en": "Mycorrhizal; requires thermal shock and is frequently associated with birch trees in mountain areas."
}'::jsonb
WHERE id = 'esp-007';

-- esp-008  Suillus luteus
UPDATE species
SET extra_data = extra_data || '{
"cond_temp_es": "Especie de clima frío, fructificando óptimamente a 12°C y aguantando hasta los 8°C.",
"cond_temp_ca": "Espècie de clima fred, fructificant òptimament a 12°C i aguantant fins als 8°C.",
"cond_temp_en": "Cold-weather species, fruiting optimally at 12°C and enduring down to 8°C.",
"cond_precip_es": "Requiere unos 70 mm de lluvia acumulada y una humedad del suelo del 78%.",
"cond_precip_ca": "Requereix uns 70 mm de pluja acumulada i una humitat del sòl del 78%.",
"cond_precip_en": "Requires about 70 mm of accumulated rain and soil humidity of 78%.",
"cond_suelo_es": "Suelos ácidos y arenosos bajo pinos, apareciendo incluso en altitudes de 1800 metros.",
"cond_suelo_ca": "Sòls àcids i sorrencs sota pins, apareixent fins i tot en altituds de 1800 metres.",
"cond_suelo_en": "Acidic and sandy soils under pines, appearing even at altitudes of 1800 meters.",
"cond_req_es": "Micorrizógena estricta de pinos; requiere choque térmico y aparece típicamente a finales de otoño.",
"cond_req_ca": "Micorrizogen estricte de pins; requereix xoc tèrmic i apareix típicament a finals de tardor.",
"cond_req_en": "Strict mycorrhizal partner of pines; requires thermal shock and typically appears in late autumn."
}'::jsonb
WHERE id = 'esp-008';

-- esp-009  Suillus granulatus
UPDATE species
SET extra_data = extra_data || '{
"cond_temp_es": "Prefiere temperaturas moderadas de 15°C, con un rango de crecimiento entre 10°C y 20°C.",
"cond_temp_ca": "Prefereix temperatures moderades de 15°C, amb un rang de creixement entre 10°C i 20°C.",
"cond_temp_en": "Prefers moderate temperatures of 15°C, with a growth range between 10°C and 20°C.",
"cond_precip_es": "Fructifica rápidamente (6 días) tras lluvias de 60 mm en ambientes con 75% de humedad.",
"cond_precip_ca": "Fructifica ràpidament (6 dies) després de pluges de 60 mm en ambients amb 75% d’humitat.",
"cond_precip_en": "Fruits quickly (6 days) after 60 mm of rain in environments with 75% humidity.",
"cond_suelo_es": "Suelos ácidos o neutros en pinares, desde el nivel del mar hasta los 1600 metros.",
"cond_suelo_ca": "Sòls àcids o neutres en pinedes, des del nivell del mar fins als 1600 metres.",
"cond_suelo_en": "Acidic or neutral soils in pine forests, from sea level up to 1600 meters.",
"cond_req_es": "Micorrizógena de pinos de dos acículas; no requiere choque térmico y es muy común y prolífica.",
"cond_req_ca": "Micorrizogen de pins de dues acícules; no requereix xoc tèrmic i és molt comú i prolífica.",
"cond_req_en": "Mycorrhizal partner of two-needle pines; does not require thermal shock and is very common and prolific."
}'::jsonb
WHERE id = 'esp-009';

-- esp-010  Suillus bellini
UPDATE species
SET extra_data = extra_data || '{
"cond_temp_es": "Típica de climas templados, su óptimo se sitúa en los 14°C, evitando el frío extremo.",
"cond_temp_ca": "Típica de climes temperats, el seu òptim se situa en els 14°C, evitant el fred extrem.",
"cond_temp_en": "Typical of temperate climates, its optimum is at 14°C, avoiding extreme cold.",
"cond_precip_es": "Requiere 60 mm de lluvia acumulada y una humedad ambiental del 75%.",
"cond_precip_ca": "Requereix 60 mm de pluja acumulada i una humitat ambiental del 75%.",
"cond_precip_en": "Requires 60 mm of accumulated rain and ambient humidity of 75%.",
"cond_suelo_es": "Suelos arenosos y litorales (pH 5-6.5) asociados a pinos de baja cota.",
"cond_suelo_ca": "Sòls sorrencs i litorals (pH 5-6.5) associats a pins de cota baixa.",
"cond_suelo_en": "Sandy and coastal soils (pH 5-6.5) associated with low-elevation pines.",
"cond_req_es": "Micorrizógena; requiere choque térmico y es una especie termófila común en pinares mediterráneos.",
"cond_req_ca": "Micorrizogen; requereix xoc tèrmic i és una espècie termòfila comú en pinedes mediterrànies.",
"cond_req_en": "Mycorrhizal; requires thermal shock and is a thermophilic species common in Mediterranean pine forests."
}'::jsonb
WHERE id = 'esp-010';

-- esp-011  Xerocomus subtomentosus
UPDATE species
SET extra_data = extra_data || '{
"cond_temp_es": "Se adapta a un amplio rango térmico, con un óptimo de 17°C y máximas de 22°C.",
"cond_temp_ca": "S’adapta a un ampli rang tèrmic, amb un òptim de 17°C i màximes de 22°C.",
"cond_temp_en": "Adapts to a wide thermal range, with an optimum of 17°C and maximums of 22°C.",
"cond_precip_es": "Requiere lluvias moderadas de 65 mm y una humedad del suelo del 75%.",
"cond_precip_ca": "Requereix pluges moderades de 65 mm i una humitat del sòl del 75%.",
"cond_precip_en": "Requires moderate rains of 65 mm and soil humidity of 75%.",
"cond_suelo_es": "Suelos ácidos o neutros en bosques mixtos, robledales y hayedos de media montaña.",
"cond_suelo_ca": "Sòls àcids o neutres en boscos mixtos, rouredes i faigedes de mitja muntanya.",
"cond_suelo_en": "Acidic or neutral soils in mixed forests, oak forests, and beech forests of medium mountains.",
"cond_req_es": "Micorrizógena; no requiere choque térmico y es una especie versátil presente en variados hábitats.",
"cond_req_ca": "Micorrizogen; no requereix xoc tèrmic i és una espècie versàtil present en diversos hàbitats.",
"cond_req_en": "Mycorrhizal; does not require thermal shock and is a versatile species present in varied habitats."
}'::jsonb
WHERE id = 'esp-011';

-- esp-012  Caloboletus calopus
UPDATE species
SET extra_data = extra_data || '{
"cond_temp_es": "Prefiere el fresco de montaña con 14°C de temperatura óptima y máximas de 18°C.",
"cond_temp_ca": "Prefereix la fresca de muntanya amb 14°C de temperatura òptima i màximes de 18°C.",
"cond_temp_en": "Prefers mountain coolness with 14°C optimal temperature and maximums of 18°C.",
"cond_precip_es": "Necesita lluvias abundantes de 75 mm y un ciclo de fructificación de 8 días.",
"cond_precip_ca": "Necessita pluges abundants de 75 mm i un cicle de fructificació de 8 dies.",
"cond_precip_en": "Needs abundant rains of 75 mm and an 8-day fruiting cycle.",
"cond_suelo_es": "Suelos muy ácidos (pH 4.5-6) en hayedos y pinares de alta cota.",
"cond_suelo_ca": "Sòls molt àcids (pH 4.5-6) en faigedes i pinedes d’alta cota.",
"cond_suelo_en": "Very acidic soils (pH 4.5-6) in beech forests and high-elevation pine forests.",
"cond_req_es": "Micorrizógena; requiere choque térmico y es notable por su sabor muy amargo y pie rojizo.",
"cond_req_ca": "Micorrizogen; requereix xoc tèrmic i és notable pel seu gust molt amarg i peu rogenc.",
"cond_req_en": "Mycorrhizal; requires thermal shock and is notable for its very bitter taste and reddish stem."
}'::jsonb
WHERE id = 'esp-012';

-- esp-013  Suillellus luridus
UPDATE species
SET extra_data = extra_data || '{
"cond_temp_es": "Especie termófila que disfruta de los 19°C y tolera calores estivales de hasta 24°C.",
"cond_temp_ca": "Espècie termòfila que gaudeix dels 19°C i tolera calors estivals de fins a 24°C.",
"cond_temp_en": "Thermophilic species that enjoys 19°C and tolerates summer heat up to 24°C.",
"cond_precip_es": "Fructifica rápido (6 días) tras lluvias de 60 mm en suelos con 70% de humedad.",
"cond_precip_ca": "Fructifica ràpid (6 dies) després de pluges de 60 mm en sòls amb un 70% d’humitat.",
"cond_precip_en": "Fruits quickly (6 days) after 60 mm of rain in soils with 70% humidity.",
"cond_suelo_es": "Suelos calizos o básicos (pH 6-7.5) en bosques de planifolios o mixtos.",
"cond_suelo_ca": "Sòls calcaris o bàsics (pH 6-7.5) en boscos de planifolis o mixtos.",
"cond_suelo_en": "Limestone or alkaline soils (pH 6-7.5) in broadleaf or mixed forests.",
"cond_req_es": "Micorrizógena; no requiere choque térmico y es común en parques y claros de bosque soleados.",
"cond_req_ca": "Micorrizogen; no requereix xoc tèrmic i és comú en parcs i clarianes de bosc assolellades.",
"cond_req_en": "Mycorrhizal; does not require thermal shock and is common in parks and sunny forest clearings."
}'::jsonb
WHERE id = 'esp-013';

-- esp-014  Neoboletus erythropus
UPDATE species
SET extra_data = extra_data || '{
"cond_temp_es": "Se adapta a temperaturas frescas de 14°C, apareciendo desde mediados de verano en montaña.",
"cond_temp_ca": "S’adapta a temperatures fresques de 14°C, apareixent des de mitjans d’estiu a la muntanya.",
"cond_temp_en": "Adapts to cool temperatures of 14°C, appearing from mid-summer in the mountains.",
"cond_precip_es": "Requiere 75 mm de lluvia previa y una humedad ambiental saturada al 80%.",
"cond_precip_ca": "Requereix 75 mm de pluja prèvia i una humitat ambiental saturada al 80%.",
"cond_precip_en": "Requires 75 mm of prior rain and 80% saturated ambient humidity.",
"cond_suelo_es": "Suelos ácidos (pH 4.5-6.5) bajo coníferas o planifolios en cotas de hasta 1800 m.",
"cond_suelo_ca": "Sòls àcids (pH 4.5-6.5) sota coníferes o planifolis en cotes de fins a 1800 m.",
"cond_suelo_en": "Acidic soils (pH 4.5-6.5) under conifers or broadleaf trees at elevations up to 1800 m.",
"cond_req_es": "Micorrizógena; requiere choque térmico y destaca por su rápido azuleamiento al corte.",
"cond_req_ca": "Micorrizogen; requereix xoc tèrmic i destaca pel seu ràpid blavejament al tall.",
"cond_req_en": "Mycorrhizal; requires thermal shock and stands out for its rapid blueing when cut."
}'::jsonb
WHERE id = 'esp-014';

-- esp-015  Rubroboletus satanas
UPDATE species
SET extra_data = extra_data || '{
"cond_temp_es": "Especie muy termófila, con un óptimo de 20.5°C, que aparece tras episodios de calor intenso.",
"cond_temp_ca": "Espècie molt termòfila, amb un òptim de 20.5°C, que apareix després d’episodis de calor intensa.",
"cond_temp_en": "Highly thermophilic species, with an optimum of 20.5°C, appearing after episodes of intense heat.",
"cond_precip_es": "Necesita poca lluvia (50 mm) pero en el momento justo, con humedades bajas de hasta 65%.",
"cond_precip_ca": "Necessita poca pluja (50 mm) però en el moment just, amb humitats baixes de fins al 65%.",
"cond_precip_en": "Needs little rain (50 mm) but at the right time, with low humidity levels down to 65%.",
"cond_suelo_es": "Suelos marcadamente calizos y básicos (pH 6.5-8) en encinares soleados.",
"cond_suelo_ca": "Sòls marcadament calcaris i bàsics (pH 6.5-8) en alzinars assolellats.",
"cond_suelo_en": "Markedly limestone and alkaline soils (pH 6.5-8) in sunny holm oak forests.",
"cond_req_es": "Micorrizógena; no requiere choque térmico y prefiere los veranos calurosos en tierras bajas.",
"cond_req_ca": "Micorrizogen; no requereix xoc tèrmic i prefereix els estius calents en terres baixes.",
"cond_req_en": "Mycorrhizal; does not require thermal shock and prefers hot summers in lowland areas."
}'::jsonb
WHERE id = 'esp-015';

-- esp-016  Gyroporus cyanescens
UPDATE species
SET extra_data = extra_data || '{
"cond_temp_es": "Temperatura óptima de 17°C, encontrando su límite máximo cerca de los 22°C.",
"cond_temp_ca": "Temperatura òptima de 17°C, trobant el seu límit màxim prop dels 22°C.",
"cond_temp_en": "Optimal temperature of 17°C, finding its maximum limit near 22°C.",
"cond_precip_es": "Necesita unos 65 mm de lluvia y un periodo de maduración de 8 días.",
"cond_precip_ca": "Necessita uns 65 mm de pluja i un període de maduració de 8 dies.",
"cond_precip_en": "Needs about 65 mm of rain and a 8-day maturation period.",
"cond_suelo_es": "Suelos muy ácidos y a menudo arenosos (pH 4.5-6.5) en bosques mixtos.",
"cond_suelo_ca": "Sòls molt àcids i sovint sorrencs (pH 4.5-6.5) en boscos mixtos.",
"cond_suelo_en": "Very acidic and often sandy soils (pH 4.5-6.5) in mixed forests.",
"cond_req_es": "Micorrizógena; requiere choque térmico y se caracteriza por su carne blanca que vira a un azul intenso.",
"cond_req_ca": "Micorrizogen; requereix xoc tèrmic i es caracteritza per la seva carn blanca que vira a un blau intens.",
"cond_req_en": "Mycorrhizal; requires thermal shock and is characterized by white flesh that turns deep blue."
}'::jsonb
WHERE id = 'esp-016';

-- esp-017  Gyroporus castaneus
UPDATE species
SET extra_data = extra_data || '{
"cond_temp_es": "Prefiere ambientes cálidos con un óptimo de 19°C y actividad hasta los 24°C.",
"cond_temp_ca": "Prefereix ambients càlids amb un òptim de 19°C i activitat fins als 24°C.",
"cond_temp_en": "Prefers warm environments with an optimum of 19°C and activity up to 24°C.",
"cond_precip_es": "Requiere 60 mm de lluvia y humedades moderadas del 70% en el ambiente.",
"cond_precip_ca": "Requereix 60 mm de pluja i humitats moderades del 70% en l’ambient.",
"cond_precip_en": "Requires 60 mm of rain and moderate ambient humidity of 70%.",
"cond_suelo_es": "Suelos silíceos o neutros (pH 5.5-7.5) asociados a robledales y encinares de baja cota.",
"cond_suelo_ca": "Sòls silicis o neutres (pH 5.5-7.5) associats a rouredes i alzinars de cota baixa.",
"cond_suelo_en": "Siliceous or neutral soils (pH 5.5-7.5) associated with low-elevation oak and holm oak forests.",
"cond_req_es": "Micorrizógena; no requiere choque térmico y suele aparecer en bordes de caminos y claros herbosos.",
"cond_req_ca": "Micorrizogen; no requereix xoc tèrmic i sol aparèixer en marges de camins i clarianes herboses.",
"cond_req_en": "Mycorrhizal; does not require thermal shock and typically appears on path edges and grassy clearings."
}'::jsonb
WHERE id = 'esp-017';

-- esp-018  Chalciporus piperatus
UPDATE species
SET extra_data = extra_data || '{
"cond_temp_es": "Óptimo térmico de 15°C, desarrollándose en un rango que va desde los 10°C a los 20°C.",
"cond_temp_ca": "Òptim tèrmic de 15°C, desenvolupant-se en un rang que va dels 10°C als 20°C.",
"cond_temp_en": "Thermal optimum of 15°C, developing in a range from 10°C to 20°C.",
"cond_precip_es": "Necesita 65 mm de lluvia acumulada y una humedad del 75% para su fructificación.",
"cond_precip_ca": "Necessita 65 mm de pluja acumulada i una humitat del 75% per a la seva fructificació.",
"cond_precip_en": "Needs 65 mm of accumulated rain and 75% humidity for fruiting.",
"cond_suelo_es": "Suelos ácidos (pH 4.5-6.5) en pinares, a menudo sobre sustratos pobres.",
"cond_suelo_ca": "Sòls àcids (pH 4.5-6.5) en pinedes, sovint sobre sustrats pobres.",
"cond_suelo_en": "Acidic soils (pH 4.5-6.5) in pine forests, often on poor substrates.",
"cond_req_es": "Micoparasítica o asociada a Amanita muscaria; requiere choque térmico y se encuentra siempre bajo coníferas.",
"cond_req_ca": "Micoparasítica o associada a Amanita muscaria; requereix xoc tèrmic i es troba sempre sota coníferes.",
"cond_req_en": "Mycoparasitic or associated with Amanita muscaria; requires thermal shock and is always found under conifers."
}'::jsonb
WHERE id = 'esp-018';

-- esp-019  Neoboletus luridiformis
UPDATE species
SET extra_data = extra_data || '{
"cond_temp_es": "Prefiere el fresco montano con un óptimo de 14°C, siendo común desde el verano.",
"cond_temp_ca": "Prefereix la fresca de muntanya amb un òptim de 14°C, sent comú des de l’estiu.",
"cond_temp_en": "Prefers mountain coolness with an optimum of 14°C, being common from summer onwards.",
"cond_precip_es": "Demanda lluvias abundantes de 75 mm y una humedad ambiental alta del 80%.",
"cond_precip_ca": "Demana pluges abundants de 75 mm i una humitat ambiental alta del 80%.",
"cond_precip_en": "Demands abundant rains of 75 mm and high ambient humidity of 80%.",
"cond_suelo_es": "Suelos ácidos (pH 4.5-6) en pinares y hayedos de media y alta montaña.",
"cond_suelo_ca": "Sòls àcids (pH 4.5-6) en pinedes i faigedes de mitja i alta muntanya.",
"cond_suelo_en": "Acidic soils (pH 4.5-6) in pine and beech forests of medium and high mountains.",
"cond_req_es": "Micorrizógena; requiere choque térmico y es una especie robusta que tolera climas húmedos y fríos.",
"cond_req_ca": "Micorrizogen; requereix xoc tèrmic i és una espècie robusta que tolera climes humits i freds.",
"cond_req_en": "Mycorrhizal; requires thermal shock and is a robust species that tolerates humid and cold climates."
}'::jsonb
WHERE id = 'esp-019';

-- esp-021  Aureoboletus gentilis
UPDATE species
SET extra_data = extra_data || '{
"cond_temp_es": "Se desarrolla con un óptimo de 16°C, dentro de un rango moderado de 12°C a 20°C.",
"cond_temp_ca": "Es desenvolupa amb un òptim de 16°C, dins d’un rang moderat de 12°C a 20°C.",
"cond_temp_en": "Develops with an optimum of 16°C, within a moderate range of 12°C to 20°C.",
"cond_precip_es": "Necesita lluvias generosas de 70 mm y un ciclo de 8 días para aparecer.",
"cond_precip_ca": "Necessita pluges generoses de 70 mm i un cicle de 8 dies per aparèixer.",
"cond_precip_en": "Needs generous rains of 70 mm and an 8-day cycle to appear.",
"cond_suelo_es": "Suelos ácidos o neutros (pH 5-6.5) en robledales y bosques mixtos templados.",
"cond_suelo_ca": "Sòls àcids o neutres (pH 5-6.5) en rouredes i boscos mixtos temperats.",
"cond_suelo_en": "Acidic or neutral soils (pH 5-6.5) in oak forests and temperate mixed forests.",
"cond_req_es": "Micorrizógena; requiere choque térmico y se asocia preferentemente a árboles del género Quercus.",
"cond_req_ca": "Micorrizogen; requereix xoc tèrmic i s’associa preferentment a arbres del gènere Quercus.",
"cond_req_en": "Mycorrhizal; requires thermal shock and is preferentially associated with trees of the Quercus genus."
}'::jsonb
WHERE id = 'esp-021';

-- esp-201  Butyriboletus regius
UPDATE species
SET extra_data = extra_data || '{
"cond_temp_es": "Especie de temperaturas suaves con un óptimo de 16°C, evitando el calor excesivo.",
"cond_temp_ca": "Espècie de temperatures suaus amb un òptim de 16°C, evitant la calor excessiva.",
"cond_temp_en": "Species of mild temperatures with an optimum of 16°C, avoiding excessive heat.",
"cond_precip_es": "Requiere 65 mm de lluvia y mantiene una humedad óptima en el suelo del 78%.",
"cond_precip_ca": "Requereix 65 mm de pluja i manté una humitat òptima al sòl del 78%.",
"cond_precip_en": "Requires 65 mm of rain and maintains an optimal soil humidity of 78%.",
"cond_suelo_es": "Suelos silíceos o neutros (pH 5.5-7) en robledales, hayedos y encinares.",
"cond_suelo_ca": "Sòls silicis o neutres (pH 5.5-7) en rouredes, faigedes i alzinars.",
"cond_suelo_en": "Siliceous or neutral soils (pH 5.5-7) in oak, beech, and holm oak forests.",
"cond_req_es": "Micorrizógena; requiere choque térmico y es una especie escasa y protegida asociada a planifolios.",
"cond_req_ca": "Micorrizogen; requereix xoc tèrmic i és una espècie escassa i protegida associada a planifolis.",
"cond_req_en": "Mycorrhizal; requires thermal shock and is a scarce and protected species associated with broadleaf trees."
}'::jsonb
WHERE id = 'esp-201';