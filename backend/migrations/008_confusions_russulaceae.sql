-- =============================================================================
-- 008_confusions_russulaceae.sql — Confusiones Russulaceae
-- =============================================================================
-- IDs verificados en frontend/src/data/species.js:
-- Russula:
--   esp-023  Russula virescens     (excelente)
--   esp-024  Russula cyanoxantha   (excelente)
--   esp-025  Russula delica        (comestible)
--   esp-026  Russula emetica       (toxico)
--   esp-027  Russula aurea         (bueno)
--   esp-028  Russula parazurea     (bueno)
--   esp-029  Russula olivacea      (bueno)
--   esp-030  Russula vesca         (bueno)
--   esp-031  Russula foetens       (toxico)
--   esp-032  Russula nigricans     (precaucion)
--   esp-033  Russula xerampelina   (bueno)
--   esp-034  Russula mustelina     (comestible)
--   esp-043  Russula laurocerasi   (toxico)
--   esp-044  Russula pseudointegra (toxico)
-- Lactarius / Lactifluus:
--   esp-035  Lactarius deliciosus  (excelente)
--   esp-036  Lactarius sanguifluus (excelente)
--   esp-037  Lactarius deterrimus  (comestible)
--   esp-038  Lactifluus piperatus  (precaucion)
--   esp-039  Lactarius torminosus  (toxico)
--   esp-040  Lactarius indigo      (comestible)
--   esp-041  Lactarius volemus     (bueno)
--   esp-042  Lactifluus vellereus  (precaucion)
-- =============================================================================
-- Estrategia: cubrir las confusiones con consecuencias de seguridad relevantes.
-- No se cruzan todos los pares posibles dentro de la familia — solo los que
-- un recolector encontraría en campo y podría confundir.
--
-- Pares cubiertos:
--   RUSSULA
--   virescens/cyanoxantha/vesca/aurea ↔ emetica (comestibles vs tóxica)
--   cyanoxantha ↔ virescens            (ambas excelentes, muy similares)
--   delica ↔ vellereus/piperatus       (blancas robustas con látex)
--   foetens ↔ laurocerasi              (ambas tóxicas con olor desagradable)
--   nigricans ↔ grupo                  (grandes y oscurecentes)
--
--   LACTARIUS / LACTIFLUUS
--   deliciosus ↔ sanguifluus           (las dos "níscalos", muy similares)
--   deliciosus ↔ deterrimus            (muy similar, calidad inferior)
--   deliciosus ↔ torminosus            (PELIGROSO: tóxica vs excelente)
--   sanguifluus ↔ deliciosus           (bidireccional)
--   piperatus ↔ vellereus              (blancas acrid-látex, ambas precaución)
--   torminosus ↔ deliciosus            (bidireccional)
-- =============================================================================


-- =============================================================================
-- RUSSULA
-- =============================================================================

-- esp-023  Russula virescens
UPDATE species
SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-026', 'diff',
    'R. emetica tiene sombrero rojo-escarlata brillante (no verdoso-grisáceo areolado). La prueba más fiable: sabor. Un pequeño trozo de lámina de R. emetica es claramente acre-picante; R. virescens tiene sabor suave. Las russulas acres suelen ser tóxicas.'),
  jsonb_build_object('with_species_id', 'esp-024', 'diff',
    'Ambas excelentes. R. cyanoxantha tiene sombrero violáceo-verdoso más uniforme, laminillas flexibles (no frágiles) y sabor dulce. R. virescens tiene el sombrero claramente areolado-cuarteado, característica inconfundible en adulto.')
))
WHERE scientific_name = 'Russula virescens';


-- esp-024  Russula cyanoxantha
UPDATE species
SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-026', 'diff',
    'R. emetica tiene sombrero rojo-escarlata; R. cyanoxantha es violácea-verdosa. La prueba del sabor es definitiva: R. emetica es muy acre en las láminas; R. cyanoxantha tiene sabor dulce o suavemente harinoso. Las russulas con sabor acre son tóxicas.'),
  jsonb_build_object('with_species_id', 'esp-023', 'diff',
    'Ambas excelentes. R. virescens tiene el sombrero claramente cuarteado-areolado en adulto; R. cyanoxantha tiene sombrero liso. Las laminillas de R. cyanoxantha son flexibles y no se rompen con facilidad, característica diagnóstica del género.')
))
WHERE scientific_name = 'Russula cyanoxantha';


-- esp-025  Russula delica
UPDATE species
SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-042', 'diff',
    'Ambas blancas y robustas. L. vellereus tiene látex blanco muy abundante y acrid-ardiente, superficie finamente aterciopelada. R. delica no produce látex (es una Russula, no Lactarius). Si fluye látex al corte → Lactifluus/Lactarius.'),
  jsonb_build_object('with_species_id', 'esp-038', 'diff',
    'Ambas blancas con látex abundante. L. piperatus tiene laminillas muy apretadas y finas, látex acrid-ardiente. R. delica no produce látex. La ausencia de látex distingue siempre una Russula de un Lactarius/Lactifluus.')
))
WHERE scientific_name = 'Russula delica';


-- esp-026  Russula emetica
UPDATE species
SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-027', 'diff',
    'R. aurea tiene sombrero amarillo-naranja a anaranjado con laminillas amarillentas y pie amarillo; R. emetica tiene sombrero rojo puro y laminillas blancas. En ambos casos la prueba del sabor confirma: R. aurea es dulce, R. emetica es muy acre-picante.'),
  jsonb_build_object('with_species_id', 'esp-030', 'diff',
    'R. vesca tiene sombrero rosado-vináceo, no rojo-escarlata brillante; la cutícula se retrae dejando ver las láminas en el borde. Sabor dulce o suavemente harinoso (R. vesca comestible) vs muy acre (R. emetica tóxica). La prueba del sabor es definitiva.'),
  jsonb_build_object('with_species_id', 'esp-023', 'diff',
    'R. virescens tiene sombrero verde-grisáceo areolado, completamente diferente del rojo-escarlata de R. emetica. La confusión ocurre cuando los sombreros están decolorados o sucios. Siempre hacer prueba del sabor: acre = no comer.'),
  jsonb_build_object('with_species_id', 'esp-024', 'diff',
    'R. cyanoxantha tiene sombrero violáceo-verdoso, sabor dulce y laminillas flexibles. R. emetica tiene sombrero rojo brillante, sabor muy acre y laminillas frágiles. La prueba del sabor (pequeño trozo de lámina) es definitiva y sin riesgo.')
))
WHERE scientific_name = 'Russula emetica';


-- esp-027  Russula aurea
UPDATE species
SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-026', 'diff',
    'R. emetica tiene sombrero rojo-escarlata puro con laminillas blancas; R. aurea tiene sombrero amarillo-anaranjado y laminillas amarillas. El sabor confirma: R. aurea es dulce, R. emetica es muy acre. Las russulas amarillo-doradas no suelen ser problemáticas; las rojas piden más precaución.')
))
WHERE scientific_name = 'Russula aurea';


-- esp-030  Russula vesca
UPDATE species
SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-026', 'diff',
    'R. emetica es rojo-escarlata brillante; R. vesca es rosado-vináceo más apagado, con la cutícula que se retrae en el borde dejando ver las láminas blancas. Sabor dulce o suave (R. vesca) vs muy acre-ardiente (R. emetica). La prueba de sabor en las láminas es la comprobación definitiva.')
))
WHERE scientific_name = 'Russula vesca';


-- esp-031  Russula foetens
UPDATE species
SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-043', 'diff',
    'Ambas tóxicas con olor desagradable a laurocerasa/almendra amarga. R. laurocerasi tiene sombrero más ocráceo-miel con láminas que lagrimean gotitas. R. foetens es más amarronada y de mayor tamaño. El olor compartido puede confundirlas; ambas deben evitarse.')
))
WHERE scientific_name = 'Russula foetens';


-- esp-032  Russula nigricans
UPDATE species
SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-025', 'diff',
    'Ambas blancas y robustas en estadio joven. R. nigricans ennegrece progresivamente (primero gris-pardo, luego negro) y tiene laminillas muy espaciadas y gruesas. R. delica permanece blanca. La carne de R. nigricans vira a rojo y luego a negro al corte.')
))
WHERE scientific_name = 'Russula nigricans';


-- esp-043  Russula laurocerasi
UPDATE species
SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-031', 'diff',
    'Ambas tóxicas con olor fuerte a almendra amarga o laurocerasa. R. foetens es más grande y oscura; R. laurocerasi tiene sombrero más ocráceo-miel y láminas con gotitas hialinas características. El olor compartido es confundible; nunca consumir russulas con olor desagradable.')
))
WHERE scientific_name = 'Russula laurocerasi';


-- =============================================================================
-- LACTARIUS / LACTIFLUUS
-- =============================================================================

-- esp-035  Lactarius deliciosus
UPDATE species
SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-036', 'diff',
    'Muy similares. L. sanguifluus tiene látex rojo-vinoso desde el principio (no naranja-zanahoria); carne rojo-vinosa. L. deliciosus tiene látex naranja-zanahoria que puede virar ligeramente a verdoso. Ambos excelentes. El color del látex al corte es la clave.'),
  jsonb_build_object('with_species_id', 'esp-037', 'diff',
    'L. deterrimus es casi idéntico pero el látex es naranja más vivo y vira rápidamente a verde-intenso. Sabor algo más amargo y calidad culinaria inferior. El verdeo rápido del látex y la carne distingue deterrimus de deliciosus.'),
  jsonb_build_object('with_species_id', 'esp-039', 'diff',
    'Confusión peligrosa: L. torminosus tiene sombrero rosado-asalmonado con margen claramente enrollado y peludo-lanoso, y látex BLANCO (nunca naranja). L. deliciosus tiene sombrero naranja zonado y látex naranja. Un níscalo con látex blanco no es L. deliciosus.')
))
WHERE scientific_name = 'Lactarius deliciosus';


-- esp-036  Lactarius sanguifluus
UPDATE species
SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-035', 'diff',
    'L. deliciosus tiene látex naranja-zanahoria (puede verdear levemente); L. sanguifluus tiene látex rojo-vinoso oscuro desde el corte. El sombrero de sanguifluus es más pálido-vináceo, el de deliciosus más naranja-zonado. Ambos excelentes comestibles.'),
  jsonb_build_object('with_species_id', 'esp-037', 'diff',
    'L. deterrimus tiene látex naranja que vira a verde intenso rápidamente; L. sanguifluus tiene látex rojo-vinoso sin verdeo notable. El sabor de deterrimus es más amargo. El color del látex es definitivo.')
))
WHERE scientific_name = 'Lactarius sanguifluus';


-- esp-037  Lactarius deterrimus
UPDATE species
SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-035', 'diff',
    'L. deliciosus tiene látex naranja que verdea poco y lentamente; L. deterrimus tiene látex naranja que vira a verde vivo en pocos minutos. Sabor de deterrimus más amargo. Se acepta como comestible pero de peor calidad; evitar consumo excesivo.'),
  jsonb_build_object('with_species_id', 'esp-036', 'diff',
    'L. sanguifluus tiene látex rojo-vinoso sin verdeo apreciable. L. deterrimus tiene látex naranja con verdeo rápido e intenso. El color del látex al corte es la diferencia más inmediata y fiable.')
))
WHERE scientific_name = 'Lactarius deterrimus';


-- esp-038  Lactifluus piperatus
UPDATE species
SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-042', 'diff',
    'Ambas blancas y robustas con látex blanco acre. L. vellereus tiene superficie claramente aterciopelada y laminillas más espaciadas. L. piperatus tiene superficie lisa y laminillas muy apretadas y finas. Ambas de precaución: látex muy acre en crudo; requieren cocción prolongada si se consumen.')
))
WHERE scientific_name = 'Lactifluus piperatus';


-- esp-039  Lactarius torminosus
UPDATE species
SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-035', 'diff',
    'Diferencias clave: L. torminosus tiene el margen del sombrero enrollado y densamente peludo-lanoso, color rosado-asalmonado con zonas concéntricas, y látex BLANCO acre. L. deliciosus tiene sombrero zonado naranja, margen poco enrollado y látex NARANJA. Látex blanco en un supuesto níscalo: señal de alarma.')
))
WHERE scientific_name = 'Lactarius torminosus';


-- esp-041  Lactarius volemus
UPDATE species
SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-038', 'diff',
    'L. piperatus es blanco puro sin zonas; L. volemus tiene sombrero ocráceo-naranja rojizo y látex blanco muy abundante que no es acre sino dulce con olor a arenque. El olor característico a pescado de L. volemus es inconfundible en adultos.')
))
WHERE scientific_name = 'Lactarius volemus';


-- esp-042  Lactifluus vellereus
UPDATE species
SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-038', 'diff',
    'Ambas blancas con látex blanco acre. L. piperatus tiene superficie lisa y laminillas muy apretadas; L. vellereus tiene superficie aterciopelada al tacto y laminillas más espaciadas. Ambas de precaución: muy acres en crudo. Se usan encurtidas en Europa del Este pero requieren tratamiento previo.'),
  jsonb_build_object('with_species_id', 'esp-025', 'diff',
    'R. delica no produce látex (es Russula). L. vellereus produce látex blanco abundante al corte. Comprimir una lámina: si fluye líquido lechoso = Lactifluus/Lactarius. Esta diferencia es definitiva e inmediata.')
))
WHERE scientific_name = 'Lactifluus vellereus';


-- =============================================================================
-- Verificación
-- =============================================================================
SELECT scientific_name,
       jsonb_array_length(extra_data->'confusions') AS n_confusions
FROM   species
WHERE  extra_data ? 'confusions'
ORDER  BY scientific_name;
