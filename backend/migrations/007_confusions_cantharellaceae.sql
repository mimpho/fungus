-- =============================================================================
-- 007_confusions_cantharellaceae.sql — Confusiones Cantharellaceae
-- =============================================================================
-- IDs verificados en frontend/src/data/species.js:
--   esp-045  Cantharellus cibarius      (excelente)
--   esp-046  Cantharellus pallens       (excelente)
--   esp-047  Cantharellus aurora        (excelente)
--   esp-048  Craterellus cornucopioides (excelente)
--   esp-049  Craterellus lutescens      (excelente)
--   esp-050  Craterellus tubaeformis    (excelente)
-- Cross-familia:
--   esp-074  Omphalotus olearius (Pleurotaceae / seta del olivo — TÓXICA)
-- Nota: Hygrophoropsis aurantiaca (falso rebozuelo naranja) no está en catálogo.
-- =============================================================================
-- Pares cubiertos:
--   cibarius ↔ Omphalotus olearius    (la confusión más frecuente y peligrosa)
--   pallens  ↔ Omphalotus olearius    (ídem — pallens también es naranja-crema)
--   aurora   → Omphalotus olearius    (aurora es amarillo-naranja)
--   cibarius ↔ pallens                (misma especie en la práctica)
--   tubaeformis ↔ cornucopioides      (trompetillas similares en otoño tardío)
-- =============================================================================


-- =============================================================================
-- esp-045  Cantharellus cibarius
-- =============================================================================
UPDATE species
SET extra_data = jsonb_set(
    COALESCE(extra_data, '{}'::jsonb),
    '{confusions}',
    COALESCE(extra_data->'confusions', '[]'::jsonb) || jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-074', 'diff',
    'Confusión clásica y peligrosa. Diferencias clave: Omphalotus tiene LAMINILLAS verdaderas (finas, apretadas, de borde afilado); Cantharellus tiene falsas laminillas (pliegues gruesos, ramificados, difíciles de separar con la uña). Omphalotus crece en matas sobre madera o raíces enterradas; Cantharellus en suelo. Omphalotus: causa gastroenteritis grave.'),
  jsonb_build_object('with_species_id', 'esp-046', 'diff',
    'A. pallens (= Cantharellus pallens) es prácticamente la misma especie en la mayoría de estudios actuales: sombrero más pálido crema-amarillento. Ambas excelentes comestibles con idéntico aroma afrutado.')
    )
)
WHERE scientific_name = 'Cantharellus cibarius';


-- =============================================================================
-- esp-046  Cantharellus pallens
-- =============================================================================
UPDATE species
SET extra_data = jsonb_set(
    COALESCE(extra_data, '{}'::jsonb),
    '{confusions}',
    COALESCE(extra_data->'confusions', '[]'::jsonb) || jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-074', 'diff',
    'Omphalotus olearius tiene LAMINILLAS verdaderas finas y apretadas; C. pallens tiene pliegues gruesos y ramificados. Omphalotus crece en grupos sobre madera o raíces; C. pallens siempre en suelo. Omphalotus brilla débilmente en la oscuridad. Tóxica: gastroenteritis grave.'),
  jsonb_build_object('with_species_id', 'esp-045', 'diff',
    'C. cibarius y C. pallens son muy similares y muchos autores las sinonomizan. C. pallens tiene sombrero más pálido (crema-blancuzco) y la talla es ligeramente mayor. Ambas excelentes comestibles.')
    )
)
WHERE scientific_name = 'Cantharellus pallens';


-- =============================================================================
-- esp-047  Cantharellus aurora
-- =============================================================================
UPDATE species
SET extra_data = jsonb_set(
    COALESCE(extra_data, '{}'::jsonb),
    '{confusions}',
    COALESCE(extra_data->'confusions', '[]'::jsonb) || jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-074', 'diff',
    'C. aurora es amarillo-naranja y crece en suelo de bosques húmedos. Omphalotus olearius es más naranja-intenso, tiene laminillas verdaderas (no pliegues), crece en grupos sobre madera o raíces y puede brillar en la oscuridad. Tóxico. Mirar siempre el pie: Omphalotus tiene base ecéntrica o sobre tocón.')
    )
)
WHERE scientific_name = 'Cantharellus aurora';


-- =============================================================================
-- esp-050  Craterellus tubaeformis
-- =============================================================================
UPDATE species
SET extra_data = jsonb_set(
    COALESCE(extra_data, '{}'::jsonb),
    '{confusions}',
    COALESCE(extra_data->'confusions', '[]'::jsonb) || jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-048', 'diff',
    'C. cornucopioides es más oscuro (marrón-gris a casi negro), sin pliegues evidentes en el exterior del sombrero, con el interior del embudo claramente hueco. C. tubaeformis es más amarillento-marrón con pliegues decurrentes grises en el pie. Ambos excelentes y de otoño tardío.')
    )
)
WHERE scientific_name = 'Craterellus tubaeformis';


-- =============================================================================
-- Cross-familia: esp-074  Omphalotus olearius ↔ Cantharellus cibarius
-- =============================================================================
UPDATE species
SET extra_data = jsonb_set(
    COALESCE(extra_data, '{}'::jsonb),
    '{confusions}',
    COALESCE(extra_data->'confusions', '[]'::jsonb) || jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-045', 'diff',
    'C. cibarius tiene pliegues gruesos y ramificados (no laminillas), carne blanca-amarillenta con aroma afrutado y crece en suelo de bosque. Omphalotus tiene laminillas verdaderas apretadas, crece en matas sobre madera o raíces y puede brillar débilmente en la oscuridad. La confusión ocurre sobre todo en ejemplares viejos y mal iluminados.'),
  jsonb_build_object('with_species_id', 'esp-046', 'diff',
    'C. pallens es más pálido y tiene pliegues (no laminillas), aroma afrutado. Omphalotus olearius tiene laminillas verdaderas y crece en base de olivos, encinas u otras frondosas; nunca en suelo libre de raíces. Tóxico: causa gastroenteritis severa.')
    )
)
WHERE scientific_name = 'Omphalotus olearius';


-- =============================================================================
-- Verificación
-- =============================================================================
SELECT scientific_name,
       jsonb_array_length(extra_data->'confusions') AS n_confusions
FROM   species
WHERE  extra_data ? 'confusions'
ORDER  BY scientific_name;
