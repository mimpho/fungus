-- esp-078  Morchella esculenta
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Fructifica en primavera con temperaturas frescas de 13°C, siendo sensible al calor excesivo.",
  "cond_temp_ca": "Fructifica a la primavera amb temperatures fresques de 13°C, sent sensible a la calor excessiva.",
  "cond_temp_en": "Fruits in spring with cool temperatures of 13°C, being sensitive to excessive heat.",
  "cond_precip_es": "Necesita 60 mm de lluvia y humedad del 75%, apareciendo tras deshielos o lluvias primaverales.",
  "cond_precip_ca": "Necessita 60 mm de pluja i humitat del 75%, apareixent després de desgel o pluges primaverals.",
  "cond_precip_en": "Needs 60 mm of rain and 75% humidity, appearing after snowmelt or spring rains.",
  "cond_suelo_es": "Suelos básicos o neutros (pH 6-7.5) con materia orgánica, a menudo cerca de ríos.",
  "cond_suelo_ca": "Sòls bàsics o neutres (pH 6-7.5) amb matèria orgànica, sovint a prop de rius.",
  "cond_suelo_en": "Basic or neutral soils (pH 6-7.5) with organic matter, often near rivers.",
  "cond_req_es": "Saprófita o micorrizógena; requiere helada invernal previa para estimular la producción.",
  "cond_req_ca": "Saprofita o micorrizogen; requereix gelada hivernal prèvia per estimular la producció.",
  "cond_req_en": "Saprophytic or mycorrhizal; requires previous winter frost to stimulate production."
}'::jsonb
WHERE id = 'esp-078';

-- esp-079  Morchella elata
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Prefiere el fresco montano de 13°C, habitando zonas de mayor altitud que la esculenta.",
  "cond_temp_ca": "Prefereix la fresca montana de 13°C, habitant zones de major altitud que l’esculenta.",
  "cond_temp_en": "Prefers the montane coolness of 13°C, inhabiting higher altitude areas than M. esculenta.",
  "cond_precip_es": "Requiere 70 mm de lluvia y humedad alta (80%) en terrenos con buen drenaje.",
  "cond_precip_ca": "Requereix 70 mm de pluja i humitat alta (80%) en terrenys amb un bon drenatge.",
  "cond_precip_en": "Requires 70 mm of rain and high humidity (80%) in well-drained terrains.",
  "cond_suelo_es": "Suelos básicos (pH 6-8), común en claros de pinar o zonas recientemente quemadas.",
  "cond_suelo_ca": "Sòls bàsics (pH 6-8), comú en clarianes de pineda o zones recentment cremades.",
  "cond_suelo_en": "Basic soils (pH 6-8), common in pine forest clearings or recently burned areas.",
  "cond_req_es": "Saprófita; no requiere choque térmico específico; destaca por su forma cónica y oscura.",
  "cond_req_ca": "Saprofita; no requereix xoc tèrmic específic; destaca per la seva forma cònica i fosca.",
  "cond_req_en": "Saprophytic; does not require specific thermal shock; notable for its dark, conical shape."
}'::jsonb
WHERE id = 'esp-079';

-- esp-080  Morchella conica
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Fructifica de forma óptima a 13°C, muy vinculada al inicio de la primavera.",
  "cond_temp_ca": "Fructifica de forma òptima a 13°C, molt vinculada a l’inici de la primavera.",
  "cond_temp_en": "Fruits optimally at 13°C, closely linked to the beginning of spring.",
  "cond_precip_es": "Necesita 65 mm de lluvia acumulada y una humedad del 78% en el ambiente.",
  "cond_precip_ca": "Necessita 65 mm de pluja acumulada i una humitat del 78% en l’ambient.",
  "cond_precip_en": "Needs 65 mm of accumulated rain and an ambient humidity of 78%.",
  "cond_suelo_es": "Suelos calizos o neutros (pH 6-8) en bosques mixtos y pinares.",
  "cond_suelo_ca": "Sòls calcaris o neutres (pH 6-8) en boscos mixtos i pinedes.",
  "cond_suelo_en": "Calcareous or neutral soils (pH 6-8) in mixed forests and pine forests.",
  "cond_req_es": "Saprófita; no requiere helada; es una especie pirófila que puede aparecer tras incendios.",
  "cond_req_ca": "Saprofita; no requereix gelada; és una espècie piròfila que pot aparèixer després d’incendis.",
  "cond_req_en": "Saprophytic; does not require frost; it is a pyrophilic species that can appear after fires."
}'::jsonb
WHERE id = 'esp-080';

-- esp-081  Morchella importuna
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Se adapta a entornos urbanos o alterados con una temperatura óptima de 13°C.",
  "cond_temp_ca": "S’adapta a entorns urbans o alterats amb una temperatura òptima de 13°C.",
  "cond_temp_en": "Adapts to urban or disturbed environments with an optimal temperature of 13°C.",
  "cond_precip_es": "Precisa de 65 mm de lluvia y humedad del 78% para fructificar en mantillos o jardines.",
  "cond_precip_ca": "Precisa de 65 mm de pluja i humitat del 78% per fructificar en encoixinats o jardins.",
  "cond_precip_en": "Requires 65 mm of rain and 78% humidity to fruit in mulch or gardens.",
  "cond_suelo_es": "Suelos nitrogenados y básicos (pH 6-8), frecuente en sustratos con restos de madera.",
  "cond_suelo_ca": "Sòls nitrogenats i bàsics (pH 6-8), freqüent en substrats amb restes de fusta.",
  "cond_suelo_en": "Nitrogenous and basic soils (pH 6-8), frequent in substrates with wood debris.",
  "cond_req_es": "Saprófita; conocida por su capacidad de aparecer masivamente en áreas ajardinadas recientes.",
  "cond_req_ca": "Saprofita; coneguda per la seva capacitat d’aparèixer massivament en àrees enjardinades recents.",
  "cond_req_en": "Saprophytic; known for its ability to appear massively in recently landscaped areas."
}'::jsonb
WHERE id = 'esp-081';