import { useEffect, useId, useRef, useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { NAME_MAX, NOTES_MAX, conflictKind } from '../../lib/savedPoints'
import { KINDS, kindMeta, pinSvg, suggestKind } from '../../lib/cornerKinds'
import { ObservatoryNotice } from './ObservatoryNotice'
import { CornerSpeciesPicker } from './CornerSpeciesPicker'

const BTN_PRIMARY = 'px-4 py-2 rounded-xl bg-bar hover:bg-[#a0834d] disabled:opacity-60 disabled:hover:bg-bar text-white text-sm font-medium transition-all'
export const BTN_SECONDARY = 'px-4 py-2 rounded-xl glass text-cream text-sm font-medium hover:[background-color:var(--ui-surface-hover)] disabled:opacity-60 transition-all'
const LABEL = 'block text-xs font-medium text-cream/70 mb-2'
const FIELD = 'w-full rounded-xl bg-cream/[0.08] px-3 py-2.5 text-base md:text-sm text-cream placeholder:text-cream/40 outline-none focus-visible:ring-2 focus-visible:ring-cream/30 transition-colors'

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

/** The four kinds as radio cards with their own pin; the chosen one says what it means underneath. */
function KindField({ value, onChange, uid }) {
  const { t } = useApp()
  return (
    <fieldset>
      <legend className={LABEL}>{t.obsKindLabel}</legend>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {KINDS.map(k => {
          const selected = value === k
          return (
            <label
              key={k}
              className={`flex items-center gap-2 rounded-xl px-3 py-2.5 cursor-pointer text-sm text-cream transition-colors focus-within:ring-2 focus-within:ring-cream/40 ${selected ? 'bg-cream/[0.18] ring-1 ring-cream/40' : 'bg-cream/[0.06] hover:bg-cream/[0.1]'}`}
            >
              <input type="radio" name={`${uid}-kind`} value={k} checked={selected} onChange={() => onChange(k)} className="sr-only" />
              {/* Static markup built from the kind's code: no user text in it */}
              <span aria-hidden="true" className="shrink-0 [&>svg]:w-[18px] [&>svg]:h-[23px]" dangerouslySetInnerHTML={{ __html: pinSvg(k) }} />
              <span className="truncate">{t[kindMeta(k).labelKey]}</span>
            </label>
          )
        })}
      </div>
      <p className="text-[11px] text-cream/50 mt-2">{t[kindMeta(value).hintKey]}</p>
    </fieldset>
  )
}

/**
 * Name, kind, tagged species and notes of a saved point («rincón»). A blank name is allowed: the
 * server then uses the place name (the placeholder says so). Used to create and to edit. `onSubmit(form)` returns a promise; if it throws, the error is
 * shown here and the form stays as it was.
 */
export function SavePointForm({ initial, suggestedName, submitLabel, onSubmit, onCancel }) {
  const { t } = useApp()
  const uid = useId()
  const [form, setForm] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const formRef = useRef(null)
  const suggested = suggestKind(form.kind, form.species_ids)

  // Opened by a button in a small scrolling panel: bring it into view and start at the name
  useEffect(() => {
    formRef.current?.scrollIntoView?.({ block: 'nearest' })
    formRef.current?.querySelector('input[type=text]')?.focus({ preventScroll: true })
  }, [])

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
    <form ref={formRef} onSubmit={submit} className="space-y-5" aria-label={t.obsSaveZoneTitle}>
      <div>
        <label htmlFor={`${uid}-name`} className={LABEL}>{t.obsSaveName}</label>
        <input
          id={`${uid}-name`}
          type="text"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          maxLength={NAME_MAX}
          placeholder={suggestedName || t.obsSaveNameAuto}
          className={FIELD}
        />
      </div>
      <KindField value={form.kind} onChange={kind => setForm(f => ({ ...f, kind }))} uid={uid} />
      <div>
        <span id={`${uid}-species`} className={LABEL}>{t.obsCornerSpecies}</span>
        <CornerSpeciesPicker value={form.species_ids} onChange={species_ids => setForm(f => ({ ...f, species_ids }))} />
        {suggested && (
          <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-cream/80 rounded-xl glass-warm px-3 py-2">
            <span>{t.obsCornerSuggest}</span>
            <button type="button" onClick={() => setForm(f => ({ ...f, kind: suggested }))} className="underline underline-offset-2 text-cream hover:text-white">{t.obsCornerSuggestYes}</button>
          </p>
        )}
      </div>
      <div>
        <label htmlFor={`${uid}-notes`} className={LABEL}>{t.obsSaveNotes}</label>
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
      <SaveError error={error} />
      <div className="flex gap-3 justify-end pt-4 border-t border-cream/10">
        <button type="button" onClick={onCancel} disabled={busy} className={BTN_SECONDARY}>{t.obsSaveCancel}</button>
        <button type="submit" disabled={busy} className={BTN_PRIMARY}>{busy ? t.obsSaving : submitLabel}</button>
      </div>
    </form>
  )
}

/** «¿Eliminar “X” de Zonas guardadas?» with its two answers, centred. */
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
    <div role="alertdialog" aria-label={t.obsSavedRemove} className="space-y-6">
      <p className="text-base text-cream/90">{t.obsSavedRemoveConfirm.replace('{name}', name)}</p>
      <SaveError error={error} />
      <div className="flex flex-wrap justify-center gap-4 pt-2">
        <button type="button" onClick={confirm} disabled={busy} className={`${BTN_PRIMARY} !px-7 !py-3 !text-base`}>{busy ? t.obsSaving : t.obsSavedRemoveYes}</button>
        <button type="button" onClick={onCancel} disabled={busy} className={`${BTN_SECONDARY} !px-7 !py-3 !text-base`}>{t.obsSavedKeep}</button>
      </div>
    </div>
  )
}
