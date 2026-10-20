import { useEffect, useRef, useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { addDays, daysBetween, todayIso } from '../../lib/layerDays'
import { formatDay } from '../../lib/thermometer'

const DAYS_BACK = 30
const COMMIT_DELAY_MS = 300

/**
 * Reference day of the probability layer: a short slider from `DAYS_BACK` days before the last
 * day with data up to that day (days after today are forecast), plus step buttons. Dragging only
 * asks the server once the finger rests (debounce), buttons ask at once.
 * `lastDate` is the last day the cells have data for (null = nothing to choose); `date` the day
 * being shown; `onChange(iso | null)` null = the last day with data.
 */
export function LayerDayControl({ lastDate, date, onChange }) {
  const { t, lang } = useApp()
  const shown = date ?? lastDate
  const offset = daysBetween(lastDate, shown) // <= 0
  const [dragging, setDragging] = useState(null) // offset while dragging, else null
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  if (!lastDate) return null

  const commit = off => onChange(off >= 0 ? null : addDays(lastDate, off))
  const move = off => {
    clearTimeout(timer.current)
    setDragging(null)
    commit(Math.max(-DAYS_BACK, Math.min(0, off)))
  }
  const drag = off => {
    setDragging(off)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => { commit(off); setDragging(null) }, COMMIT_DELAY_MS)
  }

  const value = dragging ?? offset
  const label = addDays(lastDate, value)
  const forecast = label > todayIso()
  const btn = 'w-7 h-7 shrink-0 rounded-full bg-cream/10 text-cream text-base leading-none disabled:opacity-30 hover:bg-cream/20 transition'

  return (
    <div className="space-y-1" role="group" aria-label={t.obsLayDay}>
      <div className="flex items-center gap-2">
        <button type="button" className={btn} aria-label={t.obsLayPrevDay} disabled={value <= -DAYS_BACK} onClick={() => move(value - 1)}>‹</button>
        <input
          type="range"
          className="flex-1 min-w-0 accent-[#c4a06b]"
          min={-DAYS_BACK}
          max={0}
          step={1}
          value={value}
          aria-label={t.obsLayDay}
          aria-valuetext={formatDay(label, lang)}
          onChange={e => drag(Number(e.target.value))}
        />
        <button type="button" className={btn} aria-label={t.obsLayNextDay} disabled={value >= 0} onClick={() => move(value + 1)}>›</button>
      </div>
      <p className="text-[11px] text-cream/70 text-center">
        {formatDay(label, lang)}{forecast && <span className="text-cream/50"> · {t.obsLayForecast}</span>}
      </p>
    </div>
  )
}
