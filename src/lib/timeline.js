// =====================================================
// Timeline — the window of days over the last 180 and how to move it
//
// The page loads the whole 180-day series of the point once; the timeline is a strip over all of
// it with a window (7–180 days) that is dragged, stretched or moved with the keyboard. A window
// is { a, b }: indices of its first and last day in the series, both included. Pure functions,
// no React: the component only turns pointers and keys into calls to these.
//
// What goes in the URL is { until, days }: `until` is the last day of the window as YYYY-MM-DD
// (null = the last day with data) and `days` its length.
// =====================================================
import { MAX_WINDOW, MIN_WINDOW } from './observatoryView'

export { MAX_WINDOW, MIN_WINDOW }

const LOCALES = { es: 'es-ES', ca: 'ca-ES', en: 'en-GB' }
const locale = lang => LOCALES[lang] ?? LOCALES.es
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/

/** Window length that fits a series of `length` days. */
export const fitLength = (n, length) => Math.max(1, Math.min(n, MAX_WINDOW, length))

/** The smallest window the series allows (7 days, or fewer if the series is shorter). */
export const minLength = length => Math.min(MIN_WINDOW, length)

/**
 * The window of the URL's { until, days } over `days` (the series). An `until` outside the series
 * is clamped to its first or last day; the length is cut to what fits.
 */
export function resolveWindow(series, until, days) {
  const length = series.length
  if (length === 0) return { a: 0, b: -1 }
  const n = fitLength(days, length)
  let b = length - 1
  if (until) {
    const i = series.findIndex(d => d.date >= until)
    b = i === -1 ? length - 1 : series[i].date === until ? i : Math.max(0, i - 1)
  }
  b = Math.max(b, n - 1)
  return { a: b - n + 1, b }
}

/** { until, days } of a window, with `until: null` when it ends on the last day. */
export function commitOf(series, win) {
  const last = series.length - 1
  return { until: win.b >= last ? null : series[win.b].date, days: win.b - win.a + 1 }
}

export const sameWindow = (x, y) => !!x && !!y && x.a === y.a && x.b === y.b

/**
 * A window after dragging by `delta` days from `start` ({ a, b }). `mode` is 'move' (both edges),
 * 'l' (start edge) or 'r' (end edge). The result always fits [0, length - 1] and 7–180 days.
 */
export function dragWindow(start, mode, delta, length) {
  const min = minLength(length), max = Math.min(MAX_WINDOW, length)
  const d = Math.round(delta)
  if (mode === 'move') {
    const n = start.b - start.a + 1
    const a = Math.min(Math.max(0, start.a + d), length - n)
    return { a, b: a + n - 1 }
  }
  if (mode === 'l') {
    const b = start.b
    const a = Math.min(Math.max(start.a + d, b - max + 1, 0), b - min + 1)
    return { a, b }
  }
  const a = start.a
  const b = Math.max(Math.min(start.b + d, a + max - 1, length - 1), a + min - 1)
  return { a, b }
}

/** The window centred on `position` (days from the start of the series, fractions allowed), keeping its length. */
export function centreOn(win, position, length) {
  const n = win.b - win.a + 1
  const a = Math.min(Math.max(0, Math.round(position - n / 2)), length - n)
  return { a, b: a + n - 1 }
}

export const SHORT_STEP = 1
export const LONG_STEP = 7

/**
 * The window after a key, or null when the key does nothing. Arrows move it a week (Alt: a day);
 * Shift + arrows move its start edge (← widens, → narrows); Home goes to the oldest days, End
 * to the last day with data.
 */
export function keyWindow(win, { key, shiftKey = false, altKey = false }, length) {
  const step = altKey ? SHORT_STEP : LONG_STEP
  if (key === 'Home') return dragWindow(win, 'move', -length, length)
  if (key === 'End') return dragWindow(win, 'move', length, length)
  if (key !== 'ArrowLeft' && key !== 'ArrowRight') return null
  const sign = key === 'ArrowLeft' ? -1 : 1
  return dragWindow(win, shiftKey ? 'l' : 'move', sign * step, length)
}

// ── Overview bars ────────────────────────────────────────────────────────────

const mean = values => (values.length ? values.reduce((s, v) => s + v, 0) / values.length : null)
const sum = values => values.reduce((s, v) => s + v, 0)

const METRICS = {
  score: { pick: d => d.v2?.score, agg: mean, lo: 0, hi: 100 },
  rain: { pick: d => d.climate?.precipitation_mm, agg: sum, lo: 0, hi: 40 },
  temp: { pick: d => d.climate?.temp_avg_c, agg: mean, lo: 0, hi: 20 },
  hum: { pick: d => d.climate?.humidity_pct, agg: mean, lo: 40, hi: 100 },
  wind: { pick: d => d.climate?.wind_kmh, agg: mean, lo: 0, hi: 25 },
}

/**
 * One bar per week of the series for the chart tab being shown: { i0, n, value, fraction }.
 * Weeks are counted from the end, so the last bar is always a full week and the first may be
 * shorter. `fraction` is 0–1 on a scale that stretches to the data (score is always 0–100).
 */
export function weeklyBars(series, tab) {
  const m = METRICS[tab] ?? METRICS.score
  const bars = []
  for (let end = series.length; end > 0; end -= 7) {
    const i0 = Math.max(0, end - 7)
    const values = series.slice(i0, end).map(m.pick).filter(v => v != null)
    bars.unshift({ i0, n: end - i0, value: values.length ? m.agg(values) : null })
  }
  const known = bars.map(b => b.value).filter(v => v != null)
  let lo = m.lo, hi = m.hi
  if (tab !== 'score' && known.length) {
    hi = Math.max(hi, ...known)
    if (tab === 'temp') lo = Math.min(lo, ...known)
  }
  return bars.map(b => ({ ...b, fraction: b.value == null ? null : Math.min(1, Math.max(0, (b.value - lo) / (hi - lo || 1))) }))
}

/** Month starts inside the series: { i, month, year, january }. */
export function monthMarks(series) {
  const out = []
  series.forEach((d, i) => {
    if (d.date.slice(8) === '01') out.push({ i, month: Number(d.date.slice(5, 7)) - 1, year: Number(d.date.slice(0, 4)), january: d.date.slice(5, 7) === '01' })
  })
  return out
}

export function monthName(month, lang, long = false) {
  return new Date(Date.UTC(2024, month, 15)).toLocaleDateString(locale(lang), { timeZone: 'UTC', month: long ? 'long' : 'short' })
}

/** «5 oct 2026» */
export function dayWithYear(iso, lang) {
  if (!ISO_DAY.test(iso ?? '')) return ''
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString(locale(lang), { timeZone: 'UTC', day: 'numeric', month: 'short', year: 'numeric' })
}
