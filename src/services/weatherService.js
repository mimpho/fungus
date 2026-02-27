// =====================================================
// weatherService.js — Datos meteorológicos reales via Open-Meteo
//
// Open-Meteo: API pública, sin API key, cobertura global,
// datos ERA5 reanalysis + modelos NWP (ICON-EU para España)
// Docs: https://open-meteo.com/en/docs
// =====================================================

const BASE_URL = 'https://api.open-meteo.com/v1/forecast'
const CACHE_KEY = 'fungus_weather_cache'
const CACHE_VERSION = 2  // Incrementar cuando cambie el algoritmo de scoring
const CACHE_TTL = 3 * 60 * 60 * 1000 // 3 horas

// ─────────────────────────────────────────────────────────────────────────────
// SCORING ALGORITHM
// Basado en condiciones óptimas para fructificación micológica
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Factor estacional mensual — España (1=Enero … 12=Diciembre)
 *
 * Refleja la actividad micológica real de las especies de interés gastronómico
 * (Boletus, Cantharellus, Lactarius, Amanita caesarea, Tuber…):
 *   - Octubre/Noviembre: pico máximo (lluvia otoñal + temperatura suave)
 *   - Septiembre: inicio temporada norte y alta montaña
 *   - Abril/Mayo: temporada de primavera (colmenillas, perrechicos, St. George's)
 *   - Diciembre/Enero/Febrero: actividad mínima (solo Pleurotus y algún Cantharellus tubaeformis)
 *   - Junio/Julio: pausa estival (calor seco)
 *
 * Este factor tiene un peso del 40% en el score final para que la fenología
 * sea determinante: un tiempo perfecto en febrero sigue siendo un día malo para setas.
 */
const MONTHLY_SEASONALITY = {
  1:  15,  // Enero    — invierno, casi nada (algún Pleurotus)
  2:  20,  // Febrero  — inicio de año, suelos fríos, poca actividad
  3:  38,  // Marzo    — primavera temprana, primeras colmenillas
  4:  58,  // Abril    — perrechicos, Calocybe, Morchella
  5:  62,  // Mayo     — buena temporada de primavera
  6:  28,  // Junio    — calor, pausa estival
  7:  18,  // Julio    — pico de calor, mínimo del año
  8:  48,  // Agosto   — primeras lluvias en el norte, inicio pre-temporada
  9:  80,  // Septiembre — temporada otoñal en marcha
  10: 100, // Octubre  — pico absoluto: Boletus, Cantharellus, Lactarius
  11:  88, // Noviembre — excelente, especialmente para Tuber y tardíos
  12:  42, // Diciembre — fin de temporada, Pleurotus, algún Hygrophorus
}

/** Score de temperatura (18% del total)
 *  Óptimo: 10-18°C. Cero a <2°C y >28°C. */
function scoreTemperature(temp) {
  if (temp < 0)   return 0
  if (temp < 2)   return Math.round(temp * 10)
  if (temp < 8)   return Math.round(20 + (temp - 2) * 8.3)
  if (temp <= 18) return Math.round(70 + (1 - Math.abs(temp - 13) / 8) * 30)
  if (temp <= 22) return Math.round(85 - (temp - 18) * 12.5)
  if (temp <= 28) return Math.round(35 - (temp - 22) * 5.8)
  return 0
}

/** Score de precipitación acumulada 14 días (21% del total)
 *  Óptimo: 40-90mm. Cero <5mm y >180mm. */
function scoreRainfall(mm) {
  if (mm < 5)    return Math.round(mm * 2)
  if (mm < 20)   return Math.round(10 + (mm - 5) * 3.3)
  if (mm < 40)   return Math.round(60 + (mm - 20) * 1.5)
  if (mm <= 90)  return 100
  if (mm <= 130) return Math.round(100 - (mm - 90) * 1.5)
  if (mm <= 180) return Math.round(40 - (mm - 130) * 0.8)
  return 0
}

/** Score de humedad relativa (12% del total)
 *  Óptimo: 75-95%. */
function scoreHumidity(pct) {
  if (pct < 40)  return 0
  if (pct < 60)  return Math.round((pct - 40) * 2.5)
  if (pct < 75)  return Math.round(50 + (pct - 60) * 3.3)
  if (pct <= 95) return 100
  return Math.round(100 - (pct - 95) * 5)
}

/** Score días secos (9% del total)
 *  Óptimo: 2-6 días secos recientes. */
function scoreDryDays(days) {
  if (days === 0) return 55
  if (days <= 6)  return Math.round(55 + days * 7.5)
  if (days <= 10) return Math.round(100 - (days - 6) * 12.5)
  if (days <= 14) return Math.round(50 - (days - 10) * 12.5)
  return 0
}

/**
 * Score compuesto final — incluye factor estacional (40% del peso).
 *
 * Ponderaciones:
 *   40% fenología/estacionalidad  ← factor dominante
 *   21% precipitación 14 días
 *   18% temperatura
 *   12% humedad
 *    9% días secos
 *
 * Esto asegura que en febrero (estacionalidad=20) el score máximo
 * teórico sea ~68 (Bueno), reflejando la realidad micológica.
 * En octubre (estacionalidad=100) el techo es 100 (Excelente).
 */
function calculateOverallScore(temp, rainfall14d, humidity, dryDays) {
  const month    = new Date().getMonth() + 1
  const seasonal = MONTHLY_SEASONALITY[month] ?? 50

  const tScore = scoreTemperature(temp)
  const rScore = scoreRainfall(rainfall14d)
  const hScore = scoreHumidity(humidity)
  const dScore = scoreDryDays(dryDays)

  const raw = seasonal * 0.40
            + rScore   * 0.21
            + tScore   * 0.18
            + hScore   * 0.12
            + dScore   * 0.09

  return Math.round(Math.max(0, Math.min(100, raw)))
}

// ─────────────────────────────────────────────────────────────────────────────
// FETCH
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Obtiene condiciones meteorológicas para una ubicación (lat, lng).
 * Devuelve un objeto con el mismo schema que fakeConditions() de helpers.jsx
 */
async function fetchConditionsForLocation(lat, lng) {
  const params = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lng.toFixed(4),
    current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,soil_temperature_0cm',
    daily: 'precipitation_sum',
    past_days: 14,
    forecast_days: 1,
    timezone: 'Europe/Madrid',
  })

  const res = await fetch(`${BASE_URL}?${params}`)
  if (!res.ok) throw new Error(`Open-Meteo error ${res.status}`)
  const data = await res.json()

  const temp     = data.current?.temperature_2m ?? 12
  const humidity = data.current?.relative_humidity_2m ?? 75
  const wind     = data.current?.wind_speed_10m ?? 10
  const soilRaw  = data.current?.soil_temperature_0cm

  // Suelo: usar dato directo si disponible, si no estimar
  const soilTemp = soilRaw != null
    ? parseFloat(soilRaw.toFixed(1))
    : parseFloat(Math.max(0, temp - 2.5).toFixed(1))

  // Precipitación 14 días (array de 15 entradas: past 14 + hoy)
  const precipArr  = data.daily?.precipitation_sum ?? []
  const past14     = precipArr.slice(0, 14)
  const rainfall14d = parseFloat(
    past14.reduce((acc, v) => acc + (v ?? 0), 0).toFixed(1)
  )

  // Días secos recientes (últimos 7 días con <1mm)
  const recent7  = precipArr.slice(Math.max(0, precipArr.length - 7))
  const dryDays  = recent7.filter(v => (v ?? 0) < 1).length

  const overallScore = calculateOverallScore(temp, rainfall14d, humidity, dryDays)

  return {
    temperature:  parseFloat(temp.toFixed(1)),
    soilTemp,
    rainfall14d,
    humidity:     Math.round(humidity),
    wind:         Math.round(wind),
    dryDays,
    overallScore,
    // Scores parciales (útil para debugging y futura UI detallada)
    scores: {
      temperatura:    scoreTemperature(temp),
      precipitacion:  scoreRainfall(rainfall14d),
      humedad:        scoreHumidity(humidity),
      diasSecos:      scoreDryDays(dryDays),
      estacional:     MONTHLY_SEASONALITY[new Date().getMonth() + 1] ?? 50,
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CACHE (localStorage, TTL 3h)
// ─────────────────────────────────────────────────────────────────────────────

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return {}
    const { ts, data, v } = JSON.parse(raw)
    if (v !== CACHE_VERSION) return {}        // versión de scoring distinta → invalidar
    if (Date.now() - ts > CACHE_TTL) return {}
    return data ?? {}
  } catch { return {} }
}

function saveCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), v: CACHE_VERSION, data }))
  } catch { /* ignore quota errors */ }
}

// ─────────────────────────────────────────────────────────────────────────────
// IN-FLIGHT CACHE (evita dobles fetches en React StrictMode)
// ─────────────────────────────────────────────────────────────────────────────

// Promesa compartida para fetchAllZoneConditions — si ya hay una en curso la reutiliza
let _allZonesPromise = null

// Caché individual por zone id para fetchZoneConditions
const _singlePromises = new Map()

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Carga condiciones meteorológicas para un array de zonas.
 * Usa caché localStorage (TTL 3h) + caché en memoria de promesas en vuelo.
 *
 * @param {Array<{id, lat, lng}>} zones
 * @param {{ onProgress?: (done, total) => void }} opts
 * @returns {Promise<Record<string, object>>}  objeto { zoneId: conditions }
 */
export async function fetchAllZoneConditions(zones, opts = {}) {
  // Si ya hay un fetch en curso o la caché está fresca, reutilizar
  if (_allZonesPromise) return _allZonesPromise

  const cache = loadCache()
  const result = { ...cache }
  const missing = zones.filter(z => !result[z.id])

  if (missing.length === 0) return result

  const { onProgress } = opts
  let done = 0

  // Wrappear en promesa guardada para que llamadas concurrentes la compartan
  _allZonesPromise = (async () => {
    const CONCURRENCY = 6
    for (let i = 0; i < missing.length; i += CONCURRENCY) {
      const batch = missing.slice(i, i + CONCURRENCY)
      const results = await Promise.allSettled(
        batch.map(z => fetchConditionsForLocation(z.lat, z.lng))
      )
      results.forEach((r, idx) => {
        if (r.status === 'fulfilled') {
          result[batch[idx].id] = r.value
        }
      })
      done += batch.length
      onProgress?.(done, missing.length)
    }
    saveCache(result)
    _allZonesPromise = null // limpiar tras resolver
    return result
  })()

  return _allZonesPromise
}

/**
 * Carga condiciones para una sola zona (útil en ZoneModal).
 * Usa caché localStorage + promesa en vuelo por zone.id.
 */
export async function fetchZoneConditions(zone) {
  const cache = loadCache()
  if (cache[zone.id]) return cache[zone.id]

  // Reutilizar promesa en vuelo para esta zona
  if (_singlePromises.has(zone.id)) return _singlePromises.get(zone.id)

  const p = fetchConditionsForLocation(zone.lat, zone.lng).then(cond => {
    const updated = { ...loadCache(), [zone.id]: cond }
    saveCache(updated)
    _singlePromises.delete(zone.id)
    return cond
  })
  _singlePromises.set(zone.id, p)
  return p
}

/**
 * Borra la caché (útil para forzar actualización).
 */
export function clearWeatherCache() {
  try { localStorage.removeItem(CACHE_KEY) } catch { /* */ }
  _allZonesPromise = null
  _singlePromises.clear()
}
