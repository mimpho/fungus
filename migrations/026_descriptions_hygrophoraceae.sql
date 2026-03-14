-- Hygrophoraceae: description CA/EN (8 species)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'La seta d''hivern per excel·lència. Apareix sota la neu en fagedes i pinars d''alta muntanya, de novembre a març. Comestible excel·lent i molt apreciat, especialment als Pirineus. El seu barret gris fosc i làmines blanques el fan inconfusible.',
    'description_en', 'The winter mushroom par excellence. Appears under the snow in high-mountain beech and pine forests, from November to March. Excellent and highly prized edible, especially in the Pyrenees. Its dark gray cap and white gills make it unmistakable.'
) WHERE scientific_name = 'Hygrophorus marzuolus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Higròfor olivaci amb barret molt viscós verd-oliva i làmines que groguegen. Comestible de qualitat moderada. Creix exclusivament sota pins en tardor avançada. El seu barret viscós i coloració olivàcia el fan recognoscible.',
    'description_en', 'Olive waxy cap with a very viscous olive-green cap and gills that turn yellow. Moderate quality edible. Grows exclusively under pines in late autumn. Its viscous cap and olive coloring make it recognizable.'
) WHERE scientific_name = 'Hygrophorus hypothejus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Higròfor gris amb intens olor a ametlles amargues o anís. Comestible de bona qualitat. Creix exclusivament sota abets, per la qual cosa és un indicador de la presència d''aquesta espècie arbòria. Poc freqüent fora dels Pirineus.',
    'description_en', 'Gray waxy cap with an intense almond or anise smell. Good quality edible. Grows exclusively under silver firs, making it an indicator of this tree species. Uncommon outside the Pyrenees.'
) WHERE scientific_name = 'Hygrophorus agathosmus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Higròfor gris fosc amb petites pústules negres al barret viscós. Comestible de qualitat moderada. Creix en pinedes de muntanya, especialment sota Pinus sylvestris. Les pústules del barret el diferencien d''altres higròfors grisos.',
    'description_en', 'Dark gray waxy cap with small black pustules on the viscous cap. Moderate quality edible. Grows in mountain pine forests, especially under Pinus sylvestris. The cap pustules distinguish it from other gray waxy caps.'
) WHERE scientific_name = 'Hygrophorus pustulatus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'La cera escarlata, una de les més grans i impactants de les hygrocybes, amb barret roig-escarlata brillant. Incomestible. Espècie indicadora de prats antics no fertilitzats. La seva presència és senyal d''un ecosistema de pastura de gran valor.',
    'description_en', 'The scarlet waxcap, one of the largest and most striking waxcaps, with a bright scarlet red cap. Inedible. Indicator species of ancient unfertilized grasslands. Its presence signals a highly valuable meadow ecosystem.'
) WHERE scientific_name = 'Hygrocybe punicea';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'La cera de prat o hygrocybe de color salmó, de mida mitjana i aspecte robust. Comestible de qualitat mediocre. Espècie indicadora de prats antics no fertilitzats. Creix en pastures herboses de tardor de tota la Península.',
    'description_en', 'The meadow waxcap, medium-sized and robust in appearance. Mediocre quality edible. Indicator species of ancient unfertilized grasslands. Grows in grassy pastures in autumn throughout the Peninsula.'
) WHERE scientific_name = 'Hygrocybe pratensis';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'La cera lloro o hygrocybe papagall, inconfusible pel seu barret verd brillant que canvia a groc, taronja i roig amb l''edat. Incomestible. Indicadora de prats antics de gran valor ecològic. Un dels bolets més espectaculars dels prats.',
    'description_en', 'The parrot waxcap, unmistakable for its bright green cap that changes to yellow, orange, and red with age. Inedible. Indicator of ancient grasslands of great ecological value. One of the most spectacular mushrooms of meadows.'
) WHERE scientific_name = 'Hygrocybe psittacina';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'La cera blanca o hygrocybe verge, petita seta blanca de pastures no fertilitzades. Comestible però sense interès. Indicadora de prats antics i ecosistemes de pastura de gran valor ecològic, on apareix en tardor.',
    'description_en', 'The snowy waxcap, a small white mushroom of unfertilized grasslands. Edible but of little interest. Indicator of ancient meadows and pasture ecosystems of great ecological value, where it appears in autumn.'
) WHERE scientific_name = 'Cuphophyllus virgineus';
