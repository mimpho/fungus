import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Maximize, Minimize } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import { useObservatoryView } from '../hooks/useObservatoryView'
import { useSavedPoints } from '../hooks/useSavedPoints'
import { useIsPhone, useIsWide } from '../hooks/useIsPhone'
import { useMapNavigation, TABS } from '../hooks/useMapNavigation'
import { useMapBusy } from '../hooks/useMapBusy'
import { ALL_EXCELLENT, useProbabilityLayer } from '../hooks/useProbabilityLayer'
import { pixelElevation, pixelScore, reliefGrid } from '../lib/reliefLayer'
import { useElevationRasterState } from '../hooks/useElevationRaster'
import { useClassRasterState } from '../hooks/useClassRaster'
import { useSpecies } from '../hooks/useSpecies'
import { isInCatalonia } from '../lib/catalonia'
import { samePoint } from '../lib/observatoryView'
import { DEFAULT_METEO_LAYER, DEFAULT_RAIN_PRESET } from '../lib/meteoLayers'
import { ObservatoryMap } from '../components/observatory/ObservatoryMap'
import { MapSearch } from '../components/observatory/MapSearch'
import { FOREST_TYPES } from '../lib/forestLayer'
import { SpeciesLayerPicker } from '../components/observatory/SpeciesLayerPicker'
import { layerDays } from '../components/observatory/LayerDayControl'
import { MeteoPanel } from '../components/observatory/nav/MeteoPanel'
import { ZonasPanel } from '../components/observatory/nav/ZonasPanel'
import { BosquePanel } from '../components/observatory/nav/BosquePanel'
import { ObservedZone } from '../components/observatory/ObservedZone'
import { TerritorySection } from '../components/observatory/TerritorySection'
import { SavedPointsList } from '../components/observatory/SavedPoints'
import { ObsModal, isDialogAbove } from '../components/observatory/ObsModal'
import { PointPanel } from '../components/observatory/PointPanel'
import { TabRail } from '../components/observatory/nav/TabRail'
import { NavPanel } from '../components/observatory/nav/NavPanel'
import { ViewButton, ViewPanel, ZoomButtons } from '../components/observatory/nav/ViewControls'
import { MapLoadingBar } from '../components/observatory/nav/MapLoadingBar'
import { PhoneTabBar } from '../components/observatory/nav/PhoneTabBar'

const BASEMAPS = ['satellite', 'streets', 'relief']
const NAV_PANEL_ID = 'obs-nav-panel'
const VIEW_PANEL_ID = 'obs-view-panel'
const TAB_TITLE = { data: 'obsTabMeteo', zones: 'obsTabZones', forest: 'obsTabForest' }
// Desktop: what a panel covers at the right of the map (rail 16 + 76, gap 12, panel 360, margin 16)
const PANEL_CLEAR_PX = 480
// Zonas · «Mis rincones» checkbox and Bosque's checked classes, remembered in this browser (the Zonas switch keeps
// `fungus-obs-corners`, see useMapNavigation)
const CORNERS_ROW_KEY = 'fungus-obs-zones-corners'
const FOREST_CLASSES_KEY = 'fungus-obs-forest-classes'
const ALL_FOREST = FOREST_TYPES.map(f => f.key)

function storedCornersRow() {
  try { return localStorage.getItem(CORNERS_ROW_KEY) !== 'off' } catch (_e) { return true }
}

// Stored as a JSON list of class keys; unknown keys are dropped, anything unreadable means all classes
function storedForestClasses() {
  try {
    const list = JSON.parse(localStorage.getItem(FOREST_CLASSES_KEY))
    if (Array.isArray(list)) return new Set(list.filter(k => ALL_FOREST.includes(k)))
  } catch (_e) { /* fall back to all */ }
  return new Set(ALL_FOREST)
}

function store(key, value) {
  try { localStorage.setItem(key, value) } catch (_e) { /* per-viewer convenience only */ }
}

/**
 * /observatorio — the Observatory of any point in Catalonia (login required). The map is the page:
 * it fills the viewport under the header (Layout gives this route the full width).
 * Built in steps (see memory/pending.md, item 6). The view state (the observed point) lives in
 * the URL; the point just picked on the map, still without observing it, is local.
 */
export default function Observatory() {
  const { t, isAuthenticated, authLoading, setAuthModal } = useApp()
  const { point: observed, until, days, initialMeteo, observe, clear, setWindow, setMeteo } = useObservatoryView()
  const saved = useSavedPoints(isAuthenticated)
  // A page opened on a point (URL) starts with that point's panel on the map
  const [pending, setPending] = useState(() => (observed ? { lat: observed.lat, lon: observed.lon } : null))
  const [flyTo, setFlyTo] = useState(null)
  const [savedOpen, setSavedOpen] = useState(false)
  // The map's navigation: tabs Meteo / Zonas / Bosque, each with a switch remembered in this browser, and
  // one panel open at a time (memory/observatory-navigation-plan.md, T1). First visit: Meteo on, Zonas on
  // if the user has corners, Bosque off.
  // A link with a Meteo layer (`capa`) turns Meteo on, whatever this browser stored
  const nav = useMapNavigation({ hasCorners: saved.points.length > 0, cornersReady: saved.status === 'ready', dataFromUrl: Boolean(initialMeteo) })
  // Meteo: one data layer at a time (Condiciones; Lluvia, Temperatura and Viento are placeholders until
  // epic/observatory-meteo). The day is shared by every layer. Switching Meteo off hides it but remembers
  // the layer, the species and the day. Opened from a link, they come from the URL.
  const meteoOn = nav.on.data
  const [meteoKind, setMeteoKind] = useState(initialMeteo?.layer ?? DEFAULT_METEO_LAYER)
  const [rainPreset, setRainPreset] = useState(DEFAULT_RAIN_PRESET)
  // Probability layer (Meteo · Condiciones): one species at a time (null = the mean of the excellent ones)
  const probabilityOn = meteoOn && meteoKind === 'conditions'
  const [layerSpecies, setLayerSpecies] = useState(initialMeteo?.species ?? null)
  const [layerDate, setLayerDate] = useState(initialMeteo?.day ?? null) // null = last day with data
  // Zonas: the switch draws the checked rows; only «Mis rincones» exists for now
  const [cornersRow, setCornersRowState] = useState(storedCornersRow)
  const setCornersRow = value => { setCornersRowState(value); store(CORNERS_ROW_KEY, value ? 'on' : 'off') }
  const cornersOn = nav.on.zones && cornersRow
  // Forest type layer (Bosque): the forest raster by dominant type; the panel's checkboxes say which classes show
  const forestOn = nav.on.forest
  const [forestShown, setForestShownState] = useState(storedForestClasses)
  const setForestShown = next => { setForestShownState(next); store(FOREST_CLASSES_KEY, JSON.stringify(ALL_FOREST.filter(k => next.has(k)))) }
  const shownSpecies = probabilityOn ? layerSpecies : null
  const { species: catalog } = useSpecies()
  // A species the catalogue does not have (an old or mistyped link) is dropped without a notice: the
  // layer falls back to the mean of the excellent ones
  useEffect(() => {
    if (layerSpecies && catalog?.length && !catalog.some(x => x.id === layerSpecies)) setLayerSpecies(null)
  }, [catalog, layerSpecies])
  // The URL says what Meteo shows while it is on (history replaced: Back does not walk through the days)
  useEffect(() => {
    setMeteo(meteoOn ? { layer: meteoKind, species: layerSpecies, day: layerDate } : null)
  }, [meteoOn, meteoKind, layerSpecies, layerDate, setMeteo])
  const speciesLabel = id => {
    const s = (catalog ?? []).find(x => x.id === id)
    return s?.commonNames?.[0] || s?.scientificName || ''
  }
  // Switched on without a species: the mean of the excellent edibles that grow at each point
  // The layer's data is also loaded (not drawn) while a point is picked with the layer off: the
  // point's summary always shows the probability, the mean of the excellent edibles if no species is chosen
  const layerId = probabilityOn ? (layerSpecies ?? ALL_EXCELLENT) : pending ? ALL_EXCELLENT : null
  const layer = useProbabilityLayer(isAuthenticated ? layerId : null, { date: layerDate ?? undefined })
  const chooseLayerSpecies = id => { setLayerSpecies(id); setLayerDate(null) }
  const elevationState = useElevationRasterState(Boolean(layerId) && isAuthenticated)
  const forestState = useClassRasterState('forest', (Boolean(layerId) || forestOn) && isAuthenticated)
  const substrateState = useClassRasterState('substrate', Boolean(layerId) && isAuthenticated)
  const elevation = elevationState.raster
  const forest = forestState.raster
  const substrate = substrateState.raster
  const habitat = useMemo(() => ({ forest, substrate }), [forest, substrate])
  const forestTypes = useMemo(() => (forestOn && forest ? { raster: forest, active: forestShown } : null), [forestOn, forest, forestShown])
  // What the layer paints at the spot picked on the map ({ score, count }; null = nothing there)
  const layerValue = useMemo(() => {
    const data = layer.data
    // wait for the relief: without it the value would be the flat mean of the cells, then jump
    if (!pending || !elevation || !data?.cells?.length || layer.status === 'loading') return undefined
    try {
      return pixelScore(reliefGrid(elevation, data.cells), data, habitat, pending.lat, pending.lon)
    } catch (_e) { return undefined }
  }, [pending, layer.data, layer.status, elevation, habitat])
  // The point's height from the map's own relief, for when the elevation service gives none
  const pendingElevation = useMemo(() => {
    if (!pending || !elevation || !layer.data?.cells?.length) return null
    try { return pixelElevation(reliefGrid(elevation, layer.data.cells), pending.lat, pending.lon) } catch (_e) { return null }
  }, [pending, elevation, layer.data])
  // The map is the page. An observed zone is a layer over the whole screen (the header too), like a full-screen dialog:
  // it is open while the URL has the point. Its cross closes it (the point leaves the URL) and the point's card stays on the
  // map, with «Observar», which opens the zone again from scratch. The map stays mounted and untouched under the layer.
  const phone = useIsPhone()
  const wide = useIsWide() // from 1024px the point card and a map panel fit side by side
  const [mapInst, setMapInst] = useState(null) // the Leaflet map, for the desktop zoom buttons
  const [drawing, setDrawing] = useState(false) // the map is working out a layer's picture
  const layerOpen = Boolean(observed) && isAuthenticated
  const [headerSlot, setHeaderSlot] = useState(null) // where the zone puts its title: the header of the layer
  const [filtersSlot, setFiltersSlot] = useState(null) // and its active filters: a bar under that header, so they stay in view while the zone scrolls
  // The bar of filters is fixed under the header once the zone scrolls up to it; only then do its pills get a shadow
  const [filtersStuck, setFiltersStuck] = useState(false)
  const layerHeaderRef = useRef(null)
  const sentinelRef = useRef(null)
  useEffect(() => {
    const head = layerHeaderRef.current
    const sentinel = sentinelRef.current
    const scroller = sentinel?.closest('.overflow-y-auto')
    if (!layerOpen || !head || !sentinel || !scroller) return undefined
    // Stuck = the sentinel (just above the bar) has gone up behind the header
    const check = () => setFiltersStuck(sentinel.getBoundingClientRect().top < head.getBoundingClientRect().bottom - 1)
    check()
    scroller.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    return () => { scroller.removeEventListener('scroll', check); window.removeEventListener('resize', check) }
  }, [layerOpen, observed?.lat, observed?.lon]) // eslint-disable-line react-hooks/exhaustive-deps
  // Phone only: the map over the whole screen (the site's header too) and, where the browser allows it, the browser's own
  // fullscreen (iPhone Safari has none: there only the header goes). The state follows the browser leaving fullscreen by itself.
  const [fullscreenState, setFullscreenState] = useState(false)
  const fullscreen = fullscreenState && phone
  const [sheetH, setSheetH] = useState(0) // height of the point's sheet on the phone, for the map to keep the point above it
  const [barH, setBarH] = useState(0) // height the phone's tab bar covers (with a tab's sheet open, the sheet too)
  const [barRestH, setBarRestH] = useState(0) // the bar alone: the map's own controls at the bottom (zoom, credits) sit above it
  const nativeFullscreen = () => document.fullscreenElement || document.webkitFullscreenElement
  function enterFullscreen() {
    setFullscreenState(true)
    const el = document.documentElement
    const request = el.requestFullscreen ?? el.webkitRequestFullscreen
    try { request?.call(el)?.catch?.(() => {}) } catch (_e) { /* the page-level fullscreen is enough */ }
  }
  function exitFullscreen() {
    setFullscreenState(false)
    if (!nativeFullscreen()) return
    const exit = document.exitFullscreen ?? document.webkitExitFullscreen
    try { exit?.call(document)?.catch?.(() => {}) } catch (_e) { /* already out */ }
  }
  useEffect(() => {
    const onChange = () => { if (!nativeFullscreen()) setFullscreenState(false) }
    document.addEventListener('fullscreenchange', onChange)
    document.addEventListener('webkitfullscreenchange', onChange)
    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      document.removeEventListener('webkitfullscreenchange', onChange)
    }
  }, [])
  // The page behind must not scroll under the full-screen map or the zone's layer
  useEffect(() => {
    if (!fullscreen && !layerOpen) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [fullscreen, layerOpen])
  const [basemap, setBasemap] = useState(() => {
    try {
      const saved = localStorage.getItem('fungus-obs-basemap')
      return BASEMAPS.includes(saved) ? saved : 'satellite'
    } catch (_e) { return 'satellite' }
  })

  function chooseBasemap(value) {
    setBasemap(value)
    try { localStorage.setItem('fungus-obs-basemap', value) } catch (_e) { /* per-viewer convenience only */ }
  }

  // What the map is waiting for, for the loading bar on its top edge (only layers that are on count)
  const { busy, failed } = useMapBusy(useMemo(() => [
    { id: 'conditions', label: t.obsLayerProbability, on: probabilityOn, loading: layer.status === 'loading', error: layer.status === 'error', retry: layer.retry },
    { id: 'elevation', label: t.obsLayerProbability, on: probabilityOn, loading: elevationState.status === 'loading', error: false },
    { id: 'substrate', label: t.obsLayerProbability, on: probabilityOn, loading: substrateState.status === 'loading', error: false },
    { id: 'forest', label: t.obsTabForest, on: forestOn || probabilityOn, loading: forestState.status === 'loading', error: forestOn && forestState.status === 'error', retry: forestState.retry },
    { id: 'corners', label: t.obsLayerCorners, on: cornersOn, loading: saved.status === 'loading', error: saved.status === 'error', retry: saved.reload },
    { id: 'drawing', label: '', on: true, loading: drawing, error: false },
  ], [drawing, t, probabilityOn, forestOn, cornersOn, layer.status, layer.retry, elevationState.status, substrateState.status, forestState.status, forestState.retry, saved.status, saved.reload]))

  // A tab or Vista opens its panel. Below 1024px the point card and a panel take turns; on the phone
  // (one sheet at a time) opening a tab's sheet or Vista also drops the picked point.
  function toggleNav(tab) {
    if (!wide && nav.openTab !== tab) setPending(null)
    nav.toggleTab(tab)
  }

  // Esc, one layer at a time: the phone's fullscreen, then the zone's layer, then an open panel, then the point's card
  // (through a ref: the listener must see the current zone)
  const closePanelRef = useRef(() => {})
  const desktopPanel = !phone && nav.openTab
  const anyPanel = Boolean(nav.openTab)
  useEffect(() => {
    if (!pending && !fullscreen && !layerOpen && !anyPanel) return
    const onKey = e => {
      if (e.key !== 'Escape' || isDialogAbove()) return // a dialog on top takes this Esc
      if (fullscreen) exitFullscreen()
      else if (layerOpen) closeZone()
      else if (anyPanel) nav.close() // a map panel goes before the point's card
      else closePanelRef.current()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pending, fullscreen, layerOpen, anyPanel]) // eslint-disable-line react-hooks/exhaustive-deps

  // Closing the zone's layer: the point's card stays on the map (the layer was opened from it, or from a link to the point)
  function closeZone() {
    if (observed) setPending({ lat: observed.lat, lon: observed.lon })
    clear()
  }

  function closePanel() {
    setPending(null)
  }
  closePanelRef.current = closePanel

  function handlePick(lat, lon) {
    if (!phone && !wide) nav.close() // below 1024px the point card takes the place of a map panel
    if (!isInCatalonia(lat, lon)) {
      // Outside Catalonia there is nothing to look up (the API would answer 422): the pick is dropped without a notice
      setPending(null)
      return
    }
    setPending({ lat, lon })
  }

  // A tap on the phone's map while a tab's sheet or Vista is open only closes it (a second tap picks the point)
  function handleMapTap(lat, lon) {
    if (phone && nav.openTab) { nav.close(); return }
    handlePick(lat, lon)
  }

  // A search result is a pick that also moves the map to it (on the phone it takes the place of an open sheet)
  function handleSearchSelect(point) {
    if (phone) nav.close()
    handlePick(point.lat, point.lon)
    setFlyTo({ ...point, n: Date.now() })
  }

  function handleObserve(point) {
    // The zone opens on the Meteo day: its window ends there, or on the last day with real data when the
    // day is a forecast one
    const lastReal = layerDays(layer.data).lastDate
    const zoneUntil = probabilityOn && layerDate ? (layerDate > lastReal ? lastReal : layerDate) : undefined
    if (!samePoint(observed, point)) observe(point.lat, point.lon, { until: zoneUntil })
    // The point's card stays on the map under the layer, for when the layer is closed
    setPending({ lat: point.lat, lon: point.lon })
    setSavedOpen(false)
    nav.close() // the zone takes the screen
  }

  // The observed zone: the content of the layer over the map
  const zoneEl = observed && (
    <ObservedZone
      key={`${observed.lat},${observed.lon}`}
      onOpenList={() => setSavedOpen(true)}
      point={observed}
      saved={saved}
      until={until}
      days={days}
      onWindow={setWindow}
      initialSpecies={shownSpecies}
      headerSlot={headerSlot}
      filtersSlot={filtersSlot}
    />
  )
  // Condiciones, the first segment of the Meteo panel. `layerOn`: the layer is on (its data is then on its way or here)
  const conditionsFor = (layerOn, holding = false) => (
    <SpeciesLayerPicker
      speciesId={layerSpecies}
      onChange={chooseLayerSpecies}
      layer={layer}
      date={layerDate}
      forestApplied={Boolean(forest && elevation && (layerSpecies ? layer.data?.species?.forest_classes : layer.data))}
      soilApplied={Boolean(substrate && elevation && (layerSpecies ? layer.data?.species?.substrate_factors : layer.data))}
      onDateChange={setLayerDate}
      layerOn={layerOn}
      holding={holding}
    />
  )
  // A tab's panel, the same on both devices (beside the rail on desktop, in the bar's sheet on the phone)
  const navPanel = (tab, { flat = false, className = '' } = {}) => (
    <NavPanel
      id={NAV_PANEL_ID}
      title={t[TAB_TITLE[tab]]}
      on={nav.on[tab]}
      onSwitch={value => nav.setOn(tab, value)}
      flat={flat}
      className={className}
    >
      {tab === 'data' && (
        <MeteoPanel
          kind={meteoKind}
          onKind={setMeteoKind}
          conditions={conditionsFor(probabilityOn)}
          date={layerDate}
          onDateChange={setLayerDate}
          rainPreset={rainPreset}
          onRainPreset={setRainPreset}
        />
      )}
      {tab === 'zones' && (
        <ZonasPanel
          corners={{
            checked: cornersRow,
            onChange: setCornersRow,
            count: saved.status === 'ready' ? saved.points.length : null,
            onList: () => setSavedOpen(true),
          }}
        />
      )}
      {tab === 'forest' && <BosquePanel active={forestShown} onChange={setForestShown} loaded={Boolean(forest)} />}
    </NavPanel>
  )
  const savedList = <SavedPointsList saved={saved} observed={observed} onSelect={handleObserve} />

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-cream/40 text-sm animate-pulse">{t.cargando}</div>
      </div>
    )
  }

  return (
    // No `anim-up` on the map page: its opacity animation (fill `both`) leaves a stacking context around the page, which
    // traps the fullscreen map (fixed, z-150) under the site's header (z-40). Only the login card fades in.
    <div className={isAuthenticated ? undefined : 'anim-up'}>
      {!isAuthenticated ? (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 pb-20">
          <div className="min-w-0">
            <h2 className="font-display text-4xl font-semibold text-cream">{t.obsTitle}</h2>
            <p className="text-muted text-sm mt-1">{t.obsSubtitle}</p>
          </div>
        <section className="glass rounded-2xl p-8 text-center max-w-2xl mx-auto">
          <h3 className="font-display text-2xl text-cream mb-2">{t.obsLoginTitle}</h3>
          <p className="text-cream/60 text-sm mb-6 max-w-sm mx-auto">{t.obsLoginBody}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setAuthModal('register')}
              className="px-6 py-3 rounded-xl bg-bar hover:bg-[#a0834d] text-white text-sm font-medium transition-all"
            >
              {t.registrarse}
            </button>
            <button
              onClick={() => setAuthModal('login')}
              className="px-6 py-3 rounded-xl glass obs-btn text-cream text-sm font-medium hover:[background-color:var(--ui-surface-hover)] transition-all"
            >
              {t.iniciarSesion}
            </button>
          </div>
        </section>
        </div>
      ) : (
        <>
          {/* The map fills the viewport under the header (--header-h is published by Layout) */}
          <div className="h-[calc(100dvh-var(--header-h,5.5rem))] min-h-[420px]">
          <div className={`${fullscreen ? 'fixed inset-0 z-[150]' : 'relative h-full'} isolate overflow-hidden`} style={{ '--obs-bottom-clear': `${phone ? barRestH : 0}px` }}>
            <ObservatoryMap
              observed={observed}
              pending={pending}
              saved={saved.points}
              showSaved={cornersOn}
              pinLabel={t.obsCornerPinLabel}
              layer={probabilityOn ? layer.data : null}
              elevation={elevation}
              habitat={habitat}
              forestTypes={forestTypes}
              onPick={phone ? handleMapTap : handlePick}
              leafletZoom={false}
              onMap={setMapInst}
              onDrawing={setDrawing}
              label={t.obsMapLabel}
              basemap={basemap}
              flyTo={flyTo}
              dataSources={[Boolean(layerId) && 'Open-Meteo', forestOn && 'CREAF'].filter(Boolean).join('|') || null}
              centerAbove={phone ? { top: 72, bottomPx: barH + (pending ? sheetH : 0) } : desktopPanel ? { top: 0, rightPx: PANEL_CLEAR_PX } : null}
              className="h-full"
            />
            {!pending && !observed && !(phone && nav.openTab) && (
              <p style={phone ? { bottom: barRestH + 28 } : undefined} className="absolute z-[1100] bottom-10 left-3 right-3 md:bottom-3 md:right-auto md:max-w-sm map-surface shadow-float rounded-xl px-3 py-2 text-xs text-cream/80 pointer-events-none">
                {t.obsMapHint}
              </p>
            )}
            {/* Phone: the fullscreen at the top, level with the search (44 px, centred on the 52 px search) */}
            {phone && (
              <button
                type="button"
                onClick={fullscreen ? exitFullscreen : enterFullscreen}
                aria-pressed={fullscreen}
                aria-label={fullscreen ? t.obsFullscreenExit : t.obsFullscreenEnter}
                title={fullscreen ? t.obsFullscreenExit : t.obsFullscreenEnter}
                className="absolute z-[1100] top-[16px] right-3 w-[44px] h-[44px] rounded-full map-surface text-cream shadow-float flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-cream/50"
              >
                {fullscreen ? <Minimize size={20} aria-hidden="true" /> : <Maximize size={20} aria-hidden="true" />}
              </button>
            )}
            {/* Desktop: Vista and the zoom at the bottom right; Vista's panel opens to their left. On the phone Vista is the
                tab bar's fourth button and the map is zoomed with the fingers */}
            {!phone && (
              <>
                <div className="absolute z-[1100] right-4 bottom-5 flex flex-col items-end gap-2.5">
                  <ViewButton open={nav.openTab === 'view'} onClick={() => toggleNav('view')} panelId={VIEW_PANEL_ID} />
                  <ZoomButtons map={mapInst} />
                </div>
                {nav.openTab === 'view' && (
                  <div className="absolute z-[1100] right-[104px] bottom-5 w-[360px]">
                    <ViewPanel id={VIEW_PANEL_ID} basemap={basemap} onBasemap={chooseBasemap} onClose={nav.close} />
                  </div>
                )}
              </>
            )}
            {/* Desktop: the tabs at the top right; a panel opens to the left of them */}
            {!phone && (
              <>
                <div className="absolute z-[1100] top-4 right-4">
                  <TabRail openTab={nav.openTab} on={nav.on} onToggle={toggleNav} panelId={NAV_PANEL_ID} />
                </div>
                {TABS.includes(nav.openTab) && (
                  <div className="absolute z-[1100] top-4 right-[104px] w-[360px] max-h-[calc(100%-2rem)] flex">
                    {navPanel(nav.openTab, { className: 'w-full max-h-full overflow-y-auto overscroll-contain' })}
                  </div>
                )}
              </>
            )}
            {/* The conditions panel shows its own error: the map's notice is for when it is closed */}
            <MapLoadingBar busy={busy} failed={failed?.id === 'conditions' && nav.openTab === 'data' ? null : failed} />
            {/* Phone: the tabs as a bar at the bottom; a tab's panel grows out of it as a sheet */}
            {phone && (
              <PhoneTabBar
                openTab={nav.openTab}
                on={nav.on}
                onToggle={toggleNav}
                panelId={NAV_PANEL_ID}
                viewPanelId={VIEW_PANEL_ID}
                renderPanel={tab => (tab === 'view'
                  ? <ViewPanel id={VIEW_PANEL_ID} basemap={basemap} onBasemap={chooseBasemap} onClose={nav.close} flat />
                  : navPanel(tab, { flat: true }))}
                joined={Boolean(pending)}
                onHeight={setBarH}
                onBarHeight={setBarRestH}
              />
            )}
            {/* Desktop: the search never reaches the rail, nor an open panel (rail 16 + 76, panel 12 + 360, gap 12) */}
            <div className={`absolute z-[1100] top-3 left-3 ${phone ? 'right-[64px]' : desktopPanel ? 'right-[488px]' : 'right-[104px]'} pointer-events-none`}>
              <MapSearch onSelect={handleSearchSelect} className={`pointer-events-auto w-full ${phone ? '' : 'max-w-[30rem]'}`} />
            </div>
            {pending && (
              <PointPanel point={pending} saved={saved} layerValue={layerValue} elevationM={pendingElevation} layerSpeciesName={shownSpecies ? speciesLabel(shownSpecies) : null} layerLoading={layerValue === undefined && layer.status !== 'error'} onObserve={handleObserve} onClose={closePanel} sheet={phone} onSheetHeight={setSheetH} sheetBottomPx={phone ? barH : 0} />
            )}
          </div>
          </div>

          {/* The observed zone: a layer over the whole screen (the header too), above the map, which stays mounted under it */}
          {layerOpen && createPortal(
            <div
              key={`${observed.lat},${observed.lon}`}
              role="dialog"
              aria-modal="true"
              aria-label={t.obsTitle}
              className="fixed inset-0 z-[150] overflow-y-auto overscroll-contain bg-modal"
            >
              {/* As tall as the site's header (--header-h, published by Layout), which the layer covers */}
              <div ref={layerHeaderRef} className="sticky top-0 z-10 bg-modal/95 backdrop-blur-sm border-b border-white/[0.06]">
                <div className="max-w-7xl mx-auto h-[var(--header-h,5.5rem)] flex items-center gap-3 px-4">
                  <div ref={setHeaderSlot} className="min-w-0 flex-1" />
                  <button
                    type="button"
                    onClick={closeZone}
                    aria-label={t.obsZoneClose}
                    title={t.obsZoneClose}
                    className="shrink-0 p-2.5 rounded-xl text-cream/70 hover:text-cream hover:bg-white/10 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-cream/40"
                  >
                    <X size={20} aria-hidden="true" />
                  </button>
                </div>
              </div>
              {/* The zone's active filters (species, days): a bar under the header that keeps its place in the page and, when the zone scrolls up to it, stays fixed under the header. No background; its pills have a shadow only while it is fixed */}
              <div ref={sentinelRef} aria-hidden="true" className="h-px -mb-px" />
              <div ref={setFiltersSlot} data-stuck={filtersStuck} className="group sticky top-[calc(var(--header-h,5.5rem)+1px)] z-10 pointer-events-none empty:hidden" />
              <div className="max-w-7xl mx-auto px-4 pt-6 pb-24 space-y-6">
                {zoneEl}
                <p className="text-xs text-cream/50 pt-4 border-t border-white/[0.06]">{t.obsDisclaimer}</p>
              </div>
            </div>,
            document.body,
          )}

          {/* What is below the map keeps the site's width */}
          <div className="max-w-7xl mx-auto px-4 pt-8 pb-20">
            <TerritorySection active={observed} onObserve={handleObserve} />
          </div>
        </>
      )}

      {savedOpen && (
        <ObsModal title={t.obsSavedListTitle} onClose={() => setSavedOpen(false)} wide sheet>
          {savedList}
        </ObsModal>
      )}
    </div>
  )
}
