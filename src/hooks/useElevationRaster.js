import { useEffect, useState } from 'react'
import { loadElevationRaster } from '../lib/elevationRaster'

/**
 * The elevation raster once `enabled` (loaded the first time it is needed, then cached), else null.
 * Without it the probability layer still works: it is drawn per cell instead of per pixel.
 */
export function useElevationRaster(enabled) {
  const [raster, setRaster] = useState(null)
  useEffect(() => {
    if (!enabled || raster) return undefined
    let cancelled = false
    loadElevationRaster()
      .then(r => { if (!cancelled) setRaster(r) })
      .catch(err => console.warn('[observatory] no elevation raster, drawing per cell:', err?.message))
    return () => { cancelled = true }
  }, [enabled, raster])
  return raster
}
