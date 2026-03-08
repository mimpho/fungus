-- =============================================================================
-- 006_confusions_amanitaceae.sql — Confusiones Amanitaceae
-- =============================================================================
-- IDs verificados en frontend/src/data/species.js:
--   esp-055  Amanita caesarea      (excelente)
--   esp-056  Amanita muscaria      (toxico)
--   esp-057  Amanita phalloides    (mortal)
--   esp-058  Amanita verna         (mortal)
--   esp-059  Amanita virosa        (mortal)
--   esp-060  Amanita pantherina    (toxico)
--   esp-061  Amanita rubescens     (comestible)
--   esp-062  Amanita ovoidea       (precaucion)
--   esp-063  Amanita spissa        (precaucion)
--   esp-065  Amanita citrina       (precaucion)
--   esp-069  Amanita excelsa       (precaucion)
-- Cross-familia:
--   esp-159  Agaricus silvicola    (comestible)
--   esp-165  Leucoagaricus leucothites (comestible)
-- =============================================================================
-- Pares cubiertos:
--   caesarea  ↔ muscaria    (confusión por ovo rojo)
--   caesarea  ↔ phalloides  (confusión ovo — la más peligrosa)
--   phalloides ↔ verna      (trío mortal — todas con amatoxinas)
--   phalloides ↔ virosa     (trío mortal)
--   phalloides ↔ citrina    (amanitas pálidas/verdosas)
--   phalloides ↔ silvicola  (cross-familia: botón sin volva vs ovo)
--   verna     ↔ virosa      (trío mortal)
--   verna     ↔ ovoidea     (amanitas blancas primaverales)
--   verna     ↔ leucothites (cross-familia: blancas sin anillo)
--   pantherina ↔ rubescens  (confusión clásica y peligrosa)
--   pantherina ↔ excelsa    (casi idénticas)
--   pantherina ↔ spissa     (ídem, muy similares)
--   rubescens  ↔ excelsa    (pardas con verrugas)
-- =============================================================================


-- =============================================================================
-- esp-055  Amanita caesarea
-- =============================================================================
UPDATE species
SET extra_data = jsonb_set(
    COALESCE(extra_data, '{}'::jsonb),
    '{confusions}',
    COALESCE(extra_data->'confusions', '[]'::jsonb) || jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-056', 'diff',
    'En estadio de ovo ambas tienen la envoltura roja. A. muscaria desarrolla sombrero rojo-escarlata con verrugas blancas, laminillas y pie blancos. A. caesarea tiene laminillas y pie amarillo-dorados. Muscaria: tóxica (no mortal).'),
  jsonb_build_object('with_species_id', 'esp-057', 'diff',
    'El ovo de A. phalloides puede ser blanco o ligeramente verdoso por fuera, parecido al de caesarea. Regla: cortar el ovo longitudinalmente. Interior amarillo brillante = caesarea. Interior blanco o verdoso = posible phalloides. MORTAL. Sin este corte, no recolectar ovos.')
    )
)
WHERE scientific_name = 'Amanita caesarea';


-- =============================================================================
-- esp-056  Amanita muscaria
-- =============================================================================
UPDATE species
SET extra_data = jsonb_set(
    COALESCE(extra_data, '{}'::jsonb),
    '{confusions}',
    COALESCE(extra_data->'confusions', '[]'::jsonb) || jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-055', 'diff',
    'A. caesarea tiene sombrero naranja-rojizo sin escamas blancas (o muy pocas), volva en forma de copa abierta amarillenta, laminillas y pie amarillo-dorados. El ovo siempre amarillo por dentro. Excelente comestible.')
    )
)
WHERE scientific_name = 'Amanita muscaria';


-- =============================================================================
-- esp-057  Amanita phalloides
-- =============================================================================
UPDATE species
SET extra_data = jsonb_set(
    COALESCE(extra_data, '{}'::jsonb),
    '{confusions}',
    COALESCE(extra_data->'confusions', '[]'::jsonb) || jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-055', 'diff',
    'A. caesarea en ovo: cortar siempre longitudinalmente. Interior amarillo brillante = caesarea (excelente). Interior blanco o verdoso = posible phalloides (MORTAL). Sin ese corte no recolectar ovos. La amatoxinas de phalloides causan fallo hepático con síntomas de 6–24h de retraso.'),
  jsonb_build_object('with_species_id', 'esp-058', 'diff',
    'Ambas mortales con amatoxinas. A. verna es totalmente blanca (sombrero, laminillas y pie), sin tonos verdosos, típica de primavera. A. phalloides tiene sombrero verde-oliváceo y aparece en verano-otoño. Los síntomas se retrasan 6–24h.'),
  jsonb_build_object('with_species_id', 'esp-059', 'diff',
    'Ambas mortales. A. virosa es completamente blanca con olor ligeramente nauseabundo, típica de hayedos. A. phalloides tiene sombrero verde-oliváceo. Ambas contienen amatoxinas en cantidad letal incluso en pequeñas dosis.'),
  jsonb_build_object('with_species_id', 'esp-065', 'diff',
    'A. citrina tiene olor característico a patata cruda, sombrero pálido con manchas amarillo-verdosas y volva apretada al pie. A. phalloides tiene sombrero más verdoso y olor neutro. A. citrina se considera de precaución; nunca consumir amanitas pálidas sin identificación experta.'),
  jsonb_build_object('with_species_id', 'esp-159', 'diff',
    'Agaricus silvicola en botón puede parecerse al ovo de A. phalloides. Diferencia clave: extraer el pie entero. A. silvicola no tiene volva en la base; A. phalloides siempre tiene una volva en forma de saco. Sin ver la base del pie, no recolectar.')
    )
)
WHERE scientific_name = 'Amanita phalloides';


-- =============================================================================
-- esp-058  Amanita verna
-- =============================================================================
UPDATE species
SET extra_data = jsonb_set(
    COALESCE(extra_data, '{}'::jsonb),
    '{confusions}',
    COALESCE(extra_data->'confusions', '[]'::jsonb) || jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-057', 'diff',
    'Ambas mortales con amatoxinas. A. phalloides tiene sombrero verde-oliváceo, verano-otoño. A. verna es totalmente blanca y primaveral. Los síntomas aparecen con 6–24h de retraso; cuando aparecen ya hay daño hepático grave.'),
  jsonb_build_object('with_species_id', 'esp-059', 'diff',
    'Ambas mortales y totalmente blancas. A. virosa tiene olor más nauseabundo y se da sobre todo en hayedos acidófilos. A. verna es inodora o con ligero olor harinoso, más amplia distribución. Las dos son igualmente mortales.'),
  jsonb_build_object('with_species_id', 'esp-062', 'diff',
    'A. ovoidea es grande y maciza, con sombrero blanco a crema, anillo amplio y volva frágil. Clasificada como precaución; algunas fuentes la consideran sospechosa. A. verna es mortal. Nunca consumir amanitas blancas sin identificación 100% segura.'),
  jsonb_build_object('with_species_id', 'esp-165', 'diff',
    'Leucoagaricus leucothites es un hongo blanco sin volva en la base del pie (clave: extraer el pie entero). A. verna siempre tiene volva en saco. L. leucothites tiene olor agradable y laminillas libres; A. verna olor neutro o harinoso. MORTAL si hay volva.')
    )
)
WHERE scientific_name = 'Amanita verna';


-- =============================================================================
-- esp-059  Amanita virosa
-- =============================================================================
UPDATE species
SET extra_data = jsonb_set(
    COALESCE(extra_data, '{}'::jsonb),
    '{confusions}',
    COALESCE(extra_data->'confusions', '[]'::jsonb) || jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-057', 'diff',
    'Ambas mortales con amatoxinas. A. phalloides tiene sombrero verde-oliváceo inconfundible en adulto. A. virosa es completamente blanca. Las dos tienen volva en saco y anillo; sin embargo la intoxicación es igual de fatal.'),
  jsonb_build_object('with_species_id', 'esp-058', 'diff',
    'Ambas mortales y completamente blancas. A. virosa tiene olor nauseabundo y crece en hayedos acidófilos. A. verna tiene olor más suave y distribución más amplia. Imposible diferenciarlas con seguridad por vista; ambas son mortales.')
    )
)
WHERE scientific_name = 'Amanita virosa';


-- =============================================================================
-- esp-060  Amanita pantherina
-- =============================================================================
UPDATE species
SET extra_data = jsonb_set(
    COALESCE(extra_data, '{}'::jsonb),
    '{confusions}',
    COALESCE(extra_data->'confusions', '[]'::jsonb) || jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-061', 'diff',
    'Confusión clásica y peligrosa. Diferencia clave: A. rubescens rosea claramente en el corte y tiene restos del velo grisáceos o rosados en el pie. A. pantherina no rosea nunca y sus verrugas son blancas puras. A. pantherina es tóxica (muscimol/iboténico).'),
  jsonb_build_object('with_species_id', 'esp-069', 'diff',
    'Casi idénticas morfológicamente. A. excelsa (= A. spissa) tiene el pie más robusto y la volva menos definida. Reacción al rojo Congo en esporas puede distinguirlas en laboratorio. En campo no son fiablemente separables; tratar siempre como pantherina ante la duda.'),
  jsonb_build_object('with_species_id', 'esp-063', 'diff',
    'A. spissa (= excelsa var. spissa) es muy parecida a pantherina. Diferencias sutiles: spissa tiene sombrero más grisáceo-marrón y olor más harinoso. No separables con seguridad en campo; ante cualquier duda, tratar como pantherina.')
    )
)
WHERE scientific_name = 'Amanita pantherina';


-- =============================================================================
-- esp-061  Amanita rubescens
-- =============================================================================
UPDATE species
SET extra_data = jsonb_set(
    COALESCE(extra_data, '{}'::jsonb),
    '{confusions}',
    COALESCE(extra_data->'confusions', '[]'::jsonb) || jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-060', 'diff',
    'La diferencia más fiable: A. rubescens rosea en el corte (especialmente en la base del pie), A. pantherina no rosea nunca. Los restos del velo en rubescens tienden a ser grisáceos o rosados; en pantherina son blancos puros. A. pantherina: tóxica.'),
  jsonb_build_object('with_species_id', 'esp-069', 'diff',
    'Ambas pardas con verrugas grises. A. rubescens rosea al corte; A. excelsa no rosea o muy débilmente. A. excelsa es de precaución y se considera incomestible por algunos autores. A. rubescens requiere cocción (tóxica en crudo).')
    )
)
WHERE scientific_name = 'Amanita rubescens';


-- =============================================================================
-- esp-062  Amanita ovoidea
-- =============================================================================
UPDATE species
SET extra_data = jsonb_set(
    COALESCE(extra_data, '{}'::jsonb),
    '{confusions}',
    COALESCE(extra_data->'confusions', '[]'::jsonb) || jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-058', 'diff',
    'A. verna es mortal: tiene sombrero más pequeño y delgado, anillo membranoso y volva en saco bien definida. A. ovoidea es grande y maciza con volva más frágil. Nunca recolectar amanitas blancas grandes sin identificación experta y extracción completa del pie.')
    )
)
WHERE scientific_name = 'Amanita ovoidea';


-- =============================================================================
-- esp-063  Amanita spissa
-- =============================================================================
UPDATE species
SET extra_data = jsonb_set(
    COALESCE(extra_data, '{}'::jsonb),
    '{confusions}',
    COALESCE(extra_data->'confusions', '[]'::jsonb) || jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-060', 'diff',
    'A. spissa y A. pantherina son morfológicamente muy similares. Diferencias: spissa tiene olor harinoso más marcado y volva menos nítida; pantherina tiene volva con borde superior más definido. No separables con seguridad en campo. Tratar siempre como pantherina ante la duda.')
    )
)
WHERE scientific_name = 'Amanita spissa';


-- =============================================================================
-- esp-065  Amanita citrina
-- =============================================================================
UPDATE species
SET extra_data = jsonb_set(
    COALESCE(extra_data, '{}'::jsonb),
    '{confusions}',
    COALESCE(extra_data->'confusions', '[]'::jsonb) || jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-057', 'diff',
    'A. phalloides tiene sombrero verde-oliváceo más intenso, olor neutro o desagradable en adulto y volva en saco libre. A. citrina tiene olor diagnóstico a patata cruda, sombrero pálido con manchas amarillo-verdosas y volva apretada al pie. A. citrina: precaución, mejor no consumir.')
    )
)
WHERE scientific_name = 'Amanita citrina';


-- =============================================================================
-- esp-069  Amanita excelsa
-- =============================================================================
UPDATE species
SET extra_data = jsonb_set(
    COALESCE(extra_data, '{}'::jsonb),
    '{confusions}',
    COALESCE(extra_data->'confusions', '[]'::jsonb) || jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-060', 'diff',
    'Prácticamente idénticas en campo. La mejor distinción: A. pantherina tiene la volva con reborde superior muy nítido y marcado; A. excelsa lo tiene más difuso. A. pantherina no rosea nunca. Ante cualquier duda tratar como A. pantherina (tóxica).'),
  jsonb_build_object('with_species_id', 'esp-061', 'diff',
    'Ambas pardas con verrugas grises y anillo. A. rubescens rosea claramente al corte; A. excelsa no rosea o muy tenuemente. A. excelsa se considera de precaución; muchos autores la desaconsejan como comestible.')
    )
)
WHERE scientific_name = 'Amanita excelsa';


-- =============================================================================
-- Cross-familia: esp-159 Agaricus silvicola ↔ esp-057 Amanita phalloides
-- =============================================================================
UPDATE species
SET extra_data = jsonb_set(
    COALESCE(extra_data, '{}'::jsonb),
    '{confusions}',
    COALESCE(extra_data->'confusions', '[]'::jsonb) || jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-057', 'diff',
    'A. phalloides en estadio de ovo puede recordar a un champiñón del bosque en botón. Diferencia definitiva: extraer el pie entero. Si hay una volva en forma de saco en la base = AMANITA (potencialmente mortal). Agaricus silvicola no tiene volva, pero sí anillo y base del pie libre.')
    )
)
WHERE scientific_name = 'Agaricus silvicola';


-- =============================================================================
-- Cross-familia: esp-165 Leucoagaricus leucothites ↔ esp-058 Amanita verna
-- =============================================================================
UPDATE species
SET extra_data = jsonb_set(
    COALESCE(extra_data, '{}'::jsonb),
    '{confusions}',
    COALESCE(extra_data->'confusions', '[]'::jsonb) || jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-058', 'diff',
    'A. verna es totalmente blanca con volva en saco en la base del pie. L. leucothites no tiene volva. Extraer siempre el pie completo: si aparece una envoltura membranosa en la base = AMANITA MORTAL. L. leucothites tiene laminillas libres de color rosado pálido en adulto.')
    )
)
WHERE scientific_name = 'Leucoagaricus leucothites';


-- =============================================================================
-- Verificación
-- =============================================================================
SELECT scientific_name,
       jsonb_array_length(extra_data->'confusions') AS n_confusions
FROM   species
WHERE  extra_data ? 'confusions'
ORDER  BY scientific_name;
