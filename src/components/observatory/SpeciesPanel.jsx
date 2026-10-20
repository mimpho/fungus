import { useEffect, useId, useMemo, useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { useSpecies } from '../../hooks/useSpecies'
import { getEdibilityColor } from '../../lib/helpers'
import {
  DEFAULT_EDIB_GROUP, EDIB_GROUPS, buildRows, countGroups, filterRows,
} from '../../lib/speciesList'
import { ObservatoryNotice } from './ObservatoryNotice'
import { ObsSelect } from './ObsSelect'

const MARK = { met: '✓', pending: '…', not_met: '✗' }
const ALL = 'all'
const FIELD = 'rounded-xl bg-cream/[0.08] px-3 py-2 text-base md:text-sm text-cream placeholder:text-cream/40 outline-none focus-visible:ring-2 focus-visible:ring-cream/30 transition-colors'

function Row({ row, selected, onSelect }) {
  const { t } = useApp()
  const [open, setOpen] = useState(false)
  const edib = getEdibilityColor(row.edibility)
  const detailsId = `obs-sp-${row.id}`
  return (
    <li data-testid="species-row" className={`rounded-xl border ${selected ? 'border-bar bg-bar/10' : 'border-cream/15'}`}>
      <div className="flex items-stretch">
        <button
          type="button"
          onClick={() => onSelect(selected ? null : row.id)}
          aria-pressed={selected}
          aria-label={t.obsSpPick.replace('{name}', row.name)}
          className="flex-1 min-w-0 flex items-center gap-3 px-3 py-2.5 text-left rounded-xl hover:bg-cream/[0.06] transition-colors"
        >
          <span className={`font-display text-2xl font-bold w-9 text-right shrink-0 ${row.band.text}`}>{row.score}</span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-cream truncate">
              {row.followed && <span aria-label={t.obsSpFollowed} title={t.obsSpFollowed}>★ </span>}
              {row.name}
            </span>
            <span className="block text-xs text-cream/60 truncate italic">{row.scientific}</span>
            <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
              <span className="text-xs text-cream/80">{row.grade}</span>
              <span className={`text-[11px] px-1.5 py-px rounded-full ${edib.bg} ${edib.text}`}>{t[edib.tKey]}</span>
            </span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          aria-controls={detailsId}
          aria-label={`${open ? t.obsSpHide : t.obsSpDetails}: ${row.name}`}
          className="shrink-0 px-3 text-cream/60 hover:text-cream transition-colors"
        >
          <span aria-hidden="true">{open ? '▾' : '▸'}</span>
        </button>
      </div>
      <div id={detailsId} hidden={!open} className="px-3 pb-3 space-y-1.5">
        {row.window && <p className="text-xs text-cream/80 glass-warm rounded-lg px-2.5 py-1.5">{row.window}</p>}
        <ul className="space-y-1">
          {row.conditions.map(c => (
            <li key={c.key} className="text-xs text-cream/70 flex gap-2">
              <span aria-hidden="true" className="w-3 shrink-0 text-center">{MARK[c.status]}</span>
              <span className="sr-only">{c.statusLabel}: </span>
              <span>{c.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </li>
  )
}

/**
 * «¿Qué seta buscas?»: the species that fit the point today and the one being looked at.
 * The list is the whole catalogue that fits altitude, month and forest, so it opens on the
 * excellent edibles; a search box (scientific name, names in the app language and Latin
 * synonyms) and the edibility selector narrow it. Choosing one re-asks the thermometer with that
 * species' own temperature range; choosing it again (or the ✕) goes back to the general model.
 * On desktop the panel takes the height of the thermometer beside it (see ObservedZone) and the
 * list scrolls inside; on a phone the list is at most 350 px high.
 * `state` is the answer of /point/species (or of the saved point's endpoint, so that the forest
 * types the author gave decide): ObservedZone asks it, because the chart needs the selected
 * species' thermal range too.
 */
export function SpeciesPanel({ state, selected, onSelect }) {
  const { t, lang } = useApp()
  const uid = useId()
  const { species: catalog } = useSpecies()
  const [group, setGroup] = useState(DEFAULT_EDIB_GROUP)
  const [query, setQuery] = useState('')
  const [infoOpen, setInfoOpen] = useState(false)   // pinned by a click (touch screens)
  const [infoHover, setInfoHover] = useState(false) // while the pointer or focus is on the button

  // Esc closes the explanation
  useEffect(() => {
    if (!infoOpen) return undefined
    const onKey = e => { if (e.key === 'Escape') setInfoOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [infoOpen])

  const byId = useMemo(() => new Map((catalog ?? []).map(s => [s.id, s])), [catalog])
  const rows = useMemo(() => buildRows(state.data, byId, t, lang), [state.data, byId, t, lang])
  const counts = useMemo(() => countGroups(rows), [rows])
  const shown = useMemo(
    () => filterRows(rows, { group: group === ALL ? null : group, query }),
    [rows, group, query],
  )
  // Groups with nothing to show are left out, except the one chosen
  const groups = EDIB_GROUPS.filter(g => counts[g] > 0 || g === group)

  return (
    <aside aria-labelledby="obs-sp-title" className={`glass obs-card rounded-2xl p-4 flex flex-col gap-3 lg:absolute lg:inset-0 transition-opacity ${state.stale ? 'opacity-70' : ''}`}>
      <div className="flex items-center justify-between gap-2">
        <h3 id="obs-sp-title" className="font-display text-2xl text-cream">{t.obsSpTitle}</h3>
        <div
          className="relative"
          onMouseEnter={() => setInfoHover(true)}
          onMouseLeave={() => setInfoHover(false)}
        >
          <button
            type="button"
            onClick={() => setInfoOpen(o => !o)}
            onFocus={() => setInfoHover(true)}
            onBlur={() => { setInfoHover(false); setInfoOpen(false) }}
            aria-expanded={infoOpen}
            aria-describedby="obs-sp-info"
            aria-label={t.obsSpInfoLabel}
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full text-cream/80 hover:text-cream hover:bg-cream/10 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 11v5" />
              <path d="M12 7.5v.5" />
            </svg>
          </button>
          <p
            id="obs-sp-info"
            role="tooltip"
            hidden={!(infoOpen || infoHover)}
            className="absolute right-0 top-full mt-1 z-30 w-72 max-w-[80vw] rounded-xl px-3 py-2.5 text-[13px] leading-relaxed text-cream bg-modal/95 backdrop-blur-sm border border-cream/20 shadow-lg"
          >
            {t.obsSpInfo}
          </p>
        </div>
      </div>

      {state.status === 'loading' && !state.data && <p className="text-sm text-cream/60 animate-pulse">{t.obsSpLoading}</p>}
      {state.status === 'error' && <ObservatoryNotice error={state.error} onRetry={state.retry} />}
      {state.status === 'ready' && rows.length === 0 && (
        <p className="text-sm text-cream/70">{state.data?.reason === 'no_forest' ? t.obsSpNoForest : t.obsSpEmpty}</p>
      )}
      {rows.length > 0 && (
        <>
          <div className="space-y-2">
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              aria-label={t.obsSpSearchLabel}
              placeholder={t.obsSpSearch}
              autoComplete="off"
              className={`${FIELD} w-full`}
            />
            <div className="flex items-center gap-2">
              <label htmlFor={`${uid}-edib`} className="text-xs text-cream/60 shrink-0">{t.obsSpEdib}</label>
              <ObsSelect id={`${uid}-edib`} value={group} onChange={e => setGroup(e.target.value)} className="flex-1 min-w-0">
                <option value={ALL}>{t.obsSpAll} ({rows.length})</option>
                {groups.map(g => <option key={g} value={g}>{t[g]} ({counts[g]})</option>)}
              </ObsSelect>
            </div>
          </div>
          {shown.length === 0 ? (
            <p className="text-sm text-cream/70">{t.obsSpNoMatch}</p>
          ) : (
            <ul
              data-testid="species-scroll"
              tabIndex={0}
              aria-label={t.obsSpListLabel}
              className="space-y-2 max-h-[350px] lg:max-h-none lg:flex-1 lg:min-h-0 overflow-y-auto pr-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-cream/50 rounded-xl"
            >
              {shown.map(row => (
                <Row key={row.id} row={row} selected={row.id === selected} onSelect={onSelect} />
              ))}
            </ul>
          )}
        </>
      )}
    </aside>
  )
}
