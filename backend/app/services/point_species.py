"""
Species for a point and a date: which ones fit, how likely they are and why.

Pure functions. A species is listed only if it fits the point's altitude (with the 150 m margin
of altitude_fit), is in its fruiting month and, when the forest around the point is known,
shares one of its forest types. Its score is the v2 index with the species' own thermal range.
The backend returns codes and values; the front writes the sentences.
"""
import calendar
from collections.abc import Collection, Sequence
from dataclasses import dataclass
from datetime import date, timedelta
from typing import Any

from app.services.altitude_fit import Fit, altitude_fit, zone_band
from app.services.point_series import prepare_climate
from app.services.scoring_v2 import (
    ClimateDay,
    PendingRain,
    SpeciesParams,
    compute_v2_series,
    round_half_up,
)
from app.services.zone_scores import V2_WINDOW_DAYS

GRADES = ((70, "probable"), (55, "possible"), (25, "early"), (0, "unlikely"))
WINDOW_AFTER_PEAK_DAYS = 7
SIGNIFICANT_RAIN_MM = 10.0
RAIN_LOOKBACK_DAYS = 21
CYCLE_LOOKBACK_DAYS = 60
TEMP_DAYS = 7


@dataclass(frozen=True)
class SpeciesRecord:
    """The catalogue fields this module needs, as plain numbers (ORM rows hold Decimals)."""

    id: str
    scientific_name: str
    edibility: str
    temp_min_c: float | None
    temp_opt_c: float | None
    temp_max_c: float | None
    rain_min_mm: float | None
    rain_opt_mm: float | None
    cycle_days: int | None
    forest_types: tuple[str, ...]
    fruiting_months: tuple[int, ...]
    elevation_min_m: int | None
    elevation_max_m: int | None

    @classmethod
    def from_row(cls, row: Any) -> "SpeciesRecord":
        def num(name):
            v = getattr(row, name, None)
            return None if v is None else float(v)

        return cls(
            id=row.id,
            scientific_name=row.scientific_name,
            edibility=row.edibility,
            temp_min_c=num("temp_min_c"),
            temp_opt_c=num("temp_opt_c"),
            temp_max_c=num("temp_max_c"),
            rain_min_mm=num("rain_min_mm"),
            rain_opt_mm=num("rain_opt_mm"),
            cycle_days=getattr(row, "cycle_days", None),
            forest_types=tuple(getattr(row, "forest_types", None) or ()),
            fruiting_months=tuple(getattr(row, "fruiting_months", None) or ()),
            elevation_min_m=getattr(row, "elevation_min_m", None),
            elevation_max_m=getattr(row, "elevation_max_m", None),
        )

    @property
    def params(self) -> SpeciesParams | None:
        """Thermal parameters for v2; None (generic model) if the catalogue lacks them."""
        if None in (self.temp_min_c, self.temp_opt_c, self.temp_max_c):
            return None
        return SpeciesParams(
            self.temp_min_c, self.temp_opt_c, self.temp_max_c, self.fruiting_months
        )


def grade(score: int) -> str:
    return next(name for floor, name in GRADES if score >= floor)


# ── Conditions ────────────────────────────────────────────────────────────────

def _cond(status: str, **values) -> dict:
    return {"status": status, "values": values}


def _forest(sp: SpeciesRecord, forest_types: Collection[str] | None) -> dict:
    if forest_types is None:
        return _cond("pending", species=list(sp.forest_types))
    if not sp.forest_types or set(sp.forest_types) & set(forest_types):
        return _cond("met", species=list(sp.forest_types), point=sorted(forest_types))
    return _cond("not_met", species=list(sp.forest_types), point=sorted(forest_types))


def _temperature(sp: SpeciesRecord, days: Sequence[ClimateDay]) -> dict:
    last = days[-TEMP_DAYS:]
    mean = round(sum(d.temp_avg_c for d in last) / len(last), 1)
    values = {"mean_7d_c": mean, "min_c": sp.temp_min_c, "opt_c": sp.temp_opt_c,
              "max_c": sp.temp_max_c}
    if sp.temp_min_c is None or sp.temp_max_c is None:
        return _cond("pending", **values)
    return _cond("met" if sp.temp_min_c <= mean <= sp.temp_max_c else "not_met", **values)


def _rain(sp: SpeciesRecord, days: Sequence[ClimateDay], pending: Sequence[PendingRain]) -> dict:
    total = round(sum(d.precipitation_mm for d in days[-RAIN_LOOKBACK_DAYS:]), 1)
    values = {"total_21d_mm": total, "min_mm": sp.rain_min_mm, "opt_mm": sp.rain_opt_mm,
              "reached_opt": sp.rain_opt_mm is not None and total >= sp.rain_opt_mm}
    if sp.rain_min_mm is None:
        return _cond("pending", **values)
    if total >= sp.rain_min_mm:
        return _cond("met", **values)
    return _cond("pending" if pending else "not_met", **values)


def _cycle(sp: SpeciesRecord, days: Sequence[ClimateDay], ref: date) -> dict:
    wet = [d for d in days[-CYCLE_LOOKBACK_DAYS:] if d.precipitation_mm >= SIGNIFICANT_RAIN_MM]
    if sp.cycle_days is None:
        return _cond("pending")
    if not wet:
        return _cond("not_met", cycle_days=sp.cycle_days, rain_date=None)
    rain_day = wet[-1].date
    since = (ref - rain_day).days
    return _cond(
        "met" if since >= sp.cycle_days else "pending",
        cycle_days=sp.cycle_days, rain_date=rain_day, days_since_rain=since,
        expected_date=rain_day + timedelta(days=sp.cycle_days),
    )


# ── Best window ───────────────────────────────────────────────────────────────

def best_window(pending: Sequence[PendingRain], months: Collection[int]) -> dict | None:
    """From when the biggest pending rain starts to show to its peak + 7 days, cut at the end
    of the species' fruiting months. None without pending rain."""
    if not pending:
        return None
    rain = max(pending, key=lambda p: p.total_mm)
    start, end = rain.shows_from, rain.peak + timedelta(days=WINDOW_AFTER_PEAK_DAYS)
    if months and start.month not in months:
        return {"from": start, "to": None, "status": "season_ends_before_start"}
    if months:
        day = start
        while day < end and (day + timedelta(days=1)).month in months:
            day += timedelta(days=1)
        if day < end:
            last = calendar.monthrange(day.year, day.month)[1]
            return {"from": start, "to": date(day.year, day.month, last),
                    "status": "cut_by_season"}
    return {"from": start, "to": end, "status": "open"}


# ── The list ──────────────────────────────────────────────────────────────────

def species_for_point(
    rows: Sequence[Any],
    today: date,
    cell_elevation_m: float | None,
    point_elevation_m: float | None,
    catalogue: Sequence[SpeciesRecord],
    on: date | None = None,
    forest_types: Collection[str] | None = None,
    followed: Collection[str] = frozenset(),
) -> dict | None:
    """Compatible species on a date with score, grade, conditions and best window.

    `forest_types`: forest types around the point, or None while they are not known (the forest
    condition is then "pending" and nobody is excluded by forest)."""
    prepared = prepare_climate(rows, today, cell_elevation_m, point_elevation_m)
    if prepared is None:
        return None
    corrected, elevation = prepared
    last = corrected[-1].date
    ref = min(on, last) if on else last
    upto = [d for d in corrected if d.date <= ref]
    window = [d for d in upto if d.date >= ref - timedelta(days=V2_WINDOW_DAYS)]
    band = zone_band(None if elevation is None else round(elevation), None, None)

    items = []
    for sp in catalogue:
        fit = altitude_fit(band, sp.elevation_min_m, sp.elevation_max_m)
        forest = _forest(sp, forest_types)
        if not fit.compatible or forest["status"] == "not_met":
            continue
        if sp.fruiting_months and ref.month not in sp.fruiting_months:
            continue
        series = compute_v2_series(window, elevation, sp.params, output_from=ref)
        if not series or series[-1].date != ref:
            continue
        result = series[-1]
        score = min(100, round_half_up(result.score * fit.score_factor))
        items.append(
            {
                "id": sp.id,
                "scientific_name": sp.scientific_name,
                "edibility": sp.edibility,
                "followed": sp.id in followed,
                "score": score,
                "grade": grade(score),
                "limiting_factor": result.limiting_factor,
                "warm": result.warm,
                "altitude": {"fit": fit.fit.value, "look_from_m": fit.look_from_m,
                             "look_to_m": fit.look_to_m, "species_min_m": sp.elevation_min_m,
                             "species_max_m": sp.elevation_max_m},
                "conditions": {
                    "forest": forest,
                    "altitude": _cond("not_met" if fit.fit is Fit.LIMIT else "met",
                                      fit=fit.fit.value),
                    "season": _cond("met", months=list(sp.fruiting_months)),
                    "temperature": _temperature(sp, upto),
                    "rain": _rain(sp, upto, result.pending_rains),
                    "cycle": _cycle(sp, upto, ref),
                },
                "window": best_window(result.pending_rains, sp.fruiting_months),
            }
        )

    items.sort(key=lambda i: (not i["followed"], -i["score"], i["scientific_name"]))
    excellent = sorted((i for i in items if i["edibility"] == "excellent"),
                       key=lambda i: (-i["score"], i["scientific_name"]))
    return {
        "date": ref.isoformat(),
        "last_data_date": last.isoformat(),
        "clamped": bool(on and on > last),
        "species": items,
        "excellent": excellent,
    }
