import { useCallback, useEffect, useState } from 'react'
import { loadClassRaster } from '../lib/classRaster'

/**
 * The class raster of a kind ('forest' or 'substrate') once `enabled` (loaded the first time it is
 * needed, then cached), with its state: { raster, status: 'idle' | 'loading' | 'ready' | 'error', retry }.
 * Without it the probability layer still works: it just does not take that factor into account.
 */
export function useClassRasterState(kind, enabled) {
  const [state, setState] = useState({ raster: null, status: 'idle' })
  const [attempt, setAttempt] = useState(0)
  const loaded = Boolean(state.raster)
  useEffect(() => {
    if (!enabled || loaded) return undefined
    let cancelled = false
    setState({ raster: null, status: 'loading' })
    loadClassRaster(kind)
      .then(r => { if (!cancelled) setState({ raster: r, status: 'ready' }) })
      .catch(err => {
        console.warn(`[observatory] no ${kind} raster, layer without it:`, err?.message)
        if (!cancelled) setState({ raster: null, status: 'error' })
      })
    return () => { cancelled = true }
  }, [kind, enabled, loaded, attempt])
  const retry = useCallback(() => setAttempt(n => n + 1), [])
  return { ...state, retry }
}

/** The class raster alone (null until loaded). */
export function useClassRaster(kind, enabled) {
  return useClassRasterState(kind, enabled).raster
}
