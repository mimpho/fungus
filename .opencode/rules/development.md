# Development Commands

## Frontend

```bash
cd frontend
npm run dev      # Dev server → http://localhost:5173
npm run build    # Build producción (dist/)
npm run preview  # Preview del build
```

## Backend

```bash
# Start database (Docker)
cd backend
docker compose up -d

# Install dependencies
pip install -e ".[dev]"

# Run migrations
alembic upgrade head

# Start API
uvicorn app.main:app --reload --port 8000

# Lint
ruff check app/

# Tests
pytest
```

## Frontend → Backend Connection

Create `frontend/.env.local`:
```
VITE_API_URL=http://localhost:8000
```
