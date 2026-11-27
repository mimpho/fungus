import { Gauge, Layers, Map as MapIcon, Mountain } from 'lucide-react'
import { useApp } from '../../../contexts/AppContext'

export const TAB_META = {
  data: { icon: Gauge, label: 'obsTabMeteo' },
  zones: { icon: MapIcon, label: 'obsTabZones' },
  habitat: { icon: Mountain, label: 'obsTabHabitat' },
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
      className={`relative flex flex-col items-center justify-center gap-0.5 rounded-2xl text-xs transition-colors ${open ? 'text-cream font-semibold' : 'text-cream/80 font-medium hover:text-cream'} ${FOCUS} ${className}`}
    >
      <span className={`relative w-[48px] h-[30px] rounded-full flex items-center justify-center ${open ? 'bg-[var(--nav-active)] text-white' : ''}`}>
        <Icon size={18} aria-hidden="true" />
        {on && <span aria-hidden="true" data-testid={`tab-dot-${id}`} className="absolute top-0.5 right-1.5 w-[9px] h-[9px] rounded-full bg-coffee-light ring-2 ring-[var(--map-surface)]" />}
      </span>
      {t[label]}
    </button>
  )
}

// The short rail's buttons: 44px, 40px where even that does not fit under the site's header (the classes are written out for Tailwind)
const LOW_ITEM = 'relative w-[44px] h-[44px] [@media(max-height:380px)]:w-[40px] [@media(max-height:380px)]:h-[40px] rounded-full flex items-center justify-center transition-colors'

/** One button of the short rail: the icon alone, filled while its panel is open, a dot while its layer is on. */
function LowButton({ icon: Icon, label, open, dot = false, testId, ...props }) {
  return (
    <button type="button" aria-label={label} title={label} className={`${LOW_ITEM} ${open ? 'bg-[var(--nav-active)] text-white' : 'text-cream/80 hover:text-cream'} ${FOCUS}`} {...props}>
      <Icon size={18} aria-hidden="true" />
      {dot && <span aria-hidden="true" data-testid={testId} className="absolute top-1.5 right-1.5 w-[9px] h-[9px] rounded-full bg-coffee-light ring-2 ring-[var(--map-surface)]" />}
    </button>
  )
}

/**
 * Desktop: the three tabs as a column at the top right of the map. `low` (a short landscape screen): icons only, with
 * Vista as a fourth button (`onView`, `viewPanelId`), for the column and «My location» to fit in the height.
 */
export function TabRail({ openTab, on, onToggle, panelId, low = false, onView, viewPanelId }) {
  const { t } = useApp()
  if (low) {
    return (
      <nav aria-label={t.obsLayersTitle} className="rounded-full map-surface shadow-float p-1 flex flex-col gap-[2px]">
        {['data', 'zones', 'habitat'].map(id => (
          <LowButton
            key={id} icon={TAB_META[id].icon} label={on[id] ? `${t[TAB_META[id].label]} · ${t.obsTabOn}` : t[TAB_META[id].label]}
            open={openTab === id} dot={on[id]} testId={`tab-dot-${id}`} onClick={() => onToggle(id)}
            aria-expanded={openTab === id} aria-controls={openTab === id ? panelId : undefined}
          />
        ))}
        <LowButton
          icon={Layers} label={t.obsViewTitle} open={openTab === 'view'} onClick={onView}
          aria-haspopup="dialog" aria-expanded={openTab === 'view'} aria-controls={openTab === 'view' ? viewPanelId : undefined}
        />
      </nav>
    )
  }
  return (
    <nav aria-label={t.obsLayersTitle} className="w-[76px] rounded-[22px] map-surface shadow-float p-1.5 py-2 flex flex-col gap-1">
      {['data', 'zones', 'habitat'].map(id => (
        <TabButton key={id} id={id} open={openTab === id} on={on[id]} onClick={() => onToggle(id)} panelId={panelId} className="w-full h-[68px]" />
      ))}
    </nav>
  )
}
