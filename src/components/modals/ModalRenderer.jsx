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

  // ── Lightbox → history entry ──────────────────────────────────────────────
  // Al abrir el lightbox empujamos una entrada nueva en el historial (mismo
  // pathname, state con _lightbox: true). Así el back button del browser lo
  // cierra igual que los modales normales.
  useEffect(() => {
    if (!lightbox) return
    navigate(location.pathname, { state: { ...location.state, _lightbox: true } })
  }, [!!lightbox]) // eslint-disable-line react-hooks/exhaustive-deps

  // Si el usuario navega hacia atrás mientras el lightbox está abierto,
  // la nueva location ya no tiene _lightbox → cerramos el lightbox.
  useEffect(() => {
    if (lightbox && !location.state?._lightbox) {
      setLightbox(null)
    }
  }, [location.key]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cierre unificado ─────────────────────────────────────────────────────
  // navigate(-1) cuando hay historial previo (navegación interna).
  // Si location.key === 'default', la página se abrió directamente (nueva
  // pestaña, bookmark, compartir URL) → no hay entrada anterior, navigate(-1)
  // no hace nada. En ese caso navegamos a la ruta padre del listing.
  // Usamos setTimeout(0) para asegurar que el state se limpia antes de navegar.
  const closeViaHistory = () => {
    // Si el lightbox está en lo alto del stack, solo lo cerramos a él —
    // el modal subyacente (SpeciesModal, ArticleModal…) debe seguir visible.
    if (lightbox) {
      setLightbox(null)
      if (location.key !== 'default') navigate(-1)
      return
    }

    // Cierre de modal normal: limpiamos estado y desapilamos historial
    if (selectedZone) setSelectedZone(null)
    if (selectedSpecies) setSelectedSpecies(null)
    if (selectedFamily) setSelectedFamily(null)

    // Navegamos
    if (location.key !== 'default') {
      navigate(-1)
      return
    }
    // Fallback a la ruta padre según la URL actual
    const path = location.pathname
    if (path.startsWith('/zonas/')) {
      navigate('/zonas')
    } else if (path.startsWith('/especies/')) {
      navigate('/especies')
    } else if (path.startsWith('/familia/')) {
      navigate('/especies')
    } else {
      navigate('/')
    }
  }

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
          onClose={closeViaHistory}
        />
      )}
    </>
  )
}
