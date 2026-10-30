"""Forest classes of the probability layer: MCSC-4 codes -> five classes, and which classes a
species fits.

The classes are the forest types the map can tell apart. Five are pine and conifer woods
(carrasco = Aleppo pine, silvestre = Scots pine, pinassa = Austrian pine, negro = mountain pine,
otros = stone pine, maritime pine, fir and other conifers), then encinar (evergreen oaks,
strawberry tree), hayedo (beech), robledal (deciduous oaks) and three of the other broadleaves:
castanar (chestnut), ribera (riparian) and caducifolio_otro (birch, ash, hazel and the rest).
The catalogue and `forest_affinity` still speak of `pinar` and `otro`: those are the *groups*
(`GROUPS`) and stand for all their classes. Pure functions, no I/O.

An MCSC-4 level-5 code is a base (`bph` = pi blanc) plus an optional canopy cover suffix (`20`
= at least 20 %, `5` = 5-20 %) or a variant letter (`f` protection strip, `p` plantation, `r`
regeneration). The 5-20 % stands count half. Everything that is not a forest (scrub, crops,
meadows, urban, water, ...) has no class.
"""
from __future__ import annotations

import re
from collections.abc import Collection, Iterable, Mapping

CLASSES = (
    "pinar_carrasco", "pinar_silvestre", "pinar_pinassa", "pinar_negro", "pinar_otros",
    "encinar", "hayedo", "robledal",
    "castanar", "ribera", "caducifolio_otro",
)

# Groups of classes the catalogue and `forest_affinity` can name as a whole: a weight on the
# group counts for every class of it that has no weight of its own.
GROUPS: dict[str, tuple[str, ...]] = {
    "pinar": CLASSES[:5],
    "otro": CLASSES[8:],
}
GROUP_OF: dict[str, str] = {c: g for g, members in GROUPS.items() for c in members}

_BASES: dict[str, str] = {
    "bph": "pinar_carrasco",
    "bps": "pinar_silvestre",
    "bpn": "pinar_pinassa",
    "bpu": "pinar_negro",
    **dict.fromkeys(("bpp", "bpm", "baa", "bcon"), "pinar_otros"),
    **dict.fromkeys(("bqi", "bqs", "barb", "bap"), "encinar"),
    "bfs": "hayedo",
    **dict.fromkeys(("bqh", "bqf", "bqp", "bqr", "bqc", "bqpy"), "robledal"),
    "bcs": "castanar",
    "bribc": "ribera",
    **dict.fromkeys(("bcad", "bfe", "bbp", "bca"), "caducifolio_otro"),
}
_VARIANTS = "fpr"
_COVER = re.compile(r"^(?P<base>[a-z]+?)(?P<cover>20|5)?$")
SPARSE_WEIGHT = 0.5

# Catalogue forest types (species.forest_types) that fit each class. "mixto" fits any forest;
# the other broadleaves fit the two broadleaf types, as the point's macrotype rule does.
_PINE_FITS = frozenset({"pinar", "mixto"})
_OTHER_BROADLEAF_FITS = frozenset({"robledal", "hayedo", "mixto"})
_FITS: dict[str, frozenset[str]] = {
    **dict.fromkeys(GROUPS["pinar"], _PINE_FITS),
    "encinar": frozenset({"encinar", "mixto"}),
    "hayedo": frozenset({"hayedo", "mixto"}),
    "robledal": frozenset({"robledal", "mixto"}),
    **dict.fromkeys(GROUPS["otro"], _OTHER_BROADLEAF_FITS),
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


def clean_affinity(
    affinity: Mapping[str, object] | Iterable[tuple[str, object]] | None,
) -> dict[str, float]:
    """The usable part of a species' `forest_affinity`: known classes with a weight over 0
    (clamped to 1), in `CLASSES` order. Anything else is dropped. A weight on a group (`pinar`,
    `otro`) stands for each of its classes that has no number of its own; a class with its own
    weight, even 0, keeps it."""
    try:
        items = dict(affinity or ())
    except (TypeError, ValueError):
        return {}

    def number(key: str) -> float | None:
        w = items.get(key)
        return None if isinstance(w, bool) or not isinstance(w, int | float) else float(w)

    out: dict[str, float] = {}
    for cls in CLASSES:
        w = number(cls)
        if w is None and cls in GROUP_OF:
            w = number(GROUP_OF[cls])
        if w is not None and w > 0:
            out[cls] = min(1.0, w)
    return out


def class_weights_for(
    forest_types: Collection[str] | None,
    affinity: Mapping[str, object] | Iterable[tuple[str, object]] | None = None,
) -> dict[str, float] | None:
    """How much each forest class counts for a species, 0-1, in `CLASSES` order.

    With a `forest_affinity` (how well it fruits under each class) those are the weights, and
    they replace what the forest types say. Without one (or with nothing usable in it) every
    class the types fit weighs 1, as it always did. None = the forest cannot judge it (no
    forest type, or only meadow, garden or riparian types, which no land cover tells): no filter.
    """
    if (weights := clean_affinity(affinity)):
        return weights
    types = set(forest_types or ())
    if not types & _JUDGED:
        return None
    return {c: 1.0 for c in CLASSES if _FITS[c] & types}


def classes_for(
    forest_types: Collection[str] | None,
    affinity: Mapping[str, object] | Iterable[tuple[str, object]] | None = None,
) -> list[str] | None:
    """Classes a species fits, in `CLASSES` order (see `class_weights_for`). None = the forest
    cannot judge it: no filter."""
    weights = class_weights_for(forest_types, affinity)
    return None if weights is None else list(weights)
