import { useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { formatCoords, samePoint } from '../../lib/observatoryView'
import { buildChanges, formFromSaved, sortSaved } from '../../lib/savedPoints'
import { ObservatoryNotice } from './ObservatoryNotice'
import { BTN_SECONDARY, RemoveConfirm, SavePointForm } from './SavedPointParts'

const TYPE_KEY = {
  pinar: 'obsFtPinar',
  hayedo: 'obsFtHayedo',
  robledal: 'obsFtRobledal',
  encinar: 'obsFtEncinar',
}

function Item({ sp, observed, saved, onObserve }) {
  const { t } = useApp()
  const [mode, setMode] = useState('idle') // idle | form | confirm
  const isObserved = samePoint(observed, sp)

  async function edit(form) {
    const changes = buildChanges(sp, form)
    if (Object.keys(changes).length) await saved.update(sp.id, changes)
    setMode('idle')
  }

  return (
    <li data-testid="saved-item" className="glass obs-card rounded-2xl p-4 space-y-2">
      {mode === 'form' ? (
        <SavePointForm
          initial={formFromSaved(sp)}
          nameRequired
          submitLabel={t.obsSavedUpdate}
          onSubmit={edit}
          onCancel={() => setMode('idle')}
        />
      ) : (
        <>
          <div>
            <p className="font-display text-lg text-cream leading-tight break-words">{sp.name}</p>
            <p className="text-xs text-cream/60 mt-0.5">
              {[
                Number.isFinite(sp.elevation_m) ? `${Math.round(sp.elevation_m)} m` : null,
                formatCoords(sp),
              ].filter(Boolean).join(' · ')}
            </p>
          </div>
          {sp.forest_types?.length > 0 && (
            <ul className="flex flex-wrap gap-1.5" aria-label={t.obsSaveForest}>
              {sp.forest_types.map(type => (
                <li key={type} className="px-2.5 py-0.5 rounded-full text-xs bg-white/10 text-cream/80">{t[TYPE_KEY[type]] ?? type}</li>
              ))}
            </ul>
          )}
          {sp.notes && <p className="text-sm text-cream/70 whitespace-pre-line break-words">{sp.notes}</p>}
          {mode === 'confirm' ? (
            <RemoveConfirm name={sp.name} onConfirm={() => saved.remove(sp.id)} onCancel={() => setMode('idle')} />
          ) : (
            <div className="flex flex-wrap gap-2 pt-1">
              <button type="button" onClick={() => onObserve(sp)} disabled={isObserved} className={BTN_SECONDARY}>
                {isObserved ? t.obsPointObserving : t.obsSavedObserve}
              </button>
              <button type="button" onClick={() => setMode('form')} className={BTN_SECONDARY}>{t.obsSavedEdit}</button>
              <button type="button" onClick={() => setMode('confirm')} className={BTN_SECONDARY}>{t.obsSavedRemove}</button>
            </div>
          )}
        </>
      )}
    </li>
  )
}

/** Button that shows or hides the list of saved points. It sits beside the point's own actions. */
export function SavedPointsToggle({ saved, open, onToggle }) {
  const { t } = useApp()
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls="obs-saved-list"
      className={`${BTN_SECONDARY} inline-flex items-center gap-2`}
    >
      <span aria-hidden="true">★</span>
      <span>
        {t.obsSavedListTitle}
        {saved.status === 'ready' && <span data-testid="saved-count" className="text-cream/60"> ({saved.points.length})</span>}
      </span>
      <span aria-hidden="true" className="text-cream/60">{open ? '▾' : '▸'}</span>
    </button>
  )
}

/** «Mis puntos»: the user's saved points as cards, shown below the toggle when it is open. */
export function SavedPointsList({ saved, observed, onObserve, open }) {
  const { t, lang } = useApp()
  const points = sortSaved(saved.points, lang)

  return (
    <div id="obs-saved-list" hidden={!open} role="region" aria-label={t.obsSavedListTitle} className="space-y-3">
      {saved.status === 'loading' && <p className="text-sm text-cream/60 animate-pulse px-1">{t.obsSavedLoading}</p>}
      {saved.status === 'error' && <ObservatoryNotice error={saved.error} onRetry={saved.reload} />}
      {saved.status === 'ready' && points.length === 0 && (
        <p className="text-sm text-cream/60 px-1">{t.obsSavedEmpty}</p>
      )}
      {points.length > 0 && (
        <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {points.map(sp => (
            <Item key={sp.id} sp={sp} observed={observed} saved={saved} onObserve={onObserve} />
          ))}
        </ul>
      )}
    </div>
  )
}
