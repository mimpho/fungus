# 🍄 Fungus — Agent Instructions

## Project Overview

Fungus es una app web de predicción micológica para Cataluña/España. Predice las mejores zonas y momentos para recolectar setas combinando datos meteorológicos reales, condiciones del suelo y un algoritmo de scoring con factor estacional.

**Versión actual**: v5.6 frontend; v5.0 backend
**Estado frontend**: Auth completo. i18n completo ES/CA/EN. Admin: galería-first (`AdminGeneratorHub` + `SpeciesAdminModal` + `ImageGenerator` simplificado). Myco-Engine DNA Visual: tabla `mushroom_visual_prompts`, pipeline 4 capas (morfología BD → Gemini escena → imagen), 202 especies con DNA Visual generado (55 curadas `is_validated=true`, resto Gemini offline `is_validated=false`). `composition_notes` por especie. Fallback automático a pipeline Gemini si sin datos. Fixes generador: prompt bloat, Amanitaceae constraint, family constraint prepend, visualGlossary.
**Estado backend**: v5.0 + migración 009. Tabla `mushroom_visual_prompts` con DNA Visual por especie (cap/stipe/hymenium/extra_visual/extra_gemini/substrate/habitat/fauna/composition_notes/is_validated). Endpoints `GET/PUT /species/{id}/visual-prompt` (admin only). Auto-migrate al arrancar. Endpoints `/species` con `?lang=`. Confusiones completas para 8 familias.
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
├── AGENTS.md
├── CLAUDE.md
├── CHANGELOG.md
├── frontend/                ← DESARROLLO PRINCIPAL (Vite 6 + React Router)
│   └── src/
│       ├── App.jsx
│       ├── styles.css
│       ├── contexts/AppContext.jsx
│       ├── data/              ← Datos mock (fallback)
│       ├── services/weatherService.js
│       ├── hooks/
│       ├── lib/helpers.jsx, constants.js, visualGlossary.js
│       ├── pages/
│       ├── components/
│       │   └── admin/         ← ImageGenerator, AdminGeneratorHub, CatalogImagesModal
│       └── articles/
├── backend/                 ← FastAPI
│   ├── app/
│   │   ├── main.py
│   │   ├── models/          ← Zone, Species, MushroomVisualPrompt, WeatherCache…
│   │   ├── routers/
│   │   └── services/
│   └── scripts/             ← generate_visual_dna.py, refine_visual_dna.py, seed_catalog.py…
├── docs/
│   ├── conventions.md
│   ├── backend_architecture.md
│   └── plan/                ← SQL seeds y patches aplicados en Supabase
├── memory/                  ← decisions.md, pending.md, gotchas.md, scoring.md
└── standalone/              ← LEGACY (referencia)
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
| `/admin/generator` | AdminGeneratorHub | Hub admin galería + generador IA |

---

## Stack Tecnológico

| Tecnología | Versión | Notas |
|---|---|---|
| React + ReactDOM | 18 | ES modules |
| React Router | 6 | SPA |
| Vite | 6 | Build tool, HMR, code splitting |
| Tailwind CSS | CDN | Sin compilación local |
| Leaflet.js | 1.9.4 | npm, con leaflet.heat |
| Open-Meteo | API pública | Sin API key |
| Imagen 4 + Gemini 2.5 Flash | Google AI | Admin only, key en frontend |

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

- `current`: temperature_2m, relative_humidity_2m, wind_speed_10m
- `hourly`: soil_temperature_0cm (**NO disponible en `current`**)
- `daily`: precipitation_sum
- `past_days: 14`, `forecast_days: 1`, `timezone: Europe/Madrid`

### Algoritmo de Scoring

```
overallScore = seasonal * 0.40
             + scoreRainfall(rainfall14d) * 0.21
             + scoreTemperature(temp) * 0.18
             + scoreHumidity(humidity) * 0.12
             + scoreDryDays(dryDays) * 0.09
```

Factor estacional mensual: Ene:15 Feb:20 Mar:38 Abr:58 May:62 Jun:28 Jul:18 Ago:48 Sep:80 Oct:100 Nov:88 Dic:42

---

## Myco-Engine DNA Visual (v5.5–v5.6)

Tabla `mushroom_visual_prompts` con descripción visual estructurada por especie:
- `cap_description`, `stipe_description`, `hymenium_description`, `extra_morphology_visual` → van a Imagen 4 (vía `layer1_prefix`)
- `extra_morphology_gemini` → contexto interno para Gemini (reacciones, toxicidad)
- `preferred_substrate`, `habitat_context`, `associated_fauna`, `composition_notes` → escena Gemini
- `is_validated` → `true` = curado manualmente (nunca sobreescribir), `false` = generado por Gemini offline

Scripts de generación en `backend/scripts/`:
- `generate_visual_dna.py` — Gemini 2.5 Flash offline, resume-safe
- `refine_visual_dna.py` — Gemini Vision multimodal, corrige con fotos reales

---

## Backend Endpoints

```
GET  /api/v1/health
GET  /api/v1/zones
GET  /api/v1/zones/map-scores
GET  /api/v1/zones/{id}
GET  /api/v1/species?lang=es|ca|en
GET  /api/v1/species/{id}?lang=es|ca|en
GET  /api/v1/species/{id}/visual-prompt       ← admin only
PUT  /api/v1/species/{id}/visual-prompt       ← admin only
GET  /api/v1/weather/zones
GET  /api/v1/weather/zones/{zone_id}
```

---

## Reglas Importantes

1. **`frontend/` es el path activo** — no tocar `standalone/`
2. **`soil_temperature_0cm` solo en `hourly`** — en `current` devuelve 400
3. **`window.L = L`** antes de importar `leaflet.heat` dinámicamente
4. **`fakeConditions()`** solo como fallback en useWeatherConditions.js
5. **`conditionsMap` empieza vacío** — usar `?.` o `?? 0`
6. **CACHE_VERSION** en weatherService.js — incrementar al cambiar el algoritmo
7. **ModalRenderer** es la única autoridad de navegación de modales
8. **`resolveUrl()`** para imágenes en rutas anidadas
9. **`is_validated=true`** en `mushroom_visual_prompts` → nunca sobreescribir con scripts automáticos
10. **Prompt bloat** — el enemy del generador: instrucciones cortas y sin solapamiento; el orden de tokens importa

---

## Roadmap

| Versión | Estado | Alcance |
|---|---|---|
| v3.1–v4.7.1 | ✅ Entregado | Frontend Vite, backend meteo, catálogo DB, i18n completo |
| v5.0 | ✅ Entregado | Auth JWT + user accounts |
| v5.1–v5.3.1 | ✅ Entregado | ImageGenerator + AdminGallery + DnD + galería dinámica |
| v5.4 | ✅ Entregado | Rediseño generador admin: galería-first |
| v5.5 | ✅ Entregado | Myco-Engine DNA Visual: tabla + pipeline 4 capas + 10 piloto |
| v5.6 | ✅ Entregado | Generación masiva DNA Visual: 202 especies · visualGlossary · fixes |
| v6.0 | 🗂 Backlog | Social login: Google OAuth2 |
| v6.1 | 🗂 Backlog | Confirmación de email al registro |
| v7.0 | 🗂 Sin fecha | App móvil Android (React Native + Expo) |
| v8 | 🗂 Backlog | SEO: prerendering estático + Core Web Vitals |
