# First Deploy: Supabase + Render

Step-by-step checklist for the first production deployment of the backend API.
Run through this once when v4.1 is ready to go live. After that, deploys are
automatic on every push to `main`.

**Prerequisites:** `main` branch has the v4.1 epic merged and tagged.

---

## 1. Supabase — create the database

1. Go to [supabase.com](https://supabase.com) → New project
2. Name: `fungus` — Region: `West EU (Ireland)` — Password: generate a strong one and save it
3. Wait for the project to provision (~2 min)
4. Enable PostGIS: **Database → Extensions → search "postgis" → Enable**
5. Get the connection string: **Settings → Database → Connection string → URI**
   - Select **Transaction mode** (port 5432, compatible with the async pool)
   - Copy the string — it looks like: `postgresql://postgres:<password>@db.xxxx.supabase.co:5432/postgres`
   - Convert the scheme to async: replace `postgresql://` with `postgresql+asyncpg://`

---

## 2. Run migrations against Supabase

From your local machine with the backend deps installed:

```bash
cd backend
DATABASE_URL="postgresql+asyncpg://postgres:<password>@db.xxxx.supabase.co:5432/postgres" \
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
| **Build command** | `pip install -e .` |
| **Start command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| **Instance type** | Free |

4. Add environment variables (Environment tab):

| Key | Value |
|---|---|
| `DATABASE_URL` | The `postgresql+asyncpg://` string from Supabase |
| `SECRET_KEY` | Run `openssl rand -hex 32` locally and paste the result |
| `ENVIRONMENT` | `production` |
| `CORS_ORIGINS` | `https://fungus-git-feat-vite-migration-mimphos-projects.vercel.app` |

5. Click **Create Web Service** — Render will build and deploy automatically.

6. Wait for the first deploy to go green (~3–5 min). Check the logs for errors.

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

`active_zones: 0` and `last_ingest: null` are expected — the catalog hasn't
been seeded yet (Phase 2) and no ingest has run.

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

## 7. Auto-deploy on push

Render auto-deploys every time `main` is updated. No manual action needed for
future releases — merge the epic, push, and Render picks it up.

To verify auto-deploy is enabled: Render dashboard → Service → Settings →
Auto-Deploy → On.

---

## GitHub Actions secrets

For CI to run integration tests against a real database, add one secret:

1. GitHub repo → Settings → Secrets and variables → Actions → New repository secret
2. Name: `TEST_DATABASE_URL` — Value: the Supabase connection string

Unit tests run without this secret and will pass regardless.
