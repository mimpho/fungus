-- =============================================================================
-- 032_confusions_i18n_cantharellaceae.sql
-- Adds diff_ca / diff_en to all confusion entries from 007_confusions_cantharellaceae.sql
-- Full replacement of confusions array per species.
-- =============================================================================

-- esp-045  Cantharellus cibarius
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-074',
    'diff',    'Confusión clásica y peligrosa. Diferencias clave: Omphalotus tiene LAMINILLAS verdaderas (finas, apretadas, de borde afilado); Cantharellus tiene falsas laminillas (pliegues gruesos, ramificados, difíciles de separar con la uña). Omphalotus crece en matas sobre madera o raíces enterradas; Cantharellus en suelo. Omphalotus: causa gastroenteritis grave.',
    'diff_ca', 'Confusió clàssica i perillosa. Diferències clau: Omphalotus té LÀMINES verdaderes (fines, apretades, de vora afilada); Cantharellus té falses làmines (plecs gruixuts, ramificats, difícils de separar amb l''ungla). Omphalotus creix en grups sobre fusta o arrels enterrades; Cantharellus en terra. Omphalotus: causa gastroenteritis greu.',
    'diff_en', 'Classic and dangerous confusion. Key differences: Omphalotus has TRUE gills (thin, crowded, sharp-edged); Cantharellus has false gills (thick forked ridges, hard to separate with a fingernail). Omphalotus grows in clusters on wood or buried roots; Cantharellus on soil. Omphalotus: causes severe gastroenteritis.'),
  jsonb_build_object('with_species_id', 'esp-046',
    'diff',    'A. pallens (= Cantharellus pallens) es prácticamente la misma especie en la mayoría de estudios actuales: sombrero más pálido crema-amarillento. Ambas excelentes comestibles con idéntico aroma afrutado.',
    'diff_ca', 'C. pallens és pràcticament la mateixa espècie en la majoria d''estudis actuals: barret més pàl·lid crema-groguenc. Ambdues excel·lents comestibles amb idèntic aroma afruitat.',
    'diff_en', 'C. pallens is practically the same species in most current studies: paler cream-yellowish cap. Both excellent edibles with identical fruity aroma.')
)) WHERE scientific_name = 'Cantharellus cibarius';

-- esp-046  Cantharellus pallens
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-074',
    'diff',    'Omphalotus olearius tiene LAMINILLAS verdaderas finas y apretadas; C. pallens tiene pliegues gruesos y ramificados. Omphalotus crece en grupos sobre madera o raíces; C. pallens siempre en suelo. Omphalotus brilla débilmente en la oscuridad. Tóxica: gastroenteritis grave.',
    'diff_ca', 'Omphalotus olearius té LÀMINES verdaderes fines i apretades; C. pallens té plecs gruixuts i ramificats. Omphalotus creix en grups sobre fusta o arrels; C. pallens sempre en terra. Omphalotus brilla feblament en la foscor. Tòxica: gastroenteritis greu.',
    'diff_en', 'Omphalotus olearius has TRUE thin and crowded gills; C. pallens has thick forked ridges. Omphalotus grows in groups on wood or roots; C. pallens always on soil. Omphalotus glows faintly in the dark. Toxic: causes severe gastroenteritis.'),
  jsonb_build_object('with_species_id', 'esp-045',
    'diff',    'C. cibarius y C. pallens son muy similares y muchos autores las sinonomizan. C. pallens tiene sombrero más pálido (crema-blancuzco) y la talla es ligeramente mayor. Ambas excelentes comestibles.',
    'diff_ca', 'C. cibarius i C. pallens són molt similars i molts autors les sinonimizan. C. pallens té barret més pàl·lid (crema-blanquinós) i la mida és lleugerament major. Ambdues excel·lents comestibles.',
    'diff_en', 'C. cibarius and C. pallens are very similar and many authors synonymize them. C. pallens has a paler cap (cream-whitish) and is slightly larger. Both excellent edibles.')
)) WHERE scientific_name = 'Cantharellus pallens';

-- esp-047  Cantharellus aurora
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-074',
    'diff',    'C. aurora es amarillo-naranja y crece en suelo de bosques húmedos. Omphalotus olearius es más naranja-intenso, tiene laminillas verdaderas (no pliegues), crece en grupos sobre madera o raíces y puede brillar en la oscuridad. Tóxico. Mirar siempre el pie: Omphalotus tiene base excéntrica o sobre tocón.',
    'diff_ca', 'C. aurora és groc-taronja i creix en terra de boscos humits. Omphalotus olearius és més taronja-intens, té làmines verdaderes (no plecs), creix en grups sobre fusta o arrels i pot brillar en la foscor. Tòxic. Mirar sempre el peu: Omphalotus té base excèntrica o sobre soca.',
    'diff_en', 'C. aurora is yellow-orange and grows on soil in humid forests. Omphalotus olearius is more intensely orange, has true gills (not ridges), grows in groups on wood or roots, and can glow in the dark. Toxic. Always check the stem: Omphalotus has an eccentric base or grows on a stump.')
)) WHERE scientific_name = 'Cantharellus aurora';

-- esp-050  Craterellus tubaeformis
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-048',
    'diff',    'C. cornucopioides es más oscuro (marrón-gris a casi negro), sin pliegues evidentes en el exterior del sombrero, con el interior del embudo claramente hueco. C. tubaeformis es más amarillento-marrón con pliegues decurrentes grises en el pie. Ambos excelentes y de otoño tardío.',
    'diff_ca', 'C. cornucopioides és més fosc (marró-gris a gairebé negre), sense plecs evidents a l''exterior del barret, amb l''interior de l''embut clarament buit. C. tubaeformis és més groguenc-marró amb plecs decurrents grisos al peu. Ambdós excel·lents i de tardor tardana.',
    'diff_en', 'C. cornucopioides is darker (gray-brown to almost black), without evident ridges on the cap exterior, with the funnel interior clearly hollow. C. tubaeformis is more yellowish-brown with gray decurrent ridges on the stem. Both excellent and from late autumn.')
)) WHERE scientific_name = 'Craterellus tubaeformis';

-- esp-074  Omphalotus olearius (cross-familia)
UPDATE species SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('confusions', jsonb_build_array(
  jsonb_build_object('with_species_id', 'esp-045',
    'diff',    'C. cibarius tiene pliegues gruesos y ramificados (no laminillas), carne blanca-amarillenta con aroma afrutado y crece en suelo de bosque. Omphalotus tiene laminillas verdaderas apretadas, crece en matas sobre madera o raíces y puede brillar débilmente en la oscuridad. La confusión ocurre sobre todo en ejemplares viejos y mal iluminados.',
    'diff_ca', 'C. cibarius té plecs gruixuts i ramificats (no làmines), carn blanca-groguenca amb aroma afruitat i creix en terra de bosc. Omphalotus té làmines verdaderes apretades, creix en grups sobre fusta o arrels i pot brillar feblament en la foscor. La confusió ocorre sobretot en exemplars vells i mal il·luminats.',
    'diff_en', 'C. cibarius has thick forked ridges (not gills), white-yellowish flesh with fruity aroma, and grows on forest soil. Omphalotus has crowded true gills, grows in clusters on wood or roots, and can glow faintly in the dark. Confusion occurs mainly with old, poorly lit specimens.'),
  jsonb_build_object('with_species_id', 'esp-046',
    'diff',    'C. pallens es más pálido y tiene pliegues (no laminillas), aroma afrutado. Omphalotus olearius tiene laminillas verdaderas y crece en base de olivos, encinas u otras frondosas; nunca en suelo libre de raíces. Tóxico: causa gastroenteritis severa.',
    'diff_ca', 'C. pallens és més pàl·lid i té plecs (no làmines), aroma afruitat. Omphalotus olearius té làmines verdaderes i creix a la base d''oliveres, alzines o altres frondoses; mai en terra lliure d''arrels. Tòxic: causa gastroenteritis severa.',
    'diff_en', 'C. pallens is paler and has ridges (not gills), with a fruity aroma. Omphalotus olearius has true gills and grows at the base of olive trees, holm oaks, or other hardwoods; never on root-free soil. Toxic: causes severe gastroenteritis.')
)) WHERE scientific_name = 'Omphalotus olearius';

-- =============================================================================
-- Verificación
-- =============================================================================
SELECT scientific_name,
       jsonb_array_length(extra_data->'confusions') AS n_confusions
FROM   species
WHERE  scientific_name IN (
  'Cantharellus cibarius', 'Cantharellus pallens', 'Cantharellus aurora',
  'Craterellus tubaeformis', 'Omphalotus olearius'
)
ORDER  BY scientific_name;
