-- Migration 003: Edibility corrections — no_comestible round 2
-- Run in Supabase dashboard → SQL Editor
-- Generated: 2026-03-08
--
-- Sources consulted per species:
--   First Nature, MushroomExpert, Ultimate Mushroom Guide, Wikipedia,
--   ZombieMyco, Asturnatura, Mushroom World
--
-- Changes:
--   2 species: comestible → no_comestible  (sin valor culinario real)
--   1 species: comestible → no_comestible  (técnicamente comible, cero interés gastronómico)
--   1 species: bueno      → comestible     (requiere cocción obligatoria; no merece "bueno")

-- ─── no_comestible ─────────────────────────────────────────────────────────────

-- Pycnoporus cinnabarinus (poliporo bermejo)
-- Textura fibrosa y leñosa imposible de ablandar incluso con cocción prolongada.
-- Sin aroma ni sabor. Uso exclusivo: teñido textil e investigación biotecnológica.
-- Fuentes: First Nature, MushroomExpert, Ultimate Mushroom Guide, Wikipedia
UPDATE species SET edibility = 'no_comestible' WHERE id = 'esp-136';

-- Phlebia radiata (phlebia radiada)
-- Corticiácea con textura crustosa-gelatinosa incomible. No tóxica pero sin
-- utilidad culinaria. Valor solo en biotecnología (degradación de lignina).
-- Fuentes: ZombieMyco, Ultimate Mushroom Guide, Wikipedia, iNaturalist
UPDATE species SET edibility = 'no_comestible' WHERE id = 'esp-139';

-- Hygrophorus pustulatus (higróboro maculado)
-- Técnicamente comible según registros oficiales (Positive List), pero sin aroma
-- ni sabor destacados, textura blanda y gelatinosa. Cero interés gastronómico.
-- Fuentes: Ultimate Mushroom Guide, Mushroom World, GBIF
UPDATE species SET edibility = 'no_comestible' WHERE id = 'esp-143';

-- ─── comestible (bajada desde bueno) ──────────────────────────────────────────

-- Lepista personata (pie violeta / pata violeta)
-- Comestible solo con cocción obligatoria y prolongada; puede causar reacciones
-- alérgicas incluso cocinada en personas sensibles. Riesgo de confusión con
-- Entoloma sinuatum (tóxico). No merece la categoría "bueno".
-- Fuentes: First Nature, ZombieMyco, Asturnatura
UPDATE species SET edibility = 'comestible' WHERE id = 'esp-102';

-- ─── VERIFICATION ─────────────────────────────────────────────────────────────
SELECT id, scientific_name, edibility
FROM species
WHERE id IN ('esp-102', 'esp-136', 'esp-139', 'esp-143')
ORDER BY id;
