import { List } from 'lucide-react'
import { useApp } from '../../../contexts/AppContext'
import { fill } from '../../../lib/thermometer'
import { NavCheckbox } from './NavCheckbox'

const FOCUS = 'outline-none focus-visible:ring-2 focus-visible:ring-cream/50'

/**
 * The Zonas tab's content: three rows, each a checkbox and «Ver listado» with the count in a badge.
 * Only «Mis rincones» works; «Zonas de interés» and «Top 10» are shown inert with «Pronto» until their
 * epics (PRD Q8). `corners` = { checked, onChange, count (null while loading), onList }.
 */
export function ZonasPanel({ corners }) {
  const { t, lang } = useApp()
  const rows = [
    { id: 'corners', label: t.obsLayerCorners, ready: true, ...corners },
    { id: 'interest', label: t.obsLayerInterest, ready: false },
    { id: 'top10', label: t.obsLayerTop10, ready: false },
  ]
  return (
    <ul className="flex flex-col">
      {rows.map(r => (
        <li key={r.id} className="flex items-center gap-3 min-h-[52px]">
          <NavCheckbox
            checked={r.ready ? r.checked : false}
            onChange={r.ready ? r.onChange : () => {}}
            disabled={!r.ready}
            label={r.label}
            ariaLabel={r.ready ? undefined : `${r.label} · ${t.obsLayerSoon}`}
            className="flex-1 text-[15px] font-medium"
          />
          {r.ready ? (
            <button
              type="button"
              aria-haspopup="dialog"
              aria-label={r.count == null ? t.obsZonesSeeList : fill(t.obsZonesSeeListN, { capa: r.label, n: r.count }, lang)}
              onClick={r.onList}
              className={`shrink-0 inline-flex items-center gap-2 h-[44px] rounded-full pl-[14px] pr-[8px] bg-cream/10 hover:bg-cream/20 text-[14px] text-cream font-medium whitespace-nowrap ${FOCUS}`}
            >
              <List size={16} aria-hidden="true" />
              {t.obsZonesSeeList}
              {/* Solid fill: coffee-light has no RGB channel, so `bg-coffee-light/25` drew nothing (memory/gotchas.md) */}
              {r.count != null && (
                <span data-testid="saved-count" aria-hidden="true" className="min-w-[24px] h-[24px] rounded-full bg-[var(--count-badge-bg)] text-[var(--count-badge-text)] px-[6px] text-[12px] font-bold tabular-nums flex items-center justify-center">
                  {r.count}
                </span>
              )}
            </button>
          ) : (
            <span aria-hidden="true" className="shrink-0 pr-2 text-[11px] uppercase tracking-wide text-cream/50">{t.obsLayerSoon}</span>
          )}
        </li>
      ))}
    </ul>
  )
}
