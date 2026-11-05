import { useCallback, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { parseView, canonicalParams, withPoint, withWindow } from '../lib/observatoryView'

/**
 * The Observatory's view state, kept in the URL: shareable, and the back button walks through
 * the observed points. Changing the point pushes a history entry; cleaning an invalid link or
 * moving the timeline window replaces the current one (Back does not walk through every window).
 */
export function useObservatoryView() {
  const [params, setParams] = useSearchParams()
  const view = useMemo(() => parseView(params), [params])

  // A link with a broken, duplicated or unrounded lat/lon is rewritten to its canonical form
  // (replacing the history entry, so Back does not walk through the repair).
  useEffect(() => {
    const canonical = canonicalParams(params)
    if (canonical) setParams(canonical, { replace: true })
  }, [params, setParams])

  const observe = useCallback(
    (lat, lon) => setParams(prev => withPoint(prev, { lat, lon })),
    [setParams],
  )
  const clear = useCallback(() => setParams(prev => withPoint(prev, null)), [setParams])

  /** Sets the window: `until` is its last day (null = last day with data), `days` its length. */
  const setWindow = useCallback(
    (until, days) => setParams(prev => withWindow(prev, { until, days }), { replace: true }),
    [setParams],
  )

  return { point: view.point, until: view.until, days: view.days, observe, clear, setWindow }
}
