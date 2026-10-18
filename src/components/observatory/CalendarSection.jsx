import { useMemo, useRef } from 'react'
import { useApp } from '../../contexts/AppContext'
import { buildCalendar } from '../../lib/calendarData'
import { ObservatoryNotice } from './ObservatoryNotice'

const bandColor = key => `var(--ui-score-${key}-bar)`
const tint = (key, percent) => `color-mix(in srgb, ${bandColor(key)} ${percent}%, transparent)`

function Skeleton() {
  return <div aria-hidden="true" className="glass obs-card rounded-2xl h-[26rem] animate-pulse" />
}

function Cell({ cell }) {
  const style = cell.bandKey ? { background: tint(cell.bandKey, cell.fill) } : undefined
  const ring = cell.isToday ? 'shadow-[inset_0_0_0_2px_rgb(var(--color-cream-rgb))]' : ''
  const real = cell.basis === 'real' ? 'outline outline-1 -outline-offset-1 outline-dashed outline-cream/50' : ''
  return (
    <li
      aria-label={cell.aria}
      aria-current={cell.isToday ? 'date' : undefined}
      data-testid="calendar-cell"
      data-basis={cell.basis ?? 'none'}
      className={`rounded-lg min-h-[3.25rem] sm:min-h-[3.6rem] px-1.5 py-1 sm:px-2 sm:py-1.5 flex flex-col justify-between ${cell.inRange ? '' : 'opacity-30'} ${real} ${ring}`}
      style={style}
    >
      <span aria-hidden="true" className="flex justify-between gap-1 text-[11px] sm:text-xs text-cream">
        <span className="font-semibold">{cell.dayNumber}</span>
        <span className="text-cream/60 truncate">{cell.monthLabel}</span>
      </span>
      <span aria-hidden="true" className="font-display text-lg sm:text-xl font-bold leading-none text-cream text-right">
        {cell.score !== null && (cell.basis === 'estimate' ? <span className="text-cream/70 text-sm font-medium mr-0.5">≈</span> : null)}
        {cell.score ?? ''}
      </span>
    </li>
  )
}

function Legend({ vm, t }) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-cream/70">
      {vm.legend.map(b => (
        <span key={b.key} className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="w-3.5 h-3.5 rounded" style={{ background: tint(b.key, b.fill) }} />
          {b.label}
        </span>
      ))}
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden="true" className="w-3.5 h-3.5 rounded outline outline-1 -outline-offset-1 outline-dashed outline-cream/60" />
        {t.obsCalLegendReal}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden="true" className="text-cream/80 font-medium">≈</span>
        {t.obsCalLegendEstimate}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden="true" className="w-3.5 h-3.5 rounded shadow-[inset_0_0_0_2px_rgb(var(--color-cream-rgb))]" />
        {t.obsCalLegendToday}
      </span>
    </div>
  )
}

/**
 * «¿Cuándo me conviene ir?»: the score day by day, the last 7 real days and the next 35. The days
 * the forecast reaches say so; the rest are an estimate without forecast and are marked «≈», so
 * an estimate is never read as a forecast. `cal` is the usePointData state of the calendar (asked by the zone, for the species being looked at).
 * Changing the species asks again and keeps the last calendar, dimmed, until the new one arrives.
 */
export function CalendarSection({ cal, speciesName }) {
  const { t, lang } = useApp()
  const vm = useMemo(() => (cal.status === 'ready' ? buildCalendar(cal.data, t, lang) : null), [cal.status, cal.data, t, lang])

  const lastRef = useRef(null)
  if (vm) lastRef.current = vm
  const shown = vm ?? (cal.status === 'loading' ? lastRef.current : null)

  return (
    <section aria-labelledby="obs-cal-title" aria-busy={cal.status === 'loading'} className="space-y-3">
      {cal.status === 'loading' && !shown && <Skeleton />}
      {cal.status === 'error' && <ObservatoryNotice error={cal.error} onRetry={cal.retry} />}
      {cal.status === 'ready' && !vm && (
        <p role="note" className="glass obs-card rounded-2xl px-4 py-3 text-sm text-cream/80">{t.obsCalEmpty}</p>
      )}
      {shown && (
        <article className={`glass obs-card rounded-2xl p-5 space-y-4 transition-opacity ${vm ? '' : 'opacity-60'}`}>
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
            <div className="min-w-0">
              <h3 id="obs-cal-title" className="font-display text-2xl text-cream">{t.obsCalTitle}</h3>
              <p className="text-[13px] text-cream/60">
                {speciesName ? t.obsCalSubSpecies.replace('{name}', speciesName) : t.obsCalSubGeneric}
              </p>
            </div>
            <span className="text-xs text-cream/70 rounded-full bg-cream/[0.08] px-3 py-1">
              {shown.hasForecast ? t.obsCalBadgeForecast : t.obsCalBadgeNoForecast}
            </span>
          </div>

          <p data-testid="calendar-summary" className="text-[15px] text-cream">{shown.summary}</p>

          <div className="overflow-x-auto">
            <div className="min-w-[19rem] space-y-1.5">
              <div aria-hidden="true" className="grid grid-cols-7 gap-1 sm:gap-1.5 text-[11px] uppercase tracking-[0.5px] text-cream/60">
                {shown.weekdays.map(d => <span key={d}>{d}</span>)}
              </div>
              <ol aria-label={t.obsCalGridLabel} className="grid grid-cols-7 gap-1 sm:gap-1.5">
                {shown.cells.map(c => <Cell key={c.iso} cell={c} />)}
              </ol>
            </div>
          </div>

          <Legend vm={shown} t={t} />
          <p className="text-xs text-cream/60">{shown.note}</p>
        </article>
      )}
    </section>
  )
}
