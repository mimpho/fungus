# Secrets and Environment Variables

Reference for every environment variable the backend reads, organised by
obligation and destination.

---

## Variable catalogue

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | **Yes** | `postgresql+asyncpg://postgres:postgres@localhost:5432/fungus` | Async PostgreSQL connection string |
| `SECRET_KEY` | **Yes** (prod) | `dev-secret-key-change-in-production` | Signs JWT tokens (Phase 3+). Any non-empty string works locally |
| `ENVIRONMENT` | No | `development` | `development` enables SQL echo and relaxed CORS. Set to `production` on Render |
| `LOG_LEVEL` | No | `INFO` | Python log level: `DEBUG`, `INFO`, `WARNING`, `ERROR` |
| `CORS_ORIGINS` | No | `http://localhost:5173` | Comma-separated allowed origins. Add Vercel URL in production |
| `INGEST_CRON_HOUR` | No | `5` | UTC hour for the daily ingest cron (05:00 UTC = 07:00 Madrid) |
| `INGEST_MAX_CONCURRENCY` | No | `6` | Parallel Open-Meteo requests during ingest |
| `METEOCAT_API_KEY` | No | *(empty)* | P1 provider for Catalan zones. App falls back to Open-Meteo if absent |
| `AEMET_API_KEY` | No | *(empty)* | P2 provider for national zones. App falls back to Open-Meteo if absent |

**Frontend variable** (set in `frontend/.env.local`, not in the backend):

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | No (v4.1) | *(not set)* | Base URL of the backend API. Will be wired up at end of v4.1 phase |

---

## By environment

### Local development

Copy `.env.example` to `.env` in `backend/`. The defaults work out of the box
with the Docker Compose database:

```
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/fungus
SECRET_KEY=dev-secret-key-change-in-production   # fine for local
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:5173
```

P1/P2 keys are **not needed** — the app works entirely on Open-Meteo without them.

### Render (production API)

Set these in the Render dashboard → Service → Environment:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Supabase connection string (Transaction mode, port 5432) |
| `SECRET_KEY` | `openssl rand -hex 32` — generate once, store securely |
| `ENVIRONMENT` | `production` |
| `CORS_ORIGINS` | `https://fungus-git-feat-vite-migration-mimphos-projects.vercel.app,https://fungus.vercel.app` |
| `METEOCAT_API_KEY` | When available |
| `AEMET_API_KEY` | When available |

`INGEST_CRON_HOUR`, `INGEST_MAX_CONCURRENCY`, `LOG_LEVEL` use their defaults
and do not need to be set explicitly.

Render injects env vars at runtime — no `.env` file is deployed. The
`backend/.env` file is gitignored and never leaves the local machine.

### GitHub Actions (CI)

The test suite does not need real API keys — tests mock all external HTTP.
The only secret CI needs is the database connection for integration tests:

| Secret name (GitHub) | Used for |
|---|---|
| `TEST_DATABASE_URL` | Integration tests against a real PostgreSQL + PostGIS container |

Set in: GitHub repo → Settings → Secrets and variables → Actions → New repository secret.

The unit tests (`tests/unit/`) run with no secrets at all — just `PYTHONPATH=.`.

---

## How secrets flow

```
Local machine
  backend/.env          ← git-ignored, never committed
       │
       ▼
  pydantic-settings     ← reads .env + env vars, exposes Settings singleton
       │
       ▼
  FastAPI app           ← uses settings.database_url, settings.secret_key, etc.


Render (production)
  Dashboard env vars    ← set manually, injected at container start
       │
       ▼
  pydantic-settings     ← same code path, no .env file present
       │
       ▼
  FastAPI app


GitHub Actions (CI)
  Repository secrets    ← TEST_DATABASE_URL injected as env var in workflow
       │
       ▼
  pytest                ← integration tests pick up DATABASE_URL from env
```

---

## Rules

- **Never commit `.env`** — it is in `.gitignore`. Committing it exposes credentials in the git history permanently.
- **Never hardcode secrets** in source code — always read from `settings.*`.
- **Rotate `SECRET_KEY` immediately** if it is ever accidentally exposed. All existing JWT tokens become invalid when it changes (acceptable in Phase 3).
- **P1/P2 keys are optional forever** — the system is fully functional on Open-Meteo alone. Add them when available without any code changes.
- **Supabase connection string** — use Transaction mode (port 5432), not Session mode, to be compatible with the async connection pool.
