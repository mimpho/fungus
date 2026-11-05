"""CREAF MCSC-4 land cover as a 25 m grid: tile format, reader and species composition.

The sheets (polygons, UTM 31N / EPSG:25831) are preprocessed by `scripts/mcsc_preprocess.py`
into tiles of 1024 x 1024 cells. Each cell holds the class (`C_SIMPLE` code) of the polygon at
its centre, as an index into a code table (0 = no data), 1 byte per cell (2 when the table
has more than 255 codes), compressed with lzma. This module is pure and stdlib-only: it
builds tiles in memory, reads them through any loader (a directory, object storage...) and
computes the composition around a point. It does no I/O except `write_grid` / `Grid.from_dir`.

The data is licensed "de lliure utilització" by CREAF; the tiles are never committed.
"""

from __future__ import annotations

import json
import lzma
import math
import re
from collections.abc import Callable, Iterable, Sequence
from dataclasses import dataclass, field
from pathlib import Path

CELL_M = 25
TILE_CELLS = 1024
TILE_M = CELL_M * TILE_CELLS
CRS = "EPSG:25831"
MANIFEST = "manifest.json"
# Codes whose meaning is inferred, not in CREAF's legend text (see memory/decisions.md).
UNCONFIRMED_BASES = frozenset({"bqs", "bqp"})

Ring = Sequence[tuple[float, float]]


def to_utm31(lat: float, lon: float) -> tuple[float, float]:
    """WGS84 lat/lon to ETRS89 / UTM 31N (metres east, north)."""
    a, f, k0, lon0 = 6378137.0, 1 / 298.257222101, 0.9996, math.radians(3.0)
    n = f / (2 - f)
    big_a = a / (1 + n) * (1 + n * n / 4 + n**4 / 64)
    alpha = (
        n / 2 - 2 * n**2 / 3 + 5 * n**3 / 16,
        13 * n**2 / 48 - 3 * n**3 / 5,
        61 * n**3 / 240,
    )
    phi, dl = math.radians(lat), math.radians(lon) - lon0
    c = 2 * math.sqrt(n) / (1 + n)
    t = math.sinh(math.atanh(math.sin(phi)) - c * math.atanh(c * math.sin(phi)))
    xi = math.atan2(t, math.cos(dl))
    eta = math.atanh(math.sin(dl) / math.sqrt(1 + t * t))
    x = eta + sum(
        al * math.cos(2 * (j + 1) * xi) * math.sinh(2 * (j + 1) * eta)
        for j, al in enumerate(alpha)
    )
    y = xi + sum(
        al * math.sin(2 * (j + 1) * xi) * math.cosh(2 * (j + 1) * eta)
        for j, al in enumerate(alpha)
    )
    return 500000.0 + k0 * big_a * x, k0 * big_a * y


# ---- code table ---------------------------------------------------------------------------
def _base(code: str) -> str:
    return re.sub(r"\d+$", "", code)


@dataclass(frozen=True)
class CodeTable:
    """`codes[i - 1]` is the class stored as index `i`; index 0 means no data."""

    codes: tuple[str, ...]
    _lookup: dict[str, int] = field(init=False, repr=False, compare=False)

    def __post_init__(self) -> None:
        if len(self.codes) > 0xFFFF:
            raise ValueError(f"{len(self.codes)} codes do not fit in 2 bytes")
        object.__setattr__(self, "_lookup", {c: i for i, c in enumerate(self.codes, start=1)})

    @property
    def bytes_per_cell(self) -> int:
        return 1 if len(self.codes) <= 0xFF else 2

    def index(self, code: str) -> int:
        return self._lookup[code]

    def code(self, index: int) -> str | None:
        return self.codes[index - 1] if 0 < index <= len(self.codes) else None

    def as_manifest(self) -> list[dict]:
        return [{"code": c, "confirmed": _base(c) not in UNCONFIRMED_BASES} for c in self.codes]

    @classmethod
    def from_manifest(cls, entries: Iterable[dict]) -> CodeTable:
        return cls(tuple(e["code"] for e in entries))


def build_code_table(codes: Iterable[str]) -> CodeTable:
    return CodeTable(tuple(sorted(set(codes))))


# ---- cells and tiles ----------------------------------------------------------------------
def _first_centre_at_or_after(v: float) -> int:
    """Smallest cell index whose centre ((i + 0.5) * CELL_M) is >= v, safe against rounding."""
    i = math.ceil(v / CELL_M - 0.5)
    while (i - 0.5) * CELL_M >= v:
        i -= 1
    while (i + 0.5) * CELL_M < v:
        i += 1
    return i


class GridBuilder:
    """Rasterises polygons into tiles. The first polygon to claim a cell keeps it."""

    def __init__(self, table: CodeTable) -> None:
        self.table = table
        self.tiles: dict[tuple[int, int], bytearray] = {}

    def tile(self, tx: int, ty: int) -> bytes | None:
        t = self.tiles.get((tx, ty))
        return bytes(t) if t is not None else None

    def fill_polygon(self, rings: Sequence[Ring], code: str) -> None:
        """Even-odd fill of the cells whose centre falls inside the rings (holes included)."""
        value = self.table.index(code)
        ys = [p[1] for r in rings for p in r]
        if not ys:
            return
        for j in range(_first_centre_at_or_after(min(ys)), _first_centre_at_or_after(max(ys)) + 1):
            y = (j + 0.5) * CELL_M
            crossings: list[float] = []
            for ring in rings:
                prev = len(ring) - 1
                for cur in range(len(ring)):
                    (xi, yi), (xj, yj) = ring[cur], ring[prev]
                    if (yi > y) != (yj > y):
                        crossings.append((xj - xi) * (y - yi) / (yj - yi) + xi)
                    prev = cur
            crossings.sort()
            for a, b in zip(crossings[0::2], crossings[1::2], strict=False):
                i0, i1 = _first_centre_at_or_after(a), _first_centre_at_or_after(b)
                self._paint_row(j, i0, i1, value)

    def _paint_row(self, j: int, i0: int, i1: int, value: int) -> None:
        """Cells i0 <= i < i1 of row j, split at tile edges; occupied cells are left alone."""
        bpc = self.table.bytes_per_cell
        i = i0
        while i < i1:
            tx, ty = i // TILE_CELLS, j // TILE_CELLS
            col, row = i % TILE_CELLS, j % TILE_CELLS
            n = min(i1 - i, TILE_CELLS - col)
            tile = self.tiles.get((tx, ty))
            if tile is None:
                tile = self.tiles[(tx, ty)] = bytearray(TILE_CELLS * TILE_CELLS * bpc)
            start = (row * TILE_CELLS + col) * bpc
            if bpc == 1:
                if not any(tile[start : start + n]):
                    tile[start : start + n] = bytes([value]) * n
                else:
                    for k in range(start, start + n):
                        if tile[k] == 0:
                            tile[k] = value
            else:
                packed = value.to_bytes(2, "little")
                for k in range(start, start + 2 * n, 2):
                    if tile[k] == 0 and tile[k + 1] == 0:
                        tile[k : k + 2] = packed
            i += n


def encode_tile(raw: bytes) -> bytes:
    return lzma.compress(raw, preset=9)


def decode_tile(packed: bytes, bytes_per_cell: int) -> bytes:
    raw = lzma.decompress(packed)
    if len(raw) != TILE_CELLS * TILE_CELLS * bytes_per_cell:
        raise ValueError(f"tile of {len(raw)} bytes, expected {TILE_CELLS**2 * bytes_per_cell}")
    return raw


def tile_name(tx: int, ty: int) -> str:
    return f"{tx}_{ty}.lzma"


def write_grid(builder: GridBuilder, out_dir: Path | str, meta: dict | None = None) -> int:
    """Write the tiles and `manifest.json` (deterministic output). Returns the tiles written."""
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    written = 0
    for (tx, ty), tile in sorted(builder.tiles.items()):
        if any(tile):
            (out / tile_name(tx, ty)).write_bytes(encode_tile(bytes(tile)))
            written += 1
    manifest = {
        "version": 1,
        "cell_m": CELL_M,
        "tile_cells": TILE_CELLS,
        "crs": CRS,
        "bytes_per_cell": builder.table.bytes_per_cell,
        "codes": builder.table.as_manifest(),
        **(meta or {}),
    }
    (out / MANIFEST).write_text(json.dumps(manifest, indent=1, sort_keys=True) + "\n")
    return written


# ---- reading ------------------------------------------------------------------------------
class Grid:
    """Cell lookups over tiles fetched by `load_tile(tx, ty) -> raw bytes | None`.

    Every tile (absent ones too) is asked for once and kept in memory."""

    def __init__(
        self, table: CodeTable, load_tile: Callable[[int, int], bytes | None]
    ) -> None:
        self.table = table
        self._load = load_tile
        self._cache: dict[tuple[int, int], bytes | None] = {}

    @classmethod
    def from_dir(cls, path: Path | str) -> Grid:
        root = Path(path)
        manifest = json.loads((root / MANIFEST).read_text())
        if manifest["cell_m"] != CELL_M or manifest["tile_cells"] != TILE_CELLS:
            raise ValueError("grid built with a different cell or tile size")
        table = CodeTable.from_manifest(manifest["codes"])
        bpc = manifest["bytes_per_cell"]

        def load(tx: int, ty: int) -> bytes | None:
            f = root / tile_name(tx, ty)
            return decode_tile(f.read_bytes(), bpc) if f.exists() else None

        return cls(table, load)

    def index_at(self, x: float, y: float) -> int:
        i, j = math.floor(x / CELL_M), math.floor(y / CELL_M)
        key = (i // TILE_CELLS, j // TILE_CELLS)
        if key not in self._cache:
            self._cache[key] = self._load(*key)
        tile = self._cache[key]
        if tile is None:
            return 0
        bpc = self.table.bytes_per_cell
        at = ((j % TILE_CELLS) * TILE_CELLS + (i % TILE_CELLS)) * bpc
        return tile[at] if bpc == 1 else int.from_bytes(tile[at : at + 2], "little")

    def class_at(self, x: float, y: float) -> str | None:
        return self.table.code(self.index_at(x, y))


def composition(grid: Grid, x: float, y: float, radius_m: float) -> list[tuple[str, float]]:
    """Share (%) of each class among the cells with data whose centre is within `radius_m`
    (inclusive) of the UTM 31N point (x, y). Biggest first, ties by code. Empty if no data."""
    if radius_m <= 0:
        raise ValueError("radius_m must be positive")
    counts: dict[int, int] = {}
    r2 = radius_m * radius_m
    for i in range(math.floor((x - radius_m) / CELL_M), math.floor((x + radius_m) / CELL_M) + 1):
        cx = (i + 0.5) * CELL_M
        for j in range(
            math.floor((y - radius_m) / CELL_M), math.floor((y + radius_m) / CELL_M) + 1
        ):
            cy = (j + 0.5) * CELL_M
            if (cx - x) ** 2 + (cy - y) ** 2 > r2:
                continue
            idx = grid.index_at(cx, cy)
            if idx:
                counts[idx] = counts.get(idx, 0) + 1
    total = sum(counts.values())
    shares = [(grid.table.code(idx), 100 * n / total) for idx, n in counts.items()]
    return sorted(shares, key=lambda s: (-s[1], s[0]))


def composition_at(grid: Grid, lat: float, lon: float, radius_m: float) -> list[tuple[str, float]]:
    return composition(grid, *to_utm31(lat, lon), radius_m)
