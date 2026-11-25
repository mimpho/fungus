-- 049 — esp-035 (Lactarius deliciosus) showed the photos of esp-002 (Boletus aereus).
-- The mock catalogue it was seeded from pointed at the wrong files; the esp-035 files were
-- already in public/assets/images/content/species/. Only touches the row while it still
-- points at esp-002, so it is safe to run twice. Applied by hand in Supabase.

UPDATE species
SET extra_data = extra_data || jsonb_build_object(
  'photo', jsonb_build_object(
    'url',      'assets/images/content/species/esp-035-main.jpg',
    'largeUrl', 'assets/images/content/species/esp-035-main-large.jpg'),
  'photos', jsonb_build_array(
    jsonb_build_object(
      'url',      'assets/images/content/species/esp-035-foto1.jpg',
      'largeUrl', 'assets/images/content/species/esp-035-foto1-large.jpg'),
    jsonb_build_object(
      'url',      'assets/images/content/species/esp-035-foto2.jpg',
      'largeUrl', 'assets/images/content/species/esp-035-foto2-large.jpg'))
)
WHERE id = 'esp-035'
  AND extra_data->'photo'->>'url' = 'assets/images/content/species/esp-002-main.jpg';

-- Check: the two rows, each with its own files
SELECT id, scientific_name,
       extra_data->'photo'->>'url' AS main,
       extra_data->'photos'->0->>'url' AS photo1,
       extra_data->'photos'->1->>'url' AS photo2
FROM species
WHERE id IN ('esp-002', 'esp-035')
ORDER BY id;
