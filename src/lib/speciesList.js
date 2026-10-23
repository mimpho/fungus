// =====================================================
// Species list view model — turns a /point/species answer into rows for the page
//
// The backend sends ids, numbers and status codes; the names come from the species catalogue
// (same ids) and the sentences are written here from i18n keys. Pure functions: no React.
// =====================================================
import { getScoreBand } from './scoreBands'
import { forestClassNames, soilNames } from './habitat'
import { formatDay, formatNumber, fill } from './thermometer'

const LOCALES = { es: 'es-ES', ca: 'ca-ES', en: 'en-GB' }
const FOREST_KEY = { pinar: 'obsFtPinar', hayedo: 'obsFtHayedo', robledal: 'obsFtRobledal', encinar: 'obsFtEncinar', mixto: 'obsFtMixto' }
const GRADE_KEY = { probable: 'obsSpGrade_probable', possible: 'obsSpGrade_possible', early: 'obsSpGrade_early', unlikely: 'obsSpGrade_unlikely' }
const CONDITIONS = ['forest', 'soil', 'altitude', 'season', 'temperature', 'humidity', 'rain', 'frost', 'shock', 'cycle']
// Edibility values of the catalogue grouped as the app labels them (bueno = comestible)
const EDIB_GROUP = {
  excelente: 'edib_excelente', bueno: 'edib_comestible', comestible: 'edib_comestible', precaucion: 'edib_precaucion',
  no_comestible: 'edib_no_comestible', toxico: 'edib_toxico', mortal: 'edib_mortal',
}
export const EDIB_GROUPS = ['edib_excelente', 'edib_comestible', 'edib_precaucion', 'edib_no_comestible', 'edib_toxico', 'edib_mortal']
export const DEFAULT_EDIB_GROUP = 'edib_excelente'
export const edibilityGroup = e => EDIB_GROUP[e] ?? 'edib_no_comestible'

/** Lower case without accents, for searching «Cep»/«cèp»/«CEP» alike. */
export function normalizeText(text) {
  return String(text ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

/** All the words that name a species: scientific name, common names in the app language, Latin synonyms. */
function searchText(scientific, entry) {
  return normalizeText([scientific, ...(entry?.commonNames ?? []), ...(entry?.synonyms ?? [])].join(' | '))
}

/** Every word of the query must appear in some name («boletus ed» finds «Boletus edulis»). */
export function matchesQuery(row, query) {
  const words = normalizeText(query).split(/\s+/).filter(Boolean)
  return words.every(w => row.search.includes(w))
}

/** Rows of a group (null = all) that match the query. */
export function filterRows(rows, { group = null, query = '' } = {}) {
  return rows.filter(r => (!group || r.edibGroup === group) && matchesQuery(r, query))
}

/** How many rows each edibility group has. */
export function countGroups(rows) {
  const counts = Object.fromEntries(EDIB_GROUPS.map(g => [g, 0]))
  for (const r of rows) counts[r.edibGroup] += 1
  return counts
}

/**
 * Rows for the map-layer species picker: every species of the catalogue, by name for people
 * (first common name of the app language, else the scientific one), sorted in that language.
 * `photo` is the catalogue's main photo URL (or null); `edibility` the catalogue's value. `search` has the scientific name, the common names and the Latin synonyms (see matchesQuery).
 */
export function buildPickerRows(catalog, lang) {
  const collator = new Intl.Collator(LOCALES[lang] ?? LOCALES.es)
  return (catalog ?? [])
    .filter(s => s?.id && (s.scientificName || s.commonNames?.length))
    .map(s => ({
      id: s.id,
      name: s.commonNames?.[0] || s.scientificName,
      scientific: s.scientificName ?? '',
      photo: s.photo?.url ?? null,
      edibility: s.edibility ?? null,
      search: searchText(s.scientificName, s),
    }))
    .sort((a, b) => collator.compare(a.name, b.name))
}

const STATUS_KEY = { met: 'obsSpMet', pending: 'obsSpPending', not_met: 'obsSpNotMet' }

/** Months «sept – nov» when consecutive, «ene, mar» otherwise. */
export function monthsText(months, lang) {
  const list = [...new Set(months ?? [])].filter(m => m >= 1 && m <= 12).sort((a, b) => a - b)
  if (!list.length) return ''
  const name = m => new Date(2026, m - 1, 15).toLocaleDateString(LOCALES[lang] ?? LOCALES.es, { month: 'short' }).replace('.', '')
  const consecutive = list.every((m, i) => i === 0 || m === list[i - 1] + 1)
  if (consecutive && list.length > 2) return `${name(list[0])} – ${name(list[list.length - 1])}`
  return list.map(name).join(', ')
}

/** Best window as a sentence, or null when there is none (no rain on the way). */
export function windowText(w, t, lang) {
  if (!w?.from) return null
  if (w.status === 'season_ends_before_start') return t.obsSpWinLate
  if (!w.to) return null
  const values = { from: w.from, to: w.to }
  return fill(w.status === 'cut_by_season' ? t.obsSpWinCut : t.obsSpWinOpen, values, lang)
}

function forestNames(list, t) {
  return (list ?? []).map(f => t[FOREST_KEY[f]] ?? f).join(', ')
}

function altitudeLine(item, t, lang) {
  const a = item.altitude ?? {}
  const n = v => formatNumber(v, lang, 0)
  switch (a.fit) {
    case 'inside': return t.obsSpAltInside
    case 'partial':
      return a.look_from_m != null && a.look_to_m != null
        ? fill(t.obsSpAltPartial, { from: n(a.look_from_m), to: n(a.look_to_m) }, lang)
        : t.obsSpAltInside
    case 'limit': return t.obsSpAltLimit
    default: return t.obsSpAltUnknown
  }
}

function conditionText(key, cond, item, t, lang) {
  const v = cond.values ?? {}
  switch (key) {
    case 'forest':
      if (v.share != null) { // judged on the MCSC-4 shares of the point
        const values = { pct: Math.round(v.share * 100), classes: forestClassNames(v.classes, t) }
        return fill(v.factor < 1 ? t.obsSpForestShareLow : t.obsSpForestShare, values, lang)
      }
      return cond.status === 'pending'
        ? t.obsSpForestPending
        : fill(t.obsSpForestMet, { types: forestNames(v.species, t) || t.obsFtMixto }, lang)
    case 'soil': {
      if (cond.status === 'pending') return t.obsSpSoilPending
      const values = { min: v.ph_min, max: v.ph_max, soil: soilNames(v.shares, t) }
      return fill(cond.status === 'met' ? t.obsSpSoilMet : t.obsSpSoilLow, values, lang)
    }
    case 'altitude': return altitudeLine(item, t, lang)
    case 'season': return fill(t.obsSpSeason, { months: monthsText(v.months, lang) }, lang)
    case 'temperature':
      return v.min_c == null
        ? fill(t.obsSpTempNoRange, { mean: v.mean_7d_c }, lang)
        : fill(t.obsSpTemp, { mean: v.mean_7d_c, min: v.min_c, max: v.max_c }, lang)
    case 'rain':
      return v.min_mm == null
        ? fill(t.obsSpRainNoMin, { total: v.total_21d_mm }, lang)
        : fill(t.obsSpRain, { total: v.total_21d_mm, min: v.min_mm }, lang)
    case 'humidity':
      return fill(cond.status === 'met' ? t.obsSpHumMet : t.obsSpHumLow, { mean: v.mean_7d_pct, min: v.min_pct, opt: v.opt_pct ?? v.min_pct }, lang)
    case 'frost':
      return fill(cond.status === 'met' ? t.obsSpFrostMet : t.obsSpFrostMissing, { days: v.days }, lang)
    case 'shock':
      return cond.status === 'met' ? t.obsSpShockMet : t.obsSpShockMissing
    case 'cycle':
      if (cond.status === 'met') return fill(t.obsSpCycleMet, { days: v.days_since_rain, date: v.rain_date, cycle: v.cycle_days }, lang)
      if (v.rain_date) return fill(t.obsSpCyclePending, { date: v.rain_date, expected: v.expected_date }, lang)
      return v.cycle_days == null ? t.obsSpCycleUnknown : fill(t.obsSpCycleNoRain, { cycle: v.cycle_days }, lang)
    default: return null
  }
}

/** The conditions of a species (only those it has), in a fixed order, with status and sentence. */
export function buildConditionLines(item, t, lang) {
  return CONDITIONS
    .filter(key => item.conditions?.[key])
    .map(key => {
      const cond = item.conditions[key]
      // The altitude's own status says «limit» as not_met; its sentence says why.
      return { key, status: cond.status, statusLabel: t[STATUS_KEY[cond.status]] ?? '', text: conditionText(key, cond, item, t, lang) }
    })
    .filter(line => line.text)
}

/** Name of a species for people: first common name of the catalogue, else the scientific one. */
export function speciesName(id, scientific, catalog) {
  const entry = catalog?.get?.(id)
  return entry?.commonNames?.[0] || scientific || id
}

/** Rows for the list, in the order the backend sent (followed first, then by score). */
export function buildRows(data, catalog, t, lang) {
  return (data?.species ?? []).map(item => {
    const band = getScoreBand(item.score)
    return {
      id: item.id,
      name: speciesName(item.id, item.scientific_name, catalog),
      scientific: item.scientific_name,
      photo: catalog?.get?.(item.id)?.photo?.url ?? null,
      edibility: item.edibility,
      edibGroup: edibilityGroup(item.edibility),
      search: searchText(item.scientific_name, catalog?.get?.(item.id)),
      followed: !!item.followed,
      score: item.score,
      band,
      grade: t[GRADE_KEY[item.grade]] ?? '',
      window: windowText(item.window, t, lang),
      conditions: buildConditionLines(item, t, lang),
    }
  })
}

/** Day used in «Datos del …» texts, re-exported so the panel needs one import. */
export { formatDay }

/** The `species` value that asks the server for the excellent edibles together (their mean). */
export const ENSEMBLE = 'excellent'
