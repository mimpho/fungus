// The day bar's weekly figures as one filled line down to 0, like the charts of the observed zone:
// rain in blue, conditions coloured by height with the five score bands. The forecast has a fainter
// fill and a dashed line.
import { useId } from 'react'
import { addDays, daysBetween } from '../../lib/layerDays'
import { smoothArea, smoothPath } from '../../lib/chartData'
import { BARS_PX, RAIN_FULL_MM } from '../../lib/dayBar'

const BLUE = '#2f7fe8' // ACC_BLUE of the observed zone's chart
// Colour by score, from the bottom up: the stops of the zone chart's score line, at the middle of each
// band so each band reads as its own colour
const SCORE_STOPS = [[0, 'low'], [15, 'low'], [42.5, 'mid'], [62.5, 'ok'], [77.5, 'good'], [92.5, 'high'], [100, 'high']]

// What fills the height, and how a part of a week becomes a point. Rain is a sum, so a part of fewer
// than seven days is taken at its weekly pace (sum × 7 / days), or the line would dip wherever a week
// is cut; conditions are a mean, which needs nothing
const LAYERS = {
  rain: { full: RAIN_FULL_MM, point: (value, days) => (value / days) * 7 },
  conditions: { full: 100, point: value => value },
}
const W = 1000 // width of the drawing's own coordinates; it is stretched to the bar's

/**
 * The line's points, one per part of a week with a figure (the current week has two: real and forecast):
 * [{ x: 0-100, v }]. A part with days on the axis and no figure gives v null, which breaks the line.
 * `at` is the axis' day → percentage.
 */
function points(weeks, layer, first, total, today, at) {
  const out = []
  for (const week of weeks ?? []) {
    const parts = [
      { start: week.from, end: week.to < today ? week.to : addDays(today, -1), data: week.real },
      { start: week.from > today ? week.from : today, end: week.to, data: week.forecast },
    ]
    for (const p of parts) {
      if (p.start > p.end) continue
      const from = Math.max(0, daysBetween(first, p.start))
      const to = Math.min(total, daysBetween(first, p.end) + 1)
      if (to <= from) continue
      const { value, days } = p.data ?? {}
      out.push({ x: (at(from) + at(to)) / 2, v: value == null || !days ? null : LAYERS[layer].point(value, days) })
    }
  }
  return out
}

export function DayArea({ weeks, layer, first, total, today, forecastStart, at }) {
  const id = useId().replace(/:/g, '')
  const pts = points(weeks, layer, first, total, today, at)
  if (!pts.length) return null
  // the line reaches both ends of the axis
  const all = [{ x: 0, v: pts[0].v }, ...pts, { x: 100, v: pts[pts.length - 1].v }]
  const values = all.map(p => p.v)
  const { full } = LAYERS[layer]
  const rain = layer === 'rain'
  const x = i => (all[i].x / 100) * W
  const y = v => BARS_PX - (Math.min(v, full) / full) * BARS_PX
  const peak = Math.max(1, ...values.map(v => v ?? 0))
  const split = forecastStart < total ? (at(Math.max(0, forecastStart)) / 100) * W : W
  const line = smoothPath(values, x, y)
  const area = smoothArea(values, x, y, BARS_PX)
  // A figure between two parts without one has no line to be part of: it is marked with a dot
  const dots = values
    .map((v, i) => (v != null && values[i - 1] == null && values[i + 1] == null ? `M${x(i).toFixed(1)},${y(v).toFixed(1)}h0.01` : ''))
    .join('')
  const paint = `url(#${id}colour)`
  const stroke = { stroke: rain ? BLUE : paint, strokeWidth: 2, fill: 'none', strokeLinejoin: 'round', strokeLinecap: 'round', vectorEffect: 'non-scaling-stroke' }
  // Rain fades out towards 0 mm; conditions keep their colour all the way down, only fainter than the line
  const fill = rain ? { fill: `url(#${id}fill)`, opacity: 1 } : { fill: paint, opacity: 0.4 }

  return (
    <svg data-testid="day-bar-area" data-layer={layer} className="absolute inset-x-0 top-0 w-full overflow-visible" height={BARS_PX} viewBox={`0 0 ${W} ${BARS_PX}`} preserveAspectRatio="none">
      <defs>
        {rain ? (
          // from transparent at 0 mm to full at the highest week on the bar, as in the chart
          <linearGradient id={`${id}fill`} gradientUnits="userSpaceOnUse" x1="0" x2="0" y1={BARS_PX} y2={y(peak)}>
            <stop offset="0" stopColor={BLUE} stopOpacity="0.15" />
            <stop offset="1" stopColor={BLUE} stopOpacity="0.85" />
          </linearGradient>
        ) : (
          // the colour belongs to the height: red low, green high
          <linearGradient id={`${id}colour`} gradientUnits="userSpaceOnUse" x1="0" x2="0" y1={BARS_PX} y2={0}>
            {SCORE_STOPS.map(([score, key]) => (
              <stop key={score} offset={score / 100} style={{ stopColor: `var(--meteo-bar-${key})` }} />
            ))}
          </linearGradient>
        )}
        <clipPath id={`${id}past`}><rect x="0" y="-4" width={split} height={BARS_PX + 8} /></clipPath>
        <clipPath id={`${id}ahead`}><rect x={split} y="-4" width={W - split} height={BARS_PX + 8} /></clipPath>
      </defs>
      <g clipPath={`url(#${id}past)`}>
        <path d={area} fill={fill.fill} fillOpacity={fill.opacity} />
        <path d={line} style={stroke} />
        {dots && <path data-testid="day-bar-dot" d={dots} style={{ ...stroke, strokeWidth: 4 }} />}
      </g>
      {/* the forecast: a fainter fill and a dashed line */}
      <g clipPath={`url(#${id}ahead)`}>
        <path d={area} fill={fill.fill} fillOpacity={fill.opacity * 0.4} />
        <path d={line} style={{ ...stroke, strokeDasharray: '4 3' }} />
        {dots && <path d={dots} style={{ ...stroke, strokeWidth: 4 }} />}
      </g>
    </svg>
  )
}
