/**
 * mobile/lib/useTheme.ts
 *
 * Returns the resolved colour palette and a helper to check the active theme.
 *
 * Priority:
 *   1. User override in store (themeMode = 'dark' | 'light')
 *   2. OS preference (themeMode = 'system') via useColorScheme()
 *   3. Fallback: dark
 *
 * Usage:
 *   const { colors, isDark } = useTheme()
 *   <View style={{ backgroundColor: colors.background }} />
 */

import { useColorScheme } from 'react-native'
import { palettes, Fixed, type Palette } from '../../shared/colors'
import { useAppStore } from '../store/useAppStore'

export interface Theme {
  colors: Palette
  fixed: typeof Fixed
  isDark: boolean
  isLight: boolean
}

export function useTheme(): Theme {
  const themeMode = useAppStore((s) => s.themeMode)
  const systemScheme = useColorScheme()  // 'dark' | 'light' | null

  const resolved: 'dark' | 'light' =
    themeMode === 'system'
      ? (systemScheme ?? 'dark')
      : themeMode

  return {
    colors: palettes[resolved],
    fixed:  Fixed,
    isDark:  resolved === 'dark',
    isLight: resolved === 'light',
  }
}
