"""
Fungus API — FastAPI application entry point.

Startup sequence:
  1. Run Alembic migrations (upgrade head) — only when RUN_MIGRATIONS_ON_STARTUP
     is on (default: ENVIRONMENT=production, i.e. Render). Local runs skip it.
  2. Schedule the daily ingestion cron and the weather_cache refresh (every 3 h)
  3. If scores_cache is empty, run an ingest immediately (background task)
  4. If any zone lacks fresh weather, refresh weather_cache now (background task)
  5. Mount API routers

Shutdown sequence:
  1. Shut down the scheduler
  2. Dispose the DB connection pool
"""
import asyncio
import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from datetime import date, timedelta
from importlib.metadata import version as pkg_version
from pathlib import Path

from alembic import command as alembic_command
from alembic.config import Config as AlembicConfig
from alembic.util import CommandError as AlembicCommandError
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import BackgroundTasks, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import func, select

from app.config import settings
from app.database import AsyncSessionLocal, dispose_engine
from app.models.scores_cache import ScoresCache
from app.routers import auth, health, me, species, weather, zones
from app.services.ingest import run_backfill, run_daily_ingest
from app.services.weather_refresh import get_outdated_weather_zones, refresh_weather_cache

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


async def _startup_migrations() -> None:
    """
    Apply pending migrations at startup, if enabled for this environment.

    - Disabled (local by default): log and return. Local `.env` points at the
      shared production DB, so a branch started locally must not migrate it.
    - DB at a revision this code does not know (DB ahead of the branch, e.g. a
      rollback or an older branch): warn and keep serving instead of aborting.
    - Any other failure: abort startup (schema state is unknown).

    Runs in a worker thread so env.py's asyncio.run() does not clash with the
    already-running FastAPI event loop (would raise RuntimeError).
    """
    if not settings.should_run_migrations_on_startup:
        log.info(
            "DB migrations skipped on startup (RUN_MIGRATIONS_ON_STARTUP is off). "
            "Run `alembic upgrade head` manually if this DB needs them."
        )
        return

    log.info("Running DB migrations...")
    try:
        await asyncio.to_thread(_run_db_migrations)
    except AlembicCommandError as exc:
        if "Can't locate revision" not in str(exc):
            log.exception("DB migrations FAILED — aborting startup: %s", exc)
            raise
        log.warning(
            "DB migrations skipped: the database is at a revision this code does not "
            "know (%s). The DB is probably ahead of this branch; continuing startup.",
            exc,
        )
        return
    except Exception as exc:
        log.exception("DB migrations FAILED — aborting startup: %s", exc)
        raise
    log.info("DB migrations complete")


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


# Every 3 h at :30 (00:30, 03:30, …) — never at the same time as the 05:00 ingest
WEATHER_REFRESH_CRON = {"hour": "*/3", "minute": 30}


async def _scheduled_weather_refresh() -> None:
    async with AsyncSessionLocal() as db:
        try:
            await refresh_weather_cache(db)
        except Exception as exc:
            log.exception("Weather refresh failed: %s", exc)


async def _startup_weather_refresh() -> None:
    """
    On startup, refresh only the active zones that lack fresh weather (first deploy,
    or the service was down). A redeploy with fresh rows costs no calls.
    Runs in the background — does not block app startup.
    """
    async with AsyncSessionLocal() as db:
        try:
            outdated = await get_outdated_weather_zones(db)
            if not outdated:
                log.info("weather_cache is fresh for all zones — skipping startup refresh")
                return
            log.info("%d zones without fresh weather — refreshing now", len(outdated))
            await refresh_weather_cache(db, zone_ids=outdated)
        except Exception as exc:
            log.exception("Startup weather refresh failed: %s", exc)


# ── Lifespan ──────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None, None]:
    log.info("Starting Fungus API v4 (environment: %s)", settings.environment)

    # 1. Apply pending DB migrations before serving any traffic (production only
    # by default — see _startup_migrations).
    await _startup_migrations()

    # Register daily cron: 05:00 UTC → 07:00 Madrid
    scheduler.add_job(
        _scheduled_ingest,
        trigger="cron",
        hour=settings.ingest_cron_hour,
        minute=0,
        id="daily_ingest",
        replace_existing=True,
    )
    scheduler.add_job(
        _scheduled_weather_refresh,
        trigger="cron",
        **WEATHER_REFRESH_CRON,
        id="weather_refresh",
        replace_existing=True,
        max_instances=1,
        coalesce=True,
    )
    scheduler.start()
    log.info(
        "Scheduler started — daily ingest at %02d:00 UTC, weather refresh every 3 h at :30",
        settings.ingest_cron_hour,
    )

    # Fire-and-forget: populate scores_cache on first deploy / cold start
    asyncio.create_task(_startup_ingest_if_empty())
    # Fire-and-forget: fill weather_cache if any zone lacks fresh weather
    asyncio.create_task(_startup_weather_refresh())

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
# allow_origin_regex cubre:
#   - URLs de preview dinámicas tipo fungus-xxxx.vercel.app
#   - localhost en cualquier puerto (Vite :5173, Expo web :8081, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_origin_regex=r"(https://fungus[^.]*\.vercel\.app|http://localhost:\d+)",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],  # PATCH for profile update
    allow_headers=["*"],
)

# Catch-all exception handler — ensures CORS headers are present even on
# unhandled 500 errors (Starlette's CORSMiddleware can miss them on raw exceptions).
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    log.exception("Unhandled exception: %s", exc)
    origin = request.headers.get("origin", "")
    headers = {}
    if origin:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
        headers=headers,
    )


# Cache-Control header for all GET responses
@app.middleware("http")
async def add_cache_control(request, call_next):
    response = await call_next(request)
    if request.method == "GET" and response.status_code == 200:
        # Species data changes after admin edits — never cache in browser or CDN
        if "/species" in request.url.path:
            response.headers["Cache-Control"] = "no-store"
        else:
            response.headers["Cache-Control"] = "public, max-age=3600"
    return response


# ── Routers ───────────────────────────────────────────────────────────────────

API_PREFIX = f"/api/{settings.api_version}"

app.include_router(health.router, prefix=API_PREFIX)
app.include_router(zones.router, prefix=API_PREFIX)
app.include_router(species.router, prefix=API_PREFIX)
app.include_router(weather.router, prefix=API_PREFIX)
app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(me.router, prefix=API_PREFIX)

# Static assets (logo for emails, etc.) — served at /static/<filename>
# URL in production: https://fungus-api.onrender.com/static/logoFungusPortrait.png
_ASSETS_DIR = Path(__file__).parent / "assets"
if _ASSETS_DIR.is_dir():
    app.mount("/static", StaticFiles(directory=str(_ASSETS_DIR)), name="static")


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


@app.get("/api/v1/admin/trigger-backfill", include_in_schema=False)
async def trigger_backfill(
    background_tasks: BackgroundTasks,
    days: int = 21,
) -> dict:
    """
    Manually trigger a backfill of the last N days (default 21).
    Useful on free-tier Render where the shell is not available.
    Returns immediately; backfill runs in the background.

    Usage:
        curl https://fungus-api.onrender.com/api/v1/admin/trigger-backfill
        curl "https://fungus-api.onrender.com/api/v1/admin/trigger-backfill?days=30"
    """
    end = date.today() - timedelta(days=1)
    start = end - timedelta(days=days - 1)

    async def _run() -> None:
        async with AsyncSessionLocal() as db:
            try:
                summary = await run_backfill(db, start=start, end=end)
                log.info("Admin backfill finished: %s", summary)
            except Exception as exc:
                log.exception("Admin backfill failed: %s", exc)

    background_tasks.add_task(_run)
    return {
        "status": "backfill triggered",
        "from": start.isoformat(),
        "to": end.isoformat(),
        "note": "running in background — check /api/v1/health for last_ingest",
    }


@app.get("/", include_in_schema=False)
async def root():
    return {"service": "fungus-api", "version": APP_VERSION, "docs": "/docs"}
