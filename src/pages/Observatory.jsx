import { useEffect, useRef, useState } from 'react'
import { useApp } from '../contexts/AppContext'
import { useObservatoryView } from '../hooks/useObservatoryView'
import { useSavedPoints } from '../hooks/useSavedPoints'
import { isInCatalonia } from '../lib/catalonia'
import { ObservatoryError } from '../services/observatoryService'
import { ObservatoryMap } from '../components/observatory/ObservatoryMap'
import { Tabs } from '../components/ui/Tabs'
import { MapSearch } from '../components/observatory/MapSearch'
import { ObservedZone } from '../components/observatory/ObservedZone'
import { TerritorySection } from '../components/observatory/TerritorySection'
import { SavedPointsList, SavedPointsToggle } from '../components/observatory/SavedPoints'
import { ObsModal } from '../components/observatory/ObsModal'
import { PointPanel } from '../components/observatory/PointPanel'
import { ObservatoryNotice } from '../components/observatory/ObservatoryNotice'
import { Attribution } from '../components/observatory/Attribution'

/**
 * /observatorio — the Observatory of any point in Catalonia (login required).
 * Built in steps (see memory/pending.md, item 6). The view state (the observed point) lives in
 * the URL; the point just picked on the map, still without observing it, is local.
 */
export default function Observatory() {
  const { t, isAuthenticated, authLoading, setAuthModal } = useApp()
  const { point: observed, until, days, observe, clear, setWindow } = useObservatoryView()
  const saved = useSavedPoints(isAuthenticated)
  const [pending, setPending] = useState(null)
  const [pickError, setPickError] = useState(null)
  const [flyTo, setFlyTo] = useState(null)
  const [savedOpen, setSavedOpen] = useState(false)
  // The map stays on the page when a zone is observed: the page scrolls down to the zone and only
  // a strip of the map stays above it (peeking). Clicking the strip scrolls back up to the map.
  const mapBoxRef = useRef(null)
  const zoneRef = useRef(null)
  const firstScroll = useRef(true)
  const [peeking, setPeeking] = useState(false)
  // Where the map starts when it comes back after observing a point
  const lastObserved = useRef(null)
  if (observed) lastObserved.current = observed
  const [basemap, setBasemap] = useState(() => {
    try { return localStorage.getItem('fungus-obs-basemap') === 'streets' ? 'streets' : 'satellite' } catch (_e) { return 'satellite' }
  })

  function chooseBasemap(value) {
    setBasemap(value)
    try { localStorage.setItem('fungus-obs-basemap', value) } catch (_e) { /* per-viewer convenience only */ }
  }

  // Esc closes the point panel
  useEffect(() => {
    if (!pending) return
    const onKey = e => { if (e.key === 'Escape') setPending(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pending])

  // Scroll to the observed zone: smooth when the person chooses it, at once when the page opens on it
  const hasObserved = Boolean(observed) && isAuthenticated
  useEffect(() => {
    if (!hasObserved) { firstScroll.current = false; return }
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const behavior = firstScroll.current || reduce ? 'instant' : 'smooth'
    firstScroll.current = false
    const id = requestAnimationFrame(() => zoneRef.current?.scrollIntoView({ behavior, block: 'start' }))
    return () => cancelAnimationFrame(id)
  }, [hasObserved, observed?.lat, observed?.lon]) // eslint-disable-line react-hooks/exhaustive-deps

  // «Peeking»: most of the map is out of view because a zone is being read below it
  useEffect(() => {
    const el = mapBoxRef.current
    if (!hasObserved || !el || typeof IntersectionObserver === 'undefined') { setPeeking(false); return }
    const io = new IntersectionObserver(([entry]) => setPeeking(entry.intersectionRatio < 0.4), { threshold: [0, 0.2, 0.4, 0.6, 1] })
    io.observe(el)
    return () => io.disconnect()
  }, [hasObserved])

  function backToMap() {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduce ? 'instant' : 'smooth' })
  }

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

  // A search result is a pick that also moves the map to it
  function handleSearchSelect(point) {
    handlePick(point.lat, point.lon)
    setFlyTo({ ...point, n: Date.now() })
  }

  function handleObserve(point) {
    observe(point.lat, point.lon)
    setPending(null)
    setSavedOpen(false)
  }

  const savedToggle = <SavedPointsToggle saved={saved} onToggle={() => setSavedOpen(o => !o)} />
  const savedList = <SavedPointsList saved={saved} observed={observed} onObserve={handleObserve} open={savedOpen} />

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-cream/40 text-sm animate-pulse">{t.cargando}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 anim-up pb-20">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <h2 className="font-display text-4xl font-semibold text-cream">{t.obsTitle}</h2>
          <p className="text-muted text-sm mt-1">{t.obsSubtitle}</p>
        </div>
        {isAuthenticated && savedToggle}
      </div>

      {!isAuthenticated ? (
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
              className="px-6 py-3 rounded-xl glass text-cream text-sm font-medium hover:[background-color:var(--ui-surface-hover)] transition-all"
            >
              {t.iniciarSesion}
            </button>
          </div>
        </section>
      ) : (
        <>
          {pickError && <ObservatoryNotice error={pickError} />}

          <div ref={mapBoxRef} className="relative isolate rounded-2xl overflow-hidden border border-white/[0.08]">
            <ObservatoryMap
              observed={observed}
              pending={pending}
              saved={saved.points}
              onPick={handlePick}
              label={t.obsMapLabel}
              basemap={basemap}
              flyTo={flyTo}
              startAt={lastObserved.current}
              className="h-[62vh] min-h-[420px] md:h-[65vh]"
            />
            {!pending && !observed && (
              <p className="absolute z-[1100] bottom-10 left-3 right-16 md:bottom-3 md:right-auto md:max-w-sm glass-olive rounded-xl px-3 py-2 text-xs text-cream/80 pointer-events-none">
                {t.obsMapHint}
              </p>
            )}
            {/* View selector: same look as Zonas / Mapa de calor on the zones map */}
            <div
              role="group"
              aria-label={t.obsBasemapLabel}
              className="absolute z-[1100] top-[4.75rem] right-3 md:top-3 backdrop-blur-sm bg-modal/80 rounded-xl p-1.5"
            >
              <Tabs
                options={[{ id: 'satellite', label: t.obsBasemapSatellite }, { id: 'streets', label: t.obsBasemapStreets }]}
                selected={basemap}
                onChange={chooseBasemap}
                size="md"
                variant="compact" />
            </div>
            <div className="absolute z-[1100] top-3 left-3 right-3 md:right-auto pointer-events-none">
              <MapSearch onSelect={handleSearchSelect} className="pointer-events-auto w-full md:w-[30rem]" />
            </div>
            {pending && (
              <PointPanel point={pending} observed={observed} onObserve={handleObserve} onClose={() => setPending(null)} />
            )}
            {/* Only a strip of the map shows: the whole strip takes the person back up to it */}
            {hasObserved && peeking && (
              <button
                type="button"
                onClick={backToMap}
                aria-label={t.obsBackToMap}
                className="absolute inset-0 z-[1300] flex cursor-pointer items-end justify-center bg-gradient-to-t from-black/55 via-black/25 to-black/10 pb-4"
              >
                <span className="inline-flex items-center gap-2 rounded-xl bg-bar px-4 py-2 text-sm font-medium text-white shadow-md">
                  <span aria-hidden="true">↑</span>{t.obsBackToMap}
                </span>
              </button>
            )}
          </div>
        </>
      )}

      {isAuthenticated && observed && (
            <div ref={zoneRef} className="scroll-mt-[9.5rem] min-h-[calc(100vh-9.5rem)]">
              <ObservedZone
                key={`${observed.lat},${observed.lon}`}
                point={observed}
                saved={saved}
                until={until}
                days={days}
                onWindow={setWindow}
                onRemoved={() => { clear(); backToMap() }}
              />
            </div>
      )}

      {isAuthenticated && <TerritorySection active={observed} onObserve={handleObserve} />}

      {savedOpen && (
        <ObsModal title={t.obsSavedListTitle} onClose={() => setSavedOpen(false)} wide>
          {savedList}
        </ObsModal>
      )}

      <Attribution />
    </div>
  )
}
