import { useEffect } from 'react'
import { useApp } from '../../contexts/AppContext'
import { mockSpecies } from '../../data/species'
import { IC, EdibilityTag } from '../../lib/helpers'
import { MODAL } from '../../lib/constants'

export function FamilyModal({ family, onClose, onViewSpecies }) {
  const { t } = useApp()
  const familyName = family.nombre || family.name || family.id || ''
  const familySpecies = mockSpecies.filter(e => e.family === familyName)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center modal-outer"
      style={{ background: MODAL.overlay, backdropFilter: 'blur(8px)', overflowY: 'auto' }} onClick={onClose}>
      <div className="sm:my-8">
        <div className="rounded-2xl max-w-2xl w-full anim-scale modal-inner" onClick={e => e.stopPropagation()} style={{ background: MODAL.bg, maxHeight: '85vh', overflowY: 'auto' }}>
          <div className="p-6 flex items-center justify-between">
            <div>
              <p className="text-muted text-xs uppercase tracking-widest mb-1">Familia micológica</p>
              <h2 className="font-display text-3xl text-cream">{familyName}</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-cream/60 transition-colors">{IC.close}</button>
          </div>

          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted mb-3">{t.descFamilia}</h3>
              <p className="text-cream/70 text-sm leading-relaxed">{family.descripcion || family.description}</p>
            </section>

            {(family.caracteristicas || family.characteristics) && (
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted mb-3">Características</h3>
                <div className="grid grid-cols-2 gap-2">
                  {(family.caracteristicas || family.characteristics).map((c, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white/[0.03] rounded-lg px-3 py-2">
                      <span className="text-emerald-500/60 text-xs">✓</span>
                      <span className="text-cream/70 text-xs">{c}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted mb-3">{t.especiesDeFamilia} ({familySpecies.length})</h3>
              <div className="space-y-2">
                {familySpecies.map(e => (
                  <div key={e.id} onClick={() => onViewSpecies(e)}
                    className="flex items-center gap-3 bg-white/[0.03] hover:bg-white/[0.06] rounded-xl p-3 cursor-pointer transition-all hover-lift">
                    <img src={e.photo?.url} alt="" className="w-14 h-14 rounded-lg object-cover opacity-80"
                      onError={ev => { ev.target.style.display = 'none' }} />
                    <div className="flex-1 min-w-0">
                      <div className="font-display text-cream text-lg truncate">{e.scientificName}</div>
                      <div className="text-cream/40 text-xs truncate">{e.commonNames.join(', ')}</div>
                    </div>
                    <EdibilityTag edibility={e.edibility} variant="glass" />
                  </div>
                ))}
                {familySpecies.length === 0 && (
                  <p className="text-cream/40 text-sm text-center py-4">No hay especies en el catálogo para esta familia.</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
