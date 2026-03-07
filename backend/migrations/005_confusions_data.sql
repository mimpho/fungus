-- =============================================================================
-- Species Confusions Migration
-- =============================================================================
-- Run this SQL after migrating the schema to populate confusions.
-- Each confusion points to another species with a diff explanation.
-- Bidirectional: if A confuses with B, we also add B confuses with A.
-- =============================================================================

-- Morchellaceae: Morchella, Gyromitra, Helvella, Verpa
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', 
  ARRAY[
    jsonb_build_object('with_species_id', 'esp-082', 'diff', 'Sombrero alveolado (celdillas) vs cerebriforme (Gyromitra). Las crestas son más oscuras que las fosas en Morchella.'),
    jsonb_build_object('with_species_id', 'esp-083', 'diff', 'Sombrero alveolado vs lobulado gris-negro. Morchella tiene crestas y fosas; Helvella tiene lóbulos.acampanado.')
  ]
) WHERE scientific_name = 'Morchella esculenta';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', 
  ARRAY[
    jsonb_build_object('with_species_id', 'esp-081', 'diff', 'Sombrero cerebriforme (irregular) vs alveolado (celdillas). Gyromitra es mortal, Morchella excelente.'),
    jsonb_build_object('with_species_id', 'esp-083', 'diff', 'Ambas tienen sombrero lobulado/irregular. Gyromitra es mortal (marrón-rojizo), Helvella precaución (gris-negro).')
  ]
) WHERE scientific_name = 'Gyromitra esculenta';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', 
  ARRAY[
    jsonb_build_object('with_species_id', 'esp-081', 'diff', 'Sombrero lobulado gris-negro. Contiene giromitrinas; siempre cocinar. Se confunde con Gyromitra esculenta (mortal).'),
    jsonb_build_object('with_species_id', 'esp-081', 'diff', 'Sombrero lobulado vs cerebriforme. Gyromitra es marrón-rojiza y mortal; Helvella es gris-negra y de precaución.')
  ]
) WHERE scientific_name = 'Helvella lacunosa';

-- Boletaceae: Boletus edulis and toxic cousins
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', 
  ARRAY[
    jsonb_build_object('with_species_id', 'esp-030', 'diff', 'Poros blancos→amarillo-verdosos vs poros anaranjados. No azulea al corte.'),
    jsonb_build_object('with_species_id', 'esp-028', 'diff', 'Poros blancos→amarillo vs poros rojos. Retículo en pie solo en B. satanas.')
  ]
) WHERE scientific_name = 'Boletus edulis';

-- Verify
SELECT scientific_name, extra_data->>'confusions' as confusions
FROM species 
WHERE extra_data ? 'confusions'
LIMIT 5;
