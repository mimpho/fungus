// =====================================================
// The day selector's drawing (pure, no React): where each day falls, the weekly bars and their colours
// =====================================================
import { addDays, daysBetween } from './layerDays'
import { rainRgba } from './rainLayer'
import { RAIN_SCALES } from './meteoLayers'
import { getScoreBand } from './scoreBands'

export const BARS_PX = 60 // height of the tallest bar
const MIN_BAR_PX = 2 // a week with a figure is always seen, however small
const MIN_FORECAST_PX = 7 // an outline needs more height than a filled bar to be seen
// A forecast day takes this many times the width of a past one: a week ahead against half a year would
// otherwise get a dozen pixels, too few to read or to put a finger on
export const FORECAST_STRETCH = 4
export const RAIN_FULL_MM = 60 // rain that fills the bar; more is cut
// A light week keeps this opacity at 0 mm, rising to the map scale's 0.6 at 10 mm: with the map's own
// scale (transparent up to 1 mm) its bar could not be seen
const LIGHT_RAIN_MM = 10
const LIGHT_ALPHA = [0.35, 0.6]

/**
 * The bar's axis over `total` days, of which those from `forecastStart` on (today; `total` or more = none
 * on the axis) are FORECAST_STRETCH times wider: { at(i), dayAt(share) }. `at(i)` is where day `i` starts,
 * as a percentage (at(total) = 100); `dayAt` is the day under a share (0-1) of the width.
 */
export function dayScale(total, forecastStart) {
  const start = Math.max(0, Math.min(total, forecastStart))
  const units = i => (i <= start ? i : start + (i - start) * FORECAST_STRETCH)
  const all = units(total)
  return {
    at: i => (units(i) / all) * 100,
    dayAt: share => {
      const u = share * all
      const i = u < start ? Math.floor(u) : start + Math.floor((u - start) / FORECAST_STRETCH)
      return Math.max(0, Math.min(total - 1, i))
    },
  }
}

/**
 * Colour of a rain bar: the map's 7 d scale, whatever the window chosen. `solid` = without transparency,
 * for the forecast's outline.
 */
export function rainBarColor(mm, { solid = false } = {}) {
  const [r, g, b, a] = rainRgba(Math.max(mm, LIGHT_RAIN_MM), RAIN_SCALES['7d'].marks)
  const alpha = mm >= LIGHT_RAIN_MM ? a : LIGHT_ALPHA[0] + (Math.max(0, mm) / LIGHT_RAIN_MM) * (LIGHT_ALPHA[1] - LIGHT_ALPHA[0])
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${solid ? 1 : Math.round(alpha * 100) / 100})`
}

const conditionsBarColor = score => `var(--meteo-bar-${getScoreBand(score).key})`

/** Height (px) and colour of one part's figure, by layer. */
const LOOK = {
  rain: (v, forecast) => ({ height: (Math.min(v, RAIN_FULL_MM) / RAIN_FULL_MM) * BARS_PX, color: rainBarColor(v, { solid: forecast }) }),
  conditions: v => ({ height: (Math.min(v, 100) / 100) * BARS_PX, color: conditionsBarColor(v) }),
}

/**
 * The bars to draw from the endpoint's weeks, on an axis of `total` days starting on `first`:
 * [{ key, from, days, forecast, height, color }], `from` = days after `first`. Each week gives up to two:
 * its real days and its forecast ones (today on), side by side, so the current week comes split at today.
 * `height` null = those days have no figure (a baseline mark). Days past the end of the axis are cut.
 */
export function barSegments(weeks, layer, first, total, today) {
  const out = []
  for (const week of weeks ?? []) {
    const parts = [
      { id: 'real', start: week.from, end: week.to < today ? week.to : addDays(today, -1), data: week.real },
      { id: 'forecast', start: week.from > today ? week.from : today, end: week.to, data: week.forecast },
    ]
    for (const p of parts) {
      if (p.start > p.end) continue
      const from = Math.max(0, daysBetween(first, p.start))
      const days = Math.min(total, daysBetween(first, p.end) + 1) - from
      if (days <= 0) continue
      const value = p.data?.value
      const forecast = p.id === 'forecast'
      const look = value == null ? null : LOOK[layer](value, forecast)
      out.push({
        key: `${week.from}-${p.id}`, from, days, forecast,
        height: look ? Math.max(forecast ? MIN_FORECAST_PX : MIN_BAR_PX, look.height) : null, color: look?.color ?? null,
      })
    }
  }
  return out
}

/** The first days of the months inside the axis: [{ day: ISO, from }]. */
export function monthStarts(first, total) {
  const out = []
  for (let i = 0; i < total; i++) {
    const day = addDays(first, i)
    if (day.endsWith('-01')) out.push({ day, from: i })
  }
  return out
}
