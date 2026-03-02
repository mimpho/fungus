# Fungus — Project Conventions

## Language policy

| Context | Language | Examples |
|---|---|---|
| Code — identifiers | English | `zone_id`, `ClimateHistory`, `fetch_yesterday()` |
| Code — comments | English | `# Aggregated daily data, provider-agnostic` |
| Code — docstrings | English | `"""Return the best available connector for a zone."""` |
| Code — log messages | English | `log.info("Ingest complete: %s", summary)` |
| Git — branch names | English | `epic/v4-backend`, `feat/add-aemet-connector` |
| Git — commit messages | English | `feat(ingest): add Open-Meteo daily connector` |
| Git — PR titles/descriptions | English | |
| DB — table names | English | `zones`, `climate_history`, `scores_cache` |
| DB — column names | English | `zone_id`, `precipitation_mm`, `forest_type` |
| API — endpoint paths | English | `/api/v1/zones`, `/api/v1/zones/{id}` |
| API — JSON field names | English | `score_oi`, `calculated_at`, `forest_type` |
| Docs in `/docs/` | English | This file |
| `CLAUDE.md` | Spanish | Project instructions for Claude |
| `memory/` | Spanish | Working memory and decisions |
| Changelogs | Spanish | `CHANGELOG.md` |
| Conversations with Claude | Spanish | Our day-to-day communication |

## Rationale

Keeping all code artifacts in English ensures:
- Standard conventions for any future collaborators or open-source contributions.
- Consistent naming across the stack (Python, SQL, REST JSON).
- No mixed-language identifiers (e.g. `get_zonas()` vs `get_zones()`).

Project-level documentation and Claude's working memory remain in Spanish since that is the working language of the project team.

---

## Versioning

This project uses [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`.

| Segment | Meaning | Examples |
|---|---|---|
| **MAJOR** | Product generation (frontend-only era vs. backend era) | `3.x` = Vite frontend; `4.x` = with backend |
| **MINOR** | Backend phase within the generation | `4.1` = Phase 1 (meteo + OI); `4.2` = Phase 2 (catalog in DB); `4.3` = Phase 3 (auth) |
| **PATCH** | Individual task or PR within a phase | `4.1.0` = initial scaffold; `4.1.1` = add AEMET connector |

**Never embed phase labels in version strings.** "Phase 1" is an informal name for the v4.1 milestone — use the version number in code, tags, and changelogs.

### Phase map (v4.x)

| Version | Phase | Scope |
|---|---|---|
| v4.1.x | Backend meteo | FastAPI scaffold, Open-Meteo ingestion, Outbreak Index, first API endpoints |
| v4.2.x | Catalog in DB | Seed script, species/zones endpoints replace mock data in frontend |
| v4.3.x | Auth + social | JWT auth, user follows/favorites, community sightings |

---

## Git branching strategy

| Branch type | Pattern | Target | Version impact | Example |
|---|---|---|---|---|
| Epic | `epic/<name>` | `main` | Spans a full MINOR (vX.Y) | `epic/v4-backend` covers v4.1, v4.2, v4.3 |
| Feature | `feat/vX-Y-<name>` | epic branch | One PATCH bump | `feat/v4-1-aemet-connector` → v4.1.1 |
| Fix | `fix/vX-Y-<name>` | epic branch | One PATCH bump | `fix/v4-1-frost-hours-estimate` → v4.1.2 |
| Chore — code | `chore/vX-Y-<name>` | epic branch | One PATCH bump | `chore/v4-1-update-httpx` → v4.1.3 |
| Chore — project | `chore/<name>` | **`main` directly** | One PATCH bump | `chore/update-readme` |

**Branch naming includes the target MINOR version** (`vX-Y`) for all branches that belong to an epic phase. This makes it immediately clear which phase a branch belongs to when looking at a branch list. Dots are replaced with hyphens (`v4-1`, not `v4.1`) to avoid issues in some git contexts.

Exception: project-wide chores that target `main` directly do not carry a version prefix because they are not tied to any specific phase.

**Branch origin — where to cut from:**

| Branch targets | Cut from |
|---|---|
| epic branch (`feat/`, `fix/`, `chore/vX-Y-*`) | Current epic branch |
| `main` directly (`chore/<name>` project-wide) | `main` |

This rule matters when `docs/` or project files exist only on the epic branch (not yet in `main`). In that case, even a documentation-style chore must be cut from the epic branch, because the file to edit doesn't exist in `main` yet.

**Project-wide chores** (docs, `CLAUDE.md`, `docs/conventions.md`, workflow) that exist in `main` target `main` directly — they are independent of any feature work and should be available in `main` without waiting for a phase to complete.

**Lifecycle:**
1. `feat/` and `fix/` branches are cut from the current epic branch and merged back into it (not `main`). Each merged PR corresponds to one PATCH release.
2. When all features for a MINOR phase are merged, the epic branch is tagged with the MINOR version (e.g. `v4.1.0`) and a PR is opened to merge into `main`.
3. The next MINOR phase starts new `feat/` branches from the same epic branch.
4. MAJOR bumps mark architectural generation changes (e.g. `3.x` frontend-only → `4.x` with backend).

---

## Git integration strategy

### The three integration directions

```
feat/vX-Y-*          ──squash──▶ epic/v4-backend ──merge --no-ff──▶ main
fix/vX-Y-*           ──squash──▶
chore/vX-Y-* (code)  ──squash──▶

chore/* (docs/project-wide) ──squash──▶ main (directly)
```

#### 1. `feat/` / `fix/` / `chore/` → epic branch: **squash merge**

Each feature branch is squashed into a single, well-named commit when it lands on the epic branch. This keeps `git log epic/v4-backend` clean and readable — one logical commit per feature, authored with Conventional Commits format.

```bash
# From the epic branch:
git merge --squash feat/v4-1-aemet-connector
git commit -m "feat(connector): add AEMET weather connector (P2)"
```

Why squash and not rebase? Rebase preserves every WIP commit ("fix typo", "WIP", "try again") which adds noise without value. Squash gives us one atomic commit per feature while the full development history lives in the branch until it's deleted.

#### 2. Epic branch → `main`: **merge commit (`--no-ff`)**

When a phase is complete, the epic branch merges into `main` with an explicit merge commit. This creates a visible boundary in the graph — you can see exactly where v4.1 started and ended.

```bash
git checkout main
git merge --no-ff epic/v4-backend -m "chore: merge epic/v4-backend — release v4.1.0"
git tag -a v4.1.0 -m "v4.1.0: backend meteo phase complete"
```

Never squash the epic into main — that erases the feature-by-feature history that the squash merges already cleaned up.

#### 3. Pulling updates onto a feature branch: **rebase**

When the epic branch advances while you're working on a feature, bring those changes in with rebase rather than a merge commit:

```bash
git fetch origin
git rebase epic/v4-backend
```

This keeps the feature branch linear and avoids a tangle of merge commits in its history before it gets squashed anyway.

### Rules

| Rule | Rationale |
|---|---|
| **Never rebase `epic/*` or `main`** | These are shared branches — rewriting their history breaks everyone's local copy |
| **Never `push --force` to `epic/*` or `main`** | Same reason; `--force-with-lease` is acceptable only in emergencies on feature branches |
| **Local rebase is fine** | `git rebase -i` to clean up WIP commits before opening a PR is encouraged |
| **Tag after every MINOR merge** | `git tag -a v4.1.0` on `main` right after the epic merge |
| **Delete feature branches after merge** | Use `git branch -D` (force) — squash merges leave the branch tip unreachable, so `-d` always fails |
| **Always provide the squash merge command** | When a branch is ready to land, always give the exact copy-paste block using `&&` chaining so it's safe to paste all at once (see cheatsheet) |

### Cheatsheet

```bash
# Start a new feature (always cut from the epic branch)
git checkout epic/v4-backend
git checkout -b feat/v4-1-aemet-connector

# Sync with the epic while working
git fetch origin
git rebase epic/v4-backend

# Finish and land the feature — safe to paste the whole block:
git checkout epic/v4-backend && \
git merge --squash feat/v4-1-aemet-connector && \
git commit -m "feat(connector): add AEMET weather connector (P2)" && \
git branch -D feat/v4-1-aemet-connector

# Close a phase and release — safe to paste the whole block:
git checkout main && \
git merge --no-ff epic/v4-backend -m "chore: merge epic/v4-backend — release v4.1.0" && \
git tag -a v4.1.0 -m "v4.1.0: backend meteo phase complete" && \
git push origin main --tags
```

---

## Commit message format (Conventional Commits)

```
<type>(<scope>): <short description>

[optional body]
```

Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`
Scopes: `ingest`, `scoring`, `api`, `db`, `connector`, `frontend`, `config`

Examples:
```
feat(connector): add Open-Meteo daily weather fetcher
feat(scoring): implement Outbreak Index algorithm
chore(db): add initial Alembic migration with PostGIS
fix(ingest): handle frost_hours estimation for daily granularity
```

---

## API design conventions

### Base URL and versioning

```
/api/v1/<resource>
```

Version prefix (`v1`) is part of every path. A new MAJOR API version (`v2`) would be introduced only if breaking changes are unavoidable — for now `v1` is the only version.

### Response format — no envelope

Responses return data directly as a Pydantic model. No wrapper object like `{"data": …, "meta": …}`:

```json
// GET /api/v1/zones/zone-001  ✓ correct
{
  "id": "zone-001",
  "name": "Pinar de Urbión",
  "score": { "score_oi": 72, … }
}

// ✗ do not wrap
{ "data": { "id": "zone-001", … }, "status": "ok" }
```

Collections are returned as plain JSON arrays:

```json
// GET /api/v1/zones  ✓ correct
[{ "id": "zone-001", … }, { "id": "zone-002", … }]
```

The `HealthResponse` endpoint is the only exception: it uses a `status` field because its purpose is explicitly to describe system state, not to return a resource.

### Error format

FastAPI's default `HTTPException` mechanism is used. All errors return:

```json
{ "detail": "<human-readable message>" }
```

| Situation | Status code | Example detail |
|---|---|---|
| Resource not found | `404` | `"Zone 'zone-099' not found"` |
| Invalid query param type | `422` | *(FastAPI auto-generates from Pydantic)* |
| Upstream provider unavailable | `503` | `"Weather provider unavailable, try again later"` |
| Internal unexpected error | `500` | `"Internal server error"` |

Do not expose internal stack traces or SQLAlchemy error messages in `detail`. Log them server-side and return a generic message for 500s.

For validation errors (422), FastAPI generates the full Pydantic error detail automatically — no custom handling needed.

### HTTP status codes

| Code | When to use |
|---|---|
| `200 OK` | Successful GET |
| `201 Created` | Successful POST that creates a resource (Phase 3+) |
| `204 No Content` | Successful DELETE with no body (Phase 3+) |
| `400 Bad Request` | Malformed request that Pydantic cannot catch |
| `404 Not Found` | Resource identified by path param does not exist |
| `422 Unprocessable Entity` | FastAPI/Pydantic validation failure (automatic) |
| `503 Service Unavailable` | Upstream weather provider down; transient, retry later |

Do not use `200` with an error payload. If something failed, use the appropriate 4xx/5xx code.

### Pagination

Current endpoints return full result sets — the dataset (28 zones, ~30 species) is small enough that this is fine.

When a collection can grow unbounded (e.g. `climate_history`, community sightings in Phase 3), use **cursor-based pagination** via `?cursor=<opaque_token>&limit=N`:

```
GET /api/v1/zones/zone-001/history?limit=30&cursor=2026-02-28
```

Response includes a `next_cursor` field when more results exist:

```json
{
  "items": [ … ],
  "next_cursor": "2026-01-29",
  "has_more": true
}
```

Offset-based pagination (`?page=2`) is **not used**: it behaves incorrectly when new rows are inserted between requests, which is normal during daily ingestion.

### Query parameters

Names use `snake_case`, matching JSON field names:

```
?forest_type=hayedo      ✓
?forestType=hayedo       ✗
?min_score=60            ✓
?minScore=60             ✗
```

Boolean filters accept `true` / `false` as strings (FastAPI converts automatically). Enum filters (e.g. `forest_type`) accept only documented values; unknown values return `422`.

### Cache headers

All `GET 200` responses include `Cache-Control: public, max-age=3600` via middleware in `main.py`. This applies uniformly — no per-endpoint override unless a specific endpoint needs a different TTL (e.g. `/health` could use `no-cache`, but the keep-alive ping benefit outweighs it for now).

Non-GET responses and error responses do not get `Cache-Control` headers.

### Datetime format

All datetime fields use ISO 8601 with UTC timezone (`Z` suffix):

```json
"calculated_at": "2026-03-02T05:12:34Z"
```

FastAPI serializes `datetime` objects with timezone info as ISO 8601 automatically. Always store and return datetimes as timezone-aware (`datetime.now(timezone.utc)`, not `datetime.utcnow()`).

### Field naming

JSON fields use `snake_case`, consistent with the database column naming convention:

```json
{ "score_oi": 72, "forest_type": "hayedo", "calculated_at": "…" }
```

This avoids a translation layer between DB columns and API responses and keeps the convention uniform across Python, SQL, and JSON.
