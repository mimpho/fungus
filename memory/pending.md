# Pending Tasks and Open Reviews

Completed items are removed from this file — history lives in `CHANGELOG.md`.

---

## 🔴 Priority — Deploy `epic/observatory` as v7.2.0 (decided 2026-11-05)

The epic is closed in the retrospective of 2026-11-05 (changes in `system/workflows.spec.md`). Done on 2026-11-04/05: variables in Render and Vercel, private bucket `corner-photos`, dump of `zones`, `species`, `users` and `alembic_version` (in `local-data/`, outside git). In order:

1. Merge `chore/observatory-epic-close-docs` into the epic; then PR `epic/observatory` → `main` with a merge commit (not squash) and tag `v7.2.0` (`backend/pyproject.toml` already says 7.2.0). The merge deploys Render and Vercel at the same time and Alembic 017–021 apply on the back end's start-up.
2. `/api/v1/health` must say `rasters: ok`, and the log must show `Raster forest loaded from the bucket`.
3. Apply `046` and `048` in Supabase (`047` is applied) and check with the one-column-per-migration query.
4. Cells: `ingest_cells.py load --limit 10` to measure the real cost, then the 423 cells in about two days (`load --max-calls`), run by Marcos with `DATABASE_URL` in front of the command; afterwards the daily `cell_refresh` job must be running.
5. DevTools → Network on `forest-raster` and `substrate-raster` ("transferred" vs "size", second visit "(disk cache)"): ~1 MB, drop the gzip branch; ~13 MB, build option C (see 6g).
6. Log in with email and password after the JWT rotation; upload one photo in «Mis rincones» (production bucket `corner-photos`).

## 🔶 Next epics (decided 2026-11-05)

1. 🔶 **Close `epic/observatory-map`** (T1–T4 integrated on 2026-11-06 in #161; decided 2026-11-06): retro, version `backend/pyproject.toml` 7.2.0 → 7.3.0 (the tag `v7.3.0` is Marcos's after the `--no-ff` merge). Front end only: no migration, no new variable. T5 «Zonas de interés» left the epic (it needs back end and data) and so did the rest of T6; the page `/zonas` stays deprecated and linked from the dashboard.
2. 🔶 `epic/observatory-navigation` (new, front end only; decided 2026-11-10, **before** the phone improvements and before items 3 and 5 below, which build on it): one navigation model for desktop and phone — tabs Meteo / Zonas / Bosque with a switch each, a separate Vista button, layers that accumulate on one map; replaces `MapPills`, `MapLayersBox` and `ViewPill`. PRD written: `memory/observatory-navigation-prd.md` (design: proposal C of the Claude artifact «Observatorio — propuestas de filtros y vistas del mapa»). The nine open questions were answered on 2026-11-10 (PRD table and `memory/decisions.md`); tasks T1–T5 with spec and Gherkin scenarios in `memory/observatory-navigation-plan.md`. **T1 done** (2026-11-11, `feat/observatory-navigation-shell`: desktop shell, state model, loading bar); **T2 done** (2026-11-11, `feat/observatory-navigation-phone`: phone tab bar with Vista, sheets, one-sheet rule); **T3 done** (2026-11-11, `feat/observatory-navigation-meteo`: Meteo panel, URL `capa`/`seta`/`dia`, day hand-off to the zone, map drag limits that count the covered edges); next **T4** (Zonas and Bosque panels). Rain, temperature, wind and «Zonas de interés» enter as inert rows until their epics.
3. 🔶 `epic/observatory-zones-of-interest` (new, full stack; PRD to write, short, with «Deployment readiness»; its entry point is the «Zonas» tab of `epic/observatory-navigation`, no longer a pill): the «Zonas de interés» markers on the map, `fetchPointsOfInterest(bbox)` backed by an endpoint and data (the fixture of the first idea is not enough), tap a marker to observe the point. Marcos has to give the coordinates of Sercases, La Molina, El Brull, Fageda del Montseny and Puigcerdà.
4. 🟡 Chore from `main` (small, after the close): dead code left by `epic/observatory-map` — `PointHabitat.jsx` and the key `obsHabSource` if unused, orphan i18n keys; `TerritorySection` / `ZoneRanking` go when `/zonas` is retired. The phone pass and the ES/CA/EN and light/dark checks on the old pills and cards are **not done on the old shell**: they move to `epic/observatory-navigation`, which replaces it.
5. `epic/observatory-meteo` (renamed from `observatory-layers` on 2026-11-10; full stack, small; PRD to write, short, with «Deployment readiness»): the weather layers of the «Meteo» tab of `epic/observatory-navigation` — 7c rain first (endpoint over the stored `climate_cell_history`, no migration, no new ingest; accumulated over a window that ends on the shared day slider, presets 24 h · 7 d · 21 d, cuts for 24 h and 7 d set with real data; see the navigation PRD, Q2), then 7d temperature and 7e wind. 7f Top 10 is not a weather layer and stays out of it: it goes in the «Zonas» tab (see 7f).
6. 🗂 **Point card as a sheet, phone and desktop** (decided 2026-11-10 while answering Q9 of `epic/observatory-navigation`; out of that epic, goes with the phone improvements that follow it). The point's card becomes the first level of the observed zone. **Phone:** dragging the sheet up opens the observed zone (same as «Observar»), dragging it down closes it (today only the close exists). **Desktop:** the card rises from the bottom, centred in width, not full width and not necessarily glued to the bottom edge (like Google Maps on desktop); not draggable on non-touch screens, so «Observar» and the close button stay. To solve: its overlap with the Meteo / Zonas / Bosque panel at the top right (≤ 400 px) and that both must coexist on desktop (Q5 of the navigation PRD); where the map centres the picked point so the card does not cover it. **Phone look (raised in T2 QA, 2026-11-11):** since T2 the point's sheet rises from the top of the tab bar with the same surface (`.map-surface`, the bar loses its rounded corners under it), so it reads as if it came out of the bar, like a tab's sheet. Marcos prefers it to stay a bottom sheet (the drag handle and the drag-up-to-observe gesture only make sense there) but to look unrelated to the bar, e.g. a slightly darker surface (a token in `src/styles/tokens.css`, per theme); a modal without backdrop, detached from the bar, was considered and set aside for that reason.

## 🟡 Loose ends (moved from the retired status documents, 2026-11-11)

Small items that only lived in the Spanish status documents of the Claude Project. Security housekeeping (tokens, terminal history) is Marcos's and is not written here.

- **`CHANGELOG.md`:** the summaries of `epic/observatory` and `epic/observatory-map` still sit under `[Unreleased]` («to be released as …») although both are in `main`; turn them into `[7.2.0]` and `[7.3.0]` sections.
- **Minor code:** `bqp` / `bqr` possibly swapped; 3 ruff warnings; `scripts/gbif_forest_affinity.py` still uses the 5 old forest classes; unused keys `obsSaveCancel` and `obsPhotoNoSpecies`; `className` prop of `SpeciesPanel` unused; zones 030 and 202 without an altitude range.
- **Inherited:** review forest weights against the field notebook (carrasco); extend the pH and forest-weight audit; photos of corners branch 3; branches `fix/observatory-cache-control` and `feat/observatory-forest-filter` (check whether still needed); 11 species without fruiting conditions; `compare_years`.
- **Integrated branches that can be deleted:** those of `epic/observatory`, `feat/map-fullscreen-observe`, `docs/observatory-map-close`. `epic/observatory` and `epic/observatory-map` by hand once everything is deployed (the `epic/*` ruleset blocks it; switch it off for a moment).
- **External answers:** CREAF (needed before monetising) and ICGC (geocoder limits, licence of `ombres_tfosc`).
- **Colour tokens: the generator is stale** (found 2026-11-11, T1 of `epic/observatory-navigation`). `scripts/generate-css-vars.ts` (`npm run gen:css-vars`) still writes into `src/styles.css`, which no longer has its markers (it would append blocks there), and the «generated» blocks of `src/styles/tokens.css` have been edited by hand (the light block has 76 variables; the script writes 21). In practice `src/styles/tokens.css` is the web's source of truth and `shared/colors.ts` only feeds the mobile app. **Do not run the script** until it is fixed. Fix (fits the shared-package epic): point it at `tokens.css`, generate every variable that block holds (RGB channels and `--ui-*` included) from `shared/colors.ts`, and move there the tokens added by hand (`--map-surface`, `--nav-active`, `--switch-*`, `--shadow-float`, `--shadow-bottom`, light `--color-bar`).

## 🟡 Chore from `main` — dev environment and safety nets (decided 2026-11-05, outside the epic)

Why: `backend/.env` pointed at production and `seed_catalog.py` overwrote data on 2026-10-24. Done on 2026-11-05: `DATABASE_URL` in the local `.env` points to the disposable `fungus-ingest-test` (port 55432). To do, from `main`:

- Second Supabase project for development (Storage only; the database stays in Docker) with a private photos bucket; then replace or empty `SUPABASE_*` in the local `.env` and delete `corner-photos-dev` from the production project.
- Local `.env`: its own random `JWT_SECRET_KEY` (never production's) and an empty `RESEND_API_KEY`. Fix the comment of `.env.example` that says to use Render's values; add a rule to `system/agents.spec.md` (the local `.env` never holds production credentials); update `docs/environments.md` and `docs/deploy.md`.
- One shared guard for every script that writes to a database (refuse a remote host unless an explicit flag is given), dry run by default (`--apply`), and a test that fails if a script of `backend/scripts/` writes without it. Today only `seed_catalog.py` has an explicit one; `backfill`, `fix_species_colors`, `make_admin`, `seed_visual_prompts`, `zone_elevation_ranges`, `forecast_qa`, `generate_visual_dna` and `refine_visual_dna` match write patterns without it.
- Read-only role in production for local queries and dumps.
- Weekly dump of the critical tables from Marcos's Mac (the free plan has no backups). Not as GitHub Actions artifacts: the repository is public.
- CI: a frontend job (`npm ci && npm run build`, Node from `.nvmrc`); today `ci.yml` only runs backend tests and ruff.
- GitHub: push protection against secrets and protect `epic/*` like `main`.
- Credits: the Copernicus DEM notice («produced using …») and its liability sentence in `CreditsModal` (copy both from the licence PDF); ICGC enquiry (reverse geocoder limits, licence of the `ombres_tfosc` relief service); CC BY link for the relief once confirmed.

## 🔴 Closing — Observatory (web), phase 1 (`epic/observatory`) — 2026-10-10 (epic closed 2026-11-05)

> Items below marked ✅ that still carry a post-deploy check stay until the check is done after the deployment; prune them then.

Product re-prioritised on 2026-10-10: the web Observatory comes first and the Android app is paused (see `memory/decisions.md`). Source of truth: the Observatory design document (includes scoring v2 and its task list). Hand-off: `observatorio-paso-a-desarrollo` in the Fungus project. Epic: `epic/observatory` (no version number until it is merged into `main`, see `system/workflows.spec.md`). Kick-off done on 2026-10-10: product contract in `memory/observatory-prd.md` (all open questions answered), technical plan with Gherkin scenarios per branch in `memory/observatory-plan.md`. Branches, cut from the epic and squash-merged into it, in this order:

1. ✅ `feat/observatory-scoring-v2` (2026-10-10, PR to the epic): `scoring_v2.py` (pure functions) + tests with the design document's cases (Montseny 49, La Molina 7, Setcases 16, Costabona 20 on 2026-10-06). Measures the 100- vs 190-day data window.
2. ✅ `feat/observatory-bands-elevation` (merged #125; pending: review the full dry run and `scripts.zone_elevation_ranges --apply`; re-run `~` zones when Overpass is free; fix stored `elevation_m` flagged `?`, e.g. zone-004 Pinar de Lleida 1,450 m vs 690 m terrain): five-band scale with the `--mid` token, zone altitude as a range (`elevation_min_m` / `elevation_max_m`, migration).
3. ✅ `feat/observatory-ingest-v2` (2026-10-10, PR to the epic): ingest reads the v2 window; `score_oi` becomes v2 (zones, dashboard, map), v1 kept in `score_detail.v1`; v1/v2 comparison CSV script from 2024-10-01 (no Open-Meteo calls).
4. ✅ `feat/observatory-forecast` (merged #128): `zone_forecast` table (migration 016, applies on Render's startup), 16-day forecast stored by the daily ingest with the same Open-Meteo call, `services/forecast.py` (loader and warnings), projection script. After merge: check on the first daily run that `forecast_rows` ≈ 16 × active zones. The «Previsión en la zona» widget and Momento/calendar use it from the api and page branches.
5. ✅ `feat/observatory-api` (merged #130): daily series, thermometer snapshot, species for a date, calendar; v2 computed on the fly from `climate_history`.
5b. ✅ `feat/observatory-forest` (merged #131): `/point/forest` (ICGC toponym and land cover 2024), `no_forest` in `/point/species`, species filtered by macrotype, one thermometer per point.
5c. ✅ `feat/observatory-user-limit` (merged #132, 2026-10-16): 429 per user for new cells (`cells.created_by`, migration 018 applies on Render's startup, `OBSERVATORY_MAX_NEW_CELLS_PER_USER_PER_DAY`=10, 0 disables). After deploy: check `select id, created_by from cells order by created_at desc limit 3;` after a click in a new area.
5d. ✅ (provenance dropped by migration 020, 2026-10-22; see 6c) `feat/observatory-saved-points` (merged #133, 2026-10-17; QA against a disposable Postgres passed, migrations up to 019 and `downgrade -1`): `/observatory/saved-points` CRUD plus `/{id}/species`, table `saved_points` (migration 019 applies on Render's startup), provenance recorded by the server (land cover layer/code/name/date, toponym name/label, MCSC-4 codes with percentage; no raw texts), the author's forest types (a list) win over the land cover, `OBSERVATORY_MAX_SAVED_POINTS_PER_USER` (0 = no limit). After deploy: save a point from a tool or `/docs` and check `select id, user_id, land_cover_code, toponym_name, forest_types from saved_points order by created_at desc limit 3;`; the SQL store has no unit test (no DB in the sessions), so this is its first real run.
5e. 🔄 `feat/observatory-mcsc-grid` (code done 2026-10-17, pending PR): `app/services/mcsc_grid.py` (tile format, `Grid`, pure `composition`) and `scripts/mcsc_preprocess.py`; sheet 36321 gives one 43 KB tile. Not wired to any endpoint.
5f. `feat/observatory-composition` (next): wiring. Upload the preprocessed tiles to the private Supabase Storage bucket, a tile loader with a bounded in-memory cache (the grid's cache has no limit), `composition` in `/point/forest`, union of the types above the threshold in `/point/species`, composition is no longer stored with saved points (decided 2026-10-22, computed on open); the threshold and the 422 limits of the radius live here.
6. 🔄 `feat/observatory-page` (integrated in `epic/observatory`, PR #135, 2026-10-18): the page following the prototype, view state in the URL, Observatorio in the header with Perfil as an avatar menu (replaces the Público/Admin toggle). Done: 1 base, 2 map/click/panel/URL, 3 thermometer, 5 search, 4 saved points, 6 species list, 8 charts, **7 calendar** (2026-10-18), plus, asked by Marcos on 18 Oct: forecast block (`/point/forecast`), the chart's 21 days ahead and drag, the timeline, the persistent map with the «Zonas guardadas» modal, recent searches and **«Área de territorio»** (its zone ranking; the rain heat map built with it was removed unshipped, see 6b). **9 header entry and avatar menu** done 2026-10-21 (`feat/observatory-header-menu`, awaiting commit and merge by Marcos; replaces the Público/Admin toggle and `isAdminView`; «Ver en el Observatorio» in the zone card stays out as a separate task, the Observatory is reached by coordinates since 14 Oct and `?zona=` no longer exists). Left: **10 pass on phone, languages and dark theme** (**phone pass of the map and the zone done 2026-10-30, `feat/observatory-mobile-map`, to verify on screen: see `CHANGELOG.md`; still to pass on a phone: the corners list/dialog (sheet, search under the title, filter panel with the keyboard), the profile card, the photos and the photo viewer, which is unreadable in the light theme; languages and the dark/light check of everything new**; known: «Observar» cut on 667 px phones, the saved-point form is cramped on phones; optional hillshade layer). Not checked against the real backend yet (only mocks), nor tiles, Photon or the ICGC. Not planned for now: downloadable reports, `compare_years`, composition and the zone comparator (an idea in `memory/product-ideas.md`, not a task: decided 2026-10-18). Probable backend bug, not touched: `/point/species` may return `excellent` where the catalogue says `excelente`; check when wiring the species list to real data.

6b. ✅ Territory rain (2026-10-18): **removed before shipping** in `chore/observatory-remove-territory-rain` (service, store, grid, model, migration 020, endpoint, 05:30 UTC job, heat map components and tests). Migrations end at 019 again; nothing to check on Render for it and no ~770-call first load. Only the zone ranking («Cerca» / «Seguidas», from the catalogue) stays in «Área de territorio» until 7f. The local database may lack migrations 039–041 (214 active zones outside Catalonia seen on 18 Oct).

Project-wide fixes `fix/migrations-on-startup` and `fix/weather-cache` are merged into `main` and the epic (#121, #122, #123).

6c. 🔶 «Mis rincones» (corners, decided 2026-10-21, **before the 7c–7f layers**): saved points get a manual kind, species tagged from the catalogue, up to five own photos (WebP, private Supabase bucket) and a «Mis rincones» map layer. Plan, decisions and branches in `memory/observatory-corners-plan.md`. 1 `feat/observatory-corners-model` and 2 `feat/observatory-corners-ui` (integrated in `epic/observatory`, #142; mobile pass pending), 2b `feat/observatory-ui-polish` (integrated, #143; the mobile pass must also check the new phone order, the data modal and the «Volver al mapa» band), 2c `feat/observatory-ui-polish-2` (integrated, #144; score breakdown, corner cards scored by their tagged mushroom, zone subtitle with icons; open: a `/point/snapshot` that accepts several species for corners with more than one tag), 3 `feat/observatory-corners-photos` (2026-10-24, **second iteration 2026-10-27**: several photos at once and drag and drop, full-screen viewer, tag pills, species mirrored with the photos, bottom sheet on phones, no cache for corners; see `CHANGELOG.md`; first iteration: photo API, WebP + no EXIF, private bucket, daily limits, migration 021, uploader and viewer in the edit dialog and the card; see `CHANGELOG.md` and `decisions.md`; to check: HEIC with real GPS, account deletion and the 429 limits against a real database, phone layout; to decide: staged upload in the create dialog), 4 `feat/profile-corners-tab` (2026-10-29, built; **to verify on screen** on desktop and phone; see `CHANGELOG.md` and `decisions.md`): not a tab but a «Mis rincones (N)» card in the profile's «Siguiendo» tab that opens the same dialog as the Observatory's, which now has search (name or toponym), filters (kind, comarca, forest) and order (conditions, A–Z, altitude, most recent); place, forest and score are asked from the browser for every corner when it opens (one in a cell not loaded yet counts against the 10 new cells a day). Open: the same filters as a back-end endpoint if a user has many corners.

6d. 🔶 Forest weights per species (2026-10-26, `feat/observatory-forest-affinity`): mechanism and data for 8 species done (see `CHANGELOG.md`, `decisions.md`). Open: (a) ✅ `044` and `045` applied in Supabase (2026-10-27); (b) ✅ the pH audit of the 20 mycorrhizal excellents is decided (2026-11-03, `047` applied the same day; see `CHANGELOG.md`); open: the same audit of pH and forest weights for the rest of the catalogue (*reticulatus* and *caesarea* have `castanar` 0.9 with a pH range that leaves acid soil at 0.46, the mismatch *aereus* had); (c) the weights are estimates, review them with field notes (`cuaderno-de-campo`); (d) `fix/observatory-cache-control`: `private, max-age=60` under `/observatory/` (see `gotchas.md`); (e) soil class from bedrock vs topsoil pH (see `decisions.md`); (f) ✅ done 2026-10-31 in `feat/observatory-forest-split` (see 6f).

6e. 🔶 «Tipo de bosque» layer (2026-10-27, `feat/observatory-layer-forest`): dominant forest class per pixel with a toggle legend (see `CHANGELOG.md`, `decisions.md`). Open: check the colours on satellite, streets and relief and in the light theme; the phone pass (step 10); «otro» and `pinar` are now split (6f): the layer shows chestnut, riparian and the five pine woods on their own.

6f. 🔶 Forest raster in 11 classes (2026-10-31, `feat/observatory-forest-split`, built and tried locally; see `CHANGELOG.md`, `decisions.md`): five pine woods and three other broadleaves; `pinar` and `otro` stay as groups. Open: (a) **before production**: deploy the back end, ✅ rasters uploaded to the private bucket `geo-rasters` on 2026-11-04 (`forest/` 11 classes, `substrate/`), and then run `046_forest_affinity_split.sql` and `048_forest_affinity_russula_chanterelle.sql` (not before: an old back end drops the new keys; `047` can run at any time); (b) check the 11 colours on satellite, streets and relief and in the light theme; (c) ✅ done 2026-11-03 in `feat/observatory-species-data` (`048`, to run with `046`); (d) review the weights with field notes, above all the Aleppo-pine ones (nothing found in the literature for *edulis*); (e) stand age and density are not in MCSC-4 (the literature has them as a strong factor for *edulis*): look for another source; (f) `bqp`/`bqr` probably swapped in the legend notes (only matters if `robledal` is split).

6g. 🔶 Production deployment (decided 2026-11-03; nothing started, Marcos says when). Order: back end → rasters in the private bucket → `046` and `048` (`047` at any time); Alembic 017–021 apply on the back end's start-up (production is at 016). Branches, cut from the epic: ✅ `feat/observatory-raster-storage` (done 2026-11-04, see `CHANGELOG.md`, `decisions.md`: the back end downloads the rasters from the private bucket `geo-rasters` at start-up; bucket created and rasters uploaded and checked; **left for the deploy:** `RASTERS_BUCKET=geo-rasters` in Render, together with `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` — Render has no `SUPABASE_SERVICE_KEY` (checked 2026-11-04; `SUPABASE_URL` not checked), use the new secret key created that day — and then `/health` must say `rasters: ok`), `feat/observatory-raster-gzip` (on hold, branch empty, 2026-11-04: the client's `request()` honours the 24 h `Cache-Control` as far as the code shows, and Render's proxy already compresses JSON with brotli; after the deploy look at "transferred" for the two rasters in DevTools: ~1 MB = drop the branch, ~13 MB = build option C of `decisions.md`, compression in memory on the first request, level 6, no new variable) and ✅ `feat/observatory-attributions` (done 2026-11-04, see `CHANGELOG.md`, `decisions.md`: one credits modal opened from a footer link and from the map's «Fuentes» link; awaiting `vite build`, the phone check and merge). MCSC-4 licence: the CREAF pages only say it is free to use as part of the Generalitat's cartography (no licence, credit, commercial or redistribution terms); enquiry sent 2026-11-03 to `contacte@creaf.uab.cat` (the current domain may be `creaf.cat`; resend there if it bounces); decided to ship with the credit visible and to make the answer a requirement before any monetisation. Before the deploy, with Marcos, step by step: ✅ `JWT_SECRET_KEY` was missing in production and was set on 2026-11-03 (guard and docs in `fix/observatory-jwt-secret-guard`, see `CHANGELOG.md`); check that `ENVIRONMENT=production` is set (the guard and the start-up migrations need it), then the rest of the variables (`FRONTEND_URL`, `EMAIL_FROM`, `RESEND_API_KEY`, `GOOGLE_CLIENT_ID`, `CORS_ORIGINS`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `CORNER_PHOTOS_BUCKET` with its private bucket in the production project, `ALERT_EMAIL`, `STALE_ZONE_DAYS`, `OBSERVATORY_CELL_REFRESH_BUDGET`; `VITE_CARTO_KEY` on Vercel); dump of `zones`, `species` and `users`; the 423 cells (~8,900 weighted calls, two days of quota); whether Render has a test environment; the relief WMTS, ICGC geocoder and DEM licences; the daily cell refresh must be running.

7. 💡 Interactive map with data layers (idea matured 2026-10-18, not started; detail in `memory/product-ideas.md`, section 6). Replaces the fixed-grid «Área de territorio» rain map (6b, not shipped) with toggleable layers on the interactive Leaflet map. Starts after `feat/observatory-page` is merged into the epic (steps 9 and 10 done). One branch per layer, each with its timeline:
   - 7a. 🔶 `feat/observatory-map-ingest` (in progress, 2026-10-18): server-side ingestion of the Open-Meteo cells that touch Catalonia, so a layer over the visible region does not depend on the per-user limit of new cells. Built: discovery by probing (`scripts/ingest_cells.py discover`), resumable load with a call budget (`load --max-calls`), a daily refresh job (`cell_refresh`, `OBSERVATORY_CELL_REFRESH_BUDGET`, 0 = off) and `status`. Checked on a disposable database (2026-10-18/19): 444 cells stored, 423 touch Catalonia, no holes, **all 423 loaded** in three runs (the few cells that failed with transient 503s loaded on the rerun). **Still to do:** the real Open-Meteo cost per cell is not measured (`calls~` is the script's own estimate, 21 per cell), the daily `cell_refresh` job has not run against a real database, and discover/load must be run against the real database only after Render has applied migrations 017–019. PR open. Licences of the DEM (ICGC/Copernicus) still to confirm (7b). **Update 2026-10-21:** `ingest_cells.py refresh` run on the disposable database: 423 cells, ~1,270 estimated weighted calls, 14 transient failures cleared by a rerun; the forecast of the 196 cells loaded on the 18th had gone stale for the layer (see 7b-bis).
   - 7b. ✅ `feat/observatory-layer-probability` (done in code 2026-10-20, awaiting visual check and merge by Marcos): conditions layer (index of favourable conditions, not probability) with species selector, relief bands + per-pixel DEM, forest/soil factors, mean of excellent species when none is chosen, layers box, relief basemap, clicked-point value, layer cache, attributions, ensemble thermometer. Open: clip to Catalonia (reuse `catalonia_outline.py`), municipality radius for place search, production serving of the private rasters (decided 2026-11-03, see 6g), MCSC-4 (see 6g) and relief WMTS licences, review catalogue pH ranges, GBIF audit to weight species by frequency, initial values (0.75/0.85/10 %, pH tolerance 0.3) to be judged against field cases.
   - 7b-bis. ✅ `feat/observatory-layer-forecast` (done in code 2026-10-21, awaiting visual check and merge by Marcos): the layer's reference day goes up to today + 7 from the forecast already stored per cell (no `cell_forecast` table, no migration, no extra Open-Meteo calls: 7a already stored 16 forecast days in `climate_cell_history`), slider with the forecast stretch marked, cache signature with the last forecast download, `ingest_cells.py refresh` and a forecast coverage report in `status`; also the map look on dark basemaps (multiply on relief, opacity per basemap, labels above the layer). Open: **the daily cell refresh must be running in production** (a forecast older than 2 UTC days is not shown and leaves holes in the map); a notice for cells without forecast (postponed until the daily refresh is seen at work); measure the real Open-Meteo cost (`load --limit 10` against the account page) before considering several coordinates per call; satellite place names cannot be separated from the ICGC hybrid tile (would need an ICGC orthophoto without text, URL not located); Open-Meteo free API is non-commercial (see `decisions.md`).
   - 7c. `feat/observatory-layer-rain`: rain with an **adjustable window** whose right end is the reference day (default 2 weeks, down to 1 day); the future stretch is marked as forecast. (The fixed-grid rain map and migration 020 are already gone, see 6b.)
   - 7d. temperature layer, 7e. wind layer: single-point timeline; almost free after 7b.
   - 7f. **Top 10 layer, the last feature of item 7** (2026-11-10: it lives in the «Zonas» tab of `epic/observatory-navigation`, as an inert row until built; not part of `epic/observatory-meteo`): a ranking of the best areas for the reference day, as one more layer of the interactive map. It replaces the «Ranking de zonas» (Cerca / Seguidas) of «Área de territorio», deprecated on 2026-10-18 and to be redone from scratch on the map; the committed block stays in the code until then. Needs 7a and 7b. Open: what it ranks (cells or zones), over which region (visible area or all of Catalonia), general model or per species (the species selector of 7b makes per species the natural answer).
   - Base switch (satellite / street / relief) is not part of 7: fix the street style on the dark theme and add the ICGC shaded-relief WMS in step 10. Real 3D (MapLibre) is discarded.

8. 🔍 Local scoring at 0 in every zone (found 2026-10-18; **outside the Observatory work**, treat on its own). Seen on the local database for several days, in the Zones page as well. Possible causes: the local ingest stopped (`climate_history` not updated), a real dry spell (activation only counts rain from 6 to 35 days ago), or a local database without migrations 039–041 (214 active zones outside Catalonia and little history, see 6b). To tell them apart, run on the local Postgres: `select max(date), count(distinct zone_id) from climate_history;` and `select max(computed_at) from scores_cache;`. It does not block building item 7, but it limits testing the layers against the local database.

**Next, before merging `feat/observatory-ingest-v2` (data quality, found 2026-10-10):** the original zones have approximate coordinates (early mock data): stored altitude differs from the terrain by a median of 229 m, so v1, v2 and the Observatory are affected. Decided with Marcos: only real, named places; focus on Catalonia.

- Done 2026-10-10: migration 040 deactivates 47 generic zones.
- Done 2026-10-11: migration 041 (applied) moves and renames 17 Catalan zones onto places from the route index of "El secret més ben guardat" (M. Estévez Casabosch), renames zone-030 (L'alta vall del Ter), and adds 23 zones (zone-215…237). Elevation of those 40 zones is NULL until the script runs. Not in the book and dropped for now: Fageda d'en Jordà, Grevolosa, Busa, Rasos de Peguera, Poblet, Gerdar (`backend/scripts/data/catalonia_candidates.csv`).
- Night of 2026-10-11 (launched by Marcos): `zone_elevation_ranges --apply --update-point` then `backfill --from 2024-10-01` for the 40 zones; logs `~/elev41.log`, `~/backfill41.log`. To check: bands (zone-235 Serrat de la Bandera should be ~500–900 m), zones with `~`, then scores.
- Points marked `-- approx` in 041 (Pla de les Vaques, Santa Fe, Corredor, Marina, Montgrí, Riells i Montsoriu, Sant Iscle, Rialb, Verd, Moianès) and forest types of the new zones are unverified: check with `zone_relocate.py`.
- Still to do: the original Catalan zones not in the book (031 Gavarres, 032 Beget, 036 Montnegre, 037 Sant Llorenç, 038 Guilleries, 028 Prades, 047, 048, 202, 203, 206, 210, 211, 212, 213), then the rest of Spain; re-run the 105 zones computed without forest mask; update coordinates, backfill moved zones, scores. Dry run of 2026-10-10 in `rangos_zonas.txt` (not committed). Then merge `feat/observatory-ingest-v2`.
- Clean up when done: untracked `rangos_zonas.txt`, `relocate.csv`, `new.csv`; stale branch `fix/carto-basemap-key`.

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

---

## 🟡 Backlog — Observatory: free points and cells (decided 12-14 Oct 2026, non-blocking)

Context: the PRD "Observatorio: mapa libre por coordenadas, celdas y puntos marcados" (repo copy: `memory/observatory-free-map-prd.md`) holds the decisions. Stored zones keep working as they do now; none of this blocks `feat/observatory-api`.

- **Review the coordinates of the 40 curated zones.** Result of `suggest_forest_points.py` (`forest_suggestions.csv`, do not commit): 17 ok, 11 with a fixable point (150-1000 m), 12 unresolved.
  - Unresolved: zone-003 (the name suggests pinewood, stored as oak wood), 029, 035, 043, 044, 208, 217, 224, 225, 231, 235, 237. For each one: fix the type, fix the coordinates using the book, or leave it out of the featured zones.
  - Before applying changes: check with Open-Meteo that the new point falls in the same cell, and keep the old coordinates (reversible migration).
- **Deactivate the ~150 active non-curated zones** (reversible). Their coordinates are imprecise (median altitude error 229 m).
- **Forest type on free clicks (decided 14 Oct):** composition, not dominant species. Macrotype and urban/agricultural exclusion from the 2024 land cover (ICGC, CC BY 4.0). Species present (≥10 % within ~300 m) from CREAF's MCSC-4 (2009), per-sheet shapefile, field `C_SIMPLE` with a level-5 code, and only if the current macrotype does not contradict them. One thermometer per point; the species list is what splits by type (decided 15 Oct). For saved points the author's type wins (done in `feat/observatory-saved-points`, as a list: a point can have several types). MFE discarded as a live service; the WMS layer `cobertes_2009` carries no species.
- **MCSC-4 grid (design decided 2026-10-17, measured on sheet 36321):** two branches. `feat/observatory-mcsc-grid`: preprocessing script (folder of sheets → tiles) and the pure composition function. `feat/observatory-composition`: wiring (`composition` in `/point/forest`, union of the types above the threshold in `/point/species`, composition stored with saved points). Grid of 25 m, class of the polygon at the cell centre, 1 byte per cell plus a code table (every distinct `C_SIMPLE`, non-forest classes included; `bqs` and `bqp` with `confirmed: false`), tiles of 1024×1024 cells compressed with `lzma`, loaded on demand from a private Supabase Storage bucket (the licence is unconfirmed, so never public) and cached in memory. Composition stored by full code, grouped by species only to display. Measured: one 131 km² sheet (8,628 polygons, 82 codes) = 41 KB `lzma` / 51 KB `zlib`, so ~10 MB `lzma` (~12.5 MB `zlib`) for Catalonia (~32,100 km²); a 1024² tile decodes in ~2 ms. Row/column filters make it worse; 50 m and collapsing the non-forest classes save little and were discarded. Raw sheets and the generated tiles live in `local-data/`, excluded in every branch with `.git/info/exclude` (not in `.gitignore`, so the exclusion stays out of the repo) and must never be committed. Does not block anything: until then `/point/forest` returns the macrotype and `composition: null`. Open: other sheets may compress differently; "~500 sheets" does not match ~130 km² per sheet; the grid switches to 2 bytes by itself beyond 255 distinct codes (the whole of Catalonia may need it, check on the first full build); Supabase Storage quota and latency not checked.
- **Soil / substrate at a point (idea, 2026-10-17, not decided):** calcareous versus acid soils change which species appear, but today there is no data source and no structured substrate preference per species (only the free text `cond_suelo_*` in `extra_data` and `preferred_substrate` for the image generator). Order: probe a source (candidate: the ICGC geological map / lithology, unchecked), show it as informative data, then decide whether to curate a substrate preference for the 202 species; only then filter or score by it. For saved points it would be layer + class code + date, like the land cover.
- **To confirm:** MCSC-4 licence (only "de lliure utilització": write to CREAF or ICGC before publishing) and limits of the ICGC reverse geocoder; a real agricultural point to test that class; inferred codes `bqs` (sureda) and `bqp` (roure pènol); `bfs` (fageda) confirmed at Santa Fe.
- **Curated zones checked against MCSC-4 (3 sheets, 14 Oct):** zone-233 fageda 95 %; zone-226 alzinar 50 % + sureda 47 %; zone-205 alzinar 50 % + roure pènol 40 %; zone-003 has no oak at all (alzinar 50 %, pi pinyer 46 %; almost certainly a wrongly stored type, it is called "Pineda"); zone-208 coordinate on buildings (98 % no forest). Tools: `mcsc_lookup.py` (`--radius 300`) and `inspect_dbf.py` in `backend/scripts/`.
- **Replaces** the "Custom zones" entry above: free points saved with a name (toponym by default) and notes are the way to do it.
- **Open-Meteo terms (checked 15 Oct 2026, [pricing page](https://open-meteo.com/en/pricing)):**
  - **Attribution (✅ done 2026-11-04: `CreditsModal.jsx` credits Open-Meteo, ICGC, Photon, OpenStreetMap, Copernicus and CREAF, opened from the footer of every page and from the map).** The data is CC BY 4.0: pages that show Open-Meteo data must credit it. `ZoneModal.jsx` only labels the source as "Open-Meteo", but the footer link now reaches the credits from every page.
  - **Non-commercial only.** The free plan (600 calls/min, 5,000/h, 10,000/day, 300,000/month) is for non-commercial use. Ads, a paid tier or any premium plan make it commercial: decide before monetising. The plan needed is Professional, not Standard, because only Professional includes the historical API that the cells use (prices are not listed on the page).
  - **Quota, not money, today.** A request over 2 weeks counts as several calls (~20 per 280-day cell, ~50 for 740 days). `OBSERVATORY_MAX_NEW_CELLS_PER_DAY` (default 60 new cells/day, ~1,200 calls; plus `OBSERVATORY_MAX_NEW_CELLS_PER_USER_PER_DAY`, default 10) shares the daily quota with the zone ingest and `weather_daily_call_budget`. Revisit it before `compare_years` (740 days per cell).
