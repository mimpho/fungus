# Tech Debt Audit — Fungus

**Date:** April 2026  
**Repo:** `fungus` (React + Vite frontend / FastAPI backend)  
**Methodology:** Priority = (Impact + Risk) × (6 − Effort), where inverted Effort means an easy fix scores higher.

---

## Executive Summary

The repo has solid, well-structured architecture but accumulates debt in four critical areas: duplicate data between frontend and backend, two parallel migration systems with no clear winner, the `build/` directory committed to git, and a `helpers.jsx` file that has grown into a 508-line junk drawer. Frontend test coverage is zero, backend coverage is minimal.

---

## Prioritized Debt

### 🔴 High Priority (score ≥ 25)

#### 1. Duplicate `PROVINCE_TO_CCAA` Map — Score: 28
**Type:** Code debt  
**Impact:** 3 | **Risk:** 4 | **Effort:** 2

Same province→region map exists in `src/services/apiService.js` and in `src/data/zones.js`. If a province is added or a name corrected in one place, the other silently becomes outdated, producing UI filter inconsistencies.

**Fix:** Extract map to `src/lib/constants.js` (file already exists) and import from both places. 1–2 hours.

---

#### 2. Two Migration Systems with No Clear Owner — Score: 28
**Type:** Architecture debt + Documentation debt  
**Impact:** 3 | **Risk:** 4 | **Effort:** 2

Repo has 49 `.sql` files in `migrations/` (project root) plus an Alembic system in `backend/migrations/versions/` with 9 versions. Unclear which is source of truth. Manual SQL has inconsistent numbering (`015_sesion_b.sql`, `015_sesion_b_1.sql`, `015_sesion_b2.sql`…) suggesting manual application in production.

**Fix:** Document in `migrations/README.md` which system is active (Alembic) and whether `.sql` files are already absorbed or remain independent. If obsolete, move to `migrations/archive/`. 2–4 hours.

---

#### 3. `backend/build/` Committed to Git — Score: 25
**Type:** Infrastructure debt  
**Impact:** 2 | **Risk:** 3 | **Effort:** 1

Directory `backend/build/` contains complete copy of entire Python app (routers, services, models…). If `app/` is modified without rebuilding, `build/` becomes outdated and may confuse any tool or deploy that uses it as source. Also bloats repo and complicates diffs.

**Fix:** Add `backend/build/` to `.gitignore` and remove from git index with `git rm -r --cached backend/build/`. 30 minutes.

---

### 🟡 Medium Priority (score 15–24)

#### 4. `helpers.jsx` — God File of 508 Lines — Score: 21
**Type:** Code debt  
**Impact:** 4 | **Risk:** 3 | **Effort:** 3

`helpers.jsx` mixes three completely different things: inline SVG icons (`IC`), pure utility functions (`slugify`, `resolveUrl`, `getEdibilityColor`), and React micro-components (`EdibilityTag`, `SpeciesCard`…). Any icon change forces opening same file as business logic changes.

**Fix:** Split into three modules:
- `src/lib/icons.jsx` — `IC` object with all SVGs
- `src/lib/utils.js` — pure functions (slugify, resolveUrl, formatters)
- `src/lib/ui.jsx` — React micro-components

Current `@/lib/helpers` imports can temporarily remain by re-exporting from original. 3–5 hours.

---

#### 5. Backend Test Coverage — Score: 21
**Type:** Test debt  
**Impact:** 3 | **Risk:** 4 | **Effort:** 3

Only one test file exists: `backend/tests/unit/test_scoring.py`. No tests for auth, zones, species, weather, or any routers. Backend already has pytest infrastructure and `.pytest_cache`.

**Fix:** Add at least contract tests for critical routers: `auth.py` (login/register) and `zones.py`. Estimate 1 day for reasonable 60% minimum coverage.

---

#### 6. Inline SVGs Instead of `lucide-react` — Score: 16
**Type:** Code debt  
**Impact:** 2 | **Risk:** 1 | **Effort:** 2

`lucide-react` already in `package.json` and used in some admin pages, but `helpers.jsx` has own inline SVGs for nav icons. Duplicates maintenance and causes size/stroke inconsistencies.

**Fix:** Replace `IC` object with direct `lucide-react` imports. Many already have exact equivalents. 2–3 hours.

---

#### 7. `standalone/` — Undocumented Parallel Codebase — Score: 16
**Type:** Documentation debt + Architecture debt  
**Impact:** 2 | **Risk:** 2 | **Effort:** 2

`standalone/` contains completely different version of app (HTML + plain JS, no React) with own version history up to `v2.8.0`. Unclear if actively maintained, generated from main code, or historical artifact.

**Fix:** Add `standalone/README.md` explaining purpose. If deprecated, move to archived branch. 1–2 hours.

---

### 🟢 Low Priority (score < 15)

#### 8. `backend/app/routers/species.py` — 519 Lines — Score: 15
**Type:** Code debt  
**Impact:** 3 | **Risk:** 2 | **Effort:** 3

Species router mixes public and admin endpoints in same 519-line file.

**Fix:** Extract admin endpoints (`/visual-prompt`, `/images`) to `routers/species_admin.py`. 2–3 hours.

---

#### 9. Zero Frontend Tests — Score: 16 (high effort)
**Type:** Test debt  
**Impact:** 4 | **Risk:** 4 | **Effort:** 5

No frontend tests exist. Main risk is in `useSpecies.js` filtering logic and weather condition scoring.

**Fix:** Set up Vitest (comes with Vite) and add unit tests for `slugify`, `normalizeScore`, `normalizeZone`, and `useSpecies` hook. Estimate 1–2 days.

---

#### 10. `AppContext.jsx` — God Context — Score: 10
**Type:** Architecture debt  
**Impact:** 3 | **Risk:** 2 | **Effort:** 4

Global context manages i18n, auth, modal stack, follows, and favorites. Any state update triggers re-render of all consumers.

**Fix:** Split into `AuthContext`, `ModalContext`, and `i18nContext`. Low urgency but worth considering as app grows. 1–2 days.

---

## Remediation Plan by Phase

### Phase 1 — Quick Wins (~1 day total)
1. Remove `backend/build/` from repository
2. Consolidate `PROVINCE_TO_CCAA` to `src/lib/constants.js`
3. Document which migration system is active

### Phase 2 — Structural Refactors (parallel to feature work)
4. Split `helpers.jsx` into three modules
5. Replace inline SVGs with `lucide-react`
6. Document or archive `standalone/`
7. Extract admin endpoints from `species.py`

### Phase 3 — Tests (10–20% of each sprint)
8. Backend router tests: auth + zones as first iteration
9. Set up Vitest and cover pure frontend logic
10. Evaluate whether splitting `AppContext` is worthwhile

---

## Current Metrics

| Area | Indicator | Status |
|------|-----------|--------|
| Frontend tests | Test files | 0 |
| Backend tests | Test files | 1 (scoring only) |
| Largest file (frontend) | `helpers.jsx` | 508 lines |
| Largest file (backend) | `routers/species.py` | 519 lines |
| Manual SQL migrations | Count | 49 files |
| Alembic migrations | Count | 9 versions |
| Duplicate data identified | PROVINCE_TO_CCAA | 2 copies |
