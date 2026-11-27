import { useApp } from '../../../contexts/AppContext'
import { addDays } from '../../../lib/layerDays'
import { useIsPhone } from '../../../hooks/useIsPhone'
import { fill } from '../../../lib/thermometer'
import { RAIN_PRESETS, RAIN_SCALES } from '../../../lib/meteoLayers'
import { DayBar, layerDays } from '../DayBar'
import { InfoTip } from '../InfoTip'
import { ObservatoryNotice } from '../ObservatoryNotice'
import { LayerLegend } from './LayerLegend'
import { RainPresets } from './RainPresets'

const HATCH_SWATCH = {
  backgroundImage: 'repeating-linear-gradient(135deg, var(--meteo-rain-hatch-dark) 0 2px, var(--meteo-rain-hatch-light) 2px 4px, transparent 4px 7px)',
}

/**
 * Lluvia, the Meteo tab's accumulated rain: the window's length (24 h · 7 d · 14 d · 21 d), its dates with
 * the unit and the bars' help beside them, the shared day bar (which says «incluye previsión» for a past day
 * whose window still has forecast) and the window's legend (on a phone without the «good» band), and what the layer is doing
 * (loading, error, no data). `layer` is the useRainLayer state; `preset` / `onPreset` the window's
 * length; `date` the day asked for (null = the last day with data) and `onDateChange` how the bar
 * changes it. `layerOn`: the layer is switched on, so a missing answer means it is on its way.
 */
export function RainPanel({ layer, preset, onPreset, date = null, onDateChange, layerOn = false }) {
  const { t, lang } = useApp()
  const phone = useIsPhone()
  const status = layerOn ? layer.status : 'idle'
  // While another window or day loads, the map keeps the previous picture; the dates and the tag here
  // are of what is asked now
  const answer = status === 'ready' ? layer.data : null
  const days = layerDays(layerOn ? layer.data : null)
  const span = RAIN_PRESETS.find(p => p.id === preset) ?? RAIN_PRESETS[1]
  const day = answer?.date ?? date ?? days.lastDate
  const from = addDays(day, -(span.days - 1))
  // Before the answer only a day from today on is known to include forecast
  const forecast = answer ? answer.includes_forecast : day >= days.forecastFrom
  // On a phone the panel has no room for the «good» band, and rain is only one of the things that matter
  const scale = phone ? { ...RAIN_SCALES[span.id], band: undefined } : RAIN_SCALES[span.id]
  const empty = answer && !answer.date
  const cells = answer?.date ? answer.cells : []
  const gaps = cells.filter(c => c.status === 'no_data').length

  return (
    <div className="px-1 flex flex-col gap-3" role="group" aria-label={t.obsLayerRain}>
      <RainPresets value={span.id} onChange={onPreset} />
      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0 text-[14px] font-semibold text-cream" data-testid="rain-window">
          {span.days === 1
            ? fill(t.obsMeteoRainOneDay, { hasta: day }, lang)
            : fill(t.obsMeteoRainWindowLabel, { desde: from, hasta: day, n: span.days }, lang)}
        </span>
        <span className="shrink-0 inline-flex items-center gap-0.5 whitespace-nowrap text-[11px] text-cream/80">
          {t.obsMeteoRainUnit}
          <InfoTip label={t.obsDayBarRainInfo} align="right" floating className="-my-1.5">{t.obsDayBarRainNote}</InfoTip>
        </span>
      </div>
      <div className="flex flex-col gap-3" aria-live="polite">
        {status === 'error' ? (
          <ObservatoryNotice error={layer.error} onRetry={layer.retry} />
        ) : (
          <>
            {/* The day and the legend are there before the data (and with Meteo off, dimmed by the panel) */}
            <DayBar weeks={layerOn ? { layer: 'rain' } : null} windowDays={span.days} forecastNote={forecast ? t.obsMeteoRainIncludesForecast : null} lastDate={days.lastDate} maxDate={days.maxDate} forecastFrom={days.forecastFrom} date={date} onChange={onDateChange} />
            <LayerLegend
              scale={scale}
              bandLabel={scale.band ? t.obsMeteoRainGoodBand : null}
              className={`transition-opacity ${layerOn && !answer ? 'opacity-60' : ''}`}
            />
            {gaps > 0 && (
              <p className="flex items-center justify-end gap-1.5 -mt-1 text-[11px] text-cream/80" data-testid="rain-legend-gaps">
                <span aria-hidden="true" className="w-[22px] h-[10px] rounded-[3px]" style={HATCH_SWATCH} />
                {t.obsMeteoRainNoDataKey}
              </p>
            )}
            {status === 'loading' && !layer.data && <p className="text-xs text-cream/80" role="status">{t.obsMeteoRainLoading}</p>}
            {(empty || (cells.length > 0 && gaps === cells.length)) && <p className="text-xs text-cream/80">{t.obsMeteoRainNoData}</p>}
          </>
        )}
      </div>
    </div>
  )
}
