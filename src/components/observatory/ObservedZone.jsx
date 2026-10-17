import { useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { useSpecies } from '../../hooks/useSpecies'
import { speciesName } from '../../lib/speciesList'
import { usePointData } from '../../hooks/usePointData'
import { fetchPointForest, fetchPointSnapshot } from '../../services/observatoryService'
import { formatCoords } from '../../lib/observatoryView'
import { ObservatoryNotice } from './ObservatoryNotice'
import { SavePointControls } from './SavePointControls'
import { Thermometer, ThermometerSkeleton } from './Thermometer'
import { SpeciesPanel } from './SpeciesPanel'

const MACRO_KEY = {
  conifera: 'obsMacroConifera',
  esclerofilo: 'obsMacroEsclerofilo',
  caducifolio: 'obsMacroCaducifolio',
  bosque_otro: 'obsMacroOtro',
}

/**
 * The observed point: who it is (toponym, comarca, altitude, forest) and its thermometer.
 * The climate does not depend on the forest, so the thermometer is always shown; no forest only
 * says that the species will not be listed. The place name is context: if it fails, coordinates
 * stand in and nothing is reported. Only the thermometer failing is an error to show.
 */
export function ObservedZone({ point, saved, onClear }) {
  const { t } = useApp()
  const [speciesId, setSpeciesId] = useState(null)
  const { species: catalog } = useSpecies()
  const snap = usePointData(fetchPointSnapshot, point, { species: speciesId })
  const forest = usePointData(fetchPointForest, point)

  const d = forest.data
  const title = d?.toponym?.label ?? formatCoords(point)
  const elevation = snap.data?.point?.elevation_m ?? d?.point?.elevation_m
  const hasForest = d?.forest ?? snap.data?.forest ?? null
  const macro = hasForest && d?.macrotype ? t[MACRO_KEY[d.macrotype]] : null

  return (
    <section aria-label={t.obsObservedTitle} className="space-y-4">
      <div className="glass rounded-2xl p-4 space-y-3">
       <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-cream/50">{t.obsObservedTitle}</p>
          <p data-testid="zone-title" className="font-display text-2xl text-cream leading-tight break-words">{title}</p>
          <p className="text-xs text-cream/60 mt-1">
            {[
              d?.toponym?.comarca,
              Number.isFinite(elevation) ? `${Math.round(elevation)} m` : null,
              d?.toponym ? formatCoords(point) : null,
              hasForest ? [t.obsForestYes, macro].filter(Boolean).join(' · ') : null,
            ].filter(Boolean).join(' · ')}
          </p>
        </div>
        <button
          onClick={onClear}
          className="shrink-0 px-4 py-2 rounded-xl glass text-cream text-sm font-medium hover:[background-color:var(--ui-surface-hover)] transition-all"
        >
          {t.obsClear}
        </button>
       </div>
        <div className="max-w-md">
          <SavePointControls point={point} suggestedName={d?.toponym?.label} saved={saved} />
        </div>
      </div>

      {hasForest === false && (
        <p role="note" className="rounded-xl glass-warm px-4 py-3 text-sm text-cream/90">{t.obsForestNo}</p>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] items-start">
        <div className="space-y-3 min-w-0">
          {snap.status === 'loading' && <ThermometerSkeleton />}
          {snap.status === 'error' && <ObservatoryNotice error={snap.error} onRetry={snap.retry} />}
          {snap.status === 'ready' && (
            <Thermometer
              snap={snap.data}
              forName={speciesId ? speciesName(speciesId, null, new Map((catalog ?? []).map(s => [s.id, s]))) : null}
            />
          )}
        </div>
        {/* On desktop the panel is laid out absolutely inside this box: its height is the thermometer's */}
        <div className="relative lg:self-stretch lg:min-h-[30rem]">
          <SpeciesPanel point={point} savedId={saved.find(point)?.id ?? null} selected={speciesId} onSelect={setSpeciesId} />
        </div>
      </div>
    </section>
  )
}
