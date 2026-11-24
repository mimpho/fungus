import { useId, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { eventText, frostLine } from '../../lib/chartData'
import { fill } from '../../lib/thermometer'

const TONE_BG = { trigger: '#4a7c59', brake: '#c98a40' }

/**
 * «Detonantes y frenos» of the chart window, at the foot of the chart's card: a button that says how many there are
 * («5 detonantes · 2 frenos») and unfolds the same numbered events as the circles on the chart, each with what happened and
 * what it is expected to do, and, at its end, the coldest night of the period. The list is at most 450 px high and scrolls inside.
 * With none, there is nothing to unfold: the line says so.
 */
export function EventsList({ vm }) {
  const { t, lang } = useApp()
  const uid = useId()
  const [open, setOpen] = useState(false)
  const items = vm.events.map(e => ({ e, text: eventText(e, t, lang) })).filter(x => x.text)
  const frost = frostLine(vm.lowest, t, lang)
  const triggers = items.filter(x => x.text.tone === 'trigger').length
  const brakes = items.length - triggers
  const parts = []
  if (triggers) parts.push(fill(triggers === 1 ? t.obsChEvTriggerOne : t.obsChEvTriggerMany, { n: triggers }, lang))
  if (brakes) parts.push(fill(brakes === 1 ? t.obsChEvBrakeOne : t.obsChEvBrakeMany, { n: brakes }, lang))

  return (
    <section aria-label={t.obsChEvents} className="border-t border-cream/10 pt-3">
      {items.length === 0 ? (
        <div className="space-y-1">
          <p className="text-sm text-cream/70">
            <span className="font-semibold text-cream">{t.obsChEvents}</span> · {t.obsChNoEvents}
          </p>
          {frost && <p data-testid="frost-line" className="text-xs text-cream/70">{frost}</p>}
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            aria-expanded={open}
            aria-controls={`${uid}-list`}
            data-testid="events-toggle"
            className="w-full flex items-center justify-between gap-3 min-h-[44px] -my-1 text-left rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-cream/50"
          >
            <span className="min-w-0">
              <span className="block font-display text-xl leading-tight text-cream">{t.obsChEvents}</span>
              <span className="block text-xs text-cream/70">{parts.join(' · ')}</span>
            </span>
            <ChevronDown size={20} aria-hidden="true" className={`shrink-0 text-cream/80 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
          <div id={`${uid}-list`} hidden={!open} className="mt-2 space-y-2">
            <p className="text-xs text-cream/60">{t.obsChEventsSub}</p>
            <ol
              data-testid="events-list"
              tabIndex={0}
              aria-label={t.obsChEventsLabel}
              className="max-h-[450px] overflow-y-auto pr-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-cream/50 rounded-xl"
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
            {frost && <p data-testid="frost-line" className="text-xs text-cream/70">{frost}</p>}
          </div>
        </>
      )}
    </section>
  )
}
