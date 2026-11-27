// Calendar-day arithmetic on ISO dates (YYYY-MM-DD), in UTC so daylight saving never shifts a day.
const MS_DAY = 86_400_000
const toMs = iso => Date.parse(`${iso}T00:00:00Z`)

export function addDays(iso, n) {
  return new Date(toMs(iso) + n * MS_DAY).toISOString().slice(0, 10)
}

/** Whole days from `from` to `to` (negative when `to` is earlier). */
export function daysBetween(from, to) {
  return Math.round((toMs(to) - toMs(from)) / MS_DAY)
}

/** How many whole weeks before the current one the day selector reaches. */
export const BAR_WEEKS_BACK = 26

/**
 * First day of the day selector, and so of a link's `dia`: the Monday BAR_WEEKS_BACK weeks before the
 * current week. The same rule as the back end's `first_bar_day` (services/meteo_weeks.py).
 */
export function firstBarDay(today) {
  const sinceMonday = (new Date(toMs(today)).getUTCDay() + 6) % 7
  return addDays(today, -sinceMonday - 7 * BAR_WEEKS_BACK)
}

/** Today's date as the backend sees it (UTC). */
export function todayIso() {
  return new Date().toISOString().slice(0, 10)
}
