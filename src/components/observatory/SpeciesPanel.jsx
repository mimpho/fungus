import { useEffect, useId, useMemo, useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { useSpecies } from '../../hooks/useSpecies'
import { getEdibilityColor, resolveUrl } from '../../lib/helpers'
import {
  DEFAULT_EDIB_GROUP, EDIB_GROUPS, buildRows, countGroups, filterRows,
} from '../../lib/speciesList'
import { ObservatoryNotice } from './ObservatoryNotice'
import { ObsSelect } from './ObsSelect'
import { SpeciesPreview } from './SpeciesPreview'

const MARK = { met: '✓', pending: '…', not_met: '✗' }
const ALL = 'all'
const FIELD = 'rounded-xl bg-cream/[0.08] [[data-theme=light]_&]:bg-[var(--ui-filter-pill-bg)] px-3 py-2 text-base md:text-sm text-cream [[data-theme=light]_&]:text-[var(--ui-filter-pill-text)] placeholder:text-cream/40 [[data-theme=light]_&]:placeholder:text-[rgb(136_133_87/0.65)] outline-none focus-visible:ring-2 focus-visible:ring-cream/30 transition-colors'

function Row({ row, selected, onSelect, onOpenCard }) {
  const { t } = useApp()
  const [open, setOpen] = useState(false)
  const edib = getEdibilityColor(row.edibility)
  const detailsId = `obs-sp-${row.id}`
  return (
    <li data-testid="species-row" className={`obs-card [[data-theme=light]_&]:shadow-none relative rounded-xl overflow-hidden ${selected ? 'bg-bar/10' : `bg-cream/[0.08] [[data-theme=light]_&]:bg-[var(--ui-filter-pill-bg)]`}`}>
      {/* Selection outline drawn inside the card (above the photo) so the list never clips it */}
      {selected && <span aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 rounded-xl ring-2 ring-inset ring-bar" />}
      <div className="flex items-stretch">
        {/* The row is one big button (an overlay) so the card icon next to the edibility tag is not
            a button inside a button; the content above it lets clicks through, except that icon */}
        <div className="relative flex-1 min-w-0 flex items-stretch">
          <button
            type="button"
            onClick={() => onSelect(selected ? null : row.id)}
            aria-pressed={selected}
            aria-label={t.obsSpPick.replace('{name}', row.name)}
            className="absolute inset-0 z-0 hover:bg-cream/[0.06] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cream/50"
          />
          {/* The catalogue's photo, to the card's edge (no padding) and as tall as the row */}
          <span aria-hidden="true" className="pointer-events-none relative shrink-0 w-20 bg-cream/[0.08]">
            {row.photo && (
              <img
                src={resolveUrl(row.photo)}
                alt=""
                loading="lazy"
                decoding="async"
                onError={e => { e.currentTarget.style.visibility = 'hidden' }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
          </span>
          <span className="pointer-events-none relative flex-1 min-w-0 flex items-center gap-2.5 pl-3 pr-1 py-2.5">
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-cream [[data-theme=light]_&]:text-[var(--ui-filter-pill-text)] truncate">
                {row.followed && <span aria-label={t.obsSpFollowed} title={t.obsSpFollowed}>★ </span>}
                {row.name}
              </span>
              <span className="block text-xs text-cream/60 [[data-theme=light]_&]:text-[var(--ui-filter-pill-text)] opacity-80 truncate italic">{row.scientific}</span>
              <span className="mt-0.5 flex items-center gap-1.5">
                <span className={`inline-block text-[11px] px-1.5 py-px rounded-full ${edib.bg} ${edib.text}`}>{t[edib.tKey]}</span>
                <button
                  type="button"
                  onClick={() => onOpenCard(row.id)}
                  title={t.ver_ficha}
                  aria-label={t.obsCornerSpeciesOpen.replace('{name}', row.name)}
                  className="pointer-events-auto relative z-10 inline-flex items-center justify-center size-6 -my-1 rounded-full text-cream/60 [[data-theme=light]_&]:text-[var(--ui-filter-pill-text)] [[data-theme=light]_&]:hover:text-[var(--ui-filter-pill-text)] hover:text-cream hover:bg-cream/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cream/60"
                >
                  {/* A file card with lines */}
                  <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                    <path d="M14 3v5h5" />
                    <path d="M9 13h6M9 17h6" />
                  </svg>
                </button>
              </span>
            </span>
            {/* The score, at the right end next to the arrow that opens the details */}
            <span className={`font-display text-2xl font-bold shrink-0 min-w-9 text-right ${row.band.text}`}>{row.score}</span>
          </span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          aria-controls={detailsId}
          aria-label={`${open ? t.obsSpHide : t.obsSpDetails}: ${row.name}`}
          className="shrink-0 px-3 text-cream/60 [[data-theme=light]_&]:text-[var(--ui-filter-pill-text)] [[data-theme=light]_&]:hover:text-[var(--ui-filter-pill-text)] hover:text-cream transition-colors"
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
export function SpeciesPanel({ state, selected, onSelect, className = '' }) {
  const { t, lang } = useApp()
  const uid = useId()
  const { species: catalog } = useSpecies()
  const [group, setGroup] = useState(DEFAULT_EDIB_GROUP)
  const [query, setQuery] = useState('')
  const [viewing, setViewing] = useState(null)     // species whose card is open over the page
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
  const card = viewing && (catalog ?? []).find(s => s.id === viewing)
  // Groups with nothing to show are left out, except the one chosen
  const groups = EDIB_GROUPS.filter(g => counts[g] > 0 || g === group)

  return (
    <aside aria-labelledby={`${uid}-title`} className={`glass obs-card rounded-2xl p-4 flex flex-col gap-3 lg:h-[36rem] transition-opacity ${state.stale ? 'opacity-70' : ''} ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <h3 id={`${uid}-title`} className="font-display text-2xl text-cream">{t.obsSpTitle}</h3>
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
            aria-describedby={`${uid}-info`}
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
            id={`${uid}-info`}
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
            <div className="relative">
              <input
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                aria-label={t.obsSpSearchLabel}
                placeholder={t.obsSpSearch}
                autoComplete="off"
                className={`${FIELD} w-full pr-10 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-cancel-button]:appearance-none`}
              />
              {/* Own clear button: the browser's native one is blue and ignores the theme */}
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label={t.obsSpSearchClear}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-cream/10 transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--color-cream-rgb))" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor={`${uid}-edib`} className="text-xs text-cream/60 shrink-0">{t.obsSpEdib}</label>
              <ObsSelect id={`${uid}-edib`} value={group} onChange={e => setGroup(e.target.value)} className="flex-1 min-w-0 [[data-theme=light]_&_select]:!bg-[var(--ui-filter-pill-bg)] [[data-theme=light]_&_select]:!text-[var(--ui-filter-pill-text)] [[data-theme=light]_&_svg]:!text-[var(--ui-filter-pill-text)]">
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
                <Row key={row.id} row={row} selected={row.id === selected} onSelect={onSelect} onOpenCard={setViewing} />
              ))}
            </ul>
          )}
        </>
      )}
      {card && <SpeciesPreview species={card} onClose={() => setViewing(null)} />}
    </aside>
  )
}
