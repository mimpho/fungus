// =====================================================
// Forecast view model — turns a /point/forecast answer into what the card draws
//
// The backend sends the weather of the cell's stored forecast (up to 16 days from today). The
// first 7 days are drawn as cards, the rest (8 to 16) as a compact trend, less reliable. The
// summary sentence is written here from i18n keys. Pure functions: no React, no network.
// =====================================================
import { fill, formatNumber } from './thermometer'
import { shortDay, longDay } from './calendarData'

export const NEAR_DAYS = 7
export const USEFUL_RAIN_MM = 10
export const HOT_C = 25
const MAX_BAR = 30

const num = v => (Number.isFinite(v) ? v : null)
const utc = iso => new Date(`${iso}T00:00:00Z`)
const dayMonth = (iso, lang) => utc(iso).toLocaleDateString({ es: 'es-ES', ca: 'ca-ES', en: 'en-GB' }[lang] ?? 'es-ES', { timeZone: 'UTC', day: 'numeric', month: 'short' })
const weekdayShort = (iso, lang) => utc(iso).toLocaleDateString({ es: 'es-ES', ca: 'ca-ES', en: 'en-GB' }[lang] ?? 'es-ES', { timeZone: 'UTC', weekday: 'short' })

/** What the sky looks like that day: rain, cloud (humid) or sun. */
export function kindOf(day) {
  if (day.rain >= 1) return 'rain'
  if (day.humidity >= 85) return 'cloud'
  return 'sun'
}

/** The tag a day earns, if any: frost beats heat beats useful rain. */
export function tagOf(day) {
  if (day.tmin < 0) return 'frost'
  if (day.tmax > HOT_C) return 'hot'
  if (day.rain >= USEFUL_RAIN_MM) return 'rain'
  return null
}

const TAG_KEY = { frost: 'obsFcTagFrost', hot: 'obsFcTagHot', rain: 'obsFcTagRain' }

/** Height in px of the rain bar for a day (a trace of rain always shows). */
export const barHeight = (mm, scale = 1.6, max = MAX_BAR) =>
  Math.round(Math.min(max, Math.max(mm > 0 ? 3 : 0, mm * scale)))

function buildDay(raw, i, { t, lang, todayIso }) {
  const day = {
    iso: raw.date,
    tmax: num(raw.temp_max_c),
    tmin: num(raw.temp_min_c),
    rain: num(raw.precipitation_mm) ?? 0,
    humidity: num(raw.humidity_pct),
    wind: num(raw.wind_kmh),
  }
  const tag = tagOf(day)
  const kind = kindOf(day)
  const rainText = day.rain ? `${formatNumber(day.rain, lang)} mm` : '0 mm'
  const isToday = raw.date === todayIso
  const weekday = isToday ? t.obsFcToday : weekdayShort(raw.date, lang)
  return {
    ...day,
    kind,
    tag,
    tagLabel: tag ? t[TAG_KEY[tag]] : null,
    weekday,
    dayMonth: dayMonth(raw.date, lang),
    maxText: day.tmax === null ? '–' : `${Math.round(day.tmax)}°`,
    minText: day.tmin === null ? '–' : `${Math.round(day.tmin)}°`,
    rainText,
    windText: day.wind === null ? '–' : `${Math.round(day.wind)} km/h`,
    bar: barHeight(day.rain, 1.1, 22),
    smallBar: barHeight(day.rain, 1.2, 20),
    aria: fill(t.obsFcAriaDay, {
      day: isToday ? t.obsFcToday : longDay(raw.date, lang),
      max: day.tmax === null ? '–' : Math.round(day.tmax),
      min: day.tmin === null ? '–' : Math.round(day.tmin),
      rain: day.rain ? rainText : t.obsFcNoRain,
      wind: day.wind === null ? '–' : Math.round(day.wind),
      tag: tag ? `, ${t[TAG_KEY[tag]]}` : '',
    }, lang),
    index: i,
  }
}

/** The card's text and days, or null when the answer carries no forecast. */
export function buildForecast(data, t, lang, todayIso = null) {
  const raw = Array.isArray(data?.days) ? data.days.filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d?.date ?? '')) : []
  if (!raw.length) return null
  const days = raw.map((d, i) => buildDay(d, i, { t, lang, todayIso }))
  const near = days.slice(0, NEAR_DAYS)
  const late = days.slice(NEAR_DAYS)

  const rain7 = near.reduce((sum, d) => sum + d.rain, 0)
  const frosts = days.filter(d => d.tmin !== null && d.tmin < 0).length
  const big = near.filter(d => d.rain >= USEFUL_RAIN_MM).map(d => shortDay(d.iso, lang))
  const rainPart = rain7 >= 1
    ? fill(big.length ? t.obsFcSumRainUseful : t.obsFcSumRain, { mm: Math.round(rain7 * 10) / 10, days: big.join(` ${t.obsFcAnd} `) }, lang)
    : t.obsFcSumDry
  const frostPart = frosts ? ` · ${fill(frosts > 1 ? t.obsFcSumFrosts : t.obsFcSumFrost, { n: frosts }, lang)}` : ''

  return { near, late, summary: `${rainPart}${frostPart}.`, days: days.length }
}
