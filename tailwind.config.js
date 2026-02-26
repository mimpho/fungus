/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        // Design system Fungus
        cream:   '#f4ebe1',
        coffee:  '#8b6f47',
        'coffee-light': '#c4a06b',
        'green-dark':   '#4a7c59',
        'bg-dark':      '#0f1f18',
        'bg-mid':       '#1a2e22',
        'modal-bg':     '#30372a',
      },
    },
  },
  plugins: [],
}
