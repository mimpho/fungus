import { useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const MARGIN = 8 // px kept clear of the viewport's edges
const GAP = 4    // px between the button and the tooltip

/**
 * A small ⓘ button whose text opens as a tooltip on hover, focus or tap: for explanations that
 * would otherwise add one more paragraph next to a figure. `label` names the button for screen
 * readers; `align` says which edge of the button the tooltip lines up with. With `block` the
 * tooltip spans the width of the nearest positioned ancestor instead. With `floating` the tooltip is
 * put on the page itself (fixed, over everything) and placed by the button: inside a panel that
 * scrolls it would otherwise be cut off and make the panel scroll.
 */
export function InfoTip({ label, children, align = 'left', block = false, floating = false, className = '' }) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState(false)
  const shown = open || hover
  const buttonRef = useRef(null)
  const tipRef = useRef(null)
  const [place, setPlace] = useState(null)

  // Floating: below the button if it fits, else above it; lined up with its `align` edge, kept inside the viewport
  useLayoutEffect(() => {
    if (!floating || !shown) { setPlace(null); return undefined }
    const measure = () => {
      const b = buttonRef.current?.getBoundingClientRect()
      const tip = tipRef.current
      if (!b || !tip) return
      const w = tip.offsetWidth, h = tip.offsetHeight
      const vw = window.innerWidth, vh = window.innerHeight
      let left = align === 'right' ? b.right - w : b.left
      left = Math.max(MARGIN, Math.min(left, vw - w - MARGIN))
      const below = b.bottom + GAP
      const top = below + h <= vh - MARGIN ? below : Math.max(MARGIN, b.top - GAP - h)
      setPlace({ left, top })
    }
    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => { window.removeEventListener('resize', measure); window.removeEventListener('scroll', measure, true) }
  }, [floating, shown, align])

  const tipClass = 'rounded-xl px-3 py-2.5 text-[13px] leading-relaxed font-normal text-cream bg-modal/95 backdrop-blur-sm border border-cream/20 shadow-lg'
  const floatingTip = floating && shown && createPortal(
    <span
      ref={tipRef}
      id={id}
      role="tooltip"
      style={place ? { left: place.left, top: place.top } : { left: -9999, top: 0 }}
      className={`fixed z-[2000] w-80 max-w-[80vw] pointer-events-none ${tipClass}`}
    >
      {children}
    </span>,
    document.body,
  )
  return (
    <span
      className={`${block ? '' : 'relative'} inline-flex ${className}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        onFocus={() => setHover(true)}
        onBlur={() => { setHover(false); setOpen(false) }}
        onKeyDown={e => { if (e.key === 'Escape') { setOpen(false); setHover(false) } }}
        aria-expanded={open}
        aria-describedby={id}
        aria-label={label}
        className="w-6 h-6 flex items-center justify-center rounded-full text-cream/60 hover:text-cream hover:bg-cream/10 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5" />
          <path d="M12 7.5v.5" />
        </svg>
      </button>
      {floating ? floatingTip : (
        <span
          id={id}
          role="tooltip"
          hidden={!shown}
          className={`absolute top-full mt-1 z-30 ${tipClass} ${block ? 'left-0 right-0' : `w-80 max-w-[80vw] ${align === 'right' ? 'right-0' : 'left-0'}`}`}
        >
          {children}
        </span>
      )}
    </span>
  )
}
