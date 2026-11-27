import { useEffect, useState } from 'react'
import { fetchMeteoWeeks } from '../services/observatoryService'

/**
 * The weekly figures behind the day selector. `layer` 'rain' | 'conditions' (null = ask for nothing);
 * `species` (conditions only; null = the excellent edibles). Returns the weeks, or null while they load,
 * after a failure or with nothing asked: the bar then has no figures, and the day can still be chosen.
 * Weeks of another layer or species are never returned (they would sit under the wrong name). A species
 * that is not stored takes some seconds the first time.
 */
export function useMeteoWeeks(layer, species = null) {
  const [state, setState] = useState({ key: null, weeks: null })
  const key = layer ? `${layer}|${layer === 'conditions' ? species ?? '' : ''}` : null

  useEffect(() => {
    if (!key) return undefined
    const [kind, id] = key.split('|')
    const ctrl = new AbortController()
    fetchMeteoWeeks(kind, { species: id || undefined, signal: ctrl.signal })
      .then(data => setState({ key, weeks: data.weeks }))
      .catch(error => {
        if (error?.name !== 'AbortError') setState({ key, weeks: null })
      })
    return () => ctrl.abort()
  }, [key])

  return state.key === key ? state.weeks : null
}
