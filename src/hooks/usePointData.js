import { useCallback, useEffect, useState } from 'react'

/**
 * Loads one Observatory answer for a point: `fetcher(lat, lon, { signal })` from observatoryService.
 * `params` (e.g. { species }) go to the fetcher with the signal and re-ask when they change.
 * Cancels the request when the point changes or the component goes away; `retry()` asks again.
 * Returns { status: 'loading' | 'ready' | 'error', data, error, retry }.
 */
export function usePointData(fetcher, point, params) {
  const paramsKey = JSON.stringify(params ?? {})
  const [state, setState] = useState({ status: 'loading', data: null, error: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const ctrl = new AbortController()
    setState({ status: 'loading', data: null, error: null })
    fetcher(point.lat, point.lon, { ...(params ?? {}), signal: ctrl.signal })
      .then(data => setState({ status: 'ready', data, error: null }))
      .catch(error => {
        if (error?.name === 'AbortError') return
        setState({ status: 'error', data: null, error })
      })
    return () => ctrl.abort()
  }, [fetcher, point.lat, point.lon, attempt, paramsKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const retry = useCallback(() => setAttempt(a => a + 1), [])
  return { ...state, retry }
}
