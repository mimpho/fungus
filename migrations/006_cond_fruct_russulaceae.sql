-- esp-023  Russula virescens
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Prefiere ambientes templados con un óptimo de 16°C, siendo sensible a heladas tempranas.",
  "cond_temp_ca": "Prefereix ambients temperats amb un òptim de 16°C, sent sensible a les gelades primerenques.",
  "cond_temp_en": "Prefers temperate environments with an optimum of 16°C, being sensitive to early frosts.",
  "cond_precip_es": "Requiere lluvias generosas de 70 mm y alta humedad (78%) para desarrollar su cutícula resquebrajada.",
  "cond_precip_ca": "Requereix pluges generoses de 70 mm i alta humitat (78%) per desenvolupar la seva cutícula brescada.",
  "cond_precip_en": "Requires generous rains of 70 mm and high humidity (78%) to develop its cracked cuticle.",
  "cond_suelo_es": "Suelos silíceos y neutros (pH 5.5-7) en bosques maduros de planifolios.",
  "cond_suelo_ca": "Sòls silicis i neutres (pH 5.5-7) en boscos madurs de planifolis.",
  "cond_suelo_en": "Siliceous and neutral soils (pH 5.5-7) in mature broadleaf forests.",
  "cond_req_es": "Micorrizógena; requiere choque térmico estival y es una de las rúsulas más apreciadas.",
  "cond_req_ca": "Micorrizogen; requereix xoc tèrmic estival i és una de les llores més apreciades.",
  "cond_req_en": "Mycorrhizal; requires summer thermal shock and is one of the most prized Russulas."
}'::jsonb
WHERE id = 'esp-023';

-- esp-024  Russula cyanoxantha
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Fructifica de forma óptima a 16°C, tolerando un rango amplio en zonas montanas.",
  "cond_temp_ca": "Fructifica de forma òptima a 16°C, tolerant un rang ampli en zones montanes.",
  "cond_temp_en": "Fruits optimally at 16°C, tolerating a wide range in montane areas.",
  "cond_precip_es": "Necesita 70 mm de lluvia acumulada y una humedad ambiental alta cercana al 80%.",
  "cond_precip_ca": "Necessita 70 mm de pluja acumulada i una humitat ambiental alta propera al 80%.",
  "cond_precip_en": "Needs 70 mm of accumulated rain and a high ambient humidity near 80%.",
  "cond_suelo_es": "Suelos ácidos o neutros (pH 5-6.5) en hayedos y robledales sombríos.",
  "cond_suelo_ca": "Sòls àcids o neutres (pH 5-6.5) en fagedes i rouredes ombrívoles.",
  "cond_suelo_en": "Acidic or neutral soils (pH 5-6.5) in shady beech and oak forests.",
  "cond_req_es": "Micorrizógena; requiere choque térmico y se caracteriza por sus láminas de consistencia grasienta.",
  "cond_req_ca": "Micorrizogen; requereix xoc tèrmic i es caracteritza per les seves làmines de consistència grassa.",
  "cond_req_en": "Mycorrhizal; requires thermal shock and is characterized by its greasy-feeling gills."
}'::jsonb
WHERE id = 'esp-024';

-- esp-025  Russula delica
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Prefiere temperaturas frescas de 14°C, apareciendo a menudo enterrada en la hojarasca.",
  "cond_temp_ca": "Prefereix temperatures fresques de 14°C, apareixent sovint enterrada a la pinassa o fullaraca.",
  "cond_temp_en": "Prefers cool temperatures of 14°C, often appearing buried in leaf litter.",
  "cond_precip_es": "Exigente en humedad (80%) y lluvias constantes de 75 mm para emerger del suelo.",
  "cond_precip_ca": "Exigent en humitat (80%) i pluges constants de 75 mm per emergir del sòl.",
  "cond_precip_en": "Demanding in humidity (80%) and constant rains of 75 mm to emerge from the ground.",
  "cond_suelo_es": "Indiferente edáfica (pH 5-7), común en diversos tipos de bosques mixtos.",
  "cond_suelo_ca": "Indiferent edàfica (pH 5-7), comú en diversos tipus de boscos mixtos.",
  "cond_suelo_en": "Edaphic indifferent (pH 5-7), common in various types of mixed forests.",
  "cond_req_es": "Micorrizógena; no requiere choque térmico específico y suele estar muy parasitada por insectos.",
  "cond_req_ca": "Micorrizogen; no requereix xoc tèrmic específic i sol estar molt parasitada per insectes.",
  "cond_req_en": "Mycorrhizal; does not require specific thermal shock and is often heavily parasitized by insects."
}'::jsonb
WHERE id = 'esp-025';

-- esp-026  Russula emetica
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Fructifica en ambientes frescos y húmedos de montaña con un óptimo de 14°C.",
  "cond_temp_ca": "Fructifica en ambients frescos i humits de muntanya amb un òptim de 14°C.",
  "cond_temp_en": "Fruits in cool and humid mountain environments with an optimum of 14°C.",
  "cond_precip_es": "Requiere precipitaciones elevadas de 80 mm y terrenos muy húmedos o turberas.",
  "cond_precip_ca": "Requereix precipitacions elevades de 80 mm i terrenys molt humits o torberes.",
  "cond_precip_en": "Requires high precipitation of 80 mm and very wet ground or bogs.",
  "cond_suelo_es": "Suelos muy ácidos (pH 4-6), frecuentemente asociada a coníferas en zonas encharcadas.",
  "cond_suelo_ca": "Sòls molt àcids (pH 4-6), freqüentment associada a coníferes en zones embassades.",
  "cond_suelo_en": "Very acidic soils (pH 4-6), frequently associated with conifers in waterlogged areas.",
  "cond_req_es": "Micorrizógena; requiere choque térmico y es conocida por su sabor extremadamente picante.",
  "cond_req_ca": "Micorrizogen; requereix xoc tèrmic i és coneguda pel seu sabor extremadament picant.",
  "cond_req_en": "Mycorrhizal; requires thermal shock and is known for its extremely acrid taste."
}'::jsonb
WHERE id = 'esp-026';

-- esp-027  Russula aurea
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Especie termófila que prefiere 17°C, siendo más común en veranos cálidos y húmedos.",
  "cond_temp_ca": "Espècie termòfila que prefereix 17°C, sent més comú en estius càlids i humits.",
  "cond_temp_en": "Thermophilic species that prefers 17°C, being more common in warm and humid summers.",
  "cond_precip_es": "Se activa con lluvias de 65 mm si la humedad ambiental se mantiene al 75%.",
  "cond_precip_ca": "S’activa amb pluges de 65 mm si la humitat ambiental es manté al 75%.",
  "cond_precip_en": "Activates with 65 mm of rain if the ambient humidity remains at 75%.",
  "cond_suelo_es": "Suelos silíceos y neutros (pH 5-7) en bosques de robles y frondosas.",
  "cond_suelo_ca": "Sòls silicis i neutres (pH 5-7) en boscos de roures i frondoses.",
  "cond_suelo_en": "Siliceous and neutral soils (pH 5-7) in oak and broadleaf forests.",
  "cond_req_es": "Micorrizógena; no requiere choque térmico específico; destaca por su color amarillo dorado en las láminas.",
  "cond_req_ca": "Micorrizogen; no requereix xoc tèrmic específic; destaca pel seu color groc daurat a les làmines.",
  "cond_req_en": "Mycorrhizal; does not require specific thermal shock; notable for the golden yellow color of its gills."
}'::jsonb
WHERE id = 'esp-027';

-- esp-028  Russula parazurea
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Prefiere el fresco de hayedos montanos con un óptimo de fructificación de 14°C.",
  "cond_temp_ca": "Prefereix la fresca de fagedes montanes amb un òptim de fructificació de 14°C.",
  "cond_temp_en": "Prefers the coolness of montane beech forests with an optimal fruiting of 14°C.",
  "cond_precip_es": "Necesita 70 mm de lluvia y humedad ambiental del 78% para el desarrollo de su cutícula pruinosa.",
  "cond_precip_ca": "Necessita 70 mm de pluja i humitat ambiental del 78% pel desenvolupament de la seva cutícula pruïnosa.",
  "cond_precip_en": "Needs 70 mm of rain and 78% ambient humidity for the development of its pruinose cuticle.",
  "cond_suelo_es": "Suelos silíceos (pH 5-7) en zonas húmedas de montaña.",
  "cond_suelo_ca": "Sòls silicis (pH 5-7) en zones humides de muntanya.",
  "cond_suelo_en": "Siliceous soils (pH 5-7) in humid mountain areas.",
  "cond_req_es": "Micorrizógena; requiere choque térmico y presenta tonos azulados-grisáceos característicos.",
  "cond_req_ca": "Micorrizogen; requereix xoc tèrmic i presenta tons blau-grisencs característics.",
  "cond_req_en": "Mycorrhizal; requires thermal shock and features characteristic bluish-gray tones."
}'::jsonb
WHERE id = 'esp-028';

-- esp-029  Russula olivacea
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Fructifica idealmente a 14°C, siendo común en el otoño temprano de zonas montañosas.",
  "cond_temp_ca": "Fructifica idealment a 14°C, sent comú a la tardor primerenca de zones muntanyoses.",
  "cond_temp_en": "Fruits ideally at 14°C, being common in early autumn in mountainous areas.",
  "cond_precip_es": "Requiere 75 mm de precipitación y humedad constante (80%) durante su ciclo de 8 días.",
  "cond_precip_ca": "Requereix 75 mm de precipitació i humitat constant (80%) durant el seu cicle de 8 dies.",
  "cond_precip_en": "Requires 75 mm of precipitation and constant humidity (80%) during its 8-day cycle.",
  "cond_suelo_es": "Suelos neutros o ligeramente ácidos (pH 5-6.5) preferentemente bajo hayas.",
  "cond_suelo_ca": "Sòls neutres o lleugerament àcids (pH 5-6.5) preferentment sota faigs.",
  "cond_suelo_en": "Neutral or slightly acidic soils (pH 5-6.5) preferably under beech trees.",
  "cond_req_es": "Micorrizógena; requiere choque térmico y es una de las rúsulas de mayor porte.",
  "cond_req_ca": "Micorrizogen; requereix xoc tèrmic i és una de les llores de major mida.",
  "cond_req_en": "Mycorrhizal; requires thermal shock and is one of the largest Russulas."
}'::jsonb
WHERE id = 'esp-029';

-- esp-030  Russula vesca
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Se adapta a temperaturas templadas de 17°C, apareciendo desde principios de verano.",
  "cond_temp_ca": "S’adapta a temperatures temperades de 17°C, apareixent des de principis d’estiu.",
  "cond_temp_en": "Adapts to temperate temperatures of 17°C, appearing from early summer.",
  "cond_precip_es": "Precisa de 65 mm de lluvia y humedad ambiental del 75% para una buena fructificación.",
  "cond_precip_ca": "Precisa de 65 mm de pluja i humitat ambiental del 75% per a una bona fructificació.",
  "cond_precip_en": "Requires 65 mm of rain and 75% ambient humidity for good fruiting.",
  "cond_suelo_es": "Indiferente edáfica (pH 5-7), muy frecuente en bosques mixtos de media montaña.",
  "cond_suelo_ca": "Indiferent edàfica (pH 5-7), molt freqüent en boscos mixtos de mitja muntanya.",
  "cond_suelo_en": "Edaphic indifferent (pH 5-7), very frequent in mixed middle-mountain forests.",
  "cond_req_es": "Micorrizógena; no requiere choque térmico y se reconoce por la cutícula que no llega al borde del sombrero.",
  "cond_req_ca": "Micorrizogen; no requereix xoc tèrmic i es reconeix perquè la cutícula no arriba al marge del barret.",
  "cond_req_en": "Mycorrhizal; does not require thermal shock and is recognized by the cuticle that does not reach the edge of the cap."
}'::jsonb
WHERE id = 'esp-030';

-- esp-031  Russula foetens
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Prefiere climas templados (17°C) y es muy común en los meses más húmedos del año.",
  "cond_temp_ca": "Prefereix climes temperats (17°C) i és molt comú en els mesos més humits de l’any.",
  "cond_temp_en": "Prefers temperate climates (17°C) and is very common during the wettest months of the year.",
  "cond_precip_es": "Necesita lluvias constantes de 70 mm y una humedad elevada (78%) para su desarrollo.",
  "cond_precip_ca": "Necessita pluges constants de 70 mm i una humitat elevada (78%) per al seu desenvolupament.",
  "cond_precip_en": "Needs constant rains of 70 mm and high humidity (78%) for its development.",
  "cond_suelo_es": "Suelos silíceos y neutros (pH 5-7) con abundante materia orgánica.",
  "cond_suelo_ca": "Sòls silicis i neutres (pH 5-7) amb abundant matèria orgànica.",
  "cond_suelo_en": "Siliceous and neutral soils (pH 5-7) with abundant organic matter.",
  "cond_req_es": "Micorrizógena; no requiere choque térmico y es fácilmente identificable por su olor desagradable.",
  "cond_req_ca": "Micorrizogen; no requereix xoc tèrmic i és fàcilment identificable per la seva olor desagradable.",
  "cond_req_en": "Mycorrhizal; does not require thermal shock and is easily identifiable by its unpleasant odor."
}'::jsonb
WHERE id = 'esp-031';

-- esp-032  Russula nigricans
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Fructifica con un óptimo de 15°C, siendo persistente incluso cuando se ennegrece.",
  "cond_temp_ca": "Fructifica amb un òptim de 15°C, sent persistent fins i tot quan s’ennegreix.",
  "cond_temp_en": "Fruits at an optimum of 15°C, remaining persistent even as it blackens.",
  "cond_precip_es": "Requiere 70 mm de lluvia y humedad ambiental del 75% en bosques densos.",
  "cond_precip_ca": "Requereix 70 mm de pluja i humitat ambiental del 75% en boscos densos.",
  "cond_precip_en": "Requires 70 mm of rain and 75% ambient humidity in dense forests.",
  "cond_suelo_es": "Indiferente edáfica (pH 5-7), común en suelos con mucho humus.",
  "cond_suelo_ca": "Indiferent edàfica (pH 5-7), comú en sòls amb molt d’humus.",
  "cond_suelo_en": "Edaphic indifferent (pH 5-7), common in soils with plenty of humus.",
  "cond_req_es": "Micorrizógena; no requiere choque térmico; sus láminas son muy gruesas y espaciadas.",
  "cond_req_ca": "Micorrizogen; no requereix xoc tèrmic; les seves làmines són molt gruixudes i espaiades.",
  "cond_req_en": "Mycorrhizal; does not require thermal shock; its gills are very thick and widely spaced."
}'::jsonb
WHERE id = 'esp-032';

-- esp-033  Russula xerampelina
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Prefiere ambientes frescos de 14°C, común en bosques de montaña del norte.",
  "cond_temp_ca": "Prefereix ambients frescos de 14°C, comú en boscos de muntanya del nord.",
  "cond_temp_en": "Prefers cool environments of 14°C, common in northern mountain forests.",
  "cond_precip_es": "Necesita precipitaciones de 75 mm y una humedad ambiental alta (80%).",
  "cond_precip_ca": "Necessita precipitacions de 75 mm i una humitat ambiental alta (80%).",
  "cond_precip_en": "Needs 75 mm of precipitation and high ambient humidity (80%).",
  "cond_suelo_es": "Suelos ácidos (pH 4.5-6.5) en pinares o hayedos acidófilos.",
  "cond_suelo_ca": "Sòls àcids (pH 4.5-6.5) en pinedes o fagedes acidòfiles.",
  "cond_suelo_en": "Acidic soils (pH 4.5-6.5) in pine or acidophilic beech forests.",
  "cond_req_es": "Micorrizógena; requiere choque térmico y se reconoce por su olor a marisco o arenque.",
  "cond_req_ca": "Micorrizogen; requereix xoc tèrmic i es reconeix per la seva olor de marisc o arengada.",
  "cond_req_en": "Mycorrhizal; requires thermal shock and is recognized by its shellfish or herring odor."
}'::jsonb
WHERE id = 'esp-033';

-- esp-034  Russula mustelina
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Especie de alta montaña que prefiere los 12°C y requiere el frío para fructificar.",
  "cond_temp_ca": "Espècie d’alta muntanya que prefereix els 12°C i requereix el fred per fructificar.",
  "cond_temp_en": "High-mountain species that prefers 12°C and requires cold to fruit.",
  "cond_precip_es": "Exige 80 mm de lluvia y humedad constante (80%) en climas subalpinos.",
  "cond_precip_ca": "Exigeix 80 mm de pluja i humitat constant (80%) en climes subalpins.",
  "cond_precip_en": "Demands 80 mm of rain and constant humidity (80%) in subalpine climates.",
  "cond_suelo_es": "Suelos muy ácidos (pH 4-5.5) bajo coníferas en altitudes superiores a 1000 m.",
  "cond_suelo_ca": "Sòls molt àcids (pH 4-5.5) sota coníferes en altituds superiors a 1000 m.",
  "cond_suelo_en": "Very acidic soils (pH 4-5.5) under conifers at altitudes above 1000 m.",
  "cond_req_es": "Micorrizógena; requiere helada y choque térmico; su aspecto recuerda al de un boletus.",
  "cond_req_ca": "Micorrizogen; requereix gelada i xoc tèrmic; el seu aspecte recorda al d’un breny o sureny.",
  "cond_req_en": "Mycorrhizal; requires frost and thermal shock; its appearance resembles that of a bolete."
}'::jsonb
WHERE id = 'esp-034';

-- esp-035  Lactarius deliciosus
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Fructifica con temperaturas frescas de 14°C, siendo muy sensible a los cambios bruscos.",
  "cond_temp_ca": "Fructifica amb temperatures fresques de 14°C, sent molt sensible als canvis bruscos.",
  "cond_temp_en": "Fruits with cool temperatures of 14°C, being very sensitive to sudden changes.",
  "cond_precip_es": "Necesita 70 mm de lluvia previa y humedad del 78% en los pinares.",
  "cond_precip_ca": "Necessita 70 mm de pluja prèvia i humitat del 78% a les pinedes.",
  "cond_precip_en": "Needs 70 mm of previous rain and 78% humidity in pine forests.",
  "cond_suelo_es": "Suelos ácidos y silíceos (pH 5-6.5) en bosques de pinos.",
  "cond_suelo_ca": "Sòls àcids i silicis (pH 5-6.5) en boscos de pins.",
  "cond_suelo_en": "Acidic and siliceous soils (pH 5-6.5) in pine forests.",
  "cond_req_es": "Micorrizógena; requiere choque térmico y es el hongo más popular y buscado del otoño.",
  "cond_req_ca": "Micorrizogen; requereix xoc tèrmic i és el bolet més popular i buscat de la tardor.",
  "cond_req_en": "Mycorrhizal; requires thermal shock and is the most popular and sought-after fungus of autumn."
}'::jsonb
WHERE id = 'esp-035';

-- esp-036  Lactarius sanguifluus
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Especie termófila de ambiente mediterráneo que prefiere los 17°C.",
  "cond_temp_ca": "Espècie termòfila d’ambient mediterrani que prefereix els 17°C.",
  "cond_temp_en": "Thermophilic species of Mediterranean environment that prefers 17°C.",
  "cond_precip_es": "Se conforma con 60 mm de lluvia y humedades moderadas del 70%.",
  "cond_precip_ca": "Es conforma amb 60 mm de pluja i humitats moderades del 70%.",
  "cond_precip_en": "Satisfied with 60 mm of rain and moderate humidity of 70%.",
  "cond_suelo_es": "Suelos calcáreos y básicos (pH 5-7) en pinares soleados.",
  "cond_suelo_ca": "Sòls calcaris i bàsics (pH 5-7) en pinedes assolellades.",
  "cond_suelo_en": "Calcareous and basic soils (pH 5-7) in sunny pine forests.",
  "cond_req_es": "Micorrizógena; no requiere choque térmico específico y destaca por su látex de color rojo vinoso.",
  "cond_req_ca": "Micorrizogen; no requereix xoc tèrmic específic i destaca pel seu làtex de color vermell vinós.",
  "cond_req_en": "Mycorrhizal; does not require specific thermal shock and stands out for its wine-red latex."
}'::jsonb
WHERE id = 'esp-036';

-- esp-037  Lactarius deterrimus
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Fructifica en climas fríos de montaña (12°C), aguantando bien las primeras heladas.",
  "cond_temp_ca": "Fructifica en climes freds de muntanya (12°C), aguantant bé les primeres gelades.",
  "cond_temp_en": "Fruits in cold mountain climates (12°C), withstanding early frosts well.",
  "cond_precip_es": "Requiere 80 mm de lluvia y una humedad ambiental alta (80%) en bosques de abetos o pinos.",
  "cond_precip_ca": "Requereix 80 mm de pluja i una humitat ambiental alta (80%) en boscos d’avets o pins.",
  "cond_precip_en": "Requires 80 mm of rain and high ambient humidity (80%) in fir or pine forests.",
  "cond_suelo_es": "Suelos ácidos (pH 4.5-6) en zonas montanas de altitud.",
  "cond_suelo_ca": "Sòls àcids (pH 4.5-6) en zones montanes d’altitud.",
  "cond_suelo_en": "Acidic soils (pH 4.5-6) in high-altitude mountain areas.",
  "cond_req_es": "Micorrizógena; requiere helada y choque térmico; se oxida rápidamente a tonos verdes.",
  "cond_req_ca": "Micorrizogen; requereix gelada i xoc tèrmic; s’oxida ràpidament a tons verds.",
  "cond_req_en": "Mycorrhizal; requires frost and thermal shock; it oxidizes quickly to green tones."
}'::jsonb
WHERE id = 'esp-037';

-- esp-038  Lactifluus piperatus
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Prefiere temperaturas templadas de 17°C y es común en los veranos lluviosos.",
  "cond_temp_ca": "Prefereix temperatures temperades de 17°C i és comú en els estius plujosos.",
  "cond_temp_en": "Prefers temperate temperatures of 17°C and is common in rainy summers.",
  "cond_precip_es": "Necesita 75 mm de lluvia y humedad ambiental del 78% para su desarrollo.",
  "cond_precip_ca": "Necessita 75 mm de pluja i humitat ambiental del 78% per al seu desenvolupament.",
  "cond_precip_en": "Needs 75 mm of rain and 78% ambient humidity for its development.",
  "cond_suelo_es": "Suelos silíceos y neutros (pH 5-7) en bosques de planifolios.",
  "cond_suelo_ca": "Sòls silicis i neutres (pH 5-7) en boscos de planifolis.",
  "cond_suelo_en": "Siliceous and neutral soils (pH 5-7) in broadleaf forests.",
  "cond_req_es": "Micorrizógena; no requiere choque térmico; tiene un látex blanco extremadamente picante.",
  "cond_req_ca": "Micorrizogen; no requereix xoc tèrmic; té un làtex blanc extremadament picant.",
  "cond_req_en": "Mycorrhizal; does not require thermal shock; has extremely acrid white latex."
}'::jsonb
WHERE id = 'esp-038';

-- esp-039  Lactarius torminosus
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Fructifica de forma óptima a 14°C, asociada frecuentemente a abedules en climas frescos.",
  "cond_temp_ca": "Fructifica de forma òptima a 14°C, associada freqüentment a bedolls en climes frescos.",
  "cond_temp_en": "Fruits optimally at 14°C, frequently associated with birches in cool climates.",
  "cond_precip_es": "Requiere 75 mm de lluvia y humedad ambiental del 80% para mantener su margen velloso.",
  "cond_precip_ca": "Requereix 75 mm de pluja i humitat ambiental del 80% per mantenir el seu marge vellós.",
  "cond_precip_en": "Requires 75 mm of rain and 80% ambient humidity to maintain its woolly margin.",
  "cond_suelo_es": "Suelos silíceos (pH 5-7) en zonas de robledal o bosque mixto.",
  "cond_suelo_ca": "Sòls silicis (pH 5-7) en zones de roureda o bosc mixt.",
  "cond_suelo_en": "Siliceous soils (pH 5-7) in oak or mixed forest areas.",
  "cond_req_es": "Micorrizógena; requiere choque térmico y es tóxica si no se cocina prolongadamente.",
  "cond_req_ca": "Micorrizogen; requereix xoc tèrmic i és tòxica si no es cuina prolongadament.",
  "cond_req_en": "Mycorrhizal; requires thermal shock and is toxic if not cooked for a long time."
}'::jsonb
WHERE id = 'esp-039';

-- esp-040  Lactarius indigo
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Especie de climas templados a cálidos (19°C), rara en Europa pero común en América.",
  "cond_temp_ca": "Espècie de climes temperats a càlids (19°C), rara a Europa però comú a Amèrica.",
  "cond_temp_en": "Species of temperate to warm climates (19°C), rare in Europe but common in America.",
  "cond_precip_es": "Necesita 75 mm de lluvia y humedades relativas altas del 80%.",
  "cond_precip_ca": "Necessita 75 mm de pluja i humitats relatives altes del 80%.",
  "cond_precip_en": "Needs 75 mm of rain and high relative humidity of 80%.",
  "cond_suelo_es": "Suelos neutros (pH 5-7) en diversos tipos de bosque mixto.",
  "cond_suelo_ca": "Sòls neutres (pH 5-7) en diversos tipus de bosc mixt.",
  "cond_suelo_en": "Neutral soils (pH 5-7) in various types of mixed forest.",
  "cond_req_es": "Micorrizógena; no requiere choque térmico; destaca por su color azul intenso y látex azul.",
  "cond_req_ca": "Micorrizogen; no requereix xoc tèrmic; destaca pel seu color blau intens i làtex blau.",
  "cond_req_en": "Mycorrhizal; does not require thermal shock; notable for its intense blue color and blue latex."
}'::jsonb
WHERE id = 'esp-040';

-- esp-041  Lactarius volemus
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Prefiere temperaturas templadas de 17°C y es común en el pleno verano lluvioso.",
  "cond_temp_ca": "Prefereix temperatures temperades de 17°C i és comú al ple estiu plujós.",
  "cond_temp_en": "Prefers temperate temperatures of 17°C and is common in rainy mid-summer.",
  "cond_precip_es": "Requiere 70 mm de precipitación y humedades altas del 80%.",
  "cond_precip_ca": "Requereix 70 mm de precipitació i humitats altes del 80%.",
  "cond_precip_en": "Requires 70 mm of precipitation and high humidity of 80%.",
  "cond_suelo_es": "Suelos silíceos y neutros (pH 5-7) bajo frondosas.",
  "cond_suelo_ca": "Sòls silicis i neutres (pH 5-7) sota frondoses.",
  "cond_suelo_en": "Siliceous and neutral soils (pH 5-7) under broadleaf trees.",
  "cond_req_es": "Micorrizógena; no requiere choque térmico; emite un látex blanco muy abundante y huele a pescado.",
  "cond_req_ca": "Micorrizogen; no requereix xoc tèrmic; emet un làtex blanc molt abundant i fa olor de peix.",
  "cond_req_en": "Mycorrhizal; does not require thermal shock; emits very abundant white latex and smells like fish."
}'::jsonb
WHERE id = 'esp-041';

-- esp-042  Lactifluus vellereus
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Fructifica de forma óptima a 15°C, común en los bosques de planifolios durante el otoño.",
  "cond_temp_ca": "Fructifica de forma òptima a 15°C, comú en els boscos de planifolis durant la tardor.",
  "cond_temp_en": "Fruits optimally at 15°C, common in broadleaf forests during autumn.",
  "cond_precip_es": "Necesita 70 mm de lluvia y humedad ambiental del 75% en ambientes sombríos.",
  "cond_precip_ca": "Necessita 70 mm de pluja i humitat ambiental del 75% en ambients ombrívols.",
  "cond_precip_en": "Needs 70 mm of rain and 75% ambient humidity in shady environments.",
  "cond_suelo_es": "Suelos silíceos y neutros (pH 5-7.5) con mucha hojarasca.",
  "cond_suelo_ca": "Sòls silicis i neutres (pH 5-7.5) amb molta fullaraca.",
  "cond_suelo_en": "Siliceous and neutral soils (pH 5-7.5) with plenty of leaf litter.",
  "cond_req_es": "Micorrizógena; no requiere choque térmico; posee una cutícula aterciopelada muy característica.",
  "cond_req_ca": "Micorrizogen; no requereix xoc tèrmic; posseeix una cutícula vellutada molt característica.",
  "cond_req_en": "Mycorrhizal; does not require thermal shock; has a very characteristic velvety cuticle."
}'::jsonb
WHERE id = 'esp-042';

-- esp-043  Russula laurocerasi
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Prefiere ambientes templados (17°C) y es típica del grupo de las rúsulas fétidas.",
  "cond_temp_ca": "Prefereix ambients temperats (17°C) i és típica del grup de les llores fètides.",
  "cond_temp_en": "Prefers temperate environments (17°C) and is typical of the foetid Russula group.",
  "cond_precip_es": "Requiere 70 mm de lluvia y humedad ambiental del 75% para su desarrollo.",
  "cond_precip_ca": "Requereix 70 mm de pluja i humitat ambiental del 75% per al seu desenvolupament.",
  "cond_precip_en": "Requires 70 mm of rain and 75% ambient humidity for its development.",
  "cond_suelo_es": "Suelos silíceos (pH 5-7) en bosques de frondosas.",
  "cond_suelo_ca": "Sòls silicis (pH 5-7) en boscos de frondoses.",
  "cond_suelo_en": "Siliceous soils (pH 5-7) in broadleaf forests.",
  "cond_req_es": "Micorrizógena; no requiere choque térmico; se caracteriza por su olor a almendras amargas.",
  "cond_req_ca": "Micorrizogen; no requereix xoc tèrmic; es caracteritza per la seva olor d’ametlles amargues.",
  "cond_req_en": "Mycorrhizal; does not require thermal shock; characterized by its bitter almond odor."
}'::jsonb
WHERE id = 'esp-043';

-- esp-044  Russula pseudointegra
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Fructifica idealmente a 17°C, siendo común en bosques cálidos de frondosas.",
  "cond_temp_ca": "Fructifica idealment a 17°C, sent comú en boscos càlids de frondoses.",
  "cond_temp_en": "Fruits ideally at 17°C, being common in warm broadleaf forests.",
  "cond_precip_es": "Se conforma con 60 mm de lluvia y humedades del 72% en el ambiente forestal.",
  "cond_precip_ca": "Es conforma amb 60 mm de pluja i humitats del 72% en l’ambient forestal.",
  "cond_precip_en": "Satisfied with 60 mm of rain and 72% humidity in the forest environment.",
  "cond_suelo_es": "Suelos neutros o básicos (pH 6-7.5) en encinares o robledales.",
  "cond_suelo_ca": "Sòls neutres o bàsics (pH 6-7.5) en alzinars o rouredes.",
  "cond_suelo_en": "Neutral or basic soils (pH 6-7.5) in holm oak or oak forests.",
  "cond_req_es": "Micorrizógena; no requiere choque térmico; sombrero rojo vivo y olor a fruta o mentol.",
  "cond_req_ca": "Micorrizogen; no requereix xoc tèrmic; barret vermell viu i olor de fruita o mentol.",
  "cond_req_en": "Mycorrhizal; does not require thermal shock; bright red cap and fruity or menthol odor."
}'::jsonb
WHERE id = 'esp-044';