// =====================================================
// The day selector's drawing (pure, no React): where each day falls on its axis and where the months start
// =====================================================
import { addDays } from './layerDays'

export const BARS_PX = 60 // height of the weekly figures' drawing
// A forecast day takes this many times the width of a past one: a week ahead against half a year would
// otherwise get a dozen pixels, too few to read or to put a finger on
export const FORECAST_STRETCH = 4
export const RAIN_FULL_MM = 60 // rain a week that fills the height; more is cut

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

/** The first days of the months inside the axis: [{ day: ISO, from }]. */
export function monthStarts(first, total) {
  const out = []
  for (let i = 0; i < total; i++) {
    const day = addDays(first, i)
    if (day.endsWith('-01')) out.push({ day, from: i })
  }
  return out
}
