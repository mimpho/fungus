// =====================================================
// Filter and sort of the profile's «Mis rincones» list. Pure functions: no React.
//
// A corner only stores its coordinates, kind, species, notes and altitude; the place name
// (toponym, municipality, comarca), the forest around it and its score are asked live and arrive
// as `info` ({ toponym, forest: {class: share}, score }), or null while unknown.
// =====================================================
import { DEFAULT_KIND } from './cornerKinds'
import { forestKeys } from './habitat'

export const SORTS = ['score', 'alfa', 'elevation', 'recent']
export const DEFAULT_SORT = 'score'
/** Order the forest options are offered in. */
export const FOREST_ORDER = ['pinar', 'hayedo', 'robledal', 'encinar', 'otro']

const norm = s => (s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

/** Forest classes around the corner (biggest first), or [] while unknown. */
export const forestOf = info => forestKeys({ forest: info?.forest })

/** Text the search looks in: the corner's own name and the place name the geocoder gave. */
export function searchText(sp, info) {
  const top = info?.toponym
  return norm([sp.name, top?.name, top?.label, top?.municipality].filter(Boolean).join(' '))
}

/** Distinct comarcas of the corners whose place is known, sorted in the app language. */
export function comarcasOf(points, infoOf, lang = 'es') {
  const set = new Set(points.map(p => infoOf(p)?.toponym?.comarca).filter(Boolean))
  return [...set].sort(new Intl.Collator(lang, { sensitivity: 'base' }).compare)
}

/** Forest classes present among the corners, in `FOREST_ORDER`. */
export function forestsOf(points, infoOf) {
  const set = new Set(points.flatMap(p => forestOf(infoOf(p))))
  return FOREST_ORDER.filter(k => set.has(k))
}

const num = v => (Number.isFinite(v) ? v : null)
/** Descending by a number, the unknown ones last. */
const desc = (a, b) => (a === null && b === null ? 0 : a === null ? 1 : b === null ? -1 : b - a)

/**
 * The corners that pass the filters, in the chosen order. Filters combine (and): the text must
 * be in the name or the place; the comarca is exact; a corner passes the forest filter if ANY of
 * its forest classes is ticked; the same for kinds. While a corner's place or forest is unknown it
 * cannot pass a filter that needs it.
 */
export function applyCornerFilters(points, infoOf, { query = '', comarca = '', forests = [], kinds = [], sort = DEFAULT_SORT }, lang = 'es') {
  const q = norm(query)
  const collator = new Intl.Collator(lang, { sensitivity: 'base' })
  const byName = (a, b) => collator.compare(a.name, b.name) || a.id - b.id
  const out = points.filter(sp => {
    const info = infoOf(sp)
    if (q && !searchText(sp, info).includes(q)) return false
    if (comarca && info?.toponym?.comarca !== comarca) return false
    if (forests.length && !forestOf(info).some(k => forests.includes(k))) return false
    if (kinds.length && !kinds.includes(sp.kind ?? DEFAULT_KIND)) return false
    return true
  })
  const score = sp => num(infoOf(sp)?.score)
  const cmp = {
    score: (a, b) => desc(score(a), score(b)) || byName(a, b),
    alfa: byName,
    elevation: (a, b) => desc(num(a.elevation_m), num(b.elevation_m)) || byName(a, b),
    recent: (a, b) => (Date.parse(b.created_at) || 0) - (Date.parse(a.created_at) || 0) || byName(a, b),
  }[sort] ?? byName
  return out.sort(cmp)
}
