# First Deploy: Supabase + Render

Step-by-step checklist for the first production deployment of the backend API.
Run through this once when v4.1 is ready to go live. After that, deploys are
automatic on every push to `main`.

**Prerequisites:** `main` branch has the v4.1 epic merged and tagged.

---

## 1. Supabase — create the database

1. Go to [supabase.com](https://supabase.com) → New project
2. Name: `fungus` — Region: `EU Central (Frankfurt)` — Password: generate a strong one and save it
3. Wait for the project to provision (~2 min)
4. Enable PostGIS: **Database → Extensions → search "postgis" → Enable**
5. Get the connection string: **Connect** (top of dashboard) → **Connection String** tab → Method: **Session Pooler**
   - The URL looks like: `postgresql://postgres.xxxx:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`
   - Replace `[YOUR-PASSWORD]` with your project password
   - Replace `postgresql://` with `postgresql+asyncpg://`
   - **Copy this URL — you will need it in step 2 (migrations) and step 3 (Render env vars)**

---

## 2. Run migrations against Supabase

From your local machine (requires Python 3.12 — `brew install python@3.12` if needed):

```bash
cd backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install --upgrade setuptools
pip install -e ".[dev]"
DATABASE_URL="postgresql+asyncpg://postgres.xxxx:<password>@aws-0-eu-central-1.pooler.supabase.com:5432/postgres" \
  alembic upgrade head
```

Verify in Supabase → Table Editor that the tables exist: `zones`, `species`,
`climate_history`, `scores_cache`, `weather_stations`.

---

## 3. Render — create the API service

1. Go to [render.com](https://render.com) → New → Web Service
2. Connect the GitHub repo (`fungus`)
3. Configure the service:

| Setting | Value |
|---|---|
| **Name** | `fungus-api` |
| **Region** | Frankfurt (closest to Spain) |
| **Branch** | `main` |
| **Root directory** | `backend` |
| **Runtime** | Python 3 |
| **Build command** | `pip install ".[dev]"` |
| **Start command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| **Instance type** | Free |

4. In **Advanced**:
   - **Health Check Path**: `/api/v1/health`
   - **Pre-Deploy Command**: leave empty (paid instances only — run migrations manually from local, see step 2)
   - **Auto-Deploy**: On Commit (default)

5. Add environment variables (Environment tab):

| Key | Value |
|---|---|
| `DATABASE_URL` | The `postgresql+asyncpg://` string from Supabase |
| `SECRET_KEY` | Run `openssl rand -hex 32` locally and paste the result |
| `ENVIRONMENT` | `production` |
| `CORS_ORIGINS` | `https://fungus-ashen.vercel.app` |

6. Click **Deploy Web Service** — Render will build and deploy automatically.

7. Wait for the first deploy to go green (~3–5 min). Check the logs for errors.

---

## 4. Verify the deploy

```bash
curl https://fungus-api.onrender.com/api/v1/health
```

Expected response:

```json
{
  "status": "ok",
  "version": "4.1.0",
  "environment": "production",
  "last_ingest": null,
  "active_zones": 0,
  "providers": {"open-meteo": true, "aemet": false, "meteocat": false},
  "db_reachable": true
}
```

`active_zones: 0` and `last_ingest: null` are expected at this point — the
catalog hasn't been seeded yet and no ingest has run. After step 7 (seed),
`active_zones` will show 200.

---

## 5. Run the initial backfill

Once the Phase 2 seed script populates the zones table, run a full backfill
from your local machine pointing at the production DB:

```bash
cd backend
DATABASE_URL="postgresql+asyncpg://..." \
  python -m scripts.backfill --from 2024-01-01 --to 2026-03-01
```

This loads 2 years of Open-Meteo historical data for all 28 zones (~5 min).

---

## 6. Keep-alive (UptimeRobot)

Render free tier sleeps after 15 min of inactivity. The daily cron at 05:00 UTC
wakes the service, but the frontend would hit a cold start on the first request
of the day.

Set up a free monitor on [uptimerobot.com](https://uptimerobot.com):

- Monitor type: HTTP(s)
- URL: `https://fungus-api.onrender.com/api/v1/health`
- Interval: 14 minutes

This keeps the service warm continuously at no cost.

---

## 7. Incremental releases (v4.2+)

For each new release after the initial deploy, the process is:

```bash
cd backend
export DATABASE_URL="postgresql+asyncpg://postgres.xxxx:<password>@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"

# 1. Apply new migrations (if any)
alembic upgrade head

# 2. Re-run the seed (idempotent — uses ON CONFLICT DO UPDATE)
python -m scripts.seed_catalog --mock-dir ../src/data
```

Render auto-deploys the new code on merge to `main`. Migrations and seed must
be run manually from local (Render free tier has no pre-deploy hook support).

**v4.2 specifically:**
- Migration `002` adds `description TEXT` to `zones`
- Seed populates 200 zones and 201 species

---

## 8. Auto-deploy on push

Render auto-deploys every time `main` is updated. No manual action needed for
future releases — merge the epic, push, and Render picks it up.

**⚠️ Important:** Sometimes the auto-deploy doesn't trigger automatically (especially
on free tier). If you don't see a new deployment after pushing to `main`:

1. Go to [render.com](https://render.com) → Your service
2. Click **Deploy** → **Manual Deploy** → **Deploy latest commit**

To verify auto-deploy is enabled: Render dashboard → Service → Settings →
Auto-Deploy → On.

---

## GitHub Actions secrets

For CI to run integration tests against a real database, add one secret:

1. GitHub repo → Settings → Secrets and variables → Actions → New repository secret
2. Name: `TEST_DATABASE_URL` — Value: the Supabase connection string

Unit tests run without this secret and will pass regardless.
