import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { useSpecies } from '../../hooks/useSpecies'
import { resolveUrl } from '../../lib/helpers'
import { buildPickerRows, matchesQuery } from '../../lib/speciesList'
import { SPECIES_MAX } from '../../lib/cornerKinds'
import { SpeciesPills } from './SpeciesPills'

// Cards drawn in the search list at once: the catalogue is long and every card has a photo.
const VISIBLE_MAX = 30

/**
 * Species selector of a corner. A search box over the whole catalogue (scientific name, common
 * names in the app language, Latin synonyms — the same match as the layer's picker); its matches
 * open as a plain list laid over the form, so nothing below moves. The chosen species stay under
 * the box as tag pills (name and ×; the name opens the species' sheet). `value` is the list of
 * ids. `withPhotos` gives each match of the list a small photo to help tell them apart.
 */
export function CornerSpeciesPicker({ value, onChange, max = SPECIES_MAX, withPhotos = false }) {
  const { t, lang } = useApp()
  const { species: catalog } = useSpecies()
  const listId = useId()
  const rows = useMemo(() => buildPickerRows(catalog, lang), [catalog, lang])
  const [text, setText] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const rootRef = useRef(null)
  const inputRef = useRef(null)
  const full = value.length >= max

  const matches = useMemo(
    () => rows.filter(r => !value.includes(r.id) && (!text.trim() || matchesQuery(r, text))),
    [rows, value, text],
  )
  const options = matches.slice(0, VISIBLE_MAX)


  // A click outside closes the panel
  useEffect(() => {
    if (!open) return undefined
    const onDown = e => { if (!rootRef.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  useEffect(() => {
    if (active < 0) return
    document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: 'nearest' })
  }, [active, listId])

  function add(row) {
    if (!row || full || value.includes(row.id)) return
    onChange([...value, row.id])
    setText('')
    setActive(-1)
    setOpen(false) // the list goes away once one is chosen
  }

  const remove = id => onChange(value.filter(x => x !== id))

  function onKeyDown(e) {
    const move = step => {
      if (!options.length) return
      e.preventDefault()
      setOpen(true)
      setActive(a => (a < 0 ? (step > 0 ? 0 : options.length - 1) : Math.min(options.length - 1, Math.max(0, a + step))))
    }
    if (e.key === 'ArrowDown') move(1)
    else if (e.key === 'ArrowUp') move(-1)
    else if (e.key === 'Enter') {
      e.preventDefault() // never submits the form
      if (open && options.length) add(options[active] ?? options[0])
    } else if (e.key === 'Escape' && open) {
      e.stopPropagation() // closes the panel only, not the modal
      setOpen(false)
    } else if (e.key === 'Backspace' && !text && value.length) {
      remove(value[value.length - 1])
    }
  }

  const showList = open && !full

  return (
    <div ref={rootRef} className="space-y-3">
      {full ? (
        <p className="text-xs text-cream/60">{t.obsCornerSpeciesFull.replace('{n}', max)}</p>
      ) : (
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-label={t.obsCornerSpeciesSearch}
            aria-expanded={showList}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            value={text}
            placeholder={t.obsCornerSpeciesPlaceholder}
            onChange={e => { setText(e.target.value); setOpen(true); setActive(-1) }}
            onFocus={() => setOpen(true)}
            onClick={() => setOpen(true)}
            onKeyDown={onKeyDown}
            className="w-full rounded-xl bg-cream/[0.08] px-3 py-2.5 text-base md:text-sm text-cream placeholder:text-cream/40 outline-none focus-visible:ring-2 focus-visible:ring-cream/30 transition-colors"
          />
          {showList && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-30 max-h-72 overflow-auto rounded-xl bg-modal shadow-xl ring-1 ring-cream/10 py-1">
              {options.length === 0 ? (
                <p className="px-3 py-2.5 text-sm text-cream/60">{t.obsLayNoMatch}</p>
              ) : (
                <ul id={listId} role="listbox" aria-label={t.obsCornerSpeciesSearch}>
                  {options.map((o, i) => (
                    <li
                      key={o.id}
                      id={`${listId}-${i}`}
                      role="option"
                      aria-selected="false"
                      onPointerDown={e => e.preventDefault()}
                      onClick={() => add(o)}
                      onMouseEnter={() => setActive(i)}
                      className={`px-3 py-2 cursor-pointer ${withPhotos ? 'flex items-center gap-3' : ''} ${i === active ? 'bg-white/10' : ''}`}
                    >
                      {withPhotos && (
                        <span className="shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-cream/[0.08]">
                          {o.photo && (
                            <img
                              src={resolveUrl(o.photo)}
                              alt=""
                              loading="lazy"
                              decoding="async"
                              onError={e => { e.currentTarget.style.visibility = 'hidden' }}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </span>
                      )}
                      <span className="block min-w-0">
                        <span className="block text-sm text-cream truncate">{o.name}</span>
                        {o.scientific && o.scientific !== o.name && (
                          <span className="block text-xs text-cream/55 italic truncate">{o.scientific}</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {matches.length > VISIBLE_MAX && (
                <p className="px-3 py-2 text-xs text-cream/50">{t.obsCornerSpeciesMore.replace('{n}', matches.length - VISIBLE_MAX)}</p>
              )}
            </div>
          )}
        </div>
      )}

      <SpeciesPills ids={value} onRemove={remove} />
    </div>
  )
}
