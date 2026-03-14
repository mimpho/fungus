-- esp-174  Sarcodon imbricatus
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Prefiere ambientes frescos entre 6–14°C. El crecimiento se detiene si las temperaturas superan los 14°C de forma sostenida.",
  "cond_temp_ca": "Prefereix ambients frescos entre 6–14°C. El creixement s''atura si les temperatures superen els 14°C de forma sostinguda.",
  "cond_temp_en": "Prefers cool environments between 6–14°C. Growth stops if temperatures consistently exceed 14°C.",
  "cond_precip_es": "Requiere al menos 30mm de lluvia acumulada. La fructificación óptima ocurre unos 12 días después de alcanzar los 75mm de precipitación.",
  "cond_precip_ca": "Requereix almenys 30mm de pluja acumulada. La fructificació òptima ocorre uns 12 dies després d''assolir els 75mm de precipitació.",
  "cond_precip_en": "Requires at least 30mm of accumulated rain. Optimal fruiting occurs about 12 days after reaching 75mm of precipitation.",
  "cond_suelo_es": "Suelos ácidos (pH 4–6) y bien drenados. Especie micorrizógena vinculada estrictamente a bosques de pinos en zonas de montaña.",
  "cond_suelo_ca": "Sòls àcids (pH 4–6) i ben drenats. Espècie micorrizògena vinculada estrictament a boscos de pins en zones de muntanya.",
  "cond_suelo_en": "Acidic soils (pH 4–6) and well-drained. Mycorrhizal species strictly linked to pine forests in mountain areas.",
  "cond_req_es": "Necesita choque térmico y tolera bien las primeras heladas. Aparece en pinedas maduras de alta montaña entre 800 y 2000 metros.",
  "cond_req_ca": "Necessita xoc tèrmic i tolera bé les primeres glaçades. Apareix en pinedes madures d''alta muntanya entre 800 i 2000 metres.",
  "cond_req_en": "Requires thermal shock and tolerates early frosts well. Found in mature high-mountain pine forests between 800 and 2000 meters."
}'::jsonb
WHERE id = 'esp-174';

-- esp-175  Sarcodon scabrosus
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Fructifica en rangos frescos de 6–14°C. Es sensible al calor excesivo, prefiriendo la bajada de temperaturas otoñal.",
  "cond_temp_ca": "Fructifica en rangos frescos de 6–14°C. És sensible a la calor excessiva, preferint la baixada de temperatures de tardor.",
  "cond_temp_en": "Fruits in cool ranges of 6–14°C. It is sensitive to excessive heat, preferring the autumn temperature drop.",
  "cond_precip_es": "Necesita humedad constante con un mínimo de 30mm previos. El ciclo de maduración es largo, requiriendo unos 12 días tras lluvias generosas.",
  "cond_precip_ca": "Necessita humitat constant amb un mínim de 30mm previs. El cicle de maduració és llarg, requerint uns 12 dies després de pluges generoses.",
  "cond_precip_en": "Needs constant moisture with a minimum of 30mm previously. The maturation cycle is long, requiring about 12 days after generous rains.",
  "cond_suelo_es": "Suelos ácidos y pobres (pH 4–6). Forma micorrizas con pinos y hayas en bosques maduros con buena capa de hojarasca.",
  "cond_suelo_ca": "Sòls àcids i pobres (pH 4–6). Forma micorrizes amb pins i faigs en boscos madurs amb bona capa de fullaraca.",
  "cond_suelo_en": "Acidic and poor soils (pH 4–6). Forms mycorrhizae with pines and beeches in mature forests with a good leaf litter layer.",
  "cond_req_es": "Requiere choque térmico y heladas para activar su ciclo. Se encuentra en pinedas y hayedos montanos de hasta 1800 metros.",
  "cond_req_ca": "Requereix xoc tèrmic i glaçades per activar el seu cicle. Es troba en pinedes i fagedes montanes de fins a 1800 metres.",
  "cond_req_en": "Requires thermal shock and frosts to trigger its cycle. Found in mountain pine and beech forests up to 1800 meters."
}'::jsonb
WHERE id = 'esp-175';

-- esp-176  Hydnellum peckii
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Rango óptimo de 6–14°C. Su desarrollo es lento y requiere temperaturas estables y frescas durante el otoño.",
  "cond_temp_ca": "Rang òptim de 6–14°C. El seu desenvolupament és lent i requereix temperatures estables i fresques durant la tardor.",
  "cond_temp_en": "Optimal range of 6–14°C. Its development is slow and requires stable, cool temperatures during autumn.",
  "cond_precip_es": "Exigente en humedad, requiere al menos 35mm. Fructifica de forma óptima con 80mm acumulados en los días previos.",
  "cond_precip_ca": "Exigent en humitat, requereix almenys 35mm. Fructifica de forma òptima amb 80mm acumulats en els dies previs.",
  "cond_precip_en": "Demanding in moisture, requires at least 35mm. Fruits optimally with 80mm accumulated in the previous days.",
  "cond_suelo_es": "Suelos muy ácidos (pH 4–6). Especie micorrizógena asociada a pinos y hayas, a menudo oculta entre el musgo.",
  "cond_suelo_ca": "Sòls molt àcids (pH 4–6). Espècie micorrizògena associada a pins i faigs, sovint oculta entre la molsa.",
  "cond_suelo_en": "Very acidic soils (pH 4–6). Mycorrhizal species associated with pines and beeches, often hidden among moss.",
  "cond_req_es": "Requiere choque térmico y heladas. Destaca por sus gotas rojas (gutación) en ejemplares jóvenes en bosques de montaña.",
  "cond_req_ca": "Requereix xoc tèrmic i glaçades. Destaca per les seves gotes roges (gutació) en exemplars joves en boscos de muntanya.",
  "cond_req_en": "Requires thermal shock and frosts. Notable for its red droplets (guttation) on young specimens in mountain forests."
}'::jsonb
WHERE id = 'esp-176';

-- esp-105  Entoloma sinuatum
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Prefiere temperaturas templadas entre 12–24°C. Es una especie termófila que aparece principalmente a finales de verano y principios de otoño.",
  "cond_temp_ca": "Prefereix temperatures temperades entre 12–24°C. És una espècie termòfila que apareix principalment a finals d''estiu i principis de tardor.",
  "cond_temp_en": "Prefers mild temperatures between 12–24°C. It is a thermophilic species that appears mainly in late summer and early autumn.",
  "cond_precip_es": "Necesita humedad moderada (20mm mín.). La fructificación se activa rápidamente, unos 6 días después de lluvias significativas.",
  "cond_precip_ca": "Necessita humitat moderada (20mm mín.). La fructificació s''activa ràpidament, uns 6 dies després de pluges significatives.",
  "cond_precip_en": "Needs moderate moisture (20mm min.). Fruiting activates quickly, about 6 days after significant rains.",
  "cond_suelo_es": "Suelos arcillosos y básicos o neutros (pH 5.5–7.5). Crece en bosques de frondosas como robledales y hayedos.",
  "cond_suelo_ca": "Sòls argilosos i bàsics o neutres (pH 5.5–7.5). Creix en boscos de planifolis com rouredes i fagedes.",
  "cond_suelo_en": "Clayey and basic or neutral soils (pH 5.5–7.5). Grows in broadleaf forests such as oak and beech forests.",
  "cond_req_es": "Especie micorrizógena de frondosas. No requiere frío ni choque térmico; de hecho, las heladas detienen su aparición.",
  "cond_req_ca": "Espècie micorrizògena de planifolis. No requereix fred ni xoc tèrmic; de fet, les glaçades n''aturen l''aparició.",
  "cond_req_en": "Mycorrhizal species of broadleaf trees. Does not require cold or thermal shock; in fact, frosts stop its emergence."
}'::jsonb
WHERE id = 'esp-105';

-- esp-106  Entoloma rhodopolium
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Rango térmico moderado de 10–20°C. Aparece con el refrescamiento otoñal en cotas medias y bajas.",
  "cond_temp_ca": "Rang tèrmic moderat de 10–20°C. Apareix amb el refrescament de la tardor en cotes mitjanes i baixes.",
  "cond_temp_en": "Moderate thermal range of 10–20°C. Appears with the autumn cooling at medium and low elevations.",
  "cond_precip_es": "Requiere lluvias constantes (25mm mín.) para mantener la humedad del suelo. Ciclo de fructificación de unos 7 días.",
  "cond_precip_ca": "Requereix pluges constants (25mm mín.) per mantenir la humitat del sòl. Cicle de fructificació d''uns 7 dies.",
  "cond_precip_en": "Requires constant rain (25mm min.) to maintain soil moisture. Fruiting cycle of about 7 days.",
  "cond_suelo_es": "Suelos neutros o ligeramente ácidos (pH 5–7). Se asocia micorrizicamente con hayas y robles en bosques mixtos.",
  "cond_suelo_ca": "Sòls neutres o lleugerament àcids (pH 5–7). S''associa micorrizicament amb faigs i roures en boscos mixtos.",
  "cond_suelo_en": "Neutral or slightly acidic soils (pH 5–7). Mycorrhizally associated with beeches and oaks in mixed forests.",
  "cond_req_es": "Micorrizógena de planifolis. Prefiere ambientes sombríos y húmedos, sin necesidad de choques térmicos agresivos.",
  "cond_req_ca": "Micorrizògena de planifolis. Prefereix ambients ombrívols i humits, sense necessitat de xocs tèrmics agressius.",
  "cond_req_en": "Mycorrhizal with broadleaf trees. Prefers shady and humid environments, without the need for aggressive thermal shocks."
}'::jsonb
WHERE id = 'esp-106';

-- esp-177  Phellodon niger
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Fructifica en rangos frescos (6–14°C). Su desarrollo es pausado y requiere estabilidad térmica sin calores repentinos.",
  "cond_temp_ca": "Fructifica en rangos frescos (6–14°C). El seu desenvolupament és pausat i requereix estabilitat tèrmica sense calors repentines.",
  "cond_temp_en": "Fruits in cool ranges (6–14°C). Its development is slow and requires thermal stability without sudden heat waves.",
  "cond_precip_es": "Necesita un suelo bien hidratado con al menos 30mm acumulados. La fructificación óptima se da unos 12 días después de lluvias generosas.",
  "cond_precip_ca": "Necessita un sòl ben hidratat amb almenys 30mm acumulats. La fructificació òptima es dóna uns 12 dies després de pluges generoses.",
  "cond_precip_en": "Needs well-hydrated soil with at least 30mm accumulated. Optimal fruiting occurs about 12 days after generous rains.",
  "cond_suelo_es": "Suelos ácidos a neutros (pH 4–6.5) con materia orgánica. Micorrizógena de pinos y hayas, a menudo en bosques mixtos con musgo.",
  "cond_suelo_ca": "Sòls àcids a neutres (pH 4–6.5) amb matèria orgànica. Micorrizògena de pins i faigs, sovint en boscos mixtos amb molsa.",
  "cond_suelo_en": "Acidic to neutral soils (pH 4–6.5) with organic matter. Mycorrhizal with pines and beeches, often in mixed forests with moss.",
  "cond_req_es": "Requiere choque térmico y heladas previas. Es una especie micorrizógena que prefiere zonas de montaña media y alta (400–1600m).",
  "cond_req_ca": "Requereix xoc tèrmic i glaçades prèvies. És una espècie micorrizògena que prefereix zones de muntanya mitjana i alta (400–1600m).",
  "cond_req_en": "Requires thermal shock and prior frosts. A mycorrhizal species that prefers mid to high mountain areas (400–1600m)."
}'::jsonb
WHERE id = 'esp-177';

-- esp-178  Bankera fuligineoalba
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Temperaturas bajas entre 6–14°C. Es una especie tardía que tolera bien el frío intenso de la alta montaña.",
  "cond_temp_ca": "Temperatures baixes entre 6–14°C. És una espècie tardana que tolera bé el fred intens de l''alta muntanya.",
  "cond_temp_en": "Low temperatures between 6–14°C. It is a late-season species that tolerates intense high-mountain cold well.",
  "cond_precip_es": "Exigente en humedad (30mm mín.). La fructificación óptima requiere 75mm acumulados y suelos saturados.",
  "cond_precip_ca": "Exigent en humitat (30mm mín.). La fructificació òptima requereix 75mm acumulats i sòls saturats.",
  "cond_precip_en": "Demanding in moisture (30mm min.). Optimal fruiting requires 75mm accumulated and saturated soils.",
  "cond_suelo_es": "Estrictamente ligada a suelos muy ácidos (pH 4–6). Forma micorrizas exclusivamente con pinos en ambientes de montaña.",
  "cond_suelo_ca": "Estrictament lligada a sòls molt àcids (pH 4–6). Forma micorrizes exclusivament amb pins en ambients de muntanya.",
  "cond_suelo_en": "Strictly linked to very acidic soils (pH 4–6). Forms mycorrhizae exclusively with pines in mountain environments.",
  "cond_req_es": "Micorrizógena obligada; requiere heladas y choque térmico. Aparece en pinedas de montaña entre los 800 y 2000 metros.",
  "cond_req_ca": "Micorrizògena obligada; requereix glaçades i xoc tèrmic. Apareix en pinedes de muntanya entre els 800 i 2000 metres.",
  "cond_req_en": "Obligate mycorrhizal; requires frosts and thermal shock. Found in mountain pine forests between 800 and 2000 meters."
}'::jsonb
WHERE id = 'esp-178';

-- esp-107  Entoloma clypeatum
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Fructificación primaveral con temperaturas de 8–18°C. Es de las primeras especies en aparecer tras el invierno.",
  "cond_temp_ca": "Fructificació primaveral amb temperatures de 8–18°C. És de les primeres espècies en aparèixer després de l''hivern.",
  "cond_temp_en": "Spring fruiting with temperatures of 8–18°C. One of the first species to appear after winter.",
  "cond_precip_es": "Necesita lluvias primaverales de al menos 25mm. El ciclo de crecimiento es rápido, apareciendo unos 7 días tras las lluvias.",
  "cond_precip_ca": "Necessita pluges primaverals d''almenys 25mm. El cicle de creixement és ràpid, apareixent uns 7 dies després de les pluges.",
  "cond_precip_en": "Needs spring rains of at least 25mm. Growth cycle is fast, appearing about 7 days after the rains.",
  "cond_suelo_es": "Suelos básicos o neutros (pH 5.5–7.5). Crece en prados y orillas de bosques asociados a Rosáceas (espino blanco, endrino).",
  "cond_suelo_ca": "Sòls bàsics o neutres (pH 5.5–7.5). Creix en prats i marges de boscos associats a Rosàcies (arç blanc, aranyoner).",
  "cond_suelo_en": "Basic or neutral soils (pH 5.5–7.5). Grows in meadows and forest edges associated with Rosaceae (hawthorn, blackthorn).",
  "cond_req_es": "Especie micorrizógena vinculada a arbustos frutales. No requiere frío previo, es característica de la primavera temprana.",
  "cond_req_ca": "Espècie micorrizògena vinculada a arbustos fruiters. No requereix fred previ, és característica de la primavera primerenca.",
  "cond_req_en": "Mycorrhizal species linked to fruit shrubs. Does not require prior cold, characteristic of early spring."
}'::jsonb
WHERE id = 'esp-107';

-- esp-108  Clitopilus prunulus
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Rango templado-fresco de 8–18°C. Es conocida como la ''chivata'' del Boletus por compartir condiciones térmicas.",
  "cond_temp_ca": "Rang temperat-fresc de 8–18°C. És coneguda com la ''xivata'' del cep per compartir condicions tèrmiques.",
  "cond_temp_en": "Mild-cool range of 8–18°C. Known as the ''indicator'' for porcini as they share similar thermal conditions.",
  "cond_precip_es": "Requiere humedad moderada constante (25mm mín.). Fructifica de forma óptima unos 7 días después de lluvias regulares.",
  "cond_precip_ca": "Requereix humitat moderada constant (25mm mín.). Fructifica de forma òptima uns 7 dies després de pluges regulars.",
  "cond_precip_en": "Requires constant moderate moisture (25mm min.). Fruits optimally about 7 days after regular rains.",
  "cond_suelo_es": "Suelos neutros a ligeramente ácidos (pH 5.5–7.5). Aparece en prados y bosques de robles con buen drenaje.",
  "cond_suelo_ca": "Sòls neutres a lleugerament àcids (pH 5.5–7.5). Apareix en prats i boscos de roures amb bon drenatge.",
  "cond_suelo_en": "Neutral to slightly acidic soils (pH 5.5–7.5). Appears in meadows and oak forests with good drainage.",
  "cond_req_es": "Especie saprófita; prefiere suelos con restos herbáceos o de hojarasca. Indicadora de la inminente aparición de micorrizas nobles.",
  "cond_req_ca": "Espècie sapròfita; prefereix sòls amb restes herbàcies o de fullaraca. Indicadora de la imminent aparició de micorrizes nobles.",
  "cond_req_en": "Saprophytic species; prefers soils with herbaceous or leaf litter remains. Indicator of the imminent appearance of noble mycorrhizae."
}'::jsonb
WHERE id = 'esp-108';

-- esp-110  Entoloma lividoalbum
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Prefiere temperaturas suaves de 10–20°C. Típica de principios de otoño en bosques de tierras bajas.",
  "cond_temp_ca": "Prefereix temperatures suaus de 10–20°C. Típica de principis de tardor en boscos de terres baixes.",
  "cond_temp_en": "Prefers mild temperatures of 10–20°C. Typical of early autumn in lowland forests.",
  "cond_precip_es": "Necesita humedad ambiental alta y lluvias de 25mm. Ciclo de fructificación rápido tras la hidratación del sustrato.",
  "cond_precip_ca": "Necessita humitat ambiental alta i pluges de 25mm. Cicle de fructificació ràpid després de la hidratació del substrat.",
  "cond_precip_en": "Needs high ambient humidity and 25mm of rain. Fast fruiting cycle after substrate hydration.",
  "cond_suelo_es": "Suelos neutros o calcáreos (pH 5.5–7.5). Se asocia a encinares, robledales y bosques mixtos mediterráneos.",
  "cond_suelo_ca": "Sòls neutres o calcaris (pH 5.5–7.5). S''associa a alzinars, rouredes i boscos mixtos mediterranis.",
  "cond_suelo_en": "Neutral or calcareous soils (pH 5.5–7.5). Associated with holm oak, oak, and mixed Mediterranean forests.",
  "cond_req_es": "Especie micorrizógena de frondosas. No requiere heladas; suele desaparecer cuando llega el frío intenso.",
  "cond_req_ca": "Espècie micorrizògena de planifolis. No requereix glaçades; sol desaparèixer quan arriba el fred intens.",
  "cond_req_en": "Mycorrhizal species of broadleaf trees. Does not require frosts; usually disappears when intense cold arrives."
}'::jsonb
WHERE id = 'esp-110';

-- esp-120  Hebeloma crustuliniforme
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Soporta temperaturas frías de 6–16°C. Muy resistente, fructifica hasta bien entrada la temporada de frío.",
  "cond_temp_ca": "Suporta temperatures fredes de 6–16°C. Molt resistent, fructifica fins ben entrada la temporada de fred.",
  "cond_temp_en": "Tolerates cold temperatures of 6–16°C. Very hardy, fruits well into the cold season.",
  "cond_precip_es": "Requiere lluvias regulares (25mm mín.). Su ciclo es de 8 días y soporta suelos muy saturados.",
  "cond_precip_ca": "Requereix pluges regulars (25mm mín.). El seu cicle és de 8 dies i suporta sòls molt saturats.",
  "cond_precip_en": "Requires regular rain (25mm min.). Its cycle is 8 days and it tolerates very saturated soils.",
  "cond_suelo_es": "Suelos neutros a ligeramente ácidos (pH 5–7.5). Muy versátil, se asocia tanto con coníferas como con frondosas.",
  "cond_suelo_ca": "Sòls neutres a lleugerament àcids (pH 5–7.5). Molt versàtil, s''associa tant amb coníferes com amb planifolis.",
  "cond_suelo_en": "Neutral to slightly acidic soils (pH 5–7.5). Very versatile, associates with both conifers and broadleaf trees.",
  "cond_req_es": "Especie micorrizógena pionera. Requiere choque térmico y heladas; a menudo aparece en parques o zonas degradadas.",
  "cond_req_ca": "Espècie micorrizògena pionera. Requereix xoc tèrmic i glaçades; sovint apareix en parcs o zones degradades.",
  "cond_req_en": "Pioneer mycorrhizal species. Requires thermal shock and frosts; often appears in parks or degraded areas."
}'::jsonb
WHERE id = 'esp-120';

-- esp-123  Gymnopilus junonius
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Rango térmico de 10–22°C. Prefiere el final del verano y otoños suaves para desarrollar sus grandes grupos.",
  "cond_temp_ca": "Rang tèrmic de 10–22°C. Prefereix el final de l''estiu i tardors suaus per desenvolupar els seus grans grups.",
  "cond_temp_en": "Thermal range of 10–22°C. Prefers late summer and mild autumns to develop its large clusters.",
  "cond_precip_es": "Necesita humedad moderada (25mm mín.). Al crecer sobre madera, depende más de la humedad interna del tronco.",
  "cond_precip_ca": "Necessita humitat moderada (25mm mín.). En créixer sobre fusta, depèn més de la humitat interna del tronc.",
  "cond_precip_en": "Needs moderate moisture (25mm min.). Growing on wood, it depends more on the internal humidity of the trunk.",
  "cond_suelo_es": "Suelos ácidos a neutros (pH 5–7). Crece de forma saprófita sobre tocones y raíces muertas de pinos y robles.",
  "cond_suelo_ca": "Sòls àcids a neutres (pH 5–7). Creix de forma sapròfita sobre soques i arrels mortes de pins i roures.",
  "cond_suelo_en": "Acidic to neutral soils (pH 5–7). Grows saprophytically on stumps and dead roots of pines and oaks.",
  "cond_req_es": "Especie saprófita lignícola. No requiere choque térmico, crece en ramilletes espectaculares sobre madera en descomposición.",
  "cond_req_ca": "Espècie sapròfita lignícola. No requereix xoc tèrmic, creix en rams espectaculars sobre fusta en descomposició.",
  "cond_req_en": "Lignicolous saprophytic species. Does not require thermal shock, grows in spectacular clusters on decaying wood."
}'::jsonb
WHERE id = 'esp-123';

-- esp-155  Psilocybe semilanceata
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Temperaturas frescas (6–16°C). La fructificación se activa con la bajada de temperaturas otoñal en zonas de montaña.",
  "cond_temp_ca": "Temperatures fresques (6–16°C). La fructificació s''activa amb la baixada de temperatures de tardor en zones de muntanya.",
  "cond_temp_en": "Cool temperatures (6–16°C). Fruiting activates with the autumn temperature drop in mountain areas.",
  "cond_precip_es": "Muy exigente en agua (30mm mín.). Requiere suelos saturados y humedad ambiental superior al 80%.",
  "cond_precip_ca": "Molt exigent en aigua (30mm mín.). Requereix sòls saturats i humitat ambiental superior al 80%.",
  "cond_precip_en": "Very water-demanding (30mm min.). Requires saturated soils and ambient humidity above 80%.",
  "cond_suelo_es": "Suelos ácidos (pH 5–7), nitrogenados y ricos en restos de gramíneas. No micorrizógena, crece entre el césped.",
  "cond_suelo_ca": "Sòls àcids (pH 5–7), nitrogenats i rics en restes de gramínies. No micorrizògena, creix entre la gespa.",
  "cond_suelo_en": "Acidic soils (pH 5–7), nitrogenous and rich in grass remains. Non-mycorrhizal, grows among grass.",
  "cond_req_es": "Especie saprófita pratícola. Típica de pastizales de montaña con ganado, donde los restos orgánicos favorecen su aparición.",
  "cond_req_ca": "Espècie sapròfita pratícola. Típica de pastures de muntanya amb ramat, on les restes orgàniques afavoreixen la seva aparició.",
  "cond_req_en": "Praticolous saprophytic species. Typical of mountain pastures with livestock, where organic remains favor its appearance."
}'::jsonb
WHERE id = 'esp-155';