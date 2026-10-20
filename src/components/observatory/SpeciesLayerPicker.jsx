import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { useSpecies } from '../../hooks/useSpecies'
import { LEGEND_BANDS } from '../../lib/layerColors'
import { buildPickerRows, matchesQuery } from '../../lib/speciesList'
import { formatDay } from '../../lib/thermometer'
import { LayerDayControl } from './LayerDayControl'
import { InfoTip } from './InfoTip'
import { ObservatoryNotice } from './ObservatoryNotice'

/**
 * Species selector of the probability layer, over the map: a combobox that filters the whole
 * catalogue as you type (scientific name, common names in the app language, Latin synonyms — the
 * same match as the species list of a point). One species at a time: choosing another replaces
 * it, so the colour scale always means probability, low to high; comparing is switching species.
 * Under the box: what the layer is doing (calculating, error, out of season) and, once there is
 * an answer, its legend and what it does not take into account.
 * It lives inside the map's layers box (MapLayersBox), under the probability checkbox.
 * `layer` is the useProbabilityLayer state of the chosen species; `date` the reference day asked
 * for (null = the last day with data) and `onDateChange` how the day control changes it.
 */
export function SpeciesLayerPicker({ speciesId, onChange, layer, date = null, onDateChange, forestApplied = false, soilApplied = false, className = '' }) {
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
  const data = layer.data
  const hasScores = data?.cells?.some(c => c.status === 'scored')

  return (
    <div ref={rootRef} className={className} role="group" aria-label={t.obsLayLabel}>
      <div className="space-y-2">
        <div className="relative">
          <input
            ref={inputRef}
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
              <li role="presentation" className="px-3 py-2.5 text-sm text-cream/60">{t.obsLayNoMatch}</li>
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
                  <span className="block text-xs text-cream/55 italic">{o.scientific}</span>
                )}
              </li>
            ))}
          </ul>
        )}

        {(speciesId || layer.status !== 'idle') && (
          <div className="px-1 pb-0.5 space-y-2" aria-live="polite">
            {data?.last_data_date && onDateChange && (
              <LayerDayControl lastDate={data.last_data_date} date={date} onChange={onDateChange} />
            )}
            {layer.status === 'loading' && !data && (
              // Placeholder with the height of the loaded box (day control, legend, notes) so it does not jump
              <div className="space-y-2 animate-pulse" role="status" aria-label={t.obsLayLoading}>
                <div className="h-11 rounded-lg bg-cream/[0.08]" />
                <div className="space-y-1">
                  <div className="h-2 rounded-full bg-cream/[0.08]" />
                  <div className="h-3 w-full rounded bg-cream/[0.06]" />
                </div>
              </div>
            )}
            {layer.status === 'error' && <ObservatoryNotice error={layer.error} onRetry={layer.retry} />}
            {layer.status === 'ready' && data && !data.date && (
              <p className="text-xs text-cream/80">{t.obsLayNoData}</p>
            )}
            {layer.status === 'ready' && data?.date && !data.in_season && (
              <p className="text-xs text-cream/80">{t.obsLayOutOfSeason}</p>
            )}
            {layer.status === 'ready' && data?.in_season && !hasScores && (
              <p className="text-xs text-cream/80">{t.obsLayNoCells}</p>
            )}
            {data && layer.status !== 'error' && hasScores && (
              <div className={`space-y-2 transition-opacity ${layer.status === 'loading' ? 'opacity-60' : ''}`}>
                <div>
                  <div className="flex gap-[2px] h-2" aria-hidden="true">
                    {LEGEND_BANDS.map(b => <span key={b.key} className="flex-1 first:rounded-l-full last:rounded-r-full" style={{ backgroundColor: b.hex }} />)}
                  </div>
                  <div className="flex justify-between text-[11px] text-cream/70 mt-1">
                    <span>{t.obsLayLow}</span>
                    <span className="text-cream/50">{t.obsLayDate.replace('{fecha}', formatDay(data.date, lang))}</span>
                    <span className="inline-flex items-center gap-1">
                      {t.obsLayHigh}
                      <InfoTip label={t.obsLayInfoLabel} align="right" className="-my-1.5">
                        <span className="block space-y-2">
                          {!speciesId && <span className="block">{t.obsLayAllNote}</span>}
                          <span className="block">{forestApplied && soilApplied ? t.obsLayNoteForestSoil : forestApplied ? t.obsLayNoteForest : soilApplied ? t.obsLayNoteSoil : t.obsLayNote}</span>
                          <span className="block">{t.obsLayMeaning}</span>
                        </span>
                      </InfoTip>
                    </span>
                  </div>
                </div>
                {data.species?.generic_model && <p className="text-[11px] text-cream/60">{t.obsLayGeneric}</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
