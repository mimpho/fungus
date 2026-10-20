// CARTO basemap tiles. Since 2026-09-25 CARTO serves tiles only with an API key
// (without it every tile shows "API KEY REQUIRED"). Two keys, one per environment,
// both in VITE_CARTO_KEY: production key (restricted to the production domain) in
// Vercel, development key (restricted to localhost) in the local .env.
// Free up to 5M requests/month non-commercial, 1M commercial (carto.com/basemaps/apikey).
const CARTO_KEY = import.meta.env.VITE_CARTO_KEY
if (!CARTO_KEY) console.warn('[basemap] VITE_CARTO_KEY is not set: the basemap will show "API KEY REQUIRED"')

export const CARTO_TILES_URL = `https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png?key=${CARTO_KEY ?? ''}`
export const BASEMAP_ATTRIBUTION = '© OpenStreetMap contributors © CARTO'

// Satellite basemap: ICGC hybrid orthophoto (orthophoto + place names and roads), free and
// keyless, CC BY 4.0 (the Observatory already credits ICGC). EPSG:3857, tiles in z/x/y, zoom 0-20.
export const ICGC_HYBRID_TILES_URL = 'https://geoserveis.icgc.cat/servei/catalunya/mapa-base/wmts/orto-hibrida/MON3857NW/{z}/{x}/{y}.png'
export const ICGC_ATTRIBUTION = '© ICGC'

// Relief basemap: the ICGC dark shaded-relief tiles (WMTS "ombres_tfosc", EPSG:3857, JPEG, made for
// scales up to 1:25,000, so Leaflet stretches them beyond zoom 15). They only exist over Catalonia
// (outside it the service answers nothing or blank tiles), so they are only asked inside
// ICGC_RELIEF_BOUNDS, over CARTO's dark map without labels, and CARTO's labels go on top (the
// shading carries no place names). Same ICGC credit as the orthophoto.
export const ICGC_RELIEF_TILES_URL = 'https://geoserveis.icgc.cat/icgc_ombres_muntanya/noutm/wmts/ombres_tfosc/GRID3857/{z}/{x}/{y}.jpeg'
export const ICGC_RELIEF_BOUNDS = [[40.4, 0.0], [43.0, 3.5]] // [[south, west], [north, east]]
export const CARTO_NOLABELS_URL = `https://{s}.basemaps.cartocdn.com/rastertiles/dark_nolabels/{z}/{x}/{y}{r}.png?key=${CARTO_KEY ?? ''}`
export const CARTO_LABELS_URL = `https://{s}.basemaps.cartocdn.com/rastertiles/dark_only_labels/{z}/{x}/{y}{r}.png?key=${CARTO_KEY ?? ''}`
