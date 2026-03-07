# Fungus — OpenCode Rules

## Project Structure

- **Active development**: `frontend/` — Vite + React app
- **Backend**: `backend/` — FastAPI + PostgreSQL + PostGIS
- **Legacy**: `standalone/` — no longer developed

## Key Files

| File | Purpose |
|---|---|
| `AGENTS.md` | Main agent instructions |
| `docs/conventions.md` | Full conventions (language, versioning, git, testing, API) |
| `docs/backend_architecture.md` | Backend spec v4.x |
| `docs/deploy.md` | Deployment guides |

## Critical Rules

1. **Always** run lint/typecheck before committing:
   ```bash
   cd frontend && npm run lint   # or check package.json for scripts
   cd backend && python -m ruff check app/
   ```

2. **Never** commit secrets or API keys

3. **Use English** for all code (identifiers, comments, commit messages)

4. **Frontend path**: Always work in `frontend/`, not `standalone/`

5. **API endpoints**: Always update `docs/backend_architecture.md` when changing endpoints

6. **Review tracking files**: When working on something that touches code in `memory/pending.md`, `memory/decisions.md`, or `CHANGELOG.md`, review and update them if needed

## Tracking Files

| File | Purpose |
|---|---|
| `memory/pending.md` | Task queue and backlog |
| `memory/decisions.md` | Architectural decisions |
| `memory/scoring.md` | Scoring algorithm details |
| `memory/gotchas.md` | Known issues and workarounds |
| `CHANGELOG.md` | Version history |
