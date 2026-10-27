import { useApp } from '../../contexts/AppContext'
import { buildChanges, buildCreate, formFromSaved } from '../../lib/savedPoints'
import { DEFAULT_KIND } from '../../lib/cornerKinds'
import { RemoveConfirm, SavePointForm } from './SavedPointParts'
import { ObsModal } from './ObsModal'
import { CornerPhotos } from './CornerPhotos'

const EMPTY = { name: '', notes: '', kind: DEFAULT_KIND, species_ids: [] }

/**
 * The three dialogs of a corner: `mode` is 'create' (the point is not saved), 'edit' or 'remove'
 * (it is), anything else shows nothing. The caller owns `mode` so that any button can open them
 * (the zone's header and card, the map's point panel). Each form is keyed by what it edits, so
 * it can never start from another corner's values.
 */
export function CornerModals({ mode, onClose, point, saved, suggestedName, onRemoved }) {
  const { t } = useApp()
  const existing = saved.find(point)

  async function create(form) {
    await saved.add(buildCreate(point, form))
    onClose()
  }

  async function edit(form) {
    const changes = buildChanges(existing, form)
    if (Object.keys(changes).length) await saved.update(existing.id, changes)
    onClose()
  }

  async function remove() {
    await saved.remove(existing.id)
    onClose()
    onRemoved?.()
  }

  if (mode === 'create' && !existing) {
    return (
      <ObsModal title={t.obsSaveZoneTitle} onClose={onClose} size="lg" sheet>
        <SavePointForm
          key="new"
          photos={(
            <div>
              <span className="block text-xs font-medium text-cream/70 mb-2">{t.obsPhotos}</span>
              <p className="text-xs text-cream/60">{t.obsPhotoAfterSave}</p>
            </div>
          )}
          initial={EMPTY}
          suggestedName={suggestedName}
          submitLabel={t.obsSaveSubmit}
          onSubmit={create}
          onCancel={onClose}
        />
      </ObsModal>
    )
  }
  if (mode === 'edit' && existing) {
    return (
      <ObsModal title={t.obsSavedEditTitle} onClose={onClose} size="lg" sheet>
        <SavePointForm
          key={`edit-${existing.id}`}
          // Photos act at once (upload, tag, delete), not with «Guardar cambios»: a section of the form between the species and the notes
          photos={<CornerPhotos variant="form" key={`photos-${existing.id}`} corner={existing} onChanged={() => saved.refresh(existing.id)} />}
          initial={formFromSaved(existing)}
          cornerSpecies={existing.species_ids}
          suggestedName={suggestedName}
          submitLabel={t.obsSavedUpdate}
          onSubmit={edit}
          onCancel={onClose}
        />
      </ObsModal>
    )
  }
  if (mode === 'remove' && existing) {
    return (
      <ObsModal title={t.obsSavedRemove} onClose={onClose}>
        <RemoveConfirm name={existing.name} onConfirm={remove} onCancel={onClose} />
      </ObsModal>
    )
  }
  return null
}
