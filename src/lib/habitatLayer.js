// =====================================================
// Habitat of a species — where it can grow, with no weather, no date and no season
//
// Hábitat · De la seta (T3 of epic/observatory-species-filter). For every pixel of the elevation raster:
// nothing outside the species' altitude range ± RANGE_MARGIN_M; inside it, the habitat factor (0-1) of
// reliefLayer's habitatFactors (share of the forest classes it fits × their weights, through forestFactor,
// times how well its soil pH fits the substrate), coloured with the five bands of Condiciones on
// `factor × 100`. A pixel under MIN_FACTOR is not painted. No cells are read, so the picture is the
// same on any day, in or out of the species' fruiting months.
// Pure functions: no React, no Leaflet.
// =====================================================
import { buildReliefGrid, habitatFactors, matchClasses, MIN_FACTOR, RANGE_MARGIN_M } from './reliefLayer'
import { scoreRgba } from './layerColors'

// The grid (elevation and raster index of each pixel) depends only on the elevation raster
let gridCache = { raster: undefined, grid: null }
function habitatGrid(raster) {
  if (gridCache.raster !== raster) gridCache = { raster, grid: buildReliefGrid(raster, []) }
  return gridCache.grid
}

/**
 * What the species block of the layer answer lets the habitat use, given the rasters:
 * `habitat` for habitatFactors (forest / soil, each null when the species or the raster lacks it).
 */
export function habitatInputs(sp, rasters = {}) {
  return {
    forest: rasters.forest && sp?.forest_classes
      ? { raster: rasters.forest, classes: sp.forest_classes, weights: sp.forest_class_weights } : null,
    soil: rasters.substrate && sp?.substrate_factors
      ? { raster: rasters.substrate, factors: matchClasses(sp.substrate_classes, sp.substrate_factors, rasters.substrate.classes) }
      : null,
  }
}

/**
 * RGBA pixels (W x H of the elevation raster) of the species' habitat, or null when the species gives
 * nothing to judge by (no altitude range, no forest classes, no soil data).
 */
export function paintHabitat(grid, sp, rasters = {}) {
  if (!grid || grid.flat) return null
  const hasRange = sp?.elevation_min_m != null && sp?.elevation_max_m != null
  const habitat = habitatInputs(sp, rasters)
  if (!hasRange && !habitat.forest && !habitat.soil) return null
  const { width: W, height: H, elev } = grid
  const factor = habitatFactors(grid, habitat)
  const lo = hasRange ? sp.elevation_min_m - RANGE_MARGIN_M : -Infinity
  const hi = hasRange ? sp.elevation_max_m + RANGE_MARGIN_M : Infinity
  const rgba = new Uint8ClampedArray(W * H * 4)
  for (let p = 0; p < W * H; p++) {
    const e = elev[p]
    if (e === 0 || e < lo || e > hi) continue // sea, or outside the species' altitude
    const f = factor ? factor[p] : 1
    if (f < MIN_FACTOR) continue
    const [r, g, b, a] = scoreRgba(f * 100)
    const o = p * 4
    rgba[o] = r; rgba[o + 1] = g; rgba[o + 2] = b; rgba[o + 3] = a
  }
  return rgba
}

/** { url, bounds } of the habitat picture for L.imageOverlay, or null. `alphaScale` as in reliefOverlay. */
export function habitatOverlay(elevation, sp, rasters = {}, { alphaScale = 1 } = {}) {
  const grid = habitatGrid(elevation)
  const rgba = paintHabitat(grid, sp, rasters)
  if (!rgba) return null
  if (alphaScale !== 1) for (let i = 3; i < rgba.length; i += 4) rgba[i] *= alphaScale // clamped to 255
  const canvas = document.createElement('canvas')
  canvas.width = grid.width
  canvas.height = grid.height
  canvas.getContext('2d').putImageData(new ImageData(rgba, grid.width, grid.height), 0, 0)
  const b = grid.bounds
  return { url: canvas.toDataURL('image/png'), bounds: [[b.south, b.west], [b.north, b.east]] }
}
