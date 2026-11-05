"""Substrate classes of the probability layer: ICGC lithological groups -> three classes of soil
acidity, and how well a species' soil pH range fits each.

The ICGC map of lithological groups (1:250,000) gives every polygon its origin (LITO) and its
chemistry (QUIMISME: Q silicic, Si silicated, Ca carbonated, Do dolomite, Mx mixed, Su sulphates,
Cl chlorides, Pl plurilithic, Mo organic). From the chemistry we take the typical acidity of the
soils that form on it:

  acid        silicic / silicated rocks (granite, gneiss, slate, siliceous sandstone)
  mixed       mixed detrital rocks, plurilithic units, basic silicate rocks
  calcareous  carbonated rocks (limestone, dolomite, marl) and evaporites

The pH ranges are typical topsoil values for each class, not measurements: the map is 1:250,000.
Pure functions, no I/O.
"""
from __future__ import annotations

SUBSTRATE_CLASSES = ("acid", "mixed", "calcareous")
PH_RANGE = {"acid": (4.5, 5.8), "mixed": (5.8, 7.2), "calcareous": (7.0, 8.3)}
PH_TOLERANCE = 0.3  # the catalogue ranges are rough: a species may sit a bit beyond them

_ACID_ONLY = frozenset({"Q", "Si"})
_CALCAREOUS = frozenset({"Ca", "Do", "Su", "Cl"})


def substrate_class(chemistry: str) -> str | None:
    """Class of an ICGC `QUIMISME` value (e.g. "Q/Si", "Mx/Ca"), None for water and the like."""
    parts = {p.strip() for p in chemistry.replace("\\", "/").split("/") if p.strip()}
    if not parts:
        return None
    if parts & _CALCAREOUS:
        return "calcareous"
    if parts <= _ACID_ONLY and "Q" in parts:
        return "acid"
    return "mixed"  # silicated alone (basalt, gabbro), mixed detrital, plurilithic, organic


def ph_fit(ph_min: float | None, ph_max: float | None) -> list[float] | None:
    """For each class in `SUBSTRATE_CLASSES`, the share (0-1) of the class's typical pH range
    that the species' pH range covers (with a small tolerance). None if the range is not known."""
    if ph_min is None or ph_max is None or ph_max < ph_min:
        return None
    lo, hi = ph_min - PH_TOLERANCE, ph_max + PH_TOLERANCE
    out = []
    for name in SUBSTRATE_CLASSES:
        a, b = PH_RANGE[name]
        out.append(round(max(0.0, min(hi, b) - max(lo, a)) / (b - a), 3))
    return out
