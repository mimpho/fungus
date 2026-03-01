# 🍄 Fungus — Claude Instructions

## Project Overview

Fungus es una app web de predicción micológica para Cataluña/España. Predice las mejores zonas y momentos para recolectar setas combinando datos meteorológicos reales, condiciones del suelo y un algoritmo de scoring con factor estacional.

**Versión actual**: v3.1.0 (Vite + React Router, rama `main`)
**Estado**: Prototipo funcional — datos meteorológicos reales via Open-Meteo, catálogo de datos mock (28 zonas, 27 especies, 8 familias), sin backend propio. Modales con URL slugs y navegación browser-native (back/ESC).
**Deploy**: Vercel → `fungus-git-feat-vite-migration-mimphos-projects.vercel.app`
**Backend spec**: `docs/backend_architecture.md` — propuesta FastAPI + PostgreSQL + PostGIS (v4.0)

---

## Arquitectura

- **Entregable principal**: App Vite en `frontend/` — **ESTE es el path activo de desarrollo**
- **Standalone legacy**: `standalone/latest/` — archivos HTML multi-archivo con Babel standalone. Ya no es el path activo pero se mantiene como referencia.
- **Sin backend propio** — meteorología via Open-Meteo (API pública), resto de datos mockeados en `src/data/`

---

## Estructura del Proyecto

```
fungus/
├── CLAUDE.md
├── README.md
├── CHANGELOG.md
├── frontend/                ← DESARROLLO PRINCIPAL (Vite 6 + React Router)
│   ├── vite.config.js       ← code splitting manual (react-vendor, leaflet-vendor, data-*)
│   ├── index.html
│   └── src/
│       ├── App.jsx          ← Router + AppProvider + ModalRenderer + ScrollToTop
│       ├── styles.css       ← CSS global (glass, progress-bar, scrollbar, animaciones)
│       ├── contexts/
│       │   └── AppContext.jsx   ← Estado global (React Context): modales, seguimiento, lang
│       ├── data/            ← Datos mock (ES modules, importados directamente)
│       │   ├── zones.js     ← mockZones (28 zonas España)
│       │   ├── species.js   ← mockSpecies (27 especies)
│       │   ├── families.js  ← mockFamilies (8 familias)
│       │   ├── opportunities.js ← mockOpportunities (4 entradas)
│       │   └── articles.js  ← mockArticles (artículos Micología)
│       ├── services/
│       │   └── weatherService.js ← Open-Meteo API + scoring real + caché localStorage
│       ├── hooks/
│       │   └── useWeatherConditions.js ← useAllZoneConditions / useZoneConditions
│       ├── lib/
│       │   ├── helpers.jsx  ← IC icons, getScoreColor, EdibilityTag, SpeciesCard,
│       │   │                   ConfusionesBlock, CONFUSIONES_POR_FAMILIA, fakeConditions,
│       │   │                   resolveUrl(), slugify()
│       │   └── constants.js ← MODAL, COLORS, MONTHS
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── Zones.jsx    ← useParams → setSelectedZone (sinc URL↔modal)
│       │   ├── Species.jsx  ← useParams + useSearchParams (?pagina=N)
│       │   ├── Family.jsx   ← ruta /familia/:slug, renderiza <Species /> como fondo
│       │   ├── Micologia.jsx
│       │   └── Profile.jsx
│       ├── components/
│       │   ├── Layout.jsx       ← Nav desktop sidebar + mobile hamburguesa
│       │   ├── map/
│       │   │   └── LeafletMap.jsx ← markers + heatmap (scores reales), fullscreen modal
│       │   ├── modals/
│       │   │   ├── ModalRenderer.jsx  ← única autoridad de navegación de modales
│       │   │   ├── ZoneModal.jsx
│       │   │   ├── SpeciesModal.jsx   ← GallerySection con tracking onError
│       │   │   ├── FamilyModal.jsx
│       │   │   ├── ArticleModal.jsx
│       │   │   └── Lightbox.jsx
│       │   └── ui/
│       │       ├── ZoneCard.jsx       ← skeleton loading mientras carga meteo
│       │       ├── Tabs.jsx
│       │       ├── FilterPanel.jsx
│       │       ├── SearchFilterBar.jsx
│       │       └── ActiveFilterChip.jsx
│       └── articles/
│           ├── Micorrizas.jsx  ← Artículo con infografías SVG
│           ├── Esporas.jsx     ← Artículo con galería (usa setLightbox)
│           └── Venenos.jsx     ← Artículo con galería (usa setLightbox)
└── standalone/              ← LEGACY (referencia, no desarrollo activo)
    ├── latest/              ← v2.8.0 multi-archivo
    └── archive/             ← Versiones anteriores HTML monolíticos
```

---

## Comandos

```bash
cd frontend
npm run dev      # Dev server → http://localhost:5173
npm run build    # Build producción (dist/)
npm run preview  # Preview del build
```

---

## Rutas (React Router v6)

| Ruta | Componente | Descripción |
|---|---|---|
| `/` | `Dashboard` | Vista principal |
| `/zonas` | `Zones` | Listado de zonas |
| `/zonas/:id` | `Zones` | Zona con modal abierto (slug del nombre) |
| `/especies` | `Species` | Catálogo de especies |
| `/especies/:id` | `Species` | Especie con modal abierto (slug del nombre científico) |
| `/familia/:slug` | `Family` | Modal de familia abierto (slug del nombre de familia) |
| `/micologia` | `Micologia` | Listado de artículos |
| `/micologia/:slug` | `Micologia` | Artículo abierto |
| `/perfil` | `Profile` | Perfil de usuario |

`slugify()` en `helpers.jsx` convierte nombres a slugs URL-safe (NFD + lowercase + hyphens).
`resolveUrl()` en `helpers.jsx` garantiza `/` inicial en URLs de assets (crítico en rutas anidadas).

---

## Stack Tecnológico (Vite app)

| Tecnología | Versión | Notas |
|---|---|---|
| React + ReactDOM | 18 | ES modules |
| React Router | 6 | SPA con rutas `/`, `/zonas`, `/especies`, `/micologia`, `/perfil` |
| Vite | 6 | Build tool, HMR, code splitting |
| Tailwind CSS | CDN via index.html | Sin compilación local |
| Leaflet.js | 1.9.4 | npm, con leaflet.heat para heatmap |
| Open-Meteo | API pública | Sin API key, datos reales España |

**Code splitting** (`vite.config.js` `manualChunks`):
- `react-vendor` — React + React Router
- `leaflet-vendor` — Leaflet (sin leaflet.heat)
- `leaflet-heat` — cargado dinámicamente solo en modo heatmap
- `data-species` — mockSpecies (datos pesados)
- `data-zones` — mockZones

---

## Sistema de Diseño / Colores

```
Background:  #30372a (sólido) + body::after gradiente olive 135°
Texto:       #f4ebe1 (crema)
Acento café: #8b6f47
Acento verde:#4a7c59
Positivo:    #059669 (emerald)
Peligro:     #dc2626 (rojo)
Advertencia: #d97706 (amber)
Font base:   18px
```

**Clases CSS especiales** (`styles.css`):
- `.glass` — `rgba(255,255,255,0.04)` + `backdrop-blur: 16px`, sin border
- `.glass-warm` — `rgba(139,111,71,0.08)` + blur
- `.grain` — textura de ruido SVG superpuesta
- `.hover-lift` — `translateY(-2px)` en hover
- `.anim-up`, `.anim-right`, `.anim-scale` — animaciones keyframe
- `.progress-bar` / `.progress-fill` — barra de progreso del score
- Custom scrollbar — `6px`, thumb `rgba(139,111,71,0.4)`

**Fuentes**: Cormorant Garamond (`font-display`) + DM Sans (body)

---

## State Management

**React Context** (`AppContext.jsx`), hook `useApp()`:

```javascript
const {
  // Modales
  selectedZone, setSelectedZone,
  selectedSpecies, setSelectedSpecies,
  selectedFamily, setSelectedFamily,
  lightbox, setLightbox,
  // Datos usuario
  followedZones, toggleFollow,
  favoriteSpecies, toggleFavorite,
  lang, setLang,
  profile, setProfile,
  // i18n
  t,  // objeto con strings traducidos
} = useApp()
```

**localStorage**: clave `'fungus_v3'` → `{ zonas, favoritos, profile, lang }`
**Weather cache**: clave `'fungus_weather_cache'` → `{ ts, v, data }` (TTL 3h, version 3)

---

## Meteorología y Scoring Real

### Open-Meteo (`src/services/weatherService.js`)

Fetches en paralelo (6 concurrentes) para las 28 zonas. Parámetros:
```
current: temperature_2m, relative_humidity_2m, wind_speed_10m
hourly:  soil_temperature_0cm   ← NO disponible en current (daría 400)
daily:   precipitation_sum
past_days: 14, forecast_days: 1, timezone: Europe/Madrid
```

⚠️ **`soil_temperature_0cm` solo existe en `hourly`**, nunca en `current`.

### Algoritmo de Scoring

```
overallScore = seasonal * 0.40
             + scoreRainfall(rainfall14d) * 0.21
             + scoreTemperature(temp) * 0.18
             + scoreHumidity(humidity) * 0.12
             + scoreDryDays(dryDays) * 0.09
```

**Factor estacional mensual** (el más importante — 40%):
```
Ene:15  Feb:20  Mar:38  Abr:58  May:62
Jun:28  Jul:18  Ago:48  Sep:80  Oct:100  Nov:88  Dic:42
```
→ En febrero el score máximo teórico es ~68 (Bueno). En octubre puede llegar a 100.

**Termómetro UI** (`getScoreColor`):
- >= 85: emerald / "Excelente"
- >= 70: amber-brown / "Muy bueno"
- >= 55: amber / "Bueno"
- < 55: red / "Regular"

### Hooks

- `useAllZoneConditions(zones)` → `{ conditionsMap, loading, progress, error }` — para Dashboard y Zones (28 zonas en paralelo)
- `useZoneConditions(zone)` → `{ conditions, loading, error }` — para ZoneModal (una zona)

**Caché doble**: localStorage (TTL 3h) + promesas en vuelo (`_allZonesPromise`, `_singlePromises`) para evitar dobles fetches en React StrictMode.

`fakeConditions()` en `helpers.jsx` se mantiene solo como **fallback** si la API falla.

---

## Mapa Leaflet (`LeafletMap.jsx`)

Dos modos gestionados por `mode` prop + `onModeChange`:
- **`markers`** — marcadores 🍄 coloreados por `forestType`
- **`heatmap`** — usa scores reales de `conditionsMap` via `buildHeatPoints()`. Gradiente: rojo (malo) → ámbar → verde (bueno). `leaflet.heat` se carga dinámicamente con `import()` solo en este modo.

⚠️ `window.L = L` debe ejecutarse **antes** del `import('leaflet.heat')` dinámico.

Props de `LeafletMap`: `zonas`, `onZoneClick`, `height`, `singleZone`, `title`, `mode`, `onModeChange`, `conditionsMap`.

---

## Schemas de Datos

### Conditions (resultado real de weatherService)
```javascript
{
  temperature: 8.4,      // °C (float)
  soilTemp: 5.9,         // °C (estimado de hourly)
  rainfall14d: 47.2,     // mm acumulados 14 días
  humidity: 82,          // % (integer)
  wind: 12,              // km/h (integer)
  dryDays: 3,            // días con <1mm en últimos 7
  overallScore: 38,      // 0-100 (incluye factor estacional)
  scores: {
    temperatura: 72,
    precipitacion: 95,
    humedad: 100,
    diasSecos: 78,
    estacional: 20,      // Feb
  }
}
```

### Zone
```javascript
{
  id: 'zone-001',
  name: 'Pinar de Urbión',
  province: 'Soria',
  region: 'Pinares',
  lat: 41.9847,
  lng: -2.8547,
  elevation: 1850,
  forestType: 'pinar',   // pinar | hayedo | robledal | encinar
}
```

### Species
```javascript
{
  id: 'esp-001',
  scientificName: 'Boletus edulis',
  commonNames: ['Boleto', 'Cep'],
  family: 'Boletaceae',
  edibility: 'excelente',  // excelente | bueno | comestible | precaucion | toxico | mortal
  photo: { url: '/assets/images/content/species/esp-001-main.jpg' },
  photos: [{ url, caption }],
  forestTypes: ['pinar', 'hayedo'],
  fruitingMonths: [8, 9, 10, 11],  // 1-based
  elevationMin: 600,
  elevationMax: 2000,
  // ... condiciones óptimas, morfología, etc.
}
```

---

## Reglas Importantes

1. **`frontend/` es el path activo** — no tocar `standalone/` salvo referencia
2. **`soil_temperature_0cm` solo en `hourly`** — si se añade a `current` la API devuelve 400
3. **`window.L = L`** debe estar a nivel de módulo en `LeafletMap.jsx`, antes de cualquier `import('leaflet.heat')`
4. **`fakeConditions()`** se mantiene solo como fallback en `useWeatherConditions.js` — no usar directamente en componentes
5. **`conditionsMap` empieza vacío** — todos los accesos deben usar `?.` o `?? 0` para evitar crashes en el render inicial
6. **CACHE_VERSION** en `weatherService.js` — incrementar cada vez que cambie el algoritmo de scoring para invalidar caché de usuarios
7. **React StrictMode** en dev monta efectos dos veces — usar la caché de promesas en vuelo, no `useRef` guards
8. **Leaflet.heat** es CommonJS y busca `L` global en su inicialización — la importación dinámica debe hacerse solo cuando `window.L` ya está asignado
9. **Siempre mostrar disclaimer** de seguridad en especies tóxicas/mortales
10. **`useMemo`** para cálculos derivados de `conditionsMap` en Dashboard/Zones — el mapa se actualiza async y los `useMemo` deben reaccionar a él
11. **Patrón modal-from-modal** — abrir un modal desde otro: llamar solo a `setSelected*(item)`, nunca `navigate()` directamente desde dentro del modal. `ModalRenderer` es la única autoridad de navegación. Ver `memory/decisions.md`.
12. **Patrón ESC + Lightbox** — modales con lightbox deben desregistrar su listener de ESC mientras el lightbox está abierto. El efecto debe depender de `[lightbox]`. Ver `memory/decisions.md`.
13. **`resolveUrl()`** — usar siempre en `<img src>` de assets en modales y artículos. Las rutas relativas se rompen en URLs anidadas como `/especies/boletus-edulis`.
14. **`GallerySection`** en `SpeciesModal` — componente propio con `useState(errored)`. Se oculta cuando todas las imágenes han fallado (404). No usar `SpeciesImg` en galería, usar `<img>` plano con `onError`.

---

## Roadmap

### Pendiente (v3.x) — ver `memory/pending.md` para detalle
- Revisión `forestTypes` y `fruitingMonths` de todas las especies
- Mostrar `speciesScore` (SQS) en la UI de ZoneModal
- Meteocat API para zonas catalanas (requiere API key)
- Zonas personalizadas en el mapa

### Próximo (v4.0) — ver `docs/backend_architecture.md` para spec completa
- Backend FastAPI + PostgreSQL + PostGIS
- Índice de Brote (IB) con histórico de 21 días y fuentes regionales (Meteocat, Euskalmet, etc.)
- Autenticación real de usuarios
- App móvil (React Native)
- Fotografías comunitarias de avistamientos
