import { Check } from 'lucide-react'

const FOCUS = 'outline-none focus-visible:ring-2 focus-visible:ring-cream/50'

/**
 * A checkbox of the Zonas and Bosque panels (`role="checkbox"`, toggles with Space and Enter like any
 * button). The box takes the switch's colours (tokens `--switch-on` / `--switch-thumb-on`), so a ticked
 * box reads like a switch that is on. `swatch`: a class colour shown after the box (Bosque).
 * `disabled`: a row not built yet (`aria-disabled`, cannot be ticked). Sizes in px (base font 18px).
 */
export function NavCheckbox({ checked, onChange, label, swatch = null, disabled = false, ariaLabel, className = '' }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-disabled={disabled || undefined}
      aria-label={ariaLabel}
      onClick={() => { if (!disabled) onChange(!checked) }}
      className={`flex items-center gap-[10px] min-h-[44px] min-w-0 text-left rounded-lg ${FOCUS} ${disabled ? 'cursor-default text-cream/50' : 'text-cream'} ${className}`}
    >
      <span
        aria-hidden="true"
        className={`shrink-0 w-[20px] h-[20px] rounded-[6px] border-2 flex items-center justify-center transition-colors ${checked ? 'border-[var(--switch-on)] bg-[var(--switch-on)] text-[var(--switch-thumb-on)]' : 'border-cream/50 bg-transparent'}`}
      >
        {checked && <Check size={13} strokeWidth={3.4} />}
      </span>
      {swatch && <span aria-hidden="true" className="shrink-0 w-[10px] h-[10px] rounded-[3px] border border-cream/50" style={{ background: swatch }} />}
      {/* Labels wrap (two lines at most in practice): «Pinar de pino negro» or «Black pine (pinassa) forest» do not fit half a panel */}
      <span className="min-w-0 leading-tight">{label}</span>
    </button>
  )
}
