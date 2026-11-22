import { useSpecies } from '../../../hooks/useSpecies'
import { useSpeciesRows } from '../../../hooks/useSpeciesRows'
import { SpeciesSlot } from './SpeciesSlot'
import { speciesSheetEnabled } from './flag'

/**
 * T4 (experiment): the chosen species' sheet. A bar (thumbnail, «Mapa filtrado por», and a pill with the name and the ×) while a species is active; the card
 * (transient) opens from it, and folding it never clears the filter: only the × (the pill's, or the open card's) does. It does not touch the search bar's own
 * filled half. Phone and desktop are the same block (`SpeciesSlot`): on the phone it is a bottom sheet of the stack above the
 * tab bar, on desktop a card of the bottom-left stack under the point's card; the page places it.
 * `speciesId`; `lens`: 'conditions' | 'habitat' | null (which legend to show); `onClear()`; `phone`; `onOpenChange(open)`;
 * `onStackHeight(px)`; `closeSignal` (the page asks the card to fold).
 */
export function SpeciesSheet({ speciesId, lens = null, onClear, phone = false, onOpenChange, onStackHeight, closeSignal = 0 }) {
  const rows = useSpeciesRows()
  const { species: catalog } = useSpecies()
  const row = speciesId ? rows.find(r => r.id === speciesId) : null
  const species = speciesId ? (catalog ?? []).find(s => s.id === speciesId) : null
  if (!speciesSheetEnabled() || !speciesId || !row) return null
  return (
    <SpeciesSlot key={speciesId} desktop={!phone} row={row} species={species} lens={lens} onClear={onClear} onOpenChange={onOpenChange} onStackHeight={onStackHeight} closeSignal={closeSignal} />
  )
}
