-- Boletaceae: description CA/EN
UPDATE species
    SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
        'description_ca', 'El rei dels bolets. Un dels fongs més apreciats gastronòmicament a tot el món. La seva carn ferma i gust intens el fan insubstituïble a la cuina. Forma micorrizes amb pins, abets, faigs i roures.',
        'description_en', 'The king of mushrooms. One of the most gastronomically prized fungi worldwide. Its firm flesh and intense flavor make it irreplaceable in the kitchen. It forms mycorrhizae with pines, firs, beeches, and oaks.'
    )
    WHERE scientific_name = 'Boletus edulis';

UPDATE species
    SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
        'description_ca', 'Sureny molt apreciat de barret fosc, gairebé negre. Típic de la zona mediterrània sota alzines i roures. Més escàs que el B. edulis però igualment excel·lent. El més estival dels surenys nobles.',
        'description_en', 'Highly prized bolete with a dark, almost black cap. Typical of the Mediterranean area under holm oaks and oaks. Scarcer than B. edulis but equally excellent. The most summer-oriented of the noble boletes.'
    )
    WHERE scientific_name = 'Boletus aereus';

UPDATE species
    SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
        'description_ca', 'Parent del Boletus edulis, específic de pinedes. El seu barret color xocolata fosc a castany el diferencia del cep comú. D''excel·lent qualitat, molt apreciat. Sol aparèixer abans que el B. edulis a l''estiu.',
        'description_en', 'A relative of Boletus edulis, specific to pine forests. Its dark chocolate to chestnut cap differentiates it from the common porcini. Of excellent quality and highly prized. It usually appears earlier than B. edulis in summer.'
    )
    WHERE scientific_name = 'Boletus pinophilus';

UPDATE species
    SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
        'description_ca', 'El cep d''estiu, molt similar al B. edulis però amb el barret més sec i mat. Primera espècie del gènere en aparèixer cada any. Excel·lent comestible, molt apreciat a l''estiu quan els bolets escassegen.',
        'description_en', 'The summer bolete, very similar to B. edulis but with a drier and matte cap. The first species of the genus to appear each year. Excellent edible, highly prized in summer when mushrooms are scarce.'
    )
    WHERE scientific_name = 'Boletus reticulatus';

UPDATE species
    SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
        'description_ca', 'Bolet de pi de mida mitjana amb barret marró castany i porus blanquinosos que blavegen lleugerament al tall. Espècie comestible molt apreciada, freqüent en pinedes i fagedes del nord i centre peninsular. Es pot confondre amb el Boletus edulis, del qual es distingeix pels porus que blavegen i l''absència de reticle al peu.',
        'description_en', 'Medium-sized pine bolete with a chestnut brown cap and whitish pores that turn slightly blue when cut. Highly prized edible species, frequent in pine and beech forests of the northern and central peninsula. It can be confused with Boletus edulis, from which it is distinguished by the bluing pores and the absence of a reticulation on the stem.'
    )
    WHERE scientific_name = 'Imleria badia';

UPDATE species
    SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
        'description_ca', 'Bec de pollastre de peu esvelt amb escates negres característiques. Creix exclusivament associat a bedolls. La carn s''ennegreix o s''enrogeix al tallar-la. Comestible mediocre que millora amb cocció prolongada.',
        'description_en', 'Slender-stemmed bolete with characteristic black scales. It grows exclusively associated with birch trees. The flesh blackens or reddens when cut. Mediocre edible that improves with prolonged cooking.'
    )
    WHERE scientific_name = 'Leccinum scabrum';

UPDATE species
    SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
        'description_ca', 'Bec de pollastre robust amb barret taronja rovellat i peu blanc esquitxat d''escates fosques, associat principalment a bedolls. La carn blanca vira a violaci-negre al tall, cosa que en facilita la identificació. Comestible apreciat al nord d''Espanya i als Pirineus, tot i que requereix una cocció completa.',
        'description_en', 'Robust bolete with a rusty orange cap and a white stem dotted with dark scales, mainly associated with birch. The white flesh turns violet-black when cut, which aids identification. Prized edible in northern Spain and the Pyrenees, though it requires thorough cooking.'
    )
    WHERE scientific_name = 'Leccinum versipelle';

UPDATE species
    SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
        'description_ca', 'Molleric de vellut amb anell membranós. Exclusiu de pinedes. Cal pelar la cutícula viscosa abans de cuinar-lo. Comestible mediocre però abundant.',
        'description_en', 'Slippery and mucilaginous bolete with a membranous ring. Exclusive to pine forests. The viscous cuticle must be peeled before cooking. Mediocre but abundant edible.'
    )
    WHERE scientific_name = 'Suillus luteus';

UPDATE species
    SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
        'description_ca', 'Molleric granellut de barret groc ocre molt comú en pinedes de tota Espanya. Es reconeix per l''absència d''anell i els grànuls blanquinosos a l''àpex del peu que exuden gotetes lleitoses en exemplars joves. Comestible de qualitat moderada, cal retirar la cutícula viscosa abans de cuinar-lo.',
        'description_en', 'Viscid bolete with a yellow-ochre cap, very common in pine forests throughout Spain. It is recognized by the absence of a ring and the whitish granules at the apex of the stem that exude milky droplets in young specimens. Edible of moderate quality, the slimy cuticle must be removed before cooking.'
    )
    WHERE scientific_name = 'Suillus granulatus';

UPDATE species
    SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
        'description_ca', 'Molleric de peu curt mediterrani exclusiu de pinedes litorals i sublitorals. Els seus porus blanquinosos viren a rogencs amb l''edat. Sense anell. Espècie tardana que fructifica de la tardor a principis d''hivern a la costa mediterrània.',
        'description_en', 'Mediterranean viscid bolete exclusive to coastal and sub-coastal pine forests. Its whitish pores turn reddish with age. Without a ring. A late species that fruits from autumn to early winter on the Mediterranean coast.'
    )
    WHERE scientific_name = 'Suillus bellini';

UPDATE species
    SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
        'description_ca', 'Sureny vellutat de barret marró oliva amb porus angulosos grocs que blavegen feblement al tall. Espècie molt comuna en boscos mixtos i caducifolis de tota la península. Comestible però de qualitat mediocre, sovint parasitat pel fong Hypomyces chrysospermus.',
        'description_en', 'Velvety bolete with an olive-brown cap and angular yellow pores that turn faintly blue when cut. Very common species in mixed and deciduous forests throughout the peninsula. Edible but of mediocre quality, frequently parasitized by the fungus Hypomyces chrysospermus.'
    )
    WHERE scientific_name = 'Xerocomus subtomentosus';

UPDATE species
    SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
        'description_ca', 'Mataparent de peu vermell de gran mida amb barret gris oliva i peu amb un cridaner reticle vermell sobre fons groc. La carn groga blaveja intensament al tall i té un gust molt amarg, cosa que el fa incomestible. Espècie de muntanya que creix en fagedes i pinedes del nord i centre peninsular.',
        'description_en', 'Large bolete with an olive-gray cap and a stem with a striking red reticulation on a yellow background. The yellow flesh turns intensely blue when cut and has a very bitter taste, making it inedible. A mountain species that grows in beech and pine forests of the northern and central peninsula.'
    )
    WHERE scientific_name = 'Caloboletus calopus';

UPDATE species
    SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
        'description_ca', 'Mataparent de porus vermells amb reticle vermell sobre fons groc i barret marró grisenc. La carn blaveja molt intensament al tall. Comestible únicament ben cuinat; consumit cru o mal cuinat pot causar intoxicacions. Freqüent en rouredes i alzinedes calcàries del centre i sud d''Espanya.',
        'description_en', 'Red-stemmed bolete with a red reticulation on a yellow background and a brownish-gray cap. The flesh turns very intensely blue when cut. Edible only when well-cooked; consumed raw or poorly cooked, it can cause poisoning. Frequent in oak and holm oak groves on limestone soils in central and southern Spain.'
    )
    WHERE scientific_name = 'Suillellus luridus';

UPDATE species
    SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
        'description_ca', 'Mataparent de peu puntejat amb barret marró fosc, peu vermell amb punts vermells sense reticle i carn groga que blaveja instantàniament al tall. Comestible només ben cuinat, es confon amb el Rubroboletus satanas pel color del peu tot i que no té reticle. Espècie de muntanya freqüent en pinedes i fagedes.',
        'description_en', 'Bolete with a dark brown cap, red stem with red dots without reticulation, and yellow flesh that instantly turns blue when cut. Edible only when well-cooked, it is confused with Rubroboletus satanas due to the stem color, though it lacks a reticulation. A mountain species frequent in pine and beech forests.'
    )
    WHERE scientific_name = 'Neoboletus erythropus';

UPDATE species
    SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
        'description_ca', 'Mataparent de Satanàs, un dels bolets més tòxics d''Europa, amb un gran barret blanquinós, peu vermell amb un reticle vermell prominent i olor desagradable en la maduresa. La carn blaveja instantàniament al tall. Creix en sòls calcaris sota alzines i roures al centre i sud peninsular. Causa gastroenteritis greus.',
        'description_en', 'One of Europe''s most toxic boletes, with a large whitish cap, red stem with a prominent red reticulation, and an unpleasant odor at maturity. The flesh instantly turns blue when cut. It grows on limestone soils under holm oaks and oaks in the central and southern peninsula. Causes severe gastroenteritis.'
    )
    WHERE scientific_name = 'Rubroboletus satanas';

UPDATE species
    SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
        'description_ca', 'Bolet blavís fràgil i trencadís amb peu buit que blaveja de forma espectacular i instantània al tall, un dels més cridaners del gènere. Barret groc pàl·lid a ocre, de mida mitjana. Comestible apreciat, poc freqüent en pinedes i rouredes del nord peninsular.',
        'description_en', 'Fragile and brittle bolete with a hollow stem that turns spectacular and instant blue when cut, one of the most striking in the genus. Pale yellow to ochre cap, medium-sized. Prized edible, rare in pine and oak forests of the northern peninsula.'
    )
    WHERE scientific_name = 'Gyroporus cyanescens';

UPDATE species
    SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
        'description_ca', 'Sureny castany petit de color castany uniforme amb peu aviat buit i carn blanca que no canvia de color al tall. Creix sota roures i alzines al centre i sud d''Espanya. Comestible de bona qualitat, es distingeix d''altres surenys pel seu peu buit i l''absència de reacció al tall.',
        'description_en', 'Small bolete of uniform chestnut color with a stem that soon becomes hollow and white flesh that does not change color when cut. It grows under oaks and holm oaks in central and southern Spain. Good quality edible, distinguished from other boletes by its hollow stem and lack of reaction when cut.'
    )
    WHERE scientific_name = 'Gyroporus castaneus';

UPDATE species
    SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
        'description_ca', 'Bolet de peu groc petit de color canella fosc amb porus angulosos rogencs i gust molt picant que el fa incomestible. Creix en simbiosi amb l''Amanita muscaria sota pins, per la qual cosa alguns autors consideren que és paràsit d''aquesta micorriza. Àmpliament distribuït en pinedes de toda Espanya.',
        'description_en', 'Small cinnamon-brown bolete with reddish angular pores and a very peppery taste that makes it inedible. It grows in symbiosis with Amanita muscaria under pines, leading some authors to consider it a parasite of that mycorrhiza. Widely distributed in pine forests throughout Spain.'
    )
    WHERE scientific_name = 'Chalciporus piperatus';

UPDATE species
    SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
        'description_ca', 'Mataparent de peu puntejat de muntanya amb barret marró fosc, peu vermell amb punts (sense reticle) i carn que blaveja intensament al tall. Comestible només molt ben cuinat; es pot confondre amb el Rubroboletus satanas tot i que el seu barret és més fosc i creix a altituds més grans. Freqüent als Pirineus i a la serralada Cantàbrica.',
        'description_en', 'Mountain bolete with a dark brown cap, red stem with dots (no reticulation), and flesh that turns intensely blue when cut. Edible only when very well-cooked; it can be confused with Rubroboletus satanas, although its cap is darker and it grows at higher altitudes. Frequent in the Pyrenees and the Cantabrian Range.'
    )
    WHERE scientific_name = 'Neoboletus luridiformis';

UPDATE species
    SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
        'description_ca', 'Sureny daurat petit i cridaner amb barret roig ataronjat a daurat brillant i peu amb reticle daurat. Espècie poc freqüent associada a roures i castanyers al nord peninsular. Comestible, però la seva escassetat aconsella respectar-lo. Es distingeix fàcilment per la seva coloració daurada.',
        'description_en', 'Small and striking bolete with a red-orange to bright golden cap and a golden reticulated stem. Uncommon species associated with oaks and chestnuts in the northern peninsula. Edible, but its scarcity suggests respecting it. Easily distinguished by its golden coloration.'
    )
    WHERE scientific_name = 'Aureoboletus gentilis';

UPDATE species
    SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
        'description_ca', 'Sureny reial de gran mida i barret rosat violaci inconfusible. Els porus són grocs brillants. No blaveja al tall, la carn roman ferma i groga. Espècie micorrizògena de planifolis, menys freqüent que el B. edulis.',
        'description_en', 'Large bolete with an unmistakable pinkish-violet cap. The pores are bright yellow. It does not turn blue when cut; the flesh remains firm and yellow. Mycorrhizal species of broadleaf trees, less frequent than B. edulis.'
    )
    WHERE scientific_name = 'Butyriboletus regius';