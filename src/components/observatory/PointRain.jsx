import { useApp } from '../../contexts/AppContext'
import { fill } from '../../lib/thermometer'

/**
 * The point card's headline with Lluvia on: the accumulated mm at the spot («≈ N mm», the blend that gives
 * the map's colour), and under it the window's dates and length, whether the figure is estimated and
 * whether the window includes forecast. `value`: { status: 'loading' | 'error' } (the map and the panel
 * say what failed) or { status: 'ready', mm (null = no data), estimated, window: { from, to, days } | null,
 * forecast }. Every state has the same height, so the card does not move.
 */
export function PointRain({ value }) {
  const { t, lang } = useApp()
  const ready = value.status === 'ready'
  const span = ready ? value.window : null
  return (
    <div data-testid="point-rain-value">
      {value.status === 'loading' ? (
        <p role="status" aria-label={t.obsPointCalculating} className="h-10 flex items-center gap-1.5 text-cream/50">
          {[0, 1, 2].map(i => (
            <span key={i} aria-hidden="true" className="w-2.5 h-2.5 rounded-full bg-current animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
          ))}
        </p>
      ) : (
        <div className="h-10 flex items-center">
          {ready && (value.mm === null
            ? <p className="text-sm text-cream/80">{t.obsPointRainNone}</p>
            : (
              <p className="font-display font-bold text-4xl leading-none text-cream">
                {value.mm < 1 ? '< 1' : `≈ ${Math.round(value.mm)}`}<span className="ml-1.5 text-2xl">mm</span>
              </p>
            ))}
        </div>
      )}
      <p className="mt-1 min-h-[34px] text-xs leading-[17px] text-cream/80">
        {span && (span.days === 1
          ? fill(t.obsMeteoRainOneDay, { hasta: span.to }, lang)
          : fill(t.obsMeteoRainWindowLabel, { desde: span.from, hasta: span.to, n: span.days }, lang))}
        {span && value.forecast && <span className="ml-1.5 inline-block rounded-full bg-coffee-light/20 px-2 text-[11px] font-semibold text-cream">{t.obsMeteoRainIncludesForecast}</span>}
        {ready && value.mm !== null && value.estimated && <span className="block">{t.obsPointRainEstimated}</span>}
      </p>
    </div>
  )
}
