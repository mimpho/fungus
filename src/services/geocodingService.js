import { CATALONIA_BOUNDS, isInCatalonia } from '../lib/catalonia'
import { ObservatoryError } from './observatoryService'

// Place search for the Observatory map. The Fungus backend only does reverse geocoding, and
// Open-Meteo's geocoder only knows populated places (no passes, peaks or springs, which is what
// foragers look for), so the browser asks Photon (OpenStreetMap data, typeahead allowed, CORS
// enabled) restricted to Catalonia's box. Public instance, fair use, no SLA: if the app grows,
// this module is the one to swap for a backend endpoint.
const PHOTON_URL = 'https://photon.komoot.io/api/'
const BBOX = `${CATALONIA_BOUNDS.lon[0]},${CATALONIA_BOUNDS.lat[0]},${CATALONIA_BOUNDS.lon[1]},${CATALONIA_BOUNDS.lat[1]}`
const SAME_PLACE_DEG = 0.01 // ~1 km: same name this close is the same place (pass + its car park)

const TOWN_VALUES = new Set(['city', 'town', 'village', 'hamlet', 'suburb', 'neighbourhood', 'quarter', 'municipality'])

/** What kind of feature it is, as a code the UI turns into a word; null when it is not worth saying. */
export function placeKind(key, value) {
  if (key === 'mountain_pass' || value === 'mountain_pass' || value === 'saddle') return 'pass' // real data: key mountain_pass, value yes
  if (value === 'peak' || value === 'volcano') return 'peak'
  if (value === 'spring') return 'spring'
  if (value === 'viewpoint') return 'viewpoint'
  if (key === 'place') return TOWN_VALUES.has(value) ? 'town' : 'locality'
  if (key === 'natural' && value === 'wood') return 'forest'
  if (key === 'landuse' && value === 'forest') return 'forest'
  return null
}

const round5 = n => Math.round(n * 1e5) / 1e5

/**
 * @returns {Promise<Array<{id, name, kind, area, lat, lon}>>}
 * Throws ObservatoryError('unavailable' | 'network'); an aborted request rejects with AbortError.
 */
export async function searchPlaces(query, { signal } = {}) {
  const params = new URLSearchParams({ q: query, bbox: BBOX, limit: '12' })
  let res
  try {
    res = await fetch(`${PHOTON_URL}?${params}`, { signal })
  } catch (e) {
    if (e?.name === 'AbortError') throw e
    throw new ObservatoryError('network')
  }
  if (!res.ok) throw new ObservatoryError('unavailable', { status: res.status })

  let data
  try { data = await res.json() } catch (_e) { throw new ObservatoryError('unavailable') }

  const kept = []
  for (const f of data.features ?? []) {
    const p = f.properties ?? {}
    const [lon, lat] = f.geometry?.coordinates ?? []
    if (!p.name || !Number.isFinite(lat) || !Number.isFinite(lon)) continue
    // The box also covers Andorra, France and Aragon
    if (p.countrycode !== 'ES' || !/catal/i.test(p.state ?? '') || !isInCatalonia(lat, lon)) continue
    const same = kept.some(k => k.name.toLowerCase() === p.name.toLowerCase()
      && Math.abs(k.lat - lat) < SAME_PLACE_DEG && Math.abs(k.lon - lon) < SAME_PLACE_DEG)
    if (same) continue
    kept.push({
      id: `${p.osm_type}${p.osm_id}`,
      name: p.name,
      kind: placeKind(p.osm_key, p.osm_value),
      area: [p.city && p.city !== p.name ? p.city : null, p.county].filter(Boolean).join(', ') || null,
      lat: round5(lat),
      lon: round5(lon),
    })
  }
  return kept
}
