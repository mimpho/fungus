import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useApp } from '../../../contexts/AppContext'
import { resolveUrl } from '../../../lib/helpers'
import { useDialogAboveObsModal } from '../ObsModal'
import { SpeciesPreview } from '../SpeciesPreview'
import { SheetHandle } from '../SheetHandle'
import { SpeciesCardBody } from './SpeciesCardBody'
import { useSheetDrag } from '../../../hooks/useSheetDrag'

export const TINT = 'bg-[var(--nav-active)]'
export const TINT_STYLE = { '--color-cream-rgb': '255, 255, 255' }
// Folded sizes. Desktop: as tall as the point's folded card (4 px top spacer + the row = 83), the photo is the whole card.
// Phone: a 52 px row under the handle; the photo covers what shows above the sheet below it (handle + row).
// `cross`/`right`: where the sheet's single × (40 px) sits, it never moves; `body`: where the open card's content starts (handle or
// spacer + the card's padding), so the card can leave a gap under the ×.
const SIZES = {
  desktop: { row: 79, photo: 83, cross: 23.5, right: 18, body: 16 },
  phone: { row: 52, photo: 72, cross: 24.5, right: 12, body: 35 },
}
const EASE = 'cubic-bezier(0.32,0.72,0,1)'

// While the card is open the page's Esc chain stays out of it
function OpenScope() { useDialogAboveObsModal(); return null }

/**
 * The species' sheet, one block of the bottom stack (it sits in the page's flow, so when it folds or unfolds the sheets above it
 * move with it and never leave a gap). Phone: a bottom sheet. `desktop`: a card of the bottom-left stack. Folded it is a bar (thumbnail, «Mapa filtrado por», name); open, the card.
 * One piece of ochre whose two parts trade height: the bar's row shrinks as the card's body grows. A drag follows the finger
 * (up from the bar opens, down from the card folds). `closeSignal`: the page asks it to fold (another sheet was opened).
 * Desktop has no handle, no overlap under the sheet below and a chevron to fold.
 */
export function SpeciesSlot({ row, species, lens, onClear, onOpenChange, onStackHeight, closeSignal = 0, desktop = false }) {
  const { t } = useApp()
  const [open, setOpen] = useState(false)
  const [drag, setDrag] = useState(null) // 0 (folded) … 1 (open) while a finger is on it
  const [bodyH, setBodyH] = useState(0)
  const [viewing, setViewing] = useState(false)
  const slotRef = useRef(null)
  const measureRef = useRef(null)
  const toggleRef = useRef(null)
  const titleRef = useRef(null)
  const byKey = useRef(false)
  const wasOpen = useRef(false)
  const viewingRef = useRef(false)
  useEffect(() => { viewingRef.current = viewing }, [viewing])

  // The body's natural height, even while it is folded to nothing
  useEffect(() => {
    const el = measureRef.current
    if (!el || typeof ResizeObserver === 'undefined') return undefined
    const ro = new ResizeObserver(() => setBodyH(el.offsetHeight))
    ro.observe(el)
    setBodyH(el.offsetHeight)
    return () => ro.disconnect()
  }, [])
  // The page learns how tall the sheet is, and when it is open (it folds the point's sheet)
  useEffect(() => {
    const el = slotRef.current
    if (!el || typeof ResizeObserver === 'undefined') return undefined
    const ro = new ResizeObserver(() => onStackHeight?.(el.offsetHeight))
    ro.observe(el)
    onStackHeight?.(el.offsetHeight)
    return () => { ro.disconnect(); onStackHeight?.(0) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { onOpenChange?.(open); return () => onOpenChange?.(false) }, [open]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (closeSignal) setOpen(false) }, [closeSignal])

  const openIt = () => setOpen(true)
  const closeIt = viaKey => { byKey.current = viaKey === true; setOpen(false) }

  useEffect(() => {
    if (open) titleRef.current?.focus({ preventScroll: true })
    else if (wasOpen.current && byKey.current) toggleRef.current?.focus()
    if (!open) byKey.current = false
    wasOpen.current = open
  }, [open])
  // Esc, focusing the search or tapping the map fold the card
  useEffect(() => {
    if (!open) return undefined
    const onKey = e => { if (e.key === 'Escape' && !viewingRef.current) closeIt(true) }
    const onFocusIn = e => { if (e.target.closest?.('[role="search"]')) setOpen(false) }
    const onDown = e => { if (e.target.closest?.('.leaflet-container')) setOpen(false) }
    window.addEventListener('keydown', onKey)
    document.addEventListener('focusin', onFocusIn)
    document.addEventListener('pointerdown', onDown)
    return () => { window.removeEventListener('keydown', onKey); document.removeEventListener('focusin', onFocusIn); document.removeEventListener('pointerdown', onDown) }
  }, [open])

  useSheetDrag(slotRef, {
    direction: open ? 'down' : 'up',
    onStart: () => setDrag(open ? 1 : 0),
    onMove: dy => setDrag(Math.min(1, Math.max(0, open ? 1 - dy / Math.max(bodyH, 1) : -dy / Math.max(bodyH, 1)))), // folding: the finger goes down, the card shrinks
    onEnd: dy => {
      setDrag(null)
      if (open && dy > 60) setOpen(false)
      else if (!open && -dy > 40) setOpen(true)
    },
  })

  const p = drag ?? (open ? 1 : 0)
  const size = desktop ? SIZES.desktop : SIZES.phone
  const transition = drag !== null ? 'none' : `height 250ms ${EASE}, opacity 250ms ${EASE}`
  return (
    <section
      ref={slotRef}
      data-testid="species-sheet"
      data-open={open}
      aria-label={t.obsSpSheetBarLabel.replace('{name}', row.name)}
      className={`relative overflow-hidden pointer-events-auto ${TINT} ${desktop ? 'shrink-0 rounded-2xl shadow-float' : 'z-[2] -mt-6 pb-6 rounded-t-[24px] shadow-bottom'}`}
      style={TINT_STYLE}
    >
      <OpenScope key={open ? 'open' : 'closed'} />
      {/* Folded: the photo runs to the sheet's edge (top, left and bottom of what shows), square; the sheet's rounded corner crops it */}
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 overflow-hidden bg-cream/[0.08] pointer-events-none"
        style={{ width: size.photo, height: size.photo, opacity: 1 - p, transition }}
      >
        {row.photo && <img src={resolveUrl(row.photo)} alt="" loading="lazy" decoding="async" onError={e => { e.currentTarget.style.visibility = 'hidden' }} className="w-full h-full object-cover" />}
      </span>
      {desktop ? <div className="h-[4px]" /> : <SheetHandle onToggle={open ? () => closeIt(false) : openIt} className="h-[23px] pt-[13px]" />}
      {/* Folded: the bar */}
      <div style={{ height: (1 - p) * size.row, opacity: 1 - p, transition }} className="overflow-hidden" {...(open ? { inert: '', 'aria-hidden': true } : {})}>
        <div className="flex items-stretch">
          <button
            ref={toggleRef}
            data-drag-ok=""
            type="button"
            onClick={openIt}
            aria-expanded={open}
            aria-haspopup="dialog"
            style={{ height: size.row, paddingLeft: size.photo + 12 }}
            className="flex-1 min-w-0 flex items-center gap-2 pr-2 text-left text-cream rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-cream/60"
          >
            <span className="min-w-0 flex-1 flex flex-col leading-[1.15]">
              <span className="text-[10px] uppercase tracking-[0.04em] whitespace-nowrap">{t.obsSpSheetMapBy}</span>
              <span className="truncate font-display text-[22px] leading-tight">{row.name}</span>
            </span>
          </button>
        </div>
      </div>
      {/* Open: the card */}
      <div
        role="dialog"
        aria-label={t.obsSpSheetCardLabel.replace('{name}', row.name)}
        data-testid="species-card"
        style={{ height: p * bodyH, opacity: p, transition }}
        className="overflow-hidden"
        {...(open ? {} : { inert: '', 'aria-hidden': true })}
      >
        <div ref={measureRef} className="px-4 pt-[12px] pb-4">
          <SpeciesCardBody row={row} species={species} lens={lens} crossTop={size.cross - size.body} onLower={desktop ? closeIt : null} onView={() => setViewing(true)} titleRef={titleRef} />
        </div>
      </div>
      {/* The one ×: it takes the filter off, folded or open, and does not move */}
      <button
        type="button"
        onClick={onClear}
        aria-label={t.obsSpSheetRemove.replace('{name}', row.name)}
        title={t.obsSpSheetRemove.replace('{name}', row.name)}
        style={{ top: size.cross, right: size.right }}
        className="absolute z-10 w-[40px] h-[40px] flex items-center justify-center rounded-xl text-cream/70 hover:text-cream hover:bg-cream/10 outline-none focus-visible:ring-2 focus-visible:ring-cream/60"
      ><X size={20} aria-hidden="true" /></button>
      {viewing && species && <SpeciesPreview species={species} onClose={() => { setViewing(false); titleRef.current?.focus({ preventScroll: true }) }} />}
    </section>
  )
}
