// =====================================================
// Score bands — the one scale for every score in the app (0–100)
//
// Five bands, lower bound inclusive. Decided 2026-10-09 for scoring v2:
// low values are common, and "Regular" for a 7 was misleading.
// Every place that colours or labels a score uses getScoreBand(); never
// compare a score against a threshold elsewhere.
// Colours: --ui-score-<key>-bar / --ui-score-<key>-text (src/styles/tokens.css),
// classes score-bar-<key> / score-text-<key> (src/styles/semantic.css).
// =====================================================

export const SCORE_BANDS = [
  { key: 'high', min: 85, tKey: 'excelente' },
  { key: 'good', min: 70, tKey: 'muyBueno' },
  { key: 'ok',   min: 55, tKey: 'bueno' },
  { key: 'mid',  min: 30, tKey: 'regular' },
  { key: 'low',  min: 0,  tKey: 'malo' },
]

/** Band of a score: { key, min, tKey, bar, text } — bar/text are the CSS classes. */
export function getScoreBand(score) {
  const s = Number.isFinite(score) ? score : 0
  const band = SCORE_BANDS.find(b => s >= b.min) ?? SCORE_BANDS[SCORE_BANDS.length - 1]
  return { ...band, bar: `score-bar-${band.key}`, text: `score-text-${band.key}` }
}
