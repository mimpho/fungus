import { useEffect, useState } from 'react'
import { useApp } from '../contexts/AppContext'
import { useObservatoryView } from '../hooks/useObservatoryView'
import { isInCatalonia } from '../lib/catalonia'
import { ObservatoryError } from '../services/observatoryService'
import { ObservatoryMap } from '../components/observatory/ObservatoryMap'
import { Tabs } from '../components/ui/Tabs'
import { MapSearch } from '../components/observatory/MapSearch'
import { ObservedZone } from '../components/observatory/ObservedZone'
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
  const { point: observed, observe, clear } = useObservatoryView()
  const [pending, setPending] = useState(null)
  const [pickError, setPickError] = useState(null)
  const [flyTo, setFlyTo] = useState(null)
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
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-cream/40 text-sm animate-pulse">{t.cargando}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 anim-up pb-20">
      <div>
        <h2 className="font-display text-4xl font-semibold text-cream">{t.obsTitle}</h2>
        <p className="text-muted text-sm mt-1">{t.obsSubtitle}</p>
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

          <div className="relative rounded-2xl overflow-hidden border border-white/[0.08]">
            <ObservatoryMap
              observed={observed}
              pending={pending}
              onPick={handlePick}
              label={t.obsMapLabel}
              basemap={basemap}
              flyTo={flyTo}
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
              className="absolute z-[1100] top-[4.75rem] right-3 md:top-3 backdrop-blur-sm bg-modal/80 rounded-xl p-1"
            >
              <Tabs
                options={[{ id: 'satellite', label: t.obsBasemapSatellite }, { id: 'streets', label: t.obsBasemapStreets }]}
                selected={basemap}
                onChange={chooseBasemap}
                size="sm"
                variant="compact" />
            </div>
            <div className="absolute z-[1100] top-3 left-3 right-3 md:right-auto pointer-events-none">
              <MapSearch onSelect={handleSearchSelect} className="pointer-events-auto w-full md:w-[30rem]" />
            </div>
            {pending && (
              <PointPanel point={pending} observed={observed} onObserve={handleObserve} onClose={() => setPending(null)} />
            )}
          </div>

          {observed && <ObservedZone key={`${observed.lat},${observed.lon}`} point={observed} onClear={clear} />}
        </>
      )}

      <Attribution />
    </div>
  )
}
