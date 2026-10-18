// =====================================================
// territoryData.js — numbers behind «Área de territorio» (rain heat map and zone ranking)
//
// Pure functions. The rain comes from GET /observatory/territory/rain: `weeks` (Monday to Sunday,
// oldest first) and, per zone, `mm` with one value per week (null = no data that week).
// =====================================================

export const CATALONIA_CENTER = { lat: 41.7, lon: 1.75 }
export const MAP_W = 600
export const MAP_H = 609
/** Same box as src/data/cataloniaOutline.js */
export function projectCatalonia(lat, lon) {
  return { x: ((lon - 0.15) / 3.2) * MAP_W, y: ((42.9 - lat) / 2.4) * MAP_H }
}

/** Blue → violet → magenta, light to heavy rain. */
export const HEAT_RAMP = ['#38bdf8', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef']
const BIN_ALPHA = [18, 32, 48, 64, 82, 100]
export const HEAT_COLORS = HEAT_RAMP.map((c, i) => `color-mix(in srgb, ${c} ${BIN_ALPHA[i]}%, transparent)`)
const BINS_PER_WEEK = [5, 15, 30, 60, 120]

export const MIN_WEEKS = 1
export const MAX_WEEKS = 8

const nice = v => (v < 10 ? Math.round(v) : v < 100 ? Math.round(v / 5) * 5 : Math.round(v / 10) * 10)

/** Colour thresholds (mm) for a window of `nWeeks`: they grow with it so the scale keeps its meaning. */
export function binLimits(nWeeks) {
  return BINS_PER_WEEK.map(b => nice(b * nWeeks))
}

export function binOf(mm, limits) {
  let i = 0
  while (i < limits.length && mm >= limits[i]) i++
  return i
}

/** Clamps a window [a, b] (week indexes) to the allowed width and to 0..last. `mode` says which edge moved. */
export function clampWindow(a, b, last, mode = 'move') {
  a = Math.round(a); b = Math.round(b)
  if (b - a + 1 < MIN_WEEKS) { if (mode === 'l') a = b; else b = a }
  if (b - a + 1 > MAX_WEEKS) { if (mode === 'l') a = b - MAX_WEEKS + 1; else b = a + MAX_WEEKS - 1 }
  if (a < 0) { b += -a; a = 0 }
  if (b > last) { a -= b - last; b = last }
  return { a: Math.max(0, a), b: Math.min(last, b) }
}

/** Rain of each zone over weeks a..b. Zones with no data in the whole window are left out. */
export function windowTotals(zones, a, b) {
  const out = []
  for (const z of zones) {
    let sum = 0
    let got = 0
    for (let i = a; i <= b; i++) {
      const v = z.mm[i]
      if (v != null) { sum += v; got++ }
    }
    if (got) out.push({ zone: z, mm: Math.round(sum * 10) / 10, got })
  }
  return out
}

/** Mean rain per week across the zones that have data (null when none). */
export function weeklyMeans(zones, nWeeks) {
  return Array.from({ length: nWeeks }, (_, i) => {
    const xs = zones.map(z => z.mm[i]).filter(v => v != null)
    return xs.length ? xs.reduce((p, q) => p + q, 0) / xs.length : null
  })
}

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
