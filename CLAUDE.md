# 🍄 Fungus — Claude Instructions

## Project Overview

Fungus es una app web de predicción micológica para Cataluña/España. Predice las mejores zonas y momentos para recolectar setas combinando datos meteorológicos reales, condiciones del suelo y un algoritmo de scoring con factor estacional.

**Versión actual**: v3.1.0 frontend / v4.1.0 backend (en desarrollo en `epic/v4-backend`)
**Estado frontend**: Prototipo funcional — datos meteorológicos reales via Open-Meteo, catálogo de datos mock (28 zonas, 27 especies, 8 familias), sin backend propio. Modales con URL slugs y navegación browser-native (back/ESC).
**Estado backend**: Scaffold completo (FastAPI + SQLAlchemy + Alembic). v4.1 en desarrollo: ingesta Open-Meteo server-side + Outbreak Index + API endpoints.
**Deploy frontend**: Vercel → `fungus-git-feat-vite-migration-mimphos-projects.vercel.app`
**Deploy backend (objetivo)**: Render (API) + Supabase (PostgreSQL + PostGIS)
**Backend spec**: `docs/backend_architecture.md` — FastAPI + PostgreSQL + PostGIS (v4.x)
**Convenciones**: `docs/conventions.md` — idiomas, versionado, git branching, commit format

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

## Backend (v4.0) — `backend/`

### Stack
| Tecnología | Versión | Notas |
|---|---|---|
| FastAPI | ≥0.115 | Async, lifespan, CORS middleware |
| SQLAlchemy | 2.x async | asyncpg driver |
| Alembic | ≥1.13 | Migraciones; `migrations/versions/001_initial_schema.py` |
| APScheduler | 3.x | Cron diario a las 05:00 UTC |
| httpx | ≥0.27 | Cliente async para APIs externas |
| tenacity | ≥9 | Reintentos con backoff en conectores |

### Estructura `backend/`
```
backend/
├── app/
│   ├── main.py          ← FastAPI app + lifespan + scheduler
│   ├── config.py        ← Settings (pydantic-settings, .env)
│   ├── database.py      ← engine async + get_db dependency
│   ├── models/          ← Zone, Species, ClimateHistory, ScoresCache, WeatherStation
│   ├── schemas/         ← Pydantic schemas (zone.py, health.py)
│   ├── routers/         ← health.py, zones.py
│   ├── services/
│   │   ├── scoring.py   ← Outbreak Index (OI) algorithm
│   │   └── ingest.py    ← daily ingestion + backfill + scores cache refresh
│   └── connectors/
│       ├── base.py      ← abstract WeatherConnector + DailyWeatherData
│       └── open_meteo.py← P3 connector (no API key needed)
├── migrations/
│   └── versions/001_initial_schema.py
├── scripts/
│   ├── backfill.py      ← python -m scripts.backfill --from YYYY-MM-DD --to YYYY-MM-DD
│   └── seed_catalog.py  ← Fase 2: importa mock JS → PostgreSQL
├── Dockerfile
├── alembic.ini
└── pyproject.toml
```

### Endpoints (Fase 1)
```
GET /api/v1/health            → system status, last ingest, providers
GET /api/v1/zones             → all active zones + cached OI score
GET /api/v1/zones/map-scores  → [{zone_id, lat, lon, score}] para heatmap
GET /api/v1/zones/{id}        → zone detail + OI breakdown
```

### Outbreak Index (OI) — algoritmo (ver `app/services/scoring.py`)
```
OI = PA21_score  × 0.30   (precipitación acumulada 21 días)
   + Thermal_score × 0.25  (temperatura media 7d + penalización heladas)
   + Seasonal      × 0.25  (factor mensual: Ene=15 … Oct=100)
   + Ripening_score × 0.12 (días desde lluvia ≥10mm vs ciclo de la especie)
   + Humidity_score × 0.08 (humedad relativa media)
```

### Reglas importantes del backend
15. **`GENERATED ALWAYS AS` PostGIS** — la columna `geom` en `zones` y `weather_stations` se genera automáticamente desde `lat`/`lon`. No insertar `geom` directamente.
16. **Upsert con upgrade rule** — `climate_history` nunca sobreescribe una fuente de mayor calidad con una inferior. `open-meteo` es P3; P1/P2 tienen prioridad.
17. **Conector placeholder** — `_get_connector()` en `ingest.py` siempre devuelve `OpenMeteoConnector` hasta que las API keys P1/P2 estén disponibles. Enchufar Meteocat ahí.
18. **Cron 05:00 UTC** — el scheduler arranca con la app en el lifespan. En Render free tier la app se duerme; usar UptimeRobot para keep-alive.
19. **`Cache-Control: public, max-age=3600`** — middleware en `main.py` añade este header a todos los GET 200. El frontend no necesita localStorage de 3h.
20. **Convenciones de código** — ver `docs/conventions.md`. Todo en inglés (identificadores, comentarios, commits, DB). Excepciones: `CLAUDE.md`, `memory/`, `CHANGELOG.md`.

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

| Versión | Estado | Alcance |
|---|---|---|
| v3.1 | ✅ Entregado | Frontend Vite completo — meteo real, catálogo mock, modales, mapa |
| v3.x | 🗂 Backlog | Mejoras frontend (ver `memory/pending.md`) — sin prioridad activa |
| **v4.1** | 🚧 En curso | Backend meteo: FastAPI + OI + Open-Meteo server-side |
| v4.2 | 📋 Planificado | Catálogo en DB: seed script + endpoints reemplazan mock data |
| v4.3 | 📋 Planificado | Auth + social: JWT, favoritos reales, avistamientos comunitarios |

Spec completa de v4.x: `docs/backend_architecture.md`

---

## Protocolo de actualización de documentación

Cuando Claude complete trabajo en este proyecto, debe actualizar los siguientes archivos según el tipo de cambio. **Esto no es opcional** — la documentación desincronizada genera confusión en sesiones futuras.

### Al cerrar una tarea o PR (PATCH: vX.Y.Z → vX.Y.Z+1)

| Archivo | Qué actualizar |
|---|---|
| `CHANGELOG.md` | Añadir entrada con los cambios, bajo el MINOR activo |
| `backend/pyproject.toml` | Bump de versión patch |
| `CLAUDE.md` → Overview | Versión actual si ha cambiado |

### Al cerrar una fase/milestone (MINOR: vX.Y → vX.Y+1)

Todo lo anterior, más:

| Archivo | Qué actualizar |
|---|---|
| `CLAUDE.md` → Roadmap | Marcar la fase como ✅, actualizar la que pasa a "En curso" |
| `CLAUDE.md` → Overview | Versión y estado del backend |
| `docs/conventions.md` | Phase map si se añaden fases nuevas |
| `docs/backend_architecture.md` | Si el spec cambió durante la implementación |
| Git | `git tag -a vX.Y.0` en `main` tras el merge del epic |

### Al tomar una decisión arquitectónica relevante

| Archivo | Qué actualizar |
|---|---|
| `memory/decisions.md` | Registrar la decisión, alternativas descartadas y motivo |
| `docs/backend_architecture.md` | Si afecta al diseño general del sistema |
| `docs/conventions.md` | Si establece un nuevo patrón de trabajo |

### Al añadir o cambiar un endpoint de la API

| Archivo | Qué actualizar |
|---|---|
| `CLAUDE.md` → sección Backend | Tabla de endpoints |
| `docs/backend_architecture.md` | Sección 8 (API Endpoints) |

### Lo que **no** hace falta actualizar en cada cambio
- `memory/pending.md` — solo cuando cambia la cola de tareas activa
- `docs/conventions.md` — solo cuando cambia cómo trabajamos, no qué construimos

---

## Flujo de trabajo con Claude

### Cuándo usar Cowork

**Siempre** para trabajo real en el proyecto: escribir código, leer o modificar archivos, ejecutar comandos, operaciones git. Cowork tiene acceso al repo y carga `CLAUDE.md` automáticamente al arrancar, lo que garantiza contexto sin tener que re-explicar nada.

**No es necesario** para consultas puntuales que no tocan el proyecto directamente — discutir un concepto, revisar un fragmento de código suelto, o hacer una pregunta sobre una librería. Una conversación de Claude normal es más rápida para eso.

### Alcance de una sesión

Una sesión de Cowork debería cubrir un **bloque de trabajo cohesionado**, no una tarea suelta ni todo el proyecto. El criterio práctico: abrir una sesión nueva cuando se empieza un bloque diferente (un milestone, un tema distinto), no cuando se termina una tarea puntual dentro del mismo bloque.

Cuando una conversación se extiende mucho, la calidad del contexto se degrada. La señal para abrir sesión nueva es notar que Claude está perdiendo el hilo, no esperar a que falle. `CLAUDE.md` garantiza la continuidad — la siguiente sesión arranca con el mismo contexto que dejó la anterior.

### Arrancar una sesión

No hace falta re-explicar el proyecto. Claude lee `CLAUDE.md` al inicio. Con indicar el bloque de trabajo ("continuamos con v4.1", "empezamos con las API conventions") es suficiente. Si hay contexto extra relevante que no está en `CLAUDE.md` (una decisión tomada fuera de Cowork, un cambio manual en el código), mencionarlo explícitamente al inicio.

### Cerrar una sesión

Antes de cerrar, aplicar el protocolo de actualización de documentación de la sección anterior. Eso es lo que hace que la próxima sesión arranque con contexto real. Si la sesión fue exploratoria y no hubo cambios concretos, basta con actualizar `memory/pending.md` si quedaron tareas pendientes identificadas.

### Sugerencias al terminar un bloque de trabajo

Al acabar cada bloque, Claude debe sugerir proactivamente los siguientes pasos sin esperar a que se pidan. La sugerencia cubre tres dimensiones:

**Git** — qué acciones están pendientes según el estado del repo:
- Cambios sin commitear → sugerir commit con mensaje Conventional Commits
- Feature branch terminada → sugerir squash merge a la epic y borrar la rama
- Fase completa → sugerir merge `--no-ff` a `main`, tag y push
- Nada pendiente → confirmarlo explícitamente

**Conversación** — si conviene continuar aquí o abrir una nueva sesión:
- Continuar aquí si el siguiente bloque es una extensión natural del actual (misma rama, mismo contexto)
- Nueva sesión de Cowork si el siguiente bloque es un tema distinto, una rama nueva, o si la conversación ya es larga
- Claude sin Cowork si lo que viene es una consulta puntual sin tocar ficheros

**Documentación** — qué hay que actualizar antes de cerrar (según el protocolo de la sección anterior), y si hay algo que añadir a `memory/pending.md` para la próxima sesión

El formato de la sugerencia debe ser breve y directo — no un informe, sino tres bullets accionables al final del trabajo.
