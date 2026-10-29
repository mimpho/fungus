import { useEffect, useId, useRef, useState, createContext } from 'react'
import { createPortal } from 'react-dom'
import { useApp } from '../../contexts/AppContext'
import { IC } from '../../lib/helpers'
import { MODAL } from '../../lib/constants'

/**
 * Modal of the Observatory, with the look of the site's other modals (overlay with blur, rounded
 * card, close button at the top right, Esc and click outside close it). It is drawn in a portal
 * so that no animated ancestor of the page can offset its fixed position.
 */
// Dialogs opened over an ObsModal (a species' modal): while one is up, Esc is theirs, not the form's
let openAbove = 0
export const isDialogAbove = () => openAbove > 0
export const dialogsAboveCount = () => openAbove
export function useDialogAboveObsModal() {
  useEffect(() => {
    openAbove += 1
    // Given back a moment later: when Esc closes the dialog above, the modal under it hears the same
    // key press, and must still see the dialog as open (React has already unmounted it by then)
    return () => { setTimeout(() => { openAbove -= 1 }, 0) }
  }, [])
}

/** True on a phone (under 640px) while `active`; follows the window. */
function usePhone(active) {
  const query = '(max-width: 639px)'
  const [phone, setPhone] = useState(() => active && typeof window !== 'undefined' && window.matchMedia?.(query).matches === true)
  useEffect(() => {
    if (!active || !window.matchMedia) return undefined
    const mq = window.matchMedia(query)
    const on = () => setPhone(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [active])
  return active && phone
}

/**
 * On a desktop modal, the element in the title's line (between the title and the ×) that content can
 * portal into, so a search can sit level with the title. null on a phone sheet and outside a modal:
 * the content then draws that part in its own place.
 */
export const ObsModalHeaderSlot = createContext(null)

// ObsModals open at once (the photo viewer opens over the edit dialog): only the last one answers Esc
const openStack = []

/**
 * `sheet` makes it, on a phone (under 640px), a bottom sheet like the filters of the lists: it rises
 * from the bottom edge, takes the whole width, has a handle that can be dragged down to close it
 * and never gets taller than the screen less 50px (its content scrolls). From 640px up it is the
 * usual centred modal, of the size `size` says.
 */
export function ObsModal({ title, onClose, wide = false, size = 'md', sheet = false, children }) {
  const { t } = useApp()
  const titleId = useId()
  const token = useRef({})
  const [entered, setEntered] = useState(!sheet) // a sheet starts below the screen and rises on the next frames
  const [dragY, setDragY] = useState(0)
  const [dragging, setDragging] = useState(false)
  const startY = useRef(0)
  const sheetRef = useRef(null)
  const phone = usePhone(sheet)
  const [headerSlot, setHeaderSlot] = useState(null)

  useEffect(() => {
    if (!sheet || !phone) return undefined
    let inner = 0
    const outer = requestAnimationFrame(() => { inner = requestAnimationFrame(() => setEntered(true)) })
    return () => { cancelAnimationFrame(outer); cancelAnimationFrame(inner) }
  }, [sheet, phone])

  const onTouchStart = e => { startY.current = e.touches[0].clientY; setDragY(0); setDragging(true) }
  const onTouchMove = e => setDragY(Math.max(0, e.touches[0].clientY - startY.current))
  const onTouchEnd = () => {
    const h = sheetRef.current?.offsetHeight || 400
    setDragging(false)
    if (dragY > h * 0.4) onClose()
    setDragY(0)
  }

  useEffect(() => {
    const mine = token.current
    openStack.push(mine)
    return () => { openStack.splice(openStack.indexOf(mine), 1) }
  }, [])

  useEffect(() => {
    // stopPropagation: the page's own Esc (it closes the map's point panel) must not also fire and unmount what the dialog belongs to
    const onKey = e => {
      if (e.key === 'Escape' && openAbove === 0 && openStack[openStack.length - 1] === token.current) {
        e.stopPropagation()
        onClose()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  if (sheet && phone) {
    return createPortal(
      <div
        className="fixed inset-0 z-[200] flex items-end justify-center modal-outer"
        style={{ background: MODAL.overlay, backdropFilter: 'blur(8px)' }}
        onClick={e => { if (e.target === e.currentTarget) onClose() }}
      >
        <div
          ref={sheetRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="relative w-full rounded-t-2xl overflow-y-auto"
          style={{
            background: MODAL.bg,
            maxHeight: 'calc(100dvh - 50px)',
            transform: dragging ? `translateY(${dragY}px)` : entered ? 'translateY(0)' : 'translateY(100%)',
            transition: dragging ? 'none' : 'transform 0.35s cubic-bezier(0.32,0.72,0,1)',
          }}
        >
          <div
            className="pt-4 pb-2 flex flex-col items-center touch-none cursor-grab select-none"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div className="w-10 h-1 rounded-full bg-cream/20" />
          </div>
          <div className="px-6 pb-8 pt-2">
            {/* The × on the title's line */}
            <div className="flex items-center justify-between gap-3 mb-5">
              <h2 id={titleId} className="font-display text-2xl font-semibold text-cream">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label={t.obsPointClose}
                className="shrink-0 -mr-1 text-cream/40 hover:text-cream transition-colors p-1"
              >
                {IC.close}
              </button>
            </div>
            {children}
          </div>
        </div>
      </div>,
      document.body,
    )
  }

  // In browser fullscreen only the fullscreen element is drawn: the dialog goes inside it
  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 modal-outer"
      style={{ background: MODAL.overlay, backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative rounded-2xl w-full ${wide ? 'max-w-7xl' : size === 'lg' ? 'max-w-2xl' : 'max-w-md'} p-6 anim-scale max-h-[90vh] overflow-y-auto`}
        style={{ background: MODAL.bg }}
      >
        {/* Three columns so that whatever goes in the slot (a search) is centred on the dialog, not on the space left by the title */}
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] lg:grid-cols-[1fr_minmax(0,32rem)_1fr] items-center gap-4 mb-5">
          <h2 id={titleId} className="font-display text-2xl font-semibold text-cream">{title}</h2>
          <div ref={setHeaderSlot} className="min-w-0" />
          <button
            type="button"
            onClick={onClose}
            aria-label={t.obsPointClose}
            className="justify-self-end -mr-1 text-cream/40 hover:text-cream transition-colors p-1"
          >
            {IC.close}
          </button>
        </div>
        <ObsModalHeaderSlot.Provider value={headerSlot}>
          {children}
        </ObsModalHeaderSlot.Provider>
      </div>
    </div>,
    document.body,
  )
}
