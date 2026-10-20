import { useApp } from '../../contexts/AppContext'
import { forestParts, soilParts } from '../../lib/habitat'

/**
 * What surrounds the point besides the climate: the forest classes (CREAF MCSC-4, ~250 m) and
 * the soil acidity (ICGC lithology). It is context for the species list: each species is judged
 * against exactly this. Renders nothing where the server has neither raster.
 */
export function PointHabitat({ habitat, compact = false, className = '' }) {
  const { t, lang } = useApp()
  const forest = forestParts(habitat, t)
  const soil = soilParts(habitat, t, lang)
  if (!forest.length && !soil.length) return null
  const chip = 'inline-flex items-center gap-1 rounded-full bg-cream/[0.08] px-2 py-0.5 text-cream/90'
  return (
    <div data-testid="point-habitat" className={`space-y-1.5 text-xs text-cream/70 ${className}`}>
      {!compact && <p className="text-[11px] uppercase tracking-[1.4px] font-medium text-coffee-light">{t.obsHabTitle}</p>}
      {forest.length > 0 && (
        <p className="flex flex-wrap items-center gap-1.5">
          <span className="text-cream/60">{t.obsHabForest}</span>
          {forest.map(p => <span key={p.key} className={chip}>{p.label} <span className="text-cream/60">{p.pct} %</span></span>)}
        </p>
      )}
      {soil.length > 0 && (
        <p className="flex flex-wrap items-center gap-1.5">
          <span className="text-cream/60">{t.obsHabSoil}</span>
          {soil.map(p => (
            <span key={p.key} className={chip}>
              {p.label} {p.ph && <span className="text-cream/60">pH {p.ph}</span>}
            </span>
          ))}
        </p>
      )}
      {!compact && <p className="text-[11px] text-cream/40">{t.obsHabSource}</p>}
    </div>
  )
}
