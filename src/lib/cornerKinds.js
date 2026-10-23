// =====================================================
// Corner kinds — the closed, manual «tipo» of a saved point («rincón»)
//
// The codes are the API's (backend/app/services/saved_points.py KINDS). The kind is never
// computed; the only help is `suggestKind`. Colours are literal hex: the pins are drawn by
// Leaflet outside React's DOM, where CSS variables do not reach (memory/gotchas.md).
// =====================================================

export const KINDS = ['unspecified', 'mushroom_site', 'prospect', 'parking']
export const DEFAULT_KIND = 'unspecified'
/** Tagged species per corner: the API's own limit (SPECIES_MAX). */
export const SPECIES_MAX = 50

const CREAM = '#f4ebe1'

export const KIND_META = {
  unspecified:   { labelKey: 'obsKindUnspecified', hintKey: 'obsKindUnspecifiedHint', color: '#c4a06b' },
  mushroom_site: { labelKey: 'obsKindMushroomSite', hintKey: 'obsKindMushroomSiteHint', color: '#4a7c59' },
  prospect:      { labelKey: 'obsKindProspect', hintKey: 'obsKindProspectHint', color: '#b9712f' },
  parking:       { labelKey: 'obsKindParking', hintKey: 'obsKindParkingHint', color: '#4f86b3' },
}

export const kindMeta = kind => KIND_META[kind] ?? KIND_META[DEFAULT_KIND]

// Small drawing inside the pin's head (centre 15,14), cream on the kind's colour
const GLYPH = {
  unspecified: `<circle cx="15" cy="14" r="4" fill="${CREAM}"/>`,
  mushroom_site: `<path d="M8 15a7 6.2 0 0 1 14 0z" fill="${CREAM}"/><rect x="13" y="15" width="4" height="5" rx="1" fill="${CREAM}"/>`,
  prospect: `<path d="M11.5 7.5v13" stroke="${CREAM}" stroke-width="1.8" stroke-linecap="round"/><path d="M11.5 8h8.5l-2.2 3 2.2 3h-8.5z" fill="${CREAM}"/>`,
  parking: `<text x="15" y="18.6" text-anchor="middle" font-size="12.5" font-weight="700" font-family="Arial,Helvetica,sans-serif" fill="${CREAM}">P</text>`,
}

/** The pin as an SVG string (30×38, tip at the bottom centre). Static markup: no user text in it. */
export function pinSvg(kind) {
  const { color } = kindMeta(kind)
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="38" viewBox="0 0 30 38" aria-hidden="true" style="filter:drop-shadow(0 1px 2px rgba(0,0,0,.65))">'
    + `<path d="M15 36.5C15 36.5 2.5 23.5 2.5 14.2a12.5 12.5 0 0 1 25 0c0 9.3-12.5 22.3-12.5 22.3z" fill="${color}" stroke="${CREAM}" stroke-width="2"/>`
    + (GLYPH[kind] ?? GLYPH[DEFAULT_KIND])
    + '</svg>'
  )
}

/**
 * Soft help in the form: a mushroom tagged on a corner that is «unspecified» or «prospect»
 * probably is a mushroom site. Returns the kind to offer, or null. Never applied by itself.
 */
export function suggestKind(kind, speciesIds) {
  if ((speciesIds?.length ?? 0) > 0 && (kind === 'unspecified' || kind === 'prospect')) return 'mushroom_site'
  return null
}
