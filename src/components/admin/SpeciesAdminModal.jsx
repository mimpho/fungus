/**
 * SpeciesAdminModal — modal de especie en el flujo galería-first (v5.4).
 *
 * Modo vista: carga todas las fotos desde el detail raw (evita flash de 1→N).
 *   Click en foto → lightbox con versión -large.
 * Modo reordenar: misma galería con DnD insertion-style (framer-motion layout).
 *   "Reordenar" activa; "Cancelar" / "Guardar orden" lo confirman o anulan.
 *
 * Hover: solo zoom — sin border ni oscurecimiento de imagen.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  X, Wand2, ChevronLeft, ChevronRight, Camera,
  Move, Save, CheckCircle2, Loader2, AlertCircle, Trash2, Check,
} from 'lucide-react'
import { moveItem } from './CatalogImagesModal'
import { resolveUrl } from '../../lib/helpers'
import { MODAL } from '../../lib/constants'
import { API_BASE } from '../../services/apiService'
import { authHeaders } from '../../services/authService'
import { invalidateSpeciesListCache } from '../../hooks/useSpecies'

export default function SpeciesAdminModal({ species, onClose, onGenerate }) {
  // ── Raw detail (backend format) ──────────────────────────────────────────
  const [rawSpecies, setRawSpecies] = useState(null)
  const [loadingRaw, setLoadingRaw] = useState(true)

  useEffect(() => {
    if (!species?.id) return
    setLoadingRaw(true)
    setRawSpecies(null)
    const ctrl = new AbortController()
    fetch(`${API_BASE}/species/${species.id}`, {
      cache: 'no-store', headers: authHeaders(), signal: ctrl.signal,
    })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setRawSpecies(d); setLoadingRaw(false) })
      .catch(() => setLoadingRaw(false))
    return () => ctrl.abort()
  }, [species?.id])

  // ── Photos — built from raw detail only (no fallback → no flash) ──────────
  // committedPhotos: URLs para thumbnails y DnD (raw, sin resolveUrl, para set-order)
  // committedLargePhotos: URLs de alta resolución para el lightbox (-large postfix)
  const { committedPhotos, committedLargePhotos } = useMemo(() => {
    if (!rawSpecies) return { committedPhotos: [], committedLargePhotos: [] }
    const photos = [], largePhotos = []
    const mainUrl   = rawSpecies.extra_data?.photo?.url      ?? rawSpecies.photo_url ?? ''
    const mainLarge = rawSpecies.extra_data?.photo?.largeUrl ?? mainUrl
    if (mainUrl) { photos.push(mainUrl); largePhotos.push(mainLarge) }
    for (const p of (rawSpecies.extra_data?.photos ?? [])) {
      const u = p?.url ?? ''; if (!u) continue
      photos.push(u)
      largePhotos.push(p?.largeUrl ?? u)
    }
    return { committedPhotos: photos, committedLargePhotos: largePhotos }
  }, [rawSpecies])

  // ── UI state ─────────────────────────────────────────────────────────────
  const [lightboxIdx,     setLightboxIdx]     = useState(null)
  const [reorderMode,     setReorderMode]     = useState(false)
  const [reorderedUrls,   setReorderedUrls]   = useState([])
  const [deleteMode,      setDeleteMode]      = useState(false)
  const [selectedToDelete, setSelectedToDelete] = useState(new Set())
  const [applyStatus,     setApplyStatus]     = useState(null)

  // ── DnD ──────────────────────────────────────────────────────────────────
  const [dragIdx,  setDragIdx]  = useState(null)
  const [hoverIdx, setHoverIdx] = useState(null)
  const gridRef = useRef(null)
  const _dragOrigIdx  = useRef(null)
  const _hoverIdxRef  = useRef(null)
  const _dropFiredRef = useRef(false)

  const displayPhotos = reorderMode
    ? (dragIdx !== null && hoverIdx !== null
        ? moveItem(reorderedUrls, dragIdx, hoverIdx)
        : reorderedUrls)
    : committedPhotos

  function _resetDrag() {
    _dragOrigIdx.current = _hoverIdxRef.current = null
    _dropFiredRef.current = false
    setDragIdx(null); setHoverIdx(null)
  }
  function handleDragStart(oi) {
    _dragOrigIdx.current = oi; _hoverIdxRef.current = oi; _dropFiredRef.current = false
    setDragIdx(oi); setHoverIdx(oi)
  }
  function handleDragEnter(oi) {
    if (_dragOrigIdx.current === null || oi === _dragOrigIdx.current) return
    if (_hoverIdxRef.current === oi) return
    _hoverIdxRef.current = oi; setHoverIdx(oi)
  }
  function handleDrop(e) {
    e.preventDefault()
    if (_dragOrigIdx.current === null || _dropFiredRef.current) return
    _dropFiredRef.current = true
    const from = _dragOrigIdx.current, to = _hoverIdxRef.current ?? from
    _resetDrag()
    if (from !== to) setReorderedUrls(prev => moveItem(prev, from, to))
  }
  function handleDragEnd() { if (_dragOrigIdx.current !== null) _resetDrag() }

  // Touch DnD (non-passive)
  useEffect(() => {
    if (!reorderMode) return
    const grid = gridRef.current; if (!grid) return
    let src = null
    const oi = (x, y) => {
      const el = document.elementFromPoint(x, y)?.closest('[data-origidx]')
      return el ? parseInt(el.dataset.origidx, 10) : null
    }
    const onTS = (e) => {
      const c = e.target.closest('[data-origidx]'); if (!c) return
      src = parseInt(c.dataset.origidx, 10); setDragIdx(src); setHoverIdx(src)
    }
    const onTM = (e) => {
      if (src === null) return; e.preventDefault()
      const t = e.touches[0], o = oi(t.clientX, t.clientY)
      if (o !== null && o !== src) setHoverIdx(o)
    }
    const onTE = (e) => {
      if (src === null) return
      const t = e.changedTouches[0], o = oi(t.clientX, t.clientY)
      const target = (o !== null && o !== src) ? o : src
      setReorderedUrls(prev => moveItem(prev, src, target))
      src = null; setDragIdx(null); setHoverIdx(null)
    }
    grid.addEventListener('touchstart', onTS, { passive: true })
    grid.addEventListener('touchmove',  onTM, { passive: false })
    grid.addEventListener('touchend',   onTE, { passive: true })
    return () => {
      grid.removeEventListener('touchstart', onTS)
      grid.removeEventListener('touchmove',  onTM)
      grid.removeEventListener('touchend',   onTE)
    }
  }, [reorderMode])

  // ── Reorder actions ───────────────────────────────────────────────────────
  const startReorder = () => {
    setReorderedUrls([...committedPhotos])
    setReorderMode(true)
    setApplyStatus(null)
  }
  const cancelReorder = () => {
    setReorderMode(false); setReorderedUrls([]); _resetDrag(); setApplyStatus(null)
  }
  const saveOrder = async () => {
    if (!rawSpecies) return
    setApplyStatus('saving')
    try {
      const res = await fetch(`${API_BASE}/species/${rawSpecies.id}/images/set-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ photos: reorderedUrls }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || `Error ${res.status}`)
      setRawSpecies(await res.json())
      invalidateSpeciesListCache()
      setApplyStatus('success')
      setTimeout(() => { setReorderMode(false); setReorderedUrls([]); setApplyStatus(null) }, 1200)
    } catch (err) {
      console.error('Error saving order:', err)
      setApplyStatus('error')
    }
  }

  // ── Delete actions ────────────────────────────────────────────────────────
  const startDelete = () => {
    setDeleteMode(true)
    setSelectedToDelete(new Set())
    setApplyStatus(null)
  }
  const cancelDelete = () => {
    setDeleteMode(false); setSelectedToDelete(new Set()); setApplyStatus(null)
  }
  const toggleDeleteSelect = (idx) => {
    setSelectedToDelete(prev => {
      const next = new Set(prev)
      next.has(idx) ? next.delete(idx) : next.add(idx)
      return next
    })
  }
  const confirmDelete = async () => {
    if (!rawSpecies || selectedToDelete.size === 0) return
    const remaining = committedPhotos.filter((_, i) => !selectedToDelete.has(i))
    setApplyStatus('saving')
    try {
      const res = await fetch(`${API_BASE}/species/${rawSpecies.id}/images/set-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ photos: remaining }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || `Error ${res.status}`)
      setRawSpecies(await res.json())
      invalidateSpeciesListCache()
      setApplyStatus('success')
      setTimeout(() => { setDeleteMode(false); setSelectedToDelete(new Set()); setApplyStatus(null) }, 1200)
    } catch (err) {
      console.error('Error deleting photos:', err)
      setApplyStatus('error')
    }
  }

  // ── Lightbox navigation ───────────────────────────────────────────────────
  const lightboxPrev = useCallback(() =>
    setLightboxIdx(i => (i > 0 ? i - 1 : committedPhotos.length - 1)),
    [committedPhotos.length])
  const lightboxNext = useCallback(() =>
    setLightboxIdx(i => (i < committedPhotos.length - 1 ? i + 1 : 0)),
    [committedPhotos.length])

  // ── Keyboard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'Escape') {
        if (lightboxIdx !== null) { setLightboxIdx(null); return }
        if (reorderMode) { cancelReorder(); return }
        if (deleteMode) { cancelDelete(); return }
        onClose()
      }
      if (lightboxIdx !== null) {
        if (e.key === 'ArrowLeft')  lightboxPrev()
        if (e.key === 'ArrowRight') lightboxNext()
      }
    }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxIdx, reorderMode, deleteMode, lightboxPrev, lightboxNext, onClose])

  const busy = applyStatus === 'saving' || applyStatus === 'success'

  const gridCols = committedPhotos.length <= 1 ? 'grid-cols-1'
    : committedPhotos.length === 2 ? 'grid-cols-2'
    : 'grid-cols-3'

  return (
    <>
      {/* ── Modal — max-w-3xl para thumbnails más grandes ── */}
      <div
        className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center modal-outer"
        style={{ background: MODAL.overlay, backdropFilter: 'blur(8px)', overflowY: 'auto' }}
        onClick={() => { if (!reorderMode && !deleteMode) onClose() }}
      >
        <div
          className="sm:my-8 w-full max-w-3xl rounded-t-3xl sm:rounded-3xl overflow-hidden anim-scale modal-inner"
          style={{ background: MODAL.bg }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="sticky top-0 z-10 px-6 py-5 flex items-start justify-between border-b border-white/5"
            style={{ background: MODAL.bg }}
          >
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cream/40 mb-1">{species?.family}</p>
              <h2 className="font-display text-2xl font-semibold text-cream italic leading-tight truncate">
                {species?.scientificName}
              </h2>
              <p className="text-cream/30 text-xs font-mono mt-0.5">{species?.id}</p>
            </div>
            <button
              onClick={() => { if (reorderMode) cancelReorder(); else if (deleteMode) cancelDelete(); else onClose() }}
              className="shrink-0 ml-4 p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">

            {/* Mode hints */}
            {reorderMode && (
              <p className="text-[10px] text-cream/40 text-center uppercase tracking-widest flex items-center justify-center gap-1.5">
                <Move className="w-3 h-3" />
                Arrastra para reordenar
              </p>
            )}
            {deleteMode && (
              <p className="text-[10px] text-cream/40 text-center uppercase tracking-widest flex items-center justify-center gap-1.5">
                <Trash2 className="w-3 h-3" />
                Toca las imágenes que quieres eliminar
              </p>
            )}

            {/* Photo grid or loading state */}
            {loadingRaw ? (
              /* Skeleton mientras llega el detail */
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2].map(i => (
                  <div key={i} className="aspect-[4/3] rounded-2xl bg-white/[0.04] animate-pulse" />
                ))}
              </div>
            ) : committedPhotos.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10 text-cream/20">
                <Camera className="w-12 h-12" />
                <p className="text-sm">Sin fotos en catálogo</p>
              </div>
            ) : (
              <div>
                {!reorderMode && (
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-cream/40 mb-3">
                    {committedPhotos.length} foto{committedPhotos.length !== 1 ? 's' : ''} en catálogo
                  </p>
                )}

                <div
                  ref={gridRef}
                  className={`grid ${gridCols} gap-3`}
                  onDragOver={e => e.preventDefault()}
                  onDrop={handleDrop}
                >
                  {displayPhotos.map((url, visualIdx) => {
                    const origIdx    = reorderMode ? reorderedUrls.indexOf(url) : visualIdx
                    const isDragging = reorderMode && origIdx === dragIdx

                    return (
                      <motion.div
                        key={url}
                        layout={reorderMode}
                        transition={reorderMode
                          ? { type: 'spring', stiffness: 400, damping: 30, mass: 0.8 }
                          : undefined
                        }
                        data-origidx={origIdx}
                        draggable={reorderMode && !busy}
                        onDragStart={reorderMode ? () => handleDragStart(origIdx) : undefined}
                        onDragEnter={reorderMode ? () => handleDragEnter(origIdx) : undefined}
                        onDragOver={reorderMode  ? e => e.preventDefault() : undefined}
                        onDrop={reorderMode      ? handleDrop : undefined}
                        onDragEnd={reorderMode   ? handleDragEnd : undefined}
                        animate={reorderMode
                          ? { opacity: isDragging ? 0.35 : 1, scale: isDragging ? 0.96 : 1 }
                          : undefined
                        }
                        className={[
                          'group relative aspect-[4/3] rounded-2xl overflow-hidden bg-black/30 select-none',
                          reorderMode
                            ? (busy ? 'cursor-default' : 'cursor-grab active:cursor-grabbing')
                            : deleteMode
                            ? 'cursor-pointer'
                            : 'cursor-pointer hover-lift',
                          reorderMode && isDragging ? 'ring-1 ring-white/20' : '',
                          deleteMode && selectedToDelete.has(visualIdx) ? 'ring-2 ring-red-500/70' : '',
                        ].join(' ')}
                        style={!reorderMode ? { transition: 'transform 0.2s ease, box-shadow 0.2s ease' } : undefined}
                        onClick={
                          reorderMode ? undefined
                          : deleteMode ? () => toggleDeleteSelect(visualIdx)
                          : () => setLightboxIdx(visualIdx)
                        }
                      >
                        <img
                          src={resolveUrl(url)}
                          alt={visualIdx === 0 ? 'Principal' : `Foto ${visualIdx}`}
                          draggable={false}
                          className={`w-full h-full object-cover pointer-events-none ${!reorderMode ? 'group-hover:scale-105 transition-transform duration-500' : ''}`}
                          loading="lazy"
                          onError={e => { e.currentTarget.style.display = 'none' }}
                        />

                        {/* Drag handle */}
                        {reorderMode && !isDragging && !busy && (
                          <div className="absolute top-2 right-2 opacity-30 pointer-events-none">
                            <Move className="w-4 h-4 text-white drop-shadow" />
                          </div>
                        )}

                        {/* Position label */}
                        <div className={`absolute bottom-2 left-2 transition-opacity ${reorderMode ? 'opacity-100' : deleteMode ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
                          <span className="text-[8px] font-bold uppercase tracking-widest text-white/70 bg-black/50 px-2 py-0.5 rounded-full">
                            {visualIdx === 0 ? 'Principal' : `Foto ${visualIdx}`}
                          </span>
                        </div>

                        {/* Delete mode — selection overlay */}
                        {deleteMode && (
                          <>
                            {selectedToDelete.has(visualIdx) && (
                              <div className="absolute inset-0 bg-red-500/25 pointer-events-none" />
                            )}
                            <div className="absolute top-2 right-2 pointer-events-none">
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                selectedToDelete.has(visualIdx)
                                  ? 'bg-red-500 border-red-400 shadow-lg'
                                  : 'bg-black/50 border-white/40'
                              }`}>
                                {selectedToDelete.has(visualIdx) && <Check className="w-3.5 h-3.5 text-white" />}
                              </div>
                            </div>
                          </>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Error */}
            {applyStatus === 'error' && (
              <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-500/20 rounded-xl text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Error al guardar. Verifica que tienes permisos de administrador.</span>
              </div>
            )}

            {/* Action bar */}
            {reorderMode ? (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={cancelReorder}
                  disabled={busy}
                  className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-2xl py-4 text-xs font-bold uppercase tracking-widest text-cream/70 hover:text-cream hover:bg-white/10 transition-all disabled:opacity-40"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
                <button
                  onClick={saveOrder}
                  disabled={busy || committedPhotos.length === 0}
                  className="flex items-center justify-center gap-2 bg-emerald-700/80 hover:bg-emerald-600/80 text-white rounded-2xl py-4 text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-black/20"
                >
                  {applyStatus === 'saving'
                    ? <><Loader2 className="w-4 h-4 animate-spin" />Guardando...</>
                    : applyStatus === 'success'
                    ? <><CheckCircle2 className="w-4 h-4" />Guardado</>
                    : <><Save className="w-4 h-4" />Guardar orden</>
                  }
                </button>
              </div>
            ) : deleteMode ? (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={cancelDelete}
                  disabled={busy}
                  className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-2xl py-4 text-xs font-bold uppercase tracking-widest text-cream/70 hover:text-cream hover:bg-white/10 transition-all disabled:opacity-40"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={busy || selectedToDelete.size === 0}
                  className="flex items-center justify-center gap-2 bg-red-700/80 hover:bg-red-600/80 text-white rounded-2xl py-4 text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-black/20"
                >
                  {applyStatus === 'saving'
                    ? <><Loader2 className="w-4 h-4 animate-spin" />Eliminando...</>
                    : applyStatus === 'success'
                    ? <><CheckCircle2 className="w-4 h-4" />Eliminado</>
                    : <><Trash2 className="w-4 h-4" />
                        Eliminar{selectedToDelete.size > 0 ? ` (${selectedToDelete.size})` : ''}
                      </>
                  }
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3 pt-1">
                <button
                  onClick={startReorder}
                  disabled={loadingRaw || committedPhotos.length < 2}
                  className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-2xl py-4 text-xs font-bold uppercase tracking-widest text-cream/70 hover:text-cream hover:bg-white/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  title={committedPhotos.length < 2 ? 'Se necesitan al menos 2 fotos para reordenar' : undefined}
                >
                  <Move className="w-4 h-4" />
                  Reordenar
                </button>
                <button
                  onClick={startDelete}
                  disabled={loadingRaw || committedPhotos.length === 0}
                  className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-2xl py-4 text-xs font-bold uppercase tracking-widest text-red-400/70 hover:text-red-300 hover:bg-red-500/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                  Borrar
                </button>
                <button
                  onClick={() => onGenerate(species.id)}
                  className="flex items-center justify-center gap-2 bg-[#f4ebe1] text-[#1a1a1a] rounded-2xl py-4 text-xs font-bold uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-black/30 active:scale-[0.98]"
                >
                  <Wand2 className="w-4 h-4" />
                  Generar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Lightbox — usa largeUrl para máxima calidad ── */}
      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-xl flex items-center justify-center"
          onClick={() => setLightboxIdx(null)}
        >
          <img
            src={resolveUrl(committedLargePhotos[lightboxIdx] || committedPhotos[lightboxIdx])}
            alt=""
            className="max-w-full max-h-full object-contain"
            onClick={e => e.stopPropagation()}
          />
          {committedPhotos.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); lightboxPrev() }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white hover:bg-black/80 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={e => { e.stopPropagation(); lightboxNext() }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white hover:bg-black/80 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
                {committedPhotos.map((_, i) => (
                  <button
                    key={i}
                    onClick={e => { e.stopPropagation(); setLightboxIdx(i) }}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${i === lightboxIdx ? 'bg-white' : 'bg-white/30'}`}
                  />
                ))}
              </div>
            </>
          )}
          <button
            onClick={() => setLightboxIdx(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  )
}
