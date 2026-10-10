# Technical plan — Observatory, phase 1 (`epic/observatory`)

> Companion of `memory/observatory-prd.md`. Scenarios are informal Gherkin: they are not run by a BDD tool. Each scenario maps 1:1 to a pytest test (backend) or to a front test / manual QA check, with the same name.
> Scenarios assume the **proposed answers** of the PRD open questions; the ones that depend on a pending answer say so (`[OQ-n]`).
> Last updated: 2026-10-10

---

## Stack decisions

- **Scoring v2 is a pure Python module** (`backend/app/services/scoring_v2.py`), no DB access. Input: list of daily rows (date, tmax, tmin, tavg, soil, rain, humidity, wind) ordered by date, the zone altitude and optional species parameters. Output: one result per day of the requested window.
- **Reference implementation**: `v2Series` in the Observatory prototype (design canvas). Constants: `cap 60, et 0.22, wind 25, surv 0.25, shade 0.5, intercept 2, actFull 40, warmAct 35`; season bands `sub ≥ 1.500 m`, `mon ≥ 900 m`, `low`.
- **Rounding parity**: the prototype uses JS `Math.round` (half up). Python's `round()` is half-to-even, so use `math.floor(x + 0.5)` for the score and factors.
- **v2 is computed on the fly** for series, past dates and species `[OQ-1]`, with an in-process cache keyed by `(zone_id, last climate date, species_id | model, window)`. `scores_cache` holds only today: `score_oi` is the current model's score with a `model_version` column, and `score_detail` is keyed by version (`v1`, `v2`, later `v3`), so a new model never renames columns `[OQ-2]`.
- **Logic in the backend, text in the front** `[OQ-10]`: the API returns codes and numbers; sentences are built with `src/data/i18n.js` (ES/CA/EN).
- **Freemium-ready, all free for now** `[OQ-4]`, kept light: each widget is fed by its own endpoint or response section, and limits that may become paid go through one backend access check that today allows everything. Where the free/premium cut falls is not decided and will be revisited; no locked states are built now.
- **Test fixtures**: `climate_history` exports (JSON) for zone-003, zone-201, zone-030, zone-202 from 2026-04-01 to 2026-10-06, plus zone-030 for Sep 2025 (cep frost case), under `backend/tests/fixtures/climate/`.

## API endpoints (`feat/observatory-api`)

All under `/api/v1/observatory`, no auth required `[OQ-4]`; `species` is optional everywhere (absent = generic model).

| Method | Path | Returns |
|---|---|---|
| GET | `/zones/{zone_id}/series?to=&days=&species=&compare_years=` | Daily rows of the window: climate, v1, v2 + factors, events (triggers and brakes) |
| GET | `/zones/{zone_id}/snapshot?date=&species=` | Thermometer: v2, band, limiting factor, key facts, factors, rains on the way, v1 |
| GET | `/zones/{zone_id}/species?date=` | Compatible species with v2, grade, conditions and best window; list for «¿Qué seta buscas?» |
| GET | `/zones/{zone_id}/calendar?date=&species=` | Last 7 computed days + 35 estimated days, best day, days ≥ 55 |

## Branches

| # | Branch | Depends on |
|---|---|---|
| 1 | `feat/observatory-scoring-v2` | OQ-5 measured: 100 days are enough |
| 2 | `feat/observatory-bands-elevation` | Goes before the switch so the zone card gets the five bands with v2 |
| 3 | `feat/observatory-ingest-v2` | 1, 2. Switches `score_oi` to v2 `[OQ-2]` |
| 4 | `feat/observatory-forecast` | 3. Same files as the ingest; the API's estimates are born with the forecast `[OQ-3]` |
| 5 | `feat/observatory-api` | 1, 4 |
| 6 | `feat/observatory-page` | 5 |

Section numbers below are not the execution order; the table above is.

---

## 1. `feat/observatory-scoring-v2`

```gherkin
Feature: Scoring v2, generic model

  Scenario Outline: reproduces the reference cases of 2026-10-06
    Given the climate rows of <zone> from 2026-04-01 to 2026-10-06
    When I compute v2 for 2026-10-06
    Then the score is <v2> ±1
    And the factors are A <A>, H <H>, T <T>, S <S>, D <D>, C <C>, F <F>, B <B> (±1 on 0–100 values)
    And the zone state is <state>
    Examples:
      | zone     | el   | v2 | A  | H   | T  | S  | D   | C    | F    | B   | state   |
      | zone-003 | 980  | 49 | 65 | 100 | 70 | 96 | 100 | 1.00 | 1.00 | 1.1 | warm    |
      | zone-201 | 1840 | 7  | 9  | 92  | 89 | 72 | 100 | 1.00 | 1.00 | 1.1 | cold    |
      | zone-030 | 1885 | 16 | 21 | 100 | 84 | 72 | 100 | 1.00 | 1.00 | 1.1 | warm    |
      | zone-202 | 1700 | 20 | 23 | 100 | 95 | 72 | 100 | 1.00 | 1.00 | 1.1 | warm    |

  Scenario Outline: reproduces the reference cases of 2026-09-20
    Given the climate rows of <zone> from 2026-04-01 to 2026-09-20
    Then v2 for 2026-09-20 is <v2> ±1
    Examples:
      | zone | zone-003 | zone-201 | zone-030 | zone-202 |
      | v2   | 0        | 10       | 31       | 37       |

  Scenario: the 100-day window gives the same result as the 1 April warm-up   [OQ-5]
    Given the four reference zones
    When I compute v2 for 2026-10-06 with 100 days and with rows since 2026-04-01
    Then both results differ by at most 1
    # If this fails, the ingest and the API use 190 days instead of 100.

  Scenario: recent rain does not score in a cold zone
    Given a cold zone (no activation ≥ 35 in the previous 21 days)
    And a rain of 30 mm 11 days ago and no other rain
    Then the activation is 0

  Scenario: recent rain does not score in a warm zone
    Given a warm zone and a rain of 30 mm 5 days ago and no other rain
    Then that rain adds 0 to the activation

  Scenario: the fruiting curve peaks on day 21 (cold) and day 12 (warm)
    Then curve(21, cold) = 1, curve(12, cold) = 0, curve(35, cold) = 0
    And curve(12, warm) = 1, curve(6, warm) = 0, curve(32, warm) = 0

  Scenario: rain under the interception threshold counts nothing
    Given every day with 2 mm of rain or less
    Then the activation is 0

  Scenario: activation is capped at 100
    Given 200 mm of rain 21 days ago with the shaded bucket always moist
    Then the activation is 100

  Scenario: rain stops counting while the shaded soil is dry
    Given a rain 21 days ago
    And the shaded bucket below 15 mm (25 % of 60) on half of the days since
    Then that rain counts at half weight

  Scenario: soil water balance
    Then both buckets start at 18 mm (30 % of 60) and never exceed 60 mm or go below 0
    And the shaded bucket evaporates half as much as the sunny one
    And H is the mean of both buckets over 60

  Scenario Outline: season by altitude on 2026-10-06
    Then S is <S> for a zone at <el> m
    Examples:
      | el   | S    |
      | 980  | 0.96 |
      | 1500 | 0.72 |
      | 1499 | 0.96 |
      | 899  | 0.90 |
    # 1.500 and 900 belong to the upper band.

  Scenario: cold soil cancels the soil part of temperature
    Given a 7-day mean soil temperature below 2 °C
    Then T is 0.65 × the air bell only

  Scenario: drying
    Given 3 of the last 5 days with humidity below 55 %
    Then D is 0.76
    Given all 5 days dry, or windy (≥ 20 km/h) with humidity below 70 %
    Then D is 0.6 (floor)

  Scenario: heat
    Given maxima of 28 °C on 4 of the last 10 days and ≤ 25 °C on the rest
    Then C is 0.64
    And C never goes below 0.6

  Scenario: frost fades in about 5 days
    Given a minimum of −1 °C today and no other frost in 7 days
    Then F is 0.75
    Given the same frost 5 days ago
    Then F is about 0.97
    Given a minimum of −3 °C today
    Then F is 0.60
    And with several frosts the strongest effect wins

  Scenario: temperature drop after rain (experimental bonus)
    Given a day with 10 mm or more 7 to 28 days ago
    And within the 3 following days the maximum dropped 6 °C or more from the 2 days before
    Then B is 1.1
    Given the same drop after a 9 mm day, or after a rain 30 days ago
    Then B is 1

  Scenario: no activation means no score
    Given activation 0 and every other factor at its best
    Then v2 is 0

  Scenario: the score is capped at 100

  Scenario: rains on the way, La Molina on 2026-10-06
    Given zone-201 on 2026-10-06 (cold)
    Then there are 3 pending rain runs
    And the largest is 3–4 Oct, 26.6 mm, starting on 2026-10-18 with its peak on 2026-10-25

  Scenario: rains on the way, Montseny on 2026-10-06
    Given zone-003 on 2026-10-06 (warm)
    Then the DANA of 2–5 Oct starts on 2026-10-13 with its peak on 2026-10-17

  Scenario: a rain run needs 5 mm in total
    Given consecutive days of 2 mm and 2.5 mm and nothing else
    Then there are no pending rains

  Scenario: missing days are filled
    Given one day without a row inside the window
    Then it counts as 0 mm and the mean of its neighbours for the other fields
    And the result is not marked as estimated
    Given 4 or more missing days in the window
    Then the result is marked as estimated

  Scenario: a zone without rows returns no result

  Scenario: every result carries model_version "2.1"

Feature: Scoring v2, per species

  Scenario: species parameters replace the generic bell
    Given a species with tmin 8, topt 14, tmax 20
    Then the air sigma is 7 and the soil sigma is 8, centred on 14 °C

  Scenario: outside the species' months the season counts 30 %
    Given a species fruiting in Sep–Nov and a date in July
    Then S is 0.3 × the season curve of the zone

  Scenario: cep in Setcases, frost with cold soil in 2025
    Given zone-030 and Boletus edulis from 2025-09-21 to 2025-09-28
    Then v2 falls progressively and never drops to 0:
      | 21 Sep | 22 Sep | 23 Sep | 24 Sep | 25 Sep | 28 Sep |
      | 58     | 57     | 37     | 24     | 23     | 16     |

```

Done 2026-10-10: 51 tests; the Python port also matches the prototype day by day (1.424 days, generic model and cep, Jul–Oct 2025 and 2026, 0 differences). Rains on the way are computed for every day, not only the last one as in the prototype, so the time machine can show them. The v1 parity scenario moves to the ingest branch, where the v1 inputs are derived from `climate_history`.

## 2. `feat/observatory-ingest-v2`

```gherkin
Feature: Daily ingest makes v2 the main score   [OQ-2]

  Scenario: v1 parity — compute_oi reproduces scores_cache on 2026-10-06
    Then v1 is 58, 75, 76 and 81 for zone-003, zone-201, zone-030 and zone-202

  Scenario: score_oi is the current model, whatever its version
    When the daily ingest computes the scores of a zone
    Then score_oi is the v2 score and scores_cache.model_version is "2.1" (new column, migration)
    And score_detail is keyed by version: score_detail.v2 holds score, factors, state, pending rains and estimated
    And score_detail.v1 holds the v1 score and its factors (pa21, thermal, ripening, seasonal, humidity)

  Scenario: a future model does not change the contract
    Then the API exposes score_oi and model_version, never a column named after a version
    And switching to a new model only changes which version the ingest writes into score_oi

  Scenario: the label follows the five bands
    Then score_label(score_oi) returns Malo, Regular, Bueno, Muy bueno or Excelente with the lower bound inclusive

  Scenario: the ingest reads the window v2 needs
    Then it reads 100 days of climate_history, not 21

  Scenario: a v2 failure does not leave the zone without a score
    Given v2 raises for a zone
    Then the error is logged and alerted, the previous cache row is kept and the ingest continues with the next zone

  Scenario: zones without climate data are skipped without errors

  Scenario: the API contract changes in a controlled way
    Then /zones and /zones/map-scores return score_oi = v2 and the v2 factors
    And the min_score filter works on v2

  Scenario: the zone card and the dashboard show v2
    Then the score, its colour and its label come from v2 and the band helper
    # The card's block shows weather values (temperature, rain, humidity, wind, dry days), not
    # v1 factor scores, so it stays as it is; the v2 factors and their reasons arrive with the
    # Observatory snapshot ("Every condition explains itself").
    And zones are sorted by v2

  Scenario: a low v2 with rain on the way says so
    Given a zone whose v2 is low and that has pending rain runs
    Then the zone list and the card show, next to the score, when the biggest one would start to show ("lluvia del 6 oct, se notará hacia el 20")
    # Check of 2026-10-10 on all 214 zones (data up to 9 Oct): 193 Malo, median v2 1, because the summer
    # was dry and the 3–8 Oct rains are too recent to count; 200 zones have rain on the way, and with no
    # more rain about 55 zones would reach Bueno or better around 23 Oct. Without this line the web would
    # look broken right after a big rain.

Feature: v1/v2 comparison for calibration   [OQ-1]

  Scenario: the script recalculates history without calling Open-Meteo
    When I run scripts/compare_v1_v2.py --from 2024-10-01
    Then it writes one CSV row per zone and day with data: zone, date, v1, v2, factors, state, estimated
    And no HTTP request is made

  Scenario: the script can be limited to one zone and one range, and rerun safely
```

## 3. `feat/observatory-api`

```gherkin
Feature: Daily series

  Scenario: a window ending on a date
    When I GET /observatory/zones/zone-003/series?to=2026-10-04&days=20
    Then I receive 20 consecutive days ending on 2026-10-04
    And each day has climate (tmax, tmin, tavg, soil, rain, humidity, wind), v1, v2 and v2 factors
    And the response says the zone's last date with data

  Scenario: defaults
    When I omit "to" and "days"
    Then the window ends on the last date with data and has 20 days

  Scenario: window limits
    Then days 7 and 180 are accepted, and 6 or 181 return 422

  Scenario: a date after the last data
    When "to" is later than the last date with data
    Then the window ends on the last date with data and the response says so

  Scenario: a date before the zone's history
    Then the days without data come back with null climate and no score

  Scenario: per species
    When I add species=<id>
    Then each day also has v2 for that species

  Scenario: unknown or inactive zone → 404; unknown species → 404

  Scenario: previous years   [OQ-12]
    When I add compare_years=2
    Then I receive v2 and rain for the same dates of the 2 previous years where data exist
    And years without data are listed as unavailable

  Scenario: triggers and brakes in the window   [OQ-9]
    Then the response lists events numbered in date order:
      a rain run of days ≥ 10 mm totalling ≥ 20 mm is a trigger, with its expected date (+21 days)
      and whether the maximum dropped ≥ 8 °C;
      3 or more days in a row with humidity < 55 % is a brake;
      each day with a minimum below 0 °C is a frost brake
    And the lowest minimum of the window

  Scenario: performance
    Then a 180-day window with a species answers in under 500 ms p95

Feature: Thermometer snapshot

  Scenario Outline: band of a score (lower bound inclusive)
    Then <score> is <band>
    Examples:
      | score | band      |
      | 29    | Malo      |
      | 30    | Regular   |
      | 54    | Regular   |
      | 55    | Bueno     |
      | 70    | Muy bueno |
      | 85    | Excelente |

  Scenario: limiting factor
    Then it is the lowest of activation, soil moisture, temperature and drying
    And activation wins a tie

  Scenario: key facts
    Then the snapshot has the zone state, water in the soil (mm of 60) and the 7-day soil temperature with last night's minimum

  Scenario: v1 as reference
    Then the snapshot includes v1 for the same date

  Scenario: the snapshot follows the date and the species
    When I ask for date=2026-09-20&species=<id>
    Then every value is computed at 2026-09-20 for that species

Feature: The explanation covers the grey areas
  # A zone is not uniform (moisture, sun, temperature and wind drying vary within it), and the
  # model averages it. The number says how much the weather helps; the text says where it still
  # makes sense to look. Hard to put in numbers, easy to put in words. Agreed 2026-10-10.

  Scenario: a low score is not "nothing"
    Given a v2 below 30 with some activation (activation > 0)
    Then the explanation says that, if anything comes up, it will be in very specific spots
    And it never says there are no mushrooms

  Scenario: no conditions at all
    Given activation 0 and no rain on the way
    Then the explanation says the weather does not help in this zone right now

Feature: Every condition explains itself
  # Principle (2026-10-10): the number is never left alone. Every condition that pushes it up or
  # down, not only the main limit, comes with a short reason and, when it helps, where to look.
  # Messages help to understand AND to search. The backend returns codes and values; the front
  # writes the sentences (ES/CA/EN).

  Scenario: the snapshot lists every active condition
    When I ask for a snapshot
    Then it returns a list of conditions, each with code, sign (+ / −), values and an optional hint code
    And they are sorted: what limits most first, then the other negatives, positives last

  Scenario Outline: conditions, their signal and their hint
    Given <signal>
    Then the snapshot has the condition <code> with sign <sign> and the hint <hint>
    Examples:
      | code             | sign | signal                                                            | hint (ES, front)                                       |
      | rain_on_the_way  | +    | a pending rain run                                                | when it would start to show and peak                   |
      | warm_zone        | +    | warm = true                                                       | responds 1–2 weeks after rain instead of ~3            |
      | temperature_drop | +    | B = 1.1                                                           | the drop after the rain usually triggers fruiting      |
      | dry_soil         | −    | soil moisture < 50                                                | umbrías, fondos de valle y junto al agua               |
      | drying_wind      | −    | D < 1                                                             | zonas resguardadas del viento                          |
      | heat             | −    | C < 1                                                             | orientaciones norte, cotas altas, bajo arbolado        |
      | too_warm         | −    | 20-day air mean above the optimum and temperature < 50            | orientaciones norte y cotas más altas                  |
      | too_cold         | −    | 20-day air mean below the optimum and temperature < 50            | solanas y cotas más bajas                              |
      | cold_soil        | −    | 7-day soil mean < 2 °C                                            | solanas y cotas más bajas                              |
      | frost            | −    | F < 1 (with its date and minimum)                                 | zonas protegidas bajo arbolado; mejora en unos 5 días  |
      | cold_snap        | −    | max or mean dropped ≥ 8 °C in 3 days to a minimum < 3 °C, no frost | puede cortar la salida; cotas bajas y solanas         |
      | late_season      | −    | S < 0.8 after the band's peak                                     | bajar de cota                                          |
      | out_of_season    | −    | species outside its months                                        | (species only) its months                              |
      | estimated        | −    | estimated = true                                                  | (transparency) missing data in the last weeks          |
    # cold_snap has no effect on the number in v2.1 (only frost does): message only, experimental.
    # Candidate for v2.2 together with micro-sites.

  Scenario: hints balance moisture and light
    Then shaded-spot hints never point to closed, dark woodland ("umbrías, pero no bosque cerrado")

  Scenario: a positive and a negative can coexist
    Given rain on the way and a recent frost
    Then both conditions are listed, and the sentence says the rain will help once the frost effect fades

Feature: Species for a date

  Scenario: only compatible species   [OQ-8]
    Then a species appears only if it fits the zone's forest type, its month and its altitude range (with the 150 m margin)

  Scenario: list for «¿Qué seta buscas?»
    Then the excelente species come in a separate list sorted by today's v2 for each species, highest first

  Scenario Outline: grade
    Then a species with v2 <v2> is <grade>
    Examples:
      | v2 | grade         |
      | 70 | Probable      |
      | 55 | Posible       |
      | 25 | Temprano      |
      | 24 | Poco probable |

  Scenario: conditions
    Then each species lists forest, altitude, season, temperature (7-day mean vs its range), rain (21 days vs its minimum and optimum) and cycle, each as met, not met or pending

  Scenario: best window
    Given a pending rain run
    Then the best window goes from its start to its peak + 7 days, cut at the end of the species' last month
    And if the season ends before the start, the species says so

  Scenario: followed species first, filters edible / not edible / followed
    Given a logged-in user who follows a species
    Then it comes first
    And without login there are no followed species and nothing fails

Feature: Calendar estimate without forecast

  Scenario: 7 computed days and 35 estimated
    Then the last 7 days come from real data and the next 35 are estimated
    And estimated days assume no rain and repeat the last week's mean temperatures, humidity (max 85 %) and wind
    And every estimated day is flagged "estimate without forecast"

  Scenario: summary
    Then it gives the best day and the number of days at 55 or more
```

## 4. `feat/observatory-bands-elevation`

```gherkin
Feature: Five-band scale in the design system

  Scenario: the --mid token exists in light and dark themes
  Scenario: a single band helper maps a score to band, label and token, used by the Observatory, the zone list and card, the dashboard and the map

Feature: Zone altitude as a range   [OQ-6, OQ-7]

  Scenario: migration
    Then zones gets nullable elevation_min_m and elevation_max_m and elevation_m is untouched

  Scenario: ranges are computed, not typed   (2026-10-10)
    When I run scripts/zone_elevation_ranges.py on a zone
    Then it samples a grid of points around the zone with the Open-Meteo Elevation API
    And proposes the central band of elevations (percentiles), capped at the treeline for pinar
    And it only writes with --apply; the dry run prints the proposal
    And it stays within the Open-Meteo daily budget (≤ 2 calls per zone)
    # First run: Setcases, La Molina and Costabona, compared with field knowledge
    # (Setcases ~1.300–1.900, La Molina ~1.500–1.800, Costabona ~1.400); then all zones.

  Scenario: every zone value has a documented source
    Then docs/content-guide.md lists each zone field, static or dynamic, its source, how it is obtained and how often it is refreshed

  Scenario: a zone without range uses its point
    Given a zone with only elevation_m 1.000
    Then its range is 1.000–1.000

  Scenario: overlap
    Given Setcases 1.300–1.900 and a species 800–1.800
    Then the species is compatible and the hint is "busca entre 1.300 y 1.800 m"

  Scenario: within the margin
    Given a zone 1.885–1.885 and a species with its top at 1.800
    Then the species is "al límite" and its v2 is multiplied by 0.85

  Scenario: beyond the margin
    Given a zone 1.885–1.885 and a species with its top at 1.700
    Then the species is not compatible

  Scenario: a species without altitude data is not filtered by altitude

  Scenario: Setcases gains excellent species
    Then Setcases has 12 compatible excelente species instead of 2, as in the prototype
```

## 5. `feat/observatory-page` (headlines; detailed when the branch starts)

- Navigation: Observatorio in the header; Perfil becomes an avatar menu (Perfil, Generador de imágenes for admins, Salir); the Público/Admin toggle in Perfil, `isAdminView` and the admin header items go away (`/admin/gallery` already redirects); icons only between `md` and `lg`; «Ver en el Observatorio» in the zone card `[OQ-13]`.
- Start: last observed zone; first visit → first followed zone or default zone.
- Zone search: followed zones when empty, results when typing, the heart toggles without the list jumping, closes on pick / Esc / outside; above the title at phone width.
- «¿Qué seta buscas?»: pinned block, list without the chosen one, ✕ back to «Cualquier seta», labels on the widgets that follow the species.
- Thermometer: composition, sentence, key facts, "Ver por qué", rains on the way.
- Chart: five tabs, layers and legend, timeline (drag, stretch 7–180, click to centre, keyboard, «Volver a hoy»), data table, Momento estimate with dotted line, labels never overlap.
- Mushrooms fruiting, triggers and brakes, calendar.
- URL: `zona`, `hasta`, `dias`, `vista`, `capas`, `seta` `[OQ-11]`, `setas`; round-trip, back button, invalid values fall back to defaults.
- Phone width: one column, no horizontal scroll.
- ES/CA/EN.

---

## 6. `feat/observatory-forecast` (headlines; detailed when the branch starts)   [OQ-3]

- The daily ingest asks Open-Meteo for 16 days with the same call it makes today and stores them per zone and target date.
- Momento and the calendar use the forecast for the first 16 days and "no rain" after that; the label changes from "estimación sin previsión" to "con previsión".
- «Previsión en la zona» widget: 7 cards (icon, max/min, mm and probability, warnings: frost, heat > 25 °C, useful rain ≥ 10 mm), days 8–16 as a compact trend row.
- No extra Open-Meteo calls; the number of daily calls stays the same.
- Calendar and Momento estimate without forecast stay as the fallback when a zone has no stored forecast.

## Risks

| Risk | Mitigation |
|---|---|
| The prototype and Python disagree by rounding | Half-up rounding helper; compare factor by factor, not only the final score |
| The activation loop is O(days × 30 × 35) per species | Prefix sums of "shaded bucket moist" days; measure in branch 3 against the 500 ms target |
| 100-day window changes H for some zones | Measured in branch 1 (scenario above) before the ingest is touched |
| `model_version`: the design document says "2.0" but the formula is v2.1 | Use "2.1" |
| Fixtures depend on production data that may be corrected later (backfill) | Export them once and commit them; they are the contract |
| Thermometer and grade thresholds were tuned for v1 | Calibration, after the field-trip log; out of the epic's DoD |
