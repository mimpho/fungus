"""Pure parts of scripts/zone_elevation_ranges.py: sampling grid and altitude band."""

import math

import pytest

from scripts.zone_elevation_ranges import (
    MAX_POINTS_PER_CALL,
    elevation_band,
    grid_points,
    percentile,
)


def test_the_grid_stays_inside_the_radius():
    lat, lon = 42.405, 2.272
    points = grid_points(lat, lon, radius_km=3, step_m=500)
    assert (lat, lon) in points
    for plat, plon in points:
        dy = (plat - lat) * 111.32
        dx = (plon - lon) * 111.32 * math.cos(math.radians(lat))
        assert dx * dx + dy * dy <= 9 + 0.01


def test_default_grid_costs_two_calls_per_zone():
    points = grid_points(42.405, 2.272, radius_km=3, step_m=500)
    assert MAX_POINTS_PER_CALL < len(points) <= 2 * MAX_POINTS_PER_CALL


def test_percentile_interpolates():
    assert percentile([0, 10, 20, 30, 40], 50) == 20
    assert percentile([0, 10], 25) == 2.5
    with pytest.raises(ValueError):
        percentile([], 50)


def test_band_is_the_central_part_of_the_samples_rounded_to_50_m():
    elevations = list(range(1000, 2001, 10))  # 1,000–2,000 m evenly
    band = elevation_band(elevations, point_m=1500, forest_type="robledal")
    assert (band.min_m, band.max_m) == (1100, 1800)  # p10 1,100; p90 1,900 capped at 1,800
    assert band.capped is True


def test_the_forest_cap_lowers_the_top():
    elevations = list(range(1300, 2701, 10))  # valley to summit
    band = elevation_band(elevations, point_m=1885, forest_type="pinar")
    assert band.max_m == 2300
    assert band.capped is True


def test_the_zone_point_is_always_inside_the_band():
    elevations = [800.0] * 50 + [900.0] * 50
    band = elevation_band(elevations, point_m=1450, forest_type="pinar")
    assert band.min_m <= 1450 <= band.max_m


def test_an_unknown_forest_type_is_not_capped():
    elevations = list(range(1000, 3001, 10))
    band = elevation_band(elevations, point_m=2000, forest_type=None)
    assert band.capped is False
    assert band.max_m == 2800
