import { useApp } from '../../contexts/AppContext'
import { eventText, frostLine } from '../../lib/chartData'

const TONE_BG = { trigger: '#4a7c59', brake: '#c98a40' }

/**
 * «Detonantes y frenos» of the chart window: the same numbered events as the circles on the chart,
 * each with what happened and what it is expected to do, and the coldest night of the period.
 * On desktop it takes the height of the chart beside it (the box that wraps it is relative) and
 * the list scrolls inside; on a phone the list is at most 350 px high.
 */
export function EventsList({ vm }) {
  const { t, lang } = useApp()
  const items = vm.events.map(e => ({ e, text: eventText(e, t, lang) })).filter(x => x.text)
  const frost = frostLine(vm.lowest, t, lang)

  return (
    <aside aria-labelledby="obs-ev-title" className="glass obs-card rounded-2xl p-4 flex flex-col gap-3 lg:absolute lg:inset-0">
      <div>
        <h3 id="obs-ev-title" className="font-display text-2xl text-cream">{t.obsChEvents}</h3>
        <p className="text-xs text-cream/60">{t.obsChEventsSub}</p>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-cream/70">{t.obsChNoEvents}</p>
      ) : (
        <ol
          data-testid="events-list"
          tabIndex={0}
          aria-label={t.obsChEventsLabel}
          className="max-h-[350px] lg:max-h-none lg:flex-1 lg:min-h-0 overflow-y-auto pr-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-cream/50 rounded-xl"
        >
          {items.map(({ e, text }) => (
            <li key={`${e.type}-${e.start}-${e.n}`} data-testid="event-item" className="grid grid-cols-[1.75rem_1fr] gap-3 py-3 border-b border-cream/10 last:border-0">
              <span aria-hidden="true" className="w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold text-white" style={{ background: TONE_BG[text.tone] }}>{e.n}</span>
              <div className="min-w-0 space-y-0.5">
                <p className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-sm font-semibold text-cream"><span className="sr-only">{e.n}. </span>{text.date}</span>
                  <span className="text-[11px] uppercase tracking-wide" style={{ color: TONE_BG[text.tone] }}>{text.kind}</span>
                </p>
                <p className="text-sm text-cream/90">{text.what}</p>
                <p className="text-xs text-cream/60">→ {text.effect}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
      {frost && <p className="text-xs text-cream/70 flex gap-2"><span aria-hidden="true">–</span><span data-testid="frost-line">{frost}</span></p>}
    </aside>
  )
}
