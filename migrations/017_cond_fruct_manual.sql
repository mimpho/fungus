-- 017_cond_fruct_manual.sql
-- Especies que no cubrieron las sesiones automáticas de Gemini
-- esp-086 Tuber melanosporum — ausente de sesión C
-- esp-188 Clathrus archeri   — eliminada de sesión C por comentario incorrecto
-- Generado: 2026-03-14

-- esp-086  Tuber melanosporum
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Temperaturas frescas entre 5–15°C durante la maduración, que se extiende de diciembre a marzo. Las heladas moderadas no le perjudican y pueden favorecer la maduración.",
  "cond_temp_ca": "Temperatures fresques entre 5–15°C durant la maduració, que s'\''estén de desembre a març. Les gelades moderades no li perjudiquen i poden afavorir la maduració.",
  "cond_temp_en": "Cool temperatures between 5–15°C during ripening, which extends from December to March. Moderate frosts are not harmful and may even aid maturation.",
  "cond_precip_es": "Necesita entre 20–60mm de lluvia acumulada en los 14 días previos. El ciclo de maduración es largo (60 días), por lo que requiere humedad del suelo sostenida a lo largo del otoño.",
  "cond_precip_ca": "Necessita entre 20–60mm de pluja acumulada en els 14 dies previs. El cicle de maduració és llarg (60 dies), de manera que requereix humitat del sòl sostinguda al llarg de la tardor.",
  "cond_precip_en": "Requires 20–60mm of accumulated rainfall in the previous 14 days. The ripening cycle is long (60 days), so it needs sustained soil moisture throughout autumn.",
  "cond_suelo_es": "Suelos calcáreos y bien drenados, con pH alcalino (7–8.5). Imprescindible la presencia de roca madre caliza y horizonte mineral poco profundo. No tolera suelos ácidos ni encharcamientos.",
  "cond_suelo_ca": "Sòls calcaris i ben drenats, amb pH alcalí (7–8.5). És imprescindible la presència de roca mare calcària i horitzó mineral poc profund. No tolera sòls àcids ni embassaments.",
  "cond_suelo_en": "Calcareous, well-drained soils with alkaline pH (7–8.5). Limestone bedrock and a shallow mineral horizon are essential. Does not tolerate acidic soils or waterlogging.",
  "cond_req_es": "Hipogeo ectomicorrizógeno estricto con encinas y robles. Requiere árboles huésped adultos de al menos 5–7 años. La trufa negra no puede cultivarse sin plantación específica de árboles micorrizados.",
  "cond_req_ca": "Hipogeu ectomicorrizogen estricte amb alzines i roures. Requereix arbres hostes adults d'\''almenys 5–7 anys. La tòfona negra no es pot cultivar sense plantació específica d'\''arbres micorrizats.",
  "cond_req_en": "Strict hypogeous ectomycorrhizal fungus with holm oaks and oaks. Requires mature host trees of at least 5–7 years. Cannot be cultivated without specifically mycorrhized tree plantations."
}'::jsonb
WHERE id = 'esp-086';

-- esp-188  Clathrus archeri
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Temperaturas cálidas entre 12–24°C. Especie de origen austral que fructifica en primavera y verano, con ciclo de desarrollo muy rápido (5 días desde el huevo).",
  "cond_temp_ca": "Temperatures càlides entre 12–24°C. Espècie d'\''origen austral que fructifica a la primavera i l'\''estiu, amb cicle de desenvolupament molt ràpid (5 dies des de l'\''ou).",
  "cond_temp_en": "Warm temperatures between 12–24°C. An Australasian species that fruits in spring and summer, with a very rapid development cycle (5 days from the egg stage).",
  "cond_precip_es": "Requiere suelo húmedo con al menos 20–40mm acumulados en los 14 días previos. Su crecimiento explosivo en días cálidos tras lluvia la hace muy impredecible.",
  "cond_precip_ca": "Requereix sòl humit amb almenys 20–40mm acumulats en els 14 dies previs. El seu creixement explosiu en dies càlids després de pluja la fa molt imprevisible.",
  "cond_precip_en": "Requires moist soil with at least 20–40mm accumulated in the previous 14 days. Its explosive growth on warm days after rain makes it very unpredictable.",
  "cond_suelo_es": "Suelos variados (pH 5.5–7.5), desde jardines y prados hasta bordes de bosque. Saprófita, crece sobre materia orgánica en descomposición, frecuente en suelos nitrogenados.",
  "cond_suelo_ca": "Sòls variats (pH 5.5–7.5), des de jardins i prats fins a vores de bosc. Sapròfita, creix sobre matèria orgànica en descomposició, freqüent en sòls nitrogenats.",
  "cond_suelo_en": "Varied soils (pH 5.5–7.5), from gardens and meadows to woodland edges. Saprotrophic, grows on decomposing organic matter, frequent in nitrogen-rich soils.",
  "cond_req_es": "Especie invasora de origen australiano, cada vez más frecuente en Europa. No requiere árbol huésped. Su olor fétido atrae a insectos que dispersan las esporas. No comestible.",
  "cond_req_ca": "Espècie invasora d'\''origen australià, cada vegada més freqüent a Europa. No requereix arbre hoste. La seva olor fètida atrau insectes que dispersen les espores. No comestible.",
  "cond_req_en": "Invasive species of Australian origin, increasingly common in Europe. No host tree required. Its fetid odour attracts insects that disperse the spores. Not edible."
}'::jsonb
WHERE id = 'esp-188';

-- Verificar
SELECT id, scientific_name, family,
  left(extra_data->>'cond_temp_es', 60) AS cond_temp_preview
FROM species
WHERE id IN ('esp-086', 'esp-188');
