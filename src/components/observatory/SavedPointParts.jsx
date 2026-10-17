import { useEffect, useId, useRef, useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { FOREST_TYPES, NAME_MAX, NOTES_MAX, conflictKind } from '../../lib/savedPoints'
import { ObservatoryNotice } from './ObservatoryNotice'

const TYPE_KEY = {
  pinar: 'obsFtPinar',
  hayedo: 'obsFtHayedo',
  robledal: 'obsFtRobledal',
  encinar: 'obsFtEncinar',
}

const BTN_PRIMARY = 'px-4 py-2 rounded-xl bg-bar hover:bg-[#a0834d] disabled:opacity-60 disabled:hover:bg-bar text-white text-sm font-medium transition-all'
export const BTN_SECONDARY = 'px-4 py-2 rounded-xl glass text-cream text-sm font-medium hover:[background-color:var(--ui-surface-hover)] disabled:opacity-60 transition-all'
const FIELD = 'w-full rounded-xl bg-cream/[0.06] border border-cream/30 px-3 py-2 text-base md:text-sm text-cream placeholder:text-cream/40 focus:outline-none focus:border-cream/50'

/** Why a save, change or removal failed: 409 has two meanings, the rest is the common notice. */
export function SaveError({ error }) {
  const { t } = useApp()
  if (!error) return null
  if (error.kind === 'conflict') {
    return (
      <p role="alert" className="text-sm text-cream/90 rounded-xl glass-warm px-3 py-2">
        {conflictKind(error) === 'limit' ? t.obsSavedLimit : t.obsSavedDuplicate}
      </p>
    )
  }
  return <ObservatoryNotice error={error} />
}

/**
 * Name, notes and forest types of a saved point. Used to create (name optional: the server uses
 * the place name) and to edit. `onSubmit(form)` returns a promise; if it throws, the error is
 * shown here and the form stays as it was.
 */
export function SavePointForm({ initial, suggestedName, submitLabel, nameRequired = false, onSubmit, onCancel }) {
  const { t } = useApp()
  const uid = useId()
  const [form, setForm] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const formRef = useRef(null)

  // Opened by a button in a small scrolling panel: bring it into view and start at the name
  useEffect(() => {
    formRef.current?.scrollIntoView?.({ block: 'nearest' })
    formRef.current?.querySelector('input[type=text]')?.focus({ preventScroll: true })
  }, [])

  const toggleType = type => setForm(f => ({
    ...f,
    forestTypes: f.forestTypes.includes(type) ? f.forestTypes.filter(x => x !== type) : [...f.forestTypes, type],
  }))

  async function submit(e) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError(null)
    try {
      await onSubmit(form)
    } catch (err) {
      setError(err)
      setBusy(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={submit} className="space-y-3" aria-label={t.obsSaveTitle}>
      <div>
        <label htmlFor={`${uid}-name`} className="block text-xs text-cream/60 mb-1">{t.obsSaveName}</label>
        <input
          id={`${uid}-name`}
          type="text"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          maxLength={NAME_MAX}
          required={nameRequired}
          placeholder={suggestedName || t.obsSaveNameAuto}
          className={FIELD}
        />
      </div>
      <div>
        <label htmlFor={`${uid}-notes`} className="block text-xs text-cream/60 mb-1">{t.obsSaveNotes}</label>
        <textarea
          id={`${uid}-notes`}
          rows={3}
          value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          maxLength={NOTES_MAX}
          placeholder={t.obsSaveNotesPlaceholder}
          className={`${FIELD} resize-y`}
        />
      </div>
      <fieldset>
        <legend className="text-xs text-cream/60 mb-1">{t.obsSaveForest}</legend>
        <div className="flex flex-wrap gap-2">
          {FOREST_TYPES.map(type => {
            const on = form.forestTypes.includes(type)
            return (
              <label
                key={type}
                className={`cursor-pointer select-none px-3 py-1.5 rounded-full text-xs border transition-colors focus-within:ring-2 focus-within:ring-cream/50 ${on ? 'bg-bar/80 border-bar text-white' : 'border-cream/30 text-cream/80 hover:bg-cream/10'}`}
              >
                <input type="checkbox" checked={on} onChange={() => toggleType(type)} className="sr-only" />
                {t[TYPE_KEY[type]]}
              </label>
            )
          })}
        </div>
        <p className="text-xs text-cream/50 mt-1.5">{t.obsSaveForestHelp}</p>
      </fieldset>
      <SaveError error={error} />
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} disabled={busy} className={BTN_SECONDARY}>{t.obsSaveCancel}</button>
        <button type="submit" disabled={busy} className={BTN_PRIMARY}>{busy ? t.obsSaving : submitLabel}</button>
      </div>
    </form>
  )
}

/** «¿Quitar “X” de tus puntos?» with its two answers. */
export function RemoveConfirm({ name, onConfirm, onCancel }) {
  const { t } = useApp()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  async function confirm() {
    setBusy(true)
    setError(null)
    try {
      await onConfirm()
    } catch (err) {
      setError(err)
      setBusy(false)
    }
  }

  return (
    <div role="alertdialog" aria-label={t.obsSavedRemove} className="space-y-2">
      <p className="text-sm text-cream/90">{t.obsSavedRemoveConfirm.replace('{name}', name)}</p>
      <SaveError error={error} />
      <div className="flex gap-2">
        <button type="button" onClick={confirm} disabled={busy} className={BTN_PRIMARY}>{busy ? t.obsSaving : t.obsSavedRemoveYes}</button>
        <button type="button" onClick={onCancel} disabled={busy} className={BTN_SECONDARY}>{t.obsSavedKeep}</button>
      </div>
    </div>
  )
}
