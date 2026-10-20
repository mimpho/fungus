import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { Tabs } from '../ui/Tabs'
import { Timeline } from './Timeline'
import { SCORE_BANDS, getScoreBand } from '../../lib/scoreBands'
import {
  TABS, fmt, indexAt, labelIndexes, linePath, niceRange, scaleY, ticks, tableRow,
} from '../../lib/chartData'
import { formatDay } from '../../lib/thermometer'
import { dragWindow } from '../../lib/timeline'

// Literal colours: the chart is SVG drawn from numbers, the same in both themes.
const RAIN = '#4a8fb8', AIR = '#d08a3c', SOIL = '#8a6a45', GOOD = '#4a7c59', WARN = '#c98a40', WIND = '#7b8794'
const CREAM = 'rgb(var(--color-cream-rgb))'
const LIMIT_COLOR = { activation: RAIN, moisture: SOIL, temperature: AIR, drying: WIND }
const LIMIT_NAME = { activation: 'obsThFActivation', moisture: 'obsThFMoisture', temperature: 'obsThFTemperature', drying: 'obsThFHeatDry' }
const TAB_KEY = { score: 'obsChTabScore', rain: 'obsChTabRain', temp: 'obsChTabTemp', hum: 'obsChTabHum', wind: 'obsChTabWind' }
const HEIGHT = 300, TOP = 30, BOTTOM = 272, LEFT = 40
const RAIN_MAX_MM = 40

const stroke = (color, width, dash, opacity = 1) => ({ stroke: color, strokeWidth: width, strokeDasharray: dash, strokeOpacity: opacity, fill: 'none', strokeLinejoin: 'round', strokeLinecap: 'round' })

/** Width in pixels of an element, kept up to date: the chart is drawn at real size so its text stays readable. */
function useWidth(ref, fallback = 640) {
  const [w, setW] = useState(fallback)
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const read = () => setW(Math.max(280, Math.floor(el.getBoundingClientRect().width)))
    read()
    const ro = new ResizeObserver(read)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return w
}

/** Lines of the tooltip of a day ahead (score tab): its score, where it comes from, and the weather. */
function futureTipLines(f, t, lang) {
  return [
    [t.obsChScore, `${f.score} · ${t[getScoreBand(f.score).obsKey]}`],
    [f.basis === 'forecast' ? t.obsChBasisForecast : t.obsChBasisEstimate, ''],
    [t.obsChMax, `${fmt(f.temp_max_c, lang)} °C`],
    [t.obsChMin, `${fmt(f.temp_min_c, lang)} °C`],
    [t.obsChRainDay, `${fmt(f.precipitation_mm, lang)} mm`],
  ]
}

/** Lines of the tooltip of one day on one tab: [label, value]. */
function tipLines(tab, d, t, lang) {
  const c = d.climate
  if (!c) return [[t.obsChNoData, '']]
  if (tab === 'score') {
    const out = [[t.obsChScore, d.v2 ? `${d.v2.score} · ${t[getScoreBand(d.v2.score).obsKey]}` : '–']]
    if (d.v2?.limiting_factor) out.push([t.obsChLimits, t[LIMIT_NAME[d.v2.limiting_factor]] ?? ''])
    return out
  }
  if (tab === 'rain') return [[t.obsChRainDay, `${fmt(c.precipitation_mm, lang)} mm`], [t.obsChRainAcc, `${fmt(d.acc, lang)} mm`]]
  if (tab === 'temp') return [[t.obsChMax, `${fmt(c.temp_max_c, lang)} °C`], [t.obsChAvg, `${fmt(c.temp_avg_c, lang)} °C`], [t.obsChMin, `${fmt(c.temp_min_c, lang)} °C`], [t.obsChSoil, `${fmt(c.soil_temp_c, lang)} °C`]]
  if (tab === 'hum') return [[t.obsChHumidity, `${c.humidity_pct} %`]]
  return [[t.obsChWindMean, `${c.wind_kmh} km/h`]]
}

function legendFor(tab, layers, species, t, future = []) {
  if (tab === 'score') {
    const out = [{ color: CREAM, label: t.obsChLegScore }]
    if (future.some(f => f.basis === 'forecast')) out.push({ color: CREAM, label: t.obsChLegForecast, dots: true })
    if (future.some(f => f.basis === 'estimate')) out.push({ color: CREAM, label: t.obsChLegEstimate, dots: true, opacity: 0.5 })
    return out
  }
  if (tab === 'rain') {
    const out = [{ color: RAIN, label: t.obsChRainDay, box: true }]
    if (layers.acc) out.push({ color: CREAM, label: t.obsChRainAcc })
    return out
  }
  if (tab === 'temp') {
    const out = [{ color: AIR, label: t.obsChAvg }, { color: SOIL, label: t.obsChSoil, dash: true }, { color: AIR, label: t.obsChMaxMinBand, box: true, faint: true }]
    if (species) out.push({ color: WARN, label: t.obsChSpeciesRange, dash: true })
    return out
  }
  if (tab === 'hum') return [{ color: RAIN, label: t.obsChHumidity }, { color: GOOD, label: t.obsChHumOptimum, box: true, faint: true }, { color: WARN, label: t.obsChBrakeLine, dash: true }]
  return [{ color: WIND, label: t.obsChWindMean, box: true }]
}

/** The drawing itself: one SVG per tab, with the events of the window on top. */
function Chart({ vm, tab, layers, range, width, future, pan }) {
  const { t, lang } = useApp()
  const svgRef = useRef(null)
  const gid = `g${useId().replace(/:/g, '')}`
  const [hover, setHover] = useState(null)
  const days = vm.days
  const N = days.length
  // Days ahead are only drawn on the score tab; the plot makes room for them after the real days
  const ahead = tab === 'score' ? future : []
  const F = ahead.length
  const NT = N + F
  const strip = tab === 'score' && layers.limit
  const rightAxis = tab === 'rain' && layers.acc
  const height = HEIGHT + (strip ? 26 : 0)
  const right = rightAxis ? 44 : 12
  const plotW = Math.max(60, width - LEFT - right)
  const step = plotW / NT
  const cx = i => LEFT + step * i + step / 2
  const bw = Math.max(2, Math.min(30, step * 0.8))

  const g = useMemo(() => {
    const c = days.map(d => d.climate)
    const num = f => c.filter(Boolean).map(f)
    if (tab === 'score') return { lo: 0, hi: 100, step: 25, extra: [0, 30, 55, 70, 85, 100] }
    if (tab === 'rain') {
      const maxAcc = Math.max(0, ...days.map(d => d.acc ?? 0))
      return { lo: 0, hi: RAIN_MAX_MM, step: 10, accMax: Math.max(240, Math.ceil(maxAcc / 60) * 60) }
    }
    if (tab === 'temp') {
      const lows = [...num(x => x.temp_min_c), ...(range ? [range.min] : [])]
      const highs = [...num(x => x.temp_max_c), ...(range ? [range.max] : [])]
      return { ...niceRange(Math.min(...lows, 5), Math.max(...highs, 35), 5, 5, 35), step: 5 }
    }
    if (tab === 'hum') return { ...niceRange(Math.min(...num(x => x.humidity_pct), 100), 100, 10, 40, 100), step: 10 }
    return { ...niceRange(0, Math.max(0, ...num(x => x.wind_kmh)), 5, 0, 20), step: 5 }
  }, [days, tab, range])

  const y = scaleY(g.lo, g.hi, BOTTOM, TOP)
  const yAcc = g.accMax ? scaleY(0, g.accMax, BOTTOM, TOP) : null
  const gridValues = g.extra ?? ticks(g.lo, g.hi, g.step)
  const unit = { score: '', rain: '', temp: '°', hum: '', wind: '' }[tab]
  const xLabels = labelIndexes(NT, Math.floor(plotW / 64))
  const dateAt = i => (i < N ? days[i].date : ahead[i - N].date)

  // Dragging the chart moves the window over the series, like the timeline: the days follow the
  // pointer, the window is only committed on release. A short click or touch still shows the day.
  const panRef = useRef(null)
  const [panning, setPanning] = useState(false)

  function down(e) {
    pick(e)
    if (!pan) return
    panRef.current = { x0: e.clientX, step0: step, start: pan.win, latest: pan.win, moved: false }
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch (_e) { /* not essential */ }
  }

  function move(e) {
    const d = panRef.current
    if (!d) { pick(e); return }
    const dx = e.clientX - d.x0
    if (!d.moved && Math.abs(dx) < 4) { pick(e); return }
    if (!d.moved) { d.moved = true; setPanning(true); setHover(null) }
    d.latest = dragWindow(d.start, 'move', -dx / d.step0, pan.length)
    pan.onDraft(d.latest)
  }

  function up() {
    const d = panRef.current
    panRef.current = null
    if (d?.moved) { setPanning(false); pan.onCommit(d.latest) }
  }

  function pick(e) {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    setHover(indexAt(e.clientX - rect.left, LEFT, step, NT))
  }

  const series = useMemo(() => ({
    score: days.map(d => d.v2?.score ?? null),
    avg: days.map(d => d.climate?.temp_avg_c ?? null),
    soil: days.map(d => d.climate?.soil_temp_c ?? null),
    hum: days.map(d => d.climate?.humidity_pct ?? null),
    acc: days.map(d => d.acc ?? null),
  }), [days])

  // The two runs of days ahead, each joined to the day before it so the dashed line starts where
  // the solid one ends: the days with forecast, then the estimate without it.
  const fcRuns = useMemo(() => {
    const last = days[N - 1]?.v2?.score ?? null
    const fcN = ahead.filter(f => f.basis === 'forecast').length
    const fc = Array(NT).fill(null), es = Array(NT).fill(null)
    const join = N - 1 + fcN
    if (F && fcN) { fc[N - 1] = last; ahead.slice(0, fcN).forEach((f, i) => { fc[N + i] = f.score }) }
    if (F && fcN < F) {
      es[join] = fcN ? ahead[fcN - 1].score : last
      ahead.slice(fcN).forEach((f, i) => { es[N + fcN + i] = f.score })
    }
    return { fc, es, fcN }
  }, [days, ahead, N, NT, F])

  // Band between each day's maximum and minimum
  const area = useMemo(() => {
    const pts = days.map((d, i) => (d.climate ? [cx(i), d.climate] : null)).filter(Boolean)
    if (pts.length < 2) return ''
    const at = (x, v) => `${x.toFixed(1)},${y(v).toFixed(1)}`
    return `M${pts.map(([x, c]) => at(x, c.temp_max_c)).join(' L')} L${pts.slice().reverse().map(([x, c]) => at(x, c.temp_min_c)).join(' L')} Z`
  }, [days, step, g]) // eslint-disable-line react-hooks/exhaustive-deps

  const bars = (key, max, color) => days.map((d, i) => {
    const v = d.climate?.[key]
    if (!(v > 0)) return null
    const top = y(v)
    const cut = v > max
    return (
      <g key={d.date}>
        <rect x={cx(i) - bw / 2} y={top} width={bw} height={Math.max(1.5, BOTTOM - top)} fill={color} fillOpacity="0.85" rx="1" />
        {cut && <path d={`M${cx(i) - bw / 2 - 2},${TOP + 8} l${bw + 4},-4`} style={stroke(CREAM, 2)} />}
      </g>
    )
  })

  const evMarks = layers.events ? vm.events.map(e => {
    const a = days.findIndex(d => d.date >= e.start)
    let b = -1
    days.forEach((d, i) => { if (d.date <= e.end) b = i })
    if (a < 0 || b < a) return null
    const mid = Math.round((a + b) / 2)
    const color = e.type === 'trigger' ? GOOD : WARN
    return (
      <g key={`${e.type}-${e.start}-${e.n}`}>
        {e.type === 'brake_dry' && <rect x={LEFT + step * a} y={TOP} width={step * (b - a + 1)} height={BOTTOM - TOP} fill={WARN} fillOpacity="0.12" />}
        <line x1={cx(mid)} x2={cx(mid)} y1={24} y2={BOTTOM} style={stroke(CREAM, 1, '2 3', 0.3)} />
        <circle cx={cx(mid)} cy={14} r={9} fill={color} stroke="#fff" strokeWidth="1.5" />
        <text x={cx(mid)} y={18} textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">{e.n}</text>
      </g>
    )
  }) : null

  // Line of the score: colour follows the band of each day (same bands as the thermometer)
  const gradStops = [...days.map(d => d.v2?.score ?? null), ...ahead.map(f => f.score)]
    .map((score, i) => (score != null ? { o: NT > 1 ? i / (NT - 1) : 0, key: getScoreBand(score).key } : null))
    .filter(Boolean)
  const useGrad = NT > 1 && gradStops.length > 1

  const hovered = hover != null && hover < N ? days[hover] : null
  const hoveredAhead = hover != null && hover >= N ? ahead[hover - N] : null
  const tipLeft = hover != null && cx(hover) > width * 0.6

  // select-none: dragging the chart must not select the tooltip's or the axes' text
  return (
    <div className="relative select-none">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${t[TAB_KEY[tab]]}: ${formatDay(days[0].date, lang)} – ${formatDay(dateAt(NT - 1), lang)}`}
        className="block max-w-full touch-pan-y"
      >
        {tab === 'score' && useGrad && (
          <defs>
            <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1={cx(0)} x2={cx(NT - 1)} y1="0" y2="0">
              {gradStops.map(s => <stop key={s.o} offset={s.o.toFixed(4)} style={{ stopColor: `var(--ui-score-${s.key}-bar)` }} />)}
            </linearGradient>
          </defs>
        )}
        {tab === 'score' && SCORE_BANDS.map((b, i, all) => {
          const hi = i === 0 ? 100 : all[i - 1].min, lo = b.min
          return (
            <g key={b.key}>
              <rect x={LEFT} y={y(hi)} width={plotW} height={y(lo) - y(hi)} style={{ fill: `var(--ui-score-${b.key}-bar)` }} fillOpacity="0.1" />
              <text x={LEFT + 8} y={y(hi) + 14} fontSize="10.5" fontWeight="600" letterSpacing="0.4" style={{ fill: `var(--ui-score-${b.key}-text)` }}>{t[b.obsKey]}</text>
            </g>
          )
        })}
        {tab === 'temp' && range && (
          <g>
            <rect x={LEFT} y={y(range.max)} width={plotW} height={y(range.min) - y(range.max)} fill={WARN} fillOpacity="0.08" />
            <line x1={LEFT} x2={LEFT + plotW} y1={y(range.max)} y2={y(range.max)} style={stroke(CREAM, 1.2, '6 4', 0.55)} />
            <line x1={LEFT} x2={LEFT + plotW} y1={y(range.min)} y2={y(range.min)} style={stroke(CREAM, 1.2, '6 4', 0.55)} />
            {range.opt != null && <line x1={LEFT} x2={LEFT + plotW} y1={y(range.opt)} y2={y(range.opt)} style={stroke(CREAM, 1, '1 4', 0.4)} />}
          </g>
        )}
        {tab === 'hum' && (
          <g>
            <rect x={LEFT} y={y(90)} width={plotW} height={y(70) - y(90)} fill={GOOD} fillOpacity="0.1" />
            {g.lo <= 55 && <line x1={LEFT} x2={LEFT + plotW} y1={y(55)} y2={y(55)} style={stroke(WARN, 1.2, '6 4', 0.8)} />}
          </g>
        )}
        {tab === 'rain' && yAcc && <rect x={LEFT} y={yAcc(120)} width={plotW} height={yAcc(60) - yAcc(120)} fill={GOOD} fillOpacity="0.1" />}

        {gridValues.map(v => (
          <g key={v}>
            <line x1={LEFT} x2={LEFT + plotW} y1={y(v)} y2={y(v)} style={stroke(CREAM, 1, undefined, v === 0 && g.lo < 0 ? 0.45 : 0.12)} />
            <text x={LEFT - 6} y={y(v) + 4} textAnchor="end" fontSize="11" style={{ fill: CREAM, fillOpacity: 0.6 }}>{v}{unit}</text>
          </g>
        ))}
        {rightAxis && ticks(0, g.accMax, 60).map(v => (
          <text key={v} x={LEFT + plotW + 6} y={yAcc(v) + 4} fontSize="11" style={{ fill: CREAM, fillOpacity: 0.6 }}>{v}</text>
        ))}
        {xLabels.map(i => (
          <text key={i} x={cx(i)} y={BOTTOM + 17} textAnchor="middle" fontSize="11" style={{ fill: CREAM, fillOpacity: 0.6 }}>{formatDay(dateAt(i), lang)}</text>
        ))}

        {tab === 'rain' && bars('precipitation_mm', RAIN_MAX_MM, RAIN)}
        {tab === 'wind' && bars('wind_kmh', g.hi, WIND)}
        {tab === 'rain' && layers.acc && <path d={linePath(series.acc, cx, yAcc)} style={stroke(CREAM, 2.2)} />}

        {tab === 'temp' && (
          <g>
            <path d={area} fill={AIR} fillOpacity="0.14" />
            <path d={linePath(series.soil, cx, y)} style={stroke(SOIL, 2, '6 3')} />
            <path d={linePath(series.avg, cx, y)} style={stroke(AIR, 2.2)} />
          </g>
        )}
        {tab === 'hum' && <path d={linePath(series.hum, cx, y)} style={stroke(RAIN, 2.2)} />}
        {F > 0 && (
          <g>
            <rect x={LEFT + step * N} y={TOP} width={step * F} height={BOTTOM - TOP} fill={CREAM} fillOpacity="0.035" />
            <line x1={LEFT + step * N} x2={LEFT + step * N} y1={TOP} y2={BOTTOM} style={stroke(CREAM, 1, '4 4', 0.5)} />
            <text x={LEFT + step * N + 8} y={TOP + 14} fontSize="11" fontWeight="600" style={{ fill: CREAM, fillOpacity: 0.7 }}>{t.obsChFutureLabel}</text>
            {fcRuns.fcN > 0 && <path d={linePath(fcRuns.fc, cx, y)} style={stroke(useGrad ? `url(#${gid})` : CREAM, 3, '2 6')} />}
            {fcRuns.fcN < F && <path d={linePath(fcRuns.es, cx, y)} style={stroke(useGrad ? `url(#${gid})` : CREAM, 3, '2 6', 0.5)} />}
          </g>
        )}
        {tab === 'score' && (
          <g>
            <path d={linePath(series.score, cx, y)} style={stroke(useGrad ? `url(#${gid})` : CREAM, 3)} />
            {N <= 40 && days.map((d, i) => d.v2 && (
              <circle key={d.date} cx={cx(i)} cy={y(d.v2.score)} r={3.2} style={{ fill: `var(--ui-score-${getScoreBand(d.v2.score).key}-bar)` }} stroke={CREAM} strokeOpacity="0.8" strokeWidth="1" />
            ))}
          </g>
        )}
        {strip && days.map((d, i) => d.v2?.limiting_factor && (
          <rect key={d.date} x={LEFT + step * i + 0.5} y={BOTTOM + 26} width={Math.max(1, step - 1)} height={12} fill={LIMIT_COLOR[d.v2.limiting_factor] ?? WIND} />
        ))}

        {evMarks}
        {(hovered || hoveredAhead) && <line x1={cx(hover)} x2={cx(hover)} y1={TOP} y2={BOTTOM} style={stroke(CREAM, 1, '3 3', 0.6)} />}
        <rect
          x={LEFT} y={TOP - 6} width={plotW} height={BOTTOM - TOP + 6} fill="transparent"
          onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
          onPointerLeave={() => { if (!panRef.current) setHover(null) }}
          style={{ cursor: pan ? (panning ? 'grabbing' : 'grab') : undefined }}
        />
      </svg>
      {hoveredAhead && (
        <div
          role="status"
          data-testid="chart-tip"
          className="absolute z-10 pointer-events-none rounded-lg px-2.5 py-1.5 text-xs bg-modal/95 backdrop-blur-sm border border-cream/20 text-cream shadow-lg"
          style={{ top: TOP, [tipLeft ? 'right' : 'left']: tipLeft ? width - cx(hover) + 10 : cx(hover) + 10 }}
        >
          <p className="font-medium mb-0.5">{formatDay(hoveredAhead.date, lang)}</p>
          <p className="font-display font-bold text-2xl leading-none mb-1" style={{ color: `var(--ui-score-${getScoreBand(hoveredAhead.score).key}-text)` }}>{hoveredAhead.score}</p>
          {futureTipLines(hoveredAhead, t, lang).map(([label, value]) => (
            <p key={label} className="flex justify-between gap-3"><span className="text-cream/70">{label}</span><span>{value}</span></p>
          ))}
        </div>
      )}
      {hovered && (
        <div
          role="status"
          data-testid="chart-tip"
          className="absolute z-10 pointer-events-none rounded-lg px-2.5 py-1.5 text-xs bg-modal/95 backdrop-blur-sm border border-cream/20 text-cream shadow-lg"
          style={{ top: TOP, [tipLeft ? 'right' : 'left']: tipLeft ? width - cx(hover) + 10 : cx(hover) + 10 }}
        >
          <p className="font-medium mb-0.5">{formatDay(hovered.date, lang)}</p>
          {tab === 'score' && hovered.v2 && (
            <p className="font-display font-bold text-2xl leading-none mb-1" style={{ color: `var(--ui-score-${getScoreBand(hovered.v2.score).key}-text)` }}>{hovered.v2.score}</p>
          )}
          {tipLines(tab, hovered, t, lang).map(([label, value]) => (
            <p key={label} className="flex justify-between gap-3"><span className="text-cream/70">{label}</span><span>{value}</span></p>
          ))}
        </div>
      )}
    </div>
  )
}

function Legend({ items }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-[12.5px] text-cream/70">
      {items.map(it => (
        <li key={it.label} className="flex items-center gap-2 leading-snug">
          <svg width="18" height="10" aria-hidden="true" className="shrink-0">
            {it.box
              ? <rect x="1" y="1" width="16" height="8" rx="2" fill={it.color} fillOpacity={it.faint ? 0.3 : 0.85} />
              : <line x1="1" x2="17" y1="5" y2="5" style={stroke(it.color, 2.4, it.dots ? '2 4' : it.dash ? '5 3' : undefined, it.opacity ?? 1)} />}
          </svg>
          {it.label}
        </li>
      ))}
    </ul>
  )
}

function DataTable({ days }) {
  const { t, lang } = useApp()
  const rows = days.map(d => tableRow(d, lang)).reverse()
  const tagText = { frost: t.obsChTagFrost, heat: t.obsChTagHeat, rain: t.obsChTagRain }
  return (
    <div data-testid="chart-table" className="max-h-[350px] overflow-auto rounded-xl border border-cream/15" tabIndex={0} aria-label={t.obsChTable}>
      <table className="w-full text-xs text-cream/80 border-collapse">
        <thead className="sticky top-0 bg-modal">
          <tr className="text-left text-cream/60">
            {[t.obsChColDay, t.obsChScore, t.obsChColRain, t.obsChColMax, t.obsChColMin, t.obsChColSoil, t.obsChColHum, t.obsChColWind, ''].map((h, i) => <th key={i} scope="col" className="px-2 py-1.5 font-medium whitespace-nowrap">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.date} className="border-t border-cream/10">
              <th scope="row" className="px-2 py-1 font-medium whitespace-nowrap text-left">{r.day}</th>
              <td className="px-2 py-1">{r.score ?? '–'}</td>
              <td className="px-2 py-1">{fmt(r.rain, lang)}</td>
              <td className="px-2 py-1">{fmt(r.max, lang)}</td>
              <td className="px-2 py-1">{fmt(r.min, lang)}</td>
              <td className="px-2 py-1">{fmt(r.soil, lang)}</td>
              <td className="px-2 py-1">{r.hum ?? '–'}</td>
              <td className="px-2 py-1">{r.wind ?? '–'}</td>
              <td className="px-2 py-1 whitespace-nowrap">{r.tag ? tagText[r.tag] : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * The weather chart of the observed point: Momento (the score), Lluvia, Temperatura, Humedad and
 * Viento over a window of days ending at the last day with data. Triggers and brakes are drawn as
 * numbered circles with the same numbers as the list beside it. `vm` is prepareSeries().
 */
export function WeatherChart({ vm, timeline, speciesName, range, future = [] }) {
  const { t } = useApp()
  const uid = useId()
  const [tab, setTab] = useState('score')
  const [layers, setLayers] = useState({ events: true, limit: false, acc: true })
  const [showTable, setShowTable] = useState(false)
  const boxRef = useRef(null)
  const width = useWidth(boxRef)
  const pan = timeline ? { win: timeline.win, length: timeline.series.length, onDraft: timeline.onDraft, onCommit: timeline.onCommit } : null
  const toggle = key => setLayers(l => ({ ...l, [key]: !l[key] }))

  const available = { score: ['events', 'limit'], rain: ['events', 'acc'], temp: ['events'], hum: ['events'], wind: [] }[tab]
  const LAYER_LABEL = { events: t.obsChLayerEvents, limit: t.obsChLayerLimit, acc: t.obsChLayerAcc }
  const title = tab === 'score' && speciesName ? t.obsSpFor.replace('{name}', speciesName) : t[`obsChTitle_${tab}`]

  const fcDays = future.filter(f => f.basis === 'forecast').length
  const futureNote = future.length
    ? (fcDays ? t.obsChFutureNote.replace('{n}', future.length).replace('{fc}', fcDays) : t.obsChFutureNoteNone.replace('{n}', future.length))
    : ''

  const showEventKinds = layers.events && available.includes('events') && vm.events.length > 0

  return (
    <article aria-labelledby={`${uid}-h`} className="glass obs-card rounded-2xl p-[22px] space-y-4 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h3 id={`${uid}-h`} className="font-display text-[26px] leading-tight text-cream">{t.obsChTitle}</h3>
      </div>

      <div className="overflow-x-auto max-w-full [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&_button]:whitespace-nowrap [&>div]:w-max" role="group" aria-label={t.obsChTabsLabel}>
        <Tabs options={TABS.map(id => ({ id, label: t[TAB_KEY[id]] }))} selected={tab} onChange={setTab} size="md" />
      </div>

      <p className="text-[13px] text-cream/70 !mt-2">
        {title}
        {tab === 'score' && future.length > 0 && <span> · {futureNote}</span>}
      </p>

      <div className="space-y-3">
        <div ref={boxRef} className="w-full min-w-0">
          {vm.hasData ? (
            <Chart vm={vm} tab={tab} layers={layers} range={range} width={width} future={future} pan={pan} />
          ) : (
            <p className="text-sm text-cream/70 py-8 text-center">{t.obsChNoDataWindow}</p>
          )}
        </div>

        <Timeline tab={tab} {...timeline} />

        {vm.hasData && (
          <div className="border-t border-cream/10 pt-3 space-y-3">
            {available.length > 0 && (
              <fieldset className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <legend className="sr-only">{t.obsChShow}</legend>
                <span aria-hidden="true" className="text-[11px] uppercase tracking-[0.5px] font-medium text-cream/60">{t.obsChShow}</span>
                {available.map(k => (
                  <label key={k} className="flex items-center gap-2 text-[13px] text-cream/80 cursor-pointer leading-snug">
                    <input type="checkbox" checked={layers[k]} onChange={() => toggle(k)} className="obs-chk" />
                    {LAYER_LABEL[k]}
                  </label>
                ))}
              </fieldset>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              <Legend items={legendFor(tab, layers, !!range, t, future)} />
              {tab === 'score' && layers.limit && (
                <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-[12.5px] text-cream/70" aria-label={t.obsChLimits}>
                  {Object.entries(LIMIT_COLOR).map(([k, c]) => (
                    <li key={k} className="flex items-center gap-2"><span aria-hidden="true" className="inline-block w-3 h-3 rounded-sm shrink-0" style={{ background: c }} />{t[LIMIT_NAME[k]]}</li>
                  ))}
                </ul>
              )}
              {showEventKinds && (
                <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-[12.5px] text-cream/70" aria-hidden="true">
                  <li className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-full shrink-0" style={{ background: GOOD }} />{t.obsChKindTrigger}</li>
                  <li className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-full shrink-0" style={{ background: WARN }} />{t.obsChKindBrake}</li>
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      {vm.hasData && (
        <>
          <button
            type="button"
            onClick={() => setShowTable(s => !s)}
            aria-expanded={showTable}
            className="px-4 py-2 rounded-xl glass text-cream text-sm font-medium hover:[background-color:var(--ui-surface-hover)] transition-all"
          >
            {showTable ? t.obsChHideTable : t.obsChShowTable}
          </button>
          {showTable && <DataTable days={vm.days} />}
        </>
      )}
    </article>
  )
}
