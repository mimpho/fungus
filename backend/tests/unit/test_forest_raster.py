"""Forest raster: shares per pixel from a synthetic MCSC grid (needs numpy, a script-only dep)."""
import pytest

np = pytest.importorskip("numpy")

from app.services.forest_classes import CLASSES  # noqa: E402
from app.services.forest_raster import class_tables, forest_fractions  # noqa: E402
from app.services.mcsc_grid import CELL_M, TILE_CELLS, GridBuilder, build_code_table, to_utm31  # noqa: E402

BOUNDS = {"north": 41.610, "south": 41.600, "west": 2.000, "east": 2.012}
W, H = 4, 4


def _tiles_with(*polygons):
    """Tiles holding the given (rings, code) polygons, as the API's grid would, in numpy."""
    table = build_code_table(code for _, code in polygons)
    b = GridBuilder(table)
    for rings, code in polygons:
        b.fill_polygon(rings, code)
    tiles = {k: np.frombuffer(bytes(t), dtype=np.uint8) for k, t in b.tiles.items()}
    return tiles, list(table.codes)


def _rect(x0, y0, x1, y1):
    return [[(x0, y0), (x1, y0), (x1, y1), (x0, y1), (x0, y0)]]


def _extent():
    xs, ys = zip(*(to_utm31(lat, lon) for lat in (41.600, 41.610) for lon in (2.000, 2.012)))
    return min(xs) - 200, min(ys) - 200, max(xs) + 200, max(ys) + 200


def test_class_tables_map_codes_and_leave_the_rest_without_class():
    cls, weight = class_tables(["bph20", "m", "bqi5"])
    assert [CLASSES[c] for c in cls[[1, 3]]] == ["pinar", "encinar"]
    assert cls[2] == 255 and cls[0] == 255
    assert list(weight) == [0, 1.0, 0, 0.5]


def test_a_forest_covering_everything_gives_full_share_of_its_class():
    x0, y0, x1, y1 = _extent()
    tiles, codes = _tiles_with((_rect(x0, y0, x1, y1), "bph20"))
    out = forest_fractions(tiles, codes, BOUNDS, W, H)
    assert out.shape == (len(CLASSES), H, W)
    assert (out[CLASSES.index("pinar")] == 255).all()
    assert out.sum() == 255 * W * H  # nothing in the other classes


def test_half_the_area_gives_half_the_share_and_the_west_is_where_it_is():
    x0, y0, x1, y1 = _extent()
    xmid = (x0 + x1) / 2
    tiles, codes = _tiles_with((_rect(x0, y0, xmid, y1), "bqi20"), (_rect(xmid, y0, x1, y1), "m"))
    pinar, enc = CLASSES.index("pinar"), CLASSES.index("encinar")
    out = forest_fractions(tiles, codes, BOUNDS, W, H)
    assert (out[enc][:, 0] == 255).all() and (out[enc][:, W - 1] == 0).all()
    assert out[pinar].sum() == 0


def test_sparse_cover_counts_half():
    x0, y0, x1, y1 = _extent()
    tiles, codes = _tiles_with((_rect(x0, y0, x1, y1), "bfs5"))
    out = forest_fractions(tiles, codes, BOUNDS, W, H)
    assert (out[CLASSES.index("hayedo")] == 128).all()


def test_cells_without_data_do_not_dilute_the_share():
    x0, y0, x1, y1 = _extent()
    xmid = (x0 + x1) / 2
    tiles, codes = _tiles_with((_rect(x0, y0, xmid, y1), "bph20"))  # east: no data at all
    pinar = CLASSES.index("pinar")
    out = forest_fractions(tiles, codes, BOUNDS, W, H)
    assert (out[pinar][:, 0] == 255).all()
    assert (out[pinar][:, W - 1] == 0).all()


def test_pixels_over_a_missing_tile_are_zero():
    out = forest_fractions({}, ["bph20"], BOUNDS, W, H)
    assert out.sum() == 0


def test_tile_constants_agree_with_the_grid():
    assert TILE_CELLS * CELL_M == 25_600


def test_rasterize_fills_inside_rings_and_leaves_holes_empty():
    from app.services.forest_raster import rasterize

    outer = [(0, 0), (1000, 0), (1000, 1000), (0, 1000), (0, 0)]
    hole = [(400, 400), (600, 400), (600, 600), (400, 600), (400, 400)]
    grid, lookup = rasterize([([outer, hole], 2)], (0, 0, 1000, 1000), 100.0)
    assert grid.shape == (10, 10) and grid[0, 0] == 2 and grid[9, 9] == 2
    assert grid[4, 4] == 0 and grid[5, 5] == 0  # the hole
    values = lookup(np.array([50.0, 450.0, 5000.0]), np.array([50.0, 450.0, 50.0]))
    assert list(values) == [2, 0, 0]  # inside, in the hole, outside the grid


def test_rasterize_gives_each_class_its_own_cells():
    from app.services.forest_raster import rasterize

    west = [(0, 0), (500, 0), (500, 1000), (0, 1000), (0, 0)]
    east = [(500, 0), (1000, 0), (1000, 1000), (500, 1000), (500, 0)]
    grid, _ = rasterize([([west], 1), ([east], 3)], (0, 0, 1000, 1000), 100.0)
    assert set(grid[:, :5].ravel()) == {1} and set(grid[:, 5:].ravel()) == {3}
