# Pending Tasks and Open Reviews

Completed items are removed from this file — history lives in `CHANGELOG.md`.

---


## 🟡 Activo — `feat/v8-1-theming` (2nd pass): purge hardcoded colors from mobile components

All mobile components still contain hardcoded hex/rgba values that bypass the `useTheme()` token system. This breaks light theme — rows, surfaces, and text are invisible or wrong-colored on light backgrounds.

**Files to fix (priority order):**
- `mobile/app/(tabs)/index.tsx` — ~15 hardcoded values: `rgba(244,235,225,*)`, `rgba(255,255,255,*)`, `#4c5240` (PILL_BG), `#30372a` (sheet bg), `#232522d9` (backdrop), filter chip/option colors
- `mobile/app/zona/[id].tsx` — `#6ee7b7` (score badge), `#facc15` (follow star), `rgba(244,235,225,*)` (description/labels)
- `mobile/components/ui/ZoneCard.tsx` — `#facc15` (star fill), `rgba(250,204,21,0.12)` (star bg)
- `mobile/components/ui/ScoreBar.tsx` — `rgba(255,255,255,0.08)` (progress track)
- `mobile/app/auth/login.tsx`, `auth/register.tsx` — `rgba(244,235,225,0.06)` (input border)
- `mobile/app/(tabs)/perfil.tsx` — `#f4ebe1` (login button text, should be `'#ffffff'` — already fixed)

**Pattern to apply:** replace hardcoded values with `colors.*` from `useTheme()`. Static StyleSheet blocks with color refs must be moved to inline styles or a factory function that receives `colors`.

**Tokens already available in `shared/colors.ts`:** `surfaceSubtle`, `surfaceHover`, `surfaceInput`, `surfaceDivider`, `tabsBg`, `accentPositive`, `accentPositiveSubtle`, `navActiveBg`, `navActiveText`, `bar`, `textPrimary`, `textSecondary`, `overlay`, `backgroundPanel`, `searchBg`, `border`, `borderAccent`.

---

## 🗂 No date — Hardening: move generator API keys to backend

Technical debt documented in `memory/decisions.md` (section "Image generator — Monorepo vs Microservice").

Currently `VITE_GEMINI_API_KEY` is exposed in the frontend bundle. Acceptable while access is exclusively via `AdminGuard`, but the correct long-term solution is:

- Backend: endpoint `POST /api/v1/admin/generate-image` — receives prompt parameters, calls Imagen 4 / Gemini server-side, returns base64 image
- Google API keys leave the client
- `ImageGenerator.jsx` calls the FastAPI endpoint instead of calling the Google AI SDK directly

**When to prioritise:** if there are signs the key is being used outside the admin panel (quota monitoring), or if the number of admins grows and the key needs rotation without a frontend redeploy.

---

## 🟡 Activo — v8.0 Android app (`epic/v8-android`)

Stack: React Native + Expo SDK 54 + expo-router v4 + Zustand + MapLibre. Ver `memory/v8-android-plan.md`.

**Completado:**
- [x] Scaffold: expo-router, Zustand store, API client (cache AsyncStorage + SecureStore JWT), scoring port, i18n ES/CA/EN
- [x] Nav: 4 tabs (Zonas · Mapa · Especies · Perfil), MushroomIcon SVG, expo-router file structure
- [x] Design system: gradient background, Cormorant Garamond + DM Sans, `lib/theme.ts` (Typography, Glass, Font, Gradient), `components/ui/Background.tsx`
- [x] `feat/v8-0-zones`: zones list (search, filter, sort, follow), zone detail modal, full UI QA pass — ✅ merged to epic

**En progreso (`feat/v8-0-zones`):**
- [ ] Zone detail modal (`zona/[id].tsx`) refinements — visual QA in progress

**Pendiente (en orden):**
- [x] `feat/v8-1-theming`: web semantic token layer + light theme modal fixes — ✅ merged to epic
- [ ] `feat/v8-2-species`: catálogo + detalle de especie
- [ ] `feat/v8-3-map`: mapa MapLibre con markers coloreados por score
- [ ] `feat/v8-4-auth`: login/registro funcional + perfil completo (favoritos, seguidos)
- [ ] `feat/v8-5-polish`: splash screen, icono, revisión UX
- [ ] `feat/v8-6-eas-build`: EAS Build → APK de distribución directa

iOS fuera de roadmap (Apple Developer $99/año); Google Play en v8.1.

---

## 🗂 Backlog — v9.0 SEO

- Static prerendering at build time for known routes (`/especies/:id`, `/zonas/:id`, etc.)
- `react-helmet-async`: dynamic meta tags per route (title, description, Open Graph)
- Core Web Vitals review

---

## 🗂 Backlog — `shared/` design tokens & business logic (web + mobile)

Actualmente web y mobile duplican lógica que debería tener una sola fuente de verdad:

| Archivo | Web | Mobile | Riesgo de divergencia |
|---|---|---|---|
| Colores | `src/styles.css` + `tailwind.config.js` | `mobile/constants/Colors.ts` | Medio |
| Algoritmo scoring | `src/lib/helpers.jsx` (`computeOverallScore`) | `mobile/lib/scoring.ts` | **Alto** — pesos pueden desincronizarse |
| Constantes (SEASONAL_FACTOR, EDIBILITY_SCORE…) | `src/lib/constants.js` | `mobile/lib/constants.ts` | **Alto** |
| i18n strings | (web tiene su propio sistema) | `mobile/lib/i18n.ts` | Medio |
| TypeScript types | (sin tipos) | dispersos en services/api.ts | Bajo |

**Plan propuesto:** crear `shared/` en la raíz del monorepo con:
- `shared/colors.ts` — tokens de color; web Tailwind config + CSS vars derivan de aquí
- `shared/scoring.ts` — algoritmo puro sin dependencias de plataforma
- `shared/constants.ts` — SEASONAL_FACTOR, EDIBILITY_SCORE, ForestType, Lang, API_BASE_URL
- `shared/types.ts` — Zone, Species, WeatherParams, etc.
- `shared/i18n.ts` — strings de traducción (el mecanismo de carga queda en cada plataforma)

**Prerequisito:** el web necesita refactorizarse para importar desde `shared/` en vez de definir colores en CSS directamente. Hacerlo en un `chore/shared-design-tokens` antes de v9.0.

**Prioridad inmediata:** scoring y constants son los más críticos — cualquier cambio en los pesos de la fórmula debe propagarse a ambos fronts.

---

## 🟡 Backlog — tech debt (see complete audit in `memory/tech-debt.md`)

Priority calculated as (Impact + Risk) × (6 − Effort). Ordered by urgency.

**Phase 1 — Quick wins** ✅ Done (`chore/tech-debt-phase1`)
- [x] ~~Remove `backend/build/` from repo~~ — already in `.gitignore`, false positive
- [x] Consolidate `PROVINCE_TO_CCAA` to `src/lib/constants.js` — extracted from `apiService.js`
- [x] Document migration system — `migrations/README.md` completed (006–038 + audit files)

**Phase 2 — Structural refactors (parallel to feature work)**
- [ ] Split `helpers.jsx` (508 lines) into `icons.jsx` + `utils.js` + `ui.jsx`
- [ ] Replace inline SVGs from `IC` object with `lucide-react` (already in `package.json`)
- [ ] Document or archive `standalone/` (versions up to v2.8.0, relationship to main app unclear)
- [ ] Extract admin endpoints from `routers/species.py` (519 lines) to `routers/species_admin.py`

**Phase 3 — Tests (10–20% of each sprint)**
- [ ] Backend router tests: `auth.py` + `zones.py` as first iteration
- [ ] Set up Vitest and cover `normalizeScore`, `normalizeZone`, `useSpecies`

---

## 🗂 Backlog — token residuals (menores, no afectan light theme)

- `Profile.jsx` line ~241 y `Layout.jsx` lines ~134, ~160: badges de conteo (`bg-emerald-500`) — rol semántico "indicador de actividad". Pendiente de token `--ui-badge-indicator` cuando se expanda el sistema.
- `helpers.jsx` `edibilityStyle()`: `border-emerald-*` en ConfusionesBlock — borders decorativos, impacto mínimo.
- `admin/` components: emerald primitivos en ImageGenerator, CatalogImagesModal, SpeciesAdminModal — admin-only, nunca en light theme usuario. Fuera de scope.

---

## 🟡 Backlog — frontend improvements (no active priority)

### Placeholder images pending replacement

Detected by identical MD5 hash — the files are literal copies:
- **esp-066 *A. gemmata***: all 3 photos (main, foto1, foto2) are copies of esp-056 *A. muscaria*
- **esp-019 *N. luridiformis***: main photo identical to esp-014 *N. erythropus*

Solution: replace image files in `assets/images/content/species/` with real photos of each species.

### General species catalogue review
- Verify `forestTypes` and `fruitingMonths` are correct for all species
- Add more representative species for each forest type
- Consider additional types: fir forests, mixed conifers, etc.

### Morphological audit for field identification (HIGH PRIORITY when addressed)
Current `cap`, `stem`, `flesh` descriptions read as encyclopaedic entries. For field identification usefulness (and for the image generator), each species should have:
- **Explicit diagnostic traits** — the 1–3 traits that distinguish it from all others, tagged with `DIAGNOSTIC TRAIT:` so the generator's morphologyBlock detects and prioritises them.
- **Negative confusion traits** — what it does NOT have (e.g. "NO pink flesh, NO membranous volva"), especially relative to its confusion species in `ConfusionesBlock`.
- **Scale and prominence** — not "pendant appendages" but "1–3 cm fragments, conspicuous, impossible to miss".

Scope: 202 species in DB + `species.js`. See pattern already applied to `esp-062` (*Amanita ovoidea*) as reference.

### Zones with no in-season species
If no species match a zone/month, the meteorological score is unadjusted. Consider a penalty for "no mycological interest in this zone this month".

### `speciesScore` in ZoneModal
The `speciesScore` field (SQS) is calculated but not shown in the UI. Candidate for an additional indicator in the zone detail card.

### Meteocat API for Catalan zones
Requires API key. Hybrid approach: Meteocat for Catalan zones, Open-Meteo for the rest.

### Custom zones
Allow users to add and save their own points on the map.
