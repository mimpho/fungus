// =====================================================
// Chart view model — turns a /point/series answer into what the charts and tables draw
//
// The backend sends days (climate + v1 + v2) and events as numbers and dates; the sentences are
// written here from i18n keys. Pure functions: no React, no network.
//
// The 21-day rain accumulation needs 21 days before the first day shown, so the page asks the API
// for `requestDays(n)` days and `prepareSeries` shows only the last n.
// =====================================================
import { fill, formatDay, formatNumber } from './thermometer'

export const WINDOWS = [7, 20, 60, 120]
export const DEFAULT_WINDOW = 20
export const ACC_DAYS = 21
export const MAX_API_DAYS = 180
export const TABS = ['score', 'rain', 'temp', 'hum', 'wind']

const EXTREME_RAIN_MM = 120
const TRIGGER_LAG_DAYS = 21
const BRAKE_DRY_PCT = 55
const HOT_C = 25
const USEFUL_RAIN_MM = 10

export const requestDays = n => Math.min(MAX_API_DAYS, n + ACC_DAYS)

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

/** Events that reach the shown window, renumbered 1, 2, 3… in date order (the API numbers the whole answer). */
export function windowEvents(events, firstDate) {
  return (events ?? [])
    .filter(e => e.end >= firstDate)
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
 * What the charts need: the last n days, their 21-day rain, the events inside, the coldest night.
 * `series` is the API answer (possibly with up to 21 days of warm-up before the window).
 */
export function prepareSeries(series, n) {
  const all = series?.days ?? []
  const acc = accumulate(all)
  const from = Math.max(0, all.length - n)
  const days = all.slice(from).map((d, i) => ({ ...d, acc: acc[from + i], i }))
  const first = days[0]?.date ?? null
  return {
    days,
    events: first ? windowEvents(series.events, first) : [],
    lowest: lowestMin(days),
    hasData: days.some(d => d.climate),
    species: series?.species ?? null,
  }
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
    score: d.v2?.score ?? null, v1: d.v1?.score ?? null,
    rain: c?.precipitation_mm ?? null, max: c?.temp_max_c ?? null, min: c?.temp_min_c ?? null, avg: c?.temp_avg_c ?? null,
    soil: c?.soil_temp_c ?? null, hum: c?.humidity_pct ?? null, wind: c?.wind_kmh ?? null,
  }
}

export const fmt = (n, lang, digits = 1) => (n == null ? '–' : formatNumber(n, lang, digits))
