import { useEffect, useState } from 'react'
import { loadClassRaster } from '../lib/classRaster'

/**
 * The class raster of a kind ('forest' or 'substrate') once `enabled` (loaded the first time it is
 * needed, then cached), else null. Without it the probability layer still works: it just does not
 * take that factor into account.
 */
export function useClassRaster(kind, enabled) {
  const [raster, setRaster] = useState(null)
  useEffect(() => {
    if (!enabled || raster) return undefined
    let cancelled = false
    loadClassRaster(kind)
      .then(r => { if (!cancelled) setRaster(r) })
      .catch(err => console.warn(`[observatory] no ${kind} raster, layer without it:`, err?.message))
    return () => { cancelled = true }
  }, [kind, enabled, raster])
  return raster
}
