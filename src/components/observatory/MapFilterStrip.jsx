import { X } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'

/**
 * The map's active filters, in a strip under the search: for now the Meteo day when it is not today (the day lives in the Meteo panel,
 * so with the panel shut the map would be painted for another day with nothing to say so). The pill's text opens the panel to change
 * it; its × takes the day back to today (Meteo stays on). The same pill as the zone's bar of filters.
 */
export function MapFilterStrip({ dayLabel, onEdit, onClearDay, className = '', style }) {
  const { t } = useApp()
  if (!dayLabel) return null
  const label = t.obsMapDayPill.replace('{date}', dayLabel)
  return (
    <ul aria-label={t.obsFilterApplied} data-testid="map-filter-strip" className={`flex flex-wrap items-center gap-2 pointer-events-none ${className}`} style={style}>
      <li data-map-cover="" className="pointer-events-auto inline-flex items-center rounded-full bg-bar text-white shadow-float text-sm">
        <button type="button" onClick={onEdit} title={t.obsMapDayEdit} className="pl-3.5 pr-1.5 py-1.5 rounded-l-full hover:bg-white/10 outline-none focus-visible:ring-2 focus-visible:ring-white/70">{label}</button>
        <button
          type="button"
          onClick={onClearDay}
          aria-label={t.obsFilterRemove.replace('{name}', label)}
          title={t.obsMapDayClear}
          className="shrink-0 w-7 h-7 mr-1 flex items-center justify-center rounded-full hover:bg-white/15 outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        ><X size={12} strokeWidth={3} aria-hidden="true" /></button>
      </li>
    </ul>
  )
}
