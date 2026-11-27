# Plan — Meteo layers, cut 1: rain (`epic/observatory-meteo`)

> Technical plan. Product contract: [`observatory-meteo-prd.md`](observatory-meteo-prd.md).
> Written 2026-11-27. **Status: ✅ approved by Marcos on 2026-11-27, with P1–P4 as proposed.** No feature branch before the epic exists and holds these docs.
> Rain only; temperature and wind are planned when they are taken up.

---

## Decisions this plan adds to the PRD (approved)

| # | Decision | Discarded |
|---|---|---|
| P1 | A gap is estimated when **at least 3 neighbouring cells** have the whole window | 1 (fills almost everything, sometimes from one side only) or 5 (safer, leaves border cells empty) |
| P2 | The map paints an estimated cell like any other; **only the card says it is estimated** | Also mark it on the map (dotted outline) |
| P3 | A **past day downloaded after it ended** (UTC) counts as observed. One downloaded **on the day or up to 2 days before** also counts, and the window is tagged «incluye previsión». An older one is missing (changed on 2026-11-27, during branch 1) | The first version, only rows downloaded after the day: the whole map would lose today and the coming days every night until the refresh, or all day if it failed. Accepting any stored row, as Condiciones does: an old forecast would pass as rain that fell, with no tag |
| P4 | A day for which Open-Meteo sends **no rain value** is no longer stored as 0 mm for cells (small connector change, no migration) | Leave it and record it in `memory/gotchas.md` |

---

## Technical decisions

### What a day and a window are

- The window is the `n` days (1, 7, 21) ending on the reference day, both included. `24h` is one calendar day, not the last 24 hours.
- **Past day** (before today, UTC): usable if the row exists and, for `source = forecast`, its `fetched_at` date is at most `FORECAST_MAX_AGE_DAYS` (2) days before the day (P3). With a `fetched_at` date later than the day it is not flagged; otherwise it is provisional and flags the window.
- **Today and later:** the rule of the conditions layer: a continuous chain of forecast days from today, each fetched at most `FORECAST_MAX_AGE_DAYS` (2) days ago, up to today + 7.
- The sum uses the stored rain only: no altitude, forest or soil correction, and none of the gap filling of the scoring model (`scoring_v2` fills a missing day with 0 mm, so the rain layer does not go through it).

### Cell states and estimate

| `status` | When | `mm` |
|---|---|---|
| `measured` | All the days of the window are usable | Their sum |
| `estimated` | Some day is missing and at least 3 neighbours are `measured` (P1) | Weighted mean of those neighbours |
| `no_data` | Some day is missing and there are fewer | `null` |

- **Neighbours:** cells whose centre is within 3 half-cells, with the distance measured as `hypot(Δlat / half_lat, Δlon / half_lon)` using the footprint of `build_grid` (rows have their own width and offset). That reaches the surrounding ring.
- **Weight:** `1 / distance²`. Only `measured` cells count: an estimate never feeds another, so a large hole stays empty.
- An estimate replaces the whole window of the cell; its own partial sum is not used.
- It is done in the back end, where it has tests (the front end has none).

### Endpoint

```
GET /api/v1/observatory/layer/rain?window=24h|7d|21d&date=YYYY-MM-DD
```

Login required (router dependency). `window` defaults to `7d`, any other value is 422; `date` defaults to the last day with data. No migration and no Open-Meteo calls.

```json
{
  "window": "7d", "window_days": 7, "window_from": "…", "date": "…",
  "last_data_date": "…", "max_date": "…", "forecast_from": "…",
  "basis": "real | forecast", "includes_forecast": false, "clamped": false,
  "cells": [{"id": "…", "lat": 0, "lon": 0, "half_lat": 0, "half_lon": 0,
             "elevation_m": 0, "status": "measured", "mm": 48.2}]
}
```

- `includes_forecast` is what raises «incluye previsión»: the date is today or later, or the sum of some measured cell has a provisional past day. It is one flag for the whole answer. `basis` keeps its meaning of the conditions layer (which side of today the date is).
- `last_data_date`, `max_date`, `forecast_from` and `clamped` mean the same as in the conditions layer, so the shared slider reads either answer.
- Cached in `layer_cache` with a key `("rain", today, date, window, data_signature)`.

### Map

- Own painter, `src/lib/rainLayer.js` (pure). It reuses the grid of `reliefLayer.js` (`buildReliefGrid`) and its blend: weight by distance in half-cells, up to 2. At a cell's centre only that cell counts, so **the colour and the card there are the cell's figure**; halfway to the next centre both weigh the same.
- **That blend does not fill a gap** (neighbours weigh 0 at its centre): the estimate comes as the cell's value from the back end and is blended like the rest.
- `no_data` cells are hatched; they give nothing to the blend and no neighbour paints over their footprint.
- **Clip:** only pixels inside the footprint of a cell of the answer are painted (the blend alone reaches further), and sea pixels are left out using the elevation raster. Without the raster the layer is still drawn, over the sea too.
- **No blend mode:** the conditions pane uses `multiply` on the relief and `hard-light` on the satellite, which would hide or distort white. Rain uses plain alpha, with its own factor per base map; the pane's blend is restored for Condiciones.
- Canvas colours are literal hex in the painter; the legend uses `--meteo-rain-1`…`6` in `tokens.css` with the same values (not through `gen:css-vars`, which is stale). Starting values: `#f4f8fc`, `#8cc3ea`, `#2f6fc0`, `#6a3f98`, `#8c1c38`, `#4a0818`, tuned in the browser.
- Colour is interpolated between marks in mm; the marks are evenly spaced on the legend. 0 → 1 mm fades in from transparent. Above the sixth mark the colour stays.
- `LayerLegend` gets numbered marks and places the 21 d band (60–120) on the marks instead of proportionally.

### Point card

| State | Headline | Under it |
|---|---|---|
| Loading | Three dots (as today) | — |
| Measured | «≈ 48 mm» | Dates and length |
| Under 1 mm | «< 1 mm» | Dates and length |
| Point in an `estimated` cell | «≈ 48 mm» | Dates, length and «estimado con celdas vecinas» |
| Point in a `no_data` cell | «Sin datos de lluvia» | Dates and length |
| Point outside every cell | «Sin datos de lluvia» | — |
| Request failed | The map's error notice with retry | — |

- With `includes_forecast`, the «incluye previsión» tag is added to any state with a window, in the card and in the panel.
- Whole mm. The figure is read from the same blend as the colour. The state is that of the cell containing the point, even if its pixel is blended with others.
- The card keeps its size between states, and only the headline block changes. Its place on desktop and phone does not change, nor do the panel's controls (already built).
- With Meteo off, or hidden by Hábitat · De la seta, the card shows the conditions percentage as today, and the Meteo panel's hidden note also covers Lluvia.

### URL, «Observar», species

- `capa=lluvia`, `dia` (shared), `acum=24h|7d|21d`; `7d` is left out, an unknown value means `7d`, and `acum` goes when the layer is not rain.
- `handleObserve` sends the Meteo day with Condiciones **or** Lluvia; a forecast day opens on `last_data_date`.
- The species is still the whole map's: choosing one in the search bar switches to Condiciones, as today.

---

## Files

| File | Change | Branch |
|---|---|---|
| `backend/app/services/layer_rain.py` | New, pure: usable days, sum, states, estimate | 1 |
| `backend/app/services/layer_probability.py`, `point_series.py` | Share the reference-day and forecast-chain helpers (move or export; no change of behaviour) | 1 |
| `backend/app/routers/observatory_layer.py` | `GET /rain` | 1 |
| `backend/app/connectors/base.py`, `open_meteo.py`, `services/cell_provider.py` | P4: flag a missing rain value; `build_rows` skips that day. Zone ingest unchanged | 1 |
| `backend/tests/unit/test_layer_rain.py` (+ router, connector and provider tests) | New | 1 |
| `system/project.spec.md`, `docs/backend_architecture.md` | Endpoint | 1 |
| `src/lib/rainLayer.js` | New: colours, blend, hatching, clip, value at a point | 2 |
| `src/lib/meteoLayers.js` | `RAIN_SCALES` with marks and six colours | 2 |
| `src/hooks/useRainLayer.js`, `src/services/observatoryService.js` | New request, cancels like `useProbabilityLayer` | 2 |
| `src/components/observatory/ObservatoryMap.jsx` | `rainLayer` prop, pane blend | 2 |
| `src/components/observatory/nav/MeteoPanel.jsx`, `LayerLegend.jsx`, new `RainPanel.jsx` | Real rain panel: loading, error, legend | 2 |
| `src/styles/tokens.css`, `src/data/i18n.js` | Tokens and texts (ES / CA / EN) | 2, 3 |
| `src/pages/Observatory.jsx` | Layer state, loading bar, data credit (2); card, «Observar», preset from the URL (3) | 2, 3 |
| `src/components/observatory/PointPanel.jsx` | Rain headline (new small component for the figure) | 3 |
| `src/lib/observatoryView.js`, `src/hooks/useObservatoryView.js` | `acum` | 3 |

---

## Branches

| Branch | State |
|---|---|
| 1 `feat/observatory-meteo-rain-api` | ✅ 2026-11-27 (scenarios 1.1–1.13) |
| 2 `feat/observatory-meteo-rain-map` | ✅ 2026-11-27 (scenarios 2.1–2.6; see «As built — branch 2») |
| `feat/observatory-meteo-day-selector` | ⬜ planned (see «Day selector»): back end and front end in one branch. Goes before branch 3 (2026-11-27) |
| 3 `feat/observatory-meteo-rain-card` | ⬜ |

### As built — branch 1 (2026-11-27)

- `layer_rain.py` as planned; `forecast_chain`, `cell_dict` and `window_fields` became public (renames only).
- P3 changed while building (see its row): `includes_forecast` was added to the answer.
- **For branches 2 and 3:** `includes_forecast` is one flag for the whole map, so with a partial refresh the card of a fully observed cell is tagged too. `last_data_date` can be a day that is still provisional: the default view is then tagged, and «Observar» can open the zone on it.
- **Not checked:** the endpoint over HTTP against a real database (the service was run with the real SQL store on the local one, read only, and one cell's sum matched SQL); a real Open-Meteo answer without a rain value (tested with a fake payload).

### As built — branch 2 (2026-11-27)

- As planned: `rainLayer.js`, `useRainLayer.js`, `RainPanel.jsx`, the scales with six marks, the pane without blend (set with each picture), and the picture swapped only once decoded.
- **Changed in QA** (see `decisions.md`, same date). Where the Map section above differs, this wins: no white (first mark transparent, second light blue at 60 %); the clip is the ICGC boundary (`cataloniaOutline.js`) and not the footprints plus the elevation raster, which rain no longer uses; border strips held by no footprint are painted with the blend; the 21 d band is a green line under the numbers.
- **For branch 3:** `rainValueAt(rainGrid(cells), cells, lat, lon)` gives `{ status, mm }`, or null outside Catalonia or beyond every cell's reach; a spot in a border strip comes as `estimated`. It has not been tried in the card, nor on a real border strip.
- **Checked:** build; painter with made-up cells in Node (before the boundary change); in the browser with local data the three windows, a past and a forecast day, no empty frame between pictures, the three base maps, Condiciones' blend restored, the boundary zoomed in on the north, the delta and the Empordà coast (before the last simplification, ~40 → ~120 m), phone and desktop, both themes. The request failure and the cells without data were simulated. Marcos approved the look.
- **Not checked:** loading bar seen on screen; the hidden note under Hábitat · De la seta; text contrast measured; slider with a finger; the sources dialog's new credit; the 21 d band's CA and EN texts and its desktop legend; real `no_data` or `estimated` cells.

All cut from `epic/observatory-meteo`, which Marcos creates from `main`. One after another; each is squashed into the epic. These doc changes must be in the epic (or in `main`) before branch 1.

### 1. `feat/observatory-meteo-rain-api` (back end, TDD)

| # | Given | When | Then |
|---|---|---|---|
| 1.1 | A cell with 30 archive days | `7d` on day D is asked | `mm` is the sum of D−6…D; D−7 and D+1 do not count |
| 1.2 | The same cell | `24h` and `21d` | One day and 21 days |
| 1.3 | A date today or later with a fresh, continuous forecast | The layer is asked | It sums observed and forecast days; `basis = forecast`, `includes_forecast` |
| 1.4 | A stale forecast, or a hole before the date | The layer is asked | The cell is not `measured` |
| 1.5 | A date beyond today + 7, or beyond every forecast | The layer is asked | The date is limited and `clamped = true` |
| 1.6 | A past row `forecast` fetched after its day | The window includes it | It counts; `includes_forecast = false` |
| 1.7 | A past row `forecast` fetched on its day or up to 2 days before / 3 or more before | The window includes it | It counts, `includes_forecast = true`, `basis = real` / that day is missing (P3) |
| 1.8 | A cell with one day missing and 3 or more measured neighbours | The layer is asked | `estimated`, with the weighted mean; its partial sum does not appear |
| 1.9 | The same with 2 neighbours, or with neighbours that are only estimated | The layer is asked | `no_data`, `mm = null` |
| 1.10 | No cell has the whole window | The layer is asked | Every cell is `no_data`, answer 200 |
| 1.11 | A measured cell with 0 mm | The layer is asked | `mm = 0`, `measured` (not missing) |
| 1.12 | No session / `window=3d` | The endpoint is called | 401 / 422 |
| 1.13 | Open-Meteo sends `null` rain for one day | A cell is loaded or refreshed | No row is written for that day and an existing row is kept (P4) |

### 2. `feat/observatory-meteo-rain-map` (front end)

`ready` stays `false`: the layer can be seen only in development builds.

| # | Given | When | Then |
|---|---|---|---|
| 2.1 | Meteo with Lluvia chosen | The data arrives | The smoothed layer, 7 d by default, no species field, loading bar while it loads and draws |
| 2.2 | The layer drawn | Preset or slider changes | Map, dates, legend and tag change; no blank frame between pictures |
| 2.3 | An estimated cell and a `no_data` one | The layer is drawn | The first is painted, the second hatched |
| 2.4 | Any base map | It changes, or Condiciones is chosen again | Rain is readable on all three; Condiciones keeps its blend |
| 2.5 | 21 d | The legend is shown | Six marks and the 60–120 band between its two marks |
| 2.6 | The request fails | — | Notice with retry, in the panel and with it closed |

### 3. `feat/observatory-meteo-rain-card` (front end, turns the layer on)

| # | Given | When | Then |
|---|---|---|---|
| 3.1 | Lluvia on | A point is picked | The card shows the state of the table above, with no conditions percentage |
| 3.2 | The card open | Preset or day changes | The figure follows; it never shows the previous window's figure under the new dates |
| 3.3 | A forecast day | The card is open and «Observar» pressed | Tag in the card; the zone opens on the last real day |
| 3.4 | A past day | «Observar» | The zone opens on that day |
| 3.5 | `?capa=lluvia&acum=21d&dia=…` | The link is opened | Meteo on with that layer, preset and day |
| 3.6 | `ready: true` and a production build | The Meteo tab is opened | Lluvia has no «Pronto»; Temp. and Viento keep it |
| 3.7 | — | QA | ES / CA / EN, light and dark, contrast ≥ 4.5:1, three base maps, slider with a finger on a phone |

Checks for every front-end branch: `npm run build` and Marcos's QA in the browser.

---

## Day selector (`feat/observatory-meteo-day-selector`)

Written 2026-11-27. **Status: ✅ updated with Marcos's answers of 2026-11-27 (S1 A, S2 A, S3 B, S4 A, S5 D, S6 A; PRD) and with his choice of a single branch.**

### Feasibility (2026-11-27, local database on the Mac, 425 cells, read only; no server started)

| Date asked | Rain 21 d: read + compute | Conditions, 36 excellent: read + compute | One species (*L. deliciosus*) |
|---|---|---|---|
| default | 0.12 + 0.06 s | 0.21 + 2.60 s | 0.25 + 1.61 s |
| −30 d | 0.21 + 0.06 s | 0.27 + 3.22 s | 0.28 + 1.91 s |
| −90 d | 0.31 + 0.09 s | 0.36 + 3.47 s | out of season |
| −150 d | 0.38 + 0.11 s | 0.48 + 4.02 s | out of season |
| −180 d | 0.42 + 0.13 s | 0.50 + 4.55 s | out of season |

Answers are 64 kB (rain) and ~550 kB (excellent) before compression, whatever the date. Conditions grows with age because `loaded_cells_climate(since)` has no upper bound and every later row is prepared for nothing. **Render: not measured.**

| Series | Cost on the Mac |
|---|---|
| Rain, 26 weeks | read as above + 0.09 s |
| Conditions, one pass per cell, 182 days, 36 species | 24 s |
| Conditions, each day as the map computes it, mean elevation | 0.64 s a day (all days ≈ 2 min) |
| The same for the days a refresh changes (19 days) | 7.2 s |
| One species, one pass, 26 weeks | 1.3–1.6 s |

Peak memory of the process: 145 MB reading what 19 days need, 294 MB reading 295 days of every column.

Local history: first stored day 11–31 January, no gap in the last 188 days or their 107-day warm-up in any of the 425 cells. Production: see the result under the query below.

### Why the series differed from the map by up to 7 points

The model's **«warm» state** chains from day to day: whether a day is warm depends on the activation of the 21 days before, which depends on whether the days of each rain were warm. So it depends on where the calculation starts. The map starts 100 days before the date; the one-pass series starts before its oldest week, so recent days have up to ~290.

Full comparison (10,958 cell-days, mean of the excellent species at mean elevation): mean difference 0.05 points, 99 % within 1.0, 0.57 % above 2, **maximum 16.3** (the earlier 7 came from a sample of 42). Worst case, one cell at 1,942 m on 15 October: with 100 or 130 days of warm-up it is cold (*Craterellus tubaeformis*: activation 11, score 6); with 160 or more it is warm (68, score 36). Soil water and every other factor are equal. The daily mean of all Catalonia differs by at most 0.14 points, so a bar would not show it. The effect on a p90 was not measured.

It is not specific to the series: `point_series.build_series` gives the observed zone's chart a longer warm-up for its later days than the map has, so the two can disagree there too (not looked for on screen). Out of scope here; see `memory/gotchas.md`.

### History depth in production (Marcos runs it; read only)

```sql
-- Read only. 188 = 26 calendar weeks back (up to 6 extra days); +107 = days read before the first scored day
WITH p AS (
  SELECT (now() AT TIME ZONE 'utc')::date        AS today,
         (now() AT TIME ZONE 'utc')::date - 188  AS bar_from,
         (now() AT TIME ZONE 'utc')::date - 295  AS warm_from
), per AS (
  SELECT c.id,
         min(h.date) AS first_day,
         count(*) FILTER (WHERE h.date >= p.bar_from  AND h.date < p.today) AS bar_days,
         count(*) FILTER (WHERE h.date >= p.warm_from AND h.date < p.today) AS warm_days,
         count(*) FILTER (WHERE h.date >= p.warm_from AND h.date < p.today
           AND num_nulls(h.temp_max_c, h.temp_min_c, h.temp_avg_c, h.soil_temp_c, h.humidity_pct, h.wind_kmh) > 0) AS incomplete,
         count(*) FILTER (WHERE h.date >= p.bar_from - 20 AND h.date < p.today AND h.source = 'forecast'
           AND h.date - (h.fetched_at AT TIME ZONE 'utc')::date > 2) AS stale_forecast
  FROM cells c
  JOIN climate_cell_history h ON h.cell_id = c.id
  CROSS JOIN p
  WHERE c.loaded_to IS NOT NULL
  GROUP BY c.id
)
SELECT p.today,
       count(*)                                                             AS cells,
       min(first_day)                                                       AS earliest_first_day,
       percentile_disc(0.5) WITHIN GROUP (ORDER BY first_day)               AS median_first_day,
       max(first_day)                                                       AS latest_first_day,
       count(*) FILTER (WHERE first_day <= p.bar_from - 20)                 AS cells_rain_21d_ok,
       count(*) FILTER (WHERE first_day <= p.bar_from - 107)                AS cells_full_warmup,
       count(*) FILTER (WHERE bar_days  = p.today - p.bar_from)             AS cells_no_gap_in_bar,
       count(*) FILTER (WHERE warm_days = p.today - p.warm_from)            AS cells_no_gap_with_warmup,
       min(bar_days)                                                        AS min_bar_days,
       p.today - p.bar_from                                                 AS expected_bar_days,
       sum(incomplete)                                                      AS incomplete_rows,
       sum(stale_forecast)                                                  AS stale_forecast_rows
FROM per CROSS JOIN p
GROUP BY p.today, p.bar_from, p.warm_from;
```

What to read: `cells_rain_21d_ok`, `cells_full_warmup` and `cells_no_gap_with_warmup` should equal `cells` (423 expected); if not, `latest_first_day` and `min_bar_days` say how far short. `incomplete_rows` are days the model fills in. `stale_forecast_rows` are days the rain layer treats as missing (forecast never replaced). On the local database: 425 / 425 / 425 / 425, 188 of 188 days, 0 and 9. It does not tell whether the stored values are right.

**Production, run by Marcos on 2026-11-27:** 423 cells; first stored day 29–31 January (median 30); 423 of 423 cells have the 21-day rain window, the full warm-up and no gap in the bar or the warm-up (188 of 188 days); 0 incomplete rows and 0 stale forecast rows. Six months are available in every cell. The newest cell starts on 31 January and the warm-up of the query's oldest day on 5 February, so there were few spare days that day; the bar moves forward in time, so the margin grows while no history is deleted.

### Decisions this plan adds

- **A week** is Monday–Sunday (UTC days). The bar starts on the Monday 26 weeks before the current week and ends on the last day that can be asked. When today is a Monday the last week holds one day.
- **Rain of a week** = sum over its days of the mean over the cells that have the day (the rules of `_usable_days`, so a never-refreshed forecast does not count). A week cut short adds only the days it has.
- **Conditions of a day** = per cell, the mean of the in-season excellent species that reach its mean elevation, computed like `_scores_at_many` (100-day window); then over the cells, the mean and the p90. Both are stored, so S6 can change without computing again. A week = the mean of its days (S6 A: the bar shows `mean`; `p90` is kept in case S6 is changed). The current week comes in two parts, real and forecast.
- **Species that are not stored (S1 A):** 166 of the 202 are not excellent. Each is computed when asked, **in one pass** per cell, and cached like the layers; rows are read in bounded batches and one such computation runs at a time. One pass took 1.0–1.5 s on the Mac against 0.13–0.41 s *per day* the map's way. Measured on six species (four excellent, two not), 26 sampled days: the daily mean of all Catalonia differs from the map's way by at most 0.26 points (single cells by up to 26).
- **Storage (S4 A):** `meteo_day_series(day, series, mean, p90, cells, inputs, computed_at)`, primary key `(day, series)`, `series` = `excellent` or a species id (the 36 come from the same pass at no extra model cost). `inputs` = hash of the model version and the species records: when it changes, every day is computed again.
- **Job:** after the cell refresh (00:40 and the start-up recovery) and also at start-up when days are missing, even if the refresh is not due. It computes the days the refresh rewrites (today − 11 to today + 7) plus any missing or outdated day, newest first, commits day by day (a restart resumes) and reads the rows in bounded batches. It never calls Open-Meteo. A forecast day computed more than 2 days ago is not served.
- **Endpoint:** `GET /api/v1/observatory/layer/weeks?layer=rain|conditions&species=` (login). Answer: `first_date`, `forecast_from`, `max_date`, `series` (`excellent` or the species id), `weeks: [{from, to, real: {days, value}, forecast: {days, value}}]` (S3 B splits the current week at today; today is forecast). No `species` means the excellent ones. Rain is computed when asked, from a query of only the columns it needs, and cached like the layers.
- **Old dates:** for a past date the conditions layer reads `[since, date]` plus the last 10 days (which keep `last_data_date` and `max_date`), not everything in between. Same answer, tested; the time gain is expected, not measured.
- **Front end:** `MAX_DAYS_BACK` becomes `firstBarDay(today)`, used by `clampDay` and by the bar, so link and bar cannot differ. The server's `first_date` follows the same rule.
- **Migration:** `023_meteo_day_series.py`, RLS enabled like 012 and 021. **To settle:** Render runs Alembic at start-up, so a deploy applies it by itself unless Marcos applies it first (from the machine, with `alembic upgrade head`, which records the revision). SQL pasted in Supabase without the revision would make the start-up migration fail.

### One branch, two stages

Back end first (TDD), then front end, each with its own commits while the branch is open; it is squashed into the epic as one, after QA of the whole.

#### Stage 1: back end (TDD)

| # | Given | When | Then |
|---|---|---|---|
| D1.1 | A date inside a week | The weeks are asked | They run Monday–Sunday from the Monday 26 weeks before the current week to `max_date`; the first and today's are checked on a Monday and on a Sunday |
| D1.2 | Cells with a week of rain | Rain weeks | Each part's `value` (`real`, `forecast`) is the sum of its daily means; the preset plays no part |
| D1.3 | A day missing in some cells / in all | Rain weeks | The mean uses the cells that have it / the week counts one day fewer; with no day, `value` null |
| D1.4 | A fresh forecast / a stale one | Rain weeks | Forecast days counted in `forecast.days` / left out |
| D1.5 | Cells and species | A conditions day is computed | Per cell the same figure as `_scores_at_many` at its elevation; mean and p90 over the cells with a figure |
| D1.6 | No species in season or none reaches any cell | The day is computed | Stored with no value, not 0 |
| D1.7 | An empty table | The job runs and is cut half way | Days done are kept; the next run computes only the rest, plus the refresh window |
| D1.8 | Species or model changed | The job runs | Every day is computed again |
| D1.9 | A forecast day computed 3 days ago | Conditions weeks | It does not count |
| D1.10 | The cell refresh finishes, or the app starts with days missing | — | The job runs, one at a time; a failure is logged and the refresh's result stands |
| D1.11 | An excellent species / another one / none / unknown | `species=` | Its stored series / its series computed then, and cached until the data changes / the excellent one / 404 |
| D1.12 | No session / another `layer` | The endpoint | 401 / 422 |
| D1.13 | A date 150 days back | Conditions and rain layers | Same answer as reading everything, `last_data_date` and `max_date` included |
| D1.14 | The job and the endpoint | Run with a provider that fails on any call | No Open-Meteo call |

Files: new `services/meteo_weeks.py` (pure), `services/day_series.py` (job and store), `models`, migration 023; `routers/observatory_layer.py`, `services/cell_store.py` (bounded and light reads), `main.py` (job hook); tests; `system/project.spec.md`, `docs/backend_architecture.md`.

#### As built — stage 1 (2026-11-27)

Scenarios D1.1–D1.14 have tests (1,247 unit tests pass; `ruff check app/` is clean). Where this differs from «Decisions this plan adds», this wins:

- **Old dates** also read the last **30** days (`RECENT_DAYS`), not 10, the margin the rain layer already used.
- **Memory** of the job is bounded by days (14 computed per read), not by cells; the species computed when asked read 50 cells at a time.
- A day is pending when missing, computed from other species or another model, past but computed before it ended, or in the refresh window with climate downloaded after its computation. So a restart with no new data computes nothing.
- The job also follows the refresh when the refresh is switched off or fails.
- `excellent_species` (in `day_series_store.py`) is now shared by the excellent layer and the job.

**Checked on a throwaway copy of the local database** (then dropped; the local database itself is still at revision 022): migration 023 up, down and up; first run 194 days in 79 s, peak memory 191 MB, 7,178 rows (888 kB); second run 0 days; the stored figure of three days (1, 40 and 150 days back) equal to the excellent layer's cells at mean elevation; rain weeks from the real SQL in 0.36 s; a species computed when asked in 2.2 s. Weekly excellent series 25 May – 4 December: maximum 63.5.

**Not checked:** the endpoint over HTTP against a real database; the job inside a running API; anything on Render; response times of old dates with the bounded read.

**To run the API locally on this branch** the local database needs migration 023 (`alembic upgrade head`); without it the job logs a failure and `layer=conditions` fails.

#### Stage 2: front end

| # | Given | When | Then |
|---|---|---|---|
| D2.1 | Lluvia or Condiciones | The panel is open | One bar with months and weekly bars; changing layer keeps the day and changes only the bars |
| D2.2 | A finger or the mouse on the bar | It drags | The magnifier shows ±5 days and the label follows; the map is asked once it rests; the phone sheet does not move; the height does not change |
| D2.3 | ‹ ›, keyboard, «Hoy» | — | One day, one week with Page keys, today |
| D2.4 | The forecast | — | Outlined bars, the current week split at today with a dashed line, and said in the day's label |
| D2.5 | The states of the PRD table | — | Same height in all |
| D2.6 | `dia` five months back / older than the bar | The link is opened | That day / the bar's first day |
| D2.7 | A species chosen, excellent or not | — | Its bars; none of the previous species while they load |
| D2.8 | An old day | «Observar» with Condiciones | The zone opens on it |
| D2.9 | — | QA | ES / CA / EN, light and dark, month labels ≥ 4.5:1, desktop and phone, with a finger on a real phone |

Files: new `components/observatory/DayBar.jsx` (replaces `LayerDayControl.jsx`), `hooks/useMeteoWeeks.js`, `services/observatoryService.js`, `lib/layerDays.js` (weeks, `firstBarDay`), `lib/observatoryView.js`, `SpeciesLayerPicker.jsx`, `nav/RainPanel.jsx`, `nav/MeteoPanel.jsx`, `styles/tokens.css` (bar colours; canvas not needed, the bar is SVG), `data/i18n.js`. Production shows the bar with Condiciones, which is already live, so **it is visible to users at the next merge to `main` even with Lluvia still off**.

To check in the browser at real width: the two halves of the current week and a one-day last week (about 12 px per week), light blue outlines (S2 A with S3 B), and the dark garnet over the panel in both themes.

**Order:** stage 1, stage 2, then the point card branch. At deploy, back end first; the bars appear once the job has filled the table.

### Risks of the selector

| Risk | Mitigation |
|---|---|
| The first fill or the nightly job is slow or runs out of memory on Render (not measured) | Day by day, bounded batches, resumable; read its duration in the log after the deploy |
| A restart or the Open-Meteo quota stops the refresh | The job also runs at start-up; stale forecast days are left out |
| A cell loaded later has a shorter history | A new cell reads 280 days back (`HISTORY_DAYS`), short of the 295 the oldest day plus warm-up can need: its oldest days get a shorter warm-up. Production had all 423 complete on 2026-11-27 |
| Old dates are slow on Render | Bounded read (D1.13); read production response times before and after |
| About 1.7 px a day on the bar | The magnifier (S5 D) and ‹ ›; checked with a finger |
| A species computed when asked is slow on Render or competes for memory (not measured) | One at a time, bounded batches, cached; the bar waits without blocking the map |

---

## Release

- Back end (Render) before or with the front end (Vercel); one epic → `main` PR for the cut. No migration for the rain layer; the day selector adds migration 023 (how it is applied is to be settled, see «Day selector»). No new variables or services. Rollback: revert the merge commit; the new table can stay.
- **Pending before that merge (Marcos):** the version tag and the retrospective of each layer's delivery. The cadence rule asks to deploy every two to three weeks.

---

## Risks

| Risk | Effect | Mitigation |
|---|---|---|
| `cell_refresh` does not run or covers part of the map (Open-Meteo quota, 429 block of `pending.md`) | After more than 2 nights without it: hatched stretches or no data for the windows with the missing days (P3) | Estimate for isolated gaps; read `Cell refresh finished` after the deploy; the clean fix is the paid plan (out of scope) |
| Estimates and smoothing look more precise than the data | A local storm can be missed or spread | «≈» in the card, estimate declared, one value per ~8 × 11 km recorded in the PRD |
| Garnet, dark garnet and dark blue get lost over the satellite, or for colour-blind users | Heavy rain is hard to read | Tune tones in branch 2 without moving the marks |
| White covers the base map or its labels | Light rain hides the map | Alpha factor per base map; labels pane above on streets and relief (the satellite's names are part of the tile) |
| Painting holds the main thread on a phone | The slider stutters | Same `afterPaint` and slider debounce as Condiciones; do not repaint for the card |
| Rain answers push conditions answers out of the 64-entry cache | Condiciones recomputes (~3 s for the excellent edibles) | Watch it; a separate cache for rain if needed |
| Rows already stored as 0 mm because the value was missing | A wrong 0 cannot be told apart | Not repaired. The production query found no window with a day lacking temperatures, which does not rule out a lone missing rain value |
| The local database is a snapshot (on 2026-11-27: downloaded on the 25th, forecast to 12-04) | It ages: under P3 the days from its download on count as provisional, those more than 2 days after it are missing, and the forecast goes stale after 2 days | Unit tests with fixtures; a local refresh spends Open-Meteo quota, only on purpose |
| The «≈» figure matches no stored row | Harder to check in production | Check the endpoint's sum against the rows, then the card at the cell's centre |
