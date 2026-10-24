// =====================================================
// observatoryService.js — client of /api/v1/observatory (login required)
//
// Every call goes through request(), which turns HTTP failures into an
// ObservatoryError with a `kind` the UI can translate:
//   auth         401 after one silent token refresh
//   outside      422 on lat/lon: the point is outside Catalonia
//   invalid      any other 422
//   not_found    404 (no climate data yet, unknown species or saved point)
//   conflict     409 (point already saved, or the saved-point limit; a corner with 5 photos)
//   too_large    413 (a photo over the size or pixel limit)
//   unsupported  415 (the file is not a readable image)
//   storage      502 (the photo storage failed: try again)
//   limit        429 daily limit of new cells (retryAfter = seconds)
//   unavailable  503 weather provider down or daily budget spent
//   network      fetch failed (offline, CORS, server asleep)
//   unknown      anything else
// =====================================================

import { API_BASE } from './apiService'
import { authHeaders, apiRefresh } from './authService'

export class ObservatoryError extends Error {
  /**
   * @param {string} kind        see the list above
   * @param {object} [info]
   * @param {number} [info.status]
   * @param {number|null} [info.retryAfter]  seconds until it is worth trying again
   * @param {string|null} [info.detail]      raw `detail` from the API
   */
  constructor(kind, { status = null, retryAfter = null, detail = null } = {}) {
    super(detail || kind)
    this.name = 'ObservatoryError'
    this.kind = kind
    this.status = status
    this.retryAfter = retryAfter
    this.detail = detail
  }
}

/** Seconds until the next 00:00 UTC (the daily limits reset then). */
export function secondsToUtcMidnight(now = new Date()) {
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
  return Math.max(1, Math.ceil((next - now.getTime()) / 1000))
}

function detailText(detail) {
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) return detail.map(d => d?.msg).filter(Boolean).join('; ') || null
  return null
}

function isCoordinateError(detail) {
  return Array.isArray(detail) && detail.some(d => Array.isArray(d?.loc) && d.loc.some(p => p === 'lat' || p === 'lon'))
}

async function toError(res) {
  const body = await res.json().catch(() => null)
  const detail = body?.detail
  const text = detailText(detail)
  // The browser only reads Retry-After if the API lists it in Access-Control-Expose-Headers;
  // otherwise it is null and a 429 falls back to the next UTC midnight (when the limit resets).
  const header = Number(res.headers.get('Retry-After'))
  const retryAfter = Number.isFinite(header) && header > 0 ? header : null
  const info = { status: res.status, detail: text }
  switch (res.status) {
    case 401: return new ObservatoryError('auth', info)
    case 404: return new ObservatoryError('not_found', info)
    case 409: return new ObservatoryError('conflict', info)
    case 413: return new ObservatoryError('too_large', info)
    case 415: return new ObservatoryError('unsupported', info)
    case 502: return new ObservatoryError('storage', { ...info, retryAfter })
    case 422: return new ObservatoryError(isCoordinateError(detail) ? 'outside' : 'invalid', info)
    case 429: return new ObservatoryError('limit', { ...info, retryAfter: retryAfter ?? secondsToUtcMidnight() })
    case 503: return new ObservatoryError('unavailable', { ...info, retryAfter })
    default:  return new ObservatoryError('unknown', info)
  }
}

function buildUrl(path, params) {
  const qs = new URLSearchParams()
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== null && value !== '') qs.set(key, String(value))
  }
  const query = qs.toString()
  return `${API_BASE}/observatory${path}${query ? `?${query}` : ''}`
}

async function request(path, { method = 'GET', params, body, form, signal, parse = 'json' } = {}) {
  const url = buildUrl(path, params)
  const attempt = async () => {
    try {
      const res = await fetch(url, {
        method,
        // A FormData body sets its own Content-Type (with the multipart boundary)
        headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...authHeaders() },
        credentials: 'include',
        body: form ?? (body ? JSON.stringify(body) : undefined),
        signal,
      })
      return res
    } catch (err) {
      if (err?.name === 'AbortError') throw err
      throw new ObservatoryError('network')
    }
  }

  let res = await attempt()
  if (res.status === 401 && (await apiRefresh())) res = await attempt()
  if (!res.ok) throw await toError(res)
  if (res.status === 204) return null
  return parse === 'buffer' ? res.arrayBuffer() : res.json()
}

// ── Point by coordinates ─────────────────────────────────────────────────────

const pt = (lat, lon) => ({ lat, lon })

/** Toponym, elevation and forest at the point. Never spends the new-cell budget. */
export const fetchPointForest = (lat, lon, opts = {}) =>
  request('/point/forest', { ...opts, params: { ...pt(lat, lon), radius: opts.radius } })

/** Thermometer: score, band inputs, conditions, rains on the way. */
export const fetchPointSnapshot = (lat, lon, { date, species, signal } = {}) =>
  request('/point/snapshot', { signal, params: { ...pt(lat, lon), date, species } })

/** Daily series, factors and events for the chart. */
export const fetchPointSeries = (lat, lon, { to, days, species, signal } = {}) =>
  request('/point/series', { signal, params: { ...pt(lat, lon), to, days, species } })

/** Species that fit the point on a date. */
export const fetchPointSpecies = (lat, lon, { date, signal } = {}) =>
  request('/point/species', { signal, params: { ...pt(lat, lon), date } })

/** Last 7 real days and the next 35. */
export const fetchPointCalendar = (lat, lon, { date, species, signal } = {}) =>
  request('/point/calendar', { signal, params: { ...pt(lat, lon), date, species } })

/** The weather the cell's stored forecast announces: up to 16 days from today. */
export const fetchPointForecast = (lat, lon, { signal } = {}) =>
  request('/point/forecast', { signal, params: { ...pt(lat, lon) } })

// ── Map layers ───────────────────────────────────────────────────────────────

/** Probability of one species in every stored cell of Catalonia. Never spends the new-cell budget. */
export const fetchProbabilityLayer = (species, { date, signal } = {}) =>
  request('/layer/probability', { signal, params: { species, date } })

/** The excellent edibles together, one score each per cell (what the map shows before a species is chosen). */
export const fetchExcellentLayer = ({ date, signal } = {}) =>
  request('/layer/probability-excellent', { signal, params: { date } })

/**
 * A class raster ('forest' or 'substrate'): its description (classes, bounds, size) and its bytes,
 * share*255 of each class, class after class. 404 = not built on this server.
 */
export const fetchClassRaster = (kind, { signal } = {}) =>
  Promise.all([
    request(`/layer/${kind}-raster/meta`, { signal }),
    request(`/layer/${kind}-raster`, { signal, parse: 'buffer' }),
  ])

// ── Saved points ─────────────────────────────────────────────────────────────

export const fetchSavedPoints = ({ signal } = {}) => request('/saved-points', { signal })
export const createSavedPoint = ({ lat, lon, name, notes, kind, species_ids }) =>
  request('/saved-points', {
    method: 'POST',
    body: {
      lat, lon,
      ...(name ? { name } : {}),
      ...(notes ? { notes } : {}),
      ...(kind ? { kind } : {}),
      ...(species_ids?.length ? { species_ids } : {}),
    },
  })
export const fetchSavedPoint = (id, { signal } = {}) => request(`/saved-points/${id}`, { signal })
/** `changes` uses the API names: { name, notes, kind, species_ids } (notes: null = remove them; species_ids replaces the list). */
export const updateSavedPoint = (id, changes) => request(`/saved-points/${id}`, { method: 'PATCH', body: changes })
export const deleteSavedPoint = id => request(`/saved-points/${id}`, { method: 'DELETE' })
export const fetchSavedPointSpecies = (id, { date, signal } = {}) =>
  request(`/saved-points/${id}/species`, { signal, params: { date } })

// ── Corner photos ────────────────────────────────────────────────────────────
// The API answers { id, position, thumb_url, large_url, species_ids }: the URLs are signed and
// expire (an hour), so they are never stored, only held while the card is open.

export const fetchCornerPhotos = (id, { signal } = {}) => request(`/saved-points/${id}/photos`, { signal })
/** Any image format (HEIC included); the server makes the two WebP copies and drops the EXIF. */
export function uploadCornerPhoto(id, file, speciesIds = []) {
  const form = new FormData()
  form.append('file', file)
  for (const sid of speciesIds) form.append('species_ids', sid)
  return request(`/saved-points/${id}/photos`, { method: 'POST', form })
}
/** Replaces the species tagged on the photo (an empty list clears them). */
export const tagCornerPhoto = (id, photoId, species_ids) =>
  request(`/saved-points/${id}/photos/${photoId}`, { method: 'PATCH', body: { species_ids } })
export const deleteCornerPhoto = (id, photoId) =>
  request(`/saved-points/${id}/photos/${photoId}`, { method: 'DELETE' })
