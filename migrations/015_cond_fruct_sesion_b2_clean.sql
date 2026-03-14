-- 015_cond_fruct_sesion_b2_clean.sql
-- Eliminados (familias ya migradas): esp-054, esp-055, esp-137, esp-056, esp-057
-- PENDIENTE: añadir 015_cond_fruct_sesion_b3.sql con las 13 especies ausentes

-- Familia Russulaceae
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
