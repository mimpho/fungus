"""
Outbreak Index v2 (model 2.1).

Pure functions, no database access. Port of `v2Series` from the Observatory prototype,
which is the reference implementation: for the same rows both must give the same numbers.
Spec: Observatory design document, section "Scoring v2: especificación para implementar".

    v2 = A · (0.5 + 0.5·H) · T · (0.4 + 0.6·S) · D · C · F · B

    A  activation (0–100): rain that is already producing mushrooms, through a fruiting
       curve that depends on whether the zone was already producing ("warm") or not ("cold")
    H  soil moisture (0–1): two 60 mm buckets, sunny and shaded slope
    T  temperature (0–1): 20-day air mean and 7-day soil mean against an optimum
    S  season (0–1): monthly curve by altitude band
    D  drying, C heat, F frost (0.6–1) and B temperature-drop bonus (1 or 1.1)

Factors multiply: without activation nothing else can compensate.
"""

from __future__ import annotations

import math
from collections.abc import Iterable, Sequence
from dataclasses import dataclass, field
from datetime import date, timedelta
from typing import Any

MODEL_VERSION = "2.1"

# ── Parameters (prototype constant V2) ────────────────────────────────────────

BUCKET_CAPACITY_MM = 60.0  # cap
BUCKET_START_FRACTION = 0.3  # buckets start at 30 % on the first row
EVAPORATION_RATE = 0.22  # et
WIND_DRYING_KMH = 25.0  # wind
SHADE_EVAPORATION_FACTOR = 0.5  # shaded slope evaporates half
SHADE_MOIST_FRACTION = 0.25  # surv: rain counts only while the shaded bucket is ≥ 25 %
INTERCEPTION_MM = 2.0  # intercept: discounted from each day's rain
ACTIVATION_FULL_MM = 40.0  # actFull: 40 weighted mm = activation 100
WARM_ACTIVATION = 35.0  # warmAct: activation ≥ 35 in the previous 21 days → warm zone
WARM_LOOKBACK_DAYS = 21
ACTIVATION_MIN_LAG = 6
ACTIVATION_MAX_LAG = 35

GENERIC_TEMP_OPT_C = 13.5
GENERIC_AIR_SIGMA = 4.0
GENERIC_SOIL_SIGMA = 5.5
AIR_TEMP_DAYS = 20
SOIL_TEMP_DAYS = 7
COLD_SOIL_C = 2.0  # soil below this cancels the soil part of T
AIR_WEIGHT = 0.65
SOIL_WEIGHT = 0.35

HEAT_DAYS = 10
HEAT_THRESHOLD_C = 25.0
HEAT_PER_DEGREE = 0.03

DRY_DAYS = 5
DRY_HUMIDITY_PCT = 55.0
WINDY_KMH = 20.0
WINDY_HUMIDITY_PCT = 70.0
DRY_PER_DAY = 0.08

FROST_DAYS = 7
FROST_PENALTY = 0.25
HARD_FROST_C = -2.0
HARD_FROST_PENALTY = 0.40
FROST_DECAY_DAYS = 2.5
FROST_RECENT_DAYS = 3

FACTOR_FLOOR = 0.6  # minimum of D, C and F

SHOCK_MIN_LAG = 7
SHOCK_MAX_LAG = 28
SHOCK_RAIN_MM = 10.0
SHOCK_DROP_C = 6.0
SHOCK_BONUS = 1.1

OUT_OF_MONTHS_SEASON = 0.3  # species outside its fruiting months

RAIN_RUN_DAY_MM = 2.0  # a "rain on the way" run: consecutive days ≥ 2 mm…
RAIN_RUN_TOTAL_MM = 5.0  # …adding up to ≥ 5 mm
PENDING_COLD = (12, 14, 21)  # (still pending if ended < N days ago, starts +N, peak +N)
PENDING_WARM = (6, 8, 12)

ESTIMATED_LOOKBACK_DAYS = 35  # filled days counted over the activation window
ESTIMATED_MAX_FILLED = 3  # more than 3 filled days → estimated
MIN_HISTORY_DAYS = ACTIVATION_MAX_LAG + WARM_LOOKBACK_DAYS  # less history → estimated

SUBALPINE_MIN_M = 1500
MOUNTAIN_MIN_M = 900
# Season curve by altitude band; months not listed count 0.05.
SEASON_BANDS: dict[str, dict[int, float]] = {
    "subalpine": {6: 0.1, 7: 0.35, 8: 0.8, 9: 1.0, 10: 0.6, 11: 0.25, 12: 0.1},
    "mountain": {6: 0.1, 7: 0.25, 8: 0.45, 9: 0.85, 10: 1.0, 11: 0.6, 12: 0.25},
    "low": {6: 0.05, 7: 0.1, 8: 0.3, 9: 0.65, 10: 1.0, 11: 0.95, 12: 0.55},
}
SEASON_DEFAULT = 0.05


# ── Data types ────────────────────────────────────────────────────────────────


@dataclass(frozen=True)
class ClimateDay:
    """One day of `climate_history` for a zone."""

    date: date
    temp_max_c: float
    temp_min_c: float
    temp_avg_c: float
    soil_temp_c: float
    precipitation_mm: float
    humidity_pct: float
    wind_kmh: float
    filled: bool = False  # True when the day was missing and has been filled

    @classmethod
    def from_row(cls, row: Any) -> ClimateDay | None:
        """Build from any object with `climate_history` attribute names (e.g. the ORM row).

        Returns None when a value the model needs is missing, so the day is treated as a gap.
        """
        values = [getattr(row, name, None) for name in _CLIMATE_FIELDS]
        if any(v is None for v in values) or getattr(row, "date", None) is None:
            return None
        return cls(row.date, *(float(v) for v in values))


_CLIMATE_FIELDS = (
    "temp_max_c",
    "temp_min_c",
    "temp_avg_c",
    "soil_temp_c",
    "precipitation_mm",
    "humidity_pct",
    "wind_kmh",
)


@dataclass(frozen=True)
class SpeciesParams:
    """Species thresholds from the catalogue (`species` table)."""

    temp_min_c: float
    temp_opt_c: float
    temp_max_c: float
    months: tuple[int, ...] = ()  # fruiting months; empty = no season restriction


@dataclass(frozen=True)
class PendingRain:
    """A recent rain run that does not count yet ("lluvias en camino")."""

    start: date  # first day of the run
    end: date  # last day of the run
    total_mm: float
    shows_from: date  # when it would start to show
    peak: date  # when it would peak


@dataclass(frozen=True)
class V2Factors:
    activation: int  # A, 0–100
    moisture: int  # H, 0–100
    temperature: int  # T, 0–100
    season: float  # S, 0–1 (after the species-month adjustment)
    drying: float  # D, 0.6–1
    heat: float  # C, 0.6–1
    frost: float  # F, 0.6–1
    shock: float  # B, 1 or 1.1


@dataclass(frozen=True)
class V2Result:
    date: date
    score: int
    factors: V2Factors
    warm: bool  # the zone produced recently and responds faster
    soil_water_mm: float  # mean of both buckets, out of 60
    air_temp_20d_c: float
    soil_temp_7d_c: float
    dry_days: int  # of the last 5
    frost_recent: bool  # a frost in the last 3 days
    pending_rains: list[PendingRain] = field(default_factory=list)
    estimated: bool = False
    model_version: str = MODEL_VERSION

    @property
    def limiting_factor(self) -> str:
        """The factor that limits the score most: activation, moisture, temperature or drying.

        Activation wins a tie, as in the prototype.
        """
        f = self.factors
        candidates = [
            ("activation", f.activation),
            ("moisture", f.moisture),
            ("temperature", f.temperature),
            ("drying", round_half_up(f.drying * 100)),
        ]
        best = candidates[0]
        for name, value in candidates[1:]:
            if value < best[1]:
                best = (name, value)
        return best[0]


# ── Small helpers ─────────────────────────────────────────────────────────────


def round_half_up(x: float) -> int:
    """JavaScript Math.round. Python's round() rounds half to even."""
    return math.floor(x + 0.5)


def fruiting_curve(days_since_rain: int, warm: bool) -> float:
    """Weight (0–1) of a rain `days_since_rain` days ago.

    Cold zone: 0 before day 12, peak on day 21, 0 from day 35.
    Warm zone: 0 before day 6, peak on day 12, 0 from day 32. Cosine transitions.
    """
    lag = days_since_rain
    if warm:
        if lag < 6:
            return 0.0
        if lag <= 12:
            return 0.5 - 0.5 * math.cos(math.pi * (lag - 6) / 6)
        if lag <= 32:
            return 0.5 + 0.5 * math.cos(math.pi * (lag - 12) / 20)
        return 0.0
    if lag < 12:
        return 0.0
    if lag <= 21:
        return 0.5 - 0.5 * math.cos(math.pi * (lag - 12) / 9)
    if lag <= 35:
        return 0.5 + 0.5 * math.cos(math.pi * (lag - 21) / 14)
    return 0.0


def bell(x: float, optimum: float, sigma: float) -> float:
    """Gaussian bell, 100 at the optimum."""
    return 100 * math.exp(-0.5 * ((x - optimum) / sigma) ** 2)


def season_band(elevation_m: float | None) -> str:
    el = elevation_m or 0
    if el >= SUBALPINE_MIN_M:
        return "subalpine"
    if el >= MOUNTAIN_MIN_M:
        return "mountain"
    return "low"


def season_factor(day: date, elevation_m: float | None) -> float:
    """S for a date: monthly curve of the altitude band, interpolated by day.

    The value of month m is reached on day 15; before it, it ramps from month m−1.
    Same quirks as the prototype (December ramps towards November after the 15th).
    """
    table = SEASON_BANDS[season_band(elevation_m)]
    m, d = day.month, day.day
    a = table.get(m, SEASON_DEFAULT)
    b = table.get(m + 1, table.get(m - 1, a))
    prev = table.get(m - 1, a)
    if d < 15:
        return prev + (a - prev) * (d + 15) / 30
    return a + (b - a) * (d - 15) / 30


def fill_gaps(days: Iterable[ClimateDay]) -> list[ClimateDay]:
    """Sort, drop duplicates and fill missing dates.

    A missing day gets 0 mm of rain and, for every other value, the mean of the nearest
    existing days before and after it (or the only one available). It is marked `filled`.
    """
    by_date: dict[date, ClimateDay] = {}
    for d in days:
        by_date[d.date] = d
    ordered = [by_date[k] for k in sorted(by_date)]
    if len(ordered) < 2:
        return ordered

    out: list[ClimateDay] = [ordered[0]]
    for nxt in ordered[1:]:
        prev = out[-1]
        gap = (nxt.date - prev.date).days
        for i in range(1, gap):
            out.append(
                ClimateDay(
                    date=prev.date + timedelta(days=i),
                    temp_max_c=(prev.temp_max_c + nxt.temp_max_c) / 2,
                    temp_min_c=(prev.temp_min_c + nxt.temp_min_c) / 2,
                    temp_avg_c=(prev.temp_avg_c + nxt.temp_avg_c) / 2,
                    soil_temp_c=(prev.soil_temp_c + nxt.soil_temp_c) / 2,
                    precipitation_mm=0.0,
                    humidity_pct=(prev.humidity_pct + nxt.humidity_pct) / 2,
                    wind_kmh=(prev.wind_kmh + nxt.wind_kmh) / 2,
                    filled=True,
                )
            )
        out.append(nxt)
    return out


# ── Model ─────────────────────────────────────────────────────────────────────


def _buckets(rows: Sequence[ClimateDay]) -> tuple[list[float], list[float]]:
    """Daily soil water (mm) in the sunny and the shaded bucket."""

    def run(factor: float) -> list[float]:
        level = BUCKET_CAPACITY_MM * BUCKET_START_FRACTION
        out = []
        for r in rows:
            et = (
                factor
                * EVAPORATION_RATE
                * max(0.0, r.temp_avg_c)
                * max(0.05, 1.15 - r.humidity_pct / 100)
                * (1 + r.wind_kmh / WIND_DRYING_KMH)
            )
            level = min(BUCKET_CAPACITY_MM, max(0.0, level - et) + r.precipitation_mm)
            out.append(level)
        return out

    return run(1.0), run(SHADE_EVAPORATION_FACTOR)


def _activation(
    rows: Sequence[ClimateDay], shade: Sequence[float]
) -> tuple[list[float], list[bool]]:
    """Activation (0–100) and warm state for every day."""
    n = len(rows)
    eff = [max(0.0, r.precipitation_mm - INTERCEPTION_MM) for r in rows]
    moist_threshold = BUCKET_CAPACITY_MM * SHADE_MOIST_FRACTION
    # moist_prefix[i] = number of days < i with the shaded bucket moist
    moist_prefix = [0] * (n + 1)
    for i, level in enumerate(shade):
        moist_prefix[i + 1] = moist_prefix[i] + (1 if level >= moist_threshold else 0)

    act = [0.0] * n
    warm = [False] * n
    for k in range(n):
        recent = act[max(0, k - WARM_LOOKBACK_DAYS) : k]
        warm[k] = bool(recent) and max(recent) >= WARM_ACTIVATION
        total = 0.0
        for lag in range(ACTIVATION_MIN_LAG, ACTIVATION_MAX_LAG + 1):
            e = k - lag
            if e < 0:
                break
            if not eff[e]:
                continue
            w = fruiting_curve(lag, warm[e])
            if not w:
                continue
            alive = moist_prefix[k + 1] - moist_prefix[e + 1]  # moist days in (e, k]
            total += eff[e] * w * (alive / lag)
        act[k] = min(100.0, total / ACTIVATION_FULL_MM * 100)
    return act, warm


def _rain_runs(rows: Sequence[ClimateDay]) -> list[tuple[int, int]]:
    """(first, last) index of every run of consecutive days with ≥ 2 mm."""
    runs = []
    k, n = 0, len(rows)
    while k < n:
        if rows[k].precipitation_mm >= RAIN_RUN_DAY_MM:
            j = k
            while j + 1 < n and rows[j + 1].precipitation_mm >= RAIN_RUN_DAY_MM:
                j += 1
            runs.append((k, j))
            k = j + 1
        else:
            k += 1
    return runs


def _pending_rains(
    rows: Sequence[ClimateDay], runs: Sequence[tuple[int, int]], k: int, warm: bool
) -> list[PendingRain]:
    """Rain runs seen from day k that do not count yet. A run still going on is cut at k."""
    still_pending, start_after, peak_after = PENDING_WARM if warm else PENDING_COLD
    out = []
    for first, last in runs:
        if first > k:
            break
        end = min(last, k)
        if k - end >= still_pending:
            continue
        total = sum(rows[x].precipitation_mm for x in range(first, end + 1))
        if total < RAIN_RUN_TOTAL_MM:
            continue
        end_date = rows[end].date
        out.append(
            PendingRain(
                start=rows[first].date,
                end=end_date,
                total_mm=round(total, 1),
                shows_from=end_date + timedelta(days=start_after),
                peak=end_date + timedelta(days=peak_after),
            )
        )
    return out


def _mean_back(values: Sequence[float], k: int, days: int) -> float:
    """Mean of values[k-days+1 .. k], using whatever history exists."""
    window = values[max(0, k - days + 1) : k + 1]
    return sum(window) / len(window)


def compute_v2_series(
    days: Iterable[ClimateDay],
    elevation_m: float | None,
    species: SpeciesParams | None = None,
    output_from: date | None = None,
) -> list[V2Result]:
    """v2 for every day from `output_from` (default: every day) to the last row.

    `days` should start well before `output_from`: the buckets and the warm state need
    history (see MIN_HISTORY_DAYS). Days with less history are marked `estimated`.
    """
    rows = fill_gaps(days)
    n = len(rows)
    if not n:
        return []

    sun, shade = _buckets(rows)
    act, warm = _activation(rows, shade)
    runs = _rain_runs(rows)

    if species is not None:
        t_opt = species.temp_opt_c
        spread = (species.temp_max_c - species.temp_min_c) / 2
        air_sigma, soil_sigma = spread + 1, spread + 2
    else:
        t_opt, air_sigma, soil_sigma = GENERIC_TEMP_OPT_C, GENERIC_AIR_SIGMA, GENERIC_SOIL_SIGMA

    tmax = [r.temp_max_c for r in rows]
    tavg = [r.temp_avg_c for r in rows]
    soil = [r.soil_temp_c for r in rows]
    filled_prefix = [0] * (n + 1)
    for i, r in enumerate(rows):
        filled_prefix[i + 1] = filled_prefix[i] + (1 if r.filled else 0)

    results = []
    for k in range(n):
        r = rows[k]
        if output_from is not None and r.date < output_from:
            continue

        water = (sun[k] + shade[k]) / 2
        moist = min(100.0, water / BUCKET_CAPACITY_MM * 100)

        soil_7d = _mean_back(soil, k, SOIL_TEMP_DAYS)
        air_20d = _mean_back(tavg, k, AIR_TEMP_DAYS)
        air_score = bell(air_20d, t_opt, air_sigma)
        soil_score = 0.0 if soil_7d < COLD_SOIL_C else bell(soil_7d, t_opt, soil_sigma)
        temp = AIR_WEIGHT * air_score + SOIL_WEIGHT * soil_score

        heat = sum(
            max(0.0, tmax[x] - HEAT_THRESHOLD_C) for x in range(max(0, k - HEAT_DAYS + 1), k + 1)
        )
        f_heat = max(FACTOR_FLOOR, 1 - HEAT_PER_DEGREE * heat)

        dry = 0
        for x in range(max(0, k - DRY_DAYS + 1), k + 1):
            h, w = rows[x].humidity_pct, rows[x].wind_kmh
            if h < DRY_HUMIDITY_PCT or (w >= WINDY_KMH and h < WINDY_HUMIDITY_PCT):
                dry += 1
        f_dry = max(FACTOR_FLOOR, 1 - DRY_PER_DAY * dry)

        f_frost, frost_recent = 1.0, False
        for i in range(min(FROST_DAYS, k + 1)):
            tmin = rows[k - i].temp_min_c
            if tmin < 0:
                frost_recent = frost_recent or i < FROST_RECENT_DAYS
                penalty = HARD_FROST_PENALTY if tmin < HARD_FROST_C else FROST_PENALTY
                f_frost = min(f_frost, 1 - penalty * math.exp(-i / FROST_DECAY_DAYS))

        shock = False
        for lag in range(SHOCK_MIN_LAG, SHOCK_MAX_LAG + 1):
            e = k - lag
            if e < 2 or rows[e].precipitation_mm < SHOCK_RAIN_MM:
                continue
            before = max(tmax[e - 1], tmax[e - 2])
            if any(before - tmax[x] >= SHOCK_DROP_C for x in range(e, min(e + 3, n - 1) + 1)):
                shock = True
                break
        f_shock = SHOCK_BONUS if shock else 1.0

        season = season_factor(r.date, elevation_m)
        if species is not None and species.months and r.date.month not in species.months:
            season *= OUT_OF_MONTHS_SEASON
        m = 0.4 + 0.6 * season

        raw = (
            act[k]
            * (0.5 + 0.5 * moist / 100)
            * (temp / 100)
            * m
            * f_dry
            * f_frost
            * f_heat
            * f_shock
        )
        score = min(100, round_half_up(raw))

        filled_recent = (
            filled_prefix[k + 1] - filled_prefix[max(0, k - ESTIMATED_LOOKBACK_DAYS + 1)]
        )
        estimated = filled_recent > ESTIMATED_MAX_FILLED or k < MIN_HISTORY_DAYS

        results.append(
            V2Result(
                date=r.date,
                score=score,
                factors=V2Factors(
                    activation=round_half_up(act[k]),
                    moisture=round_half_up(moist),
                    temperature=round_half_up(temp),
                    season=season,
                    drying=f_dry,
                    heat=f_heat,
                    frost=f_frost,
                    shock=f_shock,
                ),
                warm=warm[k],
                soil_water_mm=water,
                air_temp_20d_c=air_20d,
                soil_temp_7d_c=soil_7d,
                dry_days=dry,
                frost_recent=frost_recent,
                pending_rains=_pending_rains(rows, runs, k, warm[k]),
                estimated=estimated,
            )
        )
    return results


def compute_oi_v2(
    days: Iterable[ClimateDay],
    ref_date: date,
    elevation_m: float | None,
    species: SpeciesParams | None = None,
) -> V2Result | None:
    """v2 for one date, using the rows up to that date. None if there is no row for it."""
    rows = [d for d in days if d.date <= ref_date]
    series = compute_v2_series(rows, elevation_m, species, output_from=ref_date)
    if not series or series[-1].date != ref_date:
        return None
    return series[-1]
