// =====================================================
// Calendar view model — turns a /point/calendar answer into what the card draws
//
// The backend sends 7 real days and the next 35, each with its score and where it comes from
// (`basis`: real | forecast | estimate), plus a summary (best day, days at the threshold). The
// sentences are written here from i18n keys. Pure functions: no React, no network.
//
// Layout: one flat grid of 7 columns (Monday first). It starts on the Monday of the first day and
// ends on the Sunday of the last one; the cells outside the answer are drawn empty.
// =====================================================
import { SCORE_BANDS, getScoreBand } from './scoreBands'
import { fill } from './thermometer'

const LOCALES = { es: 'es-ES', ca: 'ca-ES', en: 'en-GB' }
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/
const DAY_MS = 86400000
// A Monday, to name the weekdays without depending on today's date
const MONDAY = Date.UTC(2024, 0, 1)

const locale = lang => LOCALES[lang] ?? LOCALES.es
const utc = iso => new Date(`${iso}T00:00:00Z`)
const toIso = d => d.toISOString().slice(0, 10)
const addDays = (iso, n) => toIso(new Date(utc(iso).getTime() + n * DAY_MS))
/** 0 = Monday … 6 = Sunday. */
const weekday = iso => (utc(iso).getUTCDay() + 6) % 7

/** The user's calendar day (not UTC) as YYYY-MM-DD, for marking «today». */
export function localIso(now = new Date()) {
  const p = n => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`
}

function format(iso, lang, options) {
  if (!ISO_DAY.test(iso ?? '')) return ''
  return utc(iso).toLocaleDateString(locale(lang), { timeZone: 'UTC', ...options })
}

/** «sáb, 24 oct» */
export const shortDay = (iso, lang) => format(iso, lang, { weekday: 'short', day: 'numeric', month: 'short' })
/** «sábado, 24 de octubre» */
export const longDay = (iso, lang) => format(iso, lang, { weekday: 'long', day: 'numeric', month: 'long' })

/** Short weekday names, Monday first. */
export function weekdayLabels(lang) {
  return Array.from({ length: 7 }, (_, i) =>
    new Date(MONDAY + i * DAY_MS).toLocaleDateString(locale(lang), { timeZone: 'UTC', weekday: 'short' }))
}

/** Opacity (%) of a band colour for a score: faint when low, strong when high. */
export const fillPercent = score => Math.round((0.18 + 0.72 * Math.min(1, Math.max(0, score) / 85)) * 100)

const BASIS_ARIA = { real: 'obsCalAriaReal', forecast: 'obsCalAriaForecast', estimate: 'obsCalAriaEstimate' }
const BASIS_BEST = { real: 'obsCalBestReal', forecast: 'obsCalBestForecast', estimate: 'obsCalBestEstimate' }

function buildCell(iso, entry, { todayIso, firstInGrid, t, lang }) {
  const date = utc(iso)
  const dayNumber = date.getUTCDate()
  const hasScore = Number.isFinite(entry?.score)
  const band = hasScore ? getScoreBand(entry.score) : null
  const monthLabel = dayNumber === 1 || firstInGrid
    ? date.toLocaleDateString(locale(lang), { timeZone: 'UTC', month: 'short' })
    : ''
  let aria = longDay(iso, lang)
  if (hasScore) {
    aria += `: ${entry.score} · ${t[band.tKey]}`
    const basis = t[BASIS_ARIA[entry.basis]]
    if (basis) aria += ` (${basis})`
  } else {
    aria += `: ${t.obsCalNoData}`
  }
  return {
    iso,
    dayNumber,
    monthLabel,
    inRange: Boolean(entry),
    score: hasScore ? entry.score : null,
    basis: entry?.basis ?? null,
    bandKey: band?.key ?? null,
    fill: hasScore ? fillPercent(entry.score) : null,
    isToday: iso === todayIso,
    aria,
  }
}

function buildSummary(data, t, lang) {
  const best = data.summary?.best_day
  if (!best) return t.obsCalNoScores
  const threshold = data.summary.threshold
  const weeks = Math.round(data.days.filter(d => d.basis !== 'real').length / 7)
  const values = {
    fecha: shortDay(best.date, lang),
    score: best.score,
    basis: t[BASIS_BEST[best.basis]] ?? '',
    n: data.summary.good_days,
    umbral: threshold,
    semanas: weeks,
  }
  if (data.summary.good_days === 0) return fill(t.obsCalSummaryNone, values, lang)
  return fill(data.summary.good_days === 1 ? t.obsCalSummaryOne : t.obsCalSummaryMany, values, lang)
}

/**
 * Everything the card draws. `data` is the /point/calendar answer; `todayIso` marks today
 * (default: the user's calendar day).
 */
export function buildCalendar(data, t, lang, todayIso = localIso()) {
  const days = data?.days ?? []
  if (days.length === 0) return null
  const byDate = new Map(days.map(d => [d.date, d]))
  const first = days[0].date
  const last = days[days.length - 1].date
  const start = addDays(first, -weekday(first))
  const end = addDays(last, 6 - weekday(last))

  const cells = []
  for (let iso = start; iso <= end; iso = addDays(iso, 1)) {
    cells.push(buildCell(iso, byDate.get(iso), { todayIso, firstInGrid: cells.length === 0, t, lang }))
  }
  const forecastDays = data.forecast_days ?? days.filter(d => d.basis === 'forecast').length
  return {
    cells,
    weekdays: weekdayLabels(lang),
    summary: buildSummary(data, t, lang),
    forecastDays,
    hasForecast: forecastDays > 0,
    legend: [...SCORE_BANDS].reverse().map(b => ({ key: b.key, label: t[b.tKey], fill: fillPercent(b.min + 5) })),
    note: forecastDays > 0 ? fill(t.obsCalNoteForecast, { n: forecastDays }, lang) : t.obsCalNoteNoForecast,
  }
}
