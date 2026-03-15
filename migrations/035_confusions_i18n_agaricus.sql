-- =============================================================================
-- 035_confusions_i18n_agaricus.sql
-- Adds diff_ca / diff_en to all confusion entries from 010_confusions_agaricus_campestris.sql
-- Full replacement per species.
--
-- NOTE: Amanita phalloides (esp-057) and Amanita verna (esp-058) were already
-- fully replaced in 031_confusions_i18n_amanitaceae.sql INCLUDING the campestris
-- entry — so they are NOT updated here.
--
-- Agaricus silvicola (esp-159) was also partially updated in 031 (phalloides entry).
-- Here we do a FULL REPLACEMENT including all 3 entries:
--   phalloides (from 006), campestris (from 010), xanthodermus (from 010).
-- =============================================================================

-- esp-158  Agaricus campestris (new: no confusions existed before 010)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-057',
    'diff',    'La confusión más mortal del champiñón silvestre. A. phalloides en botón no tiene laminillas visibles y crece bajo frondosas (nunca en prados abiertos). REGLA: extraer el pie entero. Si hay una volva en forma de saco membranoso en la base = AMANITA MORTAL. A. campestris no tiene volva; el pie nace limpio del suelo. Las laminillas de campestris son rosadas en joven y pardo-oscuras en adulto; phalloides tiene laminillas blancas siempre.',
    'diff_ca', 'La confusió més mortal del xampinyó silvestre. A. phalloides en botó no té làmines visibles i creix sota frondoses (mai en prats oberts). REGLA: extreure el peu sencer. Si hi ha una volva en forma de sac membranós a la base = AMANITA MORTAL. A. campestris no té volva; el peu neix net del terra. Les làmines de campestris són rosades en jove i marró-fosques en adult; phalloides té làmines blanques sempre.',
    'diff_en', 'The most deadly confusion of the wild mushroom. A. phalloides in button stage has no visible gills and grows under hardwoods (never in open meadows). RULE: extract the full stem. If there is a membranous sac-shaped volva at the base = DEADLY AMANITA. A. campestris has no volva; the stem emerges clean from the soil. Campestris gills are pink when young and dark brown when adult; phalloides always has white gills.'),
  jsonb_build_object('with_species_id', 'esp-058',
    'diff',    'A. verna es totalmente blanca y crece en bosques y bordes, a veces en pastos arborizados. La diferencia más segura: extraer el pie completo. A. verna tiene volva en saco en la base; A. campestris no tiene volva. Laminillas de campestris adulto son pardo-oscuras; las de verna siempre blancas. MORTAL: amatoxinas con síntomas de 6–24h de retraso.',
    'diff_ca', 'A. verna és totalment blanca i creix en boscos i vores, de vegades en pastures arborades. La diferència més segura: extreure el peu complet. A. verna té volva en sac a la base; A. campestris no té volva. Làmines de campestris adult son marró-fosques; les de verna sempre blanques. MORTAL: amatoxines amb símptomes de 6–24h de retard.',
    'diff_en', 'A. verna is completely white and grows in forests and edges, sometimes in wooded pastures. The safest difference: extract the complete stem. A. verna has a sac volva at the base; A. campestris has no volva. Adult campestris gills are dark brown; those of verna always white. DEADLY: amatoxins with symptoms delayed 6–24h.'),
  jsonb_build_object('with_species_id', 'esp-160',
    'diff',    'A. xanthodermus es casi idéntico en campo. Diferencias: amarillea intensamente al corte en la base del pie (reacción diagnóstica), tiene olor desagradable a tinta o fenol (especialmente en la cocción) y las laminillas permanecen más tiempo blancas antes de volverse rosadas. A. campestris tiene olor agradable a champiñón y amarillea muy poco. Xanthodermus: tóxico, causa gastroenteritis.',
    'diff_ca', 'A. xanthodermus és gairebé idèntic en camp. Diferències: groga intensament al tall a la base del peu (reacció diagnòstica), té olor desagradable a tinta o fenol (especialment en la cocció) i les làmines romanen més temps blanques abans de tornar-se rosades. A. campestris té olor agradable a xampinyó i groga molt poc. Xanthodermus: tòxic, causa gastroenteritis.',
    'diff_en', 'A. xanthodermus is almost identical in the field. Differences: yellows intensely when cut at the stem base (diagnostic reaction), has an unpleasant ink or phenol smell (especially when cooking), and gills remain white longer before turning pink. A. campestris has a pleasant mushroom smell and barely yellows. Xanthodermus: toxic, causes gastroenteritis.')
)) WHERE scientific_name = 'Agaricus campestris';

-- esp-159  Agaricus silvicola — FULL REPLACEMENT (includes phalloides from 006/031 + campestris + xanthodermus from 010)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-057',
    'diff',    'A. phalloides en estadio de ovo puede recordar a un champiñón del bosque en botón. Diferencia definitiva: extraer el pie entero. Si hay una volva en forma de saco en la base = AMANITA (potencialmente mortal). Agaricus silvicola no tiene volva, pero sí anillo y base del pie libre.',
    'diff_ca', 'A. phalloides en estadi d''ou pot recordar un xampinyó del bosc en botó. Diferència definitiva: extreure el peu sencer. Si hi ha una volva en forma de sac a la base = AMANITA (potencialment mortal). Agaricus silvicola no té volva, però sí anell i base del peu lliure.',
    'diff_en', 'A. phalloides in egg stage can resemble a wood mushroom in button stage. Definitive difference: extract the full stem. If there is a sac-shaped volva at the base = AMANITA (potentially deadly). Agaricus silvicola has no volva, but does have a ring and free stem base.'),
  jsonb_build_object('with_species_id', 'esp-158',
    'diff',    'Muy similares. A. silvicola crece en bosques (no prados), tiene sombrero más blanco-sedoso, laminillas que tardan más en oscurecer y olor anisado más pronunciado. A. campestris crece en prados y pastos, tiene laminillas que pasan a rosado intenso rápidamente. Ambos excelentes comestibles.',
    'diff_ca', 'Molt similars. A. silvicola creix en boscos (no prats), té barret més blanc-sedós, làmines que tarden més a enfosquir-se i olor anisada més pronunciada. A. campestris creix en prats i pastures, té làmines que passen a rosat intens ràpidament. Ambdós excel·lents comestibles.',
    'diff_en', 'Very similar. A. silvicola grows in forests (not meadows), has a more white-silky cap, gills that take longer to darken, and a more pronounced anise smell. A. campestris grows in meadows and pastures, has gills that quickly turn intense pink. Both excellent edibles.'),
  jsonb_build_object('with_species_id', 'esp-160',
    'diff',    'A. xanthodermus amarillea intensamente en la base del pie al corte y huele a fenol o tinta. A. silvicola puede amarillear ligeramente pero de forma más suave y tiene olor anisado agradable. En caso de duda, cortar la base del pie: amarillo vivo intenso = xanthodermus (tóxico).',
    'diff_ca', 'A. xanthodermus groga intensament a la base del peu al tall i fa olor a fenol o tinta. A. silvicola pot groguejar lleugerament però de forma més suau i té olor anisada agradable. En cas de dubte, tallar la base del peu: groc viu intens = xanthodermus (tòxic).',
    'diff_en', 'A. xanthodermus yellows intensely at the stem base when cut and smells of phenol or ink. A. silvicola may yellow slightly but more gently and has a pleasant anise smell. When in doubt, cut the stem base: vivid intense yellow = xanthodermus (toxic).')
)) WHERE scientific_name = 'Agaricus silvicola';

-- esp-160  Agaricus xanthodermus (new: no confusions existed before 010)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-158',
    'diff',    'A. campestris no amarillea al corte en la base del pie (o muy levemente) y tiene olor agradable a champiñón. A. xanthodermus amarillea de forma intensa y viva al corte, especialmente en la base del pie, y tiene olor a tinta o fenol que se intensifica con la cocción. El olor es el signo más rápido: si huele a producto químico, no consumir.',
    'diff_ca', 'A. campestris no groga al tall a la base del peu (o molt lleugerament) i té olor agradable a xampinyó. A. xanthodermus groga de forma intensa i viva al tall, especialment a la base del peu, i té olor a tinta o fenol que s''intensifica amb la cocció. L''olor és el senyal més ràpid: si fa olor a producte químic, no consumir.',
    'diff_en', 'A. campestris does not yellow when cut at the stem base (or very slightly) and has a pleasant mushroom smell. A. xanthodermus yellows intensely and vividly when cut, especially at the stem base, and smells of ink or phenol that intensifies when cooking. The smell is the quickest sign: if it smells of chemicals, do not consume.'),
  jsonb_build_object('with_species_id', 'esp-159',
    'diff',    'A. silvicola tiene olor anisado agradable y amarillea poco. A. xanthodermus huele a fenol (tinta, goma) y amarillea con intensidad en la base del pie. Cortar siempre la base: si el amarillo es vivo y localizado = xanthodermus. La prueba del olor durante la cocción es definitiva.',
    'diff_ca', 'A. silvicola té olor anisada agradable i groga poc. A. xanthodermus fa olor a fenol (tinta, goma) i groga amb intensitat a la base del peu. Tallar sempre la base: si el groc és viu i localitzat = xanthodermus. La prova de l''olor durant la cocció és definitiva.',
    'diff_en', 'A. silvicola has a pleasant anise smell and yellows little. A. xanthodermus smells of phenol (ink, rubber) and yellows intensely at the stem base. Always cut the base: if the yellow is vivid and localized = xanthodermus. The smell test during cooking is definitive.')
)) WHERE scientific_name = 'Agaricus xanthodermus';

-- =============================================================================
-- Verificación
-- =============================================================================
SELECT scientific_name,
       jsonb_array_length(extra_data->'confusions') AS n_confusions
FROM   species
WHERE  scientific_name IN (
  'Agaricus campestris', 'Agaricus silvicola', 'Agaricus xanthodermus'
)
ORDER  BY scientific_name;
