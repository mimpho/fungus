import { useApp } from '../../../contexts/AppContext'
import { fill } from '../../../lib/thermometer'
import { FOREST_TYPES } from '../../../lib/forestLayer'
import { NavCheckbox } from './NavCheckbox'

const FOCUS = 'outline-none focus-visible:ring-2 focus-visible:ring-cream/50'

/**
 * The Bosque tab's content: «Todos» / «Ninguno», the counter «{n} de {total}» and one checkbox per
 * forest class with its colour, in two columns. `active` is the Set of class keys drawn; `onChange`
 * receives the next Set.
 */
export function BosquePanel({ active, onChange, loaded = true }) {
  const { t, lang } = useApp()
  const total = FOREST_TYPES.length
  const n = FOREST_TYPES.filter(ft => active.has(ft.key)).length
  const toggle = key => {
    const next = new Set(active)
    if (next.has(key)) next.delete(key); else next.add(key)
    onChange(next)
  }
  // Cream, not the design's gold: #c4a06b on the dark surface (#4c5240) is 3.3:1, under 4.5:1 for text
  const link = `h-[44px] px-1 -mx-1 rounded-lg text-[14px] font-semibold text-cream underline-offset-4 hover:underline disabled:opacity-50 disabled:no-underline ${FOCUS}`
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-5">
        <button type="button" className={link} disabled={n === total} onClick={() => onChange(new Set(FOREST_TYPES.map(f => f.key)))}>{t.obsForestAll}</button>
        <button type="button" className={link} disabled={n === 0} onClick={() => onChange(new Set())}>{t.obsForestNone}</button>
        <span className="ml-auto text-[14px] text-cream/80 tabular-nums" aria-live="polite">{fill(t.obsForestCount, { n, total }, lang)}</span>
      </div>
      <div role="group" aria-label={t.obsForestLegend} className="grid grid-cols-2 gap-x-4">
        {FOREST_TYPES.map(ft => (
          <NavCheckbox key={ft.key} checked={active.has(ft.key)} onChange={() => toggle(ft.key)} label={t[ft.label]} swatch={ft.hex} className="text-[14px]" />
        ))}
      </div>
      <p className="mt-1 text-[11px] leading-snug text-cream/80">{loaded ? t.obsForestPanelHint : t.obsForestLoading}</p>
    </div>
  )
}
