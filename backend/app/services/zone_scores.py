"""
The zone score stored in scores_cache: which model is current and what is kept of each.

`score_oi` is always the score of the current model (CURRENT_MODEL); `model_version` says
which one; `score_detail` keeps every computed version under its own key, so a new model
never renames a column and the previous one stays available for comparison:

    score_detail = {"v1": {...}, "v2": {...}}

Pure functions: rows in, values out. The ingest reads the rows and writes the result.
"""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass
from datetime import date, timedelta
from typing import Any

from app.services import scoring_v2
from app.services.scoring import OIResult, compute_oi
from app.services.scoring_v2 import ClimateDay, V2Result

CURRENT_MODEL = "v2"
V1_WINDOW_DAYS = 21
V2_WINDOW_DAYS = 100  # measured on 2026-10-10: same scores as a 1 April warm-up


# ── v1 ────────────────────────────────────────────────────────────────────────


def v1_from_rows(rows: Sequence[Any], ref_date: date) -> OIResult | None:
    """Outbreak Index v1 from climate_history rows (any order), as the ingest always did.

    Uses the rows from ref_date − 21 days to ref_date, both included.
    """
    cutoff = ref_date - timedelta(days=V1_WINDOW_DAYS)
    window = sorted(
        (r for r in rows if cutoff <= r.date <= ref_date), key=lambda r: r.date, reverse=True
    )
    if not window:
        return None

    pa21_mm = sum(float(r.precipitation_mm or 0) for r in window)
    recent_7 = window[:7]
    temp_avg_7d = _avg([float(r.temp_avg_c) for r in recent_7 if r.temp_avg_c is not None])
    # Frost hours: rows with temp_min < 0 in the last 3 days × 12 (daily granularity)
    frost_hours = sum(
        12 for r in window[:3] if r.temp_min_c is not None and float(r.temp_min_c) < 0
    )
    # Days since the last significant rain (≥ 10 mm)
    days_since_rain = len(window)
    for i, r in enumerate(window):
        if float(r.precipitation_mm or 0) >= 10:
            days_since_rain = i
            break
    humidity_pct = _avg([r.humidity_pct for r in recent_7 if r.humidity_pct is not None])

    return compute_oi(
        reference_date=ref_date,
        pa21_mm=pa21_mm,
        temp_avg_7d=temp_avg_7d or 10.0,
        frost_hours_72h=frost_hours,
        days_since_rain=days_since_rain,
        humidity_pct=round(humidity_pct or 70),
    )


def v1_detail(oi: OIResult) -> dict:
    return {
        "score": oi.score,
        "pa21": oi.pa21,
        "thermal": oi.thermal,
        "seasonal": oi.seasonal,
        "ripening": oi.ripening,
        "humidity": oi.humidity,
        "pa21_mm": oi.pa21_mm,
        "days_since_rain": oi.days_since_rain,
    }


# ── v2 ────────────────────────────────────────────────────────────────────────


def v2_from_rows(rows: Sequence[Any], ref_date: date, elevation_m: float | None) -> V2Result | None:
    """Outbreak Index v2 on the last day with data up to ref_date, from 100 days of rows.

    climate_history runs one or two days behind (Open-Meteo archive lag), so the ingest's
    "today" usually has no row yet: v2 scores the latest day that has one, and says which.
    """
    days = [d for r in rows if r.date <= ref_date if (d := ClimateDay.from_row(r))]
    if not days:
        return None
    last = max(d.date for d in days)
    cutoff = last - timedelta(days=V2_WINDOW_DAYS)
    return scoring_v2.compute_oi_v2([d for d in days if d.date >= cutoff], last, elevation_m)


def v2_detail(r: V2Result) -> dict:
    """JSON-ready v2 result: score, factors, why, rains on the way."""
    f = r.factors
    return {
        "score": r.score,
        "date": r.date.isoformat(),  # the day scored: the last one with climate data
        "model_version": r.model_version,
        "factors": {
            "activation": f.activation,
            "moisture": f.moisture,
            "temperature": f.temperature,
            "season": round(f.season, 3),
            "drying": round(f.drying, 3),
            "heat": round(f.heat, 3),
            "frost": round(f.frost, 3),
            "shock": f.shock,
        },
        "limiting_factor": r.limiting_factor,
        "warm": r.warm,
        "soil_water_mm": round(r.soil_water_mm, 1),
        "air_temp_20d_c": round(r.air_temp_20d_c, 1),
        "soil_temp_7d_c": round(r.soil_temp_7d_c, 1),
        "dry_days": r.dry_days,
        "frost_recent": r.frost_recent,
        "estimated": r.estimated,
        "pending_rains": [
            {
                "start": p.start.isoformat(),
                "end": p.end.isoformat(),
                "total_mm": p.total_mm,
                "shows_from": p.shows_from.isoformat(),
                "peak": p.peak.isoformat(),
            }
            for p in r.pending_rains
        ],
    }


# ── The cache row ─────────────────────────────────────────────────────────────


@dataclass(frozen=True)
class ZoneScoreRow:
    score_oi: int
    model_version: str
    score_detail: dict


def build_score_row(
    rows: Sequence[Any], ref_date: date, elevation_m: float | None
) -> ZoneScoreRow | None:
    """What goes into scores_cache for a zone: the current model's score plus every version.

    If v2 cannot be computed the zone keeps a v1 score, flagged by model_version "1", so it
    never ends up without a score. v1 keeps its historical window (ref_date − 21 days to
    ref_date), so its numbers match what scores_cache always stored.
    """
    v1 = v1_from_rows(rows, ref_date)
    v2 = v2_from_rows(rows, ref_date, elevation_m)
    if v1 is None and v2 is None:
        return None
    detail: dict = {}
    if v1 is not None:
        detail["v1"] = v1_detail(v1)
    if v2 is not None:
        detail["v2"] = v2_detail(v2)
    if CURRENT_MODEL == "v2" and v2 is not None:
        return ZoneScoreRow(v2.score, v2.model_version, detail)
    assert v1 is not None
    return ZoneScoreRow(v1.score, "1", detail)


def _avg(values: list[float | int | None]) -> float | None:
    clean = [v for v in values if v is not None]
    return sum(clean) / len(clean) if clean else None
