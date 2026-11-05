"""MCSC-4 grid: tile format, rasterising polygons, composition within a radius, preprocessing.

Most tests use synthetic sheets written on the fly (they run in CI). The ones marked `real_sheet`
use sheet 36321 from `local-data/` (never committed, CREAF licence) and are skipped without it;
set MCSC_FIXTURE_DIR to point at another copy.
"""

from __future__ import annotations

import json
import math
import os
import random
import struct
from pathlib import Path

import pytest

from app.services.mcsc_grid import (
    CELL_M,
    TILE_CELLS,
    Grid,
    GridBuilder,
    build_code_table,
    composition,
    composition_at,
    decode_tile,
    encode_tile,
    to_utm31,
    write_grid,
)
from scripts import mcsc_preprocess
from scripts.mcsc_lookup import Sheet, inside

TILE_M = CELL_M * TILE_CELLS
UTM_PRJ = (
    'PROJCS["ETRS_1989_UTM_Zone_31N",GEOGCS["GCS_ETRS_1989",DATUM["D_ETRS_1989",'
    'SPHEROID["GRS_1980",6378137,298.257222101]],PRIMEM["Greenwich",0],'
    'UNIT["Degree",0.017453292519943295]],PROJECTION["Transverse_Mercator"],'
    'PARAMETER["False_Easting",500000],PARAMETER["Central_Meridian",3]]'
)
WGS84_PRJ = (
    'GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137,298.257223563]],'
    'PRIMEM["Greenwich",0],UNIT["Degree",0.0174532925199433]]'
)
REAL_DIR = Path(
    os.environ.get(
        "MCSC_FIXTURE_DIR", Path(__file__).resolve().parents[3] / "local-data/mcsc/36321"
    )
)
real_sheet = pytest.mark.skipif(
    not (REAL_DIR / "36321.shp").exists(), reason="sheet 36321 not in local-data/"
)


# ---- helpers ------------------------------------------------------------------------------
def square(x0, y0, x1, y1):
    return [(x0, y0), (x0, y1), (x1, y1), (x1, y0), (x0, y0)]


def write_sheet(folder: Path, name: str, polygons, prj: str | None = UTM_PRJ) -> Path:
    """polygons: list of (code, rings) or (code, None) for a null shape. Returns the .shp."""
    folder.mkdir(parents=True, exist_ok=True)
    shp = b"\x00" * 100
    for n, (_, rings) in enumerate(polygons, start=1):
        if rings is None:
            body = struct.pack("<i", 0)
        else:
            pts = [p for r in rings for p in r]
            xs, ys = [p[0] for p in pts], [p[1] for p in pts]
            parts, at = [], 0
            for r in rings:
                parts.append(at)
                at += len(r)
            body = (
                struct.pack("<i", 5)
                + struct.pack("<4d", min(xs), min(ys), max(xs), max(ys))
                + struct.pack("<2i", len(rings), len(pts))
                + struct.pack(f"<{len(parts)}i", *parts)
                + b"".join(struct.pack("<2d", *p) for p in pts)
            )
        shp += struct.pack(">2i", n, len(body) // 2) + body
    size = 12
    header = struct.pack("<BBBBIHH", 3, 26, 10, 17, len(polygons), 32 + 32 + 1, 1 + size)
    header += b"\x00" * 20
    field = b"C_SIMPLE".ljust(11, b"\x00") + b"C" + b"\x00" * 4 + bytes([size]) + b"\x00" * 15
    dbf = header + field + b"\x0d"
    for code, _ in polygons:
        dbf += b" " + code.ljust(size).encode("latin-1")
    (folder / f"{name}.shp").write_bytes(shp)
    (folder / f"{name}.dbf").write_bytes(dbf)
    if prj is not None:
        (folder / f"{name}.prj").write_text(prj)
    return folder / f"{name}.shp"


def grid_of(builder: GridBuilder) -> Grid:
    return Grid(builder.table, builder.tile)


def centre(i: int, j: int) -> tuple[float, float]:
    return (i + 0.5) * CELL_M, (j + 0.5) * CELL_M


# ---- code table ---------------------------------------------------------------------------
def test_code_table_reserves_zero_and_is_sorted_and_deduplicated():
    table = build_code_table(["m", "bqi20", "m", "bps20"])
    assert table.codes == ("bps20", "bqi20", "m")
    assert [table.index(c) for c in table.codes] == [1, 2, 3]
    assert table.code(0) is None
    assert table.code(3) == "m"
    assert table.bytes_per_cell == 1


def test_code_table_unknown_code_is_an_error():
    with pytest.raises(KeyError):
        build_code_table(["m"]).index("zzz")


def test_code_table_one_byte_up_to_255_codes_two_beyond():
    assert build_code_table([f"c{i:03d}" for i in range(255)]).bytes_per_cell == 1
    big = build_code_table([f"c{i:03d}" for i in range(256)])
    assert big.bytes_per_cell == 2
    assert big.code(256) == "c255"


def test_code_table_marks_inferred_codes_as_unconfirmed():
    manifest = {e["code"]: e["confirmed"] for e in build_code_table(
        ["bqs20", "bqp5", "bqi20", "bfs20", "m"]).as_manifest()}
    assert manifest == {"bfs20": True, "bqi20": True, "bqp5": False, "bqs20": False, "m": True}


# ---- projection ---------------------------------------------------------------------------
def test_to_utm31_matches_known_points():
    e, n = to_utm31(0.0, 3.0)
    assert abs(e - 500000) < 1e-3 and abs(n) < 1e-3
    e, n = to_utm31(41.3874, 2.1686)  # Barcelona centre
    assert abs(e - 430300) < 1500 and abs(n - 4582000) < 1500


# ---- rasterising --------------------------------------------------------------------------
def test_square_polygon_fills_the_cells_it_covers():
    b = GridBuilder(build_code_table(["m"]))
    b.fill_polygon([square(0, 0, 100, 100)], "m")
    grid = grid_of(b)
    painted = sum(
        grid.class_at(*centre(i, j)) == "m" for i in range(-2, 8) for j in range(-2, 8)
    )
    assert painted == 16
    assert grid.class_at(*centre(0, 0)) == "m"
    assert grid.class_at(*centre(3, 3)) == "m"
    assert grid.class_at(*centre(4, 0)) is None


def test_a_cell_takes_the_class_at_its_centre_not_at_its_corner():
    b = GridBuilder(build_code_table(["m"]))
    b.fill_polygon([square(0, 0, 37, 100)], "m")  # centre of cell 1 is x=37.5: outside
    assert grid_of(b).class_at(*centre(0, 0)) == "m"
    assert grid_of(b).class_at(*centre(1, 0)) is None
    c = GridBuilder(build_code_table(["m"]))
    c.fill_polygon([square(0, 0, 38, 100)], "m")  # now it covers x=37.5
    assert grid_of(c).class_at(*centre(1, 0)) == "m"


def test_holes_are_left_empty():
    b = GridBuilder(build_code_table(["m"]))
    b.fill_polygon([square(0, 0, 200, 200), square(75, 75, 125, 125)], "m")
    grid = grid_of(b)
    assert grid.class_at(87.5, 87.5) is None
    assert grid.class_at(112.5, 112.5) is None
    assert grid.class_at(62.5, 87.5) == "m"
    assert grid.class_at(137.5, 87.5) == "m"


def test_concave_polygon():
    l_shape = [(0, 0), (100, 0), (100, 50), (50, 50), (50, 100), (0, 100), (0, 0)]
    b = GridBuilder(build_code_table(["m"]))
    b.fill_polygon([l_shape], "m")
    grid = grid_of(b)
    assert grid.class_at(12.5, 87.5) == "m"
    assert grid.class_at(87.5, 37.5) == "m"
    assert grid.class_at(87.5, 62.5) is None


def test_first_polygon_wins_where_they_overlap():
    b = GridBuilder(build_code_table(["a", "b"]))
    b.fill_polygon([square(0, 0, 100, 100)], "a")
    b.fill_polygon([square(50, 0, 150, 100)], "b")
    grid = grid_of(b)
    assert grid.class_at(62.5, 12.5) == "a"
    assert grid.class_at(112.5, 12.5) == "b"


def test_polygon_across_a_tile_edge_writes_both_tiles():
    b = GridBuilder(build_code_table(["m"]))
    b.fill_polygon([square(TILE_M - 100, 0, TILE_M + 100, 50)], "m")
    assert set(b.tiles) == {(0, 0), (1, 0)}
    grid = grid_of(b)
    assert grid.class_at(TILE_M - 12.5, 12.5) == "m"
    assert grid.class_at(TILE_M + 12.5, 12.5) == "m"
    assert grid.class_at(TILE_M + 112.5, 12.5) is None


def test_matches_the_even_odd_point_in_polygon_of_mcsc_lookup_on_boundaries_too():
    """Vertices on multiples of 12.5 m put edges right through cell centres."""
    rng = random.Random(7)
    for _ in range(25):
        n = rng.randint(4, 8)
        ring = [(rng.randint(0, 20) * 12.5, rng.randint(0, 20) * 12.5) for _ in range(n)]
        ring.append(ring[0])
        b = GridBuilder(build_code_table(["a"]))
        b.fill_polygon([ring], "a")
        grid = grid_of(b)
        for i in range(10):
            for j in range(10):
                x, y = centre(i, j)
                assert (grid.class_at(x, y) == "a") == inside(x, y, [ring]), (ring, i, j)


def test_two_byte_cells_hold_indexes_above_255():
    codes = [f"c{i:03d}" for i in range(300)]
    b = GridBuilder(build_code_table(codes))
    b.fill_polygon([square(0, 0, 50, 50)], "c299")
    assert len(b.tile(0, 0)) == TILE_CELLS * TILE_CELLS * 2
    assert grid_of(b).class_at(12.5, 12.5) == "c299"


def test_tile_is_one_byte_per_cell_and_absent_when_empty():
    b = GridBuilder(build_code_table(["m"]))
    assert b.tile(0, 0) is None
    b.fill_polygon([square(0, 0, 50, 50)], "m")
    assert len(b.tile(0, 0)) == TILE_CELLS * TILE_CELLS


# ---- tile encoding and files --------------------------------------------------------------
def test_tile_roundtrip_through_lzma():
    raw = bytes(range(256)) * (TILE_CELLS * TILE_CELLS // 256)
    packed = encode_tile(raw)
    assert len(packed) < len(raw)
    assert decode_tile(packed, bytes_per_cell=1) == raw


def test_decode_rejects_a_tile_of_the_wrong_size():
    with pytest.raises(ValueError):
        decode_tile(encode_tile(b"\x01" * 10), bytes_per_cell=1)


def test_write_and_read_a_grid_directory(tmp_path):
    b = GridBuilder(build_code_table(["a", "b"]))
    b.fill_polygon([square(0, 0, 100, 100)], "a")
    b.fill_polygon([square(TILE_M, 0, TILE_M + 100, 100)], "b")
    write_grid(b, tmp_path, meta={"sheets": ["x"]})
    assert sorted(p.name for p in tmp_path.iterdir()) == ["0_0.lzma", "1_0.lzma", "manifest.json"]
    manifest = json.loads((tmp_path / "manifest.json").read_text())
    assert (manifest["cell_m"], manifest["tile_cells"], manifest["crs"]) == (25, 1024, "EPSG:25831")
    assert manifest["bytes_per_cell"] == 1 and manifest["sheets"] == ["x"]
    assert [e["code"] for e in manifest["codes"]] == ["a", "b"]
    grid = Grid.from_dir(tmp_path)
    assert grid.class_at(12.5, 12.5) == "a"
    assert grid.class_at(TILE_M + 12.5, 12.5) == "b"
    assert grid.class_at(5 * TILE_M, 12.5) is None


def test_grid_loads_each_tile_once_even_when_absent():
    calls = []
    b = GridBuilder(build_code_table(["a"]))
    b.fill_polygon([square(0, 0, 100, 100)], "a")

    def loader(tx, ty):
        calls.append((tx, ty))
        return b.tile(tx, ty)

    grid = Grid(b.table, loader)
    for x in (12.5, 37.5, 62.5):
        grid.class_at(x, 12.5)
    grid.class_at(9 * TILE_M, 0)
    grid.class_at(9 * TILE_M + 50, 0)
    assert calls == [(0, 0), (9, 0)]


# ---- composition --------------------------------------------------------------------------
def test_composition_of_a_uniform_area():
    b = GridBuilder(build_code_table(["a"]))
    b.fill_polygon([square(0, 0, 2000, 2000)], "a")
    assert composition(grid_of(b), 1000, 1000, 300) == [("a", 100.0)]


def test_composition_splits_evenly_across_a_straight_boundary():
    b = GridBuilder(build_code_table(["a", "b"]))
    b.fill_polygon([square(0, 0, 1000, 2000)], "a")
    b.fill_polygon([square(1000, 0, 2000, 2000)], "b")
    assert composition(grid_of(b), 1000, 1000, 300) == [("a", 50.0), ("b", 50.0)]


def test_composition_ignores_cells_without_data():
    b = GridBuilder(build_code_table(["a"]))
    b.fill_polygon([square(0, 0, 1000, 2000)], "a")  # right half of the circle has no data
    assert composition(grid_of(b), 1000, 1000, 300) == [("a", 100.0)]


def test_composition_without_any_data_is_empty():
    assert composition(grid_of(GridBuilder(build_code_table(["a"]))), 1000, 1000, 300) == []


def test_composition_counts_cells_whose_centre_is_within_the_radius_inclusive():
    cx, cy = 1012.5, 1012.5
    in_circle = sum(i * i + j * j <= 144 for i in range(-13, 14) for j in range(-13, 14))
    b = GridBuilder(build_code_table(["a", "b"]))
    b.fill_polygon([square(cx - 12.5, cy - 12.5, cx + 12.5, cy + 12.5)], "b")  # the centre cell
    b.fill_polygon([square(0, 0, 3000, 3000)], "a")
    got = dict(composition(grid_of(b), cx, cy, 300))
    assert got["b"] == pytest.approx(100 / in_circle)
    # a cell exactly 300 m away (centre x = 1312.5) counts; one 325 m away (1337.5) does not
    e = GridBuilder(build_code_table(["a", "b"]))
    e.fill_polygon([square(1300, 1000, 1325, 1025)], "b")
    e.fill_polygon([square(0, 0, 3000, 3000)], "a")
    assert dict(composition(grid_of(e), cx, cy, 300))["b"] == pytest.approx(100 / in_circle)
    f = GridBuilder(build_code_table(["a", "b"]))
    f.fill_polygon([square(1325, 1000, 1350, 1025)], "b")
    f.fill_polygon([square(0, 0, 3000, 3000)], "a")
    assert composition(grid_of(f), cx, cy, 300) == [("a", 100.0)]


def test_composition_is_sorted_by_share_then_code_and_sums_to_100():
    b = GridBuilder(build_code_table(["a", "b", "c"]))
    b.fill_polygon([square(0, 0, 1100, 2000)], "c")
    b.fill_polygon([square(1100, 0, 1300, 2000)], "a")
    b.fill_polygon([square(1300, 0, 3000, 2000)], "b")
    got = composition(grid_of(b), 1000, 1000, 300)
    assert [c for c, _ in got] == ["c", "a"]
    assert sum(p for _, p in got) == pytest.approx(100.0)
    assert got[0][1] > got[1][1]


def test_composition_reads_across_a_tile_edge_and_tolerates_a_missing_tile():
    b = GridBuilder(build_code_table(["a"]))
    b.fill_polygon([square(TILE_M - 1000, 0, TILE_M + 1000, 2000)], "a")
    assert composition(grid_of(b), TILE_M, 1000, 300) == [("a", 100.0)]
    only_left = GridBuilder(build_code_table(["a"]))
    only_left.fill_polygon([square(TILE_M - 1000, 0, TILE_M, 2000)], "a")
    assert composition(grid_of(only_left), TILE_M, 1000, 300) == [("a", 100.0)]


def test_composition_rejects_a_non_positive_radius():
    with pytest.raises(ValueError):
        composition(grid_of(GridBuilder(build_code_table(["a"]))), 0, 0, 0)


def test_composition_at_takes_latitude_and_longitude():
    x, y = to_utm31(41.7745, 2.435)
    b = GridBuilder(build_code_table(["a"]))
    b.fill_polygon([square(x - 1000, y - 1000, x + 1000, y + 1000)], "a")
    assert composition_at(grid_of(b), 41.7745, 2.435, 300) == [("a", 100.0)]


# ---- preprocessing script ------------------------------------------------------------------
def two_sheets(root: Path) -> list[str]:
    write_sheet(root / "36321", "36321", [
        ("m", [square(0, 0, 1000, 1000)]),
        ("bqi20", [square(1000, 0, 2000, 1000)]),
    ])
    write_sheet(root / "36322", "36322", [("bps20", [square(1500, 0, 3000, 1000)])])
    return [str(root)]


def test_preprocess_builds_one_table_for_all_sheets_and_first_sheet_wins(tmp_path):
    out = tmp_path / "grid"
    summary = mcsc_preprocess.build_grid(two_sheets(tmp_path / "in"), out)
    assert summary["sheets"] == 2 and summary["polygons"] == 3
    assert summary["codes"] == 3 and summary["tiles"] == 1 and summary["skipped"] == 0
    grid = Grid.from_dir(out)
    assert grid.table.codes == ("bps20", "bqi20", "m")
    assert grid.class_at(500, 500) == "m"
    assert grid.class_at(1762.5, 512.5) == "bqi20"  # overlap: 36321 sorts first
    assert grid.class_at(2512.5, 512.5) == "bps20"
    assert grid.class_at(5000, 500) is None
    assert json.loads((out / "manifest.json").read_text())["sheets"] == ["36321", "36322"]


def test_preprocess_is_deterministic(tmp_path):
    src = two_sheets(tmp_path / "in")
    mcsc_preprocess.build_grid(src, tmp_path / "one")
    mcsc_preprocess.build_grid(src, tmp_path / "two")
    for f in (tmp_path / "one").iterdir():
        assert f.read_bytes() == (tmp_path / "two" / f.name).read_bytes()


def test_preprocess_skips_null_shapes_and_empty_codes_and_counts_them(tmp_path):
    write_sheet(tmp_path / "in", "s", [
        ("m", [square(0, 0, 100, 100)]), ("m", None), ("", [square(200, 0, 300, 100)]),
    ])
    summary = mcsc_preprocess.build_grid([str(tmp_path / "in")], tmp_path / "out")
    assert summary["polygons"] == 1 and summary["skipped"] == 2 and summary["codes"] == 1
    assert Grid.from_dir(tmp_path / "out").class_at(250, 50) is None


def test_preprocess_refuses_a_sheet_that_is_not_utm_31n(tmp_path):
    write_sheet(tmp_path / "in", "s", [("m", [square(0, 0, 100, 100)])], prj=WGS84_PRJ)
    with pytest.raises(ValueError, match="UTM"):
        mcsc_preprocess.build_grid([str(tmp_path / "in")], tmp_path / "out")


def test_preprocess_without_sheets_is_an_error(tmp_path):
    (tmp_path / "empty").mkdir()
    with pytest.raises(ValueError, match="no .shp"):
        mcsc_preprocess.build_grid([str(tmp_path / "empty")], tmp_path / "out")


def test_preprocess_refuses_to_overwrite_a_grid_and_drops_stale_tiles_when_asked(tmp_path):
    src = two_sheets(tmp_path / "in")
    out = tmp_path / "out"
    mcsc_preprocess.build_grid(src, out)
    with pytest.raises(FileExistsError):
        mcsc_preprocess.build_grid(src, out)
    (out / "7_7.lzma").write_bytes(b"stale")
    mcsc_preprocess.build_grid(src, out, overwrite=True)
    assert sorted(p.name for p in out.glob("*.lzma")) == ["0_0.lzma"]


def test_preprocess_cli(tmp_path, capsys):
    src = two_sheets(tmp_path / "in")
    assert mcsc_preprocess.main(["--dirs", *src, "--out", str(tmp_path / "out")]) == 0
    assert (tmp_path / "out" / "manifest.json").exists()
    assert "tiles" in capsys.readouterr().out


# ---- the real sheet (local only) -----------------------------------------------------------
@pytest.fixture(scope="module")
def real_grid(tmp_path_factory):
    out = tmp_path_factory.mktemp("grid36321")
    summary = mcsc_preprocess.build_grid([str(REAL_DIR)], out)
    return summary, out, Grid.from_dir(out), Sheet(str(REAL_DIR / "36321.shp"))


@real_sheet
def test_real_sheet_summary_matches_the_design_measurements(real_grid):
    summary, out, _, _ = real_grid
    assert (summary["polygons"], summary["codes"], summary["skipped"]) == (8628, 82, 0)
    size = sum(f.stat().st_size for f in out.glob("*.lzma"))
    assert size < 60_000  # measured 41 KB with lzma


@real_sheet
def test_real_sheet_cells_agree_with_the_polygon_lookup(real_grid):
    _, _, grid, sheet = real_grid
    x0, y0, x1, y1 = sheet.bbox
    rng = random.Random(36321)
    for _ in range(300):
        i = rng.randrange(int(x0 // CELL_M), int(x1 // CELL_M))
        j = rng.randrange(int(y0 // CELL_M), int(y1 // CELL_M))
        x, y = centre(i, j)
        row = sheet.find(x, y)
        assert grid.class_at(x, y) == (row["C_SIMPLE"] if row else None), (i, j)


@real_sheet
def test_real_sheet_composition_agrees_with_a_brute_force_count(real_grid):
    _, _, grid, sheet = real_grid
    x0, y0, x1, y1 = sheet.bbox
    rng = random.Random(1)
    checked = 0
    while checked < 3:
        x = rng.uniform(x0 + 400, x1 - 400)
        y = rng.uniform(y0 + 400, y1 - 400)
        counts: dict[str, int] = {}
        for i in range(-13, 14):
            for j in range(-13, 14):
                px = (math.floor(x / CELL_M) + i + 0.5) * CELL_M
                py = (math.floor(y / CELL_M) + j + 0.5) * CELL_M
                if math.hypot(px - x, py - y) > 300:
                    continue
                row = sheet.find(px, py)
                if row:
                    counts[row["C_SIMPLE"]] = counts.get(row["C_SIMPLE"], 0) + 1
        if not counts:
            continue
        total = sum(counts.values())
        expected = sorted(((c, 100 * n / total) for c, n in counts.items()),
                          key=lambda t: (-t[1], t[0]))
        got = composition(grid, x, y, 300)
        assert [c for c, _ in got] == [c for c, _ in expected]
        assert [p for _, p in got] == pytest.approx([p for _, p in expected])
        checked += 1
