/** The switch of a tab's panel: whether its layer is drawn. 44 × 26 inside a 44 px tall hit area.
 * Sizes in px, not rem: the site's base font is 18px and rem sizes would no longer add up (3 + 20 + 3 = 26). */
export function PanelSwitch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={label}
      onClick={() => onChange(!checked)}
      className="shrink-0 h-[44px] -my-[9px] flex items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-cream/50"
    >
      <span className={`relative block w-[44px] h-[26px] rounded-full transition-colors ${checked ? 'bg-[var(--switch-on)]' : 'bg-[var(--switch-off)]'}`}>
        <span className={`absolute top-[3px] left-[3px] w-[20px] h-[20px] rounded-full transition-transform [box-shadow:var(--switch-thumb-shadow)] ${checked ? 'translate-x-[18px] bg-[var(--switch-thumb-on)]' : 'translate-x-0 bg-[var(--switch-thumb-off)]'}`} />
      </span>
    </button>
  )
}
