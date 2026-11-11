import { useEffect, useRef, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { useApp } from '../../../contexts/AppContext'
import { fill } from '../../../lib/thermometer'

const SHOW_AFTER_MS = 300 // answers from the cache never flash the bar
const KEEP_FOR_MS = 400   // once shown, long enough to be read as a bar, not a flicker

/**
 * The top edge of the map while a layer that is on is loading: a thin bar that moves, no percentage
 * (a few requests with no real progress to report). If a layer that is on failed, a compact notice
 * in the same place with «Reintentar».
 */
export function MapLoadingBar({ busy, failed }) {
  const { t, lang } = useApp()
  const [shown, setShown] = useState(false)
  const shownAt = useRef(0)

  useEffect(() => {
    if (busy) {
      if (shown) return undefined
      const timer = setTimeout(() => { shownAt.current = Date.now(); setShown(true) }, SHOW_AFTER_MS)
      return () => clearTimeout(timer)
    }
    if (!shown) return undefined
    const left = Math.max(0, KEEP_FOR_MS - (Date.now() - shownAt.current))
    const timer = setTimeout(() => setShown(false), left)
    return () => clearTimeout(timer)
  }, [busy, shown])

  if (failed && !busy) {
    return (
      <div role="alert" className="absolute z-[1150] top-[4.25rem] left-1/2 -translate-x-1/2 max-w-[calc(100%-2rem)] flex items-center gap-3 rounded-full map-surface shadow-float pl-4 pr-1.5 py-1.5 text-sm text-cream">
        <span className="truncate">{fill(t.obsLayerFailed, { capa: failed.label }, lang)}</span>
        <button
          type="button"
          onClick={failed.retry}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-cream/10 hover:bg-cream/20 font-medium outline-none focus-visible:ring-2 focus-visible:ring-cream/50"
        >
          <RotateCcw size={14} aria-hidden="true" />
          {t.obsRetry}
        </button>
      </div>
    )
  }
  if (!shown) return null
  return (
    <div
      role="progressbar"
      aria-label={t.obsLoadingLayers}
      data-testid="map-loading-bar"
      className="map-loading-bar absolute z-[1150] top-0 inset-x-0 h-[3px] overflow-hidden pointer-events-none"
    >
      <span className="map-loading-bar__run" />
    </div>
  )
}
