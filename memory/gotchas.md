# Gotchas and Known Restrictions

Pitfalls and errors we've already encountered. Consult before modifying these areas.

---

## Open-Meteo API

### ⚠️ `soil_temperature_0cm` only in `hourly`
Adding it to `current` returns HTTP 400. Always fetch in `hourly` and read the hourly index closest to `new Date().getHours()`.

```js
// ✅ Correct
hourly: 'soil_temperature_0cm'

// ❌ Breaks the API
current: 'temperature_2m,soil_temperature_0cm'
```

---

## Leaflet

### ⚠️ `window.L = L` before dynamic import of leaflet.heat
`leaflet.heat` is a CommonJS plugin that looks for `L` in the global scope during initialization. If `import('leaflet.heat')` is done before `window.L` is assigned, it fails silently or throws an error.

```js
// In LeafletMap.jsx, at module level (outside any function):
import L from 'leaflet'
window.L = L  // ← MUST go here, before any dynamic import()

// Inside the component, only when heatmap is activated:
const heat = await import('leaflet.heat')
```

### ⚠️ `FOREST_COLORS` and Leaflet colors → always hex, never CSS vars
Leaflet's SVG markers and HTML popups are rendered outside React's DOM. CSS custom properties (`var(--color-coffee)`) don't resolve in that context. Always use literal hex values.

```js
// constants.js
export const FOREST_COLORS = {
  pinar:   '#4a7c59',  // ⚠️ hex required — Leaflet SVG won't resolve CSS vars
  hayedo:  '#6b7c3e',
  // ...
}
```

---

## Color System

### ⚠️ `ArticleCallout` color prop → always hex
The component builds background color as `color + '18'` (hex opacity suffix). If you pass `var(--color-coffee)`, concatenation yields `var(--color-coffee)18`, which is not a valid color.

```jsx
// ✅ Correct
<ArticleCallout color="#8b6f47">...</ArticleCallout>

// ❌ Doesn't work
<ArticleCallout color="var(--color-coffee)">...</ArticleCallout>
```

### ⚠️ Don't use `bg-mid` or `green-dark` — they were renamed
- `bg-mid` → removed (didn't really exist as a token)
- `green-dark` → renamed to `green-f`

---

## React / Hooks

### ⚠️ React StrictMode mounts effects twice in development
`useEffect` runs double in dev. Guards with `useRef` don't work well here because the reference resets. Solution: module-level promise cache in `weatherService.js` (`_allZonesPromise`, `_singlePromises`).

### ⚠️ `conditionsMap` starts as empty object `{}`
Always use optional chaining when accessing:
```js
// ✅
conditionsMap[zone.id]?.overallScore ?? 0

// ❌ Crashes on initial render
conditionsMap[zone.id].overallScore
```

### ⚠️ `useMemo` in Dashboard/Zones depends on `conditionsMap`
The map is filled asynchronously. `useMemo` calls that derive data from it must include it in dependencies or won't see updates.

---

## Weather Cache

### ⚠️ Increment `CACHE_VERSION` when changing the scoring algorithm
Cache in localStorage is invalidated by version. If you change `calculateOverallScore` or the species modifier formula without bumping `CACHE_VERSION`, users will see old scores for 3 hours.

**Current version:** `CACHE_VERSION = 3` (in `weatherService.js`)

### ℹ️ The species modifier is NOT in the cache
`applySpeciesModifier` is applied in the hook after reading the cache, not in `weatherService`. This is intentional: it allows changing edibility weights without invalidating the weather cache.

---

## Color Migration (automatic script)

### ⚠️ The migration script incorrectly overwrote `FOREST_COLORS` with CSS vars
When running automatic migration from hex → tokens, `FOREST_COLORS` was modified incorrectly. It was manually reverted to hex. If you run any color substitution scripts again, explicitly exclude `FOREST_COLORS` and the Leaflet HTML template.

---

## File Editing

### ℹ️ Read the file before using `Edit`
The `Edit` tool fails if the file hasn't been read in the same session. Always use `Read` before editing, especially after a previous `Write`.

### ⚠️ Don't add duplicate `className` in JSX
When editing with sed or text replacements, verify that no duplicate `className` attribute remains on the same element. React warns and uses only the last one.

---

## Modal Routing (React Router v6)

### ⚠️ Never `navigate()` inside a modal — only `setSelected*()`
Modals don't call `navigate()` directly. They only update context state (`setSelectedSpecies`, etc.) and `ModalRenderer` reacts by navigating. Calling `navigate()` from a modal breaks history and prevents ESC from returning to the right place. See `memory/decisions.md` → "ModalRenderer as sole authority".

### ⚠️ `navigate('/route', { replace: true })` between modals breaks the Back button
If opening modal B from modal A uses `navigate('/base-route', { replace: true })`, it replaces modal A's history entry. ESC from B can no longer return to A. The solution is not to navigate manually — let ModalRenderer push the new entry with `navigate(target)` (no replace).

### ⚠️ Anti-loop guard required in ModalRenderer
Without the guard `if (location.pathname === target) return`, ModalRenderer's `useEffect` can fire infinitely when changing `selectedSpecies` while already at `/especies/:slug`. Always compare before navigating.

---

## Asset URLs in Nested Routes

### ⚠️ Images with relative paths break in `/especies/:id`, `/familia/:slug`, etc.
Mock data uses paths like `assets/images/species/esp-001.jpg` (no leading `/`). When the browser URL is `/especies/boletus-edulis`, the browser resolves the relative path as `/especies/assets/...` → 404.

**Solution:** `resolveUrl()` in `helpers.jsx`. Always use in `<img src>` of modals, galleries, and articles:

```js
import { resolveUrl } from '../../lib/helpers'
<img src={resolveUrl(foto.url)} />   // guarantees /assets/... never assets/...
```

**Components where it's already applied:** `SpeciesModal` (GallerySection), `FamilyModal` (thumbnails), `Lightbox` (main image + thumbnails).

---

## Backend — Deployment on Render (free tier)

### ⚠️ CORS: Vercel preview URLs are not whitelisted by default
Vercel preview deployments generate dynamic URLs like `fungus-xxxx.vercel.app`. If accessing the backend from one of these URLs without it in `CORS_ORIGINS`, the browser blocks the request.

**Implemented solution:** `allow_origin_regex=r"https://fungus[^.]*\.vercel\.app"` in `CORSMiddleware` of `main.py`. Automatically covers any preview URL of the project without touching environment variables.

If adding a new production domain (e.g., custom domain), add it to the `CORS_ORIGINS` env var in Render (comma-separated).

### ⚠️ No shell access in Render free tier → migrations via code
Render free tier doesn't expose Shell. Running `alembic upgrade head` manually is impossible without deploying.

**Implemented solution:** `_run_db_migrations()` in `main.py` lifespan calls `alembic upgrade head` synchronously on startup, before any queries. Alembic is idempotent: if the schema is already updated, it does nothing. Each deploy automatically applies pending migrations.

### ⚠️ `asyncio.run()` inside lifespan → RuntimeError (silent 500)
`alembic env.py` uses an async engine and calls `asyncio.run(run_migrations_online())`. If calling `_run_db_migrations()` directly from the lifespan (which already runs in an event loop), `asyncio.run()` fails with `RuntimeError: This event loop is already running` → startup crashes before serving requests → 500 without CORS headers (the browser shows both errors, but CORS is a consequence of the 500).

**Symptom:** backend requests fail with 500 + CORS error. The error looks like CORS but is actually a startup crash.

**Implemented solution:** `await asyncio.to_thread(_run_db_migrations)` in lifespan. Migration runs in a worker thread where no event loop is active, so `asyncio.run()` in env.py works without conflict.

### ⚠️ Backend floats can have erratic precision on the frontend
Values like `pa21_mm` come as raw Python floats (e.g., `1.7999999999999998`). Always round when normalizing on the frontend.

**Implemented solution:** helpers `r1` (1 decimal) and `r0` (integer) in `normalizeScore()` of `apiService.js` and in `useApiZoneConditions`.

### ℹ️ Conflicts between feature branches touching the same backend files
If an epic branch has commits from an earlier phase (skeletons) and a feature branch has the complete implementation, the PR will show conflicts even though there's no divergence with `main`.

**Resolution pattern:** `git merge origin/epic/...` in the feature branch + `git checkout --ours` for all backend files where our implementation exceeds the skeleton. Merge commit with explanation of the resolution criteria.

---

## React Router v6 — Component Instance Behavior

### ℹ️ Different routes that render the same component create separate instances
`/especies` and `/especies/:id` use `<Species />` in different routes → React creates a new instance when navigating between them (doesn't reuse). Refs start at `false`/`null` in each new instance. This is relevant for the two-effect paginator reset pattern.

### ℹ️ `Family.jsx` renders `<Species />` as a child → different instance from `/especies`
When navigating from `/familia/:slug` to `/especies/:id`, React unmounts Species from Family and mounts a new independent Species. No instance reuse between routes of different tree depth.
