// =====================================================
// useWeatherConditions.js — Hook React para condiciones meteorológicas
//
// Gestiona el fetch de condiciones para múltiples zonas con:
//   - Caché localStorage (TTL 3h, gestionado en weatherService)
//   - Estado de carga + errores individuales por zona
//   - Fallback a fakeConditions si la API falla
// =====================================================
import { useState, useEffect } from 'react'
import { fetchAllZoneConditions, fetchZoneConditions } from '../services/weatherService'
import { fakeConditions } from '../lib/helpers'

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
          complete[z.id] = map[z.id] ?? fakeConditions()
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

  useEffect(() => {
    if (!zone) return
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchZoneConditions(zone)
      .then(cond => {
        if (!cancelled) { setConditions(cond); setLoading(false) }
      })
      .catch(err => {
        if (!cancelled) {
          console.warn('[useZoneConditions] fetch failed:', err)
          setError('No se pudieron cargar datos en tiempo real.')
          setConditions(fakeConditions())
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [zone?.id])

  return { conditions, loading, error }
}
