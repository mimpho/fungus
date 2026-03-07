"""Pydantic schemas for zones and related responses."""
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ZoneWeather(BaseModel):
    """Cached real-time weather for a zone (TTL 3h, sourced from Open-Meteo)."""
    temp_min: float | None = None     # today's forecasted daily min (°C)
    temp_max: float | None = None     # today's forecasted daily max (°C)
    humidity: float | None = None     # current relative humidity (%)
    rainfall14d: float | None = None  # accumulated precipitation, last 14 days (mm)
    wind: float | None = None         # current wind speed (km/h)
    collected_at: datetime | None = None  # when Open-Meteo was actually queried


class ScoreDetail(BaseModel):
    pa21: int
    thermal: int
    seasonal: int
    ripening: int
    humidity: int
    pa21_mm: float
    days_since_rain: int


class ZoneScore(BaseModel):
    score_oi: int
    score_detail: ScoreDetail
    label: str
    calculated_at: datetime
    valid_until: datetime


class ZoneBase(BaseModel):
    id: str
    name: str
    province: str
    region: str
    lat: float
    lon: float
    elevation_m: int | None
    forest_type: str | None
    description: str | None = None


class ZoneListItem(ZoneBase):
    """Used in GET /zones — includes the cached OI score and weather (if available)."""
    model_config = ConfigDict(from_attributes=True)

    score: ZoneScore | None = None
    weather: ZoneWeather | None = None


class ZoneDetail(ZoneBase):
    """Used in GET /zones/{id} — full zone info."""
    model_config = ConfigDict(from_attributes=True)

    soil_type: str | None
    active: bool
    created_at: datetime
    score: ZoneScore | None = None


class MapPoint(BaseModel):
    """Lightweight payload for the Leaflet heatmap endpoint."""
    zone_id: str
    lat: float
    lon: float
    score: int
    name: str
