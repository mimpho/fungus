export const BAR_H = 52 // px, the height of the search bar
export const BAR_GAP = 4 // px, the unpainted gap between the halves
export const FIELD_MS = 200 // how long a half takes to give way to the other

/**
 * One half of the map's search bar (place or species). At rest the halves share the width, with the outer
 * corners round and the inner ones square; the focused half takes the whole width (rounded all round) and
 * the other gives way: width 0 and invisible, but still in the page, so Tab can reach it and focusing it
 * opens it. No colour transition here: the surface swaps fill and text with the theme (memory/gotchas.md).
 * `fitWidth` (px, or null): the least width its content needs; under half of the bar it changes nothing, above it the half
 * grows and the other one is squeezed (its text gets an ellipsis). The caller keeps it clear of the other half's minimum.
 * `minWidth` (px): the least this half shrinks to (the place half keeps its magnifier and a few letters).
 * `filled`: the whole half is the buttons' ochre (--nav-active, the darker --color-bar that carries white text at 4.5:1) with white text (a filter is on).
 * `dropdown` is drawn under the half, as wide as it is.
 */
export function BarHalf({ side, collapsed, focused, fitWidth = null, filled = false, minWidth = 0, children, dropdown = null }) {
  const fitting = fitWidth != null && !focused && !collapsed
  const outer = '26px'
  const inner = '0px'
  const radius = focused ? outer : side === 'left' ? `${outer} ${inner} ${inner} ${outer}` : `${inner} ${outer} ${outer} ${inner}`
  return (
    <div
      className="relative min-w-0 transition-[flex-grow,flex-basis,min-width,max-width,opacity]"
      style={{
        // The halves always share the width (grow 1, basis 0): a half that needs more only raises its min-width, so a name that
        // fits in 50 % changes nothing and the 50 / 50 case never moves (grow / basis swaps made it dip by a pixel or two mid-way)
        flexGrow: collapsed ? 0 : 1,
        flexShrink: 1,
        flexBasis: '0px',
        minWidth: fitting ? `${fitWidth}px` : `${minWidth}px`,
        maxWidth: '100%',
        opacity: collapsed ? 0 : 1,
        pointerEvents: collapsed ? 'none' : undefined,
        transitionDuration: `${FIELD_MS}ms`,
      }}
    >
      <div
        className="relative glass-search map-surface shadow-float transition-[border-radius]"
        style={{ height: `${BAR_H}px`, borderRadius: radius, transitionDuration: `${FIELD_MS}ms`, ...(filled ? { background: 'var(--nav-active)', color: '#ffffff' } : {}) }}
      >
        {children}
      </div>
      {dropdown}
    </div>
  )
}

/** The bare × of a focused half: it closes the search (the species filter is kept). 44 × 44 px touch target. */
export function CloseSearchButton({ label, onClick }) {
  return (
    <button
      type="button"
      tabIndex={-1} // Esc does the same from the keyboard, and Tab goes on to the other half
      onPointerDown={e => e.preventDefault()}
      onClick={onClick}
      aria-label={label}
      title={label}
      className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center search-light-text opacity-80 hover:opacity-100 outline-none focus-visible:ring-2 focus-visible:ring-cream/60 rounded-full"
      style={{ width: '44px', height: '44px' }}
    >
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  )
}
