import { useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { CornerModals } from './CornerModals'
import { IC } from '../../lib/helpers'
import { useIsPhone } from '../../hooks/useIsPhone'

/**
 * The observed zone's header: `lead` (title and facts) and «Guardar rincón» while the zone is not
 * saved (it opens the form in a dialog). Once saved, the corner is a card of its own (CornerCard)
 * with its data and its edit / remove actions, so the header only has the title.
 * `lead` is a function that receives the button (`action`, null when the zone is saved) and puts it
 * to the right of the title, in the same flex (`items-center`). With text on a desktop, just the
 * heart on a phone.
 */
export function SavePointControls({ point, suggestedName, saved, lead }) {
  const { t } = useApp()
  const phone = useIsPhone()
  const [mode, setMode] = useState('idle') // idle | create
  const existing = saved.find(point)

  // Same look as the «Mis rincones» button (and as the corner card)
  const action = existing ? null : phone ? (
    <button
      type="button"
      onClick={() => setMode('create')}
      aria-label={t.obsSaveZoneButton}
      title={t.obsSaveZoneButton}
      className="shrink-0 w-11 h-11 inline-flex items-center justify-center rounded-xl bg-coffee/25 ring-2 ring-bar backdrop-blur-[16px] text-cream hover:bg-coffee/35 transition-all outline-none focus-visible:ring-cream/60"
    >
      <span aria-hidden="true" className="[&>svg]:w-[18px] [&>svg]:h-[18px]">{IC.heart(false)}</span>
    </button>
  ) : (
    <button type="button" onClick={() => setMode('create')} className="shrink-0 inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-coffee/25 ring-2 ring-bar backdrop-blur-[16px] text-cream text-sm font-medium hover:bg-coffee/35 transition-all">
      <span aria-hidden="true" className="[&>svg]:w-[18px] [&>svg]:h-[18px]">{IC.heart(false)}</span>
      {t.obsSaveZoneButton}
    </button>
  )

  return (
    <>
      <div className="min-w-0">{lead(action)}</div>
      <CornerModals mode={mode} setMode={setMode} onClose={() => setMode('idle')} point={point} saved={saved} suggestedName={suggestedName} />
    </>
  )
}
