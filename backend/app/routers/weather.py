from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.zone import Zone
from app.services import weather_cache

router = APIRouter(prefix="/weather", tags=["Weather"])
DEFAULT_PROVIDER = "open-meteo"


@router.get("/zones/{zone_id}")
async def get_zone_weather(
    zone_id: str,
    provider: str = DEFAULT_PROVIDER,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Zone).where(Zone.id == zone_id, Zone.active == True)  # noqa: E712
    result = await db.execute(stmt)
    zone = result.scalar_one_or_none()

    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")

    cached = await weather_cache.get_latest_weather(zone_id, provider, db)
    if cached:
        return {"zone_id": zone_id, "provider": provider, "weather": cached, "cached": True}

    weather = await weather_cache.fetch_weather_for_zone(zone.lat, zone.lon)
    if not weather:
        raise HTTPException(status_code=502, detail="Failed to fetch weather data")

    await weather_cache.store_weather_cache(zone_id, provider, weather, db)
    return {
        "zone_id": zone_id,
        "provider": provider,
        "weather": weather,
        "cached": False,
    }


@router.get("/zones")
async def list_weather(
    provider: str = DEFAULT_PROVIDER,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Zone).where(Zone.active == True)  # noqa: E712
    result = await db.execute(stmt)
    zones = result.scalars().all()

    items = []
    for zone in zones:
        cached = await weather_cache.get_latest_weather(zone.id, provider, db)
        if cached:
            items.append({"zone_id": zone.id, "provider": provider, "weather": cached})

    return items
