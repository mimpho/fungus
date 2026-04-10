# Pending Tasks and Open Reviews

Completed items are removed from this file — history lives in `CHANGELOG.md`.

---

## 🚀 Next — v7.0 Social login (Google)

**Planned scope:**
- Google OAuth2 — free, no cost, maximum friction reduction
- DB: `auth_provider` (`"local"` | `"google"`) + `provider_id` in `users` table; `password_hash` becomes nullable
- Backend: Google ID token verification → issues our own JWT (session system unchanged)
- Library: `authlib` or `google-auth` for FastAPI
- Frontend: Google Identity Services (official script, One Tap)

---

## 🗂 Backlog — v7.1 Email confirmation

(Was v6.1)

**Planned scope:**
- Send verification email on new account registration
- Single-use token (short expiry, e.g. 24h) stored in DB
- Endpoint `GET /auth/verify-email?token=...` that activates the account
- Field `email_verified: bool = False` in `users` table
- Frontend: show "Verify your email" banner in profile if `!email_verified`
- Provider: Resend or SendGrid (cheap/free tier sufficient for initial volume)

**Decision:** postpone until after v7.0. No email provider configured yet.

---

## 🗂 No date — Hardening: move generator API keys to backend

Technical debt documented in `memory/decisions.md` (section "Image generator — Monorepo vs Microservice").

Currently `VITE_GEMINI_API_KEY` is exposed in the frontend bundle. Acceptable while access is exclusively via `AdminGuard`, but the correct long-term solution is:

- Backend: endpoint `POST /api/v1/admin/generate-image` — receives prompt parameters, calls Imagen 4 / Gemini server-side, returns base64 image
- Google API keys leave the client
- `ImageGenerator.jsx` calls the FastAPI endpoint instead of calling the Google AI SDK directly

**When to prioritise:** if there are signs the key is being used outside the admin panel (quota monitoring), or if the number of admins grows and the key needs rotation without a frontend redeploy.

---

## 🗂 No date — v8.0 Android app

- React Native + Expo — APK, native map, push notifications
- **Conditional on prior monetisation** (development and distribution costs)
- iOS removed from roadmap — requires Apple Developer ($99/year) + Apple Sign In; will be reconsidered if revenue materialises

---

## 🗂 Backlog — v9.0 SEO

- Static prerendering at build time for known routes (`/especies/:id`, `/zonas/:id`, etc.)
- `react-helmet-async`: dynamic meta tags per route (title, description, Open Graph)
- Core Web Vitals review

---

## 🟡 Backlog — tech debt (ver auditoría completa en `memory/tech-debt.md`)

Prioridad calculada con (Impact + Risk) × (6 − Effort). Ordenados de mayor a menor urgencia.

**Fase 1 — Quick wins (~1 día, sin riesgo de regresión)**
- [ ] Eliminar `backend/build/` del repo (`git rm -r --cached backend/build/` + `.gitignore`)
- [ ] Consolidar `PROVINCE_TO_CCAA` duplicado en `src/lib/constants.js` (existe en `apiService.js` y `zones.js`)
- [ ] Documentar cuál sistema de migraciones es el activo (Alembic vs 49 `.sql` manuales en raíz)

**Fase 2 — Refactors estructurales (en paralelo al feature work)**
- [ ] Dividir `helpers.jsx` (508 líneas) en `icons.jsx` + `utils.js` + `ui.jsx`
- [ ] Sustituir SVGs inline del objeto `IC` por `lucide-react` (ya en `package.json`)
- [ ] Documentar o archivar `standalone/` (versiones hasta v2.8.0, relación con app principal poco clara)
- [ ] Extraer endpoints admin de `routers/species.py` (519 líneas) a `routers/species_admin.py`

**Fase 3 — Tests (10–20% de cada sprint)**
- [ ] Tests de routers backend: `auth.py` + `zones.py` como primera iteración
- [ ] Configurar Vitest y cubrir `normalizeScore`, `normalizeZone`, `useSpecies`

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
