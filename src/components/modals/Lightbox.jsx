import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { IC } from '../../lib/helpers'

export function Lightbox({ photos, initialIndex = 0, onClose }) {
  const [idx, setIdx] = useState(initialIndex)
  const touchStartX = useRef(null)
  const touchStartY = useRef(null)

  const prev = useCallback(() => setIdx(i => (i - 1 + photos.length) % photos.length), [photos.length])
  const next = useCallback(() => setIdx(i => (i + 1) % photos.length), [photos.length])

  useEffect(() => {
    const handleKey = e => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [next, prev, onClose])

  const handleTouchStart = e => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }
  const handleTouchEnd = e => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) next(); else prev()
    }
    touchStartX.current = null
  }

  const photo = photos[idx]
  const imgUrl = photo.largeUrl || photo.url

  return createPortal(
    <div className="fixed inset-0 z-[10001] flex flex-col"
      style={{ background: 'rgba(0,0,0,0.96)' }}
      onClick={onClose} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 z-10"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)' }}
        onClick={e => e.stopPropagation()}>
        <span className="text-cream/60 text-sm font-medium">{idx + 1} / {photos.length}</span>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-cream/70 hover:text-cream transition-colors">
          {IC.close}
        </button>
      </div>

      {/* Imagen */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden" onClick={e => e.stopPropagation()}>
        {photos.length > 1 && (
          <button onClick={prev} className="hidden sm:flex absolute left-4 z-10 w-12 h-12 rounded-full glass items-center justify-center text-cream/70 hover:text-cream hover:bg-white/10 transition-all">
            {IC.chevron('left')}
          </button>
        )}
        <img key={idx} src={imgUrl} alt={photo.caption || ''}
          style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '56px 0 80px' }} />
        {photos.length > 1 && (
          <button onClick={next} className="hidden sm:flex absolute right-4 z-10 w-12 h-12 rounded-full glass items-center justify-center text-cream/70 hover:text-cream hover:bg-white/10 transition-all">
            {IC.chevron('right')}
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-5 pt-12 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)' }}>
        <div className="pointer-events-auto flex flex-col items-center gap-3 w-full px-4" onClick={e => e.stopPropagation()}>
          {photo.caption && <p className="text-cream/80 text-sm text-center">{photo.caption}</p>}
          {photos.length > 1 && (
            <>
              <div className="hidden sm:flex gap-2">
                {photos.map((f, i) => (
                  <button key={i} onClick={() => setIdx(i)}
                    className={`w-12 h-12 rounded-lg overflow-hidden transition-all flex-shrink-0 ${i === idx ? 'scale-110 ring-2 ring-white/50' : 'opacity-40 hover:opacity-75'}`}>
                    <img src={f.largeUrl || f.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <div className="flex sm:hidden gap-2 items-center">
                {photos.map((_, i) => (
                  <button key={i} onClick={() => setIdx(i)}
                    className={`rounded-full transition-all duration-200 ${i === idx ? 'w-5 h-[7px] bg-white' : 'w-[7px] h-[7px] bg-white/35 hover:bg-white/60'}`} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
