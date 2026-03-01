# 🍄 Especificaciones: Ecosistema Backend Micológico de Precisión

## 1. Visión del Proyecto

Transformar una web de consulta estática en una plataforma de **decisión en tiempo real**. El backend centralizará datos de múltiples redes meteorológicas para calcular la probabilidad de fructificación por especie, basándose en el histórico de precipitaciones y choques térmicos de los últimos 21 días.

El frontend actual (Vite + React) llama a Open-Meteo directamente desde el browser. Con el backend, esta lógica pasa al servidor: los scores se calculan una vez, se cachean con HTTP headers estándar, y el cliente recibe datos ya procesados. El localStorage de 3h desaparece.

---

## 2. Arquitectura del Sistema (Stack 0€)

| Capa | Tecnología | Proveedor |
| :--- | :--- | :--- |
| **API** | FastAPI (Python 3.12+) | Render / Railway (free tier) |
| **Base de datos** | PostgreSQL 16 + PostGIS 3.4 | Supabase o Neon.tech (free tier) |
| **Cola de tareas** | FastAPI BackgroundTasks (inicio) → Celery + Redis (escala) | Upstash Redis (free tier) |
| **CI/CD** | GitHub Actions | GitHub (gratis) |
| **Frontend** | Vite + React (sin cambios) | Vercel |

**Estrategia de datos:** ingesta programada (cron) que construye un histórico propio. El histórico es el activo diferencial: cuanto más tiempo corra el sistema, más preciso será el IB al tener datos reales de zonas españolas en vez de modelos globales.

---

## 3. Jerarquía de Fuentes Meteorológicas

| Prioridad | Región / CCAA | Organismo / Red | Valor Micológico Diferencial |
| :--- | :--- | :--- | :--- |
| **P1** | Cataluña | Meteocat (XEMA) | Alta densidad de estaciones; humedad de suelo real. |
| **P1** | País Vasco | Euskalmet | Estaciones en zonas críticas de hayedos. |
| **P1** | Galicia | MeteoGalicia | Resolución extrema en pluviosidad atlántica. |
| **P1** | Navarra | Meteo Navarra | Clave para el seguimiento del Pirineo occidental. |
| **P1** | Andalucía | Red RIA (Junta) | Ideal para alcornocales y dehesas. |
| **P2** | Nacional | AEMET OpenData | Cobertura en Castillas, Aragón, Madrid y Extremadura. |
| **P3** | Global | Open-Meteo | Fallback final si la estación local falla o está fuera. |

Open-Meteo pasa de llamarse desde el browser a llamarse desde el servidor, lo que elimina los problemas de CORS y permite cachear las respuestas de forma centralizada.

---

## 4. Diseño de la Base de Datos (PostgreSQL + PostGIS)

### 4.1 Tabla `zonas`

```sql
CREATE TABLE zonas (
    id            TEXT PRIMARY KEY,              -- 'zone-001', mismo que el mock actual
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

### 4.2 Tabla `especies`

```sql
CREATE TABLE especies (
    id                TEXT PRIMARY KEY,          -- 'esp-001'
    nombre_cientifico TEXT NOT NULL,
    familia           TEXT NOT NULL,
    comestibilidad    TEXT NOT NULL,             -- 'excelente', 'bueno', ..., 'mortal'
    -- Parámetros biológicos para el IB (por especie)
    temp_min_c        NUMERIC(4,1),              -- temperatura mínima viable
    temp_opt_c        NUMERIC(4,1),              -- temperatura óptima de fructificación
    temp_max_c        NUMERIC(4,1),
    lluvia_min_mm     INTEGER,                   -- lluvia mínima en PA21
    lluvia_opt_mm     INTEGER,
    ciclo_dias        INTEGER,                   -- días desde evento lluvia hasta aparición
    tipos_bosque      TEXT[],                    -- array: {'pinar','hayedo'}
    meses_fruct       INTEGER[],                 -- array: {9,10,11}
    altitud_min_m     INTEGER,
    altitud_max_m     INTEGER,
    datos_extra       JSONB                      -- morfología, confusiones, fotos, etc.
);
```

### 4.3 Tabla `historial_clima` ← núcleo del sistema

```sql
CREATE TABLE historial_clima (
    id              BIGSERIAL PRIMARY KEY,
    zona_id         TEXT NOT NULL REFERENCES zonas(id) ON DELETE CASCADE,
    fecha           DATE NOT NULL,
    -- Métricas diarias
    temp_max_c      NUMERIC(4,1),
    temp_min_c      NUMERIC(4,1),
    temp_media_c    NUMERIC(4,1),
    temp_suelo_c    NUMERIC(4,1),               -- de Meteocat/Open-Meteo hourly
    precipitacion_mm NUMERIC(6,2) NOT NULL DEFAULT 0,
    humedad_pct     INTEGER,
    viento_kmh      INTEGER,
    -- Metadata de origen
    fuente          TEXT NOT NULL,              -- 'meteocat', 'aemet', 'open-meteo', etc.
    estacion_id     TEXT,                       -- ID de la estación fuente (para auditoría)
    dist_estacion_km NUMERIC(5,1),             -- distancia zona↔estación (PostGIS)
    -- Control de calidad
    interpolado     BOOLEAN DEFAULT false,      -- true si el dato es estimado/interpolado
    creado_en       TIMESTAMPTZ DEFAULT now(),
    UNIQUE(zona_id, fecha)                      -- una fila por zona/día
);

-- Índices críticos para las queries del IB
CREATE INDEX historial_zona_fecha_idx ON historial_clima(zona_id, fecha DESC);
CREATE INDEX historial_fecha_idx ON historial_clima(fecha DESC);
```

**Granularidad diaria** (no horaria): el IB trabaja con acumulados de 21 días, no con resolución intradiaria. Los datos horarios de Open-Meteo se agregan en el cron antes de insertar.

**Retención:** mínimo 2 años para detectar patrones interanuales. En Supabase free tier (~500MB) caben ~28 zonas × 730 días × ~200 bytes/fila ≈ 4MB, perfectamente viable.

### 4.4 Tabla `scores_cache`

```sql
CREATE TABLE scores_cache (
    zona_id         TEXT PRIMARY KEY REFERENCES zonas(id),
    score_ib        INTEGER NOT NULL,           -- 0-100
    score_detalle   JSONB NOT NULL,             -- {pa21, termal, maduracion, estacional}
    calculado_en    TIMESTAMPTZ NOT NULL,
    valido_hasta    TIMESTAMPTZ NOT NULL        -- calculado_en + 24h
);
```

Evita recalcular el IB en cada petición del frontend. El cron lo rellena tras la ingesta.

### 4.5 Tabla `estaciones_meteo` (PostGIS)

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

Permite la query PostGIS que asigna automáticamente la estación más cercana a cada zona:

```sql
-- Estación P1 más cercana a una zona (con límite de distancia razonable)
SELECT e.id, e.fuente, ST_Distance(e.geom::geography, z.geom::geography) / 1000 AS dist_km
FROM estaciones_meteo e, zonas z
WHERE z.id = 'zone-001'
  AND e.activa = true
ORDER BY e.geom <-> z.geom   -- operador KNN de PostGIS (usa el índice GIST)
LIMIT 5;
```

---

## 5. Algoritmia: El Índice de Brote (IB)

El IB sustituye y amplía el `overallScore` actual. La estructura de pesos es similar pero opera sobre datos históricos reales por zona, no sobre una sola lectura puntual.

### 5.1 Fórmula

```
IB = PA21_score  × 0.30
   + Termal_score × 0.25
   + Estacional   × 0.25
   + Maduracion   × 0.12
   + Humedad_score× 0.08
```

### 5.2 Componentes

**PA21_score** — Precipitación acumulada 21 días

```python
def score_pa21(mm: float) -> int:
    """Lluvia acumulada últimos 21 días. Optimum: 60-120mm."""
    if mm < 15:   return 0    # demasiado seco
    if mm < 30:   return int(mm / 30 * 40)
    if mm < 60:   return 40 + int((mm - 30) / 30 * 35)
    if mm <= 120: return 75 + int((mm - 60) / 60 * 25)   # 100 en 120mm
    return max(0, 100 - int((mm - 120) / 20 * 15))       # penaliza exceso
```

**Termal_score** — Ventana térmica + penalización heladas

```python
def score_termal(temp_media: float, heladas_72h: int, especie: Especie) -> int:
    """
    temp_media: temperatura media últimos 7 días.
    heladas_72h: horas con T < 0°C en las últimas 72h.
    """
    base = score_temperatura(temp_media, especie.temp_min_c, especie.temp_opt_c, especie.temp_max_c)
    penalizacion_helada = min(40, heladas_72h * 3)   # -3 pts por hora de helada, max -40
    return max(0, base - penalizacion_helada)
```

**Estacional** — Factor mensual (heredado del scoring actual, calibrado por observaciones)

```python
FACTOR_ESTACIONAL = {1:15, 2:20, 3:38, 4:58, 5:62, 6:28, 7:18, 8:48, 9:80, 10:100, 11:88, 12:42}
```

**Maduracion_score** — Días desde el último evento de lluvia significativa (≥10mm/día)

```python
def score_maduracion(dias_desde_lluvia: int, ciclo_dias_especie: int) -> int:
    """
    Cada especie tiene un ciclo óptimo (p.ej. Boletus edulis: 7-10 días).
    Score máximo cuando dias_desde_lluvia ≈ ciclo_dias_especie.
    """
    delta = abs(dias_desde_lluvia - ciclo_dias_especie)
    if delta == 0: return 100
    if delta <= 2: return 85
    if delta <= 5: return 60
    if delta <= 8: return 30
    return 0
```

### 5.3 IB por especie vs IB de zona

- **IB de zona** (`scores_cache`): calculado con parámetros medios de todas las especies en temporada. Se muestra en tarjetas y mapa.
- **IB por especie** (calculado on-demand): usa `temp_opt_c`, `lluvia_min_mm` y `ciclo_dias` específicos de esa especie. Se muestra en la ficha de especie y en el ranking de fichas de zona.

---

## 6. Lógica de Selección de Fuente (Cadena de Fallback)

```python
MAX_DIST_P1_KM = 35   # más de 35km de la estación, no fiarse del P1
MAX_DIST_P2_KM = 80

async def get_weather_provider(zona: Zona, db: AsyncSession) -> WeatherConnector:
    """
    Devuelve el conector más preciso disponible para una zona.
    Usa PostGIS para calcular la estación más cercana de cada proveedor.
    """
    ccaa_to_p1 = {
        "Catalunya":   MeteocatConnector,
        "Euskadi":     EuskalmetConnector,
        "Galicia":     MeteoGaliciaConnector,
        "Navarra":     MeteoNavarraConnector,
        "Andalucía":   RedRIAConnector,
    }

    # P1: proveedor regional, si existe y la estación está suficientemente cerca
    if zona.ccaa in ccaa_to_p1:
        connector_cls = ccaa_to_p1[zona.ccaa]
        nearest = await get_nearest_station(zona, connector_cls.SOURCE, db)
        if nearest and nearest.dist_km <= MAX_DIST_P1_KM:
            try:
                connector = connector_cls(station_id=nearest.id)
                await connector.health_check()   # verifica que la API responde
                return connector
            except ProviderUnavailable:
                log.warning(f"P1 {connector_cls.SOURCE} caído para {zona.id}, degradando a P2")

    # P2: AEMET nacional
    nearest_aemet = await get_nearest_station(zona, "aemet", db)
    if nearest_aemet and nearest_aemet.dist_km <= MAX_DIST_P2_KM:
        try:
            return AemetConnector(station_id=nearest_aemet.id)
        except ProviderUnavailable:
            log.warning(f"P2 AEMET caído para {zona.id}, degradando a P3")

    # P3: Open-Meteo (siempre disponible, sin límites, sin API key)
    return OpenMeteoConnector(lat=zona.lat, lon=zona.lon)
```

Cada degradación queda registrada en `historial_clima.fuente` y `dist_estacion_km`, lo que permite analizar la calidad de datos por zona a lo largo del tiempo.

---

## 7. Diseño del Cron de Ingesta

### 7.1 Frecuencia y horario

```
0 5 * * *   →  05:00 UTC (07:00 hora española)
```

Ejecutado tras la publicación nocturna de la mayoría de redes regionales. Si un día falla, no se pierde el histórico: el siguiente día puede hacer backfill de los días faltantes.

### 7.2 Flujo de ejecución

```python
async def daily_ingest():
    zonas = await db.fetch_all("SELECT * FROM zonas WHERE activa = true")

    # Concurrencia limitada: máx 6 peticiones simultáneas (igual que el frontend actual)
    sem = asyncio.Semaphore(6)

    async def ingest_zona(zona):
        async with sem:
            provider = await get_weather_provider(zona, db)
            data = await provider.fetch_yesterday()     # datos del día anterior

            # Upsert: idempotente, seguro si el cron corre dos veces
            await db.execute("""
                INSERT INTO historial_clima (zona_id, fecha, temp_max_c, temp_min_c,
                    temp_media_c, temp_suelo_c, precipitacion_mm, humedad_pct,
                    viento_kmh, fuente, estacion_id, dist_estacion_km, interpolado)
                VALUES (:zona_id, :fecha, ...)
                ON CONFLICT (zona_id, fecha) DO UPDATE SET
                    fuente = EXCLUDED.fuente,
                    precipitacion_mm = EXCLUDED.precipitacion_mm
                    -- solo actualiza si la nueva fuente es de mayor calidad
                    WHERE historial_clima.fuente = 'open-meteo'
                      AND EXCLUDED.fuente != 'open-meteo'
            """, data)

    await asyncio.gather(*[ingest_zona(z) for z in zonas])

    # Recalcular scores tras la ingesta
    await recalculate_all_scores()
    await update_scores_cache()
```

### 7.3 Backfill inicial

Al arrancar el sistema por primera vez, se ejecuta un job de backfill que carga los últimos 2 años de datos históricos de Open-Meteo (tiene API de histórico gratuita). Los datos P1 solo están disponibles en tiempo real, así que el histórico inicial siempre será P3 — eso es correcto y esperado.

```bash
python -m scripts.backfill --zona all --desde 2024-01-01 --hasta 2026-02-28
```

---

## 8. API Endpoints (FastAPI)

Todos los endpoints devuelven `Cache-Control: public, max-age=3600` (1h). El frontend elimina el localStorage de 3h actual y confía en los headers HTTP.

```
GET  /api/v1/zonas
     → Lista todas las zonas con su IB actual (de scores_cache)
     → Query params: ?ccaa=Catalunya&bosque=hayedo&min_score=60

GET  /api/v1/zonas/{zona_id}
     → Ficha completa: metadata + IB actual + desglose de scores

GET  /api/v1/zonas/{zona_id}/historial
     → Histórico de precipitación y temperatura (últimos N días)
     → Útil para gráfico de evolución en la ficha de zona

GET  /api/v1/mapa/scores
     → Scores de todas las zonas optimizados para el heatmap de Leaflet
     → [{lat, lon, score}] — endpoint ligero, caché agresiva

GET  /api/v1/especies
     → Catálogo completo de especies (sustituye el mock species.js)

GET  /api/v1/especies/{especie_id}
     → Ficha de especie + IB calculado para esa especie en las zonas compatibles

GET  /api/v1/prediccion/mejores-zonas
     → Top 10 zonas por IB en este momento + especie protagonista de cada una

GET  /api/v1/health
     → Estado del sistema: última ingesta, fuentes activas, score medio nacional
```

---

## 9. Estrategia de Transición (Tres Fases)

Pasar de "todo mock" a "backend completo" de golpe es la manera más segura de bloquearse. Se propone una transición por fases que permite desplegar valor en cada etapa.

### Fase 1 — Backend meteorológico (sin tocar el catálogo)

El frontend deja de llamar a Open-Meteo directamente. El backend hace las llamadas y devuelve el mismo formato que el `weatherService.js` actual. El catálogo (zonas, especies, familias) sigue siendo el mock en `src/data/`.

- **Entregable:** `GET /api/v1/zonas/{id}/condiciones` con el mismo schema que `weatherService.js` devuelve hoy.
- **Cambio en frontend:** `weatherService.js` apunta a `VITE_API_URL` en vez de a Open-Meteo.
- **Ventaja:** se puede hacer en paralelo, sin romper nada. Si el backend falla, se puede volver al modo directo con una variable de entorno.

### Fase 2 — Migración del catálogo a PostgreSQL

Seed script que toma `src/data/species.js`, `zones.js` y `families.js` y los inserta en la DB. Los endpoints `/api/v1/especies` y `/api/v1/zonas` sustituyen a los imports de mock data.

- **Entregable:** seed script (`scripts/seed_catalog.py`) + endpoints de catálogo.
- **Cambio en frontend:** eliminar `import { mockSpecies } from '../data/species'` y usar fetch al API.

### Fase 3 — Autenticación y features sociales

JWT (OAuth2 con FastAPI Security) para seguimiento de zonas, favoritos y futuros avistamientos comunitarios.

- **Entregable:** `POST /api/v1/auth/register`, `POST /api/v1/auth/token`, endpoints `/api/v1/me/*`.
- **Nota:** hasta esta fase, seguimiento y favoritos siguen en localStorage (como ahora).

---

## 10. Consideraciones de Infraestructura

**Cold starts en Render free tier:** los servidores gratuitos se "duermen" tras 15min de inactividad. El cron diario los despierta solo una vez al día — aceptable para la ingesta. Para los endpoints del frontend, se puede añadir un ping de keep-alive barato (UptimeRobot, gratis).

**Límites de Supabase/Neon free tier:** ~500MB de DB y ~5GB de transferencia/mes. Con 28 zonas y retención de 2 años el footprint de datos es <10MB. Muy por debajo del límite.

**Variables de entorno necesarias:**
```
DATABASE_URL=postgresql+asyncpg://...
METEOCAT_API_KEY=...
AEMET_API_KEY=...
SECRET_KEY=...               # para JWT en Fase 3
VITE_API_URL=https://fungus-api.onrender.com   # en el frontend
```
