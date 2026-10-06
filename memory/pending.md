# Pending Tasks and Open Reviews

Completed items are removed from this file — history lives in `CHANGELOG.md`.

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

## 🟡 Activo — v8.0 Android app (`epic/v8-android`)

Stack: React Native + Expo SDK 54 + expo-router v4 + Zustand + MapLibre. Ver `memory/v8-android-plan.md`.

**Completado:**
- [x] Scaffold: expo-router, Zustand store, API client (cache AsyncStorage + SecureStore JWT), scoring port, i18n ES/CA/EN
- [x] Nav: 4 tabs (Zonas · Mapa · Especies · Perfil), MushroomIcon SVG, expo-router file structure
- [x] Design system: gradient background, Cormorant Garamond + DM Sans, `lib/theme.ts` (Typography, Glass, Font, Gradient), `components/ui/Background.tsx`
- [x] `feat/v8-0-zones`: zones list (search, filter, sort, follow), zone detail modal, full UI QA pass — ✅ merged to epic

**En progreso (`feat/v8-1-theming` — design improvements, branch kept open):**
- [ ] Ongoing web-parity design improvements — filter chips, search bar, tab bar

**Pendiente (en orden):**
- [x] `feat/v8-1-theming`: theming system — semantic tokens, light theme fixes, web-parity UI (zones/detail/auth/filter sheet) — ✅ merged to epic
- [ ] `chore/v8-1-shared-scoring`: extraer `shared/scoring.ts` + `shared/constants.ts` (solo scoring + constants — riesgo "Alto" de divergencia, ver sección v8.5 más abajo). Bloqueante antes de `v8-2-species` para que el catálogo no introduzca una tercera copia de las constantes de puntuación.
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

## 🗂 v8.5 — `shared/` design tokens & business logic (web + mobile)

**Nota (2026-06-18):** la porción de mayor riesgo (scoring + constants) se adelanta como `chore/v8-1-shared-scoring` antes de `v8-2-species` — ver epic Android arriba. Esta sección v8.5 queda acotada a colores, tipos e i18n, que sí requieren el refactor previo del web (`chore/shared-design-tokens`) y pueden esperar a después de v9.0.

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
