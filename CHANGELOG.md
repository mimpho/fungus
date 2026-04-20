# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Added — v8.0 Android app (in progress)

- **`mobile/`**: new Expo SDK 54 app (managed workflow) alongside the web app in the same monorepo. expo-router v4, Zustand, TypeScript throughout.
- **`mobile/app/(tabs)/`**: 4-tab navigation — Zonas (home) · Mapa · Especies · Perfil.
- **`mobile/components/icons/MushroomIcon.tsx`**: SVG mushroom icon ported from web via `react-native-svg`. Outline (inactive) and filled (active) variants.
- **`mobile/lib/scoring.ts`**: port of `computeOverallScore` + `computeAdjustedScore`. Weights: seasonal 0.40 · rainfall 0.21 · temp 0.18 · humidity 0.12 · dryDays 0.09.
- **`mobile/lib/i18n.ts`**: ES/CA/EN translations (~50 keys).
- **`mobile/services/api.ts`**: fetch client with JWT (SecureStore), AsyncStorage cache (TTL 3h, CACHE_VERSION=3), auth/zones/species/weather endpoints.
- **`mobile/store/useAppStore.ts`**: Zustand store — lang, profile, follows, favorites. Hydrates from AsyncStorage on startup.
- **`mobile/lib/theme.ts`**: design system — `Font`, `Typography`, `Glass`, `Gradient`.
- **`mobile/components/ui/Background.tsx`**: `LinearGradient` wrapper matching web gradient `135deg #2b3529 → #3d4536 → #43421c`.
- **`mobile/app/_layout.tsx`**: loads Cormorant Garamond + DM Sans via `useFonts`; wraps Stack in `Background`.
- **`mobile/eas.json`**: EAS Build profiles — preview (APK), production (AAB).
- **`system/workflows.spec.md`**: branch close checklist (hard gate before every PR) + epic plan file convention.
- **`memory/v8-android-plan.md`**: full v8.0 plan — scope, decisions, structure, endpoints, risks.
- **`mobile/hooks/useZones.ts`**: `Zone` + `ZoneConditions` types, parallel fetch of zones + weather (both cached), module-level promise deduplication, `ConditionsMap` indexed by numeric zone id.
- **`mobile/components/ui/ScoreBar.tsx`**: score-colour-coded horizontal progress bar.
- **`mobile/components/ui/ZoneCard.tsx`**: list card — name, region/province, forest type, elevation, score bar, conditions summary (temp / rainfall / humidity), follow star toggle.
- **`mobile/app/(tabs)/index.tsx`**: zones list — `FlatList` with search, followed/all toggle, forest-type filter chips, sort (score / alpha / elevation), error banner, empty state.
- **`mobile/app/zona/[id].tsx`**: zone detail modal — hero block with follow button, description, meteorological conditions grid (6 cells), location coords, real-time conditions fetch (no cache). Species sections placeholder for `feat/v8-0-species`.
- **`mobile/lib/i18n.ts`**: 18 new keys for zones list and zone detail in ES/CA/EN.

### Added — v7.1 Email verification on registration

- **`backend/migrations/versions/011_email_verification.py`**: adds `email_verified` (boolean, default `false`), `email_verification_token` (text, nullable), and `email_verification_expires_at` (timestamptz, nullable) to `users`. Partial unique index on the token column.
- **`backend/app/services/email.py`**: new Resend integration via `httpx`. `send_verification_email()` builds an HTML email and posts to the Resend API. Non-blocking — registration never fails if the email cannot be sent. Skips gracefully when `RESEND_API_KEY` is not configured (logs a warning).
- **`backend/app/services/auth.py`**: `create_verification_token()` — generates a `secrets.token_urlsafe(32)` token with a 24-hour expiry and stores it on the user. `verify_email_token()` — validates the token, sets `email_verified = true`, and clears the token fields.
- **`backend/app/routers/auth.py`**: `GET /auth/verify-email?token=` — validates token and returns 200/400. `POST /auth/resend-verification` — re-sends the email for the authenticated user (202 always). `POST /auth/register` now fires `send_verification_email` after creating the user (fire-and-forget).
- **`backend/app/schemas/auth.py`**: `email_verified: bool` added to `UserOut`.
- **`backend/app/config.py`**: `RESEND_API_KEY`, `EMAIL_FROM`, `FRONTEND_URL` settings; `has_resend` property.
- **`src/pages/VerifyEmail.jsx`**: new page at `/verificar-email?token=`. Three states: loading spinner, success (SVG checkmark), error (SVG warning). On success calls `refreshUser()` so the profile banner disappears without a reload.
- **`src/services/authService.js`**: `apiVerifyEmail(token)`, `apiResendVerification()`, `apiGetMe()`.
- **`src/contexts/AppContext.jsx`**: `refreshUser()` — re-fetches `/auth/me` and updates the in-memory user. Exposed in context.
- **`src/pages/Profile.jsx`**: amber banner with resend button for unverified local accounts. Hidden for Google users (already verified) and after confirmation.
- **`src/data/i18n.js`**: 16 new keys in ES/CA/EN covering all email-verification UI states.
- **`src/App.jsx`**: route `/verificar-email` added.

### Changed — v7.1

- Google users (`auth_provider = "google"`) are created with `email_verified = true` — Google already guarantees email ownership.
- `UserOut` schema now includes `email_verified` in all auth responses (register, login, refresh, `/me`).

---

### Added — v7.0 Google OAuth2 sign-in

- **`backend/app/routers/auth.py`**: `POST /auth/google` endpoint — receives a Google ID token, verifies it with `google-auth`, creates or retrieves the user (`auth_provider = "google"`, `provider_id`), and returns the same JWT session used by the local auth flow.
- **`backend/app/services/auth.py`**: `verify_google_token()` + `get_or_create_google_user()` — `password_hash` is nullable for Google-only accounts.
- **`backend/app/schemas/auth.py`**: `GoogleLoginRequest { id_token: str }`.
- **`backend/pyproject.toml`**: added `google-auth>=2.27.0` and `requests>=2.31.0` (transport dependency).
- **`src/services/authService.js`**: `apiGoogleLogin(idToken)` — posts to `/auth/google`.
- **`src/components/modals/AuthModal.jsx`**: Google sign-in button using `renderButton()` overlay pattern (FedCM-compatible). An invisible Google-rendered button sits on top of a styled decorative div; click is captured natively by the GIS script. `googleInitRef` guard prevents double `initialize()` in React StrictMode.
- **`src/contexts/AppContext.jsx`**: `loginWithGoogle()` exposed in context; `loadUserDataFromApi()` helper calls `apiGetFavSpecies()` + `apiGetFollowedZones()` and resolves IDs to full objects — called after `login()`, `register()`, `loginWithGoogle()`, and `apiRefresh()` session restore so favorites and followed zones are always loaded from the DB.

### Fixed — v7.0

- **FedCM blocking One Tap `prompt()`**: Google deprecated `prompt()` in FedCM environments. Replaced with `renderButton()` invisible-overlay pattern.
- **`google.accounts.id.initialize() is called multiple times`**: React StrictMode double-invoke. Fixed with `useRef` guard `googleInitRef`.
- **`ModuleNotFoundError: No module named 'google'`**: `google-auth` was missing from `pyproject.toml`.
- **`ImportError: The requests library is not installed`**: `google.auth.transport.requests` requires `requests` explicitly. Added to dependencies.
- **Favorites not loaded after login in incognito / new devices**: `apiGetFavSpecies()` and `apiGetFollowedZones()` were never called after authentication. Fixed by `loadUserDataFromApi()` called on all login paths and session restore.
- **Google button border bleed (lateral)**: overlay container switched to `theme: 'filled_black'` + forced width 400px to prevent visible borders bleeding through at sides.
- **Google button dead zone at bottom**: Google's iframe (≈40px) was top-aligned inside our 48px container — added `flex items-center justify-center` to wrapper and `scale(1.4)` to the iframe div so the clickable area fully covers the visual button height.
- **Date picker icon black on dark background**: `input[type="date"]::-webkit-calendar-picker-indicator` was the browser's default black. Added global CSS rule `filter: invert(1)` in `styles.css` so the icon appears cream/white on all date inputs.

---

### Added — v6.0 OpenSpecs migration

- **`system/project.spec.md`**: project SSOT — vision, stack, architecture, routes, schemas, roadmap. Resolves path inconsistency (active path is `src/` at root, not `frontend/`).
- **`system/agents.spec.md`**: formal role definitions (Claude/Cowork, Claude/Chat, human admin, batch scripts), explicitly numbered code rules, session protocol (start and close).
- **`system/workflows.spec.md`**: complete change lifecycle (Draft → Implementation → Review → Live), git strategy, commit format, documentation update protocol, testing strategy.
- **`system/glossary.spec.md`**: technical and domain terminology — DNA Visual, Myco-Engine, OI, SQS, forestType, edibility, ModalRenderer, etc.
- **`CLAUDE.md`** and **`AGENTS.md`** reduced to 8-line entry stubs pointing to `system/`. Knowledge lives in one place, IDE-agnostic.
- **`docs/conventions.md`** trimmed: language policy and API conventions only. Git workflow and commit format moved to `system/workflows.spec.md`.

### Removed — v6.0 OpenSpecs migration

- Generic OpenSpecs CLI scaffolding: `.agent/`, `.claude/skills/`, `.cursor/`, `openspec/config.yaml`.
- `docs/specs-sync.md` — orphan file about "OpenCode" sync, no active use.
- `docs/plan/engine_images_maker_proposal.md` — original Myco-Engine proposal, already implemented in v5.5–v5.6.

### Changed — Roadmap (version reordering)

- v6.0 reassigned to OpenSpecs migration (this phase).
- v7.0 ← Social login Google OAuth2 (was v6.0).
- v7.1 ← Email confirmation (was v6.1).
- v8.0 ← Android mobile app (was v7.0).
- v9.0 ← SEO prerendering (was v8.0).

---

### Added — v5.6 Bulk DNA Visual generation

- Branch `feat/v5.6-dna-mass-generation` opened for offline generation script.
- **`docs/plan/seed_visual_dna_group_a.sql`**: SQL seed with 56 Group A species (manually curated), grouped by family with intra-genus differentiation. Applied in Supabase with `ON CONFLICT DO UPDATE`, `is_validated=false`.
- **`src/lib/visualGlossary.js`**: mycological terms → visual language glossary for image models. Translates: `fibrillose` → `smooth silky-matte`, `campanulate` → `bell-shaped`, `pileus` → `cap`, `umbo` → `central raised bump`, `cortina veil` → `cobweb-like veil`, and ~15 more terms. Applied to all 4 DNA Visual morphological fields before building `layer1_morphology`.
- **`backend/scripts/generate_visual_dna.py`**: Gemini 2.5 Flash offline script for bulk DNA Visual generation of Group B (~136 species). Resume-safe with JSON progress tracking.
- **`backend/scripts/refine_visual_dna.py`**: multimodal Gemini Vision script that compares real catalogue photos against current DNA Visual and proposes field-by-field corrections. Detects real photos by `/assets/` prefix (excludes AI-generated). CLI with `--dry-run`, `--species-id`, `--limit`, `--reset`.
- **DNA Visual badge in generator**: visual indicator `🧬 DNA Visual ✓ / ⚠ No DNA Visual / ✗ error (retry)` next to species ID in generator header. State `vpStatus: 'loading'|'loaded'|'missing'|'error'`.
- **"Trust model" toggle (`trustModelMode`)**: `🧠` button next to DNA Visual badge. When active, omits `layer1_morphology` from the Imagen 4 prefix and lets the model use its trained visual priors. Useful for diagnosing whether text descriptions compete with model priors for well-known species.
- **lite/fast model filter**: `fetchAvailableImageModels` excludes `fast` and `lite` variants (do not follow complex instructions). Auto-selection prioritises `imagen-4.0-generate-001`.

### Fixed — v5.6 (session 2)

- **Double `volva` replacement in glossary**: `visualGlossary.js` — replacing `volva` → `"sac-like cup at the base of the stem"` (7 words) produced garbled text in STIPE and ADDITIONAL fields of Amanita caesarea when the original text already contained `sac-like`. Changed to `"cup-shaped volva sac"` (3 words, no collision).
- **Amanitaceae structured pipeline — hidden volva / warts in juveniles**: added `"Amanitaceae"` entry to `HYMENIUM_VISUAL_FOR_IMAGE_MODEL` with 4 absolute rules: (1) prominent volva visible in adult/juvenile, (2) ring, (3) cap completely smooth in all stages — blocks A. muscaria=warts prior for smooth-capped species (section Vaginatae), (4) primordium = white dome with only the cap tip emerging.
- **Family constraint missing from structured pipeline**: in DNA Visual active mode, `layer1_prefix` was morphology-only. Now also prepends `HYMENIUM_VISUAL_FOR_IMAGE_MODEL[family]` before CAP/STIPE/HYMENIUM fields, ensuring family rules reach Imagen 4 as early tokens in both pipelines.
- **`datetime.UTC` incompatible with Python 3.10**: `backend/app/models/scores_cache.py` used `from datetime import UTC` (Python 3.11+). Fixed with shim `UTC = timezone.utc`.
- **Supabase SQLs applied**: C. orellanus (esp-111) cap colour + gills, R. virescens (esp-023) anti-Amanita, A. caesarea (esp-055) cap smooth + gills egg-yellow.

### Fixed — v5.6

- **Prompt bloat / instruction conflicts**: `MANDATORY_PHOTO_PREFIX` reduced from ~600 to ~120 tokens. Removed redundant blocks that contradicted each other (staging repeated in 3 places, duplicate centering). Each rule is now a single line with no overlap.
- **Adult centred in frame**: staging instruction simplified to one concrete line (`ADULT centered in frame, foreground`). Previously several conflicting paragraphs caused the model to ignore all of them and place the adult to the right by prior.
- **Backlight blocking atmosphere**: removed `Golden hour backlit forest` from `MANDATORY_PHOTO_PREFIX` (early token that overrode the mist/dew generated by Gemini). Atmosphere is now set exclusively by Gemini output.
- **Fauna on the cap**: `faunaHint` from DNA Visual was injected verbatim to Gemini (e.g. `"beetle on cap edge"`), overriding the `NEVER on cap` constraint. Fix: explicit OVERRIDE added to the hint regardless of `associated_fauna` field content in DB. `"optional"` → `"MANDATORY"`.
- **Generic/always-the-same atmosphere**: instruction `choose ONE from list of 6` → `exactly ONE of 4 options (MANDATORY)`. Long list + "optional" = Gemini ignored it and generated generic lighting.
- **Primordium without real scale**: stageBlock specified `compact` without size. Fix: `2–4 cm tall, roundish nub barely emerging from soil` + `"size difference must be dramatic and immediately obvious"` + `"vary proportions randomly each time"`.
- **`faunaHint` with beetle on cap (esp-001)**: Boletus edulis `associated_fauna` said `"Small pine bark beetle on the cap edge"` → changed to snail/woodlouse on the ground (SQL applied in Supabase).
- **Double replacement in glossary** (`cortina` → `cobweb-like veil veil`): regex fixed with lookahead `(?!\s+veil)` to avoid replacing when already followed by `veil`.
- **`asyncpg IS NULL` in `refine_visual_dna.py`**: `WHERE (:sid IS NULL OR s.id = :sid)` fails with asyncpg — split into two separate queries depending on whether the filter is present.

---

### Added — v5.5 Myco-Engine DNA Visual

- **`mushroom_visual_prompts` (migration 009)**: new Supabase table with DNA Visual per species — separate fields for cap, stipe, hymenium (visual image language, not raw botanical), extra image-safe morphology, Gemini-internal morphology (reactions/toxicity), substrate, habitat and associated fauna. `is_validated` field for quality control.
- **`composition_notes`**: optional Text field per species for composition rules (dominant specimen, framing, elements to avoid). Included in model, schema, endpoints, seed and frontend.
- **`MushroomVisualPrompt` (SQLAlchemy model)**: async model with FK to `species.id`, Text fields for all visual descriptors, `is_validated: bool`, auto `updated_at`.
- **`VisualPromptData` + `VisualPromptUpsertBody` (Pydantic schemas)**: response and upsert body for the new endpoint. `VisualPromptData` includes `is_validated`.
- **`GET /species/{id}/visual-prompt`** (admin only): returns the structured DNA Visual or `null` if no entry yet. 200 + null = no data = pipeline fallback.
- **`PUT /species/{id}/visual-prompt`** (admin only): creates or replaces a species' DNA Visual. Full-replace semantics.
- **`scripts/seed_visual_prompts.py`**: seeding script with 10 pilot species covering all hymenium types: Boletaceae (pores), Amanitaceae (gills + volva), Cantharellaceae (ridges), Morchellaceae (honeycomb), Russulaceae (brittle gills), Hydnaceae, Bankeraceae (teeth), Hericiaceae (coral). All marked `is_validated=True`.
- **`docs/plan/seed_visual_prompts_009.sql`**: SQL equivalent of the seed script for running in Supabase SQL Editor without Render shell access.
- **`ImageGenerator.jsx` — structured pipeline**: when the backend returns DNA Visual for the selected species, the generator uses the 4-layer pipeline (Layer 0: anti-diptych → Layer 1: validated DB morphology → Layer 3: optics → Gemini scene-only output). Gemini receives pre-assembled morphology and only generates the scene/atmosphere. Automatic fallback to Gemini-interprets-morphology pipeline when no DB data. Log shows `🧬 DNA Visual en BD` vs `📝 Sin DNA Visual`.

### Fixed — v5.5

- **Tall framing (specimen in upper third)**: `MANDATORY_PHOTO_PREFIX` updated with explicit ground-level camera instruction — lens 5–10 cm from ground, slightly upward, stipe base in lower third, cap in centre third, canopy with bokeh in upper third.
- **Russula virescens rendered with warts/volva (Amanita prior)**: cap descriptors rewritten to emphasise almost smooth surface with ceramic-style cracking (not 3D bumps), stipe rewritten with zero indication of bulb/volva. `composition_notes` added specifying specimen on clean ground without emerging from egg.

### Added — v5.4 Admin generator redesign (gallery-first)

- **`CatalogImagesModal.jsx`**: extracted from `ImageGenerator.jsx` to its own file (`src/components/admin/`) so it can be reused from `SpeciesAdminModal` without loading the full generator bundle. Exports: `CatalogImagesModal` (default + named), `photoPosLabel`, `moveItem`.
- **`SpeciesAdminModal.jsx`**: new species modal opened from the admin gallery. Shows thumbnails of all photos with navigable lightbox (←/→, dots, ESC). Two actions: "Reorder" (opens `CatalogImagesModal` DnD) and "Generate image" (navigates to simplified generator via `?especie=XXX&generar=1`). Fetches raw detail on mount to feed `CatalogImagesModal`.
- **`AdminGeneratorHub.jsx`**: unified hub for `/admin/generator`. Gallery mode (default): renders `AdminGallery` + `SpeciesAdminModal` when `?especie=`. Generator mode: lazy-loads `ImageGenerator` when `?especie=XXX&generar=1`. URL management: `replace: true` for modal open/close (no history pollution), push to navigate to generator (back button works).

### Changed

- **`AdminGallery`**: accepts optional `onOpen` prop. When provided (hub mode), uses it instead of `navigate()`. Backwards-compatible — without prop, previous behaviour.
- **`ImageGenerator`**: gallery-first mode activated with `?generar=1`. Hides species selector + ID field, "New" and "Import CSV" buttons, and the "Catalogue images" sidebar block. Shows title with scientific name + "← Gallery" button instead. Main button renamed to "Generate image". Removes inline `CatalogImagesModal` definition and helpers; uses import from `./CatalogImagesModal`.
- **`App.jsx`**: route `/admin/generator` points to `AdminGeneratorHub` (lazy). Route `/admin/gallery` redirects to `/admin/generator` (permanent redirect). Removed `ImageGenerator` lazy from root router — now inside the hub.

---

## [5.3.1] - 2026-03-22 — Bug fixes: photo cache, admin generator

### Fixed

- **Stale photos in `SpeciesModal` and lightbox**: removed species detail TTL cache (`_detailRawCache`). Each modal open does a fresh backend fetch (`cache: 'no-store'`), ensuring admin changes are immediately visible without page reload.
- **Species list not updating after saving from admin**: `invalidateSpeciesListCache()` now emits a `fungus:species-list-invalidated` event via `window.dispatchEvent`. `useSpecies` listens to the event and forces a catalogue re-fetch without needing navigation.
- **`largeUrl` lost on `set-order` save**: `buildInitialPhotos` in the admin generator stored URLs already processed by `resolveUrl()` (with leading `/`), but the backend `set-order` looks them up in `meta_by_url` as they are in the DB (no prefix). Removed `resolveUrl` from `buildInitialPhotos`; now applied only in the `src` of rendered images.
- **Backend `Cache-Control` exposed `/species` with `max-age=3600`**: middleware now returns `no-store` for all `/species` routes, allowing the frontend to always receive fresh data.
- **`set-order` only preserved `caption`, losing `largeUrl` and other metadata**: `meta_by_url` dict now captures all fields except `url` — including `largeUrl`, `caption`, etc. DnD reordering no longer discards the high-resolution URL.
- **Duplicate photos in `SpeciesModal` gallery**: `allPhotos` in `GallerySection` now applies URL-based deduplication (`findIndex`) before building the final array.
- **`Regenerate` generated image with wrong ID**: `settings.specimenId` is cleared to `''` after each generation. `generateImage()` now uses `activeSettings = viewedItem.settings` when called without args (Regenerate), preventing the computed ID from always being `000`.
- **Refine used deprecated model `gemini-2.0-flash-exp-image-generation`**: updated to `gemini-2.0-flash-preview-image-generation`. Fixed `responseModalities: ['IMAGE', 'TEXT']` (uppercase, both modalities required by new API contract). Extended unavailable model detection (`400`, `INVALID_ARGUMENT`, `deprecated`, `unavailable`). When fallback to Imagen 4 text-to-image is triggered, an amber warning is shown to the user instead of only logging in the status panel.

---

## [5.3.0] - 2026-03-22 — Generator: unlimited photos, insertion-style DnD, dynamic gallery

### Added

- **`POST /api/v1/species/{id}/images/set-order`** (backend): new admin-only endpoint. Accepts `{"photos": ["url1", "url2", ...]}` — ordered URL list. Writes `extra_data.photo.url = photos[0]` and `extra_data.photos = [{url, caption}...]`. Supports unlimited photos (no 3-slot limit). Preserves existing captions by URL. Schema `SetPhotosOrderBody` in `backend/app/schemas/species.py`.
- **Unified `CatalogImagesModal`**: replaces `OverwriteSlotPicker` + old save modal. Props: `newImageDataUrl?`, `newImageMimeType?`. If a new image is provided, it appears prepended at position 0. Always uses `POST /images/set-order`. Single flow for saving and reordering.
- **Insertion-style DnD with `framer-motion layout`**: dragging a card makes others slide smoothly to make room in real time (spring animation). Model: `visualPhotos = moveItem(photos, dragIdx, hoverIdx)` — framer-motion animates position transitions with stable URL `key`.
- **Dynamic gallery in `SpeciesModal`**: `GallerySection` adapts layout to photo count — 1 photo (full-width 16:9), 2 photos (50/50), 3 photos (classic large + 2 small), 4 photos (2×2 grid), 5+ photos (2×2 grid with `+N` on last cell, click opens lightbox).

### Fixed

- **DnD reliability**: `_dropFiredRef` makes `handleDrop` idempotent; `onDrop` on card AND grid (belt-and-suspenders); `_hoverIdxRef` avoids stale closure in drop handler; `_resetDragState()` clears refs and state atomically.
- **HTTP cache bypass**: `cache: 'no-store'` in `fetchSpeciesDetail` — photo order stays correct after page reload (no longer served from backend `Cache-Control: public, max-age=3600`).
- **Production API key gate**: replaced no-op button with `type="password"` input with `getApiKey()` helper (fallback env var → runtime input).

---

## [5.2.0] - 2026-03-22 — Generator: catalogue save flow + Gallery → Generator

### Added

- **`PATCH /api/v1/species/{id}/images`** (backend): new admin-only endpoint. Accepts `slot` (`main`|`photo1`|`photo2`), `image_base64` and `mime_type`. Stores image as `data:` URI in `extra_data` JSONB. Uses `flag_modified` for SQLAlchemy to detect JSONB change. Requires `get_admin_user` dependency.
- **`POST /api/v1/species/{id}/images/reorder`** (backend): new admin-only endpoint. Accepts `{main, photo1, photo2}` mapping indicating which current slot goes to each position. Reassigns URLs (static or `data:` URI) without re-encoding. Schema `SlotReorderBody` in `backend/app/schemas/species.py`.
- **`SpeciesImageUpdate`** and **`SlotReorderBody`** schemas in `backend/app/schemas/species.py`.
- **Gallery → Generator**: clicking any species in `AdminGallery` navigates to `/admin/generator?especie=<id>` instead of opening `SpeciesModal`. New `GalleryCard` component (local) with "Generate" hover overlay and edibility dot.
- **URL pre-load**: `ImageGenerator` reads `?especie=` on mount, fills ID and Scientific Name fields, and fetches full species detail (with `extra_data.photos`) to display the reference panel.
- **Always-fresh reference panel**: sidebar re-syncs `referenceSpecies` from the API every time `settings.specimenId` changes (with `AbortController` to cancel stale requests). When opening the save modal, a pre-fetch from DB always runs to ensure the most recent state.
- **Reference panel**: sidebar section in the generator showing the 3 current catalogue images (main, photo 1, photo 2) for any selected species.
- **"Save" button**: visible whenever there is a generated image and `specimenId` filled — regardless of whether the species comes from `?especie=`.
- **`OverwriteSlotPicker`** (two tabs) + catalogue management modal: "New image" tab calls `PATCH /species/{id}/images`; "Reorder" tab calls `POST /species/{id}/images/reorder`. Both update the reference panel without page reload.
- **Navigation blocker**: `useBlocker` (React Router v6.28) shows a confirmation dialog when trying to leave with a generated unsaved image. `beforeunload` protects tab/window close.

---

## [5.1.0] - 2026-03-21 — Admin: Image Generator + Gallery

### Added

**Image generator (`/admin/generator`)**
- **`ImageGenerator`**: full migration from AI Studio to a Vite/React component in `src/components/admin/ImageGenerator.jsx`. Route protected by `AdminGuard` (`role === 'admin'`).
- **Imagen 4** via `:predict` endpoint (`imagen-4.0-generate-001`) for generation. **Gemini 2.5 Flash** for description/translation.
- **Real refiner** (`callGeminiRefine`): image-to-image editing with `gemini-2.0-flash-exp-image-generation` — sends current image as `inlineData` + text instruction, receives edited image. Fallback to Imagen 4 text-to-image if model unavailable.
- **Fixed dimensions**: 1376×768 (large) and 688×384 (small), via `processImage` with `targetWidth`/`targetHeight`.
- **Species selector from API**: removed hardcoded `MUSHROOM_SPECIES_DATA` array (200 entries). Replaced by `useSpecies()` + `useMemo` with `FOREST_TYPE_LABELS` mapping.

**Admin navigation**
- **`isAdminView`** in `AppContext`: navigation mode toggle (user ↔ admin) without reload.
- **Public/Admin toggle** in `Profile.jsx` via `Tabs` — visible only for `role === 'admin'`.
- **Layout split**: `userNavItems` (Dashboard, Zonas, Especies, Micología) vs `adminNavItems` (Generator, Gallery). Profile always visible. Sections alternate, not stack.
- **Admin routes** in English: `/admin/generator`, `/admin/gallery`. `AdminGuard` in `App.jsx`.
- **`IC.wand`** — new magic wand SVG icon in `helpers.jsx`.
- **i18n**: keys `adminGenerator`, `adminGallery`, `modoPublico`, `modoAdmin` in ES/CA/EN.

**Admin gallery (`/admin/gallery`)**
- **`AdminGallery`**: new page with 202-species catalogue from API.
- **Card view** (default): uses `SpeciesCard` same as `/especies`.
- **Grid view**: 8-column grid with hover overlay (scientific name + id).
- **Filters**: text search + family selector + edibility selector.
- **Connected filter pill**: `ag-search` / `ag-family` / `ag-edib` in `styles.css` — rounded only at ends, flat between segments, 4px gap like `SearchFilterBar`.
- **Responsive**: mobile = title + toggle on same row · search in row 1 · selectors as single pill in row 2 (gap-0). Desktop = everything in one horizontal row.
- **Pagination** with `?pagina=N` URL-synced (PAGE_SIZE = 24).

**Auth UX (post-v5.0)**
- **Profile fields on registration**: First name, Last name and Date of birth (optional) in `AuthModal` and backend (`RegisterRequest`, migration 007).
- **`PATCH /me/profile`**: endpoint to edit first name, last name and date of birth. Email immutable.
- **`DELETE /me/account`**: permanent deletion with CASCADE.
- **`EditProfileModal`**: pre-fills data, shows ✓ Changes saved, auto-closes.
- **Profile UX**: greeting `Hola, {nombre}`, initials in avatar, "View all →" deep links to zones/favourites.
- **Cookie notice** in `AuthModal` at the bottom of the form.
- **`IC.pencil`** — pencil icon in `helpers.jsx`.
- **Full URL sync** in `Zones.jsx` and `Species.jsx` — all filters in URL.
- **`SpeciesModal` hero opens lightbox** on click.
- **i18n**: keys `hola`, `nombre`, `apellidos`, `fechaNacimiento`, `editarPerfil`, `cambioGuardado`, `guardar`, `eliminarCuenta`, `confirmarEliminar`, `cookieInfo`, `sinZonasSeguidas`, `sinEspeciesFavoritas`, `mas` in ES/CA/EN.

### Fixed
- **`setRecentBatchIds([])`** — calls without argument caused `TypeError` when accessing `.includes()` on `undefined`.
- **`SameSite=None`** on refresh cookie for production (Vercel → Render cross-site).
- **CORS**: `PATCH` added to `allow_methods` — `PATCH /me/profile` was blocked by preflight.
- **`translateApiError`**: maps `'Failed to fetch'` / `'Load failed'` (Safari) / `'NetworkError'` (Firefox) to `errRed`.
- **ruff UP045**: `Optional[X]` → `X | None` in `me.py` and `schemas/auth.py`.
- `stopPropagation` on favourite button in `SpeciesModal` hero.
- **Hover-lift on species cards** — `anim-up` split into two keyframes.

---

## [5.0.0] - 2026-03-16 — JWT auth + user accounts + favourites in DB

### Added
- **Backend Auth**: endpoints `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/me`. Classic JWT: access token (1h) + refresh token (30d, httpOnly cookie). `secure=settings.is_production` for local/production compatibility.
- **`users` table**: email, password_hash (bcrypt), `plan` (`"free"`|`"premium"`), `plan_expires_at`, `created_at`. `plan` field ready for future monetisation.
- **`user_followed_zones` and `user_fav_species` tables**: FK to `users`, `zones` and `species` with CASCADE. Migration 006.
- **`/me` endpoints**: `GET/POST/DELETE /me/followed-zones` and `GET/POST/DELETE /me/fav-species`. Idempotent (POST does not fail if already exists).
- **`authService.js`**: access token in JS memory (XSS-safe), all auth/me/favourites calls, localStorage-to-API migration on login.
- **`AuthModal`**: login/register tabs with active underline, centred imagotype, MODAL.overlay+MODAL.bg colours consistent with other modals, absolute close button.
- **`AppContext`**: auth state (`user`, `authLoading`, `authModal`), `login`/`register`/`logout`, silent session restore on mount, auth gate in `toggleFollow`/`toggleFavorite`.
- **`Profile`**: 3 states — loading / unauthenticated CTA / full profile with plan badge, stats and logout.
- **i18n**: auth keys for ES/CA/EN (`iniciarSesion`, `registrarse`, `cerrarSesion`, `contrasena`, `minPass`, `authHintLogin`, `authHintRegister`, `authCta`).

### Fixed
- `pydantic[email]` added to deps — `EmailStr` required `email-validator` not included.
- `passlib` replaced by direct `bcrypt` — incompatibility with `bcrypt>=4.x` caused silent 500 in `hash_password`.
- 30s timeout on Alembic migration engine to avoid startup hang if Supabase takes too long to respond.
- Explicit lifespan logging so migration errors appear in Render logs.

---

## [4.7.1] - 2026-03-16 — Complete editorial i18n (articles + morphology + UI)

### Added
- Full Micología page i18n: metadata for 5 articles (`title_ca/en`, `subtitle_ca/en`, `summary_ca/en`, `tags_ca/en`) added to `articles.js`. Helper `getLocalizedArticle(article, lang)` exported. 5 UI keys (`micologiaDesc`, `masArticulos`, `articulosCadaMes`, `minLectura`, `contenidoNoDisp`) added to all 3 `i18n.js` blocks. `Micologia.jsx` renamed to `Articles.jsx` and refactored to use `t` and localised articles; routing based on static `article.slug` (language-independent). `ArticleModal.jsx` uses `getLocalizedArticle` to localise header title/subtitle/tags; dynamic date locale (`es-ES`/`ca-ES`/`en-GB`); `t.minLectura` and `t.contenidoNoDisp`.
- Article i18n: `Micorrizas.jsx`, `Esporas.jsx` and `Venenos.jsx` refactored as structural templates. All visible text (section titles, paragraphs, callouts, lists, SVG labels, figure captions) extracted to ~180 `art_*` keys in `i18n.js` with complete ES, CA and EN values. `ArticleP` and `ArticleCallout` accept new `html` prop for rich text with `dangerouslySetInnerHTML`. `ArticleInfographic` accepts `infografiaLabel` for label translation. SVG labels in Micorrizas translated via `t` prop. `FOTOS` arrays moved inside components and computed from `t` in Esporas and Venenos.
- Trilingual morphology (`cap_ca/en`, `stem_ca/en`, `flesh_ca/en`, `sporePrint_ca/en`) for 202 species. Migration `038_morphology_i18n.sql` generated (153 KB, ~1,250 values translated to CA+EN). Fix in `apiService.js`: `cap`/`stem`/`flesh`/`sporePrint` fields go through the `i18n()` helper in `normalizeSpeciesDetail`.
- Two-phase header scroll in `Layout.jsx`: Phase 1 (scroll ≤ headerH) — rises naturally with content (`translateY(-scrollY)`, no transition); Phase 2 — smart sticky: snaps on scroll-up (animated snap), hides on scroll-down. Returning to Phase 1 has no jump (`Math.max` prevents it). Publishes `--header-h` as CSS variable.
- Sticky search+filter bar in `/especies` and `/zonas` (list view only): appears at `top:24px` when the inline bar leaves the viewport; disappears when the inline bar returns to view or when the header appears. On desktop the Filter button opens a sticky dropdown; on mobile uses the existing `FilterPanel` bottom-sheet portal. `drop-shadow` only on the sticky variant.
- `hideDesktop` prop in `FilterPanel`: suppresses the inline desktop panel when the sticky bar manages filters (avoids double-open).
- Migrations `019`–`029`: `description_ca/en` for the remaining 181 species (all families except Boletaceae, already completed in `014`). Closes full coverage of 202/202 species with trilingual ES/CA/EN descriptions.
- Migrations `030`–`037`: `diff_ca/diff_en` for all confusion entries in DB. Complete coverage of 8 taxonomic blocks: Morchellaceae+Boletaceae, Amanitaceae, Cantharellaceae, Russulaceae, Cortinariaceae, Agaricus, Neoboletus and Amanita gemmata.

### Changed
- Zones: default tab changed to `listado` (was `mapa`).

### Fixed
- Sticky bar persisted when filter results were 0 or few and there was no body scroll. Cause: scroll listener does not fire after a programmatic scroll that ends without an additional event. Fix: `stickyUpdateRef` + `useEffect([filteredX.length])` re-evaluates position after each result count change.
- Sticky bar persisted when the user had the input focused (`stickyFocused` overrode `searchBarInView`). Fix: `searchBarInView` is now the sole authority — if the inline bar is in view, sticky always hides, no exceptions.
- Delete (×) button on search input with `theme="light"` used a different colour from other icons. Aligned to `search-light-text` with `opacity-60`.
- Removed orphan `useScrollDir.js` hook (never used in the final implementation).

---

## [4.7.1-cond-fruct] - 2026-03-14 — Trilingual fruiting conditions (202 species)

### Added
- `cond_temp`, `cond_precip`, `cond_suelo`, `cond_req` as own fields in `SpeciesDetail` schema — resolved by language via `_extra_str`
- `_to_detail()` in `routers/species.py` exposes the 4 `cond_*` fields to the frontend
- `_extra_str`/`_extra_list` look for `{key}_es` before the unsuffixed fallback, supporting Gemini-suffixed keys (`cond_temp_es`, etc.)
- `cond_fruct` migrations for all 202 catalogue species in ES/CA/EN (`004`–`018`): Boletaceae, Amanitaceae, Russulaceae, Cantharellaceae, Morchellaceae, Pleurotaceae, sessions A–D + manual esp-086/esp-188
- `normalizeSpeciesDetail` in `apiService.js` maps the 4 `cond_*` fields with `i18n()` helper for CA/EN client-side resolution from `extra_data`
- `018_cond_fruct_sesion_d.sql` — `cond_req` ecological correction for 28 species with prior morphological content (Strophariaceae×9, Polyporaceae×9, Tricholomataceae×6, Agaricaceae×3, Pleurotaceae×1)

### Changed
- `SpeciesModal.jsx` — fruiting conditions block replaces family-hardcoded `if/else` with `detail.cond_*` from API; no hardcoded data

---

## [4.7.0] - 2026-03-13 — Complete i18n (UI + DB)

### Added
- i18n v4.7: expanded `src/data/i18n.js` from ~25 to ~110 keys per language (ES/CA/EN), covering all frontend components
- i18n v4.7: `helpers.jsx` — `getEdibilityColor` and `getScoreColor` now use `tKey` instead of hardcoded `label`; `EdibilityTag`, `TaxonomyBlock`, `ConfusionesBlock` and `SpeciesImg` translated with `useApp()`
- i18n v4.7: `Dashboard.jsx` — all hardcoded strings replaced; dates with dynamic locale (`es-ES` / `ca-ES` / `en-GB`)
- i18n v4.7: `Zones.jsx` — comarca/CCAA/forest filters, tabs, empty states and filter chips translated
- i18n v4.7: `Species.jsx` — edibility, family, sort filters and active filter chips translated; `tKey` pattern in `SHOW_FILTERS`
- i18n v4.7: `ZoneModal.jsx` — edibility filters, meteorological metrics, OI description and empty states translated; `tKey` pattern in `EDIBILITY_FILTERS`
- i18n v4.7: `SpeciesModal.jsx` — gallery, lethal warning, fruiting conditions, progress bars, full morphology (cap/stem/flesh/spore print), confusions, compatible zones and elevation translated
- i18n v4.7: `FamilyModal.jsx` — "Mycological family" header, "Characteristics" and empty state translated
- i18n v4.7: `ZoneCard.jsx` — "Collection conditions" and score label translated; `useApp()` added
- i18n v4.7: `Profile.jsx` — "✓ Saved" translated
- i18n v4.7 DB: backend `/species` accepts `?lang=es|ca|en` — `_extra_str`/`_extra_list` helpers with automatic ES fallback
- i18n v4.7 DB: `fetchAllSpecies(lang)` and `fetchSpeciesDetail(id, lang)` pass language to API; raw cache language-independent in detail
- i18n v4.7 DB: `useSpecies` with per-language cache — reactive to language change without unnecessary re-fetch
- i18n v4.7 DB: migration `013_common_names_i18n.sql` — `commonNames_ca` and `commonNames_en` for all 202 catalogue species

---

## [4.6.4] - 2026-03-08 — Confusions for remaining families

### Added
- Migrations: `006_confusions_amanitaceae.sql` — 13 Amanitaceae species + cross-family (caesarea, muscaria, phalloides, verna, virosa, pantherina, rubescens, ovoidea, spissa, citrina, excelsa, Agaricus silvicola, Leucoagaricus leucothites); amatoxins and symptom delay in diffs
- Migrations: `007_confusions_cantharellaceae.sql` — Cantharellus cibarius/pallens/aurora, Craterellus tubaeformis/cornucopioides + cross: Omphalotus olearius (most common chanterelle confusion)
- Migrations: `008_confusions_russulaceae.sql` — 14 Russula/Lactarius/Lactifluus species: emetica vs edible, deliciosus vs torminosus/deterrimus/sanguifluus, vellereus vs piperatus; acrid-taste rule in diffs
- Migrations: `009_confusions_cortinariaceae.sql` — 9 Cortinarius (lethal orellanus/rubellus/splendens vs caperatus/praestans/violaceus) + cross: Inocybe erubescens; orellanin and 2–3 week delay in all diffs
- Frontend: comarca filter on Zones page — contextual `<select>` (filtered by selected CCAA), removable active chip, auto-reset on CCAA change
- Frontend: `comunidadAutonoma` added to all zones in mock (`src/data/zones.js`, 200 zones) — unlocks the CCAA filter that already existed in code
- Frontend: edibility filter (`availFilter`/`calFilter`) in "Available now" and "Fruiting calendar" sections of ZoneModal; smart default excelente → comestible → all
- Frontend: `no_comestible` option added to all edibility selectors (ZoneModal and species catalogue)
- Frontend: `ConfusionesBlock` restyling — photo + name + `EdibilityTag` in family-item style; description full-width in right column
- Frontend: reduced mobile padding in ZoneModal and SpeciesModal (`px-4 py-6 sm:px-6`)
- Migrations: `003_edibility_no_comestible_round2.sql` — edibility corrections for *Pycnoporus cinnabarinus*, *Phlebia radiata*, *Hygrophorus pustulatus* (comestible → no_comestible) and *Lepista personata* (bueno → comestible); apply in Supabase
- Frontend: mock `species.js` updated with the same 4 edibility corrections

---

## [4.6.2] - 2026-03-07 — Confusions in DB

### Added
- Backend: `SpeciesConfusion` schema (`with_species_id: str`, `diff: str`) in `schemas/species.py`
- Backend: `confusions: list[SpeciesConfusion] | None` field in `SpeciesDetail` (not in `SpeciesListItem`), read from `extra_data.confusions` (JSONB)
- Backend: `_confusions(species)` helper in `routers/species.py` to extract the JSONB field
- Backend: Alembic migration `005_confusions.py` (data-only, no schema change)
- Backend: `005_confusions_data.sql` — initial data for Morchellaceae (*Morchella esculenta*, *M. importuna*, *M. elata*, *M. semilibera*, *Gyromitra esculenta*, *Helvella lacunosa*), *Boletus edulis* and toxic boletes (*Suillellus luridus*, *Neoboletus erythropus*, *Rubroboletus satanas*) with bidirectional relationships. Migration executed in Supabase.
- Frontend: `edibilityStyle(edibility)` helper in `helpers.jsx` — derives `icon`, `borderColor`, `nameColor` from edibility value (no presentation stored in DB)
- Frontend: `ConfusionesBlock` rewritten to read `detail.confusions` from the API (removed `CONFUSIONES_POR_FAMILIA` and `CONFUSION_GENERICA`)
- Frontend: guard in `SpeciesModal` — "Possible confusions" section (including title) only renders if `detail.confusions?.length > 0`

### Changed
- `description`, `synonyms` and `confusions` moved from `SpeciesListItem` to `SpeciesDetail` — listing endpoint does not include them; loaded only on modal open

### Documented
- `docs/deploy.md`: note on manual deploy trigger in Render free tier when auto-deploy fails

### Changed
- **Edibility audit** — 16 species move from `comestible` to `no_comestible`: Ganoderma lucidum, G. applanatum, Fomes fomentarius, Trametes versicolor, T. gibbosa, T. hirsuta, Daedalea quercina, Clathrus ruber, C. archeri, Mycena galericulata, M. haematopus, M. chlorophos, Xylaria hypoxylon, Hohenbuehelia petaloides, Rhodotus palmatus, Scleroderma citrinum (was `toxico`)
- **Catalan common names corrected** (were Catalan-ised Spanish, not real popular names):
  - *Lycoperdon perlatum*: "Bejí comú" → **"Pet de llop"**; added "Cuesco de lobo" (correct ES name)
  - *Lycoperdon pyriforme*: "Bejí dels troncs" → **"Pet de llop piriforme"**
  - *Scleroderma citrinum*: "Cuesco de llop" → **"Pota de cavall"**; ES name: **"Escleroderma amarillo"** (not "Cuesco de lobo", which belongs to L. perlatum)
  - *Laetiporus sulphureus*: "Bolet de mel" → **"Pollastre del bosc"**
  - *Trametes versicolor*: "Cua de faisan" → **"Cua de gall dindi"**
- Broken Wikipedia URL in *Scleroderma citrinum* description (es.wikipedia → en.wikipedia)

### Structure
- `migrations/` directory created for SQL data migrations (INSERT/UPDATE/DELETE in Supabase), distinct from `backend/migrations/` (Alembic, schema)
- `migrations/001_esp202_chroogomphus_rutilus.sql` — seed *Chroogomphus rutilus*
- `migrations/002_edibility_audit_and_commonnames.sql` — edibility audit + common names
- `docs/IMPLEMENTACION-COMPLETA.md`, `docs/MEJORAS-CHANGELOG.md`, `docs/README-MOCK-DATA.md` removed (v2.0-era planning documents, completely obsolete)

---

## [4.5.0] - 2026-03-07 — Mock → API audit

### Changed
- `useWeatherConditions.js`: removed direct import of `mockSpecies`. Now uses `useSpecies()` in `useZoneConditions` and `useAllZoneConditions`, getting species data from the hook with automatic fallback to mockSpecies. Closes the last residual catalogue data import in logic hooks.
- `useAllZoneConditions`: marked as `@deprecated` in JSDoc. Dashboard and Zones use `useZones()` (backend) since v4.3; this function is kept as fallback if direct Open-Meteo needs to be reactivated.

### Documented
- `mockArticles` imports (Dashboard, Micologia, ArticleModal) marked as `// MOCK PERMANENTE` — articles are static JSX content with no planned backend endpoint.
- `mockFamilies` imports (SpeciesModal, Family.jsx) marked as `// MOCK PERMANENTE` — stable 8-family catalogue, no planned endpoint.
- Audit summary: the only residual import was `mockSpecies` in `useWeatherConditions.js`. All other mocks are explicit fallbacks (useZones, useSpecies) or permanently static data (articles, families).

### Improved
- `fetchSpeciesDetail` in `apiService.js`: in-memory cache by ID (`_detailCache` Map + `_detailPromises` for in-flight promises). Second open of the same SpeciesModal is instant without additional backend request. No new dependencies.

---

## [4.4.0] - 2026-03-06 — Server-side DB weather cache · **deployed to production**

### Added
- `WeatherCache` model + migration 003: `weather_cache` table (zone_id+provider_id PK, temp_min/max, humidity, rainfall14d, wind, TTL)
- `fetch_weather_for_zone()` — server-side Open-Meteo fetch with daily temp range (min/max)
- `store_weather_cache()` + `get_latest_weather()` — DB cache with 3h TTL and expiry validation
- `GET /api/v1/weather/zones/{id}` + `GET /api/v1/weather/zones` — weather endpoints with cache-first
- `GET /api/v1/zones` now includes `weather: ZoneWeather` embedded in each zone
- Weather cache warmup on startup (background task, batches of 10)
- Auto-migrate on startup: `await asyncio.to_thread(_run_db_migrations)` — no shell required
- `GET /api/v1/admin/trigger-backfill?days=N` — backfill without shell access (Render free tier)
- `VITE_API_BASE` configurable via env var in frontend (fallback to production URL)
- Article "Los recicladores del bosque" — new mycological content (Recicladores.jsx)

### Changed
- `ZoneListItem` schema includes `weather: ZoneWeather | None` field
- `useApiZoneConditions`: `dryDays` now reads `score_detail.days_since_rain` (was null)
- `ZoneCard` and `ZoneModal` show `tempMin–tempMax°C` range from weather_cache

### Fixed
- `asyncio.run()` in lifespan caused `RuntimeError` → silent 500 + CORS error on startup
- CORS blocked Vercel preview URLs — resolved with `allow_origin_regex`
- Float precision in `pa21_mm` and similar (`1.7999...` → `r1`/`r0` helpers)
- Double fetch in React StrictMode — in-flight promise cache `_apiZonePromises`

---

## [4.2.0] - 2026-03-02 — Catalogue in DB + species endpoints

### Added
- `GET /api/v1/species` — paginated listing with filters by family, edibility, forest type and fruiting month. Cursor-based pagination.
- `GET /api/v1/species/{id}` — full detail: OI params, morphology, photos, confusions (extra_data)
- `backend/app/schemas/species.py` — Pydantic schemas: `SpeciesListItem`, `SpeciesDetail`, `SpeciesOIParams`
- `backend/migrations/versions/002_zone_description.py` — `description TEXT` column in `zones` table
- `HEAD /api/v1/health` — lightweight probe for UptimeRobot without DB query (avoids false incidents)

### Changed
- `GET /api/v1/zones` and `GET /api/v1/zones/{id}` — now include `description` field
- `seed_catalog.py` — rewritten: correct mapping of flat mock fields (`temp_optima_min/max`, `precip_14dias_*`, `altitud_min/max`, `dias_hasta_fructificacion`); Node imports with absolute `file://`; `--dry-run` flag

### Deploy
- Migration `002` executed in Supabase (`alembic upgrade head`)
- Seed executed with `python -m scripts.seed_catalog --mock-dir ../src/data` (200 zones, 201 species)

---

## [4.1.0] - 2026-03-02 — Backend scaffold + Outbreak Index · **deployed to production**

### Context
Start of the v4 era (backend). v4.1 is the first phase: FastAPI + PostgreSQL + PostGIS scaffold, server-side meteorological ingestion engine with Open-Meteo and the Outbreak Index algorithm. The catalogue (zones, species) remains mock on the frontend until v4.2.

### Added
- `backend/` — complete FastAPI project with pyproject.toml, Dockerfile and Alembic
- `backend/app/models/` — 5 async SQLAlchemy 2.x models: `Zone`, `Species`, `ClimateHistory`, `ScoresCache`, `WeatherStation`
- `backend/migrations/versions/001_initial_schema.py` — initial migration with PostGIS (`geom` GENERATED ALWAYS AS from lat/lon)
- `backend/app/connectors/open_meteo.py` — P3 connector, server-side, with retry/backoff (tenacity). Aggregates hourly to daily.
- `backend/app/services/scoring.py` — Outbreak Index (OI) algorithm: PA21 × 0.30 + Thermal × 0.25 + Seasonal × 0.25 + Ripening × 0.12 + Humidity × 0.08
- `backend/app/services/ingest.py` — concurrent daily ingestion (semaphore 6), idempotent upsert with source upgrade rule, scores_cache refresh
- `backend/app/routers/health.py` — `GET /api/v1/health`
- `backend/app/routers/zones.py` — `GET /api/v1/zones`, `GET /api/v1/zones/map-scores`, `GET /api/v1/zones/{id}`
- `backend/app/main.py` — FastAPI + CORS + Cache-Control middleware + APScheduler cron (05:00 UTC)
- `backend/scripts/backfill.py` — historical backfill up to 2 years via Open-Meteo
- `backend/scripts/seed_catalog.py` — prepared for v4.2: imports mock JS → PostgreSQL
- `docs/conventions.md` — language policy, semantic versioning, git branching, commit format
- `CLAUDE.md` updated with complete backend section

### Decisions
- **Target infrastructure**: Render (API) + Supabase (PostgreSQL + PostGIS)
- **Active connector**: Open-Meteo only (P3) until Meteocat API key available (v4.1.x)
- **Code in English**: identifiers, comments, commits, table/column names. See `docs/conventions.md`
- **Versioning**: major=generation, minor=phase, patch=task. No "-phaseN" labels in versions. See `docs/conventions.md`
- **Branch**: `epic/v4-backend` groups all backend phases (v4.1, v4.2, v4.3) before merging to `main`

### Deploy
- **API**: `https://fungus-api.onrender.com` (Render free tier, Frankfurt)
- **DB**: Supabase PostgreSQL + PostGIS (Ireland)
- **Frontend**: `https://fungus-ashen.vercel.app` (Vercel, pointing to `main`)
- **Keep-alive**: UptimeRobot monitor on `/api/v1/health` (14 min interval)
- **Pending**: health endpoint should accept HEAD so UptimeRobot does not generate false incidents

---

## [3.0.0] - 2026-02-26 — Complete migration to Vite + React Router

### Phase 5: Leaflet Map + Micología

#### Context
Fifth phase: the Vite migration is complete. Interactive Leaflet map across all app sections, functional Micología page with ArticleModal and article system, and code splitting reducing the main bundle from 617KB to 133KB.

#### Added
- `src/components/map/LeafletMap.jsx` — vanilla Leaflet map with markers mode (🍄 markers by forestType) and synthetic meteorological heatmap mode (Spain grid with `leaflet.heat`), fullscreen button with portal, zoom control, dark popups
- `src/components/modals/ArticleModal.jsx` — article modal with hero photo, sticky mini-bar, ARTICLE_REGISTRY pattern; exports helpers `ArticleSection`, `ArticleP`, `ArticleCallout`, `ArticleInfographic`
- `src/articles/Micorrizas.jsx` — complete article with 3 SVG infographics (nutrient exchange, Ecto vs Endo, species-tree table), 5 sections and bibliographic sources
- `src/pages/Micologia.jsx` — real page with featured article (hero image + text) and article card grid (published/coming soon)

#### Changed
- `src/pages/Zones.jsx` — Map tab now uses real `<LeafletMap>` (was placeholder)
- `src/components/modals/ZoneModal.jsx` — Location section uses `<LeafletMap singleZone>` (was placeholder)
- `src/components/modals/SpeciesModal.jsx` — "Where to find it" section uses `<LeafletMap zonas>` (was placeholder)
- `src/components/Layout.jsx` — mobile navigation changed from bottom tab bar to hamburger ☰ expandable (aligned with standalone)
- `vite.config.js` — `manualChunks` for code splitting: main bundle 617KB → 133KB; separate chunks for react-vendor, leaflet-vendor, data-species, data-zones

#### Installed
- `leaflet.heat` — Leaflet heatmap plugin

---

### Phase 4: Modals

#### Context
Fourth phase: all modals (ZoneModal, SpeciesModal, FamilyModal, Lightbox) ported to React components with ES module imports. The complete modal stack works from AppContext without prop drilling.

#### Added
- `src/components/modals/Lightbox.jsx` — full-screen photo viewer with keyboard navigation (← → Esc), touch swipe, desktop thumbnails, mobile dots, portal to `document.body`
- `src/components/modals/FamilyModal.jsx` — family card with description, characteristics and family species listing
- `src/components/modals/ZoneModal.jsx` — zone card: hero photo, sticky mini-bar on scroll, thermometer with 6 metrics, species available now, fruiting calendar with filters, map placeholder (Phase 5)
- `src/components/modals/SpeciesModal.jsx` — species card: hero photo, edibility + family link, lethal warning, common names, TaxonomyBlock, description, habitat, 12-month calendar, gallery with lightbox, fruiting conditions, morphology (cap/stem/flesh), ConfusionesBlock, distribution map placeholder (Phase 5)
- `src/components/modals/ModalRenderer.jsx` — renders the active modal reading AppContext state; mounted in `App.jsx` outside the route tree

#### Changed
- `src/App.jsx` — added `<ModalRenderer />` right after `<ScrollToTop />`

---

### Phase 3: Pages and Global State

#### Context
Third phase: the four main pages have real content and global state is centralised in React Context. The Vite app is navigable with real data.

#### Added
- `src/contexts/AppContext.jsx` — global state with React Context: `followedZones`, `favoriteSpecies`, `lang`, `profile`, modal stack (`selectedZone`, `selectedSpecies`, `selectedFamily`, `lightbox`). Persisted in `localStorage` with key `fungus_v3` (compatible with standalone)
- `src/components/ui/FilterPanel.jsx` — responsive filter panel: collapsible inline on desktop, drag-to-close bottom-sheet on mobile
- `src/components/ui/SearchFilterBar.jsx` — search bar with integrated Filter button (variants: `full` / `split`)
- `src/components/ui/Tabs.jsx` — reusable tabs (variants: `default` / `compact`, sizes: `sm/md/lg`)
- `src/components/ui/ActiveFilterChip.jsx` — active filter chip with delete button
- `src/components/ui/ZoneCard.jsx` — zone card with mock conditions, score bar, forest icon
- `src/pages/Dashboard.jsx` — full port: stat cards, top zones, followed zones, in-season species, favourites
- `src/pages/Species.jsx` — full port: search, filters (edibility, family, sort), paginated grid (24/page), ellipsis pagination
- `src/pages/Zones.jsx` — full port: map/list tabs, filters (followed, rain, forest, CCAA, sort), cards with conditions
- `src/pages/Profile.jsx` — full port: notifications, personal data, language selector, stats
- `src/components/Layout.jsx` — added mobile bottom bar navigation with emojis + active state

---

### Phase 2: Data and Helpers

#### Context
Second migration phase: data and shared utilities are now importable ES modules, decoupled from the standalone's global scope.

#### Added
- `src/lib/constants.js` — single source of truth for design tokens: `COLORS`, `MODAL`, `FOREST_COLORS`, `MONTHS`
- `src/lib/helpers.jsx` — helpers ported from standalone as named exports: `IC` (SVG icons), `getEdibilityColor`, `EdibilityTag`, `SpeciesImg` (with Wikipedia fallback), `SpeciesCard`, `getScoreColor`, `fakeConditions`
- `src/data/zones.js` — 28 zones as `export const mockZones`
- `src/data/species.js` — 27 species (5218 lines) as `export const mockSpecies`
- `src/data/families.js` — 8 families as `export const mockFamilies`
- `src/data/i18n.js` — es/ca/en translations as `export const i18n`
- `src/data/articles.js` — mycology articles as `export const mockArticles`
- `src/data/opportunities.js` — mock opportunities as `export const mockOpportunities`

---

### Phase 1: Foundation

#### Context
Start of the migration from standalone architecture (browser Babel) to a modern React app with a real bundler and routing. The standalone remains in `standalone/` as a working archive.

#### Added
- **Vite 6** as bundler — replaces the CRA in `frontend/` (deleted) and browser Babel transpilation
- **React Router v6** — URL-based routing, replaces manual `view` state
- **Tailwind CSS 3** installed via npm (postcss) — replaces CDN
- **React Leaflet 4** installed via npm — replaces CDN
- `src/` directory structure (pages/, components/, lib/, data/, articles/)
- Route shell with 5 placeholder pages: `/`, `/zonas`, `/especies`, `/micologia`, `/perfil`
- Nested routes for deep linking: `/zonas/:id`, `/especies/:id`, `/micologia/:slug`
- Automatic `ScrollToTop` on every route change
- `vercel.json` with SPA rewrites for React Router to work in production
- `public/assets/` with all image resources (2,200+ files)
- Design system in `tailwind.config.js` (colours, typography)
- `styles.css` with `.glass`, `.hover-lift`, `.anim-*`, `.modal-*` classes ported from standalone

#### Removed
- `frontend/` (experimental CRA, never in production)

---

## [2.8.0] - 2026-02-18 — Massive data expansion

### Added
- **28 zones** (was 8, +250%): coverage of all Spain — Pyrenees, Central System, Iberian System, Cantabrian Mountains, Mediterranean zone
- **27 species** (was 7, +286%): new common species including Macrolepiota procera, Hydnum repandum, Calocybe gambosa, Craterellus cornucopioides, Lepista nuda, Hygrophorus marzuolus, among others
- Representation of all seasons: winter, spring, summer and autumn
- Coverage of 9 autonomous communities and 20 provinces

---

## [2.7.3] - 2026-02-18

### Added
- **Mode tabs in fullscreen modal**: the "Zones / Heatmap" selector now also appears when expanding the map to full screen
- **Smart Dashboard**: complete redesign of stat cards with actionable information
  - "General Conditions" card: average score of top zones + aggregated climate metrics
  - "Best Zone Today" card: recommendation with dynamic reason explanation, clickable
  - "Active Species" card: listing of species fruiting this month, clickable

---

## [2.7.2] - 2026-02-18

### Changed
- **Zoom controls** moved to `bottom-left` on all maps (was `top-left`)
- **Mode selector** (Zones/Heatmap) moved to `top-left` (was `top-right`)
- Final layout without overlaps: mode (top-left) · zoom (bottom-left) · fullscreen (bottom-right)

---

## [2.7.1] - 2026-02-18

### Added
- **Reusable `<Tabs>` component** with `md` and `sm/compact` variants
- **Mode selector in map** integrated inside the map itself (top-right), with blur background for legibility
- Clear text labels: "Zonas" / "Mapa de calor" (was 📍🌡️ icons)

---

## [2.5.1] - 2026-02-18

### Fixed
- **`BottomPillPortal`**: filter drawer refactored with `ReactDOM.createPortal` to render in `document.body`
  - Backdrop now covers the full screen regardless of scroll
  - Drawer always anchored to viewport bottom (`position: fixed`)
  - Max-width 500px centred on desktop
  - Z-index independent of parent stacking context

---

## [2.3.0] - 2026-02-17 — Complete UX redesign

### Added

#### Zones section (redesigned)
- **Interactive Leaflet map** with all georeferenced zones
  - Markers by forest type with differentiated colours
  - Informative popups on marker click
  - CartoDB Dark tiles for visual consistency
- **Subtabs**: Map / My Zones / All Zones (integrates old "Tracking")
- **Quick access to followed zones** from "My Zones" subtab
- Follow button on each ZoneCard

#### Zone card (redesigned)
- **Anchor design** — all info in continuous scroll:
  1. Compact thermometer-style progress bar
  2. Grid of 6 current conditions
  3. Species available now with score and estimated days
  4. Fruiting calendar by species
  5. Leaflet location map
- **Follow / Following button** in modal header
- Zone description

#### Species section (improved)
- Search by scientific name or common name
- Filter by family with dropdown selector
- Sort: Alphabetical / By family / By edibility
- Toggle to show favourites only
- Pagination (8 per page) with numeric navigation
- Real photos in cards (Wikimedia Commons)

#### Species card (redesigned)
- Full-width hero photo with name overlay
- Prominent edibility badge (5 levels including LETHAL)
- Extreme danger warning with toxicology number
- Technical morphology with SVG illustrations (cap, stem, flesh)
- Extended description, common names with chips
- Habitat + elevation range (min–max m.a.s.l.)
- Distribution map with zones where to find it
- Favourite button (heart) in header
- Access to Family card

#### New Family card
- Modal accessible from species card
- Description and family characteristics
- Species listing with photo, names and badge
- Direct navigation to species card

#### New User Profile section
- Zone tracking notifications
- Editable personal data (name, email)
- Language selector: Castellano / Català / English (complete interface)
- Summary of followed zones and favourite species

#### Expanded mock data
- 25 species (was 5) with complete morphological data, photos and distribution
- 8 mycological families with description and characteristics
- 8 zones (was 5)

### Changed
- Removed "Tracking" section from nav → integrated into Zones
- Zone card: from tabs to anchor design with scroll
- Thermometer: from large bar to compact progress bar
- Navigation: Dashboard / Zonas / Especies / Perfil
- Typography: Cormorant Garamond + DM Sans
- localStorage: key `fungus_v3` (zones, favourites, profile, lang)

---

## [2.2.0] - 2026-02-17 — Fullscreen modal and gallery

### Added
- **Fullscreen map modal**: "Fullscreen" button on all Leaflet maps
  - Covers full screen for maximum functional area
  - Close with button or Escape key
  - Contextual title (zone name or "Mycological zones map")
  - Available in: main Zones map, location map in zone card, distribution map in species card
- **Photo gallery in species card**:
  - Grid preview (up to 4 columns) with hover effect and magnifier
  - Caption on thumbnail hover
  - Available photo count
- **Fullscreen lightbox for gallery**:
  - Full-screen image on thumbnail click
  - Navigation with side arrows or ← → keys
  - Clickable thumbnails in bottom bar
  - Active photo caption
  - Close with X or Escape key
- **Multiple real photos per species** (Wikimedia Commons): 2–4 photos per species, 25 species = ~70 photos total

---

## [2.0.0] - 2026-02-17 — Tracking system

### Added
- Tracking section with favourite zones and localStorage
- Zone modal with 3 tabs (Real Time, Calendar, Available)
- Visual Collection Thermometer
- Follow Zones button with header counter
- Improved Species cards with regional synonyms

---

## [1.0.0] - 2026-02-16 — Initial release

### Added
- Dashboard with StatCards and opportunities grid
- Zones view with calendar modal
- Species view with edibility badges
- Mock data system: zones, species, opportunities
- Glass morphism design, dark theme, responsive
- Standalone single HTML file with no dependencies
