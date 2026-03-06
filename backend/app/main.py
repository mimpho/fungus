"""
Fungus API — FastAPI application entry point.

Startup sequence:
  1. Connect to the database
  2. Schedule the daily ingestion cron (APScheduler)
  3. If scores_cache is empty, run an ingest immediately (background task)
  4. Mount API routers

Shutdown sequence:
  1. Shut down the scheduler
  2. Dispose the DB connection pool
"""
import asyncio
import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from importlib.metadata import version as pkg_version

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import BackgroundTasks, FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, select

from app.config import settings
from app.database import AsyncSessionLocal, dispose_engine
from app.models.scores_cache import ScoresCache
from app.routers import health, species, weather, zones
from app.services.ingest import run_daily_ingest

# Single source of truth for version — reads from pyproject.toml at runtime
APP_VERSION = pkg_version("fungus-api")

logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(asctime)s %(levelname)-8s %(name)s — %(message)s",
)
log = logging.getLogger(__name__)

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


# ── Lifespan ──────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None, None]:
    log.info("Starting Fungus API v4 (environment: %s)", settings.environment)

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

# CORS — allow the Vite dev server and Vercel production URL
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
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
