-- =============================================================================
-- 005_confusions_data.sql — Species Confusion Relationships
-- =============================================================================
-- Fuente de verdad para textos diff: CONFUSIONES_POR_FAMILIA en helpers.jsx
-- IDs verificados en frontend/src/data/species.js
-- Bidireccional: si A confunde con B, también se añade B confunde con A.
-- El operador || hace merge shallow: preserva claves existentes (synonyms, etc.)
-- =============================================================================
-- ERRORES corregidos respecto a la versión anterior:
--   - Boletaceae usaba esp-028 (Russula parazurea) y esp-030 (Russula vesca) → IDs totalmente incorrectos
--   - Helvella lacunosa tenía esp-081 duplicado; el segundo debía ser esp-078 (M. esculenta)
--   - Gyromitra apuntaba a esp-081 (M. importuna) en vez de esp-078 (M. esculenta)
--   - Diffs reemplazados por los textos originales de helpers.jsx (más completos y con avisos de seguridad)
-- =============================================================================


-- =============================================================================
-- MORCHELLACEAE
-- Colmenillas (excelentes) vs Gyromitra esculenta (mortal) vs Helvella lacunosa (precaución)
-- Verpa bohemica NO está en el catálogo → no se puede referenciar por ID
-- =============================================================================

-- esp-078 Morchella esculenta
UPDATE species
SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-082', 'diff', 'Sombrero cerebriforme marrón-rojizo (no alveolado), contiene giromitrinas. Mortal incluso tras cocción. Se confunde con colmenillas (Morchella) y con Helvella lacunosa (precaución).'),
  jsonb_build_object('with_species_id', 'esp-083', 'diff', 'Sombrero lobulado gris-negro (no alveolado). Contiene giromitrinas; siempre cocinar. Se confunde con Gyromitra esculenta (mortal) y Morchella (excelente).')
))
WHERE scientific_name = 'Morchella esculenta';

-- esp-079 Morchella elata — mismas confusiones de seguridad que M. esculenta
UPDATE species
SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-082', 'diff', 'Sombrero cerebriforme marrón-rojizo (no alveolado), contiene giromitrinas. Mortal incluso tras cocción. Se confunde con colmenillas (Morchella) y con Helvella lacunosa (precaución).'),
  jsonb_build_object('with_species_id', 'esp-083', 'diff', 'Sombrero lobulado gris-negro (no alveolado). Contiene giromitrinas; siempre cocinar. Se confunde con Gyromitra esculenta (mortal) y Morchella (excelente).')
))
WHERE scientific_name = 'Morchella elata';

-- esp-080 Morchella conica — ídem
UPDATE species
SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-082', 'diff', 'Sombrero cerebriforme marrón-rojizo (no alveolado), contiene giromitrinas. Mortal incluso tras cocción. Se confunde con colmenillas (Morchella) y con Helvella lacunosa (precaución).'),
  jsonb_build_object('with_species_id', 'esp-083', 'diff', 'Sombrero lobulado gris-negro (no alveolado). Contiene giromitrinas; siempre cocinar. Se confunde con Gyromitra esculenta (mortal) y Morchella (excelente).')
))
WHERE scientific_name = 'Morchella conica';

-- esp-081 Morchella importuna — ídem
UPDATE species
SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-082', 'diff', 'Sombrero cerebriforme marrón-rojizo (no alveolado), contiene giromitrinas. Mortal incluso tras cocción. Se confunde con colmenillas (Morchella) y con Helvella lacunosa (precaución).'),
  jsonb_build_object('with_species_id', 'esp-083', 'diff', 'Sombrero lobulado gris-negro (no alveolado). Contiene giromitrinas; siempre cocinar. Se confunde con Gyromitra esculenta (mortal) y Morchella (excelente).')
))
WHERE scientific_name = 'Morchella importuna';

-- esp-082 Gyromitra esculenta
-- Apunta a M. esculenta (esp-078) como representante del grupo, no a M. importuna (esp-081)
UPDATE species
SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-078', 'diff', 'Colmenilla clásica: sombrero claramente alveolado (celdillas), interior completamente hueco, pie blanco. Excelente comestible pero siempre cocinar. Las crestas más pálidas que las fosas la distinguen.'),
  jsonb_build_object('with_species_id', 'esp-083', 'diff', 'Sombrero lobulado gris-negro. Contiene giromitrinas; siempre cocinar. Se confunde con Gyromitra esculenta (mortal) y Morchella (excelente).')
))
WHERE scientific_name = 'Gyromitra esculenta';

-- esp-083 Helvella lacunosa
-- Corregido: antes tenía esp-081 duplicado; ahora esp-082 (Gyromitra) y esp-078 (Morchella esculenta)
UPDATE species
SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-082', 'diff', 'Sombrero cerebriforme marrón-rojizo (no alveolado), contiene giromitrinas. Mortal incluso tras cocción. Se confunde con colmenillas (Morchella) y con Helvella lacunosa (precaución).'),
  jsonb_build_object('with_species_id', 'esp-078', 'diff', 'Colmenilla clásica: sombrero claramente alveolado (celdillas), interior completamente hueco, pie blanco. Excelente comestible pero siempre cocinar. Las crestas más pálidas que las fosas la distinguen.')
))
WHERE scientific_name = 'Helvella lacunosa';


-- =============================================================================
-- BOLETACEAE
-- B. edulis y afines (excelentes) vs boletos de poros rojos/azulantes (tóxicos)
-- IDs correctos:
--   esp-013 = Suillellus luridus     (la versión anterior usaba esp-030 = Russula vesca, ERROR)
--   esp-014 = Neoboletus erythropus  (la versión anterior usaba esp-028 = Russula parazurea, ERROR)
--   esp-015 = Rubroboletus satanas
-- =============================================================================

-- esp-001 Boletus edulis
UPDATE species
SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-004', 'diff', 'Muy similar a B. edulis. Sombrero ocre-amarillento, pie reticulado casi hasta la base. Estival, típico de robledales y bosques caducifolios. Igual de excelente que el cep.'),
  jsonb_build_object('with_species_id', 'esp-015', 'diff', 'Poros rojo intenso, pie reticulado con tonos rojos, azulea fuertemente al corte. Olor a carroña en maduros. Bosques calcáreos. Tóxico incluso cocinado.'),
  jsonb_build_object('with_species_id', 'esp-013', 'diff', 'Poros anaranjados-rojizos, retículo rojo en el pie, azulea muy rápido al corte. Comestible solo con cocción prolongada; tóxico en crudo.'),
  jsonb_build_object('with_species_id', 'esp-014', 'diff', 'Poros rojo sangre desde joven, azulea instantáneamente al corte. Sin retículo en el pie. Tóxico crudo; comestible con cocción prolongada.')
))
WHERE scientific_name = 'Boletus edulis';

-- esp-002 Boletus aereus — mismo grupo de confusiones con boletos tóxicos
UPDATE species
SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-015', 'diff', 'Poros rojo intenso, pie reticulado con tonos rojos, azulea fuertemente al corte. Olor a carroña en maduros. Bosques calcáreos. Tóxico incluso cocinado.'),
  jsonb_build_object('with_species_id', 'esp-013', 'diff', 'Poros anaranjados-rojizos, retículo rojo en el pie, azulea muy rápido al corte. Comestible solo con cocción prolongada; tóxico en crudo.'),
  jsonb_build_object('with_species_id', 'esp-014', 'diff', 'Poros rojo sangre desde joven, azulea instantáneamente al corte. Sin retículo en el pie. Tóxico crudo; comestible con cocción prolongada.')
))
WHERE scientific_name = 'Boletus aereus';

-- esp-003 Boletus pinophilus — ídem
UPDATE species
SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-015', 'diff', 'Poros rojo intenso, pie reticulado con tonos rojos, azulea fuertemente al corte. Olor a carroña en maduros. Bosques calcáreos. Tóxico incluso cocinado.'),
  jsonb_build_object('with_species_id', 'esp-013', 'diff', 'Poros anaranjados-rojizos, retículo rojo en el pie, azulea muy rápido al corte. Comestible solo con cocción prolongada; tóxico en crudo.'),
  jsonb_build_object('with_species_id', 'esp-014', 'diff', 'Poros rojo sangre desde joven, azulea instantáneamente al corte. Sin retículo en el pie. Tóxico crudo; comestible con cocción prolongada.')
))
WHERE scientific_name = 'Boletus pinophilus';

-- esp-004 Boletus reticulatus — bidireccional con B. edulis + mismas confusiones tóxicas
UPDATE species
SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-001', 'diff', 'El cep noble: poros blancos→amarillo-verdosos, no azulea al corte, olor agradable fúngico. Confundible con boletos de poros rojos o que azulean fuertemente.'),
  jsonb_build_object('with_species_id', 'esp-015', 'diff', 'Poros rojo intenso, pie reticulado con tonos rojos, azulea fuertemente al corte. Olor a carroña en maduros. Bosques calcáreos. Tóxico incluso cocinado.'),
  jsonb_build_object('with_species_id', 'esp-013', 'diff', 'Poros anaranjados-rojizos, retículo rojo en el pie, azulea muy rápido al corte. Comestible solo con cocción prolongada; tóxico en crudo.'),
  jsonb_build_object('with_species_id', 'esp-014', 'diff', 'Poros rojo sangre desde joven, azulea instantáneamente al corte. Sin retículo en el pie. Tóxico crudo; comestible con cocción prolongada.')
))
WHERE scientific_name = 'Boletus reticulatus';

-- esp-013 Suillellus luridus — bidireccional con B. edulis
UPDATE species
SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-001', 'diff', 'El cep noble: poros blancos→amarillo-verdosos, no azulea al corte, olor agradable fúngico. Confundible con boletos de poros rojos o que azulean fuertemente.')
))
WHERE scientific_name = 'Suillellus luridus';

-- esp-014 Neoboletus erythropus — bidireccional con B. edulis
UPDATE species
SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-001', 'diff', 'El cep noble: poros blancos→amarillo-verdosos, no azulea al corte, olor agradable fúngico. Confundible con boletos de poros rojos o que azulean fuertemente.')
))
WHERE scientific_name = 'Neoboletus erythropus';

-- esp-015 Rubroboletus satanas — bidireccional con B. edulis
UPDATE species
SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-001', 'diff', 'El cep noble: poros blancos→amarillo-verdosos, no azulea al corte, olor agradable fúngico. Confundible con boletos de poros rojos o que azulean fuertemente.')
))
WHERE scientific_name = 'Rubroboletus satanas';


-- =============================================================================
-- Verificación: debe mostrar 13 filas con n_confusions > 0
-- =============================================================================
SELECT scientific_name, jsonb_array_length(extra_data->'confusions') AS n_confusions
FROM species
WHERE extra_data ? 'confusions'
ORDER BY scientific_name;
