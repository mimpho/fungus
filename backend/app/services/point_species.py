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
from app.services.point_habitat import MIN_FACTOR, Habitat, forest_fit, soil_fit
from app.services.point_series import prepare_climate
from app.services.scoring_v2 import (
    FROST_NEED_DAYS,
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
# The catalogue says «excelente» (its tests and older code «excellent»)
EXCELLENT = frozenset({"excelente", "excellent"})
SOIL_OK = 0.5  # soil factor from which the soil counts as one the species fits


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
    # Soil pH range of the catalogue (extra_data.ph_suelo_min / _max); None = not known
    ph_min: float | None = None
    ph_max: float | None = None
    # What the species asks of the weather besides temperature (extra_data); see scoring_v2
    humidity_min_pct: float | None = None
    humidity_opt_pct: float | None = None
    needs_frost: bool = False
    needs_shock: bool = False

    @classmethod
    def from_row(cls, row: Any) -> "SpeciesRecord":
        def num(name):
            v = getattr(row, name, None)
            return None if v is None else float(v)

        extra = getattr(row, "extra_data", None) or {}

        def flag(key):
            return isinstance(extra, dict) and extra.get(key) is True

        def ph(key):
            v = extra.get(key) if isinstance(extra, dict) else None
            return float(v) if isinstance(v, int | float) else None

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
            ph_min=ph("ph_suelo_min"),
            ph_max=ph("ph_suelo_max"),
            humidity_min_pct=ph("humedad_min"),
            humidity_opt_pct=ph("humedad_optima"),
            needs_frost=flag("requiere_helada"),
            needs_shock=flag("requiere_choque_termico"),
        )

    @property
    def params(self) -> SpeciesParams | None:
        """Thermal parameters for v2; None (generic model) if the catalogue lacks them."""
        if None in (self.temp_min_c, self.temp_opt_c, self.temp_max_c):
            return None
        return SpeciesParams(
            self.temp_min_c, self.temp_opt_c, self.temp_max_c, self.fruiting_months,
            self.humidity_min_pct, self.humidity_opt_pct, self.needs_frost, self.needs_shock,
        )


def grade(score: int) -> str:
    return next(name for floor, name in GRADES if score >= floor)


def fit_parts(
    sp: SpeciesRecord, elevation_m: float | None, habitat: Habitat | None
) -> tuple[tuple[str, float], ...]:
    """How well one point suits the species: altitude, forest and soil, each 0-1 (1 = no
    objection or not known). Their product is what species_for_point multiplies the score by."""
    band = zone_band(None if elevation_m is None else round(elevation_m), None, None)
    alt = altitude_fit(band, sp.elevation_min_m, sp.elevation_max_m)
    forest = forest_fit(sp.forest_types, habitat.forest if habitat else None)
    soil = soil_fit(sp.ph_min, sp.ph_max, habitat.soil if habitat else None)
    return (
        ("altitude", round(alt.score_factor, 3) if alt.compatible else 0.0),
        ("forest", forest["factor"] if forest else 1.0),
        ("soil", soil["factor"] if soil else 1.0),
    )


# ── Conditions ────────────────────────────────────────────────────────────────

def _cond(status: str, **values) -> dict:
    return {"status": status, "values": values}


def _forest(sp: SpeciesRecord, forest_types: Collection[str] | None) -> dict:
    if forest_types is None:
        return _cond("pending", species=list(sp.forest_types))
    if not sp.forest_types or set(sp.forest_types) & set(forest_types):
        return _cond("met", species=list(sp.forest_types), point=sorted(forest_types))
    return _cond("not_met", species=list(sp.forest_types), point=sorted(forest_types))


def _forest_shares(fit: dict, sp: SpeciesRecord, shares: dict[str, float]) -> dict:
    """Forest condition from the shares of the MCSC-4 raster: met while some of the forest fits."""
    return _cond(
        "met" if fit["factor"] > 0 else "not_met",
        species=list(sp.forest_types), classes=fit["classes"], share=fit["share"],
        factor=fit["factor"], shares=shares,
    )


def _soil(fit: dict | None, shares: dict[str, float] | None) -> dict:
    if fit is None:
        return _cond("pending", shares=shares)
    return _cond(
        "met" if fit["factor"] >= SOIL_OK else "not_met",
        ph_min=fit["ph_min"], ph_max=fit["ph_max"], factor=fit["factor"], shares=shares,
    )


def _weather_needs(sp: SpeciesRecord, result) -> dict:
    """Conditions the species asks of the weather beyond temperature and rain; only those it has."""
    out = {}
    if sp.needs_frost:
        out["frost"] = _cond("met" if result.frost_30d else "not_met", days=FROST_NEED_DAYS)
    if sp.needs_shock:
        out["shock"] = _cond("met" if result.shock_recent else "not_met")
    if sp.humidity_min_pct is not None:
        mean = round(result.humidity_7d_pct, 1)
        out["humidity"] = _cond(
            "met" if mean >= sp.humidity_min_pct else "not_met",
            mean_7d_pct=mean, min_pct=sp.humidity_min_pct, opt_pct=sp.humidity_opt_pct,
        )
    return out


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
    habitat: Habitat | None = None,
) -> dict | None:
    """Compatible species on a date with score, grade, conditions and best window.

    `forest_types`: forest types around the point, or None while they are not known (the forest
    condition is then "pending" and nobody is excluded by forest).
    `habitat`: the forest and soil shares around the point (see point_habitat). With forest shares
    the forest condition is judged on them instead of `forest_types` (which then only judges the
    species the forest cannot: meadow, garden, riparian); with soil shares the soil is a condition
    too. Both multiply the score, as in the probability layer."""
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
        forest_hit = forest_fit(sp.forest_types, habitat.forest if habitat else None)
        forest = (_forest_shares(forest_hit, sp, habitat.forest) if forest_hit
                  else _forest(sp, forest_types))
        soil_hit = soil_fit(sp.ph_min, sp.ph_max, habitat.soil if habitat else None)
        forest_factor = forest_hit["factor"] if forest_hit else 1.0
        soil_factor = soil_hit["factor"] if soil_hit else 1.0
        if (not fit.compatible or forest["status"] == "not_met"
                or forest_factor * soil_factor < MIN_FACTOR):
            continue
        if sp.fruiting_months and ref.month not in sp.fruiting_months:
            continue
        series = compute_v2_series(window, elevation, sp.params, output_from=ref)
        if not series or series[-1].date != ref:
            continue
        result = series[-1]
        score = min(100, round_half_up(
            result.score * fit.score_factor * forest_factor * soil_factor))
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
                "habitat": {"forest_factor": forest_factor, "soil_factor": soil_factor},
                "conditions": {
                    "forest": forest,
                    "soil": _soil(soil_hit, habitat.soil if habitat else None),
                    "altitude": _cond("not_met" if fit.fit is Fit.LIMIT else "met",
                                      fit=fit.fit.value),
                    "season": _cond("met", months=list(sp.fruiting_months)),
                    "temperature": _temperature(sp, upto),
                    "rain": _rain(sp, upto, result.pending_rains),
                    "cycle": _cycle(sp, upto, ref),
                    **_weather_needs(sp, result),
                },
                "window": best_window(result.pending_rains, sp.fruiting_months),
            }
        )

    items.sort(key=lambda i: (not i["followed"], -i["score"], i["scientific_name"]))
    excellent = sorted((i for i in items if i["edibility"] in EXCELLENT),
                       key=lambda i: (-i["score"], i["scientific_name"]))
    return {
        "date": ref.isoformat(),
        "last_data_date": last.isoformat(),
        "clamped": bool(on and on > last),
        "species": items,
        "excellent": excellent,
    }
