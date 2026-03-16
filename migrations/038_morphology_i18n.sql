-- Migration 038: i18n morphology (cap / stem / flesh / sporePrint) → CA + EN
-- Generated automatically — apply in Supabase SQL Editor
-- 202 species

BEGIN;

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex-bomba","color":"Marró castany a ocre","diametro":"8-30 cm","superficie":"Llisa, una mica viscosa amb humitat"},"stem_ca":{"forma":"Cilíndric o eixamplat a la base","color":"Blanquinós amb reticulado","altura":"5-20 cm","diametro":"3-8 cm"},"flesh_ca":{"color":"Blanca, immutable al tall","textura":"Ferma i compacta","olor":"Agradable, fúngic","sabor":"Suau i agradable"},"sporePrint_ca":"Oliva-bru","cap_en":{"forma":"Convex-arched","color":"Chestnut-brown to ochre","diametro":"8-30 cm","superficie":"Smooth, slightly viscid when wet"},"stem_en":{"forma":"Cylindrical or swollen at the base","color":"Whitish with reticulado","altura":"5-20 cm","diametro":"3-8 cm"},"flesh_en":{"color":"White, unchanging when cut","textura":"Firm and compact","olor":"Pleasant, fungal","sabor":"Mild and pleasant"},"sporePrint_en":"Olive-brown"}'::jsonb
WHERE id = 'esp-001';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Hemisfèric a convex","color":"Marró molt fosc, gairebé negre","diametro":"6-20 cm","superficie":"Vellutada en jove"},"stem_ca":{"forma":"Robust, cilíndric","color":"Marró clar amb reticulado","altura":"6-15 cm","diametro":"3-6 cm"},"flesh_ca":{"color":"Blanca, immutable al tall","textura":"Ferma","olor":"Agradable, fúngic","sabor":"Dolç, excel·lent"},"sporePrint_ca":"Olivàcia","cap_en":{"forma":"Hemispherical to convex","color":"Very dark brown, almost black","diametro":"6-20 cm","superficie":"Velvety when young"},"stem_en":{"forma":"Stout, cylindrical","color":"Light brown with reticulado","altura":"6-15 cm","diametro":"3-6 cm"},"flesh_en":{"color":"White, unchanging when cut","textura":"Firm","olor":"Pleasant, fungal","sabor":"Sweet, excellent"},"sporePrint_en":"Olivaceous"}'::jsonb
WHERE id = 'esp-002';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex-bomba","color":"Marró xocolata a castany","diametro":"6-20 cm","superficie":"Mate"},"stem_ca":{"forma":"Robust","color":"Marró pàl·lid","altura":"5-15 cm","diametro":"3-7 cm"},"flesh_ca":{"color":"Blanca, immutable","textura":"Ferma","olor":"Agradable","sabor":"Suau"},"sporePrint_ca":"Oliva-bru","cap_en":{"forma":"Convex-arched","color":"Chocolate-brown to chestnut","diametro":"6-20 cm","superficie":"Matt"},"stem_en":{"forma":"Stout","color":"Pale brown","altura":"5-15 cm","diametro":"3-7 cm"},"flesh_en":{"color":"White, unchanging","textura":"Firm","olor":"Pleasant","sabor":"Mild"},"sporePrint_en":"Olive-brown"}'::jsonb
WHERE id = 'esp-003';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Marró ocre a ocre pajús","diametro":"6-20 cm","superficie":"Mate"},"stem_ca":{"forma":"Robust amb reticulat fi","color":"Ocre-pardós","altura":"5-15 cm","diametro":"3-6 cm"},"flesh_ca":{"color":"Blanca, immutable","textura":"Ferma","olor":"Agradable","sabor":"Suau"},"sporePrint_ca":"Oliva-bru","cap_en":{"forma":"Convex","color":"Brown-ochre to straw-ochre","diametro":"6-20 cm","superficie":"Matt"},"stem_en":{"forma":"Stout with fine reticulate","color":"Ochre-brownish","altura":"5-15 cm","diametro":"3-6 cm"},"flesh_en":{"color":"White, unchanging","textura":"Firm","olor":"Pleasant","sabor":"Mild"},"sporePrint_en":"Olive-brown"}'::jsonb
WHERE id = 'esp-004';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Marró castany a caoba","diametro":"5-15 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Marró pàl·lid amb fibras longitudinales","altura":"4-10 cm","diametro":"1.5-3 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"Fúngic","sabor":"Agradable"},"sporePrint_ca":"Oliva-bru","cap_en":{"forma":"Convex","color":"Chestnut-brown to mahogany","diametro":"5-15 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"Pale brown with fibras longitudinales","altura":"4-10 cm","diametro":"1.5-3 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Fungal","sabor":"Pleasant"},"sporePrint_en":"Olive-brown"}'::jsonb
WHERE id = 'esp-005';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Hemisfèric a convex","color":"Bru a pardo-grisáceo","diametro":"6-15 cm","superficie":"Llisa, una mica viscosa amb humitat"},"stem_ca":{"forma":"Esvelt","color":"Blanquecino amb escamas negras","altura":"10-15 cm","diametro":"2-3 cm"},"flesh_ca":{"color":"Blanca","textura":"Tova","olor":"Suau","sabor":"Suau"},"sporePrint_ca":"Olivàcia","cap_en":{"forma":"Hemispherical to convex","color":"Tawny a pardo-grisáceo","diametro":"6-15 cm","superficie":"Smooth, slightly viscid when wet"},"stem_en":{"forma":"Slender","color":"Blanquecino with escamas negras","altura":"10-15 cm","diametro":"2-3 cm"},"flesh_en":{"color":"White","textura":"Soft","olor":"Mild","sabor":"Mild"},"sporePrint_en":"Olivaceous"}'::jsonb
WHERE id = 'esp-006';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Taronja-ocre a rovell de ferro","diametro":"5-20 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Blanc amb escamas oscuras","altura":"8-18 cm","diametro":"2-4 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"Suau","sabor":"Suau"},"sporePrint_ca":"Marró-oliva","cap_en":{"forma":"Convex","color":"Orange-ochre to rusty","diametro":"5-20 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"White with escamas oscuras","altura":"8-18 cm","diametro":"2-4 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Mild","sabor":"Mild"},"sporePrint_en":"Olive-brown"}'::jsonb
WHERE id = 'esp-007';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Marró xocolata, viscós","diametro":"5-12 cm","superficie":"Viscosa"},"stem_ca":{"forma":"Amb anell","color":"Groc amb punteado marrón","altura":"5-10 cm","diametro":"1-2 cm"},"flesh_ca":{"color":"Groc pàl·lid","textura":"Tova","olor":"Agradable","sabor":"Suau"},"sporePrint_ca":"Ocre-bruna","cap_en":{"forma":"Convex","color":"Chocolate-brown, viscid","diametro":"5-12 cm","superficie":"Viscid/Slimy"},"stem_en":{"forma":"With ring","color":"Yellow with punteado marrón","altura":"5-10 cm","diametro":"1-2 cm"},"flesh_en":{"color":"Pale yellow","textura":"Soft","olor":"Pleasant","sabor":"Mild"},"sporePrint_en":"Ochre-tawny"}'::jsonb
WHERE id = 'esp-008';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Groc-ocre a castaño rosado","diametro":"4-10 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Amarillo pálido amb gránulos blancos en el ápice","altura":"4-8 cm","diametro":"1-2 cm"},"flesh_ca":{"color":"Groc pàl·lid","textura":"Tova","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Groc-bruna","cap_en":{"forma":"Convex","color":"Yellow-ochre a castaño rosado","diametro":"4-10 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"Amarillo pálido with gránulos blancos en el ápice","altura":"4-8 cm","diametro":"1-2 cm"},"flesh_en":{"color":"Pale yellow","textura":"Soft","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"Yellowish-tawny"}'::jsonb
WHERE id = 'esp-009';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Bru-rogenc, viscós","diametro":"5-12 cm","superficie":"Viscosa"},"stem_ca":{"forma":"Cilíndric","color":"Groc amb puntos o manchas rojas","altura":"5-10 cm","diametro":"1-2 cm"},"flesh_ca":{"color":"Groga","textura":"Tova","olor":"Agradable","sabor":"Suau"},"sporePrint_ca":"Ocre-olivàcia","cap_en":{"forma":"Convex","color":"Reddish-brown, viscid","diametro":"5-12 cm","superficie":"Viscid/Slimy"},"stem_en":{"forma":"Cylindrical","color":"Yellow with puntos o manchas rojas","altura":"5-10 cm","diametro":"1-2 cm"},"flesh_en":{"color":"Yellow","textura":"Soft","olor":"Pleasant","sabor":"Mild"},"sporePrint_en":"Ochre-olivaceous"}'::jsonb
WHERE id = 'esp-010';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Marró-oliva a ocre","diametro":"4-12 cm","superficie":"Seca"},"stem_ca":{"forma":"Cilíndric","color":"Groc amb fibrillas pardo-rojizas","altura":"4-10 cm","diametro":"1-2.5 cm"},"flesh_ca":{"color":"Groc pàl·lid, blau feblament al tall","textura":"Ferma","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Oliva-bru","cap_en":{"forma":"Convex","color":"Olive-brown to ochre","diametro":"4-12 cm","superficie":"Dry"},"stem_en":{"forma":"Cylindrical","color":"Yellow with fibrillas pardo-rojizas","altura":"4-10 cm","diametro":"1-2.5 cm"},"flesh_en":{"color":"Pale yellow, faintly bluing when cut","textura":"Firm","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"Olive-brown"}'::jsonb
WHERE id = 'esp-011';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Gris-oliva a marró grisenc","diametro":"6-20 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Vermell carmí a la base, groc a dalt, reticulat vermell","altura":"6-15 cm","diametro":"2-5 cm"},"flesh_ca":{"color":"Groc intens, blau intensament al tall","textura":"Ferma","olor":"Suau","sabor":"Amarg"},"sporePrint_ca":"Oliva-bru","cap_en":{"forma":"Convex","color":"Olive-grey to greyish-brown","diametro":"6-20 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"Carmine-red at base, yellow above, red reticulum","altura":"6-15 cm","diametro":"2-5 cm"},"flesh_en":{"color":"Bright yellow, intensely bluing when cut","textura":"Firm","olor":"Mild","sabor":"Bitter"},"sporePrint_en":"Olive-brown"}'::jsonb
WHERE id = 'esp-012';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Marró-gris a oliva-ocre","diametro":"6-20 cm","superficie":"Seca"},"stem_ca":{"forma":"Robust","color":"Rojo sangre amb reticulado rojo sobre fondo amarillo","altura":"6-15 cm","diametro":"2-5 cm"},"flesh_ca":{"color":"Groc viu, blau molt intensament al tall","textura":"Ferma","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Oliva-bru","cap_en":{"forma":"Convex","color":"Grey-brown to olive-ochre","diametro":"6-20 cm","superficie":"Dry"},"stem_en":{"forma":"Stout","color":"Rojo sangre with reticulado rojo sobre fondo amarillo","altura":"6-15 cm","diametro":"2-5 cm"},"flesh_en":{"color":"Vivid yellow, very intensely bluing when cut","textura":"Firm","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"Olive-brown"}'::jsonb
WHERE id = 'esp-013';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Marró fosc a chocolate","diametro":"6-20 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Rojo sangre amb puntos rojos, sin reticulado","altura":"5-15 cm","diametro":"2-5 cm"},"flesh_ca":{"color":"Groc intens, blau molt ràpidament al tall","textura":"Ferma","olor":"Agradable","sabor":"Suau"},"sporePrint_ca":"Oliva-bru","cap_en":{"forma":"Convex","color":"Dark brown a chocolate","diametro":"6-20 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"Rojo sangre with puntos rojos, sin reticulado","altura":"5-15 cm","diametro":"2-5 cm"},"flesh_en":{"color":"Intense yellow, bluing very rapidly when cut","textura":"Firm","olor":"Pleasant","sabor":"Mild"},"sporePrint_en":"Olive-brown"}'::jsonb
WHERE id = 'esp-014';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Blanc-grisenc a ocre pàl·lid","diametro":"8-30 cm","superficie":"Seca"},"stem_ca":{"forma":"Claviforme","color":"Rojo carmín amb reticulado rojo prominente","altura":"5-15 cm","diametro":"4-10 cm"},"flesh_ca":{"color":"Groga","textura":"Ferma i compacta","olor":"Agradable","sabor":"Dolç"},"sporePrint_ca":"Oliva-bru","cap_en":{"forma":"Convex","color":"Greyish-white to pale ochre","diametro":"8-30 cm","superficie":"Dry"},"stem_en":{"forma":"Club-shaped","color":"Rojo carmín with reticulado rojo prominente","altura":"5-15 cm","diametro":"4-10 cm"},"flesh_en":{"color":"Yellowish","textura":"Firm and compact","olor":"Pleasant","sabor":"Sweet"},"sporePrint_en":"Olive-brown"}'::jsonb
WHERE id = 'esp-015';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Groc pàl·lid a ocre","diametro":"4-12 cm","superficie":"Seca"},"stem_ca":{"forma":"Cilíndric","color":"Groc pàl·lid concolor","altura":"4-10 cm","diametro":"1.5-3 cm"},"flesh_ca":{"color":"Blanca","textura":"Fràgil","olor":"Suau","sabor":"Suau"},"sporePrint_ca":"Groc pàl·lid","cap_en":{"forma":"Convex","color":"Pale yellow to ochre","diametro":"4-12 cm","superficie":"Dry"},"stem_en":{"forma":"Cylindrical","color":"Pale yellow, concolorous","altura":"4-10 cm","diametro":"1.5-3 cm"},"flesh_en":{"color":"White","textura":"Fragile","olor":"Mild","sabor":"Mild"},"sporePrint_en":"Pale yellow"}'::jsonb
WHERE id = 'esp-016';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Castany a marrón-rojizo","diametro":"3-10 cm","superficie":"Tomentosa"},"stem_ca":{"forma":"Cilíndric","color":"Castaño concoloro amb el sombrero","altura":"3-8 cm","diametro":"1-2.5 cm"},"flesh_ca":{"color":"Blanca","textura":"Fràgil","olor":"Fúngic","sabor":"Suau i agradable"},"sporePrint_ca":"Groc pàl·lid","cap_en":{"forma":"Convex","color":"Chestnut a marrón-rojizo","diametro":"3-10 cm","superficie":"Tomentose"},"stem_en":{"forma":"Cylindrical","color":"Castaño concoloro with el sombrero","altura":"3-8 cm","diametro":"1-2.5 cm"},"flesh_en":{"color":"White","textura":"Fragile","olor":"Fungal","sabor":"Mild and pleasant"},"sporePrint_en":"Pale yellow"}'::jsonb
WHERE id = 'esp-017';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Marró-canyella a rovell","diametro":"3-8 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Groc-rogenc a castany, groc a la base","altura":"3-8 cm","diametro":"0.8-1.5 cm"},"flesh_ca":{"color":"Groc-rogenca, quasi no canvia","textura":"Ferma","olor":"Suau","sabor":"Picant"},"sporePrint_ca":"Canyella-marró","cap_en":{"forma":"Convex","color":"Cinnamon-brown to rusty","diametro":"3-8 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"Yellowish-red to chestnut, yellow at base","altura":"3-8 cm","diametro":"0.8-1.5 cm"},"flesh_en":{"color":"Yellowish-red, barely changing","textura":"Firm","olor":"Mild","sabor":"Pungent"},"sporePrint_en":"Cinnamon-brown"}'::jsonb
WHERE id = 'esp-018';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Marró negrós a marró-roig","diametro":"5-18 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Vermell amb puntos rojos, sin reticulado","altura":"5-15 cm","diametro":"2-5 cm"},"flesh_ca":{"color":"Groca, blau intensament al tall","textura":"Ferma","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Oliva-bru","cap_en":{"forma":"Convex","color":"Blackish-brown to reddish-brown","diametro":"5-18 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"Red with puntos rojos, sin reticulado","altura":"5-15 cm","diametro":"2-5 cm"},"flesh_en":{"color":"Yellow, intensely bluing when cut","textura":"Firm","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"Olive-brown"}'::jsonb
WHERE id = 'esp-019';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Marró-oliva a ocre rovell","diametro":"5-15 cm","superficie":"Viscosa"},"stem_ca":{"forma":"Cilíndric","color":"Marró-bru concolor o més clar","altura":"3-8 cm","diametro":"1.5-3 cm"},"flesh_ca":{"color":"Groga","textura":"Ferma","olor":"Fúngic","sabor":"Àcid"},"sporePrint_ca":"Marró rovell","cap_en":{"forma":"Convex","color":"Olive-brown to rusty-ochre","diametro":"5-15 cm","superficie":"Viscid/Slimy"},"stem_en":{"forma":"Cylindrical","color":"Tawny-brown, concolorous or paler","altura":"3-8 cm","diametro":"1.5-3 cm"},"flesh_en":{"color":"Yellow","textura":"Firm","olor":"Fungal","sabor":"Acidic"},"sporePrint_en":"Rusty-brown"}'::jsonb
WHERE id = 'esp-020';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Vermell-ataronjat a daurat","diametro":"3-8 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Rojo-anaranjado amb reticulado dorado","altura":"3-8 cm","diametro":"1-2 cm"},"flesh_ca":{"color":"Groca, lleugerament blau al tall","textura":"Ferma","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Oliva-bru","cap_en":{"forma":"Convex","color":"Red-orange to golden","diametro":"3-8 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"Rojo-anaranjado with reticulado dorado","altura":"3-8 cm","diametro":"1-2 cm"},"flesh_en":{"color":"Yellow, slightly bluing","textura":"Firm","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"Olive-brown"}'::jsonb
WHERE id = 'esp-021';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Marró rovell a rovell de ferro","diametro":"5-20 cm","superficie":"Llisa"},"stem_ca":{"forma":"Lateral","color":"Marró fosc a negro-aterciopelado","altura":"2-6 cm","diametro":"1.5-4 cm"},"flesh_ca":{"color":"Blanca","textura":"Compacta","olor":"Suau","sabor":"Amarg"},"sporePrint_ca":"Groc-ocre","cap_en":{"forma":"Convex","color":"Rust-brown to rusty","diametro":"5-20 cm","superficie":"Smooth"},"stem_en":{"forma":"Lateral","color":"Dark brown a negro-aterciopelado","altura":"2-6 cm","diametro":"1.5-4 cm"},"flesh_en":{"color":"White","textura":"Compact","olor":"Mild","sabor":"Bitter"},"sporePrint_en":"Yellow-ochre"}'::jsonb
WHERE id = 'esp-022';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Verd amb zonas más oscuras, agrietado","diametro":"6-15 cm","superficie":"Amb esquerdat característic"},"stem_ca":{"forma":"Cilíndric","color":"Blanc","altura":"4-10 cm","diametro":"2-4 cm"},"flesh_ca":{"color":"Blanca, immutable","textura":"Ferma","olor":"Suau","sabor":"Agradable"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Convex","color":"Green with zonas más oscuras, agrietado","diametro":"6-15 cm","superficie":"Characteristically cracked"},"stem_en":{"forma":"Cylindrical","color":"White","altura":"4-10 cm","diametro":"2-4 cm"},"flesh_en":{"color":"White, unchanging","textura":"Firm","olor":"Mild","sabor":"Pleasant"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-023';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Variable: verd, violeta, gris o mescla","diametro":"6-15 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Blanc","altura":"5-10 cm","diametro":"2-3 cm"},"flesh_ca":{"color":"Blanca, immutable","textura":"Ferma","olor":"Suau","sabor":"Agradable"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Convex","color":"Variable: green, violet, grey or mixed","diametro":"6-15 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"White","altura":"5-10 cm","diametro":"2-3 cm"},"flesh_en":{"color":"White, unchanging","textura":"Firm","olor":"Mild","sabor":"Pleasant"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-024';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Blanco sucio a crema, amb manchas ocres","diametro":"6-20 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Blanc","altura":"3-6 cm","diametro":"2-4 cm"},"flesh_ca":{"color":"Blanca, immutable","textura":"Ferma","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Blanc-crema","cap_en":{"forma":"Convex","color":"Blanco sucio a crema, with manchas ocres","diametro":"6-20 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"White","altura":"3-6 cm","diametro":"2-4 cm"},"flesh_en":{"color":"White, unchanging","textura":"Firm","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"White-cream"}'::jsonb
WHERE id = 'esp-025';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Vermell viu a vermell sang, de vegades decolorat","diametro":"4-10 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Blanc","altura":"4-9 cm","diametro":"1.5-2.5 cm"},"flesh_ca":{"color":"Blanca","textura":"Fràgil","olor":"Suau","sabor":"Picant"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Convex","color":"Vivid red to blood-red, sometimes faded","diametro":"4-10 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"White","altura":"4-9 cm","diametro":"1.5-2.5 cm"},"flesh_en":{"color":"White","textura":"Fragile","olor":"Mild","sabor":"Pungent"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-026';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Taronja-roig a daurat, variable","diametro":"5-12 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Blanc o con tinte amarillo-anaranjado","altura":"4-9 cm","diametro":"1.5-3 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"Suau","sabor":"Agradable"},"sporePrint_ca":"Groc ocre","cap_en":{"forma":"Convex","color":"Red-orange to golden, variable","diametro":"5-12 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"White o con tinte amarillo-anaranjado","altura":"4-9 cm","diametro":"1.5-3 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Mild","sabor":"Pleasant"},"sporePrint_en":"Ochre-yellow"}'::jsonb
WHERE id = 'esp-027';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex a pla","color":"Gris-blau a gris verdós, polsós","diametro":"4-10 cm","superficie":"Mate"},"stem_ca":{"forma":"Cilíndric","color":"Blanc","altura":"4-8 cm","diametro":"1.5-2.5 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"Suau","sabor":"Suau"},"sporePrint_ca":"Blanc-crema","cap_en":{"forma":"Convex to flat","color":"Blue-grey to greenish-grey, powdery","diametro":"4-10 cm","superficie":"Matt"},"stem_en":{"forma":"Cylindrical","color":"White","altura":"4-8 cm","diametro":"1.5-2.5 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Mild","sabor":"Mild"},"sporePrint_en":"White-cream"}'::jsonb
WHERE id = 'esp-028';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Oliva a verd-marró rogenc, heterogeni","diametro":"8-20 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Blanc amb tinte rosado","altura":"5-12 cm","diametro":"2-4 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma i compacta","olor":"Suau","sabor":"Suau"},"sporePrint_ca":"Ocre groc","cap_en":{"forma":"Convex","color":"Olive a verde-marrón rojizo, heterogéneo","diametro":"8-20 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"White with tinte rosado","altura":"5-12 cm","diametro":"2-4 cm"},"flesh_en":{"color":"White","textura":"Firm and compact","olor":"Mild","sabor":"Mild"},"sporePrint_en":"Yellow-ochre"}'::jsonb
WHERE id = 'esp-029';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Marró-rosat a carn, variable","diametro":"5-12 cm","superficie":"Pell retractada deixant veure les laminel·les"},"stem_ca":{"forma":"Cilíndric","color":"Blanc","altura":"3-8 cm","diametro":"1.5-3 cm"},"flesh_ca":{"color":"Blanca, immutable","textura":"Ferma","olor":"Agradable","sabor":"Suau i agradable"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Convex","color":"Pinkish-brown to flesh-coloured, variable","diametro":"5-12 cm","superficie":"Cuticle retracted exposing the gills"},"stem_en":{"forma":"Cylindrical","color":"White","altura":"3-8 cm","diametro":"1.5-3 cm"},"flesh_en":{"color":"White, unchanging","textura":"Firm","olor":"Pleasant","sabor":"Mild and pleasant"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-030';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Groc-ocre a marrón-miel","diametro":"7-15 cm","superficie":"Viscosa"},"stem_ca":{"forma":"Cilíndric","color":"Blanco, pardea amb la edad","altura":"5-12 cm","diametro":"2-3.5 cm"},"flesh_ca":{"color":"Blanca","textura":"Fràgil","olor":"Molt fètid, ranci","sabor":"Acre"},"sporePrint_ca":"Crema","cap_en":{"forma":"Convex","color":"Yellow-ochre a marrón-miel","diametro":"7-15 cm","superficie":"Viscid/Slimy"},"stem_en":{"forma":"Cylindrical","color":"Blanco, pardea with la edad","altura":"5-12 cm","diametro":"2-3.5 cm"},"flesh_en":{"color":"White","textura":"Fragile","olor":"Very fetid, rancid","sabor":"Acrid"},"sporePrint_en":"Cream"}'::jsonb
WHERE id = 'esp-031';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Blanco-grisáceo, ennegrece amb la edad","diametro":"7-20 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Blanc, gris després negre","altura":"3-8 cm","diametro":"2-4 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Convex","color":"Blanco-grisáceo, ennegrece with la edad","diametro":"7-20 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"White, grey then black","altura":"3-8 cm","diametro":"2-4 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-032';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Vermell-porpra a carmí, variable","diametro":"5-14 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Blanco, rosado, pardea amb la edad","altura":"4-10 cm","diametro":"1.5-3.5 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"A cranc cuit en adult","sabor":"Suau"},"sporePrint_ca":"Ocre groc","cap_en":{"forma":"Convex","color":"Red-purple to carmine, variable","diametro":"5-14 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"Blanco, rosado, pardea with la edad","altura":"4-10 cm","diametro":"1.5-3.5 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Cooked crab-like when mature","sabor":"Mild"},"sporePrint_en":"Yellow-ochre"}'::jsonb
WHERE id = 'esp-033';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Ocre-bru a beix, uniforme","diametro":"5-15 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Blanc cremós","altura":"4-10 cm","diametro":"2-4 cm"},"flesh_ca":{"color":"Blanca, immutable","textura":"Ferma","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Crema pàl·lid","cap_en":{"forma":"Convex","color":"Ochre-tawny to beige, uniform","diametro":"5-15 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"Creamy white","altura":"4-10 cm","diametro":"2-4 cm"},"flesh_en":{"color":"White, unchanging","textura":"Firm","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"Pale cream"}'::jsonb
WHERE id = 'esp-034';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Ataronjat amb zonas concéntricas","diametro":"4-14 cm","superficie":"Llisa, una mica viscosa"},"stem_ca":{"forma":"Cilíndric","color":"Ataronjat amb manchas","altura":"3-8 cm","diametro":"1-3 cm"},"flesh_ca":{"color":"Blanquinosa que vira a verd","textura":"Ferma","olor":"Afruitat","sabor":"Picant"},"sporePrint_ca":"Crema-rosada","cap_en":{"forma":"Convex","color":"Orangish with zonas concéntricas","diametro":"4-14 cm","superficie":"Smooth, slightly viscid"},"stem_en":{"forma":"Cylindrical","color":"Orangish with manchas","altura":"3-8 cm","diametro":"1-3 cm"},"flesh_en":{"color":"Whitish, turning green","textura":"Firm","olor":"Fruity","sabor":"Pungent"},"sporePrint_en":"Cream-pink"}'::jsonb
WHERE id = 'esp-035';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Naranja-salmón a albaricoque amb zonas concéntricas","diametro":"5-15 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Naranja-salmón amb cavidades oscuras","altura":"3-7 cm","diametro":"1.5-3.5 cm"},"flesh_ca":{"color":"Taronja pàl·lid, làtex vermell sang","textura":"Ferma","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Crema-ocre","cap_en":{"forma":"Convex","color":"Naranja-salmón a albaricoque with zonas concéntricas","diametro":"5-15 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"Naranja-salmón with cavidades oscuras","altura":"3-7 cm","diametro":"1.5-3.5 cm"},"flesh_en":{"color":"Pale orange, blood-red latex","textura":"Firm","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"Cream-ochre"}'::jsonb
WHERE id = 'esp-036';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Naranja zanahoria amb zonas verdes al madurar","diametro":"4-12 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Naranja pálido, verdea amb la edad","altura":"3-7 cm","diametro":"1.5-3 cm"},"flesh_ca":{"color":"Taronja pàl·lid, làtex taronja que verdeja","textura":"Ferma","olor":"Fúngic","sabor":"Amarg"},"sporePrint_ca":"Crema","cap_en":{"forma":"Convex","color":"Naranja zanahoria with zonas verdes al madurar","diametro":"4-12 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"Naranja pálido, verdea with la edad","altura":"3-7 cm","diametro":"1.5-3 cm"},"flesh_en":{"color":"Pale orange, latex orange that turns green","textura":"Firm","olor":"Fungal","sabor":"Bitter"},"sporePrint_en":"Cream"}'::jsonb
WHERE id = 'esp-037';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Blanc brut a crema, sense zones","diametro":"5-18 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Blanc concolor","altura":"3-7 cm","diametro":"2-4 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma i compacta","olor":"Fúngic","sabor":"Picant"},"sporePrint_ca":"Blanc-crema","cap_en":{"forma":"Convex","color":"Off-white to cream, unzonate","diametro":"5-18 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"White, concolorous","altura":"3-7 cm","diametro":"2-4 cm"},"flesh_en":{"color":"White","textura":"Firm and compact","olor":"Fungal","sabor":"Pungent"},"sporePrint_en":"White-cream"}'::jsonb
WHERE id = 'esp-038';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Rosa-salmó a taronja pàl·lid, zonat","diametro":"5-15 cm","superficie":"Tomentosa"},"stem_ca":{"forma":"Cilíndric","color":"Rosa pálido amb manchas más claras","altura":"3-8 cm","diametro":"1.5-3 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"Fúngic","sabor":"Picant"},"sporePrint_ca":"Crema-groga","cap_en":{"forma":"Convex","color":"Salmon-pink to pale orange, zonate","diametro":"5-15 cm","superficie":"Tomentose"},"stem_en":{"forma":"Cylindrical","color":"Rosa pálido with manchas más claras","altura":"3-8 cm","diametro":"1.5-3 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Fungal","sabor":"Pungent"},"sporePrint_en":"Cream-yellow"}'::jsonb
WHERE id = 'esp-039';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Azul-índigo amb zonas concéntricas","diametro":"5-15 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Blau índigo més pàl·lid","altura":"3-8 cm","diametro":"1.5-3 cm"},"flesh_ca":{"color":"Gris","textura":"Ferma","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Crema-groguenca","cap_en":{"forma":"Convex","color":"Azul-índigo with zonas concéntricas","diametro":"5-15 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"Paler indigo blue","altura":"3-8 cm","diametro":"1.5-3 cm"},"flesh_en":{"color":"Grey","textura":"Firm","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"Creamy-yellow"}'::jsonb
WHERE id = 'esp-040';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Taronja-ocre a bru","diametro":"5-15 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Naranja-ocre concoloro amb el sombrero","altura":"4-10 cm","diametro":"2-4 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"A arengada","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Convex","color":"Ochre-orange to tawny","diametro":"5-15 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"Naranja-ocre concoloro with el sombrero","altura":"4-10 cm","diametro":"2-4 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Herring-like","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-041';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Blanc a crema","diametro":"7-25 cm","superficie":"Seca"},"stem_ca":{"forma":"Cilíndric","color":"Blanc concolor","altura":"2-6 cm","diametro":"2-5 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma i compacta","olor":"Fúngic","sabor":"Picant"},"sporePrint_ca":"Blanc-crema","cap_en":{"forma":"Convex","color":"White a crema","diametro":"7-25 cm","superficie":"Dry"},"stem_en":{"forma":"Cylindrical","color":"White, concolorous","altura":"2-6 cm","diametro":"2-5 cm"},"flesh_en":{"color":"White","textura":"Firm and compact","olor":"Fungal","sabor":"Pungent"},"sporePrint_en":"White-cream"}'::jsonb
WHERE id = 'esp-042';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Ocre-mel a marró groguenc","diametro":"5-12 cm","superficie":"Viscosa"},"stem_ca":{"forma":"Cilíndric","color":"Blanc cremós","altura":"4-9 cm","diametro":"1.5-2.5 cm"},"flesh_ca":{"color":"Blanca","textura":"Fràgil","olor":"A ametlles","sabor":"Picant"},"sporePrint_ca":"Crema","cap_en":{"forma":"Convex","color":"Honey-ochre to yellowish-brown","diametro":"5-12 cm","superficie":"Viscid/Slimy"},"stem_en":{"forma":"Cylindrical","color":"Creamy white","altura":"4-9 cm","diametro":"1.5-2.5 cm"},"flesh_en":{"color":"White","textura":"Fragile","olor":"Almond-like","sabor":"Pungent"},"sporePrint_en":"Cream"}'::jsonb
WHERE id = 'esp-043';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Vermell carmí a escarlata viu","diametro":"5-12 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Blanc","altura":"4-9 cm","diametro":"1.5-3 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"Suau","sabor":"Suau"},"sporePrint_ca":"Ocre","cap_en":{"forma":"Convex","color":"Carmine-red to vivid scarlet","diametro":"5-12 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"White","altura":"4-9 cm","diametro":"1.5-3 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Mild","sabor":"Mild"},"sporePrint_en":"Ochre"}'::jsonb
WHERE id = 'esp-044';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Groc rovell d''ou","diametro":"3-12 cm","superficie":"Llisa"},"stem_ca":{"forma":"Massís","color":"Groc pàl·lid","altura":"3-8 cm","diametro":"0.8-2 cm"},"flesh_ca":{"color":"Groc pàl·lid","textura":"Ferma","olor":"Frutal","sabor":"Suau"},"sporePrint_ca":"Crema-groguenca","cap_en":{"forma":"Convex","color":"Egg-yolk yellow","diametro":"3-12 cm","superficie":"Smooth"},"stem_en":{"forma":"Solid","color":"Pale yellow","altura":"3-8 cm","diametro":"0.8-2 cm"},"flesh_en":{"color":"Pale yellow","textura":"Firm","olor":"Fruity","sabor":"Mild"},"sporePrint_en":"Creamy-yellow"}'::jsonb
WHERE id = 'esp-045';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Crema-ocre a groc pàl·lid","diametro":"3-10 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Crema-blanc concolor","altura":"3-8 cm","diametro":"1-2 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"Fruitat","sabor":"Agradable"},"sporePrint_ca":"Crema-ocre","cap_en":{"forma":"Convex","color":"Cream-ochre to pale yellow","diametro":"3-10 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"Cream-white, concolorous","altura":"3-8 cm","diametro":"1-2 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Fruity","sabor":"Pleasant"},"sporePrint_en":"Cream-ochre"}'::jsonb
WHERE id = 'esp-046';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Groc ataronjat a daurat","diametro":"2-7 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Groc més pàl·lid que el capell","altura":"3-7 cm","diametro":"0.8-1.5 cm"},"flesh_ca":{"color":"Pàl·lida","textura":"Ferma","olor":"Fruitat","sabor":"Suau"},"sporePrint_ca":"Crema-groga","cap_en":{"forma":"Convex","color":"Orange-yellow to golden","diametro":"2-7 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"Paler yellow than the cap","altura":"3-7 cm","diametro":"0.8-1.5 cm"},"flesh_en":{"color":"Pale","textura":"Firm","olor":"Fruity","sabor":"Mild"},"sporePrint_en":"Cream-yellow"}'::jsonb
WHERE id = 'esp-047';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Tubular en forma de trompeta","color":"Negre a gris oscuro","diametro":"3-8 cm","superficie":"Fibrosa"},"stem_ca":{"forma":"Buit","color":"Gris fosc","altura":"5-12 cm","diametro":"0.5-2 cm"},"flesh_ca":{"color":"Gris","textura":"Flexible i prima","olor":"Intens, afruitat","sabor":"Excel·lent, intens"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Tubular, trumpet-shaped","color":"Black a gris oscuro","diametro":"3-8 cm","superficie":"Fibrous"},"stem_en":{"forma":"Hollow","color":"Dark grey","altura":"5-12 cm","diametro":"0.5-2 cm"},"flesh_en":{"color":"Grey","textura":"Flexible and thin","olor":"Intense, fruity","sabor":"Excellent, intense"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-048';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Infundibuliforme","color":"Groc ataronjat","diametro":"2-6 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Taronja brillant","altura":"4-8 cm","diametro":"0.5-1 cm"},"flesh_ca":{"color":"Groga","textura":"Prima i flexible","olor":"Fruital","sabor":"Agradable"},"sporePrint_ca":"Ocràcia","cap_en":{"forma":"Funnel-shaped","color":"Orange-yellow","diametro":"2-6 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"Bright orange","altura":"4-8 cm","diametro":"0.5-1 cm"},"flesh_en":{"color":"Yellowish","textura":"Thin and flexible","olor":"Fruity","sabor":"Pleasant"},"sporePrint_en":"Ochraceous"}'::jsonb
WHERE id = 'esp-049';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Infundibuliforme","color":"Ocre-marró a groc","diametro":"2-6 cm","superficie":"Fibrosa"},"stem_ca":{"forma":"Buit","color":"Groc intens","altura":"4-8 cm","diametro":"0.5-1 cm"},"flesh_ca":{"color":"Groga","textura":"Elàstica","olor":"Agradable","sabor":"Agradable"},"sporePrint_ca":"Blanca a crema","cap_en":{"forma":"Funnel-shaped","color":"Ochre-brown to yellow","diametro":"2-6 cm","superficie":"Fibrous"},"stem_en":{"forma":"Hollow","color":"Intense yellow","altura":"4-8 cm","diametro":"0.5-1 cm"},"flesh_en":{"color":"Yellowish","textura":"Elastic","olor":"Pleasant","sabor":"Pleasant"},"sporePrint_en":"White to cream"}'::jsonb
WHERE id = 'esp-050';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Irregular","color":"Crema-ataronjat pàl·lid","diametro":"5-15 cm","superficie":"Mate"},"stem_ca":{"forma":"Massís","color":"Concolor al capell","altura":"3-8 cm","diametro":"1-3 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"Agradable","sabor":"Amarg"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Irregular","color":"Pale cream-orange","diametro":"5-15 cm","superficie":"Matt"},"stem_en":{"forma":"Solid","color":"Concolorous with cap","altura":"3-8 cm","diametro":"1-3 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Pleasant","sabor":"Bitter"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-051';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Taronja-salmó a pressec","diametro":"3-8 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Taronja-salmó pàl·lid","altura":"3-7 cm","diametro":"1-2 cm"},"flesh_ca":{"color":"Crema","textura":"Ferma","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Blanc-crema","cap_en":{"forma":"Convex","color":"Salmon-orange to peach","diametro":"3-8 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"Pale salmon-orange","altura":"3-7 cm","diametro":"1-2 cm"},"flesh_en":{"color":"Cream","textura":"Firm","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"White-cream"}'::jsonb
WHERE id = 'esp-052';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Infundibuliforme","color":"Lila-violaci a ocre-bru al disc","diametro":"5-15 cm","superficie":"Irregular, lobulada"},"stem_ca":{"forma":"Claviforme","color":"Violaceu a lila","altura":"3-8 cm","diametro":"2-5 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Ocre-groga","cap_en":{"forma":"Funnel-shaped","color":"Lilac-violet to ochre-tawny at disc","diametro":"5-15 cm","superficie":"Irregular, lobed"},"stem_en":{"forma":"Club-shaped","color":"Violet-tinged a lila","altura":"3-8 cm","diametro":"2-5 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"Ochre-yellow"}'::jsonb
WHERE id = 'esp-053';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Infundibuliforme","color":"Gris-bru fosc a negre-grisenc","diametro":"2-6 cm","superficie":"Ondulada, irregular"},"stem_ca":{"forma":"Cilíndric","color":"Gris fosc","altura":"3-8 cm","diametro":"0.5-1.5 cm"},"flesh_ca":{"color":"Gris","textura":"Elàstica","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Blanc-crema","cap_en":{"forma":"Funnel-shaped","color":"Dark grey-brown to greyish-black","diametro":"2-6 cm","superficie":"Wavy, irregular"},"stem_en":{"forma":"Cylindrical","color":"Dark grey","altura":"3-8 cm","diametro":"0.5-1.5 cm"},"flesh_en":{"color":"Grey","textura":"Elastic","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"White-cream"}'::jsonb
WHERE id = 'esp-054';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Taronja brillant a vermell","diametro":"8-20 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Groc amb anillo estriado","altura":"8-15 cm","diametro":"2-4 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"Agradable","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Convex","color":"Bright orange to red","diametro":"8-20 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"Yellow with anillo estriado","altura":"8-15 cm","diametro":"2-4 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Pleasant","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-055';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Esfèric, després estès","color":"Rojo escarlata amb verrugas blancas","diametro":"6-20 cm","superficie":"Coberta de berrugues blanques"},"stem_ca":{"forma":"Cilíndric","color":"Blanc amb anillo","altura":"8-20 cm","diametro":"1.5-3 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"Suau","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Spherical, later expanded","color":"Rojo escarlata with verrugas blancas","diametro":"6-20 cm","superficie":"Covered with white warts"},"stem_en":{"forma":"Cylindrical","color":"White with anillo","altura":"8-20 cm","diametro":"1.5-3 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Mild","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-056';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Verd oliva a groc-verdós","diametro":"5-15 cm","superficie":"Llisa"},"stem_ca":{"forma":"Amb bulb i volva en sac","color":"Blanc verdós","altura":"7-15 cm","diametro":"1-2 cm"},"flesh_ca":{"color":"Blanca, immutable","textura":"Ferma","olor":"Agradable","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Convex","color":"Olive-green to yellowish-green","diametro":"5-15 cm","superficie":"Smooth"},"stem_en":{"forma":"With bulb and sac-like volva","color":"Greenish-white","altura":"7-15 cm","diametro":"1-2 cm"},"flesh_en":{"color":"White, unchanging","textura":"Firm","olor":"Pleasant","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-057';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Blanc pur, brillant","diametro":"5-10 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Blanc amb anillo blanco colgante","altura":"8-15 cm","diametro":"1-2 cm"},"flesh_ca":{"color":"Blanca, immutable","textura":"Ferma","olor":"Agradable","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Convex","color":"Pure white, shiny","diametro":"5-10 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"White with anillo blanco colgante","altura":"8-15 cm","diametro":"1-2 cm"},"flesh_en":{"color":"White, unchanging","textura":"Firm","olor":"Pleasant","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-058';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Blanc pur","diametro":"5-12 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Blanc amb anillo blanco harapiento","altura":"10-20 cm","diametro":"1-2 cm"},"flesh_ca":{"color":"Blanca, immutable","textura":"Ferma","olor":"Agradable","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Convex","color":"Pure white","diametro":"5-12 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"White with anillo blanco harapiento","altura":"10-20 cm","diametro":"1-2 cm"},"flesh_en":{"color":"White, unchanging","textura":"Firm","olor":"Pleasant","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-059';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Marró fosc a gris-pardo amb verrugas blancas","diametro":"5-12 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Blanc amb anillo estriado","altura":"8-15 cm","diametro":"1-2 cm"},"flesh_ca":{"color":"Blanca, immutable","textura":"Ferma","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Convex","color":"Dark brown a gris-pardo with verrugas blancas","diametro":"5-12 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"White with anillo estriado","altura":"8-15 cm","diametro":"1-2 cm"},"flesh_en":{"color":"White, unchanging","textura":"Firm","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-060';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Rosa-grisáceo a marrón-pardo amb verrugas grises","diametro":"6-15 cm","superficie":"Amb flocs grisencs (restes del vel)"},"stem_ca":{"forma":"Cilíndric","color":"Blanco-rosado amb tinte herrumbre en la base","altura":"8-18 cm","diametro":"1.5-3 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"Agradable","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Convex","color":"Rosa-grisáceo a marrón-pardo with verrugas grises","diametro":"6-15 cm","superficie":"With greyish flakes (veil remnants)"},"stem_en":{"forma":"Cylindrical","color":"Blanco-rosado with tinte herrumbre en la base","altura":"8-18 cm","diametro":"1.5-3 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Pleasant","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-061';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Blanc a crema","diametro":"8-20 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Blanc amb anillo blanco colgante","altura":"10-20 cm","diametro":"2-4 cm"},"flesh_ca":{"color":"Blanca, immutable","textura":"Ferma i compacta","olor":"Agradable","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Convex","color":"White a crema","diametro":"8-20 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"White with anillo blanco colgante","altura":"10-20 cm","diametro":"2-4 cm"},"flesh_en":{"color":"White, unchanging","textura":"Firm and compact","olor":"Pleasant","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-062';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Gris-pardo amb verrugas grises","diametro":"6-14 cm","superficie":"Amb pegats grisos del vel"},"stem_ca":{"forma":"Cilíndric","color":"Blanco-grisáceo amb escamas","altura":"8-15 cm","diametro":"1.5-3 cm"},"flesh_ca":{"color":"Blanca, immutable","textura":"Ferma","olor":"A rave","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Convex","color":"Gris-pardo with verrugas grises","diametro":"6-14 cm","superficie":"With grey veil patches"},"stem_en":{"forma":"Cylindrical","color":"Blanco-grisáceo with escamas","altura":"8-15 cm","diametro":"1.5-3 cm"},"flesh_en":{"color":"White, unchanging","textura":"Firm","olor":"Radish-like","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-063';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Taronja-ocre a groc-ataronjat","diametro":"5-12 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Blanc amb escamas anaranjadas","altura":"10-18 cm","diametro":"1-2 cm"},"flesh_ca":{"color":"Blanca, immutable","textura":"Ferma","olor":"Suau","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Convex","color":"Ochre-orange to orange-yellow","diametro":"5-12 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"White with escamas anaranjadas","altura":"10-18 cm","diametro":"1-2 cm"},"flesh_en":{"color":"White, unchanging","textura":"Firm","olor":"Mild","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-064';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Amarillo-limón a blanco-verdoso, amb parches blancos","diametro":"5-12 cm","superficie":"Amb restes del vel universal"},"stem_ca":{"forma":"Cilíndric","color":"Blanco-amarillento amb anillo colgante","altura":"8-14 cm","diametro":"1.5-2.5 cm"},"flesh_ca":{"color":"Blanca, immutable","textura":"Ferma","olor":"A patata crua","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Convex","color":"Amarillo-limón a blanco-verdoso, with parches blancos","diametro":"5-12 cm","superficie":"With universal veil remnants"},"stem_en":{"forma":"Cylindrical","color":"Blanco-amarillento with anillo colgante","altura":"8-14 cm","diametro":"1.5-2.5 cm"},"flesh_en":{"color":"White, unchanging","textura":"Firm","olor":"Raw potato-like","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-065';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Groc-ocre a naranja pálido, amb verrugas blancas","diametro":"4-10 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Blanco-amarillento amb anillo frágil","altura":"7-14 cm","diametro":"1-2 cm"},"flesh_ca":{"color":"Blanca","textura":"Fràgil","olor":"Suau","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Convex","color":"Yellow-ochre a naranja pálido, with verrugas blancas","diametro":"4-10 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"Blanco-amarillento with anillo frágil","altura":"7-14 cm","diametro":"1-2 cm"},"flesh_en":{"color":"White","textura":"Fragile","olor":"Mild","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-066';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Blanc a gris pálido amb grandes verrugas piramidales grises","diametro":"8-20 cm","superficie":"Amb flocs piramidals prominents"},"stem_ca":{"forma":"Cilíndric","color":"Blanc amb escamas o fibrillas grises","altura":"10-20 cm","diametro":"2-4 cm"},"flesh_ca":{"color":"Blanca, immutable","textura":"Ferma i compacta","olor":"Suau","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Convex","color":"White a gris pálido with grandes verrugas piramidales grises","diametro":"8-20 cm","superficie":"With prominent pyramidal warts"},"stem_en":{"forma":"Cylindrical","color":"White with escamas o fibrillas grises","altura":"10-20 cm","diametro":"2-4 cm"},"flesh_en":{"color":"White, unchanging","textura":"Firm and compact","olor":"Mild","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-067';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Rosado-salmón a ocre claro, amb margen estriado","diametro":"4-10 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Blanc-rosat","altura":"7-14 cm","diametro":"1-2 cm"},"flesh_ca":{"color":"Blanca, immutable","textura":"Fràgil","olor":"Suau","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Convex","color":"Rosado-salmón a ocre claro, with margen estriado","diametro":"4-10 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"White-pink","altura":"7-14 cm","diametro":"1-2 cm"},"flesh_en":{"color":"White, unchanging","textura":"Fragile","olor":"Mild","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-068';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Gris oscuro a pardo-gris amb verrugas grises","diametro":"7-15 cm","superficie":"Amb pegats grisos del vel"},"stem_ca":{"forma":"Cilíndric","color":"Blanco-grisáceo amb escamas en la base","altura":"8-16 cm","diametro":"1.5-3 cm"},"flesh_ca":{"color":"Blanca, immutable","textura":"Ferma","olor":"A rave","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Convex","color":"Gris oscuro a pardo-gris with verrugas grises","diametro":"7-15 cm","superficie":"With grey veil patches"},"stem_en":{"forma":"Cylindrical","color":"Blanco-grisáceo with escamas en la base","altura":"8-16 cm","diametro":"1.5-3 cm"},"flesh_en":{"color":"White, unchanging","textura":"Firm","olor":"Radish-like","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-069';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"En forma d''ostra o ventall","color":"Gris blavós a marró","diametro":"5-20 cm","superficie":"Llisa"},"stem_ca":{"forma":"Lateral","color":"Blanquinós","altura":"1-3 cm","diametro":"1-3 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"Agradable","sabor":"Suau"},"sporePrint_ca":"Lila pàl·lid","cap_en":{"forma":"Oyster- or fan-shaped","color":"Bluish-grey to brown","diametro":"5-20 cm","superficie":"Smooth"},"stem_en":{"forma":"Lateral","color":"Whitish","altura":"1-3 cm","diametro":"1-3 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Pleasant","sabor":"Mild"},"sporePrint_en":"Pale lilac"}'::jsonb
WHERE id = 'esp-070';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Marró-gris a crema-beix","diametro":"5-15 cm","superficie":"Llisa"},"stem_ca":{"forma":"Central","color":"Blanc a crema","altura":"2-6 cm","diametro":"1.5-4 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"Agradable","sabor":"Suau i agradable"},"sporePrint_ca":"Blanc-lila pàl·lid","cap_en":{"forma":"Convex","color":"Grey-brown to cream-beige","diametro":"5-15 cm","superficie":"Smooth"},"stem_en":{"forma":"Central","color":"White a crema","altura":"2-6 cm","diametro":"1.5-4 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Pleasant","sabor":"Mild and pleasant"},"sporePrint_en":"Pale white-lilac"}'::jsonb
WHERE id = 'esp-071';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Crema-ocre a beix-grisenc","diametro":"5-15 cm","superficie":"Llisa"},"stem_ca":{"forma":"Excèntric, fusionat a la base, sòlid","color":"Blanc-crema","altura":"3-8 cm","diametro":"1-3 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Blanc-lila pàl·lid","cap_en":{"forma":"Convex","color":"Cream-ochre to greyish-beige","diametro":"5-15 cm","superficie":"Smooth"},"stem_en":{"forma":"Eccentric, fused at base, solid","color":"White-cream","altura":"3-8 cm","diametro":"1-3 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"Pale white-lilac"}'::jsonb
WHERE id = 'esp-072';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Blanc a gris pálido","diametro":"4-12 cm","superficie":"Llisa"},"stem_ca":{"forma":"Absent","color":"Blanc","altura":"1-3 cm","diametro":"1-2 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Blanc-lila pàl·lid","cap_en":{"forma":"Convex","color":"White a gris pálido","diametro":"4-12 cm","superficie":"Smooth"},"stem_en":{"forma":"Absent","color":"White","altura":"1-3 cm","diametro":"1-2 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"Pale white-lilac"}'::jsonb
WHERE id = 'esp-073';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Taronja viu a taronja-groguenc","diametro":"5-15 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Taronja concolor","altura":"5-12 cm","diametro":"1-3 cm"},"flesh_ca":{"color":"Groga","textura":"Ferma","olor":"Agradable","sabor":"Amarg"},"sporePrint_ca":"Crema-blanca","cap_en":{"forma":"Convex","color":"Vivid orange to orange-yellow","diametro":"5-15 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"Orange, concolorous","altura":"5-12 cm","diametro":"1-3 cm"},"flesh_en":{"color":"Yellow","textura":"Firm","olor":"Pleasant","sabor":"Bitter"},"sporePrint_en":"Cream-white"}'::jsonb
WHERE id = 'esp-074';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Marró fosc a castaño","diametro":"5-20 cm","superficie":"Amb escates blanquinoses al marge"},"stem_ca":{"forma":"Cilíndric","color":"Marró amb fibras","altura":"4-10 cm","diametro":"1-2.5 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Convex","color":"Dark brown a castaño","diametro":"5-20 cm","superficie":"With whitish scales at margin"},"stem_en":{"forma":"Cylindrical","color":"Brown with fibras","altura":"4-10 cm","diametro":"1-2.5 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-075';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"En forma d''espàtula o cullera","color":"Gris-bru a crema-beix","diametro":"2-7 cm","superficie":"Llisa"},"stem_ca":{"forma":"Lateral","color":"Blanc-grisenc","altura":"1-3 cm","diametro":"0.5-1 cm"},"flesh_ca":{"color":"Blanca","textura":"Elàstica","olor":"Suau","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Spatula- or spoon-shaped","color":"Grey-brown to cream-beige","diametro":"2-7 cm","superficie":"Smooth"},"stem_en":{"forma":"Lateral","color":"Greyish-white","altura":"1-3 cm","diametro":"0.5-1 cm"},"flesh_en":{"color":"White","textura":"Elastic","olor":"Mild","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-076';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Infundibuliforme","color":"Lila-violaci a crema-ocre, decolorat","diametro":"3-12 cm","superficie":"Llisa"},"stem_ca":{"forma":"Lateral","color":"Violaceu a crema","altura":"1-4 cm","diametro":"0.8-2 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"Suau","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Funnel-shaped","color":"Lilac-violet to cream-ochre, faded","diametro":"3-12 cm","superficie":"Smooth"},"stem_en":{"forma":"Lateral","color":"Violet-tinged a crema","altura":"1-4 cm","diametro":"0.8-2 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Mild","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-077';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Irregular","color":"Ocre a marró","diametro":"3-7 cm","superficie":"Alveolada"},"stem_ca":{"forma":"Cilíndric","color":"Blanquinós a crema","altura":"4-8 cm","diametro":"1.5-4 cm"},"flesh_ca":{"color":"Blanquinosa, fràgil","textura":"Fràgil","olor":"Agradable","sabor":"Agradable"},"sporePrint_ca":"Crema-groguenca","cap_en":{"forma":"Irregular","color":"Ochre a marrón","diametro":"3-7 cm","superficie":"Alveolate/Pitted"},"stem_en":{"forma":"Cylindrical","color":"Whitish to cream","altura":"4-8 cm","diametro":"1.5-4 cm"},"flesh_en":{"color":"Whitish, fragile","textura":"Fragile","olor":"Pleasant","sabor":"Pleasant"},"sporePrint_en":"Creamy-yellow"}'::jsonb
WHERE id = 'esp-078';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Cònic-allargat, mitriforme","color":"Marró-negre a gris fosc","diametro":"3-7 cm de alto","superficie":"Alveolada"},"stem_ca":{"forma":"Cilíndric","color":"Blanc a crema","altura":"4-10 cm","diametro":"2-4 cm"},"flesh_ca":{"color":"Blanca","textura":"Fràgil","olor":"Agradable","sabor":"Suau"},"sporePrint_ca":"Crema-groga","cap_en":{"forma":"Elongated-conical, mitriform","color":"Brown-black to dark grey","diametro":"3-7 cm de alto","superficie":"Alveolate/Pitted"},"stem_en":{"forma":"Cylindrical","color":"White a crema","altura":"4-10 cm","diametro":"2-4 cm"},"flesh_en":{"color":"White","textura":"Fragile","olor":"Pleasant","sabor":"Mild"},"sporePrint_en":"Cream-yellow"}'::jsonb
WHERE id = 'esp-079';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Cònic, mitriforme","color":"Marró a marrón-gris","diametro":"3-6 cm de alto","superficie":"Alveolada"},"stem_ca":{"forma":"Cilíndric","color":"Blanc a crema","altura":"3-8 cm","diametro":"2-4 cm"},"flesh_ca":{"color":"Blanca","textura":"Fràgil","olor":"Agradable","sabor":"Suau"},"sporePrint_ca":"Crema-groga","cap_en":{"forma":"Conical, mitriform","color":"Brown a marrón-gris","diametro":"3-6 cm de alto","superficie":"Alveolate/Pitted"},"stem_en":{"forma":"Cylindrical","color":"White a crema","altura":"3-8 cm","diametro":"2-4 cm"},"flesh_en":{"color":"White","textura":"Fragile","olor":"Pleasant","sabor":"Mild"},"sporePrint_en":"Cream-yellow"}'::jsonb
WHERE id = 'esp-080';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Cònic a el·lipsoïdal","color":"Marró-ocre a gris-marró","diametro":"3-6 cm de alto","superficie":"Alveolada"},"stem_ca":{"forma":"Cilíndric","color":"Blanc a crema","altura":"4-10 cm","diametro":"2-5 cm"},"flesh_ca":{"color":"Blanca","textura":"Fràgil","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Crema-groga","cap_en":{"forma":"Conical to ellipsoidal","color":"Ochre-brown to grey-brown","diametro":"3-6 cm de alto","superficie":"Alveolate/Pitted"},"stem_en":{"forma":"Cylindrical","color":"White a crema","altura":"4-10 cm","diametro":"2-5 cm"},"flesh_en":{"color":"White","textura":"Fragile","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"Cream-yellow"}'::jsonb
WHERE id = 'esp-081';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Irregular","color":"Marró-roig a castany fosc","diametro":"4-15 cm","superficie":"Molt irregular, cerebriforme"},"stem_ca":{"forma":"Cilíndric","color":"Blanc-rosat o crema","altura":"3-8 cm","diametro":"2-5 cm"},"flesh_ca":{"color":"Blanca","textura":"Fràgil","olor":"Agradable","sabor":"Suau"},"sporePrint_ca":"Crema-groga","cap_en":{"forma":"Irregular","color":"Red-brown to dark chestnut","diametro":"4-15 cm","superficie":"Very irregular, brain-like"},"stem_en":{"forma":"Cylindrical","color":"White-pink or cream","altura":"3-8 cm","diametro":"2-5 cm"},"flesh_en":{"color":"White","textura":"Fragile","olor":"Pleasant","sabor":"Mild"},"sporePrint_en":"Cream-yellow"}'::jsonb
WHERE id = 'esp-082';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Irregular","color":"Gris fosc a negre","diametro":"2-5 cm de alto","superficie":"Irregular, bilobulada"},"stem_ca":{"forma":"Cilíndric","color":"Gris a gris fosc","altura":"3-10 cm","diametro":"1-3 cm"},"flesh_ca":{"color":"Gris","textura":"Fràgil","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Irregular","color":"Dark grey to black","diametro":"2-5 cm de alto","superficie":"Irregular, bilobed"},"stem_en":{"forma":"Cylindrical","color":"Grey a gris oscuro","altura":"3-10 cm","diametro":"1-3 cm"},"flesh_en":{"color":"Grey","textura":"Fragile","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-083';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Irregular","color":"Blanc-crema a ocre pàl·lid","diametro":"2-5 cm de alto","superficie":"Irregular, bilobulada"},"stem_ca":{"forma":"Cilíndric","color":"Blanc-crema","altura":"3-10 cm","diametro":"1.5-3 cm"},"flesh_ca":{"color":"Blanca","textura":"Fràgil","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Irregular","color":"White-cream to pale ochre","diametro":"2-5 cm de alto","superficie":"Irregular, bilobed"},"stem_en":{"forma":"Cylindrical","color":"White-cream","altura":"3-10 cm","diametro":"1.5-3 cm"},"flesh_en":{"color":"White","textura":"Fragile","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-084';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Cupuliforme, en forma de copa","color":"Marró fosc a gris-marrón","diametro":"3-8 cm","superficie":"Llisa"},"stem_ca":{"forma":"Curt, amb costelles que s''estenen per l''exterior de la copa","color":"Gris-crema","altura":"1-4 cm","diametro":"1-3 cm"},"flesh_ca":{"color":"Crema","textura":"Fràgil","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Cup-shaped","color":"Dark brown a gris-marrón","diametro":"3-8 cm","superficie":"Smooth"},"stem_en":{"forma":"Short, with ribs extending on the outer cup surface","color":"Grey-cream","altura":"1-4 cm","diametro":"1-3 cm"},"flesh_en":{"color":"Cream","textura":"Fragile","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-085';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Irregular","color":"Negre-blavós a marró-negre","diametro":"3-10 cm","superficie":"Rugosa"},"stem_ca":{"forma":"Absent","color":"N/A","altura":"N/A","diametro":"N/A"},"flesh_ca":{"color":"Blanca","textura":"Ferma i compacta","olor":"Intensíssim, penetrant","sabor":"Intens, umami"},"sporePrint_ca":"Marró fosc","cap_en":{"forma":"Irregular","color":"Bluish-black to black-brown","diametro":"3-10 cm","superficie":"Wrinkled"},"stem_en":{"forma":"Absent","color":"N/A","altura":"N/A","diametro":"N/A"},"flesh_en":{"color":"White","textura":"Firm and compact","olor":"Very intense, pungent","sabor":"Intense, umami"},"sporePrint_en":"Dark brown"}'::jsonb
WHERE id = 'esp-086';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Irregular","color":"Negro-pardo amb verrugas piramidales","diametro":"2-8 cm","superficie":"Rugosa"},"stem_ca":{"forma":"Absent","color":"N/A","altura":"N/A","diametro":"N/A"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"Agradable","sabor":"Suau"},"sporePrint_ca":"Marró-ocre","cap_en":{"forma":"Irregular","color":"Negro-pardo with verrugas piramidales","diametro":"2-8 cm","superficie":"Wrinkled"},"stem_en":{"forma":"Absent","color":"N/A","altura":"N/A","diametro":"N/A"},"flesh_en":{"color":"White","textura":"Firm","olor":"Pleasant","sabor":"Mild"},"sporePrint_en":"Ochre-brown"}'::jsonb
WHERE id = 'esp-087';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Irregular","color":"Bru-rogenc a beix-crema","diametro":"1-6 cm","superficie":"Llisa"},"stem_ca":{"forma":"Absent","color":"N/A","altura":"N/A","diametro":"N/A"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"A all, penetrant","sabor":"Suau"},"sporePrint_ca":"Marró-ocre","cap_en":{"forma":"Irregular","color":"Reddish-brown to cream-beige","diametro":"1-6 cm","superficie":"Smooth"},"stem_en":{"forma":"Absent","color":"N/A","altura":"N/A","diametro":"N/A"},"flesh_en":{"color":"White","textura":"Firm","olor":"Garlicky, pungent","sabor":"Mild"},"sporePrint_en":"Ochre-brown"}'::jsonb
WHERE id = 'esp-088';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Cupuliforme, després expandida","color":"Marró-ocre a bru","diametro":"3-10 cm","superficie":"Llisa"},"stem_ca":{"forma":"Absent","color":"Marró pàl·lid","altura":"0-2 cm","diametro":"2-5 cm"},"flesh_ca":{"color":"Blanca","textura":"Fràgil","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Cup-shaped, later expanded","color":"Ochre-brown to tawny","diametro":"3-10 cm","superficie":"Smooth"},"stem_en":{"forma":"Absent","color":"Pale brown","altura":"0-2 cm","diametro":"2-5 cm"},"flesh_en":{"color":"White","textura":"Fragile","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-089';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Groc-verdós a groc-oliva","diametro":"5-12 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Groc concolor","altura":"5-12 cm","diametro":"1.5-3 cm"},"flesh_ca":{"color":"Groga","textura":"Ferma","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Convex","color":"Yellowish-green to olive-yellow","diametro":"5-12 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"Yellow, concolorous","altura":"5-12 cm","diametro":"1.5-3 cm"},"flesh_en":{"color":"Yellow","textura":"Firm","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-090';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Gris negruzco amb estrías radiales","diametro":"6-12 cm","superficie":"Viscosa"},"stem_ca":{"forma":"Cilíndric","color":"Blanquecino amb tintes grises","altura":"6-10 cm","diametro":"1.5-2.5 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"Agradable","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Convex","color":"Gris negruzco with estrías radiales","diametro":"6-12 cm","superficie":"Viscid/Slimy"},"stem_en":{"forma":"Cylindrical","color":"Blanquecino with tintes grises","altura":"6-10 cm","diametro":"1.5-2.5 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Pleasant","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-091';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Gris fosc a gris cendra","diametro":"4-8 cm","superficie":"Seca"},"stem_ca":{"forma":"Cilíndric","color":"Blanquinós","altura":"3-6 cm","diametro":"0.5-1.5 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"Farinós","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Convex","color":"Dark grey to ash-grey","diametro":"4-8 cm","superficie":"Dry"},"stem_en":{"forma":"Cylindrical","color":"Whitish","altura":"3-6 cm","diametro":"0.5-1.5 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Mealy","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-092';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Groc sofre a groc-verdós","diametro":"4-10 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Groc sofre concolor","altura":"5-10 cm","diametro":"1-2 cm"},"flesh_ca":{"color":"Groc sofre","textura":"Ferma","olor":"Agradable","sabor":"Agradable"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Convex","color":"Sulphur yellow to yellowish-green","diametro":"4-10 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"Sulphur yellow, concolorous","altura":"5-10 cm","diametro":"1-2 cm"},"flesh_en":{"color":"Sulphur yellow","textura":"Firm","olor":"Pleasant","sabor":"Pleasant"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-093';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Gris verdós a gris-oliva, variable","diametro":"5-12 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Blanco-grisáceo a verdoso, amb tintes rosados en la base","altura":"5-12 cm","diametro":"1.5-3 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"A sabó","sabor":"Agradable"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Convex","color":"Greenish-grey to olive-grey, variable","diametro":"5-12 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"Blanco-grisáceo a verdoso, with tintes rosados en la base","altura":"5-12 cm","diametro":"1.5-3 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Soapy","sabor":"Pleasant"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-094';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Blanc crema a blanc brut","diametro":"6-15 cm","superficie":"Llisa"},"stem_ca":{"forma":"Robust","color":"Blanc","altura":"3-8 cm","diametro":"2-5 cm"},"flesh_ca":{"color":"Blanca, immutable","textura":"Ferma i compacta","olor":"Intensament farinós","sabor":"Farinós, excel·lent"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Convex","color":"Cream-white to off-white","diametro":"6-15 cm","superficie":"Smooth"},"stem_en":{"forma":"Stout","color":"White","altura":"3-8 cm","diametro":"2-5 cm"},"flesh_en":{"color":"White, unchanging","textura":"Firm and compact","olor":"Strongly mealy","sabor":"Mealy, excellent"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-095';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Gris-bru a marró-grisenc","diametro":"5-12 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Blanc-grisenc","altura":"5-12 cm","diametro":"1-2.5 cm"},"flesh_ca":{"color":"Blanca, immutable","textura":"Ferma","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Convex","color":"Grey-brown to greyish-brown","diametro":"5-12 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"Greyish-white","altura":"5-12 cm","diametro":"1-2.5 cm"},"flesh_en":{"color":"White, unchanging","textura":"Firm","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-096';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Crema-beix a ocre pàl·lid","diametro":"8-20 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Crema-blanc concolor","altura":"8-18 cm","diametro":"2-4 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma i compacta","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Blanc-crema","cap_en":{"forma":"Convex","color":"Cream-beige to pale ochre","diametro":"8-20 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"Cream-white, concolorous","altura":"8-18 cm","diametro":"2-4 cm"},"flesh_en":{"color":"White","textura":"Firm and compact","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"White-cream"}'::jsonb
WHERE id = 'esp-097';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Gris cendra a beix","diametro":"8-20 cm","superficie":"Llisa"},"stem_ca":{"forma":"Robust","color":"Blanquinós-grisenc","altura":"6-10 cm","diametro":"2-4 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma i compacta","olor":"Intens, peculiar","sabor":"Suau"},"sporePrint_ca":"Crema-blanca","cap_en":{"forma":"Convex","color":"Ash-grey to beige","diametro":"8-20 cm","superficie":"Smooth"},"stem_en":{"forma":"Stout","color":"Whitish-grey","altura":"6-10 cm","diametro":"2-4 cm"},"flesh_en":{"color":"White","textura":"Firm and compact","olor":"Intense, distinctive","sabor":"Mild"},"sporePrint_en":"Cream-white"}'::jsonb
WHERE id = 'esp-098';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Gris-blavós a gris-verdós","diametro":"4-10 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Gris-verdós concolor","altura":"3-8 cm","diametro":"1-2 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"A anís","sabor":"A anís"},"sporePrint_ca":"Blanc-crema","cap_en":{"forma":"Convex","color":"Bluish-grey to greenish-grey","diametro":"4-10 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"Greenish-grey, concolorous","altura":"3-8 cm","diametro":"1-2 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Anise-like","sabor":"Anise-like"},"sporePrint_en":"White-cream"}'::jsonb
WHERE id = 'esp-099';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Blanc a crema-grisáceo, higrófano","diametro":"2-6 cm","superficie":"Pruïnosa, lleugerament humida"},"stem_ca":{"forma":"Cilíndric","color":"Blanc-crema concolor","altura":"2-5 cm","diametro":"0.5-1.5 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Convex","color":"White a crema-grisáceo, higrófano","diametro":"2-6 cm","superficie":"Pruinose, slightly moist"},"stem_en":{"forma":"Cylindrical","color":"White-cream, concolorous","altura":"2-5 cm","diametro":"0.5-1.5 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-100';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Violeta-lila intenso, decolora amb edad","diametro":"6-12 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Lila-violeta","altura":"5-8 cm","diametro":"1.5-2.5 cm"},"flesh_ca":{"color":"Lila pàl·lid","textura":"Ferma","olor":"Frutal","sabor":"Agradable"},"sporePrint_ca":"Rosa pàl·lid","cap_en":{"forma":"Convex","color":"Violeta-lila intenso, decolora with edad","diametro":"6-12 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"Lilac-violet","altura":"5-8 cm","diametro":"1.5-2.5 cm"},"flesh_en":{"color":"Pale lilac","textura":"Firm","olor":"Fruity","sabor":"Pleasant"},"sporePrint_en":"Pale pink"}'::jsonb
WHERE id = 'esp-101';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Marró-crema a beix, més clar al marge","diametro":"5-15 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Violaceu a lila pálido","altura":"4-10 cm","diametro":"1.5-3 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma i compacta","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Rosa pàl·lid","cap_en":{"forma":"Convex","color":"Brown-cream to beige, paler at margin","diametro":"5-15 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"Violet-tinged a lila pálido","altura":"4-10 cm","diametro":"1.5-3 cm"},"flesh_en":{"color":"White","textura":"Firm and compact","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"Pale pink"}'::jsonb
WHERE id = 'esp-102';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Taronja-mel a marró-ataronjat, més fosc al centre","diametro":"2-8 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Marró fosc a negro-aterciopelado","altura":"3-10 cm","diametro":"0.5-1.5 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"Suau","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Convex","color":"Honey-orange to orange-brown, darker at centre","diametro":"2-8 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"Dark brown a negro-aterciopelado","altura":"3-10 cm","diametro":"0.5-1.5 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Mild","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-103';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Miel-anaranjado amb escamitas oscuras","diametro":"4-12 cm","superficie":"Amb escates fibril·loses"},"stem_ca":{"forma":"Cilíndric","color":"Marró groguenc","altura":"8-15 cm","diametro":"0.8-1.5 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"Agradable","sabor":"Amarg"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Convex","color":"Miel-anaranjado with escamitas oscuras","diametro":"4-12 cm","superficie":"With fibrillose scales"},"stem_en":{"forma":"Cylindrical","color":"Yellowish-brown","altura":"8-15 cm","diametro":"0.8-1.5 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Pleasant","sabor":"Bitter"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-104';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Gris-beix a blanc-grisenc","diametro":"6-15 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Blanc a gris pálido amb fibras","altura":"5-12 cm","diametro":"1.5-3 cm"},"flesh_ca":{"color":"Blanca, immutable","textura":"Ferma","olor":"Agradable","sabor":"A farina"},"sporePrint_ca":"Rosa-salmó","cap_en":{"forma":"Convex","color":"Grey-beige to greyish-white","diametro":"6-15 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"White a gris pálido with fibras","altura":"5-12 cm","diametro":"1.5-3 cm"},"flesh_en":{"color":"White, unchanging","textura":"Firm","olor":"Pleasant","sabor":"Mealy"},"sporePrint_en":"Pink-salmon"}'::jsonb
WHERE id = 'esp-105';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Gris-marró a beige, higrófano","diametro":"4-10 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Blanc-grisenc","altura":"4-10 cm","diametro":"1-2 cm"},"flesh_ca":{"color":"Blanca","textura":"Fràgil","olor":"A farina","sabor":"A farina"},"sporePrint_ca":"Rosa-salmó","cap_en":{"forma":"Convex","color":"Grey-brown a beige, higrófano","diametro":"4-10 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"Greyish-white","altura":"4-10 cm","diametro":"1-2 cm"},"flesh_en":{"color":"White","textura":"Fragile","olor":"Mealy","sabor":"Mealy"},"sporePrint_en":"Pink-salmon"}'::jsonb
WHERE id = 'esp-106';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Gris-marró a pardo claro","diametro":"4-10 cm","superficie":"Seca"},"stem_ca":{"forma":"Cilíndric","color":"Blanco-grisáceo amb fibras","altura":"4-10 cm","diametro":"1-2 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"A farina","sabor":"A farina"},"sporePrint_ca":"Rosa-salmó","cap_en":{"forma":"Convex","color":"Grey-brown a pardo claro","diametro":"4-10 cm","superficie":"Dry"},"stem_en":{"forma":"Cylindrical","color":"Blanco-grisáceo with fibras","altura":"4-10 cm","diametro":"1-2 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Mealy","sabor":"Mealy"},"sporePrint_en":"Pink-salmon"}'::jsonb
WHERE id = 'esp-107';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Blanc a gris-crema","diametro":"5-15 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Blanc-crema concolor","altura":"3-8 cm","diametro":"1.5-3 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma i compacta","olor":"A farina","sabor":"Agradable"},"sporePrint_ca":"Rosa-salmó","cap_en":{"forma":"Convex","color":"White a gris-crema","diametro":"5-15 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"White-cream, concolorous","altura":"3-8 cm","diametro":"1.5-3 cm"},"flesh_en":{"color":"White","textura":"Firm and compact","olor":"Mealy","sabor":"Pleasant"},"sporePrint_en":"Pink-salmon"}'::jsonb
WHERE id = 'esp-108';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Rosa-salmó a albercoc","diametro":"3-9 cm","superficie":"Amb xarxa d''arrugues i plecs rosats"},"stem_ca":{"forma":"Cilíndric","color":"Rosa-ataronjat concolor","altura":"2-6 cm","diametro":"1-2 cm"},"flesh_ca":{"color":"Rosa pàl·lid","textura":"Ferma","olor":"Fúngic","sabor":"Amarg"},"sporePrint_ca":"Rosa-salmó","cap_en":{"forma":"Convex","color":"Salmon-pink to apricot","diametro":"3-9 cm","superficie":"With network of pink folds and wrinkles"},"stem_en":{"forma":"Cylindrical","color":"Orange-pink, concolorous","altura":"2-6 cm","diametro":"1-2 cm"},"flesh_en":{"color":"Pale pink","textura":"Firm","olor":"Fungal","sabor":"Bitter"},"sporePrint_en":"Pink-salmon"}'::jsonb
WHERE id = 'esp-109';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Blanc-grisenc a beix pàl·lid","diametro":"4-12 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Blanc amb fibras longitudinales","altura":"4-10 cm","diametro":"1-2 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"A farina","sabor":"A farina"},"sporePrint_ca":"Rosa-salmó","cap_en":{"forma":"Convex","color":"Greyish-white to pale beige","diametro":"4-12 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"White with fibras longitudinales","altura":"4-10 cm","diametro":"1-2 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Mealy","sabor":"Mealy"},"sporePrint_en":"Pink-salmon"}'::jsonb
WHERE id = 'esp-110';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Taronja-marró oxidat","diametro":"4-9 cm","superficie":"Seca"},"stem_ca":{"forma":"Cilíndric","color":"Groc taronja","altura":"4-8 cm","diametro":"1-2 cm"},"flesh_ca":{"color":"Groc-taronja","textura":"Ferma","olor":"Lleuger a rave","sabor":"Suau"},"sporePrint_ca":"Oxidada","cap_en":{"forma":"Convex","color":"Oxidised orange-brown","diametro":"4-9 cm","superficie":"Dry"},"stem_en":{"forma":"Cylindrical","color":"Orange-yellow","altura":"4-8 cm","diametro":"1-2 cm"},"flesh_en":{"color":"Yellow-orange","textura":"Firm","olor":"Faint radish-like","sabor":"Mild"},"sporePrint_en":"Oxidised"}'::jsonb
WHERE id = 'esp-111';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Marró-ataronjat a rovell-rogenc","diametro":"3-8 cm","superficie":"Seca"},"stem_ca":{"forma":"Cilíndric","color":"Marrón-anaranjado amb restos de cortina","altura":"5-10 cm","diametro":"1-2 cm"},"flesh_ca":{"color":"Marró","textura":"Ferma","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Marró rovell","cap_en":{"forma":"Convex","color":"Orange-brown to reddish-rust","diametro":"3-8 cm","superficie":"Dry"},"stem_en":{"forma":"Cylindrical","color":"Marrón-anaranjado with restos de cortina","altura":"5-10 cm","diametro":"1-2 cm"},"flesh_en":{"color":"Brown","textura":"Firm","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"Rusty-brown"}'::jsonb
WHERE id = 'esp-112';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Violeta fosc a porpra-blavós","diametro":"5-15 cm","superficie":"Seca"},"stem_ca":{"forma":"Cilíndric","color":"Violeta oscuro amb escamas","altura":"6-15 cm","diametro":"1.5-3 cm"},"flesh_ca":{"color":"Violeta","textura":"Ferma","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Marró rovell","cap_en":{"forma":"Convex","color":"Dark violet to bluish-purple","diametro":"5-15 cm","superficie":"Dry"},"stem_en":{"forma":"Cylindrical","color":"Violeta oscuro with escamas","altura":"6-15 cm","diametro":"1.5-3 cm"},"flesh_en":{"color":"Violet","textura":"Firm","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"Rusty-brown"}'::jsonb
WHERE id = 'esp-113';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Ocre-groguenc a marró-argila, pruïnós al centre","diametro":"5-12 cm","superficie":"Amb pruïna platejada al centre"},"stem_ca":{"forma":"Cilíndric","color":"Blanc-groguenc","altura":"6-12 cm","diametro":"1.5-3 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Marró rovell","cap_en":{"forma":"Convex","color":"Ochre-yellow to clay-brown, pruinose at centre","diametro":"5-12 cm","superficie":"With silver pruina at centre"},"stem_en":{"forma":"Cylindrical","color":"White-yellowish","altura":"6-12 cm","diametro":"1.5-3 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"Rusty-brown"}'::jsonb
WHERE id = 'esp-114';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Groc viu a daurat","diametro":"4-10 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Groc viu","altura":"5-10 cm","diametro":"1-2 cm"},"flesh_ca":{"color":"Groc pàl·lid","textura":"Ferma","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Marró rovell","cap_en":{"forma":"Convex","color":"Vivid yellow to golden","diametro":"4-10 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"Vivid yellow","altura":"5-10 cm","diametro":"1-2 cm"},"flesh_en":{"color":"Pale yellow","textura":"Firm","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"Rusty-brown"}'::jsonb
WHERE id = 'esp-115';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Marró-violaci a castany-rogenc","diametro":"8-20 cm","superficie":"Viscosa"},"stem_ca":{"forma":"Robust","color":"Blanco-violáceo amb restos de cortina","altura":"8-15 cm","diametro":"2-4 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma i compacta","olor":"Agradable","sabor":"Suau"},"sporePrint_ca":"Marró rovell","cap_en":{"forma":"Convex","color":"Violet-brown to reddish-chestnut","diametro":"8-20 cm","superficie":"Viscid/Slimy"},"stem_en":{"forma":"Stout","color":"Blanco-violáceo with restos de cortina","altura":"8-15 cm","diametro":"2-4 cm"},"flesh_en":{"color":"White","textura":"Firm and compact","olor":"Pleasant","sabor":"Mild"},"sporePrint_en":"Rusty-brown"}'::jsonb
WHERE id = 'esp-116';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Ocre-ataronjat a albercoc","diametro":"3-8 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Marró pàl·lid ataronjat","altura":"4-9 cm","diametro":"1-2 cm"},"flesh_ca":{"color":"Pàl·lida","textura":"Ferma","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Marró rovell","cap_en":{"forma":"Convex","color":"Ochre-orange to apricot","diametro":"3-8 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"Pale orange-brown","altura":"4-9 cm","diametro":"1-2 cm"},"flesh_en":{"color":"Pale","textura":"Firm","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"Rusty-brown"}'::jsonb
WHERE id = 'esp-117';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Campanulat","color":"Ocre-groguenc a pajós, fibrosaament esquerdat","diametro":"3-8 cm","superficie":"Fibrosa"},"stem_ca":{"forma":"Cilíndric","color":"Blanco-crema a pajizo amb pruina en el ápice","altura":"4-9 cm","diametro":"0.8-1.5 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"A terra","sabor":"Suau"},"sporePrint_ca":"Marró tabac","cap_en":{"forma":"Bell-shaped","color":"Ochre-yellow to straw, fibrosely cracked","diametro":"3-8 cm","superficie":"Fibrous"},"stem_en":{"forma":"Cylindrical","color":"Blanco-crema a pajizo with pruina en el ápice","altura":"4-9 cm","diametro":"0.8-1.5 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Earthy","sabor":"Mild"},"sporePrint_en":"Tobacco-brown"}'::jsonb
WHERE id = 'esp-118';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Campanulat","color":"Blanc-crema, es tenyeix de rosa-roig al tacte","diametro":"3-7 cm","superficie":"Fibrosa"},"stem_ca":{"forma":"Cilíndric","color":"Blanc, envermellint al tacte","altura":"4-8 cm","diametro":"0.8-1.5 cm"},"flesh_ca":{"color":"Envermelleix al tall","textura":"Ferma","olor":"Espermàtic","sabor":"Suau"},"sporePrint_ca":"Marró tabac","cap_en":{"forma":"Bell-shaped","color":"White-cream, staining pink-red when touched","diametro":"3-7 cm","superficie":"Fibrous"},"stem_en":{"forma":"Cylindrical","color":"White, reddening when touched","altura":"4-8 cm","diametro":"0.8-1.5 cm"},"flesh_en":{"color":"Reddening when cut","textura":"Firm","olor":"Spermatic","sabor":"Mild"},"sporePrint_en":"Tobacco-brown"}'::jsonb
WHERE id = 'esp-119';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Crema-ocre a marró-mel","diametro":"4-10 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Blanco-crema amb escamas granulares en el ápice","altura":"4-9 cm","diametro":"1-2 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"A rave","sabor":"Amarg"},"sporePrint_ca":"Marró tabac","cap_en":{"forma":"Convex","color":"Cream-ochre to honey-brown","diametro":"4-10 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"Blanco-crema with escamas granulares en el ápice","altura":"4-9 cm","diametro":"1-2 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Radish-like","sabor":"Bitter"},"sporePrint_en":"Tobacco-brown"}'::jsonb
WHERE id = 'esp-120';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Crema-ocre a marró-rosat, més fosc al centre","diametro":"5-12 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Blanc amb escamas granulares","altura":"5-12 cm","diametro":"1.5-3 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma i compacta","olor":"A rave fort","sabor":"Amarg"},"sporePrint_ca":"Marró tabac","cap_en":{"forma":"Convex","color":"Cream-ochre to pinkish-brown, darker at centre","diametro":"5-12 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"White with escamas granulares","altura":"5-12 cm","diametro":"1.5-3 cm"},"flesh_en":{"color":"White","textura":"Firm and compact","olor":"Strong radish-like","sabor":"Bitter"},"sporePrint_en":"Tobacco-brown"}'::jsonb
WHERE id = 'esp-121';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Marró-mel a ocre, higròfan","diametro":"2-5 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Marró amb anillo blanquecino","altura":"3-8 cm","diametro":"0.5-1 cm"},"flesh_ca":{"color":"Pàl·lida","textura":"Fràgil","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Marró rovell","cap_en":{"forma":"Convex","color":"Honey-brown to ochre, hygrophanous","diametro":"2-5 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"Brown with anillo blanquecino","altura":"3-8 cm","diametro":"0.5-1 cm"},"flesh_en":{"color":"Pale","textura":"Fragile","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"Rusty-brown"}'::jsonb
WHERE id = 'esp-122';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Taronja-daurat a groc-rovell","diametro":"6-20 cm","superficie":"Fibrosa"},"stem_ca":{"forma":"Cilíndric","color":"Marrón-anaranjado amb escamas","altura":"8-20 cm","diametro":"2-4 cm"},"flesh_ca":{"color":"Groga","textura":"Ferma","olor":"Fúngic","sabor":"Amarg"},"sporePrint_ca":"Marró rovell","cap_en":{"forma":"Convex","color":"Golden-orange to rust-yellow","diametro":"6-20 cm","superficie":"Fibrous"},"stem_en":{"forma":"Cylindrical","color":"Marrón-anaranjado with escamas","altura":"8-20 cm","diametro":"2-4 cm"},"flesh_en":{"color":"Yellow","textura":"Firm","olor":"Fungal","sabor":"Bitter"},"sporePrint_en":"Rusty-brown"}'::jsonb
WHERE id = 'esp-123';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Violaceu a lila pálido en el margen, marrón en el centro","diametro":"5-12 cm","superficie":"Viscosa"},"stem_ca":{"forma":"Cilíndric","color":"Lila-violaci","altura":"6-12 cm","diametro":"1.5-3 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Marró rovell","cap_en":{"forma":"Convex","color":"Violet-tinged a lila pálido en el margen, marrón en el centro","diametro":"5-12 cm","superficie":"Viscid/Slimy"},"stem_en":{"forma":"Cylindrical","color":"Lilac-violet","altura":"6-12 cm","diametro":"1.5-3 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"Rusty-brown"}'::jsonb
WHERE id = 'esp-124';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Vermell sang a vermell carmí","diametro":"2-6 cm","superficie":"Seca"},"stem_ca":{"forma":"Cilíndric","color":"Rojo concoloro amb restos de cortina rojiza","altura":"4-8 cm","diametro":"0.5-1 cm"},"flesh_ca":{"color":"Vermell-ataronjat","textura":"Ferma","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Marró rovell","cap_en":{"forma":"Convex","color":"Blood-red to carmine-red","diametro":"2-6 cm","superficie":"Dry"},"stem_en":{"forma":"Cylindrical","color":"Rojo concoloro with restos de cortina rojiza","altura":"4-8 cm","diametro":"0.5-1 cm"},"flesh_en":{"color":"Red-orange","textura":"Firm","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"Rusty-brown"}'::jsonb
WHERE id = 'esp-125';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"En repisa o ventall, excèntric","color":"Vermell-marró brillant lacat","diametro":"10-30 cm","superficie":"Brillant"},"stem_ca":{"forma":"Lateral","color":"Vermell-marró","altura":"5-20 cm","diametro":"1-3 cm"},"flesh_ca":{"color":"Marró","textura":"Dura, llenyosa","olor":"Suau","sabor":"Amarg"},"sporePrint_ca":"Bru","cap_en":{"forma":"Shelf- or fan-shaped, eccentric","color":"Shiny lacquered red-brown","diametro":"10-30 cm","superficie":"Shiny"},"stem_en":{"forma":"Lateral","color":"Red-brown","altura":"5-20 cm","diametro":"1-3 cm"},"flesh_en":{"color":"Brown","textura":"Hard, woody","olor":"Mild","sabor":"Bitter"},"sporePrint_en":"Tawny"}'::jsonb
WHERE id = 'esp-126';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Aplanat","color":"Marrón-grisáceo amb superficie café-rojiza, margen blanco","diametro":"10-60 cm","superficie":"Dura, llenyosa, concèntrica"},"stem_ca":{"forma":"Absent","color":"N/A","altura":"N/A","diametro":"N/A"},"flesh_ca":{"color":"Marró","textura":"Molt dura i surerosa","olor":"Fúngic","sabor":"Amarg"},"sporePrint_ca":"Marró-canyella fosc","cap_en":{"forma":"Flattened","color":"Marrón-grisáceo with superficie café-rojiza, margen blanco","diametro":"10-60 cm","superficie":"Hard, woody, concentrically zonate"},"stem_en":{"forma":"Absent","color":"N/A","altura":"N/A","diametro":"N/A"},"flesh_en":{"color":"Brown","textura":"Very hard and corky","olor":"Fungal","sabor":"Bitter"},"sporePrint_en":"Dark cinnamon-brown"}'::jsonb
WHERE id = 'esp-127';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Lobulat","color":"Taronja-groc viu a sofre","diametro":"10-50 cm","superficie":"Llisa"},"stem_ca":{"forma":"Absent","color":"Groc pàl·lid","altura":"N/A","diametro":"N/A"},"flesh_ca":{"color":"Blanca","textura":"Carnosa en fresc, surerosa en sec","olor":"Agradable","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Lobed","color":"Vivid orange-yellow to sulphur","diametro":"10-50 cm","superficie":"Smooth"},"stem_en":{"forma":"Absent","color":"Pale yellow","altura":"N/A","diametro":"N/A"},"flesh_en":{"color":"White","textura":"Fleshy when fresh, corky when dry","olor":"Pleasant","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-128';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"En forma de peülla o consola","color":"Gris a gris-marrón amb zonas concéntricas","diametro":"10-40 cm","superficie":"Dura, llenyosa, concèntrica"},"stem_ca":{"forma":"Absent","color":"N/A","altura":"N/A","diametro":"N/A"},"flesh_ca":{"color":"Marró","textura":"Molt dura i surerosa","olor":"Fúngic","sabor":"Amarg"},"sporePrint_ca":"Blanc-crema","cap_en":{"forma":"Hoof- or bracket-shaped","color":"Grey a gris-marrón with zonas concéntricas","diametro":"10-40 cm","superficie":"Hard, woody, concentrically zonate"},"stem_en":{"forma":"Absent","color":"N/A","altura":"N/A","diametro":"N/A"},"flesh_en":{"color":"Brown","textura":"Very hard and corky","olor":"Fungal","sabor":"Bitter"},"sporePrint_en":"White-cream"}'::jsonb
WHERE id = 'esp-129';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Semicircular a ventall, flexible","color":"Multicolor — zones concèntriques blanques, grises, blaves, marrons","diametro":"3-10 cm","superficie":"Brillant"},"stem_ca":{"forma":"Absent","color":"N/A","altura":"N/A","diametro":"N/A"},"flesh_ca":{"color":"Blanca","textura":"Flexible i surerosa","olor":"Suau","sabor":"Suau"},"sporePrint_ca":"Blanc-crema","cap_en":{"forma":"Semicircular to fan-shaped, flexible","color":"Multicoloured — concentric zones of white, grey, blue and brown","diametro":"3-10 cm","superficie":"Shiny"},"stem_en":{"forma":"Absent","color":"N/A","altura":"N/A","diametro":"N/A"},"flesh_en":{"color":"White","textura":"Flexible and corky","olor":"Mild","sabor":"Mild"},"sporePrint_en":"White-cream"}'::jsonb
WHERE id = 'esp-130';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Blanco-grisáceo a crema, a veces amb algas verdes","diametro":"5-20 cm","superficie":"Llisa"},"stem_ca":{"forma":"Absent","color":"N/A","altura":"N/A","diametro":"N/A"},"flesh_ca":{"color":"Blanca","textura":"Surerosa a llenyosa","olor":"Suau","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Convex","color":"Blanco-grisáceo a crema, a veces with algas verdes","diametro":"5-20 cm","superficie":"Smooth"},"stem_en":{"forma":"Absent","color":"N/A","altura":"N/A","diametro":"N/A"},"flesh_en":{"color":"White","textura":"Corky to woody","olor":"Mild","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-131';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Semicircular, múltiples lòbuls solapats","color":"Marró-groguenc, ennegreix al tacte","diametro":"fins a 100 cm total (conjunt)","superficie":"Llisa"},"stem_ca":{"forma":"Lateral","color":"Blanc-crema","altura":"3-8 cm","diametro":"3-8 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"Agradable","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Semicircular, multiple overlapping lobes","color":"Yellowish-brown, blackening when touched","diametro":"up to 100 cm total (combined)","superficie":"Smooth"},"stem_en":{"forma":"Lateral","color":"White-cream","altura":"3-8 cm","diametro":"3-8 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Pleasant","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-132';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Múltiples capells en roseta, espatulats","color":"Gris-bru a marró-grisenc","diametro":"2-7 cm cada uno","superficie":"Llisa"},"stem_ca":{"forma":"Ramificat des de base comuna, blanc","color":"Blanc-crema","altura":"5-15 cm","diametro":"1-3 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Multiple caps in rosette, spatulate","color":"Grey-brown to greyish-brown","diametro":"2-7 cm cada uno","superficie":"Smooth"},"stem_en":{"forma":"Branched from common base, white","color":"White-cream","altura":"5-15 cm","diametro":"1-3 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-133';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Massa ramificada, coliflor amb lòbuls ondulats","color":"Crema-blanquinós a groc pàl·lid","diametro":"20-50 cm en conjunto","superficie":"Lòbuls ondulats, crespos"},"stem_ca":{"forma":"Central","color":"Blanc a crema","altura":"5-15 cm","diametro":"5-15 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"Agradable","sabor":"Suau"},"sporePrint_ca":"Blanc-crema","cap_en":{"forma":"Branched mass, cauliflower-like with wavy lobes","color":"Cream-whitish to pale yellow","diametro":"20-50 cm en conjunto","superficie":"Wavy, crisped lobes"},"stem_en":{"forma":"Central","color":"White a crema","altura":"5-15 cm","diametro":"5-15 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Pleasant","sabor":"Mild"},"sporePrint_en":"White-cream"}'::jsonb
WHERE id = 'esp-134';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Semicircular a ventall","color":"Crema-amarillo amb escamas marrones concéntricas","diametro":"10-50 cm","superficie":"Amb grans escates marrons sobre fons pàl·lid"},"stem_ca":{"forma":"Robust","color":"Blanco-crema amb base negra","altura":"2-8 cm","diametro":"3-8 cm"},"flesh_ca":{"color":"Blanca","textura":"Carnosa en jove, surerosa en adult","olor":"A farina","sabor":"Suau"},"sporePrint_ca":"Blanc-crema","cap_en":{"forma":"Semicircular to fan-shaped","color":"Crema-amarillo with escamas marrones concéntricas","diametro":"10-50 cm","superficie":"With large brown scales on pale background"},"stem_en":{"forma":"Stout","color":"Blanco-crema with base negra","altura":"2-8 cm","diametro":"3-8 cm"},"flesh_en":{"color":"White","textura":"Fleshy when young, corky when mature","olor":"Mealy","sabor":"Mild"},"sporePrint_en":"White-cream"}'::jsonb
WHERE id = 'esp-135';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Semicircular, pla","color":"Vermell-taronja a bermellón, decolorado a rosado en adulto","diametro":"3-12 cm","superficie":"Llisa"},"stem_ca":{"forma":"Absent","color":"N/A","altura":"N/A","diametro":"N/A"},"flesh_ca":{"color":"Taronja a rogenca, surerosa","textura":"Surerosa a llenyosa","olor":"Suau","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Semicircular, flat","color":"Red-orange a bermellón, decolorado a rosado en adulto","diametro":"3-12 cm","superficie":"Smooth"},"stem_en":{"forma":"Absent","color":"N/A","altura":"N/A","diametro":"N/A"},"flesh_en":{"color":"Orange to reddish, corky","textura":"Corky to woody","olor":"Mild","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-136';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Semicircular a consola, llenyós","color":"Gris-crema a marró pàl·lid","diametro":"5-25 cm","superficie":"Llisa"},"stem_ca":{"forma":"Absent","color":"N/A","altura":"N/A","diametro":"N/A"},"flesh_ca":{"color":"Blanca","textura":"Molt dura i llenyosa","olor":"Suau","sabor":"Suau"},"sporePrint_ca":"Blanc-crema","cap_en":{"forma":"Semicircular to bracket-shaped, woody","color":"Grey-cream to pale brown","diametro":"5-25 cm","superficie":"Smooth"},"stem_en":{"forma":"Absent","color":"N/A","altura":"N/A","diametro":"N/A"},"flesh_en":{"color":"White","textura":"Very hard and woody","olor":"Mild","sabor":"Mild"},"sporePrint_en":"White-cream"}'::jsonb
WHERE id = 'esp-137';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"En repisa, llengua o fetge","color":"Vermell sang a granat","diametro":"15-40 cm","superficie":"Carnosa, humida"},"stem_ca":{"forma":"Absent","color":"Vermell més fosc","altura":"2-6 cm","diametro":"3-6 cm"},"flesh_ca":{"color":"Vermell veinat com a carn","textura":"Carnosa i sucosa","olor":"Afruitat, àcid","sabor":"Agradable"},"sporePrint_ca":"Rosada","cap_en":{"forma":"Shelf-, tongue- or liver-shaped","color":"Blood-red to garnet","diametro":"15-40 cm","superficie":"Fleshy, moist"},"stem_en":{"forma":"Absent","color":"Darker red","altura":"2-6 cm","diametro":"3-6 cm"},"flesh_en":{"color":"Red, flesh-like veined","textura":"Fleshy and juicy","olor":"Fruity, acidic","sabor":"Pleasant"},"sporePrint_en":"Pink"}'::jsonb
WHERE id = 'esp-138';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Resupinat a semi-pileat, estès","color":"Taronja-salmó a rosa-ataronjat","diametro":"5-20 cm (extensión)","superficie":"Radiada amb plecs"},"stem_ca":{"forma":"Absent","color":"N/A","altura":"N/A","diametro":"N/A"},"flesh_ca":{"color":"Rosada","textura":"Tova","olor":"Suau","sabor":"Suau"},"sporePrint_ca":"Blanc-crema","cap_en":{"forma":"Resupinate to semi-pileate, effused","color":"Salmon-orange to orange-pink","diametro":"5-20 cm (extensión)","superficie":"Radiate with folds"},"stem_en":{"forma":"Absent","color":"N/A","altura":"N/A","diametro":"N/A"},"flesh_en":{"color":"Pink","textura":"Soft","olor":"Mild","sabor":"Mild"},"sporePrint_en":"White-cream"}'::jsonb
WHERE id = 'esp-139';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Gris fosc a gris-negre","diametro":"5-12 cm","superficie":"Llisa"},"stem_ca":{"forma":"Robust","color":"Blanc-grisenc","altura":"3-8 cm","diametro":"2-4 cm"},"flesh_ca":{"color":"Blanca, immutable","textura":"Ferma i compacta","olor":"Agradable","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Convex","color":"Dark grey to grey-black","diametro":"5-12 cm","superficie":"Smooth"},"stem_en":{"forma":"Stout","color":"Greyish-white","altura":"3-8 cm","diametro":"2-4 cm"},"flesh_en":{"color":"White, unchanging","textura":"Firm and compact","olor":"Pleasant","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-140';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Oliva-marró a gris-verd","diametro":"3-8 cm","superficie":"Viscosa"},"stem_ca":{"forma":"Cilíndric","color":"Groc a la part superior, oliva avall","altura":"5-12 cm","diametro":"0.8-1.5 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Convex","color":"Olive-brown to grey-green","diametro":"3-8 cm","superficie":"Viscid/Slimy"},"stem_en":{"forma":"Cylindrical","color":"Yellow above, olive below","altura":"5-12 cm","diametro":"0.8-1.5 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-141';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Gris a gris-bru","diametro":"4-8 cm","superficie":"Viscosa"},"stem_ca":{"forma":"Cilíndric","color":"Blanco-grisáceo amb pruina en el ápice","altura":"5-12 cm","diametro":"1-2 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"A ametlles","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Convex","color":"Grey a gris-pardo","diametro":"4-8 cm","superficie":"Viscid/Slimy"},"stem_en":{"forma":"Cylindrical","color":"Blanco-grisáceo with pruina en el ápice","altura":"5-12 cm","diametro":"1-2 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Almond-like","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-142';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Gris oscuro a pardo-grisáceo, amb pequeñas pústulas","diametro":"3-7 cm","superficie":"Viscosa"},"stem_ca":{"forma":"Cilíndric","color":"Blanco-grisáceo amb puntuaciones negruzcas","altura":"4-9 cm","diametro":"1-1.5 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Convex","color":"Gris oscuro a pardo-grisáceo, with pequeñas pústulas","diametro":"3-7 cm","superficie":"Viscid/Slimy"},"stem_en":{"forma":"Cylindrical","color":"Blanco-grisáceo with puntuaciones negruzcas","altura":"4-9 cm","diametro":"1-1.5 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-143';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Campanulat","color":"Vermell escarlata a taronja-roig","diametro":"4-12 cm","superficie":"Viscosa"},"stem_ca":{"forma":"Cilíndric","color":"Vermell-ataronjat a groc a la base","altura":"6-12 cm","diametro":"1-2 cm"},"flesh_ca":{"color":"Groga","textura":"Fràgil","olor":"Suau","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Bell-shaped","color":"Scarlet-red to red-orange","diametro":"4-12 cm","superficie":"Viscid/Slimy"},"stem_en":{"forma":"Cylindrical","color":"Red-orange to yellow at base","altura":"6-12 cm","diametro":"1-2 cm"},"flesh_en":{"color":"Yellow","textura":"Fragile","olor":"Mild","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-144';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Taronja-salmó a albercoc","diametro":"3-8 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Taronja-salmó pàl·lid","altura":"4-8 cm","diametro":"1-2 cm"},"flesh_ca":{"color":"Crema","textura":"Ferma","olor":"Suau","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Convex","color":"Salmon-orange to apricot","diametro":"3-8 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"Pale salmon-orange","altura":"4-8 cm","diametro":"1-2 cm"},"flesh_en":{"color":"Cream","textura":"Firm","olor":"Mild","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-145';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Verd lloro brillant, després groc-taronja en madurar","diametro":"2-4 cm","superficie":"Viscosa"},"stem_ca":{"forma":"Cilíndric","color":"Verd-groguenc viscós","altura":"3-6 cm","diametro":"0.4-0.8 cm"},"flesh_ca":{"color":"Groga","textura":"Fràgil","olor":"Suau","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Convex","color":"Bright parrot-green, later orange-yellow when mature","diametro":"2-4 cm","superficie":"Viscid/Slimy"},"stem_en":{"forma":"Cylindrical","color":"Greenish-yellow, viscid","altura":"3-6 cm","diametro":"0.4-0.8 cm"},"flesh_en":{"color":"Yellowish","textura":"Fragile","olor":"Mild","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-146';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Blanc a crema","diametro":"2-6 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Blanc concolor","altura":"3-7 cm","diametro":"0.5-1.5 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"Agradable","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Convex","color":"White a crema","diametro":"2-6 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"White, concolorous","altura":"3-7 cm","diametro":"0.5-1.5 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Pleasant","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-147';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Groc-ocre amb escamas marrón-rojizas recurvadas","diametro":"4-12 cm","superficie":"Seca"},"stem_ca":{"forma":"Cilíndric","color":"Groc amb escamas marrones por debajo del anillo","altura":"5-12 cm","diametro":"1-2.5 cm"},"flesh_ca":{"color":"Groga","textura":"Ferma","olor":"A all, penetrant","sabor":"Amarg"},"sporePrint_ca":"Marró tabac","cap_en":{"forma":"Convex","color":"Yellow-ochre with escamas marrón-rojizas recurvadas","diametro":"4-12 cm","superficie":"Dry"},"stem_en":{"forma":"Cylindrical","color":"Yellow with escamas marrones por debajo del anillo","altura":"5-12 cm","diametro":"1-2.5 cm"},"flesh_en":{"color":"Yellow","textura":"Firm","olor":"Garlicky, pungent","sabor":"Bitter"},"sporePrint_en":"Tobacco-brown"}'::jsonb
WHERE id = 'esp-148';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Groc-verdós a sofre, més fosc al centre","diametro":"2-7 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Groc amb zona fibrilosa oscura","altura":"4-10 cm","diametro":"0.5-1.5 cm"},"flesh_ca":{"color":"Groga","textura":"Ferma","olor":"Desagradable","sabor":"Amarg"},"sporePrint_ca":"Violeta-marró","cap_en":{"forma":"Convex","color":"Yellowish-green to sulphur, darker at centre","diametro":"2-7 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"Yellow with zona fibrilosa oscura","altura":"4-10 cm","diametro":"0.5-1.5 cm"},"flesh_en":{"color":"Yellow","textura":"Firm","olor":"Unpleasant","sabor":"Bitter"},"sporePrint_en":"Purple-brown"}'::jsonb
WHERE id = 'esp-149';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Ocre-ataronjat a mel, més clar al marge","diametro":"2-6 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Groc a l''àpex, marró rovell avall","altura":"4-10 cm","diametro":"0.5-1.5 cm"},"flesh_ca":{"color":"Pàl·lida","textura":"Ferma","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Violeta-marró","cap_en":{"forma":"Convex","color":"Ochre-orange to honey, paler at margin","diametro":"2-6 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"Yellow at apex, rusty-brown below","altura":"4-10 cm","diametro":"0.5-1.5 cm"},"flesh_en":{"color":"Pale","textura":"Firm","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"Purple-brown"}'::jsonb
WHERE id = 'esp-150';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Verde azulado a verde-grisáceo, amb escamas blancas","diametro":"3-8 cm","superficie":"Viscosa"},"stem_ca":{"forma":"Cilíndric","color":"Blanc amb escamas blancas por debajo del anillo","altura":"4-10 cm","diametro":"0.8-1.5 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Violeta-marró","cap_en":{"forma":"Convex","color":"Verde azulado a verde-grisáceo, with escamas blancas","diametro":"3-8 cm","superficie":"Viscid/Slimy"},"stem_en":{"forma":"Cylindrical","color":"White with escamas blancas por debajo del anillo","altura":"4-10 cm","diametro":"0.8-1.5 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"Purple-brown"}'::jsonb
WHERE id = 'esp-151';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Ocre-groguenc a crema-beix","diametro":"3-8 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Blanco-crema amb fibras longitudinales","altura":"4-10 cm","diametro":"0.8-1.5 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"A farina","sabor":"A farina"},"sporePrint_ca":"Marró tabac","cap_en":{"forma":"Convex","color":"Ochre-yellow to cream-beige","diametro":"3-8 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"Blanco-crema with fibras longitudinales","altura":"4-10 cm","diametro":"0.8-1.5 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Mealy","sabor":"Mealy"},"sporePrint_en":"Tobacco-brown"}'::jsonb
WHERE id = 'esp-152';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Marró-crema a marró-castany, més pàl·lid al marge","diametro":"4-12 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Blanc-crema","altura":"5-12 cm","diametro":"1-2 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma i compacta","olor":"Agradable","sabor":"Suau"},"sporePrint_ca":"Marró tabac","cap_en":{"forma":"Convex","color":"Brown-cream to chestnut-brown, paler at margin","diametro":"4-12 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"White-cream","altura":"5-12 cm","diametro":"1-2 cm"},"flesh_en":{"color":"White","textura":"Firm and compact","olor":"Pleasant","sabor":"Mild"},"sporePrint_en":"Tobacco-brown"}'::jsonb
WHERE id = 'esp-153';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Marró-mel a canyella, higròfan","diametro":"3-8 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Amarillo-canela arriba, marrón-óxido amb escamas abajo","altura":"4-9 cm","diametro":"0.5-1.5 cm"},"flesh_ca":{"color":"Pàl·lida","textura":"Ferma","olor":"Agradable","sabor":"Suau"},"sporePrint_ca":"Marró canyella","cap_en":{"forma":"Convex","color":"Honey-brown to cinnamon, hygrophanous","diametro":"3-8 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"Amarillo-canela arriba, marrón-óxido with escamas abajo","altura":"4-9 cm","diametro":"0.5-1.5 cm"},"flesh_en":{"color":"Pale","textura":"Firm","olor":"Pleasant","sabor":"Mild"},"sporePrint_en":"Cinnamon-brown"}'::jsonb
WHERE id = 'esp-154';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Campanulat","color":"Marró-ocre a groc-oliva, higròfan","diametro":"0.5-2 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Crema-marró","altura":"4-10 cm","diametro":"0.2-0.4 cm"},"flesh_ca":{"color":"Crema","textura":"Fràgil","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Violeta-marró fosc","cap_en":{"forma":"Bell-shaped","color":"Ochre-brown to olive-yellow, hygrophanous","diametro":"0.5-2 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"Cream-brown","altura":"4-10 cm","diametro":"0.2-0.4 cm"},"flesh_en":{"color":"Cream","textura":"Fragile","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"Dark violet-brown"}'::jsonb
WHERE id = 'esp-155';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Marró-crema a ocre pàl·lid","diametro":"4-10 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Blanc-crema","altura":"5-15 cm","diametro":"1-2 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"Agradable","sabor":"Suau"},"sporePrint_ca":"Marró tabac","cap_en":{"forma":"Convex","color":"Brown-cream to pale ochre","diametro":"4-10 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"White-cream","altura":"5-15 cm","diametro":"1-2 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Pleasant","sabor":"Mild"},"sporePrint_en":"Tobacco-brown"}'::jsonb
WHERE id = 'esp-156';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Groc-pàl·lid a crema-ocre","diametro":"2-6 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Blanc-crema","altura":"2-6 cm","diametro":"0.5-1.5 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Violeta-marró","cap_en":{"forma":"Convex","color":"Pale yellow to cream-ochre","diametro":"2-6 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"White-cream","altura":"2-6 cm","diametro":"0.5-1.5 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"Purple-brown"}'::jsonb
WHERE id = 'esp-157';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Blanc a gris-blancuzco, a veces amb escamas marrones","diametro":"5-12 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Blanc","altura":"3-7 cm","diametro":"1.5-3 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"Agradable","sabor":"Suau"},"sporePrint_ca":"Marró xocolata","cap_en":{"forma":"Convex","color":"White a gris-blancuzco, a veces with escamas marrones","diametro":"5-12 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"White","altura":"3-7 cm","diametro":"1.5-3 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Pleasant","sabor":"Mild"},"sporePrint_en":"Chocolate-brown"}'::jsonb
WHERE id = 'esp-158';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Blanc, grogueja feblament al tacte","diametro":"5-12 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Blanc amb anillo doble estriado","altura":"6-12 cm","diametro":"1-2 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"A anís","sabor":"Suau"},"sporePrint_ca":"Marró xocolata","cap_en":{"forma":"Convex","color":"White, faintly yellowing when touched","diametro":"5-12 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"White with anillo doble estriado","altura":"6-12 cm","diametro":"1-2 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Anise-like","sabor":"Mild"},"sporePrint_en":"Chocolate-brown"}'::jsonb
WHERE id = 'esp-159';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Blanc a gris-blancuzco","diametro":"6-15 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Blanc, grogueja intensament a la base al tall","altura":"6-12 cm","diametro":"1.5-3 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"Agradable","sabor":"A fenol"},"sporePrint_ca":"Marró xocolata","cap_en":{"forma":"Convex","color":"White a gris-blancuzco","diametro":"6-15 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"White, intensely yellowing at base when cut","altura":"6-12 cm","diametro":"1.5-3 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Pleasant","sabor":"Phenolic"},"sporePrint_en":"Chocolate-brown"}'::jsonb
WHERE id = 'esp-160';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Marrón-dorado amb escamas fibrosas marrón-rojizas sobre fondo amarillo","diametro":"10-25 cm","superficie":"Escamosa"},"stem_ca":{"forma":"Cilíndric","color":"Blanc amb escamas en la parte inferior del anillo","altura":"8-18 cm","diametro":"2-4 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma i compacta","olor":"A ametlles","sabor":"Suau i agradable"},"sporePrint_ca":"Marró xocolata","cap_en":{"forma":"Convex","color":"Marrón-dorado with escamas fibrosas marrón-rojizas sobre fondo amarillo","diametro":"10-25 cm","superficie":"Scaly"},"stem_en":{"forma":"Cylindrical","color":"White with escamas en la parte inferior del anillo","altura":"8-18 cm","diametro":"2-4 cm"},"flesh_en":{"color":"White","textura":"Firm and compact","olor":"Almond-like","sabor":"Mild and pleasant"},"sporePrint_en":"Chocolate-brown"}'::jsonb
WHERE id = 'esp-161';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Blanc amb escamas marrón-rojizas concéntricas","diametro":"2-6 cm","superficie":"Amb escates concentrades al centre"},"stem_ca":{"forma":"Cilíndric","color":"Blanc-crema","altura":"3-7 cm","diametro":"0.4-1 cm"},"flesh_ca":{"color":"Blanca","textura":"Fràgil","olor":"Agradable","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Convex","color":"White with escamas marrón-rojizas concéntricas","diametro":"2-6 cm","superficie":"With scales concentrated at centre"},"stem_en":{"forma":"Cylindrical","color":"White-cream","altura":"3-7 cm","diametro":"0.4-1 cm"},"flesh_en":{"color":"White","textura":"Fragile","olor":"Pleasant","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-162';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Umbonado","color":"Marró amb escamas más oscuras","diametro":"15-40 cm","superficie":"Escamosa"},"stem_ca":{"forma":"Esvelt","color":"Marró jaspejat","altura":"15-30 cm","diametro":"1-2 cm"},"flesh_ca":{"color":"Blanca","textura":"Tova","olor":"Agradable","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Umbonate","color":"Brown with escamas más oscuras","diametro":"15-40 cm","superficie":"Scaly"},"stem_en":{"forma":"Slender","color":"Mottled brown","altura":"15-30 cm","diametro":"1-2 cm"},"flesh_en":{"color":"White","textura":"Soft","olor":"Pleasant","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-163';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Aplanat","color":"Gris-marró amb grandes escamas irregulares sobre fondo blanco","diametro":"8-20 cm","superficie":"Amb escates irregulars"},"stem_ca":{"forma":"Cilíndric","color":"Blanc amb moteado marrón","altura":"10-20 cm","diametro":"1.5-3 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"Agradable","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Flattened","color":"Grey-brown with grandes escamas irregulares sobre fondo blanco","diametro":"8-20 cm","superficie":"With irregular scales"},"stem_en":{"forma":"Cylindrical","color":"White with moteado marrón","altura":"10-20 cm","diametro":"1.5-3 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Pleasant","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-164';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Blanc a crema, liso","diametro":"5-12 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Blanc-crema","altura":"5-10 cm","diametro":"1-2 cm"},"flesh_ca":{"color":"Blanca, immutable","textura":"Ferma","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Convex","color":"White a crema, liso","diametro":"5-12 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"White-cream","altura":"5-10 cm","diametro":"1-2 cm"},"flesh_en":{"color":"White, unchanging","textura":"Firm","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-165';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Acampanat","color":"Blanc amb escamas pardas","diametro":"4-8 cm","superficie":"Fibrosa"},"stem_ca":{"forma":"Buit","color":"Blanc brillant","altura":"10-20 cm","diametro":"1-2 cm"},"flesh_ca":{"color":"Blanca","textura":"Fràgil","olor":"Agradable","sabor":"Suau"},"sporePrint_ca":"Negra","cap_en":{"forma":"Campanulate","color":"White with escamas pardas","diametro":"4-8 cm","superficie":"Fibrous"},"stem_en":{"forma":"Hollow","color":"Bright white","altura":"10-20 cm","diametro":"1-2 cm"},"flesh_en":{"color":"White","textura":"Fragile","olor":"Pleasant","sabor":"Mild"},"sporePrint_en":"Black"}'::jsonb
WHERE id = 'esp-166';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Campanulat","color":"Ocre-miel a amarillo-marrón, amb gránulos brillantes (mica)","diametro":"2-5 cm","superficie":"Brillant"},"stem_ca":{"forma":"Cilíndric","color":"Blanc-crema","altura":"4-9 cm","diametro":"0.4-0.8 cm"},"flesh_ca":{"color":"Crema","textura":"Fràgil","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Marró-negre","cap_en":{"forma":"Bell-shaped","color":"Ocre-miel a amarillo-marrón, with gránulos brillantes (mica)","diametro":"2-5 cm","superficie":"Shiny"},"stem_en":{"forma":"Cylindrical","color":"White-cream","altura":"4-9 cm","diametro":"0.4-0.8 cm"},"flesh_en":{"color":"Cream","textura":"Fragile","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"Dark brown-black"}'::jsonb
WHERE id = 'esp-167';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Campanulat","color":"Gris-plomizo a gris-marrón, amb grietas en adulto","diametro":"4-9 cm","superficie":"Grisenca, finament granulada"},"stem_ca":{"forma":"Cilíndric","color":"Blanc-grisenc","altura":"6-15 cm","diametro":"1-2 cm"},"flesh_ca":{"color":"Blanca","textura":"Fràgil","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Marró-negre","cap_en":{"forma":"Bell-shaped","color":"Gris-plomizo a gris-marrón, with grietas en adulto","diametro":"4-9 cm","superficie":"Greyish, finely granulate"},"stem_en":{"forma":"Cylindrical","color":"Greyish-white","altura":"6-15 cm","diametro":"1-2 cm"},"flesh_en":{"color":"White","textura":"Fragile","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"Dark brown-black"}'::jsonb
WHERE id = 'esp-168';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Blanc-crema a ocre pàl·lid, higròfan","diametro":"3-8 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Blanc","altura":"4-10 cm","diametro":"0.5-1 cm"},"flesh_ca":{"color":"Blanca","textura":"Fràgil","olor":"Suau","sabor":"Suau"},"sporePrint_ca":"Marró-violaci","cap_en":{"forma":"Convex","color":"White-cream to pale ochre, hygrophanous","diametro":"3-8 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"White","altura":"4-10 cm","diametro":"0.5-1 cm"},"flesh_en":{"color":"White","textura":"Fragile","olor":"Mild","sabor":"Mild"},"sporePrint_en":"Violet-brown"}'::jsonb
WHERE id = 'esp-169';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Gris a gris-bru","diametro":"2-5 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Gris a blanc-grisenc","altura":"5-12 cm","diametro":"0.3-0.8 cm"},"flesh_ca":{"color":"Gris","textura":"Fràgil","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Negra","cap_en":{"forma":"Convex","color":"Grey a gris-pardo","diametro":"2-5 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"Grey a blanco-grisáceo","altura":"5-12 cm","diametro":"0.3-0.8 cm"},"flesh_en":{"color":"Grey","textura":"Fragile","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"Black"}'::jsonb
WHERE id = 'esp-170';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Marró-canyella a ocre, fibrós-escamós","diametro":"4-10 cm","superficie":"Fibrosa"},"stem_ca":{"forma":"Cilíndric","color":"Marrón-pardo amb escamas oscuras","altura":"4-10 cm","diametro":"0.8-1.5 cm"},"flesh_ca":{"color":"Pàl·lida","textura":"Ferma","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Marró-negre","cap_en":{"forma":"Convex","color":"Cinnamon-brown to ochre, fibrous-scaly","diametro":"4-10 cm","superficie":"Fibrous"},"stem_en":{"forma":"Cylindrical","color":"Marrón-pardo with escamas oscuras","altura":"4-10 cm","diametro":"0.8-1.5 cm"},"flesh_en":{"color":"Pale","textura":"Firm","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"Dark brown-black"}'::jsonb
WHERE id = 'esp-171';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Massa globosa amb espines penjants, sense capell diferenciat","color":"Blanc a crema, pardea amb la edad","diametro":"10-40 cm","superficie":"Amb agullons blancs penjants de 1-5 cm"},"stem_ca":{"forma":"Absent","color":"Blanc","altura":"2-8 cm","diametro":"5-15 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"Agradable","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Globose mass with pendant spines, no differentiated cap","color":"White a crema, pardea with la edad","diametro":"10-40 cm","superficie":"With pendant white spines 1-5 cm long"},"stem_en":{"forma":"Absent","color":"White","altura":"2-8 cm","diametro":"5-15 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Pleasant","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-172';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Massa ramificada coralina amb agullons a les ramificacions","color":"Blanc a crema","diametro":"10-30 cm en conjunto","superficie":"Amb agullons blancs de 0,5-2 cm"},"stem_ca":{"forma":"Central","color":"Blanc","altura":"3-8 cm","diametro":"2-6 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Coral-like branched mass with spines on branches","color":"White a crema","diametro":"10-30 cm en conjunto","superficie":"With white spines 0.5-2 cm long"},"stem_en":{"forma":"Central","color":"White","altura":"3-8 cm","diametro":"2-6 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-173';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Marrón-grisáceo amb grandes escamas marrón oscuro recurvadas","diametro":"8-25 cm","superficie":"Amb grans escates imbricades"},"stem_ca":{"forma":"Cilíndric","color":"Marró-grisenc","altura":"3-8 cm","diametro":"2-5 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma i compacta","olor":"Fúngic","sabor":"Amarg"},"sporePrint_ca":"Marró","cap_en":{"forma":"Convex","color":"Marrón-grisáceo with grandes escamas marrón oscuro recurvadas","diametro":"8-25 cm","superficie":"With large imbricate scales"},"stem_en":{"forma":"Cylindrical","color":"Greyish-brown","altura":"3-8 cm","diametro":"2-5 cm"},"flesh_en":{"color":"White","textura":"Firm and compact","olor":"Fungal","sabor":"Bitter"},"sporePrint_en":"Brown"}'::jsonb
WHERE id = 'esp-174';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Marrón-grisáceo amb escamas oscuras","diametro":"5-15 cm","superficie":"Amb escates fosques imbricades"},"stem_ca":{"forma":"Cilíndric","color":"Marró amb base verde-azulada","altura":"3-8 cm","diametro":"2-4 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"Fúngic","sabor":"Amarg"},"sporePrint_ca":"Marró","cap_en":{"forma":"Convex","color":"Marrón-grisáceo with escamas oscuras","diametro":"5-15 cm","superficie":"With dark imbricate scales"},"stem_en":{"forma":"Cylindrical","color":"Brown with base verde-azulada","altura":"3-8 cm","diametro":"2-4 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Fungal","sabor":"Bitter"},"sporePrint_en":"Brown"}'::jsonb
WHERE id = 'esp-175';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Blanco en joven amb gotitas rojas, marrón-rojo en adulto","diametro":"5-15 cm","superficie":"Tomentosa"},"stem_ca":{"forma":"Cilíndric","color":"Marró-roig concolor","altura":"3-8 cm","diametro":"1-3 cm"},"flesh_ca":{"color":"Rosada","textura":"Surerosa a coriàcia","olor":"Fúngic","sabor":"Amarg"},"sporePrint_ca":"Marró","cap_en":{"forma":"Convex","color":"Blanco en joven with gotitas rojas, marrón-rojo en adulto","diametro":"5-15 cm","superficie":"Tomentose"},"stem_en":{"forma":"Cylindrical","color":"Red-brown, concolorous","altura":"3-8 cm","diametro":"1-3 cm"},"flesh_en":{"color":"Pink","textura":"Corky to coriaceous","olor":"Fungal","sabor":"Bitter"},"sporePrint_en":"Brown"}'::jsonb
WHERE id = 'esp-176';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Gris-blavós a negre-grisenc","diametro":"3-10 cm","superficie":"Tomentosa"},"stem_ca":{"forma":"Cilíndric","color":"Gris fosc a negre","altura":"2-6 cm","diametro":"1-2.5 cm"},"flesh_ca":{"color":"Gris","textura":"Surerosa","olor":"Fúngic","sabor":"Amarg"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Convex","color":"Bluish-grey to greyish-black","diametro":"3-10 cm","superficie":"Tomentose"},"stem_en":{"forma":"Cylindrical","color":"Dark grey to black","altura":"2-6 cm","diametro":"1-2.5 cm"},"flesh_en":{"color":"Grey","textura":"Corky","olor":"Fungal","sabor":"Bitter"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-177';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Crema-blancuzco, pardo en el centro amb la edad","diametro":"5-15 cm","superficie":"Tomentosa"},"stem_ca":{"forma":"Cilíndric","color":"Crema a pardo, amb base más oscura","altura":"3-8 cm","diametro":"1.5-3 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma i compacta","olor":"Fúngic","sabor":"Amarg"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Convex","color":"Crema-blancuzco, pardo en el centro with la edad","diametro":"5-15 cm","superficie":"Tomentose"},"stem_en":{"forma":"Cylindrical","color":"Cream a pardo, with base más oscura","altura":"3-8 cm","diametro":"1.5-3 cm"},"flesh_en":{"color":"White","textura":"Firm and compact","olor":"Fungal","sabor":"Bitter"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-178';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Semicircular a arrionyat, petit","color":"Marró a marrón-grisáceo","diametro":"0.5-2 cm","superficie":"Tomentosa"},"stem_ca":{"forma":"Lateral","color":"Marró fosc a negre","altura":"3-8 cm","diametro":"0.2-0.5 cm"},"flesh_ca":{"color":"Pàl·lida","textura":"Ferma","olor":"Suau","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Semicircular to kidney-shaped, small","color":"Brown a marrón-grisáceo","diametro":"0.5-2 cm","superficie":"Tomentose"},"stem_en":{"forma":"Lateral","color":"Dark brown to black","altura":"3-8 cm","diametro":"0.2-0.5 cm"},"flesh_en":{"color":"Pale","textura":"Firm","olor":"Mild","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-179';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Globós a obovoideu, gegant","color":"Blanc pur en jove, marró-ocre en adult","diametro":"20-80 cm","superficie":"Llisa"},"stem_ca":{"forma":"Reduït a cordó miceliar basal","color":"Blanc","altura":"N/A","diametro":"N/A"},"flesh_ca":{"color":"Blanca","textura":"Esponjosa","olor":"Agradable","sabor":"Suau"},"sporePrint_ca":"Verd-oliva a marró","cap_en":{"forma":"Globose to obovoid, giant","color":"Pure white when young, brown-ochre when mature","diametro":"20-80 cm","superficie":"Smooth"},"stem_en":{"forma":"Reduced to basal mycelial cord","color":"White","altura":"N/A","diametro":"N/A"},"flesh_en":{"color":"White","textura":"Spongy","olor":"Pleasant","sabor":"Mild"},"sporePrint_en":"Olive-green to brown"}'::jsonb
WHERE id = 'esp-180';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Piriforme-globós amb base estreta","color":"Blanc a crema amb espinas piramidales","diametro":"3-7 cm","superficie":"Coberta d''espines còniques que deixen marques en caure"},"stem_ca":{"forma":"Estèril inferior, cel·lulós","color":"Blanc-crema","altura":"3-8 cm","diametro":"2-4 cm"},"flesh_ca":{"color":"Blanca","textura":"Esponjosa","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Verd-oliva a marró","cap_en":{"forma":"Pyriform-globose with narrow base","color":"White a crema with espinas piramidales","diametro":"3-7 cm","superficie":"Covered with conical spines that leave marks when falling"},"stem_en":{"forma":"Sterile lower portion, cellular","color":"White-cream","altura":"3-8 cm","diametro":"2-4 cm"},"flesh_en":{"color":"White","textura":"Spongy","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"Olive-green to brown"}'::jsonb
WHERE id = 'esp-181';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Piriforme (en forma de pera)","color":"Blanco-crema a marrón-ocre amb pequeñas espinas","diametro":"2-5 cm","superficie":"Amb petites espines efímeres"},"stem_ca":{"forma":"Estèril inferior, cordons rizomòrfics a la base","color":"Blanc-crema","altura":"3-7 cm","diametro":"1.5-3 cm"},"flesh_ca":{"color":"Blanca","textura":"Esponjosa","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Verd-oliva","cap_en":{"forma":"Pyriform (pear-shaped)","color":"Blanco-crema a marrón-ocre with pequeñas espinas","diametro":"2-5 cm","superficie":"With small ephemeral spines"},"stem_en":{"forma":"Sterile lower portion, rhizomorphic cords at base","color":"White-cream","altura":"3-7 cm","diametro":"1.5-3 cm"},"flesh_en":{"color":"White","textura":"Spongy","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"Olive-green"}'::jsonb
WHERE id = 'esp-182';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Irregular","color":"Groc-ocre a marrón, amb escamas poligonales oscuras","diametro":"4-12 cm","superficie":"Escamosa"},"stem_ca":{"forma":"Reduït, sèssil amb cordons miceliars","color":"Ocre","altura":"N/A","diametro":"N/A"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"Fúngic","sabor":"Picant"},"sporePrint_ca":"Negra-marró","cap_en":{"forma":"Irregular","color":"Yellow-ochre a marrón, with escamas poligonales oscuras","diametro":"4-12 cm","superficie":"Scaly"},"stem_en":{"forma":"Reduced, sessile with mycelial cords","color":"Ochre","altura":"N/A","diametro":"N/A"},"flesh_en":{"color":"White","textura":"Firm","olor":"Fungal","sabor":"Pungent"},"sporePrint_en":"Black-brown"}'::jsonb
WHERE id = 'esp-183';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Globós","color":"Blanc en jove, gris plomís en adult","diametro":"2-5 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cordó miceliar basal, sèssil","color":"Gris plomís","altura":"N/A","diametro":"N/A"},"flesh_ca":{"color":"Blanca","textura":"Esponjosa","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Marró-oliva","cap_en":{"forma":"Globose","color":"White when young, lead-grey when mature","diametro":"2-5 cm","superficie":"Smooth"},"stem_en":{"forma":"Basal mycelial cord, sessile","color":"Lead-grey","altura":"N/A","diametro":"N/A"},"flesh_en":{"color":"White","textura":"Spongy","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"Olive-brown"}'::jsonb
WHERE id = 'esp-184';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Gleba sobre cap cònic perforat apicalment","color":"Verd-oliva a marró (gleba), blanc (receptacle)","diametro":"3-5 cm de cabeza","superficie":"Alveolada"},"stem_ca":{"forma":"Cilíndric","color":"Blanc-esponjós","altura":"10-20 cm","diametro":"2-4 cm"},"flesh_ca":{"color":"Blanca","textura":"Fràgil","olor":"Fètid, carronya (gleba madura)","sabor":"Suau"},"sporePrint_ca":"Olivàcia","cap_en":{"forma":"Gleba on apically perforated conical head","color":"Olive-green to brown (gleba), white (receptacle)","diametro":"3-5 cm de cabeza","superficie":"Alveolate/Pitted"},"stem_en":{"forma":"Cylindrical","color":"White, spongy","altura":"10-20 cm","diametro":"2-4 cm"},"flesh_en":{"color":"White","textura":"Fragile","olor":"Fetid, carrion-like (mature gleba)","sabor":"Mild"},"sporePrint_en":"Olivaceous"}'::jsonb
WHERE id = 'esp-185';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Similar a P. impudicus amb cap cònic","color":"Rosa-violaci (volva), blanc (receptacle), verd-oliva (gleba)","diametro":"2-4 cm de cabeza","superficie":"Alveolada"},"stem_ca":{"forma":"Cilíndric","color":"Blanc-rosat","altura":"8-15 cm","diametro":"2-4 cm"},"flesh_ca":{"color":"Blanca","textura":"Esponjosa","olor":"Fètid (gleba madura)","sabor":"Suau"},"sporePrint_ca":"Olivàcia","cap_en":{"forma":"Similar to P. impudicus with conical head","color":"Pink-violet (volva), white (receptacle), olive-green (gleba)","diametro":"2-4 cm de cabeza","superficie":"Alveolate/Pitted"},"stem_en":{"forma":"Cylindrical","color":"White-pink","altura":"8-15 cm","diametro":"2-4 cm"},"flesh_en":{"color":"White","textura":"Spongy","olor":"Fetid (mature gleba)","sabor":"Mild"},"sporePrint_en":"Olivaceous"}'::jsonb
WHERE id = 'esp-186';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Receptacle en forma de gàbia o xarxa tridimensional","color":"Vermell-taronja a rojo","diametro":"8-15 cm en conjunto","superficie":"Xarxa de braços anastomosats"},"stem_ca":{"forma":"Emergeix de volva blanca, sense peu diferenciat","color":"Vermell-taronja","altura":"N/A","diametro":"N/A"},"flesh_ca":{"color":"Vermella-ataronjada, esponjosa","textura":"Fràgil","olor":"Fètid, carronya","sabor":"Suau"},"sporePrint_ca":"Olivàcia","cap_en":{"forma":"Cage- or three-dimensional net-shaped receptacle","color":"Red-orange a rojo","diametro":"8-15 cm en conjunto","superficie":"Network of anastomosing arms"},"stem_en":{"forma":"Emerging from white volva, no differentiated stipe","color":"Red-orange","altura":"N/A","diametro":"N/A"},"flesh_en":{"color":"Red-orange, spongy","textura":"Fragile","olor":"Fetid, carrion-like","sabor":"Mild"},"sporePrint_en":"Olivaceous"}'::jsonb
WHERE id = 'esp-187';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Receptacle amb 4-8 braços estrellats des de la volva","color":"Vermell a rojo-púrpura","diametro":"8-15 cm abierto","superficie":"Braços carnosos amb gleba negra a la cara interna"},"stem_ca":{"forma":"Emergeix de volva blanca","color":"Vermell","altura":"N/A","diametro":"N/A"},"flesh_ca":{"color":"Vermella, esponjosa","textura":"Fràgil","olor":"Molt fètid, carronya","sabor":"Suau"},"sporePrint_ca":"Olivàcia","cap_en":{"forma":"Receptacle with 4-8 star-like arms from volva","color":"Red a rojo-púrpura","diametro":"8-15 cm abierto","superficie":"Fleshy arms with black gleba on inner face"},"stem_en":{"forma":"Emerging from white volva","color":"Red","altura":"N/A","diametro":"N/A"},"flesh_en":{"color":"Red, spongy","textura":"Fragile","olor":"Very fetid, carrion-like","sabor":"Mild"},"sporePrint_en":"Olivaceous"}'::jsonb
WHERE id = 'esp-188';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Cap cònic perforat sobre receptacle sense separació clara","color":"Vermell-ataronjat (cap), taronja-rosa (receptacle)","diametro":"1.5-3 cm de cabeza","superficie":"Cap amb gleba olivàcia"},"stem_ca":{"forma":"Cilíndric","color":"Taronja-rosa a rosat","altura":"6-12 cm","diametro":"1-2 cm"},"flesh_ca":{"color":"Blanca","textura":"Esponjosa","olor":"Fètid","sabor":"Suau"},"sporePrint_ca":"Olivàcia","cap_en":{"forma":"Conical perforated head on receptacle with no clear separation","color":"Red-orange (head), orange-pink (receptacle)","diametro":"1.5-3 cm de cabeza","superficie":"Head with olivaceous gleba"},"stem_en":{"forma":"Cylindrical","color":"Orange-pink to pinkish","altura":"6-12 cm","diametro":"1-2 cm"},"flesh_en":{"color":"White","textura":"Spongy","olor":"Fetid","sabor":"Mild"},"sporePrint_en":"Olivaceous"}'::jsonb
WHERE id = 'esp-189';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Acampanat","color":"Beige-ocre, más oscuro amb humedad","diametro":"2-5 cm","superficie":"Llisa"},"stem_ca":{"forma":"Fibrós","color":"Blanquinós a crema","altura":"4-8 cm","diametro":"0.2-0.4 cm"},"flesh_ca":{"color":"Blanquinosa","textura":"Elàstica","olor":"Intens, ametlles amargues","sabor":"Agradable"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Campanulate","color":"Beige-ocre, más oscuro with humedad","diametro":"2-5 cm","superficie":"Smooth"},"stem_en":{"forma":"Fibrous","color":"Whitish to cream","altura":"4-8 cm","diametro":"0.2-0.4 cm"},"flesh_en":{"color":"Whitish","textura":"Elastic","olor":"Intense, bitter almond","sabor":"Pleasant"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-190';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Blanc a crema amb surcos radiales","diametro":"0.5-2 cm","superficie":"Amb nervis radials com radis de roda"},"stem_ca":{"forma":"Filiforme, negre brillant","color":"Negre brillant","altura":"2-5 cm","diametro":"0.1-0.2 cm"},"flesh_ca":{"color":"Blanca","textura":"Elàstica","olor":"Suau","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Convex","color":"White a crema with surcos radiales","diametro":"0.5-2 cm","superficie":"With radial ribs like wheel spokes"},"stem_en":{"forma":"Filiform, glossy black","color":"Glossy black","altura":"2-5 cm","diametro":"0.1-0.2 cm"},"flesh_en":{"color":"White","textura":"Elastic","olor":"Mild","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-191';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Campanulat","color":"Gris-marró a gris-pardo, higrófano","diametro":"2-6 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Gris a gris-marró","altura":"4-10 cm","diametro":"0.3-0.8 cm"},"flesh_ca":{"color":"Gris","textura":"Fràgil","olor":"A farina","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Bell-shaped","color":"Grey-brown a gris-pardo, higrófano","diametro":"2-6 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"Grey a gris-marrón","altura":"4-10 cm","diametro":"0.3-0.8 cm"},"flesh_en":{"color":"Grey","textura":"Fragile","olor":"Mealy","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-192';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Campanulat","color":"Marró-rogenc a vi fosc, marge dentat","diametro":"1-3 cm","superficie":"Estriada"},"stem_ca":{"forma":"Cilíndric","color":"Marró rogenc","altura":"4-8 cm","diametro":"0.2-0.4 cm"},"flesh_ca":{"color":"Rogenca, làtex rogenc-vinaci","textura":"Fràgil","olor":"Suau","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Bell-shaped","color":"Reddish-brown to dark wine, dentate margin","diametro":"1-3 cm","superficie":"Striate"},"stem_en":{"forma":"Cylindrical","color":"Reddish-brown","altura":"4-8 cm","diametro":"0.2-0.4 cm"},"flesh_en":{"color":"Reddish, reddish-vinaceous latex","textura":"Fragile","olor":"Mild","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-193';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Blanc a gris muy pálido","diametro":"3-8 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Blanc amb anillo blanco estriado","altura":"4-10 cm","diametro":"0.5-1 cm"},"flesh_ca":{"color":"Blanca","textura":"Tova","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Convex","color":"White a gris muy pálido","diametro":"3-8 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"White with anillo blanco estriado","altura":"4-10 cm","diametro":"0.5-1 cm"},"flesh_en":{"color":"White","textura":"Soft","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-194';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Marró-grisenc a crema-beix, higròfan","diametro":"3-8 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Blanc a crema amb fibras longitudinales","altura":"6-20 cm","diametro":"0.5-1.5 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Convex","color":"Greyish-brown to cream-beige, hygrophanous","diametro":"3-8 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"White a crema with fibras longitudinales","altura":"6-20 cm","diametro":"0.5-1.5 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-195';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Marró-canyella a ocre, higròfan","diametro":"1-3 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Blanc-crema a dalt, marró fosc a la base","altura":"3-8 cm","diametro":"0.2-0.5 cm"},"flesh_ca":{"color":"Blanca","textura":"Ferma","olor":"Suau","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Convex","color":"Cinnamon-brown to ochre, hygrophanous","diametro":"1-3 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"White-cream above, dark brown at base","altura":"3-8 cm","diametro":"0.2-0.5 cm"},"flesh_en":{"color":"White","textura":"Firm","olor":"Mild","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-196';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Campanulat","color":"Gris-oliva, fosforescent a la foscor","diametro":"0.5-2 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Gris-translúcid, també fosforescent","altura":"2-6 cm","diametro":"0.1-0.3 cm"},"flesh_ca":{"color":"Blanca","textura":"Membranosa","olor":"Suau","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Bell-shaped","color":"Olive-grey, phosphorescent in the dark","diametro":"0.5-2 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"Translucent grey, also phosphorescent","altura":"2-6 cm","diametro":"0.1-0.3 cm"},"flesh_en":{"color":"White","textura":"Membranous","olor":"Mild","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-197';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Auriculat, en forma d''orella","color":"Marró-gelatinós a marró-violaci","diametro":"3-10 cm","superficie":"Gelatinosa, vellosa a l''exterior, ondulada"},"stem_ca":{"forma":"Absent","color":"Marró-grisenc","altura":"0-2 cm","diametro":"1-3 cm"},"flesh_ca":{"color":"Marró","textura":"Elàstica","olor":"Suau","sabor":"Suau"},"sporePrint_ca":"Blanca","cap_en":{"forma":"Auriculate, ear-shaped","color":"Gelatinous-brown to violet-brown","diametro":"3-10 cm","superficie":"Gelatinous, hairy on exterior, wavy"},"stem_en":{"forma":"Absent","color":"Greyish-brown","altura":"0-2 cm","diametro":"1-3 cm"},"flesh_en":{"color":"Brown","textura":"Elastic","olor":"Mild","sabor":"Mild"},"sporePrint_en":"White"}'::jsonb
WHERE id = 'esp-198';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Semicircular, ventall","color":"Gris-crema amb bandas concéntricas, densamente hirsuta","diametro":"4-12 cm","superficie":"Tomentosa"},"stem_ca":{"forma":"Absent","color":"N/A","altura":"N/A","diametro":"N/A"},"flesh_ca":{"color":"Blanca","textura":"Surerosa i flexible","olor":"Suau","sabor":"Suau"},"sporePrint_ca":"Blanc-crema","cap_en":{"forma":"Semicircular, fan-shaped","color":"Gris-crema with bandas concéntricas, densamente hirsuta","diametro":"4-12 cm","superficie":"Tomentose"},"stem_en":{"forma":"Absent","color":"N/A","altura":"N/A","diametro":"N/A"},"flesh_en":{"color":"White","textura":"Corky and flexible","olor":"Mild","sabor":"Mild"},"sporePrint_en":"White-cream"}'::jsonb
WHERE id = 'esp-199';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Cilíndric-claviforme, apical en forma de banya de cérvol ramificada","color":"Negre a la base, blanc-gris a l''àpex","diametro":"0.3-0.8 cm de diámetro","superficie":"Rugosa"},"stem_ca":{"forma":"Cilíndric","color":"Negre","altura":"3-8 cm","diametro":"0.3-0.8 cm"},"flesh_ca":{"color":"Blanca","textura":"Molt dura, carbonosa","olor":"Suau","sabor":"Suau"},"sporePrint_ca":"Negra","cap_en":{"forma":"Cylindrical-clavate, apical portion branched like deer antlers","color":"Black at base, white-grey at apex","diametro":"0.3-0.8 cm de diámetro","superficie":"Wrinkled"},"stem_en":{"forma":"Cylindrical","color":"Black","altura":"3-8 cm","diametro":"0.3-0.8 cm"},"flesh_en":{"color":"White","textura":"Very hard, carbonaceous","olor":"Mild","sabor":"Mild"},"sporePrint_en":"Black"}'::jsonb
WHERE id = 'esp-200';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Rosa-lilaci a vermell gerd","diametro":"8-20 cm","superficie":"Seca"},"stem_ca":{"forma":"Robust","color":"Groc amb red roja","altura":"6-15 cm","diametro":"3-5 cm"},"flesh_ca":{"color":"Groc pàl·lid, immutable","textura":"Ferma i compacta","olor":"Agradable, fúngic","sabor":"Suau"},"sporePrint_ca":"Olivàcia","cap_en":{"forma":"Convex","color":"Pink-lilac to raspberry-red","diametro":"8-20 cm","superficie":"Dry"},"stem_en":{"forma":"Stout","color":"Yellow with red roja","altura":"6-15 cm","diametro":"3-5 cm"},"flesh_en":{"color":"Pale yellow, unchanging","textura":"Firm and compact","olor":"Pleasant, fungal","sabor":"Mild"},"sporePrint_en":"Olivaceous"}'::jsonb
WHERE id = 'esp-201';

UPDATE species
SET extra_data = extra_data || '{"cap_ca":{"forma":"Convex","color":"Ocre-ataronjat a marró vinós, viscós en humit","diametro":"4-10 cm","superficie":"Llisa"},"stem_ca":{"forma":"Cilíndric","color":"Amarillo-anaranjado amb tonos violáceos hacia la base","altura":"4-9 cm","diametro":"1-2 cm"},"flesh_ca":{"color":"Groc-ataronjat, violaci a la base del peu","textura":"Ferma","olor":"Fúngic","sabor":"Suau"},"sporePrint_ca":"Gris-negrosa","cap_en":{"forma":"Convex","color":"Ochre-orange to vinous-brown, viscid when wet","diametro":"4-10 cm","superficie":"Smooth"},"stem_en":{"forma":"Cylindrical","color":"Amarillo-anaranjado with tonos violáceos hacia la base","altura":"4-9 cm","diametro":"1-2 cm"},"flesh_en":{"color":"Orange-yellow, violet at stipe base","textura":"Firm","olor":"Fungal","sabor":"Mild"},"sporePrint_en":"Greyish-black"}'::jsonb
WHERE id = 'esp-202';

COMMIT;
