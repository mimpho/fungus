// =====================================================
// Probability by relief — the score of each pixel from the elevation it stands at
//
// The backend scores every cell at a few fixed elevations (`bands`, see layer_probability.py).
// A cell is ~8 x 11 km and can span hundreds of metres; here each pixel of the map takes the
// score of its own elevation (read from the elevation raster, which is never drawn), interpolated
// between the cell's bands, and blended with the neighbouring cells so there are no seams at the
// borders. Without the raster the same blend runs over each cell's own score (no relief).
// With the forest and substrate rasters each pixel's probability is also multiplied by the share
// of forest the species fits (forestFactor) and by how well its soil pH fits the substrate there. Pure functions: no React, no Leaflet.
// =====================================================
import { scoreRgba } from './layerColors'

const mercY = lat => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360))
const latOfMercY = y => ((2 * Math.atan(Math.exp(y)) - Math.PI / 2) * 180) / Math.PI

/**
 * Score at an elevation, from a cell's `bands` [[elevation_m, score], ...] sorted by elevation.
 * Linear between two bands; beyond the first or last it holds the edge value for half a step
 * (the species may still reach there), and after that there is nothing: null.
 */
export function scoreAtElevation(bands, elevation, step) {
  const n = bands?.length ?? 0
  if (!n) return null
  const half = step / 2
  const first = bands[0], last = bands[n - 1]
  if (elevation < first[0] - half || elevation > last[0] + half) return null
  if (elevation <= first[0]) return first[1]
  if (elevation >= last[0]) return last[1]
  for (let i = 1; i < n; i++) {
    const hi = bands[i]
    if (elevation > hi[0]) continue
    const lo = bands[i - 1]
    const gap = hi[0] - lo[0]
    if (gap > step * 1.5) { // a band is missing in between: only the near edge of each side counts
      if (elevation - lo[0] <= half) return lo[1]
      return hi[0] - elevation <= half ? hi[1] : null
    }
    return lo[1] + ((elevation - lo[0]) / gap) * (hi[1] - lo[1])
  }
  return null
}

// A pixel is influenced by the cells whose centre lies within REACH half-cells: at a centre only
// its own cell counts, halfway to the next centre both weigh the same, and from there on the
// neighbour takes over, so the colour changes over a whole cell width instead of at a border.
const REACH = 2
// Same slack the backend gives a species' altitude range (altitude_fit)
const RANGE_MARGIN_M = 150
// Share of forest the species fits below which nothing is painted (the point's species list uses
// the same 10 %), and the share from which the forest does not lower the probability any more.
const FOREST_MIN = 0.1
const FOREST_FULL = 0.4
// Substrate shares below this (of the pixel) count as 'no data': the soil does not judge it
const SOIL_MIN_SHARE = 0.05
// A habitat factor below this paints nothing
const MIN_FACTOR = 0.05

/** Multiplier (0-1) of the probability for a share (0-1) of forest the species fits. */
export function forestFactor(share) {
  if (share < FOREST_MIN) return 0
  if (share >= FOREST_FULL) return 1
  return (share - FOREST_MIN) / (FOREST_FULL - FOREST_MIN)
}

// Resolution of the picture drawn when there is no elevation raster (~1 km)
const FLAT_DEG = 0.01

/** Stand-in raster without relief: only the extent of the cells, at a coarse resolution. */
function flatRaster(cells) {
  let north = -90, south = 90, west = 180, east = -180
  for (const c of cells) {
    if (!c.half_lat || !c.half_lon) continue
    north = Math.max(north, c.lat + c.half_lat); south = Math.min(south, c.lat - c.half_lat)
    east = Math.max(east, c.lon + c.half_lon); west = Math.min(west, c.lon - c.half_lon)
  }
  if (north <= south || east <= west) return null
  const width = Math.max(1, Math.ceil((east - west) / FLAT_DEG))
  const height = Math.max(1, Math.ceil((mercY(north) - mercY(south)) * (180 / Math.PI) / FLAT_DEG))
  return { bounds: { north, south, west, east }, width, height, stepM: 1, data: null }
}

/**
 * What does not change with the species: for every pixel of the picture, its elevation, and for
 * every cell, the pixels it reaches. The picture is laid out in Web Mercator (rows evenly spaced
 * in projected y), because Leaflet stretches an image overlay linearly between its corners in
 * that projection. `cells` need lat, lon, half_lat, half_lon. Without `raster` the grid is flat.
 */
export function buildReliefGrid(raster, cells) {
  const flat = !raster?.data
  const r = flat ? flatRaster(cells) : raster
  if (!r) return null
  const { width: W, height: H, bounds: b, stepM, data } = r
  const yN = mercY(b.north), yS = mercY(b.south)
  const elev = new Uint16Array(W * H)
  const demIdx = flat ? null : new Uint32Array(W * H) // where each pixel sits in the raster's own grid
  if (flat) elev.fill(1)
  else {
    for (let row = 0; row < H; row++) {
      const lat = latOfMercY(yN - ((row + 0.5) / H) * (yN - yS))
      const demRow = Math.min(H - 1, Math.max(0, Math.floor(((b.north - lat) / (b.north - b.south)) * H)))
      for (let c = 0; c < W; c++) {
        elev[row * W + c] = data[demRow * W + c] * stepM
        demIdx[row * W + c] = demRow * W + c
      }
    }
  }

  const rowOf = lat => ((yN - mercY(lat)) / (yN - yS)) * H
  const colOf = lon => ((lon - b.west) / (b.east - b.west)) * W
  const reach = cells.map(cell => {
    if (!cell.half_lat || !cell.half_lon) return null
    const top = rowOf(cell.lat + cell.half_lat), bottom = rowOf(cell.lat - cell.half_lat)
    const left = colOf(cell.lon - cell.half_lon), right = colOf(cell.lon + cell.half_lon)
    const hr = (bottom - top) / 2, hc = (right - left) / 2
    const rc = (top + bottom) / 2, cc = (left + right) / 2
    return {
      rc, cc, hr, hc,
      r0: Math.max(0, Math.floor(rc - REACH * hr)), r1: Math.min(H - 1, Math.ceil(rc + REACH * hr)),
      c0: Math.max(0, Math.floor(cc - REACH * hc)), c1: Math.min(W - 1, Math.ceil(cc + REACH * hc)),
    }
  })
  return { width: W, height: H, bounds: b, elev, demIdx, reach, flat }
}

/**
 * Habitat factor of every pixel (Float32Array, 1 = no filter), or null when no filter applies.
 * `habitat` = { forest: { raster, classes }, soil: { raster, factors } }, each optional:
 *  - forest: the species fits the forest classes `classes` ([name, ...]); the share of them in the
 *    pixel goes through `forestFactor`.
 *  - soil: `factors[k]` (0-1) says how well the species' soil pH fits class k of the substrate
 *    raster; the pixel takes the mean over the classes present there (no filter where no data).
 * Rasters that do not share the elevation raster's grid are ignored.
 */
function habitatFactors(grid, habitat) {
  const N = grid.width * grid.height
  if (!habitat || grid.flat) return null
  const usable = r => r && r.width * r.height === N
  const forest = usable(habitat.forest?.raster) && habitat.forest.classes ? habitat.forest : null
  const soil = usable(habitat.soil?.raster) && habitat.soil.factors ? habitat.soil : null
  if (!forest && !soil) return null
  const fIdx = forest ? forest.classes.map(c => forest.raster.classes.indexOf(c)).filter(i => i >= 0) : []
  const out = new Float32Array(N).fill(1)
  for (let p = 0; p < N; p++) {
    const q = grid.demIdx[p]
    let f = 1
    if (forest) {
      let share = 0
      for (const k of fIdx) share += forest.raster.data[k * N + q]
      f = forestFactor(share / 255)
    }
    if (soil && f > 0) {
      let sum = 0, fit = 0
      for (let k = 0; k < soil.factors.length; k++) {
        const share = soil.raster.data[k * N + q]
        sum += share
        fit += share * soil.factors[k]
      }
      if (sum >= SOIL_MIN_SHARE * 255) f *= fit / sum
    }
    out[p] = f
  }
  return out
}

/**
 * RGBA pixels (Uint8ClampedArray, W x H) of the layer: each pixel coloured by the weighted mean
 * of the scores its neighbouring cells give at its elevation, times the habitat factor.
 * `range` is the species' [min, max] altitude, if known: nothing is painted outside it.
 * `habitat` = { forest, soil } to take the forest and the soil into account.
 */
export function paintRelief(grid, cells, step, range = null, habitat = null) {
  const { width: W, height: H, elev, reach, flat } = grid
  const factor = habitatFactors(grid, habitat)
  const num = new Float32Array(W * H), den = new Float32Array(W * H)
  const lo = range ? range[0] - RANGE_MARGIN_M : -Infinity
  const hi = range ? range[1] + RANGE_MARGIN_M : Infinity
  cells.forEach((cell, i) => {
    const g = reach[i]
    if (!g) return
    if (flat && (cell.status !== 'scored' || cell.score == null)) return
    for (let r = g.r0; r <= g.r1; r++) {
      const dr = (r + 0.5 - g.rc) / g.hr
      for (let c = g.c0; c <= g.c1; c++) {
        const dc = (c + 0.5 - g.cc) / g.hc
        const d = Math.sqrt(dr * dr + dc * dc)
        if (d >= REACH) continue
        const p = r * W + c
        const e = elev[p]
        if (e === 0 || (!flat && (e < lo || e > hi))) continue // sea, or outside the species' altitude
        if (factor && factor[p] < MIN_FACTOR) continue // no habitat the species fits
        const v = flat ? cell.score : scoreAtElevation(cell.bands, e, step)
        if (v == null) continue
        const w = (1 - d / REACH) ** 2
        num[p] += w * v
        den[p] += w
      }
    }
  })
  const rgba = new Uint8ClampedArray(W * H * 4)
  for (let p = 0; p < W * H; p++) {
    if (den[p] === 0) continue
    const [r, g, b, a] = scoreRgba((num[p] / den[p]) * (factor ? factor[p] : 1))
    const o = p * 4
    rgba[o] = r; rgba[o + 1] = g; rgba[o + 2] = b; rgba[o + 3] = a
  }
  return rgba
}

/**
 * Where an elevation falls in a cell's `bands` for the multi-species layer (each band holds one
 * score per species): the two bands around it, the fraction between them and how far each is.
 * Same rules as scoreAtElevation: nothing beyond half a step past the ends or an interior gap.
 * Returns null, or fills and returns `out` = { lo, hi, t, dLo, dHi, loOk, hiOk }.
 */
function locateBands(bands, elevation, step, out) {
  const n = bands?.length ?? 0
  if (!n) return null
  const half = step / 2
  const first = bands[0], last = bands[n - 1]
  if (elevation < first[0] - half || elevation > last[0] + half) return null
  out.loOk = out.hiOk = true
  if (elevation <= first[0] || elevation >= last[0]) {
    out.lo = out.hi = elevation <= first[0] ? first : last
    out.t = 0
    out.dLo = out.dHi = Math.abs(elevation - out.lo[0])
    return out
  }
  for (let i = 1; i < n; i++) {
    if (elevation > bands[i][0]) continue
    const lo = bands[i - 1], hi = bands[i]
    out.lo = lo; out.hi = hi
    out.dLo = elevation - lo[0]; out.dHi = hi[0] - elevation
    const gap = hi[0] - lo[0]
    out.t = gap > 0 ? out.dLo / gap : 0
    if (gap > step * 1.5) { // a band is missing in between: only the near edge of each side counts
      out.loOk = out.dLo <= half
      out.hiOk = out.dHi <= half
      if (!out.loOk && !out.hiOk) return null
    }
    return out
  }
  return null
}

/** Rows painted per pass of paintReliefMany (keeps the working arrays small). */
const CHUNK_ROWS = 48

/**
 * RGBA pixels of the multi-species layer: at each pixel, the MEAN over the species that grow
 * there of their own probability (blended across cells at the pixel's elevation, times the
 * species' forest and soil factors). A species counts at a pixel when its altitude range
 * (± margin) holds the pixel's elevation, some cell reaches it with a score, and its habitat
 * factor is at least MIN_FACTOR. Pixels with no species present are not painted.
 * `layer` = { species: [{ elevation_min_m, elevation_max_m, forest_classes, substrate_factors }],
 *   substrate_classes, band_step_m, cells: [{ score: [...], bands: [[elev, [...]], ...] }] }.
 * `rasters` = { forest, substrate } class rasters on the elevation grid (each optional).
 */
export function paintReliefMany(grid, layer, rasters = {}) {
  const { width: W, height: H, elev, reach, flat } = grid
  const cells = layer.cells, species = layer.species, S = species.length
  const step = layer.band_step_m
  const N = W * H
  const rgba = new Uint8ClampedArray(N * 4)
  if (!S) return rgba

  const usable = r => !flat && r && r.width * r.height === N
  const forestR = usable(rasters.forest) ? rasters.forest : null
  const soilR = usable(rasters.substrate) ? rasters.substrate : null
  const nF = forestR ? forestR.classes.length : 0
  const nS = soilR ? soilR.classes.length : 0
  const spec = species.map(sp => ({
    lo: sp.elevation_min_m != null ? sp.elevation_min_m - RANGE_MARGIN_M : -Infinity,
    hi: sp.elevation_max_m != null ? sp.elevation_max_m + RANGE_MARGIN_M : Infinity,
    forest: forestR && sp.forest_classes
      ? sp.forest_classes.map(c => forestR.classes.indexOf(c)).filter(i => i >= 0) : null,
    soil: soilR && sp.substrate_factors
      ? matchClasses(layer.substrate_classes, sp.substrate_factors, soilR.classes) : null,
  }))

  const num = new Float32Array(CHUNK_ROWS * W * S), den = new Float32Array(CHUNK_ROWS * W * S)
  const fShare = new Float32Array(nF), sShare = new Float32Array(nS)
  const loc = {}
  for (let rowA = 0; rowA < H; rowA += CHUNK_ROWS) {
    const rowB = Math.min(H - 1, rowA + CHUNK_ROWS - 1)
    num.fill(0); den.fill(0)
    cells.forEach((cell, i) => {
      const g = reach[i]
      if (!g || g.r1 < rowA || g.r0 > rowB) return
      if (flat && cell.status !== 'scored') return
      const scores = cell.score
      for (let r = Math.max(g.r0, rowA); r <= Math.min(g.r1, rowB); r++) {
        const dr = (r + 0.5 - g.rc) / g.hr
        for (let c = g.c0; c <= g.c1; c++) {
          const dc = (c + 0.5 - g.cc) / g.hc
          const d = Math.sqrt(dr * dr + dc * dc)
          if (d >= REACH) continue
          const p = r * W + c
          const e = elev[p]
          if (e === 0) continue
          const w = (1 - d / REACH) ** 2
          const base = ((r - rowA) * W + c) * S
          if (flat) {
            for (let s = 0; s < S; s++) {
              const v = scores?.[s]
              if (v == null) continue
              num[base + s] += w * v; den[base + s] += w
            }
            continue
          }
          if (!locateBands(cell.bands, e, step, loc)) continue
          const { lo, hi, t, dLo, dHi, loOk, hiOk } = loc
          const half = step / 2
          for (let s = 0; s < S; s++) {
            const a = loOk ? lo[1][s] : null, b = hiOk ? hi[1][s] : null
            let v
            if (a != null && b != null) v = a + t * (b - a)
            else if (a != null && dLo <= half) v = a
            else if (b != null && dHi <= half) v = b
            else continue
            num[base + s] += w * v; den[base + s] += w
          }
        }
      }
    })
    for (let r = rowA; r <= rowB; r++) {
      for (let c = 0; c < W; c++) {
        const p = r * W + c
        const e = elev[p]
        if (e === 0) continue
        const base = ((r - rowA) * W + c) * S
        if (forestR || soilR) {
          const q = grid.demIdx[p]
          for (let k = 0; k < nF; k++) fShare[k] = forestR.data[k * N + q] / 255
          for (let k = 0; k < nS; k++) sShare[k] = soilR.data[k * N + q]
        }
        let sum = 0, count = 0
        for (let s = 0; s < S; s++) {
          const dn = den[base + s]
          if (dn === 0) continue
          const sp = spec[s]
          if (!flat && (e < sp.lo || e > sp.hi)) continue
          let f = 1
          if (sp.forest) {
            let share = 0
            for (const k of sp.forest) share += fShare[k]
            f = forestFactor(share)
          }
          if (sp.soil && f > 0) {
            let tot = 0, fit = 0
            for (let k = 0; k < nS; k++) { tot += sShare[k]; fit += sShare[k] * sp.soil[k] }
            if (tot >= SOIL_MIN_SHARE * 255) f *= fit / tot
          }
          if (f < MIN_FACTOR) continue
          sum += (num[base + s] / dn) * f
          count++
        }
        if (!count) continue
        const [R, G, B, A] = scoreRgba(sum / count)
        const o = p * 4
        rgba[o] = R; rgba[o + 1] = G; rgba[o + 2] = B; rgba[o + 3] = A
      }
    }
  }
  return rgba
}

/** Habitat factor (0-1) of a species at the raster index `q` of a pixel, as paintRelief/paintReliefMany compute it. */
function factorAt(sp, q, N, rasters) {
  let f = 1
  const forestR = rasters.forest, soilR = rasters.substrate
  if (forestR && forestR.width * forestR.height === N && sp.forest_classes) {
    let share = 0
    for (const c of sp.forest_classes) {
      const k = forestR.classes.indexOf(c)
      if (k >= 0) share += forestR.data[k * N + q]
    }
    f = forestFactor(share / 255)
  }
  if (soilR && soilR.width * soilR.height === N && sp.substrate_factors && f > 0) {
    const factors = matchClasses(sp.substrate_classes, sp.substrate_factors, soilR.classes)
    let tot = 0, fit = 0
    for (let k = 0; k < factors.length; k++) {
      const share = soilR.data[k * N + q]
      tot += share; fit += share * factors[k]
    }
    if (tot >= SOIL_MIN_SHARE * 255) f *= fit / tot
  }
  return f
}

/**
 * The value the layer paints at one spot: { score (0-100), count } or null when nothing is painted
 * there. `count` = how many species it is the mean of (1 for a single species). Same rules as the
 * painters, for the pixel that holds (lat, lon). `layer` is the answer of either endpoint.
 */
export function pixelScore(grid, layer, rasters, lat, lon) {
  if (!grid || !layer?.cells?.length) return null
  const { width: W, height: H, bounds: b, elev, reach, flat } = grid
  const row = Math.floor(((mercY(b.north) - mercY(lat)) / (mercY(b.north) - mercY(b.south))) * H)
  const col = Math.floor(((lon - b.west) / (b.east - b.west)) * W)
  if (row < 0 || row >= H || col < 0 || col >= W) return null
  const p = row * W + col
  const e = elev[p]
  if (e === 0) return null
  const multi = Array.isArray(layer.species)
  const list = multi ? layer.species : [layer.species ?? {}]
  const S = list.length
  const step = layer.band_step_m
  const num = new Float64Array(S), den = new Float64Array(S)
  const loc = {}
  layer.cells.forEach((cell, i) => {
    const g = reach[i]
    if (!g || row < g.r0 || row > g.r1 || col < g.c0 || col > g.c1) return
    const d = Math.hypot((row + 0.5 - g.rc) / g.hr, (col + 0.5 - g.cc) / g.hc)
    if (d >= REACH) return
    const w = (1 - d / REACH) ** 2
    for (let k = 0; k < S; k++) {
      let v
      if (flat) v = cell.status === 'scored' ? (multi ? cell.score?.[k] : cell.score) : null
      else if (multi) {
        if (!locateBands(cell.bands, e, step, loc)) continue
        const { lo, hi, t, dLo, dHi, loOk, hiOk } = loc
        const a = loOk ? lo[1][k] : null, bb = hiOk ? hi[1][k] : null
        if (a != null && bb != null) v = a + t * (bb - a)
        else if (a != null && dLo <= step / 2) v = a
        else if (bb != null && dHi <= step / 2) v = bb
      } else v = scoreAtElevation(cell.bands, e, step)
      if (v == null) continue
      num[k] += w * v; den[k] += w
    }
  })
  let sum = 0, count = 0
  const q = grid.demIdx ? grid.demIdx[p] : 0
  for (let k = 0; k < S; k++) {
    if (den[k] === 0) continue
    const sp = list[k]
    if (!flat && sp.elevation_min_m != null && sp.elevation_max_m != null
        && (e < sp.elevation_min_m - RANGE_MARGIN_M || e > sp.elevation_max_m + RANGE_MARGIN_M)) continue
    const f = flat ? 1 : factorAt(multi ? { ...sp, substrate_classes: layer.substrate_classes } : sp, q, W * H, rasters ?? {})
    if (f < MIN_FACTOR) continue
    sum += (num[k] / den[k]) * f
    count++
  }
  return count ? { score: sum / count, count } : null
}

/** Elevation (m) of the raster pixel that holds (lat, lon); null outside it or where it has no data. */
export function pixelElevation(grid, lat, lon) {
  if (!grid || grid.flat) return null
  const { width: W, height: H, bounds: b, elev } = grid
  const row = Math.floor(((mercY(b.north) - mercY(lat)) / (mercY(b.north) - mercY(b.south))) * H)
  const col = Math.floor(((lon - b.west) / (b.east - b.west)) * W)
  if (row < 0 || row >= H || col < 0 || col >= W) return null
  const e = elev[row * W + col]
  return e > 0 ? e : null
}

let gridCache = { raster: undefined, key: null, grid: null }

/** Same as buildReliefGrid, remembered while the cells are the same (they do not depend on the species). */
export function reliefGrid(raster, cells) {
  const key = cells.map(c => c.id).join('|')
  if (gridCache.raster !== raster || gridCache.key !== key) gridCache = { raster, key, grid: buildReliefGrid(raster, cells) }
  return gridCache.grid
}

/** The species' soil factors in the order of the raster's classes (by name; 1 where unknown). */
function matchClasses(names, factors, rasterClasses) {
  return rasterClasses.map(c => {
    const i = names?.indexOf(c) ?? -1
    return i >= 0 ? factors[i] : 1
  })
}

/** Picture of the layer for Leaflet, or null if there is nothing to draw: { url, bounds: [[south, west], [north, east]] }. */
export function reliefOverlay(raster, layer, rasters = {}) {
  const cells = layer.cells
  const grid = reliefGrid(raster, cells)
  if (!grid) return null
  const sp = layer.species
  const multi = Array.isArray(sp) // the excellent species together (see paintReliefMany)
  const range = multi ? null : sp && sp.elevation_min_m != null && sp.elevation_max_m != null
    ? [sp.elevation_min_m, sp.elevation_max_m] : null
  const habitat = multi ? null : {
    forest: rasters.forest && sp?.forest_classes ? { raster: rasters.forest, classes: sp.forest_classes } : null,
    soil: rasters.substrate && sp?.substrate_factors
      ? { raster: rasters.substrate, factors: matchClasses(sp.substrate_classes, sp.substrate_factors, rasters.substrate.classes) }
      : null,
  }
  const rgba = multi ? paintReliefMany(grid, layer, rasters) : paintRelief(grid, cells, layer.band_step_m, range, habitat)
  const canvas = document.createElement('canvas')
  canvas.width = grid.width
  canvas.height = grid.height
  canvas.getContext('2d').putImageData(new ImageData(rgba, grid.width, grid.height), 0, 0)
  const b = grid.bounds
  return { url: canvas.toDataURL('image/png'), bounds: [[b.south, b.west], [b.north, b.east]] }
}
