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

## Git branching strategy

| Branch type | Pattern | Scope |
|---|---|---|
| Epic | `epic/<name>` | Large multi-PR features (e.g. `epic/v4-backend`) |
| Feature | `feat/<name>` | Single focused feature within an epic |
| Fix | `fix/<name>` | Bug fixes |
| Chore | `chore/<name>` | Dependency updates, config, tooling |

All feature branches within `epic/v4-backend` merge into the epic branch, not into `main`.
The epic branch merges into `main` when the phase is complete and deployed.

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
