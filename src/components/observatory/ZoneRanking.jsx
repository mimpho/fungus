import { useMemo, useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { useZones } from '../../hooks/useZones'
import { IC } from '../../lib/helpers'
import { getScoreBand } from '../../lib/scoreBands'
import { CATALONIA_CENTER, buildRanking } from '../../lib/territoryData'

const NEAR_LIMIT = 20
const FACTOR_KEY = {
  activation: 'obsRankFactorActivation',
  moisture: 'obsRankFactorMoisture',
  temperature: 'obsRankFactorTemperature',
  drying: 'obsRankFactorDrying',
}

/** Ranking of catalogue zones: the 20 closest to the active zone, or the ones the user follows. */
export function ZoneRanking({ here, onObserve }) {
  const { t, lang, followedZones } = useApp()
  const { zones, conditionsMap, loading } = useZones()
  const [mode, setMode] = useState('near')
  const ref = here ?? CATALONIA_CENTER
  const followedIds = useMemo(() => new Set(followedZones.map(z => z.id)), [followedZones])
  const km = new Intl.NumberFormat(lang, { maximumFractionDigits: 0 })

  const near = useMemo(
    () => buildRanking({ zones, conditions: conditionsMap, ref, mode: 'near', followedIds, limit: NEAR_LIMIT }),
    [zones, conditionsMap, ref.lat, ref.lon, followedIds], // eslint-disable-line react-hooks/exhaustive-deps
  )
  const followed = useMemo(
    () => buildRanking({ zones, conditions: conditionsMap, ref, mode: 'followed', followedIds }),
    [zones, conditionsMap, ref.lat, ref.lon, followedIds], // eslint-disable-line react-hooks/exhaustive-deps
  )
  const rows = mode === 'near' ? near : followed
  const sub = mode === 'followed'
    ? t.obsRankSubFollowed
    : here ? t.obsRankSubNear : t.obsRankSubNearNone

  return (
    <article aria-label={t.obsRankTitle} className="glass obs-card rounded-2xl p-5 sm:p-6 space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2.5">
        <div className="min-w-0">
          <h3 className="font-display text-[22px] text-cream">{t.obsRankTitle}</h3>
          <p className="text-[12.5px] text-cream/60">{sub}</p>
        </div>
        <div role="group" aria-label={t.obsRankGroup} className="inline-flex rounded-xl bg-cream/[0.08] p-0.5">
          {[
            ['near', t.obsRankNear.replace('{n}', near.length)],
            ['followed', t.obsRankFollowed.replace('{n}', followed.length)],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={mode === id}
              onClick={() => setMode(id)}
              className={`rounded-[10px] px-3.5 py-1.5 text-sm transition-colors ${mode === id ? 'bg-bar text-white font-medium' : 'text-cream/80 hover:text-cream'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading && <div aria-hidden="true" className="h-40 rounded-xl bg-cream/[0.05] animate-pulse" />}
      {!loading && rows.length === 0 && (
        <p role="note" className="text-sm text-cream/70">{mode === 'followed' ? t.obsRankEmptyFollowed : t.obsRankEmpty}</p>
      )}
      {!loading && rows.length > 0 && (
        <ol className="flex flex-col">
          {rows.map((r, i) => {
            const band = getScoreBand(r.c.overallScore)
            const factor = r.c.limitingFactor && FACTOR_KEY[r.c.limitingFactor] ? t[FACTOR_KEY[r.c.limitingFactor]] : null
            const parts = []
            if (r.c.rainfall14d != null) parts.push(t.obsRankRain.replace('{mm}', r.c.rainfall14d))
            if (factor) parts.push(t.obsRankLimit.replace('{factor}', factor))
            const isHere = here && r.km < 1
            return (
              <li key={r.zone.id} className="grid grid-cols-[26px_46px_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 rounded-[10px] px-2.5 py-2.5 border-b border-cream/10 last:border-b-0">
                <span className="text-xs text-cream/50 text-right">{i + 1}</span>
                <span className={`font-display text-[26px] font-bold leading-none ${band.text}`}>{Math.round(r.c.overallScore)}</span>
                <span className="flex flex-col min-w-0">
                  <span className="text-[14.5px] font-medium text-cream flex flex-wrap items-center gap-1.5">
                    {r.zone.name}
                    {followedIds.has(r.zone.id) && (
                      <span role="img" aria-label={t.obsRankFollowedLabel} className="text-coffee-light inline-flex">{IC.heart(true)}</span>
                    )}
                  </span>
                  {parts.length > 0 && <span className="text-[12.5px] text-cream/60">{parts.join(' · ')}</span>}
                  <button
                    type="button"
                    onClick={() => onObserve({ lat: r.zone.lat, lon: r.zone.lng })}
                    className="self-start mt-1 py-1 text-[12.5px] font-semibold text-coffee-light underline cursor-pointer"
                  >
                    {t.obsRankObserve}
                  </button>
                </span>
                <span className="text-xs text-cream/50 text-right whitespace-nowrap">
                  {[r.zone.region, r.zone.elevation != null ? `${r.zone.elevation} m` : null, isHere ? t.obsRankHere : `${km.format(r.km)} km`].filter(Boolean).join(' · ')}
                </span>
              </li>
            )
          })}
        </ol>
      )}

      <p className="text-[11.5px] text-cream/50">{t.obsRankNote}</p>
    </article>
  )
}
