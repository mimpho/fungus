"""
Fungus API — FastAPI application entry point.

Startup sequence:
  1. Run Alembic migrations (upgrade head) — garantiza schema actualizado sin shell
  2. Schedule the daily ingestion cron (APScheduler)
  3. If scores_cache is empty, run an ingest immediately (background task)
  4. If weather_cache is empty, warm up weather for all zones (background task)
  5. Mount API routers

Shutdown sequence:
  1. Shut down the scheduler
  2. Dispose the DB connection pool
"""
import asyncio
import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from importlib.metadata import version as pkg_version
from pathlib import Path

from alembic import command as alembic_command
from alembic.config import Config as AlembicConfig
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import BackgroundTasks, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, select

from app.config import settings
from app.database import AsyncSessionLocal, dispose_engine
from app.models.scores_cache import ScoresCache
from app.models.weather_cache import WeatherCache
from app.models.zone import Zone
from app.routers import health, species, weather, zones
from app.services.ingest import run_daily_ingest
from app.services.weather_cache import (
    DEFAULT_PROVIDER,
    fetch_weather_for_zone,
    store_weather_cache,
)

# Single source of truth for version — reads from pyproject.toml at runtime
APP_VERSION = pkg_version("fungus-api")

# Ruta a alembic.ini: backend/alembic.ini (un nivel arriba de app/)
_ALEMBIC_INI = Path(__file__).parent.parent / "alembic.ini"

logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(asctime)s %(levelname)-8s %(name)s — %(message)s",
)
log = logging.getLogger(__name__)

# ── Migrations ────────────────────────────────────────────────────────────────

def _run_db_migrations() -> None:
    """
    Ejecuta `alembic upgrade head` de forma síncrona.

    Se llama al inicio del lifespan antes de cualquier query, lo que garantiza
    que el schema esté actualizado sin necesidad de acceso a la shell de Render.
    Alembic es idempotente: si no hay migraciones pendientes, no hace nada.
    """
    cfg = AlembicConfig(str(_ALEMBIC_INI))
    alembic_command.upgrade(cfg, "head")
    log.info("DB migrations: schema up to date")


# ── Scheduler ─────────────────────────────────────────────────────────────────

scheduler = AsyncIOScheduler(timezone="UTC")


async def _scheduled_ingest() -> None:
    """Wrapper so the scheduler can call the ingest with a fresh DB session."""
    async with AsyncSessionLocal() as db:
        try:
            summary = await run_daily_ingest(db)
            log.info("Scheduled ingest finished: %s", summary)
        except Exception as exc:
            log.exception("Scheduled ingest failed: %s", exc)


async def _startup_ingest_if_empty() -> None:
    """
    On startup, run the ingest if scores_cache is empty.

    This covers two cases:
      - Fresh deploy (scores_cache never populated)
      - Free-tier cold start after the table was cleared

    Runs in the background so it doesn't block app startup.
    """
    async with AsyncSessionLocal() as db:
        try:
            result = await db.execute(select(func.count()).select_from(ScoresCache))
            count = result.scalar_one()
            if count == 0:
                log.info("scores_cache is empty — running startup ingest")
                summary = await run_daily_ingest(db)
                log.info("Startup ingest finished: %s", summary)
            else:
                log.info("scores_cache has %d entries — skipping startup ingest", count)
        except Exception as exc:
            log.exception("Startup ingest failed: %s", exc)


_WEATHER_WARMUP_BATCH = 10  # concurrent Open-Meteo requests per batch


async def _startup_weather_warmup() -> None:
    """
    On startup, populate weather_cache if it is completely empty.

    Fetches Open-Meteo for all active zones in batches of _WEATHER_WARMUP_BATCH
    concurrent requests so the zones list returns real weather from the first hit.
    Runs in the background — does not block app startup.
    """
    async with AsyncSessionLocal() as db:
        try:
            # Skip if any valid cache entry already exists
            count_result = await db.execute(select(func.count()).select_from(WeatherCache))
            if count_result.scalar_one() > 0:
                log.info("weather_cache already populated — skipping warmup")
                return

            # Load all active zones
            zones_result = await db.execute(
                select(Zone).where(Zone.active == True)  # noqa: E712
            )
            active_zones = zones_result.scalars().all()
            total = len(active_zones)
            log.info(
                "weather_cache empty — warming up %d zones in batches of %d",
                total, _WEATHER_WARMUP_BATCH
            )

            ok = 0
            for i in range(0, total, _WEATHER_WARMUP_BATCH):
                batch = active_zones[i : i + _WEATHER_WARMUP_BATCH]
                results = await asyncio.gather(
                    *(fetch_weather_for_zone(z.lat, z.lon) for z in batch),
                    return_exceptions=True,
                )
                for z, data in zip(batch, results):
                    if isinstance(data, Exception) or data is None:
                        log.warning("weather warmup: no data for zone %s", z.id)
                        continue
                    await store_weather_cache(z.id, DEFAULT_PROVIDER, data, db)
                    ok += 1

            log.info("weather warmup finished: %d/%d zones populated", ok, total)
        except Exception as exc:
            log.exception("Weather warmup failed: %s", exc)


# ── Lifespan ──────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None, None]:
    log.info("Starting Fungus API v4 (environment: %s)", settings.environment)

    # 1. Apply pending DB migrations before serving any traffic.
    # Run in a worker thread so that env.py's asyncio.run() does not clash
    # with the already-running FastAPI event loop (would raise RuntimeError).
    await asyncio.to_thread(_run_db_migrations)

    # Register daily cron: 05:00 UTC → 07:00 Madrid
    scheduler.add_job(
        _scheduled_ingest,
        trigger="cron",
        hour=settings.ingest_cron_hour,
        minute=0,
        id="daily_ingest",
        replace_existing=True,
    )
    scheduler.start()
    log.info("Scheduler started — daily ingest at %02d:00 UTC", settings.ingest_cron_hour)

    # Fire-and-forget: populate scores_cache on first deploy / cold start
    asyncio.create_task(_startup_ingest_if_empty())
    # Fire-and-forget: populate weather_cache on first deploy / cold start
    asyncio.create_task(_startup_weather_warmup())

    yield

    # Graceful shutdown
    scheduler.shutdown(wait=False)
    await dispose_engine()
    log.info("Fungus API shut down cleanly")


# ── Application ───────────────────────────────────────────────────────────────

app = FastAPI(
    title="Fungus API",
    description="Mushroom foraging prediction for Spain — Outbreak Index engine",
    version=APP_VERSION,
    docs_url="/docs" if not settings.is_production else None,
    redoc_url="/redoc" if not settings.is_production else None,
    lifespan=lifespan,
)

# CORS — allow the Vite dev server, Vercel production URL and Vercel preview deployments
# allow_origin_regex cubre URLs de preview dinámicas tipo fungus-xxxx.vercel.app
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_origin_regex=r"https://fungus[^.]*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["GET"],   # read-only API for now (auth in Phase 3)
    allow_headers=["*"],
)

# Cache-Control header for all GET responses
@app.middleware("http")
async def add_cache_control(request, call_next):
    response = await call_next(request)
    if request.method == "GET" and response.status_code == 200:
        response.headers["Cache-Control"] = "public, max-age=3600"
    return response


# ── Routers ───────────────────────────────────────────────────────────────────

API_PREFIX = f"/api/{settings.api_version}"

app.include_router(health.router, prefix=API_PREFIX)
app.include_router(zones.router, prefix=API_PREFIX)
app.include_router(species.router, prefix=API_PREFIX)
app.include_router(weather.router, prefix=API_PREFIX)


# ── Admin endpoints ────────────────────────────────────────────────────────────

@app.get("/api/v1/admin/trigger-ingest", include_in_schema=False)
async def trigger_ingest(background_tasks: BackgroundTasks) -> dict:
    """
    Manually trigger the daily ingest (no auth — admin use only).
    Useful on free-tier Render where the shell is not available.
    Returns immediately; ingest runs in the background.
    """
    background_tasks.add_task(_scheduled_ingest)
    return {"status": "ingest triggered", "note": "running in background"}


@app.get("/", include_in_schema=False)
async def root():
    return {"service": "fungus-api", "version": APP_VERSION, "docs": "/docs"}
