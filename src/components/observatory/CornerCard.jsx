import { ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { useSpecies } from '../../hooks/useSpecies'
import { useSpeciesRows } from '../../hooks/useSpeciesRows'
import { kindMeta, pinSvg } from '../../lib/cornerKinds'
import { IC } from '../../lib/helpers'
import { BTN_SECONDARY } from './SavedPointParts'
import { CornerModals } from './CornerModals'
import { CornerPhotos } from './CornerPhotos'
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
 * its notes, the species it has (as cards), its photos and what can be done with it — edit and
 * remove, each in a dialog. Nothing if the zone is not saved.
 */
export function CornerCard({ point, saved, suggestedName, toponym = null, onRemoved, onOpenList }) {
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
  // The place's own name, shown under the corner's when the corner has another one
  const same = x => x && corner?.name?.trim().toLowerCase() === x.trim().toLowerCase()
  const place = toponym && !same(toponym.name) && !same(toponym.label) ? (toponym.label ?? toponym.name) : null

  if (!corner) return <CornerModals mode={mode} onClose={close} point={point} saved={saved} onRemoved={onRemoved} />

  return (
    <>
      <section aria-label={t.obsCornerSavedHere} data-testid="corner-card" className="rounded-2xl p-4 space-y-3 min-w-0 overflow-hidden bg-coffee/25 ring-2 ring-bar backdrop-blur-[16px]">
        {/* The kind and the link to the list on the first line; below, the pin beside the name and, when
            the name is not the place's own, the toponym */}
        <div className="space-y-2 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] uppercase tracking-[1.4px] font-medium text-coffee-light">
              {t[kindMeta(corner.kind).labelKey]}
            </p>
            {onOpenList && (
              <button
                type="button"
                onClick={onOpenList}
                aria-haspopup="dialog"
                className="shrink-0 inline-flex items-center gap-0.5 text-sm font-medium text-cream/80 hover:text-cream transition-colors"
              >
                {t.obsSavedListTitle}
                <ChevronRight size={16} strokeWidth={2.2} aria-hidden="true" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-3 min-w-0">
            <span aria-hidden="true" className="shrink-0 [&>svg]:w-[26px] [&>svg]:h-[33px]" dangerouslySetInnerHTML={{ __html: pinSvg(corner.kind) }} />
            <div className="min-w-0">
              <h3 data-testid="saved-badge" className="font-display text-xl font-semibold text-cream break-words">{corner.name}</h3>
              {place && <p data-testid="saved-place" className="text-sm text-cream break-words">{place}</p>}
            </div>
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

        {/* The species strip goes edge to edge: the card's padding is only the start position of the photos */}
        {species.length > 0 && (
          <ul className={`flex gap-2 overflow-x-auto pb-1.5 -mx-4 px-4 ${SCROLL_THIN}`} aria-label={t.obsCornerSpecies}>
            {species.map(r => (
              <li key={r.id} className="shrink-0 w-[150px]">
                <SpeciesCard row={r} onOpen={() => setViewing(r.id)} openLabel={t.obsCornerSpeciesOpen.replace('{name}', r.name)} />
              </li>
            ))}
          </ul>
        )}

        <CornerPhotos corner={corner} onChanged={() => saved.refresh(corner.id)} />
      </section>
      {viewing && (catalog ?? []).some(s => s.id === viewing) && (
        <SpeciesPreview species={catalog.find(s => s.id === viewing)} onClose={() => setViewing(null)} />
      )}
      <CornerModals mode={mode} onClose={close} point={point} saved={saved} suggestedName={suggestedName} onRemoved={onRemoved} />
    </>
  )
}
