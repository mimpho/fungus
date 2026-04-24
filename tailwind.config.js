/** @type {import('tailwindcss').Config} */

// Helper: generates a Tailwind-compatible color that supports opacity modifiers.
// When used as text-cream/60, Tailwind injects the opacity as a CSS variable
// and we combine it with the RGB channel var.
// e.g. text-cream/60 → color: rgba(var(--color-cream-rgb), 0.6)
//      text-cream     → color: rgb(var(--color-cream-rgb))
function withOpacity(varName) {
  return ({ opacityValue }) =>
    opacityValue !== undefined
      ? `rgba(var(${varName}), ${opacityValue})`
      : `rgb(var(${varName}))`
}

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        sans:    ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        // Theme-aware colors — respond to [data-theme] via CSS vars + RGB channels
        cream:          withOpacity('--color-cream-rgb'),
        muted:          withOpacity('--color-muted-rgb'),
        coffee:         withOpacity('--color-coffee-rgb'),
        'coffee-light': 'var(--color-coffee-light)',   // no opacity usage
        'green-f':      'var(--color-green-f)',         // fixed, no opacity usage
        bar:            withOpacity('--color-bar-rgb'),
        modal:          withOpacity('--color-modal-rgb'),
        'bg-deep':      'var(--color-bg-deep)',
        'search-bg':    'var(--color-search-bg)',
      },
    },
  },
  plugins: [],
}
