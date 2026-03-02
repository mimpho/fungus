# Local Development Setup

This guide covers getting the backend running locally from scratch.

**Prerequisites:** Docker, Python 3.12+, and `pip` or `uv`.

---

## 1. Start the database

```bash
cd backend
docker compose up -d
```

This starts PostgreSQL 16 + PostGIS 3.4 on `localhost:5432`. Data persists in a named Docker volume (`fungus_pgdata`) across restarts.

Verify it's healthy:

```bash
docker compose ps
# fungus-db   running (healthy)
```

To stop without losing data: `docker compose down`
To wipe and start fresh: `docker compose down -v`

---

## 2. Install Python dependencies

```bash
cd backend
pip install -e ".[dev]"
```

---

## 3. Configure environment variables

Copy the example and adjust if needed (defaults work for local docker setup):

```bash
cp .env.example .env
```

The default `DATABASE_URL` in `.env.example` points to the local Docker container — no changes needed for local dev.

---

## 4. Run migrations

```bash
cd backend
alembic upgrade head
```

This creates all tables and enables the PostGIS extension. On a fresh DB it runs migration `001_initial_schema`.

To check the current state:

```bash
alembic current
```

---

## 5. Start the API

```bash
uvicorn app.main:app --reload --port 8000
```

The API is now available at `http://localhost:8000`. Verify with:

```bash
curl http://localhost:8000/api/v1/health
```

Expected response (no zones yet, DB empty):

```json
{
  "status": "ok",
  "version": "4.1.0",
  "environment": "development",
  "last_ingest": null,
  "active_zones": 0,
  "providers": {"open-meteo": true, "aemet": false, "meteocat": false},
  "db_reachable": true
}
```

---

## 6. Seed the catalog

> **Note:** The seed script (`scripts/seed_catalog.py`) is planned for Phase 2 (v4.2). Until then, zones and species live in the frontend mock data (`frontend/src/data/`).

---

## 7. Run a test backfill

Once zones are in the DB (after the Phase 2 seed), load historical climate data:

```bash
# Backfill a single zone for the last 30 days (quick smoke test)
cd backend
python -m scripts.backfill --from 2026-01-31 --to 2026-03-01 --zones zone-001

# Full backfill — all 28 zones, last 2 years (takes a few minutes)
python -m scripts.backfill --from 2024-01-01 --to 2026-03-01
```

After the backfill, hit `/api/v1/zones` — zones will now include OI scores.

---

## 8. Connect the frontend

Add a `.env.local` in the `frontend/` directory:

```bash
# frontend/.env.local
VITE_API_URL=http://localhost:8000
```

> **Note:** The frontend still uses `weatherService.js` calling Open-Meteo directly in v4.1. The `VITE_API_URL` switch is prepared but not yet wired up — that happens at the end of the v4.1 phase.

---

## Useful commands

```bash
# Tail API logs
uvicorn app.main:app --reload --log-level debug

# Connect to DB directly
docker exec -it fungus-db psql -U postgres -d fungus

# Reset DB (drop all tables and re-migrate)
docker compose down -v && docker compose up -d
alembic upgrade head

# Run tests
cd backend
pytest

# Lint
ruff check app/
```
