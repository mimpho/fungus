# Secrets and Environment Variables

Reference for every environment variable the backend reads, organised by
obligation and destination.

---

## Variable catalogue

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | **Yes** | `postgresql+asyncpg://postgres:postgres@localhost:5432/fungus` | Async PostgreSQL connection string |
| `JWT_SECRET_KEY` | **Yes** (prod) | `dev-jwt-secret-change-in-production` | Signs the session tokens. Anything works locally; with `ENVIRONMENT=production` the API refuses to start if it is missing, is the default or is shorter than 32 characters |
| `SECRET_KEY` | No | `dev-secret-key-change-in-production` | Legacy, not used by the code. Nothing to set |
| `ENVIRONMENT` | No | `development` | `development` enables SQL echo and relaxed CORS. Set to `production` on Render |
| `LOG_LEVEL` | No | `INFO` | Python log level: `DEBUG`, `INFO`, `WARNING`, `ERROR` |
| `CORS_ORIGINS` | No | `http://localhost:5173` | Comma-separated allowed origins. Add Vercel URL in production |
| `INGEST_CRON_HOUR` | No | `0` | UTC hour of the daily ingest and of the cell refresh (00:05 UTC: right after Open-Meteo's daily quota resets; Render's shared IP spends it by ~05:45) |
| `INGEST_CRON_MINUTE` | No | `5` | Minute of the daily ingest |
| `CELL_REFRESH_CRON_MINUTE` | No | `40` | Minute of the daily cell refresh (after the 00:30 weather refresh) |
| `INGEST_MAX_CONCURRENCY` | No | `6` | Parallel Open-Meteo requests during ingest |
| `SUPABASE_URL` | Prod | *(empty)* | Supabase project URL, for Storage (corner photos, rasters). Empty with the key = photos off |
| `SUPABASE_SERVICE_KEY` | Prod | *(empty)* | Secret/service key of that project. Back end only: never in the front end or in git |
| `RASTERS_BUCKET` | Prod | *(empty = off)* | Private bucket with `forest/` and `substrate/` rasters, downloaded at start-up into a temp folder. Empty: `FOREST_RASTER_DIR` / `SUBSTRATE_RASTER_DIR` are read as they are (`local-data/` locally). `/health` shows `rasters` |
| `RASTERS_REQUIRED` | No | `false` | `true` = refuse to start if the rasters cannot be downloaded (default: start without them, log an ERROR and retry every 5 minutes) |
| `RASTERS_CACHE_DIR` | No | *(system temp dir)/fungus-rasters* | Where the rasters are downloaded |
| `METEOCAT_API_KEY` | No | *(empty)* | P1 provider for Catalan zones. App falls back to Open-Meteo if absent |
| `AEMET_API_KEY` | No | *(empty)* | P2 provider for national zones. App falls back to Open-Meteo if absent |

**Frontend variables** (set in `.env.local` at the repo root locally and in Vercel in production; they end up in the public bundle, so never a secret):

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_BASE` | No | `https://fungus-api.onrender.com/api/v1` | Base URL of the API (read in `services/apiService.js`). Locally: `http://localhost:8000/api/v1` |
| `VITE_GOOGLE_CLIENT_ID` | For Google sign-in | *(empty)* | The same client ID as `GOOGLE_CLIENT_ID` in Render |
| `VITE_CARTO_KEY` | Yes | *(not set → map shows "API KEY REQUIRED")* | CARTO basemap key (required since 2026-09-25). Two keys: production key restricted to the production domain (Vercel env var), development key restricted to `localhost` (local `.env`). Free up to 5M requests/month non-commercial, 1M commercial — request a commercial key when premium launches. [carto.com/basemaps/apikey](https://carto.com/basemaps/apikey/) |

---

## By environment

### Local development

Copy `.env.example` to `.env` in `backend/`. The defaults work out of the box
with the Docker Compose database:

```
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/fungus
JWT_SECRET_KEY=dev-jwt-secret-change-in-production   # fine for local
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:5173
```

P1/P2 keys are **not needed** — the app works entirely on Open-Meteo without them.

### Render (production API)

Set these in the Render dashboard → Service → Environment:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Supabase connection string (Transaction mode, port 5432) |
| `JWT_SECRET_KEY` | `openssl rand -hex 32` — generate once, store securely. Without it the API does not start |
| `ENVIRONMENT` | `production` |
| `CORS_ORIGINS` | `https://fungus-ashen.vercel.app` (plus the own domain, if there is one; Vercel previews are covered by `allow_origin_regex`) |
| `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` | The production Supabase project's URL and secret key (Storage) |
| `RASTERS_BUCKET` | `geo-rasters` — the private bucket with the forest and soil rasters |
| `CORNER_PHOTOS_BUCKET` | `corner-photos` — private bucket of the production project for the corner photos (it must exist before the first upload) |
| `FRONTEND_URL` | `https://fungus-ashen.vercel.app` — builds the verification link of the emails (the default is `localhost`) |
| `GOOGLE_CLIENT_ID` | The same ID as `VITE_GOOGLE_CLIENT_ID` in Vercel |
| `RESEND_API_KEY`, `EMAIL_FROM` | Resend key and an address of a domain verified in Resend (the default sender only works for tests) |
| `ALERT_EMAIL` | Optional: where the stale-zone alert of the daily ingest is sent |
| `STALE_ZONE_DAYS` | `3` (the code default is `2`, which leaves no margin with the normal archive lag) |
| `OBSERVATORY_CELL_REFRESH_BUDGET` | Default `1500` weighted Open-Meteo calls a day for the daily refresh of the cells; it shares the 10,000 a day with the ingest and the weather cache |
| `METEOCAT_API_KEY` | When available |
| `AEMET_API_KEY` | When available |

`INGEST_CRON_HOUR`, `INGEST_CRON_MINUTE`, `CELL_REFRESH_CRON_MINUTE`, `INGEST_MAX_CONCURRENCY`, `LOG_LEVEL` use their defaults
and do not need to be set explicitly.

Render injects env vars at runtime — no `.env` file is deployed. The
`backend/.env` file is gitignored and never leaves the local machine.

### Vercel (frontend)

| Variable | Value |
|---|---|
| `VITE_CARTO_KEY` | The production CARTO key, restricted to the production domain |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID (the same as `GOOGLE_CLIENT_ID` in Render) |
| `VITE_API_BASE` | Optional; `https://fungus-api.onrender.com/api/v1` is already the default |

`VITE_*` variables are compiled into the bundle at build time: a change needs a new deployment, and none of them can hold a secret. Do not set `VITE_GEMINI_API_KEY` in Vercel (see Hardening in `pending.md`).

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
- **Rotate `JWT_SECRET_KEY` immediately** if it is ever accidentally exposed. All sessions become invalid when it changes: everybody has to log in again.
- **P1/P2 keys are optional forever** — the system is fully functional on Open-Meteo alone. Add them when available without any code changes.
- **Supabase connection string** — use Transaction mode (port 5432), not Session mode, to be compatible with the async connection pool.
