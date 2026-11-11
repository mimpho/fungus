import { useEffect, useRef, useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { addDays, daysBetween, todayIso } from '../../lib/layerDays'
import { formatDay } from '../../lib/thermometer'

export const DAYS_BACK = 30
const COMMIT_DELAY_MS = 300

// The slider's days last seen from the server, so that the slider does not move when the layer is
// switched off and on, another species is asked for, or another Meteo segment is shown
// (module-level: one Observatory at a time)
let lastDays = null

/**
 * { lastDate, maxDate, forecastFrom } for the slider: from `data` (a layer's answer) when it has them,
 * else the last ones seen, else today as the last day with data and a week of forecast.
 */
export function layerDays(data) {
  if (data?.last_data_date) lastDays = { lastDate: data.last_data_date, maxDate: data.max_date, forecastFrom: data.forecast_from }
  if (lastDays) return lastDays
  const today = todayIso()
  return { lastDate: today, maxDate: addDays(today, 7), forecastFrom: today }
}

/**
 * Reference day of the Meteo tab's layers, shared by every segment: a slider from `DAYS_BACK` days before
 * today up to `maxDate` (the last day the server can score: up to a week after today,
 * from the stored forecast), step buttons, and under the slider its ends and «Hoy», which goes back to
 * today. The days from `forecastFrom` on are forecast: the strip under the slider marks them and the
 * label says so. Dragging only asks the server once the finger rests (debounce), buttons ask at once.
 * `lastDate` is the last day the cells have data for (null = nothing to choose); `maxDate` the last one
 * that can be asked (default: `lastDate`, no forecast); `forecastFrom` the first day that is forecast
 * (default: today); `date` the day being shown; `onChange(iso | null)` null = the last day with data.
 */
export function LayerDayControl({ lastDate, maxDate, forecastFrom, date, onChange }) {
  const { t, lang } = useApp()
  const timer = useRef(null)
  const [dragging, setDragging] = useState(null) // offset while dragging, else null

  useEffect(() => () => clearTimeout(timer.current), [])

  if (!lastDate) return null

  // The slider runs from `DAYS_BACK` days before today to the last day that can be scored (offsets are
  // days after `lastDate`, which may be today or the day before), the same range a link's `dia` is
  // clamped to (src/lib/observatoryView.js)
  const today = todayIso()
  const minOff = Math.min(0, daysBetween(lastDate, addDays(today, -DAYS_BACK)))
  const maxOff = Math.max(0, daysBetween(lastDate, maxDate ?? lastDate))
  const firstForecast = forecastFrom ?? today
  const offset = Math.max(minOff, Math.min(maxOff, daysBetween(lastDate, date ?? lastDate)))

  const commit = off => onChange(off === 0 ? null : addDays(lastDate, off))
  const clamp = off => Math.max(minOff, Math.min(maxOff, off))
  const move = off => {
    clearTimeout(timer.current)
    setDragging(null)
    commit(clamp(off))
  }
  const drag = off => {
    setDragging(off)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => { commit(off); setDragging(null) }, COMMIT_DELAY_MS)
  }

  const value = dragging ?? offset
  const label = addDays(lastDate, value)
  const forecast = label >= firstForecast
  const span = Math.max(1, maxOff - minOff)
  const share = off => ((off - minOff) / span) * 100
  // where the forecast starts on the slider, as a share of its length (null: no forecast days)
  const forecastStart = daysBetween(lastDate, firstForecast)
  const marked = maxOff > 0 && forecastStart <= maxOff ? Math.max(0, share(Math.max(forecastStart, minOff))) : null
  // Today on the slider (it may be the last day with data, or the first forecast day)
  const todayOff = clamp(daysBetween(lastDate, today))
  const ahead = daysBetween(today, addDays(lastDate, maxOff)) // forecast days after today
  const dayText = `${formatDay(label, lang)}${forecast ? ` · ${t.obsLayForecast}` : ''}`
  const btn = 'w-[44px] h-[44px] shrink-0 rounded-full bg-cream/10 text-cream text-lg leading-none disabled:opacity-30 hover:bg-cream/20 transition outline-none focus-visible:ring-2 focus-visible:ring-cream/50'

  return (
    <div className="space-y-1" role="group" aria-label={t.obsLayDay}>
      <div className="flex items-center gap-2">
        <button type="button" className={btn} aria-label={t.obsLayPrevDay} disabled={value <= minOff} onClick={() => move(value - 1)}>‹</button>
        <div className="flex-1 min-w-0 flex items-center justify-center gap-2">
          <span className="text-[15px] font-semibold text-cream">{formatDay(label, lang)}</span>
          {forecast && <span className="rounded-full bg-[color-mix(in_srgb,var(--color-coffee-light)_20%,transparent)] px-2 py-0.5 text-xs font-semibold text-coffee-light">{t.obsLayForecast}</span>}
        </div>
        <button type="button" className={btn} aria-label={t.obsLayNextDay} disabled={value >= maxOff} onClick={() => move(value + 1)}>›</button>
      </div>
      <input
        type="range"
        className="block w-full accent-[var(--color-coffee-light)]"
        min={minOff}
        max={maxOff}
        step={1}
        value={value}
        aria-label={t.obsLayDay}
        aria-valuetext={dayText}
        onChange={e => drag(Number(e.target.value))}
      />
      {marked !== null && (
        // The forecast stretch of the slider; the margin is the thumb's half width, so the strip lines
        // up with the slider's own track.
        <div className="px-2" aria-hidden="true">
          <div className="relative h-1 rounded-full bg-cream/15">
            <div
              className="absolute inset-y-0 right-0 rounded-full bg-[color-mix(in_srgb,var(--color-coffee-light)_60%,transparent)]"
              style={{ left: `${marked}%` }}
              data-testid="layer-forecast-stretch"
            />
          </div>
        </div>
      )}
      <div className="relative px-2 h-[28px] text-xs text-cream/60">
        <span className="absolute left-0 top-1/2 -translate-y-1/2" aria-hidden="true">−{DAYS_BACK} d</span>
        {ahead > 0 && <span className="absolute right-0 top-1/2 -translate-y-1/2" aria-hidden="true">+{ahead} d</span>}
        <span className="absolute inset-x-2 inset-y-0">
          <button
            type="button"
            onClick={() => move(todayOff)}
            aria-label={t.obsLayToday}
            aria-pressed={value === todayOff}
            className={`absolute top-0 h-[28px] -translate-x-1/2 rounded-full px-2.5 font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-cream/50 ${value === todayOff ? 'text-cream' : 'text-cream/80 bg-cream/10 hover:bg-cream/20'}`}
            style={{ left: `${share(todayOff)}%` }}
          >
            {t.obsLayToday}
          </button>
        </span>
      </div>
    </div>
  )
}
