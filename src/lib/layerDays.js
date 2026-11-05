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

/** Today's date as the backend sees it (UTC). */
export function todayIso() {
  return new Date().toISOString().slice(0, 10)
}
