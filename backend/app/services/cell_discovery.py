"""
Which Open-Meteo cells cover Catalonia: pure geometry, no network, no database.

The model grid is not known by arithmetic (the free-map PRD calls it irregular, about 7.8 x
10.8 km), so the cells are *discovered*: a lattice of probe points finer than a cell is sent to
Open-Meteo, each answer says which cell the point falls in, and the distinct answers are the
cells. Here live the lattice, the footprint of a cell inferred from the answers, and the test
"does this cell touch Catalonia" against the outline. The probing itself is in
app.services.cell_ingest.
"""
import math
import statistics
from collections.abc import Iterable, Sequence
from dataclasses import dataclass

from app.services.catalonia_outline import RINGS, Ring
from app.services.geo_bounds import LAT_RANGE, LON_RANGE

Point = tuple[float, float]  # (lat, lon)

# Degrees between probes, per axis. The cells measured on 2026-10-18 are ~0.070 deg of latitude
# (7.8 km) by ~0.127 of longitude (10.8 km): a step above those skips whole rows of cells, so
# the lattice stays below both. `missing_neighbours` checks the result afterwards.
DEFAULT_STEP_LAT = 0.06
DEFAULT_STEP_LON = 0.10
DECIMALS = 3  # grid coordinates are grouped at ~100 m to infer the spacing


# ── Geometry ──────────────────────────────────────────────────────────────────

def point_in_rings(lat: float, lon: float, rings: Sequence[Ring] = RINGS) -> bool:
    """Even-odd ray casting over (lon, lat) rings."""
    inside = False
    for ring in rings:
        n = len(ring)
        for i in range(n):
            x1, y1 = ring[i]
            x2, y2 = ring[(i + 1) % n]
            if (y1 > lat) != (y2 > lat) and lon < (x2 - x1) * (lat - y1) / (y2 - y1) + x1:
                inside = not inside
    return inside


def _segments_cross(a: tuple, b: tuple, c: tuple, d: tuple) -> bool:
    def orient(p: tuple, q: tuple, r: tuple) -> float:
        return (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0])

    o1, o2, o3, o4 = orient(a, b, c), orient(a, b, d), orient(c, d, a), orient(c, d, b)
    return (o1 > 0) != (o2 > 0) and (o3 > 0) != (o4 > 0)


def rect_touches_rings(
    lat: float, lon: float, half_lat: float, half_lon: float, rings: Sequence[Ring] = RINGS
) -> bool:
    """True when the rectangle around (lat, lon) overlaps the outline (inside, or crossing it)."""
    lat0, lat1, lon0, lon1 = lat - half_lat, lat + half_lat, lon - half_lon, lon + half_lon
    corners = [(lon0, lat0), (lon1, lat0), (lon1, lat1), (lon0, lat1)]
    if point_in_rings(lat, lon, rings) or any(point_in_rings(y, x, rings) for x, y in corners):
        return True
    for ring in rings:
        n = len(ring)
        for i in range(n):
            p, q = ring[i], ring[(i + 1) % n]
            if lon0 <= p[0] <= lon1 and lat0 <= p[1] <= lat1:  # a vertex inside the rectangle
                return True
            if (
                (p[0] < lon0 and q[0] < lon0) or (p[0] > lon1 and q[0] > lon1)
                or (p[1] < lat0 and q[1] < lat0) or (p[1] > lat1 and q[1] > lat1)
            ):
                continue  # the edge lies wholly to one side of the rectangle
            for j in range(4):  # an edge crossing a side
                if _segments_cross(p, q, corners[j], corners[(j + 1) % 4]):
                    return True
    return False


# ── Probe lattice ─────────────────────────────────────────────────────────────

def probe_lattice(
    step_lat: float = DEFAULT_STEP_LAT,
    step_lon: float = DEFAULT_STEP_LON,
    rings: Sequence[Ring] = RINGS,
    margin: float = 0.05,
) -> list[Point]:
    """Probe points over the bounding box that lie within `margin` degrees of the outline.
    Ordered south to north, west to east, so a run is the same every time."""
    points: list[Point] = []
    rows = round((LAT_RANGE[1] - LAT_RANGE[0]) / step_lat) + 1
    cols = round((LON_RANGE[1] - LON_RANGE[0]) / step_lon) + 1
    for i in range(rows):
        lat = round(LAT_RANGE[0] + i * step_lat, 4)
        for j in range(cols):
            lon = round(LON_RANGE[0] + j * step_lon, 4)
            if rect_touches_rings(lat, lon, margin, margin, rings):
                points.append((lat, lon))
    return points


def batches(items: Sequence, size: int) -> Iterable[Sequence]:
    for i in range(0, len(items), size):
        yield items[i : i + size]


# ── From answers to cells ─────────────────────────────────────────────────────

ROW_DECIMALS = 3  # cells of one row share their latitude; this groups them


@dataclass(frozen=True)
class Grid:
    """The cell grid as the answers show it. Rows are `2 * half_lat` apart. The width of a cell
    is not the same in every row: Open-Meteo keeps it close to constant in kilometres, so in
    degrees it grows with latitude, and each row has its own offset. That is why the width is
    estimated per row and the cells of different rows are never lined up by longitude."""

    half_lat: float
    rows: dict[float, list[float]]  # rounded latitude -> sorted longitudes of the centres
    half_lon_default: float
    half_lon_by_row: dict[float, float]

    def half_lon(self, lat: float) -> float:
        return self.half_lon_by_row.get(round(lat, ROW_DECIMALS), self.half_lon_default)

    def row_at(self, lat: float) -> list[float] | None:
        """The row whose latitude is within 0.6 of a half row of `lat`, if any."""
        for key, lons in self.rows.items():
            if abs(key - lat) <= 0.6 * self.half_lat:
                return lons
        return None


def _half_gap(values: list[float], lo: float = 0.0, hi: float = float("inf")) -> float | None:
    gaps = [b - a for a, b in zip(values, values[1:], strict=False) if lo < b - a < hi]
    return statistics.median(gaps) / 2 if gaps else None


def build_grid(centres: Iterable[Point]) -> Grid | None:
    """Rows and cell sizes from the centres found so far; None when too few to tell."""
    rows: dict[float, list[float]] = {}
    for lat, lon in centres:
        rows.setdefault(round(lat, ROW_DECIMALS), []).append(lon)
    for lons in rows.values():
        lons.sort()
    half_lat = _half_gap(sorted(rows), lo=10**-ROW_DECIMALS)
    # The typical width over all rows; a row's own estimate ignores gaps far from it (a hole is
    # twice the width, two answers for one cell are a sliver).
    all_gaps = [b - a for lons in rows.values() for a, b in zip(lons, lons[1:], strict=False)]
    all_gaps = [g for g in all_gaps if g > 10**-ROW_DECIMALS]
    if half_lat is None or not all_gaps:
        return None
    typical = statistics.median(all_gaps)
    by_row: dict[float, float] = {}
    for key, lons in rows.items():
        half = _half_gap(lons, lo=0.7 * typical, hi=1.4 * typical)
        if half is not None:
            by_row[key] = half
    return Grid(half_lat, rows, typical / 2, by_row)


def select_cells(centres: Iterable[Point], rings: Sequence[Ring] = RINGS) -> list[Point]:
    """Distinct centres whose cell touches the outline, in a stable order."""
    chosen = sorted(set(centres))
    grid = build_grid(chosen)
    if grid is None:
        return []
    return [
        (lat, lon)
        for lat, lon in chosen
        if rect_touches_rings(lat, lon, grid.half_lat, grid.half_lon(lat), rings)
    ]


def missing_neighbours(centres: Iterable[Point], rings: Sequence[Ring] = RINGS) -> list[Point]:
    """Where a neighbouring cell should be (next in the row, or in the row above or below),
    touches Catalonia, and none was found: holes left by the probe lattice. Probing those
    points fills them; an empty list means the grid is closed."""
    known = sorted(set(centres))
    grid = build_grid(known)
    if grid is None:
        return []
    found: list[Point] = []

    def add(lat: float, lon: float, half_lon: float) -> None:
        if not rect_touches_rings(lat, lon, grid.half_lat, half_lon, rings):
            return
        if any(
            abs(f[0] - lat) < 0.6 * grid.half_lat and abs(f[1] - lon) < 0.6 * half_lon
            for f in found
        ):
            return
        found.append((round(lat, 4), round(lon, 4)))

    for lat, lon in known:
        half = grid.half_lon(lat)
        row = grid.rows[round(lat, ROW_DECIMALS)]
        for sign in (1, -1):  # along the row
            target = lon + sign * 2 * half
            if not any(abs(other - target) < 0.6 * half for other in row):
                add(lat, target, half)
        for sign in (1, -1):  # the rows above and below
            other_lat = lat + sign * 2 * grid.half_lat
            other_row = grid.row_at(other_lat)
            half_other = grid.half_lon(other_row_key(grid, other_lat)) if other_row else half
            # A cell of that row whose centre is within half a width of ours is "the" neighbour.
            if other_row is None or not any(abs(o - lon) <= half_other for o in other_row):
                add(other_lat, lon, half_other)
    return sorted(found)


def other_row_key(grid: Grid, lat: float) -> float:
    for key in grid.rows:
        if abs(key - lat) <= 0.6 * grid.half_lat:
            return key
    return round(lat, ROW_DECIMALS)


def weighted_calls(days: int, locations: int = 1) -> int:
    """Open-Meteo counts a request over two weeks as days / 14 calls, per location."""
    return locations * max(1, math.ceil(days / 14))
