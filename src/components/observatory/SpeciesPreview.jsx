import { createPortal } from 'react-dom'
import { SpeciesModal } from '../modals/SpeciesModal'
import { useDialogAboveObsModal } from './ObsModal'

/**
 * The catalogue's modal of a species, opened over the corner's form without leaving the page
 * (the global ModalRenderer would navigate to /especies/…, and the form would be lost). It is drawn
 * in a portal above the form's dialog (z 200).
 * While it is open, Esc closes it and not the form.
 */
export function SpeciesPreview({ species, onClose }) {
  useDialogAboveObsModal()
  return createPortal(
    <div className="relative z-[300]">
      <SpeciesModal species={species} onClose={onClose} />
    </div>,
    document.body,
  )
}
