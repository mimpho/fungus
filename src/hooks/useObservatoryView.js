import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { parseView, parseMeteo, canonicalParams, withPoint, withWindow, withMeteo } from '../lib/observatoryView'

/**
 * The Observatory's view state, kept in the URL: shareable, and the back button walks through
 * the observed points. Changing the point pushes a history entry; cleaning an invalid link, moving
 * the timeline window or changing what Meteo shows replaces the current one (Back does not walk
 * through every window or day).
 * `initialMeteo`: the Meteo state the page was opened with ({ layer, species, day } or null); after
 * that the page owns it and writes it back with `setMeteo`.
 */
export function useObservatoryView() {
  const [params, setParams] = useSearchParams()
  const view = useMemo(() => parseView(params), [params])
  const [initialMeteo] = useState(() => parseMeteo(params))

  // A link with a broken, duplicated or unrounded lat/lon, or a broken Meteo state, is rewritten to its
  // canonical form (replacing the history entry, so Back does not walk through the repair).
  useEffect(() => {
    const canonical = canonicalParams(params)
    if (canonical) setParams(canonical, { replace: true })
  }, [params, setParams])

  /** Observes a point; `until`, when given, is the last day of the zone's window (the Meteo day). */
  const observe = useCallback(
    (lat, lon, { until } = {}) => setParams(prev => {
      const next = withPoint(prev, { lat, lon })
      return until ? withWindow(next, { until, days: view.days }) : next
    }),
    [setParams, view.days],
  )
  const clear = useCallback(() => setParams(prev => withPoint(prev, null)), [setParams])

  /** Sets the window: `until` is its last day (null = last day with data), `days` its length. */
  const setWindow = useCallback(
    (until, days) => setParams(prev => withWindow(prev, { until, days }), { replace: true }),
    [setParams],
  )

  /** What Meteo shows ({ layer, species, day }), or null with Meteo off. Only writes when it changes. */
  const setMeteo = useCallback(
    meteo => setParams(prev => {
      const next = withMeteo(prev, meteo)
      return next.toString() === prev.toString() ? prev : next
    }, { replace: true }),
    [setParams],
  )

  return { point: view.point, until: view.until, days: view.days, initialMeteo, observe, clear, setWindow, setMeteo }
}
