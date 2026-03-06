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
import { useSpecies } from './useSpecies'

// ─────────────────────────────────────────────────────────────────────────────
// useAllZoneConditions — DEPRECATED
//
// ⚠️  Ya no se usa en producción. Dashboard y Zones usan useZones() que
//     obtiene zonas + scores OI del backend en una sola request.
//
// Se mantiene como fallback por si se necesita volver a Open-Meteo directo
// (p.ej. si el backend no está disponible y se quiere reactivar).
// Actualizado en v4.5: usa useSpecies() en lugar del import directo de mockSpecies.
// ─────────────────────────────────────────────────────────────────────────────

export function useAllZoneConditions(zones) {
  const { species: allSpecies } = useSpecies()
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
          complete[z.id] = applySpeciesModifier(raw, z, allSpecies)
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
  const { species: allSpecies } = useSpecies()
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
          setConditions(applySpeciesModifier(cond, zone, allSpecies))
          setUpdatedAt(getCacheTimestamp())
          setLoading(false)
        }
      })
      .catch(err => {
        if (!cancelled) {
          console.warn('[useZoneConditions] fetch failed:', err)
          setError('No se pudieron cargar datos en tiempo real.')
          setConditions(applySpeciesModifier(fakeConditions(), zone, allSpecies))
          setUpdatedAt(null)
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [zone?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  // allSpecies no se incluye como dep porque la caché de useSpecies garantiza
  // que su valor es estable una vez cargado, y re-fetchar por cambio de species
  // sería excesivo aquí.

  return { conditions, loading, error, updatedAt }
}

// ─────────────────────────────────────────────────────────────────────────────
// useApiZoneConditions — para ZoneModal (una zona, vía backend)
//
// Llama en paralelo:
//   GET /api/v1/zones/{id}          → OI score + breakdown
//   GET /api/v1/weather/zones/{id}  → weather cacheado (temp_min/max, humidity…)
//
// Caché de promesas en vuelo (_apiZonePromises) para evitar dobles fetches
// en React StrictMode (que monta/desmonta efectos dos veces en desarrollo).
//
// Devuelve un conditions compatible con el shape esperado por ZoneModal.
// ─────────────────────────────────────────────────────────────────────────────

// Caché de promesas en vuelo: zone_id → Promise<conditions>
// Evita doble fetch en React StrictMode sin necesidad de useRef guards.
const _apiZonePromises = {}

export function useApiZoneConditions(zone) {
  const [conditions, setConditions] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!zone?.id) return
    let cancelled = false
    setLoading(true)
    setError(null)

    // Reutilizar promesa en vuelo si existe (evita doble fetch en StrictMode)
    if (!_apiZonePromises[zone.id]) {
      _apiZonePromises[zone.id] = Promise.allSettled([
        fetchZone(zone.id),
        fetchZoneWeather(zone.id),
      ]).finally(() => {
        // Limpiar caché cuando la promesa se resuelva para permitir re-fetch futuro
        delete _apiZonePromises[zone.id]
      })
    }

    _apiZonePromises[zone.id].then(([scoreResult, weatherResult]) => {
      if (cancelled) return

      const apiZone            = scoreResult.status  === 'fulfilled' ? scoreResult.value  : null
      const apiWeatherEnvelope = weatherResult.status === 'fulfilled' ? weatherResult.value : null
      const w = apiWeatherEnvelope?.weather ?? {}

      // Helpers de redondeo (los mismos que en normalizeScore)
      const r1 = v => v != null ? Math.round(v * 10) / 10 : null
      const r0 = v => v != null ? Math.round(v) : null

      setConditions({
        overallScore: apiZone?.score?.score_oi ?? 0,
        tempMin:      r1(w.temp_min),
        tempMax:      r1(w.temp_max),
        soilTemp:     null,             // no en backend (pendiente: añadir a weather_cache)
        rainfall14d:  r1(w.rainfall14d ?? null),
        humidity:     r0(w.humidity),
        wind:         r0(w.wind),
        dryDays:      apiZone?.score?.score_detail?.days_since_rain ?? null,  // desde OI score_detail
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
