import { useEffect, useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { fetchPointForest } from '../../services/observatoryService'
import { formatCoords, samePoint } from '../../lib/observatoryView'
import { ObservatoryNotice } from './ObservatoryNotice'
import { PointHabitat } from './PointHabitat'
import { InfoTip } from './InfoTip'
import { getScoreBand } from '../../lib/scoreBands'

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
 * `layerValue` = what the probability layer paints at the point: { score, count } (count > 1: the
 * mean of that many species), null = nothing there, undefined = no layer to speak of.
 */
export function PointPanel({ point, observed, onObserve, onClose, layerValue, elevationM, layerSpeciesName = null, layerLoading = false }) {
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
  const elevation = Number.isFinite(d?.point?.elevation_m) ? d.point.elevation_m : elevationM
  // The kind of forest is the CREAF's (habitat block); the ICGC type only stands in without it
  const hasCreaf = Object.values(d?.habitat?.forest ?? {}).some(share => share >= 0.05)
  const macro = d?.forest && !hasCreaf ? `${t[MACRO_KEY[d.macrotype]]} (ICGC 2024)` : null
  const isObserved = samePoint(observed, point)

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

  return (
    <div
      role="dialog"
      aria-label={title}
      className="absolute z-[1100] left-3 right-16 bottom-14 md:bottom-3 md:right-auto md:w-[22rem] max-h-[calc(100%-11.5rem)] md:max-h-[calc(100%-6rem)] overflow-y-auto glass-olive-80 rounded-2xl p-4 space-y-3 shadow-xl"
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
          {d?.land_cover?.name && <p className="text-xs text-cream/50 mt-0.5">{aroundOnly ? `${t.obsUnderPoint} ` : ''}{d.land_cover.name}</p>}
        </div>
      )}

      {(layerValue !== undefined || layerLoading) && (
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

      <PointHabitat habitat={d?.habitat} compact />

      <button
        onClick={() => onObserve(point)}
        disabled={isObserved}
        className="w-full px-4 py-2.5 rounded-xl bg-bar hover:bg-[#a0834d] disabled:opacity-60 disabled:hover:bg-bar text-white text-sm font-medium transition-all"
      >
        {isObserved ? t.obsPointObserving : t.obsPointObserve}
      </button>

    </div>
  )
}
