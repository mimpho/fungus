/**
 * CatalogImagesModal — modal unificado para guardar una imagen generada y/o
 * reordenar las fotos existentes del catálogo.
 *
 * Extracted from ImageGenerator.jsx (v5.4) so it can be reused from
 * SpeciesAdminModal without loading the full generator bundle.
 *
 * DnD: insertion-style — dragging a card causes the others to shift in real
 * time (framer-motion `layout`). Non-passive touch listeners on mobile so
 * we can preventDefault scroll.
 */

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Save, Camera, CheckCircle2, X, Move, Loader2, AlertCircle, Trash2,
} from 'lucide-react'
import { resolveUrl } from '../../lib/helpers'
import { MODAL } from '../../lib/constants'

// ── Helpers ───────────────────────────────────────────────────────────────────

export function photoPosLabel(i) { return i === 0 ? 'Principal' : `Foto ${i}`; }

export function moveItem(arr, from, to) {
  if (from === to || from == null || to == null) return arr;
  const result = [...arr];
  const [item] = result.splice(from, 1);
  result.splice(to, 0, item);
  return result;
}

// ── CatalogImagesModal ────────────────────────────────────────────────────────
//
// Props:
//   species          — SpeciesDetail from DB (source of existing photos)
//   newImageDataUrl  — data: URI of newly generated image, or null
//   newImageMimeType — MIME type of new image, or null
//   applyStatus      — null | 'saving' | 'success' | 'error'
//   onConfirm(urls)  — called with final ordered URL array; parent calls set-order
//   onClose          — close without saving

export function CatalogImagesModal({ species, newImageDataUrl, newImageMimeType, applyStatus, onConfirm, onClose }) {

  // Build initial ordered list of URLs from DB + optional new image.
  // Raw DB URLs are stored as-is (no resolveUrl) so set-order can match them
  // back to their metadata (largeUrl, caption) via exact string lookup.
  // resolveUrl is applied only at render time (src={resolveUrl(url)}).
  function buildInitialPhotos() {
    const result = [];
    const mainUrl = species?.extra_data?.photo?.url ?? species?.photo_url ?? '';
    if (mainUrl) result.push(mainUrl);
    for (const p of (species?.extra_data?.photos ?? [])) {
      const url = p?.url ?? '';
      if (url) result.push(url);
    }
    if (newImageDataUrl) result.unshift(newImageDataUrl); // prepend at position 0
    return result;
  }

  const [photos, setPhotos] = useState(buildInitialPhotos);
  // Re-build when species or its photo data changes (same species ID after a save)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setPhotos(buildInitialPhotos()); }, [species?.id, species?.extra_data, newImageDataUrl]);

  // ── Drag state ──
  const [dragIdx,   setDragIdx]   = useState(null); // original index in photos[]
  const [hoverIdx,  setHoverIdx]  = useState(null); // live target position in photos[]
  const gridRef = useRef(null);

  // Live visual order while dragging — what the user sees
  const visualPhotos = (dragIdx !== null && hoverIdx !== null)
    ? moveItem(photos, dragIdx, hoverIdx)
    : photos;

  // ── HTML5 DnD (desktop) ──
  const _dragOrigIdx  = useRef(null);
  const _hoverIdxRef  = useRef(null);
  const _dropFiredRef = useRef(false);

  function _resetDragState() {
    _dragOrigIdx.current  = null;
    _hoverIdxRef.current  = null;
    _dropFiredRef.current = false;
    setDragIdx(null);
    setHoverIdx(null);
  }

  function handleDragStart(origIdx) {
    _dragOrigIdx.current  = origIdx;
    _hoverIdxRef.current  = origIdx;
    _dropFiredRef.current = false;
    setDragIdx(origIdx);
    setHoverIdx(origIdx);
  }

  function handleDragEnter(origIdx) {
    if (_dragOrigIdx.current === null) return;
    if (origIdx === _dragOrigIdx.current) return;
    if (_hoverIdxRef.current === origIdx) return;
    _hoverIdxRef.current = origIdx;
    setHoverIdx(origIdx);
  }

  function handleDrop(e) {
    e.preventDefault();
    if (_dragOrigIdx.current === null || _dropFiredRef.current) return;
    _dropFiredRef.current = true;
    const from   = _dragOrigIdx.current;
    const target = _hoverIdxRef.current ?? from;
    _resetDragState();
    if (from !== target) {
      setPhotos(prev => moveItem(prev, from, target));
    }
  }

  function handleDragEnd() {
    if (_dragOrigIdx.current !== null) {
      _resetDragState();
    }
  }

  // ── Touch DnD (mobile) — non-passive so we can preventDefault scroll ──
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    let touchSrcOrigIdx = null;

    function origIdxAt(x, y) {
      const el = document.elementFromPoint(x, y);
      const card = el?.closest('[data-origidx]');
      return card ? parseInt(card.dataset.origidx, 10) : null;
    }

    function onTouchStart(e) {
      const card = e.target.closest('[data-origidx]');
      if (!card) return;
      touchSrcOrigIdx = parseInt(card.dataset.origidx, 10);
      setDragIdx(touchSrcOrigIdx);
      setHoverIdx(touchSrcOrigIdx);
    }

    function onTouchMove(e) {
      if (touchSrcOrigIdx === null) return;
      e.preventDefault();
      const t = e.touches[0];
      const oi = origIdxAt(t.clientX, t.clientY);
      if (oi !== null && oi !== touchSrcOrigIdx) setHoverIdx(oi);
    }

    function onTouchEnd(e) {
      if (touchSrcOrigIdx === null) return;
      const t = e.changedTouches[0];
      const oi = origIdxAt(t.clientX, t.clientY);
      const targetHover = (oi !== null && oi !== touchSrcOrigIdx) ? oi : touchSrcOrigIdx;
      setPhotos(prev => moveItem(prev, touchSrcOrigIdx, targetHover));
      touchSrcOrigIdx = null;
      setDragIdx(null);
      setHoverIdx(null);
    }

    grid.addEventListener('touchstart', onTouchStart, { passive: true });
    grid.addEventListener('touchmove',  onTouchMove,  { passive: false });
    grid.addEventListener('touchend',   onTouchEnd,   { passive: true });
    return () => {
      grid.removeEventListener('touchstart', onTouchStart);
      grid.removeEventListener('touchmove',  onTouchMove);
      grid.removeEventListener('touchend',   onTouchEnd);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const busy = applyStatus === 'saving' || applyStatus === 'success';

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end sm:items-start justify-center modal-outer"
      style={{ background: MODAL.overlay, backdropFilter: 'blur(8px)', overflowY: 'auto' }}
      onClick={() => { if (!busy) onClose(); }}
    >
      <div
        className="sm:my-8 w-full max-w-4xl anim-scale modal-inner"
        style={{ background: MODAL.bg }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between border-b border-white/5"
          style={{ background: MODAL.bg }}>
          <div>
            <h2 className="font-display text-xl font-semibold text-cream">
              {newImageDataUrl ? 'Guardar imagen en catálogo' : 'Imágenes del catálogo'}
            </h2>
            <p className="text-muted/70 text-xs italic mt-0.5">{species?.scientific_name}</p>
          </div>
          <button
            onClick={onClose}
            disabled={busy}
            className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">

          {/* Hint */}
          <p className="text-[10px] text-[#d9cda1]/40 text-center uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Move className="w-3 h-3" />
            {newImageDataUrl
              ? 'Ordena las imágenes y confirma para guardar'
              : 'Arrastra para reordenar — las otras imágenes se desplazan en tiempo real'}
          </p>

          {/* Drag grid */}
          <div
            ref={gridRef}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
          >
            {visualPhotos.map((url, visualIdx) => {
              const origIdx  = photos.indexOf(url);
              const isDragging = origIdx === dragIdx;
              const isNewImg   = url === newImageDataUrl;

              return (
                <motion.div
                  key={url}
                  layout
                  transition={{ type: 'spring', stiffness: 400, damping: 30, mass: 0.8 }}
                  data-vidx={visualIdx}
                  data-origidx={origIdx}
                  draggable={!busy}
                  onDragStart={() => handleDragStart(origIdx)}
                  onDragEnter={() => handleDragEnter(origIdx)}
                  onDragOver={e => e.preventDefault()}
                  onDrop={handleDrop}
                  onDragEnd={handleDragEnd}
                  animate={{ opacity: isDragging ? 0.35 : 1, scale: isDragging ? 0.96 : 1 }}
                  className={[
                    'rounded-2xl overflow-hidden border-2 select-none',
                    busy  ? 'cursor-default' : 'cursor-grab active:cursor-grabbing',
                    isNewImg && !isDragging ? 'border-emerald-500/50' : '',
                    !isNewImg && !isDragging ? 'border-white/10'       : '',
                    isDragging              ? 'border-white/10'        : '',
                  ].join(' ')}
                >
                  <div className="aspect-[4/3] bg-black/40 flex items-center justify-center overflow-hidden relative">
                    {url
                      ? <img
                          src={resolveUrl(url)}
                          alt={photoPosLabel(visualIdx)}
                          draggable={false}
                          className="w-full h-full object-cover pointer-events-none"
                          onError={e => { e.currentTarget.style.display = 'none'; }}
                        />
                      : <div className="flex flex-col items-center gap-2 text-[#d9cda1]/15 p-4">
                          <Camera className="w-10 h-10" />
                          <span className="text-[9px] font-bold uppercase tracking-widest">Vacío</span>
                        </div>
                    }
                    {!busy && !isDragging && (
                      <div className="absolute top-2 right-2 opacity-25 pointer-events-none">
                        <Move className="w-4 h-4 text-white drop-shadow" />
                      </div>
                    )}
                    {isNewImg && !isDragging && (
                      <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full shadow pointer-events-none">
                        Nueva
                      </div>
                    )}
                  </div>
                  <div className={`px-4 py-3 flex items-center gap-2 transition-colors ${isNewImg ? 'bg-emerald-900/30' : 'bg-black/40'}`}>
                    <span className="text-xs font-bold uppercase tracking-widest text-[#f4ebe1] flex-1">
                      {photoPosLabel(visualIdx)}
                    </span>
                    {isNewImg && !isDragging && (
                      <span className="text-[9px] text-emerald-400/80 font-bold uppercase tracking-widest">nueva</span>
                    )}
                    {!busy && (
                      <button
                        title="Eliminar imagen"
                        draggable={false}
                        onClick={(e) => {
                          e.stopPropagation();
                          setPhotos(prev => prev.filter((_, i) => i !== origIdx));
                        }}
                        className="p-1.5 rounded-lg text-red-400 hover:text-white hover:bg-red-500/70 transition-all shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Confirm button */}
          <button
            onClick={() => onConfirm(photos)}
            disabled={busy || photos.length === 0}
            className="w-full bg-emerald-700/80 hover:bg-emerald-600/80 text-white rounded-xl py-3.5 text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {applyStatus === 'saving'
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />{newImageDataUrl ? 'Guardando...' : 'Aplicando...'}</>
              : applyStatus === 'success'
              ? <><CheckCircle2 className="w-3.5 h-3.5" />{newImageDataUrl ? 'Guardado' : 'Reorganización aplicada'}</>
              : photos.length === 0
              ? <><Camera className="w-3.5 h-3.5" />Sin imágenes</>
              : <><Save className="w-3.5 h-3.5" />{newImageDataUrl ? 'Confirmar y guardar' : 'Aplicar orden'}</>
            }
          </button>

          {applyStatus === 'error' && (
            <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-500/20 rounded-xl text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Error al guardar. Verifica que tienes permisos de administrador.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CatalogImagesModal;
