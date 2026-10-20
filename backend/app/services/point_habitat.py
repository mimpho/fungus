"""Habitat of a point: the forest and the soil acidity around it, and how well a species fits them.

The shares come from the same two class rasters the probability layer multiplies by (forest:
CREAF MCSC-4, 5 classes; substrate: ICGC lithological groups, 3 acidity classes; both ~250 m
pixels on the elevation raster's grid, see scripts/build_forest_raster.py and
build_substrate_raster.py), so a point says what the map says. Missing rasters = no habitat:
the species list then works as before, without forest shares or soil.

A point is judged by its surroundings, not by the exact spot: the forest is the mean of the pixels
within HABITAT_RADIUS_M of it (a field next to a wood still has the wood around it); the soil is
that of the pixel holding the point.

The factors are those of the client (src/lib/reliefLayer.js): forest share < 10 % -> 0, ramping to
1 at 40 %; soil = mean of the pH fit of each substrate class present, weighted by its share.
"""
from __future__ import annotations

import json
import math
from collections.abc import Collection
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Any

from app.services.forest_classes import classes_for
from app.services.substrate_classes import PH_RANGE, SUBSTRATE_CLASSES, ph_fit

FOREST_MIN = 0.1  # share of fitting forest below which the species is not listed
FOREST_FULL = 0.4  # share from which the forest does not lower the score
SOIL_MIN_SHARE = 0.05  # substrate share (of the pixel) below which the soil is "no data"
MIN_FACTOR = 0.05  # a combined factor below this means no habitat the species fits
HABITAT_RADIUS_M = 500  # how far around a point the forest is looked for
_M_PER_DEG = 111_320.0


@dataclass(frozen=True)
class ClassRaster:
    classes: tuple[str, ...]
    width: int
    height: int
    north: float
    south: float
    west: float
    east: float
    data: bytes  # share*255, [class][row][column]

    def shares_at(self, lat: float, lon: float) -> dict[str, float] | None:
        """Share (0-1) of each class at the pixel holding the point; None outside the raster."""
        if not (self.south <= lat <= self.north and self.west <= lon <= self.east):
            return None
        fy = (self.north - lat) / (self.north - self.south)
        fx = (lon - self.west) / (self.east - self.west)
        row = min(self.height - 1, int(fy * self.height))
        col = min(self.width - 1, int(fx * self.width))
        n, at = self.width * self.height, row * self.width + col
        return {c: self.data[k * n + at] / 255 for k, c in enumerate(self.classes)}


    def mean_shares(self, lat: float, lon: float, radius_m: float) -> dict[str, float] | None:
        """Mean share (0-1) of each class over the pixels whose centre lies within `radius_m` of
        the point (the pixel holding the point always counts); None outside the raster."""
        here = self.shares_at(lat, lon)
        if here is None or radius_m <= 0:
            return here
        dlat = (self.north - self.south) / self.height
        dlon = (self.east - self.west) / self.width
        row0 = min(self.height - 1, int((self.north - lat) / dlat))
        col0 = min(self.width - 1, int((lon - self.west) / dlon))
        m_lat = dlat * _M_PER_DEG
        m_lon = dlon * _M_PER_DEG * math.cos(math.radians(lat))
        reach_r, reach_c = math.ceil(radius_m / m_lat), math.ceil(radius_m / m_lon)
        n = self.width * self.height
        total = [0.0] * len(self.classes)
        count = 0
        for row in range(max(0, row0 - reach_r), min(self.height, row0 + reach_r + 1)):
            for col in range(max(0, col0 - reach_c), min(self.width, col0 + reach_c + 1)):
                centre_lat = self.north - (row + 0.5) * dlat
                centre_lon = self.west + (col + 0.5) * dlon
                dy = (centre_lat - lat) * _M_PER_DEG
                dx = (centre_lon - lon) * _M_PER_DEG * math.cos(math.radians(lat))
                if (row, col) != (row0, col0) and math.hypot(dx, dy) > radius_m:
                    continue
                at = row * self.width + col
                for k in range(len(self.classes)):
                    total[k] += self.data[k * n + at] / 255
                count += 1
        return {c: total[k] / count for k, c in enumerate(self.classes)}


@lru_cache(maxsize=4)
def _load(folder: str, stem: str) -> ClassRaster | None:
    try:
        meta: dict[str, Any] = json.loads((Path(folder) / f"{stem}.json").read_text())
        data = (Path(folder) / f"{stem}.bin").read_bytes()
        b = meta["bounds"]
        raster = ClassRaster(
            tuple(meta["classes"]), int(meta["width"]), int(meta["height"]),
            b["north"], b["south"], b["west"], b["east"], data,
        )
    except (OSError, KeyError, ValueError):
        return None
    if len(data) != len(raster.classes) * raster.width * raster.height:
        return None
    return raster


def load_raster(folder: Path | str, stem: str) -> ClassRaster | None:
    """The class raster `stem` in `folder`, read once; None if it is not there or is malformed."""
    return _load(str(folder), stem)


@dataclass(frozen=True)
class Habitat:
    """What surrounds a point. `forest` / `soil`: share (0-1) of each class, None = not known."""

    forest: dict[str, float] | None = None
    soil: dict[str, float] | None = None
    forest_radius_m: int = HABITAT_RADIUS_M

    def forest_around(self) -> bool | None:
        """Is there forest around the point (some class adds up to FOREST_MIN or more)? None
        when the forest raster does not cover it."""
        if self.forest is None:
            return None
        return sum(self.forest.values()) >= FOREST_MIN

    def as_dict(self) -> dict:
        def pct(shares):
            return None if shares is None else {k: round(v, 3) for k, v in shares.items()}

        return {
            "forest": pct(self.forest),
            "forest_radius_m": self.forest_radius_m,
            "soil": pct(self.soil),
            "soil_ph": {k: list(v) for k, v in PH_RANGE.items()},  # typical pH of each class
        }


def habitat_at(
    lat: float,
    lon: float,
    forest_dir: Path | str,
    substrate_dir: Path | str,
    radius_m: int = HABITAT_RADIUS_M,
) -> Habitat:
    forest = load_raster(forest_dir, "forest-catalonia")
    soil = load_raster(substrate_dir, "substrate-catalonia")
    return Habitat(
        forest=forest.mean_shares(lat, lon, radius_m) if forest else None,
        soil=soil.shares_at(lat, lon) if soil else None,
        forest_radius_m=radius_m,
    )


def forest_factor(share: float) -> float:
    if share < FOREST_MIN:
        return 0.0
    if share >= FOREST_FULL:
        return 1.0
    return (share - FOREST_MIN) / (FOREST_FULL - FOREST_MIN)


def forest_fit(forest_types: Collection[str], shares: dict[str, float] | None) -> dict | None:
    """Share of the point's forest that the species fits and its factor; None if the forest
    cannot judge the species (no shares, or only meadow / garden / riparian types)."""
    classes = classes_for(forest_types)
    if shares is None or classes is None:
        return None
    share = min(1.0, sum(shares.get(c, 0.0) for c in classes))
    return {"classes": classes, "share": round(share, 3), "factor": round(forest_factor(share), 3)}


def soil_fit(
    ph_min: float | None, ph_max: float | None, shares: dict[str, float] | None
) -> dict | None:
    """How well the species' pH range fits the soil here (0-1); None if unknown."""
    factors = ph_fit(ph_min, ph_max)
    if shares is None or factors is None:
        return None
    total = sum(shares.get(c, 0.0) for c in SUBSTRATE_CLASSES)
    if total < SOIL_MIN_SHARE:
        return None
    parts = zip(SUBSTRATE_CLASSES, factors, strict=True)
    fit = sum(shares.get(c, 0.0) * f for c, f in parts) / total
    return {"ph_min": ph_min, "ph_max": ph_max, "factor": round(fit, 3)}
