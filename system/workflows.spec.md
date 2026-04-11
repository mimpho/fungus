# workflows.spec.md — Fungus

> Defines the lifecycle of changes: from idea to production.
> Covers git, documentation and session close protocol.

---

## Change lifecycle

```
Backlog (pending.md)
    │
    ▼
📋 DRAFT
    Task identified. Branch created. No code yet.
    │
    ▼
🔨 IMPLEMENTATION
    Code written. Tests if applicable. Documentation in progress.
    │
    ▼
🔍 REVIEW
    Manual QA: git checkout <branch>. Linting. Build ok.
    │
    ▼
✅ LIVE
    Squash merge to epic branch. PR to main. Release tag.
    Documentation updated. Item removed from pending.md.
```

---

## Git — Branching strategy

### Branch types

| Type | Pattern | Target | Description |
|---|---|---|---|
| Epic | `epic/<name>` | `main` | Covers a full MINOR (vX.Y). E.g. `epic/v7-oauth` |
| Feature | `feat/vX-Y-<name>` | epic branch | One PATCH. E.g. `feat/v7-0-google-signin` |
| Fix | `fix/vX-Y-<name>` | epic branch | One fix PATCH |
| Chore (code) | `chore/vX-Y-<name>` | epic branch | One maintenance PATCH |
| Chore (project) | `chore/<name>` | `main` via PR | Docs, config, no feature version |

**Rule**: `feat/`, `fix/` and `chore/vX-Y-*` branches are always cut from the epic branch, not from `main`. This avoids conflicts when the epic branch has changes that `main` does not yet have.

**`main` has branch protection** — never direct push. Every change, including one-line doc fixes, goes through a PR.

### Integration

```
feat/vX-Y-*          ──squash──▶  epic/vX-Y  ──merge --no-ff──▶  main
fix/vX-Y-*           ──squash──▶
chore/vX-Y-* (code)  ──squash──▶

chore/* (project-wide)  ──squash──▶  main (directly)
```

**feat/fix/chore → epic**: squash merge. One logical commit per feature, with Conventional Commits message.

```bash
git checkout epic/v7-oauth
git merge --squash feat/v7-0-google-signin
git commit -m "feat(auth): add Google OAuth2 signin flow"
git branch -D feat/v7-0-google-signin
```

**Epic → main**: `--no-ff` merge commit. Creates a visible boundary in the graph.

```bash
git checkout main
git merge --no-ff epic/v7-oauth -m "chore: merge epic/v7-oauth — release v7.0.0"
git tag -a v7.0.0 -m "v7.0.0: Google OAuth2 complete"
git push origin main --tags
```

**Syncing a feature branch with its epic**: rebase, never merge.

```bash
git fetch origin
git rebase epic/v7-oauth
```

### Invariable rules

| Rule | Reason |
|---|---|
| Never rebase `epic/*` or `main` | Shared branches — rewriting history breaks everyone's local copy |
| Never `push --force` to `epic/*` or `main` | Same reason |
| QA before squash | `git checkout <branch>` for manual QA. Only provide the squash+delete block after QA is confirmed |
| Tag after every MINOR merge to main | `git tag -a vX.Y.0` immediately after the merge |
| Delete feature branches after merge | Use `git branch -D` (force) — squash leaves the tip unreachable |

### Cheatsheet

```bash
# New feature
git checkout epic/v7-oauth
git checkout -b feat/v7-0-google-signin

# Sync while working
git fetch origin && git rebase epic/v7-oauth

# QA — checkout for manual inspection
git checkout feat/v7-0-google-signin

# After QA passes — squash + delete (paste the whole block)
git checkout epic/v7-oauth && \
git merge --squash feat/v7-0-google-signin && \
git commit -m "feat(auth): add Google OAuth2 signin flow" && \
git branch -D feat/v7-0-google-signin

# Phase close — merge to main + tag
git checkout main && \
git merge --no-ff epic/v7-oauth -m "chore: merge epic/v7-oauth — release v7.0.0" && \
git tag -a v7.0.0 -m "v7.0.0: Google OAuth2 complete" && \
git push origin main --tags
```

---

## Commit format — Conventional Commits

```
<type>(<scope>): <short description>

[optional body]
```

**Types**: `feat` · `fix` · `chore` · `docs` · `refactor` · `test` · `perf`
**Scopes**: `ingest` · `scoring` · `api` · `db` · `connector` · `frontend` · `auth` · `admin` · `config`

```
feat(auth): add Google OAuth2 signin with One Tap
fix(scoring): correct seasonal factor for August (48, not 45)
chore(db): add migration 010 for oauth provider fields
docs(system): update project.spec.md with v7 roadmap
```

---

## Documentation update protocol

### On closing a task (PATCH: vX.Y.Z → vX.Y.Z+1)

| File | What to update |
|---|---|
| `CHANGELOG.md` | Add entry in `[Unreleased]` under the appropriate type |
| `backend/pyproject.toml` | Bump patch version |
| `system/project.spec.md` | If stack, architecture or endpoints changed |

### On closing a phase/milestone (MINOR: vX.Y → vX.Y+1)

Everything above, plus:

| File | What to update |
|---|---|
| `CHANGELOG.md` | Consolidated phase entry with all Added/Fixed items |
| `memory/pending.md` | Remove the completed phase block; promote next milestone to "🚀 Next" |
| `system/project.spec.md` → Roadmap | Mark phase as ✅, add next if applicable |
| `README.md` | Roadmap, endpoints if changed |

**Mandatory order — always in this sequence before preparing the PR:**

1. Update `CHANGELOG.md` — add the phase entry under `[Unreleased]`
2. Update `memory/pending.md` — remove the completed block, promote the next one
3. Update `system/project.spec.md` and `README.md` if roadmap or stack changed
4. Commit all doc changes on the feature branch with `docs: close vX.Y — …`
5. Push the feature branch
6. Prepare the PR (title + body inline in chat — see [PR preparation](#pr-preparation))

**Git process after the PR is merged:**
1. `git pull origin main && git tag -a vX.Y.0 -m "..." && git push origin vX.Y.0`
2. Apply SQL migrations on Supabase if any

### On making a relevant architectural decision

| File | What to update |
|---|---|
| `memory/decisions.md` | Record decision, discarded alternatives, reason |
| `system/project.spec.md` | If it affects the general architecture |
| `docs/backend_architecture.md` | If it affects the backend design |

### On adding or changing an endpoint

| File | What to update |
|---|---|
| `system/project.spec.md` → Backend endpoints | Endpoints table |
| `docs/backend_architecture.md` | API Endpoints section |

### Single responsibility per file

| File | Responsibility | Rule |
|---|---|---|
| `CHANGELOG.md` | Complete history | Never deleted. Everything that happened lives here. |
| `memory/pending.md` | Active task queue | Completed items are **removed** — not archived. |
| `system/project.spec.md` → Roadmap | Quick-reference table | Status only (✅/🚧/🗂), no task detail. |
| `README.md` | Public project view | Summary roadmap, stack, deploy URLs. |

**When a task closes**: entry in `CHANGELOG.md` + remove item from `pending.md`. Do not copy the same detail into multiple files.

---

## Testing strategy

### What is tested

| Layer | What | How | Priority |
|---|---|---|---|
| Scoring algorithm | `score_pa21`, `score_thermal`, `compute_oi` | Pure unit tests, no DB or I/O | Must-have |
| API routers | Response shape, status codes, query params | `pytest` + `httpx.AsyncClient` with test DB | High |
| Ingest service | Daily fetch → upsert → cache refresh | Mock connector, real DB | Medium |
| Weather connectors | HTTP parsing, retry, fallback | Mock `httpx` (no real API calls) | Medium |

### What is not tested

- Alembic migrations (Alembic guarantees correctness)
- FastAPI internals (Pydantic, OpenAPI)
- External APIs (Open-Meteo, Google AI)
- Frontend code

### Test layout

```
backend/tests/
├── conftest.py           ← fixtures: test DB, async client, make_zone
├── unit/
│   └── test_scoring.py  ← pure functions, no external dependencies
└── integration/
    ├── test_routes_health.py
    ├── test_routes_zones.py
    └── test_ingest.py
```

### Commands

```bash
cd backend
pytest                                    # all tests
pytest tests/unit/                        # unit only (fast, no DB)
pytest --cov=app --cov-report=term-missing
```

### CI

GitHub Actions runs the full suite on every push to `epic/*` and `main`. Uses `postgis/postgis:16-3.4` as a service for integration tests.

---

## Business decision documentation

When topics arise around monetisation, business model, premium features, pricing, gamification or commercial roadmap, Claude should:

1. Contribute actively to the discussion
2. At the end, propose documenting it in `memory/business.md`
3. If the user agrees, update the file in the same session

`memory/business.md` is private (`.gitignore`) and is the source of truth for business decisions.

---

## Documentation language

**All documentation in this project must be written in English.** This applies to:
- `system/` spec files
- `docs/` guides and references
- `memory/` files (decisions, pending, gotchas, scoring, tech-debt)
- `migrations/README.md`
- Root files: `README.md`, `CHANGELOG.md`, `CLAUDE.md`, `AGENTS.md`
- PR titles, bodies, and commit messages

Inline code comments in source files may use Spanish where the domain language is naturally Spanish (e.g. species names, UI strings in `i18n.js`), but all prose documentation must be in English.

---

## PR preparation

When preparing an integration, always provide title and description **inline in the chat as markdown blocks** — never as files on disk. The human pastes them into GitHub and handles the merge; Claude never merges to main.

**Title**: Conventional Commits format, ≤72 chars, in English.
**Body**: always in English.
**Body**: summary of changes + manual steps section + testing checklist.

```markdown
## Summary
- <bullet 1>
- <bullet 2>

## Manual steps
- [ ] Apply migration 010 in Supabase
- [ ] Set GOOGLE_CLIENT_ID in Render env vars

## Testing checklist
- [ ] Google signin flow in dev
- [ ] JWT issued correctly after OAuth callback
- [ ] Existing email/password login unaffected
```
