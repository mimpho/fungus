/**
 * mobile/constants/Colors.ts
 *
 * Re-exports from shared/colors.ts and provides mobile-specific helpers.
 * Do NOT define colour values here — edit shared/colors.ts instead.
 *
 * Components should NOT import this file directly for theme-aware colours.
 * Use `useTheme()` from mobile/lib/useTheme.ts instead, which resolves
 * the correct palette (dark/light) based on user preference.
 *
 * This file remains useful for:
 *   - Static contexts where hooks can't be used (StyleSheet.create outside
 *     components, constants, etc.)
 *   - The dark palette as a safe default (app default is dark)
 *   - Fixed tokens (score colours, status colours)
 */

export {
  Raw,
  Fixed,
  darkPalette,
  lightPalette,
  palettes,
  type Palette,
  type ThemeMode,
} from '../../shared/colors'

import { darkPalette, Fixed } from '../../shared/colors'

// ── Legacy `Colors` export — dark theme values ───────────────────────────────
// Kept for backward compatibility while components migrate to useTheme().
// New components should use useTheme() instead.
export const Colors = {
  // Backgrounds
  bgDeep:       darkPalette.backgroundDeep,
  bg:           darkPalette.background,
  modal:        darkPalette.backgroundPanel,
  // Text
  cream:        darkPalette.textPrimary,
  muted:        darkPalette.textSecondary,
  // Accents
  coffee:       darkPalette.accent,
  coffeeLight:  darkPalette.accentLight,
  // Surfaces
  glass:        darkPalette.surfaceSubtle,
  glassWarm:    darkPalette.surfaceWarm,
  glassOlive:   darkPalette.surface,
  glassOlive80: darkPalette.surfaceHeavy,
  // Gradient
  gradientStart: darkPalette.gradientA,
  gradientMid:   darkPalette.gradientB,
  gradientEnd:   darkPalette.gradientC,
  // Fixed (same in both themes)
  green:    Fixed.greenF,
  bar:      Fixed.bar,
  positive: Fixed.positive,
  danger:   Fixed.danger,
  warning:  Fixed.warning,
} as const

export type AppColor = keyof typeof Colors

// ── Score colour — uses fixed tokens, theme-independent ──────────────────────
export function getScoreColor(score: number): string {
  if (score >= 85) return Fixed.positive
  if (score >= 70) return Fixed.greenF
  if (score >= 55) return Fixed.bar
  return Fixed.coffee
}
