import { useApp } from '../../contexts/AppContext'
import { LEGEND_BANDS } from '../../lib/layerColors'
import { fill, formatDay } from '../../lib/thermometer'
import { LayerDayControl, layerDays } from './LayerDayControl'
import { LayerLegend } from './nav/LayerLegend'
import { InfoTip } from './InfoTip'
import { ObservatoryNotice } from './ObservatoryNotice'

const CONDITIONS_SCALE = { colors: LEGEND_BANDS.map(b => b.hex), stepped: true }

// Fewer excellent species in season than this share: the map is mostly grey, and the legend says why
const FEW_IN_SEASON = 1 / 3

/**
 * What the legend says about the season on the layer's day, or null when nothing needs saying: a chosen
 * species out of its fruiting months, or (the mean of the excellent ones) none or few of them in season.
 */
export function seasonNote(data, speciesId, t, lang) {
  if (speciesId) return data.in_season ? null : t.obsLayOutOfSeason
  const list = Array.isArray(data.species) ? data.species : []
  const n = list.filter(s => s.in_season).length
  if (!data.in_season || n === 0) return t.obsLaySeasonNone
  return n < list.length * FEW_IN_SEASON ? fill(t.obsLaySeasonFew, { n, total: list.length }, lang) : null
}

/**
 * Condiciones, the first segment of the Meteo tab. The species is the map's (the second half of the search
 * bar), not this panel's: a line says which one the colours are for (none = the mean of the excellent ones).
 * Under it, the shared day slider and the legend, always shown (with Meteo off the panel dims them),
 * and what the layer is doing (calculating, error, season, nothing to show).
 * `speciesId` / `speciesName`: the map's active species (or null); `onClearSpecies` takes it off (the «Quitar» chip). `layer` is the useProbabilityLayer state
 * of that species; `date` the reference day asked for (null = the last day with data) and `onDateChange`
 * how the slider changes it. `layerOn`: the layer is switched on, so a missing answer means it is on its way.
 */
export function SpeciesLayerPicker({ speciesId, speciesName = null, onClearSpecies = null, layer, date = null, onDateChange, forestApplied = false, soilApplied = false, layerOn = false, className = '' }) {
  const { t, lang } = useApp()

  // With Meteo off the panel shows only the controls: the data it may hold is the point's (another species)
  const data = layerOn ? layer.data : null
  const status = layerOn ? layer.status : 'idle'
  const hasScores = data?.cells?.some(c => c.status === 'scored')
  // The slider's days: the layer's own once it has answered, the last ones seen before that
  const days = layerDays(layer.data)
  const season = data?.date && status !== 'error' ? seasonNote(data, speciesId, t, lang) : null

  return (
    <div className={className} role="group" aria-label={t.obsLayLabel}>
      <div className="space-y-2">
        {speciesId && speciesName && (
          <div className="px-1 flex items-center justify-between gap-2 min-h-[30px]">
            <p className="min-w-0 text-[15px] font-semibold text-cream" data-testid="conditions-for">
              {t.obsLayFor.replace('{name}', speciesName)}
            </p>
            {onClearSpecies && (
              <button
                type="button"
                onClick={onClearSpecies}
                aria-label={t.obsMapSpRemove.replace('{name}', speciesName)}
                title={t.obsMapSpRemove.replace('{name}', speciesName)}
                className="shrink-0 h-[30px] pl-3 pr-2.5 rounded-full bg-cream/[0.12] hover:bg-cream/[0.2] text-cream text-[13px] font-medium inline-flex items-center gap-1.5 outline-none focus-visible:ring-2 focus-visible:ring-cream/50"
              >
                {t.obsMapSpRemoveShort}
                <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        <div className="px-1 pb-0.5 space-y-3" aria-live="polite">
          {status === 'error' ? (
            <ObservatoryNotice error={layer.error} onRetry={layer.retry} />
          ) : (
            <>
              {/* The day and the legend are there before the data (and with Meteo off, dimmed by the panel) */}
              {onDateChange && (
                <LayerDayControl
                  lastDate={days.lastDate}
                  maxDate={days.maxDate}
                  forecastFrom={days.forecastFrom}
                  date={date}
                  onChange={onDateChange}
                />
              )}
              <LayerLegend
                scale={CONDITIONS_SCALE}
                lowLabel={t.obsLayLow}
                highLabel={t.obsLayHigh}
                center={data?.date ? t.obsLayDate.replace('{fecha}', formatDay(data.date, lang)) : null}
                className={`transition-opacity ${status === 'loading' || (layerOn && !data) ? 'opacity-60' : ''}`}
                extra={data && hasScores ? (
                  <InfoTip label={t.obsLayInfoLabel} align="right" floating className="-my-1.5">
                    <span className="block space-y-2">
                      {!speciesId && <span className="block">{t.obsLayAllNote}</span>}
                      <span className="block">{forestApplied && soilApplied ? t.obsLayNoteForestSoil : forestApplied ? t.obsLayNoteForest : soilApplied ? t.obsLayNoteSoil : t.obsLayNote}</span>
                      <span className="block">{t.obsLayMeaning}</span>
                    </span>
                  </InfoTip>
                ) : null}
              />
              {layerOn && status === 'loading' && !data && <p className="text-xs text-cream/80" role="status">{t.obsLayLoading}</p>}
              {season && <p className="text-xs text-cream/80" data-testid="legend-season">{season}</p>}
              {status === 'ready' && data && !data.date && <p className="text-xs text-cream/80">{t.obsLayNoData}</p>}
              {status === 'ready' && data?.in_season && !hasScores && speciesId && <p className="text-xs text-cream/80">{t.obsLayNoCells}</p>}
              {data?.species?.generic_model && <p className="text-[11px] text-cream/80">{t.obsLayGeneric}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
