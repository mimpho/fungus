import { useApp } from '../../contexts/AppContext'
import { DEFAULT_WINDOW } from '../../lib/observatoryView'
import { fill } from '../../lib/thermometer'
import { dayWithYear } from '../../lib/timeline'

function Pill({ label, onRemove }) {
  const { t } = useApp()
  return (
    <li className="pointer-events-auto inline-flex items-center gap-1 rounded-full bg-bar text-white transition-shadow group-data-[stuck=true]:shadow-[0_4px_14px_rgba(0,0,0,0.4)] pl-3.5 pr-1 py-1 text-sm">
      <span className="truncate max-w-[16rem]">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={t.obsFilterRemove.replace('{name}', label)}
        className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/15 transition-colors"
      >
        {/* The pill is the colour of the map's active pills (`bg-bar`, white text), the same in both themes */}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </li>
  )
}

/**
 * The filters in force over the thermometer, each one removable: the mushroom being looked at
 * and a timeline window that is not the default (the last 20 days). Nothing is drawn when there
 * is no filter.
 */
export function FilterPills({ speciesName, onClearSpecies, until, days, onClearWindow }) {
  const { t, lang } = useApp()
  const windowChanged = !!until || days !== DEFAULT_WINDOW
  if (!speciesName && !windowChanged) return null
  const windowLabel = until
    ? fill(t.obsFilterUntil, { date: dayWithYear(until, lang), n: days }, lang)
    : fill(t.obsFilterLast, { n: days }, lang)
  return (
    <ul aria-label={t.obsFilterApplied} data-testid="filter-pills" className="flex flex-wrap items-center gap-2">
      {speciesName && <Pill label={speciesName} onRemove={onClearSpecies} />}
      {windowChanged && <Pill label={windowLabel} onRemove={onClearWindow} />}
    </ul>
  )
}
