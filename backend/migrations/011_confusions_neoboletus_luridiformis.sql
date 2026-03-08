-- =============================================================================
-- 011_confusions_neoboletus_luridiformis.sql
-- Confusion data for Neoboletus luridiformis + bidirectional update for N. erythropus
-- =============================================================================
-- N. luridiformis and N. erythropus are nearly identical — the most important pair.
-- Both have red/orange pores and blue strongly when cut; toxic raw.
-- Key distinction: erythropus has red dots/granules on stipe; luridiformis has plain
-- yellowish stipe without red ornamentation.
-- =============================================================================

-- esp-019 Neoboletus luridiformis
UPDATE species
SET extra_data = jsonb_set(
    COALESCE(extra_data, '{}'::jsonb),
    '{confusions}',
    COALESCE(extra_data->'confusions', '[]'::jsonb) || jsonb_build_array(
        jsonb_build_object('with_species_id', 'esp-014', 'diff', 'Prácticamente idéntico: poros rojo sangre, azulea instantáneamente al corte. N. erythropus tiene el pie salpicado de puntitos rojo-granate sin retículo; N. luridiformis tiene el pie más liso y amarillento en la base. Mismo consejo de seguridad: tóxico en crudo, comestible solo con cocción prolongada.'),
        jsonb_build_object('with_species_id', 'esp-001', 'diff', 'Cep noble: poros blancos→amarillo-verdosos, no azulea al corte, olor agradable fúngico. Confundible con boletos de poros rojos o que azulean fuertemente.'),
        jsonb_build_object('with_species_id', 'esp-015', 'diff', 'Poros rojo intenso, pie reticulado con tonos rojos, azulea fuertemente al corte. Olor a carroña en maduros. Bosques calcáreos. Tóxico incluso cocinado — más peligroso que N. luridiformis.'),
        jsonb_build_object('with_species_id', 'esp-013', 'diff', 'Poros anaranjados-rojizos, retículo rojo visible en el pie, azulea muy rápido al corte. Comestible solo con cocción prolongada; tóxico en crudo.')
    )
)
WHERE scientific_name = 'Neoboletus luridiformis';

-- esp-014 Neoboletus erythropus — añadir bidireccional con luridiformis
UPDATE species
SET extra_data = jsonb_set(
    COALESCE(extra_data, '{}'::jsonb),
    '{confusions}',
    COALESCE(extra_data->'confusions', '[]'::jsonb) || jsonb_build_array(
        jsonb_build_object('with_species_id', 'esp-019', 'diff', 'Prácticamente idéntico: poros rojo sangre, azulea instantáneamente al corte. N. luridiformis tiene el pie liso y amarillento en la base, sin la punteadura rojo-granate característica de N. erythropus. Mismo consejo de seguridad: tóxico en crudo, comestible solo con cocción prolongada.')
    )
)
WHERE scientific_name = 'Neoboletus erythropus';

-- =============================================================================
-- Verificación
-- =============================================================================
SELECT scientific_name, jsonb_array_length(extra_data->'confusions') AS n_confusions
FROM species
WHERE scientific_name IN ('Neoboletus luridiformis', 'Neoboletus erythropus')
ORDER BY scientific_name;
