# Design and Architecture Decisions

Decisions made during active development, with their reasoning. Complements CLAUDE.md.

---

## Product pivot — Observatory first, mobile app paused (2026-10-10)

**Decision:** The web Observatory (scoring v2 + Observatory page) is the priority. The Android app (v8.0) is paused with scaffold, navigation, design system, theming and the zones screens done; species, map, auth, polish and EAS build pending.

**Deviation from `system/workflows.spec.md`:** `epic/v8-android` was merged into `main` (PR #119, merge commit) **without release tag and without closing the epic**, while the app is incomplete. Reasons: everything should live in `main` as the base for the Observatory work; the web theming and fixes inside the epic (light theme, profile tabs) are already valuable in production; `mobile/` is an isolated Expo project, so having it in `main` does not affect the web build, the API or Vercel/Render deploys. The `vX.Y.0` tag and the epic close are deferred until v8.0 is finished.

**Consequences:**
- The Observatory gets its own epic, `epic/observatory`, cut from `main`; its `feat/`, `fix/` and `chore/` branches are cut from that epic as usual.

---

## Epics are named, not numbered, until delivery (2026-10-10)

**Decision:** epics and their branches carry a name (`epic/observatory`, `feat/observatory-scoring-v2`), not a version. The version is assigned when the epic is merged into `main`: next free MINOR and tag `vX.Y.0`. The roadmap lists planned epics by priority without numbers.

**Why:** a number on a planned epic implies a sequence that does not exist yet. Reprioritising (today SEO went from v9.0 to v10.0 and back to unnumbered) forces renaming docs and branches, and the numbers stop meaning anything; `/health` still reports 7.1.0 while v8 is already in `main`. The version should describe what was delivered and in what order.

**Details:**
- `system/workflows.spec.md` updated: branch naming (`epic/<name>`, `feat/<epic>-<topic>`), a Versioning section, and the tag rule (version assigned at merge to `main`).
- Legacy: `epic/v8-android` and its `feat/v8-*` branches keep their names; v8.x stays reserved for the Android app.
- The `v2` of the scoring is a model version (`model_version` in `score_detail`), unrelated to product versions.

**Discarded:** keeping sequential numbers and renumbering on each reprioritisation (churn, wrong history); using dates as epic names (do not say what the epic does).
- `memory/pending.md`: Observatory block first; the v8.0 block is marked paused.
- `prebuild` css-vars hook removed (the generator is out of sync); `npm run gen:css-vars` stays as a manual script.

---

## v8.0 Mobile — Framework and architecture (2026-04-17)

**Decision:** React Native + Expo SDK 54 (managed workflow) + expo-router v4. App lives in `mobile/` subdirectory of the existing monorepo.

**Chosen stack:**
- Expo managed workflow — no native code in v8.0; EAS Build generates APKs in the cloud
- expo-router v4 — file-based routing, typed routes, deep linking out-of-the-box
- expo-secure-store — encrypted JWT storage
- @react-native-async-storage — cache layer (TTL 3h, same pattern as web)
- TypeScript throughout

**Discarded alternatives:**
- *Bare workflow from the start:* only needed if custom native modules are required. Can migrate later with `expo prebuild`. Starting managed keeps the team unblocked.
- *React Navigation (manual):* expo-router v4 is built on React Navigation but adds file-based routing, typed routes, and automatic deep links. Lower config overhead.
- *Separate repository:* shared git history and easier cross-referencing of constants and scoring logic in the same monorepo outweigh the added noise of a second repo.
- *Flutter / Kotlin native:* would require learning a new language/framework and rewriting all business logic.

**Scoring logic:** ported to `mobile/lib/scoring.ts` as a fork of `weatherService.js`. Not shared directly to avoid coupling web and mobile build pipelines. Refactor as a shared package (`packages/scoring`) is a valid v8.1 upgrade if the algorithm diverges.

**Closed decisions (2026-04-18):**
- Map library: **MapLibre** (`@maplibre/maplibre-react-native`) — no API key, no quota, open-source. react-native-maps (Google Maps) discarded due to API key dependency and quota management overhead.
- Google OAuth: **deferred to v8.1** — requires new backend endpoint `POST /auth/google/mobile`. v8.0 ships email/password only.
- Distribution: **APK direct download** in v8.0 — zero setup cost, suitable for initial user base. Google Play Store ($25 one-time) planned for v8.1.

**Closed decisions (2026-04-19):**
- Navigation structure: **4 tabs** (Zonas · Mapa · Especies · Perfil) — no Dashboard tab, map is a primary tab not a toggle inside Zones.
- Especies icon: custom SVG `MushroomIcon.tsx` ported from web `IC.mushroom` via `react-native-svg` (outline inactive, filled active). MaterialCommunityIcons mushroom discarded — style mismatch with web.
- Design system: **`expo-linear-gradient`** + **`@expo-google-fonts`** (Cormorant Garamond + DM Sans). Gradient matches web `linear-gradient(135deg, #2b3529 → #3d4536 → #43421c)`. All screens use `backgroundColor: transparent` to let root gradient bleed through. Tab bar uses `Colors.modal (#30372a)`.
- Shared tokens: deferred to post-v8.0 — web uses CSS vars + Tailwind, mobile uses JS constants. Scoring algorithm is highest-risk duplication. Tracked in `memory/pending.md`.

See `memory/v8-android-plan.md` and `docs/mobile-architecture.md` for full detail.

---

## v8.0 Mobile — Zones UI design decisions (2026-04-20)

Decisions taken during the zones screen QA pass. All implemented on `feat/v8-0-zones`, squash-merged to `epic/v8-android`.

**Tab bar:**
- Floating (`position: absolute`, transparent), `height: 59px` (+10px over standard 49).
- Inactive tint: `#f4ebe1` (cream, full opacity). Active: `rgb(217,206,161)` (golden cream, `--color-muted` equivalent) with `rgba(217,206,161,0.10)` pill background.
- Active pill covers icon **and** label — implemented via `tabBarButton` (custom `Pressable` wrapping React Navigation's children). Discarded: per-icon `View` wrapper (only covered icon, not label).
- Web blur: `backdropFilter: blur(16px)` via `Platform.OS === 'web'` inline style on `TabBarBackground`. No `expo-blur` — avoids native dependency in managed workflow.

**Search/filter bar:**
- Pill background: `#4c5240` (`--color-search-bg`, web `.search-light` theme). Solid opaque — prevents card bleed-through when sticky without needing a container background.
- Shadow: only applied when sticky (scroll offset > title row height). Implemented via `onScroll` + `titleRowHeight` ref + `isSticky` state. Native: `shadowColor/elevation` on pills. Web: `filter: drop-shadow(0 6px 24px rgba(0,0,0,0.5))` on the row wrapper.
- `stickyHeaderIndices[1]` approach for sticky bar: title at index 0 (scrolls away), search bar at index 1 (pins). `contentContainerStyle` has no horizontal padding — each item owns its own `paddingHorizontal: 16` to avoid double-padding on iOS sticky items.

**Filter sheet:**
- Backdrop: `#232522d9` (`--modal-overlay`) + `backdropFilter: blur(8px)` web.
- Background: `#30372a` (`--color-modal`).
- Max height: `windowHeight - 50` (equivalent to `calc(-50px + 100dvh)`).
- Comarca: always visible (removed `ccaaFilter !== ''` gate). Custom `ComarcaSelect` component — styled trigger + inline dropdown. Discarded: `@react-native-picker/picker` (not in dependencies, platform UI inconsistency).

**Light mode decision:**
- Light mode is explicitly prioritised **before** species and map screens. Building more screens with hardcoded hex tokens would require proportional rework when the colour system is migrated. The right sequence: `Colors.ts` + `theme.ts` → semantic tokens → then build new screens.

---

## Color System (v3.1 migration)

**Decision:** CSS custom properties in `:root` as single source of truth + Tailwind tokens in `tailwind.config.js`.

**Current tokens** (`styles.css` → `tailwind.config.js`):
| Tailwind Token | CSS var | Hex |
|---|---|---|
| `cream` | `--color-cream` | `#f4ebe1` |
| `muted` | `--color-muted` | `#d9cda1` |
| `coffee` | `--color-coffee` | `#8b6f47` |
| `coffee-light` | `--color-coffee-light` | `#a88b63` |
| `green-f` | `--color-green-f` | `#4a7c59` |
| `bar` | `--color-bar` | `#887b4b` |
| `bg-deep` | `--color-bg-deep` | `#30372a` |
| `modal` | `--color-modal` | `#1e2419` |

**Exceptions that do NOT use CSS vars (always hex):**
- `FOREST_COLORS` in `constants.js` → Leaflet needs hex for SVG fill/stroke
- `ArticleCallout` prop `color` → used as `color + '18'` (hex opacity concatenation), CSS var doesn't work here
- Leaflet popup HTML template → same reason as FOREST_COLORS

**Rule:** Use `text-coffee`, `bg-modal`, etc. in JSX. Only direct hex in the documented exceptions above.

---

## Article System

**Decision:** Each article is a JSX component registered in `ARTICLE_REGISTRY` (object in `ArticleModal.jsx`).

**Published articles:**
| Slug | Component | Status |
|---|---|---|
| `micorrizas` | `Micorrizas.jsx` | published |
| `esporas` | `Esporas.jsx` | published |
| `toxinas` | `Venenos.jsx` | published |

**Components available inside articles:**
- `ArticleSection` — section with h2/h3 title, coffee side line
- `ArticleCallout` — highlighted block (color prop in hex, see exception above)
- `ArticleFigure` / `Fig` — figure with image and figcaption (overlay or below)
- `Lightbox` — modal gallery, activated via `setLightbox([{url,caption}])` from AppContext

**Image pattern in articles:**
- Single Fig → full width, height 220-260px, overlay caption
- Paired Figs → grid 2 cols, height 260px, overlay caption (same style as single)
- Wide illustrative Fig → can go full width without overlay

---

## ZoneModal — Weather Cache Update Timestamp

**Decision:** Show real cache timestamp instead of "Open-Meteo · updated now".

**Flow:**
1. `getCacheTimestamp()` exported from `weatherService.js` — reads `ts` from localStorage without revalidating TTL
2. `useZoneConditions` returns `updatedAt` (ms timestamp) after resolving the fetch
3. `ZoneModal` formats: `Updated on DD MMM at HH:MM`
4. Timestamp appears at end of conditions block (below icon parameter cards), right-aligned, `text-[11px] text-cream/25`

**Final timestamp position:** after grid of 6 weather parameter cards, INSIDE `<section>` of the thermometer.

---

## ZoneModal — Score Descriptive Text

**Decision:** Replace technical subtitle "Temperature · Rainfall 14 days · Soil humidity" with explanatory line without percentages.

**Current text:**
> "The index weights real-time weather data alongside the seasonal factor of the current month to calculate collection conditions."

Position: between title `{t.termometro}` and score bar. Class: `text-cream/50 text-xs mb-3 leading-relaxed`.

---

## Dashboard — ArticleCard

**Decision:** Replicate article card style from Mycology page (non-featured) in Dashboard.

- Non-featured cards in Mycology have: hero image, family badge, tags, reading time
- Dashboard uses same local `ArticleCard` component with direct `ArticleModal` opening
- "Species" section renamed to "Catalog" in Dashboard

---

## SpeciesModal vs ZoneModal — Hero Gradient

**Decision:** Reduce ZoneModal hero gradient to match SpeciesModal.

- Before: `from-modal via-modal/40 to-transparent`
- After: `from-modal via-modal/0 to-transparent` (same as SpeciesModal)

---

## Modal Navigation System (URL-driven, v3.1)

**Decision:** Modals are tied to the URL. Opening a modal = navigating to its slug. Closing = `navigate(-1)`.

### ModalRenderer as sole navigation authority

`ModalRenderer.jsx` is the only component that calls `navigate()` for modals. All other components only call `setSelected*(item)` and ModalRenderer's `useEffect` reacts by navigating.

```
// ✅ Correct pattern — from any component/modal:
setSelectedSpecies(species)        // ModalRenderer navigates to /especies/:slug

// ❌ Wrong — calling navigate() directly from inside a modal:
navigate('/especies/boletus-edulis')
```

State → route mapping in ModalRenderer:
- `selectedZone` → `/zonas/{slugify(zone.name)}`
- `selectedSpecies` → `/especies/{slugify(species.scientificName)}`
- `selectedFamily` → `/familia/{slugify(family.nombre || family.name)}`
- Articles → navigated directly from Micologia.jsx and Dashboard.jsx

### Modal-from-modal pattern

When opening modal B from inside modal A (e.g., family from species card):

```js
// In SpeciesModal, "See family" button:
setSelectedSpecies(null)   // closes modal A from state
setSelectedFamily(family)  // opens modal B
// ModalRenderer detects selectedFamily and navigates to /familia/:slug
// History becomes: [..., /especies/boletus-edulis, /familia/amanitaceae]
// ESC/Back from /familia/amanitaceae → returns to /especies/boletus-edulis ✓
```

**Anti-pattern:** doing `navigate('/especies', { replace: true })` before opening modal B breaks history: ESC goes to listing instead of previous modal.

### Anti-loop guard in ModalRenderer

Before navigating, always check if we're already at the destination URL:

```js
const target = `/especies/${slugify(selectedSpecies.scientificName)}`
if (location.pathname === target) return   // avoids infinite loop
navigate(target)
```

### URL → state synchronization (pages with useParams)

Pages read `useParams` to synchronize modal when directly loading the URL (deep link / refresh):

```js
// In Species.jsx:
const { id: speciesSlug } = useParams()
useEffect(() => {
  if (speciesSlug) {
    const sp = mockSpecies.find(s => slugify(s.scientificName) === speciesSlug)
    setSelectedSpecies(sp || null)
  } else {
    setSelectedSpecies(null)
  }
  return () => setSelectedSpecies(null)
}, [speciesSlug])
```

---

## ESC + Lightbox Pattern in Modals

**Problem:** If both a modal and the Lightbox it opens have `document.addEventListener('keydown', ...)`, ESC closes both at once.

**Solution:** Modal's ESC effect depends on `[lightbox]`. When lightbox is open, modal's listener is unregistered.

```js
// In any modal that can have lightbox (SpeciesModal, ArticleModal):
const { lightbox } = useApp()
const onCloseRef = useRef(onClose)
useEffect(() => { onCloseRef.current = onClose }, [onClose])

useEffect(() => {
  if (lightbox) return  // Lightbox handles its own ESC
  const onKey = (e) => { if (e.key === 'Escape') onCloseRef.current() }
  document.addEventListener('keydown', onKey)
  return () => document.removeEventListener('keydown', onKey)
}, [lightbox])
```

The `onCloseRef` avoids re-registering the listener on each render (the `onClose` function is new on each ModalRenderer render).

**Modals applying this pattern:** `SpeciesModal`, `ArticleModal`.
**Lightbox:** has its own listener always active. Closes with ESC by calling `setLightbox(null)`.

---

## GallerySection — Gallery with Error Tracking

**Problem:** Mock species have `photo.url` defined even though the file doesn't exist. Gallery appeared even though all images returned 404.

**Solution:** Component `GallerySection` (module-level in `SpeciesModal.jsx`) with `useState(errored)`.

```js
function GallerySection({ species, onOpenLightbox }) {
  const [errored, setErrored] = useState(0)
  const onErr = () => setErrored(n => n + 1)
  // ...
  if (total === 0 || errored >= total) return null   // hides if all failed
  // Render gallery with onError={onErr} on each <img>
}
```

**Rule:** use plain `<img>` with `resolveUrl()` + `onError` in gallery, not `<SpeciesImg>`. `SpeciesImg` has internal fallback that doesn't propagate error upward.

---

## Confusions — Data Structure (v4.6.2)

**Decision:** Confusions are stored per species as flat list in `extra_data.confusions` (JSONB). Each entry has only `with_species_id` and `diff`.

```json
"confusions": [
  { "with_species_id": "esp-003", "diff": "Distinguished by ringed stem and volva…" },
  { "with_species_id": "esp-007", "diff": "Red pores in *B. satanas*, flesh blues on cut" }
]
```

**What's NOT stored in DB:** `icon`, `borderColor`, `nameColor`. These are frontend responsibility and derived from `edibility` of the referenced species object (same system as `EdibilityTag`).

**Why not group by family:** The hardcoded `CONFUSIONES_POR_FAMILIA` used family as grouping level for initial convenience ("all possible look-alikes in this family"), but the approach is wrong:
- Confusions are species-to-species relations, not family-to-family
- There can be cross-family confusions (e.g., Cantharellus vs Hygrophoropsis, different family)
- Not every species in a family confuses with all others in the same family

In the new model, the family level disappears from the data. `ConfusionesBlock` will read directly from `species.confusions` from the API.

**Frontend flow (after migration):**
1. `SpeciesModal` receives `detail.confusions = [{with_species_id, diff}]` from API
2. `ConfusionesBlock` looks up each `with_species_id` in `allSpecies`
3. From found object extracts `scientificName` (display) and `edibility` (for icon/colors)
4. `diff` shown as descriptive text of the difference
5. If referenced species exists in catalog → clickable button that opens its modal
6. If not exists → static div

---

## Fruiting Conditions — Text in DB, Not in JSX (v4.7.1)

**Decision:** "Fruiting Conditions" texts (`cond_temp`, `cond_precip`, `cond_suelo`, `cond_req`) move to `extra_data` in DB with suffixes `_es/ca/en`. Hardcoded `if/else` branching by family in `SpeciesModal.jsx` eliminated.

**Current problem:** The 4 text blocks in `SpeciesModal` use hardcoded strings with branching by `detail.family` and in some cases by `detail.scientificName`. Not DB data and not translatable without code duplication.

**New fields in `extra_data`:**
```
cond_temp_es / cond_temp_ca / cond_temp_en
cond_precip_es / cond_precip_ca / cond_precip_en
cond_suelo_es / cond_suelo_ca / cond_suelo_en
cond_req_es / cond_req_ca / cond_req_en
```

**Generation flow (Gemini):** For each species, numeric fields (`temp_optima_min/max`, `precip_14dias_min/max`, `requiere_helada`, `requiere_choque_termico`, `dias_hasta_fructificacion`, `family`, `forestTypes`) are passed and Gemini generates species-specific text in 3 languages. Not translation of existing text — generation from data.

**In JSX (after migration):** `SpeciesModal` reads `detail.cond_temp_es` (or `_ca/en` by lang) instead of `if/else` block.

**Discarded alternatives:**
- Keep `if/else` in JSX + add i18n keys: unsustainable, text isn't by species but by family, loses specificity.
- Separate `fruiting_conditions` table: unnecessary, `extra_data` JSONB is sufficient and consistent with rest of content fields.

---

## Paginator with URL (?page=N)

**Decision:** Species paginator uses `useSearchParams` instead of `useState`. Current page lives in `?page=N`.

**Reset on filter change — two-effect StrictMode-safe pattern:**

React StrictMode executes effects twice (mount→cleanup→remount). A simple `useRef(isFirstRender)` doesn't work because ref persists between StrictMode's two mounts.

Solution with two effects:

```js
const filterResetReady = useRef(false)

// Effect 1: its cleanup resets flag between StrictMode's two mounts
useEffect(() => {
  return () => { filterResetReady.current = false }
}, [])

// Effect 2: skips on first mount (flag=false), runs on real changes
useEffect(() => {
  if (!filterResetReady.current) { filterResetReady.current = true; return }
  if (!location.pathname.startsWith('/especies')) return  // don't pollute /familia/
  setSearchParams(prev => { const p = new URLSearchParams(prev); p.set('page', '1'); return p }, { replace: true })
}, [searchQuery, order, showFilter, familyFilter])
```

---

## Image Generator — Monorepo vs Microservice (v5.1)

**Decision:** AI image generator (Image 4 + Gemini) lives in monorepo as frontend admin tool, not as independent microservice.

**Main argument (debate closer):** Heavy compute load falls on Google servers. Own backend microservice wouldn't scale anything — only adds network hop and extra failure surface for process that already takes 30–120s and depends on external APIs.

**Secondary arguments:**
- **Native auth:** `AdminGuard` + `role` column in `users` covers frontend and backend without shared tokens between services or API Gateway.
- **Sync-release:** migration `008_add_user_role` and UI changes travel in same commit. No risk of inconsistent state between service versions.
- **Domain reuse:** generator consumes `useSpecies()` (same REST API as rest of app) and `src/data/` constants. Nothing requires special access a microservice couldn't also have — but avoids duplicating types and constants.

**Discarded alternatives:**
- *Separate FastAPI microservice on Render:* second cold start, extra CORS, cross-service auth management, duplicated CI/CD build. Zero scalability gains given client-first model with Google AI.
- *Worker with queue (Celery + Redis):* valid if processing pipeline blocked main backend, but currently calls go directly from client to Google.

**Known tech debt:** `VITE_GEMINI_API_KEY` is exposed in frontend bundle. Acceptable because tool is behind `AdminGuard` (only users with `role = 'admin'`), but only real argument for future microservice would be moving API keys to backend FastAPI and turning generator into authenticated server-side endpoint. Not urgent while admin access is reliable.

---

## Species Image Renaming (decided v5.4, pending implementation)

**Decision:** Migrate from `main`/`photo1`/`photo2` nomenclature to explicit numeric position system. Species images numbered `esp-XXX-01`, `esp-XXX-02`, etc. First position (01) acts as main image in listings and SpeciesModal header.

**Current state:**
- Seed images (static): `esp-001-main.jpg`, `esp-001-main-large.jpg`, `esp-001-foto1.jpg`, `esp-001-foto1-large.jpg`, etc.
- AI-generated images: stored as `data:image/jpeg;base64,...` in `extra_data.photo.url` and `extra_data.photos[].url` (no real filename)
- Ordering: `set-order` already manages ordered array where position 0 = main. Correct concept, legacy file naming.

**Target naming:**
- `esp-161-01.jpg` + `esp-161-01-lg.jpg` (main)
- `esp-161-02.jpg` + `esp-161-02-lg.jpg` (second photo)
- etc., unlimited

**Implementation plan in 3 phases:**

### Phase A — Conceptual (already implemented in v5.4)
- `set-order` as sole source of truth for ordering
- Concept of slot (`main`/`photo1`/`photo2`) disappears from frontend
- `CatalogImagesModal` already uses implicit position (index 0 = main)
- Endpoint `PATCH /species/{id}/images` (slot-based) becomes deprecated

### Phase B — Rename of static seed files (pending, requires migration)
1. Python script (`scripts/rename_images.py`) iterates all species in DB:
   - Reads `extra_data.photo.url` → renames to `esp-XXX-01.jpg` / `esp-XXX-01-lg.jpg`
   - Reads `extra_data.photos[0].url` → renames to `esp-XXX-02.jpg` / `esp-XXX-02-lg.jpg`
   - Updates URLs in `extra_data` in Supabase DB
2. Static files in frontend (`/assets/images/content/species/`) renamed locally and redeployed
3. Manual step: sync physical files on server (Vercel public assets)

### Phase C — File storage for generated images (backlog, requires infrastructure)
- Migrate from `data:` URIs in DB to URLs in Supabase Storage
- When generator saves, backend uploads to `species-images/esp-XXX-NN.jpg` and returns public URL
- Drastically reduces `extra_data` size (currently `data:` URIs can be ~200KB per image in base64)
- Requires: `SUPABASE_SERVICE_KEY` in backend, public bucket, numbering logic on upload

**Discarded alternatives:**
- *Slug in filename* (`esp-boletus-edulis-01.jpg`): more readable but `scientificName` can change; numeric ID is stable.
- *Content hash* (`esp-001-a3f2c8.jpg`): not deterministic for administrator.

**Immediate action:** Phase A ready. Create issue/milestone for Phase B when redesploying frontend assets. Phase C when deciding monetization and needing to optimize DB size.

---

## DB migrations — only on production startup (2026-10-10)

**Decision:** the API applies `alembic upgrade head` on startup only when `RUN_MIGRATIONS_ON_STARTUP` is on; unset, it follows `ENVIRONMENT` (on in production/Render, off locally). An unknown DB revision (DB ahead of the code) logs a warning instead of aborting. The `Dockerfile` no longer migrates before Uvicorn.

**Why:** the local `.env` points at the shared Supabase DB, so any branch started locally migrated production before its code was deployed, and an older branch could not start at all ("Can't locate revision").

**Discarded:** default `false` with the flag set by hand in Render — a forgotten env var would deploy code without its schema. Removing auto-migrate entirely — Render free tier has no pre-deploy hook.

---

## Current weather — scheduled refresh, max age, shared call budget (2026-10-10)

**Decision:** `weather_cache` is filled by a job every 3 h for all active zones (not on demand). Rows are served for 6 h (two cycles); older → no weather ("–"). Open-Meteo calls for it are capped per UTC day (`WEATHER_DAILY_CALL_BUDGET`, in memory) the job calls Open-Meteo one request at a time (parallel calls from one IP get 429 "Too many concurrent requests", retried once) and stops on any other 429; a failed zone keeps its previous row. Alert by email at most once per day and `weather_outdated` in `/health`.

**Why:** on-demand filling left most zones without weather in the list, and the live call from Render failed with no trace. The free Open-Meteo limit is shared with the ingest and backfills, so the job must never be the one that exhausts it.

**Discarded:** serving `climate_history` as a stand-in (it is yesterday's data, shown as current); a persistent budget counter in the DB (a restart only resets the job's share; not worth a migration); refreshing on every startup (frequent redeploys would waste calls — startup refresh only when some zone lacks fresh weather).

---

## Observatory — one thermometer per point, forest splits the species list (2026-10-15)

**Decision:** `/point/snapshot` returns one thermometer per point. The forest around the point (macrotype now, species composition within the radius once the MCSC-4 grid exists) only decides which species are listed in `/point/species`, not the index. Replaces the "index per forest type present" of the 14 Oct free-map PRD.

**Why:** the v2 index does not depend on the forest type, so one entry per type repeated the same numbers. The point already has a radius; if it covers several forest types, the forager looks for different species in each, which is a species-list matter.

**Also decided:** the nearest toponym skips buildings, historic buildings and facilities (Marcos: out of topic for a forager); an unknown forest (failed service, sea) excludes nobody, only a non-forest land-cover class gives `forest: false`.

**Discarded:** one thermometer per forest type with a different score each (would need a forest-dependent model we do not have).


## Observatory — per-user daily limit of new cells (2026-10-16)

**Decision:** each user can create at most 10 new Open-Meteo cells per UTC day (`OBSERVATORY_MAX_NEW_CELLS_PER_USER_PER_DAY`, `0` disables). Over it, a point in a cell that is not stored answers 429 with `Retry-After` until midnight UTC; stored cells are never limited. The creator is recorded in `cells.created_by` (migration 018, nullable, `ON DELETE SET NULL`).

**Why:** the global cap (60 new cells/day, 503) protects the shared Open-Meteo quota but lets one user spend all of it. Each new cell costs ~20 weighted calls (~50 with `compare_years`). Both caps are ours, not Open-Meteo's: with the Professional plan they are raised or removed.

**Also decided:** only the creator pays (cells created by others or by jobs are free); the user's 429 is checked before the global 503; a retry after a provider outage is not a second new cell.


## Observatory — saved points keep provenance, not raw data; the author's forest types win (2026-10-16)

**Decision:** a saved point stores the user's choices (name, notes, forest types as a list) and where the derived data came from: land cover layer, class code, name and retrieval date; toponym name and label; MCSC-4 codes with their percentage and radius. Not the services' raw texts, nor the macrotype derived from the class. The server fetches all of it when saving (the client cannot send it). The author's forest types, when present, win over the land cover, even over «no forest»; without them the stored class is read again with the current mapping. `cell_id` has no foreign key. No limit of points per user by default (`OBSERVATORY_MAX_SAVED_POINTS_PER_USER`, 0 = no limit).

**Why:** the raw texts only add legend colours and pixel coordinates, both derivable; keeping the code and name lets a change in the macrotype mapping or in a licence be applied to old points without asking the services again. The curated zones have coordinates that miss the forest (18 of 40 fall outside it), so the author must be able to override what the land cover says. Cells are a rebuildable cache, so a foreign key would let a purge delete a user's points. The Observatory is not born limited (free-map PRD).

**Also decided:** the 40 curated zones stay out of the saved points, to avoid competing with the data obtained from coordinates; a point has several forest types, not one; coordinates cannot be edited (a moved point is a new point); the same place twice is a 409.

**Discarded:** storing the services' answers whole (bytes for nothing, and a second source of truth); a JSON blob for the land cover (a mapping fix becomes a script instead of one `UPDATE`); a single `forest_type`.

---

## Observatory — MCSC-4 grid: 25 m tiles on private object storage (2026-10-17)

**Decision:** the MCSC-4 sheets are preprocessed into a 25 m grid with the class of each cell (1 byte plus a code table), cut in tiles of 1024×1024 cells compressed with `lzma`, kept in a private Supabase Storage bucket, loaded on demand and cached in memory. Composition stored by full code, grouped by species only to display.

**Why:** measured on one real sheet (131 km², 8,628 polygons, 82 codes): 41 KB `lzma`, so ~10 MB for Catalonia against ~51 MB raw; a tile decodes in ~2 ms. Loading on demand needs no disk on Render and no download at startup, and matches how cells are loaded. The bucket is private because the CREAF licence is unconfirmed.

**Discarded:** 50 m (saves ~6 MB, loses small stands and leaves ~144 cells in the 600 m window around the point); collapsing the non-forest classes (saves ~2.6 MB, loses the agricultural check); row/column delta filters (they make it worse); vector polygons (heavier and slower for a radius query); committing the grid to git (licence and binary size).


## Observatory — MCSC-4 grid: construction details (2026-10-17)

**Decision:** one code table for all sheets, built in a first pass (index 0 = no data; 1 byte per cell, 2 bytes by itself beyond 255 codes). Tiles are addressed on a global grid anchored at the UTM 31N origin (`{tx}_{ty}.lzma`, 25,600 m per side), so adjacent sheets join with no seam. A cell takes the class of the polygon that contains its centre (even-odd rule, holes empty, the same convention as `mcsc_lookup.py`); where sheets overlap, the first in name order keeps the cell. `composition()` counts the cells with data whose centre is within the radius (inclusive) and leaves out cells without data. Python standard library only (`lzma`, no numpy), polygons filled by scanlines. The grid is built deterministically and an existing one is replaced only with `--overwrite`.

**Why:** a per-sheet table would make tile bytes mean different things across sheets; a global one costs nothing (82 codes in one sheet). Anchoring tiles globally means a lookup needs no knowledge of the sheets. Not counting the cells without data keeps a window over the sea or outside Catalonia from reading as «no forest». Staying on the standard library adds no dependency to Render, and scanlines make Catalonia (~51 M cells) affordable in pure Python.

**Also decided:** the pure function returns every share; the threshold, the radius limits and the `null` for a point outside the grid belong to the wiring. The raw sheets and the generated tiles are excluded with `.git/info/exclude`, not `.gitignore`, so they cannot be committed from any branch. The grid's in-memory tile cache has no bound (1 MB per tile); the loader of `feat/observatory-composition` must bound it.

**Discarded:** one code table per sheet; sheet-relative tile coordinates; numpy (a new dependency for a one-off job); resume-safe preprocessing (a rebuild of one sheet takes about a second).

---

## Observatory page — construction decisions (2026-10-17)

**Decision:** the page is built in ten steps on `feat/observatory-page`, in this order: base, map/click/panel/URL, thermometer, search, saved points, species list, charts, calendar, header entry with the avatar menu, and a pass on phone, languages and dark theme. Steps 1–6 and 8 are done; the calendar and a zone comparator come next, before the final pass. Out of v1: heat map, downloadable reports, `compare_years`, composition, «Área de territorio» and dragging or stretching the chart window.

**Details:**
- **Place search uses Photon, not Open-Meteo's geocoder.** Open-Meteo only knows populated places; foragers look for passes, peaks and springs. Photon (OpenStreetMap data, typeahead, CORS) runs in the browser and is limited to Catalonia. Risk: a public instance with fair use and no SLA; `geocodingService.js` is the single module to replace with a backend endpoint if traffic grows. Credits for Photon and OpenStreetMap are in `Attribution.jsx`.
- **Season texts and the thermometer follow the backend.** The page shows the backend's codes and the season table as it is; it never computes a score and never shows one without its reason. Only v1 is shown, as a reference, never as the main score.
- **The list of species comes from `/point/species` with `synonyms`** (additive field in the species list). Its state lives in `ObservedZone`, not in the list, so the chart can use the chosen species' range.
- **Charts ask for `days + 21` (capped at 180)** so the 21-day rain accumulation is complete from the first visible day. While a new window loads, the previous chart stays dimmed instead of blinking out.
- **The map is hidden while a zone is observed** (superseded on 2026-10-18: see «Observatory page — second block»), and a prominent button «Volver al mapa» brings it back at the last observed position. «Mis puntos» is a button next to Guardar/Editar/Quitar with the cards under it, closed when a zone is observed.
- **Look:** cards use `.obs-card` (the same shadow as the zones page, `.hover-lift`); a stronger dark-theme shadow was tried and rejected as too strong. Selects and inputs have no border (`ObsSelect`, like the species-type filter in the zone card); chart filters and legend sit under the chart.
- **No automated tests for the frontend** (project strategy): checked with `npm run build`, manual review and checklists; browser scripts are temporary checks.

**Discarded:** Open-Meteo's geocoder for search (no peaks, passes or springs); computing a score in the browser; a stronger dark-theme card shadow.


## Observatory page — second block (2026-10-18)

**Decision:** after the calendar, the page takes on the forecast block, the chart's look ahead, dragging, the persistent map and the «Área de territorio» section (first a rain heat map and a zone ranking; the heat map was removed the same day, see below). The territory rain was built over a regular grid of 55 points over Catalonia, not over the catalogue zones.

**Details:**
- **Persistent map (a test of Marcos, kept):** observing a zone no longer hides the map; the page scrolls down to the zone (smooth, instant on first load or with reduced motion) and a strip of map stays above as «Volver al mapa». «Zonas guardadas» is a normal button with a coloured count bullet that opens a wide modal. Vocabulary: «Guardar esta zona», «Eliminar zona»; removing the observed zone stops showing it and scrolls to the map.
- **Look ahead on the chart is told apart:** days with a stored forecast and days estimated without one have different strokes, as in the calendar, so an estimate is never read as a forecast (the prototype did not distinguish them). Only the «Momento» tab looks ahead.
- **No layout jumps:** `usePointData` with `keepPrevious` keeps the last answer dimmed while a new window loads (the thermometer and the species list depend on the window's end date). Dragging the chart fixes the pixels per day at the start.
- **Territory rain over a grid, not the catalogue (built, then removed unshipped):** the catalogue zones are places picked for other reasons (some outside Catalonia, with short histories), so they do not show where it has rained. 55 points (0.2° × 0.3°, inside the outline), 26 weeks Monday–Sunday, batches of 20 locations. Names: the comarca of the nearest catalogue zone within 30 km; the top list shows one point per comarca. Cache: process memory plus one row (`territory_rain_cache`, migration 020); if the table is missing, memory alone.
- **Incremental refresh:** the old weeks never change, so after the first full pull only the last 3 weeks are asked again (the forecast days get revised by ERA5): ~100 Open-Meteo calls a day against ~770 for a full pull (limit 10,000/day, [pricing page](https://open-meteo.com/en/pricing)). A full pull is repeated when the grid changes or the stored answer is older than the weeks being kept.
- **Removed 2026-10-18 (`chore/observatory-remove-territory-rain`):** the grid rain map, its endpoint, store, job and migration 020 are deleted rather than left unused or switched off. Reasons: superseded by the interactive map with layers (item 7, rain layer 7c); migration 020 would have applied itself on Render's startup and the 05:30 job would have spent ~770 Open-Meteo calls on the first run; unused code and a dead table are worse than recovering it from history (PR #135). The two bullets above describe what was built, not what ships. The ranking stays until 7f.
- **Zone ranking** («Cerca (20)» = the 20 zones closest to the observed zone or to the middle of Catalonia; «Seguidas» = followed zones) reuses `/zones` scores; the reason names the limiting factor of scoring v2.
- **`/point/snapshot` scores the nearest earlier day** when the requested one has no row; before the cell's first day it is still a 404.

**Discarded:** heat map over the catalogue zones (not representative); a full 26-week pull every day (cost); a per-day table for the grid (a single cached JSON row is enough, rebuildable); calling Open-Meteo from the browser.

## 7a — server-side cell ingestion (2026-10-18)

**Decision:** the cells that touch Catalonia are discovered by probing Open-Meteo, stored once (`created_by` NULL), loaded in budgeted batches from Marcos' machine and kept fresh by a daily job.

**Details:**
- **Why probing:** the grid is irregular and its size is not documented. Measured: a cell is about 0.0703° of latitude by 0.1272° of longitude near 41.6° N (7.8 × 10.8 km). Its width in degrees changes with the latitude (Open-Meteo keeps it close to constant in kilometres) and each row has its own offset, so the footprint is estimated **per row**, never from all the longitudes at once. A first version did it globally and reported 1,224 false holes on a 443-cell grid.
- **Result on a disposable database:** 647 probe calls → 444 cells stored, 423 touch Catalonia (the PRD estimated ~380; the count includes cells that only touch the border of a hand-drawn outline), 0 holes after one `discover --holes` call. Load: 423 of 423 cells in three runs (about 4,800 + 4,000 + 100 estimated calls); transient 503s from the forecast API failed a few cells, which loaded on the rerun. The estimate of 21 calls per cell is the script's, not measured against Open-Meteo's own count.
- **Budget:** estimated 21 calls per cell to load (280 days of history + 16 of forecast, weighted by ceil(days/14)) → ~8,900 for 423 cells, i.e. close to one day of quota; a project measurement of ~7 would give ~3,000. To be settled with `load --limit 10`. The daily refresh is ~3 calls per cell (~1,300 a day), capped by `OBSERVATORY_CELL_REFRESH_BUDGET`.
- **Interplay to remember:** `discover` creates ~400 cells in one day with `created_by` NULL, and they count in the global `observatory_max_new_cells_per_day` (60) for users that day; discovered but unloaded cells still load on click without a budget check; cells outside Catalonia are stored but ignored by `load`.
- **Who runs it:** Marcos, from his machine, against the real database only after Render has applied migrations 017–019 (project rule: migrations are applied by him; auto-migrate only in production).
- **Discarded:** an arithmetic grid (the grid is irregular); one lattice step for both axes (0.08° skipped rows because a cell is 0.0703° tall); loading cells in the web process.
- **Not decided yet (7b):** varying the map resolution with relief (per-cell scoring at a few elevation bands and a per-pixel DEM elevation lookup). Rain and wind would not be refined, to avoid false precision.

---

## Conditions layer: an index, not a probability (2026-10-20)

**Decision:** The map layer and the thermometer show an **index of favourable conditions** (weather, altitude, forest, soil), never a probability of finding mushrooms. Abundance and mycorrhiza are not modelled.

**Details:**
- With no species chosen, the score is the **mean of the excellent species present** at that pixel (in altitude range, habitat factor ≥ `MIN_FACTOR` 0.05, in season). All species weigh equally; weighting by frequency (GBIF audit) is a future idea.
- The thermometer without species uses the same ensemble (`species=excellent`), so map and thermometer agree. Out of season or no members → 0.
- Rendering: cells scored at relief bands (300 m), client paints per pixel from the DEM with a kernel blend. Server cache keyed by `data_signature()` and the species record.

**Discarded:** best-of species (overstates conditions); the label "probability"; a grey altitude guide line (added nothing).

## Forest judged around the point (2026-10-20)

**Decision:** Forest cover is the CREAF raster mean within 500 m of the point; soil comes from the exact pixel. ICGC land cover is informative only. Author forest types of saved points stop deciding anything (removed from the save form; the backend field remains until a migration decides otherwise).

**Details:** The client smooths the forest raster on load (radius 2 px) to match the server; small differences (a few points) between map and point are expected.

**Discarded:** exact-pixel forest (a point in a field next to a forest read "no forest"); municipality radius for now.

**Update (2026-10-20):** species the forest cannot judge (meadow, garden, riparian, no forest type) are left out of the excellent mean, on the map and in the thermometer. Single-species layers and the species list are unchanged.
