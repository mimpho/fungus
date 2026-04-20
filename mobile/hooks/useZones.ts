// useZones — fetches zones from the backend (score + weather embedded)
// API returns snake_case; we normalise to camelCase here.
// Field mapping:
//   forest_type  → forestType
//   elevation_m  → elevation
//   lon          → lng
//   score.score_oi       → overallScore
//   weather.temp_min/max → tempMin/tempMax
//   weather.rainfall14d  → rainfall14d

import { useState, useEffect, useRef } from 'react'
import { fetchZones } from '../services/api'
import { PROVINCE_TO_CCAA } from '../lib/constants'

export interface Zone {
  id: string
  name: string
  province: string
  autonomy?: string     // comunidad autónoma — derived from province via PROVINCE_TO_CCAA
  region?: string       // comarca
  forestType: string
  elevation: number
  lat: number
  lng: number
  description?: string
}

export interface ZoneConditions {
  overallScore: number
  tempMin: number | null
  tempMax: number | null
  soilTemp: number | null
  rainfall14d: number | null
  humidity: number | null
  wind: number | null
  dryDays: number | null
  _collectedAt?: string
}

export type ConditionsMap = Record<string, ZoneConditions>

// Module-level promise deduplication — prevents double fetch in React StrictMode
let _zonesPromise: Promise<{ zones: Zone[]; conditionsMap: ConditionsMap }> | null = null

export function useZones() {
  const [zones, setZones] = useState<Zone[]>([])
  const [conditionsMap, setConditionsMap] = useState<ConditionsMap>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const cancelled = useRef(false)

  useEffect(() => {
    cancelled.current = false

    const load = async () => {
      if (!_zonesPromise) {
        _zonesPromise = loadZonesAndConditions()
      }

      try {
        const { zones: z, conditionsMap: cm } = await _zonesPromise
        if (cancelled.current) return
        setZones(z)
        setConditionsMap(cm)
        setError(null)
      } catch (err) {
        if (cancelled.current) return
        console.warn('[useZones] API unavailable:', err)
        setError('No se pudieron cargar los datos en tiempo real.')
      } finally {
        if (!cancelled.current) {
          setLoading(false)
          _zonesPromise = null
        }
      }
    }

    load()
    return () => { cancelled.current = true }
  }, [])

  return { zones, conditionsMap, loading, error }
}

async function loadZonesAndConditions(): Promise<{ zones: Zone[]; conditionsMap: ConditionsMap }> {
  // Single fetch — score and weather are embedded in the zones response
  const rawZones = await fetchZones() as any[]

  const zones: Zone[] = rawZones.map(normaliseZone)
  const conditionsMap: ConditionsMap = {}
  for (const raw of rawZones) {
    conditionsMap[String(raw.id)] = normaliseConditions(raw)
  }

  return { zones, conditionsMap }
}

// Normalise raw API zone → Zone (handles snake_case and field renames)
function normaliseZone(raw: any): Zone {
  const province = raw.province ?? ''
  return {
    id:          String(raw.id),
    name:        raw.name        ?? '',
    province,
    autonomy:    PROVINCE_TO_CCAA[province] ?? undefined,
    region:      raw.region      ?? undefined,
    forestType:  raw.forest_type ?? raw.forestType ?? '',
    elevation:   raw.elevation_m ?? raw.elevation  ?? 0,
    lat:         raw.lat         ?? 0,
    lng:         raw.lon         ?? raw.lng         ?? 0,   // API uses "lon"
    description: raw.description ?? undefined,
  }
}

// Normalise embedded score + weather → ZoneConditions
export function normaliseConditions(raw: any): ZoneConditions {
  const score   = raw.score   ?? {}
  const weather = raw.weather ?? {}
  return {
    overallScore: Math.round(score.score_oi ?? score.overallScore ?? 0),
    tempMin:      weather.temp_min      ?? weather.tempMin      ?? null,
    tempMax:      weather.temp_max      ?? weather.tempMax      ?? null,
    soilTemp:     weather.soil_temp     ?? weather.soilTemp     ?? null,
    rainfall14d:  weather.rainfall14d   ?? weather.rainfall_14d ?? null,
    humidity:     weather.humidity      ?? null,
    wind:         weather.wind          ?? null,
    dryDays:      weather.dry_days      ?? weather.dryDays      ?? null,
    _collectedAt: weather.collected_at  ?? score.calculated_at  ?? undefined,
  }
}
