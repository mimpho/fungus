"""
Fungus API — FastAPI application entry point.

Startup sequence:
  1. Connect to the database
  2. Schedule the daily ingestion cron (APScheduler)
  3. Mount API routers

Shutdown sequence:
  1. Shut down the scheduler
  2. Dispose the DB connection pool
"""
import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from importlib.metadata import version as pkg_version

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import AsyncSessionLocal, dispose_engine
from app.routers import health, species, zones
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


@app.get("/", include_in_schema=False)
async def root():
    return {"service": "fungus-api", "version": APP_VERSION, "docs": "/docs"}
