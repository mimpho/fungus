# Pending Tasks and Open Reviews

Completed items are removed from this file — history lives in `CHANGELOG.md`.

---

## 🔴 Priority — Observatory (web), phase 1 (`epic/observatory`) — 2026-10-10

Product re-prioritised on 2026-10-10: the web Observatory comes first and the Android app is paused (see `memory/decisions.md`). Source of truth: the Observatory design document (includes scoring v2 and its task list). Hand-off: `observatorio-paso-a-desarrollo` in the Fungus project. Epic: `epic/observatory` (no version number until it is merged into `main`, see `system/workflows.spec.md`). Kick-off done on 2026-10-10: product contract in `memory/observatory-prd.md` (all open questions answered), technical plan with Gherkin scenarios per branch in `memory/observatory-plan.md`. Branches, cut from the epic and squash-merged into it, in this order:

1. ✅ `feat/observatory-scoring-v2` (2026-10-10, PR to the epic): `scoring_v2.py` (pure functions) + tests with the design document's cases (Montseny 49, La Molina 7, Setcases 16, Costabona 20 on 2026-10-06). Measures the 100- vs 190-day data window.
2. ✅ `feat/observatory-bands-elevation` (merged #125; pending: review the full dry run and `scripts.zone_elevation_ranges --apply`; re-run `~` zones when Overpass is free; fix stored `elevation_m` flagged `?`, e.g. zone-004 Pinar de Lleida 1,450 m vs 690 m terrain): five-band scale with the `--mid` token, zone altitude as a range (`elevation_min_m` / `elevation_max_m`, migration).
3. ✅ `feat/observatory-ingest-v2` (2026-10-10, PR to the epic): ingest reads the v2 window; `score_oi` becomes v2 (zones, dashboard, map), v1 kept in `score_detail.v1`; v1/v2 comparison CSV script from 2024-10-01 (no Open-Meteo calls).
4. `feat/observatory-forecast`: 16-day Open-Meteo forecast stored per zone with the same daily call (free tier is fine while Fungus has no subscriptions).
5. `feat/observatory-api`: daily series, thermometer snapshot, species for a date, calendar; v2 computed on the fly from `climate_history`.
6. `feat/observatory-page`: the page following the prototype, view state in the URL, Observatorio in the header with Perfil as an avatar menu (replaces the Público/Admin toggle).

Project-wide fixes `fix/migrations-on-startup` and `fix/weather-cache` are merged into `main` and the epic (#121, #122, #123).

Detail of the work:

- [ ] Scoring v2 in the backend (next section).
- [ ] Endpoints: daily series from `climate_history`; score by date and by species; mushrooms favourable for a given date.
- [ ] Observatory page following the prototype, with the view state in the URL.
- [ ] Design decisions that touch other layers: v2 as default everywhere; five-band scale (Malo 0–30, Regular 30–55, Bueno, Muy bueno, Excelente) with a `--mid` token in the design system; zone altitude as a range (`elevation_min_m` / `elevation_max_m`, overlap with a 150 m margin); real multi-day Open-Meteo forecast stored (paid plan needed for commercial use).
- [ ] Data: finish the backfill oct 2025 – sep 2026 (verify), backfill oct 2024 – sep 2025 on another day (Open-Meteo daily limit).
- [ ] Ops: set `ALERT_EMAIL` and `STALE_ZONE_DAYS=3` in Render (done, verify they apply after deploy). With the normal ~2-day archive lag, `STALE_ZONE_DAYS=2` has no margin and flags zones one day behind.

Open, does not block (calibration): micro-sites (v2.2 candidate, after calibration): a zone is not uniform (moisture, sun, temperature and wind drying vary with orientation and cover), so a short rain on dry soil can give small, local flushes where shaded spots kept moisture; today it adds 0 because the zone is two average buckets with an on/off threshold. Proposal without adding factors: model the zone as ~5 micro-sites from sunny/ventilated to shaded/sheltered, each drying at its own rate (the two current buckets become the ends); rain counts in each while it stays moist; the score comes from the share of active micro-sites, with the most closed ones weighing less because fruiting also needs light; message 'possible local flushes in shaded spots' when only those are active. Design it with this season's field-trip log, not by eye; field-trip log; validate with autumns 2024 and 2025; soil-temperature optimum per species; `cycle_days`; from which day the curve counts; altitude caps of Pyrenees species sheets and range for the other zones; trip phase label; report hash; years of history; remove the duplicated scoring in the app (phase 2).

---

## 🔴 Priority — Scoring v2 (Outbreak Index) — 2026-10-08

Season priority (decided 2026-10-07): the Observatory and the zone-card score, both fed by the same calculation. v1 rewards rain on the day it falls and adds a fixed 25 points for October: on 6 Oct it gives 75 for La Molina and 76 for Setcases, while in the field they have been very poor for a month (v2.1: 7 and 16).

Full spec, formula, plan and test cases: Observatory design document, section "Scoring v2: especificación para implementar". Reference prototype: the `v2Series` function in the Observatory canvas (Python must produce the same numbers).

- [ ] `feat/scoring-v2`: new `backend/app/services/scoring_v2.py` (pure functions): rain activation with a two-speed fruiting curve (cold zone: peak on day 21; zone already active: peak on day 12, fades out by day 32), discounting 2 mm/day; soil water balance with two 60 mm reservoirs (sunny and shady slope, the latter drying at half the rate); 20-day air temperature + 7-day soil temperature with a 13.5 °C optimum; altitude-based season as a multiplier; drying from dry air and wind; heat (max > 25 °C); frost penalty fading over ~5 days; temperature-drop bonus (experimental). Scientific basis: document "Micelio y fructificación: base para el scoring". Also returns "rain on the way" (date it would start to show and its peak).
- [ ] Ingest: request 100 days of `climate_history` and store v2 in `scores_cache.score_detail.v2` with `model_version`, no migration. `score_oi` stays v1 until calibrated.
- [ ] Backfill v2 from 2024-10-01 (`climate_history` only, no Open-Meteo calls) + tests with the document's cases (v2.1 on 2026-10-06: Montseny 49, La Molina 7, Setcases 16, Costabona 20).
- [ ] API + Observatory: expose v2 and its breakdown; the thermometer, the Momento tab and the species widget use v2 with v1 as reference. The zone card stays on v1.
- [ ] Calibrate with a field-trip log (zone, date, what was found) and revisit the thermometer cut-offs (55/70/85): with v2 an ordinary day scores 30–40.
- [ ] Catalogue: add the soil-temperature optimum per species (today only air ranges exist) and clarify what `cycle_days` measures (7–14 days, far below the ~21 days of real fruiting).
- [ ] When `score_oi` switches to v2: remove the scoring copy in the app (see `chore/v8-1-shared-scoring`) so only one formula is maintained.

---

## 🗂 No date — DB: índices faltantes (baja prioridad)

Identificados via análisis de `pg_stat_statements` + schema. A aplicar con `apply_migration` cuando haya una sesión de mantenimiento o antes de v8.2 (catálogo móvil).

```sql
-- Catálogo de especies ordenado por familia/nombre
CREATE INDEX idx_species_family_name ON public.species (family, scientific_name);
-- Búsquedas JSONB en extra_data (confusiones, condiciones ecológicas)
CREATE INDEX idx_species_extra_data_gin ON public.species USING GIN (extra_data);
-- Filtros de zonas por tipo de bosque
CREATE INDEX idx_zones_forest_type_active ON public.zones (forest_type, active);
-- FK zona en follows de usuario (sin índice de soporte)
CREATE INDEX idx_user_followed_zones_zone_id ON public.user_followed_zones (zone_id);
```

Impacto real bajo con el volumen actual (202 especies, 200 zonas). El GIN sobre `extra_data` es el más valioso a medio plazo.

---

## 🗂 No date — Hardening: move generator API keys to backend

Technical debt documented in `memory/decisions.md` (section "Image generator — Monorepo vs Microservice").

Currently `VITE_GEMINI_API_KEY` is exposed in the frontend bundle. Acceptable while access is exclusively via `AdminGuard`, but the correct long-term solution is:

- Backend: endpoint `POST /api/v1/admin/generate-image` — receives prompt parameters, calls Imagen 4 / Gemini server-side, returns base64 image
- Google API keys leave the client
- `ImageGenerator.jsx` calls the FastAPI endpoint instead of calling the Google AI SDK directly

**When to prioritise:** if there are signs the key is being used outside the admin panel (quota monitoring), or if the number of admins grows and the key needs rotation without a frontend redeploy.

---

## ⏸ Pausado — v8.0 Android app (`epic/v8-android`)

**Paused on 2026-10-10** to prioritise the web Observatory. The epic is merged into `main` (without release tag, see `memory/decisions.md`); `mobile/` ships with the repo but is not built or distributed. Resume with `feat/v8-2-species` after the Observatory phase 1.

Stack: React Native + Expo SDK 54 + expo-router v4 + Zustand + MapLibre. Ver `memory/v8-android-plan.md`.

**Completado:**
- [x] Scaffold: expo-router, Zustand store, API client (cache AsyncStorage + SecureStore JWT), scoring port, i18n ES/CA/EN
- [x] Nav: 4 tabs (Zonas · Mapa · Especies · Perfil), MushroomIcon SVG, expo-router file structure
- [x] Design system: gradient background, Cormorant Garamond + DM Sans, `lib/theme.ts` (Typography, Glass, Font, Gradient), `components/ui/Background.tsx`
- [x] `feat/v8-0-zones`: zones list (search, filter, sort, follow), zone detail modal, full UI QA pass — ✅ merged to epic

**Pendiente (en orden):**
- [x] `feat/v8-1-theming`: theming system — semantic tokens, light theme fixes, web-parity UI (zones/detail/auth/filter sheet) — ✅ merged to epic (#108, #110); final visual parity pass (icons, hero, glass) in the closing PR
- [ ] `chore/v8-1-shared-scoring`: extraer `shared/scoring.ts` + `shared/constants.ts` (solo scoring + constants — riesgo "Alto" de divergencia, ver sección v8.5 más abajo). Bloqueante antes de `v8-2-species` para que el catálogo no introduzca una tercera copia de las constantes de puntuación.
- [ ] `feat/v8-2-species`: catálogo + detalle de especie
- [ ] `feat/v8-3-map`: mapa MapLibre con markers coloreados por score
- [ ] `feat/v8-4-auth`: login/registro funcional + perfil completo (favoritos, seguidos)
- [ ] `feat/v8-5-polish`: splash screen, icono, revisión UX
- [ ] `feat/v8-6-eas-build`: EAS Build → APK de distribución directa

iOS fuera de roadmap (Apple Developer $99/año); Google Play en v8.1.

---

## 🗂 Backlog — SEO epic

- Static prerendering at build time for known routes (`/especies/:id`, `/zonas/:id`, etc.)
- `react-helmet-async`: dynamic meta tags per route (title, description, Open Graph)
- Core Web Vitals review

---

## 🗂 Backlog — Shared package epic: `shared/` design tokens & business logic (web + mobile)

**Nota (2026-06-18):** la porción de mayor riesgo (scoring + constants) se adelanta como `chore/v8-1-shared-scoring` antes de `v8-2-species` — ver epic Android arriba. Esta sección queda acotada a colores, tipos e i18n, que sí requieren el refactor previo del web (`chore/shared-design-tokens`) y pueden esperar a después de la épica SEO.

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

**Prerequisito:** el web necesita refactorizarse para importar desde `shared/` en vez de definir colores en CSS directamente. Hacerlo en un `chore/shared-design-tokens` antes de la épica SEO.

**Prioridad inmediata:** scoring y constants son los más críticos — cualquier cambio en los pesos de la fórmula debe propagarse a ambos fronts.

---

## 🗂 Backlog — Refactor: entidades de usuario (Rich Domain Model)

Diagnóstico completo en sesión Cowork 2026-05-17. Las tres entidades del módulo de usuarios (`User`, `UserFollowedZone`, `UserFavSpecies`) son puramente anémicas. `UserFollowedZone` y `UserFavSpecies` son tablas de asociación sin semántica propia — correctas tal como están. `User` es el foco del refactor.

### Comportamiento a migrar a `User`

**① `is_verification_token_valid()` + `consume_verification_token()` + `set_verification_token()`**
Hoy la lógica de expiración del token está repartida entre `services/auth.py::create_verification_token` (genera la expiración) y `verify_email_token` (la evalúa). Si cambia la política de expiración hay que actualizar dos puntos sin cohesión entre sí. Prioridad: **alta**.

**② `is_premium() -> bool`**
Hoy no existe. Cualquier código que consulte el plan lee `user.plan == "premium"` sin verificar `plan_expires_at`. Un método único garantiza que nunca se consulta el campo sin comprobar la fecha. Crítico antes de activar la monetización. Prioridad: **alta**.

**③ `is_admin() -> bool`**
`dependencies.py` y cualquier futuro guard comparan `current_user.role == "admin"` directamente contra el string. Un método encapsula el invariante y evita el string literal disperso. Prioridad: **media**.

**④ `link_google_account(google_id: str)`**
La transición `local → google` ocurre en `get_or_create_google_user`. Esa decisión ("vincular cuenta existente") es un comportamiento de `User`, no del servicio. Prioridad: **baja**.

**⑤ `full_name -> str | None` (property)**
Cada consumidor concatena `first_name + last_name` manualmente. Prioridad: **baja**.

### Scope del cambio

- Modificar solo `models/user.py` — añadir los métodos de instancia.
- Actualizar `services/auth.py` para delegar las decisiones a los métodos nuevos (las operaciones de persistencia quedan en el servicio).
- Actualizar `dependencies.py` para usar `user.is_admin()`.
- No requiere migración de base de datos.
- Tests: cubrir `is_premium()` con casos de borde (plan expirado, sin fecha, plan free).

### Orden de ejecución sugerido

1. `is_verification_token_valid` + `consume_verification_token` + `set_verification_token` — mayor impacto en correctitud actual.
2. `is_premium` — bloqueante para monetización.
3. `is_admin` + `full_name` — limpieza, cualquier sesión de mantenimiento.
4. `link_google_account` — al tocar el flujo OAuth en el futuro.

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
