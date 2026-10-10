// =====================================================
// Rain on the way — a recent rain that does not count in the score yet
//
// Scoring v2 counts rain when it starts producing mushrooms (2–3 weeks later in a
// cold zone), so right after a big rain a zone can score low. Without saying that
// the rain is on its way, the score would read as broken. The backend sends the
// pending rain runs in score.v2.pending_rains; the card shows the biggest one when
// the score is below "Bueno".
// =====================================================
import { SCORE_BANDS } from './scoreBands'

const LOCALES = { es: 'es-ES', ca: 'ca-ES', en: 'en-GB' }
const GOOD_FROM = SCORE_BANDS.find(b => b.key === 'ok').min // 55

/** Biggest pending rain from score.v2: { end, totalMm, showsFrom, peak } or null. */
export function pickRainOnTheWay(v2) {
  const runs = v2?.pending_rains ?? []
  if (!runs.length) return null
  const big = runs.reduce((a, b) => (b.total_mm > a.total_mm ? b : a))
  return { end: big.end, totalMm: big.total_mm, showsFrom: big.shows_from, peak: big.peak }
}

/** Sentence for the card, or null when there is nothing worth saying. */
export function rainOnTheWayText(score, rain, t, lang) {
  if (!rain || score >= GOOD_FROM || !t.lluviaEnCamino) return null
  const fmt = iso => new Date(`${iso}T12:00:00`).toLocaleDateString(LOCALES[lang] ?? 'es-ES', { day: 'numeric', month: 'short' })
  return t.lluviaEnCamino
    .replace('{fecha}', fmt(rain.end))
    .replace('{mm}', Math.round(rain.totalMm))
    .replace('{desde}', fmt(rain.showsFrom))
}
