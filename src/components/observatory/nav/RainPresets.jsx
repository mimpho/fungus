import { useApp } from '../../../contexts/AppContext'
import { RAIN_PRESETS } from '../../../lib/meteoLayers'

/**
 * The rain window's length: 24 h · 7 d · 14 d · 21 d, one pressed at a time. Outlined, not filled: they are
 * a choice inside the layer and must weigh less than the layer's own segments above. Each outline has the
 * colour its fill would have.
 */
export function RainPresets({ value, onChange }) {
  const { t } = useApp()
  return (
    <div role="group" aria-label={t.obsMeteoRainWindow} className="flex gap-2">
      {RAIN_PRESETS.map(p => {
        const on = p.id === value
        return (
          <button
            key={p.id}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(p.id)}
            className={`flex-1 h-[44px] rounded-full border-2 text-sm text-cream outline-none focus-visible:ring-2 focus-visible:ring-cream/50 ${on ? 'border-[var(--nav-active)] font-semibold' : 'border-cream/[0.08] font-medium hover:border-cream/20'}`}
          >
            {p.label}
          </button>
        )
      })}
    </div>
  )
}
