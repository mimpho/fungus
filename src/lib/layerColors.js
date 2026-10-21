// =====================================================
// Layer colours — the score bands as literal hex, for what Leaflet draws
//
// Leaflet renders SVG outside React's DOM, so CSS variables do not reach it (system/agents.spec.md,
// rule 10). These are the dark-theme values of --ui-score-<band>-bar in src/styles/tokens.css, except
// `good`, which uses the lighter --ui-score-good-text: the bar's dark gold disappears over the
// satellite image. The light theme has no map layer yet (step 10 of the Observatory).
// The band of a score still comes from getScoreBand(); never compare against a threshold here.
// =====================================================
import { SCORE_BANDS, getScoreBand } from './scoreBands'

export const BAND_HEX = { high: '#34d399', good: '#c4a06b', ok: '#f59e0b', mid: '#f97316', low: '#ef4444' }

// Low scores are common: they are drawn fainter so the map underneath is still readable
const BAND_OPACITY = { high: 0.62, good: 0.58, ok: 0.52, mid: 0.44, low: 0.34 }

// The alphas above are multiplied by a factor per basemap (a pixel's alpha tops out at 1): the dark
// maps need them stronger and the satellite image, busy as it is, fainter. On the shaded relief the layer
// is also blended with `multiply` (see ObservatoryMap), which keeps the black-and-white shading
// readable through the colour. Raise a factor for stronger colour, lower it to see more map.
export const ALPHA_SCALE_BY_BASEMAP = { satellite: 0.8, streets: 1.5, relief: 2 }

/** Fill of one cell of the probability layer. */
export function cellFill(score) {
  const { key } = getScoreBand(score)
  return { fillColor: BAND_HEX[key], fillOpacity: BAND_OPACITY[key] }
}

/** The five bands from low to high, for the legend: [{ key, min, hex }]. */
export const LEGEND_BANDS = [...SCORE_BANDS].reverse().map(b => ({ key: b.key, min: b.min, hex: BAND_HEX[b.key] }))

const toRgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16))

/** [r, g, b, alpha 0-255] of a score, for drawing pixels: same colour and opacity as cellFill. */
export function scoreRgba(score) {
  const { key } = getScoreBand(score)
  return [...toRgb(BAND_HEX[key]), Math.round(BAND_OPACITY[key] * 255)]
}
