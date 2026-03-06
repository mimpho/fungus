from fastapi import APIRouter

router = APIRouter(prefix="/weather", tags=["Weather"])

@router.get("/zones/{zone_id}")
async def get_zone_weather(zone_id: str):
    return {"zone_id": zone_id, "weather": None}

@router.get("/zones")
async def list_weather():
    return []
