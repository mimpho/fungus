// Fungus design system — typography, glass, and reusable style patterns
// Mirrors the web app's visual identity from src/styles.css
//
// Font families — loaded via useFonts() in _layout.tsx:
//   CormorantGaramond_400Regular
//   CormorantGaramond_400Regular_Italic
//   CormorantGaramond_600SemiBold
//   CormorantGaramond_700Bold
//   DMSans_300Light
//   DMSans_400Regular
//   DMSans_500Medium
//   DMSans_600SemiBold
//
// Usage pattern:
//   const { colors, fixed } = useTheme()
//   const typo  = makeTypography(colors)
//   const glass = makeGlass(colors)
//   const grad  = makeGradient(colors)

import { TextStyle, ViewStyle, Platform } from 'react-native'
import { type Palette, darkPalette as _darkForLegacy } from '../../shared/colors'
import { useTheme } from './useTheme'

// ─── Font family constants ────────────────────────────────────────────────────

export const Font = {
  // Display / headings — Cormorant Garamond
  display: 'CormorantGaramond_700Bold',
  displaySemiBold: 'CormorantGaramond_600SemiBold',
  displayRegular: 'CormorantGaramond_400Regular',
  displayItalic: 'CormorantGaramond_400Regular_Italic',

  // Body / UI — DM Sans
  sans: 'DMSans_400Regular',
  sansLight: 'DMSans_300Light',
  sansMedium: 'DMSans_500Medium',
  sansSemiBold: 'DMSans_600SemiBold',
} as const

// ─── Typography factory ───────────────────────────────────────────────────────
// Returns a plain object of TextStyle values — identical shape to the old
// StyleSheet.create result, so all call sites keep working without change.

export function makeTypography(c: Palette) {
  return {
    // H1 equivalent — large display headings (zone names, species names)
    h1: {
      fontFamily: Font.display,
      fontSize: 32,
      lineHeight: 38,
      color: c.textPrimary,
      letterSpacing: 0.3,
    } as TextStyle,

    // H2 — section headings
    h2: {
      fontFamily: Font.displaySemiBold,
      fontSize: 24,
      lineHeight: 30,
      color: c.textPrimary,
      letterSpacing: 0.2,
    } as TextStyle,

    // H3 — card titles, sub-headings
    h3: {
      fontFamily: Font.displaySemiBold,
      fontSize: 18,
      lineHeight: 24,
      color: c.textPrimary,
    } as TextStyle,

    // Screen title (shown in header bar)
    screenTitle: {
      fontFamily: Font.sansSemiBold,
      fontSize: 17,
      color: c.textPrimary,
    } as TextStyle,

    // Body — main body copy
    body: {
      fontFamily: Font.sans,
      fontSize: 15,
      lineHeight: 22,
      color: c.textPrimary,
    } as TextStyle,

    // Body small — labels, metadata
    bodySmall: {
      fontFamily: Font.sans,
      fontSize: 13,
      lineHeight: 18,
      color: c.textSecondary,
    } as TextStyle,

    // Caption — timestamps, secondary metadata
    caption: {
      fontFamily: Font.sansLight,
      fontSize: 12,
      lineHeight: 16,
      color: c.textSecondary,
    } as TextStyle,

    // Label — tab labels, button text, uppercase badges
    label: {
      fontFamily: Font.sansMedium,
      fontSize: 11,
      letterSpacing: 0.5,
      color: c.textPrimary,
    } as TextStyle,

    // Score — large number display
    score: {
      fontFamily: Font.display,
      fontSize: 48,
      lineHeight: 54,
      color: c.textPrimary,
    } as TextStyle,

    // Italic caption — species scientific names
    italic: {
      fontFamily: Font.displayItalic,
      fontSize: 14,
      lineHeight: 20,
      color: c.textSecondary,
    } as TextStyle,
  }
}

// ─── Glass / card surfaces factory ───────────────────────────────────────────
// Mirrors the web's glass-olive, glass-warm etc. surfaces.
//
// Android cannot render shadows on semi-transparent backgrounds (rgba).
// Solution: two-layer approach —
//   panelShadow (outer): solid opaque bg matching the app bg + shadow/elevation
//   panel (inner):       the actual glass rgba color, borderRadius, no shadow
// On iOS, panel carries its own shadow directly (no issue with rgba).

export function makeGlass(c: Palette) {
  return {
    panelShadow: {
      borderRadius: 12,
      backgroundColor: c.background,
      ...(Platform.OS !== 'android' ? {
        shadowColor: '#0a0f08',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
      } : {
        elevation: 3,
      }),
    } as ViewStyle,

    panel: {
      backgroundColor: c.surface,
      borderRadius: 12,
    } as ViewStyle,

    // Warm glass — highlighted / selected items
    warm: {
      backgroundColor: c.surfaceWarm,
      borderRadius: 12,
    } as ViewStyle,

    warmShadow: {
      borderRadius: 12,
      backgroundColor: c.background,
      ...(Platform.OS !== 'android' ? {
        shadowColor: '#0a0f08',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.28,
        shadowRadius: 6,
      } : {
        elevation: 2,
      }),
    } as ViewStyle,

    // Heavy glass — overlays, bottom sheets (glass-olive-80)
    heavy: {
      backgroundColor: c.surfaceHeavy,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.borderAccent,
    } as ViewStyle,

    // Subtle glass — list items, row highlights (minimal shadow)
    subtle: {
      backgroundColor: c.surfaceSubtle,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 2,
    } as ViewStyle,
  }
}

// ─── Layout helpers ───────────────────────────────────────────────────────────
// These are layout-only (no colour) so they stay as plain constants.

export const Layout = {
  screen: {
    flex: 1,
  } as ViewStyle,

  section: {
    paddingHorizontal: 16,
  } as ViewStyle,

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,

  center: {
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
} as const

// ─── Gradient factory ─────────────────────────────────────────────────────────
// Passed to <LinearGradient> in Background.tsx

export function makeGradient(c: Palette) {
  return {
    background: {
      colors: [c.gradientA, c.gradientB, c.gradientC] as const,
      locations: [0, 0.5, 1] as const,
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
  } as const
}

// ─── Convenience hook ─────────────────────────────────────────────────────────
// Composes useTheme + all factories so components can do:
//   const { typo, glass, grad, colors, fixed } = useStyles()

export { useTheme }

export function useStyles() {
  const theme = useTheme()
  return {
    ...theme,
    typo:  makeTypography(theme.colors),
    glass: makeGlass(theme.colors),
    grad:  makeGradient(theme.colors),
  }
}

// ─── Legacy re-exports (backward compat during migration) ─────────────────────
// Components still importing { Typography, Glass, Gradient } directly will keep
// working — they'll just always get dark-theme values until migrated.
// TODO: remove these once all components use useStyles() or useTheme().

/** @deprecated Use useStyles() from mobile/lib/theme.ts */
export const Typography = makeTypography(_darkForLegacy)
/** @deprecated Use useStyles() from mobile/lib/theme.ts */
export const Glass = makeGlass(_darkForLegacy)
/** @deprecated Use useStyles() from mobile/lib/theme.ts */
export const Gradient = makeGradient(_darkForLegacy)
