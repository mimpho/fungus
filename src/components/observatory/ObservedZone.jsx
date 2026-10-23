import { useMemo, useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { useSpecies } from '../../hooks/useSpecies'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { speciesName } from '../../lib/speciesList'
import { fill } from '../../lib/thermometer'
import { usePointData } from '../../hooks/usePointData'
import { fetchPointCalendar, fetchPointForest, fetchPointSnapshot, fetchPointSpecies, fetchSavedPointSpecies } from '../../services/observatoryService'
import { speciesRange } from '../../lib/chartData'
import { ENSEMBLE } from '../../lib/speciesList'
import { formatCoords } from '../../lib/observatoryView'
import { ObservatoryNotice } from './ObservatoryNotice'
import { PointHabitat } from './PointHabitat'
import { SavePointControls } from './SavePointControls'
import { CornerCard } from './CornerCard'
import { Thermometer, ThermometerSkeleton } from './Thermometer'
import { SpeciesPanel } from './SpeciesPanel'
import { ChartSection } from './ChartSection'
import { FilterPills } from './FilterPills'
import { DEFAULT_WINDOW } from '../../lib/observatoryView'
import { CalendarSection } from './CalendarSection'
import { ForecastSection } from './ForecastSection'

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
export function ObservedZone({ point, saved, until = null, days, onWindow, onRemoved, initialSpecies = null, onSpeciesPick, onOpenList }) {
  const { t, lang } = useApp()
  // Starts on the species the map layer shows, so the thermometer and the map speak of the same one
  const [speciesId, setSpeciesId] = useState(initialSpecies)
  const { species: catalog } = useSpecies()
  // The thermometer and the species list are those of the window's last day (null = the last day
  // with data). Held back a moment so that stepping with the keyboard does not ask for every day.
  const date = useDebouncedValue(until, 250)
  const savedId = saved.find(point)?.id ?? null
  // A saved point asks through its own endpoint: its forest types win over the land cover
  const speciesFetcher = useMemo(
    () => (savedId ? (_lat, _lon, opts) => fetchSavedPointSpecies(savedId, opts) : fetchPointSpecies),
    [savedId],
  )
  const speciesList = usePointData(speciesFetcher, point, { date }, { keepPrevious: true })
  const byId = useMemo(() => new Map((catalog ?? []).map(s => [s.id, s])), [catalog])
  // Without a chosen species the thermometer, the chart and the calendar are those of the excellent
  // edibles together: the mean of the ones that grow at this point (altitude, forest and soil
  // judged for each) and are in season on the date, the same number the map paints before a
  // species is chosen. The server calls it `species=excellent`.
  const activeId = speciesId ?? ENSEMBLE
  const activeName = speciesId ? speciesName(speciesId, null, byId) : t.obsThEnsembleName
  const chosenName = speciesId ? speciesName(speciesId, null, byId) : null
  const chosenRange = useMemo(
    () => speciesRange(speciesList.data?.species?.find(s => s.id === activeId)),
    [speciesList.data, activeId],
  )
  const snap = usePointData(fetchPointSnapshot, point, { species: activeId, date }, { keepPrevious: true })
  const forest = usePointData(fetchPointForest, point)
  // The calendar is asked once: its days ahead are also the end of the score chart
  const calendar = usePointData(fetchPointCalendar, point, { species: activeId })

  const d = forest.data
  const habitat = d?.habitat ?? speciesList.data?.habitat ?? null
  const title = d?.toponym?.label ?? formatCoords(point)
  const elevation = snap.data?.point?.elevation_m ?? d?.point?.elevation_m
  const hasForest = d?.forest ?? snap.data?.forest ?? null
  // What the thermometer is made of when no species is chosen: a tooltip next to the score. With
  // no forest the note about the forest already says why there are no species.
  const ens = snap.data?.ensemble
  const thermoNote = speciesId || snap.data == null || (ens?.climate_only && hasForest === false) ? null
    : ens?.count === 1 ? t.obsThAutoOne
    : ens?.count ? fill(t.obsThAuto, { n: ens.count }, lang)
    : ens?.climate_only ? t.obsThAutoClimate : t.obsThAutoNone
  // The 2024 land cover (ICGC) only says forest or not. The kind of forest is the CREAF's (habitat
  // block below): finer, and the one every score uses. The ICGC's broad type is only a stand-in
  // where the server has no CREAF raster.
  const hasCreaf = Object.values(habitat?.forest ?? {}).some(share => share >= 0.05)
  const macro = hasForest && d?.macrotype && !hasCreaf ? `${t[MACRO_KEY[d.macrotype]]} (ICGC 2024)` : null

  return (
    <section aria-label={t.obsObservedTitle} className="space-y-4">
      <SavePointControls
        point={point}
        suggestedName={d?.toponym?.name ?? d?.toponym?.label}
        saved={saved}
        lead={(
          <>
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
          </>
        )}
      />

      {hasForest === false && (
        <p role="note" className="rounded-xl glass-warm px-4 py-3 text-sm text-cream/90">{t.obsForestNo}</p>
      )}

      <PointHabitat habitat={habitat} />

      <FilterPills
        speciesName={chosenName}
        onClearSpecies={() => setSpeciesId(null)}
        until={until}
        days={days}
        onClearWindow={() => onWindow(null, DEFAULT_WINDOW)}
      />

      {/* Two independent columns, so a card never waits for the height of the one beside it: on the left the
          thermometer and the chart, on the right the corner, the species filter and the events list */}
      <ChartSection point={point} species={activeId} speciesName={activeName} range={chosenRange} until={until} days={days} onWindow={onWindow} calendar={calendar}>
        {({ chart, events }) => (
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_clamp(22rem,38%,34.5rem)] items-start">
        <div className="space-y-4 min-w-0">
          {/* Moving the window asks for another day: the last thermometer stays, dimmed, until it arrives */}
          {snap.data == null && snap.status === 'loading' && <ThermometerSkeleton />}
          {snap.status === 'error' && <ObservatoryNotice error={snap.error} onRetry={snap.retry} />}
          {snap.data != null && (
            <div className={`transition-opacity ${snap.stale ? 'opacity-60' : ''}`}>
              <Thermometer snap={snap.data} note={thermoNote} />
            </div>
          )}
          {chart}
        </div>
        <div className="flex flex-col gap-4 min-w-0">
          <CornerCard point={point} saved={saved} onOpenList={onOpenList} suggestedName={d?.toponym?.name ?? d?.toponym?.label} onRemoved={onRemoved} />
          <SpeciesPanel
            state={speciesList}
            selected={speciesId}
            // Choosing (or unchoosing) a species re-asks the thermometer and the cards: bring the
            // top of the zone into view so the person sees them change
            onSelect={id => { setSpeciesId(id); onSpeciesPick?.() }}
          />
          {events}
        </div>
      </div>
        )}
      </ChartSection>

      {/* From 1440 px up the forecast and the calendar sit side by side */}
      <div className="grid gap-4 min-[1440px]:grid-cols-2 items-start">
        <ForecastSection point={point} zoneName={title} />

        <CalendarSection cal={calendar} speciesName={activeName} />
      </div>
    </section>
  )
}
