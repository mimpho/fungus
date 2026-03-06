# Tareas Pendientes y Revisiones Abiertas

---

## 🗂 Próximo — v4.5 Auth/social

JWT, favoritos reales en BD, avistamientos comunitarios. Sin rama activa todavía.

Alcance previsto:
- Auth: JWT (login/registro), middleware de protección de rutas
- Favoritos: zonas y especies guardadas en BD por usuario (reemplaza localStorage)
- Avistamientos: POST /api/v1/sightings — foto, zona, especie, fecha, usuario

---

## ✅ Completado — v4.4.0 (2026-03-06)

Weather cache BD server-side + integración frontend completa. Mergeado a `main`, tag `v4.4.0`.

- `WeatherCache` model + migración 003
- `GET /api/v1/weather/zones` y `GET /api/v1/weather/zones/{id}` — cache-first
- `GET /api/v1/zones` embebe `weather: ZoneWeather` por zona
- Warmup de caché al arrancar (background task, batches de 10)
- Auto-migrate al arrancar via `asyncio.to_thread`
- `GET /api/v1/admin/trigger-backfill?days=N` — backfill sin shell (Render free tier)
- `VITE_API_BASE` configurable via env var
- Frontend: `useApiZoneConditions` con `dryDays` desde `score_detail.days_since_rain`
- `ZoneCard` y `ZoneModal` muestran rango `tempMin–tempMax°C`
- Artículo "Los recicladores del bosque" (Recicladores.jsx)

---

## ✅ Completado — v4.3.0 (2026-03-06)

Integración frontend completa: mock → API, hooks de condiciones via backend.

- `useZones` hook: consume `/api/v1/zones`
- `useSpecies` hook: consume `/api/v1/species` con paginación cursor
- `SpeciesModal`: lazy-load de detalle completo cuando `_partial=true`
- Fallback a mock data si el backend no responde

---

## ✅ Completado — v4.2.0 (2026-03-02)

- `HEAD /api/v1/health` — probe sin DB query (UptimeRobot)
- Seed script — 200 zonas, 201 especies en Supabase
- `GET /api/v1/species` y `GET /api/v1/species/{id}`
- Zonas con campo `description` (migración 002)

---

## ✅ Completado — v4.1.0 (2026-03-02)

- FastAPI + PostgreSQL + PostGIS desplegado en Render + Supabase
- Outbreak Index algorithm
- `GET /api/v1/zones`, `/api/v1/zones/map-scores`, `/api/v1/zones/{id}`
- CI/CD, tests unitarios (41 tests OI), docs de entornos y deploy

---

## 🟡 Backlog — v3.x (sin prioridad activa)

### Revisión general del catálogo de especies
- Verificar que `forestTypes` y `fruitingMonths` sean correctos para todas las especies
- Añadir más especies si faltan representativas de cada tipo de bosque
- Valorar tipos de bosque adicionales: abetosas, coníferas mixtas, etc.

### Zonas sin especies en temporada
Si no hay especies que coincidan con una zona/mes, el score meteorológico queda sin ajustar. Considerar penalización por "zona sin interés micológico este mes".

### `speciesScore` en ZoneModal
El campo `speciesScore` (SQS) se calcula pero no se muestra en la UI. Candidato a indicador adicional en la ficha de zona.

### Meteocat API para zonas catalanas
Requiere API key. Híbrido: Meteocat para zonas catalanas, Open-Meteo para el resto.

### Zonas personalizadas
Permitir al usuario añadir y guardar puntos propios en el mapa.
