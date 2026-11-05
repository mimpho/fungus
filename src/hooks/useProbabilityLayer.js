import { useCallback, useEffect, useState } from 'react'
import { fetchExcellentLayer, fetchProbabilityLayer } from '../services/observatoryService'

/** `speciesId` that asks for the excellent edibles together instead of one species. */
export const ALL_EXCELLENT = '*'

/**
 * Probability layer of one species over the stored cells of Catalonia.
 * `speciesId` ALL_EXCELLENT = the mean of the excellent edibles (data.species is then a list).
 * `speciesId` null = no layer (status 'idle'). Asking for another species clears the previous
 * answer at once: its colours would otherwise sit under the new species' name.
 * Cancels the request when the species changes or the component goes away; `retry()` asks again.
 * Returns { status: 'idle' | 'loading' | 'ready' | 'error', data, error, retry }.
 */
export function useProbabilityLayer(speciesId, { date } = {}) {
  const [state, setState] = useState({ status: 'idle', data: null, error: null, species: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!speciesId) { setState({ status: 'idle', data: null, error: null, species: null }); return undefined }
    const ctrl = new AbortController()
    setState(prev => ({ status: 'loading', data: prev.species === speciesId ? prev.data : null, error: null, species: speciesId }))
    const request = speciesId === ALL_EXCELLENT
      ? fetchExcellentLayer({ date, signal: ctrl.signal })
      : fetchProbabilityLayer(speciesId, { date, signal: ctrl.signal })
    request
      .then(data => setState({ status: 'ready', data, error: null, species: speciesId }))
      .catch(error => {
        if (error?.name === 'AbortError') return
        setState(prev => ({ status: 'error', data: null, error, species: prev.species }))
      })
    return () => ctrl.abort()
  }, [speciesId, date, attempt])

  const retry = useCallback(() => setAttempt(a => a + 1), [])
  const { species, ...rest } = state
  return { ...rest, retry }
}
