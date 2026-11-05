import { useMemo, useState } from 'react'
import { ChevronDown, Crosshair } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { IC } from '../../lib/helpers'
import { useSpecies } from '../../hooks/useSpecies'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { speciesName } from '../../lib/speciesList'
import { fill } from '../../lib/thermometer'
import { usePointData } from '../../hooks/usePointData'
import { fetchPointCalendar, fetchPointForest, fetchPointSnapshot, fetchPointSpecies, fetchSavedPointSpecies } from '../../services/observatoryService'
import { speciesRange } from '../../lib/chartData'
import { forestIcon, forestParts } from '../../lib/habitat'
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
  // One column (under lg): the corner's card goes first, above the filter pills and the species filter
  const single = !useMediaQuery('(min-width: 1024px)')
  const [filterOpen, setFilterOpen] = useState(false) // below lg the species filter is a button with a dropdown above the thermometer
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
  const mainForest = forestParts(habitat, t)[0]?.key
  // The subtitle of the zone: place · coordinates · altitude · kind of terrain, each with its icon.
  // (The coordinates are the title when there is no toponym, so they are not repeated.)
  const facts = [
    { key: 'place', icon: 'location', text: d?.toponym?.comarca },
    { key: 'coords', icon: 'crosshair', text: d?.toponym ? formatCoords(point) : null },
    { key: 'elevation', icon: 'mountain', text: Number.isFinite(elevation) ? `${Math.round(elevation)} m` : null },
    {
      key: 'terrain',
      icon: forestIcon(mainForest) ? `forest-type-${forestIcon(mainForest)}` : null,
      text: hasForest ? [t.obsForestYes, macro].filter(Boolean).join(' · ') : null,
    },
  ].filter(f => f.text)

  return (
    <section aria-label={t.obsObservedTitle} className="space-y-4">
      <SavePointControls
        point={point}
        suggestedName={d?.toponym?.name ?? d?.toponym?.label}
        saved={saved}
        lead={action => (
          <>
            <p className="text-[11px] uppercase tracking-[1.4px] font-medium text-coffee-light">{t.obsObservedTitle}</p>
            {/* The save button is the `action`, to the right of the title (heart only on a phone); items-center keeps it level with the title */}
            <div className="flex items-center justify-between gap-3 mt-1">
              <h2 data-testid="zone-title" className="min-w-0 font-display font-bold text-[clamp(38px,5vw,56px)] leading-[1.02] tracking-[0.3px] text-cream break-words">{title}</h2>
              {action}
            </div>
            <p data-testid="zone-facts" className="text-[13px] text-cream/70 mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
              {facts.map((f, i) => (
                <span key={f.key} className="inline-flex items-center gap-1.5">
                  {i > 0 && <span aria-hidden="true" className="mr-0.5">·</span>}
                  {f.icon === 'crosshair'
                    ? <Crosshair size={14} strokeWidth={1.75} aria-hidden="true" />
                    : f.icon && <img src={`/assets/images/icons/${f.icon}.png`} alt="" height="14" width="14" />}
                  {f.text}
                </span>
              ))}
            </p>
          </>
        )}
      />

      {hasForest === false && (
        <p role="note" className="rounded-xl glass-warm px-4 py-3 text-sm text-cream/90">{t.obsForestNo}</p>
      )}

      <PointHabitat habitat={habitat} />

      {single && (
        <CornerCard point={point} saved={saved} onOpenList={onOpenList} suggestedName={d?.toponym?.name ?? d?.toponym?.label} toponym={d?.toponym} onRemoved={onRemoved} />
      )}

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
      <div className="grid gap-4 grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_clamp(20rem,30%,30rem)] items-start">
        <div className="space-y-4 min-w-0">
          {/* Where the page is one column (under lg) the species filter is this button with the panel as its dropdown, above the thermometer; from lg up it is the card of the right column.
              (Drawn only then, not hidden with CSS: a hidden first child would still give the thermometer the column's top margin.) */}
          {single && (
          <div>
            <button
              type="button"
              onClick={() => setFilterOpen(o => !o)}
              aria-expanded={filterOpen}
              aria-controls="obs-sp-dropdown"
              className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl glass obs-btn text-cream text-sm font-medium hover:[background-color:var(--ui-surface-hover)] transition-all"
            >
              <span className="flex items-center gap-2 min-w-0">
                <span aria-hidden="true" className="shrink-0">{IC.filter}</span>
                <span className="shrink-0">{t.obsSpFilterBtn}</span>
                {chosenName && <span className="truncate text-cream/60 font-normal">· {chosenName}</span>}
              </span>
              <ChevronDown size={18} aria-hidden="true" className={`shrink-0 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
            </button>
            {filterOpen && (
              <div id="obs-sp-dropdown" className="mt-2">
                <SpeciesPanel
                  state={speciesList}
                  selected={speciesId}
                  // Choosing closes the dropdown so the thermometer below shows the change
                  onSelect={id => { setSpeciesId(id); setFilterOpen(false); onSpeciesPick?.() }}
                />
              </div>
            )}
          </div>
          )}
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
          {!single && <CornerCard point={point} saved={saved} onOpenList={onOpenList} suggestedName={d?.toponym?.name ?? d?.toponym?.label} toponym={d?.toponym} onRemoved={onRemoved} />}
          {!single && <SpeciesPanel
            state={speciesList}
            selected={speciesId}
            // Choosing (or unchoosing) a species re-asks the thermometer and the cards: bring the
            // top of the zone into view so the person sees them change
            onSelect={id => { setSpeciesId(id); onSpeciesPick?.() }}
          />}
          {events}
        </div>
      </div>
        )}
      </ChartSection>

      {/* From 1440 px up the forecast and the calendar sit side by side */}
      <div className="grid gap-4 grid-cols-[minmax(0,1fr)] min-[1440px]:grid-cols-2 items-start">
        <ForecastSection point={point} zoneName={title} />

        <CalendarSection cal={calendar} speciesName={activeName} />
      </div>
    </section>
  )
}
