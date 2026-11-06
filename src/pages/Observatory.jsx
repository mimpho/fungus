import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Maximize, Minimize } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import { useObservatoryView } from '../hooks/useObservatoryView'
import { useSavedPoints } from '../hooks/useSavedPoints'
import { useIsPhone } from '../hooks/useIsPhone'
import { ALL_EXCELLENT, useProbabilityLayer } from '../hooks/useProbabilityLayer'
import { pixelElevation, pixelScore, reliefGrid } from '../lib/reliefLayer'
import { useElevationRaster } from '../hooks/useElevationRaster'
import { useClassRaster } from '../hooks/useClassRaster'
import { useSpecies } from '../hooks/useSpecies'
import { isInCatalonia } from '../lib/catalonia'
import { samePoint } from '../lib/observatoryView'
import { ObservatoryMap } from '../components/observatory/ObservatoryMap'
import { MapSearch } from '../components/observatory/MapSearch'
import { MapLayersBox } from '../components/observatory/MapLayersBox'
import { MapPills, ViewPill } from '../components/observatory/MapPills'
import { ForestTypeLegend } from '../components/observatory/ForestTypeLegend'
import { FOREST_TYPES } from '../lib/forestLayer'
import { SpeciesLayerPicker } from '../components/observatory/SpeciesLayerPicker'
import { ObservedZone } from '../components/observatory/ObservedZone'
import { TerritorySection } from '../components/observatory/TerritorySection'
import { SavedPointsList, SavedPointsToggle } from '../components/observatory/SavedPoints'
import { ObsModal, isDialogAbove } from '../components/observatory/ObsModal'
import { PointPanel } from '../components/observatory/PointPanel'

const BASEMAPS = ['satellite', 'streets', 'relief']

/**
 * /observatorio — the Observatory of any point in Catalonia (login required). The map is the page:
 * it fills the viewport under the header (Layout gives this route the full width).
 * Built in steps (see memory/pending.md, item 6). The view state (the observed point) lives in
 * the URL; the point just picked on the map, still without observing it, is local.
 */
export default function Observatory() {
  const { t, isAuthenticated, authLoading, setAuthModal } = useApp()
  const { point: observed, until, days, observe, clear, setWindow } = useObservatoryView()
  const saved = useSavedPoints(isAuthenticated)
  // A page opened on a point (URL) starts with that point's panel on the map
  const [pending, setPending] = useState(() => (observed ? { lat: observed.lat, lon: observed.lon } : null))
  const [flyTo, setFlyTo] = useState(null)
  const [savedOpen, setSavedOpen] = useState(false)
  // Probability layer: switched on in the layers box, one species at a time (null = none yet).
  // Switching it off hides it but remembers the species and the day.
  const [probabilityOn, setProbabilityOn] = useState(false)
  const [layerSpecies, setLayerSpecies] = useState(null)
  const [layerDate, setLayerDate] = useState(null) // null = last day with data
  // «Mis rincones» layer: on by default; the choice is remembered in this browser only
  const [cornersOn, setCornersOn] = useState(() => {
    try { return localStorage.getItem('fungus-obs-corners') !== 'off' } catch (_e) { return true }
  })
  function chooseCorners(value) {
    setCornersOn(value)
    try { localStorage.setItem('fungus-obs-corners', value ? 'on' : 'off') } catch (_e) { /* per-viewer convenience only */ }
  }
  // Forest type layer: the forest raster by dominant type; the legend filters which types show
  const [forestOn, setForestOn] = useState(false)
  const [forestShown, setForestShown] = useState(() => new Set(FOREST_TYPES.map(f => f.key)))
  const toggleForestType = key => setForestShown(prev => {
    const next = new Set(prev)
    if (next.has(key)) next.delete(key); else next.add(key)
    return next
  })
  const shownSpecies = probabilityOn ? layerSpecies : null
  const { species: catalog } = useSpecies()
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
  const elevation = useElevationRaster(Boolean(layerId) && isAuthenticated)
  const forest = useClassRaster('forest', (Boolean(layerId) || forestOn) && isAuthenticated)
  const substrate = useClassRaster('substrate', Boolean(layerId) && isAuthenticated)
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
  const [layersOpen, setLayersOpen] = useState(false) // the phone's layers panel; closed whenever the point's sheet opens, and the other way round
  const [sheetH, setSheetH] = useState(0) // height of the point's sheet on the phone, for the map to keep the point above it
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

  // Esc, one layer at a time: the phone's fullscreen, then the zone's layer, then the point's card
  // (through a ref: the listener must see the current zone)
  const closePanelRef = useRef(() => {})
  useEffect(() => {
    if (!pending && !fullscreen && !layerOpen) return
    const onKey = e => {
      if (e.key !== 'Escape' || isDialogAbove()) return // a dialog on top takes this Esc
      if (fullscreen) exitFullscreen()
      else if (layerOpen) closeZone()
      else closePanelRef.current()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pending, fullscreen, layerOpen]) // eslint-disable-line react-hooks/exhaustive-deps

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
    if (!isInCatalonia(lat, lon)) {
      // Outside Catalonia there is nothing to look up (the API would answer 422): the pick is dropped without a notice
      setPending(null)
      return
    }
    setPending({ lat, lon })
  }

  // A tap on the phone's map while the layers panel is open only closes the panel (a second tap picks the point)
  function handleMapTap(lat, lon) {
    if (phone && layersOpen) { setLayersOpen(false); return }
    handlePick(lat, lon)
  }

  function changeLayersOpen(open) {
    setLayersOpen(open)
    if (open) setPending(null) // one panel at a time: the point's sheet gives way to the layers
  }

  // A search result is a pick that also moves the map to it
  function handleSearchSelect(point) {
    setLayersOpen(false)
    handlePick(point.lat, point.lon)
    setFlyTo({ ...point, n: Date.now() })
  }

  function handleObserve(point) {
    if (!samePoint(observed, point)) observe(point.lat, point.lon)
    // The point's card stays on the map under the layer, for when the layer is closed
    setPending({ lat: point.lat, lon: point.lon })
    setSavedOpen(false)
    setLayersOpen(false) // the zone takes the screen
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
  // The controls of the layers: in the pills' popovers (desktop) or in the layers card (phone)
  // `layerOn`: the layer is on, or the pill is waking it up; the controls then show either their content or their placeholder, never both
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
  const forestEl = <ForestTypeLegend active={forestShown} onToggle={toggleForestType} loaded={Boolean(forest)} />
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
          <div className={`${fullscreen ? 'fixed inset-0 z-[150]' : 'relative h-full'} isolate overflow-hidden`}>
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
              label={t.obsMapLabel}
              basemap={basemap}
              flyTo={flyTo}
              dataSources={[Boolean(layerId) && 'Open-Meteo', forestOn && 'CREAF'].filter(Boolean).join('|') || null}
              centerAbove={phone ? { top: 72, bottomPx: sheetH || Math.round(window.innerHeight * 0.45) } : null}
              className="h-full"
            />
            {!pending && !observed && (
              <p className="absolute z-[1100] bottom-10 left-3 right-16 md:bottom-3 md:right-auto md:max-w-sm glass-olive rounded-xl px-3 py-2 text-xs text-cream/80 pointer-events-none">
                {t.obsMapHint}
              </p>
            )}
            {/* Phone: the map's fullscreen, level with the search */}
            {phone && (
              <button
                type="button"
                onClick={fullscreen ? exitFullscreen : enterFullscreen}
                aria-pressed={fullscreen}
                aria-label={fullscreen ? t.obsFullscreenExit : t.obsFullscreenEnter}
                title={fullscreen ? t.obsFullscreenExit : t.obsFullscreenEnter}
                className="absolute z-[1100] top-3 right-3 w-[52px] h-[52px] rounded-full glass-search search-light-text shadow-lg flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-cream/40"
              >
                {fullscreen ? <Minimize size={20} aria-hidden="true" /> : <Maximize size={20} aria-hidden="true" />}
              </button>
            )}
            {/* Desktop: the view and, under it, what the map shows, as a column of pills at the right edge (before the search in the DOM so its list opens over them) */}
            {!phone && (
              <div className="absolute z-[1100] top-3 right-3 flex flex-col items-end gap-2.5">
                <ViewPill basemap={basemap} onBasemap={chooseBasemap} />
                <MapPills
                  corners={cornersOn}
                  onCorners={chooseCorners}
                  savedCount={saved.status === 'ready' ? saved.points.length : null}
                  onOpenList={() => setSavedOpen(true)}
                  probability={probabilityOn}
                  onProbability={setProbabilityOn}
                  probabilityPanel={waking => conditionsFor(probabilityOn || waking, waking)}
                  forest={forestOn}
                  onForest={setForestOn}
                  forestPanel={forestEl}
                />
              </div>
            )}
            {/* Phone: the way into the corners list, under the search (the rest of the layers are in the layers card) */}
            {phone && (
              <div className="absolute z-[1100] top-[4.25rem] left-3">
                <SavedPointsToggle saved={saved} onToggle={() => setSavedOpen(o => !o)} compact />
              </div>
            )}
            {/* Phone: the layers card. Before the search in the DOM so the search list opens over it */}
            {phone && (
              <MapLayersBox
                corners={cornersOn}
                onCorners={chooseCorners}
                probability={probabilityOn}
                onProbability={setProbabilityOn}
                forest={forestOn}
                onForest={setForestOn}
                forestChildren={forestEl}
                className="absolute z-[1100] top-[4.75rem] left-3 right-3"
                mobile
                open={layersOpen}
                onOpenChange={changeLayersOpen}
                basemap={basemap}
                onBasemap={chooseBasemap}
              >
                {conditionsFor(probabilityOn)}
              </MapLayersBox>
            )}
            <div className={`absolute z-[1100] top-3 left-3 ${phone ? 'right-[4.5rem]' : 'right-3 md:right-auto'} pointer-events-none`}>
              <MapSearch onSelect={handleSearchSelect} className="pointer-events-auto w-full md:w-[30rem]" />
            </div>
            {pending && (
              <PointPanel point={pending} saved={saved} layerValue={layerValue} elevationM={pendingElevation} layerSpeciesName={shownSpecies ? speciesLabel(shownSpecies) : null} layerLoading={layerValue === undefined && layer.status !== 'error'} onObserve={handleObserve} onClose={closePanel} sheet={phone} onSheetHeight={setSheetH} />
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
