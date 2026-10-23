import { useId } from 'react'
import { useApp } from '../../contexts/AppContext'

// Layers the map will have. Corners and probability exist; the others are listed, off, so that
// it is clear what is coming (7c-7e of memory/pending.md).
const COMING = [
  { id: 'rain', key: 'obsLayerRain' },
  { id: 'temperature', key: 'obsLayerTemperature' },
  { id: 'wind', key: 'obsLayerWind' },
]

function Row({ id, checked, disabled = false, onChange, label, hint }) {
  return (
    <label htmlFor={id} className={`flex items-center gap-2.5 px-1 py-1 rounded-lg ${disabled ? 'opacity-50' : 'cursor-pointer hover:bg-cream/[0.06]'}`}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={e => onChange?.(e.target.checked)}
        className="h-4 w-4 accent-[#c4a06b] shrink-0"
      />
      <span className="text-sm text-cream">{label}</span>
      {hint && <span className="ml-auto text-[11px] text-cream/50">{hint}</span>}
    </label>
  )
}

/**
 * The map's layers box: a checkbox per layer. «Mis rincones» (the user's own pins) comes first and starts on. Switching one on opens its own controls (the
 * probability layer: the species search, the day, the legend) in `children`; off, the map goes
 * back to the plain basemap. Layers not built yet are listed, disabled.
 */
export function MapLayersBox({ corners = true, onCorners, probability, onProbability, children, className = '' }) {
  const { t } = useApp()
  const uid = useId()
  return (
    <div className={className} role="group" aria-label={t.obsLayersTitle}>
      <div className="backdrop-blur-sm bg-modal/85 rounded-2xl p-2.5 space-y-1.5 shadow-lg">
        <p className="px-1 text-[11px] uppercase tracking-[1.4px] font-medium text-coffee-light">{t.obsLayersTitle}</p>
        <Row id={`${uid}-corners`} checked={corners} onChange={onCorners} label={t.obsLayerCorners} />
        <Row id={`${uid}-prob`} checked={probability} onChange={onProbability} label={t.obsLayerProbability} />
        {probability && <div className="pb-1">{children}</div>}
        {COMING.map(l => (
          <Row key={l.id} id={`${uid}-${l.id}`} checked={false} disabled label={t[l.key]} hint={t.obsLayerSoon} />
        ))}
      </div>
    </div>
  )
}
