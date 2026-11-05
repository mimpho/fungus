import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchPointForest, fetchPointSnapshot } from '../services/observatoryService'

/**
 * What the profile list needs from every corner to filter and sort it, and the API only gives
 * one point at a time: toponym (name, municipality, comarca), forest shares around the point and
 * the score (the tagged mushroom's own when exactly one is tagged, else the mean of the excellent
 * ones: the same as the Observatory's cards). Asked from the browser, a few at a time, and kept
 * for the session so that coming back to the tab does not ask again. A failure leaves that part
 * null (the corner just cannot pass a filter that needs it) and is tried again after a minute.
 */
const CONCURRENCY = 4
const TTL_MS = 10 * 60 * 1000
const RETRY_MS = 60 * 1000
const cache = new Map() // key -> { until, info }

const onlySpecies = sp => (sp.species_ids?.length === 1 ? sp.species_ids[0] : null)
const keyOf = sp => `${sp.lat},${sp.lon}|${onlySpecies(sp) ?? ''}`
const fresh = sp => (cache.get(keyOf(sp))?.until ?? 0) > Date.now()

async function load(sp, signal) {
  const species = onlySpecies(sp)
  const [forest, snap] = await Promise.allSettled([
    fetchPointForest(sp.lat, sp.lon, { signal }),
    fetchPointSnapshot(sp.lat, sp.lon, species ? { species, signal } : { signal }),
  ])
  if (signal.aborted) return
  const f = forest.status === 'fulfilled' ? forest.value : null
  const s = snap.status === 'fulfilled' ? snap.value : null
  const ok = !!f && !!s
  cache.set(keyOf(sp), {
    until: Date.now() + (ok ? TTL_MS : RETRY_MS),
    info: { toponym: f?.toponym ?? null, forest: f?.habitat?.forest ?? null, score: Number.isFinite(s?.score) ? s.score : null },
  })
}

export function useCornerInsights(points) {
  const [tick, setTick] = useState(0)
  const signature = points.map(keyOf).join(';')

  useEffect(() => {
    const ctrl = new AbortController()
    const queue = points.filter(sp => !fresh(sp))
    const worker = async () => {
      while (queue.length && !ctrl.signal.aborted) {
        await load(queue.shift(), ctrl.signal)
        if (!ctrl.signal.aborted) setTick(t => t + 1)
      }
    }
    for (let i = 0; i < Math.min(CONCURRENCY, queue.length); i++) worker()
    return () => ctrl.abort()
  }, [signature]) // eslint-disable-line react-hooks/exhaustive-deps

  const infoOf = useCallback(sp => cache.get(keyOf(sp))?.info ?? null, [tick]) // eslint-disable-line react-hooks/exhaustive-deps
  const done = useMemo(() => points.filter(sp => cache.has(keyOf(sp))).length, [signature, tick]) // eslint-disable-line react-hooks/exhaustive-deps
  return { infoOf, done, total: points.length, loading: done < points.length }
}
