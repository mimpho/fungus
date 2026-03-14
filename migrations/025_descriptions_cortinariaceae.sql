-- Cortinariaceae: description CA/EN (9 species)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'SETA MORTAL. Conté orellànina, una toxina nefrotòxica que destrueix els ronyons. Els símptomes apareixen amb un retard de 3 a 20 dies, quan el dany renal ja és irreversible. No s''ha de recol·lectar mai.',
    'description_en', 'DEADLY MUSHROOM. Contains orellanine, a nephrotoxic toxin that destroys the kidneys. Symptoms appear with a delay of 3 to 20 days, when the kidney damage is already irreversible. Should never be harvested.'
) WHERE scientific_name = 'Cortinarius orellanus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'La teranyina letal, un dels cortinaris més perillosos d''Europa. Conté orellànina com C. orellanus, amb la mateixa toxicitat renal retardada. El seu aspecte discret de tonalitats marró-vermelloses la fa especialment traïdora.',
    'description_en', 'The deadly webcap, one of the most dangerous cortinarius in Europe. Contains orellanine like C. orellanus, with the same delayed renal toxicity. Its inconspicuous brown-reddish appearance makes it especially treacherous.'
) WHERE scientific_name = 'Cortinarius rubellus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'El cortinari violaci, una de les setes més belles dels boscos europeus pel seu color violaci intens en totes les parts. Incomestible. Creix en fagedes i rouredes, poc freqüent. El seu color inconfusible el fa fàcilment identificable.',
    'description_en', 'The violet webcap, one of the most beautiful mushrooms in European forests for its intense violet color in all parts. Inedible. Grows in beech and oak forests, uncommon. Its unmistakable color makes it easily identifiable.'
) WHERE scientific_name = 'Cortinarius violaceus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'El cortinari gitano o rozites, excepcionalment comestible entre els cortinaris. Reconeixible pel seu barret groc-daurat amb reflexos sedosos i el vel blanc que forma un anell persistent. Apreciat en alguns països europeus.',
    'description_en', 'The gypsy mushroom or rozites, exceptionally edible among cortinarius. Recognizable by its golden-yellow cap with silky reflections and the white veil that forms a persistent ring. Prized in some European countries.'
) WHERE scientific_name = 'Cortinarius caperatus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Cortinari groc brillant a daurat que conté orellànina, sent un dels més perillosos del gènere per la seva aparença atractiva. El seu color groc-daurat pot confondre''l amb espècies comestibles. Mortal amb efecte retardat.',
    'description_en', 'Bright yellow to golden cortinarius that contains orellanine, making it one of the most dangerous of the genus due to its attractive appearance. Its golden-yellow color can confuse it with edible species. Deadly with delayed effect.'
) WHERE scientific_name = 'Cortinarius splendens';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Gran cortinari amb barret marró-violaci viscós i peu violaci robust. Comestible apreciat, un dels pocs cortinaris recomendables. Creix en fagedes i rouredes calcàries del nord peninsular i els Pirineus. Poc freqüent.',
    'description_en', 'Large cortinarius with a viscous brown-violet cap and a robust violet stem. Prized edible, one of the few recommendable cortinarius. Grows in calcareous beech and oak forests in the northern peninsula and Pyrenees. Uncommon.'
) WHERE scientific_name = 'Cortinarius praestans';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Cortinari de mida mitjana amb barret ocre-ataronjat i peu marró pàl·lid, sense característiques cridaneres que el facin inconfusible. Incomestible. Creix en boscos de planifolis i coníferes del nord peninsular.',
    'description_en', 'Medium-sized cortinarius with an ochre-orange cap and pale brown stem, without striking features that make it unmistakable. Inedible. Grows in broadleaf and conifer forests in the northern peninsula.'
) WHERE scientific_name = 'Cortinarius armeniacus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Cortinari de barret viscós amb tons violacis al marge i marró al centre, de porus i làmines violàcies. Incomestible. Creix en fagedes i rouredes humides del nord peninsular. Un dels phlegmacis més habituals de la Península.',
    'description_en', 'Cortinarius with a viscous cap showing violet tones at the margin and brown at the center, with violet pores and gills. Inedible. Grows in humid beech and oak forests in the northern peninsula.'
) WHERE scientific_name = 'Phlegmacium calochroum';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Cortinari vermell sang intens en totes les seves parts, amb cortina vermella característica. Incomestible. Un dels cortinaris més vistosos, es pot reconèixer pel color vermell brillant uniforme. Creix en boscos de coníferes i caducifolis.',
    'description_en', 'Cortinarius of intense blood red in all its parts, with a characteristic red cortina. Inedible. One of the most striking cortinarius, recognizable by its uniform bright red color. Grows in conifer and deciduous forests.'
) WHERE scientific_name = 'Dermocybe sanguinea';
