// =====================================================
// territoryData.js — numbers behind the zone ranking of «Área de territorio»
//
// Pure functions.
// =====================================================

export const CATALONIA_CENTER = { lat: 41.7, lon: 1.75 }

export function distanceKm(aLat, aLon, bLat, bLon) {
  const R = 6371
  const rad = d => (d * Math.PI) / 180
  const dLat = rad(bLat - aLat)
  const dLon = rad(bLon - aLon)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

/**
 * Ranking rows. `zones` are frontend zones ({id,name,region,lat,lng,elevation}); `conditions` maps id →
 * conditions (only entries from the API count). `mode` 'near' takes the `limit` zones closest to `ref`,
 * 'followed' the ids in `followedIds`. Sorted by score, best first.
 */
export function buildRanking({ zones, conditions, ref, mode, followedIds, limit = 20 }) {
  const rows = []
  for (const z of zones) {
    const c = conditions[z.id]
    if (!c || c._source !== 'api' || !Number.isFinite(c.overallScore)) continue
    rows.push({ zone: z, c, km: distanceKm(ref.lat, ref.lon, z.lat, z.lng) })
  }
  const pool = mode === 'followed'
    ? rows.filter(r => followedIds.has(r.zone.id))
    : rows.sort((x, y) => x.km - y.km).slice(0, limit)
  return pool.sort((x, y) => y.c.overallScore - x.c.overallScore)
}
