import { Plus } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { useCornerPhotos } from '../../hooks/useCornerPhotos'
import { PHOTOS_MAX } from '../../lib/cornerKinds'
import { PhotoViewer } from './PhotoViewer'
import { photoErrorText } from './photoErrors'
import { SCROLL_THIN } from './scrollStyles'

/** A file the browser says is an image, or a HEIC/HEIF (often reported with no type at all). */
const isImage = f => f.type.startsWith('image/') || /\.(heic|heif)$/i.test(f.name)

const SLOT = 'shrink-0 w-[150px] aspect-[4/3] rounded-2xl overflow-hidden'
/** The thumbnails row runs edge to edge of its container (negative margin = the container's padding); the first one starts where the content does (the same padding on the row). */
const BLEED = { card: '-mx-4 px-4', form: '-mx-6 px-6', strip: '-mx-4 px-4' }
const SLOT_SMALL = 'shrink-0 w-[133px] h-[100px] rounded-xl overflow-hidden'

/**
 * The photos of a saved corner: a row of thumbnails (up to five, scrolling sideways when narrow)
 * and, while there is room, a dashed «Añadir foto» slot that opens the file chooser. Any image
 * format goes (the server converts it and drops the metadata); several files, chosen together or
 * dropped on the section, are uploaded one after another up to the free places, and a notice says
 * how many were left out when there are more than fit. A thumbnail opens the viewer, where the photo's mushrooms
 * are tagged and the photo deleted. Takes the corner's `onChanged` to keep its count and species.
 * `variant` 'card' sits in the corner's card (the row bleeds to its edges); 'form' is a section of
 * the edit dialog, with the label the other fields have; 'strip' is the map panel's: small
 * thumbnails (nothing for a corner without photos) that open the same viewer, where they are tagged and deleted (adding is in the card and the edit dialog).
 */
export function CornerPhotos({ corner, onChanged, variant = 'card' }) {
  const { t } = useApp()
  const inputId = useId()
  const { status, photos, upload, tag, remove, refreshUrls } = useCornerPhotos(corner.id, corner.photo_count, onChanged, corner.updated_at)
  const [error, setError] = useState(null) // an ObservatoryError
  const [notice, setNotice] = useState(null) // plain text (overflow, skipped files)
  const [progress, setProgress] = useState(null) // { i, total } while a batch uploads
  const [dragging, setDragging] = useState(false)
  const [viewing, setViewing] = useState(null) // index of the photo open in the viewer
  const photosRef = useRef(photos)
  photosRef.current = photos
  const working = progress !== null
  const free = PHOTOS_MAX - photos.length
  const inForm = variant === 'form'
  const strip = variant === 'strip'

  /** Uploads the chosen or dropped files one after another, up to the free places. */
  async function addFiles(fileList) {
    if (working) return
    setError(null)
    setNotice(null)
    const images = [...fileList].filter(isImage)
    if (images.length === 0) {
      if (fileList.length > 0) setError({ kind: 'unsupported' })
      return
    }
    const room = Math.max(PHOTOS_MAX - photosRef.current.length, 0)
    if (room === 0) {
      setError({ kind: 'conflict' })
      return
    }
    const batch = images.slice(0, room)
    let done = 0
    let skipped = 0
    let stopped = false
    let lastError = null
    for (let i = 0; i < batch.length; i++) {
      setProgress({ i: i + 1, total: batch.length })
      try {
        await upload(batch[i])
        done++
      } catch (err) {
        // A file the server cannot take (too big, not readable) leaves the others to go on;
        // a full corner, the daily limit, storage or the network failing stops the batch
        if (err?.kind === 'too_large' || err?.kind === 'unsupported') {
          skipped++
          lastError = err
        } else {
          lastError = err
          stopped = true
          break
        }
      }
    }
    setProgress(null)
    const messages = []
    if (images.length > room) {
      messages.push(t.obsPhotoOverflow.replace('{max}', PHOTOS_MAX).replace('{done}', done).replace('{rest}', images.length - batch.length))
    }
    // Skipped files get a count; the reason (or what stopped the batch) is the last error
    if (skipped > 0 && !stopped) messages.push(t.obsPhotoSkipped.replace('{n}', skipped))
    if (lastError) setError(lastError)
    if (messages.length) setNotice(messages.join(' '))
  }

  function onFiles(e) {
    const files = [...e.target.files]
    e.target.value = '' // the same file can be chosen again
    addFiles(files)
  }

  const hasFiles = e => [...(e.dataTransfer?.types ?? [])].includes('Files')
  const dropProps = {
    onDragEnter: e => { if (hasFiles(e)) { e.preventDefault(); setDragging(true) } },
    onDragOver: e => { if (hasFiles(e)) { e.preventDefault(); e.dataTransfer.dropEffect = 'copy' } },
    onDragLeave: e => { if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false) },
    onDrop: e => {
      if (!hasFiles(e)) return
      e.preventDefault()
      setDragging(false)
      addFiles(e.dataTransfer.files)
    },
  }

  if (strip) {
    if (photos.length === 0) {
      // The corner says how many photos it has before they are read: while they load the row keeps its
      // height with empty slots, so the panel does not jump when the thumbnails arrive
      const waiting = corner.photo_count > 0 && (status === 'idle' || status === 'loading')
      if (!waiting) return null
      return (
        <ul aria-hidden="true" className={`flex gap-2 overflow-x-auto pb-1.5 ${BLEED.strip} ${SCROLL_THIN}`} data-testid="corner-photos-placeholder">
          {Array.from({ length: Math.min(corner.photo_count, PHOTOS_MAX) }, (_, i) => (
            <li key={i} className={`${SLOT_SMALL} bg-cream/[0.08] animate-pulse`} />
          ))}
        </ul>
      )
    }
    return (
      <>
        <ul className={`flex gap-2 overflow-x-auto pb-1.5 ${BLEED.strip} ${SCROLL_THIN}`} aria-label={t.obsPhotos} data-testid="corner-photos-strip">
          {photos.map((photo, i) => (
            <li key={photo.id} className={SLOT_SMALL}>
              <button
                type="button"
                onClick={() => setViewing(i)}
                aria-haspopup="dialog"
                aria-label={t.obsPhotoOpen.replace('{n}', i + 1).replace('{total}', photos.length)}
                className="block w-full h-full bg-cream/[0.08] focus-visible:ring-2 focus-visible:ring-cream/40 outline-none"
              >
                {photo.thumb_url && (
                  <img src={photo.thumb_url} alt="" loading="lazy" decoding="async" onError={refreshUrls} className="w-full h-full object-cover" />
                )}
              </button>
            </li>
          ))}
        </ul>
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
      </>
    )
  }

  if (status === 'loading') return <p className="text-sm text-cream/60">{t.obsPhotoLoading}</p>

  return (
    <div {...dropProps} className={`space-y-2 relative rounded-2xl transition-shadow ${dragging ? 'ring-2 ring-cream/50 ring-offset-4 ring-offset-transparent' : ''}`}>
      {dragging && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-modal/85 text-sm font-medium text-cream pointer-events-none">
          {t.obsPhotoDrop}
        </div>
      )}
      <div className="flex items-center justify-between gap-3">
        <h4 className={inForm ? 'text-xs font-medium text-cream/70' : 'text-[11px] uppercase tracking-[1.4px] font-medium text-coffee-light'}>{t.obsPhotos}</h4>
        <span className={inForm ? 'text-xs text-cream/50' : 'text-[11px] text-cream/60'}>{photos.length} / {PHOTOS_MAX}</span>
      </div>
      <ul className={`flex gap-2 overflow-x-auto pb-1.5 ${inForm ? BLEED.form : BLEED.card} ${SCROLL_THIN}`} aria-label={t.obsPhotos}>
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
              className={`flex flex-col items-center justify-center gap-1.5 w-full h-full border-2 border-dashed border-cream/25 rounded-2xl text-sm text-cream/80 transition-colors focus-within:ring-2 focus-within:ring-cream/40 ${working ? 'opacity-60 cursor-wait' : 'cursor-pointer hover:border-cream/50 hover:text-cream'}`}
            >
              <Plus size={20} strokeWidth={2} aria-hidden="true" />
              {working ? t.obsPhotoUploadingN.replace('{i}', progress.i).replace('{total}', progress.total) : t.obsPhotoAdd}
              {/* Any image (HEIC included): the server reads it, so no format is excluded here */}
              <input
                id={inputId}
                type="file"
                accept="image/*,.heic,.heif"
                multiple
                disabled={working}
                onChange={onFiles}
                className="sr-only"
              />
            </label>
          </li>
        )}
      </ul>
      {notice && <p role="status" className="text-sm text-cream/90 rounded-xl glass-warm px-3 py-2">{notice}</p>}
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
