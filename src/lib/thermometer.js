// =====================================================
// Thermometer view model — turns a /point/snapshot answer into what the page shows
//
// The backend sends numbers and codes (`conditions`, `explanation`, `limiting_factor`), never
// sentences: they are written here from the i18n keys. A code this file does not know yet is
// skipped, never printed raw. The band comes from getScoreBand() + i18n, not from the backend
// `label` (English). Pure functions: no React, no network.
// =====================================================
import { getScoreBand } from './scoreBands'

const LOCALES = { es: 'es-ES', ca: 'ca-ES', en: 'en-GB' }
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/
const GOOD_FROM = 55          // "Bueno" and above
const WEAK_FACTOR = 50        // a factor under this is what holds the score back
const GENERIC_OPTIMUM_C = 13.5 // the model's temperature optimum when no species is asked
const SOIL_CAPACITY_MM = 60

const PHRASE_KEY = { high: 'obsThPhraseHigh', good: 'obsThPhraseGood', ok: 'obsThPhraseOk', mid: 'obsThPhraseMid', low: 'obsThPhraseLow' }

const locale = lang => LOCALES[lang] ?? LOCALES.es

export function formatNumber(n, lang, digits = 1) {
  return new Intl.NumberFormat(locale(lang), { maximumFractionDigits: digits }).format(n)
}

export function formatDay(iso, lang) {
  if (!ISO_DAY.test(iso ?? '')) return ''
  return new Date(`${iso}T12:00:00`).toLocaleDateString(locale(lang), { day: 'numeric', month: 'short' })
}

export function formatRange(from, to, lang) {
  const a = formatDay(from, lang), b = formatDay(to, lang)
  return from === to || !b ? a : `${a} – ${b}`
}

/** Replaces {name} with values[name], formatted by type (ISO date, number, text). */
export function fill(template, values, lang) {
  if (typeof template !== 'string') return null
  return template.replace(/\{(\w+)\}/g, (whole, key) => {
    const v = values?.[key]
    if (v == null) return whole
    if (typeof v === 'string' && ISO_DAY.test(v)) return formatDay(v, lang)
    if (typeof v === 'number') return formatNumber(v, lang)
    return String(v)
  })
}

/** 0–100 value of each limiting factor (drying is 0.6–1 in the model). */
function factorValue(factors, name) {
  if (name === 'drying') return Math.round(((factors.drying - 0.6) / 0.4) * 100)
  return factors[name]
}

function temperatureSide(snap) {
  const conds = snap.conditions ?? []
  if (conds.some(c => c.code === 'too_warm')) return 'warm'
  if (conds.some(c => c.code === 'too_cold')) return 'cold'
  return snap.key_facts?.air_temp_20d_c > GENERIC_OPTIMUM_C ? 'warm' : 'cold'
}

/** Why the score is not higher, as a lower-case sentence ending in a full stop, or null. */
export function limitingReason(snap, t, lang) {
  const f = snap.factors
  switch (snap.limiting_factor) {
    case 'activation':  return f.activation >= WEAK_FACTOR ? t.obsThWhyActivationMid : t.obsThWhyActivationLow
    case 'moisture':    return t.obsThWhyMoisture
    case 'temperature': return fill(temperatureSide(snap) === 'warm' ? t.obsThWhyWarm : t.obsThWhyCold,
                                    { air_temp_20d_c: snap.key_facts?.air_temp_20d_c }, lang)
    case 'drying':      return t.obsThWhyDrying
    default:            return null
  }
}

/** One sentence: the band in words plus the reason, so the number is never alone. */
export function buildPhrase(snap, t, lang) {
  const band = getScoreBand(snap.score)
  let text = t[PHRASE_KEY[band.key]]
  if ((snap.conditions ?? []).some(c => c.code === 'late_season')) text += t.obsThLateSeason
  const why = limitingReason(snap, t, lang)
  const limiting = snap.limiting_factor
  if (snap.score >= GOOD_FROM) {
    if (why && factorValue(snap.factors, limiting) < WEAK_FACTOR) text += fill(t.obsThAlthough, { why }, lang)
    else if (limiting === 'activation') text += t.obsThActivationPeak
    else text += '.'
  } else {
    text += why ? `: ${why}` : '.'
  }
  return text
}

/** Active conditions as { sign, text, hint }. The rain on the way has its own block. */
export function buildConditions(snap, t, lang) {
  const out = []
  for (const c of snap.conditions ?? []) {
    if (c.code === 'rain_on_the_way') continue
    const key = c.code === 'frost' && !c.values?.date ? 'obsThC_frost_plain' : `obsThC_${c.code}`
    const text = fill(t[key], c.values, lang)
    if (!text) continue
    out.push({ code: c.code, sign: c.sign === '+' ? '+' : '-', text, hint: c.hint ? t[`obsThH_${c.hint}`] ?? null : null })
  }
  return out
}

export function buildExplanation(snap, t) {
  return snap.explanation ? t[`obsThE_${snap.explanation}`] ?? null : null
}

/** The rains that do not count yet, oldest first, with the zone's response time. */
export function buildPending(snap, t, lang) {
  const runs = [...(snap.pending_rains ?? [])].sort((a, b) => (a.start < b.start ? -1 : 1))
  if (!runs.length) return null
  return {
    items: runs.map(r => ({
      key: `${r.start}-${r.end}`,
      when: formatRange(r.start, r.end, lang),
      mm: `${formatNumber(r.total_mm, lang)} mm`,
      effect: fill(t.obsThPendingEffect, { desde: formatDay(r.shows_from, lang), pico: formatDay(r.peak, lang) }, lang),
    })),
    note: `${t.obsThPendingIf} ${snap.warm ? t.obsThPendingWarm : t.obsThPendingCold}`,
  }
}

export function buildTiles(snap, t, lang) {
  const k = snap.key_facts ?? {}
  const tiles = [
    { key: 'state', label: t.obsThTileState, value: snap.warm ? t.obsThStateWarm : t.obsThStateCold,
      sub: snap.warm ? t.obsThStateWarmSub : t.obsThStateColdSub },
    { key: 'water', label: t.obsThTileWater, value: `${formatNumber(k.soil_water_mm, lang)} mm`,
      sub: fill(t.obsThWaterSub, { capacity: SOIL_CAPACITY_MM }, lang) },
    { key: 'soil', label: t.obsThTileSoil, value: `${formatNumber(k.soil_temp_7d_c, lang)} °C`,
      sub: k.last_night_min_c != null ? fill(t.obsThSoilSub, { last_night_min_c: k.last_night_min_c }, lang) : null },
  ]
  return tiles.filter(x => !x.value.startsWith('NaN') && !x.value.startsWith('undefined'))
}

function seasonWhy(snap, t) {
  const el = snap.point?.elevation_m ?? snap.cell?.elevation_m
  if (el >= 1500) return t.obsThWhySeasonSubalpine
  if (el >= 900) return t.obsThWhySeasonMountain
  return t.obsThWhySeasonLow
}

/**
 * The factors of the score with their value 0–100, the reason and `points`: how much of the
 * 100 each one takes away (negative) or adds (the temperature-drop bonus). The score is a
 * product, so a factor is a multiplier, not a share: the points split the distance from 100 to
 * the score in proportion to each multiplier's logarithm, so they add up to exactly that.
 */
export function buildFactors(snap, t, lang) {
  const f = snap.factors, k = snap.key_facts ?? {}
  const optimum = (snap.conditions ?? []).find(c => c.values?.optimum_c != null)?.values.optimum_c ?? GENERIC_OPTIMUM_C
  const rows = [
    { key: 'activation', name: t.obsThFActivation, weight: t.obsThWBase, score: f.activation, mult: f.activation / 100,
      why: snap.warm ? t.obsThWhyRowActivationWarm : t.obsThWhyRowActivationCold },
    { key: 'moisture', name: t.obsThFMoisture, weight: t.obsThWMoisture, score: f.moisture, mult: 0.5 + 0.5 * f.moisture / 100,
      why: fill(t.obsThWhyRowMoisture, { soil_water_mm: k.soil_water_mm, capacity: SOIL_CAPACITY_MM }, lang) },
    { key: 'temperature', name: t.obsThFTemperature, weight: t.obsThWTimes, score: f.temperature, mult: f.temperature / 100,
      why: fill(t.obsThWhyRowTemperature, { air_temp_20d_c: k.air_temp_20d_c, soil_temp_7d_c: k.soil_temp_7d_c, optimum_c: optimum }, lang) },
    { key: 'season', name: t.obsThFSeason, weight: t.obsThWSeason, score: Math.round(f.season * 100), mult: 0.4 + 0.6 * f.season,
      why: seasonWhy(snap, t) },
    { key: 'heatdry', name: t.obsThFHeatDry, weight: t.obsThWTimes, score: Math.round(f.heat * f.drying * 100), mult: f.heat * f.drying,
      why: fill(t.obsThWhyRowHeatDry, { dry_days: k.dry_days }, lang) },
    ...(f.frost < 1 ? [{ key: 'frost', name: t.obsThFFrost, weight: t.obsThWTimes, score: Math.round(f.frost * 100), mult: f.frost,
      why: fill(t.obsThWhyRowFrost, { frost: formatNumber(f.frost, lang, 2) }, lang) }] : []),
    ...(f.shock > 1 ? [{ key: 'shock', name: t.obsThFShock, weight: t.obsThWTimes, score: 100, mult: f.shock,
      display: `×${formatNumber(f.shock, lang, 2)}`, why: t.obsThWhyRowShock }] : []),
    ...((f.needs ?? 1) < 1 ? [{ key: 'needs', name: t.obsThFNeeds, weight: t.obsThWTimes, score: Math.round(f.needs * 100), mult: f.needs, why: t.obsThWhyRowNeeds }] : []),
    ...((f.fit ?? 1) < 1 ? [{ key: 'fit', name: t.obsThFFit, weight: t.obsThWTimes, score: Math.round(f.fit * 100), mult: f.fit, why: t.obsThWhyRowFit }] : []),
  ].filter(row => Number.isFinite(row.score))
  return withPoints(rows, snap.score)
}

function withPoints(rows, score) {
  const logs = rows.map(r => Math.log(r.mult))
  const total = logs.reduce((a, b) => a + b, 0)
  const ok = Number.isFinite(total) && Math.abs(total) > 1e-6 && Number.isFinite(score) && (score - 100) * total > 0
  return rows.map(({ mult, ...row }, i) => ({ ...row, points: ok ? Math.round(((score - 100) * logs[i]) / total) : null }))
}

/** Score = A × (0,5 + 0,5·H) × T × (0,4 + 0,6·S) × D·C [× F] [× 1,1] = score, with the real numbers. */
export function buildFormula(snap, t, lang) {
  // The mean of several species has no single product: each one has its own
  if (snap.ensemble?.count > 0) return fill(t.obsThFormulaMean, { n: snap.ensemble.count, score: snap.score }, lang)
  const f = snap.factors
  const n = x => formatNumber(x, lang, 2)
  const parts = [f.activation, n(0.5 + (0.5 * f.moisture) / 100), n(f.temperature / 100), n(0.4 + 0.6 * f.season), n(f.drying * f.heat)]
  if (f.frost < 1) parts.push(n(f.frost))
  if (f.shock > 1) parts.push(n(f.shock))
  if ((f.needs ?? 1) < 1) parts.push(n(f.needs))
  if ((f.fit ?? 1) < 1) parts.push(n(f.fit))
  return `${t.obsThFormulaName} = ${parts.join(' × ')} = ${snap.score}.`
}

/** Everything the thermometer card shows, from one snapshot. */
export function buildThermometer(snap, t, lang) {
  const band = getScoreBand(snap.score)
  return {
    score: snap.score,
    band,
    bandLabel: t[band.obsKey],
    phrase: buildPhrase(snap, t, lang),
    explanation: buildExplanation(snap, t),
    tiles: buildTiles(snap, t, lang),
    pending: buildPending(snap, t, lang),
    conditions: buildConditions(snap, t, lang),
    factors: buildFactors(snap, t, lang),
    formula: buildFormula(snap, t, lang),
    day: formatDay(snap.date, lang),
    estimated: !!snap.estimated,
  }
}
