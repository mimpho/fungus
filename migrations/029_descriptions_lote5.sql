-- Helvellaceae (3)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Orelleta gris-negra amb peu marcadament acostillat i forma mitriforme bilobulada. Espècie que conté giromitrines termolàbils; requereix cocció completa. Creix en boscos de coníferes i caducifolis de primavera a tardor.',
    'description_en', 'Gray-black elfin saddle with a strongly ribbed stem and bilobed miter shape. Species that contains heat-labile gyromitrin toxins; requires thorough cooking. Grows in conifer and deciduous forests from spring to autumn.'
) WHERE scientific_name = 'Helvella lacunosa';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Orelleta blanca-crema amb barret bilobulat i peu amb profundes costelles i cavitats, molt ornamental. Conté giromitrines; cal cuinar-la bé. Creix en primavera en boscos de caducifolis i coníferes de tot el territori.',
    'description_en', 'White-cream elfin saddle with a bilobed cap and a stem with deep ribs and cavities, very ornamental. Contains gyromitrin; must be cooked thoroughly. Grows in spring in deciduous and conifer forests throughout the territory.'
) WHERE scientific_name = 'Helvella crispa';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Copa marró en forma de calze amb l''exterior acostillat, que creix en primavera en boscos de caducifolis. Conté giromitrines termolàbils; no s''ha de consumir sense cocció adequada. Poc freqüent.',
    'description_en', 'Brown chalice-shaped cup with a ribbed exterior, growing in spring in deciduous forests. Contains heat-labile gyromitrin; should not be consumed without adequate cooking. Uncommon.'
) WHERE scientific_name = 'Helvella acetabulum';

-- Tuberaceae (3)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'La tòfona negra de Perigord o tòfona negra d''hivern, el fong més cotitzat de la gastronomia mundial. De gust i aroma intensíssims i inconfusibles. Es troba hipogea sota roures, alzines i avellanes en sòls calcaris.',
    'description_en', 'The Périgord black truffle, the most prized fungus in world gastronomy. Intensely flavored and unmistakably aromatic. Found underground under oaks, holm oaks, and hazelnuts on limestone soils.'
) WHERE scientific_name = 'Tuber melanosporum';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'La tòfona d''estiu o tòfona de Sant Joan, de menor qualitat que T. melanosporum però molt més accessible. Gust i aroma discrets però agradables. Creix hipogea sota roures i alzines, trobada de juny a novembre.',
    'description_en', 'The summer truffle or burgundy truffle, of lesser quality than T. melanosporum but much more accessible. Discreet but pleasant taste and aroma. Found underground under oaks and holm oaks, found from June to November.'
) WHERE scientific_name = 'Tuber aestivum';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'La tòfona blanca de primavera o bianchetto, d''aroma intens a all, que creix hipogea sota pins i alzines. De menor valor que les tòfones negres, és apreciada en algunes regions mediterrànies. Es recol·lecta de gener a abril.',
    'description_en', 'The spring white truffle or bianchetto, with an intense garlic aroma, found underground under pines and holm oaks. Of lesser value than black truffles, it is prized in some Mediterranean regions. Harvested from January to April.'
) WHERE scientific_name = 'Tuber borchii';

-- Mycenaceae (3)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'El micena de la soca o galeritat gris, una de les mycenes més comunes sobre fusta morta de caducifolis. Incomestible per la seva mida insignificant. Creix tot l''any en calàpets densos sobre soques i troncs en descomposició.',
    'description_en', 'The common bonnet, one of the most common mycenas on dead deciduous wood. Inedible due to its tiny size. Grows year-round in dense clusters on stumps and decomposing logs.'
) WHERE scientific_name = 'Mycena galericulata';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'La mycena sagnant, recognoscible perquè en trencar el peu exsuda làtex rogenc-vinaci. Incomestible. Creix en calàpets densos sobre fusta morta de caducifolis, especialment en fagedes i rouredes humides.',
    'description_en', 'The bleeding bonnet, recognizable because breaking the stem exudes reddish-vinous latex. Inedible. Grows in dense clusters on dead deciduous wood, especially in humid beech and oak forests.'
) WHERE scientific_name = 'Mycena haematopus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'La mycena bioluminiscent, que emet una suau llum verd-blavosa a la foscor. Originàriament d''Àsia, ha estat introduïda a Europa. Incomestible. Un dels pocs bolets bioluminiscents confirmats, especialment espectacular de nit.',
    'description_en', 'The ghost fungus, which emits a soft blue-green glow in the dark. Originally from Asia, it has been introduced to Europe. Inedible. One of the few confirmed bioluminescent mushrooms, especially spectacular at night.'
) WHERE scientific_name = 'Mycena chlorophos';

-- Tapinellaceae (2)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Seta molt comú amb barret marró-oliva de marge enrotllat i làmines decurrents que s''arriben a separar. Tòxica: consumida repetidament causa anèmia hemolítica. La seva abundant presència la fa especialment perillosa.',
    'description_en', 'Very common mushroom with an olive-brown cap with an inrolled margin and decurrent gills that can detach. Toxic: repeatedly consumed it causes hemolytic anemia. Its abundant presence makes it especially dangerous.'
) WHERE scientific_name = 'Paxillus involutus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Seta amb barret marró-rovell i peu lateral aterciopellat negre, que creix sobre soques de coníferes. Incomestible per l''amargor intensa. La combinació de barret marró i peu aterciopellat negre la fa recognoscible.',
    'description_en', 'Mushroom with a rust-brown cap and black velvety lateral stem, growing on conifer stumps. Inedible due to intense bitterness. The combination of brown cap and black velvety stem makes it recognizable.'
) WHERE scientific_name = 'Tapinella atrotomentosa';

-- Hydnaceae (2)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Seta fàcil d''identificar pels seus aguijons o dentetes sota el barret en lloc de làmines. Comestible de bona qualitat, de gust suau i lleugerament amargant. Creix en boscos de pins i caducifolis de tota la Península.',
    'description_en', 'Mushroom easy to identify by its spines or small teeth under the cap instead of gills. Good quality edible, mild and slightly bitter taste. Grows in pine and deciduous forests throughout the Peninsula.'
) WHERE scientific_name = 'Hydnum repandum';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Seta d''eriçó més petita i de color més ataronjat-salmó que H. repandum. Comestible de bona qualitat. Creix en boscos de pins i caducifolis, sovint en els mateixos llocs que H. repandum, amb el qual es pot confondre fàcilment.',
    'description_en', 'Smaller hedgehog mushroom with more orange-salmon color than H. repandum. Good quality edible. Grows in pine and deciduous forests, often in the same places as H. repandum, with which it can be easily confused.'
) WHERE scientific_name = 'Hydnum rufescens';

-- Omphalotaceae (2)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'El fals rossinyol o seta de l''olivera, vistosa seta taronja que creix a la base d''oliveres i alzines en zones mediterrànies. Tòxica i bioluminiscent. Es confon fàcilment amb Cantharellus cibarius però és venenosa.',
    'description_en', 'The jack-o-lantern mushroom, a striking orange mushroom growing at the base of olive and holm oak trees in Mediterranean areas. Toxic and bioluminescent. Easily confused with Cantharellus cibarius but is poisonous.'
) WHERE scientific_name = 'Omphalotus olearius';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'El shiitake, un dels bolets comestibles més cultivats i consumits del món. Originari d''Àsia oriental. Gust intens i umami molt apreciat. Es cultiva sobre fusta de roure i castanyer, i és cada cop més freqüent als boscos de la Península.',
    'description_en', 'The shiitake, one of the most cultivated and consumed edible mushrooms in the world. Native to East Asia. Intense umami flavor highly prized. Cultivated on oak and chestnut wood, increasingly common in forests of the Peninsula.'
) WHERE scientific_name = 'Lentinula edodes';

-- Lyophyllaceae (2)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'La seta de primavera per excel·lència. Apareix entorn del dia de Sant Jordi (23 d''abril). Comestible de gran qualitat, molt apreciada a Catalunya i Aragó. El seu barret blanc-crema compacte i olor a farina la fan inconfusible.',
    'description_en', 'The spring mushroom par excellence. Appears around Saint George''s Day (April 23rd). Excellent quality edible, highly prized in Catalonia and Aragon. Its compact white-cream cap and flour smell make it unmistakable.'
) WHERE scientific_name = 'Calocybe gambosa';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Seta dels atris o agrocybe gregària, que fructifica en grans grups formant corros en marges de camins i vores de bosc. Comestible de qualitat moderada. Reconeixible per la seva tendència a créixer en masses denses.',
    'description_en', 'The clustered domecap, fruiting in large groups forming rings on roadsides and forest edges. Moderate quality edible. Recognizable by its tendency to grow in dense masses.'
) WHERE scientific_name = 'Lyophyllum decastes';

-- Inocybaceae (2)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'La inocybe de barret esquerdat, amb superfície fibrosa radialment fissurada de color palla. Tòxica per contingut en muscarina. Un dels gèneres més perillosos per als recol·lectors novells per l''aspecte inofensiu.',
    'description_en', 'The split fibrecap, with a radially fissured fibrous surface of straw color. Toxic due to muscarine content. One of the most dangerous genera for novice foragers due to its harmless appearance.'
) WHERE scientific_name = 'Inocybe rimosa';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Inocybe blanca que enrogeix en tocar-la o manipular-la, cosa que la fa relativament recognoscible. Tòxica i mortal per alt contingut en muscarina. Creix en boscos de caducifolis i coníferes, especialment en primavera i tardor.',
    'description_en', 'White fibrecap that turns reddish when touched or handled, making it relatively recognizable. Toxic and deadly due to high muscarine content. Grows in deciduous and conifer forests, especially in spring and autumn.'
) WHERE scientific_name = 'Inocybe erubescens';

-- Ganodermataceae (2)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Fong medicinal molt valorat en la medicina tradicional xinesa (Reishi). La seva cutícula lacada de color rogenc brillant el fa inconfusible. Incomestible per la consistència llenyosa. Usat en extractes i suplements.',
    'description_en', 'Medicinal fungus highly valued in traditional Chinese medicine (Reishi). Its lacquered reddish-shiny cuticle makes it unmistakable. Inedible due to woody consistency. Used in extracts and supplements.'
) WHERE scientific_name = 'Ganoderma lucidum';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'El iesquer pla o ganoderma aplanat, polípor llenyós perenne que forma grans consoles sobre planifolis. Incomestible. La part inferior allibera masses de pols marró quan es pertorba. Usat per artistes per gravar dibuixos a la carn blanca.',
    'description_en', 'The artist''s conk, a perennial woody polypore forming large brackets on hardwoods. Inedible. The underside releases clouds of brown dust when disturbed. Used by artists to engrave drawings on the white flesh.'
) WHERE scientific_name = 'Ganoderma applanatum';

-- Meripilaceae (2)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'El polípor gegant, que pot arribar als 100 cm de diàmetre formant grans rosetes a la base de planifolis. Comestible quan jove, la carn es torna negra al tall en la maduresa. Un dels bolets de major mida d''Europa.',
    'description_en', 'The giant polypore, which can reach 100 cm in diameter forming large rosettes at the base of hardwoods. Edible when young, the flesh turns black when cut at maturity. One of the largest mushrooms in Europe.'
) WHERE scientific_name = 'Meripilus giganteus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'La maitake o gallina del bosc, polípor formant grans rosetes a la base de roures i castanyers. Excel·lent comestible molt apreciat a la cuina japonesa. Valorat també per propietats medicinals (polisacàrids beta-glucans).',
    'description_en', 'The maitake or hen of the woods, polypore forming large rosettes at the base of oaks and chestnuts. Excellent edible highly prized in Japanese cuisine. Also valued for medicinal properties (beta-glucan polysaccharides).'
) WHERE scientific_name = 'Grifola frondosa';

-- Hericiaceae (2)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'La melena de lleó o hericium eriçó, seta comestible i medicinal amb aspecte de bola blanca de llargues espines pèndules. Comestible excel·lent. Cada cop més estudiat per possibles propietats neuroprotectores. Creix sobre planifolis vells.',
    'description_en', 'The lion''s mane, an edible and medicinal mushroom with the appearance of a white ball with long pendant spines. Excellent edible. Increasingly studied for possible neuroprotective properties. Grows on old hardwood trees.'
) WHERE scientific_name = 'Hericium erinaceus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'El hericium corall, amb estructura ramificada similar a un coral marí blanc. Excel·lent comestible. Espècie rara i protegida en molts països europeus. Creix sobre fusta morta de planifolis i coníferes, especialment avet i faig.',
    'description_en', 'The coral tooth fungus, with a branched structure similar to white marine coral. Excellent edible. Rare and protected species in many European countries. Grows on dead wood of hardwoods and conifers, especially fir and beech.'
) WHERE scientific_name = 'Hericium coralloides';

-- Marasmiaceae (2)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Seta petita i aromàtica que creix formant corros de bruixes en prats i jardins. Molt apreciada per l''aroma intens, excel·lent assecada. Una de les setes de prat més valorades culinàriament per a salses i ous.',
    'description_en', 'Small and aromatic mushroom that grows in fairy rings in meadows and gardens. Highly prized for its intense aroma, excellent when dried. One of the most culinarily valued meadow mushrooms for sauces and eggs.'
) WHERE scientific_name = 'Marasmius oreades';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'La marasmia roda, minúscula seta amb barret blanc en forma de roda de radis sobre peu negre molt fi. Incomestible per la mida. Reconeixible per la forma peculiar del barret que recorda a una roda de carro miniatura.',
    'description_en', 'The collared parachute, a tiny mushroom with a white wheel-spoked cap on a very fine black stem. Inedible due to size. Recognizable by the peculiar shape of the cap that resembles a miniature cartwheel.'
) WHERE scientific_name = 'Marasmius rotula';

-- Gomphaceae (1)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Seta amb forma de trompeta o embut de color violaci-lila en la joventut, que fructifica en grups en fagedes i pinedes de muntanya. Comestible apreciat. El seu color violaci inconfusible en fresc la fa fàcil d''identificar.',
    'description_en', 'Mushroom with a trumpet or funnel shape of violet-lilac color when young, fruiting in groups in beech and mountain pine forests. Prized edible. Its unmistakable violet color when fresh makes it easy to identify.'
) WHERE scientific_name = 'Gomphus clavatus';

-- Discinaceae (1)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'La falsa colmenilla o mitra de bisbe, amb aspecte cerebriforme marró-rogenc. Conté giromitrines, tòxines letals termolàbils. PERILLOSA: s''ha confós fatalment amb morelles. Cal evitar-la completament per a consum.',
    'description_en', 'The false morel or brain mushroom, with a brownish-reddish cerebral appearance. Contains gyromitrin, heat-labile lethal toxins. DANGEROUS: has been fatally confused with morels. Should be completely avoided for consumption.'
) WHERE scientific_name = 'Gyromitra esculenta';

-- Pezizaceae (1)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Copa marró-ocre de mida mitjana que creix en fems, compost i sòls molt rics en nitrogen. Incomestible per la consistència i manca de gust. Indicadora de sòls molt nitrogenats, freqüent en corrals i zones de compostatge.',
    'description_en', 'Medium-sized brown-ochre cup growing on dung, compost, and nitrogen-rich soils. Inedible due to consistency and lack of taste. Indicator of highly nitrogenous soils, common in corrals and composting areas.'
) WHERE scientific_name = 'Peziza vesiculosa';

-- Sparassidaceae (1)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'La coliflor del bosc o esparàsia, seta amb aspecte de coliflor crema formada per lòbuls ondulats entrellaçats. Excel·lent comestible, molt apreciat. Creix a la base de pins i abets. Cal netejar-la bé per eliminar la brutícia entre els lòbuls.',
    'description_en', 'The cauliflower fungus, a mushroom resembling a cream cauliflower formed by intertwined undulating lobes. Excellent edible, highly prized. Grows at the base of pines and firs. Requires thorough cleaning to remove dirt between lobes.'
) WHERE scientific_name = 'Sparassis crispa';

-- Fistulinaceae (1)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Fong lignícula en forma de llengua o fetge de color vermell sang. Es pot menjar en cru en amanides, de gust lleugerament àcid. Creix sobre roures i castanyers. La seva apariència de carn crua i els tubs separables de la cara inferior el fan inconfusible.',
    'description_en', 'Wood-inhabiting fungus in the shape of a tongue or liver, blood red in color. Can be eaten raw in salads with a slightly acidic taste. Grows on oak and chestnut. Its raw meat appearance and the separable tubes on the underside make it unmistakable.'
) WHERE scientific_name = 'Fistulina hepatica';

-- Meruliaceae (1)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Fong resupinats taronja-salmó amb superfície radiada que creix estès sobre fusta morta de caducifolis. Incomestible. Un dels fongs de superfície (resupinats) més vistosos i fàcils d''identificar per la coloració cridanera.',
    'description_en', 'Orange-salmon resupinate fungus with a radiated surface growing spread over dead deciduous wood. Inedible. One of the most striking and easy-to-identify crust fungi due to its eye-catching coloration.'
) WHERE scientific_name = 'Phlebia radiata';

-- Auriscalpiaceae (1)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'La cullera d''orella, petita seta de barret marró amb peu lateral que creix exclusivament sobre pinyes de pi. Incomestible per la mida. Un dels bolets amb hàbitat més especialitzat, impossible de trobar fora del seu substrat específic.',
    'description_en', 'The earpick fungus, a small mushroom with a brown cap and lateral stem growing exclusively on pine cones. Inedible due to size. One of the most habitat-specialized mushrooms, impossible to find outside its specific substrate.'
) WHERE scientific_name = 'Auriscalpium vulgare';

-- Sclerodermataceae (1)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'La bola de terra comuna o falsa tòfona, globosa amb cutícula gruixuda i dura de color ocre amb berrugues. Tòxica. Es pot confondre amb peus de llop comestibles, però la carn interior és fosca des de jove i d''olor desagradable.',
    'description_en', 'The common earthball, globose with a thick and hard ochre-colored warty cuticle. Toxic. Can be confused with edible puffballs, but the inner flesh is dark from a young age and has an unpleasant smell.'
) WHERE scientific_name = 'Scleroderma citrinum';

-- Auriculariaceae (1)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'L''orella de Judes o seta auricular, fong gelatinós en forma d''orella humana de color marró-vinós. Comestible molt apreciat a la cuina asiàtica, especialment xinesa. Creix sobre saüc i altres planifolis, durant tot l''any.',
    'description_en', 'The Judas''s ear or wood ear fungus, a gelatinous brown-vinous ear-shaped fungus. Highly prized edible in Asian cuisine, especially Chinese. Grows on elder and other hardwoods, throughout the year.'
) WHERE scientific_name = 'Auricularia auricula-judae';

-- Xylariaceae (1)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'El dit de mort o xilaria del hipoxiló, fong ascomicet amb forma de vela o banya de cèrvol, de color blanc en la joventut (conidia) i negre en la maduresa. Incomestible. Molt freqüent sobre fusta morta de caducifolis en descomposició.',
    'description_en', 'The candlesnuff fungus, an ascomycete with a candle or stag-horn shape, white in youth (conidia) and black at maturity. Inedible. Very common on dead decomposing deciduous wood.'
) WHERE scientific_name = 'Xylaria hypoxylon';

-- Gomphidiaceae (1)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Seta de pinars amb píleo viscós de color ocre-ataronjat a marró vinós, làmines decurrents fosques i peu groc a la base. Comestible de qualitat mediocre, cal pelar la cutícula viscosa. Creix associada a bolets del gènere Suillus.',
    'description_en', 'Pine forest mushroom with a viscous cap of ochre-orange to vinous brown color, dark decurrent gills, and yellow base of the stem. Mediocre quality edible, the viscous cuticle must be peeled. Grows associated with Suillus species.'
) WHERE scientific_name = 'Chroogomphus rutilus';
