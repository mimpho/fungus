// =====================================================
// Chart view model — turns a /point/series answer into what the charts and tables draw
//
// The backend sends days (climate + score) and events as numbers and dates; the sentences are
// written here from i18n keys. Pure functions: no React, no network.
//
// The page asks the API once for the whole series (MAX_API_DAYS days) and `prepareSeries` shows the
// window {a, b} of it (see timeline.js); the 21-day rain accumulation is counted over the whole
// series, so it is complete from the 22nd day on.
// =====================================================
import { fill, formatDay, formatNumber } from './thermometer'

export const ACC_DAYS = 21
export const MAX_API_DAYS = 180
/** Days after the last real one that the score chart looks ahead (forecast, then estimate). */
export const FUTURE_DAYS = 21
export const TABS = ['score', 'rain', 'temp', 'hum', 'wind']

const EXTREME_RAIN_MM = 120
const TRIGGER_LAG_DAYS = 21
const BRAKE_DRY_PCT = 55
const HOT_C = 25
const USEFUL_RAIN_MM = 10

const isoAdd = (iso, days) => {
  const d = new Date(`${iso}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/** Rain of the last 21 days (the day included) at each of `days`; null when that day has no data. */
export function accumulate(days) {
  return days.map((d, i) => {
    if (!d.climate) return null
    let sum = 0
    for (let k = Math.max(0, i - ACC_DAYS + 1); k <= i; k++) sum += days[k].climate?.precipitation_mm ?? 0
    return Math.round(sum * 10) / 10
  })
}

/** Events that reach the shown window (from `firstDate` to `lastDate`), renumbered 1, 2, 3… in date order (the API numbers the whole answer). */
export function windowEvents(events, firstDate, lastDate = null) {
  return (events ?? [])
    .filter(e => e.end >= firstDate && (!lastDate || e.start <= lastDate))
    .sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0))
    .map((e, i) => ({ ...e, n: i + 1 }))
}

/** Coldest night among the shown days with data, or null. */
export function lowestMin(days) {
  let best = null
  for (const d of days) {
    if (d.climate && (best === null || d.climate.temp_min_c < best.temp_min_c)) best = { date: d.date, temp_min_c: d.climate.temp_min_c }
  }
  return best
}

/**
 * What the charts need: the days of the window `win` = { a, b } (indices into the series, both
 * included; default: the last 20), their 21-day rain, the events inside, the coldest night.
 * `series` is the API answer.
 */
export function prepareSeries(series, win = null) {
  const all = series?.days ?? []
  const acc = accumulate(all)
  const from = win ? win.a : Math.max(0, all.length - 20)
  const to = win ? win.b : all.length - 1
  const days = all.slice(from, to + 1).map((d, i) => ({ ...d, acc: acc[from + i], i }))
  const first = days[0]?.date ?? null
  const last = days[days.length - 1]?.date ?? null
  return {
    days,
    events: first ? windowEvents(series.events, first, last) : [],
    lowest: lowestMin(days),
    hasData: days.some(d => d.climate),
    species: series?.species ?? null,
  }
}

/**
 * The days ahead of the score chart, from a /point/calendar answer: the forecast days first, then
 * the estimate without forecast, at most `max`. Empty unless the calendar counts from the same last
 * real day as the series (`lastDate`), so a calendar for another species or date never leaks in.
 */
export function futureDays(cal, lastDate, max = FUTURE_DAYS) {
  if (!cal || !lastDate || cal.last_data_date !== lastDate || cal.date !== lastDate) return []
  return (cal.days ?? []).filter(d => d.basis !== 'real' && d.date > lastDate && Number.isFinite(d.score)).slice(0, max)
}

/** Thermal range of the species being looked at, from its row in /point/species, or null. */
export function speciesRange(item) {
  const v = item?.conditions?.temperature?.values
  if (!v || v.min_c == null || v.max_c == null) return null
  return { min: v.min_c, opt: v.opt_c ?? null, max: v.max_c }
}

// ── Scales ───────────────────────────────────────────────────────────────

/** Round `lo`/`hi` outwards to multiples of `step`, never narrower than [minLo, maxHi]. */
export function niceRange(lo, hi, step, minLo, maxHi) {
  const a = Math.min(minLo, Math.floor(lo / step) * step)
  const b = Math.max(maxHi, Math.ceil(hi / step) * step)
  return { lo: a, hi: b }
}

export function ticks(lo, hi, step) {
  const out = []
  for (let v = lo; v <= hi + 1e-9; v += step) out.push(Math.round(v * 100) / 100)
  return out
}

/** Linear map of [lo, hi] to [bottom, top] (pixels), clamped. */
export function scaleY(lo, hi, bottom, top) {
  return v => bottom - ((Math.min(Math.max(v, lo), hi) - lo) / (hi - lo)) * (bottom - top)
}

/** SVG path data, one `M…L…` run per stretch of consecutive values: a missing day breaks the line. */
export function linePath(values, x, y) {
  let d = '', open = false
  values.forEach((v, i) => {
    if (v == null) { open = false; return }
    d += `${open ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`
    open = true
  })
  return d
}

/** Every k-th label, counted from the last day, so the newest date is always labelled. */
export function labelIndexes(count, maxLabels) {
  const k = Math.max(1, Math.ceil(count / Math.max(2, maxLabels)))
  const out = []
  for (let i = count - 1; i >= 0; i -= k) out.unshift(i)
  return out
}

/** The index of the day under pixel `px` of a plot starting at `left`, or null outside it. */
export function indexAt(px, left, step, count) {
  const i = Math.floor((px - left) / step)
  return i >= 0 && i < count ? i : null
}

// ── Sentences ────────────────────────────────────────────────────────────

const KIND_KEY = { trigger: 'obsChKindTrigger', brake_dry: 'obsChKindBrake', brake_frost: 'obsChKindBrake' }

export function eventDate(e, lang) {
  return e.start === e.end ? formatDay(e.start, lang) : `${formatDay(e.start, lang)} – ${formatDay(e.end, lang)}`
}

/** { kind, tone, date, what, effect } of an event; tone is 'trigger' or 'brake'. */
export function eventText(e, t, lang) {
  const base = { kind: t[KIND_KEY[e.type]] ?? '', tone: e.type === 'trigger' ? 'trigger' : 'brake', date: eventDate(e, lang) }
  if (e.type === 'trigger') {
    const span = e.start === e.end ? t.obsChOneDay : fill(t.obsChNDays, { n: daysBetween(e.start, e.end) }, lang)
    const head = fill(e.total_mm >= EXTREME_RAIN_MM ? t.obsChRainExtreme : t.obsChRainStart, { mm: e.total_mm, span }, lang)
    const drop = e.temp_drop ? ` ${fill(t.obsChTempDrop, { drop: e.temp_drop_c }, lang)}` : ''
    const expected = e.expected_date ?? isoAdd(e.end, TRIGGER_LAG_DAYS)
    const effect = fill(t.obsChEffectTrigger, { date: expected }, lang) + (e.total_mm >= EXTREME_RAIN_MM ? ` ${t.obsChEffectExcess}` : '')
    return { ...base, what: head + drop, effect }
  }
  if (e.type === 'brake_dry') {
    return { ...base, what: fill(t.obsChDryAir, { days: e.days, min: e.min_humidity_pct, limit: BRAKE_DRY_PCT }, lang), effect: t.obsChEffectDry }
  }
  if (e.type === 'brake_frost') {
    return { ...base, what: fill(t.obsChFrost, { temp: e.temp_min_c }, lang), effect: t.obsChEffectFrost }
  }
  return null
}

function daysBetween(a, b) {
  return Math.round((new Date(`${b}T12:00:00Z`) - new Date(`${a}T12:00:00Z`)) / 86400000) + 1
}

/** «Ha helado en el periodo…» / «Sin heladas…» for the coldest night, or null without data. */
export function frostLine(lowest, t, lang) {
  if (!lowest) return null
  const values = { temp: lowest.temp_min_c, date: lowest.date }
  return fill(lowest.temp_min_c < 0 ? t.obsChFrostLineYes : t.obsChFrostLineNo, values, lang)
}

/** Table row of a day with its tag (frost, heat, useful rain), or null climate for a day without data. */
export function tableRow(d, lang) {
  const c = d.climate
  const tag = !c ? null : c.temp_min_c < 0 ? 'frost' : c.temp_max_c > HOT_C ? 'heat' : c.precipitation_mm >= USEFUL_RAIN_MM ? 'rain' : null
  return {
    date: d.date, day: formatDay(d.date, lang), tag,
    score: d.v2?.score ?? null,
    rain: c?.precipitation_mm ?? null, max: c?.temp_max_c ?? null, min: c?.temp_min_c ?? null, avg: c?.temp_avg_c ?? null,
    soil: c?.soil_temp_c ?? null, hum: c?.humidity_pct ?? null, wind: c?.wind_kmh ?? null,
  }
}

export const fmt = (n, lang, digits = 1) => (n == null ? '–' : formatNumber(n, lang, digits))
