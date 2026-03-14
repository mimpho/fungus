-- Familia Auriculariaceae

-- esp-198  Auricularia auricula-judae
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Fructifica en rangos frescos de 4–18°C, con un óptimo de 11°C. Tolera bien los cambios térmicos moderados del invierno y la primavera.",
  "cond_temp_ca": "Fructifica en rangos frescos de 4–18°C, amb un òptim d’11°C. Tolera bé els canvis tèrmics moderats de la tardor i l’hivern.",
  "cond_temp_en": "Fruits in cool ranges between 4–18°C, with an optimum at 11°C. It tolerates moderate thermal changes well during winter and spring.",
  "cond_precip_es": "Requiere al menos 25mm de lluvia acumulada; su cuerpo fructífero se hidrata y aparece rápido, unos 7 días tras las lluvias.",
  "cond_precip_ca": "Requereix almenys 25mm de pluja acumulada; el seu cos fructífer s’hidrata i apareix ràpid, uns 7 dies després de les pluges.",
  "cond_precip_en": "Requires at least 25mm of accumulated rain; the fruiting body hydrates and appears quickly, about 7 days after rainfall.",
  "cond_suelo_es": "Sustrato de madera muerta o debilitada de planifolios (pH 5.5–7.5). Común en bosques de ribera, robledales y zonas sombrías.",
  "cond_suelo_ca": "Substrat de fusta morta o afeblida de planifolis (pH 5.5–7.5). Comú en boscos de ribera, rouredes i zones ombrívoles.",
  "cond_suelo_en": "Substrate of dead or weakened broadleaf wood (pH 5.5–7.5). Common in riparian forests, oak groves, and shady areas.",
  "cond_req_es": "Hongo saprófito que crece principalmente sobre saúcos. No requiere choque térmico y puede encontrarse casi todo el año si hay suficiente humedad (65–82%).",
  "cond_req_ca": "Bolet sapròfit que creix principalment sobre saücs. No requereix xoc tèrmic i es pot trobar gairebé tot l’any si hi ha prou humitat (65–82%).",
  "cond_req_en": "Saprophytic fungus growing mainly on elder trees. It does not require thermal shock and can be found almost year-round with sufficient humidity (65–82%)."
}'::jsonb
WHERE id = 'esp-198';

-- esp-179  Auriscalpium vulgare
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Prefiere ambientes fríos entre 4–16°C, siendo los 10°C su temperatura ideal. Su crecimiento es lento pero constante durante el invierno.",
  "cond_temp_ca": "Prefereix ambients freds entre 4–16°C, essent els 10°C la seva temperatura ideal. El creixement és lent però constant durant l’hivern.",
  "cond_temp_en": "Prefers cold environments between 4–16°C, with 10°C being its ideal temperature. Growth is slow but steady throughout the winter.",
  "cond_precip_es": "Necesita lluvias moderadas (20–60mm) para mantener la humedad en el suelo. La fructificación suele ocurrir 10 días después de las lluvias.",
  "cond_precip_ca": "Necessita pluges moderades (20–60mm) per mantenir la humitat al sòl. La fructificació sol ocórrer 10 dies després de les pluges.",
  "cond_precip_en": "Needs moderate rainfall (20–60mm) to maintain soil moisture. Fruiting typically occurs 10 days after rain events.",
  "cond_suelo_es": "Sustrato muy específico: piñas de coníferas en descomposición, a menudo enterradas. Prefiere suelos ácidos (pH 4.5–6.5).",
  "cond_suelo_ca": "Substrat molt específic: pinyes de coníferes en descomposició, sovint enterrades. Prefereix sòls àcids (pH 4.5–6.5).",
  "cond_suelo_en": "Very specific substrate: decaying conifer cones, often buried. It prefers acidic soils (pH 4.5–6.5).",
  "cond_req_es": "Pequeño saprófito especialista en estróbilos de pino. Es muy resistente al frío y fructifica en altitudes de hasta 1600m.",
  "cond_req_ca": "Petit sapròfit especialista en estròbils de pi. És molt resistent al fred i fructifica en altituds de fins a 1600m.",
  "cond_req_en": "Small saprophyte specializing in pine strobili. It is very cold-resistant and fruits at altitudes up to 1600m."
}'::jsonb
WHERE id = 'esp-179';

-- Familia Discinaceae
-- esp-082  Gyromitra esculenta
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Fructifica con temperaturas bajas, entre 5–14°C, siendo los 9.5°C su óptimo. Es una especie de primavera temprana tras el deshielo.",
  "cond_temp_ca": "Fructifica amb temperatures baixes, entre 5–14°C, essent els 9.5°C el seu òptim. És una espècie de primavera primerenca després del desgel.",
  "cond_temp_en": "Fruits at low temperatures between 5–14°C, with an optimum of 9.5°C. It is an early spring species following snowmelt.",
  "cond_precip_es": "Requiere lluvias primaverales de 25–65mm. La fructificación suele aparecer unos 12 días después de las primeras precipitaciones importantes.",
  "cond_precip_ca": "Requereix pluges primaverals de 25–65mm. La fructificació sol aparèixer uns 12 dies després de les primeres precipitacions importants.",
  "cond_precip_en": "Requires spring rains of 25–65mm. Fruiting usually occurs about 12 days after the first significant rainfall.",
  "cond_suelo_es": "Suelos arenosos y silíceos (pH 5–6.5). Aparece en zonas abiertas de pinares de montaña, a menudo asociada a restos de madera.",
  "cond_suelo_ca": "Sòls sorrencs i silicis (pH 5–6.5). Apareix en zones obertes de pinedes de muntanya, sovint associada a restes de fusta.",
  "cond_suelo_en": "Sandy and siliceous soils (pH 5–6.5). Appears in open areas of mountain pine forests, often associated with wood debris.",
  "cond_req_es": "Hongo saprófito de montaña (600–2000m) que requiere obligatoriamente helada previa para fructificar. Especie tóxica/mortal en crudo.",
  "cond_req_ca": "Bolet sapròfit de muntanya (600–2000m) que requereix obligatòriament gelada prèvia per fructificar. Espècie tòxica/mortal en cru.",
  "cond_req_en": "Mountain saprophyte (600–2000m) that strictly requires previous frost to fruit. Toxic/deadly species when raw."
}'::jsonb
WHERE id = 'esp-082';

-- Familia Phallaceae
-- esp-188  Phallus impudicus
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Rango templado entre 12–24°C, con un óptimo de 18°C. Su desarrollo es explosivo durante los días más cálidos de su temporada.",
  "cond_temp_ca": "Rang temperat entre 12–24°C, amb un òptim de 18°C. El seu desenvolupament és explosiu durant els dies més càlids de la seva temporada.",
  "cond_temp_en": "Temperate range between 12–24°C, with an optimum of 18°C. Its development is explosive during the warmest days of its season.",
  "cond_precip_es": "Necesita humedad constante y lluvias de 20–60mm. Aparece muy rápido, apenas 5 días después de las lluvias significativas.",
  "cond_precip_ca": "Necessita humitat constant i pluges de 20–60mm. Apareix molt ràpid, només 5 dies després de les pluges significatives.",
  "cond_precip_en": "Needs constant humidity and 20–60mm of rain. Appears very quickly, just 5 days after significant rainfall.",
  "cond_suelo_es": "Suelos ricos en humus y materia orgánica (pH 5.5–7.5). Crece en bosques mixtos, jardines y prados nitrogenados.",
  "cond_suelo_ca": "Sòls rics en humus i matèria orgànica (pH 5.5–7.5). Creix en boscos mixtos, jardins i prats nitrogenats.",
  "cond_suelo_en": "Humus-rich soils with abundant organic matter (pH 5.5–7.5). Grows in mixed forests, gardens, and nitrogenous meadows.",
  "cond_req_es": "Saprófito inconfundible por su olor fétido. Fructifica de mayo a octubre en ambientes muy húmedos (60–75%) y cotas bajas.",
  "cond_req_ca": "Sapròfit inconfusible per la seva olor fètida. Fructifica de maig a octubre en ambients molt humits (60–75%) i cotes baixes.",
  "cond_req_en": "Saprophyte unmistakable due to its foul odor. Fruits from May to October in very humid environments (60–75%) and low elevations."
}'::jsonb
WHERE id = 'esp-188';

-- esp-189  Mutinus caninus
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Prefiere condiciones templadas (12–24°C). Desaparece con las primeras heladas, siendo sensible al frío intenso.",
  "cond_temp_ca": "Prefereix condicions temperades (12–24°C). Desapareix amb les primeres gelades, ja que és sensible al fred intens.",
  "cond_temp_en": "Prefers temperate conditions (12–24°C). Disappears with the first frosts, being sensitive to intense cold.",
  "cond_precip_es": "Requiere lluvias acumuladas de 20–60mm. Su ciclo de aparición es muy corto, surgiendo a los 5 días de la hidratación del sustrato.",
  "cond_precip_ca": "Requereix pluges acumulades de 20–60mm. El seu cicle d’aparició és molt curt, sorgint als 5 dies de la hidratació del substrat.",
  "cond_precip_en": "Requires 20–60mm of accumulated rain. Its appearance cycle is very short, emerging 5 days after substrate hydration.",
  "cond_suelo_es": "Suelos con madera muy degradada y abundante hojarasca (pH 5.5–7.5). Común en robledales y zonas de bosque mixto.",
  "cond_suelo_ca": "Sòls amb fusta molt degradada i abundant fullaraca (pH 5.5–7.5). Comú en rouredes i zones de bosc mixt.",
  "cond_suelo_en": "Soils with highly degraded wood and abundant leaf litter (pH 5.5–7.5). Common in oak groves and mixed forest areas.",
  "cond_req_es": "Pequeño hongo saprófito que fructifica entre mayo y octubre. No requiere choque térmico pero sí una humedad relativa estable entre 60–75%.",
  "cond_req_ca": "Petit bolet sapròfit que fructifica entre maig i octubre. No requereix xoc tèrmic però sí una humitat relativa estable entre 60–75%.",
  "cond_req_en": "Small saprophytic fungus that fruits between May and October. Does not require thermal shock but needs stable relative humidity (60–75%)."
}'::jsonb
WHERE id = 'esp-189';

-- Familia Sclerodermataceae
-- esp-183  Scleroderma citrinum
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Rango óptimo de 12–22°C. Es una especie termófila que prefiere el final del verano y el inicio del otoño.",
  "cond_temp_ca": "Rang òptim de 12–22°C. És una espècie termòfila que prefereix el final de l’estiu i l’inici de la tardor.",
  "cond_temp_en": "Optimal range of 12–22°C. It is a thermophilic species that prefers late summer and early autumn.",
  "cond_precip_es": "Necesita lluvias acumuladas de al menos 20mm. Su desarrollo es algo más lento, con un ciclo de maduración de unos 10 días.",
  "cond_precip_ca": "Necessita pluges acumulades d’almenys 20mm. El seu desenvolupament és una mica més lent, amb un cicle de maduració d’uns 10 dies.",
  "cond_precip_en": "Requires accumulated rainfall of at least 20mm. Its development is somewhat slower, with a maturation cycle of about 10 days.",
  "cond_suelo_es": "Suelos marcadamente ácidos (pH 4–6) y arenosos. Especie micorrizógena vinculada a pinos, robles y bosques mixtos.",
  "cond_suelo_ca": "Sòls marcadament àcids (pH 4–6) i sorrencs. Espècie micorrizògena vinculada a pins, roures i boscos mixtos.",
  "cond_suelo_en": "Markedly acidic (pH 4–6) and sandy soils. Mycorrhizal species linked to pines, oaks, and mixed forests.",
  "cond_req_es": "Hongo micorrizógeno muy resistente que tolera la sequedad superficial. No requiere choque térmico para su aparición.",
  "cond_req_ca": "Bolet micorrizogen molt resistent que tolera la sequedat superficial. No requereix xoc tèrmic per a la seva aparició.",
  "cond_req_en": "Very resistant mycorrhizal fungus that tolerates surface dryness. Does not require thermal shock for its appearance."
}'::jsonb
WHERE id = 'esp-183';

-- Familia Sparassidaceae
-- esp-134  Sparassis crispa
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Prefiere temperaturas frescas entre 8–18°C. El choque térmico otoñal es el principal disparador para que sus grandes masas rizadas fructifiquen.",
  "cond_temp_ca": "Prefereix temperatures fresques entre 8–18°C. El xoc tèrmic de tardor és el principal disparador perquè les seves grans masses rizades fructifiquin.",
  "cond_temp_en": "Prefers cool temperatures between 8–18°C. Autumn thermal shock is the main trigger for its large curly masses to fruit.",
  "cond_precip_es": "Necesita lluvias generosas (30–75mm). Debido a su gran volumen, requiere un ciclo de maduración de unos 14 días tras las precipitaciones intensas.",
  "cond_precip_ca": "Necessita pluges generoses (30–75mm). A causa del seu gran volum, requereix un cicle de maduració d’uns 14 dies després de les precipitacions intenses.",
  "cond_precip_en": "Needs generous rainfall (30–75mm). Due to its large volume, it requires a maturation cycle of about 14 days after intense precipitation.",
  "cond_suelo_es": "Suelos ácidos (pH 4.5–6.5). Crece como parásito de raíz o saprófito sobre la base y raíces enterradas de pinos viejos.",
  "cond_suelo_ca": "Sòls àcids (pH 4.5–6.5). Creix com a paràsit de rel o sapròfit sobre la base i rels enterrades de pins vells.",
  "cond_suelo_en": "Acidic soils (pH 4.5–6.5). Grows as a root parasite or saprophyte on the base and buried roots of old pine trees.",
  "cond_req_es": "Especie inconfundible ligada estrictamente a coníferas. Requiere heladas previas y una humedad ambiental alta (65–80%) para evitar que sus láminas se sequen.",
  "cond_req_ca": "Espècie inconfusible lligada estrictament a coníferes. Requereix gelades prèvies i una humitat ambiental alta (65–80%) per evitar que les seves làmines s’assequin.",
  "cond_req_en": "Unmistakable species strictly linked to conifers. Requires previous frosts and high ambient humidity (65–80%) to prevent its lobes from drying out."
}'::jsonb
WHERE id = 'esp-134';

-- Familia Fistulinaceae
-- esp-138  Fistulina hepatica
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Prefiere temperaturas templadas entre 14–22°C. Su desarrollo óptimo ocurre a los 18°C durante el final del estío.",
  "cond_temp_ca": "Prefereix temperatures temperades entre 14–22°C. El seu desenvolupament òptim es dóna als 18°C durant el final de l’estiu.",
  "cond_temp_en": "Prefers temperate temperatures between 14–22°C. Optimal development occurs at 18°C during late summer.",
  "cond_precip_es": "Necesita lluvias moderadas de 20–60mm. La fructificación se hace visible unos 14 días después de un episodio hídrico significativo.",
  "cond_precip_ca": "Necessita pluges moderades de 20–60mm. La fructificació es fa visible uns 14 dies després d’un episodi hídric significatiu.",
  "cond_precip_en": "Requires moderate rainfall of 20–60mm. Fruiting becomes visible about 14 days after a significant rain event.",
  "cond_suelo_es": "Sustrato de madera viva de planifolios (robles y castaños) con pH ácido (5–6.5). Se asocia como parásito de herida.",
  "cond_suelo_ca": "Substrat de fusta viva de planifolis (roures i castanyers) amb pH àcid (5–6.5). S’associa com a paràsit de ferida.",
  "cond_suelo_en": "Live broadleaf wood substrate (oaks and chestnuts) with acidic pH (5–6.5). It associates as a wound parasite.",
  "cond_req_es": "Hongo parásito que causa podredumbre parda. Requiere un choque térmico para iniciar la fructificación y suele aparecer en cotas bajas a medias.",
  "cond_req_ca": "Bolet paràsit que causa podridura parda. Requereix un xoc tèrmic per iniciar la fructificació i sol aparèixer en cotes baixes a mitjanes.",
  "cond_req_en": "Parasitic fungus causing brown rot. Requires thermal shock to initiate fruiting and usually appears at low to mid elevations."
}'::jsonb
WHERE id = 'esp-138';

-- Familia Ganodermataceae
-- esp-126  Ganoderma lucidum
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Especie termófila que requiere calor (18–28°C). Su metabolismo se activa al máximo con temperaturas medias de 23°C.",
  "cond_temp_ca": "Espècie termòfila que requereix calor (18–28°C). El seu metabolisme s’activa al màxim amb temperatures mitjanes de 23°C.",
  "cond_temp_en": "Thermophilic species requiring heat (18–28°C). Its metabolism is fully activated at average temperatures of 23°C.",
  "cond_precip_es": "Precisa lluvias de 20–60mm. Debido a su consistencia leñosa, requiere un ciclo largo de 30 días para completar su crecimiento.",
  "cond_precip_ca": "Precisa pluges de 20–60mm. A causa de la seva consistència llenyosa, requereix un cicle llarg de 30 dies per completar el seu creixement.",
  "cond_precip_en": "Requires 20–60mm of rain. Due to its woody consistency, it needs a long 30-day cycle to complete its growth.",
  "cond_suelo_es": "Cura sobre raíces o tocones de robles y encinas (pH 5.5–7.5). Actúa como saprófito o parásito facultativo.",
  "cond_suelo_ca": "Creix sobre rels o soques de roures i alzines (pH 5.5–7.5). Actua com a sapròfit o paràsit facultatiu.",
  "cond_suelo_en": "Grows on roots or stumps of oaks and holm oaks (pH 5.5–7.5). Acts as a saprophyte or facultative parasite.",
  "cond_req_es": "Conocido como Pipa, no requiere choque térmico. Prefiere ambientes muy húmedos (70–85%) en zonas bajas y cálidas.",
  "cond_req_ca": "Conegut com a Pipa, no requereix xoc tèrmic. Prefereix ambients molt humits (70–85%) en zones baixes i càlides.",
  "cond_req_en": "Known as Lingzhi/Reishi, it does not require thermal shock. Prefers very humid environments (70–85%) in low, warm areas."
}'::jsonb
WHERE id = 'esp-126';

-- esp-127  Ganoderma applanatum
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Rango térmico muy amplio (5–28°C). Fructifica de forma perenne, aunque su crecimiento óptimo se da a los 16.5°C.",
  "cond_temp_ca": "Rang tèrmic molt ampli (5–28°C). Fructifica de forma perenne, tot i que el seu creixement òptim es dóna als 16.5°C.",
  "cond_temp_en": "Very broad thermal range (5–28°C). Fruits perennially, though its optimal growth occurs at 16.5°C.",
  "cond_precip_es": "Requiere 15–60mm de lluvia acumulada. Al ser un hongo perenne, su ciclo de crecimiento se extiende durante 30 días o más.",
  "cond_precip_ca": "Requereix 15–60mm de pluja acumulada. En ser un bolet perenne, el seu cicle de creixement s’estén durant 30 dies o més.",
  "cond_precip_en": "Requires 15–60mm of accumulated rain. As a perennial fungus, its growth cycle extends for 30 days or more.",
  "cond_suelo_es": "Sustrato de madera degradada de planifolios (pH 5–7.5). Crece en bosques mixtos, hayedos y robledales.",
  "cond_suelo_ca": "Substrat de fusta degradada de planifolis (pH 5–7.5). Creix en boscos mixtos, faigedes i rouredes.",
  "cond_suelo_en": "Degraded broadleaf wood substrate (pH 5–7.5). Grows in mixed forests, beech, and oak groves.",
  "cond_req_es": "Saprófito robusto que puede encontrarse todo el año. No requiere choque térmico y tolera variaciones de humedad moderadas.",
  "cond_req_ca": "Sapròfit robust que es pot trobar tot l’any. No requereix xoc tèrmic i tolera variacions d’humitat moderades.",
  "cond_req_en": "Robust saprophyte that can be found year-round. Does not require thermal shock and tolerates moderate humidity variations."
}'::jsonb
WHERE id = 'esp-127';

-- Familia Gomphaceae
-- esp-053  Gomphus clavatus
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Fructifica en climas frescos de montaña entre 8–16°C, con un óptimo de 12°C.",
  "cond_temp_ca": "Fructifica en climes frescos de muntanya entre 8–16°C, amb un òptim de 12°C.",
  "cond_temp_en": "Fruits in cool mountain climates between 8–16°C, with an optimum of 12°C.",
  "cond_precip_es": "Requiere abundantes lluvias acumuladas (35–80mm) previas. Su ciclo de fructificación es de unos 10 días tras las precipitaciones.",
  "cond_precip_ca": "Requereix abundants pluges acumulades (35–80mm) prèvies. El seu cicle de fructificació és d’uns 10 dies després de les precipitacions.",
  "cond_precip_en": "Requires abundant previous accumulated rainfall (35–80mm). Its fruiting cycle is about 10 days after precipitation.",
  "cond_suelo_es": "Suelos ácidos (pH 4.5–6.5) con materia orgánica. Forma micorrizas en hayedos y pinares de montaña.",
  "cond_suelo_ca": "Sòls àcids (pH 4.5–6.5) amb matèria orgànica. Forma micorrizes en faigedes i pinedes de muntanya.",
  "cond_suelo_en": "Acidic soils (pH 4.5–6.5) with organic matter. Forms mycorrhizae in beech and mountain pine forests.",
  "cond_req_es": "Especie micorrizógena que requiere obligatoriamente helada y choque térmico. Típica de cotas altas entre 600–1800m.",
  "cond_req_ca": "Espècie micorrizògena que requereix obligatòriament gelada i xoc tèrmic. Típica de cotes altes entre 600–1800m.",
  "cond_req_en": "Mycorrhizal species that strictly requires frost and thermal shock. Typical of high altitudes between 600–1800m."
}'::jsonb
WHERE id = 'esp-053';

-- Familia Gomphidiaceae
-- esp-202  Chroogomphus rutilus
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Fructifica en rangos frescos (8–16°C), encontrando su punto óptimo a los 12°C durante el otoño.",
  "cond_temp_ca": "Fructifica en rangos frescos (8–16°C), trobant el seu punt òptim als 12°C durant la tardor.",
  "cond_temp_en": "Fruits in cool ranges (8–16°C), reaching its optimum at 12°C during autumn.",
  "cond_precip_es": "Necesita lluvias moderadas de 20–60mm. Aparece rápido, con un ciclo de fructificación de solo 7 días.",
  "cond_precip_ca": "Necessita pluges moderades de 20–60mm. Apareix ràpid, amb un cicle de fructificació de només 7 dies.",
  "cond_precip_en": "Needs moderate rainfall of 20–60mm. Appears quickly, with a fruiting cycle of only 7 days.",
  "cond_suelo_es": "Suelo forestal bajo pinos. Se asocia de forma simbiótica (micorriza) exclusivamente con el género Pinus.",
  "cond_suelo_ca": "Sòl forestal sota pins. S’associa de forma simbiòtica (micorriza) exclusivament amb el gènere Pinus.",
  "cond_suelo_en": "Forest soil under pine trees. It associates symbiotically (mycorrhiza) exclusively with the Pinus genus.",
  "cond_req_es": "Hongo micorrizógeno estricto de pinares. No requiere choque térmico ni helada previa; prefiere humedades entre 55–70%.",
  "cond_req_ca": "Bolet micorrizogen estricte de pinedes. No requereix xoc tèrmic ni gelada prèvia; prefereix humitats entre 55–70%.",
  "cond_req_en": "Strict mycorrhizal pine forest fungus. Does not require thermal shock or previous frost; prefers humidity between 55–70%."
}'::jsonb
WHERE id = 'esp-202';

-- Familia Helvellaceae
-- esp-083  Helvella lacunosa
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Prefiere temperaturas frescas de otoño (8–18°C), con un óptimo de 13°C para su desarrollo.",
  "cond_temp_ca": "Prefereix temperatures fresques de tardor (8–18°C), amb un òptim de 13°C per al seu desenvolupament.",
  "cond_temp_en": "Prefers cool autumn temperatures (8–18°C), with an optimum of 13°C for development.",
  "cond_precip_es": "Precisa lluvias moderadas (25–65mm). La fructificación se activa en 8 días tras episodios de lluvia constante.",
  "cond_precip_ca": "Precisa pluges moderades (25–65mm). La fructificació s’activa en 8 dies després d’episodis de pluja constant.",
  "cond_precip_en": "Requires moderate rainfall (25–65mm). Fruiting activates 8 days after consistent rain episodes.",
  "cond_suelo_es": "Suelos variados (pH 5–7.5), frecuentemente en zonas con musgo o madera muy degradada en pinares y hayedos.",
  "cond_suelo_ca": "Sòls variats (pH 5–7.5), sovint en zones amb musgo o fusta molt degradada en pinedes i faigedes.",
  "cond_suelo_en": "Varied soils (pH 5–7.5), frequently in areas with moss or highly degraded wood in pine and beech forests.",
  "cond_req_es": "Saprófito de otoño que no requiere choque térmico. Aparece en una amplia franja altitudinal de 200 a 1600m.",
  "cond_req_ca": "Sapròfit de tardor que no requereix xoc tèrmic. Apareix en una àmplia franja altitudinal de 200 a 1600m.",
  "cond_req_en": "Autumn saprophyte that does not require thermal shock. It appears in a wide altitudinal range from 200 to 1600m."
}'::jsonb
WHERE id = 'esp-083';

-- Familia Hydnaceae
-- esp-051  Hydnum repandum
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Fructifica en rangos frescos (8–16°C). El punto óptimo se alcanza a los 12°C durante el otoño avanzado.",
  "cond_temp_ca": "Fructifica en rangos frescos (8–16°C). El punt òptim s’assoleix als 12°C durant la tardor avançada.",
  "cond_temp_en": "Fruits in cool ranges (8–16°C). The optimum point is reached at 12°C during late autumn.",
  "cond_precip_es": "Necesita lluvias acumuladas de 25–70mm. Su ciclo de fructificación es corto, apareciendo unos 7 días tras las lluvias.",
  "cond_precip_ca": "Necessita pluges acumulades de 25–70mm. El seu cicle de fructificació és curt, apareixent uns 7 dies després de les pluges.",
  "cond_precip_en": "Needs accumulated rainfall of 25–70mm. Its fruiting cycle is short, appearing about 7 days after rain.",
  "cond_suelo_es": "Suelos ácidos (pH 5–6.5) con hojarasca. Forma micorrizas principalmente en hayedos y robledales.",
  "cond_suelo_ca": "Sòls àcids (pH 5–6.5) amb fullaraca. Forma micorrizes principalment en faigedes i rouredes.",
  "cond_suelo_en": "Acidic soils (pH 5–6.5) with leaf litter. Forms mycorrhizae mainly in beech and oak forests.",
  "cond_req_es": "Micorrizógena que requiere choque térmico para brotar. Muy común en bosques maduros entre 200–1500m.",
  "cond_req_ca": "Micorrizògena que requereix xoc tèrmic per brollar. Molt comuna en boscos madurs entre 200–1500m.",
  "cond_req_en": "Mycorrhizal species that requires thermal shock to sprout. Very common in mature forests between 200–1500m."
}'::jsonb
WHERE id = 'esp-051';

-- Familia Helvellaceae
-- esp-084  Helvella crispa
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Prefiere temperaturas frescas otoñales entre 8–18°C. Su desarrollo óptimo se alcanza con una media de 13°C.",
  "cond_temp_ca": "Prefereix temperatures fresques de tardor entre 8–18°C. El seu desenvolupament òptim s’assoleix amb una mitjana de 13°C.",
  "cond_temp_en": "Prefers cool autumn temperatures between 8–18°C. Optimal development is reached at an average of 13°C.",
  "cond_precip_es": "Necesita lluvias moderadas de 25–65mm. La fructificación se activa unos 8 días después de episodios de lluvia constante.",
  "cond_precip_ca": "Necessita pluges moderades de 25–65mm. La fructificació s’activa uns 8 dies després d’episodis de pluja constant.",
  "cond_precip_en": "Requires moderate rainfall of 25–65mm. Fruiting activates about 8 days after consistent rain episodes.",
  "cond_suelo_es": "Suelos diversos con pH neutro o básico (5.5–7.5). Crece en los márgenes de hayedos, robledales y bosques mixtos con abundante hojarasca.",
  "cond_suelo_ca": "Sòls diversos amb pH neutre o bàsic (5.5–7.5). Creix als marges de faigedes, rouredes i boscos mixtos amb abundant fullaraca.",
  "cond_suelo_en": "Diverse soils with neutral or basic pH (5.5–7.5). Grows on the edges of beech, oak, and mixed forests with abundant leaf litter.",
  "cond_req_es": "Hongo saprófito de otoño. No requiere choque térmico ni heladas, apareciendo desde los 100 hasta los 1400m de altitud.",
  "cond_req_ca": "Bolet sapròfit de tardor. No requereix xoc tèrmic ni gelades, apareixent des dels 100 fins als 1400m d’altitud.",
  "cond_req_en": "Autumn saprophytic fungus. Does not require thermal shock or frosts, appearing from 100 to 1400m in altitude."
}'::jsonb
WHERE id = 'esp-084';

-- esp-085  Helvella acetabulum
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Especie de primavera que fructifica entre 8–18°C. El crecimiento es ideal cuando la temperatura estabiliza los 13°C.",
  "cond_temp_ca": "Espècie de primavera que fructifica entre 8–18°C. El creixement és ideal quan la temperatura estabilitza els 13°C.",
  "cond_temp_en": "Spring species fruiting between 8–18°C. Growth is ideal when temperatures stabilize at 13°C.",
  "cond_precip_es": "Precisa lluvias primaverales acumuladas de 25–65mm. El ciclo de maduración es de 10 días tras las lluvias.",
  "cond_precip_ca": "Precisa pluges primaverals acumulades de 25–65mm. El cicle de maduració és de 10 dies després de les pluges.",
  "cond_precip_en": "Requires accumulated spring rainfall of 25–65mm. The maturation cycle is 10 days after the rains.",
  "cond_suelo_es": "Suelos calcáreos o neutros (pH 5.5–7.5). Se asocia a bosques mixtos y de planifolios, a menudo en zonas aclaradas.",
  "cond_suelo_ca": "Sòls calcaris o neutres (pH 5.5–7.5). S’associa a boscos mixtos i de planifolis, sovint en zones aclarides.",
  "cond_suelo_en": "Calcareous or neutral soils (pH 5.5–7.5). Associated with mixed and broadleaf forests, often in cleared areas.",
  "cond_req_es": "Saprófito primaveral que no requiere heladas previas. Fructifica principalmente entre abril y junio en ambientes con humedad moderada.",
  "cond_req_ca": "Sapròfit primaveral que no requereix gelades prèvies. Fructifica principalment entre l’abril i el juny en ambients amb humitat moderada.",
  "cond_req_en": "Spring saprophyte that does not require previous frosts. Fruits mainly between April and June in moderately humid environments."
}'::jsonb
WHERE id = 'esp-085';

-- Familia Hericiaceae
-- esp-172  Hericium erinaceus
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Rango de fructificación fresco (8–18°C), con un óptimo de 13°C. Sensible a temperaturas extremas.",
  "cond_temp_ca": "Rang de fructificació fresc (8–18°C), amb un òptim de 13°C. Sensible a temperatures extremes.",
  "cond_temp_en": "Cool fruiting range (8–18°C), with an optimum of 13°C. Sensitive to extreme temperatures.",
  "cond_precip_es": "Requiere 25–65mm de lluvia. La fructificación es lenta, apareciendo unos 12 días después de humedecerse el sustrato leñoso.",
  "cond_precip_ca": "Requereix 25–65mm de pluja. La fructificació és lenta, apareixent uns 12 dies després d’humitejar-se el substrat llenyós.",
  "cond_precip_en": "Requires 25–65mm of rain. Fruiting is slow, appearing about 12 days after the woody substrate becomes moist.",
  "cond_suelo_es": "Madera viva o muerta de planifolios (pH 5.5–7). Se encuentra en troncos de robles y hayas en bosques maduros.",
  "cond_suelo_ca": "Fusta viva o morta de planifolis (pH 5.5–7). Es troba en troncs de roures i faigs en boscos madurs.",
  "cond_suelo_en": "Living or dead broadleaf wood (pH 5.5–7). Found on oak and beech trunks in mature forests.",
  "cond_req_es": "Hongo parásito o saprófito inconfundible. No requiere choque térmico y depende de una humedad ambiental constante (60–75%).",
  "cond_req_ca": "Bolet paràsit o sapròfit inconfusible. No requereix xoc tèrmic i depèn d’una humitat ambiental constant (60–75%).",
  "cond_req_en": "Unmistakable parasitic or saprophytic fungus. Does not require thermal shock and depends on constant environmental humidity (60–75%)."
}'::jsonb
WHERE id = 'esp-172';

-- Familia Hydnaceae
-- esp-052  Hydnum rufescens
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Prefiere temperaturas frescas entre 8–16°C (óptimo 12°C). Muy resistente al frío del otoño tardío.",
  "cond_temp_ca": "Prefereix temperatures fresques entre 8–16°C (òptim 12°C). Molt resistent al fred de la tardor tardana.",
  "cond_temp_en": "Prefers cool temperatures between 8–16°C (optimum 12°C). Very resistant to late autumn cold.",
  "cond_precip_es": "Necesita lluvias acumuladas de 30–75mm. Su ciclo de aparición es de 9 días tras las lluvias significativas.",
  "cond_precip_ca": "Necessita pluges acumulades de 30–75mm. El seu cicle d’aparició és de 9 dies després de les pluges significatives.",
  "cond_precip_en": "Requires 30–75mm of accumulated rainfall. Its appearance cycle is 9 days after significant rains.",
  "cond_suelo_es": "Suelos ácidos (pH 4.5–6.5) en bosques de montaña. Forma micorrizas con pinos y hayas.",
  "cond_suelo_ca": "Sòls àcids (pH 4.5–6.5) en boscos de muntanya. Forma micorrizes amb pins i faigs.",
  "cond_suelo_en": "Acidic soils (pH 4.5–6.5) in mountain forests. Forms mycorrhizae with pines and beeches.",
  "cond_req_es": "Especie micorrizógena que requiere obligatoriamente helada y choque térmico previo. Típica de cotas altas (400–1600m).",
  "cond_req_ca": "Espècie micorrizògena que requereix obligatòriament gelada i xoc tèrmic previ. Típica de cotes altes (400–1600m).",
  "cond_req_en": "Mycorrhizal species that strictly requires frost and previous thermal shock. Typical of high elevations (400–1600m)."
}'::jsonb
WHERE id = 'esp-052';

-- Familia Inocybaceae
-- esp-118  Inocybe rimosa
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Fructifica en condiciones templadas entre 12–24°C, con un óptimo de 18°C.",
  "cond_temp_ca": "Fructifica en condicions temperades entre 12–24°C, amb un òptim de 18°C.",
  "cond_temp_en": "Fruits in temperate conditions between 12–24°C, with an optimum of 18°C.",
  "cond_precip_es": "Requiere lluvias moderadas de 20–60mm. Es de respuesta rápida, fructificando solo 6 días después de las lluvias.",
  "cond_precip_ca": "Requereix pluges moderades de 20–60mm. És de resposta ràpida, fructificant només 6 dies després de les pluges.",
  "cond_precip_en": "Requires moderate rainfall of 20–60mm. Quick response, fruiting only 6 days after the rains.",
  "cond_suelo_es": "Suelos neutros o básicos (pH 5.5–7.5). Forma micorrizas en robledales, encinares y bosques mixtos.",
  "cond_suelo_ca": "Sòls neutres o bàsics (pH 5.5–7.5). Forma micorrizes en rouredes, alzinedes i boscos mixtos.",
  "cond_suelo_en": "Neutral or basic soils (pH 5.5–7.5). Forms mycorrhizae in oak and mixed forests.",
  "cond_req_es": "Especie micorrizógena tóxica. No requiere choque térmico y aparece en una franja amplia desde los 100 hasta los 1200m.",
  "cond_req_ca": "Espècie micorrizògena tòxica. No requereix xoc tèrmic i apareix en una franja àmplia des dels 100 fins als 1200m.",
  "cond_req_en": "Toxic mycorrhizal species. Does not require thermal shock and appears in a wide range from 100 to 1200m."
}'::jsonb
WHERE id = 'esp-118';

-- esp-119  Inocybe erubescens
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Prefiere climas templados (14–24°C), con un pico de fructificación a los 19°C.",
  "cond_temp_ca": "Prefereix climes temperats (14–24°C), amb un pic de fructificació als 19°C.",
  "cond_temp_en": "Prefers temperate climates (14–24°C), with a fruiting peak at 19°C.",
  "cond_precip_es": "Necesita lluvias ligeras o moderadas (15–50mm). Ciclo de fructificación muy corto de 6 días.",
  "cond_precip_ca": "Necessita pluges lleugeres o moderades (15–50mm). Cicle de fructificació molt curt de 6 dies.",
  "cond_precip_en": "Requires light or moderate rainfall (15–50mm). Very short fruiting cycle of 6 days.",
  "cond_suelo_es": "Suelos calcáreos (pH 6.5–8). Estrechamente vinculada a robledales y encinares mediterráneos.",
  "cond_suelo_ca": "Sòls calcaris (pH 6.5–8). Estretament vinculada a rouredes i alzinedes mediterrànies.",
  "cond_suelo_en": "Calcareous soils (pH 6.5–8). Closely linked to Mediterranean oak forests.",
  "cond_req_es": "Especie micorrizógena mortal. No requiere choque térmico pero sí suelos con pH elevado y ambientes termófilos.",
  "cond_req_ca": "Espècie micorrizògena mortal. No requereix xoc tèrmic però sí sòls amb pH elevat i ambients termòfils.",
  "cond_req_en": "Deadly mycorrhizal species. Does not require thermal shock but needs high pH soils and thermophilic environments."
}'::jsonb
WHERE id = 'esp-119';

-- Familia Lyophyllaceae
-- esp-095  Calocybe gambosa
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Especie primaveral que fructifica entre 10–18°C. Su desarrollo es óptimo cuando la temperatura se estabiliza en torno a los 14°C.",
  "cond_temp_ca": "Espècie primaveral que fructifica entre 10–18°C. El seu desenvolupament és òptim quan la temperatura s’estabilitza entorn dels 14°C.",
  "cond_temp_en": "Spring species fruiting between 10–18°C. Optimal development occurs when the temperature stabilizes around 14°C.",
  "cond_precip_es": "Necesita lluvias primaverales de 20–50mm. La fructificación es rápida, apareciendo apenas 5 días después de las precipitaciones.",
  "cond_precip_ca": "Necessita pluges primaverals de 20–50mm. La fructificació és ràpida, apareixent només 5 dies després de les precipitacions.",
  "cond_precip_en": "Requires spring rains of 20–50mm. Fruiting is rapid, appearing just 5 days after rainfall.",
  "cond_suelo_es": "Suelos calcáreos y ricos (pH 6–7.5). Crece en prados, espinares y bordes de robledales o encinares.",
  "cond_suelo_ca": "Sòls calcaris i rics (pH 6–7.5). Creix en prats, bardisses i marges de rouredes o alzinedes.",
  "cond_suelo_en": "Calcareous and rich soils (pH 6–7.5). Grows in meadows, thornbushes, and the edges of oak or holm oak forests.",
  "cond_req_es": "Saprófito que requiere obligatoriamente heladas previas para activar la floración primaveral. Forma los característicos corros de brujas.",
  "cond_req_ca": "Sapròfit que requereix obligatòriament gelades prèvies per activar la floració primaveral. Forma les característiques ronyes o erols.",
  "cond_req_en": "Saprophyte that strictly requires previous frosts to activate spring fruiting. Forms characteristic fairy rings."
}'::jsonb
WHERE id = 'esp-095';

-- esp-096  Lyophyllum decastes
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Rango fresco a templado entre 8–18°C, con un óptimo de 13°C. Es habitual durante el otoño medio.",
  "cond_temp_ca": "Rang fresc a temperat entre 8–18°C, amb un òptim de 13°C. És habitual durant la tardor mitjana.",
  "cond_temp_en": "Cool to temperate range between 8–18°C, with an optimum of 13°C. Common during mid-autumn.",
  "cond_precip_es": "Precisa lluvias acumuladas de 25–65mm. La fructificación suele ocurrir unos 7 días después de episodios hídricos.",
  "cond_precip_ca": "Precisa pluges acumulades de 25–65mm. La fructificació sol ocórrer uns 7 dies després d’episodis hídrics.",
  "cond_precip_en": "Requires accumulated rainfall of 25–65mm. Fruiting typically occurs about 7 days after rain events.",
  "cond_suelo_es": "Suelos nitrogenados y ricos en materia orgánica (pH 5.5–7.5). Aparece en prados, bordes de caminos y bosques mixtos.",
  "cond_suelo_ca": "Sòls nitrogenats i rics en matèria orgànica (pH 5.5–7.5). Apareix en prats, marges de camins i boscos mixtos.",
  "cond_suelo_en": "Nitrogenous soils rich in organic matter (pH 5.5–7.5). Appears in meadows, roadsides, and mixed forests.",
  "cond_req_es": "Hongo saprófito cespitoso que crece en grupos apretados. No requiere choque térmico y tiene una amplia distribución altitudinal.",
  "cond_req_ca": "Bolet sapròfit cespitós que creix en grups apretats. No requereix xoc tèrmic i té una àmplia distribució altitudinal.",
  "cond_req_en": "Cespitose saprophytic fungus growing in tight clusters. Does not require thermal shock and has a wide altitudinal distribution."
}'::jsonb
WHERE id = 'esp-096';

-- Familia Marasmiaceae
-- esp-190  Marasmius oreades
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Fructifica en rangos de 10–22°C (óptimo 16°C). Tolera bien el calor si hay humedad suficiente.",
  "cond_temp_ca": "Fructifica en rangos de 10–22°C (òptim 16°C). Tolera bé la calor si hi ha prou humitat.",
  "cond_temp_en": "Fruits in ranges of 10–22°C (optimum 16°C). Tolerates heat well if there is sufficient humidity.",
  "cond_precip_es": "Necesita lluvias moderadas de 15–50mm. Su ciclo es muy rápido, apareciendo solo 5 días después de la lluvia.",
  "cond_precip_ca": "Necessita pluges moderades de 15–50mm. El seu cicle és molt ràpid, apareixent només 5 dies després de la pluja.",
  "cond_precip_en": "Needs moderate rainfall of 15–50mm. Its cycle is very fast, appearing only 5 days after rain.",
  "cond_suelo_es": "Suelos herbosos con pH 5.5–7.5. Típica de prados de montaña, claros de pinar, hayedos y robledales.",
  "cond_suelo_ca": "Sòls herbosos amb pH 5.5–7.5. Típica de prats de muntanya, clarianes de pinedes, faigedes i rouredes.",
  "cond_suelo_en": "Grassy soils with pH 5.5–7.5. Typical of mountain meadows, pine forest clearings, beech, and oak forests.",
  "cond_req_es": "Saprófito pratícola que requiere choque térmico para brotar. Capaz de revivir tras la desecación (marcescente).",
  "cond_req_ca": "Sapròfit de prat que requereix xoc tèrmic per brollar. Capaç de reviure després de la dessecació (marcescent).",
  "cond_req_en": "Grassland saprophyte that requires thermal shock to sprout. Capable of reviving after desiccation (marcescent)."
}'::jsonb
WHERE id = 'esp-190';

-- Familia Meripilaceae
-- esp-133  Grifola frondosa
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Prefiere temperaturas frescas entre 10–20°C. Su crecimiento óptimo se sitúa en los 15°C durante el inicio del otoño.",
  "cond_temp_ca": "Prefereix temperatures fresques entre 10–20°C. El seu creixement òptim se situa als 15°C durant l’inici de la tardor.",
  "cond_temp_en": "Prefers cool temperatures between 10–20°C. Optimal growth occurs at 15°C during early autumn.",
  "cond_precip_es": "Requiere lluvias acumuladas de 25–65mm. Debido a su gran tamaño, necesita un ciclo de maduración de unos 10 días.",
  "cond_precip_ca": "Requereix pluges acumulades de 25–65mm. A causa de la seva gran mida, necessita un cicle de maduració d’uns 10 dies.",
  "cond_precip_en": "Requires accumulated rainfall of 25–65mm. Due to its large size, it needs a maturation cycle of about 10 days.",
  "cond_suelo_es": "Base de troncos vivos o muertos de robles y encinas (pH 5.5–7.5). Actúa como parásito debilitante o saprófito.",
  "cond_suelo_ca": "Base de troncs vius o morts de roures i alzines (pH 5.5–7.5). Actua com a paràsit debilitant o sapròfit.",
  "cond_suelo_en": "Base of living or dead oak and holm oak trunks (pH 5.5–7.5). Acts as a debilitating parasite or saprophyte.",
  "cond_req_es": "Especie parásita que causa podredumbre blanca. No requiere choque térmico y aparece siempre ligada a planifolios maduros.",
  "cond_req_ca": "Espècie paràsita que causa podridura blanca. No requereix xoc tèrmic i apareix sempre lligada a planifolis madurs.",
  "cond_req_en": "Parasitic species causing white rot. Does not require thermal shock and always appears linked to mature broadleaf trees."
}'::jsonb
WHERE id = 'esp-133';

-- Familia Meruliaceae
-- esp-139  Phlebia radiata
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Rango de fructificación frío entre 4–18°C. Su temperatura óptima de desarrollo es de 11°C.",
  "cond_temp_ca": "Rang de fructificació fred entre 4–18°C. La seva temperatura òptima de desenvolupament és d’11°C.",
  "cond_temp_en": "Cold fruiting range between 4–18°C. Its optimal development temperature is 11°C.",
  "cond_precip_es": "Necesita lluvias constantes (25–65mm) para mantener hidratado el sustrato. Ciclo de fructificación de 10 días.",
  "cond_precip_ca": "Necessita pluges constants (25–65mm) per mantenir hidratat el substrat. Cicle de fructificació de 10 dies.",
  "cond_precip_en": "Needs consistent rainfall (25–65mm) to keep the substrate hydrated. Fruiting cycle of 10 days.",
  "cond_suelo_es": "Madera muerta de planifolios (robles, hayas) en bosques mixtos (pH 5–7.5). Muy común sobre ramas caídas.",
  "cond_suelo_ca": "Fusta morta de planifolis (roures, faigs) en boscos mixtos (pH 5–7.5). Molt comú sobre branques caigudes.",
  "cond_suelo_en": "Dead broadleaf wood (oaks, beeches) in mixed forests (pH 5–7.5). Very common on fallen branches.",
  "cond_req_es": "Hongo saprófito de amplia estacionalidad (otoño e invierno). No requiere choque térmico y prefiere humedades altas (65–80%).",
  "cond_req_ca": "Bolet sapròfit d’àmplia estacionalitat (tardor i hivern). No requereix xoc tèrmic i prefereix humitats altes (65–80%).",
  "cond_req_en": "Saprophytic fungus with a wide seasonality (autumn and winter). Does not require thermal shock and prefers high humidity (65–80%)."
}'::jsonb
WHERE id = 'esp-139';

-- Familia Marasmiaceae
-- esp-191  Marasmius rotula
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Fructifica en condiciones templadas entre 12–24°C, con un óptimo de 18°C. Es muy sensible a la desecación por calor extremo.",
  "cond_temp_ca": "Fructifica en condicions temperades entre 12–24°C, amb un òptim de 18°C. És molt sensible a la dessecació per calor extrema.",
  "cond_temp_en": "Fruits in temperate conditions between 12–24°C, with an optimum of 18°C. It is very sensitive to drying out from extreme heat.",
  "cond_precip_es": "Precisa lluvias moderadas de 25–65mm. Su ciclo de aparición es extremadamente rápido, surgiendo 5 días después de las lluvias.",
  "cond_precip_ca": "Precisa pluges moderades de 25–65mm. El seu cicle d’aparició és extremadament ràpid, sorgint 5 dies després de les pluges.",
  "cond_precip_en": "Requires moderate rainfall of 25–65mm. Its appearance cycle is extremely fast, emerging 5 days after rain.",
  "cond_suelo_es": "Suelos forestales con restos de madera muy pequeña y ramitas (pH 5–7). Común en hayedos y robledales sombríos.",
  "cond_suelo_ca": "Sòls forestals amb restes de fusta molt petita i branquetes (pH 5–7). Comú en faigedes i rouredes ombrívoles.",
  "cond_suelo_en": "Forest soils with very small wood debris and twigs (pH 5–7). Common in shady beech and oak forests.",
  "cond_req_es": "Pequeño saprófito marcescente que puede revivir con la humedad. No requiere choque térmico y depende de humedades altas (65–80%).",
  "cond_req_ca": "Petit sapròfit marcescent que pot reviure amb la humitat. No requereix xoc tèrmic i depèn d’humitats altes (65–80%).",
  "cond_req_en": "Small marcescent saprophyte that can revive with moisture. It does not require thermal shock and depends on high humidity (65–80%)."
}'::jsonb
WHERE id = 'esp-191';

-- Familia Meripilaceae
-- esp-132  Meripilus giganteus
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Prefiere temperaturas frescas a templadas entre 12–22°C (óptimo 17°C). Aparece principalmente al final del verano y otoño.",
  "cond_temp_ca": "Prefereix temperatures fresques a temperades entre 12–22°C (òptim 17°C). Apareix principalment al final de l’estiu i la tardor.",
  "cond_temp_en": "Prefers cool to temperate temperatures between 12–22°C (optimum 17°C). Appears mainly in late summer and autumn.",
  "cond_precip_es": "Requiere 25–65mm de lluvia acumulada. Debido a su gran biomasa, necesita un ciclo de maduración de 10 días tras las lluvias.",
  "cond_precip_ca": "Requereix 25–65mm de pluja acumulada. A causa de la seva gran biomassa, necessita un cicle de maduració de 10 dies després de les pluges.",
  "cond_precip_en": "Requires 25–65mm of accumulated rain. Due to its large biomass, it needs a 10-day maturation cycle after rainfall.",
  "cond_suelo_es": "Sustrato de raíces y tocones de planifolios, especialmente hayas y robles (pH 5.5–7.5). Actúa como parásito y saprófito.",
  "cond_suelo_ca": "Substrat de rels i soques de planifolis, especialment faigs i roures (pH 5.5–7.5). Actua com a paràsit i sapròfit.",
  "cond_suelo_en": "Substrate of broadleaf roots and stumps, especially beech and oak (pH 5.5–7.5). Acts as a parasite and saprophyte.",
  "cond_req_es": "Especie de gran tamaño que causa podredumbre blanca radicular. No requiere choque térmico pero sí árboles huéspedes maduros.",
  "cond_req_ca": "Espècie de gran mida que causa podridura blanca radicular. No requereix xoc tèrmic però sí arbres hostes madurs.",
  "cond_req_en": "Large species causing white root rot. Does not require thermal shock but needs mature host trees."
}'::jsonb
WHERE id = 'esp-132';

-- Familia Mycenaceae
-- esp-192  Mycena galericulata
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Rango térmico de 8–20°C, con un desarrollo ideal a los 14°C. Muy común durante todo el periodo otoñal.",
  "cond_temp_ca": "Rang tèrmic de 8–20°C, amb un desenvolupament ideal als 14°C. Molt comú durant tot el període de tardor.",
  "cond_temp_en": "Thermal range of 8–20°C, with ideal development at 14°C. Very common throughout the autumn period.",
  "cond_precip_es": "Necesita lluvias moderadas de 20–60mm. Es de respuesta rápida, apareciendo apenas 5 días después de humedecerse el sustrato.",
  "cond_precip_ca": "Necessita pluges moderades de 20–60mm. És de resposta ràpida, apareixent només 5 dies després d’humitejar-se el substrat.",
  "cond_precip_en": "Needs moderate rainfall of 20–60mm. Fast response, appearing just 5 days after the substrate is moistened.",
  "cond_suelo_es": "Madera degradada y tocones de planifolios (pH 5–7.5). Crece de forma cespitosa en bosques mixtos y robledales.",
  "cond_suelo_ca": "Fusta degradada i soques de planifolis (pH 5–7.5). Creix de forma cespitosa en boscos mixtos i rouredes.",
  "cond_suelo_en": "Degraded wood and broadleaf stumps (pH 5–7.5). Grows cespitosely in mixed and oak forests.",
  "cond_req_es": "Saprófito lignícola muy común. No requiere choque térmico y prefiere humedades relativas altas (60–78%) para fructificar.",
  "cond_req_ca": "Sapròfit lignícola molt comú. No requereix xoc tèrmic i prefereix humitats relatives altes (60–78%) per fructificar.",
  "cond_req_en": "Very common wood-decay saprophyte. Does not require thermal shock and prefers high relative humidity (60–78%) to fruit."
}'::jsonb
WHERE id = 'esp-192';

-- Familia Omphalotaceae
-- esp-074  Omphalotus olearius
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Especie termófila que prefiere 14–24°C (óptimo 19°C). Desaparece rápidamente con la llegada de las heladas.",
  "cond_temp_ca": "Espècie termòfila que prefereix 14–24°C (òptim 19°C). Desapareix ràpidament amb l’arribada de les gelades.",
  "cond_temp_en": "Thermophilic species preferring 14–24°C (optimum 19°C). Disappears quickly with the arrival of frosts.",
  "cond_precip_es": "Requiere 15–55mm de lluvia acumulada. Su ciclo de aparición es de 5 días tras las primeras lluvias otoñales cálidas.",
  "cond_precip_ca": "Requereix 15–55mm de pluja acumulada. El seu cicle d’aparició és de 5 dies després de les primeres pluges de tardor càlides.",
  "cond_precip_en": "Requires 15–55mm of accumulated rain. Its appearance cycle is 5 days after the first warm autumn rains.",
  "cond_suelo_es": "Madera de olivos, encinas y robles (pH 6–8). Saprófito o parásito que crece en la base de troncos y cepas.",
  "cond_suelo_ca": "Fusta d’oliveres, alzines i roures (pH 6–8). Sapròfit o paràsit que creix a la base de troncs i ceps.",
  "cond_suelo_en": "Wood of olive, holm oak, and oak trees (pH 6–8). Saprophyte or parasite growing at the base of trunks and stumps.",
  "cond_req_es": "Hongo tóxico conocido por su bioluminiscencia. No requiere choque térmico y es típico de zonas mediterráneas de baja cota.",
  "cond_req_ca": "Bolet tòxic conegut per la seva bioluminescència. No requereix xoc tèrmic i és típic de zones mediterrànies de baixa cota.",
  "cond_req_en": "Toxic fungus known for its bioluminescence. Does not require thermal shock and is typical of low-altitude Mediterranean areas."
}'::jsonb
WHERE id = 'esp-074';

-- Familia Pezizaceae
-- esp-089  Peziza vesiculosa
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Fructifica en rangos frescos de 8–20°C, encontrando su óptimo a los 14°C tanto en primavera como en otoño.",
  "cond_temp_ca": "Fructifica en rangos frescos de 8–20°C, trobant el seu òptim als 14°C tant a la primavera com a la tardor.",
  "cond_temp_en": "Fruits in cool ranges from 8–20°C, reaching its optimum at 14°C in both spring and autumn.",
  "cond_precip_es": "Precisa lluvias moderadas de 25–65mm. Ciclo de fructificación de 8 días tras la hidratación del suelo rico en nitrógeno.",
  "cond_precip_ca": "Precisa pluges moderades de 25–65mm. Cicle de fructificació de 8 dies després de la hidratació del sòl ric en nitrogen.",
  "cond_precip_en": "Requires moderate rainfall of 25–65mm. Fruiting cycle of 8 days after hydration of nitrogen-rich soil.",
  "cond_suelo_es": "Suelos muy nitrogenados, a menudo con estiércol o materia orgánica en descomposición (pH 6–7.5).",
  "cond_suelo_ca": "Sòls molt nitrogenats, sovint amb fem o matèria orgànica en descomposició (pH 6–7.5).",
  "cond_suelo_en": "Highly nitrogenous soils, often with manure or decomposing organic matter (pH 6–7.5).",
  "cond_req_es": "Saprófito nitrófilo que aparece en prados abonados y jardines. No requiere choque térmico y tolera humedades del 65–80%.",
  "cond_req_ca": "Sapròfit nitròfil que apareix en prats abonats i jardins. No requereix xoc tèrmic i tolera humitats del 65–80%.",
  "cond_req_en": "Nitrophilous saprophyte appearing in fertilized meadows and gardens. Does not require thermal shock and tolerates 65–80% humidity."
}'::jsonb
WHERE id = 'esp-089';

-- Familia Phallaceae (Grupo 2)
-- esp-185  Phallus impudicus (Duplicado en CSV con ID esp-188 anterior)
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Rango templado entre 12–24°C (óptimo 18°C). Su crecimiento es extremadamente rápido bajo condiciones de calor húmedo.",
  "cond_temp_ca": "Rang temperat entre 12–24°C (òptim 18°C). El seu creixement és extremadament ràpid sota condicions de calor humida.",
  "cond_temp_en": "Temperate range between 12–24°C (optimum 18°C). Growth is extremely rapid under warm, humid conditions.",
  "cond_precip_es": "Necesita lluvias de 20–60mm. Aparece en apenas 5 días tras episodios de lluvia que saturen el horizonte orgánico.",
  "cond_precip_ca": "Necessita pluges de 20–60mm. Apareix en només 5 dies després d’episodis de pluja que saturin l’horitzó orgànic.",
  "cond_precip_en": "Needs 20–60mm of rain. Appears in just 5 days after rain events that saturate the organic horizon.",
  "cond_suelo_es": "Suelos ricos en humus (pH 5.5–7.5) en hayedos y robledales. Saprófito especialista en degradar hojarasca densa.",
  "cond_suelo_ca": "Sòls rics en humus (pH 5.5–7.5) en faigedes i rouredes. Sapròfit especialista en degradar fullaraca densa.",
  "cond_suelo_en": "Humus-rich soils (pH 5.5–7.5) in beech and oak forests. Saprophyte specializing in degrading dense leaf litter.",
  "cond_req_es": "Hongo saprófito que atrae moscas para dispersar esporas. No requiere choque térmico y prefiere altitudes de hasta 1200m.",
  "cond_req_ca": "Bolet sapròfit que atreu mosques per dispersar espores. No requereix xoc tèrmic i prefereix altituds de fins a 1200m.",
  "cond_req_en": "Saprophytic fungus that attracts flies to disperse spores. Does not require thermal shock and prefers altitudes up to 1200m."
}'::jsonb
WHERE id = 'esp-185';

-- Familia Phallaceae
-- esp-189  Mutinus caninus
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Prefiere condiciones templadas entre 12–24°C, con un óptimo de 18°C. Desaparece con los primeros fríos intensos.",
  "cond_temp_ca": "Prefereix condicions temperades entre 12–24°C, amb un òptim de 18°C. Desapareix amb els primers freds intensos.",
  "cond_temp_en": "Prefers temperate conditions between 12–24°C, with an optimum of 18°C. Disappears with the first intense cold.",
  "cond_precip_es": "Requiere lluvias acumuladas de 20–60mm. Su ciclo de aparición es muy corto, surgiendo apenas 5 días después de la hidratación del suelo.",
  "cond_precip_ca": "Requereix pluges acumulades de 20–60mm. El seu cicle d’aparició és molt curt, sorgint només 5 dies després de la hidratació del sòl.",
  "cond_precip_en": "Requires 20–60mm of accumulated rain. Its appearance cycle is very short, emerging just 5 days after soil hydration.",
  "cond_suelo_es": "Suelos con madera muy degradada y abundante hojarasca (pH 5.5–7.5). Común en robledales y zonas de bosque mixto.",
  "cond_suelo_ca": "Sòls amb fusta molt degradada i abundant fullaraca (pH 5.5–7.5). Comú en rouredes i zones de bosc mixt.",
  "cond_suelo_en": "Soils with highly degraded wood and abundant leaf litter (pH 5.5–7.5). Common in oak groves and mixed forest areas.",
  "cond_req_es": "Hongo saprófito de tamaño reducido que fructifica entre mayo y octubre. No requiere choque térmico pero sí una humedad relativa estable (60–75%).",
  "cond_req_ca": "Bolet sapròfit de mida reduïda que fructifica entre maig i octubre. No requereix xoc tèrmic però sí una humitat relativa estable (60–75%).",
  "cond_req_en": "Small-sized saprophyte that fruits between May and October. Does not require thermal shock but needs stable relative humidity (60–75%)."
}'::jsonb
WHERE id = 'esp-189';

-- Familia Tapinellaceae
-- esp-204  Tapinella panuoides
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Fructifica en rangos frescos a templados de 8–20°C (óptimo 14°C). Es común durante todo el otoño e inicios de invierno.",
  "cond_temp_ca": "Fructifica en rangos frescos a temperats de 8–20°C (òptim 14°C). És comú durant tota la tardor i inicis d’hivern.",
  "cond_temp_en": "Fruits in cool to temperate ranges of 8–20°C (optimum 14°C). Common throughout autumn and early winter.",
  "cond_precip_es": "Necesita lluvias moderadas de 20–60mm. Al crecer sobre madera, requiere unos 7 días de humedad constante para fructificar.",
  "cond_precip_ca": "Necessita pluges moderades de 20–60mm. En créixer sobre fusta, requereix uns 7 dies d’humitat constant per fructificar.",
  "cond_precip_en": "Needs moderate rainfall of 20–60mm. Growing on wood, it requires about 7 days of constant moisture to fruit.",
  "cond_suelo_es": "Sustrato de madera muerta de coníferas (pinos), a menudo en tocones o madera enterrada (pH 4.5–6.5).",
  "cond_suelo_ca": "Substrat de fusta morta de coníferes (pins), sovint en soques o fusta enterrada (pH 4.5–6.5).",
  "cond_suelo_en": "Dead conifer wood substrate (pines), often on stumps or buried wood (pH 4.5–6.5).",
  "cond_req_es": "Saprófito lignícola que causa podredumbre parda. No requiere choque térmico y prefiere ambientes con humedad entre 60–75%.",
  "cond_req_ca": "Sapròfit lignícola que causa podridura parda. No requereix xoc tèrmic i prefereix ambients amb humitat entre 60–75%.",
  "cond_req_en": "Wood-decay saprophyte causing brown rot. Does not require thermal shock and prefers humidity between 60–75%."
}'::jsonb
WHERE id = 'esp-204';

-- Familia Tuberaceae
-- esp-145  Tuber melanosporum
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Fructifica en invierno con temperaturas entre 4–14°C (óptimo 9°C). Requiere veranos cálidos para la maduración del primordio.",
  "cond_temp_ca": "Fructifica a l’hivern amb temperatures entre 4–14°C (òptim 9°C). Requereix estius càlids per a la maduració del primordi.",
  "cond_temp_en": "Fruits in winter with temperatures between 4–14°C (optimum 9°C). Requires warm summers for primordium maturation.",
  "cond_precip_es": "Precisa lluvias estivales acumuladas de 20–55mm para asegurar la supervivencia. La fructificación final ocurre tras las lluvias de otoño.",
  "cond_precip_ca": "Precisa pluges estivals acumulades de 20–55mm per assegurar la supervivència. La fructificació final ocorre després de les pluges de tardor.",
  "cond_precip_en": "Requires 20–55mm of accumulated summer rain for survival. Final fruiting occurs after autumn rains.",
  "cond_suelo_es": "Suelos calcáreos, pedregosos y bien aireados (pH 7.5–8.5). Forma micorrizas con encinas, robles y avellanos.",
  "cond_suelo_ca": "Sòls calcaris, pedregosos i ben airejats (pH 7.5–8.5). Forma micorrizes amb alzines, roures i avellaners.",
  "cond_suelo_en": "Calcareous, stony, and well-aerated soils (pH 7.5–8.5). Forms mycorrhizae with holm oaks, oaks, and hazelnuts.",
  "cond_req_es": "Hongo hipogeo (subterráneo) de alto valor. Requiere heladas previas para madurar el aroma y un choque térmico estival-otoñal.",
  "cond_req_ca": "Bolet hipogeu (subterrani) d’alt valor. Requereix gelades prèvies per madurar l’aroma i un xoc tèrmic estival-tardorenc.",
  "cond_req_en": "High-value hypogeous (underground) fungus. Requires previous frosts to mature its aroma and summer-autumn thermal shock."
}'::jsonb
WHERE id = 'esp-145';

-- Familia Xylariaceae
-- esp-125  Xylaria hypoxylon
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Rango de fructificación amplio y frío de 4–18°C (óptimo 11°C). Persiste durante todo el invierno.",
  "cond_temp_ca": "Rang de fructificació ampli i fred de 4–18°C (òptim 11°C). Persisteix durant tot l’hivern.",
  "cond_temp_en": "Broad and cold fruiting range from 4–18°C (optimum 11°C). Persists throughout the winter.",
  "cond_precip_es": "Necesita lluvias moderadas de 20–60mm. Su crecimiento es lento, requiriendo un ciclo de unos 20 días tras la hidratación.",
  "cond_precip_ca": "Necessita pluges moderades de 20–60mm. El seu creixement és lent, i requereix un cicle d’uns 20 dies després de la hidratació.",
  "cond_precip_en": "Needs moderate rainfall of 20–60mm. Growth is slow, requiring a cycle of about 20 days after hydration.",
  "cond_suelo_es": "Madera muerta de planifolios en descomposición (pH 5–7.5). Muy común en tocones de haya y roble en zonas húmedas.",
  "cond_suelo_ca": "Fusta morta de planifolis en descomposició (pH 5–7.5). Molt comú en soques de faig i roure en zones humides.",
  "cond_suelo_en": "Decaying dead broadleaf wood (pH 5–7.5). Very common on beech and oak stumps in humid areas.",
  "cond_req_es": "Saprófito lignícola muy resistente. No requiere choque térmico y puede encontrarse en cualquier altitud hasta los 1800m.",
  "cond_req_ca": "Sapròfit lignícola molt resistent. No requereix xoc tèrmic i es pot trobar en qualsevol altitud fins als 1800m.",
  "cond_req_en": "Very resistant wood-decay saprophyte. Does not require thermal shock and can be found at any altitude up to 1800m."
}'::jsonb
WHERE id = 'esp-125';

-- Familia Hericiaceae
-- esp-173  Hericium coralloides
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Fructifica en condiciones frescas (8–18°C), con un desarrollo óptimo a los 13°C. Es una especie típica de finales de verano y otoño.",
  "cond_temp_ca": "Fructifica en condicions fresques (8–18°C), amb un desenvolupament òptim als 13°C. És una espècie típica de finals d’estiu i tardor.",
  "cond_temp_en": "Fruits in cool conditions (8–18°C), with optimal development at 13°C. It is a typical species of late summer and autumn.",
  "cond_precip_es": "Precisa lluvias generosas de 30–70mm. Al crecer sobre madera, requiere unos 10 días de hidratación constante del sustrato.",
  "cond_precip_ca": "Precisa pluges generoses de 30–70mm. En créixer sobre fusta, requereix uns 10 dies d’hidratació constant del substrat.",
  "cond_precip_en": "Requires generous rainfall of 30–70mm. Growing on wood, it requires about 10 days of constant substrate hydration.",
  "cond_suelo_es": "Madera muerta de planifolios, especialmente haya y roble (pH 5.5–7). Se encuentra en bosques maduros y sombríos.",
  "cond_suelo_ca": "Fusta morta de planifolis, especialment faig i roure (pH 5.5–7). Es troba en boscos madurs i ombrívols.",
  "cond_suelo_en": "Dead broadleaf wood, especially beech and oak (pH 5.5–7). Found in mature, shady forests.",
  "cond_req_es": "Hongo saprófito de gran belleza. No requiere choque térmico pero sí una humedad ambiental elevada (65–80%) para no marchitarse.",
  "cond_req_ca": "Bolet sapròfit de gran bellesa. No requereix xoc tèrmic però sí una humitat ambiental elevada (65–80%) per no marcir-se.",
  "cond_req_en": "Very beautiful saprophytic fungus. Does not require thermal shock but needs high ambient humidity (65–80%) to avoid withering."
}'::jsonb
WHERE id = 'esp-173';

-- Familia Mycenaceae (Restantes)
-- esp-193  Mycena haematopus
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Fructifica entre 10–22°C (óptimo 16°C). Sensible a las heladas tempranas.",
  "cond_temp_ca": "Fructifica entre 10–22°C (òptim 16°C). Sensible a les gelades primerenques.",
  "cond_temp_en": "Fruits between 10–22°C (optimum 16°C). Sensitive to early frosts.",
  "cond_precip_es": "Requiere lluvias de 25–65mm. Ciclo rápido de 5 días tras la lluvia.",
  "cond_precip_ca": "Requereix pluges de 25–65mm. Cicle ràpid de 5 dies després de la pluja.",
  "cond_precip_en": "Requires 25–65mm of rain. Fast 5-day cycle after rain.",
  "cond_suelo_es": "Madera degradada de planifolios (pH 5–7). Suele exudar un látex rojizo al romperse.",
  "cond_suelo_ca": "Fusta degradada de planifolis (pH 5–7). Sol exudar un làtex rogenc en trencar-se.",
  "cond_suelo_en": "Degraded broadleaf wood (pH 5–7). Usually exudes a reddish latex when broken.",
  "cond_req_es": "Saprófito lignícola. Prefiere ambientes muy húmedos (65–80%) en bosques de ribera o hayedos.",
  "cond_req_ca": "Sapròfit lignícola. Prefereix ambients molt humits (65–80%) en boscos de ribera o faigedes.",
  "cond_req_en": "Wood-decay saprophyte. Prefers very humid environments (65–80%) in riparian or beech forests."
}'::jsonb
WHERE id = 'esp-193';

-- esp-197  Mycena chlorophos
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Especie termófila (18–28°C). Óptimo a los 23°C.",
  "cond_temp_ca": "Espècie termòfila (18–28°C). Òptim als 23°C.",
  "cond_temp_en": "Thermophilic species (18–28°C). Optimum at 23°C.",
  "cond_precip_es": "Necesita alta pluviosidad (40–80mm) y humedad extrema.",
  "cond_precip_ca": "Necessita alta pluviositat (40–80mm) i humitat extrema.",
  "cond_precip_en": "Needs high rainfall (40–80mm) and extreme humidity.",
  "cond_suelo_es": "Restos leñosos en descomposición (pH 5.5–7). Típica de ambientes subtropicales o muy cálidos.",
  "cond_suelo_ca": "Restes llenyoses en descomposició (pH 5.5–7). Típica d’ambients subtropicals o molt càlids.",
  "cond_suelo_en": "Decomposing woody debris (pH 5.5–7). Typical of subtropical or very warm environments.",
  "cond_req_es": "Saprófito bioluminiscente. Requiere humedad relativa muy alta (75–88%) para emitir luz.",
  "cond_req_ca": "Sapròfit bioluminescent. Requereix humitat relativa molt alta (75–88%) per emetre llum.",
  "cond_req_en": "Bioluminescent saprophyte. Requires very high relative humidity (75–88%) to emit light."
}'::jsonb
WHERE id = 'esp-197';

-- Familia Omphalotaceae
-- esp-075  Lentinula edodes (Shiitake)
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Fructifica entre 10–20°C (óptimo 15°C). Requiere cambios térmicos para activar la producción.",
  "cond_temp_ca": "Fructifica entre 10–20°C (òptim 15°C). Requereix canvis tèrmics per activar la producció.",
  "cond_temp_en": "Fruits between 10–20°C (optimum 15°C). Requires thermal changes to trigger production.",
  "cond_precip_es": "Necesita 40–80mm de lluvia o riego. Ciclo de 7 días tras la hidratación.",
  "cond_precip_ca": "Necessita 40–80mm de pluja o reg. Cicle de 7 dies després de la hidratació.",
  "cond_precip_en": "Needs 40–80mm of rain or irrigation. 7-day cycle after hydration.",
  "cond_suelo_es": "Madera de planifolios (pH 5.5–7). Cultivado o naturalizado en zonas de roble y castaño.",
  "cond_suelo_ca": "Fusta de planifolis (pH 5.5–7). Cultivat o naturalitzat en zones de roure i castanyer.",
  "cond_suelo_en": "Broadleaf wood (pH 5.5–7). Cultivated or naturalized in oak and chestnut areas.",
  "cond_req_es": "Saprófito lignícola de gran valor culinario. Prefiere humedades altas entre 70–85%.",
  "cond_req_ca": "Sapròfit lignícola de gran valor culinari. Prefereix humitats altes entre 70–85%.",
  "cond_req_en": "Wood-decay saprophyte of great culinary value. Prefers high humidity (70–85%)."
}'::jsonb
WHERE id = 'esp-075';

-- Familia Phallaceae (Restantes)
-- esp-186  Phallus hadriani
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Termófila (14–26°C). Óptimo a los 20°C.",
  "cond_temp_ca": "Termòfila (14–26°C). Òptim als 20°C.",
  "cond_temp_en": "Thermophilic (14–26°C). Optimum at 20°C.",
  "cond_precip_es": "Lluvias moderadas (15–55mm). Respuesta rápida en 5 días.",
  "cond_precip_ca": "Pluges moderades (15–55mm). Resposta ràpida en 5 dies.",
  "cond_precip_en": "Moderate rain (15–55mm). Rapid 5-day response.",
  "cond_suelo_es": "Suelos arenosos y jardines (pH 6–8). A menudo en dunas o zonas litorales.",
  "cond_suelo_ca": "Sòls sorrencs i jardins (pH 6–8). Sovint en dunes o zones litorals.",
  "cond_suelo_en": "Sandy soils and gardens (pH 6–8). Often in dunes or coastal areas.",
  "cond_req_es": "Saprófito de zonas cálidas. Su peridio suele tener tonos rosados.",
  "cond_req_ca": "Sapròfit de zones càlides. El seu peridi sol tenir tons rosats.",
  "cond_req_en": "Saprophyte of warm areas. Its peridium often has pinkish tones."
}'::jsonb
WHERE id = 'esp-186';

-- esp-187  Clathrus ruber
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Prefiere 14–26°C. Óptimo 20°C. Muy sensible al frío.",
  "cond_temp_ca": "Prefereix 14–26°C. Òptim 20°C. Molt sensible al fred.",
  "cond_temp_en": "Prefers 14–26°C. Optimum 20°C. Very cold-sensitive.",
  "cond_precip_es": "15–55mm de lluvia. Fructificación explosiva.",
  "cond_precip_ca": "15–55mm de pluja. Fructificació explosiva.",
  "cond_precip_en": "15–55mm of rain. Explosive fruiting.",
  "cond_suelo_es": "Suelos nitrogenados y jardines (pH 6–8).",
  "cond_suelo_ca": "Sòls nitrogenats i jardins (pH 6–8).",
  "cond_suelo_en": "Nitrogenous soils and gardens (pH 6–8).",
  "cond_req_es": "Saprófito de forma reticulada y olor fétido.",
  "cond_req_ca": "Sapròfit de forma reticulada i olor fètida.",
  "cond_req_en": "Saprophyte with a reticulated shape and foul odor."
}'::jsonb
WHERE id = 'esp-187';

-- Familia Tapinellaceae
-- esp-020  Paxillus involutus
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Fructifica entre 10–20°C (óptimo 15°C). Común en otoño.",
  "cond_temp_ca": "Fructifica entre 10–20°C (òptim 15°C). Comú a la tardor.",
  "cond_temp_en": "Fruits between 10–20°C (optimum 15°C). Common in autumn.",
  "cond_precip_es": "Requiere lluvias abundantes (30–80mm). Ciclo de 5 días.",
  "cond_precip_ca": "Requereix pluges abundants (30–80mm). Cicle de 5 dies.",
  "cond_precip_en": "Requires abundant rain (30–80mm). 5-day cycle.",
  "cond_suelo_es": "Suelos ácidos (pH 4.5–7). Micorrizógeno de coníferas y planifolios.",
  "cond_suelo_ca": "Sòls àcids (pH 4.5–7). Micorrizogen de coníferes i planifolis.",
  "cond_suelo_en": "Acidic soils (pH 4.5–7). Mycorrhizal with conifers and broadleaf trees.",
  "cond_req_es": "Especie muy tóxica. No requiere choque térmico.",
  "cond_req_ca": "Espècie molt tòxica. No requereix xoc tèrmic.",
  "cond_req_en": "Highly toxic species. Does not require thermal shock."
}'::jsonb
WHERE id = 'esp-020';

-- esp-022  Tapinella atrotomentosa
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Fructifica entre 10–18°C (óptimo 14°C).",
  "cond_temp_ca": "Fructifica entre 10–18°C (òptim 14°C).",
  "cond_temp_en": "Fruits between 10–18°C (optimum 14°C).",
  "cond_precip_es": "25–65mm de lluvia. Ciclo de 8 días.",
  "cond_precip_ca": "25–65mm de pluja. Cicle de 8 dies.",
  "cond_precip_en": "25–65mm of rain. 8-day cycle.",
  "cond_suelo_es": "Madera de pino en descomposición (pH 4–6).",
  "cond_suelo_ca": "Fusta de pi en descomposició (pH 4–6).",
  "cond_suelo_en": "Decaying pine wood (pH 4–6).",
  "cond_req_es": "Saprófito lignícola de gran tamaño y pie aterciopelado.",
  "cond_req_ca": "Sapròfit lignícola de gran mida i peu vellutat.",
  "cond_req_en": "Large wood-decay saprophyte with a velvety stem."
}'::jsonb
WHERE id = 'esp-022';

-- Familia Tuberaceae (Restantes)
-- esp-087  Tuber aestivum
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Trufa de verano (12–24°C, óptimo 18°C).",
  "cond_temp_ca": "Tòfona d’estiu (12–24°C, òptim 18°C).",
  "cond_temp_en": "Summer truffle (12–24°C, optimum 18°C).",
  "cond_precip_es": "15–50mm. Requiere tormentas estivales para su desarrollo.",
  "cond_precip_ca": "15–50mm. Requereix tempestes estivals per al seu desenvolupament.",
  "cond_precip_en": "15–50mm. Requires summer storms for development.",
  "cond_suelo_es": "Calcáreo (pH 7–8.5). Micorriza con robles y hayas.",
  "cond_suelo_ca": "Calcari (pH 7–8.5). Micorriza amb roures i faigs.",
  "cond_suelo_en": "Calcareous (pH 7–8.5). Mycorrhizal with oaks and beeches.",
  "cond_req_es": "Hongo hipogeo. No requiere helada para fructificar, a diferencia de la negra.",
  "cond_req_ca": "Bolet hipogeu. No requereix gelada per fructificar, a diferència de la negra.",
  "cond_req_en": "Hypogeous fungus. Does not require frost to fruit, unlike the black truffle."
}'::jsonb
WHERE id = 'esp-087';

-- esp-088  Tuber borchii
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Fructifica en invierno/primavera temprana (5–15°C).",
  "cond_temp_ca": "Fructifica a l’hivern o primavera primerenca (5–15°C).",
  "cond_temp_en": "Fruits in winter/early spring (5–15°C).",
  "cond_precip_es": "15–55mm acumulados.",
  "cond_precip_ca": "15–55mm acumulats.",
  "cond_precip_en": "15–55mm accumulated.",
  "cond_suelo_es": "Suelos calcáreos o básicos (pH 6.5–8).",
  "cond_suelo_ca": "Sòls calcaris o bàsics (pH 6.5–8).",
  "cond_suelo_en": "Calcareous or basic soils (pH 6.5–8).",
  "cond_req_es": "Trufa blanca de primavera. Requiere helada previa.",
  "cond_req_ca": "Tòfona blanca de primavera. Requereix gelada prèvia.",
  "cond_req_en": "Spring white truffle. Requires previous frost."
}'::jsonb
WHERE id = 'esp-088';

-- Familia Xylariaceae
-- esp-200  Xylaria hypoxylon (Variación de ID esp-125)
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Fructifica entre 4–22°C (óptimo 13°C). Muy resistente.",
  "cond_temp_ca": "Fructifica entre 4–22°C (òptim 13°C). Molt resistent.",
  "cond_temp_en": "Fruits between 4–22°C (optimum 13°C). Very resistant.",
  "cond_precip_es": "20–60mm de lluvia. Ciclo largo de 14 días.",
  "cond_precip_ca": "20–60mm de pluja. Cicle llarg de 14 dies.",
  "cond_precip_en": "20–60mm of rain. Long 14-day cycle.",
  "cond_suelo_es": "Madera degradada de planifolios (pH 4.5–7).",
  "cond_suelo_ca": "Fusta degradada de planifolis (pH 4.5–7).",
  "cond_suelo_en": "Degraded broadleaf wood (pH 4.5–7).",
  "cond_req_es": "Saprófito lignícola con forma de cuerno.",
  "cond_req_ca": "Sapròfit lignícola amb forma de banya.",
  "cond_req_en": "Wood-decay saprophyte with a horn-like shape."
}'::jsonb
WHERE id = 'esp-200';