// =====================================================
// Habitat of a point — view model of what the backend knows around it
//
// `habitat` (from /point/forest and /point/species) = { forest: {class: share}, soil: {class:
// share}, soil_ph: {class: [min, max]} }: the same class rasters the map layer multiplies by
// (forest: CREAF MCSC-4; soil acidity: ICGC lithology). Pure functions: no React.
// =====================================================
import { fill } from './thermometer'

const FOREST_LABEL = { pinar: 'obsFtPinar', encinar: 'obsFtEncinar', hayedo: 'obsFtHayedo', robledal: 'obsFtRobledal', otro: 'obsMacroOtro' }
const SOIL_LABEL = { acid: 'obsHabSoilAcid', mixed: 'obsHabSoilMixed', calcareous: 'obsHabSoilCalc' }
// Shares under this are noise at the scale of a 250 m pixel
const MIN_SHARE = 0.05

const parts = (shares, labels, t) => Object.entries(shares ?? {})
  .filter(([, share]) => share >= MIN_SHARE)
  .sort((a, b) => b[1] - a[1])
  .map(([key, share]) => ({ key, label: t[labels[key]] ?? key, pct: Math.round(share * 100) }))

/** Forest classes that have an icon (public/assets/images/icons/forest-type-<class>.png). */
export const FOREST_ICONS = new Set(['pinar', 'encinar', 'hayedo', 'robledal'])

/** Forest classes present around the point, biggest first: [{ key, label, pct }]. */
export const forestParts = (habitat, t) => parts(habitat?.forest, FOREST_LABEL, t)

/** Forest class keys around the point, biggest first (the same shares as `forestParts`, without labels). */
export const forestKeys = habitat => Object.entries(habitat?.forest ?? {})
  .filter(([, share]) => share >= MIN_SHARE)
  .sort((a, b) => b[1] - a[1])
  .map(([key]) => key)

/** Soil acidity classes present, biggest first: [{ key, label, pct, ph }] (ph = typical range text). */
export const soilParts = (habitat, t, lang) => parts(habitat?.soil, SOIL_LABEL, t).map(p => {
  const range = habitat?.soil_ph?.[p.key]
  return { ...p, ph: range ? fill('{min}–{max}', { min: range[0], max: range[1] }, lang) : null }
})

/** Whether there is anything to show. */
export const hasHabitat = (habitat, t, lang) =>
  forestParts(habitat, t).length > 0 || soilParts(habitat, t, lang).length > 0

/** Names of forest classes for sentences: «pinar, encinar». */
export const forestClassNames = (classes, t) => (classes ?? []).map(c => (t[FOREST_LABEL[c]] ?? c).toLowerCase()).join(', ')

/** Names of the soil classes of a zone for sentences: «calcáreo». */
export const soilNames = (shares, t) => parts(shares, SOIL_LABEL, t).map(p => p.label.toLowerCase()).join(' / ')
