import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useApp } from '../../contexts/AppContext'
import { useSpecies } from '../../hooks/useSpecies'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { buildRows, seasonSummary, speciesName } from '../../lib/speciesList'
import { useSpeciesRows } from '../../hooks/useSpeciesRows'
import { SpeciesSlot } from './speciesSheet/SpeciesSlot'
import { fill } from '../../lib/thermometer'
import { usePointData } from '../../hooks/usePointData'
import { fetchPointCalendar, fetchPointForest, fetchPointSnapshot, fetchPointSpecies, fetchSavedPointSpecies } from '../../services/observatoryService'
import { speciesRange } from '../../lib/chartData'
import { ENSEMBLE } from '../../lib/speciesList'
import { formatCoords } from '../../lib/observatoryView'
import { ObservatoryNotice } from './ObservatoryNotice'
import { PointFacts, PointFactsSkeleton } from './PointFacts'
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
export function ObservedZone({ point, saved, until = null, days, onWindow, initialSpecies = null, onOpenList, headerSlot = null, filtersSlot = null, sheetSlot = null }) {
  const { t, lang } = useApp()
  // Starts on the species the map layer shows, so the thermometer and the map speak of the same one
  const [speciesId, setSpeciesId] = useState(initialSpecies)
  // One column (under lg): the corner's card goes first, above the filter pills and the species filter
  const single = !useMediaQuery('(min-width: 1024px)')
  const { species: catalog } = useSpecies()
  const pickerRows = useSpeciesRows()
  const [sheetH, setSheetH] = useState(0) // height of the active species' sheet, kept free at the foot of the page
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
  // The active species' sheet: its identity (photo, names, edibility). The score is not in it: the thermometer says it.
  const sheetRow = useMemo(() => (speciesId ? pickerRows.find(r => r.id === speciesId) ?? null : null), [speciesId, pickerRows])
  // The line under the sheet's title when no species is chosen: what is in season at this point and how good the conditions are (nothing while the list loads)
  const listRows = useMemo(() => buildRows(speciesList.data, byId, t, lang), [speciesList.data, byId, t, lang])
  const sheetSummary = useMemo(() => seasonSummary(listRows, until, t, lang), [listRows, until, t, lang])
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
  // What the point is: one column (under lg) it opens the zone; from lg up it is the top of the left column, level with the corner's card
  const factsEl = (
    <>
      {forest.data == null && forest.status === 'loading'
        ? <PointFactsSkeleton />
        : <PointFacts point={point} toponym={d?.toponym} elevation={elevation} habitat={habitat} macro={macro} />}
      {hasForest === false && (
        <p role="note" className="rounded-xl glass-warm px-4 py-3 text-sm text-cream/90">{t.obsForestNo}</p>
      )}
    </>
  )

  return (
    <section aria-label={t.obsObservedTitle} className="space-y-4">
      {/* The label and the title go in the header of the layer (`headerSlot`, as tall as the site's header) */}
      {headerSlot && createPortal(
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[1.4px] font-medium text-coffee-light">{t.obsObservedTitle}</p>
          <h2 data-testid="zone-title" title={title} className="font-display font-bold text-[clamp(22px,2.8vw,30px)] leading-tight tracking-[0.3px] text-cream truncate">{title}</h2>
        </div>,
        headerSlot,
      )}

      {single && factsEl}

      {single && (
        <CornerCard point={point} saved={saved} onOpenList={onOpenList} suggestedName={d?.toponym?.name ?? d?.toponym?.label} toponym={d?.toponym} />
      )}

      {/* The active filters go in a bar under the layer's header (`filtersSlot`), fixed there when the zone scrolls up to it; no bar while there are none */}
      {/* From lg up the species filter is one of them (it changes the thermometer, the chart and the calendar, as the window does); on the phone it is the bottom sheet */}
      {filtersSlot && (until || days !== DEFAULT_WINDOW || (!single && speciesId)) && createPortal(
        <div className="max-w-7xl mx-auto px-4 pt-5 pb-0">
          <FilterPills
            speciesName={!single && speciesId ? activeName : null}
            speciesPhoto={byId.get(speciesId)?.photo?.url ?? null}
            onClearSpecies={() => setSpeciesId(null)}
            until={until}
            days={days}
            onClearWindow={() => onWindow(null, DEFAULT_WINDOW)}
          />
        </div>,
        filtersSlot,
      )}

      {/* Two rows of two cells from lg up. On top the facts and the thermometer, and on the right the corner and the species filter, which takes
          the height the corner leaves, down to the foot of the chart (its list scrolls inside). Below the facts, the chart (its events list is inside its card).
          Under lg one column: the species filter is the bottom sheet (see below) */}
      <ChartSection point={point} species={activeId} speciesName={activeName} range={chosenRange} until={until} days={days} onWindow={onWindow} calendar={calendar}>
        {({ chart }) => (
      <div className="grid gap-4 grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_clamp(20rem,30%,30rem)] items-start lg:items-stretch">
        <div className="space-y-4 min-w-0">
          {!single && factsEl}
          {/* Moving the window asks for another day: the last thermometer stays, dimmed, until it arrives */}
          {snap.data == null && snap.status === 'loading' && <ThermometerSkeleton />}
          {snap.status === 'error' && <ObservatoryNotice error={snap.error} onRetry={snap.retry} />}
          {snap.data != null && (
            <div className={`transition-opacity ${snap.stale ? 'opacity-60' : ''}`}>
              <Thermometer snap={snap.data} note={thermoNote} />
            </div>
          )}
        </div>
        {!single && (
          <div className="flex flex-col gap-4 min-w-0 lg:col-start-2 lg:row-start-1 lg:row-span-2">
            <CornerCard point={point} saved={saved} onOpenList={onOpenList} suggestedName={d?.toponym?.name ?? d?.toponym?.label} toponym={d?.toponym} />
            {/* The card never sets the row's height (it is laid over the slot, which has a minimum of its own): it takes what the corner's card leaves */}
            <div className="relative flex-1 min-h-[320px]">
              <div className="absolute inset-0">
                <SpeciesPanel state={speciesList} selected={speciesId} onSelect={setSpeciesId} summary={sheetSummary} />
              </div>
            </div>
          </div>
        )}
        <div className="min-w-0 lg:col-start-1">{chart}</div>
      </div>
        )}
      </ChartSection>

      {/* From 1440 px up the forecast and the calendar sit side by side */}
      <div className="grid gap-4 grid-cols-[minmax(0,1fr)] min-[1440px]:grid-cols-2 items-start">
        <ForecastSection point={point} zoneName={title} />

        <CalendarSection cal={calendar} speciesName={activeName} />
      </div>

      {/* Room for the sheet at the foot, so it never covers the last card */}
      <div aria-hidden="true" style={{ height: sheetH }} />
      {/* The zone's species filter under lg: a bottom sheet. With no species it is the way in (the title, what is in season and a
          magnifier; it unfolds to the list); with one it shows its photo and «Filtrant per» + the pill that takes the filter off.
          From lg up it is a card of the right column (above) */}
      {single && sheetSlot && createPortal(
        <SpeciesSlot
          key={sheetRow?.id ?? 'idle'}
          zone
          row={sheetRow}
          species={sheetRow ? byId.get(sheetRow.id) ?? null : null}
          lens={null}
          summary={sheetSummary}
          onClear={() => setSpeciesId(null)}
          onStackHeight={setSheetH}
          renderPicker={done => (
            <SpeciesPanel embedded state={speciesList} selected={speciesId} onSelect={id => { setSpeciesId(id); done() }} />
          )}
        />,
        sheetSlot,
      )}
    </section>
  )
}
