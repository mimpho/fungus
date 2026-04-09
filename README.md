# 🍄 Fungus

Sistema inteligente de predicción micológica para España.

**Versión**: v6.0 · **Frontend**: `fungus-ashen.vercel.app` · **API**: `fungus-api.onrender.com`

---

## ¿Qué es Fungus?

Fungus predice las mejores zonas y momentos para la recolección de setas combinando datos meteorológicos reales, condiciones del suelo y un algoritmo de scoring con factor estacional (Outbreak Index).

---

## Inicio rápido

### Frontend (desarrollo local)

```bash
# Desde la raíz del repo:
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
├── src/               ← Vite app — desarrollo activo
├── backend/           ← FastAPI + OI algorithm
├── system/            ← OpenSpecs — Single Source of Truth
├── docs/              ← Arquitectura, convenciones, guías
├── memory/            ← Decisiones, pendientes, gotchas
├── standalone/        ← Legacy HTML (referencia, no activo)
├── CLAUDE.md          ← Entry point para Claude/Cowork
├── AGENTS.md          ← Entry point para Codex CLI
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
PATCH /api/v1/species/{id}/images             ← admin only
POST /api/v1/images/set-order                 ← admin only
```

---

## Roadmap

| Versión | Estado | Alcance |
|---|---|---|
| v3.1–v4.7.1 | ✅ | Frontend Vite · backend meteo · catálogo DB · i18n |
| v5.0–v5.6 | ✅ | Auth JWT · ImageGenerator · Myco-Engine DNA Visual |
| v6.0 | 🚧 | OpenSpecs migration — SSOT estructurado, agnóstico al IDE |
| v7.0 | 🗂 | Social login: Google OAuth2 |
| v7.1 | 🗂 | Confirmación de email al registro |
| v8.0 | 🗂 | App móvil Android (React Native + Expo) |
| v9.0 | 🗂 | SEO: prerendering estático + Core Web Vitals |

Backlog detallado: `memory/pending.md`

---

## Licencia

Prototipo de demostración.
