-- Migration 002: Edibility audit + commonNames fixes
-- Run in Supabase dashboard → SQL Editor
-- Generated: 2026-03-07  (branch: fix/species-synonyms-and-wiki-urls)
--
-- Changes:
--   16 species edibility: comestible/toxico → no_comestible
--   5  species commonNames: Catalan names corrected
--   1  description: Wikipedia URL fixed (es → en)

-- ─── EDIBILITY AUDIT ─────────────────────────────────────────────────────────
-- Species that are not worth eating or cause mild gastroenteritis
UPDATE species SET edibility = 'no_comestible' WHERE id = 'esp-076';  -- Hohenbuehelia petaloides
UPDATE species SET edibility = 'no_comestible' WHERE id = 'esp-109';  -- Rhodotus palmatus
UPDATE species SET edibility = 'no_comestible' WHERE id = 'esp-126';  -- Ganoderma lucidum
UPDATE species SET edibility = 'no_comestible' WHERE id = 'esp-127';  -- Ganoderma applanatum
UPDATE species SET edibility = 'no_comestible' WHERE id = 'esp-129';  -- Fomes fomentarius
UPDATE species SET edibility = 'no_comestible' WHERE id = 'esp-130';  -- Trametes versicolor
UPDATE species SET edibility = 'no_comestible' WHERE id = 'esp-131';  -- Trametes gibbosa
UPDATE species SET edibility = 'no_comestible' WHERE id = 'esp-137';  -- Daedalea quercina
UPDATE species SET edibility = 'no_comestible' WHERE id = 'esp-183';  -- Scleroderma citrinum (was toxico)
UPDATE species SET edibility = 'no_comestible' WHERE id = 'esp-187';  -- Clathrus ruber
UPDATE species SET edibility = 'no_comestible' WHERE id = 'esp-188';  -- Clathrus archeri
UPDATE species SET edibility = 'no_comestible' WHERE id = 'esp-192';  -- Mycena galericulata
UPDATE species SET edibility = 'no_comestible' WHERE id = 'esp-193';  -- Mycena haematopus
UPDATE species SET edibility = 'no_comestible' WHERE id = 'esp-197';  -- Mycena chlorophos
UPDATE species SET edibility = 'no_comestible' WHERE id = 'esp-199';  -- Trametes hirsuta
UPDATE species SET edibility = 'no_comestible' WHERE id = 'esp-200';  -- Xylaria hypoxylon

-- ─── COMMON NAMES — Catalan names corrected ───────────────────────────────────
-- Lycoperdon perlatum: "Bejí comú" → "Pet de llop"
UPDATE species SET
  extra_data = jsonb_set(extra_data, '{commonNames}', '["Bejín común", "Pet de llop"]'::jsonb)
WHERE id = 'esp-181';

-- Lycoperdon pyriforme: "Bejí dels troncs" → "Pet de llop piriforme"
UPDATE species SET
  extra_data = jsonb_set(extra_data, '{commonNames}', '["Bejín de los troncos", "Pet de llop piriforme"]'::jsonb)
WHERE id = 'esp-182';

-- Scleroderma citrinum: "Cuesco de llop" → "Pota de cavall"
UPDATE species SET
  extra_data = jsonb_set(extra_data, '{commonNames}', '["Cuesco de lobo", "Pota de cavall"]'::jsonb)
WHERE id = 'esp-183';

-- Trametes versicolor: "Cua de faisan" → "Cua de gall dindi"
UPDATE species SET
  extra_data = jsonb_set(extra_data, '{commonNames}', '["Cola de pavo real", "Cua de gall dindi"]'::jsonb)
WHERE id = 'esp-130';

-- Laetiporus sulphureus: "Bolet de mel" → "Pollastre del bosc"
UPDATE species SET
  extra_data = jsonb_set(extra_data, '{commonNames}', '["Poliporo azufrado", "Pollastre del bosc"]'::jsonb)
WHERE id = 'esp-128';

-- ─── DESCRIPTION — Scleroderma citrinum Wikipedia URL fix ─────────────────────
-- Replace broken es.wikipedia.org URL with working en.wikipedia.org
UPDATE species SET
  extra_data = jsonb_set(
    extra_data,
    '{description}',
    to_jsonb(replace(
      extra_data->>'description',
      'https://es.wikipedia.org/wiki/Scleroderma_citrinum',
      'https://en.wikipedia.org/wiki/Scleroderma_citrinum'
    ))
  )
WHERE id = 'esp-183';

-- ─── VERIFICATION ─────────────────────────────────────────────────────────────
SELECT id, scientific_name, edibility,
       extra_data->>'commonNames' AS common_names
FROM species
WHERE id IN (
  'esp-076','esp-109','esp-126','esp-127','esp-129','esp-130','esp-131','esp-137',
  'esp-183','esp-187','esp-188','esp-192','esp-193','esp-197','esp-199','esp-200',
  'esp-181','esp-182','esp-128'
)
ORDER BY id;
