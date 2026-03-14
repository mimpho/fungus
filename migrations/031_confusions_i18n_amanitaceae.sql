-- =============================================================================
-- 031_confusions_i18n_amanitaceae.sql
-- Adds diff_ca / diff_en to all confusion entries from 006_confusions_amanitaceae.sql
-- Full replacement of confusions array per species.
-- =============================================================================

-- esp-055  Amanita caesarea
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-056',
    'diff',    'En estadio de ovo ambas tienen la envoltura roja. A. muscaria desarrolla sombrero rojo-escarlata con verrugas blancas, laminillas y pie blancos. A. caesarea tiene laminillas y pie amarillo-dorados. Muscaria: tóxica (no mortal).',
    'diff_ca', 'En estadi d''ou ambdues tenen l''embolcall vermell. A. muscaria desenvolupa barret vermell-escarlata amb berrugues blanques, làmines i peu blancs. A. caesarea té làmines i peu groc-daurats. Muscaria: tòxica (no mortal).',
    'diff_en', 'In egg stage both have a red covering. A. muscaria develops a scarlet-red cap with white warts, white gills and stem. A. caesarea has golden-yellow gills and stem. Muscaria: toxic (not deadly).'),
  jsonb_build_object('with_species_id', 'esp-057',
    'diff',    'El ovo de A. phalloides puede ser blanco o ligeramente verdoso por fuera, parecido al de caesarea. Regla: cortar el ovo longitudinalmente. Interior amarillo brillante = caesarea. Interior blanco o verdoso = posible phalloides. MORTAL. Sin este corte, no recolectar ovos.',
    'diff_ca', 'L''ou de A. phalloides pot ser blanc o lleugerament verdós per fora, semblant al de caesarea. Regla: tallar l''ou longitudinalment. Interior groc brillant = caesarea. Interior blanc o verdós = possible phalloides. MORTAL. Sense aquest tall, no recol·lectar ous.',
    'diff_en', 'A. phalloides egg can be white or slightly greenish outside, similar to caesarea. Rule: cut the egg longitudinally. Bright yellow interior = caesarea. White or greenish interior = possible phalloides. DEADLY. Without this cut, do not collect eggs.')
)) WHERE scientific_name = 'Amanita caesarea';

-- esp-056  Amanita muscaria
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-055',
    'diff',    'A. caesarea tiene sombrero naranja-rojizo sin escamas blancas (o muy pocas), volva en forma de copa abierta amarillenta, laminillas y pie amarillo-dorados. El ovo siempre amarillo por dentro. Excelente comestible.',
    'diff_ca', 'A. caesarea té barret taronja-rogenc sense escames blanques (o molt poques), volva en forma de copa oberta groguenca, làmines i peu groc-daurats. L''ou sempre groc per dins. Excel·lent comestible.',
    'diff_en', 'A. caesarea has an orange-reddish cap without white scales (or very few), a yellowish open cup-shaped volva, and golden-yellow gills and stem. The egg is always yellow inside. Excellent edible.')
)) WHERE scientific_name = 'Amanita muscaria';

-- esp-057  Amanita phalloides
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-055',
    'diff',    'A. caesarea en ovo: cortar siempre longitudinalmente. Interior amarillo brillante = caesarea (excelente). Interior blanco o verdoso = posible phalloides (MORTAL). Sin ese corte no recolectar ovos. La amatoxinas de phalloides causan fallo hepático con síntomas de 6–24h de retraso.',
    'diff_ca', 'A. caesarea en ou: tallar sempre longitudinalment. Interior groc brillant = caesarea (excel·lent). Interior blanc o verdós = possible phalloides (MORTAL). Sense aquest tall no recol·lectar ous. Les amatoxines de phalloides causen fallida hepàtica amb símptomes de 6–24h de retard.',
    'diff_en', 'A. caesarea in egg: always cut longitudinally. Bright yellow interior = caesarea (excellent). White or greenish interior = possible phalloides (DEADLY). Without that cut do not collect eggs. Phalloides amatoxins cause liver failure with symptoms delayed 6–24h.'),
  jsonb_build_object('with_species_id', 'esp-058',
    'diff',    'Ambas mortales con amatoxinas. A. verna es totalmente blanca (sombrero, laminillas y pie), sin tonos verdosos, típica de primavera. A. phalloides tiene sombrero verde-oliváceo y aparece en verano-otoño. Los síntomas se retrasan 6–24h.',
    'diff_ca', 'Ambdues mortals amb amatoxines. A. verna és totalment blanca (barret, làmines i peu), sense tons verdosos, típica de primavera. A. phalloides té barret verd-olivaci i apareix a l''estiu-tardor. Els símptomes es retarden 6–24h.',
    'diff_en', 'Both deadly with amatoxins. A. verna is completely white (cap, gills, stem), without greenish tones, typical of spring. A. phalloides has an olive-green cap and appears in summer-autumn. Symptoms are delayed 6–24h.'),
  jsonb_build_object('with_species_id', 'esp-059',
    'diff',    'Ambas mortales. A. virosa es completamente blanca con olor ligeramente nauseabundo, típica de hayedos. A. phalloides tiene sombrero verde-oliváceo. Ambas contienen amatoxinas en cantidad letal incluso en pequeñas dosis.',
    'diff_ca', 'Ambdues mortals. A. virosa és completament blanca amb olor lleugerament nausebund, típica de fagedes. A. phalloides té barret verd-olivaci. Ambdues contenen amatoxines en quantitat letal fins i tot en petites dosis.',
    'diff_en', 'Both deadly. A. virosa is completely white with a slightly nauseating smell, typical of beech forests. A. phalloides has an olive-green cap. Both contain amatoxins in lethal amounts even in small doses.'),
  jsonb_build_object('with_species_id', 'esp-065',
    'diff',    'A. citrina tiene olor característico a patata cruda, sombrero pálido con manchas amarillo-verdosas y volva apretada al pie. A. phalloides tiene sombrero más verdoso y olor neutro. A. citrina se considera de precaución; nunca consumir amanitas pálidas sin identificación experta.',
    'diff_ca', 'A. citrina té olor característica a patata crua, barret pàl·lid amb taques groc-verdoses i volva apretada al peu. A. phalloides té barret més verdós i olor neutra. A. citrina es considera de precaució; mai consumir amanites pàl·lides sense identificació experta.',
    'diff_en', 'A. citrina has a characteristic raw potato smell, pale cap with yellow-green patches, and volva tight to the stem. A. phalloides has a greener cap and neutral smell. A. citrina is considered caution; never consume pale amanitas without expert identification.'),
  jsonb_build_object('with_species_id', 'esp-159',
    'diff',    'Agaricus silvicola en botón puede parecerse al ovo de A. phalloides. Diferencia clave: extraer el pie entero. A. silvicola no tiene volva en la base; A. phalloides siempre tiene una volva en forma de saco. Sin ver la base del pie, no recolectar.',
    'diff_ca', 'Agaricus silvicola en botó pot assemblar-se a l''ou de A. phalloides. Diferència clau: extreure el peu sencer. A. silvicola no té volva a la base; A. phalloides sempre té una volva en forma de sac. Sense veure la base del peu, no recol·lectar.',
    'diff_en', 'Agaricus silvicola in button stage can resemble A. phalloides egg. Key difference: extract the full stem. A. silvicola has no volva at the base; A. phalloides always has a sac-shaped volva. Without seeing the stem base, do not collect.'),
  jsonb_build_object('with_species_id', 'esp-158',
    'diff',    'A. campestris crece en prados abiertos, tiene laminillas rosadas (joven) a pardo-oscuras (adulto) y nunca tiene volva. A. phalloides crece bajo frondosas, tiene laminillas siempre blancas y SIEMPRE tiene una volva membranosa en la base del pie. Extraer el pie entero: si hay saco en la base = phalloides (MORTAL).',
    'diff_ca', 'A. campestris creix en prats oberts, té làmines rosades (jove) a marró-fosc (adult) i mai té volva. A. phalloides creix sota frondoses, té làmines sempre blanques i SEMPRE té una volva membranosa a la base del peu. Extreure el peu sencer: si hi ha sac a la base = phalloides (MORTAL).',
    'diff_en', 'A. campestris grows in open meadows, has pink (young) to dark brown (adult) gills, and never has a volva. A. phalloides grows under hardwoods, always has white gills, and ALWAYS has a membranous sac at the stem base. Extract the full stem: if there is a sac at the base = phalloides (DEADLY).')
)) WHERE scientific_name = 'Amanita phalloides';

-- esp-058  Amanita verna
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-057',
    'diff',    'Ambas mortales con amatoxinas. A. phalloides tiene sombrero verde-oliváceo, verano-otoño. A. verna es totalmente blanca y primaveral. Los síntomas aparecen con 6–24h de retraso; cuando aparecen ya hay daño hepático grave.',
    'diff_ca', 'Ambdues mortals amb amatoxines. A. phalloides té barret verd-olivaci, estiu-tardor. A. verna és totalment blanca i primaveral. Els símptomes apareixen amb 6–24h de retard; quan apareixen ja hi ha dany hepàtic greu.',
    'diff_en', 'Both deadly with amatoxins. A. phalloides has an olive-green cap, summer-autumn. A. verna is completely white and spring-occurring. Symptoms appear with a 6–24h delay; by then serious liver damage has already occurred.'),
  jsonb_build_object('with_species_id', 'esp-059',
    'diff',    'Ambas mortales y totalmente blancas. A. virosa tiene olor más nauseabundo y se da sobre todo en hayedos acidófilos. A. verna es inodora o con ligero olor harinoso, más amplia distribución. Las dos son igualmente mortales.',
    'diff_ca', 'Ambdues mortals i totalment blanques. A. virosa té olor més nausebund i es dona sobretot en fagedes acidòfiles. A. verna és inodora o amb lleu olor farinós, distribució més àmplia. Les dues són igualment mortals.',
    'diff_en', 'Both deadly and completely white. A. virosa has a more nauseating smell and occurs mainly in acidophilous beech forests. A. verna is odorless or with a slight floury smell, wider distribution. Both are equally deadly.'),
  jsonb_build_object('with_species_id', 'esp-062',
    'diff',    'A. ovoidea es grande y maciza, con sombrero blanco a crema, anillo amplio y volva frágil. Clasificada como precaución; algunas fuentes la consideran sospechosa. A. verna es mortal. Nunca consumir amanitas blancas sin identificación 100% segura.',
    'diff_ca', 'A. ovoidea és gran i massissa, amb barret blanc a crema, anell ampli i volva fràgil. Classificada com a precaució; algunes fonts la consideren sospitosa. A. verna és mortal. Mai consumir amanites blanques sense identificació 100% segura.',
    'diff_en', 'A. ovoidea is large and solid, with a white to cream cap, wide ring, and fragile volva. Classified as caution; some sources consider it suspicious. A. verna is deadly. Never consume white amanitas without 100% safe identification.'),
  jsonb_build_object('with_species_id', 'esp-165',
    'diff',    'Leucoagaricus leucothites es un hongo blanco sin volva en la base del pie (clave: extraer el pie entero). A. verna siempre tiene volva en saco. L. leucothites tiene olor agradable y laminillas libres; A. verna olor neutro o harinoso. MORTAL si hay volva.',
    'diff_ca', 'Leucoagaricus leucothites és un fong blanc sense volva a la base del peu (clau: extreure el peu sencer). A. verna sempre té volva en sac. L. leucothites té olor agradable i làmines lliures; A. verna olor neutra o farinosa. MORTAL si hi ha volva.',
    'diff_en', 'Leucoagaricus leucothites is a white fungus without a volva at the stem base (key: extract the full stem). A. verna always has a sac volva. L. leucothites has a pleasant smell and free gills; A. verna neutral or floury smell. DEADLY if there is a volva.'),
  jsonb_build_object('with_species_id', 'esp-158',
    'diff',    'A. campestris tiene laminillas que viran de rosado a pardo-oscuro y no tiene volva. A. verna es completamente blanca (laminillas incluidas) y tiene volva membranosa en saco. Nunca recolectar champiñones silvestres blancos sin verificar que las laminillas son rosadas y que no hay volva en la base. Mortal: amatoxinas.',
    'diff_ca', 'A. campestris té làmines que viren de rosat a marró-fosc i no té volva. A. verna és completament blanca (làmines incloses) i té volva membranosa en sac. Mai recol·lectar xampinyons silvestres blancs sense verificar que les làmines son rosades i que no hi ha volva a la base. Mortal: amatoxines.',
    'diff_en', 'A. campestris has gills that turn from pink to dark brown and has no volva. A. verna is completely white (gills included) and has a membranous sac volva. Never collect white wild mushrooms without verifying gills are pink and there is no volva at the base. Deadly: amatoxins.')
)) WHERE scientific_name = 'Amanita verna';

-- esp-059  Amanita virosa
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-057',
    'diff',    'Ambas mortales con amatoxinas. A. phalloides tiene sombrero verde-oliváceo inconfundible en adulto. A. virosa es completamente blanca. Las dos tienen volva en saco y anillo; sin embargo la intoxicación es igual de fatal.',
    'diff_ca', 'Ambdues mortals amb amatoxines. A. phalloides té barret verd-olivaci inconfusible en adult. A. virosa és completament blanca. Les dues tenen volva en sac i anell; tanmateix la intoxicació és igual de fatal.',
    'diff_en', 'Both deadly with amatoxins. A. phalloides has an unmistakable olive-green cap as an adult. A. virosa is completely white. Both have a sac volva and ring; the poisoning is equally fatal.'),
  jsonb_build_object('with_species_id', 'esp-058',
    'diff',    'Ambas mortales y completamente blancas. A. virosa tiene olor nauseabundo y crece en hayedos acidófilos. A. verna tiene olor más suave y distribución más amplia. Imposible diferenciarlas con seguridad por vista; ambas son mortales.',
    'diff_ca', 'Ambdues mortals i completament blanques. A. virosa té olor nausebund i creix en fagedes acidòfiles. A. verna té olor més suau i distribució més àmplia. Impossible diferenciar-les amb seguretat per vista; ambdues són mortals.',
    'diff_en', 'Both deadly and completely white. A. virosa has a nauseating smell and grows in acidophilous beech forests. A. verna has a milder smell and wider distribution. Impossible to differentiate safely by sight; both are deadly.')
)) WHERE scientific_name = 'Amanita virosa';

-- esp-060  Amanita pantherina
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-061',
    'diff',    'Confusión clásica y peligrosa. Diferencia clave: A. rubescens rosea claramente en el corte y tiene restos del velo grisáceos o rosados en el pie. A. pantherina no rosea nunca y sus verrugas son blancas puras. A. pantherina es tóxica (muscimol/iboténico).',
    'diff_ca', 'Confusió clàssica i perillosa. Diferència clau: A. rubescens vermelleja clarament al tall i té restes del vel grisosos o rosats al peu. A. pantherina no vermelleja mai i les seves berrugues són blanques pures. A. pantherina és tòxica (muscimol/ibotènic).',
    'diff_en', 'Classic and dangerous confusion. Key difference: A. rubescens clearly reddens when cut and has grayish or pinkish veil remnants on the stem. A. pantherina never reddens and its warts are pure white. A. pantherina is toxic (muscimol/ibotenic acid).'),
  jsonb_build_object('with_species_id', 'esp-069',
    'diff',    'Casi idénticas morfológicamente. A. excelsa (= A. spissa) tiene el pie más robusto y la volva menos definida. Reacción al rojo Congo en esporas puede distinguirlas en laboratorio. En campo no son fiablemente separables; tratar siempre como pantherina ante la duda.',
    'diff_ca', 'Gairebé idèntiques morfològicament. A. excelsa (= A. spissa) té el peu més robust i la volva menys definida. La reacció al vermell Congo en espores pot distingir-les en laboratori. En camp no son fiablement separables; tractar sempre com pantherina davant el dubte.',
    'diff_en', 'Almost morphologically identical. A. excelsa (= A. spissa) has a more robust stem and less defined volva. Congo red reaction on spores can distinguish them in the laboratory. In the field they are not reliably separable; always treat as pantherina when in doubt.'),
  jsonb_build_object('with_species_id', 'esp-063',
    'diff',    'A. spissa (= excelsa var. spissa) es muy parecida a pantherina. Diferencias sutiles: spissa tiene sombrero más grisáceo-marrón y olor más harinoso. No separables con seguridad en campo; ante cualquier duda, tratar como pantherina.',
    'diff_ca', 'A. spissa (= excelsa var. spissa) s''assembla molt a pantherina. Diferències subtils: spissa té barret més grisós-marró i olor més farinós. No separables amb seguretat en camp; davant qualsevol dubte, tractar com pantherina.',
    'diff_en', 'A. spissa (= excelsa var. spissa) is very similar to pantherina. Subtle differences: spissa has a more grayish-brown cap and more floury smell. Not safely separable in the field; when in any doubt, treat as pantherina.'),
  jsonb_build_object('with_species_id', 'esp-066',
    'diff',    'A. gemmata tiene sombrero amarillo-ocre (no pardo-grisáceo), anillo liso y volva simple. Menos tóxica que pantherina, pero nunca consumir. La confusión es posible en ejemplares decolorados o jóvenes.',
    'diff_ca', 'A. gemmata té barret groc-ocre (no marró-grisós), anell llis i volva simple. Menys tòxica que pantherina, però mai consumir. La confusió és possible en exemplars descolorits o joves.',
    'diff_en', 'A. gemmata has a yellow-ochre cap (not grayish-brown), smooth ring, and simple volva. Less toxic than pantherina, but never consume. Confusion is possible with discolored or young specimens.')
)) WHERE scientific_name = 'Amanita pantherina';

-- esp-061  Amanita rubescens
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-060',
    'diff',    'La diferencia más fiable: A. rubescens rosea en el corte (especialmente en la base del pie), A. pantherina no rosea nunca. Los restos del velo en rubescens tienden a ser grisáceos o rosados; en pantherina son blancos puros. A. pantherina: tóxica.',
    'diff_ca', 'La diferència més fiable: A. rubescens vermelleja al tall (especialment a la base del peu), A. pantherina no vermelleja mai. Les restes del vel en rubescens tendeixen a ser grisoses o rosades; en pantherina són blanques pures. A. pantherina: tòxica.',
    'diff_en', 'The most reliable difference: A. rubescens reddens when cut (especially at the stem base), A. pantherina never reddens. Veil remnants in rubescens tend to be grayish or pinkish; in pantherina they are pure white. A. pantherina: toxic.'),
  jsonb_build_object('with_species_id', 'esp-069',
    'diff',    'Ambas pardas con verrugas grises. A. rubescens rosea al corte; A. excelsa no rosea o muy débilmente. A. excelsa es de precaución y se considera incomestible por algunos autores. A. rubescens requiere cocción (tóxica en crudo).',
    'diff_ca', 'Ambdues pardunes amb berrugues grises. A. rubescens vermelleja al tall; A. excelsa no vermelleja o molt feblament. A. excelsa és de precaució i es considera incomestible per alguns autors. A. rubescens requereix cocció (tòxica en cru).',
    'diff_en', 'Both brownish with gray warts. A. rubescens reddens when cut; A. excelsa does not redden or very slightly. A. excelsa is caution and considered inedible by some authors. A. rubescens requires cooking (toxic raw).')
)) WHERE scientific_name = 'Amanita rubescens';

-- esp-062  Amanita ovoidea
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-058',
    'diff',    'A. verna es mortal: tiene sombrero más pequeño y delgado, anillo membranoso y volva en saco bien definida. A. ovoidea es grande y maciza con volva más frágil. Nunca recolectar amanitas blancas grandes sin identificación experta y extracción completa del pie.',
    'diff_ca', 'A. verna és mortal: té barret més petit i prim, anell membranós i volva en sac ben definida. A. ovoidea és gran i massissa amb volva més fràgil. Mai recol·lectar amanites blanques grans sense identificació experta i extracció completa del peu.',
    'diff_en', 'A. verna is deadly: it has a smaller and thinner cap, membranous ring, and well-defined sac volva. A. ovoidea is large and solid with a more fragile volva. Never collect large white amanitas without expert identification and full extraction of the stem.')
)) WHERE scientific_name = 'Amanita ovoidea';

-- esp-063  Amanita spissa
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-060',
    'diff',    'A. spissa y A. pantherina son morfológicamente muy similares. Diferencias: spissa tiene olor harinoso más marcado y volva menos nítida; pantherina tiene volva con borde superior más definido. No separables con seguridad en campo. Tratar siempre como pantherina ante la duda.',
    'diff_ca', 'A. spissa i A. pantherina són morfològicament molt similars. Diferències: spissa té olor farinós més marcat i volva menys nítida; pantherina té volva amb vora superior més definida. No separables amb seguretat en camp. Tractar sempre com pantherina davant el dubte.',
    'diff_en', 'A. spissa and A. pantherina are morphologically very similar. Differences: spissa has a more pronounced floury smell and less clear volva; pantherina has a volva with a more defined upper margin. Not safely separable in the field. Always treat as pantherina when in doubt.')
)) WHERE scientific_name = 'Amanita spissa';

-- esp-065  Amanita citrina
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-057',
    'diff',    'A. phalloides tiene sombrero verde-oliváceo más intenso, olor neutro o desagradable en adulto y volva en saco libre. A. citrina tiene olor diagnóstico a patata cruda, sombrero pálido con manchas amarillo-verdosas y volva apretada al pie. A. citrina: precaución, mejor no consumir.',
    'diff_ca', 'A. phalloides té barret verd-olivaci més intens, olor neutra o desagradable en adult i volva en sac lliure. A. citrina té olor diagnòstica a patata crua, barret pàl·lid amb taques groc-verdoses i volva apretada al peu. A. citrina: precaució, millor no consumir.',
    'diff_en', 'A. phalloides has a more intense olive-green cap, neutral or unpleasant smell as adult, and free sac volva. A. citrina has a diagnostic raw potato smell, pale cap with yellow-green patches, and volva tight to the stem. A. citrina: caution, better not to consume.'),
  jsonb_build_object('with_species_id', 'esp-066',
    'diff',    'A. gemmata tiene sombrero amarillo más vivo, sin el olor harinoso característico de citrina, y la volva es menos pronunciada. gemmata es más tóxica. En caso de duda, no consumir ninguna.',
    'diff_ca', 'A. gemmata té barret groc més viu, sense l''olor farinós característic de citrina, i la volva és menys pronunciada. gemmata és més tòxica. En cas de dubte, no consumir cap de les dues.',
    'diff_en', 'A. gemmata has a more vivid yellow cap, without citrina''s characteristic floury smell, and the volva is less pronounced. gemmata is more toxic. When in doubt, do not consume either.')
)) WHERE scientific_name = 'Amanita citrina';

-- esp-069  Amanita excelsa
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-060',
    'diff',    'Prácticamente idénticas en campo. La mejor distinción: A. pantherina tiene la volva con reborde superior muy nítido y marcado; A. excelsa lo tiene más difuso. A. pantherina no rosea nunca. Ante cualquier duda tratar como A. pantherina (tóxica).',
    'diff_ca', 'Pràcticament idèntiques en camp. La millor distinció: A. pantherina té la volva amb vora superior molt nítida i marcada; A. excelsa la té més difusa. A. pantherina no vermelleja mai. Davant qualsevol dubte tractar com A. pantherina (tòxica).',
    'diff_en', 'Practically identical in the field. Best distinction: A. pantherina has a very clear and marked upper rim on the volva; A. excelsa has a more diffuse one. A. pantherina never reddens. When in any doubt treat as A. pantherina (toxic).'),
  jsonb_build_object('with_species_id', 'esp-061',
    'diff',    'Ambas pardas con verrugas grises y anillo. A. rubescens rosea claramente al corte; A. excelsa no rosea o muy tenuemente. A. excelsa se considera de precaución; muchos autores la desaconsejan como comestible.',
    'diff_ca', 'Ambdues pardunes amb berrugues grises i anell. A. rubescens vermelleja clarament al tall; A. excelsa no vermelleja o molt tenuement. A. excelsa es considera de precaució; molts autors la desaconsellen com a comestible.',
    'diff_en', 'Both brownish with gray warts and a ring. A. rubescens clearly reddens when cut; A. excelsa does not redden or very faintly. A. excelsa is considered caution; many authors advise against it as an edible.')
)) WHERE scientific_name = 'Amanita excelsa';

-- esp-159  Agaricus silvicola (cross-familia)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-057',
    'diff',    'A. phalloides en estadio de ovo puede recordar a un champiñón del bosque en botón. Diferencia definitiva: extraer el pie entero. Si hay una volva en forma de saco en la base = AMANITA (potencialmente mortal). Agaricus silvicola no tiene volva, pero sí anillo y base del pie libre.',
    'diff_ca', 'A. phalloides en estadi d''ou pot recordar un xampinyó del bosc en botó. Diferència definitiva: extreure el peu sencer. Si hi ha una volva en forma de sac a la base = AMANITA (potencialment mortal). Agaricus silvicola no té volva, però sí anell i base del peu lliure.',
    'diff_en', 'A. phalloides in egg stage can resemble a wood mushroom in button stage. Definitive difference: extract the full stem. If there is a sac-shaped volva at the base = AMANITA (potentially deadly). Agaricus silvicola has no volva, but does have a ring and free stem base.')
)) WHERE scientific_name = 'Agaricus silvicola';

-- esp-165  Leucoagaricus leucothites (cross-familia)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-058',
    'diff',    'A. verna es totalmente blanca con volva en saco en la base del pie. L. leucothites no tiene volva. Extraer siempre el pie completo: si aparece una envoltura membranosa en la base = AMANITA MORTAL. L. leucothites tiene laminillas libres de color rosado pálido en adulto.',
    'diff_ca', 'A. verna és totalment blanca amb volva en sac a la base del peu. L. leucothites no té volva. Extreure sempre el peu complet: si apareix una embolcall membranós a la base = AMANITA MORTAL. L. leucothites té làmines lliures de color rosat pàl·lid en adult.',
    'diff_en', 'A. verna is completely white with a sac volva at the stem base. L. leucothites has no volva. Always extract the full stem: if a membranous covering appears at the base = DEADLY AMANITA. L. leucothites has free gills of pale pink color in adult specimens.')
)) WHERE scientific_name = 'Leucoagaricus leucothites';
