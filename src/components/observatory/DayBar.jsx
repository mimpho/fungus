import { useEffect, useRef, useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { addDays, daysBetween, firstBarDay, todayIso } from '../../lib/layerDays'
import { BARS_PX, barSegments, dayScale, monthStarts } from '../../lib/dayBar'
import { formatDay } from '../../lib/thermometer'
import { useMeteoWeeks } from '../../hooks/useMeteoWeeks'
import { DayArea, dayAreaOn } from './dayArea/DayArea'

const COMMIT_DELAY_MS = 300
const MAGNIFIER_DAYS = 5 // days shown at each side of the one under the finger
const LOCALE = { es: 'es-ES', ca: 'ca-ES', en: 'en-GB' }

const TRACK_TOP = BARS_PX + 10 // px from the chart's top to the handle's centre
const CHART_PX = BARS_PX + 36 // bars, handle's track and months

// The days last seen from the server, so that the bar does not move when the layer is switched off and
// on, another species is asked for, or another Meteo segment is shown (module-level: one Observatory at a time)
let lastDays = null

/**
 * { lastDate, maxDate, forecastFrom } for the bar: from `data` (a layer's answer) when it has them,
 * else the last ones seen, else today as the last day with data and a week of forecast.
 */
export function layerDays(data) {
  if (data?.last_data_date) lastDays = { lastDate: data.last_data_date, maxDate: data.max_date, forecastFrom: data.forecast_from }
  if (lastDays) return lastDays
  const today = todayIso()
  return { lastDate: today, maxDate: addDays(today, 7), forecastFrom: today }
}

/**
 * Reference day of the Meteo tab's layers, shared by every segment: one bar from the Monday 26 weeks
 * before the current week (`firstBarDay`, the same limit a link's `dia` has) to `maxDate`, the last day
 * the server can answer (up to a week after today, from the stored forecast). Behind the handle, a bar
 * per week (the forecast days drawn wider than the past ones, see `dayScale`) with the figure of all Catalonia (`weeks` = { layer: 'rain' | 'conditions', species } to ask
 * for them; null = none), the forecast ones outlined and a dashed line at today. Above it, a strip with
 * «Hoy» over today's place that turns into a magnifier of ±5 days while dragging.
 * A day is dragged to, or stepped to with ‹ › and the keyboard (Page keys: a week); the server is asked
 * once the finger rests or is lifted, the buttons at once. The height is the same in every state.
 * `windowDays` (Lluvia): how many days the figure on the map adds up, ending on the chosen day; that stretch
 * is marked over the bars and on the track, from the handle to the left. Without it (null) the chosen day's
 * week is marked instead.
 * The day's label carries a «previsión» pill from `forecastFrom` on; on an earlier day it shows
 * `forecastNote` there instead, if given (the figure on the map still includes some forecast).
 * `lastDate` is the last day the cells have data for (null = nothing to choose); `forecastFrom` the first
 * day that is forecast (default: today); `date` the day shown; `onChange(iso | null)` null = `lastDate`.
 */
export function DayBar({ lastDate, maxDate, forecastFrom, date, onChange, weeks = null, windowDays = null, forecastNote = null }) {
  const { t, lang } = useApp()
  const timer = useRef(null)
  const pending = useRef(null) // the day chosen and not yet sent
  const [chosen, setChosen] = useState(null) // the same, for what is drawn
  const [dragging, setDragging] = useState(false)
  const figures = useMeteoWeeks(weeks?.layer ?? null, weeks?.species ?? null)

  useEffect(() => () => clearTimeout(timer.current), [])

  if (!lastDate) return null

  const today = todayIso()
  const first = firstBarDay(today)
  const end = maxDate && maxDate > lastDate ? maxDate : lastDate
  const total = daysBetween(first, end) + 1
  const clamp = i => Math.max(0, Math.min(total - 1, i))
  const day = chosen ?? date ?? lastDate
  const index = clamp(daysBetween(first, day))
  const shownDay = addDays(first, index)
  const forecast = shownDay >= (forecastFrom ?? today)
  const todayIndex = clamp(daysBetween(first, today))
  // The days from today on are wider (when today is past the axis there is none to widen)
  const forecastStart = daysBetween(first, today)
  const scale = dayScale(total, forecastStart)
  const left = scale.at
  const width = (from, days) => left(from + days) - left(from)
  const centre = i => `${(left(i) + left(i + 1)) / 2}%` // what points at a day sits in its middle
  const dayText = `${formatDay(shownDay, lang)}${forecast ? ` · ${t.obsLayForecast}` : ''}`

  const commit = () => {
    clearTimeout(timer.current)
    const next = pending.current
    pending.current = null
    setChosen(null)
    if (next !== null) onChange(next === lastDate ? null : next)
  }
  const choose = i => {
    const next = addDays(first, clamp(i))
    if (next === pending.current) return
    pending.current = next
    setChosen(next)
    clearTimeout(timer.current)
    timer.current = setTimeout(commit, COMMIT_DELAY_MS)
  }
  const step = i => { choose(i); commit() }

  const chooseAt = e => {
    const box = e.currentTarget.getBoundingClientRect()
    if (box.width) choose(scale.dayAt((e.clientX - box.left) / box.width))
  }
  const onPointerDown = e => {
    if (e.button !== 0) return
    e.currentTarget.setPointerCapture?.(e.pointerId)
    setDragging(true)
    chooseAt(e)
  }
  const onPointerMove = e => { if (dragging) chooseAt(e) }
  const onPointerEnd = () => {
    if (!dragging) return
    setDragging(false)
    commit()
  }
  const onKeyDown = e => {
    const to = {
      ArrowLeft: index - 1, ArrowDown: index - 1, ArrowRight: index + 1, ArrowUp: index + 1,
      PageDown: index - 7, PageUp: index + 7, Home: 0, End: total - 1,
    }[e.key]
    if (to === undefined) return
    e.preventDefault()
    choose(to) // a held key asks once it stops, like a drag
  }

  const asArea = Boolean(weeks) && dayAreaOn() // experiment: see dayArea/
  const segments = weeks && !asArea ? barSegments(figures, weeks.layer, first, total, today) : []
  // What is marked behind the bars: the days the map adds up (cut at the start of the bar), or else the
  // week of the chosen day (the bar starts on a Monday), to tell it apart
  const markFrom = windowDays ? Math.max(0, index - windowDays + 1) : index - (index % 7)
  const markDays = windowDays ? index - markFrom + 1 : Math.min(7, total - markFrom)
  const markStyle = { left: `${left(markFrom)}%`, width: `max(3px, ${width(markFrom, markDays)}%)` }

  const btn = 'w-[44px] h-[44px] shrink-0 rounded-full bg-cream/10 text-cream text-lg leading-none disabled:opacity-30 hover:bg-cream/20 transition outline-none focus-visible:ring-2 focus-visible:ring-cream/50'

  return (
    <div className="select-none" role="group" aria-label={t.obsLayDay}>
      <div className="flex items-center gap-2">
        <button type="button" className={btn} aria-label={t.obsLayPrevDay} disabled={index <= 0} onClick={() => step(index - 1)}>‹</button>
        <div className="flex-1 min-w-0 flex items-center justify-center gap-2">
          <span className="text-[15px] font-semibold text-cream" data-testid="day-bar-day">{formatDay(shownDay, lang)}</span>
          {(forecast || forecastNote) && <span className="rounded-full bg-[color-mix(in_srgb,var(--color-coffee-light)_20%,transparent)] px-2 py-0.5 text-xs font-semibold text-coffee-light whitespace-nowrap">{forecast ? t.obsLayForecast : forecastNote}</span>}
        </div>
        <button type="button" className={btn} aria-label={t.obsLayNextDay} disabled={index >= total - 1} onClick={() => step(index + 1)}>›</button>
      </div>

      {/* «Hoy», or the magnifier while dragging: the strip keeps its height */}
      <div className="relative h-[28px] mt-1">
        {dragging ? (
          <div className="flex gap-[2px] h-full" aria-hidden="true" data-testid="day-bar-magnifier">
            {Array.from({ length: 2 * MAGNIFIER_DAYS + 1 }, (_, n) => {
              const i = index + n - MAGNIFIER_DAYS
              const inside = i >= 0 && i < total
              return (
                <span key={n} className={`flex-1 min-w-0 rounded-md text-center text-[13px] leading-[28px] tabular-nums ${n === MAGNIFIER_DAYS ? 'bg-[var(--nav-active)] text-white font-semibold' : 'text-cream/80'}`}>
                  {inside ? Number(addDays(first, i).slice(8)) : ''}
                </span>
              )
            })}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => step(todayIndex)}
            aria-label={t.obsLayToday}
            aria-pressed={index === todayIndex}
            className={`absolute top-0 h-[28px] -translate-x-1/2 rounded-full px-2.5 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-cream/50 ${index === todayIndex ? 'text-cream' : 'text-cream/80 bg-cream/10 hover:bg-cream/20'}`}
            style={{ left: `clamp(24px, ${centre(todayIndex)}, calc(100% - 24px))` }}
          >
            {t.obsLayToday}
          </button>
        )}
      </div>

      <div
        role="slider"
        tabIndex={0}
        aria-label={t.obsLayDay}
        aria-valuemin={0}
        aria-valuemax={total - 1}
        aria-valuenow={index}
        aria-valuetext={dayText}
        data-testid="day-bar"
        className="relative mt-1 cursor-pointer touch-none rounded-md outline-none focus-visible:ring-2 focus-visible:ring-cream/50"
        style={{ height: CHART_PX }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onKeyDown={onKeyDown}
      >
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          {(weeks || windowDays) && (
            <span data-testid={windowDays ? 'day-bar-window' : 'day-bar-week'} className={`absolute top-0 rounded-t-[3px] ${windowDays ? 'bg-cream/[0.18]' : 'bg-cream/10'}`} style={{ ...markStyle, height: BARS_PX }} />
          )}
          {asArea && <DayArea weeks={figures} layer={weeks.layer} first={first} total={total} today={today} forecastStart={forecastStart} at={left} />}
          {segments.map(s => (
            <span
              key={s.key}
              data-testid={s.height === null ? 'day-bar-empty' : s.forecast ? 'day-bar-forecast' : 'day-bar-real'}
              className="absolute box-border rounded-[2px]"
              style={{
                left: `${left(s.from)}%`,
                width: `max(2px, calc(${width(s.from, s.days)}% - 1.5px))`,
                top: BARS_PX - (s.height ?? 2),
                height: s.height ?? 2,
                ...(s.height === null
                  ? { backgroundColor: 'rgba(var(--color-cream-rgb), 0.25)' }
                  : s.forecast ? { border: `1.5px solid ${s.color}` } : { backgroundColor: s.color }),
              }}
            />
          ))}
          <span className="absolute inset-x-0 h-px bg-cream/30" style={{ top: BARS_PX }} />
          <span className="absolute inset-x-0 h-[4px] -translate-y-1/2 rounded-full bg-cream/20" style={{ top: TRACK_TOP }} />
          {windowDays && (
            <span data-testid="day-bar-window-track" className="absolute h-[6px] -translate-y-1/2 rounded-full bg-coffee-light" style={{ ...markStyle, top: TRACK_TOP }} />
          )}
          <span className="absolute top-0 -translate-x-1/2 w-[1.5px] bg-cream" style={{ left: centre(index), height: TRACK_TOP }} />
          <span className="absolute -translate-x-1/2 -translate-y-1/2 w-[16px] h-[16px] rounded-full bg-coffee-light border-[1.5px] border-cream" style={{ left: centre(index), top: TRACK_TOP }} />
          {/* over the handle, and past it, so that today is seen with the handle beside or on it */}
          {forecastStart > 0 && forecastStart < total && (
            <span data-testid="day-bar-today-line" className="absolute top-0 border-l border-dashed border-cream/80" style={{ left: `${left(forecastStart)}%`, height: TRACK_TOP + 12 }} />
          )}
          {forecastStart < total && (
            <span className="absolute right-0 bottom-0 text-[11px] leading-[13px] text-cream/80">+{total - 1 - Math.max(0, forecastStart)} d</span>
          )}
          {monthStarts(first, total).map(m => (
            <span key={m.day} className="absolute bottom-0" style={{ left: `${left(m.from)}%` }}>
              <span className="absolute left-0 bottom-[13px] h-[5px] border-l border-cream/50" />
              {/* a month starting at the very end has its tick but no room for its name */}
              {left(m.from) < 92 && (
                <span className="block pl-[2px] text-[11px] leading-[13px] text-cream/80 whitespace-nowrap">
                  {new Date(`${m.day}T12:00:00`).toLocaleDateString(LOCALE[lang] ?? LOCALE.es, { month: 'short' }).replace('.', '')}
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
