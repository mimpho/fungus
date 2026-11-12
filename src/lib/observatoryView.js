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
// last day with data) and `dias` (its length, 7–180; missing = 20).
// The Meteo tab adds what the map is showing, only while Meteo is on: `capa` (the data layer, e.g.
// `condiciones`), `seta` (species id; missing = the mean of the excellent ones) and `dia` (the
// reference day, YYYY-MM-DD; missing = the last day with data). `dia` is clamped to −30…+7 days from
// today; `seta` and `dia` mean nothing without `capa`. Whether `seta` exists in the catalogue is
// checked by the page once the catalogue has loaded.
// =====================================================
import { isInCatalonia } from './catalonia'
import { addDays, todayIso } from './layerDays'
import { layerFromParam, paramOfLayer } from './meteoLayers'

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

export const MAX_DAYS_BACK = 30
export const MAX_DAYS_AHEAD = 7
const SPECIES_ID = /^[a-z0-9][a-z0-9-]{0,39}$/i

/** A `dia` inside −30…+7 days from `today` (outside, the nearest end); null when it is not a day. */
export function clampDay(raw, today = todayIso()) {
  const day = toUntil(raw)
  if (!day) return null
  const first = addDays(today, -MAX_DAYS_BACK)
  const last = addDays(today, MAX_DAYS_AHEAD)
  return day < first ? first : day > last ? last : day
}

/**
 * The Meteo state in the URL: { layer, species, day } or null when there is no valid `capa` (Meteo is
 * then whatever this browser stored). `layer` is a meteoLayers id.
 */
export function parseMeteo(params, today = todayIso()) {
  const layer = layerFromParam(params.get('capa'))
  if (!layer) return null
  const seta = params.get('seta')
  return {
    layer,
    species: typeof seta === 'string' && SPECIES_ID.test(seta) ? seta : null,
    day: clampDay(params.get('dia'), today),
  }
}

/**
 * New params with the Meteo state set, or removed with null (Meteo off, or a layer that cannot be
 * linked to); every other parameter is kept.
 */
export function withMeteo(params, meteo) {
  const next = new URLSearchParams(params)
  const capa = meteo ? paramOfLayer(meteo.layer) : null
  if (capa) {
    next.set('capa', capa)
    if (meteo.species) next.set('seta', meteo.species)
    else next.delete('seta')
    if (meteo.day) next.set('dia', meteo.day)
    else next.delete('dia')
  } else {
    next.delete('capa')
    next.delete('seta')
    next.delete('dia')
  }
  return next
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
 * a broken or default window is dropped, and so are a `capa` that names no built layer (with its `seta`
 * and `dia`), a broken `seta` or `dia`; a `dia` out of range is clamped: the address bar always says
 * what the page shows.
 */
export function canonicalParams(params, today = todayIso()) {
  const keys = ['lat', 'lon', 'hasta', 'dias', 'capa', 'seta', 'dia']
  if (!keys.some(k => params.has(k))) return null
  const view = parseView(params)
  const withView = view.point
    ? withWindow(withPoint(params, view.point), { until: view.until, days: view.days })
    : withPoint(params, null)
  const canonical = withMeteo(withView, parseMeteo(params, today))
  return canonical.toString() === params.toString() ? null : canonical
}
