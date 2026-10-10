"""Scoring v2 (model 2.1): scenarios of `feat/observatory-scoring-v2` in memory/observatory-plan.md.

Reference values come from the Observatory prototype (`v2Series`) run on the same data as the
fixtures, which are an export of `climate_history` identical to the data embedded in it.
Pure functions: no database, no HTTP.
"""

import json
import math
from datetime import date, timedelta
from pathlib import Path

import pytest

from app.services.scoring_v2 import (
    MODEL_VERSION,
    ClimateDay,
    SpeciesParams,
    V2Factors,
    V2Result,
    _activation,
    _buckets,
    compute_oi_v2,
    compute_v2_series,
    fill_gaps,
    fruiting_curve,
    season_factor,
)

FIXTURES = Path(__file__).resolve().parents[1] / "fixtures" / "climate"
BALANCE_START = date(2026, 4, 1)  # the prototype starts the water balance on 1 April


def load_zone(zone_id: str) -> tuple[int, list[ClimateDay]]:
    doc = json.loads((FIXTURES / f"{zone_id}.json").read_text())
    days = [ClimateDay(date.fromisoformat(r[0]), *(float(v) for v in r[1:])) for r in doc["rows"]]
    return doc["elevation_m"], days


def v2_at(zone_id: str, ref: date, since: date = BALANCE_START, species=None) -> V2Result:
    el, days = load_zone(zone_id)
    result = compute_oi_v2([d for d in days if d.date >= since], ref, el, species)
    assert result is not None
    return result


# ── Synthetic data ────────────────────────────────────────────────────────────

START = date(2026, 6, 1)


def make_days(n: int, start: date = START, **values) -> list[ClimateDay]:
    """n mild, humid, rainless days; override any field with a constant."""
    base = dict(
        temp_max_c=18.0,
        temp_min_c=9.0,
        temp_avg_c=13.5,
        soil_temp_c=13.5,
        precipitation_mm=0.0,
        humidity_pct=80.0,
        wind_kmh=5.0,
    )
    base.update(values)
    return [ClimateDay(start + timedelta(days=i), **base) for i in range(n)]


def with_values(days: list[ClimateDay], index: int, **values) -> list[ClimateDay]:
    """Copy of days with some fields changed on one day (negative index from the end)."""
    out = list(days)
    d = out[index]
    out[index] = ClimateDay(**{**d.__dict__, **values})
    return out


def last(days: list[ClimateDay], elevation_m: float = 1000, species=None) -> V2Result:
    return compute_v2_series(days, elevation_m, species)[-1]


# ── Generic model: reference cases ────────────────────────────────────────────


@pytest.mark.parametrize(
    "zone_id, v2, a, h, t, s, warm",
    [
        ("zone-003", 49, 65, 100, 70, 0.96, True),
        ("zone-201", 7, 9, 92, 89, 0.72, False),
        ("zone-030", 16, 21, 100, 84, 0.72, True),
        ("zone-202", 20, 23, 100, 95, 0.72, True),
    ],
)
def test_reproduces_the_reference_cases_of_2026_10_06(zone_id, v2, a, h, t, s, warm):
    r = v2_at(zone_id, date(2026, 10, 6))
    f = r.factors
    assert abs(r.score - v2) <= 1
    assert abs(f.activation - a) <= 1
    assert abs(f.moisture - h) <= 1
    assert abs(f.temperature - t) <= 1
    assert f.season == pytest.approx(s, abs=0.006)
    assert (f.drying, f.heat, f.frost, f.shock) == (1.0, 1.0, 1.0, 1.1)
    assert r.warm is warm
    assert r.estimated is False


@pytest.mark.parametrize(
    "zone_id, v2", [("zone-003", 0), ("zone-201", 10), ("zone-030", 31), ("zone-202", 37)]
)
def test_reproduces_the_reference_cases_of_2026_09_20(zone_id, v2):
    assert abs(v2_at(zone_id, date(2026, 9, 20)).score - v2) <= 1


@pytest.mark.parametrize("zone_id", ["zone-003", "zone-201", "zone-030", "zone-202"])
def test_the_100_day_window_gives_the_same_result_as_the_1_april_warm_up(zone_id):
    """OQ-5: the ingest reads 100 days; the reference cases start the balance on 1 April."""
    el, days = load_zone(zone_id)
    full = {
        r.date: r.score
        for r in compute_v2_series(
            [d for d in days if d.date >= BALANCE_START], el, output_from=date(2026, 8, 1)
        )
    }
    for ref, expected in full.items():
        window = [d for d in days if ref - timedelta(days=100) <= d.date <= ref]
        r = compute_oi_v2(window, ref, el)
        assert abs(r.score - expected) <= 1, f"{zone_id} {ref}: {r.score} vs {expected}"


def test_every_result_carries_the_model_version():
    assert v2_at("zone-003", date(2026, 10, 6)).model_version == MODEL_VERSION == "2.1"


# ── Activation ────────────────────────────────────────────────────────────────


def test_recent_rain_does_not_score_in_a_cold_zone():
    days = with_values(make_days(80), -12, precipitation_mm=30.0)  # 11 days ago
    r = last(days)
    assert r.warm is False
    assert r.factors.activation == 0


def test_recent_rain_does_not_score_in_a_warm_zone():
    base = with_values(make_days(80), -22, precipitation_mm=40.0)  # makes the zone warm
    with_recent = with_values(base, -6, precipitation_mm=30.0)  # 5 days ago
    r_base, r_recent = last(base), last(with_recent)
    assert r_recent.warm is True
    assert r_recent.factors.activation == r_base.factors.activation


def test_the_fruiting_curve_peaks_on_day_21_cold_and_day_12_warm():
    assert fruiting_curve(21, warm=False) == 1
    assert fruiting_curve(12, warm=False) == 0
    assert fruiting_curve(35, warm=False) == pytest.approx(0)
    assert fruiting_curve(36, warm=False) == 0
    assert fruiting_curve(12, warm=True) == 1
    assert fruiting_curve(6, warm=True) == 0
    assert fruiting_curve(32, warm=True) == pytest.approx(0)
    assert fruiting_curve(5, warm=True) == 0


def test_rain_under_the_interception_threshold_counts_nothing():
    r = last(make_days(80, precipitation_mm=2.0))
    assert r.factors.activation == 0
    assert r.score == 0


def test_activation_is_capped_at_100():
    days = with_values(make_days(80, precipitation_mm=1.0), -22, precipitation_mm=200.0)
    assert last(days).factors.activation == 100


def test_rain_stops_counting_while_the_shaded_soil_is_dry():
    days = with_values(make_days(60), -22, precipitation_mm=22.0)  # 20 mm effective, lag 21
    k, e = len(days) - 1, len(days) - 22
    moist = [60.0] * len(days)
    half = [60.0 if e < i <= e + 10 else 0.0 for i in range(len(days))]  # 10 of 21 days moist
    act_moist, _ = _activation(days, moist)
    act_half, _ = _activation(days, half)
    assert act_moist[k] == pytest.approx(20 * 1 * 21 / 21 / 40 * 100)
    assert act_half[k] == pytest.approx(20 * 1 * 10 / 21 / 40 * 100)


def test_no_activation_means_no_score():
    r = last(make_days(80, humidity_pct=90.0))
    assert r.factors.activation == 0
    assert r.score == 0


def test_the_score_is_capped_at_100():
    days = make_days(140, start=date(2026, 6, 1), precipitation_mm=3.0, humidity_pct=100.0)
    days = with_values(days, -22, precipitation_mm=200.0, temp_max_c=11.0)
    days = with_values(days, -23, temp_max_c=20.0)
    days = with_values(days, -24, temp_max_c=20.0)
    r = last(days)
    assert r.date == date(2026, 10, 18)
    assert r.factors.shock == 1.1
    assert r.score == 100


# ── Soil water balance ────────────────────────────────────────────────────────


def test_soil_water_balance():
    days = make_days(3, temp_avg_c=0.0) + make_days(30, start=START + timedelta(days=3))
    sun, shade = _buckets(days)
    assert sun[0] == shade[0] == 18.0  # 30 % of 60, no evaporation at 0 °C
    assert (sun[2] - sun[3]) == pytest.approx(2 * (shade[2] - shade[3]))
    soaked = with_values(days, 10, precipitation_mm=500.0)
    sun, shade = _buckets(soaked)
    assert max(sun + shade) == 60.0
    assert min(sun + shade) >= 0.0
    r = compute_v2_series(soaked, 1000)[10]
    assert r.soil_water_mm == pytest.approx((sun[10] + shade[10]) / 2)
    assert r.factors.moisture == 100


# ── Season ────────────────────────────────────────────────────────────────────


@pytest.mark.parametrize(
    "elevation_m, s", [(980, 0.955), (1500, 0.72), (1499, 0.955), (899, 0.895)]
)
def test_season_by_altitude_on_2026_10_06(elevation_m, s):
    assert season_factor(date(2026, 10, 6), elevation_m) == pytest.approx(s)


def test_a_zone_without_elevation_uses_the_low_band():
    assert season_factor(date(2026, 10, 6), None) == season_factor(date(2026, 10, 6), 0)


# ── Temperature, drying, heat, frost, shock ───────────────────────────────────


def test_cold_soil_cancels_the_soil_part_of_temperature():
    r = last(make_days(60, soil_temp_c=1.0))  # air at the 13.5 °C optimum
    assert r.factors.temperature == 65


def test_drying():
    days = make_days(60)
    for i in (-1, -2, -4):
        days = with_values(days, i, humidity_pct=50.0)
    r = last(days)
    assert r.dry_days == 3
    assert r.factors.drying == pytest.approx(0.76)
    assert last(make_days(60, humidity_pct=50.0)).factors.drying == 0.6
    windy = last(make_days(60, humidity_pct=65.0, wind_kmh=25.0))
    assert windy.factors.drying == 0.6


def test_heat():
    days = make_days(60)
    for i in (-1, -3, -5, -7):
        days = with_values(days, i, temp_max_c=28.0)
    assert last(days).factors.heat == pytest.approx(0.64)
    assert last(make_days(60, temp_max_c=40.0)).factors.heat == 0.6


def test_frost_fades_in_about_5_days():
    days = make_days(60)
    today = with_values(days, -1, temp_min_c=-1.0)
    assert last(today).factors.frost == pytest.approx(0.75)
    assert last(today).frost_recent is True
    five_ago = with_values(days, -6, temp_min_c=-1.0)
    assert last(five_ago).factors.frost == pytest.approx(1 - 0.25 * math.exp(-2), abs=1e-9)
    assert last(five_ago).frost_recent is False
    hard = with_values(days, -1, temp_min_c=-3.0)
    assert last(hard).factors.frost == pytest.approx(0.6)
    both = with_values(today, -6, temp_min_c=-3.0)
    assert last(both).factors.frost == pytest.approx(0.75)


def test_temperature_drop_after_rain_is_a_bonus():
    def scenario(rain_mm: float, lag: int) -> float:
        days = make_days(80, temp_max_c=22.0)
        days = with_values(days, -1 - lag, precipitation_mm=rain_mm, temp_max_c=15.0)
        return last(days).factors.shock

    assert scenario(12.0, 10) == 1.1
    assert scenario(9.0, 10) == 1.0
    assert scenario(12.0, 30) == 1.0


# ── Rains on the way ──────────────────────────────────────────────────────────


def test_rains_on_the_way_la_molina_on_2026_10_06():
    r = v2_at("zone-201", date(2026, 10, 6))
    assert r.warm is False
    assert len(r.pending_rains) == 3
    biggest = max(r.pending_rains, key=lambda p: p.total_mm)
    assert (biggest.start, biggest.end) == (date(2026, 10, 3), date(2026, 10, 4))
    assert biggest.total_mm == pytest.approx(26.6)
    assert (biggest.shows_from, biggest.peak) == (date(2026, 10, 18), date(2026, 10, 25))


def test_rains_on_the_way_montseny_on_2026_10_06():
    r = v2_at("zone-003", date(2026, 10, 6))
    assert r.warm is True
    (dana,) = r.pending_rains
    assert (dana.start, dana.end) == (date(2026, 10, 2), date(2026, 10, 5))
    assert (dana.shows_from, dana.peak) == (date(2026, 10, 13), date(2026, 10, 17))


def test_a_rain_run_needs_5_mm_in_total():
    days = with_values(make_days(60), -3, precipitation_mm=2.0)
    days = with_values(days, -2, precipitation_mm=2.5)
    assert last(days).pending_rains == []


def test_a_run_still_going_on_is_cut_at_the_scored_day():
    days = with_values(make_days(60), -3, precipitation_mm=4.0)
    days = with_values(days, -2, precipitation_mm=4.0)
    days = with_values(days, -1, precipitation_mm=4.0)
    series = compute_v2_series(days, 1000)
    (run,) = series[-2].pending_rains
    assert run.end == days[-2].date
    assert run.total_mm == pytest.approx(8.0)


# ── Gaps and missing data ─────────────────────────────────────────────────────


def test_a_missing_day_is_filled_and_the_score_is_not_estimated():
    days = make_days(80)
    days = with_values(days, -11, temp_avg_c=10.0)
    days = with_values(days, -9, temp_avg_c=14.0, precipitation_mm=6.0)
    gapped = days[:-10] + days[-9:]
    filled = fill_gaps(gapped)
    assert len(filled) == 80
    hole = filled[-10]
    assert hole.filled is True
    assert hole.precipitation_mm == 0.0
    assert hole.temp_avg_c == pytest.approx(12.0)
    assert last(gapped).estimated is False


def test_4_missing_days_mark_the_score_as_estimated():
    days = make_days(80)
    assert last(days[:-10] + days[-7:]).estimated is False  # 3 missing
    assert last(days[:-10] + days[-6:]).estimated is True  # 4 missing


def test_short_history_marks_the_score_as_estimated():
    assert last(make_days(30)).estimated is True
    assert last(make_days(80)).estimated is False


def test_a_zone_without_rows_returns_no_result():
    assert compute_oi_v2([], date(2026, 10, 6), 1000) is None
    assert compute_v2_series([], 1000) == []


def test_a_date_without_a_row_returns_no_result():
    assert compute_oi_v2(make_days(60), START + timedelta(days=100), 1000) is None


def test_from_row_treats_a_row_with_nulls_as_a_gap():
    class Row:
        date = START
        temp_max_c, temp_min_c, temp_avg_c, soil_temp_c = 18, 9, 13.5, 13.5
        precipitation_mm, humidity_pct, wind_kmh = 0, 80, 5

    assert ClimateDay.from_row(Row()) == make_days(1)[0]
    Row.soil_temp_c = None
    assert ClimateDay.from_row(Row()) is None


# ── Limiting factor ───────────────────────────────────────────────────────────


def _result(activation, moisture, temperature, drying) -> V2Result:
    factors = V2Factors(activation, moisture, temperature, 1.0, drying, 1.0, 1.0, 1.0)
    return V2Result(START, 0, factors, False, 0, 0, 0, 0, False)


def test_the_limiting_factor_is_the_lowest_and_activation_wins_a_tie():
    assert _result(40, 90, 80, 1.0).limiting_factor == "activation"
    assert _result(90, 30, 80, 1.0).limiting_factor == "moisture"
    assert _result(90, 90, 20, 1.0).limiting_factor == "temperature"
    assert _result(90, 90, 80, 0.6).limiting_factor == "drying"
    assert _result(50, 50, 50, 0.5).limiting_factor == "activation"


# ── Per species ───────────────────────────────────────────────────────────────


def test_species_parameters_replace_the_generic_bell():
    days = make_days(60, temp_avg_c=21.0, soil_temp_c=22.0)
    species = SpeciesParams(temp_min_c=8, temp_opt_c=14, temp_max_c=20)
    # air: sigma 7, 1 sigma off; soil: sigma 8, 1 sigma off → both 100·e^-0.5
    assert last(days, species=species).factors.temperature == round(100 * math.exp(-0.5))
    # generic: optimum 13.5, sigma 4 (air) and 5.5 (soil)
    generic = 0.65 * 100 * math.exp(-0.5 * (7.5 / 4) ** 2) + 0.35 * 100 * math.exp(
        -0.5 * (8.5 / 5.5) ** 2
    )
    assert last(days).factors.temperature == round(generic)


def test_outside_the_species_months_the_season_counts_30_percent():
    days = make_days(60, start=date(2026, 6, 1))  # ends on 30 July
    species = SpeciesParams(8, 14, 20, months=(9, 10, 11))
    r = last(days, elevation_m=1000, species=species)
    assert r.factors.season == pytest.approx(season_factor(r.date, 1000) * 0.3)
    in_season = SpeciesParams(8, 14, 20, months=(7, 8))
    assert last(days, 1000, in_season).factors.season == pytest.approx(season_factor(r.date, 1000))


CEP = SpeciesParams(temp_min_c=12, temp_opt_c=15, temp_max_c=18, months=(8, 9, 10, 11))


@pytest.mark.parametrize(
    "ref, v2",
    [
        (date(2025, 9, 21), 58),
        (date(2025, 9, 22), 57),
        (date(2025, 9, 23), 37),
        (date(2025, 9, 24), 24),
        (date(2025, 9, 25), 23),
        (date(2025, 9, 28), 16),
    ],
)
def test_cep_in_setcases_frost_with_cold_soil_in_2025(ref, v2):
    """Falls progressively and never drops to 0."""
    r = v2_at("zone-030", ref, since=date(2025, 4, 1), species=CEP)
    assert abs(r.score - v2) <= 1
