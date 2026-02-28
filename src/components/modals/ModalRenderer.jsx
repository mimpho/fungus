import { useEffect } from 'react'
import { useApp } from '../../contexts/AppContext'
import { Lightbox } from './Lightbox'
import { FamilyModal } from './FamilyModal'
import { ZoneModal } from './ZoneModal'
import { SpeciesModal } from './SpeciesModal'

// ─────────────────────────────────────────────────────────────────────────────
// ModalRenderer — renderiza los modales globales y sincroniza con el historial
// del navegador, de modo que el botón "Atrás" cierra el modal activo.
//
// Flujo:
//   apertura  → pushState (#zona/id, #seta/id, #familia/…, #galeria)
//   cierre X/ESC/backdrop → onClose = history.back() → dispara popstate
//   popstate  → cierra el modal más anidado activo
// ─────────────────────────────────────────────────────────────────────────────

export function ModalRenderer() {
  const {
    selectedZone,    setSelectedZone,
    selectedSpecies, setSelectedSpecies,
    selectedFamily,  setSelectedFamily,
    lightbox,        setLightbox,
  } = useApp()

  // ── Push history al abrir cada modal ──────────────────────────────────────

  useEffect(() => {
    if (!selectedZone) return
    window.history.pushState({ fungusModal: 'zone' }, '', `#zona/${selectedZone.id}`)
  }, [selectedZone?.id])

  useEffect(() => {
    if (!selectedSpecies) return
    window.history.pushState({ fungusModal: 'species' }, '', `#seta/${selectedSpecies.id}`)
  }, [selectedSpecies?.id])

  useEffect(() => {
    if (!selectedFamily) return
    window.history.pushState({ fungusModal: 'family' }, '', `#familia/${encodeURIComponent(selectedFamily.name)}`)
  }, [selectedFamily?.name])

  useEffect(() => {
    if (!lightbox) return
    window.history.pushState({ fungusModal: 'lightbox' }, '', '#galeria')
  }, [lightbox])

  // ── popstate (botón Atrás) → cierra el modal más anidado activo ───────────

  useEffect(() => {
    const handlePop = () => {
      // Cerrar por orden de anidación (más profundo primero)
      if (lightbox)        { setLightbox(null);        return }
      if (selectedFamily)  { setSelectedFamily(null);  return }
      if (selectedSpecies) { setSelectedSpecies(null); return }
      if (selectedZone)    { setSelectedZone(null);    return }
    }
    window.addEventListener('popstate', handlePop)
    return () => window.removeEventListener('popstate', handlePop)
  }, [lightbox, selectedFamily, selectedSpecies, selectedZone])

  // ── Cerrar via history.back() → coherencia con el historial ───────────────
  const closeViaHistory = () => window.history.back()

  return (
    <>
      {selectedZone && (
        <ZoneModal
          zone={selectedZone}
          onClose={closeViaHistory}
        />
      )}

      {selectedSpecies && (
        <SpeciesModal
          species={selectedSpecies}
          onClose={closeViaHistory}
        />
      )}

      {selectedFamily && (
        <FamilyModal
          family={selectedFamily}
          onClose={closeViaHistory}
          onViewSpecies={sp => { setSelectedFamily(null); setSelectedSpecies(sp) }}
        />
      )}

      {lightbox && (
        <Lightbox
          photos={lightbox.photos}
          initialIndex={lightbox.index}
          onClose={closeViaHistory}
        />
      )}
    </>
  )
}
