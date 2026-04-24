// Global app state — Zustand store
// Each component subscribes only to the slice it needs,
// avoiding unnecessary re-renders (unlike React Context).
//
// Usage:
//   const lang = useAppStore(s => s.lang)
//   const { setLang, t } = useAppStore(s => ({ setLang: s.setLang, t: s.t }))

import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Lang, LANGS } from '../lib/constants'
import { Translations, getTranslations } from '../lib/i18n'
import { type ThemeMode } from '../../shared/colors'

export interface UserProfile {
  id: string
  email: string
  role: 'user' | 'admin'
  emailVerified: boolean
}

interface AppState {
  // Language
  lang: Lang
  t: Translations
  setLang: (lang: Lang) => void

  // Theme — 'system' follows OS preference, 'dark'/'light' override it
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => void

  // Auth
  profile: UserProfile | null
  setProfile: (profile: UserProfile | null) => void

  // Followed zones (IDs)
  followedZones: string[]
  toggleFollow: (zoneId: string) => void

  // Favourite species (IDs)
  favoriteSpecies: string[]
  toggleFavorite: (speciesId: string) => void

  // Hydrate persisted state from AsyncStorage on app start
  hydrate: () => Promise<void>
}

const STORAGE_KEY = 'fungus_app_state_v1'

export const useAppStore = create<AppState>((set, get) => ({
  lang: 'es',
  t: getTranslations('es'),
  setLang: async (lang) => {
    set({ lang, t: getTranslations(lang) })
    await _persist(get())
  },

  themeMode: 'system',
  setThemeMode: async (themeMode) => {
    set({ themeMode })
    await _persist(get())
  },

  profile: null,
  setProfile: (profile) => set({ profile }),

  followedZones: [],
  toggleFollow: async (zoneId) => {
    const current = get().followedZones
    const next = current.includes(zoneId)
      ? current.filter((id) => id !== zoneId)
      : [...current, zoneId]
    set({ followedZones: next })
    await _persist(get())
  },

  favoriteSpecies: [],
  toggleFavorite: async (speciesId) => {
    const current = get().favoriteSpecies
    const next = current.includes(speciesId)
      ? current.filter((id) => id !== speciesId)
      : [...current, speciesId]
    set({ favoriteSpecies: next })
    await _persist(get())
  },

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const saved = JSON.parse(raw) as Partial<AppState>
      const lang = LANGS.includes(saved.lang as Lang) ? (saved.lang as Lang) : 'es'
      const validModes: ThemeMode[] = ['dark', 'light', 'system']
      const themeMode = validModes.includes(saved.themeMode as ThemeMode)
        ? (saved.themeMode as ThemeMode)
        : 'system'
      set({
        lang,
        t: getTranslations(lang),
        themeMode,
        followedZones: saved.followedZones ?? [],
        favoriteSpecies: saved.favoriteSpecies ?? [],
      })
    } catch {
      // Corrupted storage — reset silently
    }
  },
}))

// Persist non-sensitive state (lang, theme, follows, favorites) to AsyncStorage
async function _persist(state: AppState) {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        lang: state.lang,
        themeMode: state.themeMode,
        followedZones: state.followedZones,
        favoriteSpecies: state.favoriteSpecies,
      }),
    )
  } catch {
    // Storage write failed — ignore
  }
}
