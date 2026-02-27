// =====================================================
// useWeatherConditions.js — Hook React para condiciones meteorológicas
//
// Gestiona el fetch de condiciones para múltiples zonas con:
//   - Caché localStorage (TTL 3h, gestionado en weatherService)
//   - Estado de carga + errores individuales por zona
//   - Fallback a fakeConditions si la API falla
// =====================================================
import { useState, useEffect, useRef } from 'react'
import { fetchAllZoneConditions, fetchZoneConditions } from '../services/weatherService'
import { fakeConditions } from '../lib/helpers'

// ─────────────────────────────────────────────────────────────────────────────
// useAllZoneConditions — para Zones y Dashboard (todas las zonas)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Carga condiciones meteorológicas para un array de zonas.
 *
 * @param {Array} zones  — array de objetos zona con { id, lat, lng }
 * @returns {{
 *   conditionsMap: Record<string, object>,
 *   loading: boolean,
 *   progress: { done: number, total: number },
 *   error: string | null,
 * }}
 */
export function useAllZoneConditions(zones) {
  const [conditionsMap, setConditionsMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [error, setError] = useState(null)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (!zones?.length) { setLoading(false); return }
    if (fetchedRef.current) return
    fetchedRef.current = true

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
        // Rellenar zonas sin datos con fakeConditions como fallback
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
        // Fallback completo a mock
        const fallback = {}
        zones.forEach(z => { fallback[z.id] = fakeConditions() })
        setConditionsMap(fallback)
        setLoading(false)
      })

    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Solo una vez al montar

  return { conditionsMap, loading, progress, error }
}

// ─────────────────────────────────────────────────────────────────────────────
// useZoneConditions — para ZoneModal (una sola zona)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Carga condiciones meteorológicas para una zona individual.
 * Ideal para ZoneModal donde se abre de una en una.
 *
 * @param {object} zone  — objeto zona con { id, lat, lng }
 * @returns {{
 *   conditions: object,
 *   loading: boolean,
 *   error: string | null,
 * }}
 */
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
  }, [zone?.id]) // Re-fetch si cambia la zona

  return { conditions, loading, error }
}
