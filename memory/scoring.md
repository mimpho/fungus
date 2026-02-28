# Algoritmo de Scoring — Documentación Completa

El score final de cada zona combina **condiciones meteorológicas** y **calidad micológica de las especies en temporada**.

---

## Fase 1 — Score Meteorológico (`weatherService.js`)

```
overallScore = seasonal(mes) × 0.40
             + scoreRainfall(rainfall14d) × 0.21
             + scoreTemperature(temp)     × 0.18
             + scoreHumidity(humidity)    × 0.12
             + scoreDryDays(dryDays)      × 0.09
```

### Factor estacional mensual (40% del score)
```
Ene:15  Feb:20  Mar:38  Abr:58  May:62
Jun:28  Jul:18  Ago:48  Sep:80  Oct:100  Nov:88  Dic:42
```
Refleja la actividad real de especies gastronómicas (Boletus, Cantharellus, Tuber…).
En febrero el score teórico máximo es ~68. En octubre puede llegar a 100.

### scoreTemperature (18%) — óptimo 10-18°C
| Rango | Score |
|---|---|
| < 0°C | 0 |
| 0-2°C | temp × 10 |
| 2-8°C | 20 + (temp-2) × 8.3 |
| 8-18°C | 70 + (1 - \|temp-13\| / 8) × 30 |
| 18-22°C | 85 - (temp-18) × 12.5 |
| 22-28°C | 35 - (temp-22) × 5.8 |
| > 28°C | 0 |

### scoreRainfall (21%) — óptimo 40-90mm en 14 días
| Rango | Score |
|---|---|
| < 5mm | mm × 2 |
| 5-20mm | 10 + (mm-5) × 3.3 |
| 20-40mm | 60 + (mm-20) × 1.5 |
| 40-90mm | 100 |
| 90-130mm | 100 - (mm-90) × 1.5 |
| 130-180mm | 40 - (mm-130) × 0.8 |
| > 180mm | 0 |

### scoreHumidity (12%) — óptimo 75-95%
| Rango | Score |
|---|---|
| < 40% | 0 |
| 40-60% | (pct-40) × 2.5 |
| 60-75% | 50 + (pct-60) × 3.3 |
| 75-95% | 100 |
| > 95% | 100 - (pct-95) × 5 |

### scoreDryDays (9%) — óptimo 2-6 días secos recientes
| Rango | Score |
|---|---|
| 0 días | 55 |
| 1-6 días | 55 + días × 7.5 |
| 7-10 días | 100 - (días-6) × 12.5 |
| 11-14 días | 50 - (días-10) × 12.5 |
| > 14 días | 0 |

---

## Fase 2 — Modificador de Especies (`helpers.jsx → applySpeciesModifier`)

**Aplicado en el hook, después de leer la caché. No afecta a `weatherService.js` ni a la caché.**

### Pesos de comestibilidad (EDIBILITY_SCORE)
```
excelente  → 100   (Boletus edulis, Cantharellus cibarius, Tuber… — el motivo del viaje)
bueno      →  20   (Trufa bianchetto, Marzuelo, Seta de ostra… — interesantes, no el objetivo)
comestible →   5   (Hipóloma, Auriscalpio… — existen pero no justifican la salida)
precaucion →   0   (no aptas para consumo general)
toxico     →   0
mortal     →   0
```

**Decisión de diseño:** el salto enorme entre `excelente` (100) y `bueno` (20) es intencionado. El objetivo es reflejar el valor gastronómico real de la salida, donde solo las excelentes hacen que merezca la pena ir.

### Cálculo del SQS (Species Quality Score)
1. Filtrar especies que cumplan `forestTypes.includes(zone.forestType)` AND `fruitingMonths.includes(mesActual)`
2. Si no hay coincidencias → `sqs = null` (sin ajuste, score meteorológico intacto)
3. Si las hay → `sqs = media(EDIBILITY_SCORE[edibility])` de las especies encontradas

### Aplicación
```
// Solo tóxicas/mortales:
if (allToxic) → overallScore = 0

// Con datos de especies:
adjustedScore = round(overallScore × 0.60 + sqs × 0.40)

// Sin especies en temporada para esta zona/mes:
adjustedScore = overallScore (sin cambio)
```

### Ejemplo — Pinar de Valsaín en febrero
Especies en temporada para `pinar` en mes 2:
- Trufa bianchetto → `bueno` → 20
- Seta de marzo (Marzuelo) → `bueno` → 20
- Hipóloma de pinos → `comestible` → 5
- Auriscalpio vulgar → `comestible` → 5
- Estrobiluro del abeto → `comestible` → 5
- Seta de azufre → `toxico` → 0

SQS = (20+20+5+5+5+0) / 6 ≈ **9**
Score meteo ejemplo = 47
Score final = 47×0.60 + 9×0.40 ≈ **32/100**

### Ejemplo — Zona encinar en octubre con Boletus + Trufa
SQS → 100 (todo excelentes), score meteo = 90
Score final = 90×0.60 + 100×0.40 = **94/100**

---

## Termómetro UI (`getScoreColor`)

| Score | Color | Etiqueta |
|---|---|---|
| ≥ 85 | emerald-400 | Excelente |
| ≥ 70 | bar / coffee-light | Muy bueno |
| ≥ 55 | amber-500 / amber-400 | Bueno |
| < 55 | red-500 / red-400 | Regular |

---

## Datos devueltos por el hook (post-modificador)

```js
{
  temperature,    // °C
  soilTemp,       // °C
  rainfall14d,    // mm (14 días)
  humidity,       // %
  wind,           // km/h
  dryDays,        // días <1mm en últimos 7
  overallScore,   // 0-100 (ya ajustado por especies)
  speciesScore,   // SQS 0-100 (undefined si sqs=null)
  scores: {
    temperatura, precipitacion, humedad, diasSecos, estacional
  }
}
```
