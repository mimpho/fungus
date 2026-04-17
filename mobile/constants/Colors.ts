// Fungus design system — color palette
// Mirrors the web CSS custom properties in src/styles.css

export const Colors = {
  bg: '#30372a',        // Main background
  modal: '#1e2419',     // Modal / card background
  cream: '#f4ebe1',     // Primary text
  muted: '#d9cda1',     // Secondary text
  coffee: '#8b6f47',    // Accent, borders
  coffeeLight: '#a88b63',
  green: '#4a7c59',     // Positive indicator
  bar: '#887b4b',       // Score bar
  positive: '#059669',  // Emerald — excellent score
  danger: '#dc2626',    // Toxic / lethal species
  warning: '#d97706',   // Caution species
  glass: 'rgba(255,255,255,0.04)',
  glassWarm: 'rgba(139,111,71,0.08)',
} as const

export type AppColor = keyof typeof Colors

// Score color — mirrors getScoreColor in web helpers.jsx
export function getScoreColor(score: number): string {
  if (score >= 85) return Colors.positive
  if (score >= 70) return Colors.green
  if (score >= 55) return Colors.bar
  return Colors.coffee
}
