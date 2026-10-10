# PRD — Observatory, phase 1 (`epic/observatory`)

> Product Requirements Document. Written before the first feature branch.
> Once all Open questions are resolved and DoD is written, development can start.
> Last updated: 2026-10-10

Sources: Observatory design document (Claude Docs, source of truth), Observatory prototype (design canvas, function `v2Series` is the reference implementation), hand-off `observatorio-paso-a-desarrollo` in the Fungus project. Technical plan and scenarios: `memory/observatory-plan.md`.

---

## Problem / Why

The zone card gives one quick verdict that is the same for everyone, and today that verdict is wrong in the middle of the season: v1 rewards rain on the day it falls and adds a fixed seasonal bonus, so on 6 Oct 2026 it gives 75 to La Molina and 76 to Setcases while both have been very poor in the field for a month (v2.1: 7 and 16).

A forager also has no way to study a zone over time: what rain fell and when, whether it is cold or warm, which mushrooms could be fruiting and when the next good window is. The Observatory is a new page that answers those questions for one zone at a time, with a corrected score (v2) that counts rain when it actually starts producing mushrooms.

Why now: we are in the middle of the autumn season. Everything else (Android app, SEO) is paused for this.

---

## Scope

### In — must ship

| Feature | Notes |
|---|---|
| Scoring v2 (Outbreak Index v2.1) in the backend | Pure functions, same numbers as the prototype (±1). Generic model and per species |
| v2 for any date and any window | Time machine: the page can look at any past date with data |
| Observatory page, zone area | Zone search, zone title with Follow and Notifications actions, «¿Qué seta buscas?», thermometer with "Ver por qué", weather chart (Momento, Lluvia, Temperatura, Humedad, Viento) with timeline window 7–180 days and data table, mushrooms fruiting, triggers and brakes, calendar «¿Cuándo me conviene ir?» (estimate without forecast) |
| View state in the URL | Shareable, back button works, deep links |
| Multi-day forecast | 16 days stored per zone, used by Momento and the calendar, «Previsión en la zona» widget. See OQ-3 |
| Access to the Observatory | Navigation entry and links from the zone card. See OQ-13 |
| v2 as the main score everywhere | `score_oi` becomes v2 (zone list and card, dashboard, map, filters); v1 stays in `score_detail.v1` as reference. Decided 2026-10-10 (OQ-2) |
| Five-band scale | Malo 0–30, Regular 30–55, Bueno 55–70, Muy bueno 70–85, Excelente 85–100, with a new `--mid` token in the design system |
| Zone altitude as a range | `elevation_min_m` / `elevation_max_m` on `zones`; species compatibility by overlap with a 150 m margin («al límite») |

### Out — explicitly excluded

| Feature | Reason / deferred to |
|---|---|
| Territory area: rain heat map, zone ranking, species in the territory | Phase 2 / 3 of the design document |
| User-created points (own zones), forest map | Phase 2 |
| Downloadable report (HTML/PDF) | Phase 2 |
| Notifications (push, email) | Phase 3. The bell only toggles a stored preference if it already exists; otherwise it is hidden (see OQ-4) |
| Observatory in the Android app | App paused |
| Freemium inside the Observatory | Future (monetisation): free users open the Observatory and some widgets show a locked placeholder, instead of a ghost chart in the zone card. Phase 1 builds no gating. See OQ-4 |
| Calibration work (soil-temperature optimum per species, `cycle_days`, curve start, Pyrenees altitude caps) | Non-blocking, tracked in `memory/pending.md` |

---

## User flows

**Flow 1 — Is it a good moment to go to my zone?**
1. User opens the Observatory. It shows the last zone they observed (never an empty page); the first time, their first followed zone or a default zone.
2. User sees the thermometer: a big score, its band and one sentence saying why ("Momento flojo: las lluvias de hace dos a cinco semanas no bastan para que salgan"), plus three key facts (zone state, water in the soil, soil temperature).
3. User taps "Ver por qué" and sees each factor with its value and the formula, and the v1 score as reference.
4. User sees "lluvias en camino": a recent rain that does not count yet and when it would start to show.

**Flow 2 — I am looking for one mushroom**
1. In «¿Qué seta buscas?» the user picks a species from the list of excellent species of the zone (sorted by today's v2 for that species).
2. The thermometer, Momento, the temperature threshold, the calendar and the timeline background switch to that species, each with a label that leads back to the selector.
3. The ✕ returns to «Cualquier seta».

**Flow 3 — What happened in this zone?**
1. User switches the chart between Momento, Lluvia, Temperatura, Humedad and Viento, and toggles layers.
2. User drags or stretches the timeline window (7–180 days). The thermometer and the mushroom list recalculate at the window's end date.
3. User reads triggers and brakes for the window, with the same numbers as the circles on the chart.

**Flow 4 — Share or come back to a view**
1. User copies the URL and opens it on another device: same zone, end date, window, tab, layers, species and filters.
2. The browser back button returns to the previous view state.

---

## Open questions

All must be answered before the first commit of `feat/observatory-scoring-v2`. Each has a proposed answer to accept or change.

| # | Question | Owner | Proposed answer | Answer |
|---|---|---|---|---|
| 1 | **Where does the v2 history live?** `scores_cache` has one row per zone (PK `zone_id`, only today), so "backfill v2 from 2024-10-01 into `score_detail.v2`" is not possible as written. | Marcos | Compute v2 on the fly from `climate_history` for series, dates and species (pure function, ~190 rows per zone, cached per zone + last data date + species). `scores_cache.score_detail.v2` keeps only today's v2 for the zone card/ranking later. The "backfill" branch becomes a script that writes a v1/v2 comparison CSV for calibration. A daily table (`zone_scores_daily` / `zone_species_scores`) stays for when we need it (ranking over time, notifications) | ✅ Accepted (2026-10-10) |
| 2 | The design document contradicts itself: "v2 is the default everywhere (search, ranking, zone card, web map)" vs "the zone card stays on v1 until calibrated". | Marcos | Phase 1: v2 only in the Observatory, v1 as reference. `score_oi` stays v1 until calibration | ✅ v2 everywhere, zones and dashboard included: v1 is not realistic, v2 is better even before calibration. `score_oi` = v2, v1 kept in `score_detail.v1` (2026-10-10) |
| 3 | Does `feat/observatory-forecast` stay in this epic? The design document puts it in phase 3. The paid plan is not about the forecast: Open-Meteo's free tier excludes any app with subscriptions or ads, so the day premium launches *every* call (daily ingest, archive backfill, forecast) needs a paid plan. Today Fungus has no subscriptions, so the free tier covers it, and the daily ingest already calls the forecast endpoint: asking for 16 days instead of 1 costs no extra calls. | Marcos | Keep it in the epic as the last branch, cuttable if time runs short | ✅ In the epic, no paid plan while Fungus has no subscriptions. Goes right after the ingest branch (2026-10-10) |
| 4 | Who can open the Observatory in phase 1? The design document makes it the premium entry point, but there is no `is_premium()` and no payments yet. | Marcos | Open to everyone (anonymous users included) in phase 1; Follow and Notifications ask to log in. Premium gating comes with monetisation | ✅ Open to everyone in phase 1. Future direction: freemium inside the Observatory with locked widgets, not a banner in the zone card (2026-10-10) |
| 5 | Data window: v2 needs history before the scored day (35 days of activation + 21 to know if the zone was warm + ~45 for the soil water balance to settle), and the design document says to read 100 days. The test cases were computed with the water balance started on 1 April (~190 days). The buckets start at 30 % on the window's first day, so H may differ. | Claude, in branch 1 | Measure the difference with real data in branch 1. If any test case moves by more than 1, use a longer window (190 days, the same Momento needs) | ✅ Measured in branch 1: with 100 days the score equals the 1 April warm-up on every day from 1 Aug to 6 Oct 2026 in the four reference zones. The ingest reads 100 days (2026-10-10) |
| 6 | Zone altitude ranges: who fills `elevation_min_m` / `elevation_max_m`, and for which zones? | Marcos | Migration with nullable columns; when null, range = `elevation_m`. Fill Setcases (1.300–1.900), La Molina and Costabona now; the rest is calibration | ✅ Accepted as proposed (2026-10-10) |
| 7 | «Al límite» penalty (× 0,85): the design document applies it to the species score, the prototype only shows the label. | Marcos | Apply it to the species v2 score | ✅ Accepted as proposed (2026-10-10) |
| 8 | Which species appear in each widget? Prototype: «¿Qué seta buscas?» lists only edibility `excelente` species compatible with the zone; «Setas en fructificación» shows 4 featured species. | Marcos | «¿Qué seta buscas?»: `excelente` species compatible with forest type, altitude (with margin) and month, as in the prototype. «Setas en fructificación»: every compatible species, followed ones on top, filters edible / not edible / followed | ✅ Accepted as proposed (2026-10-10) |
| 9 | Triggers and brakes: the prototype labels the detection rules "de ejemplo". Do they ship as they are, and where is the logic? | Marcos | Backend, same rules as the prototype (rain runs ≥ 10 mm/day totalling ≥ 20 mm; ≥ 3 days with humidity < 55 %; frost), marked as experimental in the UI | ✅ Accepted as proposed (2026-10-10) |
| 10 | Languages: the thermometer sentence and the factor explanations are text. The web already has ES/CA/EN (`src/data/i18n.js`). | Marcos | Backend returns codes and values (`limiting_factor: "activation"`, numbers); the front builds the sentences with `i18n.js`, in the three languages from day one | ✅ Accepted as proposed (2026-10-10) |
| 11 | The URL example has no parameter for the chosen species. | Claude | Add `seta=<species_id>`; absent = «Cualquier seta». `setas=` stays the filter of the mushroom list | ✅ Accepted as proposed (2026-10-10) |
| 13 | **How is the Observatory reached?** A new top-level section makes six items in the header (Inicio, Zonas, Catálogo, Micología, Perfil + Observatorio). From `md` (768 px) the nav is horizontal with icon + label, and six items do not fit next to the logo until ~1.050 px (worse in CA/EN). Below `md` there is a hamburger menu, so mobile is not the problem. | Marcos | New section, and Perfil leaves the row and becomes an avatar button on the right (dropdown: Perfil, Admin, Salir). The row stays at five items: Inicio, Zonas, Observatorio, Catálogo, Micología. Between `md` and `lg`, icons only with `aria-label` and tooltip as a safety net. Extra entry points: a «Ver en el Observatorio» button in the zone card (opens `?zona=<id>`) and the zone's row in the followed zones list | ✅ Accepted (2026-10-10). The avatar menu also replaces the Público/Admin toggle in Perfil: admins reach the image generator from the menu, `isAdminView` and the admin header disappear |
| 12 | "Superponer años" and "mismo periodo del año anterior" need data from previous years, which only exist from Oct 2024 for the 41 Catalan zones. | Marcos | In scope; the layer is disabled with a short note when the zone has no data for that range | ✅ Accepted as proposed (2026-10-10) |

Non-blocking (calibration, keep prototype values for now): grade thresholds of the mushroom list (Probable ≥ 70, Posible ≥ 55, Temprano ≥ 25) and the thermometer cut-offs, which with v2 put most ordinary days in "Regular".

---

## Definition of Done

- [ ] `scoring_v2` reproduces the design document's test cases (±1): Montseny 49, La Molina 7, Setcases 16, Costabona 20 on 2026-10-06, plus the factor values, rains on the way, frost case and season-by-altitude cases.
- [ ] The API returns, for any zone and any date with data: daily series (climate + v1 + v2 with factors), the thermometer snapshot, favourable species and the calendar estimate, generic or per species, in under 500 ms p95 for a 180-day window.
- [ ] The Observatory page implements Flows 1–4 on desktop and at phone width, following the prototype.
- [ ] Every view-state parameter round-trips through the URL; invalid parameters fall back to defaults without breaking the page.
- [ ] The daily ingest stores a 16-day forecast per zone without extra Open-Meteo calls; Momento and the calendar use it, with the no-forecast estimate as fallback.
- [ ] Five-band scale and `--mid` token in the design system, used by the Observatory.
- [ ] `zones.elevation_min_m` / `elevation_max_m` migrated and filled for at least Setcases, La Molina and Costabona.
- [ ] `score_oi` is v2 in the zone list and card, dashboard and map, with five-band labels; v1 is still available in `score_detail.v1`.
- [ ] Every scenario in `memory/observatory-plan.md` has a test (backend: pytest; front: as agreed per branch) or a manual QA check ticked.
- [ ] CHANGELOG, `memory/pending.md` and `system/project.spec.md` updated; retrospective done before merging into `main`.
