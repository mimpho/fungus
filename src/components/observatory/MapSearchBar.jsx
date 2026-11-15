import { useEffect, useRef, useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { useSpeciesRows } from '../../hooks/useSpeciesRows'
import { BAR_GAP, BAR_H } from './BarHalf'
import { MapSearch } from './MapSearch'
import { MapSpeciesSearch } from './MapSpeciesSearch'

/**
 * The map's search bar: two halves of one bar, the place (left) and the mushroom (right), with an unpainted gap
 * between them. At rest each takes half; focusing one gives it the whole width and the other folds away (it
 * stays in the page, so Tab goes from one to the other). Leaving the bar (focus out, Esc, its bare ×) goes
 * back to rest, drops what was typed and keeps the chosen species. While a species is chosen, its half is as wide as its
 * pill needs (half of the bar at least) and the place half gives way, its text ending in an ellipsis.
 * `speciesId` / `onSpecies(id | null)`: the map's active species. `onPlace({ lat, lon })`: a place was chosen.
 */
export function MapSearchBar({ onPlace, speciesId, onSpecies, className = '' }) {
  const { t } = useApp()
  const rows = useSpeciesRows()
  const [mode, setMode] = useState('rest') // rest | place | species
  const rootRef = useRef(null)
  const [barWidth, setBarWidth] = useState(0) // px, for the species half to keep the place half's minimum clear
  useEffect(() => {
    const el = rootRef.current
    if (!el || typeof ResizeObserver === 'undefined') return undefined
    const ro = new ResizeObserver(() => setBarWidth(el.clientWidth))
    ro.observe(el)
    setBarWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [])
  const holdRef = useRef(false) // a species' sheet is open over the page: not a focus out

  function onBlur(e) {
    if (holdRef.current) return
    if (rootRef.current?.contains(e.relatedTarget)) return
    setMode('rest')
  }

  // A polite announcement of the filter when it changes (not on the first render)
  const chosenName = rows.find(r => r.id === speciesId)?.name ?? null
  const [announce, setAnnounce] = useState('')
  const first = useRef(true)
  useEffect(() => {
    if (first.current) { first.current = false; return }
    setAnnounce(chosenName ? t.obsMapSpAnnounce.replace('{name}', chosenName) : t.obsMapSpAnnounceNone)
  }, [chosenName]) // eslint-disable-line react-hooks/exhaustive-deps

  const rest = mode === 'rest'
  return (
    <div
      ref={rootRef}
      onBlur={onBlur}
      role="search"
      className={`relative flex ${className}`}
      style={{ height: `${BAR_H}px`, gap: rest ? `${BAR_GAP}px` : 0 }}
    >
      <MapSearch
        onSelect={onPlace}
        focused={mode === 'place'}
        collapsed={mode === 'species'}
        compact={rest && Boolean(speciesId)}
        onFocus={() => setMode('place')}
        onClose={() => setMode('rest')}
      />
      <MapSpeciesSearch
        speciesId={speciesId}
        onChoose={onSpecies}
        focused={mode === 'species'}
        collapsed={mode === 'place'}
        fit={rest && Boolean(speciesId)}
        barWidth={barWidth}
        onFocus={() => setMode('species')}
        onClose={() => setMode('rest')}
        holdRef={holdRef}
      />
      <span className="sr-only" role="status" aria-live="polite">{announce}</span>
    </div>
  )
}
