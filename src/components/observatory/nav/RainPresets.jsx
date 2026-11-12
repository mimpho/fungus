import { useApp } from '../../../contexts/AppContext'
import { RAIN_PRESETS } from '../../../lib/meteoLayers'

/** The rain window's length: 24 h · 7 d · 21 d, one pressed at a time. */
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
            className={`flex-1 h-[44px] rounded-full text-sm outline-none focus-visible:ring-2 focus-visible:ring-cream/50 ${on ? 'bg-[var(--nav-active)] text-white font-semibold' : 'bg-cream/[0.08] text-cream font-medium hover:bg-cream/[0.14]'}`}
          >
            {p.label}
          </button>
        )
      })}
    </div>
  )
}
