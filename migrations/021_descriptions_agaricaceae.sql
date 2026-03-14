-- Agaricaceae: description CA/EN (12 species)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'El xampinyó silvestre o seta de camp, el comestible més conegut i consumit del món. El seu barret blanc-rosat amb làmines que viren a rosat i finalment a marró-fosc i la seva olor agradable el fan fàcilment recognoscible.',
    'description_en', 'The field mushroom, the most widely known and consumed edible in the world. Its white-pink cap with gills that turn pink and finally dark brown, and its pleasant smell, make it easily recognizable.'
) WHERE scientific_name = 'Agaricus campestris';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'El xampinyó del bosc, blanc amb base bulbosa buida i olor a anís. Comestible apreciat però cal tenir cura de no confondre''l amb amanites blanques tòxiques com A. phalloides var. alba. Freqüent en boscos de coníferes.',
    'description_en', 'The wood mushroom, white with a hollow bulbous base and anise smell. Prized edible but care must be taken not to confuse it with toxic white amanitas like A. phalloides var. alba. Frequent in conifer forests.'
) WHERE scientific_name = 'Agaricus silvicola';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'El xampinyó groguejant o fals xampinyó, amb carn que pren un viu color groc crom al tall, especialment a la base del peu. Causa trastorns gastrointestinals. L''olor a fenol o tinta és el signe d''alarma més fiable.',
    'description_en', 'The yellowing mushroom or false field mushroom, with flesh that turns a vivid chrome yellow when cut, especially at the stem base. Causes gastrointestinal disorders. The phenol or ink smell is the most reliable warning sign.'
) WHERE scientific_name = 'Agaricus xanthodermus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'El príncep, gran xampinyó de barret marró-daurat amb escates fibroses i olor agradable a ametlles. Un dels bolets més apreciats dels boscos de coníferes. La seva mida espectacular el fa inconfusible.',
    'description_en', 'The prince, a large mushroom with a golden-brown cap with fibrous scales and a pleasant almond smell. One of the most prized mushrooms of conifer forests. Its spectacular size makes it unmistakable.'
) WHERE scientific_name = 'Agaricus augustus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'La lepiota escamosa o falsa paparra, petita lepiota tòxica amb barret blanc amb escames marrons concèntriques i olor desagradable. Pot causar intoxicacions greus. Freqüent en marges de camins i vores de bosc.',
    'description_en', 'The stinking dapperling, a small toxic lepiota with a white cap with concentric brown scales and an unpleasant smell. Can cause serious poisoning. Frequent on roadsides and forest edges.'
) WHERE scientific_name = 'Lepiota cristata';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Una de les setes més grans d''Europa. El seu barret pot arribar als 40 cm. Aparença d''ombrel·la amb barret de color crema-marró amb escates i peu llarg. Excel·lent comestible, ideal per arrebossar. Freqüent en pastures i vores de bosc.',
    'description_en', 'One of the largest mushrooms in Europe. Its cap can reach 40 cm. Umbrella-like appearance with a cream-brown scaly cap and long stem. Excellent edible, ideal for breading. Frequent in meadows and forest edges.'
) WHERE scientific_name = 'Macrolepiota procera';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'La paparra escamosa o apagador arrissat, amb barret gris-marró d''escames grans i carn que vermelleja al tall. Comestible de bona qualitat, similar a M. procera. Creix en boscos i vores de camins de tot el territori.',
    'description_en', 'The shaggy parasol, with a gray-brown cap of large scales and flesh that reddens when cut. Good quality edible, similar to M. procera. Grows in forests and roadsides throughout the territory.'
) WHERE scientific_name = 'Macrolepiota rhacodes';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'La falsa paparra blanca, d''aspecte similar a xampinyons blancs i paparres. Pot confondre''s amb espècies tòxiques. Comestible però no recomanable per als recol·lectors poc experts. Freqüent en pastures i jardins.',
    'description_en', 'The white Agaricus look-alike, similar in appearance to white mushrooms and parasols. Can be confused with toxic species. Edible but not recommended for inexperienced foragers. Frequent in meadows and gardens.'
) WHERE scientific_name = 'Leucoagaricus leucothites';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'El peu de llop gegant, que pot arribar als 80 cm de diàmetre i diversos quilos de pes, la fructificació fúngica més gran del món. Comestible excel·lent quan la carn interior és completament blanca. Poc freqüent.',
    'description_en', 'The giant puffball, which can reach 80 cm in diameter and several kilos in weight, the largest fungal fruiting body in the world. Excellent edible when the inner flesh is completely white. Uncommon.'
) WHERE scientific_name = 'Calvatia gigantea';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'El peu de llop perlat o cuesco de llop, amb superfície coberta d''espines piramidals blanques que cauen en la maduresa deixant un reticle. Comestible quan la carn interior és blanca. Molt freqüent en boscos de tot tipus.',
    'description_en', 'The common puffball, with a surface covered in white pyramidal spines that fall at maturity leaving a net pattern. Edible when the inner flesh is white. Very common in all types of forests.'
) WHERE scientific_name = 'Lycoperdon perlatum';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'El peu de llop piriforme, en forma de pera, que creix sobre fusta morta i humus amb abundants rizomorfs blancs a la base. Comestible quan la carn és blanca. Forma colònies denses en troncs caiguts i soques.',
    'description_en', 'The pear-shaped puffball, growing on dead wood and humus with abundant white rhizomorphs at the base. Edible when the flesh is white. Forms dense colonies on fallen logs and stumps.'
) WHERE scientific_name = 'Lycoperdon pyriforme';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'El peu de llop plomís, petit i globós que en la maduresa adquireix color gris-plomís i s''obre per un porus apical per alliberar les espores. Comestible quan la carn interior és blanca. Freqüent en pastures i prats.',
    'description_en', 'The grey puffball, small and globose, which at maturity turns gray-leaden and opens through an apical pore to release spores. Edible when the inner flesh is white. Frequent in meadows and grasslands.'
) WHERE scientific_name = 'Bovista plumbea';
