# 🍄 Fungus

Sistema inteligente de predicción micológica para Cataluña y España.

**Versión**: v4.6.2 · **Frontend**: `fungus-ashen.vercel.app` · **API**: `fungus-api.onrender.com`

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

Requiere `.env.local` con `DATABASE_URL` apuntando a una instancia PostgreSQL + PostGIS.

---

## Stack

| Capa | Tecnología | Deploy |
|---|---|---|
| Frontend | Vite 6 + React 18 + React Router 6 + Leaflet | Vercel → `main` |
| Backend | FastAPI + SQLAlchemy 2 async + Alembic | Render → `main` |
| Base de datos | PostgreSQL + PostGIS | Supabase (Ireland) |
| Meteorología | Open-Meteo (sin API key) | — |

---

## Estructura

```
fungus/
├── frontend/          ← Vite app (desarrollo activo)
├── backend/           ← FastAPI + OI algorithm
├── docs/              ← Arquitectura, convenciones, guías de contenido
├── migrations/        ← SQL de datos para Supabase (INSERT/UPDATE)
├── scripts/           ← download_images.py, species_list.json
├── memory/            ← Decisiones, pendientes, gotchas
├── standalone/        ← Legacy HTML (referencia, no activo)
├── CLAUDE.md          ← Instrucciones para Claude
└── CHANGELOG.md
```

---

## API endpoints

```
GET /api/v1/health
GET /api/v1/zones
GET /api/v1/zones/{id}
GET /api/v1/zones/map-scores
GET /api/v1/weather/zones
GET /api/v1/weather/zones/{id}
GET /api/v1/species
GET /api/v1/species/{id}
GET /api/v1/admin/trigger-backfill?days=N
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
| v4.6.4 | ✅ | Datos confusiones familias restantes (Amanitaceae, Cantharellaceae, Russulaceae, Cortinariaceae) |
| v4.7 | 🗂 Backlog | Auth/social: JWT, favoritos en BD, avistamientos |
| v5.0 | 🗂 Backlog | App móvil Android (React Native + Expo) |
| v5.1 | 🗂 Backlog | App móvil iOS |

Backlog detallado: `memory/pending.md`

---

## Licencia

Prototipo de demostración.
