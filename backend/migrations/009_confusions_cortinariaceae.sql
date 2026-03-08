-- =============================================================================
-- 009_confusions_cortinariaceae.sql — Confusiones Cortinariaceae
-- =============================================================================
-- IDs verificados en frontend/src/data/species.js:
-- Cortinarius:
--   esp-111  Cortinarius orellanus    (mortal)
--   esp-112  Cortinarius rubellus     (mortal)
--   esp-113  Cortinarius violaceus    (comestible)
--   esp-114  Cortinarius caperatus    (bueno)
--   esp-115  Cortinarius splendens    (mortal)
--   esp-116  Cortinarius praestans    (bueno)
--   esp-117  Cortinarius armeniacus   (toxico)
--   esp-124  Phlegmacium calochroum   (toxico)
--   esp-125  Dermocybe sanguinea      (toxico)
-- Cross-familia:
--   esp-118  Inocybe rimosa           (Inocybaceae — toxico)
--   esp-119  Inocybe erubescens       (Inocybaceae — mortal)
--   esp-120  Hebeloma crustuliniforme (Hymenogastraceae — toxico)
-- =============================================================================
-- AVISO CRÍTICO DE SEGURIDAD:
--   C. orellanus, C. rubellus y C. splendens contienen ORELLANINA (nefrotóxica).
--   Los síntomas de insuficiencia renal aparecen 2–3 SEMANAS después de la
--   ingestión. Para cuando aparecen, el daño renal ya es grave o irreversible.
--   NO hay antídoto específico. Es una de las intoxicaciones micológicas más
--   graves precisamente por el retraso diagnóstico.
--
-- Pares cubiertos:
--   orellanus  ↔ caperatus    (la confusión más mortal documentada)
--   orellanus  ↔ praestans    (ambos robustos pardos)
--   orellanus  ↔ violaceus    (ambos con tonos violáceos/pardos)
--   orellanus  ↔ rubellus     (el par de los mortales)
--   rubellus   ↔ caperatus    (ídem que orellanus ↔ caperatus)
--   rubellus   ↔ orellanus    (bidireccional)
--   splendens  ↔ caperatus    (splendens amarillo, caperatus puede tener tonos amarillos)
--   splendens  ↔ violaceus    (tonos dorados vs violáceos)
--   caperatus  ↔ orellanus    (bidireccional — la más importante)
--   caperatus  ↔ rubellus     (bidireccional)
--   caperatus  ↔ splendens    (bidireccional)
--   praestans  ↔ orellanus    (bidireccional)
--   armeniacus ↔ orellanus    (ambos pardos-oxidados)
-- Cross-familia:
--   caperatus  ↔ erubescens   (ambos pardos con velo)
--   orellanus  ↔ erubescens   (campo: confusión posible)
-- =============================================================================


-- =============================================================================
-- esp-111  Cortinarius orellanus
-- =============================================================================
UPDATE species
SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-114', 'diff',
    'LA CONFUSIÓN MÁS PELIGROSA de la familia. C. caperatus tiene un velo universal que forma arrugas concéntricas en el sombrero y un anillo membranoso persistente en el pie; C. orellanus tiene solo cortina efímera sin anillo real. Orellanina: síntomas de fallo renal con 2–3 semanas de retraso. Sin antídoto.'),
  jsonb_build_object('with_species_id', 'esp-112', 'diff',
    'Ambos mortales con orellanina. C. rubellus tiene sombrero cónico-umbonado de color ocre-naranja a canela rojizo; C. orellanus tiene sombrero convexo-plano más pardo-ocre. Prácticamente indistinguibles en campo sin microscopio; ambos igualmente mortales.'),
  jsonb_build_object('with_species_id', 'esp-116', 'diff',
    'C. praestans es más robusto, con sombrero marrón-violáceo húmedo, cortina violácea bien visible en joven y pie con bulbo apretado. C. orellanus es más grácil y pardo-naranja. Sin embargo la cortina desaparece; ante cualquier Cortinarius pardo sin anillo definitivo, máxima precaución.'),
  jsonb_build_object('with_species_id', 'esp-113', 'diff',
    'C. violaceus es inconfundible en fresco: todo el hongo es violáceo-oscuro intenso (sombrero, láminas, pie, carne). C. orellanus es pardo-naranja a ocre. La confusión solo ocurre con ejemplares viejos o decolorados de C. violaceus; en ese caso no consumir.')
))
WHERE scientific_name = 'Cortinarius orellanus';


-- =============================================================================
-- esp-112  Cortinarius rubellus
-- =============================================================================
UPDATE species
SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-111', 'diff',
    'Ambos mortales con orellanina de efecto retardado (2–3 semanas). C. rubellus tiene sombrero más cónico y color más anaranjado-canela; C. orellanus es más convexo y pardo-ocre. En la práctica no son separables con seguridad en campo. Mortal en ambos casos.'),
  jsonb_build_object('with_species_id', 'esp-114', 'diff',
    'C. caperatus tiene sombrero arrugado concéntricamente, superficie seca y mate, y un anillo membranoso bien definido. C. rubellus tiene sombrero liso-cónico, color ocre-naranja rojizo y solo cortina efímera. Caperatus: bueno. Rubellus: MORTAL. La presencia de anillo real (no cortina) en el pie es el signo de seguridad en caperatus.')
))
WHERE scientific_name = 'Cortinarius rubellus';


-- =============================================================================
-- esp-113  Cortinarius violaceus
-- =============================================================================
UPDATE species
SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-111', 'diff',
    'C. violaceus fresco es completamente violáceo oscuro: sombrero, láminas, pie y carne. C. orellanus es pardo-naranja a ocre sin ningún tono violáceo. La confusión solo existe con ejemplares muy viejos y decolorados. Un Cortinarius que pierda el violeta debe tratarse como desconocido y no consumirse.'),
  jsonb_build_object('with_species_id', 'esp-115', 'diff',
    'C. splendens tiene sombrero amarillo brillante a dorado con tonos oliváceos, muy vistoso. C. violaceus es morado oscuro. Solo en estadios muy degradados o en fotografías mal expuestas puede haber confusión. Splendens: MORTAL (orellanina). Ante cualquier duda en un Cortinarius llamativo, no consumir.')
))
WHERE scientific_name = 'Cortinarius violaceus';


-- =============================================================================
-- esp-114  Cortinarius caperatus  (ex Rozites caperatus — "Gírgola de terra")
-- =============================================================================
UPDATE species
SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-111', 'diff',
    'C. orellanus NO tiene anillo membranoso; solo cortina efímera de hilos. C. caperatus SIEMPRE tiene un anillo membranoso blanco-violáceo persistente y la superficie del sombrero está arrugada concéntricamente (como una pelota de golf). Verificar siempre el anillo antes de recolectar cualquier Cortinarius pardo. C. orellanus: MORTAL (orellanina, retraso 2–3 semanas).'),
  jsonb_build_object('with_species_id', 'esp-112', 'diff',
    'C. rubellus es más esbelto y de color más anaranjado-canela, sin anillo membranoso real (solo cortina efímera). C. caperatus tiene sombrero pardo-ocráceo con arrugas concéntricas y un anillo membranoso bien formado. El anillo es la diferencia de seguridad. C. rubellus: MORTAL.'),
  jsonb_build_object('with_species_id', 'esp-115', 'diff',
    'C. splendens tiene sombrero amarillo brillante a dorado, muy diferente del pardo-ocráceo de caperatus. Ambos tienen anillo o restos velares, pero splendens es amarillo vivo con tonos oliváceos. C. splendens: MORTAL (orellanina). No confundir en campo pero la foto o recuerdo puede confundir.')
))
WHERE scientific_name = 'Cortinarius caperatus';


-- =============================================================================
-- esp-115  Cortinarius splendens
-- =============================================================================
UPDATE species
SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-114', 'diff',
    'C. caperatus tiene sombrero pardo-ocráceo arrugado con anillo blanco-violáceo. C. splendens tiene sombrero amarillo brillante a dorado con láminas y pie amarillo-azufre. Visualmente diferentes en fresco; la confusión ocurre en fotos o con ejemplares muy degradados. C. splendens: MORTAL (orellanina).'),
  jsonb_build_object('with_species_id', 'esp-113', 'diff',
    'C. violaceus es morado oscuro; C. splendens es amarillo dorado. Solo en ejemplares muy envejecidos y decolorados puede producirse confusión. Cualquier Cortinarius de color incierto que no se identifique con seguridad debe descartarse.')
))
WHERE scientific_name = 'Cortinarius splendens';


-- =============================================================================
-- esp-116  Cortinarius praestans
-- =============================================================================
UPDATE species
SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-111', 'diff',
    'C. orellanus es más pequeño y grácil, pardo-naranja uniforme sin tonos violáceos, con cortina efímera. C. praestans es grande y robusto (sombrero hasta 20 cm), con sombrero marrón-violáceo húmedo y visible cortina violácea en joven. Sin embargo, al envejecer praestans pierde el violeta; ante cualquier Cortinarius pardo no reconocible con certeza, no consumir.')
))
WHERE scientific_name = 'Cortinarius praestans';


-- =============================================================================
-- esp-117  Cortinarius armeniacus
-- =============================================================================
UPDATE species
SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-111', 'diff',
    'Ambos pardos a oxidados en tonos ocres-anaranjados. C. armeniacus tiene olor a miel o albaricoque y láminas de color canela-ocráceo en adulto. C. orellanus no tiene ese olor dulce. La distinción no es fiable en campo: ambos son tóxicos (armeniacus) o mortales (orellanus). Ninguno debe consumirse sin identificación experta.')
))
WHERE scientific_name = 'Cortinarius armeniacus';


-- =============================================================================
-- Cross-familia: esp-119  Inocybe erubescens  ↔  Cortinarius caperatus
-- =============================================================================
UPDATE species
SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-114', 'diff',
    'C. caperatus tiene sombrero más grande arrugado-concéntrico y anillo membranoso persistente; I. erubescens tiene sombrero fibriloso-sedoso que enrojece con la edad, sin anillo membranoso (solo cortina efímera). I. erubescens crece en suelos calcáreos con latifolias, contiene muscarina: puede ser mortal. El enrojecimiento de la carne al corte es característico de I. erubescens.'),
  jsonb_build_object('with_species_id', 'esp-111', 'diff',
    'C. orellanus tiene solo cortina efímera y sombrero pardo-naranja seco; I. erubescens tiene sombrero fibriloso que enrojece y carne que enrojece al corte. Ambos tóxicos/mortales y de aspecto similar en campo. El enrojecimiento de I. erubescens es diagnóstico pero solo en adultos.')
))
WHERE scientific_name = 'Inocybe erubescens';


-- =============================================================================
-- Verificación final: debe mostrar todas las filas con confusiones
-- =============================================================================
SELECT scientific_name,
       jsonb_array_length(extra_data->'confusions') AS n_confusions
FROM   species
WHERE  extra_data ? 'confusions'
ORDER  BY scientific_name;
