-- =============================================================================
-- 010_confusions_agaricus_campestris.sql — Confusiones Agaricus campestris
-- =============================================================================
-- Gap detectado: A. campestris (el champiñón silvestre más recolectado en España)
-- no tenía confusiones con amanitas mortales, siendo esta una de las
-- intoxicaciones más frecuentes y documentadas.
--
-- IDs verificados en frontend/src/data/species.js:
--   esp-057  Amanita phalloides     (mortal)
--   esp-058  Amanita verna          (mortal)
--   esp-158  Agaricus campestris    (excelente)
--   esp-159  Agaricus silvicola     (comestible)
--   esp-160  Agaricus xanthodermus  (toxico)
--
-- IMPORTANTE — patrón append:
--   Las entradas de phalloides y verna ya existen tras 006_confusions_amanitaceae.sql.
--   Este fichero usa jsonb_set con || para AÑADIR entradas sin sobreescribir
--   las confusiones previas. Aplicar DESPUÉS de 006.
-- =============================================================================


-- =============================================================================
-- esp-158  Agaricus campestris — confusiones nuevas (no existía entrada previa)
-- =============================================================================
UPDATE species
SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-057', 'diff',
    'La confusión más mortal del champiñón silvestre. A. phalloides en botón no tiene laminillas visibles y crece bajo frondosas (nunca en prados abiertos). REGLA: extraer el pie entero. Si hay una volva en forma de saco membranoso en la base = AMANITA MORTAL. A. campestris no tiene volva; el pie nace limpio del suelo. Las laminillas de campestris son rosadas en joven y pardo-oscuras en adulto; phalloides tiene laminillas blancas siempre.'),
  jsonb_build_object('with_species_id', 'esp-058', 'diff',
    'A. verna es totalmente blanca y crece en bosques y bordes, a veces en pastos arborizados. La diferencia más segura: extraer el pie completo. A. verna tiene volva en saco en la base; A. campestris no tiene volva. Laminillas de campestris adulto son pardo-oscuras; las de verna siempre blancas. MORTAL: amatoxinas con síntomas de 6–24h de retraso.'),
  jsonb_build_object('with_species_id', 'esp-160', 'diff',
    'A. xanthodermus es casi idéntico en campo. Diferencias: amarillea intensamente al corte en la base del pie (reacción diagnóstica), tiene olor desagradable a tinta o fenol (especialmente en la cocción) y las laminillas permanecen más tiempo blancas antes de volverse rosadas. A. campestris tiene olor agradable a champiñón y amarillea muy poco. Xanthodermus: tóxico, causa gastroenteritis.')
))
WHERE scientific_name = 'Agaricus campestris';


-- =============================================================================
-- esp-159  Agaricus silvicola — añadir campestris (sin sobreescribir phalloides)
-- =============================================================================
-- silvicola ya tiene confusión con phalloides (de 006); aquí añadimos campestris
-- y xanthodermus para completar el grupo Agaricus.
UPDATE species
SET extra_data = jsonb_set(
    extra_data,
    '{confusions}',
    (extra_data->'confusions') || jsonb_build_array(
      jsonb_build_object('with_species_id', 'esp-158', 'diff',
        'Muy similares. A. silvicola crece en bosques (no prados), tiene sombrero más blanco-sedoso, laminillas que tardan más en oscurecer y olor anisado más pronunciado. A. campestris crece en prados y pastos, tiene laminillas que pasan a rosado intenso rápidamente. Ambos excelentes comestibles.'),
      jsonb_build_object('with_species_id', 'esp-160', 'diff',
        'A. xanthodermus amarillea intensamente en la base del pie al corte y huele a fenol o tinta. A. silvicola puede amarillear ligeramente pero de forma más suave y tiene olor anisado agradable. En caso de duda, cortar la base del pie: amarillo vivo intenso = xanthodermus (tóxico).')
    )
)
WHERE scientific_name = 'Agaricus silvicola'
  AND extra_data ? 'confusions';


-- =============================================================================
-- esp-160  Agaricus xanthodermus — confusiones nuevas (no existía entrada previa)
-- =============================================================================
UPDATE species
SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-158', 'diff',
    'A. campestris no amarillea al corte en la base del pie (o muy levemente) y tiene olor agradable a champiñón. A. xanthodermus amarillea de forma intensa y viva al corte, especialmente en la base del pie, y tiene olor a tinta o fenol que se intensifica con la cocción. El olor es el signo más rápido: si huele a producto químico, no consumir.'),
  jsonb_build_object('with_species_id', 'esp-159', 'diff',
    'A. silvicola tiene olor anisado agradable y amarillea poco. A. xanthodermus huele a fenol (tinta, goma) y amarillea con intensidad en la base del pie. Cortar siempre la base: si el amarillo es vivo y localizado = xanthodermus. La prueba del olor durante la cocción es definitiva.')
))
WHERE scientific_name = 'Agaricus xanthodermus';


-- =============================================================================
-- Append esp-158 (campestris) a las listas existentes de phalloides y verna
-- (006 ya las tiene; aquí se añade campestris sin sobreescribir lo anterior)
-- =============================================================================

-- esp-057  Amanita phalloides — añadir campestris
UPDATE species
SET extra_data = jsonb_set(
    extra_data,
    '{confusions}',
    (extra_data->'confusions') || jsonb_build_array(
      jsonb_build_object('with_species_id', 'esp-158', 'diff',
        'A. campestris crece en prados abiertos, tiene laminillas rosadas (joven) a pardo-oscuras (adulto) y nunca tiene volva. A. phalloides crece bajo frondosas, tiene laminillas siempre blancas y SIEMPRE tiene una volva membranosa en la base del pie. Extraer el pie entero: si hay saco en la base = phalloides (MORTAL). La confusión ocurre sobre todo con botones sin abrir en zonas de borde de bosque y prado.')
    )
)
WHERE scientific_name = 'Amanita phalloides'
  AND extra_data ? 'confusions';

-- esp-058  Amanita verna — añadir campestris
UPDATE species
SET extra_data = jsonb_set(
    extra_data,
    '{confusions}',
    (extra_data->'confusions') || jsonb_build_array(
      jsonb_build_object('with_species_id', 'esp-158', 'diff',
        'A. campestris tiene laminillas que viran de rosado a pardo-oscuro y no tiene volva. A. verna es completamente blanca (laminillas incluidas) y tiene volva membranosa en saco. Nunca recolectar champiñones silvestres blancos sin verificar que las laminillas son rosadas y que no hay volva en la base. Mortal: amatoxinas.')
    )
)
WHERE scientific_name = 'Amanita verna'
  AND extra_data ? 'confusions';


-- =============================================================================
-- Verificación
-- =============================================================================
SELECT scientific_name,
       jsonb_array_length(extra_data->'confusions') AS n_confusions
FROM   species
WHERE  extra_data ? 'confusions'
ORDER  BY scientific_name;
