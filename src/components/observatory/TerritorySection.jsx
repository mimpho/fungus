import { useApp } from '../../contexts/AppContext'
import { ZoneRanking } from './ZoneRanking'

/**
 * «Área de territorio»: where to go this weekend (today only the zone ranking; the map with data
 * layers will join it, see memory/product-ideas.md). It runs on its own — it does not depend on the
 * map search — and centres on the active (observed) zone when there is one.
 */
export function TerritorySection({ active, onObserve }) {
  const { t } = useApp()
  const here = active ? { lat: active.lat, lon: active.lon, name: active.name ?? null } : null

  return (
    <section aria-labelledby="obs-terr-title" className="space-y-5 border-t border-cream/10 pt-7">
      <div className="space-y-1">
        <p className="text-[11px] uppercase tracking-[1.4px] font-medium text-coffee-light">{t.obsTerEyebrow}</p>
        <h2 id="obs-terr-title" className="font-display text-[34px] leading-tight text-cream">{t.obsTerTitle}</h2>
        <p className="text-[13px] text-cream/60">{t.obsTerSub}</p>
      </div>
      <ZoneRanking here={here} onObserve={onObserve} />
    </section>
  )
}
