import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { useSpeciesRows } from '../../hooks/useSpeciesRows'
import { ObsModal } from './ObsModal'
import { CornerSpeciesPicker } from './CornerSpeciesPicker'
import { BTN_SECONDARY } from './SavedPointParts'
import { photoErrorText } from './photoErrors'

const BTN_PRIMARY = 'px-4 py-2 rounded-xl bg-bar hover:bg-[#a0834d] disabled:opacity-60 disabled:hover:bg-bar text-white text-sm font-medium transition-all'
const ARROW = 'absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass flex items-center justify-center text-cream/80 hover:text-cream transition-colors'

/**
 * One photo of a corner at the large size, with the mushrooms tagged on it. From here the tags
 * are edited (the same search as the corner's own) and the photo deleted after a confirmation.
 * Left and right arrows (and the buttons) move between the corner's photos. `onTag(id, ids)` and
 * `onDelete(id)` return promises; if one throws, the error is shown here and nothing changes.
 */
export function PhotoViewer({ photos, index, onIndex, onClose, onTag, onDelete }) {
  const { t } = useApp()
  const rows = useSpeciesRows()
  const [mode, setMode] = useState('view') // 'view' | 'tag' | 'delete'
  const [draft, setDraft] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const photo = photos[index]
  const names = new Map(rows.map(r => [r.id, r.name]))

  // Moving to another photo leaves any edit behind
  useEffect(() => {
    setMode('view')
    setError(null)
  }, [photo?.id])

  useEffect(() => {
    if (mode !== 'view') return undefined
    const onKey = e => {
      if (e.key === 'ArrowLeft' && index > 0) onIndex(index - 1)
      if (e.key === 'ArrowRight' && index < photos.length - 1) onIndex(index + 1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [mode, index, photos.length, onIndex])

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

  const title = t.obsPhotoViewTitle.replace('{n}', index + 1).replace('{total}', photos.length)

  return (
    <ObsModal title={title} onClose={onClose} size="lg">
      <div className="space-y-4">
        <div className="relative rounded-xl overflow-hidden bg-cream/[0.08]">
          {photo.large_url && <img src={photo.large_url} alt="" className="block w-full max-h-[55vh] object-contain" />}
          {index > 0 && (
            <button type="button" onClick={() => onIndex(index - 1)} aria-label={t.obsPhotoPrev} className={`${ARROW} left-2`}>
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
          )}
          {index < photos.length - 1 && (
            <button type="button" onClick={() => onIndex(index + 1)} aria-label={t.obsPhotoNext} className={`${ARROW} right-2`}>
              <ChevronRight size={20} aria-hidden="true" />
            </button>
          )}
        </div>

        {mode === 'tag' ? (
          <div className="space-y-3">
            <CornerSpeciesPicker value={draft} onChange={setDraft} />
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={saveTags} disabled={busy} className={BTN_PRIMARY}>{t.obsPhotoTagSave}</button>
              <button type="button" onClick={() => setMode('view')} disabled={busy} className={BTN_SECONDARY}>{t.obsSavedKeep}</button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-cream/85 min-h-[1.5rem]">
              {photo.species_ids.length
                ? photo.species_ids.map(id => names.get(id) ?? id).join(' · ')
                : <span className="text-cream/50">{t.obsPhotoNoSpecies}</span>}
            </p>
            {mode === 'delete' ? (
              <div role="alertdialog" aria-label={t.obsPhotoDelete} className="space-y-3">
                <p className="text-sm text-cream/90">{t.obsPhotoDeleteConfirm}</p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => run(() => onDelete(photo.id))} disabled={busy} className={BTN_PRIMARY}>{t.obsPhotoDeleteYes}</button>
                  <button type="button" onClick={() => setMode('view')} disabled={busy} className={BTN_SECONDARY}>{t.obsSavedKeep}</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => { setDraft(photo.species_ids); setMode('tag') }} className={BTN_SECONDARY}>{t.obsPhotoTag}</button>
                <button type="button" onClick={() => setMode('delete')} className={BTN_SECONDARY}>{t.obsPhotoDelete}</button>
              </div>
            )}
          </>
        )}
        {error && <p role="alert" className="text-sm text-cream/90 rounded-xl glass-warm px-3 py-2">{photoErrorText(t, error)}</p>}
      </div>
    </ObsModal>
  )
}
