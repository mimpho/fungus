"""Pure parts of scripts/zone_elevation_ranges.py: grid, forest mask and altitude band."""

import math

import pytest

from scripts.zone_elevation_ranges import (
    MAX_GRID_POINTS,
    elevation_band,
    forest_shapes,
    grid_points,
    grid_step_m,
    in_forest,
    inside,
    percentile,
)

# ── Grid ──────────────────────────────────────────────────────────────────────


def test_the_grid_stays_inside_the_radius():
    lat, lon = 42.405, 2.272
    points = grid_points(lat, lon, radius_km=3, step_m=500)
    assert (lat, lon) in points
    for plat, plon in points:
        dy = (plat - lat) * 111.32
        dx = (plon - lon) * 111.32 * math.cos(math.radians(lat))
        assert dx * dx + dy * dy <= 9 + 0.01


@pytest.mark.parametrize("radius_km", [3, 6, 10])
def test_the_spacing_grows_with_the_radius_to_cap_the_api_calls(radius_km):
    step = grid_step_m(radius_km)
    assert step >= 500
    assert len(grid_points(42.4, 2.27, radius_km, step)) <= MAX_GRID_POINTS


def test_a_3_km_circle_keeps_the_500_m_spacing():
    assert grid_step_m(3) == 500


# ── Forest mask ───────────────────────────────────────────────────────────────


def _node(lat, lon):
    return {"lat": lat, "lon": lon}


SQUARE = [_node(0, 0), _node(0, 10), _node(10, 10), _node(10, 0), _node(0, 0)]


def test_a_closed_way_is_one_forest():
    shapes = forest_shapes([{"type": "way", "geometry": SQUARE}])
    assert inside((5, 5), shapes[0])
    assert not inside((15, 5), shapes[0])


def test_a_relation_with_a_split_outer_ring_and_a_hole():
    outer_a = [_node(0, 0), _node(0, 10), _node(10, 10)]
    outer_b = [_node(10, 10), _node(10, 0), _node(0, 0)]
    hole = [_node(4, 4), _node(4, 6), _node(6, 6), _node(6, 4), _node(4, 4)]
    relation = {
        "type": "relation",
        "members": [
            {"type": "way", "role": "outer", "geometry": outer_a},
            {"type": "way", "role": "outer", "geometry": outer_b},
            {"type": "way", "role": "inner", "geometry": hole},
        ],
    }
    (shape,) = forest_shapes([relation])
    assert inside((2, 2), shape)  # forest
    assert not inside((5, 5), shape)  # clearing
    assert not inside((12, 5), shape)  # outside


def test_only_points_in_some_forest_are_kept():
    shapes = forest_shapes([{"type": "way", "geometry": SQUARE}, {"type": "node"}])
    assert in_forest([(5, 5), (20, 20), (1, 9)], shapes) == [(5, 5), (1, 9)]


# ── Band ──────────────────────────────────────────────────────────────────────


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
