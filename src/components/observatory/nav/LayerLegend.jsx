/**
 * Legend of a Meteo layer: a colour bar with what its two ends mean, and an optional mark in between.
 * `scale`: { colors, stepped?, min?, max?, unit?, band?: { from, to } }. Stepped colours are drawn as
 * equal blocks (the conditions' bands); otherwise as a gradient. The ends read `lowLabel` / `highLabel`,
 * or the scale's min and «max+» with its unit. `band` marks a stretch of the scale (the rain's «good»
 * band), described by `bandLabel`. `center` sits between the end labels (the day of the data); `extra`
 * after the high end (an info tip).
 */
export function LayerLegend({ scale, lowLabel, highLabel, center = null, extra = null, bandLabel = null, className = '' }) {
  const { colors, stepped = false, min, max, unit, band } = scale
  const low = lowLabel ?? `${min} ${unit}`
  const high = highLabel ?? `${max}+ ${unit}`
  const span = (max ?? 0) - (min ?? 0)
  const at = v => `${Math.max(0, Math.min(100, ((v - min) / span) * 100))}%`

  return (
    <div className={className}>
      <div className="relative">
        {stepped ? (
          <div className="flex gap-[2px] h-2" aria-hidden="true">
            {colors.map(c => <span key={c} className="flex-1 first:rounded-l-full last:rounded-r-full" style={{ backgroundColor: c }} />)}
          </div>
        ) : (
          <div className="h-2 rounded-full" aria-hidden="true" style={{ backgroundImage: `linear-gradient(90deg, ${colors.join(', ')})` }} />
        )}
        {band && span > 0 && (
          <span
            aria-hidden="true"
            data-testid="legend-band"
            className="absolute -top-[3px] -bottom-[3px] rounded-[4px] border-2 border-cream"
            style={{ left: at(band.from), right: `calc(100% - ${at(band.to)})` }}
          />
        )}
      </div>
      <div className="flex justify-between gap-2 text-[11px] text-cream/80 mt-1">
        <span>{low}</span>
        {center && <span className="text-cream/80 text-center">{center}</span>}
        <span className="inline-flex items-center gap-1">{high}{extra}</span>
      </div>
      {band && bandLabel && <p className="text-[11px] text-cream/80 mt-0.5">{bandLabel}</p>}
    </div>
  )
}
