# Fungus — Utility Scripts Guide

Reference for all utility and operational scripts in the project.

---

## Overview

| Script | Location | Purpose | When to run |
|---|---|---|---|
| `seed_catalog.py` | `backend/scripts/` | Import mock data (zones + species) into PostgreSQL | First deploy, or when mock data changes |
| `backfill.py` | `backend/scripts/` | Load historical climate data from Open-Meteo | Once after first deploy |
| `download_images.py` | `standalone/latest/` | Bulk-download species images from iNaturalist | When adding new species |
| `extract-images.py` | `standalone/latest/` | *(Legacy)* Extract base64 images from old HTML monolith | Not needed — standalone era only |

---

## `seed_catalog.py` — Seed zones and species into PostgreSQL

**Location**: `backend/scripts/seed_catalog.py`

Seeds the `zones` and `species` tables from the frontend mock data files (`src/data/zones.js`, `src/data/species.js`). Uses Node.js to evaluate the ESM files and export them to JSON, then upserts rows via SQLAlchemy.

Requires: Node.js ≥ 18, `DATABASE_URL` env var pointing to the Supabase instance.

**When to use**: first deployment, or any time a species/zone is added to the mock and you need to sync it to the backend.

```bash
cd backend

# Seed from default path (../src/data)
python -m scripts.seed_catalog

# Explicit mock-data directory
python -m scripts.seed_catalog --mock-dir ../frontend/src/data

# Dry run — print what would be inserted without writing
python -m scripts.seed_catalog --dry-run
```

> After running, verify with `GET /api/v1/zones` and `GET /api/v1/species` that the new records appear.

---

## `backfill.py` — Populate climate history from Open-Meteo

**Location**: `backend/scripts/backfill.py`

Fetches historical daily weather data from Open-Meteo for all active zones (or a subset) and upserts rows into `climate_history`. Intended to run **once** on first deployment to give the OI scoring algorithm historical context. The daily cron job (`APScheduler`, 05:00 UTC) takes over after that.

Requires: `DATABASE_URL` env var.

```bash
cd backend

# Full 2-year backfill for all zones
python -m scripts.backfill --from 2024-01-01 --to 2026-02-28

# Backfill specific zones only
python -m scripts.backfill --from 2024-01-01 --to 2026-02-28 --zones zone-001,zone-002

# Shorter period for testing
python -m scripts.backfill --from 2026-01-01 --to 2026-02-28
```

**Arguments**:

| Flag | Required | Description |
|---|---|---|
| `--from` | ✅ | Start date `YYYY-MM-DD` |
| `--to` | ✅ | End date `YYYY-MM-DD` |
| `--zones` | ❌ | Comma-separated zone IDs (default: all active zones) |

> The upsert uses an upgrade rule: Open-Meteo (P3) will not overwrite a higher-priority source (P1/P2). Safe to re-run.

---

## `download_images.py` — Bulk-download species images from iNaturalist

**Location**: `standalone/latest/download_images.py`

Reads a species list from `species_list.json` and downloads images from the iNaturalist API for each species. Saves two sizes per photo — `medium` (~600 px, for cards) and `large` (~1200 px, for lightbox) — and optionally re-encodes them as optimized JPEGs via Pillow.

Requires: `pip install requests Pillow`

```bash
cd standalone/latest

# Download 3 photos per species (medium + large each → 6 files per species)
python3 download_images.py

# Download only 1 photo per species
python3 download_images.py --photos 1

# Force re-download even if files exist
python3 download_images.py --force

# Process only the first 10 species (useful for testing)
python3 download_images.py --limit 10

# Skip JPEG re-encoding (save as-is from iNaturalist)
python3 download_images.py --no-optimize

# Retry only species that failed in the previous run
python3 download_images.py --retry-failed
```

**Arguments**:

| Flag | Default | Description |
|---|---|---|
| `--photos N` | 3 | Photos per species (downloads N×2 files: medium + large each) |
| `--force` | false | Re-download even if files already exist on disk |
| `--limit N` | 0 (all) | Stop after first N species |
| `--no-optimize` | false | Skip JPEG re-encoding |
| `--retry-failed` | false | Read `download_not_found.txt` and retry only those species |

**Output files**: `standalone/latest/assets/images/esp-XXX-main.jpg`, `esp-XXX-main-large.jpg`, `esp-XXX-foto1.jpg`, etc.

**species_list.json format** (input file the script expects):
```json
[
  { "id": "esp-001", "name": "Boletus edulis" },
  { "id": "esp-002", "name": "Lactarius deliciosus" }
]
```

### ⚠️ Path notes for the current Vite project

This script was written during the standalone era. Two things to keep in mind when using it for the current Vite project:

1. **Output path**: the script writes to `standalone/latest/assets/images/`. After running, copy the resulting files to `frontend/public/assets/images/content/species/`.

2. **species_list.json**: must be created manually or generated from `src/data/species.js`. A quick one-liner to generate it from the current mock:
   ```bash
   node -e "
   import('./frontend/src/data/species.js').then(m =>
     console.log(JSON.stringify(
       m.mockSpecies.map(s => ({ id: s.id, name: s.scientificName })),
       null, 2
     ))
   )" > standalone/latest/species_list.json
   ```

### Image discovery strategy

The script tries three strategies in order to find photos for each species:

1. **Taxon photos** — the curated photos displayed on the iNaturalist taxon page (highest quality)
2. **Popular observations** — Research Grade observations ordered by community favorites (`order_by=faves`)
3. Falls back to a fuzzy genus-name search if both fail

Species that cannot be found on iNaturalist are logged to `download_not_found.txt`. Re-run with `--retry-failed` after checking the names against GBIF or Index Fungorum.

---

## `extract-images.py` — *(Legacy)* Extract base64 images from HTML monolith

**Location**: `standalone/latest/extract-images.py`

**Status**: ⚠️ Legacy — only relevant for the pre-Vite standalone HTML era.

Parses `micomapa-latest.html` and extracts base64-encoded images into individual `.jpg` files. Used during the migration from the monolithic HTML to the Vite app. Not needed in the current workflow.

---

## Adding a script

When a new utility script is created:

1. Place production scripts (DB operations, ingest, migrations) in `backend/scripts/`.
2. Place content/asset scripts (image processing, data extraction) in `scripts/` at the project root. Create the folder if it doesn't exist.
3. Add a section to this file following the same format: location, purpose, usage examples, arguments table, notes.
