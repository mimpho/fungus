// =====================================================
// Elevation raster of Catalonia — the DEM that is never drawn
//
// Generated once by backend/scripts/build_elevation_raster.py from the Copernicus DEM GLO-30:
// public/data/elevation-catalonia.bin (one byte per pixel) + .json (where it sits and how to read it).
// It only tells the probability layer how high each pixel is; nothing of it is painted.
// Raw bytes, not a PNG: reading colours back from a canvas can be altered by the browser's
// privacy settings, and a changed byte here would be hundreds of metres.
// =====================================================

const BASE = import.meta.env.BASE_URL ?? '/'
let cached = null

async function load() {
  const [metaRes, binRes] = await Promise.all([
    fetch(`${BASE}data/elevation-catalonia.json`),
    fetch(`${BASE}data/elevation-catalonia.bin`),
  ])
  if (!metaRes.ok || !binRes.ok) throw new Error('elevation raster not available')
  const meta = await metaRes.json() // a missing file comes back as the app's HTML: this throws
  const data = new Uint8Array(await binRes.arrayBuffer())
  if (!meta?.bounds || data.length !== meta.width * meta.height) throw new Error('elevation raster does not match its description')
  return { bounds: meta.bounds, width: meta.width, height: meta.height, stepM: meta.step_m, data }
}

/** The raster { bounds, width, height, stepM, data }, loaded once. Rejects if it is not there. */
export function loadElevationRaster() {
  if (!cached) cached = load().catch(err => { cached = null; throw err })
  return cached
}
