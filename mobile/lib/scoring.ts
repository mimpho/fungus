// Scoring algorithm — ported from src/services/weatherService.js
// Phase 1 (meteorological) + Phase 2 (species modifier)
// Keep in sync manually when web algorithm changes.

import { SEASONAL_FACTOR, EDIBILITY_SCORE } from './constants'

export interface WeatherParams {
  temperature: number    // °C
  humidity: number       // %
  rainfall14d: number    // mm accumulated over 14 days
  dryDays: number        // days with <1mm in last 7
}

// ── Sub-scores (0–1) ──────────────────────────────────────────────────────────

function scoreTemperature(temp: number): number {
  if (temp < 2 || temp > 28) return 0
  if (temp >= 10 && temp <= 18) return 1
  if (temp >= 5 && temp < 10) return 0.4 + (temp - 5) * 0.12
  if (temp > 18 && temp <= 22) return 1 - (temp - 18) * 0.15
  if (temp > 22) return 0.4 - (temp - 22) * 0.1
  return 0.1
}

function scoreRainfall(rain: number): number {
  if (rain < 10) return 0
  if (rain >= 30 && rain <= 80) return 1
  if (rain >= 10 && rain < 30) return (rain - 10) / 20
  if (rain > 80 && rain <= 120) return 1 - (rain - 80) / 80
  return 0
}

function scoreHumidity(humidity: number): number {
  if (humidity < 40) return 0
  if (humidity >= 70 && humidity <= 95) return 1
  if (humidity >= 40 && humidity < 70) return (humidity - 40) / 30
  return Math.max(0, 1 - (humidity - 95) / 20)
}

function scoreDryDays(dryDays: number): number {
  if (dryDays <= 1) return 1
  if (dryDays <= 3) return 0.7
  if (dryDays <= 5) return 0.3
  return 0
}

// ── Phase 1 — Meteorological score ───────────────────────────────────────────

export function computeOverallScore(params: WeatherParams, month?: number): number {
  const m = month ?? new Date().getMonth() + 1
  const seasonal = (SEASONAL_FACTOR[m] ?? 0) / 100

  const raw =
    seasonal                          * 0.40 +
    scoreRainfall(params.rainfall14d) * 0.21 +
    scoreTemperature(params.temperature) * 0.18 +
    scoreHumidity(params.humidity)    * 0.12 +
    scoreDryDays(params.dryDays)      * 0.09

  return Math.round(raw * 100)
}

// ── Phase 2 — Species modifier (SQS) ─────────────────────────────────────────

interface SpeciesSummary {
  edibility: string
  fruitingMonths: number[]
  forestTypes: string[]
}

export function computeAdjustedScore(
  overallScore: number,
  species: SpeciesSummary[],
  zoneForestType: string,
  month?: number,
): { adjustedScore: number; speciesScore: number | undefined } {
  const m = month ?? new Date().getMonth() + 1

  const inSeason = species.filter(
    (s) =>
      s.fruitingMonths.includes(m) &&
      s.forestTypes.includes(zoneForestType),
  )

  if (inSeason.length === 0) {
    return { adjustedScore: overallScore, speciesScore: undefined }
  }

  const totalWeight = inSeason.reduce(
    (sum, s) => sum + (EDIBILITY_SCORE[s.edibility] ?? 0),
    0,
  )
  const speciesScore = Math.round(totalWeight / inSeason.length)
  const adjustedScore = Math.round(overallScore * 0.6 + speciesScore * 0.4)

  return { adjustedScore, speciesScore }
}
