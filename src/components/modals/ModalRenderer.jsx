import { useApp } from '../../contexts/AppContext'
import { Lightbox } from './Lightbox'
import { FamilyModal } from './FamilyModal'
import { ZoneModal } from './ZoneModal'
import { SpeciesModal } from './SpeciesModal'

export function ModalRenderer() {
  const {
    selectedZone,    setSelectedZone,
    selectedSpecies, setSelectedSpecies,
    selectedFamily,  setSelectedFamily,
    lightbox,        setLightbox,
  } = useApp()

  return (
    <>
      {selectedZone && (
        <ZoneModal
          zone={selectedZone}
          onClose={() => setSelectedZone(null)}
        />
      )}

      {selectedSpecies && (
        <SpeciesModal
          species={selectedSpecies}
          onClose={() => setSelectedSpecies(null)}
        />
      )}

      {selectedFamily && (
        <FamilyModal
          family={selectedFamily}
          onClose={() => setSelectedFamily(null)}
          onViewSpecies={sp => { setSelectedFamily(null); setSelectedSpecies(sp) }}
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
