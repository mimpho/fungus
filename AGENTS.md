# 🍄 Fungus — OpenCode Agent

## Project Overview

Fungus es una app web de predicción micológica para Cataluña/España. Predice las mejores zonas y momentos para recolectar setas combinando datos meteorológicos reales, condiciones del suelo y un algoritmo de scoring con factor estacional.

**Versión actual**: v4.4.2 frontend / v4.4.2 backend
**Estado frontend**: Integración completa con backend API — `/zonas` y `/especies` consumen endpoints del backend. Datos meteorológicos via backend (Open-Meteo cacheado). Catálogo de 200 zonas y 201 especies desde BD. Modales con URL slugs y navegación browser-native.
**Estado backend**: v4.4.2. FastAPI + SQLAlchemy + Alembic + Outbreak Index + WeatherCache. Endpoints activos (`/zones`, `/species`, `/weather`). Weather cache con TTL 3h.
**Deploy frontend**: Vercel → `fungus-ashen.vercel.app` (apunta a `main`)
**Deploy backend**: Render → `https://fungus-api.onrender.com` · Supabase (PostgreSQL + PostGIS, Ireland)

---

## Arquitectura

- **Entregable principal**: App Vite en `frontend/` — **ESTE es el path activo de desarrollo**
- **Standalone legacy**: `standalone/latest/` — archivos HTML multi-archivo con Babel standalone. Ya no es el path activo pero se mantiene como referencia.
- **Backend**: FastAPI + PostgreSQL + PostGIS en `backend/`

---

## Estructura del Proyecto

```
fungus/
├── AGENTS.md              ← Este archivo
├── CLAUDE.md              ← Original (mantener para referencia)
├── docs/                  ← Documentación adicional
│   ├── conventions.md
│   ├── backend_architecture.md
│   ├── deploy.md
│   ├── local_dev.md
│   └── environments.md
├── frontend/              ← DESARROLLO PRINCIPAL (Vite 6 + React Router)
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── App.jsx
│       ├── styles.css
│       ├── contexts/AppContext.jsx
│       ├── data/              ← Datos mock
│       ├── services/weatherService.js
│       ├── hooks/useWeatherConditions.js
│       ├── lib/helpers.jsx, constants.js
│       ├── pages/Dashboard.jsx, Zones.jsx, Species.jsx, etc.
│       ├── components/
│       └── articles/
└── backend/               ← FastAPI (v4.x)
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
| `/` | Dashboard | Vista principal |
| `/zonas` | Zones | Listado de zonas |
| `/zonas/:id` | Zones | Zona con modal abierto |
| `/especies` | Species | Catálogo de especies |
| `/especies/:id` | Species | Especie con modal abierto |
| `/familia/:slug` | Family | Modal de familia |
| `/micologia` | Micologia | Artículos |
| `/perfil` | Profile | Perfil de usuario |

---

## Stack Tecnológico

| Tecnología | Versión |
|---|---|
| React + ReactDOM | 18 |
| React Router | 6 |
| Vite | 6 |
| Leaflet.js | 1.9.4 |
| Open-Meteo | API pública |

---

## Sistema de Diseño

**Colores**:
- Background: #30372a (sólido) + gradiente olive 135°
- Texto: #f4ebe1 (crema)
- Acento café: #8b6f47
- Acento verde: #4a7c59
- Positivo: #059669 (emerald)
- Peligro: #dc2626 (rojo)

**Clases CSS**: `.glass`, `.glass-warm`, `.grain`, `.hover-lift`, `.anim-up`, `.progress-bar`, etc.

---

## State Management

React Context (`AppContext.jsx`), hook `useApp()`:
```javascript
const {
  selectedZone, setSelectedZone,
  selectedSpecies, setSelectedSpecies,
  selectedFamily, setSelectedFamily,
  lightbox, setLightbox,
  followedZones, toggleFollow,
  favoriteSpecies, toggleFavorite,
  lang, setLang,
  t,
} = useApp()
```

**localStorage**: clave `'fungus_v3'`
**Weather cache**: clave `'fungus_weather_cache'` (TTL 3h)

---

## Meteorología y Scoring

### Open-Meteo

Fetch parameters:
- `current`: temperature_2m, relative_humidity_2m, wind_speed_10m
- `hourly`: soil_temperature_0cm (NO disponible en current)
- `daily`: precipitation_sum
- `past_days: 14`, `forecast_days: 1`, `timezone: Europe/Madrid`

### Weather Cache (Backend)

El backend implementa un sistema de caché meteorológico con TTL 3h:
- `fetch_weather_for_zone()` — fetch a Open-Meteo API
- `store_weather_cache()` — almacena en BD con TTL 3h
- `get_latest_weather()` — recupera caché con validación de TTL
- Cache-first strategy en los endpoints

### Algoritmo de Scoring

```
overallScore = seasonal * 0.40
             + scoreRainfall(rainfall14d) * 0.21
             + scoreTemperature(temp) * 0.18
             + scoreHumidity(humidity) * 0.12
             + scoreDryDays(dryDays) * 0.09
```

**Factor estacional mensual** (40% importance):
```
Ene:15  Feb:20  Mar:38  Abr:58  May:62
Jun:28  Jul:18  Ago:48  Sep:80  Oct:100  Nov:88  Dic:42
```

---

## Reglas Importantes

1. **`frontend/` es el path activo** — no tocar `standalone/`
2. **`soil_temperature_0cm` solo en `hourly`** — si se añade a `current` la API devuelve 400
3. **`window.L = L`** debe ejecutarse antes de importar `leaflet.heat` dinámicamente
4. **`fakeConditions()`** solo como fallback
5. **`conditionsMap` empieza vacío** — usar `?.` o `??`
6. **CACHE_VERSION** en weatherService.js — incrementar al cambiar el algoritmo
7. **React StrictMode** — usar caché de promesas en vuelo
8. **Always show disclaimer** en especies tóxicas/mortales
9. **ModalRenderer** es la única autoridad de navegación de modales
10. **`resolveUrl()`** para imágenes en rutas anidadas

---

## Backend Endpoints

```
GET /api/v1/health
GET /api/v1/zones
GET /api/v1/zones/map-scores
GET /api/v1/zones/{id}
GET /api/v1/species
GET /api/v1/species/{id}
GET /api/v1/weather/zones/{zone_id}
GET /api/v1/weather/zones
```

---

## Roadmap

| Versión | Estado |
|---|---|
| v3.1 | ✅ Entregado |
| v4.1 | ✅ Entregado |
| v4.2 | ✅ Entregado |
| v4.3 | ✅ Entregado |
| v4.4 | ✅ Entregado |
| v4.5 | ✅ Entregado |
| v4.6 | 🗂 Backlog (Taxonomía sinónimos + confusiones en BD) |
| v4.7 | 🗂 Backlog (Auth/social) |
| v5.0 | 🗂 Backlog (App móvil Android) |
| v5.1 | 🗂 Backlog (App móvil iOS) |

---

## Documentación Adicional

Ver `/docs/` para:
- `conventions.md` — convenciones de código
- `backend_architecture.md` — spec completo del backend
- `deploy.md` — guías de despliegue
- `local_dev.md` — desarrollo local
