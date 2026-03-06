from datetime import datetime

def fetch_weather_for_zone(zone_id: str) -> dict | None:
    return None
def store_weather_cache(
    zone_id: str,
    provider_id: str,
    data: dict | None,
    collected_at: datetime | None = None,
) -> None:
    pass
def get_latest_weather(zone_id: str, provider_id: str) -> dict | None:
    return None
