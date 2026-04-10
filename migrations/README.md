# Data Migrations

SQL scripts for **data changes** in Supabase (INSERT/UPDATE/DELETE on rows).

> **Not to be confused with** `backend/migrations/` — those are Alembic *schema* migrations (CREATE TABLE, ALTER COLUMN, etc.).

## How to run

Open Supabase dashboard → **SQL Editor** → paste the file content → **Run**.

Scripts are idempotent (`ON CONFLICT … DO UPDATE` or `WHERE id = …`), so it is safe to re-run them.

## Naming convention

```
NNN_short_description.sql
```

- `NNN` — zero-padded sequential number (001, 002, …)
- `short_description` — snake_case summary of what the script does

## History

> **Note on `015_*` files:** slot 015 was applied across multiple data-entry sessions, producing several variant files. Only `015_cond_fruct_sesion_b_2a.sql` (the last session) is the canonical final state. The others are kept for traceability but should not be re-run.

> **Audit files** (`audit_cond_fruct*.sql`) are read-only diagnostic queries. They do not modify data and are never "run" as migrations.

| File | Description | Status |
|------|-------------|--------|
| `001_esp202_chroogomphus_rutilus.sql` | Add Chroogomphus rutilus to species table | ✅ Run 2026-03-07 |
| `002_edibility_audit_and_commonnames.sql` | 16 species → no_comestible; Catalan common names corrected | ✅ Run 2026-03-07 |
| `003_edibility_no_comestible_round2.sql` | Further no_comestible corrections, round 2 | ✅ Run 2026-03-14 |
| `004_cond_fruct_boletaceae.sql` | Fruiting conditions for Boletaceae | ✅ Run 2026-03-14 |
| `005_cond_fruct_amanitaceae.sql` | Fruiting conditions for Amanitaceae | ✅ Run 2026-03-14 |
| `006_cond_fruct_russulaceae.sql` | Fruiting conditions for Russulaceae | ✅ Run 2026-03-14 |
| `007_cond_fruct_cantharellaceae.sql` | Fruiting conditions for Cantharellaceae | ✅ Run 2026-03-14 |
| `008_cond_fruct_morchellaceae.sql` | Fruiting conditions for Morchellaceae | ✅ Run 2026-03-14 |
| `009_cond_fruct_pleurotaceae.sql` | Fruiting conditions for Pleurotaceae | ✅ Run 2026-03-14 |
| `010_cond_fruct_agaricaceae.sql` | Fruiting conditions for Agaricaceae | ✅ Run 2026-03-14 |
| `011_cond_fruct_cortinariaceae.sql` | Fruiting conditions for Cortinariaceae | ✅ Run 2026-03-14 |
| `012_cond_fruct_polyporaceae.sql` | Fruiting conditions for Polyporaceae | ✅ Run 2026-03-14 |
| `013_cond_fruct_strophariaceae.sql` | Fruiting conditions for Strophariaceae | ✅ Run 2026-03-14 |
| `014_cond_fruct_tricholomataceae.sql` | Fruiting conditions for Tricholomataceae | ✅ Run 2026-03-14 |
| `015_cond_fruct_sesion_b*.sql` | Fruiting conditions batch B (multi-session, see note above) | ✅ Run 2026-03 |
| `016_cond_fruct_sesion_c_clean.sql` | Fruiting conditions batch C (clean final version) | ✅ Run 2026-03 |
| `017_cond_fruct_manual.sql` | Manual corrections to fruiting conditions | ✅ Run 2026-03 |
| `018_cond_fruct_sesion_d.sql` | Fruiting conditions batch D | ✅ Run 2026-03 |
| `019_descriptions_russulaceae.sql` | Species descriptions for Russulaceae | ✅ Run 2026-03 |
| `020_descriptions_amanitaceae.sql` | Species descriptions for Amanitaceae | ✅ Run 2026-03 |
| `021_descriptions_agaricaceae.sql` | Species descriptions for Agaricaceae | ✅ Run 2026-03 |
| `022_descriptions_tricholomataceae.sql` | Species descriptions for Tricholomataceae | ✅ Run 2026-03 |
| `023_descriptions_strophariaceae.sql` | Species descriptions for Strophariaceae | ✅ Run 2026-03 |
| `024_descriptions_polyporaceae.sql` | Species descriptions for Polyporaceae | ✅ Run 2026-03 |
| `025_descriptions_cortinariaceae.sql` | Species descriptions for Cortinariaceae | ✅ Run 2026-03 |
| `026_descriptions_hygrophoraceae.sql` | Species descriptions for Hygrophoraceae | ✅ Run 2026-03 |
| `027_descriptions_cantharellaceae.sql` | Species descriptions for Cantharellaceae | ✅ Run 2026-03 |
| `028_descriptions_lote4.sql` | Species descriptions batch 4 (mixed families) | ✅ Run 2026-03 |
| `029_descriptions_lote5.sql` | Species descriptions batch 5 (mixed families) | ✅ Run 2026-03 |
| `030_confusions_i18n_morchellaceae_boletaceae.sql` | i18n confusion texts for Morchellaceae + Boletaceae | ✅ Run 2026-03 |
| `031_confusions_i18n_amanitaceae.sql` | i18n confusion texts for Amanitaceae | ✅ Run 2026-03 |
| `032_confusions_i18n_cantharellaceae.sql` | i18n confusion texts for Cantharellaceae | ✅ Run 2026-03 |
| `033_confusions_i18n_russulaceae.sql` | i18n confusion texts for Russulaceae | ✅ Run 2026-03 |
| `034_confusions_i18n_cortinariaceae.sql` | i18n confusion texts for Cortinariaceae | ✅ Run 2026-03 |
| `035_confusions_i18n_agaricus.sql` | i18n confusion texts for Agaricus | ✅ Run 2026-03 |
| `036_confusions_i18n_neoboletus.sql` | i18n confusion texts for Neoboletus | ✅ Run 2026-03 |
| `037_confusions_i18n_amanita_gemmata.sql` | i18n confusion texts for Amanita gemmata | ✅ Run 2026-03 |
| `038_morphology_i18n.sql` | i18n morphology fields (cap, stem, flesh) for all species | ✅ Run 2026-03 |
| `audit_cond_fruct*.sql` | Read-only diagnostic queries — not migrations, do not run | 🔍 Audit only |

## Adding a new migration

1. Create `NNN_description.sql` with the next sequential number.
2. Add an entry to the history table above.
3. Run it in Supabase SQL Editor.
4. Update status to ✅ with the date.
