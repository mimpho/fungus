# Pending Tasks and Open Reviews

Completed items are removed from this file — history lives in `CHANGELOG.md`.

---

## 🟡 Production checks left from v7.2.0

Nothing in the docs says these were done (reviewed 2026-11-26).

1. DevTools → Network on `forest-raster` and `substrate-raster`, signed in ("transferred" vs "size", second visit "(disk cache)"): ~1 MB, drop the gzip branch; ~13 MB, build option C of `decisions.md` (compression in memory on the first request).
2. Log in with email and password after the JWT rotation; upload one photo in «Mis rincones» (production bucket `corner-photos`).

---

## 🔶 Next epics (decided 2026-11-05)

**Order (decided 2026-11-12):** 0 small chores (squash default, CI waits; ✅ the phone adjustments of `chore/observatory-mobile-adjustments`, 2026-11-13 — still to confirm on an Android after the deploy: that the strip under the tab bar is gone with `viewport-fit=cover`) → ✅ **1 species filter** (`epic/observatory-species-filter`, front end only, closed 2026-11-15 as v7.5.0 when merged; see the CHANGELOG and the plan; follow-ups in item 7) → **2 rain** (item 5, `epic/observatory-meteo`) → **3 zones of interest** (item 3, cut in two: first the visibility, endpoint, admin and pins; then photos, species filter and clustering). Item 6 (point card as a sheet) goes with the phone improvements, after the species filter's T1. The numbers below are kept so other texts can cite them.

3. 🔶 **Third in the order above.** `epic/observatory-zones-of-interest` (new, full stack, pins; PRD written 2026-11-12: `memory/observatory-zones-of-interest-prd.md` (a zone of interest is a public corner in the same `saved_points` table; open questions pending; supersedes 6.2–6.3 of the base-map draft PRD); its entry point is the «Zonas» tab of `epic/observatory-navigation`, no longer a pill): the «Zonas de interés» markers on the map, `fetchPointsOfInterest(bbox)` backed by an endpoint and data (the fixture of the first idea is not enough), tap a marker to observe the point. Marcos has to give the coordinates of Sercases, La Molina, El Brull, Fageda del Montseny and Puigcerdà.
4. 🟡 Chore from `main` (small, after the close): `PointHabitat.jsx` and `obsHabSource` are still used by `PointPanel`; `TerritorySection` and `ZoneRanking` went in T4 of the species filter (2026-11-15). The phone pass and the ES/CA/EN and light/dark checks on the old pills and cards are **not done on the old shell**: they moved to `epic/observatory-navigation`, which replaces it.
5. **Second in the order above.** `epic/observatory-meteo` (renamed from `observatory-layers` on 2026-11-10; full stack): rain, temperature and wind in the «Meteo» tab, one epic and one PRD (`memory/observatory-meteo-prd.md`, 2026-11-26). Rain first; the temperature and wind sections are written when each is taken up. **Next:** answer R1 (look on the map, 4–5 proposals together) and R2 (cuts for 24 h and 7 d, with real data) before the first feature branch. 7f Top 10 is not a weather layer and stays out: it goes in the «Zonas» tab (see 7f).
6. 🟡 **Point card as a sheet, phone and desktop** (**partly built in T4 of the species filter, 2026-11-15**: the phone's sheet is a block of a stack with the species' sheet and the tab bar, folds by its handle or a drag, unfolds by a tap or a drag up; on desktop the card sits in a column at the bottom left with a fold chevron. dragging the sheet up to open the observed zone was built on 2026-11-17 (it grows with the finger, flattens its corners, fades its handle and opens at `OPEN_TOP_PX`; to confirm with a real finger). **Still open:** where the map centres the picked point on desktop). Original note: (decided 2026-11-10 while answering Q9 of `epic/observatory-navigation`; out of that epic, goes with the phone improvements that follow it). The point's card becomes the first level of the observed zone. **Phone:** dragging the sheet up opens the observed zone (same as «Observar»), dragging it down closes it (today only the close exists). **Desktop:** the card rises from the bottom, centred in width, not full width and not necessarily glued to the bottom edge (like Google Maps on desktop); not draggable on non-touch screens, so «Observar» and the close button stay. To solve: its overlap with the Meteo / Zonas / Bosque panel at the top right (≤ 400 px) and that both must coexist on desktop (Q5 of the navigation PRD); where the map centres the picked point so the card does not cover it. **Phone look (raised in T2 QA, 2026-11-11):** since T2 the point's sheet rises from the top of the tab bar with the same surface (`.map-surface`, the bar loses its rounded corners under it), so it reads as if it came out of the bar, like a tab's sheet. Marcos prefers it to stay a bottom sheet (the drag handle and the drag-up-to-observe gesture only make sense there) but to look unrelated to the bar, e.g. a slightly darker surface (a token in `src/styles/tokens.css`, per theme); a modal without backdrop, detached from the bar, was considered and set aside for that reason.
7. 🗂 **Follow-ups of the species filter** (`epic/observatory-species-filter`, closed 2026-11-15): (a) Marcos decides whether the species' sheet (T4, an experiment) stays, after trying it on a real phone; it goes by deleting `SpeciesSheet.jsx` and one line of `pages/Observatory.jsx` — `SpeciesSlot`, `SpeciesCardBody` and `SeasonStrip` are the map's own sheet again (the observed zone's sheet of 2026-11-19 was removed on 2026-11-25, so deleting the folder would now be possible); (b) compare the habitat colours with field notes of *deliciosus*, *cibarius* and *cornucopioides* and recalibrate if the map reads too green (`memory/decisions.md`, T3); (c) after the deploy: iOS Safari and Android Chrome (drags with a real finger, keyboard open), light theme, contrast of the new buttons and the favourites button; (d) a species filter inside the «Mis rincones» dialog, local to its list, as a possible follow-up; (e) the Top 10 and the zones of interest read `useActiveSpecies` when their epics start.

## 🔍 Under study — Weather history of previous years, to compare seasons (raised 2026-11-25)

**Not decided, not started.** Marcos wants a history of two years, or at least the previous one, to compare how the season is going against last year. Findings of the review (nothing was changed):

- **What is stored today.** `HISTORY_DAYS = 280` per cell, downloaded on demand at the first click in a cell (`cell_provider.py`; 180 of timeline + 100 of warm-up), plus 16 days of forecast. `climate_cell_history` keeps max/min/avg temperature, soil temperature, rain, humidity and wind. The daily refresh only re-fetches the last 10 days and the forecast: `loaded_from` never moves back. The 180-day limit seen in the UI is `MAX_DAYS` of `point_series.py` and `MAX_WINDOW` of `observatoryView.js`, not the depth of the database.
- **Feasibility.** Open-Meteo's archive goes back to 1940 and the connector already uses it for days older than 8. Going back is a small change (raise the depth for new cells) plus a backfill of the 423 loaded cells from before `loaded_from`; the upsert already keeps archive days over provisional ones.
- **Cost.** Quota: an archive request counts as days/14 calls, so about 26 weighted calls per cell and year (about 52 for two years) against the 10,000 a day shared by the whole system (see `gotchas.md`, Open-Meteo, and the 429 section below). Rows: about 365 small rows per cell and year. The backfill would go in batches that stop at the budget, as `cell_ingest.py` does, going backwards one year at a time: the previous year first, then the one before. Do not mix it with the daily refresh: the shared egress IP's quota is already spent by others in the morning.
- **Interface (Marcos's idea, preferred over a per-year timeline).** Keep the timeline as it is (window up to 180 days) and add one checkbox per previous year («2025», «2024»…) that overlays that year's curve on the same X axis, aligned by calendar date, as a **line only, with no fill down to zero**. The chart is own SVG (`WeatherChart.jsx`): a curve is one more `smoothPath`, and the fill (`smoothArea`) is already separate, so it is cheap. The series would be asked for the same window shifted 365 days.
- **Open points.** (1) Which series get the overlay: rain (accumulated) and temperature are direct; the previous year's **score** needs the scoring model run for that year (heavier, a second phase). (2) The forecast part of the window has no previous year: the overlay covers only the past days. (3) 29 February. (4) Phone: the timeline is not shown there, so the checkboxes need a place (a menu or a row under the chart). (5) Which cells to backfill: all 423, or only those with saved points or opened by someone.
- **Next step when it is taken up.** Marcos runs a `SELECT` on `cells` (count of loaded cells and their `loaded_from`) to size the backfill; then backend (depth + backfill script by batches), then front end (checkboxes and line-only curves for rain and temperature), then the score if it is worth it. A paid Open-Meteo plan (item 2 of the 429 section) would make the backfill much easier; related loose end: `compare_years` (inherited, see Loose ends).

## 🟡 Species photos — missing files and a duplicate (found 2026-11-26, `fix/species-photos`)

Found while fixing esp-035, which showed the photos of esp-002 (`migrations/049`). The rule that caught it: each species has **6 references to its own id** in `src/data/species.js` (main and two gallery photos, each as `url` and `largeUrl`). All 202 pass it after the fix; it does not tell whether the files exist or show the right species. An automatic check of the rule was offered and left out for now.

### Referenced files that do not exist (148 files, 26 species)

Compared with `public/assets/images/content/species/`. Not found elsewhere in the repo under those names (`.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`; `node_modules`, `.git`, `.venv` and `dist` excluded) nor ever committed under them in any local branch. Not searched: outside the repo, or under another name. Two of them tried in production answered the app's HTML page, not an image. **Open:** where the images come from (a copy elsewhere, a download with their licences checked, or generated).

**All six missing (main and gallery, two sizes): 22 species**

| ID | Species |
|---|---|
| esp-097 | *Clitocybe geotropa* |
| esp-100 | *Clitocybe dealbata* |
| esp-101 | *Lepista nuda* |
| esp-102 | *Lepista personata* |
| esp-115 | *Cortinarius splendens* |
| esp-116 | *Cortinarius praestans* |
| esp-118 | *Inocybe rimosa* |
| esp-119 | *Inocybe erubescens* |
| esp-124 | *Phlegmacium calochroum* |
| esp-125 | *Dermocybe sanguinea* |
| esp-135 | *Polyporus squamosus* |
| esp-136 | *Pycnoporus cinnabarinus* |
| esp-137 | *Daedalea quercina* |
| esp-145 | *Hygrocybe pratensis* |
| esp-146 | *Hygrocybe psittacina* |
| esp-153 | *Agrocybe aegerita* |
| esp-164 | *Macrolepiota rhacodes* |
| esp-165 | *Leucoagaricus leucothites* |
| esp-169 | *Psathyrella candolleana* |
| esp-175 | *Sarcodon scabrosus* |
| esp-178 | *Bankera fuligineoalba* |
| esp-182 | *Lycoperdon pyriforme* |

**Main photo present, gallery missing (two photos, two sizes): 4 species** (their `main` and `main-large` exist)

| ID | Species |
|---|---|
| esp-047 | *Cantharellus aurora* |
| esp-054 | *Pseudocraterellus undulatus* |
| esp-088 | *Tuber borchii* |
| esp-121 | *Hebeloma sinapizans* |

### The same image in two species

`esp-070-main` (*Pleurotus ostreatus*) is the same file as `esp-073-foto1` (*Pleurotus pulmonarius*), in both sizes. **Open:** which species it shows (check against a reliable source) and what replaces it in the other. Only exact copies were searched for; no photo was checked by eye against its species.

## 🟡 No header and fullscreen PWA — iPhone still to check (2026-11-25 and 26)

Everything else was tried on a real device (Marcos, 2026-11-26). Marcos has no iPhone: ask someone who has one.

- **iPhone** (the manifest's fullscreen is ignored): nothing under the clock; whether the white status icons read over the streets base map and in the light theme; «Mis rincones» and the other Observatory dialogs (not adjusted), the photo viewer's close button, the zone and article dialogs, the observed zone's header.

## 🟡 Home — «Mejor zona hoy»: a long name pushes the score to the card's edge (2026-11-26)

In `src/pages/Dashboard.jsx` the name's column has no `min-w-0`, so `truncate` cannot cut it. Probable fix: add it, a `gap-3` between the two columns and `shrink-0` on the score. Read from the code, not reproduced in the browser.

## 🟡 Password recovery — to check after the deploy (`feat/password-reset`, 2026-11-25)

Built and unit-tested (decision in `decisions.md`, same date). Marcos, after the deploy:

1. Alembic `022` applies on the back end's start-up; look for it in Render's log.
2. The email only reaches users once Resend has a verified domain (see «Email to users needs a domain of our own»); until then only the Resend account's own address gets it. Look for `Password reset email sent` or `Resend API error sending password reset` in Render's log. Try it with the Google-only account (it must end with both ways in working).
3. Follow-up, not done: refresh tokens already issued keep working after a reset until they expire (30 days). Closing them needs a `password_changed_at` column checked in `/auth/refresh` and `get_current_user`.

## 🟡 Chore from `main` — CI waits (raised in the retro of `epic/observatory-navigation`, 2026-11-12)

PRs wait for pipelines. In `.github/workflows/ci.yml`: (1) `push` runs on `feat/**`, `fix/**` and `chore/**` **and** `pull_request` runs on `epic/**` and `main`, so every PR is tested twice; (2) the unit and integration backend jobs run on front-end-only changes (this epic touched no backend). To do, with Marcos: drop the push trigger for `feat/**`, `fix/**` and `chore/**` (the PR covers them), and add `paths` filters (`backend/**`, `.github/workflows/ci.yml`) plus a front-end job (`npm ci && npm run build`, see the dev-environment chore). First check in GitHub whether the backend jobs are **required** checks of the `main` / `epic/*` rulesets: a path-filtered job that is skipped leaves a required check pending forever.

## 🟡 Loose ends (moved from the retired status documents, 2026-11-11)

Small items that only lived in the Spanish status documents of the Claude Project. Security housekeeping (tokens, terminal history) is Marcos's and is not written here.

- **`CHANGELOG.md`:** the epic summaries of v7.2.0, v7.3.0, v7.4.0 and v7.5.0 still sit under `[Unreleased]` («to be released as …») although the four are tagged and in `main`; turn each into its release section.
- **Minor code:** `bqp` / `bqr` possibly swapped; 3 ruff warnings; `scripts/gbif_forest_affinity.py` still uses the 5 old forest classes; `className` prop of `SpeciesPanel` unused; `data-wake-focus` handling in `NavPanel` unused since the species field left the Meteo panel (T1 of `epic/observatory-species-filter`); zones 030 and 202 without an altitude range.
- **Inherited:** review forest weights against the field notebook (carrasco); extend the pH and forest-weight audit; photos of corners branch 3; 11 species without fruiting conditions; `compare_years`.
- **«Mi ubicación» button** (built 2026-11-22, reworked 2026-11-25): **to check on a real phone and in Safari** — desktop 76 × 76 above Vista; phone 52 px, 32 px above the stack (the point's sheet and the species' bar overlap by 24 px; `locateBottom` in `pages/Observatory.jsx`), clear of the map's credits. It answers in development since the `alive` fix; a blocked location says so (8 s bubble), the browser's own question gets a 15 s wait. **Seen in Brave** (macOS, `localhost:5173`): the permission was granted and the position never arrived (timeout), while production worked; Brave turns off Google's location service by default (`brave://settings/privacy`), the probable cause — not confirmed, no Brave-specific hint was added. On iOS a refusal is not asked again until the site's setting changes.
- **The observed zone's filters, the map's cards and the light theme** (`ccr-11b63324-2lx2eg`, 2026-11-25; the CHANGELOG lists all of it): **to check on a real phone after the deploy** — the zone's species pill in the fixed bar, the list as a card after the thermometer, the sticky species card (desktop, screens ≥ 48 rem tall), the folded rows, the data table in a bottom sheet, the cards' bare crosses and their alignment, the pale green sheet and the cream map surfaces in the light theme, the double search with one shadow. **Small things seen, not done:** (1) `handleObserve` only carries the Meteo day to the zone while Condiciones is on (`probabilityOn`), not for the other Meteo layers; (2) the browser keeps every GET for an hour (`Cache-Control: public, max-age=3600`), so a field new to an endpoint (`trend`) does not show until it expires; a hard reload clears it; (3) `TREND_STEP` (8 points) and the pale green's 20 % are by eye; (4) the old `ZoneModal` still uses the `termometro` key, now plural; (5) the species' folded bar and the point's title can wrap to three lines with long names on a phone; (6) the zone's old `buildRows` still computes `window` and `conditions` that no card shows; (7) `obs-btn` in the light theme now uses the ink for the four buttons that have it (Timeline, ObservatoryNotice, the chart's table button, the page's); (8) the corner's card without photos has no drop target for a dragged file (add in «Editar»); (9) the branch is not a `feat/*` one: rename it before the squash/PR.
- **Integrated branches that can be deleted:** those of `epic/observatory`, `feat/map-fullscreen-observe`, `docs/observatory-map-close`. `epic/observatory` and `epic/observatory-map` by hand once everything is deployed (the `epic/*` ruleset blocks it; switch it off for a moment).
- **External answers:** CREAF (needed before monetising) and ICGC (geocoder limits, licence of `ombres_tfosc`).
- **Colour tokens: the generator is stale** (found 2026-11-11, T1 of `epic/observatory-navigation`). `scripts/generate-css-vars.ts` (`npm run gen:css-vars`) still writes into `src/styles.css`, which no longer has its markers (it would append blocks there), and the «generated» blocks of `src/styles/tokens.css` have been edited by hand (the light block has 76 variables; the script writes 21). In practice `src/styles/tokens.css` is the web's source of truth and `shared/colors.ts` only feeds the mobile app. **Do not run the script** until it is fixed. Fix (fits the shared-package epic): point it at `tokens.css`, generate every variable that block holds (RGB channels and `--ui-*` included) from `shared/colors.ts`, and move there the tokens added by hand (`--map-surface`, `--nav-active`, `--switch-*`, `--shadow-float`, `--shadow-bottom`, light `--color-bar`).

## 🔴 Open-Meteo 429 in production (found 2026-11-11, fixed in #167)

The fix (no retry on a quota 429, process-wide pause, failures remembered per point, 503 with `Retry-After` instead of 500) is in code; see `decisions.md` (2026-11-11). Render's logs show the cause: the daily limit of Render's shared egress IP is spent by others by ~05:45 UTC every day, while our own spend is ~1,000 calls. Effects: `cell_refresh` has done nothing since at least 2026-11-08 (the map layer loses its forecast), weather is stale from 06:30 to 00:30, and the 2026-11-09 ingest stored nothing (on the 10th a restart at 05:04 cut it). Decide, Marcos:

1. ✅ Deployed 2026-11-11 (#167): the ingest runs at 00:05 UTC and `cell_refresh` at 00:40 UTC; Render has no `INGEST_CRON_HOUR` nor `WEATHER_MAX_AGE_HOURS` variable, and the start-up log confirms the schedule. Still to check, the first night's logs: `Scheduler started — daily ingest at 00:05 UTC, cell refresh at 00:40 UTC`, `Ingest complete` with no errors and `Cell refresh finished: … refreshed=423 … stopped=no` (or `stopped=budget`, not `rate-limit`).
1b. ✅ Deployed 2026-11-11 (#167): the zone weather refresh runs once a day (00:30 UTC) and rows last 26 h. Still to check: `Weather refresh finished` once that night, with `'stored': 190`.
1c. 🟡 Next, with or after `epic/observatory-navigation` (front-end routing, not this branch): the Observatory becomes the home page and the dashboard goes; then switch off the zone ingest (`run_daily_ingest`, ~380 calls), the zone weather job (~200) and the stale-zone / outdated-weather alerts, and decide what to do with `scores_cache`, `climate_history`, `weather_cache` and the `/zones` endpoints. Later, maybe a new dashboard with links to the sections.
2. Still open: a paid Open-Meteo plan with an API key (Professional, for the historical API), the clean fix and also needed for any commercial use; the weather refreshes from ~06:30 UTC keep failing until then. New branch: setting for the key, `customer-` hosts plus `apikey`.
3. The tracebacks at 00:25 UTC on 2026-11-11 (`concurrent/futures/_base.py`) are not Open-Meteo's "concurrent requests" 429; they are probably the point endpoints' 500s that this fix removes. Look at the line above each traceback if they come back.
4. A local backend runs the same scheduler and the start-up weather refresh from Marcos's IP: start it with no jobs, or count it in the quota.
5. **Still happening, seen again 2026-11-17** (after v7.5.0): opening a point whose cell is not stored answers 503 «The weather provider is over its request limit» (`point/species`, `series`, `snapshot`, `calendar`); stored points work. Render's logs show «Daily API request limit exceeded» on 15, 16 and 17 November, each pause ending at 23:59:59 UTC, and the first rejection of each day comes with the first new-cell request (10:58, 10:17, 14:08 UTC). Our own spend that night was small: ingest 190 zones with no errors (00:05), weather refresh `budget_used_today: 203.6` (00:30). **`cell_refresh` did not run that night**: the service restarted at 00:45 UTC («Scheduler started» at 00:45:42) after its 00:40 slot, and a missed run is not recovered until the next day. So the cause is still the shared egress IP spent by others, not our crons; the only clean exit is item 2. Also look at Render → Events for the 00:45 restart (memory? the rasters are loaded at start-up). Until then, new points in a cell that is not stored fail in the afternoon; a user can only open cells already stored.
6. 🟡 **Done in code on `fix/open-meteo-local-cell-resolve` (2026-11-20), to verify after the deploy** (decision in `decisions.md`, same date): (A) a point is resolved against the stored cells (footprint from `build_grid`) before asking Open-Meteo, so a point inside any of the 444 stored cells answers with no network and no 503; (B) at start-up `cell_refresh` runs in the background if its slot passed and some cell was not refreshed today. Production on 2026-11-20 (`ingest_cells status`): 444 cells stored, 423 touching Catalonia, 423 loaded, 0 holes. **The forecast is stale:** downloaded on the 18th for 214 cells, on the 19th for 209, and nothing on the 20th, so `cell_refresh` has been covering only half the map (its budget or a rate limit stops it; read `Cell refresh finished: … stopped=` in Render's logs for the 18th–20th). To check, Marcos: after the deploy, `Cell refresh not due …` or `Start-up cell refresh finished: …` in the start-up log; opening a point in a stored cell during the afternoon (when the quota is gone) answers 200; the status query again the next morning shows 423 cells downloaded that day. If the budget is what stops the run (`stopped=budget`, `observatory_cell_refresh_budget` 1500 against ~423 × 3 = ~1,270 estimated), raise it or lower `REFRESH_COST`; not done here.
7. Read 2026-11-26 in production's `/api/v1/health`: `last_ingest` 00:08 UTC, no stale zones, `weather_outdated: 0`. It says nothing about `cell_refresh`.
8. Read 2026-11-26 with a `SELECT` on `climate_cell_history` (run by Marcos), 2026-11-05 to 2026-12-03: every date has 423 cells. Up to 11-18 the rows are `archive`, except 71 cells on 11-07 still `forecast` (last download of that group: 11-14; probably left out of the refresh window before the archive value arrived, not proven). From 11-19 on they are `forecast`, the newest download of each date being 11-26 00:46 UTC, so the cell refresh ran that night. The query takes the newest download per date: it does not show that every cell was downloaded that night.

## 🔴 Email to users needs a domain of our own (found 2026-11-11)

Resend has no verified domain, so `EMAIL_FROM` is `onboarding@resend.dev`, which only delivers to the Resend account's own email: the ops alerts work, the sign-up verification email to any other user does not (see `gotchas.md`). To do, Marcos:

1. Buy a domain (~10–15 €/year), add it in Resend → Domains and put the DNS records it gives (SPF, DKIM) at the registrar; when it says «Verified», set `EMAIL_FROM=Fungus <no-reply@<domain>>` in Render. No code change. The same domain can serve the app on Vercel (then add it to `CORS_ORIGINS`).
2. Check Render's logs for `Resend API error` to know whether sign-ups since ~2026-11-04 were left without their verification email.
3. Small `fix/*`: `send_ops_alert` should log Resend's status and body, as the verification email already does (today it logs only `403 Forbidden`).

Discarded: sending from Gmail over SMTP with an app password (code change, personal address as sender, ~500/day, more likely to land in spam).

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

## 🟡 Observatory (web) — open items of phase 1 (`epic/observatory`, closed 2026-11-05)

Summary of 2026-11-26; what was built is in `CHANGELOG.md` and `decisions.md`. Product contract in `memory/observatory-prd.md`, plan in `memory/observatory-plan.md`.

### Checks not confirmed anywhere

- **Zone elevation (#125):** review the full dry run and `scripts.zone_elevation_ranges --apply`; re-run the `~` zones when Overpass is free; fix stored `elevation_m` flagged `?` (e.g. zone-004 Pinar de Lleida, 1,450 m vs 690 m of terrain).
- **Forecast (#128):** `forecast_rows` ≈ 16 × active zones on a daily run.
- **User limit (#132):** `select id, created_by from cells order by created_at desc limit 3;` after a click in a new area.
- **Saved points (#133):** save one and check `select id, user_id, land_cover_code, toponym_name, forest_types from saved_points order by created_at desc limit 3;` (the SQL store has no unit test).
- **Corners and photos:** HEIC with real GPS, account deletion and the 429 limits against a real database; phone layout of the corners list and dialog (filter panel with the keyboard), the profile card, the data modal, the photos and the photo viewer (unreadable in the light theme).
- **Phone, languages and themes (step 10):** «Observar» cut on 667 px phones; the saved-point form is cramped; ES/CA/EN and light/dark on what was new; optional hillshade layer; street base map on the dark theme.
- **«Tipo de bosque» layer:** the 11 colours on satellite, streets and relief and in the light theme.

### Open work

- **Composition:** wiring planned as `feat/observatory-composition` (tiles in the private bucket, bounded in-memory cache, `composition` in `/point/forest`, union of the types above the threshold in `/point/species`, not stored with saved points, threshold and 422 limits of the radius). Check what is already built before starting; design in «Observatory: free points and cells» below.
- **Corners:** a `/point/snapshot` that accepts several species; staged upload in the create dialog (to decide); filters as a back-end endpoint if a user has many corners.
- **Forest weights:** audit pH and weights for the rest of the catalogue (*reticulatus* and *caesarea* have `castanar` 0.9 with a pH range that leaves acid soil at 0.46); review the weights with field notes (`cuaderno-de-campo`), above all the Aleppo-pine ones; soil class from bedrock vs topsoil pH (see `decisions.md`); stand age and density are not in MCSC-4; `bqp`/`bqr` probably swapped in the legend notes.
- **Browser cache:** answers under `/observatory/` without their own header go out as `public, max-age=3600`; the idea is `private, max-age=60` (see `gotchas.md`).
- **Conditions layer:** clip to Catalonia (`catalonia_outline.py`), municipality radius for place search, review the catalogue's pH ranges, GBIF audit to weight species by frequency, judge the initial values (0.75/0.85/10 %, pH tolerance 0.3) against field cases; a notice for cells without forecast, once the daily refresh is seen at work; measure the real Open-Meteo cost per cell. Place names cannot be separated from the ICGC hybrid satellite tile.
- **Licences:** MCSC-4 (enquiry sent to CREAF on 2026-11-03; the answer is required before monetising), relief WMTS, ICGC geocoder, DEM. Open-Meteo's free API is non-commercial.
- **Map layers (item 7, detail in `memory/product-ideas.md`, section 6),** one branch each, with its timeline:
  - 7c rain, 7d temperature and 7e wind: see `memory/observatory-meteo-prd.md`.
  - 7f Top 10, last: it lives in the «Zonas» tab, inert until built; it replaces «Ranking de zonas». Open: cells or zones, visible area or all of Catalonia, general or per species.

### Local scoring at 0 in every zone (found 2026-10-18, outside the Observatory)

Possible causes: local ingest stopped, a real dry spell, or a local database without migrations 039–041. To tell them apart: `select max(date), count(distinct zone_id) from climate_history;` and `select max(computed_at) from scores_cache;`. It limits testing the layers locally.

### Zone data quality

- After the run of 2026-10-11 on the 40 Catalan zones of migration 041: check the bands (zone-235 Serrat de la Bandera ~500–900 m), the zones with `~`, then the scores.
- Points marked `-- approx` in 041 and forest types of the new zones are unverified (`zone_relocate.py`).
- The original Catalan zones not in the book (028, 031, 032, 036, 037, 038, 047, 048, 202, 203, 206, 210–213), then the rest of Spain; re-run the 105 zones computed without forest mask; update coordinates, backfill moved zones, scores.
- Backfill: verify Oct 2025 – Sep 2026; Oct 2024 – Sep 2025 on another day (Open-Meteo daily limit).
- Ops: check that `ALERT_EMAIL` and `STALE_ZONE_DAYS=3` apply in Render.

---

## 🟡 Scoring v2 — calibration (2026-10-08; built and in use)

Spec: Observatory design document, section "Scoring v2: especificación para implementar".

- [ ] Calibrate with a field-trip log (zone, date, what was found) and revisit the thermometer cut-offs (55/70/85): with v2 an ordinary day scores 30–40. Validate with the autumns of 2024 and 2025.
- [ ] Catalogue: add the soil-temperature optimum per species (today only air ranges exist) and clarify what `cycle_days` measures (7–14 days, far below the ~21 days of real fruiting).
- [ ] Remove the scoring copy in the app (see `chore/v8-1-shared-scoring`) so only one formula is maintained.

Also open, not blocking: from which day the curve counts; altitude caps of the Pyrenees species sheets and a range for the other zones; trip phase label; report hash; years of history.

**Micro-sites (v2.2 candidate, after calibration):** a zone is not uniform (moisture, sun, temperature and wind drying vary with orientation and cover), so a short rain on dry soil can give small, local flushes where shaded spots kept moisture; today it adds 0 because the zone is two average buckets with an on/off threshold. Proposal without adding factors: ~5 micro-sites from sunny/ventilated to shaded/sheltered, each drying at its own rate (the two current buckets become the ends); rain counts in each while it stays moist; the score comes from the share of active ones, the most closed weighing less because fruiting also needs light; message «possible local flushes in shaded spots» when only those are active. Design it with this season's field-trip log, not by eye.

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

### Possible placeholder images, to check by eye

esp-066 *A. gemmata* (was a copy of esp-056 *A. muscaria*) and the main photo of esp-019 *N. luridiformis* (was a copy of esp-014 *N. erythropus*). On 2026-11-26 the files are no longer byte-identical; nobody has looked at what they show.

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
