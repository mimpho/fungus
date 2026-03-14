-- esp-045  Cantharellus cibarius
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Prefiere climas templados con un óptimo de 18°C, siendo muy sensible a las heladas tempranas.",
  "cond_temp_ca": "Prefereix climes temperats amb un òptim de 18°C, sent molt sensible a les gelades primerenques.",
  "cond_temp_en": "Prefers temperate climates with an optimum of 18°C, being very sensitive to early frosts.",
  "cond_precip_es": "Requiere lluvias abundantes (80 mm) y una humedad ambiental alta y constante del 82%.",
  "cond_precip_ca": "Requereix pluges abundants (80 mm) i una humitat ambiental alta i constant del 82%.",
  "cond_precip_en": "Requires abundant rainfall (80 mm) and high, constant ambient humidity of 82%.",
  "cond_suelo_es": "Suelos silíceos y ácidos (pH 5-6.5), evitando terrenos calizos o pesados.",
  "cond_suelo_ca": "Sòls silicis i àcids (pH 5-6.5), evitant terrenys calcaris o pesats.",
  "cond_suelo_en": "Siliceous and acidic soils (pH 5-6.5), avoiding calcareous or heavy terrains.",
  "cond_req_es": "Micorrizógena; requiere choque térmico estival para activar la fructificación otoñal.",
  "cond_req_ca": "Micorrizogen; requereix xoc tèrmic estival per activar la fructificació tardorenca.",
  "cond_req_en": "Mycorrhizal; requires summer thermal shock to trigger autumn fruiting."
}'::jsonb
WHERE id = 'esp-045';

-- esp-046  Cantharellus pallens
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Especie termófila que soporta bien temperaturas de hasta 22°C en encinares.",
  "cond_temp_ca": "Espècie termòfila que suporta bé temperatures de fins a 22°C en alzinars.",
  "cond_temp_en": "Thermophilic species that withstands temperatures up to 22°C in holm oak forests.",
  "cond_precip_es": "Menos exigente en agua que otras especies del género, conformándose con 60 mm.",
  "cond_precip_ca": "Menys exigent en aigua que altres espècies del gènere, conformant-se amb 60 mm.",
  "cond_precip_en": "Less water-demanding than other species of the genus, settling for 60 mm.",
  "cond_suelo_es": "Suelos neutros o ligeramente básicos (pH 5.5-7.5), frecuente en ambientes mediterráneos.",
  "cond_suelo_ca": "Sòls neutres o lleugerament bàsics (pH 5.5-7.5), freqüent en ambients mediterranis.",
  "cond_suelo_en": "Neutral or slightly basic soils (pH 5.5-7.5), frequent in Mediterranean environments.",
  "cond_req_es": "Micorrizógena; no requiere choque térmico específico y posee una carne más densa y blanquecina.",
  "cond_req_ca": "Micorrizogen; no requereix xoc tèrmic específic i posseeix una carn més densa i blanquinosa.",
  "cond_req_en": "Mycorrhizal; does not require specific thermal shock and has a denser, whitish flesh."
}'::jsonb
WHERE id = 'esp-046';

-- esp-047  Cantharellus aurora
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Fructifica en ambientes frescos de 15°C, común en el otoño avanzado de montaña.",
  "cond_temp_ca": "Fructifica en ambients frescos de 15°C, comú a la tardor avançada de muntanya.",
  "cond_temp_en": "Fruits in cool environments of 15°C, common in late mountain autumn.",
  "cond_precip_es": "Necesita humedad moderada (75%) y lluvias de 65 mm bien distribuidas.",
  "cond_precip_ca": "Necessita humitat moderada (75%) i pluges de 65 mm ben distribuïdes.",
  "cond_precip_en": "Needs moderate humidity (75%) and well-distributed rainfall of 65 mm.",
  "cond_suelo_es": "Suelos silíceos (pH 5-7), frecuentemente asociada a pinares con brezo.",
  "cond_suelo_ca": "Sòls silicis (pH 5-7), freqüentment associada a pinedes amb bruc.",
  "cond_suelo_en": "Siliceous soils (pH 5-7), frequently associated with pine forests with heather.",
  "cond_req_es": "Micorrizógena; no requiere choque térmico y destaca por su pie hueco y naranja intenso.",
  "cond_req_ca": "Micorrizogen; no requereix xoc tèrmic i destaca pel seu peu buit i taronja intens.",
  "cond_req_en": "Mycorrhizal; does not require thermal shock and stands out for its hollow, intense orange stem."
}'::jsonb
WHERE id = 'esp-047';

-- esp-048  Craterellus cornucopioides
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Prefiere temperaturas frescas de 13°C, apareciendo a menudo tras las primeras lluvias fuertes.",
  "cond_temp_ca": "Prefereix temperatures fresques de 13°C, apareixent sovint després de les primeres pluges fortes.",
  "cond_temp_en": "Prefers cool temperatures of 13°C, often appearing after the first heavy rains.",
  "cond_precip_es": "Exigente en humedad ambiental (82%) para evitar la desecación de su carne fina.",
  "cond_precip_ca": "Exigent en humitat ambiental (82%) per evitar la dessecació de la seva carn fina.",
  "cond_precip_en": "Demanding in ambient humidity (82%) to prevent the drying of its thin flesh.",
  "cond_suelo_es": "Suelos silíceos y húmedos (pH 5-6.5) con mucha materia orgánica y musgo.",
  "cond_suelo_ca": "Sòls silicis i humits (pH 5-6.5) amb molta matèria orgànica i musgo.",
  "cond_suelo_en": "Siliceous and moist soils (pH 5-6.5) with plenty of organic matter and moss.",
  "cond_req_es": "Micorrizógena; requiere choque térmico y suele crecer en grupos muy numerosos pero miméticos.",
  "cond_req_ca": "Micorrizogen; requereix xoc tèrmic i sol créixer en grups molt nombrosos però mimètics.",
  "cond_req_en": "Mycorrhizal; requires thermal shock and usually grows in very large but mimetic groups."
}'::jsonb
WHERE id = 'esp-048';

-- esp-049  Craterellus lutescens
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Muy resistente al frío moderado (12°C), aguantando hasta bien entrado el invierno.",
  "cond_temp_ca": "Molt resistent al fred moderat (12°C), aguantant fins ben entrat l’hivern.",
  "cond_temp_en": "Very resistant to moderate cold (12°C), lasting well into the winter.",
  "cond_precip_es": "Requiere 70 mm de lluvia y humedad alta (82%), común en zonas sombrías y musgosas.",
  "cond_precip_ca": "Requereix 70 mm de pluja i humitat alta (82%), comú en zones ombrívoles i molsoses.",
  "cond_precip_en": "Requires 70 mm of rain and high humidity (82%), common in shady and mossy areas.",
  "cond_suelo_es": "Suelos básicos o neutros (pH 5.5-6.5) con hojarasca húmeda de pinar.",
  "cond_suelo_ca": "Sòls bàsics o neutres (pH 5.5-6.5) amb fullaraca humida de pineda.",
  "cond_suelo_en": "Basic or neutral soils (pH 5.5-6.5) with moist pine needle litter.",
  "cond_req_es": "Micorrizógena; requiere choque térmico y desprende un característico olor a fruta.",
  "cond_req_ca": "Micorrizogen; requereix xoc tèrmic i desprèn una característica olor de fruita.",
  "cond_req_en": "Mycorrhizal; requires thermal shock and gives off a characteristic fruity odor."
}'::jsonb
WHERE id = 'esp-049';

-- esp-050  Craterellus tubaeformis
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Especie de clima frío (10°C) que fructifica incluso después de las heladas nocturnas.",
  "cond_temp_ca": "Espècie de clima fred (10°C) que fructifica fins i tot després de les gelades nocturnes.",
  "cond_temp_en": "Cold-climate species (10°C) that fruits even after night frosts.",
  "cond_precip_es": "Necesita humedad ambiental muy alta (85%) y terrenos empapados por lluvias de 70 mm.",
  "cond_precip_ca": "Necessita humitat ambiental molt alta (85%) i terrenys amarats per pluges de 70 mm.",
  "cond_precip_en": "Needs very high ambient humidity (85%) and ground soaked by 70 mm of rain.",
  "cond_suelo_es": "Suelos ácidos (pH 5.5-6.5) con gran acumulación de humus y musgos.",
  "cond_suelo_ca": "Sòls àcids (pH 5.5-6.5) amb gran acumulació d’humus i molses.",
  "cond_suelo_en": "Acidic soils (pH 5.5-6.5) with high accumulation of humus and mosses.",
  "cond_req_es": "Micorrizógena; requiere helada para optimizar su producción en invierno.",
  "cond_req_ca": "Micorrizogen; requereix gelada per optimitzar la seva producció a l’hivern.",
  "cond_req_en": "Mycorrhizal; requires frost to optimize its production in winter."
}'::jsonb
WHERE id = 'esp-050';

-- esp-054  Pseudocraterellus undulatus
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Fructifica en ambientes frescos de 12°C, generalmente en zonas umbrías de montaña.",
  "cond_temp_ca": "Fructifica en ambients frescos de 12°C, generalment en zones ombrívoles de muntanya.",
  "cond_temp_en": "Fruits in cool environments of 12°C, generally in shady mountain areas.",
  "cond_precip_es": "Requiere 80 mm de lluvia acumulada y una humedad del 82% para su ciclo lento de 9 días.",
  "cond_precip_ca": "Requereix 80 mm de pluja acumulada i una humitat del 82% pel seu cicle lent de 9 dies.",
  "cond_precip_en": "Requires 80 mm of accumulated rain and 82% humidity for its slow 9-day cycle.",
  "cond_suelo_es": "Suelos silíceos (pH 5-7) en bosques maduros de hayas y robles.",
  "cond_suelo_ca": "Sòls silicis (pH 5-7) en boscos madurs de faigs i roures.",
  "cond_suelo_en": "Siliceous soils (pH 5-7) in mature beech and oak forests.",
  "cond_req_es": "Micorrizógena; requiere helada y choque térmico; se distingue por sus bordes muy ondulados.",
  "cond_req_ca": "Micorrizogen; requereix gelada i xoc tèrmic; es distingeix pels seus marges molt ondulats.",
  "cond_req_en": "Mycorrhizal; requires frost and thermal shock; distinguished by its highly wavy edges."
}'::jsonb
WHERE id = 'esp-054';