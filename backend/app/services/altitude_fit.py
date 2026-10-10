"""
Does a species fit a zone by altitude?

The zone is a band (elevation_min_m – elevation_max_m, or its single point when the band is
not set) and so is the species (its catalogue range). Pure functions, no database.

- overlap → fits, and the hint says between which altitudes to look;
- the species only reaches the zone within a 150 m margin → "at the limit": shown, with its
  score × 0.85;
- further away → does not fit.

A species or zone without altitude data is never filtered out by altitude.
Decided in the Observatory design document (2026-10-09); tried in the prototype with Setcases.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum

LIMIT_MARGIN_M = 150
LIMIT_FACTOR = 0.85


class Fit(StrEnum):
    INSIDE = "inside"  # the species' range covers the whole zone
    PARTIAL = "partial"  # they overlap: look between look_from_m and look_to_m
    LIMIT = "limit"  # only within the margin
    OUTSIDE = "outside"
    UNKNOWN = "unknown"  # no altitude data on one side


@dataclass(frozen=True)
class AltitudeFit:
    fit: Fit
    look_from_m: int | None = None  # where zone and species overlap
    look_to_m: int | None = None

    @property
    def compatible(self) -> bool:
        return self.fit is not Fit.OUTSIDE

    @property
    def score_factor(self) -> float:
        return LIMIT_FACTOR if self.fit is Fit.LIMIT else 1.0


def zone_band(
    elevation_m: int | None, elevation_min_m: int | None, elevation_max_m: int | None
) -> tuple[int, int] | None:
    """The zone's altitude band; its point when the band is not set; None without data."""
    if elevation_min_m is not None and elevation_max_m is not None:
        return elevation_min_m, elevation_max_m
    if elevation_m is not None:
        return elevation_m, elevation_m
    return None


def altitude_fit(
    zone: tuple[int, int] | None, species_min_m: int | None, species_max_m: int | None
) -> AltitudeFit:
    if zone is None or (species_min_m is None and species_max_m is None):
        return AltitudeFit(Fit.UNKNOWN)
    z_lo, z_hi = zone
    s_lo = species_min_m if species_min_m is not None else -10_000
    s_hi = species_max_m if species_max_m is not None else 10_000
    lo, hi = max(z_lo, s_lo), min(z_hi, s_hi)
    if lo <= hi:
        fit = Fit.INSIDE if (lo, hi) == (z_lo, z_hi) else Fit.PARTIAL
        return AltitudeFit(fit, lo, hi)
    gap = lo - hi  # metres between the two bands
    if gap <= LIMIT_MARGIN_M:
        return AltitudeFit(Fit.LIMIT)
    return AltitudeFit(Fit.OUTSIDE)
