import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { parseCoordinates } from '../../lib/placeSearch'
import { searchPlaces } from '../../services/geocodingService'
import { formatCoords } from '../../lib/observatoryView'
import { IC } from '../../lib/helpers'

const MIN_CHARS = 3
const DEBOUNCE_MS = 300

const KIND_KEYS = {
  pass: 'obsKindPass', peak: 'obsKindPeak', spring: 'obsKindSpring', viewpoint: 'obsKindViewpoint',
  town: 'obsKindTown', locality: 'obsKindLocality', forest: 'obsKindForest',
}

/**
 * Search box over the map: a place in Catalonia (Open-Meteo geocoding) or a coordinate pair.
 * Choosing a result reports it with onSelect({ lat, lon }); what happens next is the page's.
 */
export function MapSearch({ onSelect, className = '' }) {
  const { t } = useApp()
  const listId = useId()
  const [text, setText] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [places, setPlaces] = useState([])
  const [status, setStatus] = useState('idle') // idle | loading | done | error
  const inputRef = useRef(null)
  const rootRef = useRef(null)
  const chosenRef = useRef(null) // text put in the box by choosing a result: not a new search

  const query = text.trim()
  const coords = useMemo(() => parseCoordinates(query), [query])

  // Options: a coordinate pair is a single option, a name is the list of places found.
  const options = useMemo(() => {
    if (coords?.error) return []
    if (coords) return [{ key: 'coords', point: coords, title: `${t.obsSearchGoTo} ${formatCoords(coords)}`, sub: null }]
    return places.map(p => ({
      key: p.id,
      point: { lat: p.lat, lon: p.lon },
      title: p.name,
      sub: [KIND_KEYS[p.kind] ? t[KIND_KEYS[p.kind]] : null, p.area].filter(Boolean).join(' · '),
    }))
  }, [coords, places, t])

  // Debounced place search; the previous request is cancelled when the text changes
  useEffect(() => {
    if (query === chosenRef.current) return
    if (coords || query.length < MIN_CHARS) { setPlaces([]); setStatus('idle'); return }
    const ctrl = new AbortController()
    setStatus('loading')
    const timer = setTimeout(async () => {
      try {
        const found = await searchPlaces(query, { signal: ctrl.signal })
        setPlaces(found); setStatus('done'); setActive(-1)
      } catch (e) {
        if (e?.name === 'AbortError') return
        setPlaces([]); setStatus('error')
      }
    }, DEBOUNCE_MS)
    return () => { clearTimeout(timer); ctrl.abort() }
  }, [query, coords])

  // Click outside closes the list
  useEffect(() => {
    if (!open) return
    const onDown = e => { if (!rootRef.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  function choose(option) {
    if (!option) return
    setOpen(false)
    setActive(-1)
    if (option.key !== 'coords') { chosenRef.current = option.title; setText(option.title) }
    inputRef.current?.blur()
    onSelect(option.point)
  }

  function clear() {
    chosenRef.current = null
    setText(''); setPlaces([]); setStatus('idle'); setActive(-1)
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
      choose(options[active] ?? options[0])
    } else if (e.key === 'Escape' && open) {
      e.stopPropagation() // closes the list only, not the point panel (page-level Esc)
      setOpen(false)
    }
  }

  // What the list says when there is nothing to choose
  let message = null
  if (query.length >= MIN_CHARS || coords) {
    if (coords?.error) message = t.obsSearchOutside
    else if (!coords && status === 'loading' && !places.length) message = t.obsSearchSearching
    else if (!coords && status === 'error') message = t.obsSearchError
    else if (!coords && status === 'done' && !places.length) message = t.obsSearchNoResults
  }
  const showList = open && (options.length > 0 || message)

  // Same pill as the zones search (SearchFilterBar): 52px high, fully rounded, search icon on the
  // left and a round clear button. `glass-search` keeps it readable over the satellite image.
  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <span className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none z-10 search-light-text">{IC.search}</span>
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-label={t.obsSearchLabel}
        aria-expanded={!!showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        value={text}
        placeholder={t.obsSearchPlaceholder}
        onChange={e => { chosenRef.current = null; setText(e.target.value); setOpen(true); setActive(-1) }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className="w-full glass-search search-light-input text-base md:text-sm outline-none pl-12 pr-12 shadow-lg"
        style={{ height: '52px', borderRadius: '26px' }}
      />
      {text && (
        <button
          type="button"
          onMouseDown={e => e.preventDefault()}
          onClick={clear}
          aria-label={t.obsSearchClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full transition-all search-light-text opacity-60 hover:opacity-100 hover:bg-black/10"
          style={{ width: '32px', height: '32px' }}
        >
          <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {showList && (
        <ul
          id={listId}
          role="listbox"
          aria-label={t.obsSearchLabel}
          className="absolute left-0 right-0 top-full mt-2 max-h-72 overflow-auto rounded-2xl backdrop-blur-sm bg-modal/95 py-1 shadow-lg"
        >
          {options.map((o, i) => (
            <li
              key={o.key}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onPointerDown={e => e.preventDefault()}
              onClick={() => choose(o)}
              onMouseEnter={() => setActive(i)}
              className={`px-5 py-2.5 cursor-pointer ${i === active ? 'bg-white/10' : ''}`}
            >
              <span className="block text-base text-cream">{o.title}</span>
              {o.sub && <span className="block text-xs text-cream/55">{o.sub}</span>}
            </li>
          ))}
          {options.length === 0 && message && (
            <li role="presentation" className="px-5 py-3 text-sm text-cream/60">{message}</li>
          )}
        </ul>
      )}
    </div>
  )
}
