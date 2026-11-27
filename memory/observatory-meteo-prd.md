# PRD — Meteo layers: rain, temperature and wind (`epic/observatory-meteo`)

> Product Requirements Document. Written before the first feature branch.
> Last updated: 2026-11-27 (look of the rain layer after QA; day selector chosen)
>
> Status: **one epic for the three layers (Marcos, 2026-11-26). Rain is specified here; temperature and wind are placeholders, to be extended in this same file when each one is taken up.** All the rain questions are answered (2026-11-27); the plan is in [`observatory-meteo-plan.md`](observatory-meteo-plan.md).
> Builds on [`observatory-navigation-prd.md`](observatory-navigation-prd.md) (the Meteo tab; its Q2, Q3, Q6 and Q8 apply here).

---

## Problem / Why

The Meteo tab only has Condiciones. Lluvia, Temp. and Viento show «Pronto». Condiciones says how favourable a place is, but not how much it has rained, how warm it has been or how windy: the map cannot answer those.

---

## Phasing

| Cut | Content | State |
|---|---|---|
| **1** | Rain | Specified below |
| **2** | Temperature | To be specified |
| **3** | Wind | To be specified |

**Decided (Marcos, 2026-11-26):** each layer is merged into `main` when it is ready, keeping one epic and one PRD. It departs from the cadence rule of `system/workflows.spec.md`, which closes an epic at a coherent delivery and moves the rest to a follow-up epic with its own PRD. To settle before the first merge into `main`: the version tag and the retrospective of each of these merges.

---

## Common to the three layers

- One data layer at a time in Meteo; all of them share the day slider (−30 d … +7 d, forecast stretch marked) and the loading bar and error notice of the map.
- No species field outside Condiciones. Each layer has its own legend with a fixed scale, never fitted to the data on screen.
- A layer is turned on by setting `ready: true` in `src/lib/meteoLayers.js`; only then can the URL name it (`capa`).
- Data comes from what is already stored per cell (`climate_cell_history`): reading a layer makes no Open-Meteo calls. Login required, as for the other layers.
- For today and later days, only a forecast that is fresh enough counts (the rule of the conditions layer).
- **Point card:** same card; only the headline figure changes with the active layer. Name, comarca, altitude, forest, habitat, «Mi rincón» and the buttons stay. One figure at a time, never two layers together. With Meteo off, or while it is hidden by Hábitat's species view, the card shows the conditions percentage as today.

---

## Cut 1 — Rain

### Scope — In

| Feature | Notes |
|---|---|
| Rain endpoint | Accumulated rain per stored cell over a window that **ends on the day of the slider**: 24 h (1 day), 7 d or 21 d. No migration. |
| Map layer | The accumulated rain of every cell, in the draw order of Meteo, smoothed between cells with a continuous gradient (R1), clipped to Catalonia's boundary, coast included. Transparent up to 1 mm. |
| Panel and legend | The panel already built for development: presets 24 h · 7 d (default) · 21 d, the window's dates, the shared slider. One fixed scale per preset, in mm (= l/m²), with the six marks and colours of R2, evenly spaced. 21 d keeps the 60–120 mm «good» band of the observed zone's rain chart, marked on the legend with a green line under the numbers, «favorable para setas» (2026-11-27). |
| Forecast flag | When the slider's day is today or later, the window includes forecast days: hatched stretch of the slider and the tag «incluye previsión», in the panel and in the point card. A past window is tagged too when one of its days is still as it was forecast: downloaded on that day or up to 2 days before (2026-11-27). Past days whose stored value comes from the forecast API but was downloaded after the day ended are not flagged. |
| Point card | Headline: the accumulated mm of the active window, with its dates and length (e.g. «48 mm · 20–26 nov · 7 días», invented figures). It follows the slider and the preset while the card is open. The figure is «≈ N mm», the value interpolated between cells that matches the colour at the point, so two points of one cell can differ. The source is one value per cell, with no correction for altitude, forest or soil. |
| Missing data | A cell with a day of the window missing never shows its partial sum as the total. If enough neighbouring cells have the whole window, its value is estimated by weighting theirs, and the card says it is estimated; otherwise the cell shows as without data, on the map and in the card. The threshold and the weighting are in the plan. |
| «Observar» with Lluvia on | The zone opens on the slider's day, or on the last day with real data when the day is in the forecast, as with Condiciones. |
| URL | `capa=lluvia`, the shared `dia`, and `acum` for the preset. |
| i18n and themes | ES / CA / EN; light and dark. |

### Scope — Out

| Excluded | Reason / deferred to |
|---|---|
| A window of free length (two handles) | Possible later improvement (navigation PRD, Q2) |
| Correcting rain by altitude or terrain | The data is one value per cell |
| New ingest, deeper history, previous years | See «Weather history of previous years» in `memory/pending.md` |
| Fixing the Open-Meteo quota (paid plan) | Its own task (429 block of `memory/pending.md`) |

### User flows

**Flow 1 — How much did it rain?** In Meteo the user picks Lluvia: the species field goes, the slider stays, the map shows the last 7 days ending on that day. They tap «21 d»: dates, legend and map change.

**Flow 2 — How is it moving?** The user drags the slider and the map follows. Past today, the «incluye previsión» tag appears.

**Flow 3 — How much here?** The user taps the map: the card shows the mm of the active window for that point. With the card open they change the preset and the figure follows. «Observar» opens the zone on that day.

---

## Day selector (shared by Condiciones and Lluvia) — chosen, to be specified

**Decided (Marcos, 2026-11-27):** the next piece of work, before the point card. One bar replaces the slider and the static strip under it (past, today and forecast in the same bar), reaching back about six months instead of 30 days, with the months marked and a bar per week: in Lluvia the rain of all Catalonia; in Condiciones a rating of all Catalonia, in the five score-band colours from green to red. Measurements and discarded options: `memory/decisions.md`. This replaces the «−30 d … +7 d» of «Common to the three layers».

**To settle before its first line of code:**

| # | Question |
|---|---|
| S1 | With a species chosen, do Condiciones' bars follow it or stay on the mean of the excellent ones? (One species alone was not measured.) |
| S2 | Colour of the rain bars: the rain scale or a single blue |
| S3 | How the forecast weeks look, and what a week is (calendar week or seven days back from today) |
| S4 | Where Condiciones' series is computed and kept: after the daily refresh in a table (migration), or in memory |
| S5 | How a day is picked with a finger over ~6 months (about 1.6 px per day), and what Temperatura and Viento show |
| S6 | What the weekly rating means, and how the help says it: in the measurement, each cell's mean altitude, no forest or soil filter, so it is no point of the map |

**Before building:** a production `SELECT` (run by Marcos) on how far back each cell's history goes; response times of both layers on old dates; the link's `dia` limit (`MAX_DAYS_BACK`) moves with the bar. Deployment readiness below must be updated if S4 brings a migration.

---

## Cut 2 — Temperature (to be specified)

Already there: daily max, min and average per cell, and a development panel with a placeholder scale (−5 to 35 °C). Open when taken up: which value is shown (max, average or min), whether it is corrected by altitude with the relief, the scale, the window if any, and the point card's figure.

## Cut 3 — Wind (to be specified)

Already there: a daily wind speed per cell and a development panel with a placeholder scale (0 to 60 km/h). No wind direction was seen in the cell model, so no arrows unless that changes. Open when taken up: what the daily figure measures, the scale, the window if any, and the point card's figure.

---

## Open questions

All the rain ones must be answered before the first feature branch. Those of cuts 2 and 3 are written and answered before the first branch of each cut.

| # | Question | Owner | Answer |
|---|---|---|---|
| 1 | One PRD and one epic, or one per layer? | Marcos | ✅ One PRD and one epic for rain, temperature and wind; rain first (2026-11-26). |
| 2 | What does the point card show with Lluvia on? | Marcos | ✅ The same card, with the accumulated mm of the active window as headline (2026-11-26). |
| 3 | Rain and conditions at once in the card? | Marcos | ✅ No, only the active layer's figure (2026-11-26). |
| 4 | Days missing in the window? | Marcos | ✅ No partial sum as total (2026-11-26). A cell with missing days and neighbours with data is estimated from them (2026-11-27, replaces «say so» for that case). |
| 5 | «Observar» with Lluvia on? | Marcos | ✅ Opens on the slider's day, as with Condiciones (2026-11-26). |
| 6 | When does each layer reach `main`? | Marcos | ✅ Layer by layer, in the same epic (2026-11-26). |
| R1 | **Look on the map:** squares per cell, smoothed or other variants. It also settles whether the card shows the cell's value or the interpolated one that matches the colour. | Marcos | ✅ Smoothed with a continuous gradient, and the interpolated figure («≈ N mm») in the card: rain has no steps at cell borders, and it matches the conditions map (2026-11-27). |
| R2 | **Colour scales of the three presets.** | Marcos | ✅ Marks evenly spaced on the legend. 24 h: 1 · 5 · 10 · 20 · 40 · 60+; 7 d: 1 · 10 · 20 · 40 · 60 · 100+; 21 d: 1 · 20 · 40 · 60 · 120 · 180+. Colours, changed in QA the same day: transparent → light blue (60 %) → blue → violet → garnet → dark garnet (the first version started in white) (2026-11-27). |

### Data behind R2

Read-only query on production, run by Marcos on 2026-11-27: accumulated rain per cell and end day, complete windows, `archive` days only, windows ending up to 2026-11-18. The history starts between late January and mid-February 2026 (by window length), so December and most of January are missing and there is one unfinished autumn: these are initial scales, not a normal year. No window had a day without temperatures.

| Window | Scope | Windows | Under 1 mm | p50 / p90 / p97 (windows ≥ 1 mm) | Max | Reaching the 5th mark |
|---|---|---|---|---|---|---|
| 1 d | all | 123,663 | 73.1 % | 4.2 / 17.7 / 29.8 mm | 140.7 | ≥ 40 mm: 0.4 % |
| 1 d | Sep–Nov | 33,331 | 70.4 % | 6.2 / 24.5 / 36.8 mm | 140.7 | ≥ 40 mm: 0.7 % |
| 7 d | all | 120,609 | 27.3 % | 12.3 / 48.2 / 79.2 mm | 202.8 | ≥ 60 mm: 4.5 % |
| 7 d | Sep–Nov | 32,815 | 25.0 % | 21.4 / 64.5 / 92.4 mm | 202.8 | ≥ 60 mm: 8.7 % |
| 21 d | all | 114,138 | 3.9 % | 32.1 / 99.4 / 141.9 mm | 281.8 | ≥ 120 mm: 5.4 % |
| 21 d | Sep–Nov | 32,266 | 0.6 % | 52.6 / 120.0 / 161.1 mm | 281.8 | ≥ 120 mm: 9.9 % |

Sixth mark: 60 mm in one day was reached by 0.1 % of the windows (0.2 % in Sep–Nov). The shares for 100 mm in 7 days and 180 mm in 21 days were not measured.

---

## Deployment readiness (cut 1)

- **Sources and attribution:** no new source; Open-Meteo is already credited in the credits modal. Its free plan is for non-commercial use.
- **Migrations, environment variables, buckets, services:** none expected.
- **Quota:** no new calls and no bulk load.
- **Order:** back end (Render) before or with the front end (Vercel); the layer is only visible once the front end sets `ready`.
- **Data:** checked on 2026-11-26 (query run by Marcos): 423 cells on every date from 2026-11-05 to 2026-12-03 (item 8 of the 429 block of `memory/pending.md`). It depends on the daily `cell_refresh`: with the Open-Meteo quota spent it may stop, leaving missing or stale days. The query does not show that every cell was downloaded that night.
- **Rollback:** revert the merge commit.
- **To check after deploy:** the layer on the three base maps, light and dark, ES / CA / EN, phone and desktop; the endpoint's sum of one cell against its stored rows, and the card's figure at that cell's centre against that sum; the dark garnet and the dark blue over the three base maps; a window that includes forecast days.

A cut 2 or 3 that needs anything else updates this section before its first branch.

---

## Definition of Done

**Cut 1 — Rain**

- [ ] The endpoint returns the accumulated rain per cell for the three presets, with tests for the window's limits, the forecast days, missing days and estimated cells.
- [ ] Lluvia is `ready`: map, panel and legend with the final cuts, and `capa` / `dia` / `acum` in the URL.
- [ ] The point card shows the mm, follows slider and preset, and flags forecast, estimated and missing data.
- [ ] «Observar» opens the zone on the right day.
- [x] R1 and R2 answered and written in `memory/decisions.md`.
- [ ] ES / CA / EN, light and dark; text contrast ≥ 4.5:1 in both themes; the slider checked with a finger on a phone.

**Cuts 2 and 3:** to be written with their sections.

**Epic:** the three cuts delivered, or the ones left consciously moved elsewhere; deployment readiness checked; retrospective held.
