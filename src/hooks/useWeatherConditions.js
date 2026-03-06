// =====================================================
// useWeatherConditions.js — Hook React para condiciones meteorológicas
//
// Gestiona el fetch de condiciones para múltiples zonas con:
//   - Caché localStorage (TTL 3h, gestionado en weatherService)
//   - Estado de carga + errores individuales por zona
//   - Fallback a fakeConditions si la API falla
// =====================================================
import { useState, useEffect } from 'react'
import { fetchAllZoneConditions, fetchZoneConditions, getCacheTimestamp } from '../services/weatherService'
import { fetchZone, fetchZoneWeather } from '../services/apiService'
import { fakeConditions, applySpeciesModifier } from '../lib/helpers'
import { mockSpecies } from '../data/species'

// ─────────────────────────────────────────────────────────────────────────────
// useAllZoneConditions — para Zones y Dashboard (todas las zonas)
// ─────────────────────────────────────────────────────────────────────────────

export function useAllZoneConditions(zones) {
  const [conditionsMap, setConditionsMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!zones?.length) { setLoading(false); return }

    let cancelled = false
    setLoading(true)
    setProgress({ done: 0, total: zones.length })

    fetchAllZoneConditions(zones, {
      onProgress: (done, total) => {
        if (!cancelled) setProgress({ done, total })
      },
    })
      .then(map => {
        if (cancelled) return
        const complete = {}
        zones.forEach(z => {
          const raw = map[z.id] ?? fakeConditions()
          complete[z.id] = applySpeciesModifier(raw, z, mockSpecies)
        })
        setConditionsMap(complete)
        setLoading(false)
      })
      .catch(err => {
        if (cancelled) return
        console.warn('[useAllZoneConditions] fetch failed, usando mock:', err)
        setError('No se pudieron cargar los datos meteorológicos en tiempo real.')
        const fallback = {}
        zones.forEach(z => { fallback[z.id] = fakeConditions() })
        setConditionsMap(fallback)
        setLoading(false)
      })

    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Solo una vez al montar — la caché en localStorage evita dobles fetches

  return { conditionsMap, loading, progress, error }
}

// ─────────────────────────────────────────────────────────────────────────────
// useZoneConditions — para ZoneModal (una sola zona)
// ─────────────────────────────────────────────────────────────────────────────

export function useZoneConditions(zone) {
  const [conditions, setConditions] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatedAt, setUpdatedAt] = useState(null)

  useEffect(() => {
    if (!zone) return
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchZoneConditions(zone)
      .then(cond => {
        if (!cancelled) {
          setConditions(applySpeciesModifier(cond, zone, mockSpecies))
          setUpdatedAt(getCacheTimestamp())
          setLoading(false)
        }
      })
      .catch(err => {
        if (!cancelled) {
          console.warn('[useZoneConditions] fetch failed:', err)
          setError('No se pudieron cargar datos en tiempo real.')
          setConditions(applySpeciesModifier(fakeConditions(), zone, mockSpecies))
          setUpdatedAt(null)
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [zone?.id])

  return { conditions, loading, error, updatedAt }
}

// ─────────────────────────────────────────────────────────────────────────────
// useApiZoneConditions — para ZoneModal (una zona, vía backend)
//
// Llama en paralelo:
//   GET /api/v1/zones/{id}          → OI score + breakdown
//   GET /api/v1/weather/zones/{id}  → weather cacheado (temp_min/max, humidity…)
//
// Devuelve un conditions compatible con el shape esperado por ZoneModal.
// ─────────────────────────────────────────────────────────────────────────────

export function useApiZoneConditions(zone) {
  const [conditions, setConditions] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!zone?.id) return
    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.allSettled([
      fetchZone(zone.id),
      fetchZoneWeather(zone.id),
    ]).then(([scoreResult, weatherResult]) => {
      if (cancelled) return

      const apiZone  = scoreResult.status  === 'fulfilled' ? scoreResult.value  : null
      const apiWeatherEnvelope = weatherResult.status === 'fulfilled' ? weatherResult.value : null
      const w = apiWeatherEnvelope?.weather ?? {}

      const overallScore = apiZone?.score?.score_oi ?? 0

      setConditions({
        overallScore,
        tempMin:     w.temp_min    ?? null,
        tempMax:     w.temp_max    ?? null,
        soilTemp:    null,             // no en backend
        rainfall14d: w.rainfall14d ?? null,
        humidity:    w.humidity    ?? null,
        wind:        w.wind        ?? null,
        dryDays:     null,             // no en weather_cache aún
        _source:      'api',
        _label:       apiZone?.score?.label ?? null,
        _collectedAt: w.collected_at ?? null,
      })
      setLoading(false)
    })

    return () => { cancelled = true }
  }, [zone?.id])

  return { conditions, loading, error }
}
