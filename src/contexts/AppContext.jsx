// =====================================================
// AppContext — estado global de la app
// =====================================================
import { createContext, useContext, useState, useEffect } from 'react'
import { i18n } from '../data/i18n'
import { mockSpecies } from '../data/species'
import { mockZones } from '../data/zones'
import {
  apiLogin,
  apiRegister,
  apiGoogleLogin,
  apiLogout,
  apiRefresh,
  apiUpdateProfile,
  apiFollowZone,
  apiUnfollowZone,
  apiFavSpecies,
  apiUnfavSpecies,
  apiGetFavSpecies,
  apiGetFollowedZones,
  apiDeleteAccount,
  migrateLocalFavoritesToApi,
} from '../services/authService'

const AppContext = createContext(null)

const STORAGE_KEY = 'fungus_v3'

function loadStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function saveStorage(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
}

export function AppProvider({ children }) {
  const saved = loadStorage()

  // ── i18n ────────────────────────────────────────────────────────────────────
  const [lang, setLang] = useState(saved.lang || 'es')

  // ── User data (persisted in localStorage for guests, API for auth users) ───
  const [followedZones, setFollowedZones]     = useState(saved.zonas     || [])
  const [favoriteSpecies, setFavoriteSpecies] = useState(saved.favoritos || [])
  const [profile, setProfile]                 = useState(saved.profile   || { name: 'Mycologist', email: '' })

  // ── Auth ─────────────────────────────────────────────────────────────────────
  const [user, setUser]             = useState(null)
  const [authLoading, setAuthLoading] = useState(true)   // true until initial refresh resolves
  const [authModal, setAuthModal]   = useState(null)      // null | 'login' | 'register'
  const [isAdminView, setIsAdminView] = useState(false)  // admin nav visible only when toggled

  // ── Modal stack ─────────────────────────────────────────────────────────────
  const [selectedZone, setSelectedZone]       = useState(null)
  const [selectedSpecies, setSelectedSpecies] = useState(null)
  const [selectedFamily, setSelectedFamily]   = useState(null)
  const [lightbox, setLightbox]               = useState(null)

  // ── Persist lang + guest follows/favs to localStorage ───────────────────────
  // When authenticated, follows/favs are in the DB — we still keep localStorage
  // as a local cache so the UI is instant on page load.
  useEffect(() => {
    saveStorage({ lang, zonas: followedZones, favoritos: favoriteSpecies, profile })
  }, [lang, followedZones, favoriteSpecies, profile])

  // ── Silent session restore on mount ─────────────────────────────────────────
  useEffect(() => {
    apiRefresh().then(async restoredUser => {
      if (restoredUser) {
        setUser(restoredUser)
        await loadUserDataFromApi()
      }
      setAuthLoading(false)
    })
  }, [])

  const t = i18n[lang] || i18n.es
  const isAuthenticated = user !== null

  // ── Load user data (favorites + followed zones) from API ────────────────────
  // Called after any login / session restore. Resolves bare IDs returned by the
  // API against the local mock arrays so state stores full objects (same shape
  // as when the user toggles from the UI).
  async function loadUserDataFromApi() {
    try {
      const [favIds, zoneIds] = await Promise.all([
        apiGetFavSpecies(),
        apiGetFollowedZones(),
      ])
      const favSpecies = favIds
        .map(({ species_id }) => mockSpecies.find(s => s.id === species_id))
        .filter(Boolean)
      const zones = zoneIds
        .map(({ zone_id }) => mockZones.find(z => z.id === zone_id))
        .filter(Boolean)
      setFavoriteSpecies(favSpecies)
      setFollowedZones(zones)
    } catch {
      // Non-critical — keep whatever was in localStorage
    }
  }

  // ── Auth actions ─────────────────────────────────────────────────────────────

  async function login(email, password) {
    const data = await apiLogin(email, password)     // throws on error
    setUser(data.user)
    // Migrate localStorage follows/favs to API, then load the full server state
    const local = loadStorage()
    await migrateLocalFavoritesToApi(local.zonas || [], local.favoritos || [])
    await loadUserDataFromApi()
    setAuthModal(null)
    return data.user
  }

  async function register(email, password, firstName, lastName, birthDate) {
    const data = await apiRegister(email, password, firstName, lastName, birthDate)  // throws on error
    setUser(data.user)
    const local = loadStorage()
    await migrateLocalFavoritesToApi(local.zonas || [], local.favoritos || [])
    await loadUserDataFromApi()
    setAuthModal(null)
    return data.user
  }

  async function loginWithGoogle(idToken) {
    const data = await apiGoogleLogin(idToken)   // throws on error
    setUser(data.user)
    const local = loadStorage()
    await migrateLocalFavoritesToApi(local.zonas || [], local.favoritos || [])
    await loadUserDataFromApi()
    setAuthModal(null)
    return data.user
  }

  async function updateUserProfile(firstName, lastName, birthDate) {
    const updated = await apiUpdateProfile(firstName, lastName, birthDate)  // throws on error
    setUser(updated)
    return updated
  }

  async function logout() {
    await apiLogout()
    setUser(null)
    // Clear persisted follows/favs so a subsequent guest session starts clean
    setFollowedZones([])
    setFavoriteSpecies([])
    saveStorage({ lang, zonas: [], favoritos: [], profile })
  }

  async function deleteAccount() {
    await apiDeleteAccount()
    setUser(null)
    setFollowedZones([])
    setFavoriteSpecies([])
    saveStorage({ lang, zonas: [], favoritos: [], profile })
  }

  // ── Follow / Favorite toggles ────────────────────────────────────────────────
  // Auth gate: if not logged in, show login modal instead of acting.
  // When authenticated, updates both local state (instant UI) + API.

  function toggleFollow(zone) {
    if (!isAuthenticated) {
      setAuthModal('login')
      return
    }
    const isFollowing = followedZones.some(z => z.id === zone.id)
    if (isFollowing) {
      setFollowedZones(prev => prev.filter(z => z.id !== zone.id))
      apiUnfollowZone(zone.id).catch(() => {})   // fire and forget; local state is source of truth
    } else {
      setFollowedZones(prev => [...prev, zone])
      apiFollowZone(zone.id).catch(() => {})
    }
  }

  function toggleFavorite(species) {
    if (!isAuthenticated) {
      setAuthModal('login')
      return
    }
    const isFav = favoriteSpecies.some(s => s.id === species.id)
    if (isFav) {
      setFavoriteSpecies(prev => prev.filter(s => s.id !== species.id))
      apiUnfavSpecies(species.id).catch(() => {})
    } else {
      setFavoriteSpecies(prev => [...prev, species])
      apiFavSpecies(species.id).catch(() => {})
    }
  }

  return (
    <AppContext.Provider value={{
      // i18n
      lang, setLang, t,
      // persistentes
      followedZones, toggleFollow,
      favoriteSpecies, toggleFavorite,
      profile, setProfile,
      // auth
      user, isAuthenticated, authLoading,
      login, register, loginWithGoogle, logout, updateUserProfile, deleteAccount,
      authModal, setAuthModal,
      isAdminView, setIsAdminView,
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
