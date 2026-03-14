-- Tricholomataceae: description CA/EN (11 species)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'El verdell o cavallet, seta groc-verdosa que creix sota pins a la tardor-hivern. Considerada comestible durant dècades, avui se sap que consumida de manera repetida causa rabdomiòlisi. No recomanable.',
    'description_en', 'The canary knight, a yellowish-green mushroom that grows under pines in autumn-winter. Considered edible for decades, it is now known that repeated consumption causes rhabdomyolysis. Not recommended.'
) WHERE scientific_name = 'Tricholoma equestre';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Seta grisa molt apreciada a Catalunya (fredolic). Creix en grups o fileres sota pins en la tardor avançada. De gust suau i textura ferma, és un dels comestibles tardorencs més valorats de la cuina catalana.',
    'description_en', 'Gray mushroom highly prized in Catalonia. Grows in groups or rows under pines in late autumn. Mild taste and firm texture, it is one of the most valued late-autumn edibles in Catalan cuisine.'
) WHERE scientific_name = 'Tricholoma portentosum';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Seta petita grisa molt comuna en pinars. El seu barret gris amb cutícula fibrosa i làmines grises la fan recognoscible. Comestible de qualitat mediocre però molt apreciada a la cuina catalana per la seva textura.',
    'description_en', 'Small gray mushroom very common in pine forests. Its gray cap with fibrous cuticle and gray gills make it recognizable. Mediocre quality edible but highly appreciated in Catalan cuisine for its texture.'
) WHERE scientific_name = 'Tricholoma terreum';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Tricholoma de color groc sofre intens i olor molt desagradable a gas o sofre. Incomestible per l''olor i el gust. Pot causar trastorns gastrointestinals. Es reconeix immediatament per la combinació de color i olor característics.',
    'description_en', 'Tricholoma of intense sulfur yellow color and very unpleasant gas or sulfur smell. Inedible due to its smell and taste. Can cause gastrointestinal disorders. Immediately recognizable by the combination of characteristic color and smell.'
) WHERE scientific_name = 'Tricholoma sulphureum';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Tricholoma variable de color gris-verdós a oliva amb olor i gust característic a sabó. Incomestible. Molt freqüent en boscos de tot tipus, és una de les tricholomes més comunes de la Península Ibèrica.',
    'description_en', 'Variable tricholoma of gray-green to olive color with a characteristic soapy smell and taste. Inedible. Very common in all types of forests, it is one of the most common tricholomas of the Iberian Peninsula.'
) WHERE scientific_name = 'Tricholoma saponaceum';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'La cama de perdiu o clitocibe geòtrop, gran clitocibe crema-beige amb barret en ombrel·la, làmines molt decurrents i peu molt llarg. Comestible apreciat, especialment a Espanya. Creix en boscos clars i pastures arbrades.',
    'description_en', 'The trooping funnel, a large cream-beige clitocybe with an umbrella-like cap, very decurrent gills, and a very long stem. Prized edible, especially in Spain. Grows in open forests and wooded pastures.'
) WHERE scientific_name = 'Clitocybe geotropa';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Seta gran i grisa que creix en grans corros. Actualment es classifica com tòxica per contingut en agaricina i compostos irritants. Anteriorment considerada comestible; s''ha de descartar completament per a consum.',
    'description_en', 'Large gray mushroom that grows in large fairy rings. Currently classified as toxic due to agaricine and irritant compounds. Previously considered edible; it must be completely ruled out for consumption.'
) WHERE scientific_name = 'Clitocybe nebularis';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Clitocibe verd-blavosa d''intensíssima i penetrant olor a anís. Comestible però poc recomanable per la intensitat de l''olor, que pot resultar aclaparadora en cuina. Freqüent en boscos de pins i rouredes del centre peninsular.',
    'description_en', 'Blue-green clitocybe with an intensely penetrating anise smell. Edible but not recommended due to the intensity of the smell, which can be overwhelming in cooking. Frequent in pine and oak forests in the central peninsula.'
) WHERE scientific_name = 'Clitocybe odora';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Petita clitocibe blanc-grisosa molt perillosa que creix en pastures i gespes. Conté muscarina en concentracions elevades. Pot confondre''s amb bolets comestibles de pastura. Cal evitar-la completament.',
    'description_en', 'Small white-gray clitocybe, very dangerous, growing in meadows and lawns. Contains muscarine at high concentrations. Can be confused with edible meadow mushrooms. Should be completely avoided.'
) WHERE scientific_name = 'Clitocybe dealbata';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Seta completament violàcia, característica del final de la temporada de tardor. El seu color lila-violaci inconfusible i gust suau la fan molt apreciada. Creix en boscos de caducifolis i vores de camp amb restes orgàniques.',
    'description_en', 'Completely violet mushroom, characteristic of the end of the autumn season. Its unmistakable lilac-violet color and mild taste make it highly prized. Grows in deciduous forests and field edges with organic matter.'
) WHERE scientific_name = 'Lepista nuda';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'El peu violaci o blewit de camp, amb barret marró crema i peu llamativament violaci. Comestible apreciat. Creix en pastures i camps en tardor, sovint en corros. El peu violaci el fa inconfusible entre les lepistes.',
    'description_en', 'The field blewit, with a cream-brown cap and a strikingly violet stem. Prized edible. Grows in meadows and fields in autumn, often in fairy rings. The violet stem makes it unmistakable among lepistas.'
) WHERE scientific_name = 'Lepista personata';
