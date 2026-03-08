-- =============================================================================
-- 012_confusions_amanita_gemmata.sql
-- Confusion data for Amanita gemmata + bidirectional updates
-- =============================================================================
-- A. gemmata (= A. junquillea) is a yellow-capped toxic Amanita (muscimol).
-- Key confusions: A. muscaria f. aureola (yellow form), A. pantherina (more toxic),
-- A. citrina (yellowish, less dangerous).
-- All use append pattern — order-independent.
-- =============================================================================

-- esp-066 Amanita gemmata
UPDATE species
SET extra_data = jsonb_set(
    COALESCE(extra_data, '{}'::jsonb),
    '{confusions}',
    COALESCE(extra_data->'confusions', '[]'::jsonb) || jsonb_build_array(
        jsonb_build_object('with_species_id', 'esp-056', 'diff', 'A. muscaria tiene forma roja típica, pero su forma amarilla (f. aureola/f. formosa) es muy similar a gemmata. muscaria suele ser mayor, con sombrero más vivo y pie más robusto. Ambas tóxicas (muscimol): síndrome panteriniano con efectos neurológicos.'),
        jsonb_build_object('with_species_id', 'esp-060', 'diff', 'A. pantherina tiene sombrero pardo-grisáceo (no amarillo), anillo estriado por encima y volva con crestas concéntricas. Más tóxica que gemmata — el síndrome panteriniano puede ser grave. Nunca consumir ninguna de las dos.'),
        jsonb_build_object('with_species_id', 'esp-065', 'diff', 'A. citrina tiene sombrero amarillo-limón a blanquecino con olor a patata cruda (harinoso). Anillo amplio colgante, volva en copa bien definida. Menos peligrosa (precaución), pero la confusión con gemmata induce a subestimar el riesgo.')
    )
)
WHERE scientific_name = 'Amanita gemmata';

-- esp-056 Amanita muscaria — añadir bidireccional con gemmata
UPDATE species
SET extra_data = jsonb_set(
    COALESCE(extra_data, '{}'::jsonb),
    '{confusions}',
    COALESCE(extra_data->'confusions', '[]'::jsonb) || jsonb_build_array(
        jsonb_build_object('with_species_id', 'esp-066', 'diff', 'A. gemmata tiene sombrero amarillo-ocre pálido, más pequeña y con pie más frágil. La forma amarilla de muscaria (f. aureola) puede confundirse fácilmente. Ambas tóxicas (muscimol). Verrugas blancas presentes en ambas, fácilmente lavables por la lluvia.')
    )
)
WHERE scientific_name = 'Amanita muscaria';

-- esp-060 Amanita pantherina — añadir bidireccional con gemmata
UPDATE species
SET extra_data = jsonb_set(
    COALESCE(extra_data, '{}'::jsonb),
    '{confusions}',
    COALESCE(extra_data->'confusions', '[]'::jsonb) || jsonb_build_array(
        jsonb_build_object('with_species_id', 'esp-066', 'diff', 'A. gemmata tiene sombrero amarillo-ocre (no pardo-grisáceo), anillo liso y volva simple. Menos tóxica que pantherina, pero nunca consumir. La confusión es posible en ejemplares decolorados o jóvenes.')
    )
)
WHERE scientific_name = 'Amanita pantherina';

-- esp-065 Amanita citrina — añadir bidireccional con gemmata
UPDATE species
SET extra_data = jsonb_set(
    COALESCE(extra_data, '{}'::jsonb),
    '{confusions}',
    COALESCE(extra_data->'confusions', '[]'::jsonb) || jsonb_build_array(
        jsonb_build_object('with_species_id', 'esp-066', 'diff', 'A. gemmata tiene sombrero amarillo más vivo, sin el olor harinoso característico de citrina, y la volva es menos pronunciada. gemmata es más tóxica. En caso de duda, no consumir ninguna.')
    )
)
WHERE scientific_name = 'Amanita citrina';

-- =============================================================================
-- Verificación
-- =============================================================================
SELECT scientific_name, jsonb_array_length(extra_data->'confusions') AS n_confusions
FROM species
WHERE scientific_name IN (
    'Amanita gemmata', 'Amanita muscaria', 'Amanita pantherina', 'Amanita citrina'
)
ORDER BY scientific_name;
