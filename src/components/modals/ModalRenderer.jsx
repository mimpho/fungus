import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../../contexts/AppContext'
import { Lightbox } from './Lightbox'
import { FamilyModal } from './FamilyModal'
import { ZoneModal } from './ZoneModal'
import { SpeciesModal } from './SpeciesModal'
import { slugify } from '../../lib/helpers'

// ─────────────────────────────────────────────────────────────────────────────
// ModalRenderer — renderiza los modales globales y sincroniza con React Router.
//
// Zonas    → /zonas/{slug}        gestionado por Zones.jsx + useParams
// Setas    → /especies/{slug}     gestionado por Species.jsx + useParams
// Familias → /familia/{slug}      gestionado por Family.jsx + useParams
// Lightbox → sin URL (efímero, sobre otro modal)
//
// Flujo apertura:
//   setSelected*() → ModalRenderer navega a la URL canónica
//   La página destino lee el param → sin bucle (guard pathname)
//
// Flujo cierre:
//   onClose → navigate(-1) → React Router deshace la entrada
// ─────────────────────────────────────────────────────────────────────────────

export function ModalRenderer() {
  const {
    selectedZone,    setSelectedZone,
    selectedSpecies, setSelectedSpecies,
    selectedFamily,  setSelectedFamily,
    lightbox,        setLightbox,
  } = useApp()

  const navigate = useNavigate()
  const location = useLocation()

  // ── Zone → /zonas/{slug} ───────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedZone) return
    const target = `/zonas/${slugify(selectedZone.name)}`
    if (location.pathname === target) return
    navigate(target)
  }, [selectedZone?.id])

  // ── Species → /especies/{slug} ────────────────────────────────────────────
  useEffect(() => {
    if (!selectedSpecies) return
    const target = `/especies/${slugify(selectedSpecies.scientificName)}`
    if (location.pathname === target) return
    navigate(target)
  }, [selectedSpecies?.id])

  // ── Family → /familia/{slug} ──────────────────────────────────────────────
  useEffect(() => {
    if (!selectedFamily) return
    const familyName = selectedFamily.nombre || selectedFamily.name || ''
    const target = `/familia/${slugify(familyName)}`
    if (location.pathname === target) return
    navigate(target)
  }, [selectedFamily?.nombre ?? selectedFamily?.name])

  // ── Cierre unificado: navigate(-1) mantiene coherencia con el historial ───
  const closeViaHistory = () => navigate(-1)

  // ── onViewSpecies desde FamilyModal ──────────────────────────────────────
  // Cierra la familia y abre la especie (navega a /especies/{slug})
  const handleFamilyViewSpecies = (sp) => {
    setSelectedFamily(null)
    setSelectedSpecies(sp)
    // La navegación la hace el useEffect de selectedSpecies
  }

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
          onViewSpecies={handleFamilyViewSpecies}
        />
      )}

      {lightbox && (
        <Lightbox
          photos={lightbox.photos}
          initialIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  )
}
