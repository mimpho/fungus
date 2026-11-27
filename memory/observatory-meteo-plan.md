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
| 2 `feat/observatory-meteo-rain-map` | ⬜ |
| 3 `feat/observatory-meteo-rain-card` | ⬜ |

### As built — branch 1 (2026-11-27)

- `layer_rain.py` as planned; `forecast_chain`, `cell_dict` and `window_fields` became public (renames only).
- P3 changed while building (see its row): `includes_forecast` was added to the answer.
- **For branches 2 and 3:** `includes_forecast` is one flag for the whole map, so with a partial refresh the card of a fully observed cell is tagged too. `last_data_date` can be a day that is still provisional: the default view is then tagged, and «Observar» can open the zone on it.
- **Not checked:** the endpoint over HTTP against a real database (the service was run with the real SQL store on the local one, read only, and one cell's sum matched SQL); a real Open-Meteo answer without a rain value (tested with a fake payload).

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

## Release

- Back end (Render) before or with the front end (Vercel); one epic → `main` PR for the cut. No migration, variables or new services. Rollback: revert the merge commit.
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
