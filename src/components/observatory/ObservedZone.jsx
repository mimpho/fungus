import { useMemo, useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { useSpecies } from '../../hooks/useSpecies'
import { speciesName } from '../../lib/speciesList'
import { usePointData } from '../../hooks/usePointData'
import { fetchPointForest, fetchPointSnapshot, fetchPointSpecies, fetchSavedPointSpecies } from '../../services/observatoryService'
import { speciesRange } from '../../lib/chartData'
import { formatCoords } from '../../lib/observatoryView'
import { ObservatoryNotice } from './ObservatoryNotice'
import { SavePointControls } from './SavePointControls'
import { Thermometer, ThermometerSkeleton } from './Thermometer'
import { SpeciesPanel } from './SpeciesPanel'
import { ChartSection } from './ChartSection'

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
export function ObservedZone({ point, saved, onClear, savedToggle = null, savedList = null }) {
  const { t } = useApp()
  const [speciesId, setSpeciesId] = useState(null)
  const { species: catalog } = useSpecies()
  const snap = usePointData(fetchPointSnapshot, point, { species: speciesId })
  const savedId = saved.find(point)?.id ?? null
  // A saved point asks through its own endpoint: its forest types win over the land cover
  const speciesFetcher = useMemo(
    () => (savedId ? (_lat, _lon, opts) => fetchSavedPointSpecies(savedId, opts) : fetchPointSpecies),
    [savedId],
  )
  const speciesList = usePointData(speciesFetcher, point)
  const byId = useMemo(() => new Map((catalog ?? []).map(s => [s.id, s])), [catalog])
  const chosenName = speciesId ? speciesName(speciesId, null, byId) : null
  const chosenRange = useMemo(
    () => speciesRange(speciesList.data?.species?.find(s => s.id === speciesId)),
    [speciesList.data, speciesId],
  )
  const forest = usePointData(fetchPointForest, point)

  const d = forest.data
  const title = d?.toponym?.label ?? formatCoords(point)
  const elevation = snap.data?.point?.elevation_m ?? d?.point?.elevation_m
  const hasForest = d?.forest ?? snap.data?.forest ?? null
  const macro = hasForest && d?.macrotype ? t[MACRO_KEY[d.macrotype]] : null

  return (
    <section aria-label={t.obsObservedTitle} className="space-y-4">
      <div className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div className="min-w-0 flex-1 basis-[18rem]">
            <p className="text-[11px] uppercase tracking-[1.4px] font-medium text-coffee-light">{t.obsObservedTitle}</p>
            <h2 data-testid="zone-title" className="font-display font-bold text-[clamp(38px,5vw,56px)] leading-[1.02] tracking-[0.3px] text-cream break-words mt-1">{title}</h2>
            <p className="text-[13px] text-cream/70 mt-2">
              {[
                d?.toponym?.comarca,
                Number.isFinite(elevation) ? `${Math.round(elevation)} m` : null,
                d?.toponym ? formatCoords(point) : null,
                hasForest ? [t.obsForestYes, macro].filter(Boolean).join(' · ') : null,
              ].filter(Boolean).join(' · ')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-bar hover:bg-[#a0834d] text-white text-sm font-medium shadow-md transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 4 3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5 9 4z" />
              <path d="M9 4v13M15 6.5v13" />
            </svg>
            {t.obsBackToMap}
          </button>
        </div>
        <div className="max-w-xl">
          <SavePointControls point={point} suggestedName={d?.toponym?.label} saved={saved} extra={savedToggle} />
        </div>
      </div>

      {savedList}

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
              forName={chosenName}
            />
          )}
        </div>
        {/* On desktop the panel is laid out absolutely inside this box: its height is the thermometer's */}
        <div className="relative lg:self-stretch lg:min-h-[30rem]">
          <SpeciesPanel state={speciesList} selected={speciesId} onSelect={setSpeciesId} />
        </div>
      </div>

      <ChartSection point={point} species={speciesId} speciesName={chosenName} range={chosenRange} />
    </section>
  )
}
