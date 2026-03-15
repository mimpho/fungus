-- =============================================================================
-- 033_confusions_i18n_russulaceae.sql
-- Adds diff_ca / diff_en to all confusion entries from 008_confusions_russulaceae.sql
-- Full replacement of confusions array per species.
-- =============================================================================

-- =============================================================================
-- RUSSULA
-- =============================================================================

-- esp-023  Russula virescens
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-026',
    'diff',    'R. emetica tiene sombrero rojo-escarlata brillante (no verdoso-grisáceo areolado). La prueba más fiable: sabor. Un pequeño trozo de lámina de R. emetica es claramente acre-picante; R. virescens tiene sabor suave. Las russulas acres suelen ser tóxicas.',
    'diff_ca', 'R. emetica té barret vermell-escarlata brillant (no verdós-grisós arèolat). La prova més fiable: sabor. Un petit tros de làmina de R. emetica és clarament àcre-picant; R. virescens té sabor suau. Les rússules àcres solen ser tòxiques.',
    'diff_en', 'R. emetica has a bright scarlet-red cap (not grayish-green and areolate). The most reliable test: taste. A small piece of R. emetica gill is clearly acrid-peppery; R. virescens has a mild taste. Acrid-tasting russulas are usually toxic.'),
  jsonb_build_object('with_species_id', 'esp-024',
    'diff',    'Ambas excelentes. R. cyanoxantha tiene sombrero violáceo-verdoso más uniforme, laminillas flexibles (no frágiles) y sabor dulce. R. virescens tiene el sombrero claramente areolado-cuarteado, característica inconfundible en adulto.',
    'diff_ca', 'Ambdues excel·lents. R. cyanoxantha té barret violaci-verdós més uniforme, làmines flexibles (no fràgils) i sabor dolç. R. virescens té el barret clarament arèolat-esquerdat, característica inconfusible en adult.',
    'diff_en', 'Both excellent. R. cyanoxantha has a more uniform violet-greenish cap, flexible (not brittle) gills, and sweet taste. R. virescens has a clearly areolate-cracked cap, an unmistakable feature in adults.')
)) WHERE scientific_name = 'Russula virescens';

-- esp-024  Russula cyanoxantha
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-026',
    'diff',    'R. emetica tiene sombrero rojo-escarlata; R. cyanoxantha es violácea-verdosa. La prueba del sabor es definitiva: R. emetica es muy acre en las láminas; R. cyanoxantha tiene sabor dulce o suavemente harinoso. Las russulas con sabor acre son tóxicas.',
    'diff_ca', 'R. emetica té barret vermell-escarlata; R. cyanoxantha és violàcia-verdosa. La prova del sabor és definitiva: R. emetica és molt àcre a les làmines; R. cyanoxantha té sabor dolç o suaument farinós. Les rússules amb sabor àcre són tòxiques.',
    'diff_en', 'R. emetica has a scarlet-red cap; R. cyanoxantha is violet-greenish. The taste test is definitive: R. emetica is very acrid on the gills; R. cyanoxantha has a sweet or mildly floury taste. Russulas with acrid taste are toxic.'),
  jsonb_build_object('with_species_id', 'esp-023',
    'diff',    'Ambas excelentes. R. virescens tiene el sombrero claramente cuarteado-areolado en adulto; R. cyanoxantha tiene sombrero liso. Las laminillas de R. cyanoxantha son flexibles y no se rompen con facilidad, característica diagnóstica del género.',
    'diff_ca', 'Ambdues excel·lents. R. virescens té el barret clarament esquerdat-arèolat en adult; R. cyanoxantha té barret llis. Les làmines de R. cyanoxantha són flexibles i no es trenquen amb facilitat, característica diagnòstica del gènere.',
    'diff_en', 'Both excellent. R. virescens has a clearly cracked-areolate cap as an adult; R. cyanoxantha has a smooth cap. R. cyanoxantha gills are flexible and do not break easily, a diagnostic feature of the genus.')
)) WHERE scientific_name = 'Russula cyanoxantha';

-- esp-025  Russula delica
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-042',
    'diff',    'Ambas blancas y robustas. L. vellereus tiene látex blanco muy abundante y acrid-ardiente, superficie finamente aterciopelada. R. delica no produce látex (es una Russula, no Lactarius). Si fluye látex al corte → Lactifluus/Lactarius.',
    'diff_ca', 'Ambdues blanques i robustes. L. vellereus té làtex blanc molt abundant i àcre-ardent, superfície finament aterciopelada. R. delica no produeix làtex (és una Russula, no Lactarius). Si flueix làtex al tall → Lactifluus/Lactarius.',
    'diff_en', 'Both white and robust. L. vellereus has very abundant acrid-burning white latex, finely velvety surface. R. delica produces no latex (it is a Russula, not Lactarius). If latex flows when cut → Lactifluus/Lactarius.'),
  jsonb_build_object('with_species_id', 'esp-038',
    'diff',    'Ambas blancas con látex abundante. L. piperatus tiene laminillas muy apretadas y finas, látex acrid-ardiente. R. delica no produce látex. La ausencia de látex distingue siempre una Russula de un Lactarius/Lactifluus.',
    'diff_ca', 'Ambdues blanques amb làtex abundant. L. piperatus té làmines molt apretades i fines, làtex àcre-ardent. R. delica no produeix làtex. L''absència de làtex distingeix sempre una Russula d''un Lactarius/Lactifluus.',
    'diff_en', 'Both white with abundant latex. L. piperatus has very crowded and thin gills, acrid-burning latex. R. delica produces no latex. The absence of latex always distinguishes a Russula from a Lactarius/Lactifluus.')
)) WHERE scientific_name = 'Russula delica';

-- esp-026  Russula emetica
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-027',
    'diff',    'R. aurea tiene sombrero amarillo-naranja a anaranjado con laminillas amarillentas y pie amarillo; R. emetica tiene sombrero rojo puro y laminillas blancas. El sabor confirma: R. aurea es dulce, R. emetica es muy acre-picante. Las russulas amarillo-doradas no suelen ser problemáticas; las rojas piden más precaución.',
    'diff_ca', 'R. aurea té barret groc-taronja a ataronjat amb làmines grogues i peu groc; R. emetica té barret roig pur i làmines blanques. El sabor confirma: R. aurea és dolça, R. emetica és molt àcre-picant. Les rússules groc-daurades no solen ser problemàtiques; les vermelles demanen més precaució.',
    'diff_en', 'R. aurea has a yellow-orange to orange cap with yellowish gills and yellow stem; R. emetica has a pure red cap and white gills. Taste confirms: R. aurea is sweet, R. emetica is very acrid-peppery. Yellow-golden russulas are usually not problematic; red ones call for more caution.'),
  jsonb_build_object('with_species_id', 'esp-030',
    'diff',    'R. vesca tiene sombrero rosado-vináceo, no rojo-escarlata brillante; la cutícula se retrae dejando ver las láminas en el borde. Sabor dulce o suavemente harinoso (R. vesca comestible) vs muy acre (R. emetica tóxica). La prueba de sabor es definitiva.',
    'diff_ca', 'R. vesca té barret rosat-vinaci, no vermell-escarlata brillant; la cutícula es retreu deixant veure les làmines al marge. Sabor dolç o suaument farinós (R. vesca comestible) vs molt àcre (R. emetica tòxica). La prova del sabor és definitiva.',
    'diff_en', 'R. vesca has a pink-vinaceous cap, not bright scarlet-red; the cuticle retracts revealing the gills at the edge. Sweet or mildly floury taste (R. vesca edible) vs very acrid (R. emetica toxic). The taste test is definitive.'),
  jsonb_build_object('with_species_id', 'esp-023',
    'diff',    'R. virescens tiene sombrero verde-grisáceo areolado, completamente diferente del rojo-escarlata de R. emetica. La confusión ocurre cuando los sombreros están decolorados o sucios. Siempre hacer prueba del sabor: acre = no comer.',
    'diff_ca', 'R. virescens té barret verd-grisós arèolat, completament diferent del vermell-escarlata de R. emetica. La confusió ocorre quan els barrets estan descolorits o bruts. Sempre fer prova del sabor: àcre = no menjar.',
    'diff_en', 'R. virescens has a grayish-green areolate cap, completely different from the scarlet-red of R. emetica. Confusion occurs when caps are discolored or dirty. Always do the taste test: acrid = do not eat.'),
  jsonb_build_object('with_species_id', 'esp-024',
    'diff',    'R. cyanoxantha tiene sombrero violáceo-verdoso, sabor dulce y laminillas flexibles. R. emetica tiene sombrero rojo brillante, sabor muy acre y laminillas frágiles. La prueba del sabor (pequeño trozo de lámina) es definitiva y sin riesgo.',
    'diff_ca', 'R. cyanoxantha té barret violaci-verdós, sabor dolç i làmines flexibles. R. emetica té barret roig brillant, sabor molt àcre i làmines fràgils. La prova del sabor (petit tros de làmina) és definitiva i sense risc.',
    'diff_en', 'R. cyanoxantha has a violet-greenish cap, sweet taste, and flexible gills. R. emetica has a bright red cap, very acrid taste, and brittle gills. The taste test (small piece of gill) is definitive and risk-free.')
)) WHERE scientific_name = 'Russula emetica';

-- esp-027  Russula aurea
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-026',
    'diff',    'R. emetica tiene sombrero rojo-escarlata puro con laminillas blancas; R. aurea tiene sombrero amarillo-anaranjado y laminillas amarillas. El sabor confirma: R. aurea es dulce, R. emetica es muy acre. Las russulas amarillo-doradas no suelen ser problemáticas; las rojas piden más precaución.',
    'diff_ca', 'R. emetica té barret vermell-escarlata pur amb làmines blanques; R. aurea té barret groc-ataronjat i làmines grogues. El sabor confirma: R. aurea és dolça, R. emetica és molt àcre. Les rússules groc-daurades no solen ser problemàtiques; les vermelles demanen precaució.',
    'diff_en', 'R. emetica has a pure scarlet-red cap with white gills; R. aurea has a yellow-orange cap and yellow gills. Taste confirms: R. aurea is sweet, R. emetica very acrid. Yellow-golden russulas are usually not problematic; red ones call for more caution.')
)) WHERE scientific_name = 'Russula aurea';

-- esp-030  Russula vesca
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-026',
    'diff',    'R. emetica es rojo-escarlata brillante; R. vesca es rosado-vináceo más apagado, con la cutícula que se retrae en el borde dejando ver las láminas blancas. Sabor dulce o suave (R. vesca) vs muy acre-ardiente (R. emetica). La prueba de sabor en las láminas es la comprobación definitiva.',
    'diff_ca', 'R. emetica és vermell-escarlata brillant; R. vesca és rosat-vinaci més apagat, amb la cutícula que es retreu al marge deixant veure les làmines blanques. Sabor dolç o suau (R. vesca) vs molt àcre-ardent (R. emetica). La prova de sabor a les làmines és la comprovació definitiva.',
    'diff_en', 'R. emetica is bright scarlet-red; R. vesca is more muted pink-vinaceous, with the cuticle retracting at the edge revealing white gills. Sweet or mild taste (R. vesca) vs very acrid-burning (R. emetica). The gill taste test is the definitive check.')
)) WHERE scientific_name = 'Russula vesca';

-- esp-031  Russula foetens
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-043',
    'diff',    'Ambas tóxicas con olor desagradable a laurocerasa/almendra amarga. R. laurocerasi tiene sombrero más ocráceo-miel con láminas que lagrimean gotitas. R. foetens es más amarronada y de mayor tamaño. El olor compartido puede confundirlas; ambas deben evitarse.',
    'diff_ca', 'Ambdues tòxiques amb olor desagradable a laurocerasa/ametlla amarga. R. laurocerasi té barret més ocràci-mel amb làmines que degoten gotetes. R. foetens és més marronosa i de mida major. L''olor compartit pot confondre-les; ambdues han d''evitar-se.',
    'diff_en', 'Both toxic with an unpleasant cherry-laurel/bitter almond smell. R. laurocerasi has a more ochre-honey cap with gills that weep droplets. R. foetens is darker brown and larger. Their shared smell can cause confusion; both must be avoided.')
)) WHERE scientific_name = 'Russula foetens';

-- esp-032  Russula nigricans
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-025',
    'diff',    'Ambas blancas y robustas en estadio joven. R. nigricans ennegrece progresivamente (primero gris-pardo, luego negro) y tiene laminillas muy espaciadas y gruesas. R. delica permanece blanca. La carne de R. nigricans vira a rojo y luego a negro al corte.',
    'diff_ca', 'Ambdues blanques i robustes en estadi jove. R. nigricans ennegreix progressivament (primer gris-pardo, després negre) i té làmines molt espaiades i gruixudes. R. delica es manté blanca. La carn de R. nigricans vira a vermell i després a negre al tall.',
    'diff_en', 'Both white and robust when young. R. nigricans blackens progressively (first grayish-brown, then black) and has very spaced and thick gills. R. delica remains white. R. nigricans flesh turns red then black when cut.')
)) WHERE scientific_name = 'Russula nigricans';

-- esp-043  Russula laurocerasi
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-031',
    'diff',    'Ambas tóxicas con olor fuerte a almendra amarga o laurocerasa. R. foetens es más grande y oscura; R. laurocerasi tiene sombrero más ocráceo-miel y láminas con gotitas hialinas características. El olor compartido es confundible; nunca consumir russulas con olor desagradable.',
    'diff_ca', 'Ambdues tòxiques amb olor fort a ametlla amarga o laurocerasa. R. foetens és més gran i fosca; R. laurocerasi té barret més ocràci-mel i làmines amb gotetes hialines característiques. L''olor compartit és confusible; mai consumir rússules amb olor desagradable.',
    'diff_en', 'Both toxic with a strong bitter almond or cherry-laurel smell. R. foetens is larger and darker; R. laurocerasi has a more ochre-honey cap and gills with characteristic hyaline droplets. Their shared smell is confusing; never consume russulas with an unpleasant smell.')
)) WHERE scientific_name = 'Russula laurocerasi';


-- =============================================================================
-- LACTARIUS / LACTIFLUUS
-- =============================================================================

-- esp-035  Lactarius deliciosus
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-036',
    'diff',    'Muy similares. L. sanguifluus tiene látex rojo-vinoso desde el principio (no naranja-zanahoria); carne rojo-vinosa. L. deliciosus tiene látex naranja-zanahoria que puede virar ligeramente a verdoso. Ambos excelentes. El color del látex al corte es la clave.',
    'diff_ca', 'Molt similars. L. sanguifluus té làtex vermell-vinós des del principi (no taronja-pastanaga); carn vermell-vinosa. L. deliciosus té làtex taronja-pastanaga que pot virar lleugerament a verdós. Ambdós excel·lents. El color del làtex al tall és la clau.',
    'diff_en', 'Very similar. L. sanguifluus has red-vinous latex from the start (not carrot-orange); red-vinous flesh. L. deliciosus has carrot-orange latex that may turn slightly greenish. Both excellent. The color of the latex when cut is the key.'),
  jsonb_build_object('with_species_id', 'esp-037',
    'diff',    'L. deterrimus es casi idéntico pero el látex es naranja más vivo y vira rápidamente a verde-intenso. Sabor algo más amargo y calidad culinaria inferior. El verdeo rápido del látex y la carne distingue deterrimus de deliciosus.',
    'diff_ca', 'L. deterrimus és quasi idèntic però el làtex és taronja més viu i vira ràpidament a verd-intens. Sabor una mica més amarg i qualitat culinària inferior. El verdejament ràpid del làtex i la carn distingeix deterrimus de deliciosus.',
    'diff_en', 'L. deterrimus is almost identical but the latex is more vivid orange and quickly turns bright green. Flavor slightly more bitter and lower culinary quality. The rapid greening of the latex and flesh distinguishes deterrimus from deliciosus.'),
  jsonb_build_object('with_species_id', 'esp-039',
    'diff',    'Confusión peligrosa: L. torminosus tiene sombrero rosado-asalmonado con margen claramente enrollado y peludo-lanoso, y látex BLANCO acre. L. deliciosus tiene sombrero naranja zonado y látex naranja. Un níscalo con látex blanco no es L. deliciosus.',
    'diff_ca', 'Confusió perillosa: L. torminosus té el marge del barret enrotllat i densament pelut-llanós, color rosat-asalmonat amb zones concèntriques, i làtex BLANC àcre. L. deliciosus té barret zonat taronja, marge poc enrotllat i làtex TARONJA. Un rovellón amb làtex blanc: senyal d''alarma.',
    'diff_en', 'Dangerous confusion: L. torminosus has an enrolled and densely woolly-hairy cap margin, pink-salmon color with concentric zones, and acrid WHITE latex. L. deliciosus has orange zonate cap, slightly enrolled margin, and ORANGE latex. A milk-cap with white latex: alarm signal.')
)) WHERE scientific_name = 'Lactarius deliciosus';

-- esp-036  Lactarius sanguifluus
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-035',
    'diff',    'L. deliciosus tiene látex naranja-zanahoria (puede verdear levemente); L. sanguifluus tiene látex rojo-vinoso oscuro desde el corte. El sombrero de sanguifluus es más pálido-vináceo, el de deliciosus más naranja-zonado. Ambos excelentes comestibles.',
    'diff_ca', 'L. deliciosus té làtex taronja-pastanaga (pot verdear lleugerament); L. sanguifluus té làtex vermell-vinós fosc des del tall. El barret de sanguifluus és més pàl·lid-vinaci, el de deliciosus més taronja-zonat. Ambdós excel·lents comestibles.',
    'diff_en', 'L. deliciosus has carrot-orange latex (may turn slightly green); L. sanguifluus has dark red-vinous latex from the cut. Sanguifluus cap is more pale-vinaceous, deliciosus cap more orange-zonate. Both excellent edibles.'),
  jsonb_build_object('with_species_id', 'esp-037',
    'diff',    'L. deterrimus tiene látex naranja que vira a verde intenso rápidamente; L. sanguifluus tiene látex rojo-vinoso sin verdeo notable. El sabor de deterrimus es más amargo. El color del látex es definitivo.',
    'diff_ca', 'L. deterrimus té làtex taronja que vira a verd intens ràpidament; L. sanguifluus té làtex vermell-vinós sense verdejament notable. El sabor de deterrimus és més amarg. El color del làtex és definitiu.',
    'diff_en', 'L. deterrimus has orange latex that quickly turns intense green; L. sanguifluus has red-vinous latex without notable greening. Deterrimus flavor is more bitter. Latex color is definitive.')
)) WHERE scientific_name = 'Lactarius sanguifluus';

-- esp-037  Lactarius deterrimus
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-035',
    'diff',    'L. deliciosus tiene látex naranja que verdea poco y lentamente; L. deterrimus tiene látex naranja que vira a verde vivo en pocos minutos. Sabor de deterrimus más amargo. Se acepta como comestible pero de peor calidad; evitar consumo excesivo.',
    'diff_ca', 'L. deliciosus té làtex taronja que verdeja poc i lentament; L. deterrimus té làtex taronja que vira a verd viu en pocs minuts. Sabor de deterrimus més amarg. S''accepta com a comestible però de pitjor qualitat; evitar consum excessiu.',
    'diff_en', 'L. deliciosus has orange latex that greens little and slowly; L. deterrimus has orange latex that turns bright green in a few minutes. Deterrimus flavor more bitter. Accepted as edible but of lower quality; avoid excessive consumption.'),
  jsonb_build_object('with_species_id', 'esp-036',
    'diff',    'L. sanguifluus tiene látex rojo-vinoso sin verdeo apreciable. L. deterrimus tiene látex naranja con verdeo rápido e intenso. El color del látex al corte es la diferencia más inmediata y fiable.',
    'diff_ca', 'L. sanguifluus té làtex vermell-vinós sense verdejament apreciable. L. deterrimus té làtex taronja amb verdejament ràpid i intens. El color del làtex al tall és la diferència més immediata i fiable.',
    'diff_en', 'L. sanguifluus has red-vinous latex without appreciable greening. L. deterrimus has orange latex with rapid and intense greening. Latex color when cut is the most immediate and reliable difference.')
)) WHERE scientific_name = 'Lactarius deterrimus';

-- esp-038  Lactifluus piperatus
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-042',
    'diff',    'Ambas blancas y robustas con látex blanco acre. L. vellereus tiene superficie claramente aterciopelada y laminillas más espaciadas. L. piperatus tiene superficie lisa y laminillas muy apretadas y finas. Ambas de precaución: látex muy acre en crudo; requieren cocción prolongada si se consumen.',
    'diff_ca', 'Ambdues blanques i robustes amb làtex blanc àcre. L. vellereus té superfície clarament aterciopelada i làmines més espaiades. L. piperatus té superfície llisa i làmines molt apretades i fines. Ambdues de precaució: làtex molt àcre en cru; requereixen cocció prolongada si es consumeixen.',
    'diff_en', 'Both white and robust with acrid white latex. L. vellereus has a clearly velvety surface and more spaced gills. L. piperatus has a smooth surface and very crowded and thin gills. Both require caution: very acrid latex when raw; require prolonged cooking if consumed.')
)) WHERE scientific_name = 'Lactifluus piperatus';

-- esp-039  Lactarius torminosus
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-035',
    'diff',    'Diferencias clave: L. torminosus tiene el margen del sombrero enrollado y densamente peludo-lanoso, color rosado-asalmonado con zonas concéntricas, y látex BLANCO acre. L. deliciosus tiene sombrero zonado naranja, margen poco enrollado y látex NARANJA. Látex blanco en un supuesto níscalo: señal de alarma.',
    'diff_ca', 'Diferències clau: L. torminosus té el marge del barret enrotllat i densament pelut-llanós, color rosat-asalmonat amb zones concèntriques, i làtex BLANC àcre. L. deliciosus té barret zonat taronja, marge poc enrotllat i làtex TARONJA. Làtex blanc en un suposat rovellón: senyal d''alarma.',
    'diff_en', 'Key differences: L. torminosus has an enrolled and densely woolly-hairy cap margin, pink-salmon color with concentric zones, and acrid WHITE latex. L. deliciosus has orange zonate cap, slightly enrolled margin, and ORANGE latex. White latex in a supposed milk-cap: alarm signal.')
)) WHERE scientific_name = 'Lactarius torminosus';

-- esp-041  Lactarius volemus
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-038',
    'diff',    'L. piperatus es blanco puro sin zonas; L. volemus tiene sombrero ocráceo-naranja rojizo y látex blanco muy abundante que no es acre sino dulce con olor a arenque. El olor característico a pescado de L. volemus es inconfundible en adultos.',
    'diff_ca', 'L. piperatus és blanc pur sense zones; L. volemus té barret ocràci-taronja rogenc i làtex blanc molt abundant que no és àcre sinó dolç amb olor a arengada. L''olor característic a peix de L. volemus és inconfusible en adults.',
    'diff_en', 'L. piperatus is pure white without zones; L. volemus has an ochre-reddish-orange cap and very abundant white latex that is not acrid but sweet with a herring-like smell. The characteristic fishy smell of L. volemus is unmistakable in adults.')
)) WHERE scientific_name = 'Lactarius volemus';

-- esp-042  Lactifluus vellereus
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-038',
    'diff',    'Ambas blancas con látex blanco acre. L. piperatus tiene superficie lisa y laminillas muy apretadas; L. vellereus tiene superficie aterciopelada al tacto y laminillas más espaciadas. Ambas de precaución: muy acres en crudo. Se usan encurtidas en Europa del Este pero requieren tratamiento previo.',
    'diff_ca', 'Ambdues blanques amb làtex blanc àcre. L. piperatus té superfície llisa i làmines molt apretades; L. vellereus té superfície aterciopelada al tacte i làmines més espaiades. Ambdues de precaució: molt àcres en cru. S''utilitzen encurtides a l''Europa de l''Est però requereixen tractament previ.',
    'diff_en', 'Both white with acrid white latex. L. piperatus has a smooth surface and very crowded gills; L. vellereus has a velvety surface and more spaced gills. Both require caution: very acrid when raw. Used pickled in Eastern Europe but require prior treatment.'),
  jsonb_build_object('with_species_id', 'esp-025',
    'diff',    'R. delica no produce látex (es Russula). L. vellereus produce látex blanco abundante al corte. Comprimir una lámina: si fluye líquido lechoso = Lactifluus/Lactarius. Esta diferencia es definitiva e inmediata.',
    'diff_ca', 'R. delica no produeix làtex (és Russula). L. vellereus produeix làtex blanc abundant al tall. Comprimir una làmina: si flueix líquid lletós = Lactifluus/Lactarius. Aquesta diferència és definitiva i immediata.',
    'diff_en', 'R. delica produces no latex (it is a Russula). L. vellereus produces abundant white latex when cut. Press a gill: if milky liquid flows = Lactifluus/Lactarius. This difference is definitive and immediate.')
)) WHERE scientific_name = 'Lactifluus vellereus';

-- =============================================================================
-- Verificación
-- =============================================================================
SELECT scientific_name,
       jsonb_array_length(extra_data->'confusions') AS n_confusions
FROM   species
WHERE  scientific_name IN (
  'Russula virescens', 'Russula cyanoxantha', 'Russula delica', 'Russula emetica',
  'Russula aurea', 'Russula vesca', 'Russula foetens', 'Russula nigricans',
  'Russula laurocerasi', 'Lactarius deliciosus', 'Lactarius sanguifluus',
  'Lactarius deterrimus', 'Lactifluus piperatus', 'Lactarius torminosus',
  'Lactarius volemus', 'Lactifluus vellereus'
)
ORDER  BY scientific_name;
