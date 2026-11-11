import { useApp } from '../../../contexts/AppContext'
import { addDays } from '../../../lib/layerDays'
import { fill } from '../../../lib/thermometer'
import {
  METEO_LAYERS, RAIN_PRESETS, RAIN_SCALES, TEMPERATURE_SCALE, WIND_SCALE, canOpenLayer, meteoLayer,
} from '../../../lib/meteoLayers'
import { LayerDayControl, layerDays } from '../LayerDayControl'
import { LayerLegend } from './LayerLegend'
import { RainPresets } from './RainPresets'

const FOCUS = 'outline-none focus-visible:ring-2 focus-visible:ring-cream/50'

/**
 * The Meteo tab's content: the segmented control Condiciones · Lluvia · Temp. · Viento and the chosen
 * segment's controls. Layers not built yet carry «Pronto» and `aria-disabled`; in a development build
 * they still open their placeholder panels (src/lib/meteoLayers.js). `conditions` is the Condiciones
 * content (species field, day slider, legend); the others share the same day (`date`, `onDateChange`).
 * `rainPreset` / `onRainPreset`: the rain window's length.
 */
export function MeteoPanel({ kind, onKind, conditions, date, onDateChange, rainPreset, onRainPreset }) {
  const { t } = useApp()
  return (
    <div className="flex flex-col gap-3">
      <div role="group" aria-label={t.obsMeteoKind} className="flex gap-[2px] p-[3px] rounded-[10px] bg-cream/[0.08]">
        {METEO_LAYERS.map(l => {
          const selected = l.id === kind
          const open = canOpenLayer(l)
          return (
            <button
              key={l.id}
              type="button"
              aria-pressed={selected}
              aria-disabled={l.ready ? undefined : true}
              aria-label={l.ready ? t[l.label] : `${t[l.label]} · ${t.obsLayerSoon}`}
              onClick={() => { if (open && !selected) onKind(l.id) }}
              className={`relative flex-auto min-w-0 px-1.5 h-[44px] rounded-lg flex flex-col items-center justify-center text-[13px] leading-tight transition-colors ${FOCUS} ${selected ? 'bg-[var(--nav-active)] text-white font-semibold' : l.ready ? 'text-cream/80 font-medium hover:text-cream' : `text-cream/50 font-medium ${open ? 'hover:text-cream/80' : 'cursor-default'}`}`}
            >
              <span className="truncate max-w-full">{t[l.short]}</span>
              {!l.ready && <span aria-hidden="true" className="text-[10px] uppercase tracking-wide opacity-80">{t.obsLayerSoon}</span>}
            </button>
          )
        })}
      </div>
      {kind === 'conditions' ? conditions : (
        <PreviewPanel kind={kind} date={date} onDateChange={onDateChange} rainPreset={rainPreset} onRainPreset={onRainPreset} />
      )}
    </div>
  )
}

/**
 * Placeholder panel of a layer not built yet (development builds only): its own controls and legend,
 * with the shared day, and no data. epic/observatory-meteo wires the data and the map.
 */
function PreviewPanel({ kind, date, onDateChange, rainPreset, onRainPreset }) {
  const { t, lang } = useApp()
  const days = layerDays()
  const day = date ?? days.lastDate
  const slider = <LayerDayControl lastDate={days.lastDate} maxDate={days.maxDate} forecastFrom={days.forecastFrom} date={date} onChange={onDateChange} />
  const note = <p className="text-[11px] text-cream/50">{fill(t.obsMeteoPreview, { capa: t[meteoLayer(kind)?.label] }, lang)}</p>

  if (kind === 'rain') {
    const preset = RAIN_PRESETS.find(p => p.id === rainPreset) ?? RAIN_PRESETS[1]
    const from = addDays(day, -(preset.days - 1))
    const forecast = day >= days.forecastFrom
    const scale = RAIN_SCALES[preset.id]
    return (
      <div className="px-1 flex flex-col gap-3">
        <RainPresets value={preset.id} onChange={onRainPreset} />
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[15px] font-semibold text-cream" data-testid="rain-window">
            {preset.days === 1
              ? fill(t.obsMeteoRainOneDay, { hasta: day }, lang)
              : fill(t.obsMeteoRainWindowLabel, { desde: from, hasta: day, n: preset.days }, lang)}
          </span>
          {forecast && <span className="rounded-full bg-[color-mix(in_srgb,var(--color-coffee-light)_20%,transparent)] px-2 py-0.5 text-xs font-semibold text-coffee-light">{t.obsMeteoRainIncludesForecast}</span>}
        </div>
        {slider}
        <LayerLegend
          scale={scale}
          bandLabel={scale.band ? fill(t.obsMeteoRainGoodBand, { desde: scale.band.from, hasta: scale.band.to }, lang) : null}
        />
        {note}
      </div>
    )
  }
  return (
    <div className="px-1 flex flex-col gap-3">
      {slider}
      <LayerLegend scale={kind === 'temperature' ? TEMPERATURE_SCALE : WIND_SCALE} />
      {note}
    </div>
  )
}
