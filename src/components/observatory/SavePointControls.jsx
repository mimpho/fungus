import { useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { buildChanges, buildCreate, formFromSaved } from '../../lib/savedPoints'
import { BTN_SECONDARY, RemoveConfirm, SavePointForm } from './SavedPointParts'

const EMPTY = { name: '', notes: '', forestTypes: [] }

/**
 * Save / edit / remove for one point, wherever it is shown (map panel, observed zone).
 * Not saved: «Guardar este punto» opens the form. Saved: its name, with «Editar» and «Quitar».
 */
export function SavePointControls({ point, suggestedName, saved, extra = null }) {
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
  }

  if (!existing) {
    if (mode === 'form') {
      return (
        <SavePointForm
          initial={EMPTY}
          suggestedName={suggestedName}
          submitLabel={t.obsSaveSubmit}
          onSubmit={create}
          onCancel={() => setMode('idle')}
        />
      )
    }
    const save = (
      <button type="button" onClick={() => setMode('form')} className={`${BTN_SECONDARY}${extra ? '' : ' w-full'}`}>
        {t.obsSaveButton}
      </button>
    )
    return extra ? <div className="flex flex-wrap gap-2">{save}{extra}</div> : save
  }

  if (mode === 'form') {
    return (
      <SavePointForm
        initial={formFromSaved(existing)}
        nameRequired
        submitLabel={t.obsSavedUpdate}
        onSubmit={edit}
        onCancel={() => setMode('idle')}
      />
    )
  }
  if (mode === 'confirm') {
    return <RemoveConfirm name={existing.name} onConfirm={remove} onCancel={() => setMode('idle')} />
  }
  return (
    <div className="space-y-2">
      <p data-testid="saved-badge" className="text-sm text-cream/90">
        <span aria-hidden="true">★ </span>{t.obsSavedBadge.replace('{name}', existing.name)}
      </p>
      {existing.notes && <p className="text-xs text-cream/60 whitespace-pre-line break-words">{existing.notes}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={() => setMode('form')} className={BTN_SECONDARY}>{t.obsSavedEdit}</button>
        <button type="button" onClick={() => setMode('confirm')} className={BTN_SECONDARY}>{t.obsSavedRemove}</button>
        {extra}
      </div>
    </div>
  )
}
