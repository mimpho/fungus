// Under 1024px the map has the phone's layout. On any screen wider than the Meteo card of the desktop, the
// bottom bar, the sheets (tabs, point, species), and the search with its filter strip keep to one column at the
// left, as wide as that card. On a narrower screen they take its whole width. The classes are written out for
// Tailwind: keep them equal to METEO_PANEL_PX.
export const METEO_PANEL_PX = 450
/** The round «My location» button of that layout, and its space to the right edge and to whatever is under it. */
export const LOCATE_PX = 52
export const LOCATE_GAP_PX = 16
/** The widest map with the credits at the left, on top of the column. «My location» may then share their row, at the right. */
export const LEFT_CREDITS_MAX_PX = 767
/** The map's width from which the button fits beside the column, with that space at both its sides. */
export const BESIDE_COLUMN_PX = METEO_PANEL_PX + LOCATE_PX + 2 * LOCATE_GAP_PX
/** The bar and the sheets: flush with the left edge. */
export const MAP_COLUMN = 'w-full max-w-[450px]'
/** What floats in the column with the phone's 12px at each side (search, filter strip, hint): 450 - 24. */
export const MAP_FIELD = 'w-full max-w-[426px]'
