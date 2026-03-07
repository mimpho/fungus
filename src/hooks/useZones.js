// =====================================================
// useZones.js — Hook que carga zonas + scores desde el backend Fungus
//
// Reemplaza la combinación:
//   import { mockZones } from '../data/zones'
//   const { conditionsMap, loading } = useAllZoneConditions(mockZones)
//
// En su lugar usar:
//   const { zones, conditionsMap, loading, error } = useZones()
//
// Ventajas:
//   - 1 request al backend en vez de 200+ a Open-Meteo (fix 429)
//   - Zonas siempre actualizadas desde la BD
//   - Fallback automático a mockZones + fakeConditions si el API no responde
// =====================================================
import { useState, useEffect } from 'react'
import { fetchZones } from '../services/apiService'
import { mockZones } from '../data/zones'
import { fakeConditions } from '../lib/helpers'

// Cache en memoria para evitar dobles fetches (React StrictMode monta efectos dos veces)
let _zonesPromise = null

export function useZones() {
  // Inicializar con mockZones para render inmediato sin flash de contenido vacío
  const [zones, setZones] = useState(mockZones)
  const [conditionsMap, setConditionsMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      // Compartir la promesa en vuelo para evitar dobles fetches en StrictMode
      if (!_zonesPromise) {
        _zonesPromise = fetchZones()
      }

      try {
        const { zones: apiZones, conditionsMap: apiConditions } = await _zonesPromise

        if (cancelled) return

        // Nota: NO aplicamos applySpeciesModifier aquí porque el backend ya incluye
        // factores de especie (ripening) en el Outbreak Index. Aplicarlo encima
        // supondría un doble ajuste inconsistente con el modelo server-side.
        setZones(apiZones)
        setConditionsMap(apiConditions)
        setLoading(false)
        _zonesPromise = null
      } catch (err) {
        if (cancelled) return

        console.warn('[useZones] API no disponible, usando mock data:', err)
        setError('No se pudieron cargar datos en tiempo real.')

        // Fallback: mockZones ya está en el estado inicial; generar conditions sintéticas
        const fallback = {}
        mockZones.forEach(z => { fallback[z.id] = fakeConditions() })
        setConditionsMap(fallback)
        setLoading(false)
        _zonesPromise = null
      }
    }

    load()
    return () => { cancelled = true }
  }, []) // Solo al montar — el backend devuelve datos ya cacheados (TTL 1h)

  return { zones, conditionsMap, loading, error }
}
