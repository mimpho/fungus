-- audit_cond_fruct_BC.sql
-- Auditoría sesiones B y C (pendientes de migrar)
-- Usar ANTES de ejecutar las migraciones para validar IDs de Gemini
-- Generado: 2026-03-14

-- ============================================================
-- SESIÓN B — referencia de IDs esperados
-- ============================================================
--   esp-174  Sarcodon imbricatus                      Bankeraceae
--   esp-175  Sarcodon scabrosus                       Bankeraceae
--   esp-176  Hydnellum peckii                         Bankeraceae
--   esp-177  Phellodon niger                          Bankeraceae
--   esp-178  Bankera fuligineoalba                    Bankeraceae
--   esp-105  Entoloma sinuatum                        Entolomataceae
--   esp-106  Entoloma rhodopolium                     Entolomataceae
--   esp-107  Entoloma clypeatum                       Entolomataceae
--   esp-108  Clitopilus prunulus                      Entolomataceae
--   esp-110  Entoloma lividoalbum                     Entolomataceae
--   esp-140  Hygrophorus marzuolus                    Hygrophoraceae
--   esp-141  Hygrophorus hypothejus                   Hygrophoraceae
--   esp-142  Hygrophorus agathosmus                   Hygrophoraceae
--   esp-143  Hygrophorus pustulatus                   Hygrophoraceae
--   esp-144  Hygrocybe punicea                        Hygrophoraceae
--   esp-145  Hygrocybe pratensis                      Hygrophoraceae
--   esp-146  Hygrocybe psittacina                     Hygrophoraceae
--   esp-147  Cuphophyllus virgineus                   Hygrophoraceae
--   esp-120  Hebeloma crustuliniforme                 Hymenogastraceae
--   esp-121  Hebeloma sinapizans                      Hymenogastraceae
--   esp-122  Galerina marginata                       Hymenogastraceae
--   esp-123  Gymnopilus junonius                      Hymenogastraceae
--   esp-155  Psilocybe semilanceata                   Hymenogastraceae
--   esp-103  Flammulina velutipes                     Physalacriaceae
--   esp-104  Armillaria mellea                        Physalacriaceae
--   esp-109  Rhodotus palmatus                        Physalacriaceae
--   esp-194  Oudemansiella mucida                     Physalacriaceae
--   esp-195  Oudemansiella radicata                   Physalacriaceae
--   esp-196  Strobilurus esculentus                   Physalacriaceae
--   esp-166  Coprinus comatus                         Psathyrellaceae
--   esp-167  Coprinellus micaceus                     Psathyrellaceae
--   esp-168  Coprinopsis atramentaria                 Psathyrellaceae
--   esp-169  Psathyrella candolleana                  Psathyrellaceae
--   esp-170  Panaeolus papilionaceus                  Psathyrellaceae
--   esp-171  Lacrymaria lacrymabunda                  Psathyrellaceae
-- Total sesión B: 35 especies

SELECT
  id,
  scientific_name,
  family,
  extra_data ? 'cond_temp_es'           AS tiene_cond,
  left(extra_data->>'cond_temp_es', 70) AS preview_es
FROM species
WHERE id IN (
    'esp-174',
    'esp-175',
    'esp-176',
    'esp-177',
    'esp-178',
    'esp-105',
    'esp-106',
    'esp-107',
    'esp-108',
    'esp-110',
    'esp-140',
    'esp-141',
    'esp-142',
    'esp-143',
    'esp-144',
    'esp-145',
    'esp-146',
    'esp-147',
    'esp-120',
    'esp-121',
    'esp-122',
    'esp-123',
    'esp-155',
    'esp-103',
    'esp-104',
    'esp-109',
    'esp-194',
    'esp-195',
    'esp-196',
    'esp-166',
    'esp-167',
    'esp-168',
    'esp-169',
    'esp-170',
    'esp-171'
)
ORDER BY family, id;

-- ============================================================
-- SESIÓN C — referencia de IDs esperados
-- ============================================================
--   esp-198  Auricularia auricula-judae               Auriculariaceae
--   esp-179  Auriscalpium vulgare                     Auriscalpiaceae
--   esp-082  Gyromitra esculenta                      Discinaceae
--   esp-138  Fistulina hepatica                       Fistulinaceae
--   esp-126  Ganoderma lucidum                        Ganodermataceae
--   esp-127  Ganoderma applanatum                     Ganodermataceae
--   esp-053  Gomphus clavatus                         Gomphaceae
--   esp-202  Chroogomphus rutilus                     Gomphidiaceae
--   esp-083  Helvella lacunosa                        Helvellaceae
--   esp-084  Helvella crispa                          Helvellaceae
--   esp-085  Helvella acetabulum                      Helvellaceae
--   esp-172  Hericium erinaceus                       Hericiaceae
--   esp-173  Hericium coralloides                     Hericiaceae
--   esp-051  Hydnum repandum                          Hydnaceae
--   esp-052  Hydnum rufescens                         Hydnaceae
--   esp-118  Inocybe rimosa                           Inocybaceae
--   esp-119  Inocybe erubescens                       Inocybaceae
--   esp-095  Calocybe gambosa                         Lyophyllaceae
--   esp-096  Lyophyllum decastes                      Lyophyllaceae
--   esp-190  Marasmius oreades                        Marasmiaceae
--   esp-191  Marasmius rotula                         Marasmiaceae
--   esp-132  Meripilus giganteus                      Meripilaceae
--   esp-133  Grifola frondosa                         Meripilaceae
--   esp-139  Phlebia radiata                          Meruliaceae
--   esp-192  Mycena galericulata                      Mycenaceae
--   esp-193  Mycena haematopus                        Mycenaceae
--   esp-197  Mycena chlorophos                        Mycenaceae
--   esp-074  Omphalotus olearius                      Omphalotaceae
--   esp-075  Lentinula edodes                         Omphalotaceae
--   esp-089  Peziza vesiculosa                        Pezizaceae
--   esp-185  Phallus impudicus                        Phallaceae
--   esp-186  Phallus hadriani                         Phallaceae
--   esp-187  Clathrus ruber                           Phallaceae
--   esp-188  Clathrus archeri                         Phallaceae
--   esp-189  Mutinus caninus                          Phallaceae
--   esp-183  Scleroderma citrinum                     Sclerodermataceae
--   esp-134  Sparassis crispa                         Sparassidaceae
--   esp-020  Paxillus involutus                       Tapinellaceae
--   esp-022  Tapinella atrotomentosa                  Tapinellaceae
--   esp-086  Tuber melanosporum                       Tuberaceae
--   esp-087  Tuber aestivum                           Tuberaceae
--   esp-088  Tuber borchii                            Tuberaceae
--   esp-200  Xylaria hypoxylon                        Xylariaceae
-- Total sesión C: 43 especies

SELECT
  id,
  scientific_name,
  family,
  extra_data ? 'cond_temp_es'           AS tiene_cond,
  left(extra_data->>'cond_temp_es', 70) AS preview_es
FROM species
WHERE id IN (
    'esp-198',
    'esp-179',
    'esp-082',
    'esp-138',
    'esp-126',
    'esp-127',
    'esp-053',
    'esp-202',
    'esp-083',
    'esp-084',
    'esp-085',
    'esp-172',
    'esp-173',
    'esp-051',
    'esp-052',
    'esp-118',
    'esp-119',
    'esp-095',
    'esp-096',
    'esp-190',
    'esp-191',
    'esp-132',
    'esp-133',
    'esp-139',
    'esp-192',
    'esp-193',
    'esp-197',
    'esp-074',
    'esp-075',
    'esp-089',
    'esp-185',
    'esp-186',
    'esp-187',
    'esp-188',
    'esp-189',
    'esp-183',
    'esp-134',
    'esp-020',
    'esp-022',
    'esp-086',
    'esp-087',
    'esp-088',
    'esp-200'
)
ORDER BY family, id;

-- ============================================================
-- CONTAMINACIÓN: detectar si alguna especie de B/C ya tiene
-- cond_fruct aplicado (por ID alucinado de sesiones previas)
-- Resultado esperado: 0 filas
-- ============================================================

SELECT id, scientific_name, family,
  left(extra_data->>'cond_temp_es', 80) AS cond_temp_preview
FROM species
WHERE
  extra_data ? 'cond_temp_es'
  AND family IN (
    'Auriculariaceae',
    'Auriscalpiaceae',
    'Bankeraceae',
    'Discinaceae',
    'Entolomataceae',
    'Fistulinaceae',
    'Ganodermataceae',
    'Gomphaceae',
    'Gomphidiaceae',
    'Helvellaceae',
    'Hericiaceae',
    'Hydnaceae',
    'Hygrophoraceae',
    'Hymenogastraceae',
    'Inocybaceae',
    'Lyophyllaceae',
    'Marasmiaceae',
    'Meripilaceae',
    'Meruliaceae',
    'Mycenaceae',
    'Omphalotaceae',
    'Pezizaceae',
    'Phallaceae',
    'Physalacriaceae',
    'Psathyrellaceae',
    'Sclerodermataceae',
    'Sparassidaceae',
    'Tapinellaceae',
    'Tuberaceae',
    'Xylariaceae'
  )
ORDER BY family, id;

