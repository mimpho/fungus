import { Gauge, Map as MapIcon, TreePine } from 'lucide-react'
import { useApp } from '../../../contexts/AppContext'

export const TAB_META = {
  data: { icon: Gauge, label: 'obsTabMeteo' },
  zones: { icon: MapIcon, label: 'obsTabZones' },
  forest: { icon: TreePine, label: 'obsTabForest' },
}

const FOCUS = 'outline-none focus-visible:ring-2 focus-visible:ring-cream/50'

/** One tab: icon in a pill (filled while its panel is open), its name below, a dot while its layer is on. */
export function TabButton({ id, open, on, onClick, panelId, className = '' }) {
  const { t } = useApp()
  const { icon: Icon, label } = TAB_META[id]
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      aria-controls={open ? panelId : undefined}
      aria-label={on ? `${t[label]} · ${t.obsTabOn}` : t[label]}
      className={`relative flex flex-col items-center justify-center gap-0.5 rounded-2xl text-xs transition-colors ${open ? 'text-cream font-semibold' : 'text-cream/70 font-medium hover:text-cream'} ${FOCUS} ${className}`}
    >
      <span className={`relative w-[48px] h-[30px] rounded-full flex items-center justify-center transition-colors ${open ? 'bg-[var(--nav-active)] text-white' : ''}`}>
        <Icon size={18} aria-hidden="true" />
        {on && <span aria-hidden="true" data-testid={`tab-dot-${id}`} className="absolute top-0.5 right-1.5 w-[9px] h-[9px] rounded-full bg-coffee-light ring-2 ring-[var(--map-surface)]" />}
      </span>
      {t[label]}
    </button>
  )
}

/** Desktop: the three tabs as a column at the top right of the map. */
export function TabRail({ openTab, on, onToggle, panelId }) {
  const { t } = useApp()
  return (
    <nav aria-label={t.obsLayersTitle} className="w-[76px] rounded-[22px] map-surface shadow-float p-1.5 py-2 flex flex-col gap-1">
      {['data', 'zones', 'forest'].map(id => (
        <TabButton key={id} id={id} open={openTab === id} on={on[id]} onClick={() => onToggle(id)} panelId={panelId} className="w-full h-[68px]" />
      ))}
    </nav>
  )
}
