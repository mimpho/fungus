import { useId, useMemo, useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { getScoreBand } from '../../lib/scoreBands'
import { buildThermometer, fill } from '../../lib/thermometer'

// Same five bands and proportions as the score scale everywhere else (30/25/15/15/15)
const SEGMENTS = [
  { key: 'low', width: '30fr', tKey: 'malo' },
  { key: 'mid', width: '25fr', tKey: 'regular' },
  { key: 'ok', width: '15fr', tKey: 'bueno' },
  { key: 'good', width: '15fr', tKey: 'muyBueno' },
  { key: 'high', width: '15fr', tKey: 'excelente' },
]
const TEMPLATE = SEGMENTS.map(s => s.width).join(' ')

/** The loading state keeps the card's shape so the page does not jump when the answer arrives. */
export function ThermometerSkeleton() {
  const { t } = useApp()
  return (
    <div className="glass obs-card rounded-2xl p-5 space-y-4" aria-busy="true">
      <p className="text-sm text-cream/60 animate-pulse">{t.obsThLoading}</p>
      <div className="h-14 w-2/3 rounded-xl bg-white/10 animate-pulse" />
      <div className="h-5 w-full rounded-full bg-white/10 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[0, 1, 2].map(i => <div key={i} className="h-20 rounded-xl bg-white/10 animate-pulse" />)}
      </div>
    </div>
  )
}

/**
 * Thermometer of the observed point: the score with its band and a sentence that says why,
 * the facts behind it, the rains still on their way, what weighs for and against, and «Ver por
 * qué» with each factor and the formula. `snap` is the /point/snapshot answer.
 */
export function Thermometer({ snap, forName = null }) {
  const { t, lang } = useApp()
  const [open, setOpen] = useState(false)
  const headingId = useId()
  const detailId = useId()
  const vm = useMemo(() => buildThermometer(snap, t, lang), [snap, t, lang])
  const against = vm.conditions.filter(c => c.sign === '-')
  const forOnes = vm.conditions.filter(c => c.sign === '+')

  return (
    <article aria-labelledby={headingId} className="glass obs-card rounded-2xl p-5 space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 id={headingId} className="font-display text-2xl text-cream">{t.obsThTitle}</h3>
        {vm.day && <p className="text-xs text-cream/50">{fill(t.obsThDataDate, { fecha: vm.day }, lang)}</p>}
      </div>
      {forName && (
        <p data-testid="species-for" className="text-sm text-cream/80 -mt-3">{t.obsSpFor.replace('{name}', forName)}</p>
      )}

      <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
        <div className="flex items-end gap-3">
          <span data-testid="thermo-score" className={`font-display text-6xl font-bold leading-[0.8] ${vm.band.text}`}>{vm.score}</span>
          <span>
            <span data-testid="thermo-band" className="block font-display text-2xl font-bold leading-none text-cream">{vm.bandLabel}</span>
            <span className="block text-xs text-cream/50 mt-1">
              {t.obsThOutOf}
              {vm.v1 != null && ` · ${fill(t.obsThV1Short, { v1: vm.v1 }, lang)}`}
            </span>
          </span>
        </div>

        <div className="flex-1 min-w-[16rem] space-y-2" aria-hidden="true">
          <div className="relative grid gap-[3px] h-2.5" style={{ gridTemplateColumns: TEMPLATE }}>
            {SEGMENTS.map((s, i) => (
              <div
                key={s.key}
                className={`score-bar-${s.key} opacity-60 ${i === 0 ? 'rounded-l-full' : ''} ${i === SEGMENTS.length - 1 ? 'rounded-r-full' : ''}`}
              />
            ))}
            <div
              className="absolute -top-[5px] w-1 h-5 -ml-0.5 rounded bg-cream ring-2 ring-black/40"
              style={{ left: `${Math.min(100, Math.max(0, vm.score))}%` }}
            />
          </div>
          <div className="grid gap-[3px] text-[11px] text-cream/50" style={{ gridTemplateColumns: TEMPLATE }}>
            {SEGMENTS.map(s => (
              <span key={s.key} className={s.key === vm.band.key ? `${vm.band.text} font-semibold` : ''}>{t[s.tKey]}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p data-testid="thermo-phrase" className="text-lg leading-snug text-cream max-w-[62ch]">{vm.phrase}</p>
        {vm.explanation && <p className="text-sm text-cream/70 max-w-[62ch]">{vm.explanation}</p>}
      </div>

      {vm.tiles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(10.5rem,1fr))] gap-3">
          {vm.tiles.map(tile => (
            <div key={tile.key} className="rounded-xl glass-olive p-3">
              <p className="text-xs text-cream/60">{tile.label}</p>
              <p className="font-display text-3xl font-bold leading-tight text-cream">{tile.value}</p>
              {tile.sub && <p className="text-xs text-cream/60">{tile.sub}</p>}
            </div>
          ))}
        </div>
      )}

      {vm.pending && (
        <section className="rounded-xl glass-warm p-4 space-y-2" aria-label={t.obsThPendingTitle}>
          <p className="text-sm font-semibold text-cream">{t.obsThPendingTitle}</p>
          <ul className="space-y-1.5">
            {vm.pending.items.map(item => (
              <li key={item.key} className="grid grid-cols-[10px_minmax(0,1fr)] gap-x-2.5 text-sm text-cream/90">
                <span aria-hidden="true" className="w-2.5 h-2.5 rounded-full bg-sky-400 mt-1.5" />
                <span>
                  <b className="font-semibold">{item.when}</b> <span className="text-cream/60">· {item.mm}</span> → {item.effect}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-cream/60">{vm.pending.note}</p>
        </section>
      )}

      {vm.conditions.length > 0 && (
        <section className="space-y-2" aria-label={t.obsThCondTitle}>
          <h4 className="text-sm font-semibold text-cream">{t.obsThCondTitle}</h4>
          <ul className="space-y-2">
            {[...against, ...forOnes].map(c => (
              <li key={c.code} className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-x-2.5 text-sm">
                <span
                  aria-hidden="true"
                  className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${c.sign === '+' ? 'score-bar-good' : 'score-bar-low'}`}
                >
                  {c.sign === '+' ? '+' : '−'}
                </span>
                <span className="text-cream/90">
                  <span className="sr-only">{c.sign === '+' ? t.obsThCondPlus : t.obsThCondMinus}: </span>
                  {c.text}
                  {c.hint && <span className="block text-xs text-cream/55">{c.hint}</span>}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={detailId}
          onClick={() => setOpen(o => !o)}
          className="px-4 py-2 rounded-xl glass text-cream text-sm font-medium hover:[background-color:var(--ui-surface-hover)] transition-all"
        >
          {open ? t.obsThHideBtn : t.obsThWhyBtn}
        </button>

        {open && (
          <div id={detailId} className="mt-4 border-t border-white/[0.08] pt-4 space-y-1">
            {vm.factors.map(f => {
              const band = getScoreBand(f.score)
              return (
                <div key={f.key} className="grid grid-cols-[minmax(0,1fr)_3rem] sm:grid-cols-[minmax(8rem,12rem)_3rem_minmax(5rem,1fr)] items-center gap-x-4 gap-y-1 py-2">
                  <span className="text-sm font-medium text-cream">
                    {f.name} <span className="text-xs font-normal text-cream/50">{f.weight}</span>
                  </span>
                  <span className={`font-display text-2xl font-bold text-right ${band.text}`}>{f.score}</span>
                  <div className="col-span-2 sm:col-span-1 sm:row-start-1 sm:col-start-3 h-1.5 rounded-full bg-white/10 overflow-hidden" aria-hidden="true">
                    <div className={`h-full rounded-full ${band.bar}`} style={{ width: `${Math.min(100, Math.max(0, f.score))}%` }} />
                  </div>
                  <span className="col-span-2 sm:col-span-3 text-xs text-cream/60">{f.why}</span>
                </div>
              )
            })}
            <p data-testid="thermo-formula" className="text-xs text-cream/50 pt-2">{vm.formula}</p>
          </div>
        )}
      </div>
    </article>
  )
}
