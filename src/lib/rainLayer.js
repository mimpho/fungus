// =====================================================
// Rain layer — the accumulated rain of every cell, smoothed into one picture
//
// The backend answers one figure per cell (see layer_rain.py). Each pixel takes the mean in mm of the
// cells around it, on the same grid and with the same weights as Condiciones (reliefLayer.js): at a
// cell's centre only that cell counts, halfway to the next centre both weigh the same. The colour then
// goes between the marks of the window's scale, so the colour and the figure at a spot are the same
// number. A cell without data is hatched: it gives nothing to the blend and no neighbour paints over
// it. The picture is cut along Catalonia's boundary, coast included; a strip along it that no cell's
// footprint holds takes the blend of the cells in reach. No relief, forest or soil: the elevation raster is not needed (its coarse steps
// read the low coast, the Ebro delta among it, as sea).
// Pure functions: no React, no Leaflet.
// =====================================================
import { reliefGrid } from './reliefLayer'
import { RAIN_SCALES } from './meteoLayers'
import { CATALONIA_RINGS } from './cataloniaOutline'

// The colour of each mark, light blue (transparent, then 60 %) → blue → violet → garnet → dark garnet.
// Literal values: the canvas cannot read CSS vars. Keep them equal to --meteo-rain-1…6 in tokens.css (the
// legend). There is no white: light rain lets the map through instead of covering it
const RAIN_HEX = ['#8cc3ea', '#8cc3ea', '#2f6fc0', '#6a3f98', '#8c1c38', '#4a0818']
const RAIN_RGB = RAIN_HEX.map(hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)))
// Opacity of each mark's colour, before the base map's
const RAIN_STOP_ALPHA = [0, 0.6, 1, 1, 1, 1]

// Opacity of the layer per base map, with plain alpha (no blend: `multiply` would hide the light blue and
// `hard-light` would distort the colours). Raise a figure for stronger colour, lower it to see more map.
export const RAIN_ALPHA_BY_BASEMAP = { satellite: 0.72, streets: 0.62, relief: 0.68 }

// Same weights as the conditions layer (REACH there)
const REACH = 2
// Slack around a cell's footprint, in half-cells: rows have their own width, so rounding can leave
// a hairline between two cells
const SLACK = 0.02

// The picture's own grid, ~250 m per pixel over Catalonia's box: reliefGrid's, with no elevations to read
const RAIN_GRID = {
  bounds: { north: 42.87, south: 40.51, west: 0.15, east: 3.34 },
  width: 1100, height: 1090, stepM: 1,
  data: new Uint8Array(1100 * 1090),
}
export const rainGrid = cells => reliefGrid(RAIN_GRID, cells)

// The hatching of a cell without data, in pixels of the picture (~250 m each): a dark stripe with a
// light one beside it, so it reads over dark and light maps. Same colours as the --meteo-rain-hatch tokens
export const HATCH = { period: 8, width: 2, dark: [30, 36, 25, 150], light: [244, 235, 225, 150] }

/**
 * [r, g, b, a] of an amount of rain: colour and opacity go linearly in mm from one mark to the next and
 * stay at the last one. Up to the first mark (1 mm) it is transparent.
 * `a` is 0-1, before the base map's opacity.
 */
export function rainRgba(mm, marks) {
  if (!(mm > 0)) return [...RAIN_RGB[0], 0]
  if (mm < marks[0]) return [...RAIN_RGB[0], (mm / marks[0]) * RAIN_STOP_ALPHA[0]]
  for (let i = 1; i < marks.length; i++) {
    if (mm > marks[i]) continue
    const t = (mm - marks[i - 1]) / (marks[i] - marks[i - 1])
    const a = RAIN_RGB[i - 1], b = RAIN_RGB[i]
    const alpha = RAIN_STOP_ALPHA[i - 1] + t * (RAIN_STOP_ALPHA[i] - RAIN_STOP_ALPHA[i - 1])
    return [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1]), a[2] + t * (b[2] - a[2]), alpha]
  }
  return [...RAIN_RGB[RAIN_RGB.length - 1], RAIN_STOP_ALPHA[RAIN_STOP_ALPHA.length - 1]]
}

/** How far a pixel's centre is from a cell's centre, in half-cells per axis (<= 1 = inside it). */
const outside = (g, r, c) => Math.max(Math.abs((r + 0.5 - g.rc) / g.hr), Math.abs((c + 0.5 - g.cc) / g.hc))

/** Weight of a cell at a pixel (0 beyond REACH). */
function weight(g, r, c) {
  const d = Math.hypot((r + 0.5 - g.rc) / g.hr, (c + 0.5 - g.cc) / g.hc)
  return d >= REACH ? 0 : (1 - d / REACH) ** 2
}

/** For every pixel, the index of the cell whose footprint holds it (the nearest one), or -1. */
function footprints(grid) {
  const { width: W, height: H, reach } = grid
  const owner = new Int32Array(W * H).fill(-1)
  const best = new Float32Array(W * H).fill(Infinity)
  reach.forEach((g, i) => {
    if (!g) return
    const m = 1 + SLACK
    const r0 = Math.max(0, Math.floor(g.rc - m * g.hr)), r1 = Math.min(H - 1, Math.ceil(g.rc + m * g.hr))
    const c0 = Math.max(0, Math.floor(g.cc - m * g.hc)), c1 = Math.min(W - 1, Math.ceil(g.cc + m * g.hc))
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        const o = outside(g, r, c)
        const p = r * W + c
        if (o <= m && o < best[p]) { best[p] = o; owner[p] = i }
      }
    }
  })
  return owner
}

/** RGBA pixels (Uint8ClampedArray, W x H of the grid) of the layer. `alpha` multiplies the colours. */
export function paintRain(grid, cells, marks, alpha = 1) {
  const { width: W, height: H, reach } = grid
  const owner = footprints(grid)
  const num = new Float32Array(W * H), den = new Float32Array(W * H)
  cells.forEach((cell, i) => {
    const g = reach[i]
    if (!g || cell.mm == null) return
    for (let r = g.r0; r <= g.r1; r++) {
      for (let c = g.c0; c <= g.c1; c++) {
        const p = r * W + c
        const w = weight(g, r, c)
        num[p] += w * cell.mm
        den[p] += w
      }
    }
  })
  const rgba = new Uint8ClampedArray(W * H * 4)
  for (let p = 0; p < W * H; p++) {
    const i = owner[p]
    const o = p * 4
    if (i >= 0 && cells[i].mm == null) {
      const stripe = (p % W + Math.floor(p / W)) % HATCH.period
      if (stripe < 2 * HATCH.width) rgba.set(stripe < HATCH.width ? HATCH.dark : HATCH.light, o)
      continue
    }
    if (den[p] === 0) continue
    const [r, g, b, a] = rainRgba(num[p] / den[p], marks)
    rgba[o] = r; rgba[o + 1] = g; rgba[o + 2] = b; rgba[o + 3] = 255 * a * alpha
  }
  return rgba
}

const mercY = lat => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360))

/** Even-odd test against the boundary's rings, the same area the picture is cut to. */
function inCataloniaOutline(lat, lon) {
  let inside = false
  for (const ring of CATALONIA_RINGS) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [x1, y1] = ring[i], [x2, y2] = ring[j]
      if ((y1 > lat) !== (y2 > lat) && lon < ((x2 - x1) * (lat - y1)) / (y2 - y1) + x1) inside = !inside
    }
  }
  return inside
}

/**
 * What the layer says at one spot, on the pixel that holds it, with the picture's own blend:
 * { status, mm } with the status of the cell the spot is in ('measured' | 'estimated' | 'no_data',
 * mm null in the last); null outside Catalonia or beyond every cell's reach. A spot that no footprint
 * holds is 'estimated': its figure comes from the cells around it. `grid` is rainGrid(cells). (The point
 * card's figure.)
 */
export function rainValueAt(grid, cells, lat, lon) {
  if (!grid || !cells?.length) return null
  if (!inCataloniaOutline(lat, lon)) return null
  const { width: W, height: H, bounds: b, reach } = grid
  const row = Math.floor(((mercY(b.north) - mercY(lat)) / (mercY(b.north) - mercY(b.south))) * H)
  const col = Math.floor(((lon - b.west) / (b.east - b.west)) * W)
  if (row < 0 || row >= H || col < 0 || col >= W) return null
  let own = null, best = Infinity, num = 0, den = 0
  cells.forEach((cell, i) => {
    const g = reach[i]
    if (!g) return
    const o = outside(g, row, col)
    if (o <= 1 + SLACK && o < best) { best = o; own = cell }
    if (cell.mm == null) return
    const w = weight(g, row, col)
    num += w * cell.mm
    den += w
  })
  if (own && own.mm == null) return { status: own.status, mm: null }
  if (den === 0) return null
  return { status: own ? own.status : 'estimated', mm: num / den }
}

/** Erases what of the picture falls outside Catalonia (the cells along the border reach past it). */
function clipToCatalonia(ctx, { width: W, height: H, bounds: b }) {
  const top = mercY(b.north), span = top - mercY(b.south)
  ctx.globalCompositeOperation = 'destination-in'
  ctx.beginPath()
  for (const ring of CATALONIA_RINGS) {
    ring.forEach(([lon, lat], i) => {
      ctx[i ? 'lineTo' : 'moveTo'](((lon - b.west) / (b.east - b.west)) * W, ((top - mercY(lat)) / span) * H)
    })
    ctx.closePath()
  }
  ctx.fill('evenodd')
}

/**
 * Picture of the layer for Leaflet, or null if there is nothing to draw: { url, bounds }.
 * `data` is the answer of /layer/rain (its own window picks the scale, so the picture and its colours
 * never mix two windows).
 */
export function rainOverlay(data, { alpha = 1 } = {}) {
  const scale = RAIN_SCALES[data.window]
  const grid = scale && rainGrid(data.cells)
  if (!grid) return null
  const canvas = document.createElement('canvas')
  canvas.width = grid.width
  canvas.height = grid.height
  const ctx = canvas.getContext('2d')
  ctx.putImageData(new ImageData(paintRain(grid, data.cells, scale.marks, alpha), grid.width, grid.height), 0, 0)
  clipToCatalonia(ctx, grid)
  const b = grid.bounds
  return { url: canvas.toDataURL('image/png'), bounds: [[b.south, b.west], [b.north, b.east]] }
}
