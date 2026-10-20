// =====================================================
// Class rasters of Catalonia — the maps that are never drawn
//
// Built by backend/scripts/build_forest_raster.py (forest: CREAF MCSC-4) and
// build_substrate_raster.py (soil acidity: ICGC lithological groups) and served by the API behind
// login. For every ~250 m pixel, the share of each class (forest: pinar, encinar, hayedo,
// robledal, otro; substrate: acid, mixed, calcareous), one byte each, class after class, on the
// same grid as the elevation raster. The probability layer multiplies a pixel's probability by
// how well the species fits what is there.
// =====================================================
import { fetchClassRaster } from '../services/observatoryService'

const cache = {}

// A point's forest is the mean of the pixels around it (the server looks within 500 m, see
// backend point_habitat.HABITAT_RADIUS_M), not the one pixel under it: a field beside a wood has
// the wood around it. The forest raster is smoothed once, on load, the same way (the pixels whose
// centre is within 2 pixels, ~500 m), so the layer and the point panel say what the point does.
// The substrate stays as it is: the geology changes little at that scale.
const FOREST_RADIUS_PX = 2

function smooth(data, classes, width, height, radiusPx) {
  const offsets = []
  for (let dr = -radiusPx; dr <= radiusPx; dr++) {
    for (let dc = -radiusPx; dc <= radiusPx; dc++) {
      if (Math.hypot(dr, dc) <= radiusPx + 1e-9) offsets.push([dr, dc])
    }
  }
  const n = width * height
  const out = new Uint8Array(data.length)
  for (let k = 0; k < classes.length; k++) {
    const base = k * n
    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        let sum = 0, count = 0
        for (const [dr, dc] of offsets) {
          const rr = r + dr, cc = c + dc
          if (rr < 0 || rr >= height || cc < 0 || cc >= width) continue
          sum += data[base + rr * width + cc]
          count++
        }
        out[base + r * width + c] = Math.round(sum / count)
      }
    }
  }
  return out
}

async function load(kind) {
  const [meta, buffer] = await fetchClassRaster(kind)
  const data = new Uint8Array(buffer)
  const { width, height, bounds, classes } = meta ?? {}
  if (!bounds || !Array.isArray(classes) || data.length !== classes.length * width * height) {
    throw new Error(`${kind} raster does not match its description`)
  }
  return { bounds, width, height, classes, data: kind === 'forest' ? smooth(data, classes, width, height, FOREST_RADIUS_PX) : data }
}

/** The raster { bounds, width, height, classes, data } of a kind, loaded once. Rejects if it is not there. */
export function loadClassRaster(kind) {
  if (!cache[kind]) cache[kind] = load(kind).catch(err => { cache[kind] = null; throw err })
  return cache[kind]
}
