-- esp-148 Pholiota squarrosa
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Prefiere ambientes frescos con una temperatura óptima de 13°C durante el otoño.",
  "cond_temp_ca": "Prefereix ambients frescos amb una temperatura òptima de 13°C durant la tardor.",
  "cond_temp_en": "Prefers cool environments with an optimal temperature of 13°C during autumn.",
  "cond_precip_es": "Necesita 65 mm de lluvia acumulada y una humedad del 75% para fructificar.",
  "cond_precip_ca": "Necessita 65 mm de pluja acumulada i una humitat del 75% per fructificar.",
  "cond_precip_en": "Needs 65 mm of accumulated rain and 75% humidity to fruit.",
  "cond_suelo_es": "Lignícola; crece en la base de troncos de frondosas y ocasionalmente coníferas (pH 5-7.5).",
  "cond_suelo_ca": "Lignícola; creix a la base de troncs de frondoses i ocasionalment coníferes (pH 5-7.5).",
  "cond_suelo_en": "Lignicolous; grows at the base of broadleaf trunks and occasionally conifers (pH 5-7.5).",
  "cond_req_es": "Tóxica; ciclo de 7 días; caracterizada por sus escamas erizadas en sombrero y pie.",
  "cond_req_ca": "Tòxica; cicle de 7 dies; caracteritzada per les seves escates eriçades en barret i peu.",
  "cond_req_en": "Toxic; 7-day cycle; characterized by its bristly scales on cap and stem."
}'::jsonb WHERE id = 'esp-148';

-- esp-149 Hypholoma fasciculare
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Muy adaptable (14°C); fructifica casi todo el año si hay humedad.",
  "cond_temp_ca": "Molt adaptable (14°C); fructifica gairebé tot l’any si hi ha humitat.",
  "cond_temp_en": "Very adaptable (14°C); fruits almost year-round if humidity is present.",
  "cond_precip_es": "Requiere 60 mm de lluvia y humedad del 72% en el sustrato leñoso.",
  "cond_precip_ca": "Requereix 60 mm de pluja i humitat del 72% en el substrat llenyós.",
  "cond_precip_en": "Requires 60 mm of rain and 72% humidity in the woody substrate.",
  "cond_suelo_es": "Lignícola; cespitosa sobre tocones de todo tipo de árboles (pH 4.5-7).",
  "cond_suelo_ca": "Lignícola; cespitosa sobre soces de tot tipus d’arbres (pH 4.5-7).",
  "cond_suelo_en": "Lignicolous; tufted on stumps of all types of trees (pH 4.5-7).",
  "cond_req_es": "Tóxica; ciclo de 5 días; láminas con un característico color amarillo-verdoso.",
  "cond_req_ca": "Tòxica; cicle de 5 dies; làmines amb un característic color groc-verdós.",
  "cond_req_en": "Toxic; 5-day cycle; gills with a characteristic yellow-greenish color."
}'::jsonb WHERE id = 'esp-149';

-- esp-150 Hypholoma capnoides
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Especie de clima frío (10°C); fructifica a finales de otoño e invierno.",
  "cond_temp_ca": "Espècie de clima fred (10°C); fructifica a finals de tardor i hivern.",
  "cond_temp_en": "Cold climate species (10°C); fruits in late autumn and winter.",
  "cond_precip_es": "Necesita 65 mm de lluvia y alta humedad (75%) en el bosque de pino.",
  "cond_precip_ca": "Necessita 65 mm de pluja i alta humitat (75%) en el bosc de pi.",
  "cond_precip_en": "Needs 65 mm of rain and high humidity (75%) in the pine forest.",
  "cond_suelo_es": "Lignícola; exclusivamente sobre madera de coníferas (pH 4.5-6.5).",
  "cond_suelo_ca": "Lignícola; exclusivament sobre fusta de coníferes (pH 4.5-6.5).",
  "cond_suelo_en": "Lignicolous; exclusively on conifer wood (pH 4.5-6.5).",
  "cond_req_es": "Comestible; ciclo de 7 días; se distingue por sus láminas grises (no verdes).",
  "cond_req_ca": "Comestible; cicle de 7 dies; es distingeix per les seves làmines grises (no verdes).",
  "cond_req_en": "Edible; 7-day cycle; distinguished by its grey gills (not green)."
}'::jsonb WHERE id = 'esp-150';

-- esp-151 Stropharia aeruginosa
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Templado-fresco (13°C); común en zonas húmedas y ricas en detritos.",
  "cond_temp_ca": "Temperat-fresc (13°C); comú en zones humides i riques en detritus.",
  "cond_temp_en": "Temperate-cool (13°C); common in humid areas rich in debris.",
  "cond_precip_es": "Requiere 65 mm de lluvia y una humedad del 75%.",
  "cond_precip_ca": "Requereix 65 mm de pluja i una humitat del 75%.",
  "cond_precip_en": "Requires 65 mm of rain and 75% humidity.",
  "cond_suelo_es": "Suelos nitrogenados con restos de madera o humus profundo (pH 5.5-7.5).",
  "cond_suelo_ca": "Sòls nitrogenats amb restes de fusta o humus profund (pH 5.5-7.5).",
  "cond_suelo_en": "Nitrogenous soils with wood debris or deep humus (pH 5.5-7.5).",
  "cond_req_es": "Precaución; ciclo de 6 días; cutícula viscosa de color verde azulado.",
  "cond_req_ca": "Precaució; cicle de 6 dies; cutícula viscosa de color verd blau.",
  "cond_req_en": "Caution; 6-day cycle; slimy bluish-green cuticle."
}'::jsonb WHERE id = 'esp-151';

-- esp-152 Agrocybe praecox
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Especie primaveral (16°C); prefiere temperaturas suaves tras lluvias.",
  "cond_temp_ca": "Espècie primaveral (16°C); prefereix temperatures suaus després de pluges.",
  "cond_temp_en": "Spring species (16°C); prefers mild temperatures after rain.",
  "cond_precip_es": "Requiere 60 mm de lluvia y humedad del 70%; aparece temprano en el año.",
  "cond_precip_ca": "Requereix 60 mm de pluja i humitat del 70%; apareix d’hora a l’any.",
  "cond_precip_en": "Requires 60 mm of rain and 70% humidity; appears early in the year.",
  "cond_suelo_es": "Suelos ricos en materia orgánica, restos de madera o jardines (pH 5.5-7.5).",
  "cond_suelo_ca": "Sòls rics en matèria orgànica, restes de fusta o jardins (pH 5.5-7.5).",
  "cond_suelo_en": "Soils rich in organic matter, wood debris, or gardens (pH 5.5-7.5).",
  "cond_req_es": "Comestible; ciclo de 6 días; posee un anillo frágil y olor harinoso.",
  "cond_req_ca": "Comestible; cicle de 6 dies; posseeix un anell fràgil i olor farinosa.",
  "cond_req_en": "Edible; 6-day cycle; has a fragile ring and mealy odor."
}'::jsonb WHERE id = 'esp-152';

-- esp-153 Agrocybe aegerita
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Prefiere climas templados (16°C); muy común en chopos y álamos.",
  "cond_temp_ca": "Prefereix climes temperats (16°C); molt comú en xops i pollancres.",
  "cond_temp_en": "Prefers temperate climates (16°C); very common on poplars.",
  "cond_precip_es": "Humedad del 72% y lluvias de 60 mm para fructificaciones sucesivas.",
  "cond_precip_ca": "Humitat del 72% i pluges de 60 mm per a fructificacions successives.",
  "cond_precip_en": "72% humidity and 60 mm of rain for successive fruitings.",
  "cond_suelo_es": "Lignícola; sobre troncos vivos o muertos de frondosas, especialmente chopos (pH 5.5-7.5).",
  "cond_suelo_ca": "Lignícola; sobre troncs vius o morts de frondoses, especialment xops (pH 5.5-7.5).",
  "cond_suelo_en": "Lignicolous; on living or dead broadleaf trunks, especially poplars (pH 5.5-7.5).",
  "cond_req_es": "Excelente comestible; ciclo de 7 días; conocida como seta de chopo.",
  "cond_req_ca": "Excel·lent comestible; cicle de 7 dies; coneguda com a bolet de pollancre.",
  "cond_req_en": "Excellent edible; 7-day cycle; known as the poplar mushroom."
}'::jsonb WHERE id = 'esp-153';

-- esp-154 Kuehneromyces mutabilis
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Templado-fresco (14°C); fructifica en grupos numerosos sobre madera.",
  "cond_temp_ca": "Temperat-fresc (14°C); fructifica en grups nombrosos sobre fusta.",
  "cond_temp_en": "Temperate-cool (14°C); fruits in large groups on wood.",
  "cond_precip_es": "Necesita alta humedad (78%) y lluvias de 65 mm.",
  "cond_precip_ca": "Necessita alta humitat (78%) i pluges de 65 mm.",
  "cond_precip_en": "Needs high humidity (78%) and 65 mm of rain.",
  "cond_suelo_es": "Lignícola; sobre tocones de frondosas en bosques húmedos (pH 5-7.5).",
  "cond_suelo_ca": "Lignícola; sobre soces de frondoses en boscos humits (pH 5-7.5).",
  "cond_suelo_en": "Lignicolous; on broadleaf stumps in humid forests (pH 5-7.5).",
  "cond_req_es": "Buen comestible; ciclo de 6 días; sombrero higrófano que cambia de color al secarse.",
  "cond_req_ca": "Bon comestible; cicle de 6 dies; barret higròfan que canvia de color en assecar-se.",
  "cond_req_en": "Good edible; 6-day cycle; hygrophanous cap that changes color when drying."
}'::jsonb WHERE id = 'esp-154';

-- esp-156 Cyclocybe cylindracea
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Templado (16°C); fructifica desde primavera hasta otoño en riberas.",
  "cond_temp_ca": "Temperat (16°C); fructifica des de primavera fins a tardor en riberes.",
  "cond_temp_en": "Temperate (16°C); fruits from spring to autumn in riverbanks.",
  "cond_precip_es": "Humedad del 72% y lluvias de 60 mm.",
  "cond_precip_ca": "Humitat del 72% i pluges de 60 mm.",
  "cond_precip_en": "72% humidity and 60 mm of rain.",
  "cond_suelo_es": "Lignícola; principalmente sobre álamos y sauces (pH 5.5-7.5).",
  "cond_suelo_ca": "Lignícola; principalment sobre pollancres i salzes (pH 5.5-7.5).",
  "cond_suelo_en": "Lignicolous; mainly on poplars and willows (pH 5.5-7.5).",
  "cond_req_es": "Buen comestible; ciclo de 7 días; muy apreciada gastronómicamente.",
  "cond_req_ca": "Bon comestible; cicle de 7 dies; molt apreciada gastronòmicament.",
  "cond_req_en": "Good edible; 7-day cycle; highly valued gastronomically."
}'::jsonb WHERE id = 'esp-156';

-- esp-157 Stropharia coronilla
UPDATE species SET extra_data = extra_data || '{
  "cond_temp_es": "Templado (16°C); común en prados y céspedes pastoreados.",
  "cond_temp_ca": "Temperat (16°C); comú en prats i gespes pasturades.",
  "cond_temp_en": "Temperate (16°C); common in meadows and grazed lawns.",
  "cond_precip_es": "Requiere 60 mm de lluvia y humedad ambiental del 70%.",
  "cond_precip_ca": "Requereix 60 mm de pluja i humitat ambiental del 70%.",
  "cond_precip_en": "Requires 60 mm of rain and 70% ambient humidity.",
  "cond_suelo_es": "Suelos nitrogenados y básicos, ricos en materia orgánica (pH 6-7.5).",
  "cond_suelo_ca": "Sòls nitrogenats i bàsics, rics en matèria orgànica (pH 6-7.5).",
  "cond_suelo_en": "Nitrogenous and basic soils, rich in organic matter (pH 6-7.5).",
  "cond_req_es": "Precaución; ciclo de 6 días; posee un anillo estriado característico.",
  "cond_req_ca": "Precaució; cicle de 6 dies; posseeix un anell estriat característic.",
  "cond_req_en": "Caution; 6-day cycle; has a characteristic striated ring."
}'::jsonb WHERE id = 'esp-157';