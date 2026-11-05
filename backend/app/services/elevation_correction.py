"""
Altitude correction of a cell's climate to the clicked point.

A cell is ~8 x 11 km and its series is for the cell's mean elevation. A point on a mountain
side can be hundreds of metres off that, so air and soil temperature and humidity are shifted
by the elevation difference. Rain and wind are not altitude-corrected: at cell scale they are
a regional value, and the user is told so.
"""
from collections.abc import Iterable
from dataclasses import replace

from app.services.scoring_v2 import ClimateDay

TEMP_LAPSE_C_PER_100M = 0.65  # air and soil temperature fall with height
HUMIDITY_PTS_PER_100M = 0.13  # relative humidity, percentage points


def elevation_delta_m(point_elevation_m: float | None, cell_elevation_m: float | None) -> float:
    """Metres the point is above its cell's mean elevation (negative = below). 0 if unknown."""
    if point_elevation_m is None or cell_elevation_m is None:
        return 0.0
    return point_elevation_m - cell_elevation_m


def correct_day(day: ClimateDay, delta_m: float) -> ClimateDay:
    """The day as seen `delta_m` metres above (or below) the cell's mean elevation."""
    if delta_m == 0:
        return day
    dt = TEMP_LAPSE_C_PER_100M * delta_m / 100
    dh = HUMIDITY_PTS_PER_100M * delta_m / 100
    return replace(
        day,
        temp_max_c=day.temp_max_c - dt,
        temp_min_c=day.temp_min_c - dt,
        temp_avg_c=day.temp_avg_c - dt,
        soil_temp_c=day.soil_temp_c - dt,
        humidity_pct=min(100.0, max(0.0, day.humidity_pct - dh)),
    )


def correct_days(days: Iterable[ClimateDay], delta_m: float) -> list[ClimateDay]:
    return [correct_day(d, delta_m) for d in days]
