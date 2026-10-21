import { useEffect, useRef, useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { addDays, daysBetween, todayIso } from '../../lib/layerDays'
import { formatDay } from '../../lib/thermometer'

const DAYS_BACK = 30
const COMMIT_DELAY_MS = 300

/**
 * Reference day of the conditions layer: a slider from `DAYS_BACK` days before the last day with
 * data up to `maxDate` (the last day the server can score: up to a week after today, from the
 * stored forecast), plus step buttons. The days from `forecastFrom` on are forecast: the strip
 * under the slider marks them and the label says so. Dragging only asks the server once the
 * finger rests (debounce), buttons ask at once.
 * `lastDate` is the last day the cells have data for (null = nothing to choose); `maxDate` the
 * last one that can be asked (default: `lastDate`, no forecast); `forecastFrom` the first day
 * that is forecast (default: today); `date` the day being shown; `onChange(iso | null)` null =
 * the last day with data.
 */
export function LayerDayControl({ lastDate, maxDate, forecastFrom, date, onChange }) {
  const { t, lang } = useApp()
  const timer = useRef(null)
  const [dragging, setDragging] = useState(null) // offset while dragging, else null

  useEffect(() => () => clearTimeout(timer.current), [])

  if (!lastDate) return null

  const maxOff = Math.max(0, daysBetween(lastDate, maxDate ?? lastDate)) // days after `lastDate`
  const firstForecast = forecastFrom ?? todayIso()
  const offset = Math.min(maxOff, daysBetween(lastDate, date ?? lastDate))

  const commit = off => onChange(off === 0 ? null : addDays(lastDate, off))
  const clamp = off => Math.max(-DAYS_BACK, Math.min(maxOff, off))
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
  // where the forecast starts on the slider, as a share of its length (null: no forecast days)
  const forecastStart = daysBetween(lastDate, firstForecast)
  const marked = maxOff > 0 && forecastStart <= maxOff
    ? Math.max(0, (Math.max(forecastStart, -DAYS_BACK) + DAYS_BACK) / (DAYS_BACK + maxOff)) * 100
    : null
  const dayText = `${formatDay(label, lang)}${forecast ? ` · ${t.obsLayForecast}` : ''}`
  const btn = 'w-7 h-7 shrink-0 rounded-full bg-cream/10 text-cream text-base leading-none disabled:opacity-30 hover:bg-cream/20 transition'

  return (
    <div className="space-y-1" role="group" aria-label={t.obsLayDay}>
      <div className="flex items-center gap-2">
        <button type="button" className={btn} aria-label={t.obsLayPrevDay} disabled={value <= -DAYS_BACK} onClick={() => move(value - 1)}>‹</button>
        <input
          type="range"
          className="flex-1 min-w-0 accent-[#c4a06b]"
          min={-DAYS_BACK}
          max={maxOff}
          step={1}
          value={value}
          aria-label={t.obsLayDay}
          aria-valuetext={dayText}
          onChange={e => drag(Number(e.target.value))}
        />
        <button type="button" className={btn} aria-label={t.obsLayNextDay} disabled={value >= maxOff} onClick={() => move(value + 1)}>›</button>
      </div>
      {marked !== null && (
        // The forecast stretch of the slider; the margins are the buttons' width plus the gaps,
        // and the thumb's half width, so the strip lines up with the slider's own track.
        <div className="mx-[2.25rem] px-2" aria-hidden="true">
          <div className="relative h-1 rounded-full bg-cream/15">
            <div
              className="absolute inset-y-0 right-0 rounded-full bg-[#c4a06b]/60"
              style={{ left: `${marked}%` }}
              data-testid="layer-forecast-stretch"
            />
          </div>
        </div>
      )}
      <p className="text-[11px] text-cream/70 text-center">
        {formatDay(label, lang)}{forecast && <span className="text-cream/50"> · {t.obsLayForecast}</span>}
      </p>
    </div>
  )
}
