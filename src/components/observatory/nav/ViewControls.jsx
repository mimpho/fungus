import { Check, Layers, Minus, Plus, X } from 'lucide-react'
import { useApp } from '../../../contexts/AppContext'
import {
  CARTO_NOLABELS_URL, CARTO_TILES_URL, ICGC_HYBRID_TILES_URL, ICGC_RELIEF_TILES_URL,
} from '../../../lib/basemap'

const FOCUS = 'outline-none focus-visible:ring-2 focus-visible:ring-cream/50'

// One real tile of central Catalonia (zoom 9) per base map, as its thumbnail: the same servers the map
// already uses, asked only while the panel is open.
const TILE = { z: 9, x: 258, y: 190 }
const tile = url => url
  .replace('{s}', 'a').replace('{r}', '')
  .replace('{z}', TILE.z).replace('{x}', TILE.x).replace('{y}', TILE.y)

const BASEMAPS = [
  { id: 'satellite', key: 'obsBasemapSatellite', layers: [ICGC_HYBRID_TILES_URL] },
  { id: 'streets', key: 'obsBasemapStreets', layers: [CARTO_TILES_URL] },
  { id: 'relief', key: 'obsBasemapRelief', layers: [CARTO_NOLABELS_URL, ICGC_RELIEF_TILES_URL] },
]

/** Desktop: the Vista button (bottom right, above the zoom). Filled while its panel is open. */
export function ViewButton({ open, onClick, panelId }) {
  const { t } = useApp()
  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls={open ? panelId : undefined}
      aria-label={t.obsViewTitle}
      className={`w-[76px] h-[76px] rounded-[22px] shadow-float flex flex-col items-center justify-center gap-1 text-xs font-medium ${open ? 'bg-[var(--nav-active)] text-white' : 'map-surface text-cream hover:brightness-110'} ${FOCUS}`}
    >
      <Layers size={18} aria-hidden="true" />
      {t.obsLayersView}
    </button>
  )
}

/**
 * The base map: three thumbnails; picking one closes the panel. `flat`: no surface of its own, for when it
 * sits inside the phone's tab bar sheet.
 */
export function ViewPanel({ id, basemap, onBasemap, onClose, flat = false, className = '' }) {
  const { t } = useApp()
  return (
    <div id={id} role="dialog" aria-label={t.obsViewTitle} className={`${flat ? 'p-4' : 'rounded-[22px] map-surface shadow-float p-3.5 pb-4'} flex flex-col gap-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-[17px] font-semibold text-cream">{t.obsViewTitle}</h2>
        <button type="button" onClick={onClose} aria-label={t.obsViewClose} title={t.obsViewClose} className={`w-9 h-9 -m-1 rounded-full flex items-center justify-center text-cream/60 hover:text-cream ${FOCUS}`}>
          <X size={18} aria-hidden="true" />
        </button>
      </div>
      <div role="radiogroup" aria-label={t.obsBasemapLabel} className="grid grid-cols-3 gap-2.5">
        {BASEMAPS.map(b => {
          const selected = basemap === b.id
          return (
            <button
              key={b.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => { onBasemap(b.id); onClose() }}
              className={`text-left rounded-xl ${FOCUS}`}
            >
              <span className={`relative block h-[72px] rounded-xl overflow-hidden bg-cream/10 border-[2.5px] ${selected ? 'border-coffee-light' : 'border-transparent'}`}>
                {b.layers.map(url => (
                  <img key={url} src={tile(url)} alt="" aria-hidden="true" draggable="false" className="absolute inset-0 w-full h-full object-cover" />
                ))}
              </span>
              <span className={`flex items-center justify-between pt-1.5 px-0.5 text-sm text-cream ${selected ? 'font-semibold' : 'font-medium'}`}>
                {t[b.key]}
                {selected && <Check size={16} aria-hidden="true" className="text-coffee-light" />}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Desktop: zoom in and out side by side, under the Vista button. */
export function ZoomButtons({ map }) {
  const { t } = useApp()
  const btn = `flex-1 h-[44px] flex items-center justify-center text-cream hover:[background-color:var(--ui-surface-hover)] disabled:opacity-40 ${FOCUS}`
  return (
    <div role="group" aria-label={t.obsZoom} className="w-[76px] h-[44px] rounded-[22px] map-surface shadow-float flex items-center overflow-hidden">
      <button type="button" aria-label={t.obsZoomIn} title={t.obsZoomIn} disabled={!map} onClick={() => map?.zoomIn()} className={btn}>
        <Plus size={18} aria-hidden="true" />
      </button>
      <span aria-hidden="true" className="w-px h-5 bg-cream/20" />
      <button type="button" aria-label={t.obsZoomOut} title={t.obsZoomOut} disabled={!map} onClick={() => map?.zoomOut()} className={btn}>
        <Minus size={18} aria-hidden="true" />
      </button>
    </div>
  )
}
