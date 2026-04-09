# Fungus — Technical Conventions

> Coding and API conventions for the project.
> Git workflow, commit format, and documentation protocol live in `system/workflows.spec.md`.
> Language policy and terminology in `system/glossary.spec.md`.

---

## Language policy

| Context | Language | Examples |
|---|---|---|
| Code — identifiers | English | `zone_id`, `ClimateHistory`, `fetch_yesterday()` |
| Code — comments | English | `# Aggregated daily data, provider-agnostic` |
| Code — docstrings | English | `"""Return the best available connector for a zone."""` |
| Code — log messages | English | `log.info("Ingest complete: %s", summary)` |
| Git — branch names | English | `epic/v7-oauth`, `feat/v7-0-google-signin` |
| Git — commit messages | English | `feat(auth): add Google OAuth2 signin` |
| Git — PR titles/descriptions | English | |
| DB — table/column names | English | `zones`, `climate_history`, `zone_id` |
| API — endpoint paths | English | `/api/v1/zones`, `/api/v1/species/{id}` |
| API — JSON field names | English | `score_oi`, `calculated_at`, `forest_type` |
| `docs/` | English | This file |
| `system/` | English | Specs and project instructions |
| `CLAUDE.md`, `AGENTS.md` | English | Agent entry points |
| `memory/` | Spanish | Working memory and decisions (historical) |
| `CHANGELOG.md` | Spanish | Version history (historical) |
| Conversations with Claude | Spanish | Day-to-day communication |
| Product names already in Spanish (UI strings, zone/species names) | Spanish | Do not rename — would require refactors |

---

## Versioning

Semantic Versioning: `MAJOR.MINOR.PATCH`

| Segment | Meaning |
|---|---|
| **MAJOR** | Product generation (e.g. `5.x` = with auth + AI) |
| **MINOR** | Feature milestone within the generation |
| **PATCH** | Individual task or PR within a milestone |

---

## API design conventions

### Base URL

```
/api/v1/<resource>
```

### Response format — no envelope

```json
// GET /api/v1/zones/zone-001  ✓
{ "id": "zone-001", "name": "Pinar de Urbión", "score": { ... } }

// ✗ do not wrap
{ "data": { ... }, "status": "ok" }
```

Collections as plain arrays:
```json
// GET /api/v1/zones  ✓
[{ "id": "zone-001", ... }, { "id": "zone-002", ... }]
```

### Error format

```json
{ "detail": "<human-readable message>" }
```

| Situation | Code |
|---|---|
| Resource not found | `404` |
| Invalid query param | `422` (FastAPI auto) |
| Upstream unavailable | `503` |
| Internal error | `500` |

Do not expose stack traces or SQLAlchemy errors in `detail`. Log server-side; return generic message for 500s.

### HTTP status codes

| Code | When |
|---|---|
| `200 OK` | Successful GET |
| `201 Created` | Successful POST creating a resource |
| `204 No Content` | Successful DELETE |
| `400 Bad Request` | Malformed request Pydantic cannot catch |
| `404 Not Found` | Path param resource not found |
| `422 Unprocessable Entity` | FastAPI/Pydantic validation failure |
| `503 Service Unavailable` | Weather provider down |

Never use `200` with an error payload.

### Pagination

Current endpoints return full result sets (28 zones, ~202 species — manageable).

For unbounded collections (`climate_history`, sightings): **cursor-based pagination**:

```
GET /api/v1/zones/zone-001/history?limit=30&cursor=2026-02-28
```

Response:
```json
{ "items": [...], "next_cursor": "2026-01-29", "has_more": true }
```

Offset-based pagination (`?page=N`) is **not used** — behaves incorrectly when rows are inserted between requests.

### Query parameters

`snake_case` only:
```
?forest_type=hayedo   ✓
?forestType=hayedo    ✗
```

### Cache headers

All `GET 200` responses: `Cache-Control: public, max-age=3600` via middleware in `main.py`.

### Datetime format

ISO 8601 with UTC timezone:
```json
"calculated_at": "2026-03-02T05:12:34Z"
```

Always use timezone-aware datetimes: `datetime.now(timezone.utc)`, never `datetime.utcnow()`.

### Field naming

`snake_case` in JSON and DB columns:
```json
{ "score_oi": 72, "forest_type": "hayedo", "calculated_at": "..." }
```
