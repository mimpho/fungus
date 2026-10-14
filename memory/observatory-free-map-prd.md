# PRD — Observatory: free map by coordinates, cells and saved points

> Repo copy of the Claude Docs document "PRD — Observatorio: mapa libre por coordenadas, celdas y puntos marcados" (the document is the source of truth). Last updated: 2026-10-14.
> Complements `memory/observatory-prd.md` (phase 1, zones) and `memory/observatory-plan.md` (technical plan; section "Update 2026-10-14").

## Summary and vision

The Observatory stops being limited to the stored zones: with one click on the map of Catalonia, a logged-in user sees the same widgets for any point, computed from Open-Meteo data. The current zones become saved points: coordinates with a name and notes.

Fungus is conceived as an informative, almost academic product, meant for learning about mycology. Esporas.io, the app used as a contrast, is more practical and foraging-oriented, with a catalogue of about 10 mushrooms. The goal is not to compete with it but to occupy a different niche.

This document collects the proposal, the decisions taken up to 14 October 2026, the results of the API probes and a technical annex. With these decisions, development of `feat/observatory-api` can resume.

## Decisions taken

| Topic | Decision |
| --- | --- |
| Scope | Catalonia only for now. |
| Access | The Observatory requires a logged-in session. |
| Input | Click on the map. A context menu shows the nearest toponym and the "Observe this zone" button before the widgets appear. |
| Data | Open-Meteo is the source of truth. The database is a rebuildable cache and the grid cell is the base unit. |
| Saved point | Coordinates with a name, and little else for now: altitude, forest type and notes. Points with rich book information are left for a future phase. |
| Current zones | The 40 curated zones stay in the Zones section unchanged and are not shown in Observatory v1. They will become saved points once their coordinates are reviewed. The ~150 active non-curated zones are deactivated, reversibly. |
| Saving a point | The proposed name is the nearest toponym. It can be changed when saving and afterwards, and there is a notes field. |
| Forest type | Macrotype (conifer, broadleaf, sclerophyll) and exclusion of urban and agricultural land from the ICGC land cover, queried at the clicked point. The species present, with their percentage within ~300 m, come from CREAF's Mapa de cobertes del sòl de Catalunya (MCSC-4, 2009), preprocessed into a local grid; the index is computed for each type present above 10 %. |
| Free map (v1) | The Observatory shows coordinate-based results only. Points of interest and curated zones do not appear in it. |
| Zones section | Stays as it is, with follows and ranking. |
| Cells | In v1 they are loaded on demand, on someone's first click, without enumerating the grid. |
| Index per type | If several forest types are above 10 % around the point, the index is computed for each and all are shown, each with its percentage. |

## Problem

Today the Observatory only works with the zones registered in the database, and that limits both search and maps.

- **Search:** it only returns the zones being followed. Someone who wants to look at another place cannot.
- **Heat map:** it is filled only from saved points, so it is imprecise between zones.
- **What the own database gives:** being able to work with the data without constant requests. That benefit stays, but it does not justify being the only route.

By contrast, an app that accepts any location offers real-time temperature, accumulated rain and fruiting probability, which is much richer for the person consulting it.

## Proposal

Three pieces that coexist, each with a different role.

| Piece | What it is | Where the data comes from | What it brings |
| --- | --- | --- | --- |
| Map click | Any point in Catalonia is mapped to a cell of the Open-Meteo grid and shows the Observatory widgets | History and forecast of the cell, with altitude correction | Looking at any place with no zone limit and enough history for the calculation |
| Cells | Irregular Open-Meteo grid, ~84 km² per cell. About 380 in Catalonia and 200-250 with forest | Cache in the database, rebuildable from Open-Meteo | Heat map and fast responses without repeating requests |
| Saved points | Saved coordinates with a name and notes, either a user's own or featured by Fungus | Metadata in the database. The climate comes from its cell | Following a place, naming it and coming back to it |

Any point has history, because Open-Meteo provides it: the cell is rebuilt with about 280 days (180 of timeline and 100 of calculation warm-up). What a saved point adds is not more history but a name, notes and following.

## User experience

The user can look at any place, not just the ones Fungus has prepared.

1. **Log in.** The Observatory is not public.
2. **Click on the map.** A context menu shows the nearest toponym and the "Observe this zone" button. Coordinates can also be typed in.
3. **See the zone.** Temperature, soil, accumulated rain, forecast and calendar, computed from the cell data, together with the forest species present around the point and their percentage. The user is told that rain is a cell value, of about 10 km.
4. **Save the point.** The proposed name is the nearest toponym, editable at that moment and later, with a notes field.
5. **Explore the heat map.** A general view of the territory, over forest zones only, read from the cell cache. Later, also by tree type, from the same species grid.

The current zones do not disappear: the Zones section stays as it is, with follows and ranking. Observatory v1 works only with coordinates and shows no points of interest or curated zones. The 40 curated ones, which come from the author's book, may become saved points once their coordinates are reviewed.

Still to define: how to show the last 5 to 8 days, which are provisional. They come from the forecast and may differ by about 0.5 °C from the final archive, which arrives with about 5 days of delay.

## Product principles and business model

Fungus is not born to make a profit and must not cost its maintainer money out of pocket.

- **No profit for now.** It is not the stage to decide how to monetise. That would come later, only if the product proves good.
- **Give back to the forest.** If a business model ever existed, the underlying intention is to put the earnings into something related to nature, mycology or not, to close the circle. There is no concrete plan and none is to be decided now.
- **Controlled cost.** Real-time lookup of any point implies a cost per request. If usage generates no income, that cost must be bounded by design.
- **No built-in limits.** The aim is not to build something that is born limited, even if the full scale infrastructure is not set up today.

The scale context is real: the Facebook page "Bullets", created by the author, has about 70,000 users. If the Observatory is promoted there, traffic can spike at once.

## Risks and open questions

The main risk is cost and service outage if traffic spikes; the rest are decisions not yet taken.

- **Traffic and cost.** Open-Meteo's free plan is for non-commercial use only and has a daily limit. With cached cells and mandatory login, spend should depend on how many cells are refreshed, not on how many people look. A viral spike remains the case to watch.
- **Rain at cell scale.** The cell is about 8 × 11 km and rain is not altitude-corrected. In rugged terrain the value can be far from the point (at Santa Fe the mean altitude of the cell is 667 m and that of the point 1,380 m).
- **Forest type.** Open-Meteo does not provide it. Without it there is no basis for the species widgets. The ICGC land cover gives the forest macrotype and works in the probe. The species comes from CREAF's MCSC-4 (per-sheet shapefile, level 5), which distinguishes holm oak, cork oak, beech, oak woods and several pine woods, but it is from 2009 and must be crossed with the 2024 land cover so that species are not shown where there is no longer forest. The MFE WMS service is not usable.
- **Seam between forecast and archive.** The last days come from the forecast and differ from the archive. They must be flagged as provisional and replaced by a job.
- **Terms of use.** The ICGC land cover is licensed CC BY 4.0, with attribution. The ICGC reverse geocoder answers without authentication but declares no licence or limits. The CREAF MCSC-4 only says it is free to use, with no specific licence: it must be confirmed with CREAF or ICGC before publishing, above all for a visible heat map.
- **Grid.** It is irregular, so in v1 cells are not enumerated: they are loaded on demand on someone's first click. Enumeration and the forest mask will be needed for the heat map.
- **Reliability of old zones.** The coordinates of about 150 non-curated zones are imprecise (median altitude error 229 m). That is why they are deactivated.

## Technical annex

All the computation can be fed from Open-Meteo with a new adapter, but the paid plan needed for commercial use is Professional, not Standard, because only the former includes the historical API.

### Open-Meteo APIs that would be used

| Need | API | Note |
| --- | --- | --- |
| Place name to coordinates | Open-Meteo Geocoding | Searches by name only, mostly localities. Does not serve the map click |
| Nearest toponym to given coordinates | ICGC reverse geocoder | Layers `topo1` (population centres) and `topo2` (other toponyms), default radius 1 km. Catalonia only |
| Recent window and earlier years | Historical Weather | Data since 1940, with about 5 days of delay. On paid plans it requires Professional |
| Last days and forecast | Forecast | Up to 16 days counting today. `past_days` goes up to 92, but only about 73 days carry data |

### Limits and cost

| | Free | Standard | Professional |
| --- | --- | --- | --- |
| Commercial use | No | Yes | Yes |
| Daily limit | 10,000 calls | Unlimited | Unlimited |
| Monthly limit | 300,000 calls | 1 million | 5 million |
| Historical Weather API | Yes | No | Yes |

The free plan also limits to 5,000 calls per hour and 600 per minute. A request with more than 10 variables, or more than 14 days, counts as several calls: the weight is roughly the days divided by 14. With about 380 cells, the first load of 280 days weighs on the order of 7,600 calls, less than one day of free quota. With about 740 days, to compare with the previous year, it would be 13,000 to 16,000, about two days. These are estimates.

The Standard price is 29 dollars a month according to an Open-Meteo subscriptions page. The open pricing page shows no amounts and the Professional price is not verified.

### Probes run against Open-Meteo

Six probes were run between 11 and 12 October 2026 with scripts in `backend/scripts`.

| Probe | Result |
| --- | --- |
| Data window | `past_days=92` brings only about 73 days with data, and the oldest come back empty. The window is built from the archive plus the last days of forecast |
| Grid | Irregular, about 7.8 × 10.8 km. `cell_selection=land` may pick a neighbouring cell of similar altitude |
| Altitude | Temperature and soil drop 0.65 °C per 100 m, exactly. Humidity drops 0.13 points per 100 m. Rain and wind are not corrected |
| Corrected cell versus direct query | Temperature comes out right. Rain and wind are limited by the cell scale |
| Forecast/archive seam | Forecast rain is between 0.24 and 2.12 times the archive's depending on the point. The minimum rises 0.5 to 1 °C, soil drops 0.4 to 0.9 °C and humidity drops about 2 points. The best forecast request uses the cell coordinates and the mean cell elevation |
| Audit of the 40 curated zones | What is stored matches the Open-Meteo archive, with bias and error of 0.00. The initial failures were timeouts. In the last 5 days, the stored mean temperature differs by about 0.5 °C on average (between 0.16 and 1.12) and soil by about 0.55 °C (between 0.14 and 0.94) |

The audit only checks that what is stored is consistent for the same coordinates, not that those coordinates are the right ones.

### Forest type and toponym

Open-Meteo does not give the forest type, and the species widgets need it. On 12 October 2026 three public services were probed on 12 points in Catalonia with `probe_geo.py`.

| Need | Service | Probe result |
| --- | --- | --- |
| Forest macrotype and exclusion of urban and agricultural land | [ICGC land cover](https://www.icgc.cat/en/Geoinformation-and-Maps/Online-services-Geoservices/WMS-Land-cover), layer `cobertes_2024`, point query | Works. Returns classes such as dense conifer forest, dense broadleaf forest and dense sclerophyll forest, plus meadows, rock, built-up area and eixample. Distinguishes conifer, broadleaf and sclerophyll, but not the species. Right at Montnegre, Ports, Cadí, Cap de Creus and Vic |
| Dominant species | [Mapa Forestal de España](https://sig.mapama.gob.es/Docs/PDFServicios/MFE.pdf) (MFE25, WMS) | Could not be queried. From Python on the Mac the SSL certificate check for `wms.mapama.gob.es` failed. Two server faults. First, it does not send the FNMT intermediate certificate, which is solved by adding it as trusted. Then, the documented address returns no layers and the wms.aspx variant answers with an internal error. Discarded as a live service. Whether a download of the map exists is still to be confirmed |
| Nearest toponym | [ICGC reverse geocoder](https://openicgc.github.io/geocodificador-doc_en/parametres_invers/) | Works. It answered on all 12 points, in 0.06 to 0.15 s, with a 1 km radius. `topo1` gives centres and neighbourhoods, and `topo2` gives peaks, passes, farmhouses and mountain places, such as Turó de l'Home or Coll Pregon |

Three control points did not match what was expected, most likely because of the test coordinates: Fageda d'en Jordà came out as cropland, Santa Fe as summit rock and the Lleida plain fell inside the city. The last one confirms that urban detection works, but a truly agricultural point is missing. The proposal is to query the land cover at the exact clicked point and store the result, because an 84 km² cell mixes different forests and the value hardly changes. The species comes from another source, described below. The MFE is discarded as a live service.

Check against the 40 curated zones (13 October 2026): the land-cover macrotype was compared with the stored type, at five points of about 150 m. In 22 zones the point falls in forest and in 17 of them (77 %) the macrotype matches the stored one. The 5 discrepancies are mixed or doubtful zones, such as pinewood versus holm oak or oak wood versus pinewood, and it has not been checked which of the two data is right. In the other 18 zones the point falls outside forest: scrub, meadows, rock, cropland, built-up area or road. Most likely it is a problem with the stored coordinates and not with the macrotype, and it forces a review of them before using those zones as saved points.

Proposed rule: if there is no forest at the point, the climate widgets are shown anyway, because they depend on the cell, and the species ones are hidden or warn that there is no forest there.

### Species and composition: CREAF's MCSC-4

On 14 October 2026 the `cobertes_2009` layer of the ICGC WMS was discarded: it returns the same 41-class legend as the 2024 one, with no species. What does work is the per-sheet download of the Mapa de cobertes del sòl de Catalunya, 4th edition (CREAF, 2009, scale 1:5,000), as a shapefile. The MiraMon format (`.mmz`) is proprietary with no free reader, and was discarded.

The attribute table carries in the `C_SIMPLE` field a level-5 code with the species and the canopy density. For example, `bqi20` is holm oak wood with canopy of at least 20 % and `bqi5` is holm oak wood with canopy of 5 to 20 %.

| Code | Class | Macrotype | Source of the meaning |
| --- | --- | --- | --- |
| `bqi` | Alzinar (holm oak) | sclerophyll | Official legend |
| `bqh` | Roureda de roure martinenc | broadleaf | Official legend |
| `bps` | Pineda de pi roig | conifer | Official legend |
| `bpp` | Pineda de pi pinyer | conifer | Official legend |
| `bph` | Pineda de pi blanc | conifer | Official legend |
| `bfs` | Fageda (beech) | broadleaf | Confirmed at Santa Fe |
| `bqs` | Sureda (cork oak) | sclerophyll | Inferred |
| `bqp` | Roureda de roure pènol | broadleaf | Inferred |
| `bcad` | Altres caducifolis | broadleaf | Official legend |
| `bribc` | Bosc caducifoli de ribera | broadleaf | Official legend |

Check with the curated zones that fall in three downloaded sheets (364-2-1, 363-2-1 and 365-1-1), with the composition within a 300 m radius:

| Zone | Stored type | Composition at 300 m |
| --- | --- | --- |
| 233 Fageda de Santa Fe | beech wood | Fageda 95 % |
| 226 Riells i Montseny | holm oak wood | Alzinar 50 %; sureda 47 % |
| 205 Coll de Bordoriol | oak wood | Alzinar 50 %; roure pènol 40 % |
| 003 La Pineda Fosca | oak wood | Alzinar 50 %; pi pinyer 46 % |
| 208 Obagues del Moianès | pinewood | No forest 98 % |

The MCSC-4 distinguishes species, and showing only one is a simplification: in three of the four zones with forest the second species weighs 40 to 50 %. Zone 003 has no oak at all and is called "Pineda", so the stored type is almost certainly a mistake. In 208 the coordinate falls on buildings, as was already known. Five zones is a small sample.

- **Composition, not dominant species.** The widget shows all the species present within a radius of about 300 m of the click, with their percentage, above a 10 % threshold. Radius and threshold are parameters to tune.
- **Index per type.** Decision of 14 October: when several types are above the threshold, the index is computed for each and the card shows them all.
- **Crossing with the 2024 land cover.** The MCSC-4 is from 2009. The species is shown only if the current macrotype does not contradict it, and where there is no longer forest none is shown.
- **Preprocessing.** About 500 sheets. They are converted into a local grid of about 25 m that stores the class of each cell, unaggregated. It resolves the composition around a click, the forest mask and, later, heat maps by tree type.
- **Licence pending.** The MCSC page only says "de lliure utilització". It must be confirmed before publishing. The ICGC land cover is CC BY 4.0.

### Proposed architecture

There is a single data path. Open-Meteo feeds the cell cache, a series provider delivers the series of a cell (or of a stored zone) and everything goes through the same `scoring_v2.py`. Saved points only add name, notes and following. (The diagram of the original document is not included in this copy.)

### Jobs and cache

- **Initial load.** At least 280 days per cell, 180 of timeline and 100 of warm-up. About 740 if the previous year is to be overlaid.
- **Daily job.** Days older than about 6 are requested from the archive, which is the final source. The last 5 to 8 days are requested from the forecast, as provisional, and a job replaces them when the archive arrives. The `source` field of the rows must distinguish both cases; today they all read `open-meteo`.
- **One call per cell.** Open-Meteo does not return a whole region, only specific coordinates or short lists.
- **Forest cells only.** The heat map will be limited to cells with forest, using the land-cover mask. In v1 cells are loaded on demand on the first click, without enumerating the grid. Between 200 and 250 forest cells out of about 380 are estimated.
- **Altitude correction.** Temperature and soil are adjusted with 0.65 °C per 100 m between the cell and the clicked point.
- **What is stored.** Only what cannot be regenerated: saved points, follows, notes, the score results as they were shown and the download date. The history can be rebuilt from Open-Meteo. Saved points go in a new table: user, latitude, longitude, cell, name, notes, altitude and forest composition at the time of saving.
- **Cost protection.** Per-user request limit and a brake when the daily cap is approached. The pending design of `fix/weather-cache` already covers a daily budget and a circuit breaker.

Order of magnitude: about 380 cells in Catalonia, of which 200 to 250 would have forest. These are estimated figures to be checked when the grid is enumerated.

### Impact on current development

- **Reused as is.** `scoring_v2.py` and `zone_projection.py` are pure functions and do not depend on where the data comes from.
- **Changes in `feat/observatory-api`.** A per-cell series provider is introduced, with on-demand loading, and endpoints are queried by latitude and longitude instead of by zone. Responses carry `source: stored|live` and a `zone_id` that may be null.
- **Changes later.** Ingestion, which moves to cells; the Observatory page, with the map and the context menu; and `feat/observatory-forecast`, which must be reviewed.
- **Data.** The 150 active non-curated zones are deactivated. Saved points need a name, coordinates, altitude, forest composition and notes. The index is computed for each forest type present above 10 %.
- **To decide.** The MCSC-4 licence and the preprocessing of its sheets into a local grid, which do not block `feat/observatory-api`.

### Sources

- [Open-Meteo pricing](https://open-meteo.com/en/pricing), opened on 11 Oct 2026
- [Geocoding API](https://open-meteo.com/en/docs/geocoding-api), [Historical Weather API](https://open-meteo.com/en/docs/historical-weather-api) and [Forecast API](https://open-meteo.com/en/docs): only seen in search results, not opened
- [ICGC Geocoder](https://www.icgc.cat/en/Tools-and-viewers/Tools/ICGC-Geocoder) and [reverse geocoder parameters](https://openicgc.github.io/geocodificador-doc_en/parametres_invers/), opened on 12 Oct 2026
- [ICGC Land cover WMS](https://www.icgc.cat/en/Geoinformation-and-Maps/Online-services-Geoservices/WMS-Land-cover) and [MCSC-3 characteristics](https://www.mcsc.creaf.cat/resu_res/CaracteristiquesResultatsMCSC3.pdf), opened on 12 Oct 2026
- [Mapa Forestal de España](https://sig.mapama.gob.es/Docs/PDFServicios/MFE.pdf), opened on 12 Oct 2026
- Probes T1 to T6 run by the author between 11 and 12 October 2026
- [Land cover map of Catalonia (ICGC)](https://www.icgc.cat/en/Geoinformation-and-Maps/Maps/Land-cover-map-Catalonia), CC BY 4.0, opened on 14 Oct 2026
- [MCSC-4 shapefile download (CREAF)](https://www.mcsc.creaf.cat/map-mcscshp4.htm) and [MCSC-4 legend](https://www.mcsc.creaf.cat/textos/LlegendaMCSC4_SIOSE2_CATALA.pdf), opened on 14 Oct 2026
- Tests with `mcsc_lookup.py` on three sheets, on 14 October 2026
