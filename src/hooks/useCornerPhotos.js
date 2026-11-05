import { useCallback, useEffect, useRef, useState } from 'react'
import {
  fetchCornerPhotos, uploadCornerPhoto, tagCornerPhoto, deleteCornerPhoto,
} from '../services/observatoryService'

/**
 * The photos of one corner, with the signed URLs the API gave (they expire after an hour, so
 * they are only held while the card is open; an image that fails to load asks for fresh ones
 * once). Nothing is fetched for a corner that has no photos. The three actions keep the list in
 * step with the answer and then call `onChanged` (the corner's own count and species change);
 * they throw the ObservatoryError so that whoever asked can show it. `uploads` goes one file
 * at a time. When `syncKey` changes (the corner was edited: taking a species off the corner takes it
 * off its photos) the list is read again, without the loading state, so an open viewer stays.
 */
export function useCornerPhotos(cornerId, knownCount, onChanged, syncKey) {
  const [state, setState] = useState({ status: 'idle', photos: [], error: null })
  const [busy, setBusy] = useState(false)
  const countRef = useRef(knownCount)
  countRef.current = knownCount
  const changed = useRef(onChanged)
  changed.current = onChanged
  const reloaded = useRef(false)

  useEffect(() => {
    reloaded.current = false
    if (!cornerId || !countRef.current) {
      setState({ status: 'ready', photos: [], error: null })
      return undefined
    }
    const ctrl = new AbortController()
    setState({ status: 'loading', photos: [], error: null })
    fetchCornerPhotos(cornerId, { signal: ctrl.signal })
      .then(photos => setState({ status: 'ready', photos, error: null }))
      .catch(error => {
        if (error?.name === 'AbortError') return
        setState({ status: 'error', photos: [], error })
      })
    return () => ctrl.abort()
  }, [cornerId])

  const firstSync = useRef(true)
  useEffect(() => {
    if (firstSync.current) {
      firstSync.current = false
      return undefined
    }
    if (!cornerId || !countRef.current) return undefined
    const ctrl = new AbortController()
    fetchCornerPhotos(cornerId, { signal: ctrl.signal })
      .then(photos => setState(s => ({ ...s, photos })))
      .catch(() => { /* the list stays as it was */ })
    return () => ctrl.abort()
  }, [cornerId, syncKey])

  /** An <img> failed (most likely an expired URL): ask for new ones, once per card opening. */
  const refreshUrls = useCallback(async () => {
    if (reloaded.current || !cornerId) return
    reloaded.current = true
    try {
      const photos = await fetchCornerPhotos(cornerId)
      setState(s => ({ ...s, photos }))
    } catch { /* the broken image stays broken; the next opening tries again */ }
  }, [cornerId])

  const upload = useCallback(async (file, speciesIds = []) => {
    setBusy(true)
    try {
      const photo = await uploadCornerPhoto(cornerId, file, speciesIds)
      setState(s => ({ ...s, status: 'ready', photos: [...s.photos, photo].sort((a, b) => a.position - b.position) }))
      await changed.current?.()
      return photo
    } finally {
      setBusy(false)
    }
  }, [cornerId])

  const tag = useCallback(async (photoId, speciesIds) => {
    const updated = await tagCornerPhoto(cornerId, photoId, speciesIds)
    setState(s => ({ ...s, photos: s.photos.map(p => (p.id === photoId ? updated : p)) }))
    await changed.current?.()
    return updated
  }, [cornerId])

  const remove = useCallback(async photoId => {
    try {
      await deleteCornerPhoto(cornerId, photoId)
    } catch (error) {
      if (error?.kind !== 'not_found') throw error // already gone: same result
    }
    setState(s => ({ ...s, photos: s.photos.filter(p => p.id !== photoId) }))
    await changed.current?.()
  }, [cornerId])

  return { status: state.status, photos: state.photos, error: state.error, busy, upload, tag, remove, refreshUrls }
}
