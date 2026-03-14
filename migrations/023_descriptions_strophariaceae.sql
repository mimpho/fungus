-- Strophariaceae: description CA/EN (9 species)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'La pholiota escamosa, amb barret i peu densament coberts d''escames recurvades groguenques. Creix en densas calàpets a la base d''arbres caducifolis. Incomestible per l''olor i gust amargants. Molt vistosa i fàcil d''identificar.',
    'description_en', 'The shaggy scalycap, with cap and stem densely covered in recurved yellowish scales. Grows in dense tufts at the base of deciduous trees. Inedible due to its bitter smell and taste. Very striking and easy to identify.'
) WHERE scientific_name = 'Pholiota squarrosa';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'El fong del sofre o hypholoma fasciulada, petita seta groc-verdosa que creix en densíssims calàpets sobre fusta morta. Tòxica per contingut en fasciculol. Es reconeix per la coloració verdosa de les làmines madures.',
    'description_en', 'The sulfur tuft, a small yellow-green mushroom that grows in very dense tufts on dead wood. Toxic due to fasciculol content. Recognized by the greenish coloration of mature gills.'
) WHERE scientific_name = 'Hypholoma fasciculare';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'La hypholoma de les coníferes, similar a H. fasciculare però sense tons verdosos i amb olor i gust suaus. Comestible apreciat que creix exclusivament sobre fusta de coníferes en densíssims calàpets, especialment a la tardor.',
    'description_en', 'The conifer tuft, similar to H. fasciculare but without greenish tones and with a mild smell and taste. Prized edible that grows exclusively on conifer wood in very dense tufts, especially in autumn.'
) WHERE scientific_name = 'Hypholoma capnoides';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'La stropharia verda o barret de duende, fàcilment recognoscible pel seu barret verd-blavós viscós amb restes de vel blanc al marge. Incomestible. Creix en pastures, jardins i vores de camins de tot el territori.',
    'description_en', 'The verdigris agaric, easily recognizable by its viscous blue-green cap with white veil remnants at the margin. Inedible. Grows in meadows, gardens, and roadsides throughout the territory.'
) WHERE scientific_name = 'Stropharia aeruginosa';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'L''agrocybe de primavera, una de les primeres setes que apareixen a l''any, en primavera. Comestible de qualitat moderada. Creix en prats, marges de camins i jardins, sovint en corros. Característica pel seu anell persistent.',
    'description_en', 'The spring fieldcap, one of the first mushrooms to appear during the year, in spring. Moderate quality edible. Grows in meadows, roadsides, and gardens, often in rings. Characterized by its persistent ring.'
) WHERE scientific_name = 'Agrocybe praecox';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'La seta de pollancre o piopino, molt apreciada a la cuina espanyola i italiana. Creix en calàpets sobre pollancres, àlbers i altres planifolis. De gust suau i textura agradable, excel·lent a la paella i la cuina mediterrània.',
    'description_en', 'The black poplar mushroom or piopino, highly prized in Spanish and Italian cuisine. Grows in tufts on poplars, alders, and other broadleaf trees. Mild taste and pleasant texture, excellent in paella and Mediterranean cooking.'
) WHERE scientific_name = 'Agrocybe aegerita';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'La seta de soca o pholiota mutant, comestible apreciat que creix en densíssims calàpets sobre fusta morta de caducifolis. El seu barret bicolor (mel-marró al centre, groguenc als marges quan és humit) és molt característic.',
    'description_en', 'The sheathed woodtuft, a prized edible that grows in very dense tufts on dead deciduous wood. Its bicolored cap (honey-brown at center, yellowish at margins when wet) is very characteristic.'
) WHERE scientific_name = 'Kuehneromyces mutabilis';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'L''agrocybe cilíndrica o seta de pollancre, molt similar a Agrocybe aegerita amb la qual es pot confondre. Comestible apreciat que creix sobre troncs i soques de diverses espècies d''arbres caducifolis a la primavera i tardor.',
    'description_en', 'The poplar fieldcap, very similar to Agrocybe aegerita with which it can be confused. Prized edible that grows on logs and stumps of various deciduous tree species in spring and autumn.'
) WHERE scientific_name = 'Cyclocybe cylindracea';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object(
    'description_ca', 'Petita stropharia amb barret groc-crema i anell estriat, freqüent en pastures i prats fertilitzats. Incomestible. Creix sovint en grups o corros en pastures ramaderes, especialment en primavera i tardor.',
    'description_en', 'Small stropharia with a cream-yellow cap and striate ring, frequent in meadows and fertilized grasslands. Inedible. Grows often in groups or rings in grazing pastures, especially in spring and autumn.'
) WHERE scientific_name = 'Stropharia coronilla';
