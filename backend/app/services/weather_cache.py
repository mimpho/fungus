import logging
from datetime import UTC, date, datetime, timedelta

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.weather_cache import WeatherCache

log = logging.getLogger(__name__)

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"
DEFAULT_PROVIDER = "open-meteo"
# Open-Meteo bills a request spanning more than 2 weeks as days/14 calls:
# past_days=14 + today = 15 days.
CALL_COST = 15 / 14


class WeatherFetchError(Exception):
    """A failed Open-Meteo call. `status` is None for transport errors (timeout, DNS…)."""

    def __init__(self, status: int | None, detail: str) -> None:
        super().__init__(f"HTTP {status or '-'}: {detail}")
        self.status = status
        self.detail = detail

    @property
    def rate_limited(self) -> bool:
        return self.status == 429


class CallBudget:
    """
    Daily (UTC) cap on Open-Meteo calls for weather_cache, shared by the refresh
    job and the live fallback in /weather/zones/{id}. In memory: a restart resets
    it, which is acceptable on a single Render instance (worst case one extra
    refresh run's worth of calls).
    """

    def __init__(self, limit: float) -> None:
        self.limit = limit
        self.used = 0.0
        self._day: date | None = None

    def try_spend(self, cost: float = CALL_COST) -> bool:
        today = datetime.now(UTC).date()
        if today != self._day:
            self._day, self.used = today, 0.0
        if self.used + cost > self.limit:
            return False
        self.used += cost
        return True


budget = CallBudget(settings.weather_daily_call_budget)


def valid_until_for(collected_at: datetime) -> datetime:
    """Rows are served while younger than WEATHER_MAX_AGE_HOURS (two refresh cycles)."""
    return collected_at + timedelta(hours=settings.weather_max_age_hours)


async def fetch_weather_for_zone(lat: float, lon: float, zone_id: str = "") -> dict | None:
    """Like fetch_weather(), but logs the failure and returns None."""
    try:
        return await fetch_weather(lat, lon)
    except WeatherFetchError as exc:
        log.warning("Open-Meteo weather fetch failed for %s: %s", zone_id or (lat, lon), exc)
        return None


def new_client() -> httpx.AsyncClient:
    """HTTP client for Open-Meteo. Reuse one per refresh run (keep-alive): opening a
    new TLS connection per zone led to intermittent ConnectTimeouts."""
    return httpx.AsyncClient(timeout=httpx.Timeout(15.0, connect=10.0))


async def fetch_weather(lat: float, lon: float, client: httpx.AsyncClient | None = None) -> dict:
    """
    Fetch current weather from Open-Meteo for a single zone.
    Raises WeatherFetchError with the status code and body on failure.

    Returns a dict with:
      - temp_min / temp_max: today's forecasted daily range (°C)
      - humidity: current relative humidity (%)
      - rainfall14d: accumulated precipitation over past 14 days (mm)
      - wind: current wind speed (km/h)
      - soil_temp: soil temperature at 0 cm for the current hour (°C)
      - dry_days: days with <1mm precipitation in the last 7 days
      - collected_at: UTC datetime of this API call
    """
    params = {
        "latitude": f"{lat:.4f}",
        "longitude": f"{lon:.4f}",
        "current": "relative_humidity_2m,wind_speed_10m",
        "hourly": "soil_temperature_0cm",
        # temperature_2m_min/max -> today's daily forecast range
        "daily": "precipitation_sum,temperature_2m_min,temperature_2m_max",
        "past_days": 14,
        "forecast_days": 1,
        "timezone": "Europe/Madrid",
    }
    if client is None:
        async with new_client() as own:
            return await fetch_weather(lat, lon, own)

    try:
        res = await client.get(OPEN_METEO_URL, params=params)
    except httpx.HTTPError as exc:
        raise WeatherFetchError(None, f"{type(exc).__name__}: {exc}") from exc
    if res.status_code != 200:
        raise WeatherFetchError(res.status_code, res.text[:300])

    data = res.json()
    current = data.get("current", {})
    daily = data.get("daily", {})
    soil_temp = _current_hour_value(
        data.get("hourly", {}), "soil_temperature_0cm", current.get("time")
    )

    humidity = current.get("relative_humidity_2m") or 75
    wind = current.get("wind_speed_10m") or 10

    precip_arr = daily.get("precipitation_sum") or []
    past_14 = precip_arr[:14]
    rainfall_14d = round(sum(v or 0 for v in past_14), 1)
    recent_7 = precip_arr[-7:] if len(precip_arr) >= 7 else precip_arr
    dry_days = sum(1 for v in recent_7 if (v or 0) < 1)

    # Daily min/max: last entry = today's forecast (index -1 of 15-day array)
    temp_min_arr = daily.get("temperature_2m_min") or []
    temp_max_arr = daily.get("temperature_2m_max") or []
    temp_min = round(temp_min_arr[-1], 1) if temp_min_arr else None
    temp_max = round(temp_max_arr[-1], 1) if temp_max_arr else None

    return {
        "temp_min": temp_min,
        "temp_max": temp_max,
        "humidity": round(humidity),
        "wind": round(wind),
        "rainfall14d": rainfall_14d,
        "soil_temp": soil_temp,
        "dry_days": dry_days,
        "collected_at": datetime.now(UTC),
    }


def _current_hour_value(hourly: dict, key: str, current_time: str | None) -> float | None:
    """
    Value of an hourly series at the current hour.

    `current_time` is Open-Meteo's `current.time` ("YYYY-MM-DDTHH:MM", local
    time because the request sets `timezone`). Falls back to the latest
    non-null value at or before that hour, so a missing hour never blanks it.
    """
    times = hourly.get("time") or []
    values = hourly.get(key) or []
    if not times or not values:
        return None
    hour = (current_time or "")[:13]  # "YYYY-MM-DDTHH"
    best = None
    for t, v in zip(times, values):
        if hour and t[:13] > hour:
            break
        if v is not None:
            best = v
    return round(best, 1) if best is not None else None


async def store_weather_cache(
    zone_id: str,
    provider_id: str,
    data: dict | None,
    db: AsyncSession,
) -> WeatherCache | None:
    if data is None:
        return None

    # Use the timestamp from the fetch, not the time of DB write
    collected_at = data.get("collected_at") or datetime.now(UTC)
    valid_until = valid_until_for(collected_at)

    stmt = select(WeatherCache).where(
        WeatherCache.zone_id == zone_id,
        WeatherCache.provider_id == provider_id,
    )
    result = await db.execute(stmt)
    existing = result.scalar_one_or_none()

    if existing:
        existing.temp_min = data.get("temp_min")
        existing.temp_max = data.get("temp_max")
        existing.humidity = data.get("humidity")
        existing.rainfall14d = data.get("rainfall14d")
        existing.wind = data.get("wind")
        existing.soil_temp = data.get("soil_temp")
        existing.collected_at = collected_at
        existing.valid_until = valid_until
        await db.commit()
        await db.refresh(existing)
        return existing
    else:
        cache = WeatherCache(
            zone_id=zone_id,
            provider_id=provider_id,
            temp_min=data.get("temp_min"),
            temp_max=data.get("temp_max"),
            humidity=data.get("humidity"),
            rainfall14d=data.get("rainfall14d"),
            wind=data.get("wind"),
            soil_temp=data.get("soil_temp"),
            collected_at=collected_at,
            valid_until=valid_until,
        )
        db.add(cache)
        await db.commit()
        await db.refresh(cache)
        return cache


async def get_latest_weather(
    zone_id: str,
    provider_id: str,
    db: AsyncSession,
) -> dict | None:
    """
    Return cached weather for a zone if still valid (within TTL).
    Returns None if no cache exists or cache has expired.
    collected_at reflects when Open-Meteo was actually queried.
    """
    now = datetime.now(UTC)
    stmt = select(WeatherCache).where(
        WeatherCache.zone_id == zone_id,
        WeatherCache.provider_id == provider_id,
    )
    result = await db.execute(stmt)
    cache = result.scalar_one_or_none()

    if not cache:
        return None

    if cache.valid_until.replace(tzinfo=UTC) < now:
        return None

    return {
        "temp_min": cache.temp_min,
        "temp_max": cache.temp_max,
        "humidity": cache.humidity,
        "rainfall14d": cache.rainfall14d,
        "wind": cache.wind,
        "soil_temp": cache.soil_temp,
        "collected_at": cache.collected_at.isoformat() if cache.collected_at else None,
        "valid_until": cache.valid_until.isoformat() if cache.valid_until else None,
    }
