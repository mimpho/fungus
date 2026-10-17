// =====================================================
// Observatory view state in the URL (pure, no React)
//
//   /observatorio?lat=41.7679&lon=2.3978
//
// Parameters are in Spanish like the rest of the app and shareable across languages.
// Anything invalid (not a number, outside Catalonia, only one of the two) falls back to the
// default view (no observed point): the page never breaks on a bad link, and the URL is
// rewritten (history replaced) to what the page shows.
// Later steps add hasta, dias, vista, capas, seta and setas here.
// =====================================================
import { isInCatalonia } from './catalonia'

const NUMBER = /^-?\d+(\.\d+)?$/
const round5 = v => Math.round(v * 1e5) / 1e5  // ~1 m: enough, and keeps the URL short

function toNumber(raw) {
  return typeof raw === 'string' && NUMBER.test(raw.trim()) ? Number(raw) : null
}

/** View state from the URL: { point: { lat, lon } | null }. */
export function parseView(params) {
  const lat = toNumber(params.get('lat'))
  const lon = toNumber(params.get('lon'))
  const point = lat !== null && lon !== null && isInCatalonia(lat, lon)
    ? { lat: round5(lat), lon: round5(lon) }
    : null
  return { point }
}

/** New params with the point set (or removed with null); every other parameter is kept. */
export function withPoint(params, point) {
  const next = new URLSearchParams(params)
  if (point) {
    next.set('lat', String(round5(point.lat)))
    next.set('lon', String(round5(point.lon)))
  } else {
    next.delete('lat')
    next.delete('lon')
  }
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
 * The URL's canonical form, or null when it already is. A link with a broken point loses it,
 * duplicated lat/lon collapse to the valid one and coordinates are rounded: the address bar
 * always says what the page shows.
 */
export function canonicalParams(params) {
  if (!params.has('lat') && !params.has('lon')) return null
  const canonical = withPoint(params, parseView(params).point)
  return canonical.toString() === params.toString() ? null : canonical
}
