// =====================================================
// The Meteo tab's data layers (pure, no React)
//
// One list for the segmented control, the URL and the legends. A layer with `ready: false` is shown
// with «Pronto» and `aria-disabled`; its placeholder panel opens only in development builds
// (SHOW_PREVIEWS), so production never shows fake figures. epic/observatory-meteo turns a layer on by
// setting its `ready` (navigation PRD, Q8). Only ready layers can be named in the URL (`capa`).
// =====================================================

export const SHOW_PREVIEWS = import.meta.env.DEV

/** `param`: its value in the URL's `capa`; `label` / `short`: i18n keys (full name, segment text). */
export const METEO_LAYERS = [
  { id: 'conditions', param: 'condiciones', label: 'obsLayerProbability', short: 'obsLayerProbability', ready: true },
  { id: 'rain', param: 'lluvia', label: 'obsLayerRain', short: 'obsLayerRain', ready: false },
  { id: 'temperature', param: 'temperatura', label: 'obsLayerTemperature', short: 'obsMeteoTempShort', ready: false },
  { id: 'wind', param: 'viento', label: 'obsLayerWind', short: 'obsLayerWind', ready: false },
]

export const DEFAULT_METEO_LAYER = 'conditions'

export const meteoLayer = id => METEO_LAYERS.find(l => l.id === id) ?? null

/** The segment can be chosen: built, or a placeholder in a development build. */
export const canOpenLayer = layer => Boolean(layer && (layer.ready || SHOW_PREVIEWS))

/** The layer a URL's `capa` names, or null when it names none that is built. */
export function layerFromParam(raw) {
  const layer = METEO_LAYERS.find(l => l.param === raw)
  return layer?.ready ? layer.id : null
}

/** The URL's `capa` for a layer, or null when the layer cannot be linked to (not built yet). */
export function paramOfLayer(id) {
  const layer = meteoLayer(id)
  return layer?.ready ? layer.param : null
}

// ── Rain: accumulated over a window that ends on the day of the shared slider (PRD, Q2/Q3) ──

export const RAIN_PRESETS = [
  { id: '24h', days: 1, label: '24 h' },
  { id: '7d', days: 7, label: '7 d' },
  { id: '21d', days: 21, label: '21 d' },
]
export const DEFAULT_RAIN_PRESET = '7d'

const RAIN_COLORS = ['var(--meteo-rain-1)', 'var(--meteo-rain-2)', 'var(--meteo-rain-3)']

/**
 * One fixed scale per preset, always in mm, never fitted to the data on screen. The cuts for 24 h and
 * 7 d are placeholders, to be set by epic/observatory-meteo with real data; 21 d keeps the 60–120 mm
 * «good» band of the observed zone's rain chart (the same measure as the score's PA21).
 */
export const RAIN_SCALES = {
  '24h': { colors: RAIN_COLORS, min: 0, max: 30, unit: 'mm' },
  '7d': { colors: RAIN_COLORS, min: 0, max: 60, unit: 'mm' },
  '21d': { colors: RAIN_COLORS, min: 0, max: 150, unit: 'mm', band: { from: 60, to: 120 } },
}

export const TEMPERATURE_SCALE = {
  colors: ['var(--meteo-temp-1)', 'var(--meteo-temp-2)', 'var(--meteo-temp-3)', 'var(--meteo-temp-4)', 'var(--meteo-temp-5)'],
  min: -5, max: 35, unit: '°C',
}

export const WIND_SCALE = {
  colors: ['var(--meteo-wind-1)', 'var(--meteo-wind-2)', 'var(--meteo-wind-3)', 'var(--meteo-wind-4)'],
  min: 0, max: 60, unit: 'km/h',
}
