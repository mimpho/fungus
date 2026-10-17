import { useEffect, useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { fetchPointForest } from '../../services/observatoryService'
import { formatCoords, samePoint } from '../../lib/observatoryView'
import { ObservatoryNotice } from './ObservatoryNotice'
import { SavePointControls } from './SavePointControls'

const MACRO_KEY = {
  conifera: 'obsMacroConifera',
  esclerofilo: 'obsMacroEsclerofilo',
  caducifolio: 'obsMacroCaducifolio',
  bosque_otro: 'obsMacroOtro',
}

/**
 * What the map click found: the nearest toponym, altitude and forest at the point, with the
 * «Observar esta zona» button. Asking this costs no climate data (no new cell), so every click
 * can ask; the answer is context, and the button works even while it loads or if it fails.
 */
export function PointPanel({ point, observed, saved, onObserve, onClose }) {
  const { t } = useApp()
  const [state, setState] = useState({ status: 'loading', data: null, error: null })
  const [attempt, setAttempt] = useState(0)

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
  const elevation = d?.point?.elevation_m
  const macro = d?.forest ? t[MACRO_KEY[d.macrotype]] : null
  const isObserved = samePoint(observed, point)

  let forestLine = null
  if (d) {
    if (d.forest === true) forestLine = [t.obsForestYes, macro].filter(Boolean).join(' · ')
    else if (d.forest === false) forestLine = t.obsForestNo
    else forestLine = t.obsForestUnknown
  }

  return (
    <div
      role="dialog"
      aria-label={title}
      className="absolute z-[1100] left-3 right-16 bottom-14 md:bottom-3 md:right-auto md:w-[22rem] max-h-[calc(100%-11.5rem)] md:max-h-[calc(100%-6rem)] overflow-y-auto glass-olive rounded-2xl p-4 space-y-3 shadow-xl"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-xl text-cream leading-tight break-words">{title}</p>
          <p className="text-xs text-cream/60 mt-0.5">
            {state.status === 'loading' && t.obsPointLooking}
            {state.status === 'ready' && [
              d?.toponym?.comarca,
              Number.isFinite(elevation) ? `${Math.round(elevation)} m` : null,
              d?.toponym ? formatCoords(point) : null,
            ].filter(Boolean).join(' · ')}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label={t.obsPointClose}
          className="shrink-0 p-1.5 rounded-lg text-cream/60 hover:text-cream hover:bg-white/10 transition-colors"
        >
          ✕
        </button>
      </div>

      {state.status === 'error' && <ObservatoryNotice error={state.error} onRetry={() => setAttempt(a => a + 1)} />}

      {forestLine && (
        <div className="text-sm text-cream/80">
          <p>{forestLine}</p>
          {d?.land_cover?.name && <p className="text-xs text-cream/50 mt-0.5">{d.land_cover.name}</p>}
        </div>
      )}

      <button
        onClick={() => onObserve(point)}
        disabled={isObserved}
        className="w-full px-4 py-2.5 rounded-xl bg-bar hover:bg-[#a0834d] disabled:opacity-60 disabled:hover:bg-bar text-white text-sm font-medium transition-all"
      >
        {isObserved ? t.obsPointObserving : t.obsPointObserve}
      </button>

      <SavePointControls key={`${point.lat},${point.lon}`} point={point} suggestedName={d?.toponym?.label} saved={saved} />
    </div>
  )
}
