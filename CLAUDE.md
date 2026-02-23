# 🍄 Fungus — Claude Instructions

## Project Overview
Fungus es una app web de predicción micológica para Cataluña/España. Predice las mejores zonas y momentos para recolectar setas combinando datos meteorológicos, condiciones del suelo y un algoritmo de scoring.

**Versión actual**: v2.8.0 (standalone HTML)
**Estado**: Prototipo — todos los datos son mock, sin backend real aún.

---

## Arquitectura

- **Entregable principal**: Archivos HTML standalone autocontenidos en `standalone/` — **ESTE es el path principal de desarrollo**
- **Frontend React** en `frontend/` — secundario/experimental, no es el demo
- **Sin backend** — datos mockeados; mockAPIService simula delays de red (300-500ms)

---

## Estructura del Proyecto

```
fungus/
├── CLAUDE.md
├── README.md
├── CHANGELOG.md
├── docs/                    ← Documentación interna
├── frontend/                ← React app (CRA, secundario)
│   └── src/
│       ├── App.jsx          ← Componente raíz, toda la lógica UI
│       ├── ZonaModalMejorado.jsx  ← Modal 3 pestañas para zonas
│       ├── mockData.js      ← Schemas de datos + mockAPIService
│       └── index.js         ← Entry point React 18
└── standalone/              ← DESARROLLO PRINCIPAL
    ├── latest/              ← Versión activa (v2.8.0) — multi-archivo
    │   ├── index.html       ← Punto de entrada (~2 KB)
    │   ├── styles.css       ← CSS global
    │   ├── assets/images/   ← Fotos de especies (esp-XXX-main.jpg, esp-XXX-foto1.jpg)
    │   ├── data/            ← Datos mock como scripts ordinarios (sin JSX)
    │   │   ├── i18n.js
    │   │   ├── families.js
    │   │   ├── zones.js
    │   │   ├── species.js
    │   │   └── opportunities.js
    │   └── components/      ← Componentes React (type="text/babel")
    │       ├── helpers.js   ← React destructuring + IC icons + utils
    │       ├── UI.js        ← BottomPillPortal, Tabs
    │       ├── Lightbox.js
    │       ├── Map.js       ← LeafletMapInner, LeafletMap, MapFullscreenModal
    │       ├── FamilyModal.js
    │       ├── ZoneModal.js
    │       ├── SpeciesModal.js
    │       ├── Dashboard.js
    │       ├── Zones.js     ← incluye ZoneCard
    │       ├── Species.js
    │       ├── Profile.js
    │       └── App.js       ← App + ReactDOM.createRoot render
    └── archive/             ← Versiones anteriores (HTML monolíticos)
```

---

## Convenciones de Versionado

- Semver: `vMAJOR.MINOR.PATCH`
- El desarrollo activo ocurre en `standalone/latest/` (estructura multi-archivo)
- Las versiones anteriores se guardan como HTML monolíticos en `standalone/archive/`
- Al hacer un release, añadir entrada en `CHANGELOG.md`
- Versión actual: **v2.8.0**

---

## Stack Tecnológico (Standalone HTML)

| Tecnología | Versión | Cómo se carga |
|---|---|---|
| React + ReactDOM | 18 (production.min) | CDN unpkg |
| Tailwind CSS | latest | CDN |
| Babel Standalone | latest | CDN (transpila JSX en browser) |
| Leaflet.js | 1.9.4 | CDN (mapas interactivos) |
| Google Fonts | — | CDN (Cormorant Garamond + DM Sans) |

**Todo en un único archivo HTML** — sin proceso de build, sin dependencias npm.
JS/JSX escrito dentro de `<script type="text/babel">`.

---

## Comandos (Frontend React únicamente)

```bash
cd frontend
npm start        # Dev server
npm run build    # Build producción
npm test         # Tests
```

---

## Sistema de Diseño / Colores

```
Background:  gradiente #0f1f18 → #1a2e22 (verde oscuro)
Texto:       #f4ebe1 (crema)
Acento café: #8b6f47
Acento verde:#4a7c59
Positivo:    #059669 (emerald)
Peligro:     #dc2626 (rojo)
Advertencia: #d97706 (amber)
```

**Clases CSS especiales:**
- `.glass` — glass morphism (rgba white/0.04 + backdrop blur)
- `.glass-warm` — glass tono cálido
- `.grain` — textura de ruido SVG
- `.hover-lift` — translateY(-2px) en hover
- `.anim-up`, `.anim-right`, `.anim-scale` — animaciones keyframe

**Móvil (modal bottom sheet)**: `.modal-inner` con `position: fixed; bottom: 0` y `border-radius` solo arriba.

---

## Schemas de Datos

### Zone
```javascript
{
  id: 'zona-001',
  name: 'Pinar de Urbión',
  province: 'Soria',
  region: 'Pinares',
  lat: 41.9847,
  lng: -2.8547,
  elevation: 1850,            // metros
  forestType: 'pinar',        // pinar | hayedo | robledal | mixto | encinar
  ph_suelo: 5.8,
  tipo_suelo: 'franco',
  drenaje: 'bueno',
  especies_arboreas: ['Pinus sylvestris'],
  orientacion: 'norte'
}
```

### Species
```javascript
{
  id: 'esp-001',
  scientificName: 'Boletus edulis',
  commonNames: ['Boleto', 'Hongo calabaza', 'Cep'],
  family: 'Boletaceae',
  edibility: 'excelente',     // excelente | bueno | comestible | precaucion | toxico | mortal
  // === Solo en standalone ===
  photoUrl: 'assets/images/esp-001-main.jpg',
  photos: [{ url, caption }],
  fullDescription: '...',
  morfologia: { cap, hymenium, stem, flesh, sporePrint },
  synonyms: ['nombre regional 1', 'nombre regional 2'],
  distributionZones: ['zona-001', 'zona-003'],
  // === Condiciones óptimas ===
  temp_optima_min: 12.0,
  temp_optima_max: 18.0,
  humedad_min: 70.0,
  humedad_optima: 80.0,
  precip_14dias_min: 30.0,
  precip_14dias_max: 80.0,
  ph_suelo_min: 5.5,
  ph_suelo_max: 6.5,
  forestTypes: ['pinar', 'hayedo'],
  elevationMin: 600,
  elevationMax: 2000,
  fruitingMonths: [8, 9, 10, 11], // 1-based
  requiere_helada: false,
  requiere_choque_termico: true,
  dias_hasta_fructificacion: 7
}
```

### Score / Opportunity
```javascript
{
  zone_id, species_name,
  score_total: 92.5,           // 0-100 compuesto
  score_temperatura: 95.0,
  score_precipitacion: 88.0,
  score_humedad: 92.0,
  score_suelo: 97.0,
  score_fenologia: 85.0,
  probabilidad: 'excelente',   // excelente | muy_alta | alta | moderada | baja
  dias_estimados_fructificacion: 5,
  factores_positivos: ['Temperatura óptima (12.4°C)'],
  factores_negativos: []
}
```

### Mock Conditions (fakeConditions)
```javascript
{
  temperature: (10 + random*8).toFixed(1),
  soilTemp: (9 + random*7).toFixed(1),
  rainfall14d: (25 + random*60).toFixed(1),
  humidity: (65 + random*25).toFixed(0),
  wind: (5 + random*20).toFixed(0),
  dryDays: floor(random*6),
  overallScore: floor(60 + random*35)   // ⚠️ Siempre entre 60-95
}
```

### Family
```javascript
// mockFamilies: objeto keyed por nombre de familia
{
  id, name, description,
  characteristics: ['characteristic1', ...],
  iconEmoji: '🍄'
}
// 8 families: Boletaceae, Russulaceae, Cantharellaceae, Amanitaceae,
//             Pleurotaceae, Morchellaceae, Tricholomataceae, Cortinariaceae
```

---

## Algoritmo de Scoring (Estado Actual: Mockeado)

El scoring real NO está implementado aún. Los valores se generan con `Math.random()`.

**`fakeConditions()`** — genera condiciones aleatorias (se llama en render):
```javascript
{
  temperature, soilTemp, rainfall14d, humidity, wind,
  dryDays, overallScore  // ⚠️ overallScore siempre entre 60-95
}
```

**Termómetro UI** (`getScoreColor`):
- >= 85: emerald / "Excelente"
- >= 70: amber-brown / "Muy bueno"
- >= 55: amber / "Bueno"
- < 55: red / "Regular"

**Compatibilidad especie-zona**: `species.forestTypes.includes(zone.forestType)`
**Disponibilidad estacional**: `species.fruitingMonths.includes(new Date().getMonth() + 1)`

---

## Sistema i18n

Objeto plano `i18n` con 3 claves:
```javascript
const i18n = { es: {...}, ca: {...}, en: {...} }
const t = i18n[lang];  // Uso: {t.zonas}, {t.buscar}, etc.
```
Idiomas: Castellano / Català / English. Cambiable desde la sección Perfil.

---

## State Management

**Sin Redux, sin Context API** — `useState` plano en el componente raíz.

**localStorage standalone**: clave `'fungus_v3'`, guarda `{ zonas: followedZones, favoritos: favoriteSpecies, profile, lang }`
**localStorage React app**: clave `'fungus_seguimiento'`, guarda `followedZones[]`

**Estado raíz (standalone)**:
```javascript
const [view, setView] = useState('dashboard');       // dashboard|zonas|especies|profile
const [lang, setLang] = useState('es');
const [selectedZone, setSelectedZone] = useState(null);
const [selectedSpecies, setSelectedSpecies] = useState(null);
const [selectedFamily, setSelectedFamily] = useState(null);
const [lightbox, setLightbox] = useState(null);      // { photos, index }
const [followedZones, setFollowedZones] = useState([]);
const [favoriteSpecies, setFavoriteSpecies] = useState([]);
const [profile, setProfile] = useState({ name: 'Mycologist', email: '...' });
```

**Navegación standalone**: Dashboard / Zones / Species / Profile (4 items)
**Navegación React app**: Dashboard / Seguimiento / Zonas / Especies / Buscar (5 items)

---

## Componentes Clave (Standalone)

| Componente | Descripción |
|---|---|
| `App` | Raíz, todo el estado, persistencia localStorage |
| `Dashboard` | Stat cards + opportunity cards (SVG circle ring) + followed zones |
| `Zones` | 2 tabs: Leaflet Map / List con filtros y orden |
| `ZoneCard` | Card con condiciones estables via `useMemo(() => fakeConditions(), [zone.id])` |
| `ZoneModal` | Hero photo + thermometer + available species + calendar + location map |
| `Species` | Grid con búsqueda, filtro family, orden, favoritos, paginación (8/página) |
| `SpeciesModal` | Hero photo + morphology + gallery + distribution map + family |
| `FamilyModal` | Family info + species belonging to it |
| `Profile` | Notifications + personal data + language selector |
| `LeafletMapInner` | Leaflet map con markers coloreados por `forestType` |
| `LeafletMap` | Wrapper con botón expand → `MapFullscreenModal` |
| `Lightbox` | Full-screen photo viewer con nav teclado (← → Escape) |

**Colores markers Leaflet por forestType**:
- pinar: `#4a7c59` / hayedo: `#8b6f47` / robledal: `#a0522d` / encinar: `#6b8e23`

**Map tiles**: CartoDB Dark (`carto.basemaps.cartocdn.com/dark_all`)

---

## Datos en la Versión Actual

| Dataset | React mockData.js | Standalone v2.8.0 |
|---|---|---|
| Zones (`mockZones`) | 10 | 28 (toda España) |
| Species (`mockSpecies`) | 10 | 27 |
| Families (`mockFamilies`) | — | 8 |

---

## Reglas Importantes

1. **`standalone/latest/` es multi-archivo** — `index.html` + `data/` + `components/` + `assets/`
2. **`data/*.js`** son scripts JS puro (sin JSX), cargados con `<script src>` normal, síncronos
3. **`components/*.js`** usan JSX, cargados con `<script type="text/babel" src="...">`, evaluados en orden
4. **`components/helpers.js` debe ser el primer componente** — declara `const { useState, useEffect, ... } = React;` que todos los demás usan del scope global
5. **Para desarrollar**: requiere servidor HTTP — `cd standalone/latest && python3 -m http.server 8080` → `http://localhost:8080/index.html` (Babel no carga `src=` externos con `file://`)
6. El scoring es 100% mock — `fakeCond()` siempre devuelve 60-95
7. Usar `useMemo(() => fakeCond(), [zona.id])` para condiciones estables (evita flicker)
8. Las fotos de especies están en `assets/images/esp-XXX-main.jpg` y `esp-XXX-foto1.jpg` (scaffolding, serán reemplazadas por imágenes de calidad)
9. Modal stack manual: `selectedZona` → `selectedEspecie` → `selectedFamilia` → `lightbox`
10. Siempre mostrar disclaimer de seguridad en especies tóxicas/mortales

---

## Roadmap

### Próximo (v2.x)
- Actualizar `latest/` a v2.8.0
- Backend FastAPI + APIs meteorológicas reales (Meteocat/AEMET)
- Zonas personalizadas en mapa
- Exportar calendario a PDF
- Notificaciones push reales

### Futuro (v3.0)
- PostgreSQL + autenticación de usuarios
- App móvil (React Native)
- Fotografías comunitarias de avistamientos
- Algoritmo de scoring real (implementar la lógica de `calcularTermometro`)
