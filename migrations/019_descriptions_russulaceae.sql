-- Russulaceae: description CA/EN (22 species)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Una de les millors rússoles comestibles. El seu barret verd esquerdejat la fa molt fàcil d''identificar. Carn ferma i gustosa, excel·lent a la cuina. Es troba en rouredes i boscos mixtos de tot el territori.',
    'description_en', 'One of the best edible russulas. Its cracked green cap makes it very easy to identify. Firm and tasty flesh, excellent in the kitchen. Found in oak groves and mixed forests throughout the territory.'
) WHERE scientific_name = 'Russula virescens';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Rússola de colors variables (verd, violaci, gris o barreja), una de les millors comestibles del gènere. La seva carn no pica i el peu és llarg i robust. Molt freqüent en boscos caducifolis i coníferes.',
    'description_en', 'Russula of variable colors (green, violet, gray, or a mix), one of the best edibles of the genus. Its flesh does not taste hot and the stem is long and robust. Very common in deciduous and coniferous forests.'
) WHERE scientific_name = 'Russula cyanoxantha';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Gran rússola de color blanc brut amb làmines apretades i decurrents, freqüent en prats i vores de bosc. De valor comestible mediocre, la seva carn ferma millora amb cocció prolongada. Es troba de finals d''estiu a principis d''hivern.',
    'description_en', 'Large russula of dirty white color with crowded and decurrent gills, common in meadows and forest edges. Of mediocre edible value, its firm flesh improves with prolonged cooking. Found from late summer to early winter.'
) WHERE scientific_name = 'Russula delica';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Rússola de barret vermell brillant, peu blanc i gust extremadament picant que la fa incomestible en cru. El picant desapareix parcialment amb la cocció. Freqüent en boscos de coníferes i caducifolis àcids de tota la Península.',
    'description_en', 'Russula with a bright red cap, white stem, and extremely hot taste that makes it inedible raw. The heat partially disappears with cooking. Frequent in conifer and acidic deciduous forests throughout the Peninsula.'
) WHERE scientific_name = 'Russula emetica';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Rússola elegant amb barret taronja-roig a daurat i làmines grogues. Comestible apreciat, poc freqüent. Un dels membres més vistosos del gènere, fàcilment reconeixible per la combinació de colors càlids.',
    'description_en', 'Elegant russula with an orange-red to golden cap and yellow gills. Prized edible, uncommon. One of the most striking members of the genus, easily recognizable by the combination of warm colors.'
) WHERE scientific_name = 'Russula aurea';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Rússola de barret gris-blavós a verd grisos amb aspecte pruïnós característic. Comestible de bona qualitat, molt freqüent en boscos de pins i alzines. Una de les rússoles tardorenques més comunes a Catalunya.',
    'description_en', 'Russula with a gray-blue to grayish-green cap with a characteristic pruinose appearance. Good quality edible, very common in pine and holm oak forests. One of the most common autumn russulas in Catalonia.'
) WHERE scientific_name = 'Russula parazurea';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Una de les rússoles de major mida, amb barret heterogeni verd-oliva a marró vinós. Comestible de bona qualitat, poc freqüent. Creix sobretot en fagedes i rouredes de muntanya durant la tardor.',
    'description_en', 'One of the largest russulas, with a heterogeneous olive-green to vinous brown cap. Good quality edible, uncommon. Grows mainly in beech and oak mountain forests during autumn.'
) WHERE scientific_name = 'Russula olivacea';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Rússola comestible molt apreciada amb barret marró-rosat i la particularitat que la cutícula es retira deixant veure les làmines. De gust suau i agradable, és una de les millors rússoles de la tardor.',
    'description_en', 'Highly prized edible russula with a brownish-pink cap and the distinctive feature that the cuticle peels back to reveal the gills. Mild and pleasant taste, one of the best autumn russulas.'
) WHERE scientific_name = 'Russula vesca';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Rússola gran de olor molt fètida i ranci, amb barret groc-ocre viscós i làmines de color groc brut. Incomestible per la seva olor i gust desagradables. Molt freqüent en fagedes i pinedes de tota la Península.',
    'description_en', 'Large russula with a very fetid and rancid smell, viscous yellow-ochre cap, and dirty yellow gills. Inedible due to its unpleasant smell and taste. Very common in beech and pine forests throughout the Peninsula.'
) WHERE scientific_name = 'Russula foetens';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Rússola gran que en la maduresa o al tall vira primer a rogenc i després a negre, un dels canvis de color més espectaculars del gènere. Comestible de qualitat mediocre. Molt freqüent en boscos de tota mena.',
    'description_en', 'Large russula that at maturity or when cut turns first reddish and then black, one of the most spectacular color changes in the genus. Mediocre quality edible. Very common in all types of forest.'
) WHERE scientific_name = 'Russula nigricans';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Rússola de barret roig-púrpura a carmí i olor característica a cranc cuit. Comestible apreciat, especialment al nord d''Espanya. Es reconeix fàcilment per la combinació de color intens i olor marina inconfusible.',
    'description_en', 'Russula with a red-purple to crimson cap and a characteristic cooked crab smell. Prized edible, especially in northern Spain. Easily recognized by the combination of intense color and unmistakable marine smell.'
) WHERE scientific_name = 'Russula xerampelina';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Rússola robusta d''alta muntanya amb barret ocre-pardo uniforme i carn molt ferma. Comestible de bona qualitat, poc freqüent. Espècie típica de pinedes i avetoses subalpines dels Pirineus i la Serralada Cantàbrica.',
    'description_en', 'Robust high-mountain russula with a uniform ochre-brown cap and very firm flesh. Good quality edible, uncommon. A typical species of subalpine pine and fir forests in the Pyrenees and Cantabrian Range.'
) WHERE scientific_name = 'Russula mustelina';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'La seta més recol·lectada a Espanya. Exsuda un làtex ataronjat característic al tall. De gust suau i excel·lent qualitat culinària. Creix exclusivament en simbiosi amb pins, especialment Pinus sylvestris i P. pinaster.',
    'description_en', 'The most harvested mushroom in Spain. Exudes a characteristic orange latex when cut. Mild taste and excellent culinary quality. Grows exclusively in symbiosis with pines, especially Pinus sylvestris and P. pinaster.'
) WHERE scientific_name = 'Lactarius deliciosus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Robelló o mísol amb làtex de color vermell sang intens, barret taronja-salmó i làmines ataronjades que no verdegen. Molt apreciat a la cuina mediterrània, de qualitat superior al L. deliciosus. Creix en pinedes mediterrànies.',
    'description_en', 'Saffron milk cap with intense blood-red latex, salmon-orange cap, and orange gills that do not turn green. Highly prized in Mediterranean cuisine, of superior quality to L. deliciosus. Grows in Mediterranean pine forests.'
) WHERE scientific_name = 'Lactarius sanguifluus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Espècie afí al mísol però amb làtex que vira de taronja a verd al contacte amb l''aire, cosa que la distingeix clarament. Comestible però de qualitat inferior. Creix en pinedes d''avet i pi negre de zones més fredes.',
    'description_en', 'Species related to the saffron milk cap but with latex that turns from orange to green on contact with air, clearly distinguishing it. Edible but of inferior quality. Grows in silver fir and black pine forests in colder areas.'
) WHERE scientific_name = 'Lactarius deterrimus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Lactari gran de color blanc brut amb peu curt i làmines molt apretades. El làtex blanc és extremadament picant, cosa que el fa incomestible en cru. Creix en boscos de planifolis i coníferes de tota la Península.',
    'description_en', 'Large milk cap of dirty white color with a short stem and very crowded gills. The white latex is extremely peppery, making it inedible raw. Grows in broadleaf and conifer forests throughout the Peninsula.'
) WHERE scientific_name = 'Lactifluus piperatus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Lactari rosat amb marge vellós enrotllat i làtex blanc de gust molt picant. Tòxic en cru. Creix associat exclusivament a bedolls, per la qual cosa és indicador de la presència d''aquesta espècie arbòria al bosc.',
    'description_en', 'Pink milk cap with a hairy, inrolled margin and white latex with a very peppery taste. Toxic raw. Grows exclusively associated with birch trees, making it an indicator of birch presence in the forest.'
) WHERE scientific_name = 'Lactarius torminosus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Espècie inconfusible pel seu color blau índig intens en totes les seves parts, inclòs el làtex. Comestible apreciat a Mèxic i altres països, poc freqüent a la Península Ibèrica. Creix en boscos de planifolis i coníferes.',
    'description_en', 'Unmistakable species for its intense indigo blue color in all its parts, including the latex. Prized edible in Mexico and other countries, uncommon in the Iberian Peninsula. Grows in broadleaf and conifer forests.'
) WHERE scientific_name = 'Lactarius indigo';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Lactari taronja amb làtex blanc molt abundant i olor característica a peix cuit. Comestible apreciat, de gust suau. Creix en boscos de planifolis (roures, fagedes) en terrenys àcids del nord peninsular.',
    'description_en', 'Orange milk cap with very abundant white latex and a characteristic cooked fish smell. Prized edible, mild taste. Grows in broadleaf forests (oak, beech) on acidic soils in the northern peninsula.'
) WHERE scientific_name = 'Lactarius volemus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Gran lactari blanc amb superfície aterciopelada i làtex blanc copios de gust molt picant. Incomestible en cru per l''acre sabor. Pot causar trastorns digestius. Creix en rouredes i alzinedes de la meitat sud de la Península.',
    'description_en', 'Large white milk cap with a velvety surface and abundant white latex with a very peppery taste. Inedible raw due to its acrid flavor. Can cause digestive disorders. Grows in oak groves in the southern half of the Peninsula.'
) WHERE scientific_name = 'Lactifluus vellereus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Rússola de barret ocre-mel amb olor característica a ametlles amargues (cirerer de llorer). Incomestible per la seva olor i gust desagradables. Poc freqüent, creix en boscos de planifolis del nord i centre peninsular.',
    'description_en', 'Russula with a honey-ochre cap and characteristic smell of bitter almonds (cherry laurel). Inedible due to its unpleasant smell and taste. Uncommon, grows in broadleaf forests in the north and center of the Peninsula.'
) WHERE scientific_name = 'Russula laurocerasi';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Rússola de barret roig carmí viu amb espores ocre, comestible apreciat en rouredes. Es pot confondre amb R. emetica per la coloració, però se''n distingeix per l''esporeada ocre i el sabor menys picant.',
    'description_en', 'Russula with a bright crimson cap and ochre spore print, prized edible in oak groves. It can be confused with R. emetica due to its coloring, but is distinguished by its ochre spore print and less peppery taste.'
) WHERE scientific_name = 'Russula pseudointegra';
