# 🍄 Fungus

Intelligent mushroom foraging prediction system for Spain.

**Version**: v7.1 · **Frontend**: `fungus-ashen.vercel.app` · **API**: `fungus-api.onrender.com`

---

## What is Fungus?

Fungus predicts the best zones and timing for mushroom foraging by combining real-time weather data, soil conditions, and a seasonal scoring algorithm (Outbreak Index).

---

## Quick start

### Frontend web (local development)

```bash
# From repo root:
npm install
npm run dev
# http://localhost:5173
```

### Backend (local development)

```bash
cd backend
python -m uvicorn app.main:app --reload
# http://localhost:8000
```

Requires `.env` with `DATABASE_URL` pointing to a PostgreSQL + PostGIS instance.

### Mobile app — Android (local development)

```bash
cd mobile
npm install
npm start         # Expo Dev Server → http://localhost:8081 · scan QR with Expo Go to run on device
npm run android   # Android emulator or connected device (requires Android Studio)
npm run web       # Browser (no Android Studio needed)
```

---

## Stack

| Layer | Technology | Deploy |
|---|---|---|
| Frontend (web) | Vite 6 + React 18 + React Router 6 + Leaflet | Vercel → `main` |
| Mobile (Android) | React Native + Expo SDK 54 + expo-router v4 + MapLibre | EAS Build → APK |
| Backend | FastAPI + SQLAlchemy 2 async + Alembic | Render → `main` |
| Database | PostgreSQL + PostGIS | Supabase (Ireland) |
| Weather | Open-Meteo (no API key required) | — |
| AI Generation | Imagen 4 + Gemini 2.5 Flash | Google AI (admin only) |

---

## Structure

```
fungus/
├── src/               ← Vite app — active development (web)
├── mobile/            ← React Native + Expo SDK 54 (Android app)
├── backend/           ← FastAPI + OI algorithm
├── system/            ← OpenSpecs — Single Source of Truth
├── docs/              ← Architecture, conventions, guides
├── memory/            ← Decisions, backlog, gotchas
├── standalone/        ← Legacy HTML (reference, inactive)
├── CLAUDE.md          ← Entry point for Claude/Cowork
├── AGENTS.md          ← Entry point for Codex CLI
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

| Version | Status | Scope |
|---|---|---|
| v3.1–v4.7.1 | ✅ | Frontend Vite · weather backend · DB catalog · i18n |
| v5.0–v5.6 | ✅ | JWT auth · ImageGenerator · Myco-Engine Visual DNA |
| v6.0 | ✅ | OpenSpecs migration — structured SSOT, IDE-agnostic |
| v7.0 | ✅ | Social login: Google OAuth2 |
| v7.1 | 🚧 | Email confirmation on signup · design polish |
| v8.0 | 🚧 | Android mobile app — scaffold, nav, design system, zones done; species + map pending |
| v8.5 | 🗂 | Shared package — scoring, constants, types, i18n extracted as monorepo internal packages |
| v9.0 | 🗂 | SEO: static prerendering + Core Web Vitals |

Detailed backlog: `memory/pending.md`

---

## License

Demonstration prototype.
