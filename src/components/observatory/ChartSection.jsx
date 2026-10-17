import { useMemo, useRef, useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { usePointData } from '../../hooks/usePointData'
import { fetchPointSeries } from '../../services/observatoryService'
import { DEFAULT_WINDOW, prepareSeries, requestDays } from '../../lib/chartData'
import { ObservatoryNotice } from './ObservatoryNotice'
import { WeatherChart } from './WeatherChart'
import { EventsList } from './EventsList'

function Skeleton() {
  return <div aria-hidden="true" className="glass obs-card rounded-2xl h-[28rem] animate-pulse" />
}

/**
 * Charts and events of the observed point. One request per window and species (the tabs and
 * layers only change what is drawn). The window asks for 21 days more than it shows: the
 * 21-day rain accumulation needs them. `species` is the id being looked at (or null) and `range`
 * its thermal range, drawn as a band on the temperature tab.
 */
export function ChartSection({ point, species, speciesName, range }) {
  const { t } = useApp()
  const [windowDays, setWindowDays] = useState(DEFAULT_WINDOW)
  const series = usePointData(fetchPointSeries, point, { days: requestDays(windowDays), species })
  const vm = useMemo(() => (series.status === 'ready' ? prepareSeries(series.data, windowDays) : null), [series.status, series.data, windowDays])

  // Changing the window or the species asks again: keep showing the last chart (and keep its tab
  // and layers) dimmed until the new one arrives, instead of replacing it with a skeleton.
  const lastRef = useRef(null)
  if (vm) lastRef.current = vm
  const shown = vm ?? (series.status === 'loading' ? lastRef.current : null)

  return (
    <section aria-label={t.obsChSection} aria-busy={series.status === 'loading'} className="space-y-3">
      {series.status === 'loading' && !shown && <Skeleton />}
      {series.status === 'error' && <ObservatoryNotice error={series.error} onRetry={series.retry} />}
      {shown && (
        <div className={`grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] items-start transition-opacity ${vm ? '' : 'opacity-60'}`}>
          <WeatherChart vm={shown} windowDays={windowDays} onWindow={setWindowDays} speciesName={speciesName} range={range} />
          <div className="relative lg:self-stretch lg:min-h-[24rem]">
            <EventsList vm={shown} />
          </div>
        </div>
      )}
    </section>
  )
}
