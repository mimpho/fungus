"""Cell discovery geometry: pure, no network. Fake grids stand in for Open-Meteo's."""
import math

from app.services.cell_discovery import (
    build_grid,
    missing_neighbours,
    point_in_rings,
    probe_lattice,
    rect_touches_rings,
    select_cells,
    weighted_calls,
)

# A square of 1 x 1 degree at lat 41-42, lon 1-2, as (lon, lat) like the real outline.
SQUARE = (((1.0, 41.0), (2.0, 41.0), (2.0, 42.0), (1.0, 42.0)),)


# Open-Meteo's cells as measured on 2026-10-18: ~0.0703 deg of latitude by ~0.1272 of longitude
# near 41.6 N. The fake grid keeps the width in km, so in degrees it grows towards the poles,
# and every row has its own offset: both reasons why cells of different rows do not line up.
GRID_LAT, GRID_LON = 0.0703, 0.1272


def _row_width(row: int) -> float:
    return GRID_LON * math.cos(math.radians(41.6)) / math.cos(math.radians(row * GRID_LAT))


def snap(lat: float, lon: float) -> tuple[float, float]:
    """Centre of the fake grid's cell that holds a point."""
    row = round(lat / GRID_LAT)
    width, offset = _row_width(row), (row * 0.37 % 1) * _row_width(row)
    return round(row * GRID_LAT, 4), round((round((lon - offset) / width) * width) + offset, 4)


def _regular_grid() -> set[tuple[float, float]]:
    """Every cell centre a perfect Open-Meteo would answer with near Catalonia."""
    return {snap(lat, lon) for lat, lon in probe_lattice(0.02, 0.02, margin=0.15)}


class TestGeometry:
    def test_inside_and_outside_the_square(self):
        assert point_in_rings(41.5, 1.5, SQUARE)
        assert not point_in_rings(40.9, 1.5, SQUARE)
        assert not point_in_rings(41.5, 2.1, SQUARE)

    def test_real_outline_knows_barcelona_and_not_zaragoza(self):
        assert point_in_rings(41.39, 2.17)
        assert not point_in_rings(41.65, -0.89)

    def test_rectangle_touching_by_overlap_only(self):
        # Centre outside, half a cell reaches over the edge.
        assert rect_touches_rings(40.97, 1.5, 0.05, 0.05, SQUARE)
        assert not rect_touches_rings(40.90, 1.5, 0.05, 0.05, SQUARE)

    def test_rectangle_crossing_an_edge_without_corners_inside(self):
        # A wide, flat rectangle over the south edge: no corner and no centre inside the square.
        assert rect_touches_rings(40.99, 1.5, 0.02, 0.9, SQUARE)

    def test_rectangle_containing_the_whole_square(self):
        assert rect_touches_rings(41.5, 1.5, 2.0, 2.0, SQUARE)


class TestLattice:
    def test_points_stay_near_the_outline(self):
        pts = probe_lattice(0.08, 0.08, SQUARE, margin=0.05)
        assert pts
        assert all(40.94 <= lat <= 42.06 and 0.94 <= lon <= 2.06 for lat, lon in pts)

    def test_default_lattice_over_catalonia_is_a_few_hundred_probes(self):
        # Reported by `ingest_cells plan`; a big jump means the outline or the step changed.
        assert 550 <= len(probe_lattice()) <= 800

    def test_order_is_stable(self):
        assert probe_lattice(0.1, 0.1, SQUARE) == probe_lattice(0.1, 0.1, SQUARE)
        pts = probe_lattice(0.1, 0.1, SQUARE)
        assert pts == sorted(pts)


class TestGrid:
    def test_rows_and_per_row_widths_come_out_of_the_centres(self):
        grid = build_grid(_regular_grid())
        assert abs(grid.half_lat - GRID_LAT / 2) < 0.002
        for key, half in grid.half_lon_by_row.items():
            assert abs(half - _row_width(round(key / GRID_LAT)) / 2) < 0.003

    def test_too_few_centres_give_no_grid(self):
        assert build_grid([]) is None
        assert build_grid([(41.5, 1.5)]) is None


class TestSelection:
    def test_keeps_only_cells_touching_the_outline(self):
        # Rows 0.1 apart, cells 0.1 wide: half a cell is 0.05.
        cells = [(41.5, 1.5), (41.5, 1.6), (40.97, 1.5), (40.87, 1.5), (40.77, 1.5), (41.5, 2.2)]
        assert select_cells(cells, SQUARE) == [(40.97, 1.5), (41.5, 1.5), (41.5, 1.6)]

    def test_duplicates_collapse(self):
        assert select_cells([(41.5, 1.5)] * 3 + [(41.5, 1.6), (41.6, 1.5)], SQUARE) == [
            (41.5, 1.5),
            (41.5, 1.6),
            (41.6, 1.5),
        ]

    def test_regular_fake_grid_over_catalonia_gives_about_the_prd_estimate(self):
        centres = _regular_grid()
        # The free-map PRD estimates about 380 cells in Catalonia.
        assert 340 <= len(select_cells(centres)) <= 440


class TestWeight:
    def test_requests_over_two_weeks_count_days_over_14(self):
        assert weighted_calls(280) == 20
        assert weighted_calls(10) == 1
        assert weighted_calls(1, locations=50) == 50


class TestCoverage:
    """The lattice must hit every cell: the first version stepped 0.08 deg and skipped rows."""

    def _found_by(self, lattice):
        return {snap(lat, lon) for lat, lon in lattice}

    def test_default_lattice_hits_nearly_every_cell_and_holes_close_the_rest(self):
        truth = _regular_grid()
        found = self._found_by(probe_lattice())
        wanted = set(select_cells(truth))
        got = set(select_cells(found))
        assert len(got) >= 0.95 * len(wanted)
        # Whatever the lattice missed is a neighbour of a found cell: probing the holes closes it.
        found |= {snap(*p) for p in missing_neighbours(found)}
        assert set(select_cells(found)) == wanted

    def test_a_coarser_step_than_the_cell_does_miss_cells(self):
        truth = _regular_grid()
        wanted = set(select_cells(truth))
        coarse = set(select_cells(self._found_by(probe_lattice(0.08, 0.08))))
        assert len(coarse) < len(wanted)


class TestHoles:
    def test_a_complete_grid_has_no_holes(self):
        truth = _regular_grid()
        # Every cell near the outline is known, so nothing is expected anywhere else.
        assert missing_neighbours(truth) == []

    def test_a_removed_cell_is_reported_at_its_place(self):
        truth = select_cells(_regular_grid())
        gone = truth[len(truth) // 2]
        holes = missing_neighbours([c for c in truth if c != gone])
        assert any(abs(h[0] - gone[0]) < 0.02 and abs(h[1] - gone[1]) < 0.03 for h in holes)

    def test_too_few_cells_do_not_invent_holes_outside_the_outline(self):
        assert missing_neighbours([(30.0, 10.0), (30.0, 10.1), (30.1, 10.0)]) == []
