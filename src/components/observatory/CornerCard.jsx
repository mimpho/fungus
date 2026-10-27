import { ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { useSpeciesRows } from '../../hooks/useSpeciesRows'
import { DEFAULT_KIND, kindMeta, pinSvg } from '../../lib/cornerKinds'
import { IC } from '../../lib/helpers'
import { BTN_PRIMARY } from './SavedPointParts'
import { CornerModals } from './CornerModals'
import { CornerPhotos } from './CornerPhotos'
import { SpeciesPills } from './SpeciesPills'
import { notesAreSpeciesNames } from './CornerSummary'

const ACTION_BTN = `${BTN_PRIMARY} inline-flex items-center gap-2`

/**
 * The saved corner of the observed zone, as one more card of the page: pin of its kind and name,
 * its notes, the species it has (as tag pills), its photos and a button to edit it (bottom right; the edit dialog is where it is removed). Nothing if the zone is not saved.
 */
export function CornerCard({ point, saved, suggestedName, toponym = null, onRemoved, onOpenList }) {
  const { t } = useApp()
  const [mode, setMode] = useState('idle')
  const rows = useSpeciesRows()
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
      <section aria-label={t.obsCornerSavedHere} data-testid="corner-card" className="rounded-2xl p-4 space-y-3 min-w-0 overflow-hidden bg-coffee/25 [[data-theme=light]_&]:bg-[var(--glass-white)] [[data-theme=light]_&_.glass]:!bg-bar/20 [[data-theme=light]_&_.glass]:hover:!bg-bar/30 ring-2 ring-bar backdrop-blur-[16px]">
        {/* The card's title and the link to the list on the first line; below, the pin beside the corner's name,
            its kind under it and, when the name is not the place's own, the toponym */}
        <div className="space-y-3 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-[27px] leading-tight text-cream">{t.obsCornerCardTitle}</h2>
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
            <span aria-hidden="true" className="shrink-0 [&>svg]:w-[26px] [&>svg]:h-[33px] [&>svg]:!filter-none" dangerouslySetInnerHTML={{ __html: pinSvg(corner.kind) }} />
            <div className="min-w-0">
              {corner.kind && corner.kind !== DEFAULT_KIND && (
                <p className="text-[11px] uppercase tracking-[1.4px] font-medium text-coffee-light">
                  {t[kindMeta(corner.kind).labelKey]}
                </p>
              )}
              <h3 data-testid="saved-badge" className="text-base font-semibold text-cream break-words">{corner.name}</h3>
              {place && <p data-testid="saved-place" className="text-sm text-cream/60 break-words">{place}</p>}
            </div>
          </div>
        </div>

        {corner.notes && !notesAreSpeciesNames(corner.notes, species.map(r => r.scientific)) && <p className="text-sm text-cream/75 whitespace-pre-line break-words">{corner.notes}</p>}

        <SpeciesPills ids={corner.species_ids} />

        <CornerPhotos corner={corner} onChanged={() => saved.refresh(corner.id)} />

        {/* At the bottom of the card, on the right; removing the corner is in the edit dialog */}
        <div className="flex justify-end pt-1">
          <button type="button" onClick={() => setMode('edit')} className={ACTION_BTN}>
            <span aria-hidden="true" className="[&>svg]:w-4 [&>svg]:h-4">{IC.pencil}</span>
            {t.obsSavedEdit}
          </button>
        </div>
      </section>
      <CornerModals mode={mode} setMode={setMode} onClose={close} point={point} saved={saved} suggestedName={suggestedName} onRemoved={onRemoved} />
    </>
  )
}
