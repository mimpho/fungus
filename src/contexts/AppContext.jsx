// =====================================================
// AppContext — estado global de la app
// Equivalente al estado raíz de App.js en el standalone
// =====================================================
import { createContext, useContext, useState, useEffect } from 'react'
import { i18n } from '../data/i18n'

const AppContext = createContext(null)

const STORAGE_KEY = 'fungus_v3'

function loadStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

export function AppProvider({ children }) {
  const saved = loadStorage()

  const [lang, setLang]                       = useState(saved.lang || 'es')
  const [followedZones, setFollowedZones]     = useState(saved.zonas || [])
  const [favoriteSpecies, setFavoriteSpecies] = useState(saved.favoritos || [])
  const [profile, setProfile]                 = useState(saved.profile || { name: 'Mycologist', email: 'mimpho@gmail.com' })

  // Modal stack — state-based (Fase 4 migrará a URL params)
  const [selectedZone, setSelectedZone]       = useState(null)
  const [selectedSpecies, setSelectedSpecies] = useState(null)
  const [selectedFamily, setSelectedFamily]   = useState(null)
  const [lightbox, setLightbox]               = useState(null)  // { photos, index }

  // Persistir en localStorage cuando cambia algo relevante
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        lang, zonas: followedZones, favoritos: favoriteSpecies, profile
      }))
    } catch {}
  }, [lang, followedZones, favoriteSpecies, profile])

  const t = i18n[lang] || i18n.es

  function toggleFollow(zone) {
    setFollowedZones(prev =>
      prev.some(z => z.id === zone.id)
        ? prev.filter(z => z.id !== zone.id)
        : [...prev, zone]
    )
  }

  function toggleFavorite(species) {
    setFavoriteSpecies(prev =>
      prev.some(s => s.id === species.id)
        ? prev.filter(s => s.id !== species.id)
        : [...prev, species]
    )
  }

  return (
    <AppContext.Provider value={{
      // i18n
      lang, setLang, t,
      // persistentes
      followedZones, toggleFollow,
      favoriteSpecies, toggleFavorite,
      profile, setProfile,
      // modal stack
      selectedZone, setSelectedZone,
      selectedSpecies, setSelectedSpecies,
      selectedFamily, setSelectedFamily,
      lightbox, setLightbox,
    }}>
      {children}
    </AppContext.Provider>
  )
}

// Hook de conveniencia
export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
