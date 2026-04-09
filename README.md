# 🍄 Fungus

Sistema inteligente de predicción micológica para Cataluña y España.

**Versión**: v5.6 · **Frontend**: `fungus-ashen.vercel.app` · **API**: `fungus-api.onrender.com`

---

## ¿Qué es Fungus?

Fungus predice las mejores zonas y momentos para la recolección de setas combinando datos meteorológicos reales, condiciones del suelo y un algoritmo de scoring con factor estacional (Outbreak Index).

---

## Inicio rápido

### Frontend (desarrollo local)

```bash
cd frontend
npm install
npm run dev
# http://localhost:5173
```

### Backend (desarrollo local)

```bash
cd backend
python -m uvicorn app.main:app --reload
# http://localhost:8000
```

Requiere `.env` con `DATABASE_URL` apuntando a una instancia PostgreSQL + PostGIS.

---

## Stack

| Capa | Tecnología | Deploy |
|---|---|---|
| Frontend | Vite 6 + React 18 + React Router 6 + Leaflet | Vercel → `main` |
| Backend | FastAPI + SQLAlchemy 2 async + Alembic | Render → `main` |
| Base de datos | PostgreSQL + PostGIS | Supabase (Ireland) |
| Meteorología | Open-Meteo (sin API key) | — |
| Generación IA | Imagen 4 + Gemini 2.5 Flash | Google AI (admin only) |

---

## Estructura

```
fungus/
├── frontend/          ← Vite app (desarrollo activo)
├── backend/           ← FastAPI + OI algorithm
├── docs/              ← Arquitectura, convenciones, guías
├── memory/            ← Decisiones, pendientes, gotchas
├── standalone/        ← Legacy HTML (referencia, no activo)
├── CLAUDE.md          ← Instrucciones para Claude
└── CHANGELOG.md
```

---

## API endpoints

```
GET  /api/v1/health
GET  /api/v1/zones
GET  /api/v1/zones/{id}
GET  /api/v1/zones/map-scores
GET  /api/v1/weather/zones
GET  /api/v1/weather/zones/{id}
GET  /api/v1/species?lang=es|ca|en
GET  /api/v1/species/{id}?lang=es|ca|en
GET  /api/v1/species/{id}/visual-prompt       ← admin only
PUT  /api/v1/species/{id}/visual-prompt       ← admin only
GET  /api/v1/admin/trigger-backfill?days=N    ← admin only
```

---

## Roadmap

| Versión | Estado | Alcance |
|---|---|---|
| v3.1 | ✅ | Frontend Vite — meteo real, catálogo mock, modales, mapa |
| v4.1 | ✅ | Backend meteo: FastAPI + OI + Open-Meteo server-side |
| v4.2 | ✅ | Catálogo en DB: seed + endpoints especies/zonas |
| v4.3 | ✅ | Integración frontend completa: mock → API, weather cache |
| v4.4 | ✅ | Weather cache BD server-side + deploy producción |
| v4.5 | ✅ | Auditoría mock → API: cierre de imports residuales |
| v4.6 | ✅ | Taxonomía (sinónimos) + confusiones en BD |
| v4.6.3 | ✅ | Mejoras UX: filtros comarca/CCAA, no_comestible, restyling |
| v4.6.4 | ✅ | Datos confusiones familias restantes |
| v4.7 | ✅ | i18n completo: UI ES/CA/EN + DB layer `?lang=` + 202 especies |
| v4.7.1 | ✅ | i18n editorial: artículos, morfología, sticky search, header scroll |
| v5.0 | ✅ | Auth JWT + user accounts + followed zones & fav species |
| v5.1 | ✅ | ImageGenerator (Imagen 4 + Gemini) · AdminGallery · modo admin |
| v5.2 | ✅ | Generador: gallery → generador · panel referencia · guardado en catálogo |
| v5.3 | ✅ | Fotos ilimitadas · CatalogImagesModal · DnD reordering · galería dinámica |
| v5.3.1 | ✅ | Bug fixes generador |
| v5.4 | ✅ | Rediseño generador admin: galería-first · modal especie · sidebar simplificado |
| v5.5 | ✅ | Myco-Engine DNA Visual: `mushroom_visual_prompts` · pipeline 4 capas · 10 piloto |
| v5.6 | ✅ | Generación masiva DNA Visual: 202 especies · visualGlossary · fixes generador |
| v6.0 | 🗂 | Social login: Google OAuth2 |
| v6.1 | 🗂 | Confirmación de email al registro |
| v7.0 | 🗂 | App móvil Android (React Native + Expo) |
| v8 | 🗂 | SEO: prerendering estático + Core Web Vitals |

Backlog detallado: `memory/pending.md`

---

## Licencia

Prototipo de demostración.
