import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useApp } from '../../contexts/AppContext'
import { useSpecies } from '../../hooks/useSpecies'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { buildRows, seasonSummary, speciesName } from '../../lib/speciesList'
import { useSpeciesRows } from '../../hooks/useSpeciesRows'
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
export function ObservedZone({ point, saved, until = null, days, onWindow, speciesId = null, onSpeciesChange, onOpenList, headerSlot = null, filtersSlot = null }) {
  const { t, lang } = useApp()
  // The species is the page's (the map's active one, `seta` in the URL): the zone reads and writes the same one, so a change here stays when the zone closes
  const setSpeciesId = onSpeciesChange
  // One column (under lg): the corner's card goes first, above the filter pills and the species filter
  const single = !useMediaQuery('(min-width: 1024px)')
  const { species: catalog } = useSpecies()
  const pickerRows = useSpeciesRows()
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
      {/* The species filter is one of them (it changes the thermometer, the chart and the calendar, as the window does) */}
      {filtersSlot && (until || days !== DEFAULT_WINDOW || speciesId) && createPortal(
        <div className="max-w-7xl mx-auto px-4 pt-5 pb-0">
          <FilterPills
            speciesName={speciesId ? activeName : null}
            speciesPhoto={byId.get(speciesId)?.photo?.url ?? null}
            onClearSpecies={() => setSpeciesId(null)}
            until={until}
            days={days}
            onClearWindow={() => onWindow(null, DEFAULT_WINDOW)}
          />
        </div>,
        filtersSlot,
      )}

      {/* Two columns from lg up. On the left the whole zone: the facts, the thermometer, the chart, the forecast and the calendar. On the right the
          corner and the species filter, the species filter sticks under the layer's header once the corner's card has scrolled away, as tall as the
          screen shows (its list scrolls inside). Under lg one column: the species list is a card after the thermometer */}
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
          {/* One column: the species list is a card of the flow, after the thermometer (from lg up it is the right column's) */}
          {single && (
            <div className="h-[28rem]">
              <SpeciesPanel state={speciesList} selected={speciesId} onSelect={setSpeciesId} summary={sheetSummary} />
            </div>
          )}
          {chart}
          {/* One under the other: the left column is narrower than the page (the species filter takes the right one) */}
          <ForecastSection point={point} zoneName={title} />
          <CalendarSection cal={calendar} speciesName={activeName} />
        </div>
        {!single && (
          <div className="flex flex-col gap-4 min-w-0">
            <CornerCard point={point} saved={saved} onOpenList={onOpenList} suggestedName={d?.toponym?.name ?? d?.toponym?.label} toponym={d?.toponym} />
            {/* The species filter sticks under the layer's header (one gap below it) when the corner's card has scrolled away, as tall as the screen shows; on a screen shorter than 48rem it goes with the page, 28rem tall */}
            <div
              className="min-h-[16rem] h-[28rem] [@media(min-height:48rem)]:sticky [@media(min-height:48rem)]:top-[var(--col-top)] [@media(min-height:48rem)]:h-[var(--col-h)]"
              style={{
                '--col-top': 'calc(var(--header-h, 5.5rem) + 1rem)',
                '--col-h': 'calc(100dvh - var(--header-h, 5.5rem) - 2rem)',
              }}
            >
              <SpeciesPanel state={speciesList} selected={speciesId} onSelect={setSpeciesId} summary={sheetSummary} />
            </div>
          </div>
        )}
      </div>
        )}
      </ChartSection>

    </section>
  )
}
