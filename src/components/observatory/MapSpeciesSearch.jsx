import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { useSpecies } from '../../hooks/useSpecies'
import { useSpeciesRows } from '../../hooks/useSpeciesRows'
import { DEFAULT_EDIB_GROUP, EDIB_GROUPS, countGroups, filterRows } from '../../lib/speciesList'
import { BarHalf, CloseSearchButton, FIELD_MS } from './BarHalf'
import { ObsSelect } from './ObsSelect'
import { SpeciesPreview } from './SpeciesPreview'
import { SpeciesRow } from './SpeciesRow'

const ALL = 'all'
const NONE = '__none__' // the «Sin filtro» row
// The dropdown never reaches below the visible screen (the keyboard on a phone takes part of it)
const MIN_LIST_H = 160
const PLACE_MIN = 56 // px the place half keeps (its magnifier and a few letters)
// Width of the half beyond the name: 34 left (icon), 12 gap, 44 the cross, 6 right, and a little for the font's rounding
const FIT_EXTRA = 98
let measureCtx = null
// Width of a name in the half's type (16 px at every width)
function nameWidth(name) {
  measureCtx ??= document.createElement('canvas').getContext('2d')
  measureCtx.font = `400 16px "DM Sans", system-ui, sans-serif`
  return measureCtx.measureText(name).width
}

/**
 * The species half of the map's search bar: choose the mushroom the whole map looks through.
 * At rest it shows the chosen name and a × in a circle (it removes the filter); focused it takes the whole
 * width, its × is bare (it closes the search, the species is kept) and a dropdown opens with the same cards
 * as the observed zone's panel. The edibility selector only works while exploring (empty field): with any
 * text the search covers the whole catalogue, so a toxic species is always found.
 * `speciesId` / `onChoose(id | null)`: the active species. `holdRef.current` is true while the species' sheet is
 * open over the page, so the bar does not take that for a focus out.
 */
export function MapSpeciesSearch({ speciesId, onChoose, focused, collapsed, fit = false, barWidth = 0, onFocus, onClose, holdRef }) {
  const { t } = useApp()
  const uid = useId()
  const rows = useSpeciesRows()
  const { species: catalog } = useSpecies()
  const chosen = useMemo(() => rows.find(r => r.id === speciesId) ?? null, [rows, speciesId])
  const [text, setText] = useState('')
  const [group, setGroup] = useState(DEFAULT_EDIB_GROUP)
  const [active, setActive] = useState(-1)
  const [viewing, setViewing] = useState(null) // species whose sheet is open over the page
  const [maxH, setMaxH] = useState(null)
  const inputRef = useRef(null)
  const dropRef = useRef(null)
  const listRef = useRef(null)
  const applyTimer = useRef(null)
  useEffect(() => () => clearTimeout(applyTimer.current), [])

  const query = text.trim()
  const exploring = !query
  const counts = useMemo(() => countGroups(rows), [rows])
  const shown = useMemo(
    () => filterRows(rows, { group: exploring && group !== ALL ? group : null, query }),
    [rows, group, exploring, query],
  )
  // The «Sin filtro» row goes first while a species is chosen
  const items = useMemo(() => (chosen ? [{ id: NONE }, ...shown] : shown), [chosen, shown])
  const groups = EDIB_GROUPS.filter(g => counts[g] > 0 || g === group)

  // Not focused any more: the typed text goes and the selector goes back to its starting group
  useEffect(() => {
    if (focused) return
    setText(''); setGroup(DEFAULT_EDIB_GROUP); setActive(-1)
  }, [focused])

  // The sheet of a species opened from a card: the focus may leave the field, the search stays; closing it gives the focus back
  useEffect(() => {
    if (!viewing) return undefined
    return () => {
      inputRef.current?.focus({ preventScroll: true })
      holdRef.current = false
    }
  }, [viewing, holdRef])

  // The dropdown is as tall as what is left of the visible screen under the bar (the phone's keyboard included)
  useLayoutEffect(() => {
    if (!focused) return undefined
    const measure = () => {
      const vv = window.visualViewport
      const bottom = dropRef.current?.getBoundingClientRect().top ?? 0
      const room = (vv ? vv.height + vv.offsetTop : window.innerHeight) - bottom - 12
      setMaxH(Math.max(MIN_LIST_H, Math.floor(room)))
    }
    measure()
    window.visualViewport?.addEventListener('resize', measure)
    window.visualViewport?.addEventListener('scroll', measure)
    window.addEventListener('resize', measure)
    return () => {
      window.visualViewport?.removeEventListener('resize', measure)
      window.visualViewport?.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
    }
  }, [focused])

  function close() {
    onClose()
    inputRef.current?.blur()
  }

  // Applied once the half has folded back: a heavy change in the same click as a transition freezes it (memory/gotchas.md)
  function choose(id) {
    clearTimeout(applyTimer.current)
    close()
    applyTimer.current = setTimeout(() => onChoose(id), FIELD_MS + 40)
  }

  function chooseItem(item) {
    if (!item) return
    if (item.id === NONE) choose(null)
    else choose(item.id)
  }

  function onKeyDown(e) {
    // The species' sheet is open over the page: its Esc is the sheet's (stopping it here would never reach it)
    if (holdRef.current) return
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!items.length) return
      e.preventDefault()
      const step = e.key === 'ArrowDown' ? 1 : -1
      setActive(a => (a + step + items.length) % items.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      // Enter on an empty field does not pick by itself: it needs an arrow first
      if (exploring && active < 0) return
      chooseItem(items[active] ?? shown[0])
    } else if (e.key === 'Escape' && focused) {
      e.stopPropagation() // closes the search only, not the point panel (page-level Esc)
      close()
    }
  }

  // Keep the highlighted card in view while moving with the arrows
  useEffect(() => {
    if (active < 0) return
    document.getElementById(`${uid}-opt-${active}`)?.scrollIntoView({ block: 'nearest' })
  }, [active, uid])

  // Held at once (not in an effect): the sheet may take the focus as it mounts
  function openCard(id) { holdRef.current = true; setViewing(id) }

  const card = viewing && (catalog ?? []).find(s => s.id === viewing)
  const selectValue = exploring ? group : ALL

  const dropdown = focused && (
    <div
      ref={dropRef}
      className="absolute left-0 right-0 top-full mt-2 rounded-2xl map-surface p-3 flex flex-col gap-3"
      style={{ maxHeight: maxH ? `${maxH}px` : undefined }}
    >
      <div className="flex items-center gap-2">
        <label htmlFor={`${uid}-edib`} className="text-[13px] text-cream/80 shrink-0">{t.obsSpEdib}</label>
        <ObsSelect
          id={`${uid}-edib`}
          value={selectValue}
          disabled={!exploring}
          onChange={e => { setGroup(e.target.value); setActive(-1) }}
          className="flex-1 min-w-0 [[data-theme=light]_&_select]:!bg-[var(--ui-filter-pill-bg)]"
        >
          <option value={ALL}>{t.obsMapSpAll} ({rows.length})</option>
          {exploring && groups.map(g => <option key={g} value={g}>{t[g]} ({counts[g]})</option>)}
        </ObsSelect>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-cream/80 px-1 pb-1">{t.obsSpNoMatch}</p>
      ) : (
        <ul
          ref={listRef}
          id={`${uid}-list`}
          role="listbox"
          aria-label={t.obsMapSpListLabel}
          onPointerDown={e => e.preventDefault()}
          className="space-y-2 overflow-y-auto overscroll-contain min-h-0 pr-1"
        >
          {items.map((item, i) => item.id === NONE ? (
            <li
              key={NONE}
              id={`${uid}-opt-${i}`}
              role="option"
              aria-selected={false}
              onClick={() => chooseItem(item)}
              onMouseEnter={() => setActive(i)}
              className={`cursor-pointer rounded-xl border-[1.5px] border-coffee-light min-h-[48px] px-3.5 flex items-center gap-2.5 text-[15px] font-bold text-cream ${i === active ? 'bg-cream/[0.12]' : ''}`}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="min-w-0 truncate">{t.obsMapSpRemove.replace('{name}', chosen.name)}</span>
            </li>
          ) : (
            <SpeciesRow
              key={item.id}
              row={item}
              option
              optionId={`${uid}-opt-${i}`}
              active={i === active}
              onHover={() => setActive(i)}
              selected={item.id === speciesId}
              pickLabel={t.obsMapSpPick}
              onPick={() => chooseItem(item)}
              onOpenCard={openCard}
            />
          ))}
        </ul>
      )}
    </div>
  )

  // At rest with a species: its name, plain, with a cross that takes the filter off. The place half
  // keeps only its magnifier meanwhile (MapSearchBar), so there is room for both.
  const showName = !focused && chosen
  // The half is as wide as «icon · name · ×» needs, as a number so the width animates (a jump with `auto`)
  const fitW = chosen && barWidth ? Math.min(Math.ceil(nameWidth(chosen.name)) + FIT_EXTRA, barWidth - 4 - PLACE_MIN) : null
  return (
    <BarHalf side="right" focused={focused} collapsed={collapsed} fitWidth={fit && showName ? fitW : null} dropdown={dropdown}>
      <span aria-hidden="true" className={`absolute left-[10px] top-1/2 -translate-y-1/2 pointer-events-none z-10 [&>svg]:w-[18px] [&>svg]:h-[18px] search-light-text`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2C7.03 2 3 6.03 3 11h18c0-4.97-4.03-9-9-9z" />
          <path d="M9 11v8a1 1 0 001 1h4a1 1 0 001-1v-8" />
        </svg>
      </span>
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-label={chosen ? t.obsMapSpLabelChosen.replace('{name}', chosen.name) : t.obsMapSpLabel}
        aria-expanded={focused}
        aria-controls={`${uid}-list`}
        aria-autocomplete="list"
        aria-activedescendant={focused && active >= 0 ? `${uid}-opt-${active}` : undefined}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        value={focused ? text : ''}
        placeholder={showName ? '' : t.obsMapSpPlaceholder}
        onChange={e => { setText(e.target.value); setActive(-1) }}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        className={`bg-transparent search-light-input placeholder:!opacity-80 text-[16px] outline-none truncate ${showName ? 'absolute inset-0 h-full w-full' : 'h-full w-full'}`}
        style={{ paddingLeft: '34px', paddingRight: focused ? '44px' : '6px' }}
      />
      {focused && <CloseSearchButton label={t.obsSearchClose} onClick={close} />}
      {showName && (
        <span className="pointer-events-none relative flex items-center justify-between gap-[12px] w-full h-[52px] min-w-0 pl-[34px] pr-[6px] search-light-text">
          {/* Just the name, as plain text: the species' sheet says what is filtered */}
          <span className="truncate text-[16px]">{chosen.name}</span>
          {/* The cross takes the filter off; its touch target reaches 44 px without a visible box */}
          <button
            type="button"
            onClick={() => { clearTimeout(applyTimer.current); onChoose(null) }}
            aria-label={t.obsMapSpRemove.replace('{name}', chosen.name)}
            title={t.obsMapSpRemove.replace('{name}', chosen.name)}
            className="pointer-events-auto shrink-0 w-[44px] h-[44px] -my-[4px] flex items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-cream/60"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      )}
      {card && <SpeciesPreview species={card} onClose={() => setViewing(null)} />}
    </BarHalf>
  )
}
