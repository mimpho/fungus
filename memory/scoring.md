# Scoring Algorithm — Complete Documentation

The final score for each zone combines **weather conditions** and **mycological quality of species in season**.

---

## Phase 1 — Weather Score (`weatherService.js`)

```
overallScore = seasonal(month) × 0.40
             + scoreRainfall(rainfall14d) × 0.21
             + scoreTemperature(temp)     × 0.18
             + scoreHumidity(humidity)    × 0.12
             + scoreDryDays(dryDays)      × 0.09
```

### Monthly seasonal factor (40% of score)
```
Jan:15  Feb:20  Mar:38  Apr:58  May:62
Jun:28  Jul:18  Aug:48  Sep:80  Oct:100  Nov:88  Dec:42
```
Reflects actual activity of gastronomic species (Boletus, Cantharellus, Tuber…).
In February the theoretical maximum score is ~68. In October it can reach 100.

### scoreTemperature (18%) — optimal 10-18°C
| Range | Score |
|---|---|
| < 0°C | 0 |
| 0-2°C | temp × 10 |
| 2-8°C | 20 + (temp-2) × 8.3 |
| 8-18°C | 70 + (1 - \|temp-13\| / 8) × 30 |
| 18-22°C | 85 - (temp-18) × 12.5 |
| 22-28°C | 35 - (temp-22) × 5.8 |
| > 28°C | 0 |

### scoreRainfall (21%) — optimal 40-90mm in 14 days
| Range | Score |
|---|---|
| < 5mm | mm × 2 |
| 5-20mm | 10 + (mm-5) × 3.3 |
| 20-40mm | 60 + (mm-20) × 1.5 |
| 40-90mm | 100 |
| 90-130mm | 100 - (mm-90) × 1.5 |
| 130-180mm | 40 - (mm-130) × 0.8 |
| > 180mm | 0 |

### scoreHumidity (12%) — optimal 75-95%
| Range | Score |
|---|---|
| < 40% | 0 |
| 40-60% | (pct-40) × 2.5 |
| 60-75% | 50 + (pct-60) × 3.3 |
| 75-95% | 100 |
| > 95% | 100 - (pct-95) × 5 |

### scoreDryDays (9%) — optimal 2-6 recent dry days
| Range | Score |
|---|---|
| 0 days | 55 |
| 1-6 days | 55 + days × 7.5 |
| 7-10 days | 100 - (days-6) × 12.5 |
| 11-14 days | 50 - (days-10) × 12.5 |
| > 14 days | 0 |

---

## Phase 2 — Species Modifier (`helpers.jsx → applySpeciesModifier`)

**Applied in the hook after reading the cache. Does not affect `weatherService.js` or the cache.**

### Edibility weights (EDIBILITY_SCORE)
```
excellent   → 100   (Boletus edulis, Cantharellus cibarius, Tuber… — the reason for the trip)
good        →  20   (Truffle bianchetto, Marzuelo, Oyster mushroom… — interesting, not the goal)
edible      →   5   (Hypholoma, Auriscalpium… — exist but don't justify the outing)
caution     →   0   (not suitable for general consumption)
toxic       →   0
deadly      →   0
```

**Design decision:** the huge jump between `excellent` (100) and `good` (20) is intentional. The goal is to reflect the real gastronomic value of the outing, where only excellent specimens make the trip worthwhile.

### SQS Calculation (Species Quality Score)
1. Filter species that match `forestTypes.includes(zone.forestType)` AND `fruitingMonths.includes(currentMonth)`
2. If no matches → `sqs = null` (no adjustment, weather score unchanged)
3. If matches exist → `sqs = average(EDIBILITY_SCORE[edibility])` of found species

### Application
```
// Only toxic/deadly:
if (allToxic) → overallScore = 0

// With species data:
adjustedScore = round(overallScore × 0.60 + sqs × 0.40)

// No species in season for this zone/month:
adjustedScore = overallScore (unchanged)
```

### Example — Pinar de Valsaín in February
Species in season for `pinar` in month 2:
- Truffle bianchetto → `good` → 20
- March mushroom (Marzuelo) → `good` → 20
- Pine Hypholoma → `edible` → 5
- Common Auriscalpium → `edible` → 5
- Fir cone fungus → `edible` → 5
- Sulfur shelf → `toxic` → 0

SQS = (20+20+5+5+5+0) / 6 ≈ **9**
Weather score example = 47
Final score = 47×0.60 + 9×0.40 ≈ **32/100**

### Example — Oak forest zone in October with Boletus + Truffle
SQS → 100 (all excellent), weather score = 90
Final score = 90×0.60 + 100×0.40 = **94/100**

---

## UI Score Thermometer (`getScoreColor`)

| Score | Color | Label |
|---|---|---|
| ≥ 85 | emerald-400 | Excellent |
| ≥ 70 | bar / coffee-light | Very good |
| ≥ 55 | amber-500 / amber-400 | Good |
| < 55 | red-500 / red-400 | Regular |

---

## Data returned by hook (post-modifier)

```js
{
  temperature,    // °C
  soilTemp,       // °C
  rainfall14d,    // mm (14 days)
  humidity,       // %
  wind,           // km/h
  dryDays,        // days <1mm in last 7
  overallScore,   // 0-100 (already adjusted by species)
  speciesScore,   // SQS 0-100 (undefined if sqs=null)
  scores: {
    temperatura, precipitacion, humedad, diasSecos, estacional
  }
}
```
