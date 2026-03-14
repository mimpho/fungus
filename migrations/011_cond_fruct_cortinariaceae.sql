-- esp-111 Cortinarius orellanus
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Prefiere climas frescos con una temperatura óptima de 14°C en bosques de frondosas.",
  "cond_temp_ca": "Prefereix climes frescos amb una temperatura òptima de 14°C en boscos de frondoses.",
  "cond_temp_en": "Prefers cool climates with an optimal temperature of 14°C in broadleaf forests.",
  "cond_precip_es": "Lluvias moderadas de 60 mm y humedad ambiental del 75% para su desarrollo.",
  "cond_precip_ca": "Pluges moderades de 60 mm i humitat ambiental del 75% pel seu desenvolupament.",
  "cond_precip_en": "Moderate rainfall of 60 mm and 75% ambient humidity for its development.",
  "cond_suelo_es": "Suelos ácidos (pH 5.5-7) bajo robles y hayas, raramente en coníferas.",
  "cond_suelo_ca": "Sòls àcids (pH 5.5-7) sota roures i faigs, rarament en coníferes.",
  "cond_suelo_en": "Acidic soils (pH 5.5-7) under oaks and beeches, rarely in conifers.",
  "cond_req_es": "Mortal; requiere choque térmico para su aparición; contiene orellanina de efecto retardado.",
  "cond_req_ca": "Mortal; requereix xoc tèrmic per a la seva aparició; conté orellanina d’efecte retardat.",
  "cond_req_en": "Deadly; requires thermal shock to appear; contains orellanine with delayed effect."
}'::jsonb WHERE id = 'esp-111';

-- esp-112 Cortinarius rubellus
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Especie de clima frío (12°C), típica de bosques de montaña y zonas alpinas.",
  "cond_temp_ca": "Espècie de clima fred (12°C), típica de boscos de muntanya i zones alpines.",
  "cond_temp_en": "Cold climate species (12°C), typical of mountain forests and alpine areas.",
  "cond_precip_es": "Muy exigente en agua (75 mm) y humedad del 80%, frecuente en zonas pantanosas.",
  "cond_precip_ca": "Molt exigent en aigua (75 mm) i humitat de l’80%, freqüent en zones pantanoses.",
  "cond_precip_en": "Very water-demanding (75 mm) and 80% humidity, frequent in marshy areas.",
  "cond_suelo_es": "Suelos muy ácidos (pH 4.5-6.5) con presencia de musgos tipo Sphagnum.",
  "cond_suelo_ca": "Sòls molt àcids (pH 4.5-6.5) amb presència de molses tipus Sphagnum.",
  "cond_suelo_en": "Very acidic soils (pH 4.5-6.5) with presence of Sphagnum mosses.",
  "cond_req_es": "Mortal; requiere helada y choque térmico para estimular su fructificación tardía.",
  "cond_req_ca": "Mortal; requereix gelada i xoc tèrmic per estimular la seva fructificació tardorenca.",
  "cond_req_en": "Deadly; requires frost and thermal shock to stimulate its late fruiting."
}'::jsonb WHERE id = 'esp-112';

-- esp-113 Cortinarius violaceus
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Prefiere el fresco otoñal (12°C) en bosques maduros y bien conservados.",
  "cond_temp_ca": "Prefereix la fresca tardorenca (12°C) en boscos madurs i ben conservats.",
  "cond_temp_en": "Prefers autumn coolness (12°C) in mature and well-preserved forests.",
  "cond_precip_es": "Necesita alta pluviosidad (78 mm) y humedad constante del 80%.",
  "cond_precip_ca": "Necessita alta pluviositat (78 mm) i humitat constant de l’80%.",
  "cond_precip_en": "Needs high rainfall (78 mm) and constant 80% humidity.",
  "cond_suelo_es": "Suelos ácidos (pH 4.5-6.5) ricos en materia orgánica descompuesta.",
  "cond_suelo_ca": "Sòls àcids (pH 4.5-6.5) rics en matèria orgànica descomposta.",
  "cond_suelo_en": "Acidic soils (pH 4.5-6.5) rich in decomposed organic matter.",
  "cond_req_es": "Micorrizógena; requiere helada y choque térmico; destaca por su color violeta intenso.",
  "cond_req_ca": "Micorrizogen; requereix gelada i xoc tèrmic; destaca pel seu color violeta intens.",
  "cond_req_en": "Mycorrhizal; requires frost and thermal shock; notable for its deep violet color."
}'::jsonb WHERE id = 'esp-113';

-- esp-114 Cortinarius caperatus
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Especie montano-fría (10°C) que tolera bien las bajas temperaturas de montaña.",
  "cond_temp_ca": "Espècie montano-freda (10°C) que tolera bé les baixes temperatures de muntanya.",
  "cond_temp_en": "Montane-cold species (10°C) that tolerates low mountain temperatures well.",
  "cond_precip_es": "Exigente en agua (80 mm) y humedad del 80% para un crecimiento óptimo.",
  "cond_precip_ca": "Exigent en aigua (80 mm) i humitat de l’80% per a un creixement òptim.",
  "cond_precip_en": "Demanding in water (80 mm) and 80% humidity for optimal growth.",
  "cond_suelo_es": "Suelos ácidos (pH 4.5-6.5) y pobres, a menudo asociados a brezos o arándanos.",
  "cond_suelo_ca": "Sòls àcids (pH 4.5-6.5) i pobres, sovint associats a brugueres o nabius.",
  "cond_suelo_en": "Acidic (pH 4.5-6.5) and poor soils, often associated with heather or blueberries.",
  "cond_req_es": "Excelente comestible; requiere helada y choque térmico para iniciar la campaña.",
  "cond_req_ca": "Excel·lent comestible; requereix gelada i xoc tèrmic per iniciar la campanya.",
  "cond_req_en": "Excellent edible; requires frost and thermal shock to start the season."
}'::jsonb WHERE id = 'esp-114';

-- esp-115 Cortinarius splendens
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Fructifica en condiciones de fresco moderado (12°C) en bosques de frondosas.",
  "cond_temp_ca": "Fructifica en condicions de fresca moderada (12°C) en boscos de frondoses.",
  "cond_temp_en": "Fruits in moderate cool conditions (12°C) in broadleaf forests.",
  "cond_precip_es": "Requiere lluvias abundantes (75 mm) y humedad ambiental del 80%.",
  "cond_precip_ca": "Requereix pluges abundants (75 mm) i humitat ambiental de l’80%.",
  "cond_precip_en": "Requires abundant rainfall (75 mm) and 80% ambient humidity.",
  "cond_suelo_es": "Suelos neutros a calizos (pH 5-6.5) bajo hayas (Fagus sylvatica).",
  "cond_suelo_ca": "Sòls neutres a calcaris (pH 5-6.5) sota faigs (Fagus sylvatica).",
  "cond_suelo_en": "Neutral to calcareous soils (pH 5-6.5) under beech (Fagus sylvatica).",
  "cond_req_es": "Mortal; requiere choque térmico; color amarillo azufrado muy llamativo.",
  "cond_req_ca": "Mortal; requereix xoc tèrmic; color groc sofre molt cridaner.",
  "cond_req_en": "Deadly; requires thermal shock; very striking sulfur-yellow color."
}'::jsonb WHERE id = 'esp-115';

-- esp-116 Cortinarius praestans
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Prefiere climes templados-frescos (12°C) durante el otoño.",
  "cond_temp_ca": "Prefereix climes temperats-frescos (12°C) durant la tardor.",
  "cond_temp_en": "Prefers temperate-cool climates (12°C) during autumn.",
  "cond_precip_es": "Alta pluviosidad de 78 mm y humedad relativa del 80%.",
  "cond_precip_ca": "Alta pluviositat de 78 mm i humitat relativa de l’80%.",
  "cond_precip_en": "High rainfall of 78 mm and 80% relative humidity.",
  "cond_suelo_es": "Suelos neutros o básicos (pH 5-7) con buen nivel de nutrientes.",
  "cond_suelo_ca": "Sòls neutres o bàsics (pH 5-7) amb bon nivell de nutrients.",
  "cond_suelo_en": "Neutral or basic soils (pH 5-7) with good nutrient levels.",
  "cond_req_es": "Buen comestible; requiere helada y choque térmico; ejemplares de gran tamaño.",
  "cond_req_ca": "Bon comestible; requereix gelada i xoc tèrmic; exemplars de gran mida.",
  "cond_req_en": "Good edible; requires frost and thermal shock; large-sized specimens."
}'::jsonb WHERE id = 'esp-116';

-- esp-117 Cortinarius armeniacus
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Aparece con temperaturas frescas de 12°C en diversos tipos de bosque.",
  "cond_temp_ca": "Apareix amb temperatures fresques de 12°C en diversos tipus de bosc.",
  "cond_temp_en": "Appears with cool temperatures of 12°C in various forest types.",
  "cond_precip_es": "Lluvias de 70 mm y una humedad del 75% para su fructificación.",
  "cond_precip_ca": "Pluges de 70 mm i una humitat del 75% per a la seva fructificació.",
  "cond_precip_en": "Rainfall of 70 mm and 75% humidity for fruiting.",
  "cond_suelo_es": "Suelos pobres y ácidos (pH 4.5-6.5) tanto en frondosas como coníferas.",
  "cond_suelo_ca": "Sòls pobres i àcids (pH 4.5-6.5) tant en frondoses com coníferes.",
  "cond_suelo_en": "Poor and acidic soils (pH 4.5-6.5) in both hardwoods and conifers.",
  "cond_req_es": "Tóxico; requiere choque térmico; se distingue por su color naranja-ocre.",
  "cond_req_ca": "Tòxic; requereix xoc tèrmic; es distingeix pel seu color taronja-ocre.",
  "cond_req_en": "Toxic; requires thermal shock; distinguished by its orange-ochre color."
}'::jsonb WHERE id = 'esp-117';

-- esp-124 Phlegmacium calochroum
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Fructifica con el fresco otoñal (12°C) en bosques de frondosas.",
  "cond_temp_ca": "Fructifica amb la fresca tardorenca (12°C) en boscos de frondoses.",
  "cond_temp_en": "Fruits with the autumn cool (12°C) in broadleaf forests.",
  "cond_precip_es": "Humedad alta del 80% y lluvias acumuladas de 75 mm.",
  "cond_precip_ca": "Humitat alta de l’80% i pluges acumulades de 75 mm.",
  "cond_precip_en": "High 80% humidity and accumulated rainfall of 75 mm.",
  "cond_suelo_es": "Suelos neutros a calizos (pH 5-6.5), bajo robles y hayas.",
  "cond_suelo_ca": "Sòls neutres a calcaris (pH 5-6.5), sota roures i faigs.",
  "cond_suelo_en": "Neutral to calcareous soils (pH 5-6.5), under oaks and beeches.",
  "cond_req_es": "Tóxico; requiere choque térmico; destaca por su bulbo marginado.",
  "cond_req_ca": "Tòxic; requereix xoc tèrmic; destaca pel seu bulb marginat.",
  "cond_req_en": "Toxic; requires thermal shock; notable for its marginated bulb."
}'::jsonb WHERE id = 'esp-124';

-- esp-125 Dermocybe sanguinea
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Especie de clima fresco (12°C) asociada a bosques de pinos y abetos.",
  "cond_temp_ca": "Espècie de clima fresc (12°C) associada a boscos de pins i abets.",
  "cond_temp_en": "Cool climate species (12°C) associated with pine and fir forests.",
  "cond_precip_es": "Necesita 75 mm de lluvia y humedad del 78% para su desarrollo.",
  "cond_precip_ca": "Necessita 75 mm de pluja i humitat del 78% pel seu desenvolupament.",
  "cond_precip_en": "Needs 75 mm of rain and 78% humidity for its development.",
  "cond_suelo_es": "Suelos muy ácidos (pH 4.5-6) con abundantes restos leñosos.",
  "cond_suelo_ca": "Sòls molt àcids (pH 4.5-6) amb abundants restes llenyoses.",
  "cond_suelo_en": "Very acidic soils (pH 4.5-6) with abundant woody debris.",
  "cond_req_es": "Tóxico; requiere helada y choque térmico; destaca por su color rojo sangre uniforme.",
  "cond_req_ca": "Tòxic; requereix gelada i xoc tèrmic; destaca pel seu color vermell sang uniforme.",
  "cond_req_en": "Toxic; requires frost and thermal shock; notable for its uniform blood-red color."
}'::jsonb WHERE id = 'esp-125';