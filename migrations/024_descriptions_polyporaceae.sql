-- Polyporaceae: description CA/EN (9 species)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Seta d''aspecte coriaci amb barret en forma d''ostra de tons violacis en la joventut que es tornen marró-groc en la maduresa. Incomestible per la seva consistència dura. Creix sobre fusta de planifolis morts o debilitats.',
    'description_en', 'Leathery-textured mushroom with an oyster-shaped cap of violet tones in youth that turn brown-yellow at maturity. Inedible due to its tough consistency. Grows on dead or weakened broadleaf wood.'
) WHERE scientific_name = 'Panus conchatus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'El polípor sulfúric o llagosta de bosc, polípor vistós de color taronja-groc brillant que creix en grans grups sobre troncs i soques de planifolis. Comestible quan jove i tendre. Un dels bolets de paràsit de fusta més espectaculars.',
    'description_en', 'The chicken of the woods, a striking orange-yellow polypore that grows in large clusters on logs and stumps of broadleaf trees. Edible when young and tender. One of the most spectacular wood-parasitizing fungi.'
) WHERE scientific_name = 'Laetiporus sulphureus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'L''esca de foc, fong perenne en forma de peülla que creix sobre faigs i altres frondoses. Incomestible. La seva carn esponjosa s''ha usat durant segles per encendre el foc. Indicador d''arbres debilitats o morts.',
    'description_en', 'The tinder fungus, a perennial hoof-shaped polypore growing on beeches and other hardwoods. Inedible. Its spongy flesh has been used for centuries as tinder. An indicator of weakened or dying trees.'
) WHERE scientific_name = 'Fomes fomentarius';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'La cua de gall d''indi o coriolus, polípor flexible multicolor amb zones concèntriques de colors variats. Incomestible per la seva consistència coriàcia. Molt comú sobre fusta morta. Estudiat per propietats medicinals (polisacàrids PSK).',
    'description_en', 'The turkey tail, a flexible multicolored polypore with concentric zones of varied colors. Inedible due to its leathery consistency. Very common on dead wood. Studied for medicinal properties (PSK polysaccharides).'
) WHERE scientific_name = 'Trametes versicolor';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Polípor blanc-grisós gibós amb porus allargats que creix sobre faigs i altres frondoses. Incomestible. Es reconeix per la forma gibosa del barret i els porus alargats irregulars de la cara inferior, gairebé laberíntics.',
    'description_en', 'White-gray gibbous polypore with elongated pores growing on beeches and other hardwoods. Inedible. Recognized by the gibbous shape of the cap and the elongated, irregular, almost labyrinthine pores on the underside.'
) WHERE scientific_name = 'Trametes gibbosa';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'La cadira de dríada, gran polípor amb barret cobert d''escames marrones concèntriques sobre fons groguenc i peu lateral excèntric. Comestible molt jove i tendre, la resta del temps massa dur. Creix sobre salzes, olmes i altres planifolis.',
    'description_en', 'The dryad''s saddle, a large polypore with a cap covered in concentric brown scales on a yellowish background and an eccentric lateral stem. Edible only when very young and tender; otherwise too tough. Grows on willows, elms, and other hardwoods.'
) WHERE scientific_name = 'Polyporus squamosus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Polípor de color vermell-taronja a vermell carmí intensíssim, un dels més vistosos de la fauna fúngica europea. Incomestible. Molt freqüent sobre fusta morta de planifolis. El seu color inconfusible el fa fàcilment identificable.',
    'description_en', 'Polypore of intensely red-orange to vermilion color, one of the most striking in European fungal fauna. Inedible. Very common on dead broadleaf wood. Its unmistakable color makes it easily identifiable.'
) WHERE scientific_name = 'Pycnoporus cinnabarinus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'El dèdal del roure, polípor llenyós amb porus laberíntics o dèdal en la cara inferior, típic de soques i troncs de roure. Incomestible per la seva consistència dura. Produeix la podridura parda de la fusta.',
    'description_en', 'The oak mazegill, a woody polypore with labyrinthine or maze-like pores on the underside, typical of oak stumps and logs. Inedible due to its hard consistency. It causes brown rot in wood.'
) WHERE scientific_name = 'Daedalea quercina';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'El tramete hirsut, polípor molt pelut de color gris-crema que creix sobre fusta morta de planifolis. Incomestible. Un dels polípors anuals més comuns d''Europa. La seva superfície superior densament peluda el diferencia d''altres trametes.',
    'description_en', 'The hairy bracket, a very hairy gray-cream polypore growing on dead broadleaf wood. Inedible. One of the most common annual polypores in Europe. Its densely hairy upper surface distinguishes it from other trametes.'
) WHERE scientific_name = 'Trametes hirsuta';
