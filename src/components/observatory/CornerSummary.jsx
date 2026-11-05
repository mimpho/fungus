import { CornerPhotos } from './CornerPhotos'
import { SpeciesPills } from './SpeciesPills'

export { SCROLL_THIN } from './scrollStyles'


/** True when the notes are only the names of the corner's species, which the cards already show. */
export function notesAreSpeciesNames(notes, names) {
  const parts = (notes ?? '').split(/[,;\n]/).map(x => x.trim().toLowerCase()).filter(Boolean)
  const known = new Set(names.filter(Boolean).map(x => x.toLowerCase()))
  return parts.length > 0 && parts.every(x => known.has(x))
}

/**
 * What a corner has, for the map's small panel: its species as tag pills (the name opens the
 * species' sheet) and, when it has photos, a strip of small thumbnails that open the viewer (the same one as the card's, with tagging and deleting). The
 * kind is not written here: the pin before the corner's name says it.
 */
export function CornerSummary({ corner, onChanged }) {
  return (
    <div className="space-y-3.5" data-testid="corner-summary">
      <SpeciesPills ids={corner.species_ids} size="sm" />
      <CornerPhotos corner={corner} variant="strip" onChanged={onChanged} />
    </div>
  )
}
