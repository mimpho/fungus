# Gotchas and Known Restrictions

Pitfalls and errors we've already encountered. Consult before modifying these areas.

---

## Mobile — expo-secure-store

### ⚠️ `expo-secure-store` no disponible en web → crash silencioso en API calls

`SecureStore.getItemAsync()` lanza `TypeError: ... is not a function` cuando se ejecuta en entorno web (Expo web / browser). `apiFetch` llama a SecureStore antes de cada petición, así que **todas las llamadas a la API fallan** en web sin mostrar un error CORS ni de red.

**Síntoma:** pantalla de zonas muestra "No se pudieron cargar los datos en tiempo real" + 0 zonas, sin error CORS en DevTools.

**Solución implementada:** `_getToken()` / `_saveToken()` / `_clearToken()` en `services/api.ts` con `Platform.OS === 'web'` que hace fallback a `AsyncStorage`. Nunca llamar `SecureStore` directamente fuera de estas wrappers.

---

## Mobile — Zone IDs

### ⚠️ `Number(z.id)` → `NaN` si la API devuelve UUIDs o strings no numéricos

El hook `useZones` normalizaba los IDs de zona a `number` con `Number(z.id)`. Si la API devuelve UUIDs (`"550e8400-..."`) o cualquier string no numérico, `Number()` devuelve `NaN` → `keyExtractor` de FlatList genera claves `"NaN"` duplicadas → warning de React + comportamiento indeterminado.

**Solución implementada:** `Zone.id` es `string` en todo el sistema mobile. `ConditionsMap` usa `Record<string, ZoneConditions>`. La normalización usa `String(z.id)` en lugar de `Number(z.id)`. Nunca convertir IDs de zona a `number`.

---

## Mobile — Zustand

### ⚠️ Selector returning an object causes infinite re-render loop

Zustand uses `Object.is` for comparison by default. A selector that returns a new object literal on every call always looks "changed", causing infinite re-renders.

```tsx
// ❌ WRONG — new object on every render → infinite loop
const { t, lang } = useAppStore((s) => ({ t: s.t, lang: s.lang }))

// ✅ CORRECT — useShallow does shallow property comparison
import { useShallow } from 'zustand/react/shallow'
const { t, lang } = useAppStore(useShallow((s) => ({ t: s.t, lang: s.lang })))

// ✅ Also correct — single primitive value, no object needed
const t = useAppStore((s) => s.t)
```

**Rule:** any `useAppStore` call that returns an object **must** use `useShallow`. Single-value selectors don't need it.

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

### ⚠️ Open-Meteo counts days in UTC, not in the local timezone

`date.today()` in a script run in Madrid between 00:00 and 02:00 is already the next UTC day, and the forecast range it builds goes past Open-Meteo's limit (the request is rejected). Use `datetime.now(UTC).date()` for any range sent to Open-Meteo (`export_zone_climate.py` was fixed on 2026-10-17).

### ⚠️ One free daily limit for everything (10,000 calls/day per IP)

The ingest, backfills, the `weather_cache` refresh job (~200/day since 2026-11-11, once a day; it was ~1,600 every 3 h) and the card's live fallback all share it. A request over 2 weeks counts as days/14 calls. Do not run a large backfill (~9,000 calls) on the same day as normal traffic; the weather job stops itself at `WEATHER_DAILY_CALL_BUDGET` or on the first 429. Since 2026-11-11 the connector does the same for every caller: a quota 429 is never retried and pauses all Open-Meteo calls of the process until the limit resets (`rate_limit_pause()`); a point that failed is not asked again for its `retry_after` (60 s for other failures). `elevation=nan` in a one-day archive URL is `resolve_grid` (the cell's mean elevation), not a bug.

---

## Backend — Database

### ⚠️ A running local back end does not apply a new migration, and the front end then says «No se ha podido conectar»
Alembic runs when the API **starts**; `uvicorn --reload` only reloads the code. After pulling or writing a migration, the running API has models that expect columns the local database lacks, so every query on that table answers 500 (login included). The front end's `translateApiError` turns any detail it does not know into `errRed` («No se ha podido conectar»), which reads as a network problem. Check with `alembic current` against `alembic heads` in `backend/` (host must be `localhost`) and run `alembic upgrade head`, or restart the API.

---

## Backend — Logging

### ⚠️ Alembic's `fileConfig()` disables the app's loggers

`migrations/env.py` loads the logging config from `alembic.ini`, which disables existing loggers by default and sets the root logger to `WARN`. Run inside the API (startup migrations), that silenced every `app.*` INFO log on Render. `env.py` now calls `fileConfig()` only when the root logger has no handlers (Alembic CLI), with `disable_existing_loggers=False`.

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

### ⚠️ Overriding Leaflet's CSS: `leaflet.css` is imported after `styles.css`
`main.jsx` imports `leaflet/dist/leaflet.css` after `./styles.css`, so a rule in `src/styles/map.css` with the same specificity as Leaflet's loses (the attribution kept its white background while the colour worked). Raise the specificity, e.g. `.leaflet-container .leaflet-control-attribution.leaflet-control`, instead of relying on order or `!important`.

### ⚠️ `attributionControl.removeAttribution()` keeps the slot of the credit
Leaflet only lowers the count of a removed credit to 0 and keeps its key, so a credit added again takes its old place in the line (the «Fuentes» link came before «Datos»). To keep an order, delete the slot after removing (`delete ctl._attributions[text]` when it is 0; private API of Leaflet 1.x). Done in `ObservatoryMap`.

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

### ⚠️ Resend: `EMAIL_FROM` must be on a verified domain, or `onboarding@resend.dev`
With no domain verified in Resend, `EMAIL_FROM` set to a Gmail address made every send fail with 403 «Domain not verified: Verify gmail.com or update your from domain» (from ~2026-11-04, when the production variables were set, until 2026-11-11). `gmail.com` cannot be verified: verifying needs control of the domain's DNS (SPF/DKIM records), and the same goes for `fungus.vercel.app`. `send_ops_alert` logs only `Client error '403 Forbidden'`, not Resend's reason; the reason is in Resend → Logs (open the request).

**Fix in place:** `EMAIL_FROM=Fungus <onboarding@resend.dev>` (the default in `config.py`). That sender only delivers to the email of the Resend account, so the ops alerts arrive but the sign-up verification email to any other user cannot be sent (see `pending.md`).

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

---

## Observatory — local runs and styles

### ⚠️ The backend reads `backend/.env` only, not `.env.local`
`app/config.py` loads `env_file=".env"`. `.env.local` is a Vite convention for the frontend; a setting such as `OBSERVATORY_MAX_NEW_CELLS_PER_USER_PER_DAY=0` put there does nothing, and the 429 «Daily limit of 10 new areas per user» keeps coming. `uvicorn --reload` does not reread `.env` either. For a one-off run without touching `backend/.env` (which points to production), put the variable in front of the command: `OBSERVATORY_MAX_NEW_CELLS_PER_USER_PER_DAY=0 python -m uvicorn app.main:app --reload`. The per-user and the global limit show the same message; the body of the 429 or the 503 says which one it is.

### ⚠️ Colour tokens are comma-format: `rgba(var(--x), a)`, never `rgb(var(--x) / a)`
`--color-cream-rgb` and `--color-bar-rgb` hold `r, g, b` with commas. `rgba(var(--color-cream-rgb), 0.6)` works; `rgb(var(--color-cream-rgb) / .6)` is invalid and the property is dropped silently (the custom checkboxes had invisible borders in the dark theme because of it).

### ⚠️ A page-local score band list is descending
`SCORE_BANDS` runs from `high` to `low` (`min` 85/70/55/30/0). Reversing it before drawing band rectangles gives negative SVG heights.

### ⚠️ Photos attached in the chat lose their EXIF
Pictures sent to Claude through the chat arrive recompressed without EXIF (no GPS, date or phone model). For field photos keep the originals in `local-data/field/` (excluded from git) and read them from there; their GPS is the evidence, so never publish them as they are.

### ⚠️ `/observatory/point` is the prefix of the Observatory router
`routers/observatory.py` has `prefix="/observatory/point"`. A route added there for something that is not a point lands under `/observatory/point/...` and the front gets a plain `{"detail": "Not Found"}`, which `observatoryService` shows as «Todavía no hay datos de clima para este punto» (every 404 reads like that). Anything that is not a point needs its own router (the territory one existed briefly and was removed on 2026-10-18), included in `main.py`. Check `/docs` after adding an endpoint.

### ⚠️ Local runs do not migrate, so a new table does not exist locally
`backend/.env` points at the production database and migrations are skipped locally (`RUN_MIGRATIONS_ON_STARTUP`). Code that needs a new table must keep working without it: a store can fall back to process memory, as the removed territory rain store did. Do not run `alembic upgrade head` from local just to test.

### ⚠️ Open-Meteo counts calls by range: a big first pull is not free
Requests over 2 weeks count as several calls (4 weeks = 3.0 in their example) and the page does not say how locations count. The removed territory rain asked for 55 locations and was estimated at ~770 calls for a full pull (the project measured ~7 weighted calls for 280 days of one cell, which would give ~250); that is why it was not shipped. Keep the same caution for the server-side cell ingestion of 7a. Free limit: 600/min, 5,000/hour, 10,000/day.

### ⚠️ Sessions on the linked device run Python 3.10
The project needs 3.11+ (`datetime.UTC`). For tests in a session: `uv venv /tmp/vv --python 3.12`, install the project there (outside the repo) and delete it afterwards.

### ⚠️ Open-Meteo `elevation` needs one value per coordinate
A batched request with several locations and `elevation=nan` once returned HTTP 400 (count mismatch). Send one `nan` per coordinate (`",".join(["nan"] * len(points))`), as `resolve_grid_batch` does; the answer says which grid cell and elevation each point falls in.

### ⚠️ The Open-Meteo cell grid is not 0.1° and its rows do not line up
A cell is ~0.0703° × 0.1272° near 41.6° N, the width in degrees changes with the latitude and every row has its own offset. Never infer the cell size from all the stored longitudes together, and never assume the cell below is at the same longitude. Use `build_grid` (per-row estimate) in `cell_discovery.py`.

### ⚠️ Discovery fills the daily new-cell allowance
`ingest_cells.py discover` creates ~400 cells with `created_by` NULL in one day; they count in `observatory_max_new_cells_per_day` (global, 60) so users may be refused new cells that day. Run it when that does not matter, or after raising the limit for the day.

## Observatory — conditions layer

### ⚠️ Rasters are raw `.bin` files built by scripts, not committed (except elevation)
Forest and substrate rasters live in `local-data/` (out of git) and are built with `scripts/build_forest_raster.py` / `build_substrate_raster.py`; the elevation raster is in `frontend/public/data/`. Their endpoints are private (login) because the MCSC-4 and relief licences are unconfirmed. In production they come from the private bucket `geo-rasters` (`forest/`, `substrate/`), downloaded at start-up by `services/raster_loader.py` when `RASTERS_BUCKET` is set. Tests redirect the raster dirs to tmp (`conftest.py`).

### ⚠️ Rebuilt a raster? Upload the `.bin` and the `.json` together
`raster_loader.py` accepts a raster only if the `.bin` has exactly `classes x width x height` bytes of its `.json`. Uploading one without the other (or after changing the classes) makes the download fail the check; the API then starts with `rasters: degraded` in `/health` and an ERROR in the log, and scores leave out forest or soil. After a deploy, look at `/health` (`rasters`, `rasters_missing`): `status` stays `ok`. The download repeats at every start (Render's free disk is ephemeral) and `RASTERS_REQUIRED=true` turns a failure into an aborted start.

### ⚠️ Layer cache is per process
`layer_cache.py` is an in-memory LRU; it invalidates through `SqlCellStore.data_signature()`, so a cell refresh changes the key. Several workers do not share it.

### ⚠️ Cache-Control middleware keeps a route's own header
`main.py` only sets its default when the response has no `cache-control`; routes that set their own (layer endpoints) rely on this.

### ⚠️ Edibility `excelente`
`/point/species` once ignored `excelente`; the ensemble depends on `EXCELLENT` in `point_species.py`.

### ⚠️ v2 `needs` / `fit_parts` / `compute_v2_multi`
The ensemble counts a species only if altitude fit ≠ 0 and the product of `fit_parts` ≥ 0.05. Change `scoring_v2.py` and `layer_probability.py` together.

### ⚠️ Map vs point differences
Map forest is smoothed client-side per pixel; the server judges the 500 m mean at the point. Expect a few points of difference and float rounding at exact colour thresholds (float32 vs float64). A forecast day of the layer can also differ 1–3 points from the point calendar: the layer starts the model window 100 days before the chosen day, the calendar 100 days before the last observed day.

### ⚠️ Local DB port
The local database answers on 5433 or 55432 depending on the setup; check before running `check_layer_probability.py`.

### ⚠️ A forecast older than 2 UTC days leaves holes in the layer
The layer only shows a forecast fetched on one of the two UTC days before today or later (`forecast_fresh_since`). If the daily cell refresh does not run (budget 0, a failed night), the cells with an old forecast come without score for days ahead and the map shows a cut, often a straight edge: cells load in id order, so they share a download day. `python -m scripts.ingest_cells status` lists the forecast by download day and marks the stale ones; `refresh --max-calls 1500` fixes it (a few cells may fail with transient 503s: run it again).

### ⚠️ `ingest_cells.py` writes where `DATABASE_URL` points, and `backend/.env` points at production
For the disposable database put the URL in front of the command: `DATABASE_URL="postgresql+asyncpg://…@localhost:55432/fungus" PYTHONPATH=. python -m scripts.ingest_cells status`. Without it `refresh`, `load` and `discover` write to production.

### ⚠️ `multiply` on the relief only blends because the layer pane is a sibling of the tile pane
`mix-blend-mode` on the `obsLayer` pane blends with what is under it in the same stacking context (Leaflet's map pane). Moving the pane inside another stacking context (or giving it `isolation`) makes the blend do nothing. Place names of the dark maps live in their own pane (`obsLabels`) above the layer so they are not tinted.


### ⚠️ The user menu shows the generator only to `role = 'admin'`, and it opens the gallery
`/admin/generator` is the hub: it shows the gallery, and the generator loads only with `?especie=…&generar=1` (a species picked in the gallery). A local user is not an admin until `users.role` is set: `UPDATE users SET role = 'admin' WHERE email = '…';` on the disposable database (`docker exec -it fungus-ingest-test psql -U postgres -d fungus -c "…"`), then reload so `/me` returns the role.

### ⚠️ `seed_catalog.py` wrote to production (2026-10-24)

Run without `DATABASE_URL` it used `backend/.env`, which points at production. It overwrote the name, coordinates, altitude, forest type and description of every zone in the mock, and replaced the `extra_data` of all 202 species (synonyms, confusions, translations, fruiting conditions, `antiConfusion`). Restored from `migrations/*.sql` and checked against the Supabase snippets: the only things the SQL files could not give back were `antiConfusion` of `esp-062` (restored by hand) and the altitudes of the 17 moved zones (recomputed with `zone_elevation_ranges.py`). Eleven species whose fruiting conditions the 2026-03-14 audit had cleared got them back from the `015` session-B files; clear them again if they should stay without. Now guarded (see the changelog), but **any other writing script still trusts `backend/.env`**: put `DATABASE_URL` in front of every command that writes, and check it with `echo`.

### ⚠️ What the Supabase tools can and cannot tell you about past SQL

The free plan has **no backups**. The SQL editor's saved snippets keep only the **last content of each tab**, and `supabase snippets list` shows only the first page (10) with no way to ask for the next one; the API takes a `cursor`. A token with the scoped permission «SQL Snippets (read)» is refused (403): that capability enables no endpoint yet; a full-access token works. Treat the `migrations/` folder as the only record of data changes.

### ⚠️ Every GET except `/species` is cached by the browser for an hour
`add_cache_control` (`app/main.py`) sets `Cache-Control: public, max-age=3600` on any 200 GET whose **path** has no `/species`; the query string does not count. `/observatory/point/species` is `no-store`, but `/observatory/point/snapshot?species=…`, `/series` and `/calendar` are kept: after a change of catalogue data the species list shows the new score and the thermometer the old one. Found 2026-10-26 (a thermometer stuck at 2 while the list said 16). While debugging: DevTools → Network → «Disable cache» and a hard reload. `public` on responses that need login is also wrong; a fix (`private, max-age=60` under `/observatory/`) is pending.

### ⚠️ An exported `DATABASE_URL` wins over `backend/.env`
`app/config.py` is a `pydantic-settings` class: an environment variable beats the `.env` file. A terminal that once ran `export DATABASE_URL=…` (a disposable database) keeps it, so the backend reads that database while `backend/.env` says production, or the other way round if you unset it. Check what the process really uses: `echo $DATABASE_URL | sed -E 's#//[^@]*@#//***@#'` in the terminal that started it. For one-off runs put the variable in front of the command, never `export` it. The same goes for `VITE_API_BASE` on the Vite dev server (a forced port 8001 once left the frontend talking to a backend that was not running).

### ⚠️ Local runs against production fail on the Observatory tables
Production is at Alembic 016 until the epic is deployed, so a backend started on `backend/.env` answers 500 (`relation "cell_lookup" does not exist`) on every `/observatory/*` route. That is expected; test the Observatory on the disposable database (`fungus-ingest-test`, port 55432), where the catalogue, 423 cells and the migrations up to 021 are. Never run `alembic upgrade head` from local against Supabase (rule 21 of `agents.spec.md`).

### ⚠️ The soil class comes from the bedrock, the pH that matters is the topsoil's
`substrate_classes.py` maps the ICGC lithology (1:250,000) to three classes with typical pH ranges; carbonated rock is «calcáreo» (7.0–8.3). Under forest the topsoil on limestone is often decarbonated and acid (black trumpets are recorded on calcareous bedrock with bilberry), so a species with an acid range can be penalised on a point that is acid where it grows. The 46 % soil factor of a *B. edulis* at a point near La Molina came from a pure acid class and a catalogue range of 5.5–6.5.

### ⚠️ A modal that closes its parent: React events cross portals, Esc crosses dialogs
Two ways a dialog opened over another closed both: (1) a click that React bubbles from a portal up its React parent (a × inside a clickable area opens that area: stop the propagation in the button); (2) one Esc press heard by every `keydown` listener on `document`, the dialog above first, which unmounts it before the next listener looks (`useDialogAboveObsModal` now gives its slot back with a `setTimeout(0)` so the dialog under still sees it open). Any new overlay over an `ObsModal` should call that hook.

### ⚠️ A history entry without the query string resets the Observatory
`navigate(location.pathname, …)` drops `?lat=…&lon=…`, which is the Observatory's view state, and the observed zone (with whatever is open over it) closes. Keep `search` and `hash` when pushing an entry on the same page.

### ⚠️ A local database one migration behind answers 500, not a clear error
`fungus-ingest-test` was at Alembic 020, and the first photo upload failed with a 500 on the missing `corner_usage_events`. After pulling a branch with a migration, `alembic current` against the local database (with `DATABASE_URL` in front) tells which one is missing.

### ⚠️ Tailwind breakpoints are the window's, not the dialog's
`lg:` and `xl:` look at the browser window; a dialog (`ObsModal`, `max-w-7xl` with its margins and padding) and the panel inside it are narrower, so a grid that should change «when there is room» changes late. For a part inside a dialog use a container query with an arbitrary variant (Tailwind 3.4 has no container plugin here): `[container-type:inline-size]` on the parent and `[@container(min-width:56rem)]:grid-cols-4` on the grid (the filter panel of `SavedPointsList`). The cards' grid still uses the window's `xl:` and is only 4 columns when the window is at least 1280px.

### ⚠️ A search in the dialog's title line is a portal, not a child
The desktop `ObsModal` header has a slot (`ObsModalHeaderSlot`); the content portals into it. The slot is null on the first render (it is set by a ref callback) and on a phone sheet, so the content must draw the same element inline in that case.

### ⚠️ A `fixed` child of the Observatory page is placed against the page, not the screen
The page is wrapped in `anim-up` (a transform): a `position: fixed` descendant is then measured against it, so a full-screen map inside it started below the site's header and its bottom sheet ran off the screen. Anything that must cover the viewport (the phone's map, the zone screen) is drawn with `createPortal(…, document.body)`, like `ObsModal`. `inPortal` in `pages/Observatory.jsx`.

**Same cause, second symptom (2026-11-06):** `anim-up` is `animation: … both`, so its element keeps a stacking context after the animation, and a `fixed z-[150]` child inside it still sits under the site's header (`z-40`, outside it). The authenticated Observatory root therefore has no `anim-up` (`isAuthenticated ? undefined : 'anim-up'`); anything full-screen added to a page with `anim-up` needs the portal.

### ⚠️ A horizontally scrolling row widens its grid's implicit column
`grid` without a template has one `auto` column sized by the content; a `flex` row with `overflow-x-auto` still contributes its full min-content width, so the column (and the cards sharing it, the calendar beside the forecast) overflowed the screen. Give the grid `grid-cols-[minmax(0,1fr)]` (and `min-w-0` to the cards in it) wherever a slider lives in one.

### ⚠️ A CSS-hidden first child still takes `space-y`
`space-y-*` skips only `[hidden]` siblings, not `display: none` from a class (`lg:hidden`): the next sibling got the column's top margin and the desktop's left column started 16px lower than the right one. Draw the variant only when it applies (`useMediaQuery`) instead of hiding it.

### ⚠️ The forest raster's class order is `CLASSES`'s order: change one, rebuild the other
The `.bin` holds one byte plane per class in the order of `forest_classes.CLASSES`, and `forest-catalonia.json` lists them; the client reads the planes by `meta.classes`. Adding or renaming a class without running `build_forest_raster.py` (and uploading the result) leaves the back end and the map reading different layouts.

### ⚠️ Group keys in `forest_affinity` (`pinar`, `otro`) are not classes
`clean_affinity` expands a group weight to each of its classes that has no number of its own, so `{"pinar": 0.3}` and the five pine classes at 0.3 are the same; a class set to 0 stays out even if its group has a weight. A species that already has per-class weights and a new class is not listed there gets nothing for it. Migration `046` must run after the new back end is deployed: the old one only knows the five old keys and falls back to `forest_types` for a species whose affinity it cannot read.

### ⚠️ The mock catalogue must follow every SQL data migration of the species
`seed_catalog.py` merges the mock's `extra_data` over the stored one and the mock's keys win (`forest_affinity` is replaced whole, `ph_suelo_min/max` one by one). A migration that changes those keys in the database but not in `src/data/species.js` is undone by the next seed run (it now needs `--allow-remote` against production, but it can still happen). Change both in the same branch; `047` and `048` did, and `046` was brought in line with them on 2026-11-03.

### ⚠️ Packing `backend/` for the cloud tests also packs `backend/.env`
`backend/.env` points at production. A plain `tar` of `backend/` takes it, and it ended up in the cloud environment on 2026-11-03 (removed there and from the staged copy). Always exclude it: `tar czf … --exclude=.venv --exclude=__pycache__ --exclude=.pytest_cache --exclude=.ruff_cache --exclude=backend/.env backend`, and check with `tar tzf … | grep -c 'backend/\.env$'` (it must print 0). The package goes in `local-data/_to_delete/` (out of git; the device shell cannot delete there).

### ⚠️ Compressing responses: Render's proxy already does, and Starlette's `GZipMiddleware` defaults to level 9
Render's proxy compresses JSON with brotli when the origin does not (`content-encoding: br` on `/api/v1/zones`, 2026-11-04); whether it does for `application/octet-stream` (the rasters) is unknown. Starlette's `GZipMiddleware` compresses at `compresslevel=9` by default (about 11 times the CPU of level 6 for ~2% fewer bytes on the rasters, painful on a 0.1 CPU instance) and, if the server announces the `http.response.pathsend` extension (uvicorn 0.41 does not), silently skips `FileResponse`. If compression is added, set the level explicitly, send `Vary: Accept-Encoding`, and check the result in DevTools: the tests (httpx `ASGITransport`) do not go through Render's proxy. See `decisions.md`.

### ⚠️ The linked device cannot install packages or build the front end
Its sandbox had 36 MB of free disk on 2026-11-05 (`npm` fails with `ENOSPC`), Node 22 against the `.nvmrc`'s 24, Python 3.10, and `node_modules` built for macOS. The cloud environment can clone the public repository at a pushed branch and run `npm ci && npm run build` (it has no `.env`); for work that is not pushed, pack it excluding `backend/.env`, `.env.local` and `local-data/`. The durable fix is a frontend job in CI (see `pending.md`).

### ⚠️ The repository is public
`https://github.com/mimpho/fungus` answers without credentials. Anything pushed is public: keep the data derived from CREAF's MCSC-4 in `local-data/` and in the private buckets, never a `.env` or a dump, and do not use GitHub Actions artifacts for anything with user data.

---

## Frontend — sizes in rem with an 18px base font

### ⚠️ `w-5`, `h-11` and other rem utilities are 12.5 % bigger than Tailwind's names suggest

The site's base font is 18px (`system/project.spec.md`, design system), so `1rem` = 18px: `w-5` is 22.5px, not 20px; `h-11` is 49.5px, not 44px. In a control drawn to exact pixel sizes (a switch, a 44px touch target, a 76px rail) the parts stop adding up: the switch's thumb in `PanelSwitch` sat off-centre. **Rule:** for controls taken from a design with px measures, use arbitrary px values (`w-[20px]`, `h-[44px]`).

## Frontend — Tailwind colours without opacity channels

### ⚠️ `bg-coffee-light/20` draws nothing

`coffee-light` is mapped in `tailwind.config.js` to a plain `var(--color-coffee-light)`, without an RGB channel, so Tailwind cannot apply an opacity modifier: `bg-coffee-light/25` produces no rule and the element has no background (the «saved-count» badge of the Zonas panel used it until T4 of `epic/observatory-navigation`, which gave it solid tokens `--count-badge-*`). **Rule:** for a tinted fill of a colour without `--…-rgb`, use `color-mix()`: `bg-[color-mix(in_srgb,var(--color-coffee-light)_20%,transparent)]`. Colours with `withOpacity('--color-…-rgb')` (cream, coffee) take the modifier.

## Frontend — the local back end is not production

### ⚠️ No forecast days in the Observatory locally

The local back end's `DATABASE_URL` may point to a database on `localhost` (it did on 2026-11-11), not to production: `/health`'s `last_ingest` then differs from production's. Without the daily `cell_refresh` the cells have no fresh forecast and the layer answers `max_date` = `last_data_date`: the day slider shows no forecast stretch and «incluye previsión» never appears. Not a front-end bug; check forecast behaviour in production or with the database switched by Marcos.

## Frontend — heavy work in an effect after a click

### ⚠️ React runs the effects of a click before the browser paints

For discrete events (click, key) React 18 flushes the passive effects synchronously, before the next paint. A heavy effect (working out the conditions layer picture, ~seconds) then holds the frame and the control that was clicked does not change until it ends: the Meteo switch flipped on only after the map was drawn. **Fix:** put the heavy part off until after the next paint (`afterPaint` in `ObservatoryMap.jsx`: `requestAnimationFrame` + `setTimeout(0)`) and report it as loading meanwhile.

## Frontend — QA in the shared browser pane

### ⚠️ Testing in the user's own browser pane leaves `localStorage` choices behind

The Observatory remembers the base map, the tab switches and the forest classes per browser. QA done by Claude in the same browser pane the user then looks at leaves those choices set (the relief base map stayed after a test and looked like the new default). **Rule:** after QA, put back what was changed (`fungus-obs-basemap`, `fungus-obs-data`, `fungus-obs-corners`, `fungus-obs-forest`) or say which keys were touched.

### ⚠️ The 18px base also inflates `text-*`, `w-*`, `h-*` and `size-*` in cards (found 2026-11-13)

Seen on real phones: `text-3xl` is 33.75px, `w-[9.5rem]` 171px, `w-10` 45px (not 40). Cards that looked right in a 1280px mock were too big on a phone. Use arbitrary px values (`text-[22px]`, `w-[40px]`) and set the desktop size with `sm:`; **measure with `getBoundingClientRect` / `getComputedStyle`, not by eye** (a `w-10` icon measured 45px).

## Frontend — transitions and busy threads

### ⚠️ `transition-colors` on elements that swap fill and text colour freezes mid-way when the thread is busy

The Vista button (open: green fill, white text; closed: light surface, dark text in the light theme) kept `transition-colors`. Changing the base map holds the main thread, the transition stalls near its start and the text stays white on a near-white fill: it «vanishes» in the light theme only (in dark both ends read). **Rule:** no transition on elements that swap fill and text colour together; instant. The same family on the phone: a sheet that folds with `grid-template-rows` (main thread) must not share its 300 ms with heavy work; run the heavy change after the fold (`chooseBasemapAfterFold`, `SHEET_MS + 40`).

## Frontend — URL state, keys and animation (found 2026-11-15, T1 of `epic/observatory-species-filter`)

### ⚠️ `setSearchParams(prev => …)` gives every call of the same tick the same stale `prev`
React Router's functional form does not queue: two writers in one tick (Meteo's `capa`/`dia` and the species' `seta`) undid each other, and a mistyped `seta=nope` stayed in the URL after being dropped. `useObservatoryView` keeps a ref with the params as last written (`latest`) and each setter builds on it.

### ⚠️ `stopPropagation()` on a React `keydown` also hides the key from `document` listeners
React listens at the root, so stopping a synthetic event stops the native one before it reaches `document`. The species field stopped Esc to close its dropdown, and the species' sheet (a portal, listening on `document`) never heard it: both closed or neither did. While the sheet is open the field ignores Esc (`holdRef`).

### ⚠️ Animate a flex half with `min-width`, never with `auto` or by swapping `grow`/`basis`
`flex-basis: auto` cannot be animated (a jump), and moving `flex-grow` and `flex-basis` together makes the width dip by a pixel or two mid-way even when both ends are 50 %. The search bar's halves are always `flex: 1 1 0`; the one that needs more raises its `min-width` (a number it measures with a canvas) and nothing moves while the name fits in 50 %.

### ⚠️ The QA pane does not paint frames while it is idle
`getBoundingClientRect` and computed styles of a transition stay at the start value until something forces a frame (a screenshot). Measure final states after a screenshot; to judge the animation itself use a real browser. Transitions under test: also turn the `transition` off to measure a colour (`* { transition: none !important }`).

### ⚠️ `search-light-input::placeholder` is 3.3:1
The shared class draws the placeholder at 0.55 opacity (cream on `#4c5240`). Where a placeholder is the field's label (the map search) raise it: `placeholder:!opacity-80` gives 5.1:1 dark and 7.5:1 light.

### ⚠️ Safe areas: use `--safe-top` / `--safe-bottom`, and only Layout touches the viewport meta
`viewport-fit=cover` is set by `Layout` (the Observatory, and wherever there is no header); a page setting it by itself would undo it on unmount. With `black-translucent` the iPhone's installed app draws under the status bar (white icons): anything fixed to the top adds `var(--safe-top)`, and scrolling pages get `.status-strip`. To try it on a computer, set `--safe-top` on `<html>`. Not yet seen on a real iPhone.

### ⚠️ A fullscreen map reaches under the camera hole
With `viewport-fit=cover` `env(safe-area-inset-top)` is real, but some browsers report 0 in fullscreen: the search bar and the hint start at `max(env + 12 px, 52 px)` while the phone is in fullscreen (the floating menu button, 36 px at 8 px from the top, sits in that strip) (`fullscreenTop` in `pages/Observatory.jsx`). To confirm on a real Android and iPhone.


### ⚠️ An unselected segment in `text-cream/80` on `bg-cream/[0.08]` is 4.33:1 (found 2026-11-15, T3 of `epic/observatory-species-filter`)
The Hábitat control used Meteo's inactive style and measured 4.33:1 in dark. Use `text-cream` for an enabled, unselected segment (5.7:1 dark, 12.4:1 light). Meteo's own enabled segments should be measured the same way; the disabled ones (Lluvia, Temp., Viento) are exempt.


## Frontend — bottom sheets (found 2026-11-15, T4 of `epic/observatory-species-filter`)

### ⚠️ A hook declared after an early `return null` crashes when the condition flips
`SpeciesSheet` had a `useRef` below `if (!speciesId) return null`; removing the filter rendered fewer hooks than before and React threw «Rendered fewer hooks than expected» (the page went blank). Every hook goes above the first return.

### ⚠️ A `max-height` taken from the element's own `scrollHeight` is circular
The point's sheet set `max-height` from what it measured, and the content could not grow past it, so it never measured the real height again (a scroll bar appeared after folding and unfolding). Measure the **content wrapper** (a child that is not clamped) plus the paddings as constants, and add 2–3 px of slack so a rounded height never raises a scroll bar. A scroll bar also shifts everything by its width: it moved a × 6 px against its neighbour.

### ⚠️ An effect that skips work «if the element is the same» breaks under StrictMode
`useSheetDrag` skipped rewiring when `el` equalled the one it had wired; StrictMode runs the cleanup and the effect again, so the listeners were gone. The cleanup now forgets the element too.

### ⚠️ The ring of a button is drawn outside its box
A `ring-2` / `border` outside the button is clipped by the scroll area it ends in (the last button of the point's sheet lost its bottom edge). Leave a few px under the last element.


## Frontend — Tailwind arbitrary values, the clipboard and testing themes (found 2026-11-19, zone's species sheet)

### ⚠️ `bg-[linear-gradient(…)]` is read as a colour; the layers must all be images
Tailwind guessed a colour for `bg-[linear-gradient(...),var(--gradient-b)]` and emitted nothing usable. Write `bg-[image:linear-gradient(...),linear-gradient(var(--c),var(--c))]`: the `image:` hint, and a flat colour as a layer is only valid as a `linear-gradient(c, c)`.

### ⚠️ The `--color-*-rgb` tokens are comma-separated: `rgb(var(--x)/0.4)` is invalid
`--color-coffee-rgb` is `139, 111, 71`, so use `rgba(var(--color-coffee-rgb), 0.4)`. The browser drops the declaration silently (the element stays transparent), so check `getComputedStyle(el).backgroundImage` when a new surface shows nothing.

### ⚠️ `navigator.clipboard.writeText` needs a focused page and a user gesture
A click simulated from the console (or a page without focus) is rejected; a real click works. `PointFacts` falls back to a hidden textarea and `execCommand('copy')`, and tells the user when both fail.

### ⚠️ Emulating the light theme in the built-in browser does not always reach the app
`resize_window colorScheme` changes `prefers-color-scheme`, but the app keeps its own `themeMode`; to look at a theme, set `document.documentElement.setAttribute('data-theme', 'light' | 'dark')` (it resets on reload).

---

## Frontend — dev double mount, HTTP cache, Leaflet limits, filters (found 2026-11-25, `ccr-11b63324-2lx2eg`)

### ⚠️ A «mounted» ref set to `false` in a cleanup stays `false` in development
`<React.StrictMode>` mounts, cleans up and mounts again. `useEffect(() => () => { alive.current = false }, [])` leaves `alive` false for good, so a guard `if (!alive.current) return` swallowed every answer of the «Mi ubicación» button (a spinner for ever, no bubble, no move) while production, with one mount, worked. Set it in the effect's body too: `alive.current = true; return () => { alive.current = false }`.

### ⚠️ The browser keeps every GET for an hour (`Cache-Control: public, max-age=3600`)
`add_cache_control` in `app/main.py`: a field added to an endpoint (`trend` in `/point/snapshot`) did not show in the browser that had the answer cached, with the back end already updated, and a nearby point (another URL) did. When a new field «does not arrive», hard-reload, or look at the URL in Network (`(disk cache)`), before reading the back end's code.

### ⚠️ `setMaxBounds` recentres the map when the limits are smaller than the screen
Leaflet keeps a view larger than the bounds centred on them. Growing the drag limits by the width of a panel (so that the east of Catalonia can be dragged out from under it) moved the whole map left by half the panel each time one opened, but only when Catalonia was fully in view. `fitDragBounds` now grows them only when the limits are wider than the screen.

### ⚠️ `filter: drop-shadow` on a parent
It follows what is painted (the gap between two halves, a dropdown), which is why the double search uses it for one shadow; but a `backdrop-filter` inside it stops blurring (the surfaces there must be opaque), and a child's own `box-shadow` is shadowed again, so give the children none.

### ⚠️ In this app `1rem` is 18 px
`pb-6` is 27 px and `36rem` is 648 px; a layout that must meet a measure in px (the 24 px by which the sheets go under the tab bar, a photo's height) needs `[24px]`, not a `rem` class. It cost a 3 px gap under the species' photo.

### ⚠️ A class cannot override an inline `style`; a custom property can be given back with `inherit`
`TINT_STYLE = { '--color-cream-rgb': '255, 255, 255' }` (white text on the dark sheet) could not be undone by a light-theme class. Use classes: `[--color-cream-rgb:255,255,255] [[data-theme=light]_&]:[--color-cream-rgb:inherit]`.

### ⚠️ Geolocation in Brave
`getCurrentPosition` can hit its timeout with the permission granted for the site (the macOS settings too): Brave turns off Google's location service by default (`brave://settings/privacy`). It worked in production in the same browser, so a local failure there is not necessarily the code; read `error.code` (1 refused, 2 unavailable, 3 timeout).

