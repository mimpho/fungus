# Deployment

## Frontend
- **Platform**: Vercel
- **URL**: `fungus-ashen.vercel.app`
- **Branch**: `main`
- **Auto-deploy**: On merge to main

## Backend
- **Platform**: Render (free tier)
- **URL**: `https://fungus-api.onrender.com`
- **Database**: Supabase (PostgreSQL + PostGIS, Frankfurt)

## Render Setup

| Setting | Value |
|---|---|
| Name | `fungus-api` |
| Region | Frankfurt |
| Root directory | `backend` |
| Build command | `pip install ".[dev]"` |
| Start command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Health check | `/api/v1/health` |

## Keep-Alive

Render free tier sleeps after 15 min. Use UptimeRobot to ping `/api/v1/health` every 14 min.

## Deploy Steps

```bash
# 1. Apply migrations
alembic upgrade head

# 2. Seed catalog
python -m scripts.seed_catalog --mock-dir ../src/data

# 3. Push to main → auto-deploy
```

## Secrets

Never commit `.env` files. Set env vars in Render dashboard.
