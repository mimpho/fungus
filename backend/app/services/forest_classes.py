"""Forest classes of the probability layer: MCSC-4 codes -> five classes, and which classes a
species fits.

The classes are the catalogue's forest types the map can tell apart: pinar (every conifer),
encinar (evergreen oaks, strawberry tree), hayedo (beech), robledal (deciduous oaks) and "otro"
(other broadleaves: riparian, birch, ash, chestnut...). Pure functions, no I/O.

An MCSC-4 level-5 code is a base (`bph` = pi blanc) plus an optional canopy cover suffix (`20`
= at least 20 %, `5` = 5-20 %) or a variant letter (`f` protection strip, `p` plantation, `r`
regeneration). The 5-20 % stands count half. Everything that is not a forest (scrub, crops,
meadows, urban, water, ...) has no class.
"""
from __future__ import annotations

import re
from collections.abc import Collection

CLASSES = ("pinar", "encinar", "hayedo", "robledal", "otro")

_BASES: dict[str, str] = {
    **dict.fromkeys(("bph", "bps", "bpn", "bpu", "bpp", "bpm", "baa", "bcon"), "pinar"),
    **dict.fromkeys(("bqi", "bqs", "barb", "bap"), "encinar"),
    "bfs": "hayedo",
    **dict.fromkeys(("bqh", "bqf", "bqp", "bqr", "bqc", "bqpy"), "robledal"),
    **dict.fromkeys(("bribc", "bcad", "bcs", "bfe", "bbp", "bca"), "otro"),
}
_VARIANTS = "fpr"
_COVER = re.compile(r"^(?P<base>[a-z]+?)(?P<cover>20|5)?$")
SPARSE_WEIGHT = 0.5

# Catalogue forest types (species.forest_types) that fit each class. "mixto" fits any forest;
# the other broadleaves fit the two broadleaf types, as the point's macrotype rule does.
_FITS: dict[str, frozenset[str]] = {
    "pinar": frozenset({"pinar", "mixto"}),
    "encinar": frozenset({"encinar", "mixto"}),
    "hayedo": frozenset({"hayedo", "mixto"}),
    "robledal": frozenset({"robledal", "mixto"}),
    "otro": frozenset({"robledal", "hayedo", "mixto"}),
}
_JUDGED = frozenset({"pinar", "encinar", "hayedo", "robledal", "mixto"})


def classify(code: str) -> tuple[str, float] | None:
    """(class, weight) of an MCSC-4 code, None if it is not a forest we classify."""
    m = _COVER.match(code.strip().lower())
    if not m:
        return None
    base, cover = m["base"], m["cover"]
    cls = _BASES.get(base)
    if cls is None and base[-1:] in _VARIANTS:
        cls = _BASES.get(base[:-1])
    if cls is None:
        return None
    return cls, SPARSE_WEIGHT if cover == "5" else 1.0


def classes_for(forest_types: Collection[str] | None) -> list[str] | None:
    """Classes a species fits, in `CLASSES` order. None = the forest cannot judge it (no forest
    type, or only meadow, garden or riparian types, which no land cover tells): no filter."""
    types = set(forest_types or ())
    if not types & _JUDGED:
        return None
    return [c for c in CLASSES if _FITS[c] & types]
