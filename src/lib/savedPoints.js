import { samePoint } from './observatoryView'
import { DEFAULT_KIND, KINDS } from './cornerKinds'

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
  return {
    name: sp?.name ?? '',
    notes: sp?.notes ?? '',
    kind: KINDS.includes(sp?.kind) ? sp.kind : DEFAULT_KIND,
    species_ids: [...(sp?.species_ids ?? [])],
  }
}

/** Same ids, whatever the order (the API keeps its own). */
const sameSet = (a, b) => a.length === b.length && a.every(id => b.includes(id))

/** Body for POST: empty name/notes are left out (the server fills the name in); so are the default kind and no species. */
export function buildCreate(point, form) {
  return {
    lat: point.lat,
    lon: point.lon,
    name: form.name.trim(),
    notes: form.notes.trim(),
    ...(form.kind && form.kind !== DEFAULT_KIND ? { kind: form.kind } : {}),
    ...(form.species_ids?.length ? { species_ids: form.species_ids } : {}),
  }
}

/**
 * Body for PATCH with only what changed, using the API names. An emptied note becomes null. A blank
 * name is sent as it is: the server puts the place name back. `species_ids` replaces the whole list ([] clears it).
 */
export function buildChanges(original, form) {
  const changes = {}
  const name = form.name.trim()
  if (name !== original.name) changes.name = name
  const notes = form.notes.trim() || null
  if (notes !== (original.notes ?? null)) changes.notes = notes
  if (form.kind && form.kind !== (original.kind ?? DEFAULT_KIND)) changes.kind = form.kind
  const species = form.species_ids ?? []
  if (!sameSet(species, original.species_ids ?? [])) changes.species_ids = species
  return changes
}

/** The API answers 409 for two reasons; only its text tells them apart. */
export function conflictKind(error) {
  return /limit/i.test(error?.detail ?? '') ? 'limit' : 'duplicate'
}
