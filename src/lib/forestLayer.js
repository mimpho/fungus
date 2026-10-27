// =====================================================
// Forest type layer — the CREAF forest raster painted by the dominant type of each pixel
//
// The class raster of 'forest' (see classRaster.js) holds, for every ~250 m pixel, the share of
// each forest class (pinar, encinar, hayedo, robledal, otro). This layer paints each pixel with the
// colour of its biggest class; a class can be switched off (the legend is the filter), and then the
// pixel takes the biggest of the classes still on. Where the forest is thin the colour fades out.
// Pure functions: no React, no Leaflet. Colours are literal hex (Leaflet rule, agents.spec.md #10).
// =====================================================

/** Forest types the map can tell apart, in legend order, with their colour and label key. */
// The colours stay out of red, orange, yellow and green: those are the score bands of the
// conditions layer, and with both layers on a forest colour must not read as a score.
export const FOREST_TYPES = [
  { key: 'pinar',    hex: '#3b82f6', label: 'obsFtPinar' },
  { key: 'encinar',  hex: '#a855f7', label: 'obsFtEncinar' },
  { key: 'hayedo',   hex: '#22d3ee', label: 'obsFtHayedo' },
  { key: 'robledal', hex: '#f472b6', label: 'obsFtRobledal' },
  { key: 'otro',     hex: '#475569', label: 'obsMacroOtro' },
]

// Same noise floor as the point's forest list and the probability layer (FOREST_MIN)
const MIN_SHARE = 0.1
// From this share of forest (of the classes shown) the colour is at full strength
const FULL_SHARE = 0.5
const MAX_ALPHA = 0.7

const mercY = lat => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360))
const latOfMercY = y => ((2 * Math.atan(Math.exp(y)) - Math.PI / 2) * 180) / Math.PI
const toRgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16))

/**
 * RGBA pixels (Uint8ClampedArray, width x height of the raster, rows evenly spaced in Web Mercator
 * because Leaflet stretches an image overlay linearly in that projection) of the forest type map.
 * `active` is the Set of class keys shown. Pixels with less than 10 % of the active classes stay
 * transparent. Returns null if the raster is missing or empty.
 */
export function paintForestTypes(raster, active, { alphaScale = 1 } = {}) {
  if (!raster?.data || !raster.classes?.length) return null
  const { width: W, height: H, bounds: b, classes, data } = raster
  const N = W * H
  const ks = FOREST_TYPES
    .filter(ft => active.has(ft.key))
    .map(ft => ({ idx: classes.indexOf(ft.key), rgb: toRgb(ft.hex) }))
    .filter(k => k.idx >= 0)
  const rgba = new Uint8ClampedArray(N * 4)
  if (!ks.length) return rgba
  const yN = mercY(b.north), yS = mercY(b.south)
  for (let row = 0; row < H; row++) {
    const lat = latOfMercY(yN - ((row + 0.5) / H) * (yN - yS))
    const src = Math.min(H - 1, Math.max(0, Math.floor(((b.north - lat) / (b.north - b.south)) * H)))
    for (let c = 0; c < W; c++) {
      const q = src * W + c
      let best = -1, bestShare = 0, total = 0
      for (let i = 0; i < ks.length; i++) {
        const v = data[ks[i].idx * N + q]
        total += v
        if (v > bestShare) { bestShare = v; best = i }
      }
      const share = total / 255
      if (best < 0 || share < MIN_SHARE) continue
      const o = (row * W + c) * 4
      const rgb = ks[best].rgb
      rgba[o] = rgb[0]; rgba[o + 1] = rgb[1]; rgba[o + 2] = rgb[2]
      rgba[o + 3] = Math.round(255 * MAX_ALPHA * alphaScale * Math.min(1, share / FULL_SHARE))
    }
  }
  return rgba
}

/** { url, bounds } of the picture for L.imageOverlay, or null. */
export function forestTypeOverlay(raster, active, opts) {
  const rgba = paintForestTypes(raster, active, opts)
  if (!rgba) return null
  const canvas = document.createElement('canvas')
  canvas.width = raster.width
  canvas.height = raster.height
  canvas.getContext('2d').putImageData(new ImageData(rgba, raster.width, raster.height), 0, 0)
  const b = raster.bounds
  return { url: canvas.toDataURL('image/png'), bounds: [[b.south, b.west], [b.north, b.east]] }
}
