// =====================================================
// apiService.js — Wrapper del backend Fungus
//
// Base URL: configurable via VITE_API_BASE (env var de Vite).
//   - En local: crear .env.local con VITE_API_BASE=http://localhost:8000/api/v1
//   - En Vercel: configurar la variable de entorno en el dashboard
//   - Si no está definida, usa producción (https://fungus-api.onrender.com/api/v1)
//
// Docs: ver docs/backend_architecture.md
// =====================================================

export const API_BASE = import.meta.env.VITE_API_BASE ?? 'https://fungus-api.onrender.com/api/v1'

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
 * Convierte el score + weather del API al shape de conditions del frontend.
 *
 * apiScore: { score_oi, score_detail, label, valid_until, calculated_at }
 * apiWeather (opcional): { temp_min, temp_max, humidity, rainfall14d, wind, collected_at }
 *   — disponible en GET /zones a partir de v4.4.2
 *   — rainfall14d del weather (14d real) tiene prioridad sobre pa21_mm (21d aprox)
 *
 * El campo _source: 'api' permite distinguir estos conditions de los Open-Meteo.
 */
export function normalizeScore(apiScore, apiWeather = null) {
  if (!apiScore) return null
  const d = apiScore.score_detail ?? {}
  const w = apiWeather ?? {}

  // Helpers de redondeo para evitar 1.7999999999999998 de floats del backend
  const r1 = v => v != null ? Math.round(v * 10) / 10 : null  // 1 decimal
  const r0 = v => v != null ? Math.round(v) : null             // entero

  return {
    overallScore: apiScore.score_oi,
    tempMin:      r1(w.temp_min),    // rango diario forecast (min °C)
    tempMax:      r1(w.temp_max),    // rango diario forecast (max °C)
    soilTemp:     null,
    rainfall14d:  r1(w.rainfall14d ?? d.pa21_mm ?? null),  // weather real > pa21 approx
    humidity:     r0(w.humidity),
    wind:         r0(w.wind),
    dryDays:      d.days_since_rain ?? null,
    scores: {
      precipitacion: d.pa21     ?? null,
      temperatura:   d.thermal  ?? null,
      estacional:    d.seasonal ?? null,
      humedad:       d.humidity ?? null,
      diasSecos:     d.days_since_rain ?? null,
    },
    _source:            'api',
    _label:             apiScore.label,
    _validUntil:        apiScore.valid_until,
    _calculatedAt:      apiScore.calculated_at,
    _weatherCollectedAt: w.collected_at ?? null,
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
    const cond = normalizeScore(apiZone.score, apiZone.weather)
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
 * GET /api/v1/weather/zones/{id} — weather cacheado de una zona.
 *
 * Devuelve: { zone_id, provider, weather: { temp_min, temp_max, humidity,
 *   rainfall14d, wind, collected_at, valid_until }, cached }
 * Devuelve null si 404 (zona sin weather aún) o 502 (API externa no disponible).
 * Lanza solo en errores inesperados (5xx ≠ 502, 4xx ≠ 404).
 */
export async function fetchZoneWeather(zoneId) {
  const res = await fetch(`${API_BASE}/weather/zones/${zoneId}`)
  if (res.status === 404 || res.status === 502) return null  // sin datos — degradación elegante
  if (!res.ok) throw new Error(`API /weather/zones/${zoneId} error ${res.status}`)
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

// ─────────────────────────────────────────────────────────────────────────────
// SPECIES — normalizadores
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normaliza un item de lista de especies del API al shape del frontend.
 *
 * API shape (SpeciesListItem):
 *   { id, scientific_name, family, edibility, forest_types, fruiting_months,
 *     elevation_min_m, elevation_max_m, common_names, photo_url, description }
 *
 * Frontend shape (mockSpecies):
 *   { id, scientificName, family, edibility, forestTypes, fruitingMonths,
 *     altitud_min, altitud_max, elevationMin, elevationMax,
 *     commonNames, photo, description, photos, cap, stem, flesh, sporePrint,
 *     synonyms, distributionZones }
 *
 * Los campos de detalle (cap, stem, flesh, photos…) se rellenan con null
 * en el item de lista — se cargan bajo demanda en SpeciesModal.
 */
export function normalizeSpeciesListItem(s) {
  return {
    id:               s.id,
    scientificName:   s.scientific_name,
    family:           s.family,
    edibility:        s.edibility,
    forestTypes:      s.forest_types   ?? [],
    fruitingMonths:   s.fruiting_months ?? [],
    altitud_min:      s.elevation_min_m,  // alias usado en applySpeciesModifier
    altitud_max:      s.elevation_max_m,
    elevationMin:     s.elevation_min_m,  // alias usado en SpeciesModal
    elevationMax:     s.elevation_max_m,
    commonNames:      s.common_names   ?? [],
    photo:            s.photo_url ? { url: s.photo_url } : null,
    description:      s.description   ?? null,
    // Detalle no disponible en lista — se carga en SpeciesModal al abrir
    photos:           [],
    cap:              null,
    stem:             null,
    flesh:            null,
    sporePrint:       null,
    synonyms:         [],
    distributionZones: null,
    _partial:         true,  // flag: indica que falta el detalle completo
  }
}

/**
 * Normaliza el detalle completo de una especie (GET /species/{id}).
 * Desempaqueta extra_data para reconstruir el shape del frontend.
 *
 * @param {object} s    - Raw API response from GET /species/{id}
 * @param {string} lang - Locale ('es' | 'ca' | 'en'). Picks translated fields
 *                        from extra_data (e.g. description_ca) with ES fallback.
 */
export function normalizeSpeciesDetail(s, lang = 'es') {
  const base = normalizeSpeciesListItem(s)
  const ex = s.extra_data ?? {}

  // i18n helper: prefers {key}_{lang} from extra_data, falls back to top-level field
  const i18n = (key, fallback = null) =>
    (lang !== 'es' && ex[`${key}_${lang}`]) ? ex[`${key}_${lang}`] : fallback

  return {
    ...base,
    // Translated fields — backend already returns right commonNames via lang param,
    // but description comes from extra_data (detail endpoint returns full blob)
    description: i18n('description', s.description ?? null),
    // Fruiting conditions — top-level from API (ES), i18n reads _ca/_en from extra_data blob
    cond_temp:   i18n('cond_temp',   s.cond_temp   ?? null),
    cond_precip: i18n('cond_precip', s.cond_precip ?? null),
    cond_suelo:  i18n('cond_suelo',  s.cond_suelo  ?? null),
    cond_req:    i18n('cond_req',    s.cond_req     ?? null),
    // Sobrescribir con datos de extra_data que son más completos
    photo:       ex.photo  ?? base.photo,
    photos:      ex.photos ?? [],
    cap:         ex.cap    ?? null,
    stem:        ex.stem   ?? null,
    flesh:       ex.flesh  ?? null,
    sporePrint:  ex.sporePrint ?? null,
    distribucion: ex.distribucion ?? [],
    // Campos solo disponibles en el endpoint de detalle
    synonyms:    s.synonyms    ?? null,
    confusions:  s.confusions  ?? null,
    // OI params (útil para debugging futuro)
    _oiParams: s.oi_params ?? null,
    _partial:  false,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SPECIES — endpoints
// ─────────────────────────────────────────────────────────────────────────────

const _SPECIES_PAGE_SIZE = 500  // max permitido por la API

/**
 * Obtiene todas las especies (con cursor pagination).
 * Reemplaza el import estático de mockSpecies en las vistas de lista.
 *
 * @returns {Promise<Array>}  array de especies normalizadas al shape del frontend
 */
export async function fetchAllSpecies(lang = 'es') {
  const all = []
  let cursor = null

  while (true) {
    const params = new URLSearchParams({ limit: _SPECIES_PAGE_SIZE, lang })
    if (cursor) params.set('cursor', cursor)

    const res = await fetch(`${API_BASE}/species?${params}`)
    if (!res.ok) throw new Error(`API /species error ${res.status}`)
    const page = await res.json()

    for (const s of page) all.push(normalizeSpeciesListItem(s))

    if (page.length < _SPECIES_PAGE_SIZE) break  // última página
    cursor = page[page.length - 1].id
  }

  return all
}

/**
 * Obtiene el detalle completo de una especie.
 * Llamado de forma lazy al abrir SpeciesModal.
 *
 * Caché en memoria por ID: si el usuario abre la misma especie dos veces
 * en la misma sesión, el segundo open es instantáneo (sin request).
 * La promesa en vuelo también se comparte para evitar dobles fetches si
 * el modal se abre antes de que acabe la primera llamada.
 *
 * @param {string} speciesId
 * @returns {Promise<object>}  especie normalizada con todos los campos (cap, stem, photos…)
 */
// Raw cache (lang-independent): fetches once, normalizes per lang on demand
const _detailRawCache = new Map()  // speciesId → raw API JSON
const _detailPromises = new Map()  // speciesId → in-flight Promise<raw JSON>

export async function fetchSpeciesDetail(speciesId, lang = 'es') {
  // If raw JSON already cached, just re-normalize with the requested lang
  if (_detailRawCache.has(speciesId)) {
    return normalizeSpeciesDetail(_detailRawCache.get(speciesId), lang)
  }

  // Share in-flight promise to avoid duplicate requests (React StrictMode)
  if (!_detailPromises.has(speciesId)) {
    const promise = fetch(`${API_BASE}/species/${speciesId}`)
      .then(res => {
        if (!res.ok) throw new Error(`API /species/${speciesId} error ${res.status}`)
        return res.json()
      })
      .then(raw => {
        _detailRawCache.set(speciesId, raw)
        _detailPromises.delete(speciesId)
        return raw
      })
      .catch(err => {
        _detailPromises.delete(speciesId)
        throw err
      })
    _detailPromises.set(speciesId, promise)
  }

  const raw = await _detailPromises.get(speciesId)
  return normalizeSpeciesDetail(raw, lang)
}
