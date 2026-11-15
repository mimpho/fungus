import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { parseView, parseMeteo, parseSpecies, canonicalParams, withPoint, withWindow, withMeteo, withSpecies } from '../lib/observatoryView'

/**
 * The Observatory's view state, kept in the URL: shareable, and the back button walks through
 * the observed points. Changing the point pushes a history entry; cleaning an invalid link, moving
 * the timeline window or changing what Meteo shows replaces the current one (Back does not walk
 * through every window or day).
 * `initialMeteo`: the Meteo state the page was opened with ({ layer, day } or null) and `initialSpecies`
 * the map's species (an id or null); after that the page owns them and writes them back with `setMeteo`
 * and `setSpecies`.
 */
export function useObservatoryView() {
  const [params, setParams] = useSearchParams()
  const view = useMemo(() => parseView(params), [params])
  const [initialMeteo] = useState(() => parseMeteo(params))
  const [initialSpecies] = useState(() => parseSpecies(params))
  // The params as last written. React Router's functional `setParams(prev => …)` hands every call of the same
  // tick the same stale `prev`, so two writers (Meteo and the species) would undo each other: they build on this.
  const latest = useRef(params)
  latest.current = params

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

  /** What Meteo shows ({ layer, day }), or null with Meteo off. Only writes when it changes. */
  const setMeteo = useCallback(
    meteo => {
      const next = withMeteo(latest.current, meteo)
      if (next.toString() === latest.current.toString()) return
      latest.current = next
      setParams(next, { replace: true })
    },
    [setParams],
  )

  /** The map's active species (an id, or null for none). Only writes when it changes. */
  const setSpecies = useCallback(
    id => {
      const next = withSpecies(latest.current, id)
      if (next.toString() === latest.current.toString()) return
      latest.current = next
      setParams(next, { replace: true })
    },
    [setParams],
  )

  return { point: view.point, until: view.until, days: view.days, initialMeteo, initialSpecies, observe, clear, setWindow, setMeteo, setSpecies }
}
