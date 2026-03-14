-- Cantharellaceae: description CA/EN (7 species)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'El rossinyol o cantarel·la daurat, un dels bolets més aromàtics del bosc. El seu aroma frutal i afruitat i les pseudo-làmines decurrents el fan inconfusible. Excel·lent comestible, molt apreciat a tot Europa i especialment a Catalunya.',
    'description_en', 'The golden chanterelle, one of the most aromatic mushrooms in the forest. Its fruity, apricot-like aroma and decurrent false gills make it unmistakable. Excellent edible, highly prized throughout Europe and especially in Catalonia.'
) WHERE scientific_name = 'Cantharellus cibarius';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Rossinyol pàl·lid de color crema-ocre, pràcticament sense pigmentació ataronjada, que creix en pinedes mediterrànies. Comestible de bona qualitat, igual al rossinyol comú. Tendeix a créixer en zones més càlides i seques.',
    'description_en', 'Pale chanterelle of cream-ochre color, practically without orange pigmentation, growing in Mediterranean pine forests. Good quality edible, equal to the common chanterelle. Tends to grow in warmer and drier areas.'
) WHERE scientific_name = 'Cantharellus pallens';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Cantarel·la groc-daurada de mida petita a mitjana que creix en pinars i rouredes de zones àcides. Comestible de bona qualitat. Més petit que el rossinyol comú, amb tonalitats més grogues i menys ataronjades.',
    'description_en', 'Yellow-golden chanterelle of small to medium size growing in pine and oak forests on acidic soils. Good quality edible. Smaller than the common chanterelle, with more yellow and less orange tones.'
) WHERE scientific_name = 'Cantharellus aurora';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Malgrat el seu nom inquietant, és una excel·lent seta comestible. Aroma intens i sabor profund, excel·lent assecada. En forma d''embut negre quasi transparent. Una de les millors setes de tardor, molt apreciada a la cuina francesa.',
    'description_en', 'Despite its alarming name, it is an excellent edible mushroom. Intense aroma and deep flavor, excellent dried. Funnel-shaped and nearly transparent black. One of the best autumn mushrooms, highly prized in French cuisine.'
) WHERE scientific_name = 'Craterellus cornucopioides';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Seta en forma de trompeta groc-ataronjada. Creix en grans grups en sòls humits de coníferes. Comestible de bona qualitat, especialment apreciada assecada per l''aroma. Similar a C. tubaeformis però amb colors més càlids.',
    'description_en', 'Yellow-orange trumpet-shaped mushroom. Grows in large groups on humid conifer soils. Good quality edible, especially prized dried for its aroma. Similar to C. tubaeformis but with warmer colors.'
) WHERE scientific_name = 'Craterellus lutescens';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Parent petit del rossinyol, molt aromàtic i excel·lent assecat. Creix en grans grups en sòls humits de coníferes i caducifolis. Comestible molt apreciat per la seva persistència de temporada i la seva fragància intensa quan s''asseca.',
    'description_en', 'Small relative of the chanterelle, very aromatic and excellent dried. Grows in large groups on humid soils of conifers and deciduous trees. Highly prized edible for its long season persistence and intense fragrance when dried.'
) WHERE scientific_name = 'Craterellus tubaeformis';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Trompeta gris-negra de forma ondulada i irregular, afí a Craterellus cornucopioides però menys freqüent. Comestible de bona qualitat. Creix en boscos de caducifolis i coníferes, sovint entre molses en llocs humits.',
    'description_en', 'Gray-black trumpet with a wavy and irregular shape, related to Craterellus cornucopioides but less common. Good quality edible. Grows in deciduous and conifer forests, often among mosses in humid spots.'
) WHERE scientific_name = 'Pseudocraterellus undulatus';
