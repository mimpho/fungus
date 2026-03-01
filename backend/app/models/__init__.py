"""
SQLAlchemy models. Import here so Alembic detects them during autogenerate.
"""
from app.models.zone import Zone
from app.models.species import Species
from app.models.climate_history import ClimateHistory
from app.models.scores_cache import ScoresCache
from app.models.weather_station import WeatherStation

__all__ = ["Zone", "Species", "ClimateHistory", "ScoresCache", "WeatherStation"]
