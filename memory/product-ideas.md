# Product Ideas — Observatory (outside v1)

> Ideas raised while building `feat/observatory-page` (2026-10-17). None is committed or scheduled except where it says so. Decisions, once taken, move to `memory/decisions.md`; work to do moves to `memory/pending.md`.
> Field results used to calibrate the model are kept outside the repo (the Fungus Project's field notebook and `local-data/field/`, excluded from git). **Exact foraging coordinates never go into the repo.**

## 1. Zone comparator (proposed 2026-10-17; agreed as an idea, build after the calendar)

- **Origin:** two saved points about 2.4 km apart (Font del Puig, 1,206 m, and Collet de les Barraques, 1,890 m) score 82 and 44 for the same species. The gap comes from the altitude-corrected temperature (0.65 °C per 100 m; factor 99 → 68), the season band (mountain → subalpine; factor 99 → 59) and two frosts that only appear at the top. The factor breakdown explains it; a comparator would show it at a glance. It is not a matter of the radius: both points share one Open-Meteo cell.
- **Minimal design:** two or three points (from «Mis puntos», the observed one and another picked on the map), the same species (or the general model) for all. Rows per factor with bars side by side, final score, the chart of «Momento» with the lines overlaid, altitude and frosts, and one sentence of explanation taken from the factors.
- **Backend:** no new endpoint: `/point/snapshot` and `/point/series` per point. Mind the per-user daily limit of new cells (10): close points usually share a cell and spend nothing.
- **View state in the URL**, like the observed point.
- **Order agreed:** after the calendar (step 7) and before the pass on phone, languages and dark theme (step 10), unless it changes.

## 2. 3D map with a probability layer (Marcos, 2026-10-17)

- **Vision:** the 3D terrain carries only height, and a probability layer (a heat map) computed separately sits on top of it.
- **Three independent pieces**, decided and built apart: (a) 3D terrain, (b) a precomputed heat map, (c) painting the colour over the 3D terrain.
- **Today the model is per point,** computed on click. A layer over the whole map needs precomputation. Climate comes per Open-Meteo cell (about 8 × 11 km); inside the cell only temperature, soil temperature and humidity are corrected by altitude, rain and wind are the cell's. A periodic ingest of every cell touching Catalonia would be new work.
- **Steep terrain:** 300–500 m of drop within 1 km changes temperature and frost a lot. The altitude correction captures that; rain and wind it does not.
- **3D options:** Leaflet cannot do it. Either a shaded-relief layer in Leaflet (the ICGC publishes WMS/WMTS of shaded relief) or MapLibre GL JS with 3D terrain (rewrites the Observatory map). A relief layer is a candidate for the pass of step 10.
- **Detail by zoom (Marcos):** compute the heat map on the fly for the visible region, with a resolution that depends on the zoom (coarse pixels at 50 × 50 km, fine ones on a zone). Climate stays the cell's, so only terrain (altitude, aspect, slope) gains detail with the zoom, not rain or wind: avoid false precision. The cost is how many Open-Meteo cells fall in the view, not the zoom; those cells would have to be ingested by the server and not depend on the per-user limit.

## 3. Slope aspect (Marcos, 2026-10-17)

- North or south facing changes the moisture a slope keeps and the sun it gets, so its productivity. The model ignores it today.
- **Data:** there is no ready-made map to download; aspect and slope are derived from a digital elevation model. Candidates: the ICGC DEMs (5 × 5 m and 15 × 15 m) and Copernicus GLO-30 (30 m, global). Not verified whether the ICGC publishes aspect already computed.
- **Rule from field experience (Marcos):** the effect depends on the weather. After a cold or very wet spell look for sunnier slopes; when it is too dry, look for shadier ones because they keep moisture. The best aspect changes with the conditions, so a heat map would favour different places at different moments.
- **Nuance (Marcos):** he is not an expert mycologist; this is field intuition, not a numeric analysis, and the app should not claim that much precision. Design consequence: a simple, reasoned rule (sun-facing slopes raise temperature and lower humidity, shaded ones the opposite, with more or less weight depending on rain and cold), shown as a hint with its reason, like the thermometer («never a number without its reason»), not as a promise.
- **First reasonable step, without touching the score:** show aspect and slope of the point as data. Later adjust soil temperature and humidity by aspect, calibrated with real trips.

## 4. Field cases for calibration

- **2026-10-17, Coll de Bordoriol → Taradell (Osona):** the Observatory gave about 90 % for cep; none found after searching in Bordoriol, plenty of parasol (*Macrolepiota procera*). Toward Taradell, at about 850 m, an *Amanita caesarea* and a pink-capped bolete (identified by Marcos as *Boletus pseudoregius*), photographed within two minutes at the same spot.
- **Hypotheses, unchecked:** real soil moisture or canopy shade the model does not see; slope aspect; the cep needing more days after the rain than the model assumes; the model being optimistic with soil moisture (already noted on 2026-10-11 for Bordoriol and Els Munts).
- **To do:** pull the series and factor breakdown for that point and date from the API (needs access) and compare. The photos with GPS and an index of finds live in `local-data/field/`.
