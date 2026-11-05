# Product Ideas — Observatory (not yet planned)

> Ideas raised while building `feat/observatory-page` (2026-10-17). None is committed or scheduled except where it says so. Decisions, once taken, move to `memory/decisions.md`; work to do moves to `memory/pending.md`.
> Field results used to calibrate the model are kept outside the repo (the Fungus Project's field notebook and `local-data/field/`, excluded from git). **Exact foraging coordinates never go into the repo.**

## 1. Zone comparator (proposed 2026-10-17; idea only, not a task: decided 2026-10-18 it is not important or useful enough for now)

- **Origin:** two saved points about 2.4 km apart (Font del Puig, 1,206 m, and Collet de les Barraques, 1,890 m) score 82 and 44 for the same species. The gap comes from the altitude-corrected temperature (0.65 °C per 100 m; factor 99 → 68), the season band (mountain → subalpine; factor 99 → 59) and two frosts that only appear at the top. The factor breakdown explains it; a comparator would show it at a glance. It is not a matter of the radius: both points share one Open-Meteo cell.
- **Minimal design:** two or three points (from «Mis puntos», the observed one and another picked on the map), the same species (or the general model) for all. Rows per factor with bars side by side, final score, the chart of «Momento» with the lines overlaid, altitude and frosts, and one sentence of explanation taken from the factors.
- **Backend:** no new endpoint: `/point/snapshot` and `/point/series` per point. Mind the per-user daily limit of new cells (10): close points usually share a cell and spend nothing.
- **View state in the URL**, like the observed point.
- **Order (superseded 2026-10-18):** it was agreed to build it after the calendar (step 7) and before step 10; it is now parked and not in `memory/pending.md`. Revisit if the field use asks for it.

## 2. 3D map with a probability layer (Marcos, 2026-10-17)

- **Vision:** the 3D terrain carries only height, and a probability layer (a heat map) computed separately sits on top of it.
- **Three independent pieces**, decided and built apart: (a) 3D terrain, (b) a precomputed heat map, (c) painting the colour over the 3D terrain.
- **Today the model is per point,** computed on click. A layer over the whole map needs precomputation. Climate comes per Open-Meteo cell (about 8 × 11 km); inside the cell only temperature, soil temperature and humidity are corrected by altitude, rain and wind are the cell's. A periodic ingest of every cell touching Catalonia would be new work.
- **Steep terrain:** 300–500 m of drop within 1 km changes temperature and frost a lot. The altitude correction captures that; rain and wind it does not.
- **3D options:** Leaflet cannot do it. Either a shaded-relief layer in Leaflet (the ICGC publishes WMS/WMTS of shaded relief) or MapLibre GL JS with 3D terrain (rewrites the Observatory map). A relief layer is a candidate for the pass of step 10. **Update 2026-10-18:** real 3D (MapLibre) is discarded; Leaflet stays and relief is a shaded WMS layer (see section 6).
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

## 5. Territory area follow-ups (Marcos, 2026-10-18)

- «Área de territorio» ships with a zone ranking by catalogue score (`/zones`); its rain heat map over a 55-point grid was removed on 2026-10-18. **Idea, not decided:** rank grid areas by score, not only by rain, so «where to go this weekend» uses the model and not just where it rained. It needs scoring v2 per grid point: a full 280-day history of each point (~55 cells, about 385 weighted calls once, then incremental) and the point's elevation; the grid points could become real cells of the Observatory. **Superseded 2026-10-18** by the Top 10 layer of section 6.
- The ranking's «Cerca» uses the observed zone as centre; a variant could use the user's followed zones' centroid or their location. That ranking was deprecated on 2026-10-18 and will be redone on the interactive map (section 6).

## 6. Single interactive map with data layers, replacing the fixed-grid rain map (Marcos, 2026-10-18)

- **Origin:** «¿Dónde ha llovido más?» (Territory area) uses a fixed 55-point grid by comarca, with its own heat map and a 1–8 week timeline, apart from the interactive map used to pick a point. Idea: drop that separate section and fold rain (and other data) into the interactive map as toggleable layers, reusing its zoom and pan.
- **Two usage modes on the same map:** the existing pointwise mode (click → coordinates → the point's widgets) and an exploration mode (navigate with layers on, without fixing a point), so the heat map helps decide where to look in detail.
- **Base switch, three options, free choice of the user:**
  - Satellite: default, clean view.
  - Street map: useful to users who know an area by towns and roads. Its dark-theme style looks broken today and needs fixing (the switch stays; the style is what to improve).
  - Relief: ICGC shaded-relief WMS over the current Leaflet map. A flat image, it carries no elevation data.
  - Data layers can sit on any of the three bases; no automatic switch of base when a layer is turned on.
- **Real 3D discarded:** no MapLibre, no 3D terrain.
- **Four optional layers, independent of the base switch:**
  1. Probability: heat map reusing the thermometer's band gradient, over the whole visible grid.
  2. Accumulated rain: valuable on its own (looking after rain is a criterion in itself), even though rain is also a factor inside probability.
  3. Temperature.
  4. Wind.
  Temperature and wind are ingredients of probability, but Marcos also wants them as standalone layers.
- **Timeline (agreed 2026-10-18): one component, two behaviours depending on the layer.**
  - Probability, temperature and wind: a **single point**, the reference day (default: today). No window: the model scores a day from its own history, so a window would add nothing readable to the map.
  - Rain: an **adjustable window** whose right end is the reference day, as in the per-point chart (that day and the days before it). Default width **2 weeks** (roughly the lag between the rain that counts and the start of productivity); it can be narrowed down to 1 day, which gives the rain of a single day. No separate «daily rain» layer.
  - If the right end falls after today, the rain sum mixes measured and forecast rain: mark the future stretch on the axis so forecast is not presented as data.
  - The timeline is a tool overlaid on the map and shows the behaviour that fits the active layer.
- **Computation:** on the fly for the visible region, resolution by zoom (see section 2). The DEM (ICGC or Copernicus) is never painted: it only feeds the altitude and aspect calculations. Zoom adds terrain detail, not climate detail (the Open-Meteo cell stays about 8 km). For rain the room to sharpen is small: the gain is mostly visual smoothing between cells. Avoid false precision.
- **Top 10 layer (last feature of this idea):** a ranking of the best areas for the reference day, shown as one more layer of the interactive map. It replaces the deprecated «Ranking de zonas» (Cerca / Seguidas). It depends on the probability layer and on the server-side cells. Open: what it ranks (cells or zones), over which region (the visible area or all of Catalonia), and general model or per species.
- **Per-point chart unchanged:** the metric selector of the point chart (Momento, Lluvia, Viento, temperature…) stays; this is additive.
- **Suggested build order, one layer at a time, each with its timeline:** (0) server-side ingestion of the Open-Meteo cells (the real cost, whatever the order); (1) probability with the single-point timeline; (2) rain with the window; (3) temperature; (4) wind; (5) the Top 10 layer, last. Temperature and wind should come almost free once the single-point timeline and the on-the-fly pipeline exist.
- **Open:** licensing of the relief WMS and of the DEM (ICGC/Copernicus) before production; the fixed rain-grid code (`territory_rain_cache`, migration 020) was **removed unshipped** on 2026-10-18 (`chore/observatory-remove-territory-rain`; recoverable from PR #135).
- **Map resolution by relief (idea for 7b, 2026-10-18).** The fixed cell (~8 km) gives 400 cells for Catalonia, little for a mountain region. Option: score each cell at a few elevation bands (for example every 300 m) and pick per pixel from the DEM elevation, so the map gains detail where the relief changes. Only for the temperature-driven part; rain and wind stay at cell resolution to avoid false precision. Open: DEM licence (ICGC/Copernicus), cost of the per-band scoring.

- **Follow-ups of 7b (2026-10-20):**
  - Layers box under the view switch, so it never overlaps the clicked-point panel; "coming soon" layers (rain, temperature, wind) listed there.
  - Weight the mean of excellent species by observed frequency (GBIF audit) instead of equal weight.
  - Municipality radius for the place search (instead of a fixed 500 m around the point).
  - Clip the layer to Catalonia using `catalonia_outline.py`; the substrate raster also covers Andorra, Aragon and Perpinyà.
  - Forecast slider up to +7 days (branch `feat/observatory-layer-forecast`).


## 7. «Mis rincones» (Marcos, 2026-10-21; decided, in progress)

- Saved points evolve into corners: a manual kind (setal, paraje, aparcamiento, unspecified), species tagged from the catalogue, up to five own photos with their own species tags, and a «Mis rincones» layer on the interactive map, with a tab in the profile.
- Rule: exact foraging coordinates never go into the repo (tests and docs use fake ones).
- Work, branches and open items live in `memory/pending.md` (6c) and `memory/observatory-corners-plan.md`.

## 8. Zones as a layer of highlighted places in the Observatory (Marcos, 2026-10-24; idea only, not a task)

- **Thought:** the Zones section is a fixed catalogue (about 200 curated points with their own daily climate, score and sheet), while the Observatory reaches any coordinate in Catalonia through the same score v2 and the ~423 stored cells, and corners («Mis rincones») already cover «my zones» for each user. The two overlap more and more; the Zones section will probably fade out.
- **Direction, if it happens:** the curated zones become a **layer of highlighted places** on the interactive map (one named pin each, opening the same point panel), and «follow a zone» becomes a corner. The Observatory PRD kept curated zones out of the first version on purpose; this would reopen that, later.
- **What Zones still has that the Observatory lacks:** the curated names (the book routes), following a zone, and the «Cerca / Seguidas» ranking (already deprecated in favour of the Top 10 layer, 7f).
- **What keeping both costs:** two sources of truth for the same places (the frontend mock and the database, synchronised by `seed_catalog.py`), a per-zone daily ingest that spends Open-Meteo quota the cells already cover, and the duplicated scoring of the app (phase 2).
- **Suggested stance (no decision yet):** stop investing in Zones (no more curation or new zones) and revisit once the Observatory has the Top 10 layer, a way to follow or be alerted, and a view of named places. No removal is announced: the section can fade as the Observatory improves.
