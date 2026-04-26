/**
 * shared/colors.ts — Fungus design system · Single Source of Truth
 *
 * This file is the ONLY place where colour values are defined.
 * Both mobile and web derive their tokens from here:
 *
 *   mobile  → mobile/constants/Colors.ts  (direct import)
 *   web     → scripts/generate-css-vars.ts → src/styles.css (:root block)
 *
 * Structure:
 *   1. Raw tokens   — named hex/rgba values, no semantic meaning
 *   2. Palettes     — dark + light: map semantic roles to raw tokens
 *   3. Fixed tokens — score, status colours; same in both themes
 *   4. Theme type   — TypeScript shape consumed by useTheme()
 */

// ─── 1. Raw tokens ────────────────────────────────────────────────────────────

export const Raw = {
  // Olive greens — brand identity
  oliveDark:    '#0f1f18',
  oliveMid:     '#2b3529',
  olivePanel:   '#30372a',
  oliveSearch:  '#4c5240',
  oliveDeep:    '#1e2419',

  // Gradient stops (dark background)
  gradDarkA:    'rgb(43,53,41)',
  gradDarkB:    'rgb(61,69,54)',
  gradDarkC:    'rgb(67,66,28)',

  // Gradient stops (light background — warm cream tones)
  gradLightA:   'rgb(240,237,230)',
  gradLightB:   'rgb(232,226,212)',
  gradLightC:   'rgb(224,215,190)',

  // Text
  cream:        '#f4ebe1',
  muted:        '#d9cda1',
  darkText:     '#2b2a1f',
  darkMuted:    '#6b6045',

  // Accents — coffee / warm brown
  coffee:       '#8b6f47',
  coffeeLight:  '#c4a06b',
  coffeeDark:   '#6b4f2a',
  coffeeDarker: '#8b6030',

  // Positive green
  greenF:       '#4a7c59',
  bar:          '#887b4b',

  // Glass layers — dark theme
  glassDarkWhite:  'rgba(255,255,255,0.04)',
  glassDarkWarm:   'rgba(139,111,71,0.08)',
  glassDarkOlive:  'rgba(63,73,59,0.50)',
  glassDarkOlive80:'rgba(63,73,59,0.80)',

  // Glass layers — light theme
  glassLightWhite:  'rgba(255,255,255,0.60)',
  glassLightWarm:   'rgba(139,111,71,0.06)',
  glassLightSurface:'rgba(255,255,255,0.70)',
  glassLightHeavy:  'rgba(255,255,255,0.85)',

  // Surface subtle/hover — row backgrounds, info boxes, placeholders
  // Dark: white tint · Light: dark tint (so rows are visible on white bg)
  surfaceDarkSubtle:  'rgba(255,255,255,0.04)',
  surfaceDarkMid:     'rgba(255,255,255,0.05)',
  surfaceDarkHover:   'rgba(255,255,255,0.07)',
  surfaceDarkInput:   'rgba(255,255,255,0.04)',
  surfaceDarkDivider: 'rgba(255,255,255,0.08)',
  surfaceLightSubtle: 'rgba(0,0,0,0.04)',
  surfaceLightMid:    'rgba(0,0,0,0.05)',
  surfaceLightHover:  'rgba(0,0,0,0.07)',
  surfaceLightInput:  'rgba(0,0,0,0.06)',
  surfaceLightDivider:'rgba(0,0,0,0.08)',

  // Bar (score indicator) — different hue per theme
  barDark:  '#887b4b',   // gold-brown
  barLight: '#758847',   // olive-green

  // Overlays
  overlayDark:  '#232522d9',   // rgba(35,37,34,0.85)
  overlayLight: 'rgba(200,195,180,0.75)',

  // Borders
  borderDark:   'rgba(255,255,255,0.08)',
  borderLight:  'rgba(0,0,0,0.10)',
  borderWarmD:  'rgba(139,111,71,0.20)',
  borderWarmL:  'rgba(139,111,71,0.25)',
  borderAccentD:'rgba(196,160,107,0.15)',
  borderAccentL:'rgba(139,111,71,0.20)',
} as const

// ─── 2. Palettes ──────────────────────────────────────────────────────────────
// Semantic roles → raw tokens. Add new roles here; never reference Raw directly
// in components.

export const darkPalette = {
  // Backgrounds
  background:       Raw.oliveMid,        // main screen bg / gradient base
  backgroundDeep:   Raw.oliveDark,       // deepest bg (map, under gradient)
  backgroundPanel:  Raw.olivePanel,      // modal / sheet bg

  // Gradient
  gradientA:        Raw.gradDarkA,
  gradientB:        Raw.gradDarkB,
  gradientC:        Raw.gradDarkC,

  // Surfaces (glass layers)
  surface:          Raw.glassDarkOlive,    // card / panel glass
  surfaceHeavy:     Raw.glassDarkOlive80,  // tab bar / sheet bg
  surfaceWarm:      Raw.glassDarkWarm,     // warm highlight
  surfaceSubtle:    Raw.surfaceDarkSubtle, // subtle row bg (invisible content areas)
  surfaceMid:       Raw.surfaceDarkMid,    // slightly more visible than subtle
  surfaceHover:     Raw.surfaceDarkHover,  // pressed/hovered row bg
  surfaceInput:     Raw.surfaceDarkInput,  // form input bg
  surfaceDivider:   Raw.surfaceDarkDivider,// separator lines
  tabsBg:           Raw.glassDarkWhite,    // switcher/tabs container bg
  searchBg:         Raw.oliveSearch,       // search pill solid bg

  // Accent positive — readable on dark bg
  accentPositive:       '#34d399',              // light green
  accentPositiveSubtle: 'rgba(52,211,153,0.10)',

  // Nav active
  navActiveBg:   'rgba(217,206,161,0.10)',
  navActiveText: Raw.muted,

  // Bar (score indicator)
  bar: Raw.barDark,

  // Text
  textPrimary:      Raw.cream,
  textSecondary:    Raw.muted,

  // Accents
  accent:           Raw.coffee,
  accentLight:      Raw.coffeeLight,

  // Borders
  border:           Raw.borderDark,
  borderWarm:       Raw.borderWarmD,
  borderAccent:     Raw.borderAccentD,

  // Overlay (modal backdrop)
  overlay:          Raw.overlayDark,

  // Shadow base colour (for Android elevation + iOS shadow)
  shadow:           '#0a0f08',
} as const

export const lightPalette = {
  // Backgrounds
  background:       Raw.gradLightA,
  backgroundDeep:   Raw.gradLightC,
  backgroundPanel:  'rgba(255,255,255,0.92)',

  // Gradient
  gradientA:        Raw.gradLightA,
  gradientB:        Raw.gradLightB,
  gradientC:        Raw.gradLightC,

  // Surfaces
  surface:          Raw.glassLightSurface,
  surfaceHeavy:     Raw.glassLightHeavy,
  surfaceWarm:      Raw.glassLightWarm,
  surfaceSubtle:    Raw.surfaceLightSubtle, // dark tint — visible on white bg
  surfaceMid:       Raw.surfaceLightMid,
  surfaceHover:     Raw.surfaceLightHover,
  surfaceInput:     Raw.surfaceLightInput,
  surfaceDivider:   Raw.surfaceLightDivider,
  tabsBg:           Raw.glassLightWhite,    // white glass — visible on light bg
  searchBg:         '#e8e2d4',

  // Accent positive — readable on light bg
  accentPositive:       '#059669',              // dark green
  accentPositiveSubtle: 'rgba(5,150,105,0.10)',

  // Nav active
  navActiveBg:   'rgba(136,133,87,0.10)',
  navActiveText: 'rgb(136,133,87)',

  // Bar (score indicator)
  bar: Raw.barLight,

  // Text
  textPrimary:      Raw.darkText,
  textSecondary:    Raw.darkMuted,

  // Accents
  accent:           Raw.coffeeDark,
  accentLight:      Raw.coffeeDarker,

  // Borders
  border:           Raw.borderLight,
  borderWarm:       Raw.borderWarmL,
  borderAccent:     Raw.borderAccentL,

  // Overlay
  overlay:          Raw.overlayLight,

  // Shadow
  shadow:           'rgba(0,0,0,0.18)',
} as const

// ─── 3. Fixed tokens — same in both themes ────────────────────────────────────

export const Fixed = {
  positive:  '#059669',   // Emerald — excellent score (≥85)
  greenF:    '#4a7c59',   // Good score (≥70)
  bar:       '#887b4b',   // Moderate score (≥55)
  coffee:    '#8b6f47',   // Low score (<55) / fallback accent
  danger:    '#dc2626',   // Toxic / lethal species
  warning:   '#d97706',   // Caution species
} as const

// ─── 4. Theme type ────────────────────────────────────────────────────────────
// Palette is defined structurally (all values typed as `string`) so that both
// darkPalette and lightPalette satisfy it — otherwise TypeScript infers the
// type as `typeof darkPalette`, which locks every value to its literal string.

export type Palette = {
  // Backgrounds
  background:       string
  backgroundDeep:   string
  backgroundPanel:  string
  // Gradient
  gradientA:        string
  gradientB:        string
  gradientC:        string
  // Surfaces
  surface:              string
  surfaceHeavy:         string
  surfaceWarm:          string
  surfaceSubtle:        string
  surfaceMid:           string
  surfaceHover:         string
  surfaceInput:         string
  surfaceDivider:       string
  tabsBg:               string
  searchBg:             string
  // Text
  textPrimary:          string
  textSecondary:        string
  // Accents
  accent:               string
  accentLight:          string
  accentPositive:       string
  accentPositiveSubtle: string
  // Nav
  navActiveBg:          string
  navActiveText:        string
  // Bar (score indicator — theme-dependent hue)
  bar:                  string
  // Borders
  border:               string
  borderWarm:           string
  borderAccent:         string
  // Overlay
  overlay:              string
  // Shadow base colour
  shadow:               string
}

export type ThemeMode = 'dark' | 'light' | 'system'

export const palettes: Record<'dark' | 'light', Palette> = {
  dark:  darkPalette,
  light: lightPalette,
}
