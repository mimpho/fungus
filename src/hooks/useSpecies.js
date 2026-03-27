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

const SPECIES_REFRESH_EVENT = 'fungus:species-list-invalidated'

/**
 * Invalida la caché de la lista de especies para todos los idiomas y notifica
 * a todos los useSpecies montados para que recarguen inmediatamente.
 * Llamar después de cualquier mutación admin (set-order, PATCH /images).
 */
export function invalidateSpeciesListCache() {
  Object.keys(_speciesCache).forEach(lang => delete _speciesCache[lang])
  Object.keys(_speciesPromises).forEach(lang => delete _speciesPromises[lang])
  window.dispatchEvent(new Event(SPECIES_REFRESH_EVENT))
}

/**
 * Actualiza en el caché la foto principal Y la galería de una especie concreta
 * sin vaciar ni recargar toda la lista. Evita el flash de mockSpecies al guardar
 * desde el generador admin.
 *
 * Si la especie no se encuentra en ningún idioma del caché, invalida el caché
 * entero como fallback garantizado (fuerza un re-fetch).
 *
 * @param {object} updatedSpecies - Raw SpeciesDetail del API (snake_case)
 *   Debe tener: id, extra_data.photo.url (o photo_url como fallback)
 */
export function patchSpeciesPhotoInCache(updatedSpecies) {
  const newPhotoUrl =
    updatedSpecies?.extra_data?.photo?.url ??
    updatedSpecies?.photo_url ??
    null
  // If no main photo to patch, just invalidate and let the list re-fetch
  if (!newPhotoUrl) {
    invalidateSpeciesListCache()
    return
  }

  const newPhotos = updatedSpecies?.extra_data?.photos ?? []
  let patched = false

  Object.keys(_speciesCache).forEach(lang => {
    if (!_speciesCache[lang]) return
    const idx = _speciesCache[lang].findIndex(s => s.id === updatedSpecies.id)
    if (idx < 0) return
    patched = true
    const existing = _speciesCache[lang][idx]
    _speciesCache[lang] = [
      ..._speciesCache[lang].slice(0, idx),
      {
        ...existing,
        photo:  { url: newPhotoUrl },  // main photo — drives SpeciesCard
        photos: newPhotos,             // gallery — drives GallerySection
      },
      ..._speciesCache[lang].slice(idx + 1),
    ]
  })

  if (!patched) {
    // Species was not in any lang cache — invalidate so the next render re-fetches
    invalidateSpeciesListCache()
    return
  }

  // Notify mounted useSpecies instances to read the patched cache
  window.dispatchEvent(new Event(SPECIES_REFRESH_EVENT))
}

export function useSpecies() {
  const { lang } = useApp()
  const [species, setSpecies] = useState(_speciesCache[lang] ?? mockSpecies)
  const [loading, setLoading] = useState(!_speciesCache[lang])
  const [error, setError] = useState(null)
  // Incrementar este contador fuerza el efecto de carga a re-ejecutarse
  const [refreshKey, setRefreshKey] = useState(0)

  // Escuchar invalidaciones del admin para refrescar sin necesidad de navegar
  useEffect(() => {
    const handler = () => setRefreshKey(k => k + 1)
    window.addEventListener(SPECIES_REFRESH_EVENT, handler)
    return () => window.removeEventListener(SPECIES_REFRESH_EVENT, handler)
  }, [])

  useEffect(() => {
    let cancelled = false

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

    const doLoad = async () => {
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

    doLoad()
    return () => { cancelled = true }
  }, [lang, refreshKey]) // refreshKey se incrementa cuando admin invalida el cache

  return { species, loading, error }
}
