-- audit_cond_fruct.sql
-- Auditoría de migraciones 004-014 (cond_fruct)
-- Generado: 2026-03-14
-- Ejecutar en Supabase SQL Editor
--
-- IDs esperados por familia (fuente: mock / BD):
-- Boletaceae (21 sp): esp-001, esp-002, esp-003, esp-004, esp-005, esp-006, esp-007, esp-008, esp-009, esp-010, esp-011, esp-012, esp-013, esp-014, esp-015, esp-016, esp-017, esp-018, esp-019, esp-021, esp-201
-- Amanitaceae (15 sp): esp-055, esp-056, esp-057, esp-058, esp-059, esp-060, esp-061, esp-062, esp-063, esp-064, esp-065, esp-066, esp-067, esp-068, esp-069
-- Russulaceae (22 sp): esp-023, esp-024, esp-025, esp-026, esp-027, esp-028, esp-029, esp-030, esp-031, esp-032, esp-033, esp-034, esp-035, esp-036, esp-037, esp-038, esp-039, esp-040, esp-041, esp-042, esp-043, esp-044
-- Cantharellaceae (7 sp): esp-045, esp-046, esp-047, esp-048, esp-049, esp-050, esp-054
-- Morchellaceae (4 sp): esp-078, esp-079, esp-080, esp-081
-- Pleurotaceae (5 sp): esp-070, esp-071, esp-072, esp-073, esp-076
-- Agaricaceae (12 sp): esp-158, esp-159, esp-160, esp-161, esp-162, esp-163, esp-164, esp-165, esp-180, esp-181, esp-182, esp-184
-- Cortinariaceae (9 sp): esp-111, esp-112, esp-113, esp-114, esp-115, esp-116, esp-117, esp-124, esp-125
-- Polyporaceae (9 sp): esp-077, esp-128, esp-129, esp-130, esp-131, esp-135, esp-136, esp-137, esp-199
-- Strophariaceae (9 sp): esp-148, esp-149, esp-150, esp-151, esp-152, esp-153, esp-154, esp-156, esp-157
-- Tricholomataceae (11 sp): esp-090, esp-091, esp-092, esp-093, esp-094, esp-097, esp-098, esp-099, esp-100, esp-101, esp-102
-- Total: 124 especies

-- ══════════════════════════════════════════════════════════
-- PARTE 1: Estado de cada especie esperada
--
-- tiene_cond = false  → especie que no recibió la migración
-- family incorrecto   → ID alucinado por Gemini (el UPDATE
--                       aplicó datos de otra especie)
-- ══════════════════════════════════════════════════════════

SELECT
  id,
  scientific_name,
  family,
  extra_data ? 'cond_temp_es'           AS tiene_cond,
  left(extra_data->>'cond_temp_es', 70) AS preview_es
FROM species
WHERE id IN (
    'esp-001',
    'esp-002',
    'esp-003',
    'esp-004',
    'esp-005',
    'esp-006',
    'esp-007',
    'esp-008',
    'esp-009',
    'esp-010',
    'esp-011',
    'esp-012',
    'esp-013',
    'esp-014',
    'esp-015',
    'esp-016',
    'esp-017',
    'esp-018',
    'esp-019',
    'esp-021',
    'esp-201',
    'esp-055',
    'esp-056',
    'esp-057',
    'esp-058',
    'esp-059',
    'esp-060',
    'esp-061',
    'esp-062',
    'esp-063',
    'esp-064',
    'esp-065',
    'esp-066',
    'esp-067',
    'esp-068',
    'esp-069',
    'esp-023',
    'esp-024',
    'esp-025',
    'esp-026',
    'esp-027',
    'esp-028',
    'esp-029',
    'esp-030',
    'esp-031',
    'esp-032',
    'esp-033',
    'esp-034',
    'esp-035',
    'esp-036',
    'esp-037',
    'esp-038',
    'esp-039',
    'esp-040',
    'esp-041',
    'esp-042',
    'esp-043',
    'esp-044',
    'esp-045',
    'esp-046',
    'esp-047',
    'esp-048',
    'esp-049',
    'esp-050',
    'esp-054',
    'esp-078',
    'esp-079',
    'esp-080',
    'esp-081',
    'esp-070',
    'esp-071',
    'esp-072',
    'esp-073',
    'esp-076',
    'esp-158',
    'esp-159',
    'esp-160',
    'esp-161',
    'esp-162',
    'esp-163',
    'esp-164',
    'esp-165',
    'esp-180',
    'esp-181',
    'esp-182',
    'esp-184',
    'esp-111',
    'esp-112',
    'esp-113',
    'esp-114',
    'esp-115',
    'esp-116',
    'esp-117',
    'esp-124',
    'esp-125',
    'esp-077',
    'esp-128',
    'esp-129',
    'esp-130',
    'esp-131',
    'esp-135',
    'esp-136',
    'esp-137',
    'esp-199',
    'esp-148',
    'esp-149',
    'esp-150',
    'esp-151',
    'esp-152',
    'esp-153',
    'esp-154',
    'esp-156',
    'esp-157',
    'esp-090',
    'esp-091',
    'esp-092',
    'esp-093',
    'esp-094',
    'esp-097',
    'esp-098',
    'esp-099',
    'esp-100',
    'esp-101',
    'esp-102'
)
ORDER BY family, id;


-- ══════════════════════════════════════════════════════════
-- PARTE 2: Daño colateral — especies contaminadas
--
-- Tienen cond_temp_es pero su familia NO está entre
-- las migraciones aplicadas → ID alucinado les escribió
-- encima datos incorrectos.
-- Resultado vacío = migraciones limpias.
-- ══════════════════════════════════════════════════════════

SELECT
  id,
  scientific_name,
  family,
  left(extra_data->>'cond_temp_es', 100) AS cond_temp_contaminada
FROM species
WHERE
  extra_data ? 'cond_temp_es'
  AND family NOT IN (
    'Boletaceae',
    'Amanitaceae',
    'Russulaceae',
    'Cantharellaceae',
    'Morchellaceae',
    'Pleurotaceae',
    'Agaricaceae',
    'Cortinariaceae',
    'Polyporaceae',
    'Strophariaceae',
    'Tricholomataceae'
  )
ORDER BY family, id;

