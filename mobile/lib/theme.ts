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

import { StyleSheet, TextStyle, ViewStyle } from 'react-native'
import { Colors } from '../constants/Colors'

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

// ─── Typography presets ───────────────────────────────────────────────────────
// Mirrors heading/body scale from the web

export const Typography = StyleSheet.create({
  // H1 equivalent — large display headings (zone names, species names)
  h1: {
    fontFamily: Font.display,
    fontSize: 32,
    lineHeight: 38,
    color: Colors.cream,
    letterSpacing: 0.3,
  } as TextStyle,

  // H2 — section headings
  h2: {
    fontFamily: Font.displaySemiBold,
    fontSize: 24,
    lineHeight: 30,
    color: Colors.cream,
    letterSpacing: 0.2,
  } as TextStyle,

  // H3 — card titles, sub-headings
  h3: {
    fontFamily: Font.displaySemiBold,
    fontSize: 18,
    lineHeight: 24,
    color: Colors.cream,
  } as TextStyle,

  // Screen title (shown in header bar)
  screenTitle: {
    fontFamily: Font.sansSemiBold,
    fontSize: 17,
    color: Colors.cream,
  } as TextStyle,

  // Body — main body copy
  body: {
    fontFamily: Font.sans,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.cream,
  } as TextStyle,

  // Body small — labels, metadata
  bodySmall: {
    fontFamily: Font.sans,
    fontSize: 13,
    lineHeight: 18,
    color: Colors.muted,
  } as TextStyle,

  // Caption — timestamps, secondary metadata
  caption: {
    fontFamily: Font.sansLight,
    fontSize: 12,
    lineHeight: 16,
    color: Colors.muted,
  } as TextStyle,

  // Label — tab labels, button text, uppercase badges
  label: {
    fontFamily: Font.sansMedium,
    fontSize: 11,
    letterSpacing: 0.5,
    color: Colors.cream,
  } as TextStyle,

  // Score — large number display
  score: {
    fontFamily: Font.display,
    fontSize: 48,
    lineHeight: 54,
    color: Colors.cream,
  } as TextStyle,

  // Italic caption — species scientific names
  italic: {
    fontFamily: Font.displayItalic,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.muted,
  } as TextStyle,
})

// ─── Glass / card surfaces ────────────────────────────────────────────────────
// Mirrors the web's glass-olive, glass-warm etc. surfaces

export const Glass = StyleSheet.create({
  // Standard glass panel — used for cards
  // Web: .glass-olive has no border; shadow applied on hover via .hover-lift.
  // Mobile: resting shadow (no border) to match web card aesthetic.
  panel: {
    backgroundColor: Colors.glassOlive,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 4,
  } as ViewStyle,

  // Warm glass — highlighted / selected items
  warm: {
    backgroundColor: Colors.glassWarm,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  } as ViewStyle,

  // Heavy glass — overlays, bottom sheets (glass-olive-80)
  // Keeps a border — used for floating panels where a defined edge helps.
  heavy: {
    backgroundColor: Colors.glassOlive80,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(196,160,107,0.15)',
  } as ViewStyle,

  // Subtle glass — list items, row highlights (minimal shadow)
  subtle: {
    backgroundColor: Colors.glass,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  } as ViewStyle,
})

// ─── Layout helpers ───────────────────────────────────────────────────────────

export const Layout = StyleSheet.create({
  // Full-screen container (for screens that manage their own scroll)
  screen: {
    flex: 1,
  } as ViewStyle,

  // Standard horizontal padding
  section: {
    paddingHorizontal: 16,
  } as ViewStyle,

  // Row with space-between
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,

  // Centered content
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
})

// ─── Gradient config ─────────────────────────────────────────────────────────
// Passed to <LinearGradient> in Background.tsx

export const Gradient = {
  // Body background — matches web linear-gradient(135deg, ...)
  background: {
    colors: [Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd] as const,
    locations: [0, 0.5, 1] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
} as const
