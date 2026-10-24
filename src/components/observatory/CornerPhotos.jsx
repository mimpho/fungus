import { Plus } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { useCornerPhotos } from '../../hooks/useCornerPhotos'
import { PHOTOS_MAX } from '../../lib/cornerKinds'
import { PhotoViewer } from './PhotoViewer'
import { photoErrorText } from './photoErrors'
import { SCROLL_THIN } from './CornerSummary'

const SLOT = 'shrink-0 w-[150px] aspect-[4/3] rounded-2xl overflow-hidden'

/**
 * The photos of a saved corner: a row of thumbnails (up to five, scrolling sideways when narrow)
 * and, while there is room, a dashed «Añadir foto» slot that opens the file chooser. Any image
 * format goes (the server converts it and drops the metadata); several files are uploaded one
 * after another up to the free places. A thumbnail opens the viewer, where the photo's mushrooms
 * are tagged and the photo deleted. Takes the corner's `onChanged` to keep its count and species.
 * `variant` 'card' sits in the corner's card (the row bleeds to its edges); 'form' is a section of
 * the edit dialog, with the label the other fields have.
 */
export function CornerPhotos({ corner, onChanged, variant = 'card' }) {
  const { t } = useApp()
  const inputId = useId()
  const inputRef = useRef(null)
  const { status, photos, busy, upload, tag, remove, refreshUrls } = useCornerPhotos(corner.id, corner.photo_count, onChanged)
  const [error, setError] = useState(null)
  const [viewing, setViewing] = useState(null) // index of the photo open in the viewer
  const free = PHOTOS_MAX - photos.length
  const inForm = variant === 'form'

  async function onFiles(e) {
    const files = [...e.target.files].slice(0, Math.max(free, 0))
    e.target.value = '' // the same file can be chosen again
    setError(null)
    for (const file of files) {
      try {
        await upload(file)
      } catch (err) {
        setError(err)
        break
      }
    }
  }

  if (status === 'loading') return <p className="text-sm text-cream/60">{t.obsPhotoLoading}</p>

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <h4 className={inForm ? 'text-xs font-medium text-cream/70' : 'text-[11px] uppercase tracking-[1.4px] font-medium text-coffee-light'}>{t.obsPhotos}</h4>
        <span className={inForm ? 'text-xs text-cream/50' : 'text-[11px] text-cream/60'}>{photos.length} / {PHOTOS_MAX}</span>
      </div>
      <ul className={`flex gap-2 overflow-x-auto pb-1.5 ${inForm ? '' : '-mx-4 px-4'} ${SCROLL_THIN}`} aria-label={t.obsPhotos}>
        {photos.map((photo, i) => (
          <li key={photo.id} className={SLOT}>
            <button
              type="button"
              onClick={() => setViewing(i)}
              aria-haspopup="dialog"
              aria-label={t.obsPhotoOpen.replace('{n}', i + 1).replace('{total}', photos.length)}
              className="block w-full h-full bg-cream/[0.08] focus-visible:ring-2 focus-visible:ring-cream/40 outline-none"
            >
              {photo.thumb_url && (
                <img
                  src={photo.thumb_url}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  onError={refreshUrls}
                  className="w-full h-full object-cover"
                />
              )}
            </button>
          </li>
        ))}
        {free > 0 && (
          <li className={SLOT}>
            <label
              htmlFor={inputId}
              className={`flex flex-col items-center justify-center gap-1.5 w-full h-full border-2 border-dashed border-cream/25 rounded-2xl text-sm text-cream/80 transition-colors focus-within:ring-2 focus-within:ring-cream/40 ${busy ? 'opacity-60 cursor-wait' : 'cursor-pointer hover:border-cream/50 hover:text-cream'}`}
            >
              <Plus size={20} strokeWidth={2} aria-hidden="true" />
              {busy ? t.obsPhotoUploading : t.obsPhotoAdd}
              {/* Any image (HEIC included): the server reads it, so no format is excluded here */}
              <input
                ref={inputRef}
                id={inputId}
                type="file"
                accept="image/*,.heic,.heif"
                multiple
                disabled={busy}
                onChange={onFiles}
                className="sr-only"
              />
            </label>
          </li>
        )}
      </ul>
      {error && <p role="alert" className="text-sm text-cream/90 rounded-xl glass-warm px-3 py-2">{photoErrorText(t, error)}</p>}
      {viewing !== null && photos[viewing] && (
        <PhotoViewer
          photos={photos}
          index={viewing}
          onIndex={setViewing}
          onClose={() => setViewing(null)}
          onTag={tag}
          onDelete={async id => {
            await remove(id)
            setViewing(null)
          }}
        />
      )}
    </div>
  )
}
