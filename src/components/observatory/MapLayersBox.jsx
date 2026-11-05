import { ChevronRight, Layers, X } from 'lucide-react'
import { useId, useState } from 'react'
import { useApp } from '../../contexts/AppContext'

// Layers the map will have. Corners and probability exist; the others are listed, off, so that
// it is clear what is coming (7c-7e of memory/pending.md).
const COMING = [
  { id: 'rain', key: 'obsLayerRain' },
  { id: 'temperature', key: 'obsLayerTemperature' },
  { id: 'wind', key: 'obsLayerWind' },
]

const BASEMAP_OPTIONS = [
  { id: 'satellite', key: 'obsBasemapSatellite' },
  { id: 'streets', key: 'obsBasemapStreets' },
  { id: 'relief', key: 'obsBasemapRelief' },
]

function Row({ id, checked, disabled = false, onChange, label, hint, roomy = false }) {
  return (
    <label htmlFor={id} className={`flex items-center gap-2.5 px-1 ${roomy ? 'py-2' : 'py-1'} rounded-lg ${disabled ? 'opacity-50' : 'cursor-pointer hover:bg-cream/[0.06]'}`}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={e => onChange?.(e.target.checked)}
        className="h-4 w-4 accent-[#c4a06b] shrink-0"
      />
      <span className="text-sm text-cream">{label}</span>
      {hint && <span className="ml-auto text-[11px] text-cream/50">{hint}</span>}
    </label>
  )
}

/**
 * The map's layers box: a checkbox per layer. «Mis rincones» (the user's own pins) comes first and starts on. Switching one on opens its own controls (the
 * probability layer: the species search, the day, the legend) in `children`; off, the map goes
 * back to the plain basemap. Layers not built yet are listed, disabled.
 * The box collapses (chevron pointing right beside the title) into a round-cornered button with the layers icon
 * at the right edge; it starts expanded. Collapsing only hides it: each layer keeps its state.
 */
export function MapLayersBox({ corners = true, onCorners, probability, onProbability, forest = false, onForest, forestChildren = null, children, className = '', mobile = false, open: openProp, onOpenChange, basemap, onBasemap }) {
  const { t } = useApp()
  const uid = useId()
  const [openState, setOpenState] = useState(!mobile)
  // On a phone the page decides (it closes this box when the point's sheet opens, and the other way round)
  const open = openProp ?? openState
  const setOpen = value => { setOpenState(value); onOpenChange?.(value) }
  if (!open) {
    // The wrapper keeps the box's position but lets the map through; only the button takes clicks
    return (
      <div className={`${className} flex justify-end pointer-events-none`}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t.obsLayersExpand}
          title={t.obsLayersExpand}
          aria-expanded="false"
          className={`pointer-events-auto ${mobile ? 'p-3' : 'p-2.5'} rounded-xl backdrop-blur-sm bg-modal/85 shadow-lg text-cream hover:bg-white/10 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-cream/40`}
        >
          <Layers size={20} aria-hidden="true" />
        </button>
      </div>
    )
  }
  return (
    <div className={className} role="group" aria-label={t.obsLayersTitle}>
      <div className={`backdrop-blur-sm bg-modal/85 rounded-2xl p-2.5 space-y-1.5 shadow-lg ${mobile ? 'max-h-[calc(100dvh-6.5rem)] overflow-y-auto overscroll-contain' : ''}`}>
        <div className="flex items-center justify-between gap-2">
          {/* On a phone the row only has the ×; «Vista» is the first line of the content, below it */}
          {!mobile && <p className="px-1 text-[11px] uppercase tracking-[1.4px] font-medium text-coffee-light">{t.obsLayersTitle}</p>}
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={mobile ? t.obsLayersClose : t.obsLayersCollapse}
            title={mobile ? t.obsLayersClose : t.obsLayersCollapse}
            aria-expanded="true"
            className={`${mobile ? 'p-2.5 -m-1 ml-auto' : 'p-1'} rounded-lg text-cream/60 hover:text-cream hover:bg-white/10 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-cream/40`}
          >
            {mobile ? <X size={18} aria-hidden="true" /> : <ChevronRight size={16} aria-hidden="true" />}
          </button>
        </div>
        {mobile && (
          <div role="group" aria-label={t.obsBasemapLabel} className="pb-1.5">
            <p className="px-1 pb-2 text-[11px] uppercase tracking-[1.4px] font-medium text-coffee-light">{t.obsLayersView}</p>
            <div className="flex gap-1 rounded-xl p-1" style={{ background: 'var(--ui-tabs-bg)' }}>
              {BASEMAP_OPTIONS.map(o => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => onBasemap?.(o.id)}
                  aria-pressed={basemap === o.id}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-cream/40 ${basemap === o.id ? 'bg-bar text-white shadow-sm' : 'text-cream/60 hover:text-cream'}`}
                >
                  {t[o.key]}
                </button>
              ))}
            </div>
            <p className="px-1 pt-5 text-[11px] uppercase tracking-[1.4px] font-medium text-coffee-light">{t.obsLayersTitle}</p>
          </div>
        )}
        <Row roomy={mobile} id={`${uid}-corners`} checked={corners} onChange={onCorners} label={t.obsLayerCorners} />
        <Row roomy={mobile} id={`${uid}-prob`} checked={probability} onChange={onProbability} label={t.obsLayerProbability} />
        {probability && <div className="pb-1">{children}</div>}
        <Row roomy={mobile} id={`${uid}-forest`} checked={forest} onChange={onForest} label={t.obsLayerForest} />
        {forest && <div className="pb-1">{forestChildren}</div>}
        {COMING.map(l => (
          <Row roomy={mobile} key={l.id} id={`${uid}-${l.id}`} checked={false} disabled label={t[l.key]} hint={t.obsLayerSoon} />
        ))}
      </div>
    </div>
  )
}
