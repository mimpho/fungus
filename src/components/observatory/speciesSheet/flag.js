// T4 experiment switch. Default on; this browser can turn it off with localStorage `fungus-obs-species-sheet` = 'off'.
// To drop the experiment: delete this folder, the `<SpeciesSheet …/>` line in pages/Observatory.jsx and the `obsSpSheet*` i18n keys.
export const SPECIES_SHEET_KEY = 'fungus-obs-species-sheet'
export const SPECIES_SHEET_DEFAULT = true

export function speciesSheetEnabled() {
  try {
    const v = localStorage.getItem(SPECIES_SHEET_KEY)
    if (v === 'off') return false
    if (v === 'on') return true
  } catch (_e) { /* default */ }
  return SPECIES_SHEET_DEFAULT
}
