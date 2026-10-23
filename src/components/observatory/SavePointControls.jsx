import { useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { CornerModals } from './CornerModals'
import { IC } from '../../lib/helpers'

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
            {/* Same look as the «Mis rincones» button (and as the corner card) */}
            <button type="button" onClick={() => setMode('create')} className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-coffee/25 ring-2 ring-bar backdrop-blur-[16px] text-cream text-sm font-medium hover:bg-coffee/35 transition-all">
              <span aria-hidden="true" className="[&>svg]:w-[18px] [&>svg]:h-[18px]">{IC.heart(false)}</span>
              {t.obsSaveZoneButton}
            </button>
          </div>
        )}
      </div>
      <CornerModals mode={mode} onClose={() => setMode('idle')} point={point} saved={saved} suggestedName={suggestedName} />
    </>
  )
}
