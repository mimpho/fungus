import { useRef } from 'react'
import { useApp } from '../../contexts/AppContext'
import { HEAT_COLORS, binOf, binLimits, clampWindow } from '../../lib/territoryData'

const GRAB_PX = 20

/**
 * Weekly strip under the heat map: bars with the mean rain of Catalonia per week and a window
 * (1–8 weeks) to drag, stretch from its edges or move with the arrow keys.
 */
export function RainTimeline({ weeks, means, win, onChange, label }) {
  const { t, lang } = useApp()
  const ref = useRef(null)
  const drag = useRef(null)
  const N = weeks.length
  const last = N - 1
  const nWeeks = win.b - win.a + 1
  const pct = i => (i / N) * 100
  const max = Math.max(1, ...means.filter(m => m != null))
  const limits = binLimits(1)
  const monthFmt = new Intl.DateTimeFormat(lang, { month: 'short', timeZone: 'UTC' })

  const ticks = []
  let lastMonth = -1
  weeks.forEach((w, i) => {
    const d = new Date(`${w.start}T00:00:00Z`)
    if (d.getUTCMonth() !== lastMonth) {
      lastMonth = d.getUTCMonth()
      ticks.push({ i, text: monthFmt.format(d), jan: lastMonth === 0 })
    }
  })

  const pos = e => {
    const r = ref.current.getBoundingClientRect()
    return { px: e.clientX - r.left, w: r.width }
  }

  function onDown(e) {
    const { px, w } = pos(e)
    const lpx = (win.a / N) * w
    const rpx = ((win.b + 1) / N) * w
    let mode = 'move'
    if (Math.abs(px - lpx) <= GRAB_PX && px <= lpx + 8) mode = 'l'
    else if (Math.abs(px - rpx) <= GRAB_PX && px >= rpx - 8) mode = 'r'
    else if (px < lpx || px > rpx) {
      const width = win.b - win.a
      const a = Math.floor((px / w) * N - width / 2)
      onChange(clampWindow(a, a + width, last))
      drag.current = { mode: 'move', x0: px, a0: a, b0: a + width, w }
      e.currentTarget.setPointerCapture?.(e.pointerId)
      return
    }
    drag.current = { mode, x0: px, a0: win.a, b0: win.b, w }
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }

  function onMove(e) {
    const D = drag.current
    if (!D) return
    const dd = ((pos(e).px - D.x0) / D.w) * N
    if (D.mode === 'move') onChange(clampWindow(D.a0 + dd, D.b0 + dd, last))
    else if (D.mode === 'l') onChange(clampWindow(Math.min(D.a0 + dd, D.b0), D.b0, last, 'l'))
    else onChange(clampWindow(D.a0, Math.max(D.b0 + dd, D.a0), last, 'r'))
  }

  function onKey(e) {
    const k = e.key
    if (k === 'ArrowLeft') { e.preventDefault(); onChange(e.shiftKey ? clampWindow(win.a, win.b - 1, last, 'r') : clampWindow(win.a - 1, win.b - 1, last)) }
    else if (k === 'ArrowRight') { e.preventDefault(); onChange(e.shiftKey ? clampWindow(win.a, win.b + 1, last, 'r') : clampWindow(win.a + 1, win.b + 1, last)) }
    else if (k === 'End') { e.preventDefault(); onChange(clampWindow(last - nWeeks + 1, last, last)) }
  }

  const left = pct(win.a)
  const right = pct(win.b + 1)
  const handle = 'absolute top-0 bottom-[18px] w-[18px] flex items-center justify-center bg-bar text-white text-sm font-bold pointer-events-none'

  return (
    <div
      ref={ref}
      role="slider"
      tabIndex={0}
      aria-label={t.obsHeatSlider.replace('{n}', nWeeks).replace('{range}', label)}
      aria-valuetext={label}
      aria-valuemin={1}
      aria-valuemax={N}
      aria-valuenow={win.b + 1}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={() => { drag.current = null }}
      onPointerCancel={() => { drag.current = null }}
      onKeyDown={onKey}
      data-testid="rain-timeline"
      className="relative h-[104px] mx-[14px] cursor-grab select-none touch-none"
    >
      <div className="absolute top-0 bottom-[18px] inset-x-0 rounded-md bg-cream/[0.06]" />
      {ticks.map(tk => (
        <span key={tk.i}>
          <span className="absolute top-0 bottom-[18px] w-px bg-cream" style={{ left: `${pct(tk.i)}%`, opacity: tk.jan ? 0.5 : 0.14 }} />
          <span className="absolute bottom-0 text-[11px] text-cream/60" style={{ left: `${pct(tk.i)}%`, paddingLeft: 3 }}>{tk.text}</span>
        </span>
      ))}
      {means.map((m, i) => m == null ? null : (
        <span
          key={i}
          className="absolute bottom-[22px] rounded-t-sm"
          style={{
            left: `calc(${pct(i)}% + 1px)`,
            width: `calc(${100 / N}% - 2px)`,
            height: Math.max(1.5, (m / max) * 62),
            background: HEAT_COLORS[binOf(m, limits)],
          }}
        />
      ))}
      <span className="absolute top-0 bottom-[18px] left-0 bg-black/40 pointer-events-none" style={{ width: `${left}%` }} />
      <span className="absolute top-0 bottom-[18px] right-0 bg-black/40 pointer-events-none" style={{ left: `${right}%` }} />
      <span className="absolute top-0 bottom-[18px] border-y-2 border-bar box-border pointer-events-none" style={{ left: `${left}%`, width: `${right - left}%` }} />
      <span aria-hidden="true" className={`${handle} rounded-l-lg`} style={{ left: `calc(${left}% - 14px)` }}>‹</span>
      <span aria-hidden="true" className={`${handle} rounded-r-lg`} style={{ left: `calc(${right}% - 4px)` }}>›</span>
    </div>
  )
}
