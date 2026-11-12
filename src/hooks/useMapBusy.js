import { useMemo } from 'react'

/**
 * What the map is waiting for. `sources` = [{ id, label, on, loading, error, retry }], one per thing a
 * layer needs (its data, its rasters). Only layers that are on count: something loading in the
 * background for a layer that is off (the point card's mean of the excellent species) does not.
 * Returns { busy, failed }: `failed` is the first source that is on and failed ({ label, retry }), or null.
 */
export function useMapBusy(sources) {
  return useMemo(() => {
    const live = sources.filter(s => s.on)
    const failed = live.find(s => s.error) ?? null
    return {
      busy: live.some(s => s.loading),
      failed: failed && { id: failed.id, label: failed.label, retry: failed.retry },
    }
  }, [sources])
}
