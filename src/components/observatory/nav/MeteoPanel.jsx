import { useApp } from '../../../contexts/AppContext'
import { fill } from '../../../lib/thermometer'
import { METEO_LAYERS, TEMPERATURE_SCALE, WIND_SCALE, canOpenLayer, meteoLayer } from '../../../lib/meteoLayers'
import { LayerDayControl, layerDays } from '../LayerDayControl'
import { LayerLegend } from './LayerLegend'

const FOCUS = 'outline-none focus-visible:ring-2 focus-visible:ring-cream/50'

/**
 * The Meteo tab's content: the segmented control Condiciones · Lluvia · Temp. · Viento and the chosen
 * segment's controls. Layers not built yet carry «Pronto» and `aria-disabled`; in a development build
 * they still open their placeholder panels (src/lib/meteoLayers.js). `conditions` is the Condiciones
 * content (species field, day slider, legend) and `rain` Lluvia's (RainPanel); the placeholders share the
 * same day (`date`, `onDateChange`). `hiddenNote`: a line over Condiciones or Lluvia saying why the map does
 * not draw it (Hábitat · De la seta is shown).
 */
export function MeteoPanel({ kind, onKind, conditions, rain, date, onDateChange, hiddenNote = null }) {
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
              className={`relative flex-auto min-w-0 px-1.5 h-[44px] rounded-lg flex flex-col items-center justify-center text-[13px] leading-tight ${FOCUS} ${selected ? 'bg-[var(--nav-active)] text-white font-semibold' : l.ready ? 'text-cream/80 font-medium hover:text-cream' : `text-cream/50 font-medium ${open ? 'hover:text-cream/80' : 'cursor-default'}`}`}
            >
              <span className="truncate max-w-full">{t[l.short]}</span>
              {!l.ready && <span aria-hidden="true" className="text-[10px] uppercase tracking-wide opacity-80">{t.obsLayerSoon}</span>}
            </button>
          )
        })}
      </div>
      {(kind === 'conditions' || kind === 'rain') && hiddenNote && (
        <p role="status" data-testid="meteo-hidden-note" className="px-3 py-2 rounded-lg bg-cream/[0.08] text-[13px] leading-snug text-cream">{hiddenNote}</p>
      )}
      {kind === 'conditions' ? conditions : kind === 'rain' ? rain : (
        <PreviewPanel kind={kind} date={date} onDateChange={onDateChange} />
      )}
    </div>
  )
}

/**
 * Placeholder panel of a layer not built yet (development builds only): its own legend, with the shared
 * day, and no data. epic/observatory-meteo wires the data and the map.
 */
function PreviewPanel({ kind, date, onDateChange }) {
  const { t, lang } = useApp()
  const days = layerDays()
  return (
    <div className="px-1 flex flex-col gap-3">
      <LayerDayControl lastDate={days.lastDate} maxDate={days.maxDate} forecastFrom={days.forecastFrom} date={date} onChange={onDateChange} />
      <LayerLegend scale={kind === 'temperature' ? TEMPERATURE_SCALE : WIND_SCALE} />
      <p className="text-[11px] text-cream/80">{fill(t.obsMeteoPreview, { capa: t[meteoLayer(kind)?.label] }, lang)}</p>
    </div>
  )
}
