// =====================================================
// useSpecies.js — Hook que carga el catálogo de especies desde el backend
//
// Reemplaza: import { mockSpecies } from '../data/species'
// En su lugar: const { species, loading, error } = useSpecies()
//
// Diseño:
//   - Inicializa con mockSpecies para render inmediato sin flash
//   - Carga del API en background (cursor pagination, 201 especies en 2 páginas)
//   - Cache en memoria compartida entre todas las instancias del hook
//   - Fallback automático a mockSpecies si el API no responde
//   - Los campos de detalle (cap, stem, photos...) solo están en list items
//     parcialmente — se cargan bajo demanda en SpeciesModal via fetchSpeciesDetail
// =====================================================
import { useState, useEffect } from 'react'
import { fetchAllSpecies } from '../services/apiService'
import { mockSpecies } from '../data/species'

// Cache en memoria: evita dobles fetches en React StrictMode y entre componentes
let _speciesCache = null      // array de especies ya cargadas
let _speciesPromise = null    // promesa en vuelo compartida

export function useSpecies() {
  const [species, setSpecies] = useState(_speciesCache ?? mockSpecies)
  const [loading, setLoading] = useState(_speciesCache === null)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Si la cache ya está lista, no hacer nada
    if (_speciesCache !== null) {
      setSpecies(_speciesCache)
      setLoading(false)
      return
    }

    let cancelled = false

    const load = async () => {
      if (!_speciesPromise) {
        _speciesPromise = fetchAllSpecies()
      }

      try {
        const apiSpecies = await _speciesPromise

        if (cancelled) return

        _speciesCache = apiSpecies
        _speciesPromise = null
        setSpecies(apiSpecies)
        setLoading(false)
      } catch (err) {
        if (cancelled) return

        console.warn('[useSpecies] API no disponible, usando mock data:', err)
        setError('No se pudieron cargar especies en tiempo real.')
        _speciesPromise = null
        // mockSpecies ya está en el estado inicial — no hay que cambiar nada
        setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, []) // Solo al montar — el catálogo es estable (TTL 1h en el backend)

  return { species, loading, error }
}
