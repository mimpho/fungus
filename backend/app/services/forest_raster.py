"""Class rasters for the probability layer (forest, substrate): the share of each class per
~250 m pixel, aggregated from the MCSC-4 25 m grid (see mcsc_grid.py) or from polygons.

The raster has the same extent and pixel grid as the elevation raster (rows evenly spaced in
latitude), so the client reads both with the same index. One byte per class and pixel, class
after class (`(len(CLASSES), height, width)`): share * 255. Shares are over the 25 m cells with
data (so a pixel half over the sea is not diluted), and add up to at most 1 (non-forest cells
count as zero). numpy is needed here (a one-off job), not by the API.
"""
from __future__ import annotations

import json
from collections.abc import Sequence
from pathlib import Path

import numpy as np

from app.services.forest_classes import CLASSES, classify
from app.services.mcsc_grid import CELL_M, MANIFEST, TILE_CELLS, decode_tile, tile_name, to_utm31

NO_CLASS = 255
MESH_STEP_PX = 16


def class_tables(codes: Sequence[str]) -> tuple[np.ndarray, np.ndarray]:
    """(class index, weight) per grid index (0 = no data, 1.. = codes in order)."""
    cls = np.full(len(codes) + 1, NO_CLASS, dtype=np.uint8)
    weight = np.zeros(len(codes) + 1, dtype=np.float32)
    for i, code in enumerate(codes, start=1):
        found = classify(code)
        if found:
            cls[i], weight[i] = CLASSES.index(found[0]), found[1]
    return cls, weight


def load_tiles(root: Path | str) -> tuple[dict[tuple[int, int], np.ndarray], list[str]]:
    """All tiles of a grid folder as flat index arrays, and its code list."""
    root = Path(root)
    manifest = json.loads((root / MANIFEST).read_text())
    bpc = manifest["bytes_per_cell"]
    dtype = np.uint8 if bpc == 1 else np.dtype("<u2")
    tiles: dict[tuple[int, int], np.ndarray] = {}
    for f in root.glob("*.lzma"):
        tx, ty = (int(p) for p in f.stem.split("_"))
        assert f.name == tile_name(tx, ty)
        tiles[(tx, ty)] = np.frombuffer(decode_tile(f.read_bytes(), bpc), dtype=dtype)
    return tiles, [c["code"] for c in manifest["codes"]]


def utm_mesh(bounds: dict, width: int, height: int, step: int = MESH_STEP_PX):
    """UTM x and y at the corners of every `step`-th pixel: smooth enough to interpolate."""
    us = list(range(0, width + step, step))
    vs = list(range(0, height + step, step))
    xs = np.zeros((len(vs), len(us)))
    ys = np.zeros_like(xs)
    for a, v in enumerate(vs):
        lat = bounds["north"] - v * (bounds["north"] - bounds["south"]) / height
        for b, u in enumerate(us):
            lon = bounds["west"] + u * (bounds["east"] - bounds["west"]) / width
            xs[a, b], ys[a, b] = to_utm31(lat, lon)
    return xs, ys


def _bilerp(mesh: np.ndarray, u: np.ndarray, v: np.ndarray, step: int) -> np.ndarray:
    """Mesh value at fractional pixel coordinates (v: rows, u: columns), broadcast together."""
    fu, fv = u / step, v / step
    iu = np.minimum(fu.astype(int), mesh.shape[1] - 2)
    iv = np.minimum(fv.astype(int), mesh.shape[0] - 2)
    du, dv = fu - iu, fv - iv
    return (mesh[iv, iu] * (1 - du) * (1 - dv) + mesh[iv, iu + 1] * du * (1 - dv)
            + mesh[iv + 1, iu] * (1 - du) * dv + mesh[iv + 1, iu + 1] * du * dv)


def _index_at(tiles: dict, x: np.ndarray, y: np.ndarray) -> np.ndarray:
    """Grid index of every UTM point (0 where there is no tile or no data)."""
    i = np.floor(x / CELL_M).astype(np.int64)
    j = np.floor(y / CELL_M).astype(np.int64)
    tx, ty = i // TILE_CELLS, j // TILE_CELLS
    local = (j % TILE_CELLS) * TILE_CELLS + (i % TILE_CELLS)
    out = np.zeros(x.shape, dtype=np.int64)
    key = tx * 100_000 + ty
    for k in np.unique(key):
        tile = tiles.get((int(k // 100_000), int(k % 100_000)))
        if tile is not None:
            mask = key == k
            out[mask] = tile[local[mask]]
    return out


def class_fractions(
    index_at, cls_of: np.ndarray, weight_of: np.ndarray, n_classes: int,
    bounds: dict, width: int, height: int, sub: int = 10,
) -> np.ndarray:
    """(n_classes, height, width) uint8: share of each class in each pixel (see module doc).
    `index_at(x, y)` gives the grid index of UTM points (0 = no data); `cls_of` / `weight_of`
    the class and weight of every grid index (see `class_tables`)."""
    xs, ys = utm_mesh(bounds, width, height)
    u = (np.arange(width * sub) + 0.5) / sub
    out = np.zeros((n_classes, height, width), dtype=np.uint8)
    for r in range(height):
        v = (r + (np.arange(sub) + 0.5) / sub)[:, None]
        x = _bilerp(xs, u[None, :], v, MESH_STEP_PX)
        y = _bilerp(ys, u[None, :], v, MESH_STEP_PX)
        idx = index_at(x, y)
        cls, weight = cls_of[idx], weight_of[idx]
        data = (idx > 0).reshape(sub, width, sub).sum(axis=(0, 2))
        denom = np.maximum(data, 1)
        for k in range(n_classes):
            share = np.where(cls == k, weight, 0).reshape(sub, width, sub).sum(axis=(0, 2)) / denom
            out[k, r] = np.rint(np.clip(share, 0, 1) * 255).astype(np.uint8)
    return out


def forest_fractions(
    tiles: dict, codes: Sequence[str], bounds: dict, width: int, height: int, sub: int = 10
) -> np.ndarray:
    """(len(CLASSES), height, width) uint8: share of each forest class in each pixel."""
    cls_of, weight_of = class_tables(codes)
    def lookup(x, y):
        return _index_at(tiles, x, y)

    return class_fractions(lookup, cls_of, weight_of, len(CLASSES), bounds, width, height, sub)


def rasterize(records, bbox: tuple[float, float, float, float], cell_m: float = 100.0):
    """Fill polygons into a UTM grid: `records` is [(rings, class value 1..255)]; `bbox` is
    (x0, y0, x1, y1). Returns (grid uint8 [row][col], lookup(x, y) -> value, 0 outside).
    Even-odd fill of the cells whose centre falls inside the rings (holes included), one numpy
    pass over the edges of each class per row; later records overwrite earlier ones."""
    x0, y0, x1, y1 = bbox
    cols, rows = int(np.ceil((x1 - x0) / cell_m)), int(np.ceil((y1 - y0) / cell_m))
    grid = np.zeros((rows, cols), dtype=np.uint8)
    by_value: dict[int, list] = {}
    for rings, value in records:
        for ring in rings:
            a = np.asarray(ring, dtype=float)
            if len(a) > 2:
                by_value.setdefault(value, []).append(np.hstack([a[:-1], a[1:]]))
    for value, parts in by_value.items():
        e = np.vstack(parts)  # x1, y1, x2, y2
        ex1, ey1, ex2, ey2 = e[:, 0], e[:, 1], e[:, 2], e[:, 3]
        keep = ey1 != ey2
        ex1, ey1, ex2, ey2 = ex1[keep], ey1[keep], ex2[keep], ey2[keep]
        lo, hi = np.minimum(ey1, ey2), np.maximum(ey1, ey2)
        order = np.argsort(lo)
        ex1, ey1, ex2, ey2, lo, hi = (a[order] for a in (ex1, ey1, ex2, ey2, lo, hi))
        for j in range(rows):
            y = y0 + (j + 0.5) * cell_m
            n = np.searchsorted(lo, y, side="right")  # edges starting at or below y
            m = hi[:n] > y
            if not m.any():
                continue
            a1, b1, a2, b2 = ex1[:n][m], ey1[:n][m], ex2[:n][m], ey2[:n][m]
            xs = a1 + (y - b1) * (a2 - a1) / (b2 - b1)
            xs.sort()
            if len(xs) % 2:
                xs = xs[:-1]
            a = np.ceil((xs[0::2] - x0) / cell_m - 0.5).astype(int).clip(0, cols)
            b = np.ceil((xs[1::2] - x0) / cell_m - 0.5).astype(int).clip(0, cols)
            diff = np.zeros(cols + 1, dtype=int)
            np.add.at(diff, a, 1)
            np.add.at(diff, b, -1)
            inside = np.cumsum(diff[:cols]) > 0
            grid[j, inside] = value

    def lookup(x, y):
        i = np.floor((x - x0) / cell_m).astype(np.int64)
        j = np.floor((y - y0) / cell_m).astype(np.int64)
        ok = (i >= 0) & (i < cols) & (j >= 0) & (j < rows)
        out = np.zeros(x.shape, dtype=np.int64)
        out[ok] = grid[j[ok], i[ok]]
        return out

    return grid, lookup
