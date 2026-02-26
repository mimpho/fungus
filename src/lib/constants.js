// =====================================================
// Design tokens — fuente única de verdad para colores y constantes UI
// Usar estos valores en todos los componentes
// =====================================================

export const COLORS = {
  // Backgrounds
  bgDeep:    '#0f1f18',
  bgBase:    '#1a2e22',
  // Text
  cream:     '#f4ebe1',
  creamMuted:'#d9cda1',
  // Accents
  coffee:    '#8b6f47',
  coffeeMid: '#c4a06b',
  green:     '#4a7c59',
  greenBar:  '#887b4b',
  // Semantic
  positive:  '#059669',
  danger:    '#dc2626',
  warning:   '#d97706',
};

// Paleta modal — compartida por ZoneModal, SpeciesModal, ArticleModal, FamilyModal
export const MODAL = {
  bg:      '#30372a',      // fondo verde oscuro del modal
  overlay: '#232522d9',    // backdrop semitransparente
};

// Colores de markers en el mapa Leaflet por tipo de bosque
export const FOREST_COLORS = {
  pinar:   '#4a7c59',
  hayedo:  '#8b6f47',
  robledal:'#a0522d',
  encinar: '#6b8e23',
  mixto:   '#7a8c5e',
};

// Meses abreviados
export const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
