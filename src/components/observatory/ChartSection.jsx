import { useEffect, useMemo, useRef, useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { usePointData } from '../../hooks/usePointData'
import { fetchPointSeries } from '../../services/observatoryService'
import { MAX_API_DAYS, futureDays, prepareSeries } from '../../lib/chartData'
import { commitOf, resolveWindow, sameWindow } from '../../lib/timeline'
import { ObservatoryNotice } from './ObservatoryNotice'
import { WeatherChart } from './WeatherChart'
import { EventsList } from './EventsList'

function Skeleton() {
  return <div aria-hidden="true" className="glass obs-card rounded-2xl h-[28rem] animate-pulse" />
}

/**
 * Charts and events of the observed point. One request per species brings the whole series
 * (MAX_API_DAYS days); the window over it ({ until, days } of the URL) is only a slice of it, so
 * moving the timeline asks for nothing. While the window is being dragged the chart follows the
 * pointer (`draft`) and the page's window is only changed on release. `species` is the id being
 * looked at (or null) and `range` its thermal range, drawn as a band on the temperature tab.
 */
export function ChartSection({ point, species, speciesName, range, until, days, onWindow, calendar = null, enabled = true, children }) {
  const { t } = useApp()
  const series = usePointData(fetchPointSeries, point, { days: MAX_API_DAYS, species }, { enabled })
  const all = series.status === 'ready' ? series.data.days ?? [] : null
  const committed = useMemo(() => (all ? resolveWindow(all, until, days) : null), [all, until, days])
  const [draft, setDraft] = useState(null)
  const win = draft ?? committed
  const vm = useMemo(() => (all && win ? prepareSeries(series.data, win) : null), [all, win, series.data])

  // Changing the species asks again: keep showing the last chart (and keep its tab and layers)
  // dimmed until the new one arrives, instead of replacing it with a skeleton.
  const lastRef = useRef(null)
  if (vm) lastRef.current = { vm, all, win }
  const shown = vm ? { vm, all, win } : series.status === 'loading' ? lastRef.current : null

  // The draft stays until the URL has caught up with it: dropping it on release would show the
  // old window for a moment (a small jump) before the new one arrives.
  useEffect(() => { setDraft(null) }, [committed])

  function commit(next) {
    if (!shown || sameWindow(next, committed)) { setDraft(null); return }
    setDraft(next)
    const { until: u, days: d } = commitOf(shown.all, next)
    onWindow(u, d)
  }

  // The score chart always has room for the days that follow the window, so that moving back does
  // not rescale it: those days are the real ones between the window and today, then the forecast
  // (as many days ahead as there is room for). At the last day they are all forecast.
  const atLatest = Boolean(shown) && shown.win.b >= shown.all.length - 1
  const { tail, future } = useMemo(() => {
    if (!shown || calendar?.status !== 'ready') return { tail: [], future: [] }
    const ahead = futureDays(calendar.data, shown.all[shown.all.length - 1]?.date)
    const real = Math.min(ahead.length, shown.all.length - 1 - shown.win.b)
    return {
      tail: shown.all.slice(shown.win.b + 1, shown.win.b + 1 + real),
      future: ahead.slice(0, ahead.length - real),
    }
  }, [shown, calendar?.status, calendar?.data])

  const timeline = shown && {
    series: shown.all,
    win: shown.win,
    onDraft: setDraft,
    onCommit: commit,
    onToday: () => { setDraft(null); onWindow(null, shown.win.b - shown.win.a + 1) },
    atLatest,
  }

  const dim = vm ? '' : 'opacity-60'
  const chart = (
    <section aria-label={t.obsChSection} aria-busy={series.status === 'loading'} className="space-y-3">
      {series.status === 'loading' && !shown && <Skeleton />}
      {series.status === 'error' && <ObservatoryNotice error={series.error} onRetry={series.retry} />}
      {shown && shown.all.length === 0 && (
        <p role="note" className="glass obs-card rounded-2xl px-4 py-3 text-sm text-cream/80">{t.obsChNoDataWindow}</p>
      )}
      {shown && shown.all.length > 0 && (
        <div className={`transition-opacity ${dim}`}>
          <WeatherChart vm={shown.vm} timeline={timeline} speciesName={speciesName} range={range} future={future} tail={tail} />
        </div>
      )}
    </section>
  )
  const events = shown && shown.all.length > 0 && (
    <div className={`transition-opacity ${dim}`}>
      <EventsList vm={shown.vm} />
    </div>
  )

  // The page can put the chart and the events list in the columns it wants (see ObservedZone);
  // without a render function they go side by side
  if (typeof children === 'function') return children({ chart, events })
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] items-start">
      {chart}
      {events}
    </div>
  )
}
