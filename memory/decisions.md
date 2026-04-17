# Design and Architecture Decisions

Decisions made during active development, with their reasoning. Complements CLAUDE.md.

---

## v8.0 Mobile — Framework and architecture (2026-04-17)

**Decision:** React Native + Expo SDK 52 (managed workflow) + expo-router v4. App lives in `mobile/` subdirectory of the existing monorepo.

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

See `memory/v8-android-plan.md` and `docs/mobile-architecture.md` for full detail.

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
