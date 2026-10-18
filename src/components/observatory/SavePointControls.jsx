import { useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { buildChanges, buildCreate, formFromSaved } from '../../lib/savedPoints'
import { BTN_SECONDARY, RemoveConfirm, SavePointForm } from './SavedPointParts'
import { ObsModal } from './ObsModal'
import { IC } from '../../lib/helpers'

const EMPTY = { name: '', notes: '', forestTypes: [] }
// The zone header's actions: bigger than the usual secondary button, icon on the left
const ACTION_BTN = `${BTN_SECONDARY} !px-6 !py-3 !text-base inline-flex items-center gap-2.5`

/** A heart split along a crack, the two pieces a little apart: no such icon in the shared set. */
function BrokenHeart() {
  return (
    <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path transform="translate(-1.7 -0.6)" d="M12 7.636 10.682 6.318A4.5 4.5 0 0 0 4.318 6.318 4.5 4.5 0 0 0 4.318 12.682L12 20.364 11.2 16.6 12.9 13.4 10.9 11Z" />
      <path transform="translate(1.7 0.9)" d="M12 7.636 13.318 6.318A4.5 4.5 0 0 1 19.682 6.318 4.5 4.5 0 0 1 19.682 12.682L12 20.364 11.2 16.6 12.9 13.4 10.9 11Z" />
    </svg>
  )
}

/**
 * The observed zone's header: `lead` (title and facts) on the left and, at the bottom right, what
 * can be done with the zone. Not saved: «Guardar esta zona» opens the form in a modal. Saved: its
 * name and notes under `lead`, with «Editar» and «Eliminar zona» (the form and the confirmation
 * are modals too).
 */
export function SavePointControls({ point, suggestedName, saved, lead, onRemoved }) {
  const { t } = useApp()
  const [mode, setMode] = useState('idle') // idle | form | confirm
  const existing = saved.find(point)

  async function create(form) {
    await saved.add(buildCreate(point, form))
    setMode('idle')
  }

  async function edit(form) {
    const changes = buildChanges(existing, form)
    if (Object.keys(changes).length) await saved.update(existing.id, changes)
    setMode('idle')
  }

  async function remove() {
    await saved.remove(existing.id)
    setMode('idle')
    onRemoved?.()
  }

  const close = () => setMode('idle')

  let modal = null
  if (mode === 'form' && !existing) {
    modal = (
      <ObsModal title={t.obsSaveZoneTitle} onClose={close}>
        <SavePointForm
          initial={EMPTY}
          suggestedName={suggestedName}
          submitLabel={t.obsSaveSubmit}
          onSubmit={create}
          onCancel={close}
        />
      </ObsModal>
    )
  } else if (mode === 'form') {
    modal = (
      <ObsModal title={t.obsSavedEditTitle} onClose={close}>
        <SavePointForm
          initial={formFromSaved(existing)}
          nameRequired
          submitLabel={t.obsSavedUpdate}
          onSubmit={edit}
          onCancel={close}
        />
      </ObsModal>
    )
  } else if (mode === 'confirm' && existing) {
    modal = (
      <ObsModal title={t.obsSavedRemove} onClose={close}>
        <RemoveConfirm name={existing.name} onConfirm={remove} onCancel={close} />
      </ObsModal>
    )
  }

  return (
      <>
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div className="min-w-0 flex-1 basis-[18rem]">
            {lead}
            {existing && (
              <div className="mt-2 space-y-1">
                <p data-testid="saved-badge" className="text-sm text-cream/90">
                  <span aria-hidden="true" className="inline-block align-[-2px] mr-1 [&>svg]:w-4 [&>svg]:h-4">{IC.heart(true)}</span>{t.obsSavedBadge.replace('{name}', existing.name)}
                </p>
                {existing.notes && <p className="text-xs text-cream/60 whitespace-pre-line break-words">{existing.notes}</p>}
              </div>
            )}
          </div>
          <div className="flex gap-2 ml-auto">
            {existing ? (
              <>
                <button type="button" onClick={() => setMode('form')} className={ACTION_BTN}>
                  <span aria-hidden="true" className="[&>svg]:w-5 [&>svg]:h-5">{IC.pencil}</span>
                  {t.obsSavedEdit}
                </button>
                <button type="button" onClick={() => setMode('confirm')} className={ACTION_BTN}>
                  <BrokenHeart />
                  {t.obsSavedRemove}
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setMode('form')} className={ACTION_BTN}>
                <span aria-hidden="true" className="[&>svg]:w-5 [&>svg]:h-5">{IC.heart(false)}</span>
                {t.obsSaveZoneButton}
              </button>
            )}
          </div>
        </div>
        {modal}
      </>
  )
}
