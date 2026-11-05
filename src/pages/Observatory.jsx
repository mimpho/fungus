import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronUp, ChevronLeft, X, Maximize, Minimize } from 'lucide-react'
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
import { ObservatoryError } from '../services/observatoryService'
import { ObservatoryMap } from '../components/observatory/ObservatoryMap'
import { Tabs } from '../components/ui/Tabs'
import { MapSearch } from '../components/observatory/MapSearch'
import { MapLayersBox } from '../components/observatory/MapLayersBox'
import { ForestTypeLegend } from '../components/observatory/ForestTypeLegend'
import { FOREST_TYPES } from '../lib/forestLayer'
import { SpeciesLayerPicker } from '../components/observatory/SpeciesLayerPicker'
import { ObservedZone } from '../components/observatory/ObservedZone'
import { TerritorySection } from '../components/observatory/TerritorySection'
import { SavedPointsList, SavedPointsToggle } from '../components/observatory/SavedPoints'
import { ObsModal, isDialogAbove } from '../components/observatory/ObsModal'
import { PointPanel } from '../components/observatory/PointPanel'
import { ObservatoryNotice } from '../components/observatory/ObservatoryNotice'

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
  const [pickError, setPickError] = useState(null)
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
  // The map stays on the page when a zone is observed: the page scrolls down to the zone and only
  // a strip of the map stays above it (peeking). Clicking the strip scrolls back up to the map.
  const mapBoxRef = useRef(null)
  // On a phone (under 640px) an observed zone is its own full screen over the map; «Volver al mapa» hides it
  // without leaving the zone. The desktop keeps the zone below the map.
  const phone = useIsPhone()
  const [zoneHidden, setZoneHidden] = useState(false)
  // Phone only: the map over the whole screen (the site's header too) and, where the browser allows it, the browser's own
  // fullscreen (iPhone Safari has none: there only the header goes). The state follows the browser leaving fullscreen by itself.
  const [fullscreenState, setFullscreenState] = useState(false)
  const fullscreen = fullscreenState && phone
  useEffect(() => { setZoneHidden(false) }, [observed?.lat, observed?.lon])
  const [layersOpen, setLayersOpen] = useState(false) // the phone's layers panel; closed whenever the point's sheet opens, and the other way round
  const [sheetH, setSheetH] = useState(0) // height of the point's sheet on the phone, for the map to keep the point above it
  // The phone's zone screen goes to the body (as ObsModal does): a fixed child of the animated page wrapper is placed against it, not the screen
  const inPortal = node => (phone ? createPortal(node, document.body) : node)
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
  // The page behind must not scroll under the full-screen map
  useEffect(() => {
    if (!fullscreen) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [fullscreen])
  const zoneRef = useRef(null)
  const firstScroll = useRef(true)
  const [peeking, setPeeking] = useState(false)
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

  // Esc leaves the phone's fullscreen first; otherwise it closes the point panel (through a ref: the listener must see the current zone)
  const closePanelRef = useRef(() => {})
  useEffect(() => {
    if (!pending && !fullscreen) return
    const onKey = e => {
      if (e.key !== 'Escape' || isDialogAbove()) return // a dialog on top takes this Esc
      if (fullscreen) exitFullscreen()
      else closePanelRef.current()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pending, fullscreen]) // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to the observed zone: smooth when the person chooses it, at once when the page opens on it
  const hasObserved = Boolean(observed) && isAuthenticated
  useEffect(() => {
    if (!hasObserved || phone) { firstScroll.current = false; return }
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const behavior = firstScroll.current || reduce ? 'instant' : 'smooth'
    firstScroll.current = false
    const id = requestAnimationFrame(() => zoneRef.current?.scrollIntoView({ behavior, block: 'start' }))
    return () => cancelAnimationFrame(id)
  }, [hasObserved, phone, observed?.lat, observed?.lon]) // eslint-disable-line react-hooks/exhaustive-deps

  // «Peeking»: most of the map is out of view because a zone is being read below it
  useEffect(() => {
    const el = mapBoxRef.current
    if (!hasObserved || phone || !el || typeof IntersectionObserver === 'undefined') { setPeeking(false); return }
    const io = new IntersectionObserver(([entry]) => setPeeking(entry.intersectionRatio < 0.4), { threshold: [0, 0.2, 0.4, 0.6, 1] })
    io.observe(el)
    return () => io.disconnect()
  }, [hasObserved, phone])

  function goToZone() {
    if (phone) { setZoneHidden(false); return } // the zone is its own screen
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    zoneRef.current?.scrollIntoView({ behavior: reduce ? 'instant' : 'smooth', block: 'start' })
  }

  function backToMap() {
    if (phone) return // there the zone is a screen of its own: it has its own way back to the map
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduce ? 'instant' : 'smooth' })
  }

  // Closing the clicked point's card also closes the observed zone below the map and goes back to the top
  function closePanel() {
    setPending(null)
    if (hasObserved) {
      clear()
      backToMap()
    }
  }
  closePanelRef.current = closePanel

  function handlePick(lat, lon) {
    if (!isInCatalonia(lat, lon)) {
      // Said here, without asking the API: it would answer 422 anyway
      setPending(null)
      setPickError(new ObservatoryError('outside'))
      return
    }
    setPickError(null)
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

  // Leaving the zone on the phone: back to the page
  function leaveZone() {
    clear()
    setPending(null)
  }

  // A search result is a pick that also moves the map to it
  function handleSearchSelect(point) {
    setLayersOpen(false)
    handlePick(point.lat, point.lon)
    setFlyTo({ ...point, n: Date.now() })
  }

  function handleObserve(point) {
    observe(point.lat, point.lon)
    // The point's panel stays on the map (it then reads «Observing»), with its score and habitat
    setPending({ lat: point.lat, lon: point.lon })
    setSavedOpen(false)
    setZoneHidden(false)
    if (phone) setLayersOpen(false) // the zone takes the screen
  }

  // The observed zone: on the page below the map (desktop), or as a screen of its own (phone)
  const zoneEl = observed && (
    <ObservedZone
      key={`${observed.lat},${observed.lon}`}
      onSpeciesPick={goToZone}
      onOpenList={() => setSavedOpen(true)}
      point={observed}
      saved={saved}
      until={until}
      days={days}
      onWindow={setWindow}
      initialSpecies={shownSpecies}
      onRemoved={() => { clear(); backToMap() }}
    />
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
          <div ref={mapBoxRef} className="h-[calc(100dvh-var(--header-h,5.5rem))] min-h-[420px]">
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
            {pickError && <div className="absolute z-[1200] top-[7.5rem] left-3 right-3 md:right-auto md:w-[30rem]"><ObservatoryNotice error={pickError} /></div>}
            {!pending && !observed && (
              <p className="absolute z-[1100] bottom-10 left-3 right-16 md:bottom-3 md:right-auto md:max-w-sm glass-olive rounded-xl px-3 py-2 text-xs text-cream/80 pointer-events-none">
                {t.obsMapHint}
              </p>
            )}
            {/* View selector (same look as Zonas / Mapa de calor on the zones map). On a phone it lives in the layers panel */}
            {!phone && <div className="absolute z-[1100] top-[4.75rem] right-3 md:top-3">
              <div
                role="group"
                aria-label={t.obsBasemapLabel}
                className="backdrop-blur-sm bg-modal/80 rounded-xl p-1.5"
              >
                <Tabs
                  options={[{ id: 'satellite', label: t.obsBasemapSatellite }, { id: 'streets', label: t.obsBasemapStreets }, { id: 'relief', label: t.obsBasemapRelief }]}
                  selected={basemap}
                  onChange={chooseBasemap}
                  size="md"
                  variant="compact" />
              </div>
            </div>}
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
            {/* Provisional (until the pills): the way into the corners list, under the search */}
            <div className="absolute z-[1100] top-[4.25rem] left-3">
              <SavedPointsToggle saved={saved} onToggle={() => setSavedOpen(o => !o)} compact />
            </div>
            {/* Under the basemap tabs on the right, so it never covers the clicked point's panel (bottom left). Before the search in the DOM so the search list opens over it on mobile */}
            <MapLayersBox
              corners={cornersOn}
              onCorners={chooseCorners}
              probability={probabilityOn}
              onProbability={setProbabilityOn}
              forest={forestOn}
              onForest={setForestOn}
              forestChildren={<ForestTypeLegend active={forestShown} onToggle={toggleForestType} loaded={Boolean(forest)} />}
              className={phone ? 'absolute z-[1100] top-[4.75rem] left-3 right-3' : 'absolute z-[1100] top-[8rem] left-3 right-3 md:left-auto md:top-[4.75rem] md:right-3 md:w-[22rem]'}
              mobile={phone}
              open={phone ? layersOpen : undefined}
              onOpenChange={phone ? changeLayersOpen : undefined}
              basemap={basemap}
              onBasemap={chooseBasemap}
            >
              <SpeciesLayerPicker
                speciesId={layerSpecies}
                onChange={chooseLayerSpecies}
                layer={layer}
                date={layerDate}
                forestApplied={Boolean(forest && elevation && (layerSpecies ? layer.data?.species?.forest_classes : layer.data))}
                soilApplied={Boolean(substrate && elevation && (layerSpecies ? layer.data?.species?.substrate_factors : layer.data))}
                onDateChange={setLayerDate}
              />
            </MapLayersBox>
            <div className={`absolute z-[1100] top-3 left-3 ${phone ? 'right-[4.5rem]' : 'right-3 md:right-auto'} pointer-events-none`}>
              <MapSearch onSelect={handleSearchSelect} className="pointer-events-auto w-full md:w-[30rem]" />
            </div>
            {pending && (
              <PointPanel point={pending} observed={observed} saved={saved} layerValue={layerValue} elevationM={pendingElevation} layerSpeciesName={shownSpecies ? speciesLabel(shownSpecies) : null} layerLoading={layerValue === undefined && layer.status !== 'error'} onObserve={handleObserve} onGoToZone={goToZone} onClose={closePanel} sheet={phone} onSheetHeight={setSheetH} />
            )}
            {/* Only a strip of the map shows: a 100 px band that ends where the observed zone starts (the anchor the page scrolls to), so it is always right above it; it takes the person back up to the map */}
            {hasObserved && peeking && (
              <button
                type="button"
                onClick={backToMap}
                aria-label={t.obsBackToMap}
                className="absolute inset-x-0 bottom-0 z-[1300] h-[100px] flex cursor-pointer flex-col items-center justify-end gap-0.5 bg-gradient-to-t from-modal/95 via-modal/60 to-transparent pb-3 text-cream/90 hover:text-cream transition-colors"
              >
                <ChevronUp size={22} strokeWidth={2.2} aria-hidden="true" />
                <span className="text-[10.5px] font-medium uppercase tracking-[1.4px]">{t.obsBackToMap}</span>
              </button>
            )}
          </div>
          </div>

          {observed && phone && !zoneHidden && inPortal(
            <div className="fixed inset-0 z-[150] overflow-y-auto overscroll-contain bg-modal">
              <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-3 py-2 bg-modal/95 backdrop-blur-sm">
                <button
                  type="button"
                  onClick={() => setZoneHidden(true)}
                  className="inline-flex items-center gap-1.5 pl-2 pr-4 py-2.5 rounded-xl text-cream text-sm font-medium hover:bg-white/10 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-cream/40"
                >
                  <ChevronLeft size={20} aria-hidden="true" />
                  {t.obsBackToMap}
                </button>
                <button
                  type="button"
                  onClick={leaveZone}
                  aria-label={t.obsZoneClose}
                  title={t.obsZoneClose}
                  className="p-2.5 rounded-xl text-cream/70 hover:text-cream hover:bg-white/10 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-cream/40"
                >
                  <X size={20} aria-hidden="true" />
                </button>
              </div>
              <div ref={zoneRef} className="px-4 pt-2 pb-24">
                {zoneEl}
              </div>
            </div>
          )}

          {/* What is below the map keeps the site's width */}
          <div className="max-w-7xl mx-auto px-4 pt-8 pb-20 space-y-6">
            {observed && !phone && (
              <div ref={zoneRef} className="scroll-mt-[9.5rem] min-h-[calc(100vh-9.5rem)]">
                {zoneEl}
              </div>
            )}
            <TerritorySection active={observed} onObserve={handleObserve} />
            <p className="text-xs text-cream/50 pt-4 border-t border-white/[0.06]">{t.obsDisclaimer}</p>
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
