import { isInCatalonia } from './catalonia'

// Pure helpers for the map search box (no network, no React).

const DOT_PAIR   = /^\s*(-?\d+(?:\.\d+)?)\s*°?\s*[,;/\s]\s*(-?\d+(?:\.\d+)?)\s*°?\s*$/
const COMMA_PAIR = /^\s*(-?\d+,\d+)\s*°?\s*[;\s]\s*(-?\d+,\d+)\s*°?\s*$/

const round5 = n => Math.round(n * 1e5) / 1e5

/**
 * Reads "42.3474, 2.3174" (also "42.3474 2.3174", "42,3474; 2,3174", with or without °).
 * Returns null when the text is not a pair of numbers (so it is a place name),
 * { lat, lon } when it is inside Catalonia (lon, lat order is accepted too),
 * { error: 'outside' } when it is a coordinate pair but not in Catalonia.
 */
export function parseCoordinates(text) {
  if (typeof text !== 'string') return null
  let m = text.match(DOT_PAIR)
  let a, b
  if (m) {
    a = Number(m[1]); b = Number(m[2])
  } else {
    m = text.match(COMMA_PAIR)
    if (!m) return null
    a = Number(m[1].replace(',', '.')); b = Number(m[2].replace(',', '.'))
  }
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null
  if (isInCatalonia(a, b)) return { lat: round5(a), lon: round5(b) }
  if (isInCatalonia(b, a)) return { lat: round5(b), lon: round5(a) }
  return { error: 'outside' }
}
