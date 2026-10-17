import { useId, useMemo, useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { useSpecies } from '../../hooks/useSpecies'
import { usePointData } from '../../hooks/usePointData'
import { fetchPointSpecies, fetchSavedPointSpecies } from '../../services/observatoryService'
import { getEdibilityColor } from '../../lib/helpers'
import {
  DEFAULT_EDIB_GROUP, EDIB_GROUPS, buildRows, countGroups, filterRows, speciesName,
} from '../../lib/speciesList'
import { ObservatoryNotice } from './ObservatoryNotice'

const MARK = { met: '✓', pending: '…', not_met: '✗' }
const ALL = 'all'
const FIELD = 'rounded-xl bg-cream/[0.06] border border-cream/30 px-3 py-2 text-base md:text-sm text-cream placeholder:text-cream/40 focus:outline-none focus:border-cream/50'

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
 * A saved point asks through its own endpoint so that the forest types the author gave decide.
 */
export function SpeciesPanel({ point, savedId, selected, onSelect }) {
  const { t, lang } = useApp()
  const uid = useId()
  const { species: catalog } = useSpecies()
  const [group, setGroup] = useState(DEFAULT_EDIB_GROUP)
  const [query, setQuery] = useState('')

  const fetcher = useMemo(
    () => (savedId ? (_lat, _lon, opts) => fetchSavedPointSpecies(savedId, opts) : fetchPointSpecies),
    [savedId],
  )
  const state = usePointData(fetcher, point)

  const byId = useMemo(() => new Map((catalog ?? []).map(s => [s.id, s])), [catalog])
  const rows = useMemo(() => buildRows(state.data, byId, t, lang), [state.data, byId, t, lang])
  const counts = useMemo(() => countGroups(rows), [rows])
  const shown = useMemo(
    () => filterRows(rows, { group: group === ALL ? null : group, query }),
    [rows, group, query],
  )
  const current = selected ? rows.find(r => r.id === selected) : null
  const currentName = selected ? (current?.name ?? speciesName(selected, null, byId)) : t.obsSpAny
  const source = state.data?.forest_source === 'author' ? t.obsSpSrcAuthor : state.data?.forest_source === 'land_cover' ? t.obsSpSrcCover : null
  // Groups with nothing to show are left out, except the one chosen
  const groups = EDIB_GROUPS.filter(g => counts[g] > 0 || g === group)

  return (
    <aside aria-labelledby="obs-sp-title" className="glass rounded-2xl p-4 flex flex-col gap-3 lg:absolute lg:inset-0">
      <h3 id="obs-sp-title" className="font-display text-2xl text-cream">{t.obsSpTitle}</h3>

      <div aria-live="polite" className="flex items-center gap-2 rounded-xl glass-olive px-3 py-2">
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] uppercase tracking-wide text-cream/60">{t.obsSpLooking}</span>
          <span data-testid="species-looking" className="block font-display text-xl text-cream leading-tight truncate">{currentName}</span>
          {!selected && <span className="block text-xs text-cream/60">{t.obsSpAnySub}</span>}
        </span>
        {selected && (
          <button
            type="button"
            onClick={() => onSelect(null)}
            aria-label={t.obsSpClear.replace('{name}', currentName)}
            className="shrink-0 w-9 h-9 rounded-lg text-cream/70 hover:text-cream hover:bg-cream/10 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {state.status === 'loading' && <p className="text-sm text-cream/60 animate-pulse">{t.obsSpLoading}</p>}
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
              <select
                id={`${uid}-edib`}
                value={group}
                onChange={e => setGroup(e.target.value)}
                className={`${FIELD} flex-1 min-w-0 py-1.5`}
              >
                <option value={ALL}>{t.obsSpAll} ({rows.length})</option>
                {groups.map(g => <option key={g} value={g}>{t[g]} ({counts[g]})</option>)}
              </select>
            </div>
          </div>
          {source && <p className="text-xs text-cream/50">{source}</p>}
          <p data-testid="species-count" className="text-xs text-cream/60" aria-live="polite">
            {t.obsSpCount.replace('{n}', shown.length)}
          </p>
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
