-- Physalacriaceae (6 species)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'La seta d''hivern o enokitake, amb barret taronja-mel brillant i peu aterciopellat negre. Comestible apreciat, especialment cultivat per a la cuina asiàtica. Apareix en plena hivern quan la majoria dels bolets han desaparegut.',
    'description_en', 'The velvet shank or enoki mushroom, with a shiny honey-orange cap and black velvety stem. Prized edible, especially cultivated for Asian cuisine. Appears in midwinter when most mushrooms have disappeared.'
) WHERE scientific_name = 'Flammulina velutipes';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Paràsit forestal que creix en grans calàpets sobre fusta morta o debilitada. Comestible però cal una cocció completa. Els rizomorfs negres (cordons miceliars) que irradien del peu són un tret diagnòstic molt útil.',
    'description_en', 'Forest parasite that grows in large clusters on dead or weakened wood. Edible but thorough cooking is required. The black rhizomorphs (mycelial cords) radiating from the stem are a very useful diagnostic feature.'
) WHERE scientific_name = 'Armillaria mellea';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'El préssec arrugat, seta inconfusible pel seu barret rosat-salmó amb xarxa d''arrugues relleus i peu rosat. Incomestible. Espècie rara associada exclusivament a olmes morts, en fort declivi per la grafiosi de l''om.',
    'description_en', 'The wrinkled peach, unmistakable for its pink-salmon cap with a raised network of wrinkles and pink stem. Inedible. Rare species associated exclusively with dead elms, in sharp decline due to Dutch elm disease.'
) WHERE scientific_name = 'Rhodotus palmatus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'La porcel·lana del faig o collibia mucosa, seta d''aspecte translúcid i cutícula extremadament viscosa blanc-lleter. Comestible de qualitat mediocre. Creix exclusivament sobre faigs, sempre en plena tardor.',
    'description_en', 'The porcelain fungus, with a translucent appearance and an extremely viscous milky-white cuticle. Mediocre quality edible. Grows exclusively on beeches, always in full autumn.'
) WHERE scientific_name = 'Oudemansiella mucida';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'L''oudemansiella radicant, recognoscible pel seu llarg peu cartilaginós que s''endinsa profundament al sòl fins a arrels enterrades. Incomestible. Creix sobre arrels de planifolis, apareixent com si sorgís directament del terra.',
    'description_en', 'The deep root mushroom, recognizable by its long cartilaginous stem that sinks deep into the soil to buried roots. Inedible. Grows on broadleaf roots, appearing as if it rises directly from the ground.'
) WHERE scientific_name = 'Oudemansiella radicata';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'La strobilurus de l''avet, minúscula seta comestible que creix exclusivament sobre pinyes d''avet i pi enterrades o semienterrades. Comestible de bona qualitat per la seva mida. Apareix a finals d''hivern i principis de primavera.',
    'description_en', 'The spruce cone mushroom, a tiny edible that grows exclusively on buried or semi-buried fir and pine cones. Good quality edible for its size. Appears in late winter and early spring.'
) WHERE scientific_name = 'Strobilurus esculentus';

-- Psathyrellaceae (6 species)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Seta allargada i inconfusible que s''autodigereix convertint-se en tinta negra (deliqüescència). Comestible excel·lent quan jove i blanc, però s''ha d''evitar l''alcohol. Un dels bolets de prat més fàcils d''identificar.',
    'description_en', 'Elongated and unmistakable mushroom that self-digests into black ink (deliquescence). Excellent edible when young and white, but alcohol should be avoided. One of the easiest meadow mushrooms to identify.'
) WHERE scientific_name = 'Coprinus comatus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'El coprin micaci o tinter brillant, amb barret de color mel adornat amb granulacions brillants micàcies que desapareixen. Comestible però conté coprina que reacciona amb l''alcohol. Creix en calàpets sobre fusta morta.',
    'description_en', 'The glistening inkcap, with a honey-colored cap adorned with glistening micaceous granules that disappear with age. Edible but contains coprine that reacts with alcohol. Grows in clusters on dead wood.'
) WHERE scientific_name = 'Coprinellus micaceus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'El coprin gris o tinter gris, que es deliqüeix en tinta negra a la maduresa. Comestible però conté coprina: consumit amb alcohol causa taquicàrdia i enrogiment cutani. Creix en calàpets al peu d''arbres caducifolis.',
    'description_en', 'The inky cap, which deliquesces into black ink at maturity. Edible but contains coprine: consumed with alcohol it causes tachycardia and skin flushing. Grows in clusters at the base of deciduous trees.'
) WHERE scientific_name = 'Coprinopsis atramentaria';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Psatirela de Candolle, fràgil seta crema-pàl·lida amb restes de vel al marge que creix en calàpets sobre fusta morta de caducifolis. Incomestible. Molt freqüent en parcs i jardins urbans sobre soques velles.',
    'description_en', 'Candolle''s brittlestem, a fragile pale-cream mushroom with veil remnants at the margin growing in clusters on dead deciduous wood. Inedible. Very common in urban parks and gardens on old stumps.'
) WHERE scientific_name = 'Psathyrella candolleana';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Petit fong de fems amb barret gris i restes de vel al marge en forma de dent. Incomestible. Creix sobre fems i sòls nitrogenats. Algunes varietats contenen psilocibina, tot i que en concentracions molt baixes.',
    'description_en', 'Small dung mushroom with a gray cap and tooth-like veil remnants at the margin. Inedible. Grows on dung and nitrogen-rich soils. Some varieties contain psilocybin, though in very low concentrations.'
) WHERE scientific_name = 'Panaeolus papilionaceus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'La seta ploranera o lacrymaria, amb barret fibrós-escamós marró-canyella i làmines que exsuden gotetes de líquid en temps humit. Incomestible. Creix en pastures, vores de camins i boscos de tota la Península.',
    'description_en', 'The weeping widow, with a fibrous-scaly cinnamon-brown cap and gills that exude liquid droplets in humid weather. Inedible. Grows in meadows, roadsides, and forests throughout the Peninsula.'
) WHERE scientific_name = 'Lacrymaria lacrymabunda';

-- Pleurotaceae (5 species)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Una de les setes més cultivades del món. Creix en colònies sobre troncs d''arbres caducifolis morts. De gust suau i textura agradable, excel·lent en tots els estils de cuina. Apareix de la tardor a la primavera, fins i tot en hivern.',
    'description_en', 'One of the most cultivated mushrooms in the world. Grows in colonies on dead deciduous tree trunks. Mild taste and pleasant texture, excellent in all cooking styles. Appears from autumn to spring, even in winter.'
) WHERE scientific_name = 'Pleurotus ostreatus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'La seta de card o gírgola de card, associada simbiòticament a arrels d''Eryngium en zones mediterrànies àrides. Un dels comestibles més apreciats d''Espanya, amb carn ferma i gust potent. Es cultiva àmpliament.',
    'description_en', 'The king oyster mushroom, symbiotically associated with Eryngium roots in arid Mediterranean areas. One of the most prized edibles in Spain, with firm flesh and a strong taste. Widely cultivated.'
) WHERE scientific_name = 'Pleurotus eryngii';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Gírgola ramificada de color crema amb barret infundibuliforme i peu central fusionat en la base. Comestible de bona qualitat, similar a P. ostreatus. Creix en calàpets denses sobre fusta morta de caducifolis.',
    'description_en', 'Branching oyster mushroom of cream color with a funnel-shaped cap and central stem fused at the base. Good quality edible, similar to P. ostreatus. Grows in dense clusters on dead deciduous wood.'
) WHERE scientific_name = 'Pleurotus cornucopiae';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Gírgola d''estiu o gírgola blanca, similar a P. ostreatus però de color més pàl·lid i creixent principalment a l''estiu. Comestible de bona qualitat. Prefereix temps càlid i creix sobre fusta morta de planifolis.',
    'description_en', 'The summer oyster or pale oyster, similar to P. ostreatus but paler in color and growing mainly in summer. Good quality edible. Prefers warm weather and grows on dead broadleaf wood.'
) WHERE scientific_name = 'Pleurotus pulmonarius';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Petita seta en forma d''espàtula o cullera de color gris-pardo, que creix sobre fusta morta i restes orgàniques. Incomestible per la seva mida i consistència. Poc freqüent, sovint passa desapercebuda pels recol·lectors.',
    'description_en', 'Small spatula or spoon-shaped mushroom of gray-brown color, growing on dead wood and organic matter. Inedible due to its size and consistency. Uncommon, often overlooked by foragers.'
) WHERE scientific_name = 'Hohenbuehelia petaloides';

-- Entolomataceae (5 species)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'L''entoloma livide o gírgola borda, gran entoloma de color gris-beige i olor desagradable de farina rança. Tòxica: causa greus trastorns gastrointestinals. Ha causat intoxicacions massives quan es confon amb gírgoles o roldanillos.',
    'description_en', 'The livid entoloma, a large entoloma of gray-beige color and unpleasant rancid flour smell. Toxic: causes serious gastrointestinal disorders. Has caused mass poisonings when confused with oyster mushrooms or similar.'
) WHERE scientific_name = 'Entoloma sinuatum';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Entoloma de mida mitjana amb barret gris-marró higròfan i espores rosades característiques. Tòxic. Creix en prats, marges de camins i boscos clars. L''esporeada rosada és el tret diagnòstic clau del gènere Entoloma.',
    'description_en', 'Medium-sized entoloma with a hygrophanous gray-brown cap and characteristic pink spores. Toxic. Grows in meadows, roadsides, and open forests. The pink spore print is the key diagnostic feature of the Entoloma genus.'
) WHERE scientific_name = 'Entoloma rhodopolium';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Entoloma primaveral de barret gris-marró amb olor a farina, que creix en prats i vores de jardins. Tòxic. Una de les poques entolomes de primavera, creix associat a rosers, pomeres i altres rosàcies silvestres.',
    'description_en', 'Spring entoloma with a gray-brown cap and flour smell, growing in meadows and garden borders. Toxic. One of the few spring entolomas, growing associated with roses, apple trees, and other wild rosaceae.'
) WHERE scientific_name = 'Entoloma clypeatum';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'El roldanillo o mola, gran clitocibe blanca amb fort olor a farina fresca i làmines molt decurrents. Comestible apreciat. Cal tenir molta precaució: es pot confondre amb Clitocybe nebularis (tòxica) o amb entolomes perilloses.',
    'description_en', 'The sweetbread mushroom, a large white clitocybe with a strong fresh flour smell and very decurrent gills. Prized edible. Great caution is needed: it can be confused with Clitocybe nebularis (toxic) or dangerous entolomas.'
) WHERE scientific_name = 'Clitopilus prunulus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Entoloma de barret blanc-grisós sedós i olor a farina, de mida mitjana a gran. Tòxic. Molt similar a Clitopilus prunulus (comestible), però se''n distingeix per l''esporeada rosada i l''absència de làmines decurrents marcades.',
    'description_en', 'Entoloma with a silky white-gray cap and flour smell, medium to large in size. Toxic. Very similar to Clitopilus prunulus (edible), but distinguished by the pink spore print and absence of strongly decurrent gills.'
) WHERE scientific_name = 'Entoloma lividoalbum';

-- Hymenogastraceae (5 species)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'El peu de pastis o hebeloma d''olor a rave, amb barret crema-ocre viscós en humit. Tòxic, causa trastorns gastrointestinals. L''olor persistent a rave picant és el senyal d''alarma més fiable per identificar-lo.',
    'description_en', 'The poison pie, with a viscous cream-ochre cap when wet. Toxic, causes gastrointestinal disorders. The persistent radish smell is the most reliable warning sign to identify it.'
) WHERE scientific_name = 'Hebeloma crustuliniforme';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Hebeloma gran d''olor molt intens a rave picant, amb barret carnós marró-rosat. Tòxic. Un dels hebelomes de major mida, freqüent en boscos de planifolis i coníferes. L''olor intens a rave el fa fàcilment recognoscible.',
    'description_en', 'Large hebeloma with a very intense horseradish smell, with a fleshy brownish-pink cap. Toxic. One of the largest hebelomas, common in broadleaf and conifer forests. The intense radish smell makes it easily recognizable.'
) WHERE scientific_name = 'Hebeloma sinapizans';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'La galerina marginada, petita seta mortal que conté amatoxines en les mateixes concentracions que A. phalloides. Creix sobre fusta morta de coníferes. Molt perillosa per la semblança amb la comestible Kuehneromyces mutabilis.',
    'description_en', 'The deadly skullcap, a small deadly mushroom containing amatoxins at the same concentrations as A. phalloides. Grows on dead conifer wood. Very dangerous due to its resemblance to the edible Kuehneromyces mutabilis.'
) WHERE scientific_name = 'Galerina marginata';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'El peu de flama o gymnopilus espectacular, gran seta taronja-daurada amb anell que creix en calàpets sobre fusta morta. Incomestible i alucinògena. El seu color intens daurat i la mida espectacular el fan molt cridaner.',
    'description_en', 'The spectacular rustgill, a large golden-orange mushroom with a ring growing in clusters on dead wood. Inedible and hallucinogenic. Its intense golden color and spectacular size make it very striking.'
) WHERE scientific_name = 'Gymnopilus junonius';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'La semilanceata o barret de llibertat, petita seta de pastures amb papil·la apical característica i làmines que fosquegen. Conté psilocibina i psilocina, substàncies il·legals a Espanya. No s''ha de recol·lectar.',
    'description_en', 'The liberty cap, a small grassland mushroom with a characteristic apical papilla and darkening gills. Contains psilocybin and psilocin, substances illegal in Spain. Should not be harvested.'
) WHERE scientific_name = 'Psilocybe semilanceata';

-- Bankeraceae (5 species)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'El sarcodon escamós o peu blau, amb gran barret marró cobert de grans escames imbricades i aguijons grisos a la part inferior. Comestible però de gust amargant que millora amb blanqueig previ. Creix en pinedes de tot el territori.',
    'description_en', 'The shingled hedgehog, with a large brown cap covered in large imbricate scales and gray spines on the underside. Edible but with a bitter taste that improves with prior blanching. Grows in pine forests throughout the territory.'
) WHERE scientific_name = 'Sarcodon imbricatus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Sarcodon similar a S. imbricatus però amb base del peu de color blau-verdós diagnòstic. Incomestible per l''amargor intensa. El color blau-verdós del peu en el tall és el tret diferencial clau respecte a S. imbricatus.',
    'description_en', 'Sarcodon similar to S. imbricatus but with a diagnostic blue-green base of the stem. Inedible due to intense bitterness. The blue-green color of the stem when cut is the key differentiating feature from S. imbricatus.'
) WHERE scientific_name = 'Sarcodon scabrosus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'La dent del diable, seta d''aspecte terrorífic que exsuda gotetes de líquid vermell sang en la joventut, un dels espectacles fúngics més sorprenents. Incomestible. Espècie indicadora de boscos antics i sòls no pertorbats.',
    'description_en', 'The devil''s tooth, a terrifying-looking mushroom that exudes blood-red liquid droplets when young, one of the most surprising fungal spectacles. Inedible. Indicator species of ancient forests and undisturbed soils.'
) WHERE scientific_name = 'Hydnellum peckii';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Fong terrícola gris-negre amb aguijons a la cara inferior del barret irregular. Incomestible. Espècie indicadora de boscos antics i poc alterats. La seva presència indica la bona salut del sòl forestal.',
    'description_en', 'Gray-black terrestrial fungus with spines on the underside of the irregular cap. Inedible. Indicator species of ancient and little-disturbed forests. Its presence indicates good forest soil health.'
) WHERE scientific_name = 'Phellodon niger';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Fong terrícola blanc-crema amb aguijons sota el barret, que s''enfosqueix amb l''edat. Incomestible. Espècie indicadora de boscos de coníferes vells i poc pertorbats dels Pirineus i zones de muntanya del nord peninsular.',
    'description_en', 'White-cream terrestrial fungus with spines under the cap, darkening with age. Inedible. Indicator species of old and little-disturbed conifer forests in the Pyrenees and mountain areas of the northern peninsula.'
) WHERE scientific_name = 'Bankera fuligineoalba';

-- Phallaceae (5 species)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'El fal·lus o cuesco del diable, emergeix d''una volva blanca en forma d''ou i desplega un receptacle blanquinós amb una gleba olivàcia d''olor fètida que atrau les mosques disseminadores d''espores. Incomestible.',
    'description_en', 'The common stinkhorn, emerges from a white egg-shaped volva and deploys a whitish receptacle with an olive-colored, fetid-smelling gleba that attracts spore-dispersing flies. Inedible.'
) WHERE scientific_name = 'Phallus impudicus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Fal·lus mediterrani similar a P. impudicus però amb volva rosada-violàcia i preferència per sòls arenosos litorals. Incomestible. Menys freqüent que el fal·lus comú, present principalment a zones costaneres mediterrànies.',
    'description_en', 'Mediterranean stinkhorn similar to P. impudicus but with a pink-violet volva and preference for coastal sandy soils. Inedible. Less common than the common stinkhorn, present mainly in Mediterranean coastal areas.'
) WHERE scientific_name = 'Phallus hadriani';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'L''enreixat roig o gàbia del diable, seta d''aspecte extraterrestre amb receptacle en forma de gàbia esférica vermella i olor fètida. Incomestible. Espècie invasora originària d''Austràlia, cada vegada més freqüent a la Mediterrània.',
    'description_en', 'The red cage fungus, with an otherworldly appearance and a spherical red cage-like receptacle with a fetid smell. Inedible. Invasive species native to Australia, increasingly common in the Mediterranean.'
) WHERE scientific_name = 'Clathrus ruber';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Els dits del diable, espècie invasora originària d''Austràlia arribada a Europa amb llana importada. El seu receptacle en forma de dits de polp rosats emergents d''una volva blanca és inconfusible. Incomestible i d''olor fètida.',
    'description_en', 'The devil''s fingers, an invasive species native to Australia that arrived in Europe with imported wool. Its octopus-like pink fingers emerging from a white volva is unmistakable. Inedible and with a fetid smell.'
) WHERE scientific_name = 'Clathrus archeri';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'El fal·lus del gos, petit fal·lus amb receptacle taronja-rosat i cap perforat cobert de gleba olivàcia fètida. Incomestible. Menys espectacular que el fal·lus comú, creix en boscos i jardins de tota la Península.',
    'description_en', 'The dog stinkhorn, a small stinkhorn with an orange-pink receptacle and perforated head covered with fetid olive gleba. Inedible. Less spectacular than the common stinkhorn, it grows in forests and gardens throughout the Peninsula.'
) WHERE scientific_name = 'Mutinus caninus';

-- Morchellaceae (4 species)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'La primera seta comestible de primavera. El seu aspecte únic amb barret alvèolat la fa inconfusible. Excel·lent comestible, molt apreciat a la cuina europea i nordamericana. Creix en primavera en boscos de planifolis i coníferes.',
    'description_en', 'The first edible mushroom of spring. Its unique appearance with an alveolate cap makes it unmistakable. Excellent edible, highly prized in European and North American cuisine. Grows in spring in broadleaf and conifer forests.'
) WHERE scientific_name = 'Morchella esculenta';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Morella negra o morilla cónica amb barret alvèolat de costelles verticals ben definides i color fosc. Excel·lent comestible de primavera. Cal sempre cuinar-la bé, ja que en cru conté toxines termolàbils. Freqüent en boscos cremats.',
    'description_en', 'The black morel or conical morel, with an alveolate cap of well-defined vertical ribs and dark color. Excellent spring edible. Always cook thoroughly, as raw it contains heat-labile toxins. Common in burned forests.'
) WHERE scientific_name = 'Morchella elata';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Morella cónica primaveral amb barret alvèolat marró i peu blanc-crema cilíndric. Excel·lent comestible. Molt similar a M. elata, considerada per alguns autors la mateixa espècie. Creix en boscos de planifolis i riberes.',
    'description_en', 'Conical spring morel with a brown alveolate cap and a cylindrical cream-white stem. Excellent edible. Very similar to M. elata, considered by some authors to be the same species. Grows in broadleaf forests and riverbanks.'
) WHERE scientific_name = 'Morchella conica';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Morella d''aparició freqüent en sòls alterats i jardins, amb barret cónic de costelles longitudinals i color marró clar. Excel·lent comestible. Adaptada a entorns urbans, és la morella més freqüent en jardins i parcs de la Península.',
    'description_en', 'Morel frequently appearing on disturbed soils and gardens, with a conical cap of longitudinal ribs and light brown color. Excellent edible. Adapted to urban environments, it is the most common morel in gardens and parks in the Peninsula.'
) WHERE scientific_name = 'Morchella importuna';
