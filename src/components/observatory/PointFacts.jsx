import { Crosshair, TreeDeciduous } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { forestIcon, forestParts, soilParts } from '../../lib/habitat'
import { formatCoords } from '../../lib/observatoryView'
import { SCROLL_THIN } from './scrollStyles'

/**
 * What the point is, as a row of cards like the zone's conditions (icon, label, value): the comarca, the
 * coordinates, the altitude, the forest (the CREAF's classes around the point, or the ICGC's broad type where the
 * server has no CREAF raster: `macro`) and the soil (acidity with its typical pH). The cards without data are left
 * out, and the sources go under them. Each card is at least 150 px wide and they share the row; where they do not fit, the row scrolls sideways. The coordinates are the zone's title when there is no toponym, so they are not repeated.
 */
export function PointFacts({ point, toponym, elevation, habitat, macro = null, className = '' }) {
  const { t, lang } = useApp()
  const forest = forestParts(habitat, t)
  const soil = soilParts(habitat, t, lang)
  const mainIcon = forestIcon(forest[0]?.key)

  const cards = [
    toponym?.comarca && { key: 'place', icon: 'location', label: t.obsFactPlace, lines: [{ text: toponym.comarca }] },
    toponym && { key: 'coords', node: <Crosshair size={36} strokeWidth={1.4} />, label: t.obsFactCoords, lines: [{ text: formatCoords(point) }] },
    Number.isFinite(elevation) && { key: 'elevation', icon: 'mountain', label: t.obsFactElevation, lines: [{ text: `${Math.round(elevation)} m` }] },
    (forest.length > 0 || macro) && {
      key: 'forest',
      icon: mainIcon ? `forest-type-${mainIcon}` : null,
      node: mainIcon ? null : <TreeDeciduous size={36} strokeWidth={1.4} />,
      label: t.obsHabForest,
      lines: forest.length > 0 ? forest.map(p => ({ text: p.label, sub: `${p.pct} %` })) : [{ text: macro }],
    },
    soil.length > 0 && {
      key: 'soil',
      icon: 'soil',
      label: t.obsHabSoil,
      lines: soil.map(p => ({ text: p.label, sub: p.ph ? `pH ${p.ph}` : null })),
    },
  ].filter(Boolean)

  if (!cards.length) return null
  return (
    <div data-testid="zone-facts" className={`space-y-2 ${className}`}>
      <div className={`flex gap-3 overflow-x-auto ${SCROLL_THIN}`}>
        {cards.map(c => (
          <div key={c.key} data-testid={`fact-${c.key}`} className="surface-subtle rounded-xl py-3 px-0 text-center flex-[1_0_auto] min-w-[170px] flex flex-col justify-center">
            <div className="h-9 mb-1 flex items-center justify-center text-cream/70" aria-hidden="true">
              {c.icon ? <img src={`/assets/images/icons/${c.icon}.png`} alt="" height="36" width="36" /> : c.node}
            </div>
            <div className="text-cream/70 text-[11px] mb-1">{c.label}</div>
            {c.lines.map((l, i) => (
              <div key={i} className="text-cream text-xs font-semibold whitespace-nowrap">
                {l.text}{l.sub && <span className="font-normal text-cream/60"> {l.sub}</span>}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * The row while the point's data is on its way: five cards shaped like the real ones (same width, same
 * icon, label and value rows; the forest and the soil with a second line) so that the facts replace them
 * all at once instead of appearing one by one and pushing everything down.
 */
export function PointFactsSkeleton({ className = '' }) {
  const lines = [1, 1, 1, 2, 2]
  return (
    <div data-testid="zone-facts-skeleton" aria-busy="true" className={className}>
      <div className={`flex gap-3 overflow-x-auto ${SCROLL_THIN}`}>
        {lines.map((n, i) => (
          <div key={i} className="surface-subtle rounded-xl py-3 px-0 flex-[1_0_auto] min-w-[170px] flex flex-col items-center justify-center">
            <div className="h-9 mb-1 flex items-center justify-center"><div className="size-8 rounded-full bg-white/10 animate-pulse" /></div>
            <div className="h-[11px] w-16 rounded bg-white/10 animate-pulse mb-1.5" />
            {Array.from({ length: n }, (_, j) => (
              <div key={j} className={`h-3 rounded bg-white/10 animate-pulse ${j ? 'mt-1.5 w-20' : 'w-28'}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
