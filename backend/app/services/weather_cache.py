from datetime import UTC, datetime, timedelta

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.weather_cache import WeatherCache

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"
CACHE_TTL_HOURS = 3
DEFAULT_PROVIDER = "open-meteo"


async def fetch_weather_for_zone(lat: float, lon: float) -> dict | None:
    params = {
        "latitude": f"{lat:.4f}",
        "longitude": f"{lon:.4f}",
        "current": "temperature_2m,relative_humidity_2m,wind_speed_10m",
        "hourly": "soil_temperature_0cm",
        "daily": "precipitation_sum",
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
        hourly = data.get("hourly", {})
        daily = data.get("daily", {})

        temp = current.get("temperature_2m") or 12.0
        humidity = current.get("relative_humidity_2m") or 75
        wind = current.get("wind_speed_10m") or 10

        soil_arr = hourly.get("soil_temperature_0cm") or []
        soil_raw = soil_arr[-1] if soil_arr else None
        soil_temp = round(soil_raw, 1) if soil_raw is not None else round(max(0, temp - 2.5), 1)

        precip_arr = daily.get("precipitation_sum") or []
        past_14 = precip_arr[:14]
        rainfall_14d = round(sum(v or 0 for v in past_14), 1)

        recent_7 = precip_arr[-7:] if len(precip_arr) >= 7 else precip_arr
        dry_days = sum(1 for v in recent_7 if (v or 0) < 1)

        return {
            "temperature": round(temp, 1),
            "soil_temp": soil_temp,
            "rainfall14d": rainfall_14d,
            "humidity": round(humidity),
            "wind": round(wind),
            "dry_days": dry_days,
        }


async def store_weather_cache(
    zone_id: str,
    provider_id: str,
    data: dict | None,
    db: AsyncSession,
    collected_at: datetime | None = None,
) -> WeatherCache | None:
    if data is None:
        return None

    now = datetime.now(UTC)
    valid_until = now + timedelta(hours=CACHE_TTL_HOURS)

    stmt = select(WeatherCache).where(
        WeatherCache.zone_id == zone_id,
        WeatherCache.provider_id == provider_id,
    )
    result = await db.execute(stmt)
    existing = result.scalar_one_or_none()

    if existing:
        existing.temperature = data.get("temperature")
        existing.humidity = data.get("humidity")
        existing.rainfall14d = data.get("rainfall14d")
        existing.wind = data.get("wind")
        existing.collected_at = collected_at or now
        existing.valid_until = valid_until
        await db.commit()
        await db.refresh(existing)
        return existing
    else:
        cache = WeatherCache(
            zone_id=zone_id,
            provider_id=provider_id,
            temperature=data.get("temperature"),
            humidity=data.get("humidity"),
            rainfall14d=data.get("rainfall14d"),
            wind=data.get("wind"),
            collected_at=collected_at or now,
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
        "temperature": cache.temperature,
        "humidity": cache.humidity,
        "rainfall14d": cache.rainfall14d,
        "wind": cache.wind,
        "collected_at": cache.collected_at.isoformat() if cache.collected_at else None,
        "valid_until": cache.valid_until.isoformat() if cache.valid_until else None,
    }
