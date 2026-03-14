-- esp-070  Pleurotus ostreatus
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Especie de clima frío que requiere bajas temperaturas (óptimo 11.5°C) para fructificar adecuadamente.",
  "cond_temp_ca": "Espècie de clima fred que requereix baixes temperatures (òptim 11.5°C) per fructificar adequadament.",
  "cond_temp_en": "Cold-climate species that requires low temperatures (optimum 11.5°C) to fruit properly.",
  "cond_precip_es": "Necesita humedad ambiental muy alta (85%) y lluvias moderadas de 50 mm.",
  "cond_precip_ca": "Necessita humitat ambiental molt alta (85%) i pluges moderades de 50 mm.",
  "cond_precip_en": "Needs very high ambient humidity (85%) and moderate rainfall of 50 mm.",
  "cond_suelo_es": "Suelo indiferente (pH 5.5-7.5), aunque suele crecer sobre madera muerta de frondosas.",
  "cond_suelo_ca": "Sòl indiferent (pH 5.5-7.5), encara que sol créixer sobre fusta morta de frondoses.",
  "cond_suelo_en": "Indifferent soil (pH 5.5-7.5), although it usually grows on dead hardwood.",
  "cond_req_es": "Saprófita; requiere helada para activar la aparición de los carpóforos en invierno.",
  "cond_req_ca": "Saprofita; requereix gelada per activar l’aparició dels carpòfors a l’hivern.",
  "cond_req_en": "Saprophytic; requires frost to trigger the appearance of sporocarps in winter."
}'::jsonb
WHERE id = 'esp-070';

-- esp-071  Pleurotus eryngii
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Prefiere temperaturas suaves de 14°C, siendo común tanto en primavera como en otoño.",
  "cond_temp_ca": "Prefereix temperatures suaus de 14°C, sent comú tant a la primavera com a la tardor.",
  "cond_temp_en": "Prefers mild temperatures of 14°C, being common in both spring and autumn.",
  "cond_precip_es": "Menos exigente en humedad (70%) que otras especies del género, adaptada a praderas.",
  "cond_precip_ca": "Menys exigent en humitat (70%) que altres espècies del gènere, adaptada a prats.",
  "cond_precip_en": "Less demanding in humidity (70%) than other species of the genus, adapted to meadows.",
  "cond_suelo_es": "Suelos básicos o calizos (pH 6.5-8), ligada estrictamente a las raíces del cardo corredor.",
  "cond_suelo_ca": "Sòls bàsics o calcaris (pH 6.5-8), lligada estrictament a les arrels del card girant.",
  "cond_suelo_en": "Basic or calcareous soils (pH 6.5-8), strictly linked to the roots of field eryngo.",
  "cond_req_es": "Saprófita; no requiere choque térmico, pero sí la presencia de la planta huésped.",
  "cond_req_ca": "Saprofita; no requereix xoc tèrmic, però sí la presència de la planta hoste.",
  "cond_req_en": "Saprophytic; does not require thermal shock, but requires the presence of the host plant."
}'::jsonb
WHERE id = 'esp-071';

-- esp-072  Pleurotus cornucopiae
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Especie termófila que alcanza su desarrollo óptimo a 16°C, tolerando hasta los 22°C.",
  "cond_temp_ca": "Espècie termòfila que arriba al seu desenvolupament òptim a 16°C, tolerant fins als 22°C.",
  "cond_temp_en": "Thermophilic species that reaches its optimal development at 16°C, tolerating up to 22°C.",
  "cond_precip_es": "Requiere 60 mm de lluvia y una humedad moderada del 78% para su rápido ciclo de 6 días.",
  "cond_precip_ca": "Requereix 60 mm de pluja i una humitat moderada del 78% pel seu ràpid cicle de 6 dies.",
  "cond_precip_en": "Requires 60 mm of rain and moderate humidity of 78% for its fast 6-day cycle.",
  "cond_suelo_es": "Suelo indiferente (pH 5.5-7.5), crece en troncos de madera degradada en zonas bajas.",
  "cond_suelo_ca": "Sòl indiferent (pH 5.5-7.5), creix en troncs de fusta degradada en zones baixes.",
  "cond_suelo_en": "Indifferent soil (pH 5.5-7.5), grows on degraded wood logs in low-lying areas.",
  "cond_req_es": "Saprófita; fructifica en grupos imbricados, a menudo con el pie ramificado.",
  "cond_req_ca": "Saprofita; fructifica en grups imbricats, sovint amb el peu ramificat.",
  "cond_req_en": "Saprophytic; fruits in imbricated groups, often with a branched stem."
}'::jsonb
WHERE id = 'esp-072';

-- esp-073  Pleurotus pulmonarius
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Prefiere ambientes templados (14°C) y es más frecuente en los meses cálidos que el P. ostreatus.",
  "cond_temp_ca": "Prefereix ambients temperats (14°C) i és més freqüent en els mesos càlids que el P. ostreatus.",
  "cond_temp_en": "Prefers temperate environments (14°C) and is more frequent in warm months than P. ostreatus.",
  "cond_precip_es": "Exige una humedad alta (80%) y lluvias de 65 mm para mantener su carne tierna.",
  "cond_precip_ca": "Exigeix una humitat alta (80%) i pluges de 65 mm per mantenir la seva carn tendra.",
  "cond_precip_en": "Requires high humidity (80%) and 65 mm rainfall to keep its flesh tender.",
  "cond_suelo_es": "Suelo indiferente (pH 5.5-7.5), típicamente saprófito sobre maderas de planifolios.",
  "cond_suelo_ca": "Sòl indiferent (pH 5.5-7.5), típicament saprofita sobre fustes de planifolis.",
  "cond_suelo_en": "Indifferent soil (pH 5.5-7.5), typically saprophytic on broadleaf wood.",
  "cond_req_es": "Saprófita; no requiere helada; posee un color más pálido y un ciclo de crecimiento veloz.",
  "cond_req_ca": "Saprofita; no requereix gelada; posseeix un color més pàl·lid i un cicle de creixement veloç.",
  "cond_req_en": "Saprophytic; does not require frost; it has a paler color and a fast growth cycle."
}'::jsonb
WHERE id = 'esp-073';

-- esp-076  Hohenbuehelia petaloides
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Se desarrolla bien a 14°C en climas templados, con presencia primaveral y otoñal.",
  "cond_temp_ca": "Es desenvolupa bé a 14°C en climes temperats, amb presència primaveral i tardorenca.",
  "cond_temp_en": "Develops well at 14°C in temperate climates, appearing in spring and autumn.",
  "cond_precip_es": "Necesita 65 mm de lluvia y humedad del 80%, a menudo ligada a suelos con restos leñosos soterrados.",
  "cond_precip_ca": "Necessita 65 mm de pluja i humitat del 80%, sovint lligada a sòls amb restes llenyoses soterrades.",
  "cond_precip_en": "Needs 65 mm of rain and 80% humidity, often linked to soils with buried woody debris.",
  "cond_suelo_es": "Suelo indiferente (pH 5.5-7.5), frecuente en suelos ricos en mantillo o virutas.",
  "cond_suelo_ca": "Sòl indiferent (pH 5.5-7.5), freqüent en sòls rics en humus o encenalls.",
  "cond_suelo_en": "Indifferent soil (pH 5.5-7.5), frequent in soils rich in mulch or wood chips.",
  "cond_req_es": "Saprófita; se caracteriza por su consistencia algo elástica y su forma de espátula.",
  "cond_req_ca": "Saprofita; es caracteritza per la seva consistència una mica elàstica i la seva forma d’espàtula.",
  "cond_req_en": "Saprophytic; characterized by its somewhat elastic consistency and spatula shape."
}'::jsonb
WHERE id = 'esp-076';