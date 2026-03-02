// =====================================================
// apiService.js — Wrapper del backend Fungus
//
// Base URL: https://fungus-api.onrender.com/api/v1
// Docs: ver docs/backend_architecture.md
//
// Reemplaza la combinación mockZones + Open-Meteo (200 req) por
// una sola llamada al backend que devuelve zonas + scores cacheados.
// =====================================================

export const API_BASE = 'https://fungus-api.onrender.com/api/v1'

// Mapa provincia → CCAA (replicado de src/data/zones.js para normalizar zonas del API)
const PROVINCE_TO_CCAA = {
  'Álava': 'País Vasco', 'Guipúzcoa': 'País Vasco', 'Vizcaya': 'País Vasco',
  'Huesca': 'Aragón', 'Teruel': 'Aragón', 'Zaragoza': 'Aragón',
  'Asturias': 'Asturias',
  'Cantabria': 'Cantabria',
  'Ávila': 'Castilla y León', 'Burgos': 'Castilla y León', 'León': 'Castilla y León',
  'Palencia': 'Castilla y León', 'Salamanca': 'Castilla y León', 'Segovia': 'Castilla y León',
  'Soria': 'Castilla y León', 'Valladolid': 'Castilla y León', 'Zamora': 'Castilla y León',
  'Albacete': 'Castilla-La Mancha', 'Ciudad Real': 'Castilla-La Mancha',
  'Cuenca': 'Castilla-La Mancha', 'Guadalajara': 'Castilla-La Mancha', 'Toledo': 'Castilla-La Mancha',
  'Barcelona': 'Cataluña', 'Girona': 'Cataluña', 'Lleida': 'Cataluña', 'Tarragona': 'Cataluña',
  'Badajoz': 'Extremadura', 'Cáceres': 'Extremadura',
  'A Coruña': 'Galicia', 'Lugo': 'Galicia', 'Ourense': 'Galicia', 'Pontevedra': 'Galicia',
  'La Rioja': 'La Rioja',
  'Madrid': 'Comunidad de Madrid',
  'Murcia': 'Región de Murcia',
  'Navarra': 'Navarra',
  'Alicante': 'Comunitat Valenciana', 'Castellón': 'Comunitat Valenciana', 'Valencia': 'Comunitat Valenciana',
  'Almería': 'Andalucía', 'Cádiz': 'Andalucía', 'Córdoba': 'Andalucía',
  'Granada': 'Andalucía', 'Huelva': 'Andalucía', 'Jaén': 'Andalucía',
  'Málaga': 'Andalucía', 'Sevilla': 'Andalucía',
}

// ─────────────────────────────────────────────────────────────────────────────
// NORMALIZADORES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convierte una zona del API al shape del frontend.
 *
 * API shape:    { id, name, province, region, lat, lon, elevation_m, forest_type, description, score }
 * Frontend shape: { id, name, province, region, lat, lng, elevation, forestType, description, comunidadAutonoma }
 */
export function normalizeZone(apiZone) {
  return {
    id:               apiZone.id,
    name:             apiZone.name,
    province:         apiZone.province,
    region:           apiZone.region,
    lat:              apiZone.lat,
    lng:              apiZone.lon,          // lon → lng
    elevation:        apiZone.elevation_m,  // elevation_m → elevation
    forestType:       apiZone.forest_type,  // forest_type → forestType
    description:      apiZone.description,
    comunidadAutonoma: PROVINCE_TO_CCAA[apiZone.province] || apiZone.province,
  }
}

/**
 * Convierte el score del API al shape de conditions del frontend.
 *
 * Nota: temperatura, humedad y viento NO están disponibles en el endpoint de lista
 * — se obtienen via Open-Meteo en useZoneConditions (ZoneModal).
 * rainfall14d se aproxima con pa21_mm (21 días vs 14 días, diferencia aceptable).
 *
 * El campo _source: 'api' permite distinguir estos conditions de los Open-Meteo.
 */
export function normalizeScore(apiScore) {
  if (!apiScore) return null
  const d = apiScore.score_detail ?? {}
  return {
    overallScore: apiScore.score_oi,
    temperature:  null,               // no disponible en endpoint de lista
    soilTemp:     null,
    rainfall14d:  d.pa21_mm ?? null,  // 21d ≈ 14d, suficiente para mostrar en card
    humidity:     null,
    wind:         null,
    dryDays:      d.days_since_rain ?? null,
    scores: {
      precipitacion: d.pa21     ?? null,
      temperatura:   d.thermal  ?? null,
      estacional:    d.seasonal ?? null,
      humedad:       d.humidity ?? null,
      diasSecos:     null,
    },
    _source:       'api',
    _label:        apiScore.label,
    _validUntil:   apiScore.valid_until,
    _calculatedAt: apiScore.calculated_at,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/zones — todas las zonas activas con score OI cacheado.
 *
 * Reemplaza la combinación:
 *   mockZones (200 zonas sincrónicas)
 *   + fetchAllZoneConditions (200 requests a Open-Meteo → 429)
 *
 * @returns {Promise<{ zones: Zone[], conditionsMap: Record<string, object> }>}
 */
export async function fetchZones() {
  const res = await fetch(`${API_BASE}/zones`)
  if (!res.ok) throw new Error(`API /zones error ${res.status}`)
  const data = await res.json()

  const zones = data.map(normalizeZone)
  const conditionsMap = {}
  for (const apiZone of data) {
    const cond = normalizeScore(apiZone.score)
    if (cond) conditionsMap[apiZone.id] = cond
  }

  return { zones, conditionsMap }
}

/**
 * GET /api/v1/zones/{id} — detalle de una zona con breakdown OI.
 */
export async function fetchZone(zoneId) {
  const res = await fetch(`${API_BASE}/zones/${zoneId}`)
  if (!res.ok) throw new Error(`API /zones/${zoneId} error ${res.status}`)
  return res.json()
}

/**
 * GET /api/v1/zones/map-scores — payload ligero para el heatmap Leaflet.
 * @returns {Promise<Array<{ zone_id, lat, lon, score, name }>>}
 */
export async function fetchMapScores() {
  const res = await fetch(`${API_BASE}/zones/map-scores`)
  if (!res.ok) throw new Error(`API /zones/map-scores error ${res.status}`)
  return res.json()
}
