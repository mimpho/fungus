import { useCallback, useEffect, useState } from 'react'
import { loadElevationRaster } from '../lib/elevationRaster'

/**
 * The elevation raster once `enabled` (loaded the first time it is needed, then cached), with its
 * state: { raster, status: 'idle' | 'loading' | 'ready' | 'error', retry }.
 * Without it the probability layer still works: it is drawn per cell instead of per pixel.
 */
export function useElevationRasterState(enabled) {
  const [state, setState] = useState({ raster: null, status: 'idle' })
  const [attempt, setAttempt] = useState(0)
  const loaded = Boolean(state.raster)
  useEffect(() => {
    if (!enabled || loaded) return undefined
    let cancelled = false
    setState({ raster: null, status: 'loading' })
    loadElevationRaster()
      .then(r => { if (!cancelled) setState({ raster: r, status: 'ready' }) })
      .catch(err => {
        console.warn('[observatory] no elevation raster, drawing per cell:', err?.message)
        if (!cancelled) setState({ raster: null, status: 'error' })
      })
    return () => { cancelled = true }
  }, [enabled, loaded, attempt])
  const retry = useCallback(() => setAttempt(n => n + 1), [])
  return { ...state, retry }
}

/** The elevation raster alone (null until loaded). */
export function useElevationRaster(enabled) {
  return useElevationRasterState(enabled).raster
}
