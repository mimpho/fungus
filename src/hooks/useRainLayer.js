import { useCallback, useEffect, useState } from 'react'
import { fetchRainLayer } from '../services/observatoryService'

const IDLE = { status: 'idle', data: null, error: null, key: null }

/**
 * Accumulated rain of the stored cells over `windowId` ('24h' | '7d' | '14d' | '21d') ending on `date`
 * (undefined = the last day with data). `enabled` false = no layer (status 'idle').
 * While another window or day loads, `data` keeps the previous answer, so the map never goes blank
 * (the answer says its own window and dates); `status` is 'ready' only when `data` is the answer to
 * what is asked now. A failure drops it. Cancels the request like useProbabilityLayer; `retry()` asks again.
 * Returns { status: 'idle' | 'loading' | 'ready' | 'error', data, error, retry }.
 */
export function useRainLayer(windowId, { date, enabled = true } = {}) {
  const [state, setState] = useState(IDLE)
  const [attempt, setAttempt] = useState(0)
  const key = enabled ? `${windowId}|${date ?? ''}` : null

  useEffect(() => {
    if (!key) { setState(IDLE); return undefined }
    const ctrl = new AbortController()
    setState(prev => ({ status: 'loading', data: prev.data, error: null, key }))
    fetchRainLayer(windowId, { date, signal: ctrl.signal })
      .then(data => setState({ status: 'ready', data, error: null, key }))
      .catch(error => {
        if (error?.name === 'AbortError') return
        setState({ status: 'error', data: null, error, key })
      })
    return () => ctrl.abort()
  }, [key, attempt]) // eslint-disable-line react-hooks/exhaustive-deps -- `key` holds the window and the date

  const retry = useCallback(() => setAttempt(a => a + 1), [])
  const { key: answered, ...rest } = state
  // In the render where what is asked has just changed, the state still describes the previous request
  const status = !key ? 'idle' : answered === key ? rest.status : 'loading'
  return { status, data: key ? rest.data : null, error: status === 'error' ? rest.error : null, retry }
}
