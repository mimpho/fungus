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
    soil_temp: float | None = None    # soil temperature at 0 cm, current hour (°C)
    collected_at: datetime | None = None  # when Open-Meteo was actually queried


class ScoreDetail(BaseModel):
    pa21: int
    thermal: int
    seasonal: int
    ripening: int
    humidity: int
    pa21_mm: float
    days_since_rain: int


class PendingRain(BaseModel):
    """A recent rain run that does not count yet: when it would start to show and peak."""
    start: str
    end: str
    total_mm: float
    shows_from: str
    peak: str


class ScoreFactorsV2(BaseModel):
    activation: int        # 0–100
    moisture: int          # 0–100
    temperature: int       # 0–100
    season: float          # 0–1
    drying: float          # 0.6–1
    heat: float            # 0.6–1
    frost: float           # 0.6–1
    shock: float           # 1 or 1.1


class ScoreV2(BaseModel):
    score: int
    date: str              # the day scored: the last one with climate data (usually yesterday)
    model_version: str
    factors: ScoreFactorsV2
    limiting_factor: str   # activation | moisture | temperature | drying
    warm: bool             # the zone produced recently and responds faster
    soil_water_mm: float
    air_temp_20d_c: float
    soil_temp_7d_c: float
    dry_days: int
    frost_recent: bool
    estimated: bool
    pending_rains: list[PendingRain] = []


class ZoneScore(BaseModel):
    score_oi: int                 # score of the current model (model_version)
    model_version: str            # "2.1", "1"…
    score_detail: ScoreDetail     # v1 factors, kept for comparison
    score_v1: int | None = None
    v2: ScoreV2 | None = None
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
