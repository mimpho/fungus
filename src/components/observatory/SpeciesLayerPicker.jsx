import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { useSpecies } from '../../hooks/useSpecies'
import { LEGEND_BANDS } from '../../lib/layerColors'
import { buildPickerRows, matchesQuery } from '../../lib/speciesList'
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
 * Condiciones, the first segment of the Meteo tab: a combobox that filters the whole catalogue as you
 * type (scientific name, common names in the app language, Latin synonyms — the same match as the
 * species list of a point). One species at a time (none = the mean of the excellent ones): choosing
 * another replaces it, so the colour scale always means the same; comparing is switching species.
 * Under it, the shared day slider and the legend, always shown (with Meteo off the panel dims them),
 * and what the layer is doing (calculating, error, season, nothing to show).
 * `layer` is the useProbabilityLayer state of the chosen species; `date` the reference day asked for
 * (null = the last day with data) and `onDateChange` how the slider changes it. `layerOn`: the layer is
 * switched on, so a missing answer means it is on its way.
 */
export function SpeciesLayerPicker({ speciesId, onChange, layer, date = null, onDateChange, forestApplied = false, soilApplied = false, layerOn = false, className = '' }) {
  const { t, lang } = useApp()
  const { species: catalog } = useSpecies()
  const listId = useId()
  const rows = useMemo(() => buildPickerRows(catalog, lang), [catalog, lang])
  const chosen = useMemo(() => rows.find(r => r.id === speciesId) ?? null, [rows, speciesId])
  const [text, setText] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const inputRef = useRef(null)
  const rootRef = useRef(null)
  const typedRef = useRef(false) // the text was typed (a search), not put there by choosing

  // The box shows the chosen species' name; typing turns it into a search
  useEffect(() => {
    if (chosen && !typedRef.current) setText(chosen.name)
    if (!speciesId) setText('')
  }, [chosen, speciesId])

  const options = useMemo(
    () => (typedRef.current && text.trim() ? rows.filter(r => matchesQuery(r, text)) : rows),
    [rows, text],
  )

  // Click outside closes the list
  useEffect(() => {
    if (!open) return undefined
    const onDown = e => {
      if (rootRef.current?.contains(e.target)) return
      setOpen(false)
      typedRef.current = false
      setText(chosen?.name ?? '')
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open, chosen])

  function choose(row) {
    if (!row) return
    typedRef.current = false
    setText(row.name)
    setOpen(false)
    setActive(-1)
    inputRef.current?.blur()
    onChange(row.id)
  }

  function clear() {
    typedRef.current = false
    setText(''); setActive(-1); setOpen(false)
    onChange(null)
    inputRef.current?.focus()
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!options.length) return
      e.preventDefault()
      setOpen(true)
      const step = e.key === 'ArrowDown' ? 1 : -1
      setActive(a => (a + step + options.length) % options.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (open && options.length) choose(options[active] ?? options[0])
    } else if (e.key === 'Escape' && open) {
      e.stopPropagation() // closes the list only, not the point panel (page-level Esc)
      setOpen(false)
      typedRef.current = false
      setText(chosen?.name ?? '')
    }
  }

  // Keep the highlighted option in view while moving with the arrows
  useEffect(() => {
    if (active < 0) return
    document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: 'nearest' })
  }, [active, listId])

  const showList = open && rows.length > 0
  // With Meteo off the panel shows only the controls: the data it may hold is the point's (another species)
  const data = layerOn ? layer.data : null
  const status = layerOn ? layer.status : 'idle'
  const hasScores = data?.cells?.some(c => c.status === 'scored')
  // The slider's days: the layer's own once it has answered, the last ones seen before that
  const days = layerDays(layer.data)
  const season = data?.date && status !== 'error' ? seasonNote(data, speciesId, t, lang) : null

  return (
    <div ref={rootRef} className={className} role="group" aria-label={t.obsLayLabel}>
      <div className="space-y-2">
        <div className="relative">
          <input
            ref={inputRef}
            data-wake-focus=""
            type="text"
            role="combobox"
            aria-label={t.obsLaySearchLabel}
            aria-expanded={showList}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            value={text}
            placeholder={t.obsLayPlaceholder}
            onChange={e => { typedRef.current = true; setText(e.target.value); setOpen(true); setActive(-1) }}
            onFocus={e => { setOpen(true); if (chosen) e.target.select() }}
            onKeyDown={onKeyDown}
            className="w-full rounded-xl bg-cream/[0.08] pl-3 pr-10 py-2 text-base md:text-sm text-cream placeholder:text-cream/50 outline-none focus-visible:ring-2 focus-visible:ring-cream/30 transition-colors"
          />
          {(text || speciesId) && (
            <button
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={clear}
              aria-label={t.obsLayClear}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full text-cream/60 hover:text-cream hover:bg-cream/10 transition-colors"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {showList && (
          <ul
            id={listId}
            role="listbox"
            aria-label={t.obsLaySearchLabel}
            className="max-h-56 overflow-auto rounded-xl bg-modal/95 py-1"
          >
            {options.length === 0 && (
              <li role="presentation" className="px-3 py-2.5 text-sm text-cream/80">{t.obsLayNoMatch}</li>
            )}
            {options.map((o, i) => (
              <li
                key={o.id}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={o.id === speciesId}
                onPointerDown={e => e.preventDefault()}
                onClick={() => choose(o)}
                onMouseEnter={() => setActive(i)}
                className={`px-3 py-2 cursor-pointer ${i === active ? 'bg-white/10' : ''}`}
              >
                <span className={`block text-sm text-cream ${o.id === speciesId ? 'font-semibold' : ''}`}>{o.name}</span>
                {o.scientific && o.scientific !== o.name && (
                  <span className="block text-xs text-cream/80 italic">{o.scientific}</span>
                )}
              </li>
            ))}
          </ul>
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
