import { useApp } from '../../contexts/AppContext'

/**
 * The little bar at the top of a bottom sheet. The whole sheet drags (`useSheetDrag`); this is also a button:
 * a tap shows or hides the sheet (`onToggle`), so every sheet answers the same way. No focus ring on a tap (the ring is
 * only for the keyboard: `focus-visible`).
 */
export function SheetHandle({ onToggle, className = 'pt-3 pb-2' }) {
  const { t } = useApp()
  return (
    <button
      type="button"
      data-testid="sheet-handle"
      aria-label={t.obsSheetHandle}
      data-sheet-handle=""
      onClick={() => onToggle?.()}
      className={`shrink-0 w-full flex justify-center touch-none cursor-grab select-none outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cream/60 ${className}`}
    >
      <span aria-hidden="true" className="block w-10 h-1 rounded-full bg-cream/25" />
    </button>
  )
}
