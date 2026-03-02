"""
SQLAlchemy models. Import here so Alembic detects them during autogenerate.
"""
from app.models.climate_history import ClimateHistory
from app.models.scores_cache import ScoresCache
from app.models.species import Species
from app.models.weather_station import WeatherStation
from app.models.zone import Zone

__all__ = ["Zone", "Species", "ClimateHistory", "ScoresCache", "WeatherStation"]
