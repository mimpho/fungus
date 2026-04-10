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

// Mapa provincia → Comunidad Autónoma
// Fuente única de verdad — usada en apiService.js para normalizar zonas del API
export const PROVINCE_TO_CCAA = {
  'Álava': 'País Vasco', 'Guipúzcoa': 'País Vasco', 'Vizcaya': 'País Vasco',
  'Huesca': 'Aragón', 'Teruel': 'Aragón', 'Zaragoza': 'Aragón',
  'Asturias': 'Asturias',
  'Cantabria': 'Cantabria',
  'Ávila': 'Castilla y León', 'Burgos': 'Castilla y León', 'León': 'Castilla y León',
  'Palencia': 'Castilla y León', 'Salamanca': 'Castilla y León', 'Segovia': 'Castilla y León',
  'Soria': 'Castilla y León', 'Valladolid': 'Castilla y León', 'Zamora': 'Castilla y León',
  'Albacete': 'Castilla-La Mancha', 'Ciudad Real': 'Castilla-La Mancha',
  'Cuenca': 'Castilla-La Mancha', 'Guadalajara': 'Castilla-La Mancha', 'Toledo': 'Castilla-La Mancha',
  'Barcelona': 'Cataluña', 'Girona': 'Cataluña', 'Lleida': 'Cataluña', 'Tarragona': 'Cataluña',
  'Badajoz': 'Extremadura', 'Cáceres': 'Extremadura',
  'A Coruña': 'Galicia', 'Lugo': 'Galicia', 'Ourense': 'Galicia', 'Pontevedra': 'Galicia',
  'La Rioja': 'La Rioja',
  'Madrid': 'Comunidad de Madrid',
  'Murcia': 'Región de Murcia',
  'Navarra': 'Navarra',
  'Alicante': 'Comunitat Valenciana', 'Castellón': 'Comunitat Valenciana', 'Valencia': 'Comunitat Valenciana',
  'Almería': 'Andalucía', 'Cádiz': 'Andalucía', 'Córdoba': 'Andalucía',
  'Granada': 'Andalucía', 'Huelva': 'Andalucía', 'Jaén': 'Andalucía',
  'Málaga': 'Andalucía', 'Sevilla': 'Andalucía',
};
