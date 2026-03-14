-- Familia Russulaceae
-- esp-054  Lactarius deliciosus
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Prefiere temperaturas frescas entre 8–16°C (óptimo 12°C). Muy común en el otoño central.",
  "cond_temp_ca": "Prefereix temperatures fresques entre 8–16°C (òptim 12°C). Molt comú a la tardor central.",
  "cond_temp_en": "Prefers cool temperatures between 8–16°C (optimum 12°C). Very common in mid-autumn.",
  "cond_precip_es": "Necesita lluvias generosas de 35–80mm. El ciclo de fructificación es de 12 días tras las lluvias significativas[cite: 1].",
  "cond_precip_ca": "Necessita pluges generoses de 35–80mm. El cicle de fructificació és de 12 dies després de les pluges significatives[cite: 1].",
  "cond_precip_en": "Needs generous rainfall of 35–80mm. The fruiting cycle is 12 days after significant rains[cite: 1].",
  "cond_suelo_es": "Suelos ácidos (pH 4.5–6.5) bajo diversas especies de pinos[cite: 1].",
  "cond_suelo_ca": "Sòls àcids (pH 4.5–6.5) sota diverses espècies de pins[cite: 1].",
  "cond_suelo_en": "Acidic soils (pH 4.5–6.5) under various pine species[cite: 1].",
  "cond_req_es": "Especie micorrizógena. Requiere obligatoriamente helada y choque térmico para una gran brotación[cite: 1].",
  "cond_req_ca": "Espècie micorrizògena. Requereix obligatòriament gelada i xoc tèrmic per a una gran brollada[cite: 1].",
  "cond_req_en": "Mycorrhizal species. Strictly requires frost and thermal shock for a major sprouting[cite: 1]."
}'::jsonb
WHERE id = 'esp-054';

-- esp-055  Lactarius sanguifluus
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Especie termófila dentro de los níscalos (10–18°C, óptimo 14°C)[cite: 1].",
  "cond_precip_es": "Precisa lluvias de 30–75mm. Ciclo de 12 días[cite: 1].",
  "cond_suelo_es": "Suelos calcáreos (pH 7–8.5) bajo pinos en ambiente mediterráneo[cite: 1].",
  "cond_req_es": "Micorrizógeno. Requiere choque térmico; es menos resistente al frío intenso que L. deliciosus[cite: 1]."
}'::jsonb
WHERE id = 'esp-055';

-- Familia Schizophyllaceae
-- esp-137  Schizophyllum commune
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Rango muy amplio (4–28°C). Óptimo a los 16°C. Fructifica todo el año[cite: 1].",
  "cond_precip_es": "15–55mm. Muy resistente a la sequía gracias a su capacidad de revivir[cite: 1].",
  "cond_suelo_es": "Madera muerta de planifolios y coníferas (pH 5–8)[cite: 1].",
  "cond_req_es": "Saprófito cosmopolita y xerófilo. No requiere choque térmico[cite: 1]."
}'::jsonb
WHERE id = 'esp-137';

-- Familia Strophariaceae
-- esp-121  Stropharia rugosoannulata
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Temperaturas templadas (12–22°C, óptimo 17°C)[cite: 1].",
  "cond_precip_es": "25–65mm. Requiere humedad constante en el sustrato[cite: 1].",
  "cond_suelo_es": "Suelos ricos en materia orgánica, restos de paja o madera (pH 5.5–7.5)[cite: 1].",
  "cond_req_es": "Saprófito nitrófilo. No requiere choque térmico; a menudo cultivado[cite: 1]."
}'::jsonb
WHERE id = 'esp-121';

-- esp-122  Agrocybe aegerita
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Fructifica entre 12–24°C (óptimo 18°C). Típica de primavera y otoño cálido[cite: 1].",
  "cond_precip_es": "20–60mm. Ciclo de 7 días tras lluvias suaves[cite: 1].",
  "cond_suelo_es": "Madera de chopos, álamos y otros planifolios (pH 6–8)[cite: 1].",
  "cond_req_es": "Saprófito lignícola (Seta de chopo). Requiere choque térmico para inducir la fructificación[cite: 1]."
}'::jsonb
WHERE id = 'esp-122';

-- Familia Suillaceae
-- esp-056  Suillus luteus
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Fructifica en condiciones frescas (8–16°C, óptimo 12°C)[cite: 1].",
  "cond_precip_es": "25–65mm. Aparece unos 8 días después de las lluvias[cite: 1].",
  "cond_suelo_es": "Suelos preferentemente ácidos (pH 4.5–6.5) bajo pinos[cite: 1].",
  "cond_req_es": "Micorrizógeno muy común. Requiere choque térmico; muy resistente al frío[cite: 1]."
}'::jsonb
WHERE id = 'esp-056';

-- esp-057  Suillus granulatus
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Rango templado-fresc (10–20°C, óptimo 15°C)[cite: 1].",
  "cond_precip_es": "20–60mm. Ciclo de 7 días[cite: 1].",
  "cond_suelo_es": "Suelos calizos o neutros bajo pinos (pH 6–8)[cite: 1].",
  "cond_req_es": "Micorrizógeno. No requiere choque térmico tan marcado como S. luteus[cite: 1]."
}'::jsonb
WHERE id = 'esp-057';