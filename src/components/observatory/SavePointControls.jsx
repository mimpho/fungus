import { useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { BTN_SECONDARY } from './SavedPointParts'
import { CornerModals } from './CornerModals'
import { IC } from '../../lib/helpers'

// The zone header's action: bigger than the usual secondary button, icon on the left
const ACTION_BTN = `${BTN_SECONDARY} !px-6 !py-3 !text-base inline-flex items-center gap-2.5`

/**
 * The observed zone's header: `lead` (title and facts) on the left and, at the bottom right,
 * «Guardar rincón» while the zone is not saved (it opens the form in a dialog). Once saved, the
 * corner is a card of its own (CornerCard) with its data and its edit / remove actions, so the
 * header only has the title.
 */
export function SavePointControls({ point, suggestedName, saved, lead }) {
  const { t } = useApp()
  const [mode, setMode] = useState('idle') // idle | create
  const existing = saved.find(point)

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="min-w-0 flex-1 basis-[18rem]">{lead}</div>
        {!existing && (
          <div className="flex gap-2 ml-auto">
            <button type="button" onClick={() => setMode('create')} className={ACTION_BTN}>
              <span aria-hidden="true" className="[&>svg]:w-5 [&>svg]:h-5">{IC.heart(false)}</span>
              {t.obsSaveZoneButton}
            </button>
          </div>
        )}
      </div>
      <CornerModals mode={mode} onClose={() => setMode('idle')} point={point} saved={saved} suggestedName={suggestedName} />
    </>
  )
}
