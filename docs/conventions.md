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

| Branch type | Pattern | Version impact | Example |
|---|---|---|---|
| Epic | `epic/<name>` | Spans a full MINOR (vX.Y) | `epic/v4-backend` covers v4.1, v4.2, v4.3 |
| Feature | `feat/<name>` | One PATCH bump (vX.Y.Z) | `feat/aemet-connector` → v4.1.1 |
| Fix | `fix/<name>` | One PATCH bump | `fix/frost-hours-estimate` → v4.1.2 |
| Chore | `chore/<name>` | One PATCH bump | `chore/update-httpx` → v4.1.3 |

**Lifecycle:**
1. `feat/` and `fix/` branches are cut from the current epic branch and merged back into it (not `main`). Each merged PR corresponds to one PATCH release.
2. When all features for a MINOR phase are merged, the epic branch is tagged with the MINOR version (e.g. `v4.1.0`) and a PR is opened to merge into `main`.
3. The next MINOR phase starts new `feat/` branches from the same epic branch.
4. MAJOR bumps mark architectural generation changes (e.g. `3.x` frontend-only → `4.x` with backend).

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
