// =====================================================
// Design tokens — fuente única de verdad para inline style={{ }} en JSX
// Para clases Tailwind usar los tokens definidos en tailwind.config.js:
//   text-cream, text-muted, text-coffee-light, text-green-f, bg-modal…
// Para inline styles usar las CSS vars: color: 'var(--color-cream)'
// =====================================================

export const COLORS = {
  // Textos
  cream:        'var(--color-cream)',        // #f4ebe1
  muted:        'var(--color-muted)',        // #d9cda1
  // Acentos
  coffee:       'var(--color-coffee)',       // #8b6f47
  coffeeLight:  'var(--color-coffee-light)', // #c4a06b
  // Verde forestal
  green:        'var(--color-green-f)',      // #4a7c59
  // Score intermedio
  bar:          'var(--color-bar)',          // #887b4b
  // Fondos
  bgDeep:       'var(--color-bg-deep)',      // #0f1f18
  modal:        'var(--color-modal)',        // #30372a
};

// Paleta modal — compartida por ZoneModal, SpeciesModal, ArticleModal, FamilyModal
export const MODAL = {
  bg:      'var(--color-modal)',    // #30372a
  overlay: 'var(--modal-overlay)', // #232522d9
};

// Colores de markers en el mapa Leaflet por tipo de bosque
// ⚠️ Deben ser hex — se usan en atributos SVG fill/stroke de Leaflet (no soportan CSS vars)
export const FOREST_COLORS = {
  pinar:   '#4a7c59',
  hayedo:  '#8b6f47',
  robledal:'#a0522d',
  encinar: '#6b8e23',
  mixto:   '#7a8c5e',
};

// Meses abreviados
export const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
