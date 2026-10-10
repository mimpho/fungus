"""GET /api/v1/health — system status endpoint."""
import logging
from datetime import datetime
from importlib.metadata import version as pkg_version

from fastapi import APIRouter, Depends
from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models.scores_cache import ScoresCache
from app.models.zone import Zone
from app.schemas.health import HealthResponse
from app.services.ingest import get_stale_zones
from app.services.weather_refresh import get_outdated_weather_zones

log = logging.getLogger(__name__)
router = APIRouter()


@router.head("/health", tags=["System"], status_code=200)
async def health_head() -> None:
    """
    Lightweight HEAD probe for UptimeRobot / load-balancer keep-alive.
    Returns 200 with no body and no DB query.
    """
    return


@router.get("/health", response_model=HealthResponse, tags=["System"])
async def health(db: AsyncSession = Depends(get_db)) -> HealthResponse:
    """
    System status: database reachability, last ingest timestamp, active zone count
    `stale_zones` (zones without climate data in the last `stale_zone_days`) and
    `weather_outdated` (zones without current weather younger than `weather_max_age_hours`).
    Used by Render/UptimeRobot keep-alive pings and the frontend status indicator.
    """
    db_ok = True
    try:
        await db.execute(text("SELECT 1"))
    except Exception as exc:
        log.error("DB health check failed: %s", exc)
        db_ok = False

    active_zones = 0
    last_ingest: datetime | None = None
    stale_zones: list[str] = []
    weather_outdated = 0

    if db_ok:
        zone_count = await db.execute(
            select(func.count()).select_from(Zone).where(Zone.active == True)  # noqa: E712
        )
        active_zones = zone_count.scalar() or 0

        latest_cache = await db.execute(
            select(func.max(ScoresCache.calculated_at))
        )
        last_ingest = latest_cache.scalar()

        stale_zones = [z["zone_id"] for z in await get_stale_zones(db)]
        weather_outdated = len(await get_outdated_weather_zones(db))

    return HealthResponse(
        status="ok" if db_ok else "degraded",
        version=pkg_version("fungus-api"),
        environment=settings.environment,
        last_ingest=last_ingest,
        active_zones=active_zones,
        providers={
            "open-meteo": True,   # always available (no key required)
            "aemet": settings.has_aemet,
            "meteocat": settings.has_meteocat,
        },
        db_reachable=db_ok,
        stale_zones=stale_zones,
        weather_outdated=weather_outdated,
    )
