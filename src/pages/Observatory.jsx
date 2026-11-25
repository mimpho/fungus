import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useOutletContext } from 'react-router-dom'
import { isIosApp, useAppFullscreen } from '../hooks/useImmersive'
import { X } from 'lucide-react'
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
import { useActiveSpecies } from '../hooks/useActiveSpecies'
import { useHeldWhile } from '../hooks/useHeldWhile'
import { isInCatalonia } from '../lib/catalonia'
import { samePoint } from '../lib/observatoryView'
import { DEFAULT_METEO_LAYER, DEFAULT_RAIN_PRESET } from '../lib/meteoLayers'
import { ObservatoryMap } from '../components/observatory/ObservatoryMap'
import { MapSearchBar } from '../components/observatory/MapSearchBar'
import { FOREST_TYPES } from '../lib/forestLayer'
import { SpeciesLayerPicker } from '../components/observatory/SpeciesLayerPicker'
import { layerDays } from '../components/observatory/LayerDayControl'
import { MapFilterStrip } from '../components/observatory/MapFilterStrip'
import { todayIso } from '../lib/layerDays'
import { formatDay } from '../lib/thermometer'
import { MeteoPanel } from '../components/observatory/nav/MeteoPanel'
import { ZonasPanel } from '../components/observatory/nav/ZonasPanel'
import { HabitatPanel } from '../components/observatory/nav/HabitatPanel'
import { ObservedZone } from '../components/observatory/ObservedZone'
import { SavedPointsList } from '../components/observatory/SavedPoints'
import { ObsModal, isDialogAbove } from '../components/observatory/ObsModal'
import { PointPanel } from '../components/observatory/PointPanel'
import { TabRail } from '../components/observatory/nav/TabRail'
import { NavPanel } from '../components/observatory/nav/NavPanel'
import { LocateButton, ViewButton, ViewPanel, ZoomButtons } from '../components/observatory/nav/ViewControls'
import { MapLoadingBar } from '../components/observatory/nav/MapLoadingBar'
import { SpeciesSheet } from '../components/observatory/speciesSheet/SpeciesSheet'
import { PhoneTabBar, SHEET_MS } from '../components/observatory/nav/PhoneTabBar'

const BASEMAPS = ['satellite', 'streets', 'relief']
const NAV_PANEL_ID = 'obs-nav-panel'
const VIEW_PANEL_ID = 'obs-view-panel'
const TAB_TITLE = { data: 'obsTabMeteo', zones: 'obsTabZones', habitat: 'obsTabHabitat' }
// Desktop: what a panel covers at the right of the map (rail 16 + 76, gap 12, panel 360, margin 16)
const PANEL_CLEAR_PX = 480
const HINT_MS = 6000 // how long «Haz clic en el mapa…» stays
const HINT_FADE_MS = 1500 // and how long it takes to fade out
// Zonas · «Mis rincones» checkbox and Bosque's checked classes, remembered in this browser (the Zonas switch keeps
// `fungus-obs-corners`, see useMapNavigation)
const CORNERS_ROW_KEY = 'fungus-obs-zones-corners'
const FOREST_CLASSES_KEY = 'fungus-obs-forest-classes'
const ALL_FOREST = FOREST_TYPES.map(f => f.key)
// Hábitat's segment: the forest classes or the chosen species' habitat
const HABITAT_VIEW_KEY = 'fungus-obs-habitat-view'
function storedHabitatView() {
  try { return localStorage.getItem(HABITAT_VIEW_KEY) === 'species' ? 'species' : 'forest' } catch (_e) { return 'forest' }
}

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

// In fullscreen the map reaches the very top of the screen, under the phone's camera hole or notch: the search bar (and the hint
// under it) start below the safe area (`viewport-fit=cover` makes env() real), and never closer than 76px to the top edge: for the
// browsers that report no inset in fullscreen, and because the floating menu button sits above the search. `offset` is the usual distance from the map's top (12 for the bar, 80 for the hint).
function fullscreenTop(offset) {
  return {
    top: `max(calc(var(--safe-top) + ${offset}px), ${offset + 64}px)`,
    left: 'max(12px, calc(env(safe-area-inset-left, 0px) + 12px))',
    right: 'max(12px, calc(env(safe-area-inset-right, 0px) + 12px))',
  }
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
  const { t, lang, isAuthenticated, authLoading, setAuthModal } = useApp()
  const { point: observed, until, days, initialMeteo, initialSpecies, observe, clear, setWindow, setMeteo, setSpecies: writeSpecies } = useObservatoryView()
  const saved = useSavedPoints(isAuthenticated)
  // A page opened on a point (URL) starts with that point's panel on the map
  const [pending, setPending] = useState(() => (observed ? { lat: observed.lat, lon: observed.lon } : null))
  const [flyTo, setFlyTo] = useState(null)
  // «Haz clic en el mapa…»: once per visit, for HINT_MS or until the map is used
  const [hintOn, setHintOn] = useState(true)
  const [hintGone, setHintGone] = useState(false) // taken out of the page once it has faded
  useEffect(() => {
    const timer = setTimeout(() => setHintOn(false), HINT_MS)
    return () => clearTimeout(timer)
  }, [])
  useEffect(() => {
    if (hintOn) return undefined
    const timer = setTimeout(() => setHintGone(true), HINT_FADE_MS + 100)
    return () => clearTimeout(timer)
  }, [hintOn])
  const [savedOpen, setSavedOpen] = useState(false)
  // The map's navigation: tabs Meteo / Zonas / Bosque, each with a switch remembered in this browser, and
  // one panel open at a time (memory/observatory-navigation-plan.md, T1). First visit: Meteo on, Zonas on
  // if the user has corners, Bosque off.
  // A link with a Meteo layer (`capa`) turns Meteo on, whatever this browser stored
  const nav = useMapNavigation({ hasCorners: saved.points.length > 0, cornersReady: saved.status === 'ready', dataFromUrl: Boolean(initialMeteo) })
  useEffect(() => { if (pending || observed || nav.openTab) setHintOn(false) }, [pending, observed, nav.openTab])
  // Meteo: one data layer at a time (Condiciones; Lluvia, Temperatura and Viento are placeholders until
  // epic/observatory-meteo). The day is shared by every layer. Switching Meteo off hides it but remembers
  // the layer, the species and the day. Opened from a link, they come from the URL.
  const meteoOn = nav.on.data
  const [meteoKind, setMeteoKind] = useState(initialMeteo?.layer ?? DEFAULT_METEO_LAYER)
  const [rainPreset, setRainPreset] = useState(DEFAULT_RAIN_PRESET)
  // Probability layer (Meteo · Condiciones): one species at a time (null = the mean of the excellent ones)
  const probabilityOn = meteoOn && meteoKind === 'conditions'
  // The species is the whole map's (the search bar's second half, `seta` in the URL), not Meteo's: it stays with Meteo off
  const { speciesId: layerSpecies, setSpecies: setLayerSpecies } = useActiveSpecies({ initial: initialSpecies, onChange: writeSpecies })
  // The observed zone is a layer over the whole screen, open while the URL has the point. It shares the active species with the map
  // (it reads and writes the same one), but the map under it does not follow it: it keeps the species it had when the zone opened
  // and takes the final one when the zone closes, so it is not repainted for every change made up there. Nothing else of the map
  // changes with the zone (Meteo stays on or off as it was): the species is only a lens there
  const zoneOpen = Boolean(observed) && isAuthenticated
  const mapSpecies = useHeldWhile(zoneOpen, layerSpecies)
  const [layerDate, setLayerDate] = useState(initialMeteo?.day ?? null) // null = last day with data
  // Zonas: the switch draws the checked rows; only «Mis rincones» exists for now
  const [cornersRow, setCornersRowState] = useState(storedCornersRow)
  const setCornersRow = value => { setCornersRowState(value); store(CORNERS_ROW_KEY, value ? 'on' : 'off') }
  const cornersOn = nav.on.zones && cornersRow
  // Forest type layer (Bosque): the forest raster by dominant type; the panel's checkboxes say which classes show
  const forestOn = nav.on.habitat
  const [forestShown, setForestShownState] = useState(storedForestClasses)
  const setForestShown = next => { setForestShownState(next); store(FOREST_CLASSES_KEY, JSON.stringify(ALL_FOREST.filter(k => next.has(k)))) }
  const shownSpecies = mapSpecies
  const { species: catalog } = useSpecies()
  // Hábitat · De la seta: stored «species» without an active species behaves as «forest». While it is shown, neither the
  // conditions picture nor the forest classes are drawn (they would read as one map on the same scale)
  const [habitatViewStored, setHabitatViewStored] = useState(storedHabitatView)
  const habitatView = layerSpecies ? habitatViewStored : 'forest'
  // Picking «De la seta» turns Meteo off: its Condiciones would be hidden by the habitat (same scale)
  const setHabitatView = value => { setHabitatViewStored(value); store(HABITAT_VIEW_KEY, value); if (value === 'species') nav.setOn('data', false) }
  const habitatShown = forestOn && habitatView === 'species'
  // The map's filter strip: the Meteo day while it is on and is not today (nothing to say when it is)
  const dayFilter = meteoOn && layerDate && layerDate !== todayIso() ? formatDay(layerDate, lang) : null
  // The URL says what Meteo shows while it is on (history replaced: Back does not walk through the days)
  useEffect(() => {
    setMeteo(meteoOn ? { layer: meteoKind, day: layerDate } : null)
  }, [meteoOn, meteoKind, layerDate, setMeteo])
  const speciesLabel = id => {
    const s = (catalog ?? []).find(x => x.id === id)
    return s?.commonNames?.[0] || s?.scientificName || ''
  }
  // Switched on without a species: the mean of the excellent edibles that grow at each point
  // The layer's data is also loaded (not drawn) while a point is picked with the layer off: the
  // point's summary always shows the probability, the mean of the excellent edibles if no species is chosen
  // Applying a species switches Condiciones on (the species is shown through it): Meteo on and its Condiciones segment
  const showConditions = () => { if (!nav.on.data) nav.setOn('data', true); if (meteoKind !== 'conditions') setMeteoKind('conditions') }
  // With «De la seta» shown the species is being looked at there: Meteo stays as it is
  const chooseSpecies = id => { setLayerSpecies(id); if (id && !habitatShown) showConditions() }
  const layerId = probabilityOn || pending || habitatShown ? (mapSpecies ?? ALL_EXCELLENT) : null
  const layer = useProbabilityLayer(isAuthenticated ? layerId : null, { date: layerDate ?? undefined })
  const elevationState = useElevationRasterState(Boolean(layerId) && isAuthenticated)
  const forestState = useClassRasterState('forest', (Boolean(layerId) || forestOn) && isAuthenticated)
  const substrateState = useClassRasterState('substrate', Boolean(layerId) && isAuthenticated)
  const elevation = elevationState.raster
  const forest = forestState.raster
  const substrate = substrateState.raster
  const habitat = useMemo(() => ({ forest, substrate }), [forest, substrate])
  const forestTypes = useMemo(() => (forestOn && !habitatShown && forest ? { raster: forest, active: forestShown } : null), [forestOn, habitatShown, forest, forestShown])
  // The habitat picture waits for the layer's species block, the elevation and the forest raster; the soil may fail (the map then
  // counts altitude and forest, and says so). A species with nothing to judge by shows a line instead.
  const speciesBlock = !Array.isArray(layer.data?.species) ? layer.data?.species : null
  const habitatReady = habitatShown && Boolean(speciesBlock && elevation && forest && (substrate || substrateState.status === 'error'))
  const habitatMap = useMemo(() => (habitatReady ? { elevation, species: speciesBlock, rasters: { forest, substrate } } : null), [habitatReady, elevation, speciesBlock, forest, substrate])
  const habitatInfo = habitatShown ? {
    status: !habitatReady ? 'loading'
      : speciesBlock.elevation_min_m == null && !speciesBlock.forest_classes && !speciesBlock.substrate_factors ? 'noinfo' : 'ready',
    noForest: habitatReady && !speciesBlock.forest_classes,
    noSoil: habitatReady && !substrate,
  } : null
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
    if (!zoneOpen || !head || !sentinel || !scroller) return undefined
    // Stuck = the sentinel (just above the bar) has gone up behind the header
    const check = () => setFiltersStuck(sentinel.getBoundingClientRect().top < head.getBoundingClientRect().bottom - 1)
    check()
    scroller.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    return () => { scroller.removeEventListener('scroll', check); window.removeEventListener('resize', check) }
  }, [zoneOpen, observed?.lat, observed?.lon]) // eslint-disable-line react-hooks/exhaustive-deps
  // The map over the whole screen (the site's header too) and, where the browser allows it, the browser's own
  // fullscreen (iPhone Safari has none: there only the header goes). The state follows the browser leaving fullscreen by itself.
  // Starts on when the browser is already in fullscreen (the page was left through the menu and opened again)
  const [fullscreenState, setFullscreenState] = useState(() => Boolean(document.fullscreenElement || document.webkitFullscreenElement))
  // The installed app opens in fullscreen: the map is laid out so from the start, with no switch to turn it off
  const appFullscreen = useAppFullscreen()
  const fullscreen = fullscreenState || appFullscreen
  // The phone's fullscreen reaches under the camera hole (see fullscreenTop). In the iPhone's installed app the status bar
  // stays, so there fullscreen is laid out as the app without it
  const safeTop = fullscreen && phone && !isIosApp()
  const { noHeader, setMapState } = useOutletContext()
  useEffect(() => { setMapState({ fullscreen, covered: Boolean(zoneOpen) }) }, [fullscreen, zoneOpen, setMapState])
  useEffect(() => () => setMapState({ fullscreen: false, covered: false }), [setMapState])
  const [speciesH, setSpeciesH] = useState(0) // the species' bar (or card) on the phone: the point's sheet rides above it
  // The point's sheet folds when another sheet is unfolded, and only unfolds when it is itself tapped (or a new point is picked)
  const [pointFolded, setPointFolded] = useState(false)
  const [sheetH, setSheetH] = useState(0) // height of the point's sheet on the phone, for the map to keep the point above it
  const [barH, setBarH] = useState(0) // height the phone's tab bar covers (with a tab's sheet open, the sheet too)
  // The phone's «My location»: 32 px above the top of whatever the bottom holds. The point's sheet and the species' bar are a stack that rises
  // from 24 px under the tab bar's top (they overlap it), so with either of them its top is 24 px lower than the bar's plus their heights
  const onStack = speciesH > 24 || Boolean(pending)
  const bothSheets = speciesH > 24 && Boolean(pending) // the species' bar then overlaps the foot of the point's sheet by 24 px
  const locateBottom = (onStack ? Math.max(0, barH - 24) : barH) + (speciesH > 24 ? speciesH : 0) + (pending ? sheetH : 0) - (bothSheets ? 24 : 0) + 32
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
  // The map page does not scroll: the map is the page (a drag from the header would otherwise move it up on a phone), and what
  // is behind the full-screen map or the zone's layer must not scroll either. The login card (not signed in) scrolls as usual
  useEffect(() => {
    if (!isAuthenticated && !fullscreen && !zoneOpen) return undefined
    const previous = document.body.style.overflow
    const previousOverscroll = document.documentElement.style.overscrollBehavior
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overscrollBehavior = 'none'
    return () => {
      document.body.style.overflow = previous
      document.documentElement.style.overscrollBehavior = previousOverscroll
    }
  }, [isAuthenticated, fullscreen, zoneOpen])
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

  // On the phone the sheet folds in SHEET_MS and changing the base map keeps the thread busy: switch it once the fold is done,
  // or the sheet stays half-folded (labels clipped) while the tiles load
  const foldTimer = useRef(null)
  useEffect(() => () => clearTimeout(foldTimer.current), [])
  function chooseBasemapAfterFold(value) {
    clearTimeout(foldTimer.current)
    foldTimer.current = setTimeout(() => chooseBasemap(value), SHEET_MS + 40)
  }
  // The fullscreen switch of the phone's Vista sheet: the sheet folds first, then the page changes (the same reason)
  function setFullscreenAfterFold(on) {
    nav.close()
    clearTimeout(foldTimer.current)
    foldTimer.current = setTimeout(() => (on ? enterFullscreen() : exitFullscreen()), SHEET_MS + 40)
  }

  // What the map is waiting for, for the loading bar on its top edge (only layers that are on count)
  const { busy, failed } = useMapBusy(useMemo(() => [
    { id: 'conditions', label: t.obsLayerProbability, on: probabilityOn || habitatShown, loading: layer.status === 'loading', error: layer.status === 'error', retry: layer.retry },
    { id: 'elevation', label: t.obsLayerProbability, on: probabilityOn || habitatShown, loading: elevationState.status === 'loading', error: false },
    { id: 'substrate', label: t.obsLayerProbability, on: probabilityOn || habitatShown, loading: substrateState.status === 'loading', error: false },
    { id: 'forest', label: t.obsTabHabitat, on: forestOn || probabilityOn, loading: forestState.status === 'loading', error: forestOn && forestState.status === 'error', retry: forestState.retry },
    { id: 'corners', label: t.obsLayerCorners, on: cornersOn, loading: saved.status === 'loading', error: saved.status === 'error', retry: saved.reload },
    { id: 'drawing', label: '', on: true, loading: drawing, error: false },
  ], [drawing, t, probabilityOn, habitatShown, forestOn, cornersOn, layer.status, layer.retry, elevationState.status, substrateState.status, forestState.status, forestState.retry, saved.status, saved.reload]))

  // A tab or Vista opens its panel. Below 1024px the point card and a panel take turns; on the phone
  // (one sheet at a time) opening a tab's sheet or Vista also drops the picked point.
  // On the phone the sheets work as an accordion: only one is unfolded. A tab's sheet folds the point's sheet and the species' card
  // (they stay in view, folded); unfolding one of them closes the tab's sheet. Wider screens take turns instead.
  const [speciesCloseSignal, setSpeciesCloseSignal] = useState(0)
  function toggleNav(tab) {
    if (nav.openTab !== tab) {
      if (!wide && !phone) setPending(null)
      if (phone) setPointFolded(true)
      setSpeciesCloseSignal(n => n + 1)
    }
    nav.toggleTab(tab)
  }
  // The species' card went up (or down): unfolding it closes a tab's sheet
  const onSpeciesOpenChange = value => { if (value && phone) { nav.close(); setPointFolded(true) } }
  // Tapping the point's folded sheet unfolds it: the others fold or close
  const expandPoint = () => { setPointFolded(false); setSpeciesCloseSignal(n => n + 1); nav.close() }

  // Esc, one layer at a time: the phone's fullscreen, then the zone's layer, then an open panel, then the point's card
  // (through a ref: the listener must see the current zone)
  const closePanelRef = useRef(() => {})
  const desktopPanel = !phone && nav.openTab
  const anyPanel = Boolean(nav.openTab)
  // Without the header the floating menu button takes the top right corner: on the phone the search stops before it (in the
  // map's fullscreen the button sits above the search instead), and on desktop the tabs start under it
  const searchRight = phone ? (noHeader && !safeTop ? 'right-[76px]' : 'right-3') : desktopPanel ? 'right-[488px]' : 'right-[104px]'
  useEffect(() => {
    if (!pending && !fullscreen && !zoneOpen && !anyPanel) return
    const onKey = e => {
      if (e.key !== 'Escape' || isDialogAbove()) return // a dialog on top takes this Esc
      if (fullscreen && !appFullscreen) exitFullscreen()
      else if (zoneOpen) closeZone()
      else if (anyPanel) nav.close() // a map panel goes before the point's card
      else closePanelRef.current()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pending, fullscreen, zoneOpen, anyPanel]) // eslint-disable-line react-hooks/exhaustive-deps

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
    setPointFolded(false)
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

  // «My location»: a pick at the device's position that also moves the map to it; false when it is outside Catalonia
  function handleLocate(lat, lon) {
    if (!isInCatalonia(lat, lon)) return false
    if (phone) nav.close()
    handlePick(lat, lon)
    setFlyTo({ lat, lon, n: Date.now() })
    return true
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
      speciesId={layerSpecies}
      onSpeciesChange={setLayerSpecies}
      headerSlot={headerSlot}
      filtersSlot={filtersSlot}
    />
  )
  // Condiciones, the first segment of the Meteo panel. `layerOn`: the layer is on (its data is then on its way or here)
  const conditionsFor = layerOn => (
    <SpeciesLayerPicker
      speciesId={layerSpecies}
      speciesName={layerSpecies ? speciesLabel(layerSpecies) : null}
      onClearSpecies={() => setLayerSpecies(null)}
      layer={layer}
      date={layerDate}
      forestApplied={Boolean(forest && elevation && (layerSpecies ? layer.data?.species?.forest_classes : layer.data))}
      soilApplied={Boolean(substrate && elevation && (layerSpecies ? layer.data?.species?.substrate_factors : layer.data))}
      onDateChange={setLayerDate}
      layerOn={layerOn}
    />
  )
  // A tab's panel, the same on both devices (beside the rail on desktop, in the bar's sheet on the phone)
  const navPanel = (tab, { flat = false, className = '' } = {}) => (
    <NavPanel
      id={NAV_PANEL_ID}
      title={t[TAB_TITLE[tab]]}
      on={nav.on[tab]}
      // Switching Meteo on while Hábitat shows the species turns Hábitat off: the two maps would be on the same scale
      onSwitch={value => {
        nav.setOn(tab, value)
        if (tab === 'data' && value && habitatShown) nav.setOn('habitat', false)
        if (tab === 'habitat' && value && habitatView === 'species') nav.setOn('data', false) // Hábitat back on with «De la seta» chosen
      }}
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
          hiddenNote={habitatShown && meteoOn ? t.obsMeteoHiddenByHabitat : null}
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
      {tab === 'habitat' && (
        <HabitatPanel
          active={forestShown}
          onChange={setForestShown}
          loaded={Boolean(forest)}
          view={habitatView}
          onView={setHabitatView}
          speciesName={layerSpecies ? speciesLabel(layerSpecies) : null}
          habitat={habitatInfo}
        />
      )}
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
          <div className={`${noHeader ? 'h-[100dvh]' : 'h-[calc(100dvh-var(--header-h,5.5rem))]'} min-h-[420px]`}>
          <div className={`${fullscreen ? 'fixed inset-0 z-[150]' : 'relative h-full'} isolate overflow-hidden`} style={{ '--obs-bottom-clear': `${phone ? barRestH : 0}px` }}>
            <ObservatoryMap
              observed={observed}
              pending={pending}
              saved={saved.points}
              showSaved={cornersOn}
              pinLabel={t.obsCornerPinLabel}
              layer={probabilityOn && !habitatShown ? layer.data : null}
              habitatMap={habitatMap}
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
              dataSources={[(probabilityOn || pending) && 'Open-Meteo', forestOn && 'CREAF'].filter(Boolean).join('|') || null}
              centerAbove={phone ? { top: 72, bottomPx: barH + (speciesH > 24 ? speciesH - 24 : 0) + (pending ? sheetH : 0) } : desktopPanel ? { top: 0, rightPx: PANEL_CLEAR_PX } : null}
              className="h-full"
            />
            {/* The hint is a toast under the search (it used to sit on the tab bar): it goes after a few seconds, or as soon as the map is used */}
            {!hintGone && !pending && !observed && !(phone && nav.openTab) && (
              <div style={{ transitionDuration: `${HINT_FADE_MS}ms`, ...(safeTop ? fullscreenTop(dayFilter ? 130 : 80) : {}) }} className={`absolute z-[1100] ${safeTop ? '' : dayFilter ? 'top-[calc(var(--safe-top)+130px)] left-3' : 'top-[calc(var(--safe-top)+80px)] left-3'} ${phone ? 'right-3' : desktopPanel ? 'right-[488px]' : 'right-[104px]'} pointer-events-none transition-opacity ease-out motion-reduce:transition-none ${hintOn ? 'opacity-100' : 'opacity-0'}`}>
                <p role="status" className="w-fit max-w-[30rem] bg-coffee shadow-float rounded-xl px-3 py-2 text-xs text-white">
                  {t.obsMapHint}
                </p>
              </div>
            )}
            {/* Desktop: My location, Vista and the zoom at the bottom right, one radius and one width; Vista's panel opens to their left. On the phone Vista is the
                tab bar's fourth button and the map is zoomed with the fingers */}
            {!phone && (
              <>
                <div className="absolute z-[1100] right-4 bottom-5 flex flex-col items-end gap-2.5">
                  <LocateButton desktop onLocate={handleLocate} className="relative" />
                  <ViewButton open={nav.openTab === 'view'} onClick={() => toggleNav('view')} panelId={VIEW_PANEL_ID} />
                  <ZoomButtons map={mapInst} />
                </div>
                {nav.openTab === 'view' && (
                  <div className="absolute z-[1100] right-[104px] bottom-5 w-[360px]">
                    <ViewPanel id={VIEW_PANEL_ID} basemap={basemap} onBasemap={chooseBasemap} onClose={nav.close} fullscreen={fullscreen} onFullscreen={appFullscreen ? null : setFullscreenAfterFold} />
                  </div>
                )}
              </>
            )}
            {/* Phone: «My location» at the bottom right, above whatever the bottom holds (tab bar, species bar, point sheet); 32 px up and in from the corner so that the map's attribution stays clear */}
            {phone && (
              <LocateButton
                onLocate={handleLocate}
                className="absolute z-[1100] right-8"
                style={{ bottom: locateBottom }}
              />
            )}
            {/* Desktop: the tabs at the top right; a panel opens to the left of them */}
            {!phone && (
              <>
                <div className={`absolute z-[1100] ${noHeader ? 'top-[calc(var(--safe-top)+80px)]' : 'top-[calc(var(--safe-top)+1rem)]'} right-4`}>
                  <TabRail openTab={nav.openTab} on={nav.on} onToggle={toggleNav} panelId={NAV_PANEL_ID} />
                </div>
                {TABS.includes(nav.openTab) && (
                  <div className="absolute z-[1100] top-[calc(var(--safe-top)+1rem)] right-[104px] w-[360px] max-h-[calc(100%-2rem-var(--safe-top))] flex">
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
                  ? <ViewPanel id={VIEW_PANEL_ID} basemap={basemap} onBasemap={chooseBasemapAfterFold} onClose={nav.close} flat fullscreen={fullscreen} onFullscreen={appFullscreen ? null : setFullscreenAfterFold} />
                  : navPanel(tab, { flat: true }))}
                reservePx={(speciesH > 24 ? speciesH - 24 : 0) + (pending ? Math.max(0, sheetH - 24) : 0)}
                onHeight={setBarH}
                onBarHeight={setBarRestH}
              />
            )}
            {/* Desktop: the search never reaches the rail, nor an open panel (rail 16 + 76, panel 12 + 360, gap 12) */}
            <div className={`absolute z-[1115] ${safeTop ? '' : 'top-[calc(var(--safe-top)+0.75rem)] left-3'} ${searchRight} pointer-events-none`} style={safeTop ? fullscreenTop(12) : undefined}>
              <MapSearchBar onPlace={handleSearchSelect} speciesId={layerSpecies} onSpecies={chooseSpecies} className={`pointer-events-auto w-full ${phone ? '' : 'max-w-[30rem]'}`} />
            </div>
            {/* The active filters, under the search with the same gap the search has under the header (14 px): the Meteo day when it is not today */}
            {dayFilter && (
              <div className={`absolute z-[1114] ${safeTop ? '' : 'top-[calc(var(--safe-top)+80px)] left-3'} ${phone ? 'right-3' : desktopPanel ? 'right-[488px]' : 'right-[104px]'} pointer-events-none`} style={safeTop ? fullscreenTop(80) : undefined}>
                <MapFilterStrip dayLabel={dayFilter} onEdit={() => { if (nav.openTab !== 'data') toggleNav('data') }} onClearDay={() => setLayerDate(null)} />
              </div>
            )}
            {/* The point's sheet and the species' sheet are one stack in the page's flow (from the bottom: species, point), so folding or
                unfolding one moves the ones above it with it and none ever leaves a gap. Phone: above the tab bar, as bottom sheets.
                Desktop (and tablet): the same two blocks as cards, in a column at the bottom left. */}
            <div
              className={phone
                ? 'absolute inset-x-0 z-[1100] flex flex-col justify-end pointer-events-none'
                : `absolute z-[1100] left-3 bottom-3 w-[396px] max-w-[calc(100%-6rem)] ${dayFilter ? 'max-h-[calc(100%-9rem)]' : 'max-h-[calc(100%-6rem)]'} flex flex-col justify-end gap-2 pointer-events-none`}
              style={phone ? { top: safeTop ? fullscreenTop(dayFilter ? 130 : 72).top : `calc(var(--safe-top) + ${dayFilter ? 130 : 72}px)`, bottom: Math.max(0, barH - 24) } : undefined}
            >
              {pending && (
                <PointPanel point={pending} saved={saved} layerValue={layerValue} elevationM={pendingElevation} layerSpeciesName={shownSpecies ? speciesLabel(shownSpecies) : null} layerLoading={layerValue === undefined && layer.status !== 'error'} onObserve={handleObserve} onClose={closePanel} sheet={phone} folded={phone && pointFolded} onExpand={expandPoint} onSheetHeight={setSheetH} />
              )}
              <SpeciesSheet speciesId={layerSpecies} lens={habitatShown ? 'habitat' : probabilityOn ? 'conditions' : null} onClear={() => setLayerSpecies(null)} phone={phone} onOpenChange={onSpeciesOpenChange} onStackHeight={setSpeciesH} closeSignal={speciesCloseSignal} />
            </div>
          </div>
          </div>

          {/* The observed zone: a layer over the whole screen (the header too), above the map, which stays mounted under it */}
          {zoneOpen && createPortal(
            <div
              key={`${observed.lat},${observed.lon}`}
              role="dialog"
              aria-modal="true"
              aria-label={t.obsTitle}
              className="page-gradient fixed inset-0 z-[150] overflow-y-auto overscroll-contain"
            >
              {/* As tall as the site's header (--header-h, published by Layout), which the layer covers */}
              <div ref={layerHeaderRef} className="sticky top-0 z-10 bg-modal/95 backdrop-blur-sm border-b border-white/[0.06]">
                <div className="status-strip" aria-hidden="true" />
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
              <div ref={setFiltersSlot} data-stuck={filtersStuck} className="group sticky top-[calc(var(--header-h,5.5rem)+var(--safe-top)+1px)] z-10 pointer-events-none empty:hidden" />
              <div className="max-w-7xl mx-auto px-4 pt-6 pb-24 space-y-6">
                {zoneEl}
                <p className="text-xs text-cream/50 pt-4 border-t border-white/[0.06]">{t.obsDisclaimer}</p>
              </div>
            </div>,
            document.body,
          )}
        </>
      )}

      {savedOpen && (
        <ObsModal title={t.obsSavedListTitle} onClose={() => setSavedOpen(false)} wide>
          {savedList}
        </ObsModal>
      )}
    </div>
  )
}
