import { useEffect, useRef, useState } from 'react'
import { Check, Layers, LocateFixed, Loader2, Maximize, Minus, Plus, X } from 'lucide-react'
import { useApp } from '../../../contexts/AppContext'
import { PanelSwitch } from './PanelSwitch'
import {
  CARTO_NOLABELS_URL, CARTO_TILES_URL, ICGC_HYBRID_TILES_URL, ICGC_RELIEF_TILES_URL,
} from '../../../lib/basemap'

const FOCUS = 'outline-none focus-visible:ring-2 focus-visible:ring-cream/50'
// The corner radius of the three controls at the bottom right of the desktop map (Vista, My location and the zoom): one value, Vista's
const CONTROL_RADIUS = 'rounded-[22px]'

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
      className={`w-[76px] h-[76px] ${CONTROL_RADIUS} shadow-float flex flex-col items-center justify-center gap-1 text-xs font-medium ${open ? 'bg-[var(--nav-active)] text-white' : 'map-surface text-cream hover:brightness-110'} ${FOCUS}`}
    >
      <Layers size={18} aria-hidden="true" />
      {t.obsLayersView}
    </button>
  )
}

/**
 * The base map: three thumbnails; picking one closes the panel. `flat`: no surface of its own, for when it
 * sits inside the phone's tab bar sheet. It also holds the fullscreen switch (`onFullscreen(on)`, `fullscreen`):
 * the page's own button next to the search took width from the two search fields.
 */
export function ViewPanel({ id, basemap, onBasemap, onClose, flat = false, fullscreen = false, onFullscreen = null, className = '' }) {
  const { t } = useApp()
  return (
    <div id={id} role="dialog" aria-label={t.obsViewTitle} className={`${flat ? 'p-4' : 'rounded-[22px] map-surface shadow-float p-3.5 pb-4'} flex flex-col gap-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-[17px] font-semibold text-cream">{t.obsViewTitle}</h2>
        <button type="button" onClick={onClose} aria-label={t.obsViewClose} title={t.obsViewClose} className={`w-[40px] h-[40px] -my-[7px] -mr-[8px] rounded-full flex items-center justify-center text-cream/60 hover:text-cream ${FOCUS}`}>
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
      {onFullscreen && (
        <div className="flex items-center justify-between gap-3 border-t border-cream/15 pt-3">
          <span className="flex items-center gap-2.5 text-[15px] font-medium text-cream">
            <Maximize size={18} aria-hidden="true" />
            {t.obsFullscreenEnter}
          </span>
          <PanelSwitch checked={fullscreen} onChange={onFullscreen} label={t.obsFullscreenEnter} />
        </div>
      )}
    </div>
  )
}

/** Desktop: zoom in and out side by side, under the Vista button (it is the last of the three). */
export function ZoomButtons({ map }) {
  const { t } = useApp()
  const btn = `flex-1 h-[44px] flex items-center justify-center text-cream hover:[background-color:var(--ui-surface-hover)] disabled:opacity-40 ${FOCUS}`
  return (
    <div role="group" aria-label={t.obsZoom} className={`w-[76px] h-[44px] ${CONTROL_RADIUS} map-surface shadow-float flex items-center overflow-hidden`}>
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

/**
 * «My location»: asks the browser for the position and hands it to `onLocate(lat, lon)`, which answers
 * `false` when the position is outside Catalonia. A short bubble to the left says why when it fails (the browser blocks the location, it waits for the user's answer, the position cannot be had, it takes too long). `desktop`: the size and the radius
 * of the Vista button, with no text (as in the usual map apps); on the phone it is a round button of 52 px.
 */
export function LocateButton({ onLocate, className = '', style, desktop = false }) {
  const { t } = useApp()
  // 'idle' | 'locating' | a failure: 'denied' (the browser blocks the location) | 'ask' (it waits for the answer to its question) | 'unavailable' | 'timeout' | 'error' | 'outside'
  const [state, setState] = useState('idle')
  const timer = useRef(null)
  const watchdog = useRef(null)
  const attempt = useRef(0) // each tap is one attempt; a late answer to an older one is ignored
  const alive = useRef(true)
  // Set on mount too: React's dev double mount runs the cleanup once, and without this the button would think it is gone and never answer
  useEffect(() => {
    alive.current = true
    return () => { alive.current = false; clearTimeout(timer.current); clearTimeout(watchdog.current) }
  }, [])

  const fail = (kind, ms = 4000) => {
    if (!alive.current) return
    clearTimeout(watchdog.current)
    setState(kind)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => alive.current && setState('idle'), ms)
  }
  const permission = async () => {
    try { return (await navigator.permissions?.query({ name: 'geolocation' }))?.state ?? null } catch { return null }
  }
  const locate = async () => {
    if (state === 'locating') return
    if (!navigator.geolocation) { fail('unavailable'); return }
    const id = ++attempt.current
    setState('locating')
    // A location the browser already blocks does not ask again: say so at once instead of leaving the spinner
    if (await permission() === 'denied') { if (id === attempt.current) fail('denied', 8000); return }
    if (id !== attempt.current || !alive.current) return
    // The spinner never stays for ever: if there is no answer, say whether the browser is still waiting for the user's
    clearTimeout(watchdog.current)
    watchdog.current = setTimeout(async () => {
      if (id !== attempt.current) return
      attempt.current += 1
      fail(await permission() === 'prompt' ? 'ask' : 'timeout', 8000)
    }, 15000)
    // High accuracy (GPS) only where there is one: on a computer it only makes the browser take longer to answer
    const gps = window.matchMedia?.('(pointer: coarse)').matches === true
    navigator.geolocation.getCurrentPosition(
      pos => {
        if (id !== attempt.current || !alive.current) return
        clearTimeout(watchdog.current)
        const ok = onLocate(pos.coords.latitude, pos.coords.longitude)
        if (ok === false) fail('outside'); else setState('idle')
      },
      err => {
        if (id !== attempt.current) return
        if (err?.code === 1) fail('denied', 8000)
        else if (err?.code === 2) fail('unavailable')
        else if (err?.code === 3) fail('timeout')
        else fail('error')
      },
      { enableHighAccuracy: gps, timeout: 10000, maximumAge: gps ? 30000 : 300000 },
    )
  }
  const MESSAGES = {
    denied: t.obsLocateDenied, ask: t.obsLocateAsk, unavailable: t.obsLocateUnavailable, timeout: t.obsLocateTimeout, error: t.obsLocateError, outside: t.obsLocateOutside,
  }
  const message = MESSAGES[state] ?? null
  const failed = message !== null
  return (
    <div className={className} style={style}>
      <button
        type="button"
        onClick={locate}
        aria-label={t.obsLocate}
        title={t.obsLocate}
        aria-busy={state === 'locating'}
        className={`${desktop ? `w-[76px] h-[76px] ${CONTROL_RADIUS}` : 'w-[52px] h-[52px] rounded-full'} map-surface shadow-float flex items-center justify-center hover:brightness-110 ${failed ? 'text-amber-400' : 'text-cream'} ${FOCUS}`}
      >
        {state === 'locating'
          ? <Loader2 size={24} aria-hidden="true" className="animate-spin motion-reduce:animate-none" />
          : <LocateFixed size={24} aria-hidden="true" />}
      </button>
      {message && (
        <p role="status" className="absolute right-full top-1/2 -translate-y-1/2 mr-2 w-max max-w-[16rem] bg-coffee shadow-float rounded-xl px-3 py-2 text-xs text-white pointer-events-none">
          {message}
        </p>
      )}
    </div>
  )
}
