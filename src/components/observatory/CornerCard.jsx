import { useMemo, useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { useSpecies } from '../../hooks/useSpecies'
import { useSpeciesRows } from '../../hooks/useSpeciesRows'
import { kindMeta, pinSvg } from '../../lib/cornerKinds'
import { IC } from '../../lib/helpers'
import { BTN_SECONDARY } from './SavedPointParts'
import { CornerModals } from './CornerModals'
import { SpeciesCard } from './SpeciesCard'
import { SpeciesPreview } from './SpeciesPreview'
import { SCROLL_THIN, notesAreSpeciesNames } from './CornerSummary'

const ACTION_BTN = `${BTN_SECONDARY} inline-flex items-center gap-2`

/** A heart split along a crack, the two pieces a little apart: no such icon in the shared set. */
function BrokenHeart() {
  return (
    <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path transform="translate(-1.7 -0.6)" d="M12 7.636 10.682 6.318A4.5 4.5 0 0 0 4.318 6.318 4.5 4.5 0 0 0 4.318 12.682L12 20.364 11.2 16.6 12.9 13.4 10.9 11Z" />
      <path transform="translate(1.7 0.9)" d="M12 7.636 13.318 6.318A4.5 4.5 0 0 1 19.682 6.318 4.5 4.5 0 0 1 19.682 12.682L12 20.364 11.2 16.6 12.9 13.4 10.9 11Z" />
    </svg>
  )
}

/**
 * The saved corner of the observed zone, as one more card of the page: pin of its kind and name,
 * its notes, the species it has (as cards) and what can be done with it — edit and remove, each
 * in a dialog. Photos will join the species here. Nothing if the zone is not saved.
 */
export function CornerCard({ point, saved, suggestedName, onRemoved }) {
  const { t } = useApp()
  const [mode, setMode] = useState('idle')
  const rows = useSpeciesRows()
  const { species: catalog } = useSpecies()
  const [viewing, setViewing] = useState(null) // id of the species whose catalogue modal is open
  const corner = saved.find(point)
  const species = useMemo(() => {
    const byId = new Map(rows.map(r => [r.id, r]))
    return (corner?.species_ids ?? []).map(id => byId.get(id) ?? { id, name: id, scientific: '', photo: null })
  }, [rows, corner?.species_ids])
  const close = () => setMode('idle')

  if (!corner) return <CornerModals mode={mode} onClose={close} point={point} saved={saved} onRemoved={onRemoved} />

  return (
    <>
      <section aria-label={t.obsCornerSavedHere} data-testid="corner-card" className="glass rounded-2xl p-4 space-y-3 min-w-0">
        <div className="flex items-start gap-3 min-w-0">
          <span aria-hidden="true" className="shrink-0 mt-0.5 [&>svg]:w-[26px] [&>svg]:h-[33px]" dangerouslySetInnerHTML={{ __html: pinSvg(corner.kind) }} />
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[1.4px] font-medium text-coffee-light">
              {t[kindMeta(corner.kind).labelKey]}
            </p>
            <h3 data-testid="saved-badge" className="font-display text-xl font-semibold text-cream break-words">{corner.name}</h3>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setMode('edit')} className={ACTION_BTN}>
            <span aria-hidden="true" className="[&>svg]:w-4 [&>svg]:h-4">{IC.pencil}</span>
            {t.obsSavedEdit}
          </button>
          <button type="button" onClick={() => setMode('remove')} className={ACTION_BTN}>
            <BrokenHeart />
            {t.obsSavedRemove}
          </button>
        </div>

        {corner.notes && !notesAreSpeciesNames(corner.notes, species.map(r => r.scientific)) && <p className="text-sm text-cream/75 whitespace-pre-line break-words">{corner.notes}</p>}

        {species.length > 0 && (
          <ul className={`flex gap-2 overflow-x-auto pb-1.5 ${SCROLL_THIN}`} aria-label={t.obsCornerSpecies}>
            {species.map(r => (
              <li key={r.id} className="shrink-0 w-[150px]">
                <SpeciesCard row={r} onOpen={() => setViewing(r.id)} openLabel={t.obsCornerSpeciesOpen.replace('{name}', r.name)} />
              </li>
            ))}
          </ul>
        )}
      </section>
      {viewing && (catalog ?? []).some(s => s.id === viewing) && (
        <SpeciesPreview species={catalog.find(s => s.id === viewing)} onClose={() => setViewing(null)} />
      )}
      <CornerModals mode={mode} onClose={close} point={point} saved={saved} suggestedName={suggestedName} onRemoved={onRemoved} />
    </>
  )
}
