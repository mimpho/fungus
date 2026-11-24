import { useApp } from '../../../contexts/AppContext'
import { monthsText } from '../../../lib/speciesList'

const LOCALES = { es: 'es-ES', ca: 'ca-ES', en: 'en-GB' }

/** Twelve months, the fruiting ones filled, the current one underlined. The months in words follow the title, for everyone (and screen readers). */
export function SeasonStrip({ months }) {
  const { t, lang } = useApp()
  const set = new Set(months ?? [])
  const now = new Date().getMonth() + 1
  const initial = m => new Date(2026, m - 1, 15).toLocaleDateString(LOCALES[lang] ?? LOCALES.es, { month: 'narrow' }).toUpperCase()
  const text = monthsText(months, lang)
  return (
    <div>
      <p className="flex items-baseline gap-2 mb-1">
        <span className="text-[11px] font-semibold uppercase tracking-[1.2px] text-cream">{t.obsSpSheetSeason}</span>
        <span className="text-[12px] text-cream">{text || t.obsSpSheetNoSeason}</span>
      </p>
      <div className="flex gap-[2px]" aria-hidden="true">
        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
          <span
            key={m}
            className={`flex-1 h-[22px] rounded-[4px] flex items-center justify-center text-[11px] font-medium ${set.has(m) ? 'bg-white text-[var(--nav-active)] [[data-theme=light]_&]:bg-[var(--nav-active)] [[data-theme=light]_&]:text-white font-bold' : 'bg-black/20 [[data-theme=light]_&]:bg-black/[0.07] text-cream'} ${m === now ? 'underline underline-offset-2' : ''}`}
          >{initial(m)}</span>
        ))}
      </div>
    </div>
  )
}
