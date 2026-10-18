// =====================================================
// Observatory view state in the URL (pure, no React)
//
//   /observatorio?lat=41.7679&lon=2.3978
//
// Parameters are in Spanish like the rest of the app and shareable across languages.
// Anything invalid (not a number, outside Catalonia, only one of the two) falls back to the
// default view (no observed point): the page never breaks on a bad link, and the URL is
// rewritten (history replaced) to what the page shows.
// The timeline window adds two more: `hasta` (last day of the window, YYYY-MM-DD; missing = the
// last day with data) and `dias` (its length, 7–180; missing = 20). Later steps add vista, capas,
// seta and setas here.
// =====================================================
import { isInCatalonia } from './catalonia'

export const MIN_WINDOW = 7
export const MAX_WINDOW = 180
export const DEFAULT_WINDOW = 20

const NUMBER = /^-?\d+(\.\d+)?$/
const round5 = v => Math.round(v * 1e5) / 1e5  // ~1 m: enough, and keeps the URL short

function toNumber(raw) {
  return typeof raw === 'string' && NUMBER.test(raw.trim()) ? Number(raw) : null
}

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/
const INTEGER = /^\d{1,3}$/

function toUntil(raw) {
  if (typeof raw !== 'string' || !ISO_DAY.test(raw)) return null
  const d = new Date(`${raw}T00:00:00Z`)
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== raw ? null : raw
}

function toDays(raw) {
  if (typeof raw !== 'string' || !INTEGER.test(raw)) return null
  const n = Number(raw)
  return n >= MIN_WINDOW && n <= MAX_WINDOW ? n : null
}

/**
 * View state from the URL: { point: { lat, lon } | null, until: 'YYYY-MM-DD' | null, days }.
 * `until` null means the last day with data; `days` is the window length (default 20).
 */
export function parseView(params) {
  const lat = toNumber(params.get('lat'))
  const lon = toNumber(params.get('lon'))
  const point = lat !== null && lon !== null && isInCatalonia(lat, lon)
    ? { lat: round5(lat), lon: round5(lon) }
    : null
  return { point, until: toUntil(params.get('hasta')), days: toDays(params.get('dias')) ?? DEFAULT_WINDOW }
}

/**
 * New params with the point set (or removed with null); every other parameter is kept. Without a
 * point the window means nothing, so it goes too.
 */
export function withPoint(params, point) {
  const next = new URLSearchParams(params)
  if (point) {
    next.set('lat', String(round5(point.lat)))
    next.set('lon', String(round5(point.lon)))
  } else {
    next.delete('lat')
    next.delete('lon')
    next.delete('hasta')
    next.delete('dias')
  }
  return next
}

/** New params with the window set; the defaults (last day, 20 days) are left out of the URL. */
export function withWindow(params, { until, days }) {
  const next = new URLSearchParams(params)
  if (until) next.set('hasta', until)
  else next.delete('hasta')
  if (days && days !== DEFAULT_WINDOW) next.set('dias', String(days))
  else next.delete('dias')
  return next
}

export function samePoint(a, b) {
  return !!a && !!b && round5(a.lat) === round5(b.lat) && round5(a.lon) === round5(b.lon)
}

/** «41.7679, 2.3978» */
export function formatCoords(point) {
  return `${round5(point.lat)}, ${round5(point.lon)}`
}

/**
 * The URL's canonical form, or null when it already is. A link with a broken point loses it (and
 * the window with it), duplicated lat/lon collapse to the valid one, coordinates are rounded and
 * a broken or default window is dropped: the address bar always says what the page shows.
 */
export function canonicalParams(params) {
  const keys = ['lat', 'lon', 'hasta', 'dias']
  if (!keys.some(k => params.has(k))) return null
  const view = parseView(params)
  const canonical = view.point
    ? withWindow(withPoint(params, view.point), { until: view.until, days: view.days })
    : withPoint(params, null)
  return canonical.toString() === params.toString() ? null : canonical
}
