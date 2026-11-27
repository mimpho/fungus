/**
 * Legend of a Meteo layer: a colour bar with what its two ends mean, and an optional mark in between.
 * `scale`: { colors, stepped?, marks?, min?, max?, unit?, band?: { from, to } }. With `marks` (one amount
 * per colour) the colours sit at equal distances, whatever the amounts, and each has its number under it
 * (the last one «n+») instead of the two end labels. Stepped colours are drawn as
 * equal blocks (the conditions' bands); otherwise as a gradient. The ends read `lowLabel` / `highLabel`,
 * or the scale's min and «max+» with its unit. `band` marks a stretch of the scale (the rain's «good»
 * band) with a green line under the numbers, named by `bandLabel` under it. `center` sits between the end labels (the day of the data); `extra`
 * after the high end (an info tip).
 */
export function LayerLegend({ scale, lowLabel, highLabel, center = null, extra = null, bandLabel = null, className = '' }) {
  const { colors, stepped = false, marks = null, min, max, unit, band } = scale
  const low = lowLabel ?? `${min} ${unit}`
  const high = highLabel ?? `${max}+ ${unit}`
  const span = (max ?? 0) - (min ?? 0)
  // Where an amount falls on the bar, 0-100: between its two marks, or in proportion from min to max
  const position = v => {
    if (!marks) return ((v - min) / span) * 100
    const i = marks.findIndex(m => v <= m)
    if (i === 0) return 0
    if (i < 0) return 100
    return ((i - 1 + (v - marks[i - 1]) / (marks[i] - marks[i - 1])) / (marks.length - 1)) * 100
  }
  const at = v => `${Math.max(0, Math.min(100, position(v)))}%`
  const bandCentre = band && (marks || span > 0) ? (position(band.from) + position(band.to)) / 2 : 0
  const bandHalf = Math.min(bandCentre, 100 - bandCentre)

  return (
    <div className={className}>
      <div className="relative">
        {stepped ? (
          <div className="flex gap-[2px] h-2" aria-hidden="true">
            {colors.map(c => <span key={c} className="flex-1 first:rounded-l-full last:rounded-r-full" style={{ backgroundColor: c }} />)}
          </div>
        ) : (
          // With marks, a hairline: the rain's scale starts transparent and the bar's end would not be seen
          <div className={`h-2 rounded-full ${marks ? 'ring-1 ring-cream/25' : ''}`} aria-hidden="true" style={{ backgroundImage: `linear-gradient(90deg, ${colors.join(', ')})` }} />
        )}
      </div>
      {marks ? (
        <div className="relative h-[16px] mt-1 text-[11px] text-cream/80 tabular-nums" data-testid="legend-marks">
          {marks.map((m, i) => {
            const last = i === marks.length - 1
            return (
              <span
                key={m}
                className={`absolute top-0 whitespace-nowrap ${i === 0 ? '' : last ? '-translate-x-full' : '-translate-x-1/2'}`}
                style={{ left: at(m) }}
              >
                {last ? `${m}+` : m}
              </span>
            )
          })}
        </div>
      ) : (
        <div className="flex justify-between gap-2 text-[11px] text-cream/80 mt-1">
          <span>{low}</span>
          {center && <span className="text-cream/80 text-center">{center}</span>}
          <span className="inline-flex items-center gap-1">{high}{extra}</span>
        </div>
      )}
      {band && (marks || span > 0) && (
        <>
          <div className="relative h-1" aria-hidden="true">
            <span
              data-testid="legend-band"
              className="absolute inset-y-0 rounded-full bg-[var(--ui-score-high-bar)]"
              style={{ left: at(band.from), right: `calc(100% - ${at(band.to)})` }}
            />
          </div>
          {bandLabel && (
            // Centred under the stretch, in the widest box that stays inside the legend
            <p className="text-[11px] text-cream/80 text-center mt-[3px]" style={{ marginLeft: `${bandCentre - bandHalf}%`, width: `${2 * bandHalf}%` }}>
              <span className="sr-only">{`${band.from}–${band.to} ${unit}: `}</span>
              {bandLabel}
            </p>
          )}
        </>
      )}
    </div>
  )
}
