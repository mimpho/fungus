"""Elevation of a clicked point (Open-Meteo elevation API), cached per ~500 m bucket.

The five point endpoints of a page ask for the same point at once: they share one call. A
failure is remembered for FAILURE_TTL_S, and nothing is asked while Open-Meteo's quota is
paused after a 429 (see app.connectors.open_meteo): the climate is then served without the
elevation correction instead of spending more calls."""
import asyncio
import logging
import time
from collections import OrderedDict

import httpx

from app.connectors import open_meteo
from app.models.climate_cell import lookup_key

log = logging.getLogger(__name__)

ELEVATION_URL = "https://api.open-meteo.com/v1/elevation"
_CACHE_SIZE = 5000
FAILURE_TTL_S = 60
_cache: OrderedDict[tuple[int, int], float] = OrderedDict()
_failed: dict[tuple[int, int], float] = {}  # bucket -> monotonic time until which not to ask
_inflight: dict[tuple[int, int], asyncio.Future] = {}


async def fetch_elevation(lat: float, lon: float) -> float | None:
    """Metres above sea level, or None if the service fails (the climate is then not corrected)."""
    if open_meteo.rate_limit_pause():
        return None
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(ELEVATION_URL, params={"latitude": lat, "longitude": lon})
            if resp.status_code == 429 and "concurrent" not in resp.text.lower():
                wait = open_meteo.register_rate_limit(resp)
                log.warning("Open-Meteo rate limit (HTTP 429) for elevation: pausing %d s", wait)
                return None
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
    if _failed.get(key, 0.0) > time.monotonic():
        return None
    fut = _inflight.get(key)
    if fut is None:
        fut = asyncio.ensure_future(fetch(lat, lon))
        _inflight[key] = fut
        fut.add_done_callback(lambda _f: _inflight.pop(key, None))
    value = await asyncio.shield(fut)
    if value is not None:
        _cache[key] = value
        _failed.pop(key, None)
        while len(_cache) > _CACHE_SIZE:
            _cache.popitem(last=False)
    else:  # not cached as a value: asked again after FAILURE_TTL_S
        _failed[key] = time.monotonic() + FAILURE_TTL_S
        while len(_failed) > _CACHE_SIZE:
            _failed.pop(next(iter(_failed)))
    return value
