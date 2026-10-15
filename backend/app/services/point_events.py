"""
Events of a series window and conditions of a snapshot, for the point endpoints.

Pure functions. The backend returns codes and values; the front writes the sentences
(ES/CA/EN). Principle (2026-10-10): the number is never left alone, every condition that pushes
it up or down comes with a reason and, when it helps, a hint of where to look.
"""
from collections.abc import Sequence
from datetime import date, timedelta

from app.services.scoring_v2 import (
    GENERIC_TEMP_OPT_C,
    SEASON_BANDS,
    ClimateDay,
    SpeciesParams,
    V2Result,
    season_band,
)

# ── Series events ─────────────────────────────────────────────────────────────

TRIGGER_DAY_MM = 10.0  # a rain run: consecutive days of at least this…
TRIGGER_TOTAL_MM = 20.0  # …adding up to at least this, is a trigger
TRIGGER_LAG_DAYS = 21  # a trigger is expected to show about 21 days later
TRIGGER_DROP_C = 8.0  # the maximum fell this much around the rain
BRAKE_DRY_PCT = 55.0  # humidity below this…
BRAKE_DRY_MIN_DAYS = 3  # …for this many days in a row is a brake

_ORDER = {"trigger": 0, "brake_dry": 1, "brake_frost": 2}


def _runs(days: list[ClimateDay], keep) -> list[list[ClimateDay]]:
    """Maximal runs of consecutive calendar days that satisfy `keep`."""
    out: list[list[ClimateDay]] = []
    for d in days:
        if not keep(d):
            continue
        if out and (d.date - out[-1][-1].date).days == 1:
            out[-1].append(d)
        else:
            out.append([d])
    return out


def _temp_drop_c(run: list[ClimateDay], by_date: dict[date, ClimateDay]) -> float | None:
    """How far the maximum fell from the two days before the rain, up to 3 days after it."""
    first, last = run[0].date, run[-1].date
    before = [by_date[x].temp_max_c for x in (first - timedelta(days=1), first - timedelta(days=2))
              if x in by_date]
    after = [by_date[x].temp_max_c for x in (first + timedelta(days=i)
                                              for i in range((last - first).days + 4))
             if x in by_date]
    if not before or not after:
        return None
    return round(max(before) - min(after), 1)


def find_events(
    by_date: dict[date, ClimateDay], start: date, end: date
) -> tuple[list[dict], dict | None]:
    """Triggers, brakes and frosts inside [start, end], numbered in date order, plus the lowest
    minimum of the window. `by_date` may hold earlier days (used for the temperature drop)."""
    window = [by_date[x] for x in sorted(by_date) if start <= x <= end]
    events: list[dict] = []

    for run in _runs(window, lambda d: d.precipitation_mm >= TRIGGER_DAY_MM):
        total = sum(d.precipitation_mm for d in run)
        if total < TRIGGER_TOTAL_MM:
            continue
        drop = _temp_drop_c(run, by_date)
        events.append(
            {
                "type": "trigger",
                "start": run[0].date,
                "end": run[-1].date,
                "total_mm": round(total, 1),
                "expected_date": run[-1].date + timedelta(days=TRIGGER_LAG_DAYS),
                "temp_drop_c": drop,
                "temp_drop": drop is not None and drop >= TRIGGER_DROP_C,
            }
        )
    for run in _runs(window, lambda d: d.humidity_pct < BRAKE_DRY_PCT):
        if len(run) >= BRAKE_DRY_MIN_DAYS:
            events.append(
                {
                    "type": "brake_dry",
                    "start": run[0].date,
                    "end": run[-1].date,
                    "days": len(run),
                    "min_humidity_pct": round(min(d.humidity_pct for d in run)),
                }
            )
    for d in window:
        if d.temp_min_c < 0:
            events.append(
                {"type": "brake_frost", "start": d.date, "end": d.date,
                 "temp_min_c": round(d.temp_min_c, 1)}
            )

    events.sort(key=lambda e: (e["start"], _ORDER[e["type"]]))
    for i, e in enumerate(events, 1):
        e["n"] = i
    lowest = min(window, key=lambda d: d.temp_min_c, default=None)
    return events, (
        None if lowest is None
        else {"date": lowest.date, "temp_min_c": round(lowest.temp_min_c, 1)}
    )


# ── Snapshot conditions ───────────────────────────────────────────────────────

DRY_SOIL_MOISTURE = 50
TEMPERATURE_LOW = 50
COLD_SOIL_C = 2.0
LATE_SEASON = 0.8
COLD_SNAP_DROP_C = 8.0
COLD_SNAP_MIN_C = 3.0
LOW_SCORE = 30
FROST_LOOKBACK_DAYS = 7

# What each limiting factor of the score is explained by (they go first, as negatives).
_LIMITS = {
    "moisture": {"dry_soil"},
    "temperature": {"too_warm", "too_cold", "cold_soil"},
    "drying": {"drying_wind"},
}


def _band_peak(elevation_m: float | None) -> tuple[int, float]:
    table = SEASON_BANDS[season_band(elevation_m)]
    month = max(table, key=table.get)
    return month, table[month]


def _past_peak(day: date, elevation_m: float | None) -> bool:
    month, _ = _band_peak(elevation_m)
    return day.month > month or (day.month == month and day.day >= 15)


def _cond(code: str, sign: str, values: dict | None = None, hint: str | None = None) -> dict:
    return {"code": code, "sign": sign, "values": values or {}, "hint": hint}


def build_conditions(
    result: V2Result,
    recent: Sequence[ClimateDay],
    elevation_m: float | None,
    species: SpeciesParams | None = None,
) -> list[dict]:
    """Every active condition behind the score, sorted: what limits most first, the other
    negatives next, positives last. `recent` = the latest days up to the scored one."""
    f, out = result.factors, []
    optimum = species.temp_opt_c if species else GENERIC_TEMP_OPT_C
    days = sorted(recent, key=lambda d: d.date)

    if result.pending_rains:
        biggest = max(result.pending_rains, key=lambda p: p.total_mm)
        out.append(_cond("rain_on_the_way", "+", {
            "runs": len(result.pending_rains), "total_mm": biggest.total_mm,
            "shows_from": biggest.shows_from, "peak": biggest.peak}, "rain_timing"))
    if result.warm:
        out.append(_cond("warm_zone", "+", hint="faster_response"))
    if f.shock > 1:
        out.append(_cond("temperature_drop", "+", hint="drop_after_rain"))

    if f.moisture < DRY_SOIL_MOISTURE:
        out.append(_cond("dry_soil", "-", {"moisture": f.moisture,
                         "soil_water_mm": round(result.soil_water_mm, 1)},
                         "shaded_valleys_near_water"))
    if f.drying < 1:
        out.append(_cond("drying_wind", "-", {"dry_days": result.dry_days,
                         "factor": round(f.drying, 2)}, "sheltered_from_wind"))
    if f.heat < 1:
        out.append(_cond("heat", "-", {"factor": round(f.heat, 2)}, "north_and_higher_under_trees"))
    if f.temperature < TEMPERATURE_LOW:
        warm_side = result.air_temp_20d_c > optimum
        out.append(_cond("too_warm" if warm_side else "too_cold", "-", {
            "air_temp_20d_c": round(result.air_temp_20d_c, 1), "optimum_c": optimum},
            "north_and_higher" if warm_side else "south_and_lower"))
    if result.soil_temp_7d_c < COLD_SOIL_C:
        out.append(_cond("cold_soil", "-", {"soil_temp_7d_c": round(result.soil_temp_7d_c, 1)},
                         "south_and_lower"))
    if f.frost < 1:
        frosts = [d for d in days[-FROST_LOOKBACK_DAYS:] if d.temp_min_c < 0]
        values = {"factor": round(f.frost, 2)}
        if frosts:
            coldest = min(frosts, key=lambda d: d.temp_min_c)
            values |= {"date": coldest.date, "temp_min_c": round(coldest.temp_min_c, 1)}
        out.append(_cond("frost", "-", values, "protected_under_trees"))
    elif len(days) >= 4:
        drop = max(days[-4].temp_max_c - days[-1].temp_max_c,
                   days[-4].temp_avg_c - days[-1].temp_avg_c)
        low = min(d.temp_min_c for d in days[-3:])
        if drop >= COLD_SNAP_DROP_C and low < COLD_SNAP_MIN_C:
            out.append(_cond("cold_snap", "-", {"drop_c": round(drop, 1),
                             "temp_min_c": round(low, 1)}, "low_and_sunny"))

    out_of_months = bool(species and species.months and result.date.month not in species.months)
    if out_of_months:
        out.append(_cond("out_of_season", "-", {"months": list(species.months)}, "species_months"))
    elif f.season < LATE_SEASON and _past_peak(result.date, elevation_m):
        out.append(_cond("late_season", "-", {"season": round(f.season, 2)}, "lower_altitude"))
    if result.estimated:
        out.append(_cond("estimated", "-"))

    limiting = _LIMITS.get(result.limiting_factor, set())

    def rank(c: dict) -> int:
        if c["sign"] == "+":
            return 2
        return 0 if c["code"] in limiting else 1

    return sorted(out, key=rank)  # sorted() is stable: ties keep the order above


def build_explanation(result: V2Result) -> str | None:
    """Code for the grey areas of the score (the front writes the sentence)."""
    if result.factors.activation == 0 and not result.pending_rains:
        return "weather_does_not_help"
    if result.score < LOW_SCORE and result.factors.activation > 0:
        return "low_but_possible_in_spots"
    return None
