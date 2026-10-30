import { useContext, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useApp } from '../../contexts/AppContext'
import { IC } from '../../lib/helpers'
import { useSpecies } from '../../hooks/useSpecies'
import { useCornerInsights } from '../../hooks/useCornerInsights'
import { speciesName } from '../../lib/speciesList'
import { getScoreBand } from '../../lib/scoreBands'
import { formatCoords, samePoint } from '../../lib/observatoryView'
import { applyCornerFilters, comarcasOf, DEFAULT_SORT, forestOf, forestsOf, SORTS } from '../../lib/cornerFilters'
import { DEFAULT_KIND, KINDS, kindMeta, pinSvg } from '../../lib/cornerKinds'
import { forestIcon, forestParts } from '../../lib/habitat'
import { ObservatoryNotice } from './ObservatoryNotice'
import { ObsModalHeaderSlot } from './ObsModal'
import { SearchFilterBar } from '../ui/SearchFilterBar'
import { ActiveFilterChip } from '../ui/ActiveFilterChip'

const FOREST_LABEL_KEY = { pinar: 'obsFtPinar', hayedo: 'obsFtHayedo', robledal: 'obsFtRobledal', encinar: 'obsFtEncinar', otro: 'obsMacroOtro' }
const FOREST_IMAGES = new Set(['pinar', 'hayedo', 'robledal', 'encinar'])
const SORT_LABEL_KEY = { score: 'mejorCondicion', alfa: 'azNombre', elevation: 'altitud', recent: 'obsCornerRecent' }

const toggled = (list, value) => (list.includes(value) ? list.filter(x => x !== value) : [...list, value])

/** The card's score bar: the same look as the zone card's, from the corner's own score. */
function CardMeter({ info, label }) {
  const { t } = useApp()

  if (!info) {
    return (
      <div aria-hidden="true" className="space-y-2 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-3 w-28 bg-white/10 rounded" />
          <div className="h-3 w-14 bg-white/10 rounded" />
        </div>
        <div className="progress-bar"><div className="progress-fill bg-white/10" style={{ width: '0%' }} /></div>
      </div>
    )
  }
  // The card is still useful without its score: say so quietly instead of an error box per card
  if (!Number.isFinite(info.score)) return <p className="text-xs text-cream/60">{t.obsSavedNoScore}</p>

  const band = getScoreBand(info.score)
  return (
    <>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-cream/70 text-xs truncate pr-2">{label}</span>
        <span data-testid="saved-score" className={`text-xs font-semibold ${band.text}`}>{info.score} · {t[band.obsKey]}</span>
      </div>
      <div className="progress-bar" aria-hidden="true">
        <div className={`progress-fill ${band.bar}`} style={{ width: `${Math.min(100, Math.max(0, info.score))}%` }} />
      </div>
    </>
  )
}

/**
 * One corner as a card like the zones page's: name, pin, kind and place, altitude and forest, the
 * score bar and the picture of its main forest behind. The whole card selects the corner (the name
 * is the button, stretched over the card). Everything else lives in the corner itself.
 */
function Card({ sp, info, observed, onSelect }) {
  const { t } = useApp()
  const isObserved = samePoint(observed, sp)
  const top = info?.toponym
  // The toponym is not stored: it shows once it arrives; until then (or without one) the coordinates
  const place = [top?.name, top?.comarca].filter(Boolean).join(' · ') || formatCoords(sp)
  // With exactly one mushroom tagged the score is that mushroom's own; with none or several it is
  // the mean of the excellent edibles of the place (the server scores one species per request)
  const { species: catalog } = useSpecies()
  const onlyId = sp.species_ids?.length === 1 ? sp.species_ids[0] : null
  const meterLabel = onlyId
    ? speciesName(onlyId, null, new Map((catalog ?? []).map(c => [c.id, c])))
    : t.obsSavedCondLabel
  const forestTypes = forestParts({ forest: info?.forest }, t).slice(0, 2)
  const bg = forestOf(info).find(k => FOREST_IMAGES.has(k)) // the biggest class that has a picture

  return (
    <li
      data-testid="saved-item"
      className={`glass rounded-2xl hover-lift overflow-hidden relative focus-within:ring-2 focus-within:ring-cream/50 ${isObserved ? 'ring-2 ring-bar' : ''}`}
    >
      {bg && (
        <img className="absolute bottom-0 right-1 opacity-20 pointer-events-none" src={`/assets/images/forest-type/${bg}.webp`} alt="" height="125" width="125" />
      )}
      <div className="p-5">
        <div className="mb-3">
          <h3 className="font-display text-xl font-semibold text-cream truncate">
            <button
              type="button"
              onClick={() => onSelect(sp)}
              aria-current={isObserved ? 'true' : undefined}
              className="max-w-full truncate text-left outline-none after:absolute after:inset-0 after:content-[''] cursor-pointer"
            >
              {sp.name}
            </button>
          </h3>
          <p className="text-muted text-xs mt-0.5 flex items-center gap-1.5 min-w-0">
            <span aria-hidden="true" className="shrink-0 [&>svg]:w-3.5 [&>svg]:h-[18px]" dangerouslySetInnerHTML={{ __html: pinSvg(sp.kind) }} />
            {sp.kind !== DEFAULT_KIND && <span data-testid="saved-kind" className="shrink-0 text-cream/80">{t[kindMeta(sp.kind).labelKey]} ·</span>}
            <span className="truncate">{place}</span>
          </p>
        </div>

        <div className="relative z-[1] pointer-events-none">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-cream/70 mb-4">
            {Number.isFinite(sp.elevation_m) && (
              <span className="flex items-center gap-1.5">
                <img src="/assets/images/icons/mountain.png" alt="" height="16" width="16" />
                {Math.round(sp.elevation_m)} m
              </span>
            )}
            {forestTypes.map(f => (
              <span key={f.key} data-testid="saved-forest" className="flex items-center gap-1.5">
                {forestIcon(f.key) && <img src={`/assets/images/icons/forest-type-${forestIcon(f.key)}.png`} alt="" height="16" width="16" />}
                {f.label}
              </span>
            ))}
          </div>
          <CardMeter info={info} label={meterLabel} />
        </div>
      </div>
    </li>
  )
}

/** A native checkbox (several can be on) or radio (exactly one) with its label, in the dialog's own text: no button around it. */
function Option({ type, name, checked, onChange, children }) {
  return (
    <label className="flex items-center gap-2.5 py-1.5 text-sm text-cream/90 cursor-pointer select-none">
      <input type={type} name={name} checked={checked} onChange={onChange} className="w-4 h-4 shrink-0 accent-bar cursor-pointer" />
      <span className="flex items-center gap-2 min-w-0">{children}</span>
    </label>
  )
}

/** The options of a group in columns by the width of the filter panel (its container), not of the window: the dialog is narrower than the window. */
const OptionGrid = ({ children, ...rest }) => <div className="grid grid-cols-2 [@container(min-width:56rem)]:grid-cols-4 gap-x-6" {...rest}>{children}</div>

function Block({ title, children }) {
  return (
    <div className="mb-5 last:mb-0">
      <p className="text-muted text-xs uppercase tracking-wider mb-3">{title}</p>
      {children}
    </div>
  )
}

/** «Zonas observadas»: the button stuck at the top right of the page that shows or hides the saved cards. */
export function SavedPointsToggle({ saved, onToggle }) {
  const { t } = useApp()
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-haspopup="dialog"
      className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-coffee/25 ring-2 ring-bar backdrop-blur-[16px] text-cream text-sm font-medium hover:bg-coffee/35 transition-all"
    >
      <span aria-hidden="true" className="[&>svg]:w-[18px] [&>svg]:h-[18px]">{IC.heart(true)}</span>
      <span>{t.obsSavedListTitle}</span>
      {saved.status === 'ready' && (
        <span data-testid="saved-count" className="px-2 py-1 bg-bar text-white rounded-full text-xs font-bold leading-none">{saved.points.length}</span>
      )}
    </button>
  )
}

/**
 * The corners as cards with a search (name or place) and filters by kind, comarca and forest plus
 * the order. There is no «apply»: every change shows at once. The place, forest and score of each
 * corner are asked from the browser (`useCornerInsights`), so the filters that need them fill in as
 * the answers arrive. It is the content of the «Mis rincones» dialog, in the Observatory and in the
 * profile; `onSelect(corner)` is what a click does (observe it, or go and observe it).
 */
export function SavedPointsList({ saved, observed, onSelect }) {
  const { t, lang } = useApp()
  const { infoOf, done, total, loading } = useCornerInsights(saved.points)

  const [query, setQuery] = useState('')
  const [comarca, setComarca] = useState('')
  const [forests, setForests] = useState([])
  const [kinds, setKinds] = useState([])
  const [sort, setSort] = useState(DEFAULT_SORT)
  const [panelOpen, setPanelOpen] = useState(false)
  const headerSlot = useContext(ObsModalHeaderSlot) // the dialog's title line on a desktop: the search goes there

  const comarcas = useMemo(() => comarcasOf(saved.points, infoOf, lang), [saved.points, infoOf, lang])
  const forestOptions = useMemo(() => forestsOf(saved.points, infoOf), [saved.points, infoOf])
  const kindOptions = useMemo(() => KINDS.filter(k => saved.points.some(p => (p.kind ?? DEFAULT_KIND) === k)), [saved.points])
  const visible = useMemo(
    () => applyCornerFilters(saved.points, infoOf, { query, comarca, forests, kinds, sort }, lang),
    [saved.points, infoOf, query, comarca, forests, kinds, sort, lang],
  )

  // A choice that no longer exists (the corner was removed or moved) stops filtering
  const activeComarca = comarca && comarcas.includes(comarca) ? comarca : ''
  const activeForests = forests.filter(k => forestOptions.includes(k))
  const activeKinds = kinds.filter(k => kindOptions.includes(k))
  const filterCount = (activeComarca ? 1 : 0) + activeForests.length + activeKinds.length
  const clearAll = () => { setQuery(''); setComarca(''); setForests([]); setKinds([]) }

  const searchBar = (
    <SearchFilterBar
      variant="split"
      value={query}
      onChange={e => setQuery(e.target.value)}
      onClear={() => setQuery('')}
      placeholder={t.obsCornerSearch}
      onFilterClick={() => setPanelOpen(o => !o)}
      onSearchFocus={() => setPanelOpen(false)}
      activeFilters={filterCount}
      className="w-full"
    />
  )

  return (
    <div id="obs-saved-list" role="region" aria-label={t.obsSavedListTitle} className="space-y-4">
      {saved.status === 'loading' && <p className="text-sm text-cream/60 animate-pulse px-1">{t.obsSavedLoading}</p>}
      {saved.status === 'error' && <ObservatoryNotice error={saved.error} onRetry={saved.reload} />}
      {saved.status === 'ready' && saved.points.length === 0 && <p className="text-sm text-cream/60 px-1">{t.obsSavedEmpty}</p>}
      {saved.status === 'ready' && saved.points.length > 0 && (
        <>
          {headerSlot ? createPortal(searchBar, headerSlot) : searchBar}

          {/* In line, not the zones' bottom sheet: this already lives in a dialog, and a sheet inside a sheet would hide under it */}
          {panelOpen && (
            <div className="glass rounded-2xl p-5 [container-type:inline-size]">
              {kindOptions.length > 1 && (
                <Block title={t.obsCornerKindTitle}>
                  <OptionGrid role="group" aria-label={t.obsCornerKindTitle}>
                    {kindOptions.map(k => (
                      <Option key={k} type="checkbox" checked={activeKinds.includes(k)} onChange={() => setKinds(toggled(kinds, k))}>
                        <span aria-hidden="true" className="shrink-0 [&>svg]:w-3 [&>svg]:h-[15px]" dangerouslySetInnerHTML={{ __html: pinSvg(k) }} />
                        {t[kindMeta(k).labelKey]}
                      </Option>
                    ))}
                  </OptionGrid>
                </Block>
              )}
              {comarcas.length > 0 && (
                <Block title={t.comarca}>
                  <div className="relative sm:inline-block sm:min-w-[220px]">
                    <select
                      value={activeComarca}
                      onChange={e => setComarca(e.target.value)}
                      aria-label={t.comarca}
                      className="w-full px-4 py-3 pr-10 rounded-xl text-sm outline-none cursor-pointer appearance-none"
                      style={{ background: 'var(--ui-filter-select-bg)', color: 'var(--ui-filter-select-text)', border: 'var(--ui-filter-select-border)' }}
                    >
                      <option value="" style={{ background: 'var(--color-modal)' }}>{t.todasLasComarcas}</option>
                      {comarcas.map(c => <option key={c} value={c} style={{ background: 'var(--color-modal)' }}>{c}</option>)}
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-cream/50">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </Block>
              )}
              {forestOptions.length > 0 && (
                <Block title={t.tipoBosque}>
                  <OptionGrid role="group" aria-label={t.tipoBosque}>
                    {forestOptions.map(k => (
                      <Option key={k} type="checkbox" checked={activeForests.includes(k)} onChange={() => setForests(toggled(forests, k))}>
                        {forestIcon(k) && <img src={`/assets/images/icons/forest-type-${forestIcon(k)}.png`} alt="" height="16" width="16" />}
                        {t[FOREST_LABEL_KEY[k]]}
                      </Option>
                    ))}
                  </OptionGrid>
                </Block>
              )}
              <Block title={t.ordenarPor}>
                <OptionGrid role="radiogroup" aria-label={t.ordenarPor}>
                  {SORTS.map(s => (
                    <Option key={s} type="radio" name="obs-corner-sort" checked={sort === s} onChange={() => setSort(s)}>{t[SORT_LABEL_KEY[s]]}</Option>
                  ))}
                </OptionGrid>
              </Block>
            </div>
          )}

          {(query.trim() || filterCount > 0) && (
            <div className="flex flex-wrap gap-2">
              {query.trim() && <ActiveFilterChip emoji="🔍" label={`"${query.trim()}"`} onRemove={() => setQuery('')} />}
              {activeKinds.map(k => <ActiveFilterChip key={k} emoji="📍" label={t[kindMeta(k).labelKey]} color="yellow" onRemove={() => setKinds(toggled(kinds, k))} />)}
              {activeComarca && <ActiveFilterChip emoji="🗺️" label={activeComarca} onRemove={() => setComarca('')} />}
              {activeForests.map(k => <ActiveFilterChip key={k} emoji="🌲" label={t[FOREST_LABEL_KEY[k]]} color="emerald" onRemove={() => setForests(toggled(forests, k))} />)}
            </div>
          )}

          <p className="text-xs text-cream/60 px-1" aria-live="polite">
            {t.obsCornerResults.replace('{n}', visible.length).replace('{total}', saved.points.length)}
            {loading && <span className="animate-pulse"> · {t.obsCornerComputing.replace('{done}', done).replace('{total}', total)}</span>}
          </p>

          {visible.length === 0 ? (
            <p className="text-sm text-cream/60 px-1">
              {t.obsCornerNoMatch}{' '}
              <button type="button" onClick={clearAll} className="underline underline-offset-2 hover:text-cream">{t.obsCornerClearAll}</button>
            </p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {visible.map(sp => <Card key={sp.id} sp={sp} info={infoOf(sp)} observed={observed} onSelect={onSelect} />)}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
