import { useCallback, useEffect, useState } from 'react'
import {
  fetchSavedPoints, createSavedPoint, updateSavedPoint, deleteSavedPoint,
} from '../services/observatoryService'
import { findSaved } from '../lib/savedPoints'

/**
 * The user's saved points. Loaded once when the session is open; the three actions throw the
 * ObservatoryError so that the form that asked can show it, and keep the list in step with what
 * the API answered (no second fetch).
 */
export function useSavedPoints(enabled) {
  const [state, setState] = useState({ status: 'idle', points: [], error: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!enabled) {
      setState({ status: 'idle', points: [], error: null })
      return undefined
    }
    const ctrl = new AbortController()
    setState(s => ({ ...s, status: 'loading', error: null }))
    fetchSavedPoints({ signal: ctrl.signal })
      .then(points => setState({ status: 'ready', points, error: null }))
      .catch(error => {
        if (error?.name === 'AbortError') return
        setState({ status: 'error', points: [], error })
      })
    return () => ctrl.abort()
  }, [enabled, attempt])

  const add = useCallback(async input => {
    const created = await createSavedPoint(input)
    setState(s => ({ ...s, points: [...s.points, created] }))
    return created
  }, [])

  const update = useCallback(async (id, changes) => {
    const updated = await updateSavedPoint(id, changes)
    setState(s => ({ ...s, points: s.points.map(p => (p.id === id ? updated : p)) }))
    return updated
  }, [])

  const remove = useCallback(async id => {
    try {
      await deleteSavedPoint(id)
    } catch (error) {
      if (error?.kind !== 'not_found') throw error // already gone: same result
    }
    setState(s => ({ ...s, points: s.points.filter(p => p.id !== id) }))
  }, [])

  const find = useCallback(point => findSaved(state.points, point), [state.points])
  const reload = useCallback(() => setAttempt(a => a + 1), [])

  return { status: state.status, points: state.points, error: state.error, add, update, remove, find, reload }
}
