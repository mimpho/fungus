import { useApp } from '../../contexts/AppContext'
import { FOREST_TYPES } from '../../lib/forestLayer'

/**
 * Legend and filter of the forest type layer: a colour swatch per type. Each one is a toggle
 * (aria-pressed): off, that type disappears from the map. Lives inside the layers box, under the
 * «Tipo de bosque» checkbox. `active` is the Set of types shown.
 */
export function ForestTypeLegend({ active, onToggle, loaded = true, className = '' }) {
  const { t } = useApp()
  return (
    <div className={`px-1 ${className}`}>
      <ul className="flex flex-wrap gap-1.5" aria-label={t.obsForestLegend}>
        {FOREST_TYPES.map(ft => {
          const on = active.has(ft.key)
          return (
            <li key={ft.key}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => onToggle(ft.key)}
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs border transition-colors ${on ? 'border-cream/30 bg-cream/[0.08] text-cream' : 'border-white/10 text-cream/45 hover:text-cream/70'}`}
              >
                <span aria-hidden="true" className="h-3 w-3 rounded-full shrink-0" style={{ background: on ? ft.hex : 'transparent', boxShadow: `inset 0 0 0 2px ${ft.hex}` }} />
                {t[ft.label]}
              </button>
            </li>
          )
        })}
      </ul>
      <p className="mt-1.5 text-[11px] leading-snug text-cream/50">{loaded ? t.obsForestHint : t.obsForestLoading}</p>
    </div>
  )
}
