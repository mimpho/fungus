import { ChevronLeft, ChevronRight, Tag, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useApp } from '../../contexts/AppContext'
import { useSpeciesRows } from '../../hooks/useSpeciesRows'
import { IC } from '../../lib/helpers'
import { dialogsAboveCount, useDialogAboveObsModal } from './ObsModal'
import { CornerSpeciesPicker } from './CornerSpeciesPicker'
import { photoErrorText } from './photoErrors'

const ICON_BTN = 'p-2 rounded-xl hover:bg-white/10 text-cream/70 hover:text-cream disabled:opacity-60 transition-colors'
const OVERLAY_BTN = 'px-4 py-2 rounded-xl bg-transparent border border-white/70 hover:bg-white/10 hover:border-white disabled:opacity-60 disabled:hover:bg-transparent text-white text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white/50'
const ARROW = 'hidden sm:flex absolute top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full glass items-center justify-center text-cream/70 hover:text-cream hover:bg-white/10 transition-all'

/**
 * One photo of a corner in full screen, like the photo viewer of a species' sheet (black
 * backdrop, the picture as large as it fits, arrows, swipe, Esc), with the two actions as icons at the top right (tag mushrooms, with the same
 * search as the corner's own, and delete the photo) and the name of the tagged
 * mushroom centred under the picture. Tagging and the confirmation of the delete are dialogs over
 * the whole viewer, so the photo is not left half done by closing it. Left and right arrows
 * (and the buttons) move between the corner's photos. `onTag(id, ids)` and `onDelete(id)` return
 * promises; if one throws, the error is shown here and nothing changes. Without them the viewer only
 * shows the photos (the card and the map's panel both pass them).
 * It is drawn above the dialogs of the Observatory (z 200) and below the species' sheet (z 300),
 * so a tagged mushroom's sheet can open over it. Esc goes back from tagging or deleting to the
 * photo, and from the photo closes the viewer; the dialog under it does not hear it.
 */
export function PhotoViewer({ photos, index, onIndex, onClose, onTag, onDelete }) {
  const { t } = useApp()
  useDialogAboveObsModal()
  const rows = useSpeciesRows()
  const [mode, setMode] = useState('view') // 'view' | 'tag' | 'delete'
  const [draft, setDraft] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const touch = useRef(null)
  const photo = photos[index]
  const byId = new Map(rows.map(r => [r.id, r]))
  const tagged = photo.species_ids.map(id => byId.get(id) ?? { id, name: id, scientific: '', photo: null })

  // Moving to another photo leaves any edit behind
  useEffect(() => {
    setMode('view')
    setError(null)
  }, [photo?.id])

  useEffect(() => {
    const onKey = e => {
      if (dialogsAboveCount() > 1) return // a species' sheet is open over the viewer: the keys are its own
      if (e.key === 'Escape') {
        e.stopPropagation()
        if (busy) return
        if (mode === 'view') onClose()
        else setMode('view')
      }
      if (mode !== 'view') return
      if (e.key === 'ArrowLeft' && index > 0) onIndex(index - 1)
      if (e.key === 'ArrowRight' && index < photos.length - 1) onIndex(index + 1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [mode, busy, index, photos.length, onIndex, onClose])

  async function run(action) {
    setBusy(true)
    setError(null)
    try {
      await action()
      return true
    } catch (err) {
      setError(err)
      return false
    } finally {
      setBusy(false)
    }
  }

  async function saveTags() {
    if (await run(() => onTag(photo.id, draft))) setMode('view')
  }

  function onTouchEnd(e) {
    const start = touch.current
    touch.current = null
    if (!start || mode !== 'view') return
    const dx = e.changedTouches[0].clientX - start.x
    const dy = e.changedTouches[0].clientY - start.y
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0 && index < photos.length - 1) onIndex(index + 1)
      if (dx > 0 && index > 0) onIndex(index - 1)
    }
  }

  const title = t.obsPhotoViewTitle.replace('{n}', index + 1).replace('{total}', photos.length)

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[250] flex flex-col"
      style={{ background: 'rgba(0,0,0,0.96)' }}
      onClick={() => { if (mode === 'view') onClose() }}
    >
      <div className="flex items-center justify-between px-6 py-4 shrink-0" onClick={e => e.stopPropagation()}>
        <span className="text-cream/60 text-sm font-medium">{index + 1} / {photos.length}</span>
        <div className="flex items-center gap-1">
          {mode === 'view' && onTag && onDelete && (
            <>
              <button
                type="button"
                onClick={() => { setDraft(photo.species_ids); setMode('tag') }}
                aria-label={t.obsPhotoTag}
                title={t.obsPhotoTag}
                className={ICON_BTN}
              >
                <Tag size={20} aria-hidden="true" />
              </button>
              <button type="button" onClick={() => setMode('delete')} aria-label={t.obsPhotoDelete} title={t.obsPhotoDelete} className={ICON_BTN}>
                <Trash2 size={20} aria-hidden="true" />
              </button>
            </>
          )}
          <button type="button" onClick={onClose} disabled={busy} aria-label={t.obsPointClose} className={ICON_BTN}>
            {IC.close}
          </button>
        </div>
      </div>

      <div
        className="flex-1 min-h-0 relative flex items-center justify-center overflow-hidden"
        onClick={e => e.stopPropagation()}
        onTouchStart={e => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY } }}
        onTouchEnd={onTouchEnd}
      >
        {index > 0 && mode === 'view' && (
          <button type="button" onClick={() => onIndex(index - 1)} aria-label={t.obsPhotoPrev} className={`${ARROW} left-4`}>
            <ChevronLeft size={22} aria-hidden="true" />
          </button>
        )}
        {photo.large_url && <img key={photo.id} src={photo.large_url} alt="" className="w-full h-full object-contain" />}
        {index < photos.length - 1 && mode === 'view' && (
          <button type="button" onClick={() => onIndex(index + 1)} aria-label={t.obsPhotoNext} className={`${ARROW} right-4`}>
            <ChevronRight size={22} aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="shrink-0 mx-auto w-full max-w-3xl px-4 pt-3 pb-5 min-h-[4.5rem] flex flex-col items-center justify-center gap-3 text-center" onClick={e => e.stopPropagation()}>
        {tagged.length > 0 ? (
          <ul className="flex flex-wrap justify-center gap-x-8 gap-y-2" aria-label={t.obsCornerSpecies}>
            {tagged.map(r => (
              <li key={r.id}>
                <span className="block text-base text-cream">{r.name}</span>
                {r.scientific && r.scientific !== r.name && <span className="block text-xs italic text-cream/55">{r.scientific}</span>}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {mode !== 'view' && (
        // Over the whole viewport (counter, close button, picture and name stay under it, dimmed): tagging or
        // deleting is finished or cancelled first. The title sits on the line of the counter and the close button, the content a third of the way down, with no card of its own.
        <div
          className="absolute inset-0 z-30 flex items-start justify-center px-4 pt-[33vh] bg-black/80 backdrop-blur-sm"
          onClick={e => { e.stopPropagation(); if (e.target === e.currentTarget && !busy) setMode('view') }}
        >
          <h2 className="absolute top-0 left-0 right-0 px-6 py-4 pointer-events-none">
            <span className="flex h-9 items-center justify-center font-display text-xl font-semibold text-cream">
              {mode === 'delete' ? t.obsPhotoDelete : t.obsPhotoTag}
            </span>
          </h2>
          <div
            role={mode === 'delete' ? 'alertdialog' : 'dialog'}
            aria-modal="true"
            aria-label={mode === 'delete' ? t.obsPhotoDelete : t.obsPhotoTag}
            className="w-full max-w-lg space-y-4 text-center"
          >
            {mode === 'tag' ? (
              <>
                <CornerSpeciesPicker value={draft} onChange={setDraft} withPhotos />
                <div className="flex flex-wrap justify-center gap-2">
                  <button type="button" onClick={saveTags} disabled={busy} className={OVERLAY_BTN}>{t.obsPhotoTagSave}</button>
                  <button type="button" onClick={() => setMode('view')} disabled={busy} className={OVERLAY_BTN}>{t.obsSavedKeep}</button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-cream/90">{t.obsPhotoDeleteConfirm}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <button type="button" onClick={() => run(() => onDelete(photo.id))} disabled={busy} className={OVERLAY_BTN}>{t.obsPhotoDeleteYes}</button>
                  <button type="button" onClick={() => setMode('view')} disabled={busy} className={OVERLAY_BTN}>{t.obsSavedKeep}</button>
                </div>
              </>
            )}
            {error && <p role="alert" className="text-sm text-cream/90 rounded-xl glass-warm px-3 py-2">{photoErrorText(t, error)}</p>}
          </div>
        </div>
      )}
    </div>,
    document.body,
  )
}
