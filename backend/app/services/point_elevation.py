"""Elevation of a clicked point (Open-Meteo elevation API), cached per ~500 m bucket."""
import logging
from collections import OrderedDict

import httpx

from app.models.climate_cell import lookup_key

log = logging.getLogger(__name__)

ELEVATION_URL = "https://api.open-meteo.com/v1/elevation"
_CACHE_SIZE = 5000
_cache: OrderedDict[tuple[int, int], float] = OrderedDict()


async def fetch_elevation(lat: float, lon: float) -> float | None:
    """Metres above sea level, or None if the service fails (the climate is then not corrected)."""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(ELEVATION_URL, params={"latitude": lat, "longitude": lon})
            resp.raise_for_status()
            return float(resp.json()["elevation"][0])
    except (httpx.HTTPError, KeyError, IndexError, TypeError, ValueError) as exc:
        log.warning("Open-Meteo elevation failed for %s,%s: %s", lat, lon, exc)
        return None


async def point_elevation(lat: float, lon: float, fetch=fetch_elevation) -> float | None:
    key = lookup_key(lat, lon)
    if key in _cache:
        _cache.move_to_end(key)
        return _cache[key]
    value = await fetch(lat, lon)
    if value is not None:  # a failure is not cached: the next click tries again
        _cache[key] = value
        while len(_cache) > _CACHE_SIZE:
            _cache.popitem(last=False)
    return value
