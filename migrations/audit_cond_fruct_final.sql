-- audit_cond_fruct_final.sql
-- Auditoría COMPLETA cond_fruct — todas las familias (202 especies)
-- Ejecutar tras aplicar todas las migraciones B1/B2/B2a/C
-- Generado: 2026-03-14
--
-- Familias y especies esperadas:
--   Russulaceae                     22 sp  (esp-023, esp-024, esp-025...)
--   Boletaceae                      21 sp  (esp-001, esp-002, esp-003...)
--   Amanitaceae                     15 sp  (esp-055, esp-056, esp-057...)
--   Agaricaceae                     12 sp  (esp-158, esp-159, esp-160...)
--   Tricholomataceae                11 sp  (esp-090, esp-091, esp-092...)
--   Polyporaceae                     9 sp  (esp-077, esp-128, esp-129...)
--   Cortinariaceae                   9 sp  (esp-111, esp-112, esp-113...)
--   Strophariaceae                   9 sp  (esp-148, esp-149, esp-150...)
--   Hygrophoraceae                   8 sp  (esp-140, esp-141, esp-142...)
--   Cantharellaceae                  7 sp  (esp-045, esp-046, esp-047...)
--   Physalacriaceae                  6 sp  (esp-103, esp-104, esp-109...)
--   Psathyrellaceae                  6 sp  (esp-166, esp-167, esp-168...)
--   Pleurotaceae                     5 sp  (esp-070, esp-071, esp-072...)
--   Entolomataceae                   5 sp  (esp-105, esp-106, esp-107...)
--   Hymenogastraceae                 5 sp  (esp-120, esp-121, esp-122...)
--   Bankeraceae                      5 sp  (esp-174, esp-175, esp-176...)
--   Phallaceae                       5 sp  (esp-185, esp-186, esp-187...)
--   Morchellaceae                    4 sp  (esp-078, esp-079, esp-080...)
--   Helvellaceae                     3 sp  (esp-083, esp-084, esp-085)
--   Tuberaceae                       3 sp  (esp-086, esp-087, esp-088)
--   Mycenaceae                       3 sp  (esp-192, esp-193, esp-197)
--   Tapinellaceae                    2 sp  (esp-020, esp-022)
--   Hydnaceae                        2 sp  (esp-051, esp-052)
--   Omphalotaceae                    2 sp  (esp-074, esp-075)
--   Lyophyllaceae                    2 sp  (esp-095, esp-096)
--   Inocybaceae                      2 sp  (esp-118, esp-119)
--   Ganodermataceae                  2 sp  (esp-126, esp-127)
--   Meripilaceae                     2 sp  (esp-132, esp-133)
--   Hericiaceae                      2 sp  (esp-172, esp-173)
--   Marasmiaceae                     2 sp  (esp-190, esp-191)
--   Gomphaceae                       1 sp  (esp-053)
--   Discinaceae                      1 sp  (esp-082)
--   Pezizaceae                       1 sp  (esp-089)
--   Sparassidaceae                   1 sp  (esp-134)
--   Fistulinaceae                    1 sp  (esp-138)
--   Meruliaceae                      1 sp  (esp-139)
--   Auriscalpiaceae                  1 sp  (esp-179)
--   Sclerodermataceae                1 sp  (esp-183)
--   Auriculariaceae                  1 sp  (esp-198)
--   Xylariaceae                      1 sp  (esp-200)
--   Gomphidiaceae                    1 sp  (esp-202)
-- Total: 202 especies

-- ════════════════════════════════════════════════════════════
-- QUERY 1: Resumen por familia
-- Muestra cuántas especies tienen cond_fruct vs cuántas faltan
-- Resultado ideal: faltantes = 0 en todas las filas
-- ════════════════════════════════════════════════════════════

SELECT
  family,
  COUNT(*)                                              AS total_sp,
  COUNT(*) FILTER (WHERE extra_data ? 'cond_temp_es')  AS con_cond,
  COUNT(*) FILTER (WHERE NOT (extra_data ? 'cond_temp_es')
                   OR extra_data IS NULL)               AS sin_cond
FROM species
GROUP BY family
ORDER BY sin_cond DESC, family;


-- ════════════════════════════════════════════════════════════
-- QUERY 2: Especies sin cond_fruct (deberían ser 0)
-- Si aparecen filas → faltaron en alguna migración
-- ════════════════════════════════════════════════════════════

SELECT id, scientific_name, family
FROM species
WHERE NOT (extra_data ? 'cond_temp_es')
   OR extra_data IS NULL
ORDER BY family, id;


-- ════════════════════════════════════════════════════════════
-- QUERY 3: Verificación de contenido — muestra preview de
-- todas las especies para detectar datos cruzados
-- (ordenar por family permite detectar anomalías visualmente)
-- ════════════════════════════════════════════════════════════

SELECT
  id,
  scientific_name,
  family,
  left(extra_data->>'cond_temp_es', 80)  AS cond_temp_es,
  left(extra_data->>'cond_temp_ca', 60)  AS cond_temp_ca
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
    'esp-020',
    'esp-021',
    'esp-022',
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
    'esp-051',
    'esp-052',
    'esp-053',
    'esp-054',
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
    'esp-070',
    'esp-071',
    'esp-072',
    'esp-073',
    'esp-074',
    'esp-075',
    'esp-076',
    'esp-077',
    'esp-078',
    'esp-079',
    'esp-080',
    'esp-081',
    'esp-082',
    'esp-083',
    'esp-084',
    'esp-085',
    'esp-086',
    'esp-087',
    'esp-088',
    'esp-089',
    'esp-090',
    'esp-091',
    'esp-092',
    'esp-093',
    'esp-094',
    'esp-095',
    'esp-096',
    'esp-097',
    'esp-098',
    'esp-099',
    'esp-100',
    'esp-101',
    'esp-102',
    'esp-103',
    'esp-104',
    'esp-105',
    'esp-106',
    'esp-107',
    'esp-108',
    'esp-109',
    'esp-110',
    'esp-111',
    'esp-112',
    'esp-113',
    'esp-114',
    'esp-115',
    'esp-116',
    'esp-117',
    'esp-118',
    'esp-119',
    'esp-120',
    'esp-121',
    'esp-122',
    'esp-123',
    'esp-124',
    'esp-125',
    'esp-126',
    'esp-127',
    'esp-128',
    'esp-129',
    'esp-130',
    'esp-131',
    'esp-132',
    'esp-133',
    'esp-134',
    'esp-135',
    'esp-136',
    'esp-137',
    'esp-138',
    'esp-139',
    'esp-140',
    'esp-141',
    'esp-142',
    'esp-143',
    'esp-144',
    'esp-145',
    'esp-146',
    'esp-147',
    'esp-148',
    'esp-149',
    'esp-150',
    'esp-151',
    'esp-152',
    'esp-153',
    'esp-154',
    'esp-155',
    'esp-156',
    'esp-157',
    'esp-158',
    'esp-159',
    'esp-160',
    'esp-161',
    'esp-162',
    'esp-163',
    'esp-164',
    'esp-165',
    'esp-166',
    'esp-167',
    'esp-168',
    'esp-169',
    'esp-170',
    'esp-171',
    'esp-172',
    'esp-173',
    'esp-174',
    'esp-175',
    'esp-176',
    'esp-177',
    'esp-178',
    'esp-179',
    'esp-180',
    'esp-181',
    'esp-182',
    'esp-183',
    'esp-184',
    'esp-185',
    'esp-186',
    'esp-187',
    'esp-188',
    'esp-189',
    'esp-190',
    'esp-191',
    'esp-192',
    'esp-193',
    'esp-194',
    'esp-195',
    'esp-196',
    'esp-197',
    'esp-198',
    'esp-199',
    'esp-200',
    'esp-201',
    'esp-202'
)
ORDER BY family, id;


-- ════════════════════════════════════════════════════════════
-- QUERY 4: Detección de IDs con datos de familia incorrecta
-- Cruza el nombre del texto con la familia de la especie.
-- Señales de alerta: texto menciona árbol/hábitat incompatible
-- con la familia (ej: "pinar" en Phallaceae).
-- Esta query hay que revisarla manualmente, no es automática.
-- ════════════════════════════════════════════════════════════

SELECT
  id,
  scientific_name,
  family,
  extra_data->>'cond_req_es' AS cond_req_es
FROM species
WHERE extra_data ? 'cond_req_es'
ORDER BY family, id;

