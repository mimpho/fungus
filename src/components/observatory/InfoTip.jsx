import { useId, useState } from 'react'

/**
 * A small ⓘ button whose text opens as a tooltip on hover, focus or tap: for explanations that
 * would otherwise add one more paragraph next to a figure. `label` names the button for screen
 * readers; `align` says which edge of the button the tooltip lines up with. With `block` the
 * tooltip spans the width of the nearest positioned ancestor instead.
 */
export function InfoTip({ label, children, align = 'left', block = false, className = '' }) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState(false)
  return (
    <span
      className={`${block ? '' : 'relative'} inline-flex ${className}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button
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
      <span
        id={id}
        role="tooltip"
        hidden={!(open || hover)}
        className={`absolute top-full mt-1 z-30 rounded-xl px-3 py-2.5 text-[13px] leading-relaxed font-normal text-cream bg-modal/95 backdrop-blur-sm border border-cream/20 shadow-lg ${block ? 'left-0 right-0' : `w-80 max-w-[80vw] ${align === 'right' ? 'right-0' : 'left-0'}`}`}
      >
        {children}
      </span>
    </span>
  )
}
