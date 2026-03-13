-- =============================================================================
-- 013_common_names_i18n.sql — Common names in Catalan (CA) and English (EN)
-- =============================================================================
-- Adds commonNames_ca and commonNames_en to extra_data for all 202 species.
-- The backend _extra_list helper picks the right key based on the ?lang= param,
-- falling back to the canonical Spanish commonNames if a translation is absent.
-- =============================================================================

-- ── Boletaceae ────────────────────────────────────────────────────────────────

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Cep', 'Bolet de pinyans', 'Sureny'],
                        'commonNames_en', ARRAY['Porcini', 'Penny bun', 'Cep', 'King bolete'])
WHERE scientific_name = 'Boletus edulis';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Cep negre', 'Boletus negre de roure'],
                        'commonNames_en', ARRAY['Dark cep', 'Bronze bolete', 'Black porcini'])
WHERE scientific_name = 'Boletus aereus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Cep de pi', 'Cep roig'],
                        'commonNames_en', ARRAY['Pine bolete', 'Pine cep'])
WHERE scientific_name = 'Boletus pinophilus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Cep d''estiu'],
                        'commonNames_en', ARRAY['Summer cep', 'Summer porcini'])
WHERE scientific_name = 'Boletus reticulatus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Cep bru'],
                        'commonNames_en', ARRAY['Bay bolete'])
WHERE scientific_name = 'Imleria badia';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Llenega del bedoll', 'Llenega negra del bedoll'],
                        'commonNames_en', ARRAY['Brown birch bolete', 'Birch bolete'])
WHERE scientific_name = 'Leccinum scabrum';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Llenega taronja'],
                        'commonNames_en', ARRAY['Orange birch bolete', 'Red-capped scaber stalk'])
WHERE scientific_name = 'Leccinum versipelle';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Greix de pi', 'Greix de pi groguenc'],
                        'commonNames_en', ARRAY['Slippery jack', 'Brown slippery jack'])
WHERE scientific_name = 'Suillus luteus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Greix de pi granulat'],
                        'commonNames_en', ARRAY['Granulated bolete', 'Dotted-stalk suillus'])
WHERE scientific_name = 'Suillus granulatus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Greix de Bellini', 'Pebràs'],
                        'commonNames_en', ARRAY['Bellini''s bolete'])
WHERE scientific_name = 'Suillus bellini';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Cep atifellat'],
                        'commonNames_en', ARRAY['Suede bolete', 'Yellow-cracked bolete'])
WHERE scientific_name = 'Xerocomus subtomentosus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Cep de peu bonic'],
                        'commonNames_en', ARRAY['Bitter beech bolete', 'Scarletleg bolete'])
WHERE scientific_name = 'Caloboletus calopus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Cep turbi'],
                        'commonNames_en', ARRAY['Lurid bolete'])
WHERE scientific_name = 'Suillellus luridus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Cep de peu vermell'],
                        'commonNames_en', ARRAY['Scarletina bolete', 'Dotted-stem bolete'])
WHERE scientific_name = 'Neoboletus erythropus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Cep de Satanàs', 'Boletus de Satanàs'],
                        'commonNames_en', ARRAY['Satan''s bolete', 'Satan''s mushroom'])
WHERE scientific_name = 'Rubroboletus satanas';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Giropor blau'],
                        'commonNames_en', ARRAY['Bluing bolete', 'Cornflower bolete'])
WHERE scientific_name = 'Gyroporus cyanescens';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Giropor castany'],
                        'commonNames_en', ARRAY['Chestnut bolete'])
WHERE scientific_name = 'Gyroporus castaneus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Cep pebrer'],
                        'commonNames_en', ARRAY['Peppery bolete'])
WHERE scientific_name = 'Chalciporus piperatus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Cep escarlata'],
                        'commonNames_en', ARRAY['Scarletina bolete'])
WHERE scientific_name = 'Neoboletus luridiformis';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Paxil enrotllat'],
                        'commonNames_en', ARRAY['Brown roll-rim', 'Poison pax'])
WHERE scientific_name = 'Paxillus involutus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Cep gentil'],
                        'commonNames_en', ARRAY['Gilded bolete'])
WHERE scientific_name = 'Aureoboletus gentilis';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Tapinela aterciopellada'],
                        'commonNames_en', ARRAY['Velvet roll-rim'])
WHERE scientific_name = 'Tapinella atrotomentosa';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Cep reial'],
                        'commonNames_en', ARRAY['Royal bolete', 'King bolete'])
WHERE scientific_name = 'Butyriboletus regius';

-- ── Russulaceae ───────────────────────────────────────────────────────────────

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Verderol', 'Rússola verda'],
                        'commonNames_en', ARRAY['Greencracked brittlegill'])
WHERE scientific_name = 'Russula virescens';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Paloma', 'Carbonera'],
                        'commonNames_en', ARRAY['Charcoal burner', 'Variable brittlegill'])
WHERE scientific_name = 'Russula cyanoxantha';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Rossinyol blanc'],
                        'commonNames_en', ARRAY['Milk-white brittlegill'])
WHERE scientific_name = 'Russula delica';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Rússola emètica'],
                        'commonNames_en', ARRAY['The sickener', 'Emetic brittlegill'])
WHERE scientific_name = 'Russula emetica';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Rússola daurada'],
                        'commonNames_en', ARRAY['Gilded brittlegill'])
WHERE scientific_name = 'Russula aurea';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Rússola blavosa'],
                        'commonNames_en', ARRAY['Powdery brittlegill'])
WHERE scientific_name = 'Russula parazurea';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Rússola olivàcia'],
                        'commonNames_en', ARRAY['Olive brittlegill'])
WHERE scientific_name = 'Russula olivacea';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Rússola comestible'],
                        'commonNames_en', ARRAY['Bare-toothed brittlegill'])
WHERE scientific_name = 'Russula vesca';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Rússola pudent'],
                        'commonNames_en', ARRAY['Stinking brittlegill', 'Foetid brittlegill'])
WHERE scientific_name = 'Russula foetens';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Rússola ennegrida'],
                        'commonNames_en', ARRAY['Blackening brittlegill'])
WHERE scientific_name = 'Russula nigricans';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Rússola de cranc'],
                        'commonNames_en', ARRAY['Crab brittlegill', 'Shrimp mushroom'])
WHERE scientific_name = 'Russula xerampelina';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Rússola de mostela'],
                        'commonNames_en', ARRAY['Weasel brittlegill'])
WHERE scientific_name = 'Russula mustelina';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Rússola de llorer'],
                        'commonNames_en', ARRAY['Almond brittlegill'])
WHERE scientific_name = 'Russula laurocerasi';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Rússola roja falsa'],
                        'commonNames_en', ARRAY['False brittlegill'])
WHERE scientific_name = 'Russula pseudointegra';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Rovelló', 'Pinetell', 'Esclata-sang'],
                        'commonNames_en', ARRAY['Saffron milk cap', 'Red pine mushroom'])
WHERE scientific_name = 'Lactarius deliciosus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Rovelló de sang'],
                        'commonNames_en', ARRAY['Bloody milk cap', 'Blood-red milk cap'])
WHERE scientific_name = 'Lactarius sanguifluus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Fals rovelló'],
                        'commonNames_en', ARRAY['False saffron milk cap'])
WHERE scientific_name = 'Lactarius deterrimus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Múrgula de llet'],
                        'commonNames_en', ARRAY['Peppery milk cap'])
WHERE scientific_name = 'Lactifluus piperatus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Lactari llanós'],
                        'commonNames_en', ARRAY['Woolly milk cap', 'Bearded milk cap'])
WHERE scientific_name = 'Lactarius torminosus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Lactari índigo'],
                        'commonNames_en', ARRAY['Indigo milk cap'])
WHERE scientific_name = 'Lactarius indigo';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Lactari daurat'],
                        'commonNames_en', ARRAY['Weeping milk cap', 'Fishy milk cap'])
WHERE scientific_name = 'Lactarius volemus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Lactari blanc'],
                        'commonNames_en', ARRAY['Fleecy milk cap'])
WHERE scientific_name = 'Lactifluus vellereus';

-- ── Cantharellaceae ───────────────────────────────────────────────────────────

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Rossinyol', 'Camagroc'],
                        'commonNames_en', ARRAY['Chanterelle', 'Golden chanterelle', 'Girolle'])
WHERE scientific_name = 'Cantharellus cibarius';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Rossinyol pàl·lid'],
                        'commonNames_en', ARRAY['Pale chanterelle'])
WHERE scientific_name = 'Cantharellus pallens';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Rossinyol daurat'],
                        'commonNames_en', ARRAY['Golden chanterelle', 'Aurora chanterelle'])
WHERE scientific_name = 'Cantharellus aurora';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Trompeta de la mort', 'Corn d''abundància'],
                        'commonNames_en', ARRAY['Horn of plenty', 'Black chanterelle', 'Trumpet of death'])
WHERE scientific_name = 'Craterellus cornucopioides';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Cantarel·la groga', 'Camagroc', 'Surreny groc'],
                        'commonNames_en', ARRAY['Yellowfoot', 'Golden chanterelle', 'Yellow trumpet'])
WHERE scientific_name = 'Craterellus lutescens';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Cantarel·la d''hivern'],
                        'commonNames_en', ARRAY['Yellowfoot', 'Winter mushroom', 'Funnel chanterelle'])
WHERE scientific_name = 'Craterellus tubaeformis';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Llengua de vaca', 'Peu de rata'],
                        'commonNames_en', ARRAY['Hedgehog mushroom', 'Sweet tooth'])
WHERE scientific_name = 'Hydnum repandum';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Llengua de vaca rojenca'],
                        'commonNames_en', ARRAY['Rufous hedgehog', 'Ruddying hedgehog'])
WHERE scientific_name = 'Hydnum rufescens';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Gomfo amorat'],
                        'commonNames_en', ARRAY['Pig''s ear', 'Pig''s ear gomphus'])
WHERE scientific_name = 'Gomphus clavatus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Cantarel·la ondulada'],
                        'commonNames_en', ARRAY['Wavy chanterelle'])
WHERE scientific_name = 'Pseudocraterellus undulatus';

-- ── Amanitaceae ───────────────────────────────────────────────────────────────

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Ou de reig', 'Reig'],
                        'commonNames_en', ARRAY['Caesar''s mushroom'])
WHERE scientific_name = 'Amanita caesarea';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Matamosques', 'Reig bord'],
                        'commonNames_en', ARRAY['Fly agaric', 'Fly amanita'])
WHERE scientific_name = 'Amanita muscaria';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Farinera verda', 'Cicuta verda'],
                        'commonNames_en', ARRAY['Death cap'])
WHERE scientific_name = 'Amanita phalloides';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Farinera blanca de primavera'],
                        'commonNames_en', ARRAY['Fool''s mushroom', 'Spring destroying angel'])
WHERE scientific_name = 'Amanita verna';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Farinera blanca destructora'],
                        'commonNames_en', ARRAY['Destroying angel', 'European destroying angel'])
WHERE scientific_name = 'Amanita virosa';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Pantere', 'Falsa oronja'],
                        'commonNames_en', ARRAY['Panther cap', 'False blusher'])
WHERE scientific_name = 'Amanita pantherina';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Amanita rojenta', 'Amanita que envermelleix'],
                        'commonNames_en', ARRAY['The blusher'])
WHERE scientific_name = 'Amanita rubescens';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Farinera blanca gegant'],
                        'commonNames_en', ARRAY['Bearded amanita', 'White Caesar'])
WHERE scientific_name = 'Amanita ovoidea';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Amanita grisa'],
                        'commonNames_en', ARRAY['European false death cap', 'Grey-spotted amanita'])
WHERE scientific_name = 'Amanita spissa';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Amanita ataronjada'],
                        'commonNames_en', ARRAY['Tawny grisette', 'Saffron ringless amanita'])
WHERE scientific_name = 'Amanita crocea';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Amanita llimona'],
                        'commonNames_en', ARRAY['False death cap', 'Citron amanita'])
WHERE scientific_name = 'Amanita citrina';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Amanita de gemmes'],
                        'commonNames_en', ARRAY['Gemmed amanita', 'Jonquil amanita'])
WHERE scientific_name = 'Amanita gemmata';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Amanita de pinya'],
                        'commonNames_en', ARRAY['Warted amanita', 'Shaggy amanita'])
WHERE scientific_name = 'Amanita strobiliformis';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Amanita d''Elies'],
                        'commonNames_en', ARRAY['Elias''s amanita'])
WHERE scientific_name = 'Amanita eliae';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Amanita excel·la'],
                        'commonNames_en', ARRAY['False panther', 'Grey spotted amanita'])
WHERE scientific_name = 'Amanita excelsa';

-- ── Pleurotaceae ──────────────────────────────────────────────────────────────

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Gírgola', 'Orellana'],
                        'commonNames_en', ARRAY['Oyster mushroom', 'Pearl oyster mushroom'])
WHERE scientific_name = 'Pleurotus ostreatus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Gírgola de card'],
                        'commonNames_en', ARRAY['King oyster mushroom', 'Eryngi', 'Royal trumpet mushroom'])
WHERE scientific_name = 'Pleurotus eryngii';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Gírgola de cornucòpia'],
                        'commonNames_en', ARRAY['Branching oyster', 'Horn of plenty oyster'])
WHERE scientific_name = 'Pleurotus cornucopiae';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Gírgola de pulmó'],
                        'commonNames_en', ARRAY['Indian oyster', 'Phoenix mushroom'])
WHERE scientific_name = 'Pleurotus pulmonarius';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Seta de l''olivera'],
                        'commonNames_en', ARRAY['Jack-o''-lantern mushroom', 'Olive tree mushroom'])
WHERE scientific_name = 'Omphalotus olearius';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Shiitake'],
                        'commonNames_en', ARRAY['Shiitake', 'Black forest mushroom'])
WHERE scientific_name = 'Lentinula edodes';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Hohenbuehèlia'],
                        'commonNames_en', ARRAY['Hohenbuehelia'])
WHERE scientific_name = 'Hohenbuehelia petaloides';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Ostra violàcia'],
                        'commonNames_en', ARRAY['Violet oysterling'])
WHERE scientific_name = 'Panus conchatus';

-- ── Morchellaceae ─────────────────────────────────────────────────────────────

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Múrgola', 'Cagarria'],
                        'commonNames_en', ARRAY['Common morel', 'Yellow morel', 'True morel'])
WHERE scientific_name = 'Morchella esculenta';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Múrgola negra'],
                        'commonNames_en', ARRAY['Black morel', 'Tall morel'])
WHERE scientific_name = 'Morchella elata';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Múrgola cònica'],
                        'commonNames_en', ARRAY['Conic morel'])
WHERE scientific_name = 'Morchella conica';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Múrgola de jardí'],
                        'commonNames_en', ARRAY['Landscaping morel', 'Importune morel'])
WHERE scientific_name = 'Morchella importuna';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Mitra falsa', 'Fals múrgol'],
                        'commonNames_en', ARRAY['False morel', 'Brain mushroom', 'Turban fungus'])
WHERE scientific_name = 'Gyromitra esculenta';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Hèlvel·la lacunosa'],
                        'commonNames_en', ARRAY['Lacunose helvella', 'Black helvella'])
WHERE scientific_name = 'Helvella lacunosa';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Hèlvel·la arrissada'],
                        'commonNames_en', ARRAY['White saddle', 'Common helvella'])
WHERE scientific_name = 'Helvella crispa';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Hèlvel·la acetàbul'],
                        'commonNames_en', ARRAY['Brown cup helvella'])
WHERE scientific_name = 'Helvella acetabulum';

-- ── Tuberaceae ────────────────────────────────────────────────────────────────

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Tòfona negra'],
                        'commonNames_en', ARRAY['Périgord black truffle', 'Black truffle', 'French black truffle'])
WHERE scientific_name = 'Tuber melanosporum';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Tòfona d''estiu'],
                        'commonNames_en', ARRAY['Summer truffle', 'Burgundy truffle'])
WHERE scientific_name = 'Tuber aestivum';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Tòfona blanca'],
                        'commonNames_en', ARRAY['Bianchetto truffle', 'Whitish truffle'])
WHERE scientific_name = 'Tuber borchii';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Peziza vesiculosa'],
                        'commonNames_en', ARRAY['Blistered cup', 'Bladder cup'])
WHERE scientific_name = 'Peziza vesiculosa';

-- ── Tricholomataceae / related ────────────────────────────────────────────────

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Fredolic groc', 'Rovellonera'],
                        'commonNames_en', ARRAY['Yellow knight', 'Man on horseback', 'Canary knight'])
WHERE scientific_name = 'Tricholoma equestre';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Fredolic de pi'],
                        'commonNames_en', ARRAY['Dirty tricholoma', 'Streaky agaric'])
WHERE scientific_name = 'Tricholoma portentosum';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Fredolic gris', 'Ratolí'],
                        'commonNames_en', ARRAY['Grey knight', 'Earth tricholoma'])
WHERE scientific_name = 'Tricholoma terreum';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Fredolic sofrat'],
                        'commonNames_en', ARRAY['Sulphur knight'])
WHERE scientific_name = 'Tricholoma sulphureum';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Fredolic sabonós'],
                        'commonNames_en', ARRAY['Soap tricholoma', 'Soapy knight'])
WHERE scientific_name = 'Tricholoma saponaceum';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Moixernó', 'Sant Jordi'],
                        'commonNames_en', ARRAY['St. George''s mushroom'])
WHERE scientific_name = 'Calocybe gambosa';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Seta de feix'],
                        'commonNames_en', ARRAY['Fried chicken mushroom', 'Clustered domecap'])
WHERE scientific_name = 'Lyophyllum decastes';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Embudada gegant'],
                        'commonNames_en', ARRAY['Trooping funnel', 'Giant funnel'])
WHERE scientific_name = 'Clitocybe geotropa';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Blanquívola', 'Cama de llop'],
                        'commonNames_en', ARRAY['Clouded funnel', 'Clouded agaric'])
WHERE scientific_name = 'Clitocybe nebularis';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Clitocibe anisada'],
                        'commonNames_en', ARRAY['Aniseed funnel', 'Blue-green funnel'])
WHERE scientific_name = 'Clitocybe odora';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Clitocibe blanquinosa'],
                        'commonNames_en', ARRAY['Ivory funnel', 'Sweating mushroom'])
WHERE scientific_name = 'Clitocybe dealbata';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Peu blau', 'Pimpinela morada'],
                        'commonNames_en', ARRAY['Wood blewit', 'Blue leg mushroom'])
WHERE scientific_name = 'Lepista nuda';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Lepista de peu violat'],
                        'commonNames_en', ARRAY['Field blewit', 'Blue foot mushroom'])
WHERE scientific_name = 'Lepista personata';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Enoki', 'Flamulina'],
                        'commonNames_en', ARRAY['Velvet shank', 'Enoki', 'Winter mushroom'])
WHERE scientific_name = 'Flammulina velutipes';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Armil·lari', 'Seta de roure'],
                        'commonNames_en', ARRAY['Honey fungus', 'Honey mushroom'])
WHERE scientific_name = 'Armillaria mellea';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Entoloma ondulat'],
                        'commonNames_en', ARRAY['Livid pinkgill', 'Livid entoloma'])
WHERE scientific_name = 'Entoloma sinuatum';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Entoloma de camps'],
                        'commonNames_en', ARRAY['Wood pinkgill'])
WHERE scientific_name = 'Entoloma rhodopolium';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Entoloma escudat'],
                        'commonNames_en', ARRAY['Shield pinkgill'])
WHERE scientific_name = 'Entoloma clypeatum';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Seta de les praderies'],
                        'commonNames_en', ARRAY['Sweetbread mushroom', 'The mealy plum'])
WHERE scientific_name = 'Clitopilus prunulus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Rodot palmejat'],
                        'commonNames_en', ARRAY['Wrinkled peach mushroom'])
WHERE scientific_name = 'Rhodotus palmatus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Entoloma livid'],
                        'commonNames_en', ARRAY['Livid-white pinkgill'])
WHERE scientific_name = 'Entoloma lividoalbum';

-- ── Cortinariaceae ────────────────────────────────────────────────────────────

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Cortinari orelà'],
                        'commonNames_en', ARRAY['Fool''s webcap', 'Deadly webcap'])
WHERE scientific_name = 'Cortinarius orellanus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Cortinari vermell'],
                        'commonNames_en', ARRAY['Deadly webcap', 'Lethal webcap'])
WHERE scientific_name = 'Cortinarius rubellus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Cortinari violat'],
                        'commonNames_en', ARRAY['Violet webcap'])
WHERE scientific_name = 'Cortinarius violaceus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Cortinari rugós'],
                        'commonNames_en', ARRAY['Gypsy mushroom', 'Gypsy'])
WHERE scientific_name = 'Cortinarius caperatus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Cortinari esplèndid'],
                        'commonNames_en', ARRAY['Splendid webcap'])
WHERE scientific_name = 'Cortinarius splendens';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Cortinari magnífic'],
                        'commonNames_en', ARRAY['Goliath webcap'])
WHERE scientific_name = 'Cortinarius praestans';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Cortinari albercoc'],
                        'commonNames_en', ARRAY['Apricot webcap'])
WHERE scientific_name = 'Cortinarius armeniacus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Inocibe fibrosa'],
                        'commonNames_en', ARRAY['Split fibrecap', 'Straw fibrecap'])
WHERE scientific_name = 'Inocybe rimosa';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Inocibe rojenca'],
                        'commonNames_en', ARRAY['Red-staining inocybe', 'Brick-red tear mushroom'])
WHERE scientific_name = 'Inocybe erubescens';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Hebeloma de rave'],
                        'commonNames_en', ARRAY['Poison pie', 'Radish hebeloma'])
WHERE scientific_name = 'Hebeloma crustuliniforme';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Hebeloma de mostassa'],
                        'commonNames_en', ARRAY['Mustard hebeloma'])
WHERE scientific_name = 'Hebeloma sinapizans';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Galerina marginada'],
                        'commonNames_en', ARRAY['Deadly galerina', 'Autumn skullcap'])
WHERE scientific_name = 'Galerina marginata';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Gimnòpil de Juno'],
                        'commonNames_en', ARRAY['Spectacular rustgill', 'Showy flamecap'])
WHERE scientific_name = 'Gymnopilus junonius';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Cortinari bicolor'],
                        'commonNames_en', ARRAY['Two-coloured webcap'])
WHERE scientific_name = 'Phlegmacium calochroum';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Dermocibe sanguínia'],
                        'commonNames_en', ARRAY['Blood-red webcap'])
WHERE scientific_name = 'Dermocybe sanguinea';

-- ── Polyporales ───────────────────────────────────────────────────────────────

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Reishi', 'Bolet laca'],
                        'commonNames_en', ARRAY['Reishi', 'Lingzhi', 'Lacquered bracket'])
WHERE scientific_name = 'Ganoderma lucidum';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Yesca plana', 'Fomes pla'],
                        'commonNames_en', ARRAY['Artist''s bracket', 'Bear''s bread'])
WHERE scientific_name = 'Ganoderma applanatum';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Pollastre del bosc'],
                        'commonNames_en', ARRAY['Chicken of the woods', 'Sulphur shelf', 'Chicken mushroom'])
WHERE scientific_name = 'Laetiporus sulphureus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Esca', 'Esponja de faig'],
                        'commonNames_en', ARRAY['Tinder fungus', 'Hoof fungus', 'Tinder bracket'])
WHERE scientific_name = 'Fomes fomentarius';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Cua de gall dindi', 'Cua de faisan'],
                        'commonNames_en', ARRAY['Turkey tail', 'Many-colored bracket'])
WHERE scientific_name = 'Trametes versicolor';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Trametes gibosa'],
                        'commonNames_en', ARRAY['Lumpy bracket', 'Gibbose polypore'])
WHERE scientific_name = 'Trametes gibbosa';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Meripil gegant'],
                        'commonNames_en', ARRAY['Giant polypore'])
WHERE scientific_name = 'Meripilus giganteus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Maitake', 'Gallina del bosc'],
                        'commonNames_en', ARRAY['Maitake', 'Hen of the woods', 'Ram''s head'])
WHERE scientific_name = 'Grifola frondosa';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Coliflor del bosc'],
                        'commonNames_en', ARRAY['Cauliflower fungus', 'Cauliflower mushroom'])
WHERE scientific_name = 'Sparassis crispa';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Polipor escamós'],
                        'commonNames_en', ARRAY['Dryad''s saddle', 'Pheasant''s back mushroom'])
WHERE scientific_name = 'Polyporus squamosus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Polipor vermell'],
                        'commonNames_en', ARRAY['Cinnabar bracket', 'Cinnabar polypore'])
WHERE scientific_name = 'Pycnoporus cinnabarinus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Suro de roure'],
                        'commonNames_en', ARRAY['Oak mazegill', 'Thick maze oak polypore'])
WHERE scientific_name = 'Daedalea quercina';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Llengua de bou', 'Figatell de roure'],
                        'commonNames_en', ARRAY['Beefsteak fungus', 'Ox tongue', 'Bull''s tongue'])
WHERE scientific_name = 'Fistulina hepatica';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Flebea radiada'],
                        'commonNames_en', ARRAY['Wrinkled crust', 'Radiating crust fungus'])
WHERE scientific_name = 'Phlebia radiata';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Trametes hirsuta'],
                        'commonNames_en', ARRAY['Hairy bracket', 'Hairy turkey tail'])
WHERE scientific_name = 'Trametes hirsuta';

-- ── Hygrophoraceae ────────────────────────────────────────────────────────────

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Fredolic de març'],
                        'commonNames_en', ARRAY['March mushroom', 'Marzuolo'])
WHERE scientific_name = 'Hygrophorus marzuolus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Higròfor de pi'],
                        'commonNames_en', ARRAY['Herald of winter', 'Late waxcap'])
WHERE scientific_name = 'Hygrophorus hypothejus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Higròfor d''ametlla'],
                        'commonNames_en', ARRAY['Almond woodwax', 'Almond waxcap'])
WHERE scientific_name = 'Hygrophorus agathosmus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Higròfor pustulós'],
                        'commonNames_en', ARRAY['Spotted woodwax'])
WHERE scientific_name = 'Hygrophorus pustulatus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Higrocibe escarlata'],
                        'commonNames_en', ARRAY['Scarlet waxcap', 'Crimson waxcap'])
WHERE scientific_name = 'Hygrocybe punicea';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Higrocibe de prat'],
                        'commonNames_en', ARRAY['Meadow waxcap', 'Buff waxcap'])
WHERE scientific_name = 'Hygrocybe pratensis';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Higrocibe lloro'],
                        'commonNames_en', ARRAY['Parrot waxcap', 'Parrot mushroom'])
WHERE scientific_name = 'Hygrocybe psittacina';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Higrocibe verge'],
                        'commonNames_en', ARRAY['Snowy waxcap', 'Ivory waxcap'])
WHERE scientific_name = 'Cuphophyllus virgineus';

-- ── Strophariaceae / related ──────────────────────────────────────────────────

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Foliota escamosa'],
                        'commonNames_en', ARRAY['Shaggy scalycap', 'Scaly pholiota'])
WHERE scientific_name = 'Pholiota squarrosa';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Hipòloma en feixos', 'Bolet de mel amarg'],
                        'commonNames_en', ARRAY['Sulphur tuft', 'Clustered woodlover'])
WHERE scientific_name = 'Hypholoma fasciculare';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Hipòloma de pi'],
                        'commonNames_en', ARRAY['Conifer tuft', 'Smoky-gilled woodlover'])
WHERE scientific_name = 'Hypholoma capnoides';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Estròfaria verda'],
                        'commonNames_en', ARRAY['Verdigris roundhead', 'Green roundhead'])
WHERE scientific_name = 'Stropharia aeruginosa';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Agrocibe primaveral'],
                        'commonNames_en', ARRAY['Spring fieldcap'])
WHERE scientific_name = 'Agrocybe praecox';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Pollancre', 'Seta de pollancre'],
                        'commonNames_en', ARRAY['Black poplar mushroom', 'Velvet pioppino', 'Poplar mushroom'])
WHERE scientific_name = 'Agrocybe aegerita';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Seta de soca'],
                        'commonNames_en', ARRAY['Sheathed woodtuft', 'Brown stew mushroom'])
WHERE scientific_name = 'Kuehneromyces mutabilis';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Bolet màgic'],
                        'commonNames_en', ARRAY['Liberty cap', 'Magic mushroom'])
WHERE scientific_name = 'Psilocybe semilanceata';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Agrocibe cilíndrica'],
                        'commonNames_en', ARRAY['Poplar fieldcap', 'Cylindric agrocybe'])
WHERE scientific_name = 'Cyclocybe cylindracea';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Estròfaria coronada'],
                        'commonNames_en', ARRAY['Garland roundhead', 'Dung roundhead'])
WHERE scientific_name = 'Stropharia coronilla';

-- ── Agaricaceae ───────────────────────────────────────────────────────────────

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Xampinyó de camp', 'Bolet de Sant Miquel'],
                        'commonNames_en', ARRAY['Field mushroom', 'Meadow mushroom'])
WHERE scientific_name = 'Agaricus campestris';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Xampinyó de bosc'],
                        'commonNames_en', ARRAY['Wood mushroom', 'Anise mushroom'])
WHERE scientific_name = 'Agaricus silvicola';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Xampinyó groc'],
                        'commonNames_en', ARRAY['Yellow-staining mushroom', 'Yellow-stainer'])
WHERE scientific_name = 'Agaricus xanthodermus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Xampinyó august'],
                        'commonNames_en', ARRAY['The prince', 'Prince mushroom'])
WHERE scientific_name = 'Agaricus augustus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Lepista cristada'],
                        'commonNames_en', ARRAY['Stinking parasol', 'Crested lepiota'])
WHERE scientific_name = 'Lepiota cristata';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Apagallums', 'Galamperna'],
                        'commonNames_en', ARRAY['Parasol mushroom', 'Parasol'])
WHERE scientific_name = 'Macrolepiota procera';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Parasol rogenc'],
                        'commonNames_en', ARRAY['Shaggy parasol', 'Rough-scaled parasol'])
WHERE scientific_name = 'Macrolepiota rhacodes';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Lepiota blanca'],
                        'commonNames_en', ARRAY['White dapperling', 'Smooth lepiota'])
WHERE scientific_name = 'Leucoagaricus leucothites';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Barbuda', 'Orella de llebre'],
                        'commonNames_en', ARRAY['Shaggy ink cap', 'Lawyer''s wig', 'Shaggy mane'])
WHERE scientific_name = 'Coprinus comatus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Coprinèl·la micàcia'],
                        'commonNames_en', ARRAY['Glistening ink cap', 'Mica cap'])
WHERE scientific_name = 'Coprinellus micaceus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Coprinopsi de tinta'],
                        'commonNames_en', ARRAY['Common ink cap', 'Alcohol inky'])
WHERE scientific_name = 'Coprinopsis atramentaria';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Psatirel·la'],
                        'commonNames_en', ARRAY['Pale brittlestem', 'Candolle''s psathyrella'])
WHERE scientific_name = 'Psathyrella candolleana';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Panèol'],
                        'commonNames_en', ARRAY['Petticoat mottlegill'])
WHERE scientific_name = 'Panaeolus papilionaceus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Lacrimàri'],
                        'commonNames_en', ARRAY['Weeping widow', 'Lacrymaria'])
WHERE scientific_name = 'Lacrymaria lacrymabunda';

-- ── Hericiaceae ───────────────────────────────────────────────────────────────

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Barba de capuchí', 'Melena de Lleó'],
                        'commonNames_en', ARRAY['Lion''s mane mushroom', 'Bearded tooth mushroom', 'Monkey head'])
WHERE scientific_name = 'Hericium erinaceus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Hericium coral·loide'],
                        'commonNames_en', ARRAY['Coral tooth fungus', 'Comb tooth mushroom'])
WHERE scientific_name = 'Hericium coralloides';

-- ── Bankeraceae / Thelephorales ───────────────────────────────────────────────

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Sarcodó imbricat'],
                        'commonNames_en', ARRAY['Shingled hedgehog', 'Hawk''s-wing mushroom', 'Scaly hedgehog'])
WHERE scientific_name = 'Sarcodon imbricatus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Sarcodó escabrós'],
                        'commonNames_en', ARRAY['Bitter hedgehog mushroom', 'Scaber tooth'])
WHERE scientific_name = 'Sarcodon scabrosus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Dent sagnant'],
                        'commonNames_en', ARRAY['Bleeding tooth fungus', 'Red-juice tooth', 'Devil''s tooth'])
WHERE scientific_name = 'Hydnellum peckii';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Felodon negre'],
                        'commonNames_en', ARRAY['Black tooth fungus'])
WHERE scientific_name = 'Phellodon niger';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Bankera blanquinosa'],
                        'commonNames_en', ARRAY['Drab tooth mushroom'])
WHERE scientific_name = 'Bankera fuligineoalba';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Auriscalpi vulgar'],
                        'commonNames_en', ARRAY['Ear pick fungus', 'Pinecone mushroom'])
WHERE scientific_name = 'Auriscalpium vulgare';

-- ── Gasteromycetes / Phallales ────────────────────────────────────────────────

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Pedorrera gegant', 'Bolet gegant'],
                        'commonNames_en', ARRAY['Giant puffball'])
WHERE scientific_name = 'Calvatia gigantea';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Pet de llop'],
                        'commonNames_en', ARRAY['Common puffball', 'Gem-studded puffball'])
WHERE scientific_name = 'Lycoperdon perlatum';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Pet de llop piriforme'],
                        'commonNames_en', ARRAY['Stump puffball', 'Pear-shaped puffball'])
WHERE scientific_name = 'Lycoperdon pyriforme';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Pota de cavall'],
                        'commonNames_en', ARRAY['Common earthball', 'Pigskin poison puffball'])
WHERE scientific_name = 'Scleroderma citrinum';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Bejí plumbat'],
                        'commonNames_en', ARRAY['Grey puffball', 'Plumbeous puffball'])
WHERE scientific_name = 'Bovista plumbea';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Bolet fàl·lic'],
                        'commonNames_en', ARRAY['Common stinkhorn'])
WHERE scientific_name = 'Phallus impudicus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Fal·lus d''Adrià'],
                        'commonNames_en', ARRAY['Dune stinkhorn', 'Hadrian''s stinkhorn'])
WHERE scientific_name = 'Phallus hadriani';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Clàtre vermell'],
                        'commonNames_en', ARRAY['Red cage fungus', 'Latticed stinkhorn', 'Red cage'])
WHERE scientific_name = 'Clathrus ruber';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Clàtre estrellat'],
                        'commonNames_en', ARRAY['Octopus stinkhorn', 'Devil''s fingers'])
WHERE scientific_name = 'Clathrus archeri';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Mutí del gos'],
                        'commonNames_en', ARRAY['Dog stinkhorn'])
WHERE scientific_name = 'Mutinus caninus';

-- ── Marasmiaceae / small Agaricomycetes ───────────────────────────────────────

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Senderola', 'Moixernó de prat'],
                        'commonNames_en', ARRAY['Fairy ring champignon', 'Fairy ring mushroom'])
WHERE scientific_name = 'Marasmius oreades';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Marasmi rodat'],
                        'commonNames_en', ARRAY['Collared parachute', 'Pinwheel marasmius'])
WHERE scientific_name = 'Marasmius rotula';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Micena de barret'],
                        'commonNames_en', ARRAY['Common bonnet', 'Rosy bonnet'])
WHERE scientific_name = 'Mycena galericulata';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Micena de sang'],
                        'commonNames_en', ARRAY['Bleeding bonnet', 'Burgundydrop bonnet'])
WHERE scientific_name = 'Mycena haematopus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Porcel·lana'],
                        'commonNames_en', ARRAY['Porcelain fungus', 'Poached egg mushroom'])
WHERE scientific_name = 'Oudemansiella mucida';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Seta d''arrel llarga'],
                        'commonNames_en', ARRAY['Rooting shank', 'Deep root mushroom'])
WHERE scientific_name = 'Oudemansiella radicata';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Estrobílur del pi'],
                        'commonNames_en', ARRAY['Spruce cone mushroom', 'Edible fibrecap'])
WHERE scientific_name = 'Strobilurus esculentus';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Micena bioluminescent'],
                        'commonNames_en', ARRAY['Bioluminescent mycena', 'Green-glowing mycena'])
WHERE scientific_name = 'Mycena chlorophos';

-- ── Auriculariaceae / other ───────────────────────────────────────────────────

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Orella de Judes'],
                        'commonNames_en', ARRAY['Jelly ear', 'Jew''s ear', 'Wood ear'])
WHERE scientific_name = 'Auricularia auricula-judae';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Xilaria'],
                        'commonNames_en', ARRAY['Candlesnuff fungus', 'Carbon antlers', 'Stag''s horn fungus'])
WHERE scientific_name = 'Xylaria hypoxylon';

UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb)
  || jsonb_build_object('commonNames_ca', ARRAY['Cama de perdiu'],
                        'commonNames_en', ARRAY['Spike cap', 'Copper spike'])
WHERE scientific_name = 'Chroogomphus rutilus';
