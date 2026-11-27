import { useEffect, useRef, useState } from 'react'
import { Layers } from 'lucide-react'
import { useApp } from '../../../contexts/AppContext'
import { TABS } from '../../../hooks/useMapNavigation'
import { TabButton } from './TabRail'
import { SheetHandle } from '../SheetHandle'
import { MAP_COLUMN } from '../../../lib/mapColumn'
import { useSheetDrag } from '../../../hooks/useSheetDrag'

export const SHEET_MS = 300 // how long the sheet takes to grow or fold

/**
 * Phone: the three tabs, and Vista after them, as a full-width bar fixed to the bottom of the map (top
 * corners rounded, no drag handle). Vista chooses the base map: no switch, no dot, set apart by a thin
 * line. Opening a tab or Vista grows a sheet upward out of the bar: bar and sheet are one surface, the
 * bar stays where it is, so its three icons never move. The sheet scrolls inside and, with the bar,
 * never covers more than 80 % of the map. `reservePx`: room kept above it for the folded sheets of the stack. `onHeight` reports the height it covers
 * (sheet included).
 * The sheet has a handle: dragging it down folds the sheet (it follows the finger and closes past a third of its height).
 * The handle takes no room of its own (the whole sheet drags): it lies over the top of the panel, as far from the sheet's
 * edge as on the other sheets, so the title starts as far from the top as from the sides.
 */
export function PhoneTabBar({ openTab, on, onToggle, panelId, viewPanelId, renderPanel, reservePx = 0, onHeight }) {
  const { t } = useApp()
  const open = TABS.includes(openTab) || openTab === 'view'
  // The last tab stays drawn while its sheet folds away, so the content does not vanish before it
  const [shownTab, setShownTab] = useState(open ? openTab : null)
  useEffect(() => { if (open) setShownTab(openTab) }, [open, openTab])
  // While the sheet grows or folds, its content does not scroll: a scroll bar would flash during the move and
  // push the content sideways. It scrolls again once the sheet is still (transition end, or a timeout when there is no
  // transition, as under reduced motion).
  const [still, setStill] = useState(true)
  const firstRun = useRef(true)
  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return undefined }
    setStill(false)
    const timer = setTimeout(() => setStill(true), SHEET_MS + 50)
    return () => clearTimeout(timer)
  }, [open])

  // Dragging the handle: the sheet's height follows the finger (px; null = not dragging, the grid animates as usual)
  const sheetRef = useRef(null)
  const fullH = useRef(0)
  const [dragH, setDragH] = useState(null)
  const [settling, setSettling] = useState(false)
  const settleTimer = useRef(null)
  useEffect(() => () => clearTimeout(settleTimer.current), [])
  const settle = closing => {
    setSettling(true)
    setDragH(closing ? 0 : fullH.current)
    if (closing) onToggle(openTab) // the grid is already folding to 0fr when the drag height lets go: no jump back to full
    settleTimer.current = setTimeout(() => { setSettling(false); setDragH(null) }, SHEET_MS)
  }

  const ref = useRef(null)
  // The whole sheet drags (not the tab buttons): its height follows the finger and it closes past a third of its height
  useSheetDrag(ref, {
    enabled: open,
    onStart: () => { clearTimeout(settleTimer.current); fullH.current = sheetRef.current?.offsetHeight ?? 0; setSettling(false); setDragH(fullH.current) },
    onMove: dy => setDragH(Math.max(0, fullH.current - Math.max(0, dy))),
    onEnd: dy => settle(dy > Math.min(fullH.current / 3, 120)),
  })
  const report = useRef(onHeight)
  useEffect(() => { report.current = onHeight }, [onHeight])
  useEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return undefined
    const ro = new ResizeObserver(() => report.current?.(el.offsetHeight))
    ro.observe(el)
    return () => { ro.disconnect(); report.current?.(0) }
  }, [])

  return (
    <div
      ref={ref}
      data-testid="phone-tab-bar"
      data-map-cover=""
      style={{ maxHeight: `calc(80% - ${reservePx}px)` }}
      className={`absolute z-[1110] inset-x-0 bottom-0 flex flex-col map-bar-surface rounded-t-[24px] shadow-bottom ${MAP_COLUMN}`}
    >
      <div
        ref={sheetRef}
        className={`min-h-0 grid ${dragH !== null ? 'overflow-hidden' : ''} transition-[grid-template-rows] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none`}
        style={{
          gridTemplateRows: open ? '1fr' : '0fr',
          transitionDuration: `${SHEET_MS}ms`,
          ...(dragH !== null ? { height: dragH, transition: settling ? `height ${SHEET_MS}ms cubic-bezier(0.32,0.72,0,1)` : 'none' } : {}),
        }}
        onTransitionEnd={e => { if (e.target === e.currentTarget) setStill(true) }}
      >
        <div
          {...(open ? {} : { inert: '', 'aria-hidden': true })}
          className="min-h-0 flex flex-col overflow-hidden"
        >
          <div className={`min-h-0 flex-1 overscroll-contain ${still && open && dragH === null ? 'overflow-y-auto' : 'overflow-hidden'}`}>
            {/* The handle goes inside what scrolls, over the panel's header. Its line is 13 px under the sheet's edge, as on
                the species' sheet; narrow enough to leave the title and the switch free */}
            <div className="relative">
              <div className="absolute z-10 top-0 left-1/2 -translate-x-1/2 w-[96px]">
                <SheetHandle onToggle={() => onToggle(openTab)} className="h-[28px] pt-[13px] rounded-full" />
              </div>
              {shownTab && renderPanel(shownTab)}
            </div>
          </div>
        </div>
      </div>
      <nav
        aria-label={t.obsLayersTitle}
        className={`shrink-0 flex px-3 pt-1.5 pb-[max(10px,env(safe-area-inset-bottom))] ${open ? 'border-t border-cream/10' : ''}`}
      >
        {TABS.map(id => (
          <TabButton key={id} id={id} open={openTab === id} on={on[id]} onClick={() => onToggle(id)} panelId={panelId} className="flex-1 h-[60px]" />
        ))}
        <span aria-hidden="true" className="self-center w-px h-8 bg-cream/15" />
        <button
          type="button"
          onClick={() => onToggle('view')}
          aria-haspopup="dialog"
          aria-expanded={openTab === 'view'}
          aria-controls={openTab === 'view' ? viewPanelId : undefined}
          aria-label={t.obsViewTitle}
          className={`flex-1 h-[60px] flex flex-col items-center justify-center gap-0.5 rounded-2xl text-xs transition-colors ${openTab === 'view' ? 'text-cream font-semibold' : 'text-cream/80 font-medium hover:text-cream'} outline-none focus-visible:ring-2 focus-visible:ring-cream/50`}
        >
          <span className={`w-[48px] h-[30px] rounded-full flex items-center justify-center ${openTab === 'view' ? 'bg-[var(--nav-active)] text-white' : ''}`}>
            <Layers size={18} aria-hidden="true" />
          </span>
          {t.obsLayersView}
        </button>
      </nav>
    </div>
  )
}
