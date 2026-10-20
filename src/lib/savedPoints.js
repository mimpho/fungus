import { samePoint } from './observatoryView'

export const NAME_MAX = 80
export const NOTES_MAX = 2000

/** The saved point at these coordinates (same 5-decimal rounding as the backend), or null. */
export function findSaved(points, point) {
  if (!point) return null
  return points.find(p => samePoint(p, point)) ?? null
}

/** Alphabetical in the app language. */
export function sortSaved(points, lang = 'es') {
  const collator = new Intl.Collator(lang, { sensitivity: 'base' })
  return [...points].sort((a, b) => collator.compare(a.name, b.name) || a.id - b.id)
}

export function formFromSaved(sp) {
  return { name: sp?.name ?? '', notes: sp?.notes ?? '' }
}

/** Body for POST: empty name/notes are left out (the server fills the name in). */
export function buildCreate(point, form) {
  return {
    lat: point.lat,
    lon: point.lon,
    name: form.name.trim(),
    notes: form.notes.trim(),
  }
}

/**
 * Body for PATCH with only what changed, using the API names. An emptied note becomes null. A blank name changes nothing:
 * a saved point always has one.
 */
export function buildChanges(original, form) {
  const changes = {}
  const name = form.name.trim()
  if (name && name !== original.name) changes.name = name
  const notes = form.notes.trim() || null
  if (notes !== (original.notes ?? null)) changes.notes = notes
  return changes
}

/** The API answers 409 for two reasons; only its text tells them apart. */
export function conflictKind(error) {
  return /limit/i.test(error?.detail ?? '') ? 'limit' : 'duplicate'
}
