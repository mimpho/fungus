// =====================================================
// observatoryService.js — client of /api/v1/observatory (login required)
//
// Every call goes through request(), which turns HTTP failures into an
// ObservatoryError with a `kind` the UI can translate:
//   auth         401 after one silent token refresh
//   outside      422 on lat/lon: the point is outside Catalonia
//   invalid      any other 422
//   not_found    404 (no climate data yet, unknown species or saved point)
//   conflict     409 (point already saved, or the saved-point limit)
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

async function request(path, { method = 'GET', params, body, signal } = {}) {
  const url = buildUrl(path, params)
  const attempt = async () => {
    try {
      const res = await fetch(url, {
        method,
        headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...authHeaders() },
        credentials: 'include',
        body: body ? JSON.stringify(body) : undefined,
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
  return res.status === 204 ? null : res.json()
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

/** Weekly rain of every catalogue zone, last 26 weeks. Not tied to a point. */
export const fetchTerritoryRain = ({ signal } = {}) => request('/territory/rain', { signal })

// ── Saved points ─────────────────────────────────────────────────────────────

export const fetchSavedPoints = ({ signal } = {}) => request('/saved-points', { signal })
export const createSavedPoint = ({ lat, lon, name, notes, forestTypes }) =>
  request('/saved-points', {
    method: 'POST',
    body: { lat, lon, ...(name ? { name } : {}), ...(notes ? { notes } : {}), ...(forestTypes?.length ? { forest_types: forestTypes } : {}) },
  })
export const fetchSavedPoint = (id, { signal } = {}) => request(`/saved-points/${id}`, { signal })
/** `changes` uses the API names: { name, notes, forest_types } (forest_types: null = back to derived). */
export const updateSavedPoint = (id, changes) => request(`/saved-points/${id}`, { method: 'PATCH', body: changes })
export const deleteSavedPoint = id => request(`/saved-points/${id}`, { method: 'DELETE' })
export const fetchSavedPointSpecies = (id, { date, signal } = {}) =>
  request(`/saved-points/${id}/species`, { signal, params: { date } })
