import { useMemo, useRef } from 'react'
import { useApp } from '../../contexts/AppContext'
import { getScoreBand } from '../../lib/scoreBands'
import { fill } from '../../lib/thermometer'
import {
  centreOn, dayWithYear, dragWindow, keyWindow, minLength, monthMarks, monthName, weeklyBars,
} from '../../lib/timeline'

// Literal colours, like the chart: the bars are drawn from numbers and look the same in both themes.
const BAR_COLOR = { rain: '#4a8fb8', temp: '#d08a3c', hum: '#4a8fb8', wind: '#7b8794' }
const TAB_LABEL = { score: 'obsTlScore', rain: 'obsTlRain', temp: 'obsTlTemp', hum: 'obsTlHum', wind: 'obsTlWind' }
const EDGE_PX = 20   // how close to an edge a press grabs it instead of moving the window
const BAR_AREA = 62  // px of the tallest bar

const pct = (i, length) => `${((i / length) * 100).toFixed(3)}%`

/**
 * The strip under the chart: the whole series of the point as weekly bars (of what the active
 * tab shows) with the window over it. Drag the window to move it, drag its edges to stretch it
 * (7–180 days), click outside to centre it there, or use the keyboard (see keyWindow). The
 * window follows the pointer live (`onDraft`) and is committed on release (`onCommit`).
 * `series` are the days of the whole answer, `win` = { a, b } the window shown.
 */
export function Timeline({ series, win, tab, onDraft, onCommit, onToday, atLatest }) {
  const { t, lang } = useApp()
  const length = series.length
  const dragRef = useRef(null)
  const bars = useMemo(() => weeklyBars(series, tab), [series, tab])
  const marks = useMemo(() => monthMarks(series), [series])
  const n = win.b - win.a + 1

  const from = series[win.a]?.date, to = series[win.b]?.date
  const label = `${dayWithYear(from, lang)} – ${dayWithYear(to, lang)} · ${fill(t.obsChNDaysOption, { n }, lang)}`
  const aria = fill(t.obsTlAria, { n, from: dayWithYear(from, lang), to: dayWithYear(to, lang) }, lang)

  const left = win.a / length * 100
  const right = (win.b + 1) / length * 100

  function position(e) {
    const r = e.currentTarget.getBoundingClientRect()
    return { px: e.clientX - r.left, width: r.width }
  }

  function down(e) {
    if (e.button !== undefined && e.button !== 0) return
    const { px, width } = position(e)
    const day = (px / width) * length
    const lpx = (left / 100) * width, rpx = (right / 100) * width
    let mode = 'move'
    let start = win
    if (Math.abs(px - lpx) <= EDGE_PX && px <= lpx + 8) mode = 'l'
    else if (Math.abs(px - rpx) <= EDGE_PX && px >= rpx - 8) mode = 'r'
    else if (px < lpx || px > rpx) {
      start = centreOn(win, day, length)
      onDraft(start)
    }
    dragRef.current = { mode, x0: px, start, width, latest: start }
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch (_e) { /* not essential */ }
    e.currentTarget.focus({ preventScroll: true })
  }

  function move(e) {
    const drag = dragRef.current
    if (!drag) return
    const { px } = position(e)
    const delta = ((px - drag.x0) / drag.width) * length
    drag.latest = dragWindow(drag.start, drag.mode, delta, length)
    onDraft(drag.latest)
  }

  function up(e) {
    const drag = dragRef.current
    if (!drag) return
    dragRef.current = null
    // The draft being shown becomes the window of the page (and of the thermometer)
    onCommit(drag.latest)
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch (_e) { /* already released */ }
  }

  function key(e) {
    const next = keyWindow(win, e, length)
    if (!next) return
    e.preventDefault()
    onCommit(next)
  }

  return (
    <div className="space-y-1.5">
      {/* Two lines, always: the dates (with «back to today» at the right, which only comes and goes
          inside its own fixed-height line) and the hint below */}
      <div className="text-xs">
        <div className="flex items-center justify-between gap-x-3 min-h-[1.625rem]">
          <span data-testid="timeline-label" className="text-cream font-semibold">{label}</span>
          {!atLatest && (
            <button
              type="button"
              onClick={onToday}
              className="shrink-0 px-2.5 py-0.5 rounded-xl glass text-cream text-xs font-medium hover:[background-color:var(--ui-surface-hover)] transition-all"
            >
              {t.obsTlToday}
            </button>
          )}
        </div>
        <p className="text-cream/60">{t[TAB_LABEL[tab]]} · {t.obsTlHint}</p>
      </div>

      <div
        role="slider"
        tabIndex={0}
        aria-label={aria}
        aria-valuemin={minLength(length) - 1}
        aria-valuemax={length - 1}
        aria-valuenow={win.b}
        aria-valuetext={label}
        data-testid="timeline"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onKeyDown={key}
        className="relative h-[104px] mx-3.5 touch-none cursor-grab active:cursor-grabbing select-none outline-none focus-visible:ring-2 focus-visible:ring-cream/50 rounded-md"
      >
        <div aria-hidden="true" className="absolute inset-x-0 top-0 bottom-[18px] rounded-md bg-cream/[0.08]" />
        {marks.map(m => (
          <span key={m.i} aria-hidden="true">
            <span className="absolute top-0 bottom-[18px] w-px bg-cream" style={{ left: pct(m.i, length), opacity: m.january ? 0.5 : 0.14 }} />
            <span
              className={`absolute bottom-0.5 text-[10.5px] whitespace-nowrap ${m.january ? 'text-cream font-semibold' : 'text-cream/60'}`}
              style={{ left: `calc(${pct(m.i, length)} + 4px)` }}
            >
              {monthName(m.month, lang)}{m.january ? ` ${m.year}` : ''}
            </span>
          </span>
        ))}
        {bars.map(b => {
          if (b.fraction === null) return null
          const inside = b.i0 + b.n > win.a && b.i0 <= win.b
          const color = tab === 'score' ? `var(--ui-score-${getScoreBand(b.value).key}-bar)` : BAR_COLOR[tab]
          return (
            <span
              key={b.i0}
              aria-hidden="true"
              className="absolute bottom-[18px] rounded-t-sm"
              style={{
                left: `calc(${pct(b.i0, length)} + 1px)`,
                width: `calc(${((b.n / length) * 100).toFixed(3)}% - 2px)`,
                height: `${Math.max(1.5, b.fraction * BAR_AREA).toFixed(1)}px`,
                background: color,
                opacity: inside ? 0.95 : 0.4,
              }}
            />
          )
        })}
        <span
          aria-hidden="true"
          className="absolute top-0 bottom-[18px] border-y-2 border-bar bg-cream/[0.06] pointer-events-none"
          style={{ left: `${left}%`, width: `${right - left}%` }}
        />
        <span aria-hidden="true" className="absolute top-0 bottom-[18px] w-[18px] rounded-l-lg bg-bar text-white flex items-center justify-center text-sm font-bold pointer-events-none" style={{ left: `calc(${left}% - 14px)` }}>‹</span>
        <span aria-hidden="true" className="absolute top-0 bottom-[18px] w-[18px] rounded-r-lg bg-bar text-white flex items-center justify-center text-sm font-bold pointer-events-none" style={{ left: `calc(${right}% - 4px)` }}>›</span>
      </div>
    </div>
  )
}
