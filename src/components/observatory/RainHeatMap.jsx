import { useEffect, useMemo, useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { fetchTerritoryRain } from '../../services/observatoryService'
import { OUTLINE, INNER } from '../../data/cataloniaOutline'
import {
  HEAT_COLORS, MAP_W, MAP_H, MAX_WEEKS, binLimits, binOf, clampWindow,
  distanceKm, projectCatalonia, weeklyMeans, windowTotals,
} from '../../lib/territoryData'
import { ObservatoryNotice } from './ObservatoryNotice'
import { RainTimeline } from './RainTimeline'

const DEFAULT_WEEKS = 3
const TOP = 6

/** Rainiest areas first, one per comarca: the grid has several points in the same one. */
function topAreas(totals) {
  const seen = new Set()
  const out = []
  for (const o of [...totals].sort((a, b) => b.mm - a.mm)) {
    const key = o.zone.label ?? `p${o.zone.id}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(o)
    if (out.length === TOP) break
  }
  return out
}
const fmt = (v, lang) => new Intl.NumberFormat(lang, { maximumFractionDigits: 1 }).format(v)

function useTerritoryRain() {
  const [state, setState] = useState({ status: 'loading', data: null, error: null })
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const ctrl = new AbortController()
    setState({ status: 'loading', data: null, error: null })
    fetchTerritoryRain({ signal: ctrl.signal })
      .then(data => setState({ status: 'ready', data, error: null }))
      .catch(error => { if (error?.name !== 'AbortError') setState({ status: 'error', data: null, error }) })
    return () => ctrl.abort()
  }, [attempt])
  return { ...state, retry: () => setAttempt(a => a + 1) }
}

/** Rain heat map: one soft blob per zone with data, no interpolation between zones. */
export function RainHeatMap({ here }) {
  const { t, lang } = useApp()
  const rain = useTerritoryRain()
  const [win, setWin] = useState(null)
  const [hover, setHover] = useState(null)

  const weeks = rain.data?.weeks ?? []
  // Regular grid over Catalonia: each point stands for the ~25 km around it
  const zones = useMemo(() => (rain.data?.points ?? []).map((p, i) => ({ ...p, id: i })), [rain.data])
  const nameOf = z => z.label ?? t.obsHeatArea.replace('{lat}', z.lat.toFixed(1)).replace('{lon}', z.lon.toFixed(1))
  const last = weeks.length - 1
  const w = win ?? (last >= 0 ? { a: Math.max(0, last - DEFAULT_WEEKS + 1), b: last } : { a: 0, b: 0 })
  const nWeeks = w.b - w.a + 1

  const vm = useMemo(() => {
    if (last < 0) return null
    const totals = windowTotals(zones, w.a, w.b)
    const limits = binLimits(nWeeks)
    const mean = totals.length ? totals.reduce((s, o) => s + o.mm, 0) / totals.length : 0
    const nearest = here && totals.length
      ? totals.reduce((best, o) => {
          const d = distanceKm(here.lat, here.lon, o.zone.lat, o.zone.lon)
          return !best || d < best.d ? { o, d } : best
        }, null)
      : null
    const minGot = totals.length ? Math.min(...totals.map(o => o.got)) : 0
    return {
      totals, limits, mean, nearest, minGot,
      sorted: topAreas(totals),
      means: weeklyMeans(zones, weeks.length),
    }
  }, [zones, weeks.length, w.a, w.b, nWeeks, here, last])

  if (rain.status === 'error') return <ObservatoryNotice error={rain.error} onRetry={rain.retry} />
  if (rain.status === 'loading' || !vm) {
    return <div aria-hidden="true" className="glass obs-card rounded-2xl h-[28rem] animate-pulse" />
  }

  const dateFmt = new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'short', timeZone: 'UTC' })
  const dateYear = new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
  const from = new Date(`${weeks[w.a].start}T00:00:00Z`)
  const to = new Date(`${weeks[w.b].end}T00:00:00Z`)
  const range = `${dateFmt.format(from)} – ${dateYear.format(to)}`
  const weeksText = nWeeks === 1 ? t.obsHeatWeek1 : t.obsHeatWeeksN.replace('{n}', nWeeks)
  const dataEnd = new Date(`${rain.data.last_data_date}T00:00:00Z`)
  const lastIncomplete = dataEnd < new Date(`${weeks[last].end}T00:00:00Z`)
  const showPartial = vm.minGot < nWeeks || (w.b === last && lastIncomplete)

  const tip = hover ? vm.totals.find(o => o.zone.id === hover) : null
  let tipBox = null
  if (tip) {
    const p = projectCatalonia(tip.zone.lat, tip.zone.lon)
    const flip = p.x > MAP_W * 0.6
    tipBox = {
      left: `${((flip ? p.x - 16 : p.x + 16) / MAP_W) * 100}%`,
      top: `${Math.max(1, Math.min(((p.y - 22) / MAP_H) * 100, 90))}%`,
      transform: flip ? 'translateX(-100%)' : undefined,
    }
  }
  const hereP = here ? projectCatalonia(here.lat, here.lon) : null
  const legend = HEAT_COLORS.map((c, i) => ({
    c,
    text: i === 0 ? `< ${vm.limits[0]}` : i === HEAT_COLORS.length - 1 ? `≥ ${vm.limits[i - 1]}` : `${vm.limits[i - 1]}–${vm.limits[i]}`,
  }))
  const dots = [...vm.totals].sort((a, b) => a.mm - b.mm)

  return (
    <article aria-labelledby="obs-heat-title" className="glass obs-card rounded-2xl p-5 sm:p-6 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 id="obs-heat-title" className="font-display text-2xl sm:text-[26px] text-cream">{t.obsHeatTitle}</h3>
          <p className="text-[13px] text-cream/60">{t.obsHeatSub.replace('{n}', zones.length)}</p>
        </div>
        <span className="text-xs rounded-full px-3 py-1 text-coffee-light border border-dashed border-coffee-light">{t.obsHeatBadge}</span>
      </div>

      <div className="grid gap-x-6 gap-y-4 md:grid-cols-[minmax(0,3fr)_minmax(240px,1fr)]">
        <div className="min-w-0 space-y-1.5 md:row-span-2">
          <p className="text-xs font-semibold text-cream">{range}</p>
          <div className="relative w-full max-w-[620px] mx-auto">
            <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} role="img" aria-label={t.obsHeatAria.replace('{range}', range).replace('{n}', vm.totals.length)} className="w-full h-auto block overflow-visible">
              <defs>
                {HEAT_COLORS.map((c, i) => (
                  <radialGradient key={i} id={`obs-hg${i}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" style={{ stopColor: c, stopOpacity: 1 }} />
                    <stop offset="45%" style={{ stopColor: c, stopOpacity: 0.6 }} />
                    <stop offset="100%" style={{ stopColor: c, stopOpacity: 0 }} />
                  </radialGradient>
                ))}
                <clipPath id="obs-cat-clip"><path d={OUTLINE} /></clipPath>
              </defs>
              <path d={OUTLINE} style={{ fill: 'rgba(var(--color-cream-rgb), 0.06)', stroke: 'rgba(var(--color-cream-rgb), 0.35)', strokeWidth: 1.5, strokeLinejoin: 'round' }} />
              <path d={INNER} style={{ fill: 'none', stroke: 'rgb(var(--color-cream-rgb))', strokeOpacity: 0.18, strokeWidth: 1, strokeDasharray: '4 4' }} />
              <g clipPath="url(#obs-cat-clip)">
                {dots.map(o => {
                  const p = projectCatalonia(o.zone.lat, o.zone.lon)
                  const b = binOf(o.mm, vm.limits)
                  return o.mm < 0.5 ? null : <circle key={`b${o.zone.id}`} cx={p.x} cy={p.y} r={54 + b * 2} fill={`url(#obs-hg${b})`} pointerEvents="none" />
                })}
              </g>
              {dots.map(o => {
                const p = projectCatalonia(o.zone.lat, o.zone.lon)
                const zero = o.mm < 0.5
                const on = hover === o.zone.id
                return (
                  <g key={o.zone.id}>
                    <circle
                      cx={p.x} cy={p.y} r={zero ? 4 : 5}
                      style={zero
                        ? { fill: 'none', stroke: 'rgba(var(--color-cream-rgb), 0.55)', strokeWidth: 1.5 }
                        : { fill: HEAT_COLORS[binOf(o.mm, vm.limits)], stroke: 'rgb(var(--color-cream-rgb))', strokeWidth: on ? 2 : 1, strokeOpacity: 0.7 }}
                      pointerEvents="none"
                    />
                    {on && <circle cx={p.x} cy={p.y} r={4} style={{ fill: 'rgb(var(--color-cream-rgb))' }} pointerEvents="none" />}
                    <circle
                      cx={p.x} cy={p.y} r={14} fill="transparent" className="cursor-pointer" aria-label={`${nameOf(o.zone)}: ${fmt(o.mm, lang)} mm`}
                      onMouseEnter={() => setHover(o.zone.id)} onMouseLeave={() => setHover(null)} onClick={() => setHover(o.zone.id)}
                    />
                  </g>
                )
              })}
              {hereP && (
                <circle cx={hereP.x} cy={hereP.y} r={17} data-testid="heat-here" style={{ fill: 'none', stroke: 'rgb(var(--color-cream-rgb))', strokeWidth: 2, strokeDasharray: '3 3' }} pointerEvents="none" />
              )}
            </svg>
            {tipBox && (
              <div style={tipBox} className="absolute flex flex-col gap-0.5 rounded-[10px] bg-modal border border-cream/25 px-3 py-2 shadow-xl whitespace-nowrap pointer-events-none z-10">
                <span className="text-sm font-semibold text-cream">{nameOf(tip.zone)}</span>
                <span className="text-[12.5px] text-cream/70">{`${fmt(tip.mm, lang)} mm${tip.zone.elevation_m != null ? ` · ${tip.zone.elevation_m} m` : ''}`}</span>
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0 space-y-3">
          <div className="rounded-xl bg-cream/[0.06] px-3.5 py-3">
            <p className="text-[11px] uppercase tracking-[1.4px] font-medium text-coffee-light">{t.obsHeatMean.replace('{n}', vm.totals.length)}</p>
            <p data-testid="heat-mean" className="font-display text-3xl font-bold text-cream leading-tight">{fmt(vm.mean, lang)} mm</p>
            {vm.nearest && (
              <p className="text-[12.5px] text-cream/70">{t.obsHeatNearest.replace('{name}', nameOf(vm.nearest.o.zone)).replace('{mm}', `${fmt(vm.nearest.o.mm, lang)} mm`)}</p>
            )}
          </div>
          <div className="space-y-0.5">
            <p className="text-[11px] uppercase tracking-[1.4px] font-medium text-coffee-light pb-1">{t.obsHeatTop}</p>
            {vm.sorted.map(o => (
              <div key={o.zone.id} className="grid grid-cols-[14px_minmax(0,1fr)_auto] items-center gap-2.5 rounded-lg px-2 py-1.5">
                <span aria-hidden="true" className="h-3 w-3 rounded-full" style={{ background: o.mm < 0.5 ? 'transparent' : HEAT_COLORS[binOf(o.mm, vm.limits)] }} />
                <span className="flex flex-col min-w-0">
                  <span className="text-[13.5px] text-cream truncate">{nameOf(o.zone)}</span>
                  <span className="text-[11.5px] text-cream/60">{o.zone.elevation_m != null ? `${o.zone.elevation_m} m` : ''}</span>
                </span>
                <span className="text-[13.5px] font-semibold text-cream whitespace-nowrap">{fmt(o.mm, lang)} mm</span>
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            <p className="text-[11px] uppercase tracking-[1.4px] font-medium text-coffee-light">{t.obsHeatLegend.replace('{w}', weeksText)}</p>
            <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-cream/70">
              <span className="inline-flex items-center gap-1.5"><span aria-hidden="true" className="inline-block h-[11px] w-[11px] rounded-full border-[1.5px] border-cream/55" />0</span>
              {legend.map((l, i) => (
                <span key={i} className="inline-flex items-center gap-1.5">
                  <span aria-hidden="true" className="inline-block h-3 w-3 rounded-full" style={{ background: l.c }} />{l.text}
                </span>
              ))}
            </div>
            {showPartial && <p role="note" className="text-xs text-coffee-light">{vm.minGot < nWeeks ? t.obsHeatSomeWeeks.replace('{n}', vm.minGot) : t.obsHeatLastIncomplete}</p>}
          </div>
        </div>

        <div className="md:col-span-2 min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs">
            <span className="inline-flex items-center gap-2.5">
              <span className="font-semibold text-cream">{`${range} · ${weeksText}`}</span>
              {w.b !== last && (
                <button
                  type="button"
                  onClick={() => setWin(clampWindow(last - nWeeks + 1, last, last))}
                  className="rounded-full bg-cream/[0.08] hover:bg-cream/[0.14] px-2.5 py-0.5 text-cream"
                >
                  {t.obsHeatToToday}
                </button>
              )}
            </span>
            <span className="text-cream/50">{t.obsHeatHint}</span>
          </div>
          <RainTimeline weeks={weeks} means={vm.means} win={w} onChange={setWin} label={range} />
        </div>
      </div>

      <p className="text-[11.5px] text-cream/50">{t.obsHeatNote.replace('{max}', MAX_WEEKS)}</p>
    </article>
  )
}
