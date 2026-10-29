import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../../contexts/AppContext'
import { IC } from '../../lib/helpers'
import { withPoint } from '../../lib/observatoryView'
import { DEFAULT_KIND, kindMeta, pinSvg } from '../../lib/cornerKinds'
import { ObsModal } from '../observatory/ObsModal'
import { ObservatoryNotice } from '../observatory/ObservatoryNotice'
import { SavedPointsList } from '../observatory/SavedPoints'

const PREVIEW = 3

/** Where a corner opens: the Observatory, whose view lives in the URL. */
const observatoryHref = sp => `/observatorio?${withPoint(new URLSearchParams(), sp).toString()}`

/**
 * «Mis rincones» in the «Siguiendo» tab of the profile: the count, the three latest corners and a
 * link that opens the same dialog as the Observatory's (search, filters, order). Picking a corner,
 * in the preview or in the dialog, goes to the Observatory to observe it; editing happens there.
 */
export function ProfileCorners({ saved }) {
  const { t } = useApp()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const count = saved.points.length
  const latest = useMemo(
    () => [...saved.points].sort((a, b) => (Date.parse(b.created_at) || 0) - (Date.parse(a.created_at) || 0)).slice(0, PREVIEW),
    [saved.points],
  )
  const go = sp => { setOpen(false); navigate(observatoryHref(sp)) }

  return (
    <section className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-cream flex items-center gap-2">
          <span aria-hidden="true" className="[&>svg]:w-[18px] [&>svg]:h-[18px]">{IC.heart(true)}</span>
          {t.obsSavedListTitle}
          {saved.status === 'ready' && <span className="text-cream/40 text-sm font-normal">({count})</span>}
        </h3>
        {count > 0 && (
          <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" className="text-xs text-cream/50 hover:text-cream transition-colors">
            {t.verTodas ?? 'Ver todas →'}
          </button>
        )}
      </div>

      {saved.status === 'loading' && <p className="text-cream/40 text-sm animate-pulse">{t.obsSavedLoading}</p>}
      {saved.status === 'error' && <ObservatoryNotice error={saved.error} onRetry={saved.reload} />}
      {saved.status === 'ready' && count === 0 && (
        <p className="text-cream/40 text-sm">
          {t.profileCornersEmpty}{' '}
          <Link to="/observatorio" className="text-cream/70 hover:text-cream underline underline-offset-2">{t.profileCornersGo}</Link>
        </p>
      )}
      {latest.length > 0 && (
        <div className="space-y-2">
          {latest.map(sp => (
            <button key={sp.id} type="button" onClick={() => go(sp)} className="w-full flex items-center gap-3 p-3 rounded-xl surface-hover text-left">
              <span aria-hidden="true" className="shrink-0 [&>svg]:w-4 [&>svg]:h-5" dangerouslySetInnerHTML={{ __html: pinSvg(sp.kind) }} />
              <div className="min-w-0">
                <p className="font-display text-base font-semibold text-cream truncate">{sp.name}</p>
                {sp.kind !== DEFAULT_KIND && <p className="text-cream/50 text-xs">{t[kindMeta(sp.kind).labelKey]}</p>}
              </div>
              <span className="ml-auto text-cream/30 flex-shrink-0">{IC.chevron()}</span>
            </button>
          ))}
          {count > PREVIEW && (
            <button type="button" onClick={() => setOpen(true)} className="block w-full text-center text-xs text-cream/40 hover:text-cream pt-1 transition-colors">
              +{count - PREVIEW} {t.mas ?? 'más'}
            </button>
          )}
        </div>
      )}

      {open && (
        <ObsModal title={t.obsSavedListTitle} onClose={() => setOpen(false)} wide sheet>
          <SavedPointsList saved={saved} observed={null} onSelect={go} />
        </ObsModal>
      )}
    </section>
  )
}
