import { useApp } from '../../contexts/AppContext'
import { IC } from '../../lib/helpers'
import { usePointData } from '../../hooks/usePointData'
import { fetchPointSnapshot } from '../../services/observatoryService'
import { formatNumber } from '../../lib/thermometer'
import { getScoreBand } from '../../lib/scoreBands'
import { formatCoords, samePoint } from '../../lib/observatoryView'
import { sortSaved } from '../../lib/savedPoints'
import { kindMeta, pinSvg } from '../../lib/cornerKinds'
import { ObservatoryNotice } from './ObservatoryNotice'

/** The card's score bar: the same look as the zone card's, from the point's own snapshot. */
function CardMeter({ point }) {
  const { t, lang } = useApp()
  const snap = usePointData(fetchPointSnapshot, point)

  if (snap.status === 'loading') {
    return (
      <div aria-hidden="true" className="space-y-2 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-3 w-28 bg-white/10 rounded" />
          <div className="h-3 w-14 bg-white/10 rounded" />
        </div>
        <div className="progress-bar"><div className="progress-fill bg-white/10" style={{ width: '0%' }} /></div>
        <div className="h-3 w-40 bg-white/10 rounded" />
      </div>
    )
  }
  // The card is still useful without its score: say so quietly instead of an error box per card
  if (snap.status === 'error' || !Number.isFinite(snap.data?.score)) {
    return <p className="text-xs text-cream/60">{t.obsSavedNoScore}</p>
  }

  const score = snap.data.score
  const band = getScoreBand(score)
  const k = snap.data.key_facts ?? {}
  return (
    <>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-cream/70 text-xs">{t.condRecoleccion}</span>
        <span data-testid="saved-score" className={`text-xs font-semibold ${band.text}`}>{score} · {t[band.obsKey]}</span>
      </div>
      <div className="progress-bar" aria-hidden="true">
        <div className={`progress-fill ${band.bar}`} style={{ width: `${Math.min(100, Math.max(0, score))}%` }} />
      </div>
      <div className="flex gap-1.5 mt-1.5 text-cream/60 text-xs flex-wrap">
        {k.last_night_min_c != null && (
          <span className="flex items-center gap-1" title={t.obsSavedNightMin}>
            <img src="/assets/images/icons/temperature.png" alt="" height="16" width="16" />
            {formatNumber(k.last_night_min_c, lang)} °C
          </span>
        )}
        {k.last_night_min_c != null && k.soil_water_mm != null && <span aria-hidden="true">·</span>}
        {k.soil_water_mm != null && (
          <span className="flex items-center gap-1" title={t.obsSavedSoilWater}>
            <img src="/assets/images/icons/soil-moisture.png" alt="" height="16" width="16" />
            {formatNumber(k.soil_water_mm, lang, 0)} mm
          </span>
        )}
      </div>
    </>
  )
}

/**
 * One saved point as a card like the zones page's: name, altitude and the score bar. The whole
 * card observes the point (the name is the button, stretched over the card). Editing and removing happen once the point is observed.
 */
function Card({ sp, observed, onObserve }) {
  const { t } = useApp()
  const isObserved = samePoint(observed, sp)
  // The toponym is not stored any more: it shows when the corner is observed. The list has the coordinates.
  const label = formatCoords(sp)

  return (
    <li
      data-testid="saved-item"
      className={`glass rounded-2xl hover-lift overflow-hidden relative focus-within:ring-2 focus-within:ring-cream/50 ${isObserved ? 'ring-2 ring-bar' : ''}`}
    >
      <div className="p-5">
        <div className="mb-3">
          <h3 className="font-display text-xl font-semibold text-cream truncate">
            <button
              type="button"
              onClick={() => onObserve(sp)}
              aria-current={isObserved ? 'true' : undefined}
              className="max-w-full truncate text-left outline-none after:absolute after:inset-0 after:content-[''] cursor-pointer"
            >
              {sp.name}
            </button>
          </h3>
          <p className="text-muted text-xs mt-0.5 truncate">{isObserved ? t.obsPointObserving : label}</p>
        </div>

        <div className="relative z-[1] pointer-events-none">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-cream/70 mb-4">
            <span className="flex items-center gap-1.5" data-testid="saved-kind">
              <span aria-hidden="true" className="[&>svg]:w-3.5 [&>svg]:h-[18px]" dangerouslySetInnerHTML={{ __html: pinSvg(sp.kind) }} />
              {t[kindMeta(sp.kind).labelKey]}
            </span>
            {sp.species_ids?.length > 0 && <span>{t.obsCornerCount.replace('{n}', sp.species_ids.length)}</span>}
            {Number.isFinite(sp.elevation_m) && (
              <span className="flex items-center gap-1.5">
                <img src="/assets/images/icons/mountain.png" alt="" height="16" width="16" />
                {Math.round(sp.elevation_m)} m
              </span>
            )}
          </div>
          <CardMeter point={sp} />
          {sp.notes && <p className="mt-2 text-xs text-cream/60 line-clamp-2 break-words">{sp.notes}</p>}
        </div>

      </div>
    </li>
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
      className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl glass text-cream text-base font-medium hover:[background-color:var(--ui-surface-hover)] transition-all"
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
 * The saved points as cards, in a panel over the map or the observed zone when «Zonas observadas» is open.
 * The cards (and their snapshots) are only mounted while it is open.
 */
export function SavedPointsList({ saved, observed, onObserve, open }) {
  const { t, lang } = useApp()
  const points = sortSaved(saved.points, lang)

  return (
    <div id="obs-saved-list" hidden={!open} role="region" aria-label={t.obsSavedListTitle} className="space-y-3">
      {open && (
        <>
          {saved.status === 'loading' && <p className="text-sm text-cream/60 animate-pulse px-1">{t.obsSavedLoading}</p>}
          {saved.status === 'error' && <ObservatoryNotice error={saved.error} onRetry={saved.reload} />}
          {saved.status === 'ready' && points.length === 0 && (
            <p className="text-sm text-cream/60 px-1">{t.obsSavedEmpty}</p>
          )}
          {points.length > 0 && (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {points.map(sp => <Card key={sp.id} sp={sp} observed={observed} onObserve={onObserve} />)}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
