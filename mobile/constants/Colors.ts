// Fungus design system — color palette
// Mirrors the web CSS custom properties in src/styles.css
//
// --color-bg-deep:      #0f1f18   (deepest bg, used under gradient)
// --color-bg:           #2b3529   (gradient start)
// --color-modal:        #30372a   (panel/card backgrounds)
// --color-cream:        #f4ebe1
// --color-muted:        #d9cda1
// --color-coffee:       #8b6f47
// --color-coffee-light: #c4a06b
// Gradient: 135deg, rgb(43,53,41) → rgb(61,69,54) → rgb(67,66,28)

export const Colors = {
  bgDeep: '#0f1f18',     // Deepest background (under gradient, map bg)
  bg: '#2b3529',         // Gradient start / fallback background
  modal: '#30372a',      // Panel / card backgrounds (--color-modal)
  cream: '#f4ebe1',      // Primary text
  muted: '#d9cda1',      // Secondary text
  coffee: '#8b6f47',     // Accent, borders
  coffeeLight: '#c4a06b', // --color-coffee-light (corrected)
  green: '#4a7c59',      // Positive indicator
  bar: '#887b4b',        // Score bar
  positive: '#059669',   // Emerald — excellent score
  danger: '#dc2626',     // Toxic / lethal species
  warning: '#d97706',    // Caution species
  // Glass layers — match web --glass-* variables
  glass: 'rgba(255,255,255,0.04)',
  glassWarm: 'rgba(139,111,71,0.08)',
  glassOlive: 'rgba(63,73,59,0.50)',      // --glass-olive
  glassOlive80: 'rgba(63,73,59,0.80)',    // --glass-olive-80
  // Gradient stops (used in Background component)
  gradientStart: 'rgb(43,53,41)',
  gradientMid: 'rgb(61,69,54)',
  gradientEnd: 'rgb(67,66,28)',
} as const

export type AppColor = keyof typeof Colors

// Score color — mirrors getScoreColor in web helpers.jsx
export function getScoreColor(score: number): string {
  if (score >= 85) return Colors.positive
  if (score >= 70) return Colors.green
  if (score >= 55) return Colors.bar
  return Colors.coffee
}
