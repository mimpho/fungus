import { useMemo } from 'react'
import { useApp } from '../../contexts/AppContext'
import { usePointData } from '../../hooks/usePointData'
import { fetchPointForecast } from '../../services/observatoryService'
import { buildForecast } from '../../lib/forecastData'
import { localIso } from '../../lib/calendarData'
import { ObservatoryNotice } from './ObservatoryNotice'

const ICON = {
  sun: 'M12 4v2M12 18v2M4 12h2M18 12h2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M6.3 17.7l1.4-1.4M16.3 7.7l1.4-1.4M12 8.5a3.5 3.5 0 1 0 0 7a3.5 3.5 0 1 0 0-7z',
  cloud: 'M7 18h10a4 4 0 0 0 .5-7.97A5.5 5.5 0 0 0 7 11a3.5 3.5 0 0 0 0 7z',
  rain: 'M7 14h10a4 4 0 0 0 .5-7.97A5.5 5.5 0 0 0 7 7a3.5 3.5 0 0 0 0 7zM9 17l-1 3M13 17l-1 3M17 17l-1 3',
}
const WIND_ICON = 'M3 8h9a3 3 0 1 0-3-3M3 12h14a3 3 0 1 1-3 3M3 16h7'
const ICON_COLOR = { sun: 'text-yellow-400', cloud: 'text-cream/60', rain: 'text-[var(--ui-rain-text)]' }
const TAG_STYLE = {
  frost: { background: 'var(--ui-rain-bg)', color: 'var(--ui-rain-text)' },
  hot: { background: 'color-mix(in srgb, var(--ui-score-mid-bar) 28%, transparent)', color: 'rgb(var(--color-cream-rgb))' },
  rain: { background: 'color-mix(in srgb, var(--ui-score-high-bar) 20%, transparent)', color: 'var(--ui-score-high-text)' },
}

function Skeleton() {
  return <div aria-hidden="true" className="glass obs-card rounded-2xl h-[20rem] animate-pulse" />
}

function DayCard({ d }) {
  return (
    <li aria-label={d.aria} className="rounded-xl bg-cream/[0.05] p-3 flex flex-col items-start gap-2 min-w-0">
      <span aria-hidden="true" className="text-base font-semibold text-cream capitalize">
        {d.weekday} <span className="font-normal text-cream/60">{d.dayMonth}</span>
      </span>
      <div aria-hidden="true" className="flex items-center gap-3 self-center">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${ICON_COLOR[d.kind]}`}>
          <path d={ICON[d.kind]} />
        </svg>
        <span className="flex flex-col leading-tight">
          <span className="text-xl font-semibold text-cream">{d.maxText}</span>
          <span className="text-[15px] text-cream/60">{d.minText}</span>
        </span>
      </div>
      {/* Rain and wind: a 20 px cell for the bar or the icon and the text next to it; the rain text sits on the bar's base line */}
      <span aria-hidden="true" className="flex items-end gap-2 h-6 text-xs text-cream">
        <span className="w-5 h-full flex items-end justify-center">
          <span className="w-2.5 rounded-t-[3px] bg-[var(--ui-rain-text)]" style={{ height: d.bar }} />
        </span>
        <span className="leading-none translate-y-[2px]">{d.rainText}</span>
      </span>
      <span aria-hidden="true" className="flex items-center gap-2 h-6 text-xs text-cream">
        <span className="w-5 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cream/70">
            <path d={WIND_ICON} />
          </svg>
        </span>
        {d.windText}
      </span>
      {d.tag && (
        <span aria-hidden="true" className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={TAG_STYLE[d.tag]}>{d.tagLabel}</span>
      )}
    </li>
  )
}

/**
 * «Previsión en …»: the weather the cell's stored forecast announces. The next 7 days as cards;
 * days 8 to 16 as a compact trend, dimmed because it is less reliable. The same forecast is what
 * the calendar below draws its «forecast» days from.
 */
export function ForecastSection({ point, zoneName }) {
  const { t, lang } = useApp()
  const fc = usePointData(fetchPointForecast, point)
  const vm = useMemo(
    () => (fc.status === 'ready' ? buildForecast(fc.data, t, lang, localIso()) : null),
    [fc.status, fc.data, t, lang],
  )

  return (
    <section aria-labelledby="obs-fc-title" aria-busy={fc.status === 'loading'} className="space-y-3">
      {fc.status === 'loading' && <Skeleton />}
      {fc.status === 'error' && <ObservatoryNotice error={fc.error} onRetry={fc.retry} />}
      {fc.status === 'ready' && !vm && (
        <p role="note" className="glass obs-card rounded-2xl px-4 py-3 text-sm text-cream/80">{t.obsFcEmpty}</p>
      )}
      {vm && (
        <article className="glass obs-card rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
            <div className="min-w-0">
              <h3 id="obs-fc-title" className="font-display text-2xl text-cream">{t.obsFcTitle.replace('{name}', zoneName)}</h3>
              <p data-testid="forecast-summary" className="text-[13px] text-cream/60">{vm.summary}</p>
            </div>
            <span title={t.obsFcBadgeTitle} className="text-xs text-cream/70 rounded-full bg-cream/[0.08] px-3 py-1">{t.obsFcBadge}</span>
          </div>

          <ol aria-label={t.obsFcNear} className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {vm.near.map(d => <DayCard key={d.iso} d={d} />)}
          </ol>

          {vm.late.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] uppercase tracking-[1px] text-cream/60">{t.obsFcLate}</p>
              <ol className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1 opacity-80">
                {vm.late.map(d => (
                  <li key={d.iso} aria-label={d.aria} className="flex flex-col items-center gap-1 rounded-lg bg-cream/[0.05] px-1 py-1.5 text-[11px] text-cream/60">
                    <span aria-hidden="true">{d.dayMonth}</span>
                    <span aria-hidden="true" className="h-[22px] flex items-end">
                      <span className="w-2 rounded-t-sm bg-[var(--ui-rain-text)]" style={{ height: d.smallBar }} />
                    </span>
                    <span aria-hidden="true" className="text-cream">{d.maxText}/{d.minText}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <p className="text-xs text-cream/60">{t.obsFcNote}</p>
        </article>
      )}
    </section>
  )
}
