-- Amanitaceae: description CA/EN (15 species)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Considerada per molts la seta més exquisida d''Europa. Surt d''un ou blanc que la protegeix inicialment. El seu barret taronja-groc amb làmines grogues i peu amb anell i volva la fan inconfusible. Excel·lent a la cuina.',
    'description_en', 'Considered by many the most exquisite mushroom in Europe. It emerges from a white egg that initially protects it. Its orange-yellow cap with yellow gills and stem with ring and volva make it unmistakable. Excellent in the kitchen.'
) WHERE scientific_name = 'Amanita caesarea';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'La seta més icònica del món, amb el seu barret vermell amb escames blanques. Conté muscimol i àcid iboténic, substàncies psicoactives. Tòxica i al·lucinògena. No s''ha de recol·lectar ni consumir mai sota cap circumstància.',
    'description_en', 'The most iconic mushroom in the world, with its red cap with white scales. Contains muscimol and ibotenic acid, psychoactive substances. Toxic and hallucinogenic. Should never be harvested or consumed under any circumstances.'
) WHERE scientific_name = 'Amanita muscaria';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'LA SETA MÉS PERILLOSA DEL MÓN. Responsable del 90% de les morts per intoxicació micològica. Conté amatoxines que destrueixen el fetge i els ronyons amb efecte retardat de 6-24h. L''aspecte inofensiu és el seu major perill.',
    'description_en', 'THE MOST DANGEROUS MUSHROOM IN THE WORLD. Responsible for 90% of deaths from mushroom poisoning. Contains amatoxins that destroy the liver and kidneys with a delayed effect of 6-24h. Its harmless appearance is its greatest danger.'
) WHERE scientific_name = 'Amanita phalloides';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Seta mortal coneguda com l''àngel de la primavera. Completament blanca com A. virosa, conté les mateixes amatoxines letals que A. phalloides. Creix a la primavera, de vegades confosa amb Agaricus campestris o espècies comestibles.',
    'description_en', 'Deadly mushroom known as the spring death cap. Completely white like A. virosa, it contains the same lethal amatoxins as A. phalloides. Grows in spring, sometimes confused with Agaricus campestris or edible species.'
) WHERE scientific_name = 'Amanita verna';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'L''àngel destructor, juntament amb A. phalloides la seta més mortífera d''Europa. Completament blanca, conté amatoxines en concentracions molt elevades. Creix en boscos de coníferes i caducifolis del nord peninsular i muntanya.',
    'description_en', 'The destroying angel, together with A. phalloides the most deadly mushroom in Europe. Completely white, it contains amatoxins at very high concentrations. Grows in conifer and deciduous forests in the northern peninsula and mountains.'
) WHERE scientific_name = 'Amanita virosa';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'La falsa orella o mata-mosques pardós, amb barret marró-grisós i berrugues blanques. Tòxica, conté muscimol i àcid iboténic. Pot confondre''s amb A. rubescens i A. spissa, per la qual cosa cal molta precaució.',
    'description_en', 'The panther cap, with a brownish-gray cap and white warts. Toxic, contains muscimol and ibotenic acid. Can be confused with A. rubescens and A. spissa, requiring great caution.'
) WHERE scientific_name = 'Amanita pantherina';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'L''amanita vinosa o blusher, reconeixible perquè la carn vermelleja progressivament al tall o les picades d''insectes. Comestible apreciat però requereix cocció completa; en cru és tòxica. Molt freqüent en boscos de tot tipus.',
    'description_en', 'The blusher, recognizable because the flesh progressively turns reddish when cut or bitten by insects. Prized edible but requires thorough cooking; raw it is toxic. Very common in all types of forests.'
) WHERE scientific_name = 'Amanita rubescens';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Gran amanita mediterrània de color blanc-crema amb volva lobulada molt gran. Comestible apreciat al sud d''Espanya. Podria confondre''s amb A. phalloides però la volva massissa i la mida excepcional la fan recognoscible.',
    'description_en', 'Large Mediterranean amanita of cream-white color with a very large lobed volva. Prized edible in southern Spain. Could be confused with A. phalloides but the massive volva and exceptional size make it recognizable.'
) WHERE scientific_name = 'Amanita ovoidea';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Amanita gris-parda amb berrugues grises i base bulbosa amb volva acintada. Comestible amb precaució, es confon fàcilment amb A. pantherina (tòxica). Molt freqüent en boscos de tota la Península, especialment en alzinedes.',
    'description_en', 'Gray-brown amanita with gray warts and a bulbous base with a banded volva. Edible with caution, easily confused with A. pantherina (toxic). Very common in forests throughout the Peninsula, especially in holm oak groves.'
) WHERE scientific_name = 'Amanita spissa';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Amanita taronja-ocre elegant sense anell i amb gran volva en sac, freqüent en rouredes i fagedes. Comestible apreciat. La seva coloració càlida i la volva prominent en sac la fan inconfusible en el seu hàbitat.',
    'description_en', 'Elegant orange-ochre amanita without a ring and with a large sac-like volva, frequent in oak and beech forests. Prized edible. Its warm coloration and prominent sac-like volva make it unmistakable in its habitat.'
) WHERE scientific_name = 'Amanita crocea';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Amanita groc-llimona a blanc-verdós amb olor característica a patata crua. Incomestible tot i que la seva toxicitat no és letal. Molt freqüent en boscos de pins i alzines, una de les amanites més abundants de la Península.',
    'description_en', 'Yellow-lemon to whitish-green amanita with a characteristic raw potato smell. Inedible although its toxicity is not lethal. Very common in pine and holm oak forests, one of the most abundant amanitas in the Peninsula.'
) WHERE scientific_name = 'Amanita citrina';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Amanita groga amb berrugues blanques, anell fràgil i volva en sac, de mida mitjana. Tòxica, conté muscimol. Se la pot confondre amb A. caesarea jove, però aquesta mai té berrugues blanques sobre fons groc.',
    'description_en', 'Yellow amanita with white warts, fragile ring, and sac-like volva, medium-sized. Toxic, contains muscimol. Can be confused with young A. caesarea, but that species never has white warts on a yellow background.'
) WHERE scientific_name = 'Amanita gemmata';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Gran amanita blanca amb grans berrugues piramidals grises i base bulbosa molt irregular. Comestible apreciat, poc freqüent. Creix en boscos de planifolis i coníferes del centre i nord peninsular, preferentment en sòls calcaris.',
    'description_en', 'Large white amanita with large gray pyramidal warts and a very irregular bulbous base. Prized edible, uncommon. Grows in broadleaf and conifer forests in the center and north of the Peninsula, preferably on limestone soils.'
) WHERE scientific_name = 'Amanita strobiliformis';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Amanita de barret rosat-salmó a ocre amb marge estriat i sense anell, pertanyent al grup Vaginatae. Comestible però cal molta precaució per la semblança amb altres amanites tòxiques del mateix grup. Poc freqüent.',
    'description_en', 'Amanita with a pinkish-salmon to ochre cap with a striate margin and no ring, belonging to the Vaginatae group. Edible but great caution is needed due to its similarity to other toxic amanitas in the same group. Uncommon.'
) WHERE scientific_name = 'Amanita eliae';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Amanita gris-parda de gran mida amb berrugues grises i fort olor a rave. Comestible però poc apreciat per la seva olor. Molt freqüent en boscos de tot tipus, es confon amb A. pantherina però el seu peu és llarg i robust.',
    'description_en', 'Large gray-brown amanita with gray warts and a strong radish smell. Edible but not prized for its odor. Very common in all types of forests, confused with A. pantherina but its stem is long and robust.'
) WHERE scientific_name = 'Amanita excelsa';
