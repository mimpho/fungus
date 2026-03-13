// =====================================================
// useSpecies.js — Hook que carga el catálogo de especies desde el backend
//
// Reemplaza: import { mockSpecies } from '../data/species'
// En su lugar: const { species, loading, error } = useSpecies()
//
// Diseño:
//   - Inicializa con mockSpecies para render inmediato sin flash
//   - Carga del API en background (cursor pagination)
//   - Cache en memoria por idioma: { es: [...], ca: [...], en: [...] }
//   - Reactivo al cambio de lang (useApp) — cambia idioma sin recargar la página
//   - Fallback automático a mockSpecies si el API no responde
// =====================================================
import { useState, useEffect } from 'react'
import { fetchAllSpecies } from '../services/apiService'
import { mockSpecies } from '../data/species'
import { useApp } from '../contexts/AppContext'

// Cache por idioma: evita re-fetches entre componentes y al montar dos veces (StrictMode)
const _speciesCache = {}    // { es: Species[], ca: Species[], en: Species[] }
const _speciesPromises = {} // { es: Promise, ca: Promise, en: Promise }

export function useSpecies() {
  const { lang } = useApp()
  const [species, setSpecies] = useState(_speciesCache[lang] ?? mockSpecies)
  const [loading, setLoading] = useState(!_speciesCache[lang])
  const [error, setError] = useState(null)

  useEffect(() => {
    // Si ya hay cache para este idioma, usarla directamente
    if (_speciesCache[lang]) {
      setSpecies(_speciesCache[lang])
      setLoading(false)
      return
    }

    // Mostrar mock mientras carga
    setSpecies(mockSpecies)
    setLoading(true)
    setError(null)

    let cancelled = false

    const load = async () => {
      if (!_speciesPromises[lang]) {
        _speciesPromises[lang] = fetchAllSpecies(lang)
      }

      try {
        const apiSpecies = await _speciesPromises[lang]

        if (cancelled) return

        _speciesCache[lang] = apiSpecies
        delete _speciesPromises[lang]
        setSpecies(apiSpecies)
        setLoading(false)
      } catch (err) {
        if (cancelled) return

        console.warn(`[useSpecies] API no disponible (lang=${lang}), usando mock data:`, err)
        setError('No se pudieron cargar especies en tiempo real.')
        delete _speciesPromises[lang]
        setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [lang]) // Re-ejecutar cuando cambia el idioma

  return { species, loading, error }
}
