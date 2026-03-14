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

| File | Description | Status |
|------|-------------|--------|
| `001_esp202_chroogomphus_rutilus.sql` | Add Chroogomphus rutilus to species table | ✅ Run 2026-03-07 |
| `002_edibility_audit_and_commonnames.sql` | 16 species → no_comestible; Catalan commonNames corrected | ✅ Run 2026-03-07 |
| `003_edibility_no_comestible_round_2.sql` | 16 species → no_comestible; Catalan commonNames corrected | ✅ Run 2026-03-14 |
| `004_cond_fruct_bolitaceae.sql` | Add fruiting conditions for Bolitaceae species | ✅ Run 2026-03-14 |
| `005_cond_fruct_amanitaceae.sql` | Add fruiting conditions for Amanita species | ✅ Run 2026-03-14 |

## Adding a new migration

1. Create `NNN_description.sql` with the next sequential number.
2. Add an entry to the history table above.
3. Run it in Supabase SQL Editor.
4. Update status to ✅ with the date.
