import { useEffect, useRef, useState } from 'react'
import { ChevronUp, X } from 'lucide-react'
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
const SIZES = {
  desktop: { row: 79, photo: 83 },
  phone: { row: 52, photo: 72 },
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
 * It exists only with a species: the bar says «Mapa filtrado por» and the pill with its name and the × that takes the filter off; open it is the species' card.
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
  const rowH = size.row
  const transition = drag !== null ? 'none' : `height 250ms ${EASE}, opacity 250ms ${EASE}`
  const removeLabel = row ? t.obsSpSheetRemove.replace('{name}', row.name) : ''
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
        {row?.photo && <img src={resolveUrl(row.photo)} alt="" loading="lazy" decoding="async" onError={e => { e.currentTarget.style.visibility = 'hidden' }} className="w-full h-full object-cover" />}
      </span>
      {desktop ? <div className="h-[4px]" /> : <SheetHandle onToggle={open ? () => closeIt(false) : openIt} className="h-[23px] pt-[13px]" />}
      {/* Folded: the bar. The whole of it is one button that opens the sheet (laid under the text, which lets the taps through); the only thing above it is the pill's × */}
      <div style={{ height: (1 - p) * rowH, opacity: 1 - p, transition }} className="overflow-hidden" {...(open ? { inert: '', 'aria-hidden': true } : {})}>
        <div className="relative" style={{ height: rowH }}>
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
            className="pointer-events-none relative h-full flex items-center gap-2 pr-4 text-cream text-left"
            style={{ paddingLeft: size.photo + 12 }}
          >
            <span className="shrink-0 text-[11px] uppercase tracking-[0.04em] whitespace-nowrap">{t.obsSpSheetMapBy}</span>
            <FilterPill name={row.name} onClear={onClear} label={removeLabel} />
            {/* Desktop has no handle: the arrow says the bar opens */}
            {desktop && <ChevronUp size={20} aria-hidden="true" className="ml-auto shrink-0 text-cream/80" />}
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
        <div ref={measureRef} className="px-4 pt-[12px] pb-4">
          {row && <SpeciesCardBody row={row} species={species} lens={lens} onLower={desktop ? closeIt : null} onClear={onClear} removeLabel={removeLabel} onView={() => setViewing(true)} titleRef={titleRef} />}
        </div>
      </div>
      {viewing && species && <SpeciesPreview species={species} onClose={() => { setViewing(false); titleRef.current?.focus({ preventScroll: true }) }} />}
    </section>
  )
}

/** The species the filter holds, folded: its name and the × that takes the filter off, in one block of the darker tone with no ring and the × bare (a 44 px target around it). Only the × takes taps; the rest lets them through to the bar. */
function FilterPill({ name, onClear, label, className = '' }) {
  return (
    <span className={`pointer-events-none inline-flex items-center min-w-0 max-w-full rounded-full bg-black/25 pl-3.5 pr-1 py-1 ${className}`}>
      <span className="truncate leading-tight text-[14px] font-medium">{name}</span>
      <button
        type="button"
        onClick={onClear}
        aria-label={label}
        title={label}
        className="pointer-events-auto relative ml-1.5 shrink-0 size-6 rounded-full flex items-center justify-center text-cream outline-none focus-visible:ring-2 focus-visible:ring-cream/70 after:content-[''] after:absolute after:-inset-2.5"
      ><X size={14} aria-hidden="true" /></button>
    </span>
  )
}
