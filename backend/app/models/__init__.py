"""
SQLAlchemy models. Import here so Alembic detects them during autogenerate.
"""
from app.models.climate_cell import Cell, ClimateCellHistory
from app.models.climate_history import ClimateHistory
from app.models.mushroom_visual_prompt import MushroomVisualPrompt
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
    "ClimateCellHistory",
    "ScoresCache",
    "WeatherStation",
    "User",
    "UserFollowedZone",
    "UserFavSpecies",
    "WeatherCache",
    "MushroomVisualPrompt",
]
