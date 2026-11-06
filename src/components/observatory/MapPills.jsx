import { useEffect, useRef, useState } from 'react'
import { Check, CheckSquare, ChevronDown, Layers, List, Square } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { LayerLoadingPlaceholder } from './SpeciesLayerPicker'

// Layers still to come (7c-7f of memory/pending.md): drawn as pills so it is clear what is on its way, but they take no
// hover, focus or click until they exist.
const COMING = [
  { id: 'rain', key: 'obsLayerRain' },
  { id: 'temperature', key: 'obsLayerTemperature' },
  { id: 'wind', key: 'obsLayerWind' },
  { id: 'top10', key: 'obsLayerTop10' },
]

const BASEMAPS = [
  { id: 'satellite', key: 'obsBasemapSatellite' },
  { id: 'streets', key: 'obsBasemapStreets' },
  { id: 'relief', key: 'obsBasemapRelief' },
]

// Opaque (no glass, no blur) with a shadow that reads over the satellite image
// The popovers slide open in this time; a layer is switched on only after that, because working out its colours holds the page and would cut the slide
const SLIDE_MS = 200

const PILL = 'shadow-[0_4px_14px_rgba(0,0,0,0.4)] rounded-full text-sm font-medium transition-colors'
const ON = 'bg-bar text-white'
const OFF = 'bg-modal text-cream'
const FOCUS = 'outline-none focus-visible:ring-2 focus-visible:ring-cream/40'
const SEGMENT = `${FOCUS} hover:bg-white/10`

/** Esc closes the popover (and is not passed on: the page would close the point's card with it); so does a click outside `rootRef`. */
function useDismiss(open, rootRef, close) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = e => { if (e.key === 'Escape') { e.stopPropagation(); close() } }
    const onDown = e => { if (rootRef.current && !rootRef.current.contains(e.target)) close() }
    window.addEventListener('keydown', onKey, true)
    document.addEventListener('pointerdown', onDown, true)
    return () => {
      window.removeEventListener('keydown', onKey, true)
      document.removeEventListener('pointerdown', onDown, true)
    }
  }, [open, rootRef, close])
}

/**
 * The accordion of a pill: its content slides open and shut (rows 0fr → 1fr), pushing the pills below it down and back up. The content is
 * mounted when it opens and unmounted once it has shut (a shut one would still give the column of pills the width of the popover,
 * and the empty strip would take the clicks meant for the map); while it is shutting it is out of reach (`inert`). It is clipped only while it
 * moves, so that its shadow shows once it is open.
 */
function Collapse({ open, id = undefined, children }) {
  const [mounted, setMounted] = useState(open)
  const [clip, setClip] = useState(true)
  useEffect(() => {
    if (open) { setMounted(true); return undefined }
    setClip(true)
    const timer = setTimeout(() => setMounted(false), SLIDE_MS + 50) // after the slide (there is none with reduced motion)
    return () => clearTimeout(timer)
  }, [open])
  return (
    <div
      id={id}
      aria-hidden={!open}
      {...(open ? {} : { inert: '' })}
      onTransitionEnd={e => { if (e.target === e.currentTarget && open) setClip(false) }}
      className={`grid w-full justify-items-end transition-[grid-template-rows,opacity] duration-[200ms] ease-out motion-reduce:transition-none ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
    >
      <div className={`min-h-0 min-w-0 ${clip ? 'overflow-hidden' : ''}`}>
        {(open || mounted) && children}
      </div>
    </div>
  )
}

/** A pill that switches a layer or marker on and off; with `panel`, its chevron opens the layer's own controls below it. */
function TogglePill({ id, label, on, onToggle, panel = null, openId, onOpen, extra = null }) {
  const { t } = useApp()
  const open = openId === id
  const panelId = `pill-panel-${id}`
  // Switching a layer on makes the map work out its colours, which holds the page for a moment. The pill answers at once (it shows as on) and the
  // popover slides open first, with its «calculating» placeholder; the layer is switched on only once the slide is over
  const [waking, setWaking] = useState(false)
  const wakeRef = useRef(0) // a click on the pill while it is still waking cancels the switching on
  useEffect(() => { if (on) setWaking(false) }, [on])
  const shownOn = on || waking
  function toggle() {
    if (!panel) { onToggle(!on); return }
    if (on || waking) { wakeRef.current += 1; setWaking(false); onToggle(false); onOpen(null); return }
    const token = (wakeRef.current += 1)
    setWaking(true)
    onOpen(id)
    setTimeout(() => { if (wakeRef.current === token) onToggle(true) }, SLIDE_MS + 60)
  }
  return (
    <div className="flex flex-col items-end">
      <div className={`inline-flex items-stretch overflow-hidden ${PILL} ${shownOn ? ON : OFF}`}>
        <button
          type="button"
          aria-pressed={shownOn}
          onClick={toggle}
          className={`inline-flex items-center gap-2 pl-3.5 pr-3 py-2 ${SEGMENT}`}
        >
          <span aria-hidden="true">{shownOn ? <CheckSquare size={16} /> : <Square size={16} />}</span>
          {label}
        </button>
        {extra}
        {panel && (
          <button
            type="button"
            aria-expanded={open}
            aria-controls={open ? panelId : undefined}
            aria-label={t.obsPillOptions}
            title={t.obsPillOptions}
            onClick={() => onOpen(open ? null : id)}
            className={`px-2.5 border-l border-white/15 ${SEGMENT}`}
          >
            <ChevronDown size={16} aria-hidden="true" className={`transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>
      {panel && (
        <Collapse open={open} id={panelId}>
        <div className="mt-2 w-[22rem] max-h-[calc(100dvh-var(--header-h,5.5rem)-14rem)] overflow-y-auto overscroll-contain rounded-2xl bg-modal shadow-[0_4px_14px_rgba(0,0,0,0.4)] p-3">
          {panel}
          {waking && !on && id === 'probability' && (
            // The same placeholder (same height) the layer's controls show once they are calculating, so the popover does not wait empty
            <div className="mt-2 px-1 pb-0.5">
              <LayerLoadingPlaceholder />
            </div>
          )}
        </div>
        </Collapse>
      )}
    </div>
  )
}

/**
 * Desktop: what the map shows, as a column of pills at the right edge under the view pill. «Mis rincones» and the layers switch on and off on their own
 * (the layers open their controls in a popover); the layers still to come are drawn but inert. One popover is open at a time; Esc and a click outside close it.
 * On a phone the same things live in the layers card (`MapLayersBox`).
 */
export function MapPills({
  corners, onCorners, savedCount = null, onOpenList,
  probability, onProbability, probabilityPanel,
  forest, onForest, forestPanel,
}) {
  const { t } = useApp()
  const [openId, setOpenId] = useState(null)
  const rootRef = useRef(null)

  useDismiss(Boolean(openId), rootRef, () => setOpenId(null))

  return (
    <div ref={rootRef} role="toolbar" aria-label={t.obsLayersTitle} className="flex flex-col items-end gap-2">
      <TogglePill
        id="corners"
        label={t.obsLayerCorners}
        on={corners}
        onToggle={onCorners}
        openId={openId}
        onOpen={setOpenId}
        extra={(
          <button
            type="button"
            aria-haspopup="dialog"
            aria-label={t.obsSavedListTitle}
            title={t.obsSavedListTitle}
            onClick={() => { setOpenId(null); onOpenList() }}
            className={`inline-flex items-center gap-1.5 px-2.5 border-l border-white/15 ${SEGMENT}`}
          >
            <List size={16} aria-hidden="true" />
            {savedCount != null && <span data-testid="saved-count" className="text-xs font-bold tabular-nums">{savedCount}</span>}
          </button>
        )}
      />
      <TogglePill
        id="probability"
        label={t.obsLayerProbability}
        on={probability}
        onToggle={onProbability}
        panel={probabilityPanel}
        openId={openId}
        onOpen={setOpenId}
      />
      <TogglePill
        id="forest"
        label={t.obsLayerForest}
        on={forest}
        onToggle={onForest}
        panel={forestPanel}
        openId={openId}
        onOpen={setOpenId}
      />
      {COMING.map(l => (
        <span key={l.id} aria-disabled="true" className={`${PILL} ${OFF} px-3.5 py-2 opacity-50 cursor-default select-none`}>
          {t[l.key]}
        </span>
      ))}

    </div>
  )
}

/**
 * Desktop: the map's view (satellite, street, relief) as a dropdown pill; the page puts it at the right edge, level with the search.
 */
export function ViewPill({ basemap, onBasemap }) {
  const { t } = useApp()
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  useDismiss(open, rootRef, () => setOpen(false))
  const current = BASEMAPS.find(b => b.id === basemap) ?? BASEMAPS[0]
  return (
    <div ref={rootRef} className="flex flex-col items-end">
      <div className={`inline-flex items-stretch overflow-hidden ${PILL} ${OFF}`}>
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={t.obsBasemapLabel}
          onClick={() => setOpen(o => !o)}
          className={`inline-flex items-center gap-2 pl-3.5 pr-3 py-2 ${SEGMENT}`}
        >
          <Layers size={16} aria-hidden="true" />
          <span className="text-cream/60">{t.obsLayersView}</span>
          <span>{t[current.key]}</span>
          <ChevronDown size={16} aria-hidden="true" className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>
      <Collapse open={open}>
        <ul role="listbox" aria-label={t.obsBasemapLabel} className="mt-2 min-w-[10rem] rounded-2xl bg-modal shadow-[0_4px_14px_rgba(0,0,0,0.4)] p-1.5">
          {BASEMAPS.map(b => (
            <li key={b.id} role="option" aria-selected={basemap === b.id}>
              <button
                type="button"
                onClick={() => { onBasemap(b.id); setOpen(false) }}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-sm text-cream ${SEGMENT}`}
              >
                {t[b.key]}
                {basemap === b.id && <Check size={16} aria-hidden="true" />}
              </button>
            </li>
          ))}
        </ul>
      </Collapse>
    </div>
  )
}
