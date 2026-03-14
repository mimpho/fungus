-- =============================================================================
-- 034_confusions_i18n_cortinariaceae.sql
-- Adds diff_ca / diff_en to all confusion entries from 009_confusions_cortinariaceae.sql
-- Full replacement of confusions array per species.
-- =============================================================================

-- esp-111  Cortinarius orellanus
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-114',
    'diff',    'LA CONFUSIÓN MÁS PELIGROSA de la familia. C. caperatus tiene un velo universal que forma arrugas concéntricas en el sombrero y un anillo membranoso persistente en el pie; C. orellanus tiene solo cortina efímera sin anillo real. Orellanina: síntomas de fallo renal con 2–3 semanas de retraso. Sin antídoto.',
    'diff_ca', 'LA CONFUSIÓ MÉS PERILLOSA de la família. C. caperatus té un vel universal que forma arrugues concèntriques al barret i un anell membranós persistent al peu; C. orellanus té només cortina efímera sense anell real. Orellànina: símptomes de fallida renal amb 2–3 setmanes de retard. Sense antídot.',
    'diff_en', 'THE MOST DANGEROUS CONFUSION of the family. C. caperatus has a universal veil forming concentric wrinkles on the cap and a persistent membranous ring on the stem; C. orellanus has only an ephemeral cortina without a true ring. Orellanine: symptoms of kidney failure with 2–3 weeks delay. No antidote.'),
  jsonb_build_object('with_species_id', 'esp-112',
    'diff',    'Ambos mortales con orellanina. C. rubellus tiene sombrero cónico-umbonado de color ocre-naranja a canela rojizo; C. orellanus tiene sombrero convexo-plano más pardo-ocre. Prácticamente indistinguibles en campo sin microscopio; ambos igualmente mortales.',
    'diff_ca', 'Ambdós mortals amb orellànina. C. rubellus té barret cónic-umbonat de color ocre-taronja a canyella rogenc; C. orellanus té barret convex-pla més marró-ocre. Pràcticament indistingibles en camp sense microscopi; ambdós igualment mortals.',
    'diff_en', 'Both deadly with orellanine. C. rubellus has a conic-umbonate cap, ochre-orange to reddish cinnamon color; C. orellanus has a convex-flat cap, more brown-ochre. Practically indistinguishable in the field without a microscope; both equally deadly.'),
  jsonb_build_object('with_species_id', 'esp-116',
    'diff',    'C. praestans es más robusto, con sombrero marrón-violáceo húmedo, cortina violácea bien visible en joven y pie con bulbo apretado. C. orellanus es más grácil y pardo-naranja. Sin embargo la cortina desaparece; ante cualquier Cortinarius pardo sin anillo definitivo, máxima precaución.',
    'diff_ca', 'C. praestans és més robust, amb barret marró-violaci humit, cortina violàcia ben visible en jove i peu amb bulb apretad. C. orellanus és més gràcil i marró-taronja. Tot i això la cortina desapareix; davant qualsevol Cortinarius marró sense anell definitiu, màxima precaució.',
    'diff_en', 'C. praestans is more robust, with a moist brown-violet cap, violet cortina well visible when young, and stem with tight bulb. C. orellanus is more slender and brown-orange. However, the cortina disappears; with any brown Cortinarius without a definitive ring, maximum caution.'),
  jsonb_build_object('with_species_id', 'esp-113',
    'diff',    'C. violaceus es inconfundible en fresco: todo el hongo es violáceo-oscuro intenso (sombrero, láminas, pie, carne). C. orellanus es pardo-naranja a ocre. La confusión solo ocurre con ejemplares viejos o decolorados de C. violaceus; en ese caso no consumir.',
    'diff_ca', 'C. violaceus és inconfusible en fresc: tot el bolet és violaci-fosc intens (barret, làmines, peu, carn). C. orellanus és marró-taronja a ocre. La confusió només ocorre amb exemplars vells o descolorits de C. violaceus; en aquest cas no consumir.',
    'diff_en', 'C. violaceus is unmistakable when fresh: the entire mushroom is intensely dark violet (cap, gills, stem, flesh). C. orellanus is brown-orange to ochre. Confusion only occurs with old or discolored C. violaceus specimens; in that case do not consume.')
)) WHERE scientific_name = 'Cortinarius orellanus';

-- esp-112  Cortinarius rubellus
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-111',
    'diff',    'Ambos mortales con orellanina de efecto retardado (2–3 semanas). C. rubellus tiene sombrero más cónico y color más anaranjado-canela; C. orellanus es más convexo y pardo-ocre. En la práctica no son separables con seguridad en campo. Mortal en ambos casos.',
    'diff_ca', 'Ambdós mortals amb orellànina d''efecte retardat (2–3 setmanes). C. rubellus té barret més cónic i color més ataronjat-canyella; C. orellanus és més convex i marró-ocre. A la pràctica no són separables amb seguretat en camp. Mortal en ambdós casos.',
    'diff_en', 'Both deadly with delayed-effect orellanine (2–3 weeks). C. rubellus has a more conic cap and more orange-cinnamon color; C. orellanus is more convex and brown-ochre. In practice not safely separable in the field. Deadly in both cases.'),
  jsonb_build_object('with_species_id', 'esp-114',
    'diff',    'C. caperatus tiene sombrero arrugado concéntricamente, superficie seca y mate, y un anillo membranoso bien definido. C. rubellus tiene sombrero liso-cónico, color ocre-naranja rojizo y solo cortina efímera. Caperatus: bueno. Rubellus: MORTAL. La presencia de anillo real (no cortina) en el pie es el signo de seguridad en caperatus.',
    'diff_ca', 'C. caperatus té barret arrugat concèntricament, superfície seca i mat, i un anell membranós ben definit. C. rubellus té barret llis-cónic, color ocre-taronja rogenc i només cortina efímera. Caperatus: bo. Rubellus: MORTAL. La presència d''anell real (no cortina) al peu és el senyal de seguretat en caperatus.',
    'diff_en', 'C. caperatus has a concentrically wrinkled cap, dry and matte surface, and a well-defined membranous ring. C. rubellus has a smooth-conic cap, ochre-reddish-orange color, and only ephemeral cortina. Caperatus: good. Rubellus: DEADLY. The presence of a true ring (not cortina) on the stem is the safety sign in caperatus.')
)) WHERE scientific_name = 'Cortinarius rubellus';

-- esp-113  Cortinarius violaceus
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-111',
    'diff',    'C. violaceus fresco es completamente violáceo oscuro: sombrero, láminas, pie y carne. C. orellanus es pardo-naranja a ocre sin ningún tono violáceo. La confusión solo existe con ejemplares muy viejos y decolorados. Un Cortinarius que pierda el violeta debe tratarse como desconocido y no consumirse.',
    'diff_ca', 'C. violaceus fresc és completament violaci fosc: barret, làmines, peu i carn. C. orellanus és marró-taronja a ocre sense cap to violaci. La confusió només existeix amb exemplars molt vells i descolorits. Un Cortinarius que perdi el violeta ha de tractar-se com a desconegut i no consumir-se.',
    'diff_en', 'Fresh C. violaceus is completely dark violet: cap, gills, stem, and flesh. C. orellanus is brown-orange to ochre with no violet tones. Confusion only exists with very old and discolored specimens. A Cortinarius that loses its violet color should be treated as unknown and not consumed.'),
  jsonb_build_object('with_species_id', 'esp-115',
    'diff',    'C. splendens tiene sombrero amarillo brillante a dorado con tonos oliváceos, muy vistoso. C. violaceus es morado oscuro. Solo en estadios muy degradados o en fotografías mal expuestas puede haber confusión. Splendens: MORTAL (orellanina). Ante cualquier duda en un Cortinarius llamativo, no consumir.',
    'diff_ca', 'C. splendens té barret groc brillant a daurat amb tons olivacis, molt vistós. C. violaceus és morat fosc. Només en estadis molt degradats o en fotografies mal exposades pot haver-hi confusió. Splendens: MORTAL (orellànina). Davant qualsevol dubte en un Cortinarius cridaner, no consumir.',
    'diff_en', 'C. splendens has a bright yellow to golden cap with olive tones, very striking. C. violaceus is dark purple. Only in very degraded stages or poorly exposed photographs can confusion arise. Splendens: DEADLY (orellanine). When in any doubt about a striking Cortinarius, do not consume.')
)) WHERE scientific_name = 'Cortinarius violaceus';

-- esp-114  Cortinarius caperatus
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-111',
    'diff',    'C. orellanus NO tiene anillo membranoso; solo cortina efímera de hilos. C. caperatus SIEMPRE tiene un anillo membranoso blanco-violáceo persistente y la superficie del sombrero está arrugada concéntricamente (como una pelota de golf). Verificar siempre el anillo antes de recolectar cualquier Cortinarius pardo. C. orellanus: MORTAL (orellanina, retraso 2–3 semanas).',
    'diff_ca', 'C. orellanus NO té anell membranós; només cortina efímera de fils. C. caperatus SEMPRE té un anell membranós blanc-violaci persistent i la superfície del barret està arrugada concèntricament (com una pilota de golf). Verificar sempre l''anell abans de recol·lectar qualsevol Cortinarius marró. C. orellanus: MORTAL (orellànina, retard 2–3 setmanes).',
    'diff_en', 'C. orellanus does NOT have a membranous ring; only an ephemeral thread-like cortina. C. caperatus ALWAYS has a persistent white-violet membranous ring and the cap surface is concentrically wrinkled (like a golf ball). Always verify the ring before collecting any brown Cortinarius. C. orellanus: DEADLY (orellanine, delay 2–3 weeks).'),
  jsonb_build_object('with_species_id', 'esp-112',
    'diff',    'C. rubellus es más esbelto y de color más anaranjado-canela, sin anillo membranoso real (solo cortina efímera). C. caperatus tiene sombrero pardo-ocráceo con arrugas concéntricas y un anillo membranoso bien formado. El anillo es la diferencia de seguridad. C. rubellus: MORTAL.',
    'diff_ca', 'C. rubellus és més esvelt i de color més ataronjat-canyella, sense anell membranós real (només cortina efímera). C. caperatus té barret marró-ocràci amb arrugues concèntriques i un anell membranós ben format. L''anell és la diferència de seguretat. C. rubellus: MORTAL.',
    'diff_en', 'C. rubellus is more slender and more orange-cinnamon colored, without a true membranous ring (only ephemeral cortina). C. caperatus has an ochre-brown cap with concentric wrinkles and a well-formed membranous ring. The ring is the safety difference. C. rubellus: DEADLY.'),
  jsonb_build_object('with_species_id', 'esp-115',
    'diff',    'C. splendens tiene sombrero amarillo brillante a dorado, muy diferente del pardo-ocráceo de caperatus. Ambos tienen anillo o restos velares, pero splendens es amarillo vivo con tonos oliváceos. C. splendens: MORTAL (orellanina). No confundir en campo pero la foto o recuerdo puede confundir.',
    'diff_ca', 'C. splendens té barret groc brillant a daurat, molt diferent del marró-ocràci de caperatus. Ambdós tenen anell o restes velars, però splendens és groc viu amb tons olivacis. C. splendens: MORTAL (orellànina). No confondre en camp però la foto o el record pot confondre.',
    'diff_en', 'C. splendens has a bright yellow to golden cap, very different from the ochre-brown of caperatus. Both have rings or veil remnants, but splendens is vivid yellow with olive tones. C. splendens: DEADLY (orellanine). Not confused in the field but a photo or memory can confuse.')
)) WHERE scientific_name = 'Cortinarius caperatus';

-- esp-115  Cortinarius splendens
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-114',
    'diff',    'C. caperatus tiene sombrero pardo-ocráceo arrugado con anillo blanco-violáceo. C. splendens tiene sombrero amarillo brillante a dorado con láminas y pie amarillo-azufre. Visualmente diferentes en fresco; la confusión ocurre en fotos o con ejemplares muy degradados. C. splendens: MORTAL (orellanina).',
    'diff_ca', 'C. caperatus té barret marró-ocràci arrugate amb anell blanc-violaci. C. splendens té barret groc brillant a daurat amb làmines i peu groc-sofre. Visualment diferents en fresc; la confusió ocorre en fotos o amb exemplars molt degradats. C. splendens: MORTAL (orellànina).',
    'diff_en', 'C. caperatus has an ochre-brown wrinkled cap with a white-violet ring. C. splendens has a bright yellow to golden cap with sulfur-yellow gills and stem. Visually different when fresh; confusion occurs in photos or with very degraded specimens. C. splendens: DEADLY (orellanine).'),
  jsonb_build_object('with_species_id', 'esp-113',
    'diff',    'C. violaceus es morado oscuro; C. splendens es amarillo dorado. Solo en ejemplares muy envejecidos y decolorados puede producirse confusión. Cualquier Cortinarius de color incierto que no se identifique con seguridad debe descartarse.',
    'diff_ca', 'C. violaceus és morat fosc; C. splendens és groc daurat. Només en exemplars molt envellits i descolorits pot produir-se confusió. Qualsevol Cortinarius de color incert que no s''identifiqui amb seguretat ha de descartar-se.',
    'diff_en', 'C. violaceus is dark purple; C. splendens is golden yellow. Only in very aged and discolored specimens can confusion arise. Any Cortinarius of uncertain color that cannot be identified safely must be discarded.')
)) WHERE scientific_name = 'Cortinarius splendens';

-- esp-116  Cortinarius praestans
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-111',
    'diff',    'C. orellanus es más pequeño y grácil, pardo-naranja uniforme sin tonos violáceos, con cortina efímera. C. praestans es grande y robusto (sombrero hasta 20 cm), con sombrero marrón-violáceo húmedo y visible cortina violácea en joven. Sin embargo, al envejecer praestans pierde el violeta; ante cualquier Cortinarius pardo no reconocible con certeza, no consumir.',
    'diff_ca', 'C. orellanus és més petit i gràcil, marró-taronja uniforme sense tons violacis, amb cortina efímera. C. praestans és gran i robust (barret fins a 20 cm), amb barret marró-violaci humit i cortina violàcia visible en jove. Tot i això, en envellir praestans perd el violeta; davant qualsevol Cortinarius marró no recognoscible amb certesa, no consumir.',
    'diff_en', 'C. orellanus is smaller and more slender, uniform brown-orange without violet tones, with ephemeral cortina. C. praestans is large and robust (cap up to 20 cm), with a moist brown-violet cap and visible violet cortina when young. However, as praestans ages it loses the violet; with any brown Cortinarius not identifiable with certainty, do not consume.')
)) WHERE scientific_name = 'Cortinarius praestans';

-- esp-117  Cortinarius armeniacus
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-111',
    'diff',    'Ambos pardos a oxidados en tonos ocres-anaranjados. C. armeniacus tiene olor a miel o albaricoque y láminas de color canela-ocráceo en adulto. C. orellanus no tiene ese olor dulce. La distinción no es fiable en campo: ambos son tóxicos (armeniacus) o mortales (orellanus). Ninguno debe consumirse sin identificación experta.',
    'diff_ca', 'Ambdós marrons a oxidats en tons ocres-ataronjats. C. armeniacus té olor a mel o albercoc i làmines de color canyella-ocràci en adult. C. orellanus no té aquesta olor dolça. La distinció no és fiable en camp: ambdós són tòxics (armeniacus) o mortals (orellanus). Cap dels dos ha de consumir-se sense identificació experta.',
    'diff_en', 'Both brown to oxidized in ochre-orange tones. C. armeniacus has a honey or apricot smell and cinnamon-ochre gills as adult. C. orellanus lacks this sweet smell. The distinction is not reliable in the field: both are toxic (armeniacus) or deadly (orellanus). Neither should be consumed without expert identification.')
)) WHERE scientific_name = 'Cortinarius armeniacus';

-- esp-119  Inocybe erubescens (cross-familia: Inocybaceae)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-114',
    'diff',    'C. caperatus tiene sombrero más grande arrugado-concéntrico y anillo membranoso persistente; I. erubescens tiene sombrero fibriloso-sedoso que enrojece con la edad, sin anillo membranoso (solo cortina efímera). I. erubescens crece en suelos calcáreos con latifolias, contiene muscarina: puede ser mortal. El enrojecimiento de la carne al corte es característico de I. erubescens.',
    'diff_ca', 'C. caperatus té barret més gran arrugat-concèntric i anell membranós persistent; I. erubescens té barret fibril·lós-sedós que vermelleja amb l''edat, sense anell membranós (només cortina efímera). I. erubescens creix en sòls calcaris amb latifolies, conté muscarina: pot ser mortal. L''enrogiment de la carn al tall és característic de I. erubescens.',
    'diff_en', 'C. caperatus has a larger concentrically wrinkled cap and persistent membranous ring; I. erubescens has a fibrillose-silky cap that reddens with age, without a membranous ring (only ephemeral cortina). I. erubescens grows on calcareous soils with hardwoods, contains muscarine: can be deadly. Flesh reddening when cut is characteristic of I. erubescens.'),
  jsonb_build_object('with_species_id', 'esp-111',
    'diff',    'C. orellanus tiene solo cortina efímera y sombrero pardo-naranja seco; I. erubescens tiene sombrero fibriloso que enrojece y carne que enrojece al corte. Ambos tóxicos/mortales y de aspecto similar en campo. El enrojecimiento de I. erubescens es diagnóstico pero solo en adultos.',
    'diff_ca', 'C. orellanus té només cortina efímera i barret marró-taronja sec; I. erubescens té barret fibril·lós que enrogeix i carn que vermelleja al tall. Ambdós tòxics/mortals i d''aspecte similar en camp. L''enrogiment de I. erubescens és diagnòstic però només en adults.',
    'diff_en', 'C. orellanus has only ephemeral cortina and a dry brown-orange cap; I. erubescens has a fibrillose cap that reddens and flesh that reddens when cut. Both toxic/deadly and of similar appearance in the field. I. erubescens reddening is diagnostic but only in adults.')
)) WHERE scientific_name = 'Inocybe erubescens';

-- =============================================================================
-- Verificación
-- =============================================================================
SELECT scientific_name,
       jsonb_array_length(extra_data->'confusions') AS n_confusions
FROM   species
WHERE  scientific_name IN (
  'Cortinarius orellanus', 'Cortinarius rubellus', 'Cortinarius violaceus',
  'Cortinarius caperatus', 'Cortinarius splendens', 'Cortinarius praestans',
  'Cortinarius armeniacus', 'Inocybe erubescens'
)
ORDER  BY scientific_name;
