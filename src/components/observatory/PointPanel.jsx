import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Binoculars, ChevronDown, ChevronUp, X } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { fetchPointForest } from '../../services/observatoryService'
import { formatCoords } from '../../lib/observatoryView'
import { SheetHandle } from './SheetHandle'
import { PointRain } from './PointRain'
import { useSheetDrag } from '../../hooks/useSheetDrag'
import { ObservatoryNotice } from './ObservatoryNotice'
import { PointHabitat } from './PointHabitat'
import { InfoTip } from './InfoTip'
import { CornerSummary, notesAreSpeciesNames } from './CornerSummary'
import { useSpeciesRows } from '../../hooks/useSpeciesRows'
import { CornerModals } from './CornerModals'
import { DEFAULT_KIND, kindMeta, pinSvg } from '../../lib/cornerKinds'
import { IC } from '../../lib/helpers'
import { getScoreBand } from '../../lib/scoreBands'

const BODY_PAD_Y = 9 // the unfolded body's padding: pt-1 (4.5) + pb-[4px] (rounded up)
const UNFOLDED_PAD = 60 // clear space under the unfolded sheet's content, outside the scroll (36 of it show above the sheet below it)
const OPEN_TOP_PX = 72 // a sheet pulled up opens the observed zone once its top is this far from the screen's top (under the map's top bar)
const FOLDED_PX = 104 // what the phone's point sheet shows of itself while folded: handle, title and coordinates

const MACRO_KEY = {
  conifera: 'obsMacroConifera',
  esclerofilo: 'obsMacroEsclerofilo',
  caducifolio: 'obsMacroCaducifolio',
  bosque_otro: 'obsMacroOtro',
}

/**
 * The point's panel on a phone: a bottom sheet over the map, without a backdrop so the map keeps
 * answering (another tap picks another point, a drag moves it). It rises on mount, has a handle that
 * can be dragged down to close it (the same gesture as the dialogs' sheets) and never covers more
 * than 80% of the map: its content scrolls. `bottomPx`: it rises from above the phone's tab bar (which
 * stays over it, so the sheet slides in and out from behind the bar).
 */
function PointSheet({ label, onFold, onExpand, onOpenZone, leaving = false, folded = false, mini = false, onHeight, children }) {
  const [entered, setEntered] = useState(false)
  const [dragY, setDragY] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [pull, setPull] = useState(0) // px the folded sheet has been pulled up by the finger
  const fired = useRef(false) // the pull up already opened the zone
  const reach = useRef(0)
  const [progress, setProgress] = useState(0) // 0..1 how far the unfolded sheet has been pulled up towards the full-screen zone
  const ref = useRef(null)
  const bodyRef = useRef(null)
  const contentRef = useRef(null)
  // Natural height of the whole sheet (the folded and the unfolded heights are both px, so the change animates); folded, it shows its
  // handle and its title block (one or two lines of name, the coordinates), no more. Unfolded it keeps 36 px clear of the sheet under it (24 of the 60 go under that sheet's rounded top)
  const [fullPx, setFullPx] = useState(0)
  const [foldedPx, setFoldedPx] = useState(FOLDED_PX)
  useEffect(() => {
    const content = contentRef.current
    if (!content || typeof ResizeObserver === 'undefined') return undefined
    // The handle plus the body's natural height (the body itself is clamped by this very max-height, so its content is what is watched)
    // Always computed for the unfolded sheet, whatever state it is in now (folded, the body loses its top padding, so its own scrollHeight
    // would come out short): handle + body's paddings + the content + the clear space under it, and 3 px of slack so a rounded height
    // never raises a scroll bar
    const measure = () => setFullPx(Math.ceil((ref.current?.firstElementChild?.getBoundingClientRect().height ?? 0) + BODY_PAD_Y + content.getBoundingClientRect().height + UNFOLDED_PAD + 3))
    const ro = new ResizeObserver(measure)
    ro.observe(content)
    measure()
    return () => ro.disconnect()
  }, [])
  useLayoutEffect(() => {
    if (!folded) return
    if (bodyRef.current) bodyRef.current.scrollTop = 0 // folded, the sheet only shows its title block: it must not stay scrolled
    const el = ref.current
    const head = el?.querySelector('[data-point-head]')
    if (el && head) setFoldedPx(Math.ceil(head.getBoundingClientRect().bottom - el.getBoundingClientRect().top + (mini ? 4 : 12)))
  }, [folded, mini, label])

  useEffect(() => {
    let inner = 0
    const outer = requestAnimationFrame(() => { inner = requestAnimationFrame(() => setEntered(true)) })
    return () => { cancelAnimationFrame(outer); cancelAnimationFrame(inner) }
  }, [])

  // The page is told how tall the sheet is, so the map can keep the picked point in the strip above it
  const onHeightRef = useRef(onHeight)
  useEffect(() => { onHeightRef.current = onHeight }, [onHeight])
  useEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return undefined
    const ro = new ResizeObserver(() => onHeightRef.current?.(el.offsetHeight))
    ro.observe(el)
    return () => { ro.disconnect(); onHeightRef.current?.(0) }
  }, [])

  // Dragging down folds the sheet (it stays, as a title bar, in the stack); dragging the folded one up, or tapping it, unfolds it
  useSheetDrag(ref, {
    direction: folded ? 'up' : 'both',
    onStart: () => {
      setDragY(0); setPull(0); setDragging(true)
      fired.current = false
      // How far up the sheet may be pulled: until its top reaches the strip of the map's top bar
      reach.current = Math.max(40, (ref.current?.getBoundingClientRect().top ?? 0) - OPEN_TOP_PX)
    },
    // The sheet follows the finger: folded, it grows; unfolded, down it goes down and up it grows until its top reaches the top bar (then the zone opens)
    onMove: dy => {
      if (folded) { setPull(Math.max(0, -dy)); return }
      setDragY(Math.max(0, dy))
      if (dy >= 0 || fired.current) { setPull(0); setProgress(0); return }
      setPull(Math.min(-dy, reach.current))
      setProgress(Math.min(1, -dy / reach.current))
      if (-dy >= reach.current) { fired.current = true; setDragging(false); setPull(0); setProgress(0); onOpenZone?.() }
    },
    onEnd: dy => {
      const h = ref.current?.offsetHeight || 300
      setDragging(false)
      setDragY(0)
      setPull(0)
      setProgress(0)
      if (fired.current) return
      if (folded) { if (dy < -40) onExpand?.() } else if (dy > Math.min(h * 0.3, 90)) onFold?.()
    },
  })

  // A block of the bottom stack (in the page's flow, above the species' sheet): when the sheets under it fold or unfold it moves with them
  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={label}
      data-testid="point-sheet"
      data-mini={(folded && mini) || undefined}
      data-map-cover=""
      onClick={folded ? e => { if (!e.target.closest('button, a')) onExpand?.() } : undefined}
      className={`relative z-[1] shrink min-h-0 flex flex-col overflow-hidden map-surface rounded-t-[24px] shadow-bottom pointer-events-auto ${folded ? 'cursor-pointer' : ''}`}
      style={{
        paddingBottom: folded ? 0 : UNFOLDED_PAD,
        // Folded (another sheet is open under it): just its handle and title stay in view (24 px of its foot go under the sheet below)
        maxHeight: folded ? `${fullPx ? Math.min(fullPx, foldedPx + 24 + pull) : foldedPx + 24}px` : fullPx ? `${fullPx + pull}px` : undefined,
        // Its rounded top flattens as it rises, so it ends looking like the full-screen modal
        ...(progress > 0 ? { borderTopLeftRadius: 24 * (1 - progress), borderTopRightRadius: 24 * (1 - progress) } : {}),
        height: !folded && pull > 0 && fullPx ? `${fullPx + pull}px` : undefined,
        transform: leaving ? 'translateY(100%)' : dragging ? `translateY(${dragY}px)` : entered ? 'translateY(0)' : 'translateY(100%)',
        transition: dragging && !leaving ? 'none' : 'transform 0.3s cubic-bezier(0.32,0.72,0,1), max-height 0.3s cubic-bezier(0.32,0.72,0,1)',
      }}
    >
      {/* The handle fades as the sheet rises towards the full-screen zone */}
      <div style={{ opacity: 1 - progress }}><SheetHandle onToggle={folded ? onExpand : onFold} className={folded && mini ? 'pt-[6px] pb-[6px]' : undefined} /></div>
      {/* pb-[4px]: the last button's ring is drawn outside its box and the scroll area would clip it */}
      <div ref={bodyRef} className={`min-h-0 overscroll-contain px-4 ${folded ? 'pt-0 overflow-hidden' : 'pt-1 overflow-y-auto'} pb-[4px] space-y-3`}>
        <div ref={contentRef} className="space-y-3">{children}</div>
      </div>
    </div>
  )
}

/**
 * The point's card on desktop: a block of the bottom-left stack. Folded it keeps its title bar (the chevron in its header folds and
 * unfolds it, as on the phone's sheet); the height change is animated between two measured px values.
 */
function PointCard({ label, folded, onUnfold, children }) {
  const ref = useRef(null)
  const contentRef = useRef(null)
  const [fullPx, setFullPx] = useState(0)
  const [foldedPx, setFoldedPx] = useState(0)
  useEffect(() => {
    const content = contentRef.current
    if (!content || typeof ResizeObserver === 'undefined') return undefined
    const measure = () => {
      const el = ref.current
      const head = el?.querySelector('[data-point-head]')
      if (!el) return
      setFullPx(el.scrollHeight + 1) // the card's own natural height (content and padding); 1 px of slack so a rounded height never raises a scroll bar
      if (head) setFoldedPx(Math.ceil(head.getBoundingClientRect().bottom - el.getBoundingClientRect().top + 16))
    }
    const ro = new ResizeObserver(measure)
    ro.observe(content)
    measure()
    return () => ro.disconnect()
  }, [])
  return (
    <div data-map-cover=""
      ref={ref}
      role="dialog"
      aria-label={label}
      onClick={folded ? e => { if (!e.target.closest('button, a')) onUnfold?.() } : undefined}
      className={`relative shrink min-h-0 ${folded ? 'overflow-hidden cursor-pointer' : 'overflow-y-auto'} map-surface rounded-2xl p-4 shadow-float pointer-events-auto`}
      style={{ maxHeight: folded ? (foldedPx ? `${foldedPx}px` : undefined) : fullPx ? `${fullPx}px` : undefined, transition: 'max-height 0.3s cubic-bezier(0.32,0.72,0,1)' }}
    >
      <div ref={contentRef} className="space-y-3">{children}</div>
    </div>
  )
}

/**
 * What the map click found: the nearest toponym, altitude and forest at the point, with the
 * «Observar esta zona» button. Asking this costs no climate data (no new cell), so every click
 * can ask; the answer is context, and the button works even while it loads or if it fails.
 * `layerValue` = what the probability layer paints at the point: { score, count } (count > 1: the
 * mean of that many species), null = nothing there, undefined = no layer to speak of. `rainValue`
 * (see PointRain) takes its place while Lluvia is drawn.
 * `saved` is the user's corners: if this point is one, its pin, name, species and notes show under the title, with «Editar».
 */
export function PointPanel({ point, saved, onObserve, onClose, layerValue, elevationM, layerSpeciesName = null, layerLoading = false, rainValue = null, sheet = false, folded = false, mini = false, onExpand, onSheetHeight, onFoldedChange }) {
  const { t } = useApp()
  const [state, setState] = useState({ status: 'loading', data: null, error: null })
  const [attempt, setAttempt] = useState(0)
  const [mode, setMode] = useState('idle')
  // Hiding the sheet (its handle, a drag down) folds it to its title bar; only its cross removes the point from the map
  const [userFolded, setUserFolded] = useState(false)
  useEffect(() => { setUserFolded(false) }, [point.lat, point.lon])
  // On the phone the sheet slides down before the page drops it (the cross, the handle and a drag all close this way)
  const [leaving, setLeaving] = useState(false)
  const leaveTimer = useRef(null)
  useEffect(() => () => clearTimeout(leaveTimer.current), [])
  const requestClose = () => {
    if (!sheet) { onClose(); return }
    if (leaving) return
    setLeaving(true)
    leaveTimer.current = setTimeout(onClose, 300)
  }
  // Folded by the page (another sheet is open) or by its own handle: the page needs to know either way
  const shownFolded = folded || userFolded
  useEffect(() => { onFoldedChange?.(shownFolded) }, [shownFolded]) // eslint-disable-line react-hooks/exhaustive-deps
  const corner = saved.find(point)
  const speciesRows = useSpeciesRows()

  useEffect(() => {
    const ctrl = new AbortController()
    setState({ status: 'loading', data: null, error: null })
    fetchPointForest(point.lat, point.lon, { signal: ctrl.signal })
      .then(data => setState({ status: 'ready', data, error: null }))
      .catch(error => {
        if (error?.name === 'AbortError') return
        setState({ status: 'error', data: null, error })
      })
    return () => ctrl.abort()
  }, [point.lat, point.lon, attempt])

  const d = state.data
  const title = d?.toponym?.label ?? formatCoords(point)
  const elevation = Number.isFinite(d?.point?.elevation_m) ? d.point.elevation_m : elevationM
  // The kind of forest is the CREAF's (habitat block); the ICGC type only stands in without it
  const hasCreaf = Object.values(d?.habitat?.forest ?? {}).some(share => share >= 0.05)
  const macro = d?.forest && !hasCreaf ? `${t[MACRO_KEY[d.macrotype]]} (ICGC 2024)` : null

  // Forest is judged around the point (the backend looks within radius_m); under the pin itself
  // there can be a field: then the line says so, and what is under the pin is shown below it.
  const aroundOnly = d?.forest === true && d.forest_under_point === false
  // With the CREAF's forest in the habitat block below, «Bosque» + its type would say the same twice:
  // the line stays for no forest, unknown, a forest the CREAF has no type for, or a forest only around.
  let forestLine = null
  if (d && !(d.forest === true && hasCreaf && !aroundOnly)) {
    if (aroundOnly) forestLine = t.obsForestAround.replace('{m}', d.habitat?.forest_radius_m ?? d.radius_m)
    else if (d.forest === true) forestLine = [t.obsForestYes, macro].filter(Boolean).join(' · ')
    else if (d.forest === false) forestLine = t.obsForestNo
    else forestLine = t.obsForestUnknown
  }

  // Folded on the phone while another sheet is unfolded: half as tall, the title on one line
  const small = sheet && shownFolded && mini
  const content = (
    <>
      <div data-point-head="" className={`flex justify-between gap-3 ${small ? 'items-center h-[20px]' : 'items-start'}`}>
        <div className="min-w-0">
          <p className={`font-display text-cream leading-tight ${small ? 'text-base truncate' : 'text-xl break-words'}`}>{title}</p>
          <p className={`text-xs text-cream/60 mt-0.5 ${small ? 'hidden' : ''}`}>
            {state.status === 'loading' && t.obsPointLooking}
            {state.status === 'ready' && [
              d?.toponym?.comarca,
              Number.isFinite(elevation) ? `${Math.round(elevation)} m` : null,
              d?.toponym ? formatCoords(point) : null,
            ].filter(Boolean).join(' · ')}
          </p>
        </div>
        {/* The cross takes the point off the map, folded or open; desktop adds the chevron that folds and unfolds the card (on the phone the handle does it) */}
        <div className={`shrink-0 flex items-center ${sheet ? '' : userFolded ? 'mt-[5.5px]' : '-mt-1'}`}>
          <button
            type="button"
            onClick={requestClose}
            aria-label={t.obsPointRemove}
            title={t.obsPointRemove}
            className={`w-[40px] h-[40px] flex items-center justify-center rounded-xl text-cream hover:bg-cream/10 outline-none focus-visible:ring-2 focus-visible:ring-cream/60 ${small ? '-my-[10px] -mr-2' : sheet ? '-mt-[6px] -mr-2' : ''}`}
          ><X size={20} aria-hidden="true" /></button>
          {!sheet && (
            <button
              type="button"
              onClick={() => setUserFolded(f => !f)}
              aria-label={t.obsSheetHandle}
              aria-expanded={!userFolded}
              title={t.obsSheetHandle}
              className="-mr-2.5 w-[40px] h-[40px] flex items-center justify-center rounded-xl text-cream hover:bg-cream/10 outline-none focus-visible:ring-2 focus-visible:ring-cream/60"
            >{userFolded ? <ChevronUp size={20} aria-hidden="true" /> : <ChevronDown size={20} aria-hidden="true" />}</button>
          )}
        </div>
      </div>

      {corner && (
        <section data-testid="point-corner" aria-label={t.obsCornerSavedHere} className="rounded-2xl p-4 space-y-3 min-w-0 overflow-hidden bg-coffee/40 [[data-theme=light]_&]:bg-bar/20 [[data-theme=light]_&_.glass]:!bg-white/50 [[data-theme=light]_&_.glass]:hover:!bg-white/70 backdrop-blur-[16px]">
          {/* Same layout as the «Mi rincón» card: title (with the pencil to edit on its right), then the pin beside the kind and the name */}
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-[27px] leading-tight text-cream">{t.obsCornerCardTitle}</h2>
            <button
              type="button"
              onClick={() => setMode('edit')}
              aria-label={t.obsSavedEdit}
              title={t.obsSavedEdit}
              className="shrink-0 p-2 rounded-xl text-cream/80 hover:text-cream hover:bg-white/10 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-cream/40"
            >
              <span aria-hidden="true" className="block [&>svg]:w-[18px] [&>svg]:h-[18px]">{IC.pencil}</span>
            </button>
          </div>
          <div className="flex items-center gap-3 min-w-0">
            <span aria-hidden="true" className="shrink-0 [&>svg]:w-[26px] [&>svg]:h-[33px] [&>svg]:!filter-none" dangerouslySetInnerHTML={{ __html: pinSvg(corner.kind) }} />
            <div className="min-w-0">
              {corner.kind && corner.kind !== DEFAULT_KIND && (
                <p className="text-[11px] uppercase tracking-[1.4px] font-medium text-coffee-light">{t[kindMeta(corner.kind).labelKey]}</p>
              )}
              <h3 className="text-sm font-semibold leading-tight text-cream break-words">{corner.name}</h3>
            </div>
          </div>
          {corner.notes && !notesAreSpeciesNames(corner.notes, speciesRows.filter(r => corner.species_ids?.includes(r.id)).map(r => r.scientific)) && <p className="text-sm text-cream/75 whitespace-pre-line break-words">{corner.notes}</p>}
          <CornerSummary corner={corner} onChanged={() => saved.refresh(corner.id)} />
        </section>
      )}

      {state.status === 'error' && <ObservatoryNotice error={state.error} onRetry={() => setAttempt(a => a + 1)} />}

      {forestLine && (
        <div className="text-sm text-cream/80">
          <p>{forestLine}</p>
          {d?.land_cover?.name && <p className="text-xs text-cream/50 mt-0.5">{aroundOnly ? `${t.obsUnderPoint} ` : ''}{d.land_cover.name}</p>}
        </div>
      )}

      {/* With Lluvia on the headline is the rain, never next to the conditions figure */}
      {rainValue ? <PointRain value={rainValue} /> : (layerValue !== undefined || layerLoading) && (
        <div data-testid="point-layer-value" className="relative">
          {layerValue === undefined ? (
            <p role="status" aria-label={t.obsPointCalculating} className="h-10 flex items-center gap-1.5 text-cream/50">
              {[0, 1, 2].map(i => (
                <span key={i} aria-hidden="true" className="w-2.5 h-2.5 rounded-full bg-current animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
              ))}
            </p>
          ) : layerValue ? (
            <div className="h-10 flex items-center gap-2">
              <p className={`font-display font-bold text-4xl leading-none ${getScoreBand(layerValue.score).text}`}>
                {Math.round(layerValue.score)}<span className="text-2xl"> %</span>
                <span className="ml-2 text-lg font-medium align-middle">{t[getScoreBand(layerValue.score).obsKey]}</span>
              </p>
              {/* What the figure is: a tooltip, not one more line in the box */}
              <InfoTip label={t.obsPointLayerInfo} block>
                {layerSpeciesName ? t.obsPointTipFor.replace('{name}', layerSpeciesName)
                  : layerValue.count > 1 ? t.obsPointTipMean.replace('{n}', layerValue.count) : t.obsPointTip}
              </InfoTip>
            </div>
          ) : <p className="text-sm text-cream/60">{t.obsPointLayerNone}</p>}
        </div>
      )}

      <PointHabitat habitat={d?.habitat} compact loading={state.status === 'loading'} />

      {/* The two things to do with a point: look at it (the zone below the map) and keep it. Saved already: the corner above has its own «Editar». */}
      <div className={`grid gap-2 ${corner ? '' : 'grid-cols-2'}`}>
        <button
          type="button"
          onClick={() => onObserve(point)}
          className="inline-flex items-center justify-center gap-2 px-3 min-h-[44px] rounded-xl bg-white text-[var(--nav-active)] [[data-theme=light]_&]:bg-[var(--nav-active)] [[data-theme=light]_&]:text-white text-sm font-semibold hover:brightness-95 outline-none focus-visible:ring-2 focus-visible:ring-cream/60"
        >
          <Binoculars size={16} aria-hidden="true" />
          {t.obsPointObserveShort}
        </button>
        {!corner && (
          <button
            type="button"
            onClick={() => setMode('create')}
            className="inline-flex items-center justify-center gap-2 px-3 min-h-[44px] rounded-xl border border-cream/60 text-cream text-sm font-medium hover:bg-cream/10 outline-none focus-visible:ring-2 focus-visible:ring-cream/60"
          >
            <span aria-hidden="true" className="[&>svg]:w-4 [&>svg]:h-4">{IC.heart(false)}</span>
            {t.obsSaveZoneButton}
          </button>
        )}
      </div>

      <CornerModals mode={mode} setMode={setMode} onClose={() => setMode('idle')} point={point} saved={saved} suggestedName={d?.toponym?.name ?? d?.toponym?.label} />
    </>
  )

  // On a phone: a bottom sheet that leaves the map usable above it (no backdrop). Elsewhere: a card, a block of the page's bottom-left stack
  if (sheet) return <PointSheet label={title} leaving={leaving} folded={shownFolded} mini={mini} onFold={() => setUserFolded(true)} onExpand={() => { setUserFolded(false); onExpand?.() }} onOpenZone={() => onObserve(point)} onHeight={onSheetHeight}>{content}</PointSheet>
  return <PointCard label={title} folded={userFolded} onUnfold={() => setUserFolded(false)}>{content}</PointCard>
}
