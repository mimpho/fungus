# Tareas Pendientes y Revisiones Abiertas

---

## 🚧 En curso — Cierre v4.4 (epic: `epic/v4-4-weather-cache`)

### ⏳ Merge epic → main + tag
- Merge `epic/v4-4-weather-cache` → `main` con `--no-ff`
- Tag `v4.4.0`
- Verificar que Render sigue apuntando a `main` (o cambiar si procede)

### ⏳ CHANGELOG — cerrar bloque v4.4
Mover Unreleased a `[4.4.0]` consolidando todo el trabajo de la epic.

---

## ✅ Completado — v4.4 Weather Cache (epic/v4-4-weather-cache, 2026-03-06)

### v4.4.1 — WeatherCache model + skeleton
- Modelo `WeatherCache`, migración 003, skeleton de servicio y endpoints

### v4.4.2 — Servicio + integración frontend
- `fetch_weather_for_zone()` — fetch Open-Meteo con rango temp diario (min/max)
- `store_weather_cache()` + `get_latest_weather()` — caché BD con TTL 3h
- `GET /weather/zones/{id}` y `GET /weather/zones` — endpoints cache-first
- `GET /zones` enriquecido con weather embebido (`ZoneWeather` en `ZoneListItem`)
- Auto-migrate al arrancar: `await asyncio.to_thread(_run_db_migrations)`
- CORS con `allow_origin_regex` para preview URLs dinámicas de Vercel
- `VITE_API_BASE` configurable via env var en frontend
- `GET /admin/trigger-backfill?days=N` — backfill sin shell (Render free tier)
- Fix: `dryDays` leía de `weather_cache` en vez de `score_detail.days_since_rain`
- Fix: float precision helpers `r1`/`r0` en normalizeScore y useApiZoneConditions

---

## ✅ Completado — v4.3 Integración frontend → API

- `useZones` hook: consume `/api/v1/zones` (scores OI cacheados, sin 429s)
- `useSpecies` hook: consume `/api/v1/species` con paginación cursor
- `SpeciesModal`: lazy-load de detalle completo (`_partial=true`)
- Fallback a mock data si el backend no responde
- `ZoneModal`: usa `useApiZoneConditions` (score OI + weather desde backend)

---

## ✅ Completado — Nuevo artículo: Recicladores (2026-03-03)
- Añadido artículo "Los recicladores del bosque" en `src/articles/Recicladores.jsx`

---

## ✅ Completado — v4.2.0 (2026-03-02)
1. ✅ `HEAD /api/v1/health` — probe sin DB query (UptimeRobot)
2. ✅ Seed script — 200 zonas, 201 especies en Supabase
3. ✅ `GET /api/v1/species` y `GET /api/v1/species/{id}`
4. ✅ Zonas con campo `description` (migración 002)

---

## ✅ Completado — Deploy v4.1.0 en producción (2026-03-02)
- **API**: `https://fungus-api.onrender.com` (Render free tier)
- **BD**: Supabase PostgreSQL + PostGIS (Ireland)
- **Merge**: `epic/v4-backend` → `main` con `--no-ff`, tag `v4.1.0`
- **Keep-alive**: UptimeRobot monitor activo en `/api/v1/health`

---

## 🟡 Backlog — Próximas fases (sin prioridad activa)

### Auth + social (bloque independiente — v5.x o posterior)
Bloque de desarrollo propio, mayor envergadura que las fases anteriores.
- JWT / autenticación de usuarios
- Favoritos y seguimiento de zonas persistidos en BD (actualmente en localStorage)
- Avistamientos comunitarios — registro de hallazgos por usuarios

### Temperatura del suelo en weather_cache
`soilTemp` es siempre `null` en el frontend — el backend no la recoge actualmente.
- Añadir `soil_temp` a tabla `weather_cache` (migración 004)
- Actualizar `fetch_weather_for_zone()`: leer `hourly.soil_temperature_0cm`
- Actualizar schema `ZoneWeather` y normalizeScore/useApiZoneConditions
- ⚠️ `soil_temperature_0cm` solo existe en `hourly`, nunca en `current` (ver gotchas.md)

### Meteocat API para zonas catalanas
Requiere API key. Híbrido: Meteocat para catalanas, Open-Meteo para el resto.
Enchufar en `_get_connector()` de `ingest.py`.

### Revisión general del catálogo de especies
- Verificar `forestTypes` y `fruitingMonths` para todas las especies
- Añadir especies representativas que falten por tipo de bosque
- Valorar tipos adicionales: abetosas, coníferas mixtas, etc.

### Zonas sin especies en temporada
Si no hay especies que coincidan con zona/mes, considerar penalización por "zona sin interés micológico este mes".

### `speciesScore` en UI de ZoneModal
El campo SQS se calcula en conditions pero no se muestra. Útil como indicador adicional.

### Zonas personalizadas
Permitir al usuario añadir y guardar puntos propios en el mapa.
