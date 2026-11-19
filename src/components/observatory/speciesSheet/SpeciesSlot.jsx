import { useEffect, useRef, useState } from 'react'
import { ChevronDown, ChevronUp, Search, X } from 'lucide-react'
import { useApp } from '../../../contexts/AppContext'
import { resolveUrl } from '../../../lib/helpers'
import { useDialogAboveObsModal } from '../ObsModal'
import { SpeciesPreview } from '../SpeciesPreview'
import { SheetHandle } from '../SheetHandle'
import { SpeciesCardBody } from './SpeciesCardBody'
import { useSheetDrag } from '../../../hooks/useSheetDrag'
import { useMediaQuery } from '../../../hooks/useMediaQuery'

export const TINT = 'bg-[var(--nav-active)]'
export const TINT_STYLE = { '--color-cream-rgb': '255, 255, 255' }
// The zone's sheet: the same surface as the «Mi rincón» card (coffee at 40 % in the dark theme, the buttons' green at 20 % in the light one), laid over
// the page's mid gradient colour so it is opaque, and the theme's own ink (no white override). Its switch: a green track when on, grey when off, white
// thumb (#667739 in the light theme; in the dark one the «Filtrar por seta» button's colour, `bg-bar`).
const ZONE_TINT = 'bg-[image:linear-gradient(rgba(var(--color-coffee-rgb),0.4),rgba(var(--color-coffee-rgb),0.4)),linear-gradient(var(--gradient-b),var(--gradient-b))] [[data-theme=light]_&]:bg-[image:linear-gradient(rgba(var(--color-bar-rgb),0.2),rgba(var(--color-bar-rgb),0.2)),linear-gradient(var(--gradient-b),var(--gradient-b))]'
// Folded sizes. Desktop: as tall as the point's folded card (4 px top spacer + the row = 83), the photo is the whole card.
// Phone: a 52 px row under the handle; the photo covers what shows above the sheet below it (handle + row).
// `cross`/`right`: where the sheet's single × (40 px) sits, it never moves; `body`: where the open card's content starts (handle or
// spacer + the card's padding), so the card can leave a gap under the ×.
const SIZES = {
  desktop: { row: 79, photo: 83, cross: 23.5, right: 18, body: 16 },
  phone: { row: 52, photo: 72, cross: 24.5, right: 12, body: 35 },
  zone: { row: 52, photo: 84, cross: 24.5, right: 12, body: 35 }, // the photo is as tall as the whole sheet (see `zone`)
}
// Zone: the filter's switch sits at the top right, as far from the right edge as from the top and bottom of the folded sheet
const ZONE_SW_W = 52
const ZONE_SW_H = 32
const ZONE_SW_RIGHT = 24
const ZONE_SW_TOP = 25.5 // centred in the folded sheet (83 px)
const EASE = 'cubic-bezier(0.32,0.72,0,1)'

// While the card is open the page's Esc chain stays out of it
function OpenScope() { useDialogAboveObsModal(); return null }

/**
 * The species' sheet, one block of the bottom stack (it sits in the page's flow, so when it folds or unfolds the sheets above it
 * move with it and never leave a gap). Phone: a bottom sheet. `desktop`: a card of the bottom-left stack. Folded it is a bar (thumbnail, «Mapa filtrado por», name); open, the card.
 * One piece of ochre whose two parts trade height: the bar's row shrinks as the card's body grows. A drag follows the finger
 * (up from the bar opens, down from the card folds). `closeSignal`: the page asks it to fold (another sheet was opened).
 * Desktop has no handle, no overlap under the sheet below and a chevron to fold.
 * `zone`: the observed zone's sheet. It is the phone's bottom sheet at every width (handle, drag, no chevron), at most 560 px wide and
 * centred; the bar says «Filtrado por». Its single control is a switch (`onToggle`): off (`paused`) the sheet stays, the species dimmed, and the zone goes back to
 * the excellent edibles together; on again, it filters by the species. No score: the thermometer already says it. The folded photo runs the whole height of the sheet.
 */
export function SpeciesSlot({ row, species, lens, onClear, onOpenChange, onStackHeight, closeSignal = 0, desktop = false, zone = false, paused = false, onToggle, renderPicker = null }) {
  const { t } = useApp()
  const [open, setOpen] = useState(false)
  const idle = zone && !row // zone with no species: the bar is the way in to the list
  const off = paused && !idle // a species is there but its filter is switched off
  const touch = useMediaQuery('(pointer: coarse)') // touch: the handle bar (drags); otherwise an arrow
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
  const donePicking = () => setOpen(false) // a species was picked (even the same one): fold the sheet so the zone shows the change

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
  const size = zone ? SIZES.zone : desktop ? SIZES.desktop : SIZES.phone
  const transition = drag !== null ? 'none' : `height 250ms ${EASE}, opacity 250ms ${EASE}`
  return (
    <section
      ref={slotRef}
      data-testid="species-sheet"
      data-open={open}
      aria-label={idle ? t.obsSpSheetIdle : t.obsSpSheetBarLabel.replace('{name}', row.name)}
      className={`relative overflow-hidden pointer-events-auto ${zone ? ZONE_TINT : TINT} ${zone ? 'w-full max-w-[560px] z-[2] pb-[calc(0.5rem+env(safe-area-inset-bottom))] rounded-t-[24px] shadow-bottom' : desktop ? 'shrink-0 rounded-2xl shadow-float' : 'z-[2] -mt-6 pb-6 rounded-t-[24px] shadow-bottom'}`}
      style={zone ? undefined : TINT_STYLE}
    >
      <OpenScope key={open ? 'open' : 'closed'} />
      {/* Folded: the photo runs to the sheet's edge (top, left and bottom of what shows), square; the sheet's rounded corner crops it. With no species (idle) there is none */}
      {!idle && <span
        aria-hidden="true"
        className="absolute left-0 top-0 overflow-hidden bg-cream/[0.08] pointer-events-none"
        style={{ width: size.photo, height: zone ? '100%' : size.photo, opacity: 1 - p, transition }}
      >
        {row?.photo && <img src={resolveUrl(row.photo)} alt="" loading="lazy" decoding="async" onError={e => { e.currentTarget.style.visibility = 'hidden' }} className={`w-full h-full object-cover transition-[filter] ${off ? 'grayscale opacity-60' : ''}`} />}
      </span>}
      {desktop ? <div className="h-[4px]" /> : zone && !touch ? (
        // Zone, no touch screen: nothing to drag, so a small arrow in place of the handle bar
        <button
          type="button"
          data-testid="sheet-chevron"
          aria-label={t.obsSheetHandle}
          aria-expanded={open}
          onClick={open ? () => closeIt(false) : openIt}
          className="w-full h-[23px] flex items-start justify-center pt-[8px] overflow-visible text-cream/80 hover:text-cream outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cream/60"
        >
          {open ? <ChevronDown size={22} aria-hidden="true" /> : <ChevronUp size={22} aria-hidden="true" />}
        </button>
      ) : <SheetHandle onToggle={open ? () => closeIt(false) : openIt} className="h-[23px] pt-[13px]" />}
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
            style={{ height: size.row, paddingLeft: idle ? 16 : size.photo + 12, ...(zone ? { paddingRight: idle ? 16 : ZONE_SW_RIGHT + ZONE_SW_W + 12 } : {}) }}
            className={`flex-1 min-w-0 flex items-center gap-2 pr-2 text-cream rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-cream/60 ${idle ? '' : 'text-left'}`}
          >
            {idle ? (
              // No species: what is being observed, and the way in to the list as a button (the «Mi rincón» button's colour); the whole bar is the one button that opens the sheet
              <>
                <span className="flex-1 min-w-0 text-left text-[14px] max-[480px]:text-[13px] leading-snug">{t.obsSpSheetIdleText}</span>
                <span className="shrink-0 inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2.5 max-[480px]:px-3.5 text-sm font-medium bg-bar text-white">
                  <Search size={16} aria-hidden="true" className="shrink-0" />
                  {t.obsSpSheetIdleCta}
                </span>
              </>
            ) : (
            <span className="min-w-0 flex-1 flex flex-col leading-[1.15]">
              <span className="text-[10px] uppercase tracking-[0.04em] whitespace-nowrap">{zone ? (off ? t.obsSpSheetZonePaused : t.obsSpSheetZoneActive) : t.obsSpSheetMapBy}</span>
              <span className={`truncate font-display leading-tight transition-opacity ${off ? 'opacity-55' : ''} ${zone ? 'text-[22px] max-[480px]:text-[18px]' : 'text-[22px]'}`}>{row.name}</span>
            </span>
            )}
          </button>
        </div>
      </div>
      {/* Open: the card */}
      <div
        role="dialog"
        aria-label={idle ? t.obsSpTitle : t.obsSpSheetCardLabel.replace('{name}', row.name)}
        data-testid="species-card"
        style={{ height: p * bodyH, opacity: p, transition }}
        className="overflow-hidden"
        {...(open ? {} : { inert: '', 'aria-hidden': true })}
      >
        <div ref={measureRef} className="px-4 pt-[12px] pb-4">
          {row && (
            // Filter switched off: the species' header is dimmed and its actions (ficha, like) are out of reach; the list below is still live
            <div className={`transition-opacity ${off ? 'opacity-45' : ''}`} {...(off ? { inert: '' } : {})}>
              <SpeciesCardBody row={row} species={species} lens={lens} crossTop={size.cross - size.body} crossW={zone ? ZONE_SW_W + 12 : 40} zone={zone} onLower={desktop ? closeIt : null} onView={() => setViewing(true)} titleRef={titleRef} />
            </div>
          )}
          {/* Zone: the list of species is always under the chosen one, to filter by another without taking the filter off first */}
          {zone && <div className={row ? 'mt-4 pt-4 border-t border-cream/15' : ''}>{renderPicker?.(donePicking)}</div>}
        </div>
      </div>
      {/* The one control, folded or open, and it does not move. Zone: a switch (an × reads as «close the sheet») */}
      {zone ? (row && (
        <button
          type="button"
          role="switch"
          aria-checked={!off}
          onClick={onToggle}
          aria-label={t.obsSpSheetSwitch.replace('{name}', row.name)}
          title={t.obsSpSheetSwitch.replace('{name}', row.name)}
          style={{ top: ZONE_SW_TOP, right: ZONE_SW_RIGHT, width: ZONE_SW_W, height: ZONE_SW_H }}
          className={`absolute z-10 rounded-full border-2 border-transparent outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--gradient-b)] focus-visible:ring-cream transition-colors ${off ? 'bg-black/25 [[data-theme=light]_&]:bg-black/20' : 'bg-bar [[data-theme=light]_&]:bg-[#667739]'}`}
        >
          <span
            aria-hidden="true"
            className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full transition-all bg-white ${off ? 'left-[4px]' : 'left-[calc(100%-1.5rem)]'}`}
          />
        </button>
      )) : (
        <button
          type="button"
          onClick={onClear}
          aria-label={t.obsSpSheetRemove.replace('{name}', row.name)}
          title={t.obsSpSheetRemove.replace('{name}', row.name)}
          style={{ top: size.cross, right: size.right }}
          className="absolute z-10 w-[40px] h-[40px] flex items-center justify-center rounded-xl text-cream/70 hover:text-cream hover:bg-cream/10 outline-none focus-visible:ring-2 focus-visible:ring-cream/60"
        ><X size={20} aria-hidden="true" /></button>
      )}
      {viewing && species && <SpeciesPreview species={species} onClose={() => { setViewing(false); titleRef.current?.focus({ preventScroll: true }) }} />}
    </section>
  )
}
