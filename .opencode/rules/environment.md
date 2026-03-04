# Environment Variables

## Backend

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | `postgresql+asyncpg://postgres:postgres@localhost:5432/fungus` | Async PostgreSQL connection |
| `SECRET_KEY` | Prod only | `dev-secret-key` | JWT signing |
| `ENVIRONMENT` | No | `development` | `production` on Render |
| `CORS_ORIGINS` | No | `http://localhost:5173` | Allowed origins |
| `METEOCAT_API_KEY` | No | - | P1 provider (optional) |
| `AEMET_API_KEY` | No | - | P2 provider (optional) |

## Frontend

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API URL (e.g., `http://localhost:8000`) |

## Rules

- **Never commit `.env`** — gitignored
- **Never hardcode secrets** — always use `settings.*`
- P1/P2 keys are optional — app works with Open-Meteo alone
- Use Supabase Transaction mode (port 5432), not Session mode
