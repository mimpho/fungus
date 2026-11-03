"""Pydantic schema for the /health endpoint."""
from datetime import datetime

from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str                        # 'ok' | 'degraded'
    version: str
    environment: str
    last_ingest: datetime | None
    active_zones: int
    providers: dict[str, bool]         # {'open-meteo': True, 'aemet': False, …}
    db_reachable: bool
    stale_zones: list[str] = []        # zone ids with no recent climate data
    # active zones without current weather younger than WEATHER_MAX_AGE_HOURS
    weather_outdated: int = 0
    # Class rasters (forest, soil): 'off' (no bucket configured), 'ok' or 'degraded' (some failed
    # to download: scores run without that habitat factor until a retry succeeds)
    rasters: str = "off"
    rasters_missing: list[str] = []
