# PRD — Meteo layers: rain, temperature and wind (`epic/observatory-meteo`)

> Product Requirements Document. Written before the first feature branch.
> Last updated: 2026-11-26
>
> Status: **one epic for the three layers (Marcos, 2026-11-26). Rain is specified here; temperature and wind are placeholders, to be extended in this same file when each one is taken up.** Two rain questions are still open (R1, R2).
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
| Map layer | The accumulated rain of every cell, in the draw order of Meteo. Its look is open (R1). |
| Panel and legend | The panel already built for development: presets 24 h · 7 d (default) · 21 d, the window's dates, the shared slider. One fixed scale per preset, in mm. 21 d keeps the 60–120 mm «good» band of the observed zone's rain chart. Cuts for 24 h and 7 d: R2. |
| Forecast flag | When the slider's day is today or later, the window includes forecast days: hatched stretch of the slider and the tag «incluye previsión», in the panel and in the point card. Recent past days whose stored value still comes from the forecast, because the archive has not replaced it yet, are not flagged. |
| Point card | Headline: the accumulated mm of the active window, with its dates and length (e.g. «48 mm · 20–26 nov · 7 días», invented figures). It follows the slider and the preset while the card is open. The value belongs to the cell: two nearby points of one cell share the same source figure, with no correction for altitude, forest or soil. |
| Missing data | If a day of the window is missing in a cell, the cell says so and no partial sum is shown as the total, on the map and in the card. |
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
| 4 | Days missing in the window? | Marcos | ✅ Say so; no partial sum as total (2026-11-26). |
| 5 | «Observar» with Lluvia on? | Marcos | ✅ Opens on the slider's day, as with Condiciones (2026-11-26). |
| 6 | When does each layer reach `main`? | Marcos | ✅ Layer by layer, in the same epic (2026-11-26). |
| R1 | **Look on the map:** squares per cell, smoothed or other variants. It also settles whether the card shows the cell's value or the interpolated one that matches the colour. | Marcos | ⬜ Pending: decided seeing 4–5 proposals together. |
| R2 | **Cuts of the 24 h and 7 d scales.** | Marcos | ⬜ Pending: to be set with real data (decided 2026-11-26), from a read-only query. |

---

## Deployment readiness (cut 1)

- **Sources and attribution:** no new source; Open-Meteo is already credited in the credits modal. Its free plan is for non-commercial use.
- **Migrations, environment variables, buckets, services:** none expected.
- **Quota:** no new calls and no bulk load.
- **Order:** back end (Render) before or with the front end (Vercel); the layer is only visible once the front end sets `ready`.
- **Data:** checked on 2026-11-26 (query run by Marcos): 423 cells on every date from 2026-11-05 to 2026-12-03 (item 8 of the 429 block of `memory/pending.md`). It depends on the daily `cell_refresh`: with the Open-Meteo quota spent it may stop, leaving missing or stale days. The query does not show that every cell was downloaded that night.
- **Rollback:** revert the merge commit.
- **To check after deploy:** the layer on the three base maps, light and dark, ES / CA / EN, phone and desktop; the card's figure against the stored rows of one cell; a window that includes forecast days.

A cut 2 or 3 that needs anything else updates this section before its first branch.

---

## Definition of Done

**Cut 1 — Rain**

- [ ] The endpoint returns the accumulated rain per cell for the three presets, with tests for the window's limits, the forecast days and missing days.
- [ ] Lluvia is `ready`: map, panel and legend with the final cuts, and `capa` / `dia` / `acum` in the URL.
- [ ] The point card shows the mm, follows slider and preset, and flags forecast and missing data.
- [ ] «Observar» opens the zone on the right day.
- [ ] R1 and R2 answered and written in `memory/decisions.md`.
- [ ] ES / CA / EN, light and dark; text contrast ≥ 4.5:1 in both themes; the slider checked with a finger on a phone.

**Cuts 2 and 3:** to be written with their sections.

**Epic:** the three cuts delivered, or the ones left consciously moved elsewhere; deployment readiness checked; retrospective held.
