# project.spec.md — Fungus

> Single Source of Truth for the project. Describes what Fungus is and how it is built.
> Update on every architecture, stack or roadmap change.

---

## Vision

Fungus is a mycological prediction web app for Catalonia/Spain. It combines real meteorological data, soil conditions and a scoring algorithm with a seasonal factor to predict the best zones and timing for mushroom foraging.

**Current version**: v5.6 frontend · v5.0 backend
**Frontend deploy**: Vercel → `fungus-ashen.vercel.app` (branch `main`)
**Backend deploy**: Render → `https://fungus-api.onrender.com`
**Database**: Supabase — PostgreSQL + PostGIS (Ireland region)

---

## Current state

| Layer | Status |
|---|---|
| Auth | JWT complete. `users` table with `role` (`user` / `admin`). |
| i18n | Complete ES/CA/EN. ~110 UI keys. DB with `?lang=` on `/species`. |
| Admin | Gallery-first: `AdminGeneratorHub` + `SpeciesAdminModal` + `ImageGenerator`. |
| Myco-Engine | Table `mushroom_visual_prompts`. 4-layer pipeline. 202 species with DNA Visual (55 manually curated `is_validated=true`, 147 Gemini offline). |
| Confusions | Complete for 8 families. Data in `extra_data.confusions` (JSONB) per species. |

---

## Architecture

```
Monorepo:

fungus/
├── src/                     ← ACTIVE DEVELOPMENT (Vite 6 + React 18)
├── vite.config.js           ← manual code splitting
├── index.html
├── package.json
├── backend/                 ← FastAPI + async SQLAlchemy
├── system/                  ← OpenSpecs — Single Source of Truth
├── memory/                  ← Working memory (decisions, backlog, gotchas)
├── docs/                    ← Technical operational documentation
└── standalone/              ← LEGACY — reference only, not active
```

**Active frontend path**: `src/` at the repo root. There is no `frontend/` subdirectory.
**Active backend path**: `backend/` at the repo root.

### Commands

```bash
# From repo root:
npm run dev      # Dev server → http://localhost:5173
npm run build    # Production build (dist/)
npm run preview  # Preview local build

# Backend (from backend/):
uvicorn app.main:app --reload
```

---

## Project structure

```
src/
├── App.jsx                  ← Router + AppProvider + ModalRenderer + ScrollToTop
├── main.jsx
├── styles.css               ← Global CSS (glass, progress-bar, scrollbar, animations)
├── contexts/
│   └── AppContext.jsx        ← Global state: modals, follows, lang, t()
├── data/                    ← Mock data (ES modules) — fallback and local reference
│   ├── zones.js             ← mockZones (28 zones Spain)
│   ├── species.js           ← mockSpecies (202 species)
│   ├── families.js          ← mockFamilies (8 families)
│   ├── opportunities.js
│   └── articles.js
├── services/
│   └── weatherService.js    ← Open-Meteo API + Phase 1 scoring + localStorage cache
├── hooks/
│   └── useWeatherConditions.js  ← useAllZoneConditions / useZoneConditions
├── lib/
│   ├── helpers.jsx          ← IC icons, getScoreColor, EdibilityTag, SpeciesCard,
│   │                           ConfusionesBlock, fakeConditions, resolveUrl(), slugify()
│   ├── constants.js         ← MODAL, COLORS, MONTHS, FOREST_COLORS
│   └── visualGlossary.js   ← Visual glossary for the image generator
├── pages/
│   ├── Dashboard.jsx
│   ├── Zones.jsx            ← useParams → setSelectedZone (URL↔modal sync)
│   ├── Species.jsx          ← useParams + useSearchParams (?pagina=N)
│   ├── Family.jsx           ← /familia/:slug, renders <Species /> as background
│   ├── Micologia.jsx
│   └── Profile.jsx
├── components/
│   ├── Layout.jsx           ← Desktop sidebar nav + mobile hamburger
│   ├── admin/
│   │   ├── AdminGeneratorHub.jsx   ← Admin hub: gallery + AI generator
│   │   ├── SpeciesAdminModal.jsx
│   │   ├── ImageGenerator.jsx
│   │   └── CatalogImagesModal.jsx
│   ├── map/
│   │   └── LeafletMap.jsx   ← markers + heatmap (real scores), fullscreen modal
│   ├── modals/
│   │   ├── ModalRenderer.jsx    ← sole modal navigation authority
│   │   ├── ZoneModal.jsx
│   │   ├── SpeciesModal.jsx     ← GallerySection with per-image onError tracking
│   │   ├── FamilyModal.jsx
│   │   ├── ArticleModal.jsx
│   │   └── Lightbox.jsx
│   └── ui/
│       ├── ZoneCard.jsx
│       ├── Tabs.jsx
│       ├── FilterPanel.jsx
│       ├── SearchFilterBar.jsx
│       └── ActiveFilterChip.jsx
└── articles/
    ├── Micorrizas.jsx
    ├── Esporas.jsx
    └── Venenos.jsx

backend/
├── app/
│   ├── main.py              ← FastAPI app + lifespan + scheduler + CORS + cache headers
│   ├── config.py            ← Settings (pydantic-settings, .env)
│   ├── database.py          ← async engine + get_db dependency
│   ├── models/              ← Zone, Species, MushroomVisualPrompt, WeatherCache, Users…
│   ├── schemas/             ← Pydantic schemas
│   ├── routers/             ← health, zones, species, auth, images
│   └── services/
│       ├── scoring.py       ← Outbreak Index (OI) algorithm
│       └── ingest.py        ← daily ingestion + backfill + scores cache refresh
├── connectors/
│   ├── base.py
│   └── open_meteo.py
├── migrations/
│   └── versions/            ← 001…009 Alembic migrations
├── scripts/
│   ├── generate_visual_dna.py   ← Gemini 2.5 Flash offline, resume-safe
│   ├── refine_visual_dna.py     ← Gemini Vision multimodal
│   └── seed_catalog.py
└── pyproject.toml
```

---

## Tech stack

### Frontend

| Technology | Version | Notes |
|---|---|---|
| React + ReactDOM | 18 | ES modules |
| React Router | 6 | SPA — routes defined in App.jsx |
| Vite | 6 | Build tool, HMR, manual code splitting |
| Tailwind CSS | CDN via index.html | No local compilation |
| Leaflet.js | 1.9.4 | npm; leaflet.heat loaded dynamically |
| Open-Meteo | Public API | No API key; real Spain data |
| Google AI (Imagen 4 + Gemini 2.5 Flash) | Client SDK | Admin only; key in `VITE_GEMINI_API_KEY` |

**Code splitting** (`vite.config.js` `manualChunks`):
- `react-vendor` — React + React Router
- `leaflet-vendor` — Leaflet (without leaflet.heat)
- `leaflet-heat` — dynamic import, only in heatmap mode
- `data-species` — mockSpecies
- `data-zones` — mockZones

### Backend

| Technology | Version | Notes |
|---|---|---|
| FastAPI | ≥0.115 | Async, lifespan, CORS middleware |
| SQLAlchemy | 2.x async | asyncpg driver |
| Alembic | ≥1.13 | Migrations; auto-apply on lifespan |
| APScheduler | 3.x | Daily cron at 05:00 UTC |
| httpx | ≥0.27 | Async client for external APIs |
| tenacity | ≥9 | Retries with backoff in connectors |

---

## Routes (React Router v6)

| Route | Component | Description |
|---|---|---|
| `/` | `Dashboard` | Main view |
| `/zonas` | `Zones` | Zone listing |
| `/zonas/:id` | `Zones` | Zone with modal open (name slug) |
| `/especies` | `Species` | Species catalogue |
| `/especies/:id` | `Species` | Species with modal open (scientific name slug) |
| `/familia/:slug` | `Family` | Family modal open |
| `/micologia` | `Micologia` | Article listing |
| `/micologia/:slug` | `Micologia` | Article open |
| `/perfil` | `Profile` | User profile |
| `/admin/generator` | `AdminGeneratorHub` | Admin hub: gallery + AI generator |

`slugify()` in `helpers.jsx` converts names to URL-safe slugs (NFD + lowercase + hyphens).
`resolveUrl()` in `helpers.jsx` ensures a leading `/` in asset URLs (critical in nested routes).

---

## Design system

### Colours

```
Background:  #30372a (solid) + body::after olive gradient 135°
Text:        #f4ebe1 (cream)
Coffee accent: #8b6f47
Green accent:  #4a7c59
Positive:    #059669 (emerald)
Danger:      #dc2626 (red)
Warning:     #d97706 (amber)
Base font:   18px
```

**Tailwind tokens** (defined as CSS custom properties in `styles.css`):

| Token | CSS var | Hex |
|---|---|---|
| `cream` | `--color-cream` | `#f4ebe1` |
| `muted` | `--color-muted` | `#d9cda1` |
| `coffee` | `--color-coffee` | `#8b6f47` |
| `coffee-light` | `--color-coffee-light` | `#a88b63` |
| `green-f` | `--color-green-f` | `#4a7c59` |
| `bar` | `--color-bar` | `#887b4b` |
| `bg-deep` | `--color-bg-deep` | `#30372a` |
| `modal` | `--color-modal` | `#1e2419` |

⚠️ **Exceptions that always use hex** (never CSS vars):
- `FOREST_COLORS` in `constants.js` — Leaflet renders SVG outside the React DOM
- `ArticleCallout` prop `color` — concatenated with a hex opacity suffix (`color + '18'`)
- Leaflet popup HTML templates — same reason as `FOREST_COLORS`

### Special CSS classes (`styles.css`)

- `.glass` — `rgba(255,255,255,0.04)` + `backdrop-blur: 16px`
- `.glass-warm` — `rgba(139,111,71,0.08)` + blur
- `.grain` — SVG noise texture overlay
- `.hover-lift` — `translateY(-2px)` on hover
- `.anim-up`, `.anim-right`, `.anim-scale` — keyframe animations
- `.progress-bar` / `.progress-fill` — score progress bar

**Fonts**: Cormorant Garamond (`font-display`) + DM Sans (body)

---

## State management

**React Context** (`AppContext.jsx`), hook `useApp()`:

```javascript
const {
  selectedZone, setSelectedZone,       // active modal
  selectedSpecies, setSelectedSpecies,
  selectedFamily, setSelectedFamily,
  lightbox, setLightbox,
  followedZones, toggleFollow,          // persisted in DB (authenticated)
  favoriteSpecies, toggleFavorite,
  lang, setLang,                        // 'es' | 'ca' | 'en'
  profile, setProfile,
  t,                                    // object with translated UI strings
} = useApp()
```

**localStorage**:
- Key `'fungus_v3'` → `{ zonas, favoritos, profile, lang }`
- Key `'fungus_weather_cache'` → `{ ts, v, data }` (TTL 3h, `CACHE_VERSION = 3`)

---

## Scoring

### Phase 1 — Meteorological score (`weatherService.js`)

```
overallScore = seasonal(month) × 0.40
             + scoreRainfall(rainfall14d) × 0.21
             + scoreTemperature(temp)     × 0.18
             + scoreHumidity(humidity)    × 0.12
             + scoreDryDays(dryDays)      × 0.09
```

**Monthly seasonal factor**:
```
Jan:15  Feb:20  Mar:38  Apr:58  May:62
Jun:28  Jul:18  Aug:48  Sep:80  Oct:100  Nov:88  Dec:42
```
In February the theoretical maximum score is ~68. In October it can reach 100.

### Phase 2 — Species modifier (`helpers.jsx → applySpeciesModifier`)

Applied in the hook, **after** reading the cache. Does not touch `weatherService.js`.

```
adjustedScore = overallScore × 0.60 + SQS × 0.40
```

Edibility weights (EDIBILITY_SCORE): `excelente→100 · bueno→20 · comestible→5 · precaucion/toxico/mortal→0`

See `memory/scoring.md` for full scoring tables and examples.

### Score UI (`getScoreColor`)

| Score | Label |
|---|---|
| ≥ 85 | Excellent |
| ≥ 70 | Very good |
| ≥ 55 | Good |
| < 55 | Poor |

---

## Leaflet map (`LeafletMap.jsx`)

**Modes** (prop `mode` + `onModeChange`):
- `markers` — 🍄 markers coloured by `forestType`
- `heatmap` — real scores from `conditionsMap`; red→amber→green gradient. `leaflet.heat` loaded dynamically.

**Props**: `zonas`, `onZoneClick`, `height`, `singleZone`, `title`, `mode`, `onModeChange`, `conditionsMap`

⚠️ `window.L = L` must run at module level in `LeafletMap.jsx`, **before** the dynamic `import('leaflet.heat')`.

---

## Meteorology — Open-Meteo

Parallel fetches (6 concurrent) for the 28 zones.

```
current:    temperature_2m, relative_humidity_2m, wind_speed_10m
hourly:     soil_temperature_0cm   ← ONLY in hourly, never current (returns 400)
daily:      precipitation_sum
past_days:  14
forecast_days: 1
timezone:   Europe/Madrid
```

**Hooks**:
- `useAllZoneConditions(zones)` → `{ conditionsMap, loading, progress, error }` — Dashboard and Zones
- `useZoneConditions(zone)` → `{ conditions, loading, error }` — ZoneModal

**Double cache**: localStorage (TTL 3h) + in-flight promise cache (`_allZonesPromise`, `_singlePromises`) to prevent double-fetches in React StrictMode.

---

## Data schemas

### Conditions (hook result, post-modifier)

```javascript
{
  temperature: 8.4,      // °C
  soilTemp: 5.9,         // °C (estimated from hourly)
  rainfall14d: 47.2,     // mm accumulated over 14 days
  humidity: 82,          // %
  wind: 12,              // km/h
  dryDays: 3,            // days with <1mm in last 7
  overallScore: 38,      // 0-100 (species-adjusted)
  speciesScore: 9,       // SQS 0-100 (undefined if no species in season)
  scores: {
    temperatura: 72,
    precipitacion: 95,
    humedad: 100,
    diasSecos: 78,
    estacional: 20,
  }
}
```

### Zone

```javascript
{
  id: 'zone-001',
  name: 'Pinar de Urbión',
  province: 'Soria',
  region: 'Pinares',
  lat: 41.9847,
  lng: -2.8547,
  elevation: 1850,
  forestType: 'pinar',   // 'pinar' | 'hayedo' | 'robledal' | 'encinar'
}
```

### Species

```javascript
{
  id: 'esp-001',
  scientificName: 'Boletus edulis',
  commonNames: ['Boleto', 'Cep'],
  commonNames_ca: ['Cep'],
  commonNames_en: ['Porcini'],
  family: 'Boletaceae',
  edibility: 'excelente', // 'excelente'|'bueno'|'comestible'|'precaucion'|'toxico'|'mortal'
  photo: { url: '/assets/images/content/species/esp-001-main.jpg' },
  photos: [{ url, caption }],
  forestTypes: ['pinar', 'hayedo'],
  fruitingMonths: [8, 9, 10, 11],  // 1-based
  elevationMin: 600,
  elevationMax: 2000,
  extra_data: {
    confusions: [{ with_species_id, diff }],
    // cond_temp_es/ca/en, cond_precip_es/ca/en, cond_suelo_es/ca/en, cond_req_es/ca/en
  }
}
```

---

## Backend — API endpoints

```
GET  /api/v1/health
GET  /api/v1/zones
GET  /api/v1/zones/map-scores
GET  /api/v1/zones/{id}
GET  /api/v1/species?lang=es|ca|en
GET  /api/v1/species/{id}?lang=es|ca|en
GET  /api/v1/species/{id}/visual-prompt       ← admin only
PUT  /api/v1/species/{id}/visual-prompt       ← admin only
PATCH /api/v1/species/{id}/images             ← admin only
POST /api/v1/images/set-order                 ← admin only
GET  /api/v1/weather/zones
GET  /api/v1/weather/zones/{zone_id}
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/auth/me
```

**Outbreak Index (OI)** — backend algorithm (`app/services/scoring.py`):
```
OI = PA21_score    × 0.30   (accumulated precipitation 21 days)
   + Thermal_score × 0.25   (7-day avg temperature + frost penalty)
   + Seasonal      × 0.25   (same monthly factor as frontend)
   + Ripening_score × 0.12  (days since ≥10mm rain vs species cycle)
   + Humidity_score × 0.08  (mean relative humidity)
```

**Critical backend rules**:
- Column `geom` in `zones` and `weather_stations` is `GENERATED ALWAYS AS` (PostGIS). Never insert directly.
- Upsert in `climate_history` never overwrites a higher-quality source with a lower one (Open-Meteo is P3).
- Auto-migrate on startup: `await asyncio.to_thread(_run_db_migrations)` in lifespan.
- `Cache-Control: public, max-age=3600` on all GET 200 responses via middleware.
- CORS: `allow_origin_regex` automatically covers all Vercel preview URLs.

See `docs/backend_architecture.md` for the full specification.

---

## Myco-Engine DNA Visual

Table `mushroom_visual_prompts` — structured visual description per species:

| Field | Destination |
|---|---|
| `cap_description`, `stipe_description`, `hymenium_description`, `extra_morphology_visual` | Imagen 4 (via `layer1_prefix`) |
| `extra_morphology_gemini` | Internal Gemini context (toxicity, reactions) |
| `preferred_substrate`, `habitat_context`, `associated_fauna`, `composition_notes` | Gemini scene (Layer 4) |
| `is_validated` | `true` = manually curated — **never overwrite with scripts** |

**Scripts** (`backend/scripts/`):
- `generate_visual_dna.py` — Gemini 2.5 Flash offline, resume-safe
- `refine_visual_dna.py` — Gemini Vision multimodal, corrects with real photos

See `docs/content-guide.md` for the full image generation pipeline.

---

## Roadmap

| Version | Status | Scope |
|---|---|---|
| v3.1–v4.7.1 | ✅ Done | Vite frontend · backend meteo · catalogue DB · i18n |
| v5.0 | ✅ Done | JWT auth + user accounts |
| v5.1–v5.4 | ✅ Done | ImageGenerator + AdminGallery + DnD + gallery-first redesign |
| v5.5–v5.6 | ✅ Done | Myco-Engine DNA Visual · 202 species · visualGlossary |
| v6.0 | ✅ Done | OpenSpecs migration — structured SSOT, IDE-agnostic |
| v7.0 | 🗂 Backlog | Social login: Google OAuth2 |
| v7.1 | 🗂 Backlog | Email confirmation on registration |
| v8.0 | 🗂 No date | Android mobile app (React Native + Expo) |
| v9.0 | 🗂 Backlog | SEO: static prerendering + Core Web Vitals |
| — | 🗂 No date | Hardening: move generator API keys to backend FastAPI |
