import { useApp } from '../../../contexts/AppContext'
import { fill } from '../../../lib/thermometer'
import { FOREST_TYPES } from '../../../lib/forestLayer'
import { LEGEND_BANDS } from '../../../lib/layerColors'
import { NavCheckbox } from './NavCheckbox'
import { LayerLegend } from './LayerLegend'

const HABITAT_SCALE = { colors: LEGEND_BANDS.map(b => b.hex), stepped: true }
const FOCUS = 'outline-none focus-visible:ring-2 focus-visible:ring-cream/50'

/**
 * The Hábitat tab's content: the segmented control Bosques · De la seta (as Meteo's) and the chosen segment.
 * Bosques: «Todos» / «Ninguno», the counter «{n} de {total}» and one checkbox per forest class with its colour,
 * in two columns (`active` is the Set of class keys drawn; `onChange` receives the next Set).
 * De la seta: where the chosen species can grow (no weather, no date): its name, the legend and what the map is doing.
 * `view`: 'forest' | 'species' (the page already folds «species» into «forest» without an active species);
 * `speciesName`: the active species' name, or null (the second segment is then disabled, «Elige una seta');
 * `habitat`: { status: 'loading' | 'ready' | 'noinfo', noForest, noSoil } of the picture while the species view is shown.
 */
export function HabitatPanel({ active, onChange, loaded = true, view = 'forest', onView, speciesName = null, habitat = null }) {
  const { t, lang } = useApp()
  const segments = [
    { id: 'forest', label: t.obsHabitatSegForests, enabled: true },
    { id: 'species', label: t.obsHabSegSpecies, enabled: Boolean(speciesName) },
  ]
  return (
    <div className="flex flex-col gap-3">
      <div role="group" aria-label={t.obsHabKind} className="flex gap-[2px] p-[3px] rounded-[10px] bg-cream/[0.08]">
        {segments.map(seg => {
          const selected = seg.id === view
          return (
            <button
              key={seg.id}
              type="button"
              aria-pressed={selected}
              aria-disabled={seg.enabled ? undefined : true}
              aria-label={seg.enabled ? seg.label : `${seg.label} · ${t.obsHabPickSpecies}`}
              onClick={() => { if (seg.enabled && !selected) onView?.(seg.id) }}
              className={`relative flex-1 min-w-0 px-1.5 h-[44px] rounded-lg flex flex-col items-center justify-center text-[13px] leading-tight ${FOCUS} ${selected ? 'bg-[var(--nav-active)] text-white font-semibold' : seg.enabled ? 'text-cream font-medium hover:underline underline-offset-4' : 'text-cream/50 font-medium cursor-default'}`}
            >
              <span className="truncate max-w-full">{seg.label}</span>
              {!seg.enabled && <span aria-hidden="true" className="text-[10px] tracking-wide opacity-80">{t.obsHabPickSpecies}</span>}
            </button>
          )
        })}
      </div>
      {view === 'species' && speciesName ? (
        <div className="px-1 flex flex-col gap-3" aria-live="polite">
          <p className="min-w-0 text-[15px] font-semibold text-cream" data-testid="habitat-for">{fill(t.obsHabFor, { name: speciesName }, lang)}</p>
          <LayerLegend
            scale={HABITAT_SCALE}
            lowLabel={t.obsHabLow}
            highLabel={t.obsHabHigh}
            className={`transition-opacity ${habitat?.status === 'loading' ? 'opacity-60' : ''}`}
          />
          <p className="text-[11px] leading-snug text-cream/80" data-testid="habitat-no-date">{t.obsHabNoDate}</p>
          {habitat?.status === 'loading' && <p className="text-xs text-cream/80" role="status">{t.obsHabLoading}</p>}
          {habitat?.status === 'noinfo' && <p className="text-xs text-cream/80">{t.obsHabNoInfo}</p>}
          {habitat?.noForest && habitat.status === 'ready' && <p className="text-[11px] leading-snug text-cream/80">{t.obsHabNoForest}</p>}
          {habitat?.noSoil && habitat.status === 'ready' && <p className="text-[11px] leading-snug text-cream/80">{t.obsHabNoSoil}</p>}
        </div>
      ) : (
        <ForestClasses active={active} onChange={onChange} loaded={loaded} />
      )}
    </div>
  )
}

function ForestClasses({ active, onChange, loaded }) {
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
