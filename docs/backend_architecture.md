# 🍄 Backend Specifications: Precision Mycological Ecosystem

## 1. Project Vision

Transform a static query website into a **real-time decision platform**. The backend will centralize data from multiple weather networks to calculate fruiting probability by species, based on the history of precipitation and thermal shocks from the last 21 days.

The current frontend (Vite + React) calls Open-Meteo directly from the browser. With the backend, this logic moves to the server: scores are calculated once, cached with standard HTTP headers, and the client receives already-processed data. The 3h localStorage disappears.

---

## 2. System Architecture (Free Stack)

| Layer | Technology | Provider |
| :--- | :--- | :--- |
| **API** | FastAPI (Python 3.12+) | Render / Railway (free tier) |
| **Database** | PostgreSQL 16 + PostGIS 3.4 | Supabase or Neon.tech (free tier) |
| **Task Queue** | FastAPI BackgroundTasks (start) → Celery + Redis (scale) | Upstash Redis (free tier) |
| **CI/CD** | GitHub Actions | GitHub (free) |
| **Frontend** | Vite + React (no changes) | Vercel |

**Data strategy:** scheduled ingestion (cron) that builds its own history. The history is the differential asset: the longer the system runs, the more accurate the IB becomes by having real data from Spanish zones instead of global models.

---

## 3. Weather Source Hierarchy

| Priority | Region / Region | Agency / Network | Differential Mycological Value |
| :--- | :--- | :--- | :--- |
| **P1** | Catalonia | Meteocat (XEMA) | High station density; real soil humidity. |
| **P1** | Basque Country | Euskalmet | Stations in critical oak forest areas. |
| **P1** | Galicia | MeteoGalicia | Extreme resolution in Atlantic rainfall. |
| **P1** | Navarre | Meteo Navarra | Key for western Pyrenees tracking. |
| **P1** | Andalusia | RIA Network (Regional) | Ideal for cork forests and grasslands. |
| **P2** | National | AEMET OpenData | Coverage in Castiles, Aragon, Madrid, Extremadura. |
| **P3** | Global | Open-Meteo | Final fallback if local station fails or is out of range. |

Open-Meteo moves from being called by the browser to being called by the server, eliminating CORS issues and allowing responses to be centrally cached.

---

## 4. Database Design (PostgreSQL + PostGIS)

### 4.1 `zonas` Table

```sql
CREATE TABLE zonas (
    id            TEXT PRIMARY KEY,              -- 'zone-001', same as current mock
    nombre        TEXT NOT NULL,
    provincia     TEXT NOT NULL,
    ccaa          TEXT NOT NULL,                 -- 'Catalunya', 'Euskadi', etc.
    geom          GEOMETRY(Point, 4326) NOT NULL, -- PostGIS: lon/lat WGS84
    altitud_m     INTEGER,
    tipo_bosque   TEXT,                          -- 'pinar', 'hayedo', 'robledal', 'encinar'
    tipo_suelo    TEXT,
    activa        BOOLEAN DEFAULT true,
    creada_en     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX zonas_geom_idx ON zonas USING GIST(geom);
CREATE INDEX zonas_ccaa_idx ON zonas(ccaa);
```

### 4.2 `especies` Table

```sql
CREATE TABLE especies (
    id                TEXT PRIMARY KEY,          -- 'esp-001'
    nombre_cientifico TEXT NOT NULL,
    familia           TEXT NOT NULL,
    comestibilidad    TEXT NOT NULL,             -- 'excelente', 'bueno', ..., 'mortal'
    -- Biological parameters for IB (per species)
    temp_min_c        NUMERIC(4,1),              -- minimum viable temperature
    temp_opt_c        NUMERIC(4,1),              -- optimal fruiting temperature
    temp_max_c        NUMERIC(4,1),
    lluvia_min_mm     INTEGER,                   -- minimum rainfall in PA21
    lluvia_opt_mm     INTEGER,
    ciclo_dias        INTEGER,                   -- days from rainfall event to appearance
    tipos_bosque      TEXT[],                    -- array: {'pinar','hayedo'}
    meses_fruct       INTEGER[],                 -- array: {9,10,11}
    altitud_min_m     INTEGER,
    altitud_max_m     INTEGER,
    datos_extra       JSONB                      -- morphology, confusions, photos, etc.
);
```

### 4.3 `historial_clima` Table ← system core

```sql
CREATE TABLE historial_clima (
    id              BIGSERIAL PRIMARY KEY,
    zona_id         TEXT NOT NULL REFERENCES zonas(id) ON DELETE CASCADE,
    fecha           DATE NOT NULL,
    -- Daily metrics
    temp_max_c      NUMERIC(4,1),
    temp_min_c      NUMERIC(4,1),
    temp_media_c    NUMERIC(4,1),
    temp_suelo_c    NUMERIC(4,1),               -- from Meteocat/Open-Meteo hourly
    precipitacion_mm NUMERIC(6,2) NOT NULL DEFAULT 0,
    humedad_pct     INTEGER,
    viento_kmh      INTEGER,
    -- Source metadata
    fuente          TEXT NOT NULL,              -- 'meteocat', 'aemet', 'open-meteo', etc.
    estacion_id     TEXT,                       -- ID of source station (for audit)
    dist_estacion_km NUMERIC(5,1),             -- distance zone↔station (PostGIS)
    -- Quality control
    interpolado     BOOLEAN DEFAULT false,      -- true if data is estimated/interpolated
    creado_en       TIMESTAMPTZ DEFAULT now(),
    UNIQUE(zona_id, fecha)                      -- one row per zone/day
);

-- Critical indices for IB queries
CREATE INDEX historial_zona_fecha_idx ON historial_clima(zona_id, fecha DESC);
CREATE INDEX historial_fecha_idx ON historial_clima(fecha DESC);
```

**Daily granularity** (not hourly): the IB works with 21-day accumulations, not intraday resolution. Hourly data from Open-Meteo is aggregated in the cron before inserting.

**Retention:** minimum 2 years to detect interannual patterns. In Supabase free tier (~500MB) ~28 zones × 730 days × ~200 bytes/row ≈ 4MB fits perfectly.

### 4.4 `scores_cache` Table

```sql
CREATE TABLE scores_cache (
    zona_id         TEXT PRIMARY KEY REFERENCES zonas(id),
    score_ib        INTEGER NOT NULL,           -- 0-100
    score_detalle   JSONB NOT NULL,             -- {pa21, termal, maduracion, estacional}
    calculado_en    TIMESTAMPTZ NOT NULL,
    valido_hasta    TIMESTAMPTZ NOT NULL        -- calculado_en + 24h
);
```

Avoids recalculating IB on each frontend request. The cron fills it after ingestion.

### 4.5 `estaciones_meteo` Table (PostGIS)

```sql
CREATE TABLE estaciones_meteo (
    id           TEXT PRIMARY KEY,
    fuente       TEXT NOT NULL,                 -- 'meteocat', 'aemet', etc.
    geom         GEOMETRY(Point, 4326) NOT NULL,
    activa       BOOLEAN DEFAULT true,
    nombre       TEXT,
    altitud_m    INTEGER,
    metadatos    JSONB
);

CREATE INDEX estaciones_geom_idx ON estaciones_meteo USING GIST(geom);
```

Enables PostGIS query that automatically assigns closest station to each zone:

```sql
-- Closest P1 station to a zone (with reasonable distance limit)
SELECT e.id, e.fuente, ST_Distance(e.geom::geography, z.geom::geography) / 1000 AS dist_km
FROM estaciones_meteo e, zonas z
WHERE z.id = 'zone-001'
  AND e.activa = true
ORDER BY e.geom <-> z.geom   -- PostGIS KNN operator (uses GIST index)
LIMIT 5;
```

---

## 5. Algorithmics: The Outbreak Index (IB)

The IB replaces and extends the current `overallScore`. The weight structure is similar but operates on real historical data per zone, not a single point reading.

### 5.1 Formula

```
IB = PA21_score  × 0.30
   + Termal_score × 0.25
   + Estacional   × 0.25
   + Maduracion   × 0.12
   + Humedad_score× 0.08
```

### 5.2 Components

**PA21_score** — Accumulated precipitation 21 days

```python
def score_pa21(mm: float) -> int:
    """Accumulated rainfall last 21 days. Optimum: 60-120mm."""
    if mm < 15:   return 0    # too dry
    if mm < 30:   return int(mm / 30 * 40)
    if mm < 60:   return 40 + int((mm - 30) / 30 * 35)
    if mm <= 120: return 75 + int((mm - 60) / 60 * 25)   # 100 at 120mm
    return max(0, 100 - int((mm - 120) / 20 * 15))       # penalizes excess
```

**Termal_score** — Thermal window + frost penalty

```python
def score_termal(temp_media: float, heladas_72h: int, especie: Especie) -> int:
    """
    temp_media: average temperature last 7 days.
    heladas_72h: hours with T < 0°C in last 72h.
    """
    base = score_temperatura(temp_media, especie.temp_min_c, especie.temp_opt_c, especie.temp_max_c)
    penalizacion_helada = min(40, heladas_72h * 3)   # -3 pts per frost hour, max -40
    return max(0, base - penalizacion_helada)
```

**Estacional** — Monthly factor (inherited from current scoring, calibrated by observations)

```python
FACTOR_ESTACIONAL = {1:15, 2:20, 3:38, 4:58, 5:62, 6:28, 7:18, 8:48, 9:80, 10:100, 11:88, 12:42}
```

**Maduracion_score** — Days since last significant rainfall event (≥10mm/day)

```python
def score_maduracion(dias_desde_lluvia: int, ciclo_dias_especie: int) -> int:
    """
    Each species has optimal cycle (e.g., Boletus edulis: 7-10 days).
    Maximum score when dias_desde_lluvia ≈ ciclo_dias_especie.
    """
    delta = abs(dias_desde_lluvia - ciclo_dias_especie)
    if delta == 0: return 100
    if delta <= 2: return 85
    if delta <= 5: return 60
    if delta <= 8: return 30
    return 0
```

### 5.3 Zone IB vs Species IB

- **Zone IB** (`scores_cache`): calculated with average parameters of all species in season. Shown in cards and map.
- **Species IB** (calculated on-demand): uses specific `temp_opt_c`, `lluvia_min_mm`, and `ciclo_dias` of that species. Shown in species card and zone ranking.

---

## 6. Source Selection Logic (Fallback Chain)

```python
MAX_DIST_P1_KM = 35   # more than 35km from station, don't trust P1
MAX_DIST_P2_KM = 80

async def get_weather_provider(zona: Zona, db: AsyncSession) -> WeatherConnector:
    """
    Returns the most precise available connector for a zone.
    Uses PostGIS to calculate closest station of each provider.
    """
    ccaa_to_p1 = {
        "Catalunya":   MeteocatConnector,
        "Euskadi":     EuskalmetConnector,
        "Galicia":     MeteoGaliciaConnector,
        "Navarra":     MeteoNavarraConnector,
        "Andalucía":   RedRIAConnector,
    }

    # P1: regional provider, if exists and station is close enough
    if zona.ccaa in ccaa_to_p1:
        connector_cls = ccaa_to_p1[zona.ccaa]
        nearest = await get_nearest_station(zona, connector_cls.SOURCE, db)
        if nearest and nearest.dist_km <= MAX_DIST_P1_KM:
            try:
                connector = connector_cls(station_id=nearest.id)
                await connector.health_check()   # verifies API responds
                return connector
            except ProviderUnavailable:
                log.warning(f"P1 {connector_cls.SOURCE} down for {zona.id}, degrading to P2")

    # P2: AEMET national
    nearest_aemet = await get_nearest_station(zona, "aemet", db)
    if nearest_aemet and nearest_aemet.dist_km <= MAX_DIST_P2_KM:
        try:
            return AemetConnector(station_id=nearest_aemet.id)
        except ProviderUnavailable:
            log.warning(f"P2 AEMET down for {zona.id}, degrading to P3")

    # P3: Open-Meteo (always available, unlimited, no API key)
    return OpenMeteoConnector(lat=zona.lat, lon=zona.lon)
```

Each degradation is logged in `historial_clima.fuente` and `dist_estacion_km`, allowing analysis of data quality by zone over time.

---

## 7. Ingestion Cron Design

### 7.1 Frequency and Schedule

```
0 5 * * *   →  05:00 UTC (07:00 Spanish time)
```

Run after nightly publication of most regional networks. If a day fails, history isn't lost: next day can backfill missing days.

### 7.2 Execution Flow

```python
async def daily_ingest():
    zonas = await db.fetch_all("SELECT * FROM zonas WHERE activa = true")

    # Limited concurrency: max 6 simultaneous requests (same as current frontend)
    sem = asyncio.Semaphore(6)

    async def ingest_zona(zona):
        async with sem:
            provider = await get_weather_provider(zona, db)
            data = await provider.fetch_yesterday()     # previous day's data

            # Upsert: idempotent, safe if cron runs twice
            await db.execute("""
                INSERT INTO historial_clima (zona_id, fecha, temp_max_c, temp_min_c,
                    temp_media_c, temp_suelo_c, precipitacion_mm, humedad_pct,
                    viento_kmh, fuente, estacion_id, dist_estacion_km, interpolado)
                VALUES (:zona_id, :fecha, ...)
                ON CONFLICT (zona_id, fecha) DO UPDATE SET
                    fuente = EXCLUDED.fuente,
                    precipitacion_mm = EXCLUDED.precipitacion_mm
                    -- only update if new source is higher quality
                    WHERE historial_clima.fuente = 'open-meteo'
                      AND EXCLUDED.fuente != 'open-meteo'
            """, data)

    await asyncio.gather(*[ingest_zona(z) for z in zonas])

    # Recalculate scores after ingestion
    await recalculate_all_scores()
    await update_scores_cache()
```

### 7.3 Initial Backfill

When starting the system for the first time, a backfill job runs that loads the last 2 years of historical data from Open-Meteo (it has a free historical API). P1 data is only available in real-time, so initial history will always be P3 — that's correct and expected.

```bash
python -m scripts.backfill --zona all --desde 2024-01-01 --hasta 2026-02-28
```

---

## 8. API Endpoints (FastAPI)

All endpoints return `Cache-Control: public, max-age=3600` (1h). The frontend removes the current 3h localStorage and trusts HTTP headers.

```
GET  /api/v1/zonas
     → Lists all zones with current IB (from scores_cache)
     → Query params: ?ccaa=Catalunya&bosque=hayedo&min_score=60

GET  /api/v1/zonas/{zona_id}
     → Complete card: metadata + current IB + score breakdown

GET  /api/v1/zonas/{zona_id}/historial
     → Precipitation and temperature history (last N days)
     → Useful for evolution graph in zone card

GET  /api/v1/mapa/scores
     → Scores for all zones optimized for Leaflet heatmap
     → [{lat, lon, score}] — lightweight endpoint, aggressive cache

GET  /api/v1/especies
     → Complete species catalog (replaces mock species.js)

GET  /api/v1/especies/{especie_id}
     → Species card + IB calculated for that species in compatible zones

GET  /api/v1/prediccion/mejores-zonas
     → Top 10 zones by IB right now + main species for each

GET  /api/v1/health
     → System status: last ingestion, active sources, national average score
```

---

## 9. Transition Strategy (Three Phases)

Switching from "all mock" to "complete backend" in one go is the safest way to get blocked. A phased transition is proposed that allows delivering value at each stage.

### Phase 1 — Weather Backend (without touching catalog)

Frontend stops calling Open-Meteo directly. Backend makes calls and returns same format that `weatherService.js` currently does. Catalog (zones, species, families) remains mock in `src/data/`.

- **Deliverable:** `GET /api/v1/zonas/{id}/condiciones` with same schema as `weatherService.js` returns today.
- **Frontend change:** `weatherService.js` points to `VITE_API_URL` instead of Open-Meteo.
- **Advantage:** can be done in parallel, breaking nothing. If backend fails, can revert to direct mode with environment variable.

### Phase 2 — Catalog Migration to PostgreSQL

Seed script takes `src/data/species.js`, `zones.js`, and `families.js` and inserts into DB. Endpoints `/api/v1/especies` and `/api/v1/zonas` replace mock data imports.

- **Deliverable:** seed script (`scripts/seed_catalog.py`) + catalog endpoints.
- **Frontend change:** remove `import { mockSpecies } from '../data/species'` and use API fetch.

### Phase 3 — Authentication and Social Features

JWT (OAuth2 with FastAPI Security) for zone following, favorites, and future community sightings.

- **Deliverable:** `POST /api/v1/auth/register`, `POST /api/v1/auth/token`, endpoints `/api/v1/me/*`.
- **Note:** until this phase, following and favorites remain in localStorage (as now).

---

## 10. Infrastructure Considerations

**Cold starts on Render free tier:** free servers "sleep" after 15min of inactivity. Daily cron wakes them only once a day — acceptable for ingestion. For frontend endpoints, can add cheap keep-alive ping (UptimeRobot, free).

**Supabase/Neon free tier limits:** ~500MB DB and ~5GB transfer/month. With 28 zones and 2-year retention, data footprint is <10MB. Well under limit.

**Required environment variables:**
```
DATABASE_URL=postgresql+asyncpg://...
METEOCAT_API_KEY=...
AEMET_API_KEY=...
SECRET_KEY=...               # for JWT in Phase 3
VITE_API_URL=https://fungus-api.onrender.com   # in frontend
```
