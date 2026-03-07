from datetime import UTC, datetime, timedelta

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.weather_cache import WeatherCache

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"
CACHE_TTL_HOURS = 3
DEFAULT_PROVIDER = "open-meteo"


async def fetch_weather_for_zone(lat: float, lon: float) -> dict | None:
    """
    Fetch current weather from Open-Meteo for a single zone.

    Returns a dict with:
      - temp_min / temp_max: today's forecasted daily range (°C)
      - humidity: current relative humidity (%)
      - rainfall14d: accumulated precipitation over past 14 days (mm)
      - wind: current wind speed (km/h)
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
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            res = await client.get(OPEN_METEO_URL, params=params)
            res.raise_for_status()
        except httpx.HTTPError:
            return None

        data = res.json()
        current = data.get("current", {})
        daily = data.get("daily", {})

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
            "dry_days": dry_days,
            "collected_at": datetime.now(UTC),
        }


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
    valid_until = collected_at + timedelta(hours=CACHE_TTL_HOURS)

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
        "collected_at": cache.collected_at.isoformat() if cache.collected_at else None,
        "valid_until": cache.valid_until.isoformat() if cache.valid_until else None,
    }
