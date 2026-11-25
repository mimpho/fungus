import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { parseCoordinates } from '../../lib/placeSearch'
import { searchPlaces } from '../../services/geocodingService'
import { formatCoords } from '../../lib/observatoryView'
import { IC } from '../../lib/helpers'
import { useIsPhone } from '../../hooks/useIsPhone'
import { BarHalf, CloseSearchButton } from './BarHalf'

const COMPACT_W = 52 // px: the least the place half shrinks to (its magnifier and a few letters)
const MIN_CHARS = 3
const DEBOUNCE_MS = 300
const RECENT_MAX = 5
const RECENT_KEY = 'fungus-obs-recent-searches'

// The last searches are a per-viewer convenience: they live in this browser only, and the box
// works the same when storage is blocked or empty.
function loadRecents() {
  try {
    const list = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]')
    return Array.isArray(list)
      ? list.filter(r => r && typeof r.title === 'string' && Number.isFinite(r.lat) && Number.isFinite(r.lon)).slice(0, RECENT_MAX)
      : []
  } catch (_e) { return [] }
}

function storeRecents(list) {
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(list)) } catch (_e) { /* not essential */ }
}

const sameSpot = (a, b) => Math.abs(a.lat - b.lat) < 1e-5 && Math.abs(a.lon - b.lon) < 1e-5

const KIND_KEYS = {
  pass: 'obsKindPass', peak: 'obsKindPeak', spring: 'obsKindSpring', viewpoint: 'obsKindViewpoint',
  town: 'obsKindTown', locality: 'obsKindLocality', forest: 'obsKindForest',
}

/**
 * The place half of the map's search bar: a place in Catalonia (Open-Meteo geocoding) or a coordinate pair.
 * Choosing a result reports it with onSelect({ lat, lon }); what happens next is the page's.
 * The bar (MapSearchBar) says whether this half is `focused` (it has the whole width), `collapsed` (the
 * species half has it) or at rest; `onFocus` asks for the width and `onClose` gives it back. When it stops
 * being focused whatever was typed is dropped, so the bar always comes back to rest.
 * `compact`: the species half is showing a filter and may take more than half: this one shrinks, its text ending in an ellipsis.
 */
export function MapSearch({ onSelect, focused, collapsed, compact = false, onFocus, onClose }) {
  const { t } = useApp()
  const phone = useIsPhone()
  const listId = useId()
  const [text, setText] = useState('')
  const [active, setActive] = useState(-1)
  const [places, setPlaces] = useState([])
  const [status, setStatus] = useState('idle') // idle | loading | done | error
  const [recents, setRecents] = useState(loadRecents)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  const query = text.trim()
  const coords = useMemo(() => parseCoordinates(query), [query])

  // Options: a coordinate pair is a single option, a name is the list of places found.
  // With nothing typed yet, the last searches are the options.
  const options = useMemo(() => {
    if (!query) {
      return recents.map(r => ({ key: `recent-${r.lat},${r.lon}`, point: { lat: r.lat, lon: r.lon }, title: r.title, sub: r.sub ?? null, recent: true }))
    }
    if (coords?.error) return []
    if (coords) return [{ key: 'coords', point: coords, title: `${t.obsSearchGoTo} ${formatCoords(coords)}`, sub: null }]
    return places.map(p => ({
      key: p.id,
      point: { lat: p.lat, lon: p.lon },
      title: p.name,
      sub: [KIND_KEYS[p.kind] ? t[KIND_KEYS[p.kind]] : null, p.area].filter(Boolean).join(' · '),
    }))
  }, [query, recents, coords, places, t])

  // Debounced place search; the previous request is cancelled when the text changes
  useEffect(() => {
    if (coords || query.length < MIN_CHARS) { setPlaces([]); setStatus('idle'); return undefined }
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

  // Not focused any more (chosen, closed, Esc, focus out): the typed text goes, the bar is at rest
  useEffect(() => {
    if (focused) return
    setText(''); setPlaces([]); setStatus('idle'); setActive(-1)
  }, [focused])

  // The chosen place goes first in the last searches (once, newest first, at most five)
  function remember(option) {
    const entry = { title: option.title, sub: option.sub ?? null, ...option.point }
    setRecents(prev => {
      const next = [entry, ...prev.filter(r => !sameSpot(r, entry))].slice(0, RECENT_MAX)
      storeRecents(next)
      return next
    })
  }

  function close() {
    onClose()
    inputRef.current?.blur()
  }

  function choose(option) {
    if (!option) return
    remember(option)
    close()
    onSelect(option.point)
  }

  // Moves through the options from the field or from the list (Tab can put the focus on the list)
  function onNavKey(e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!options.length) return
      e.preventDefault()
      const step = e.key === 'ArrowDown' ? 1 : -1
      setActive(a => (a + step + options.length) % options.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      // Enter on an empty box does not pick a last search by itself: it needs an arrow first
      if (!query && active < 0) return
      choose(options[active] ?? options[0])
    } else if (e.key === 'Escape' && focused) {
      e.stopPropagation() // closes the search only, not the point panel (page-level Esc)
      close()
    }
  }

  function onKeyDown(e) {
    // With results open, Tab goes to them first and then on to the species half
    if (e.key === 'Tab' && !e.shiftKey && showList && options.length) {
      e.preventDefault()
      setActive(a => (a < 0 ? 0 : a))
      listRef.current?.focus()
      return
    }
    onNavKey(e)
  }

  // Keep the highlighted option in view while moving with the arrows
  useEffect(() => {
    if (active < 0) return
    document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: 'nearest' })
  }, [active, listId])

  // What the list says when there is nothing to choose
  let message = null
  if (query.length >= MIN_CHARS || coords) {
    if (coords?.error) message = t.obsSearchOutside
    else if (!coords && status === 'loading' && !places.length) message = t.obsSearchSearching
    else if (!coords && status === 'error') message = t.obsSearchError
    else if (!coords && status === 'done' && !places.length) message = t.obsSearchNoResults
  }
  const showList = focused && (options.length > 0 || message)

  const dropdown = showList && (
    <ul
      ref={listRef}
      id={listId}
      role="listbox"
      tabIndex={-1}
      aria-label={t.obsSearchLabel}
      aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
      onKeyDown={onNavKey}
      className="absolute left-0 right-0 top-full mt-2 max-h-72 overflow-auto rounded-2xl map-surface py-1 outline-none"
    >
      {!query && (
        <li role="presentation" className="px-5 pt-2 pb-1 text-[11px] uppercase tracking-[1px] text-cream/55">{t.obsSearchRecent}</li>
      )}
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
          <span className="flex items-center gap-2 text-base text-cream">
            {o.recent && (
              <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-cream/50">
                <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
              </svg>
            )}
            {o.title}
          </span>
          {o.sub && <span className="block text-xs text-cream/55">{o.sub}</span>}
        </li>
      ))}
      {options.length === 0 && message && (
        <li role="presentation" className="px-5 py-3 text-sm text-cream/60">{message}</li>
      )}
    </ul>
  )

  return (
    <BarHalf side="left" focused={focused} collapsed={collapsed} minWidth={compact ? COMPACT_W : 0} dropdown={dropdown}>
      <span className="absolute top-1/2 -translate-y-1/2 pointer-events-none z-10 search-light-text [&>svg]:w-[18px] [&>svg]:h-[18px]" style={{ left: '10px' }}>{IC.search}</span>
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
        placeholder={phone ? t.obsSearchPlaceholderShort : t.obsSearchPlaceholder}
        onChange={e => { setText(e.target.value); setActive(-1) }}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        className="h-full w-full bg-transparent search-light-input placeholder:!opacity-80 text-[16px] outline-none truncate pl-[34px]"
        style={{ paddingRight: focused ? '44px' : '6px' }}
      />
      {focused && <CloseSearchButton label={t.obsSearchClose} onClick={close} />}
    </BarHalf>
  )
}
