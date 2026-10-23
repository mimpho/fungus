import { useEffect, useId } from 'react'
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
export function useDialogAboveObsModal() {
  useEffect(() => {
    openAbove += 1
    return () => { openAbove -= 1 }
  }, [])
}

export function ObsModal({ title, onClose, wide = false, size = 'md', children }) {
  const { t } = useApp()
  const titleId = useId()

  useEffect(() => {
    // stopPropagation: the page's own Esc (it closes the map's point panel) must not also fire and unmount what the dialog belongs to
    const onKey = e => { if (e.key === 'Escape' && openAbove === 0) { e.stopPropagation(); onClose() } }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

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
        className={`relative rounded-2xl w-full ${wide ? 'max-w-5xl' : size === 'lg' ? 'max-w-2xl' : 'max-w-md'} p-6 anim-scale max-h-[90vh] overflow-y-auto`}
        style={{ background: MODAL.bg }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t.obsPointClose}
          className="absolute top-4 right-4 text-cream/40 hover:text-cream transition-colors p-1"
        >
          {IC.close}
        </button>
        <h2 id={titleId} className="font-display text-2xl font-semibold text-cream mb-5 pr-8">{title}</h2>
        {children}
      </div>
    </div>,
    document.body,
  )
}
