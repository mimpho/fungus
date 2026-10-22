"""
SQLAlchemy models. Import here so Alembic detects them during autogenerate.
"""
from app.models.climate_cell import Cell, CellLookup, ClimateCellHistory
from app.models.climate_history import ClimateHistory
from app.models.mushroom_visual_prompt import MushroomVisualPrompt
from app.models.saved_point import (
    SavedPoint,
    SavedPointPhoto,
    SavedPointPhotoSpecies,
    SavedPointSpecies,
)
from app.models.scores_cache import ScoresCache
from app.models.species import Species
from app.models.user import User, UserFavSpecies, UserFollowedZone
from app.models.weather_cache import WeatherCache
from app.models.weather_station import WeatherStation
from app.models.zone import Zone
from app.models.zone_forecast import ZoneForecast

__all__ = [
    "Zone",
    "ZoneForecast",
    "Species",
    "ClimateHistory",
    "Cell",
    "CellLookup",
    "ClimateCellHistory",
    "SavedPoint",
    "SavedPointPhoto",
    "SavedPointPhotoSpecies",
    "SavedPointSpecies",
    "ScoresCache",
    "WeatherStation",
    "User",
    "UserFollowedZone",
    "UserFavSpecies",
    "WeatherCache",
    "MushroomVisualPrompt",
]
