import { useEffect, useRef, useState } from 'react'
import { ChevronUp, X } from 'lucide-react'
import { useApp } from '../../../contexts/AppContext'
import { resolveUrl } from '../../../lib/helpers'
import { useDialogAboveObsModal } from '../ObsModal'
import { SpeciesPreview } from '../SpeciesPreview'
import { SheetHandle } from '../SheetHandle'
import { SpeciesCardBody } from './SpeciesCardBody'
import { useSheetDrag } from '../../../hooks/useSheetDrag'

// The species' sheet. Dark theme: the theme's gold-brown with white text. Light theme: not in negative but a pale green (the theme's green at 20 %
// over the map surface, so it is opaque) with the theme's own ink, as the other cards
export const TINT = 'bg-[var(--nav-active)] [--color-cream-rgb:255,255,255] [[data-theme=light]_&]:[--color-cream-rgb:inherit] [[data-theme=light]_&]:bg-[image:linear-gradient(rgba(var(--color-bar-rgb),0.2),rgba(var(--color-bar-rgb),0.2)),linear-gradient(var(--map-surface),var(--map-surface))]'
// Folded sizes. Desktop: as tall as the point's folded card (4 px top spacer + the row = 83), the photo is the whole card.
// Phone: a 52 px row under the handle; the photo covers what shows above the sheet below it (handle + row).
// Phone, while another sheet is unfolded: half of that, one line (14 px of handle and a 26 px row with the name and the ×)
const SIZES = {
  desktop: { row: 79, photo: 83 },
  phone: { row: 52, photo: 72, handle: 'h-[23px] pt-[13px]' },
  mini: { row: 26, photo: 56, handle: 'h-[14px] pt-[6px]' },
  // Short landscape, folded with the point's folded card: one line, so that both fit under the search
  slim: { row: 40, photo: 44 },
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
 * `column` (short landscape): open, the card has the left column to itself and scrolls if it does not fit; `slim`: folded, one line.
 * It exists only with a species: the bar says «Mapa filtrado por» and the pill with its name and the × that takes the filter off; open it is the species' card.
 */
export function SpeciesSlot({ row, species, lens, onClear, onOpenChange, onStackHeight, closeSignal = 0, desktop = false, mini = false, openRequested = false, onOpenRequestDone, column = false, slim = false }) {
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
  // After the close signal's effect: a species just chosen mounts the slot with an old signal, and must end up open
  useEffect(() => {
    if (!openRequested) return
    setOpen(true)
    onOpenRequestDone?.()
  }, [openRequested]) // eslint-disable-line react-hooks/exhaustive-deps

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
  const thin = slim && desktop && !open
  const small = (mini && !desktop && !open) || thin
  const size = thin ? SIZES.slim : desktop ? SIZES.desktop : small ? SIZES.mini : SIZES.phone
  const rowH = size.row
  const transition = drag !== null ? 'none' : `height 250ms ${EASE}, width 250ms ${EASE}, opacity 250ms ${EASE}`
  const removeLabel = row ? t.obsSpSheetRemove.replace('{name}', row.name) : ''
  return (
    <section
      data-map-cover=""
      ref={slotRef}
      data-testid="species-sheet"
      data-open={open}
      data-mini={small || undefined}
      aria-label={t.obsSpSheetBarLabel.replace('{name}', row.name)}
      className={`relative pointer-events-auto ${column && open ? 'min-h-0 overflow-y-auto overscroll-contain' : 'overflow-hidden'} ${TINT} ${desktop ? `${column && open ? '' : 'shrink-0 '}rounded-2xl shadow-float` : 'z-[2] -mt-6 pb-6 rounded-t-[24px] shadow-bottom'}`}
    >
      <OpenScope key={open ? 'open' : 'closed'} />
      {/* Folded: the photo runs to the sheet's edge (top, left and bottom of what shows), square; the sheet's rounded corner crops it */}
      <span
        aria-hidden="true"
        className={`absolute left-0 top-0 overflow-hidden bg-cream/[0.08] pointer-events-none ${desktop ? '' : 'bottom-[24px]'}`}
        style={{ width: size.photo, height: desktop ? size.photo : undefined, opacity: 1 - p, transition }}
      >
        {row?.photo && <img src={resolveUrl(row.photo)} alt="" loading="lazy" decoding="async" onError={e => { e.currentTarget.style.visibility = 'hidden' }} className="w-full h-full object-cover" />}
      </span>
      {desktop ? (thin ? null : <div className="h-[4px]" />) : <SheetHandle onToggle={open ? () => closeIt(false) : openIt} className={size.handle} />}
      {/* Folded: the bar. The whole of it is one button that opens the sheet (laid under the text, which lets the taps through); the only thing above it is the pill's × */}
      <div style={{ height: (1 - p) * (thin ? SIZES.slim.photo : rowH), opacity: 1 - p, transition }} className="overflow-hidden" {...(open ? { inert: '', 'aria-hidden': true } : {})}>
        <div className="relative" style={{ height: thin ? SIZES.slim.photo : rowH }}>
          <button
            ref={toggleRef}
            data-drag-ok=""
            type="button"
            onClick={openIt}
            aria-expanded={open}
            aria-haspopup="dialog"
            aria-label={t.obsSpSheetBarLabel.replace('{name}', row.name)}
            className="absolute inset-0 w-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-cream/60"
          />
          <div
            className={`pointer-events-none relative h-full flex items-center gap-2 pr-4 text-cream text-left ${desktop || small ? '' : '-translate-y-[3px]'}`}
            style={{ paddingLeft: size.photo + 12 }}
          >
            {/* The name and, at the right, the cross that takes the filter off (and on desktop the arrow: it has no handle, so it says the bar opens) */}
            <span className="flex-1 min-w-0 flex flex-col leading-tight">
              {!small && <span className="text-[11px] uppercase tracking-[0.04em] whitespace-nowrap">{t.obsSpSheetMapBy}</span>}
              <span className={`truncate font-display leading-tight ${small ? 'text-base' : 'text-xl'}`}>{row.name}</span>
            </span>
            <button
              type="button"
              onClick={onClear}
              aria-label={removeLabel}
              title={removeLabel}
              className={`pointer-events-auto shrink-0 w-[40px] h-[40px] flex items-center justify-center rounded-xl text-cream hover:bg-cream/10 outline-none focus-visible:ring-2 focus-visible:ring-cream/60 ${desktop ? '' : small ? '-mr-[9px] -my-[7px] -translate-y-[2px]' : '-mr-[9px] -translate-y-[7px]'}`}
            ><X size={20} aria-hidden="true" /></button>
            {desktop && <ChevronUp size={20} aria-hidden="true" className="shrink-0 ml-[2px] -mr-px text-cream" />}
          </div>
        </div>
      </div>
      {/* Open: the map's species card */}
      <div
        role="dialog"
        aria-label={t.obsSpSheetCardLabel.replace('{name}', row.name)}
        data-testid="species-card"
        style={{ height: p * bodyH, opacity: p, transition }}
        className="overflow-hidden"
        {...(open ? {} : { inert: '', 'aria-hidden': true })}
      >
        <div ref={measureRef} className={`px-4 ${desktop ? 'pt-[12px] pb-4' : 'pt-[3px] pb-2'}`}>
          {row && <SpeciesCardBody row={row} species={species} lens={lens} onLower={desktop ? closeIt : null} onClear={onClear} removeLabel={removeLabel} onView={() => setViewing(true)} titleRef={titleRef} />}
        </div>
      </div>
      {viewing && species && <SpeciesPreview species={species} onClose={() => { setViewing(false); titleRef.current?.focus({ preventScroll: true }) }} />}
    </section>
  )
}
