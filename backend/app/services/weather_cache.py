from typing import Optional, Dict
from datetime import datetime

def fetch_weather_for_zone(zone_id: str) -> Optional[Dict]:
    return None

def store_weather_cache(zone_id: str, provider_id: str, data: Optional[Dict], collected_at: Optional[datetime] = None) -> None:
    pass

def get_latest_weather(zone_id: str, provider_id: str) -> Optional[Dict]:
    return None
