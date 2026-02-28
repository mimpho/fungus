/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        sans:    ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        // ── Paleta Fungus ──────────────────────────────────────────────────
        // Fuente de verdad: reflejados como CSS vars en styles.css (:root)
        // → className:  text-cream, bg-modal, text-muted/60 …
        // → style={{ }}: color: 'var(--color-cream)' …

        // Textos
        cream:          '#f4ebe1',   // texto principal
        muted:          '#d9cda1',   // texto secundario / labels

        // Acentos cálidos
        coffee:         '#8b6f47',   // acento café (bordes, iconos)
        'coffee-light': '#c4a06b',   // café claro (hovers, textos interactivos)

        // Verde forestal
        'green-f':      '#4a7c59',   // verde fungus (badges, markers, divisores)

        // Score intermedio «Muy bueno»
        bar:            '#887b4b',

        // Fondos
        'bg-deep':      '#0f1f18',   // contenedores muy oscuros / mapa
        modal:          '#30372a',   // fondo modales y body base
      },
    },
  },
  plugins: [],
}
