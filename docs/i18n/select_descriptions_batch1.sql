-- Extraer scientific_name + description de Boletaceae y Russulaceae
-- description está en extra_data JSONB

SELECT
    scientific_name,
    extra_data->>'description' AS description
FROM species
WHERE family IN ('Boletaceae', 'Russulaceae')
  AND extra_data->>'description' IS NOT NULL
ORDER BY family, scientific_name;
