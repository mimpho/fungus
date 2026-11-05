"""Series events and snapshot conditions (T5 of feat/observatory-api). Pure, no DB."""
from datetime import date, timedelta

import pytest

from app.services.point_events import build_conditions, build_explanation, find_events
from app.services.scoring_v2 import (
    ClimateDay,
    PendingRain,
    SpeciesParams,
    V2Factors,
    V2Result,
)

D0 = date(2026, 10, 1)


def _day(i=0, **kw) -> ClimateDay:
    base = dict(
        date=D0 + timedelta(days=i), temp_max_c=20.0, temp_min_c=8.0, temp_avg_c=14.0,
        soil_temp_c=13.0, precipitation_mm=0.0, humidity_pct=75.0, wind_kmh=10.0,
    )
    return ClimateDay(**{**base, **kw})


def _by_date(days):
    return {d.date: d for d in days}


def _events(days, start=None, end=None):
    start = start or days[0].date
    end = end or days[-1].date
    return find_events(_by_date(days), start, end)


# ── Events ────────────────────────────────────────────────────────────────────

class TestTriggers:
    def test_a_run_of_days_of_10_mm_totalling_20_is_a_trigger_expected_21_days_later(self):
        days = [_day(i) for i in range(10)]
        days[3] = _day(3, precipitation_mm=12.0)
        days[4] = _day(4, precipitation_mm=15.0)
        (event,), _ = _events(days)
        assert event["type"] == "trigger" and event["total_mm"] == 27.0
        assert event["start"] == D0 + timedelta(days=3)
        assert event["end"] == D0 + timedelta(days=4)
        assert event["expected_date"] == D0 + timedelta(days=4 + 21)

    def test_one_big_day_counts(self):
        days = [_day(i) for i in range(6)]
        days[2] = _day(2, precipitation_mm=25.0)
        (event,), _ = _events(days)
        assert event["total_mm"] == 25.0

    @pytest.mark.parametrize("rain", [[12.0], [10.0, 9.0], [19.9], [15.0, 0.0, 15.0]])
    def test_less_than_20_mm_in_a_run_of_10_mm_days_is_not_a_trigger(self, rain):
        days = [_day(i, precipitation_mm=rain[i] if i < len(rain) else 0.0) for i in range(8)]
        events, _ = _events(days)
        assert [e for e in events if e["type"] == "trigger"] == []

    def test_it_says_whether_the_maximum_dropped_8_degrees(self):
        days = [_day(i, temp_max_c=24.0) for i in range(10)]
        days[4] = _day(4, temp_max_c=15.0, precipitation_mm=30.0)
        (event,), _ = _events(days)
        assert event["temp_drop_c"] == 9.0 and event["temp_drop"] is True

    def test_a_smaller_drop_is_reported_but_not_flagged(self):
        days = [_day(i, temp_max_c=24.0) for i in range(10)]
        days[4] = _day(4, temp_max_c=20.0, precipitation_mm=30.0)
        (event,), _ = _events(days)
        assert event["temp_drop_c"] == 4.0 and event["temp_drop"] is False

    def test_the_drop_uses_days_before_the_window_when_they_exist(self):
        days = [_day(i, temp_max_c=24.0) for i in range(10)]
        days[1] = _day(1, temp_max_c=14.0, precipitation_mm=30.0)
        (event,), _ = _events(days, start=D0 + timedelta(days=1))
        assert event["temp_drop"] is True


class TestBrakes:
    def test_three_days_in_a_row_below_55_percent_humidity_is_a_brake(self):
        days = [_day(i) for i in range(8)]
        for i in (2, 3, 4):
            days[i] = _day(i, humidity_pct=48.0)
        (event,), _ = _events(days)
        assert event["type"] == "brake_dry" and event["days"] == 3
        assert event["min_humidity_pct"] == 48

    def test_two_days_or_a_broken_run_is_not(self):
        days = [_day(i) for i in range(8)]
        for i in (1, 2, 4, 5):
            days[i] = _day(i, humidity_pct=40.0)
        events, _ = _events(days)
        assert events == []

    def test_every_day_with_a_minimum_below_zero_is_a_frost_brake(self):
        days = [_day(i) for i in range(8)]
        days[2] = _day(2, temp_min_c=-1.5)
        days[5] = _day(5, temp_min_c=-3.0)
        events, _ = _events(days)
        assert [(e["type"], e["temp_min_c"]) for e in events] == [
            ("brake_frost", -1.5), ("brake_frost", -3.0)
        ]


class TestWindow:
    def test_events_come_numbered_in_date_order(self):
        days = [_day(i) for i in range(20)]
        days[2] = _day(2, temp_min_c=-1.0)
        days[6] = _day(6, precipitation_mm=30.0)
        for i in (9, 10, 11):
            days[i] = _day(i, humidity_pct=40.0)
        events, _ = _events(days)
        assert [(e["n"], e["type"]) for e in events] == [
            (1, "brake_frost"), (2, "trigger"), (3, "brake_dry")
        ]

    def test_only_events_inside_the_window_are_listed(self):
        days = [_day(i) for i in range(20)]
        days[1] = _day(1, temp_min_c=-5.0)
        days[15] = _day(15, temp_min_c=-1.0)
        events, lowest = _events(days, start=D0 + timedelta(days=10))
        assert [e["temp_min_c"] for e in events] == [-1.0]
        assert lowest == {"date": D0 + timedelta(days=15), "temp_min_c": -1.0}

    def test_the_lowest_minimum_is_given_even_without_frost(self):
        days = [_day(i) for i in range(5)]
        days[3] = _day(3, temp_min_c=2.5)
        _, lowest = _events(days)
        assert lowest == {"date": D0 + timedelta(days=3), "temp_min_c": 2.5}

    def test_an_empty_window_has_no_events(self):
        assert find_events({}, D0, D0 + timedelta(days=5)) == ([], None)


# ── Conditions ────────────────────────────────────────────────────────────────

def _result(on=date(2026, 10, 10), score=60, warm=False, soil_water=40.0, air=13.5, soil=12.0,
            dry_days=0, estimated=False, pending=(), **factors) -> V2Result:
    f = dict(activation=80, moisture=80, temperature=80, season=1.0, drying=1.0, heat=1.0,
             frost=1.0, shock=1.0)
    f.update(factors)
    return V2Result(
        date=on, score=score, factors=V2Factors(**f), warm=warm, soil_water_mm=soil_water,
        air_temp_20d_c=air, soil_temp_7d_c=soil, dry_days=dry_days, frost_recent=False,
        pending_rains=list(pending), estimated=estimated,
    )


def _codes(conditions):
    return [c["code"] for c in conditions]


def _recent(n=10, **kw):
    return [_day(i, **kw) for i in range(n)]


def _by_code(conditions, code):
    return next(c for c in conditions if c["code"] == code)


PENDING = PendingRain(D0, D0 + timedelta(days=2), 26.6, D0 + timedelta(days=16),
                      D0 + timedelta(days=23))


class TestConditions:
    def test_a_healthy_day_has_no_conditions(self):
        assert build_conditions(_result(), _recent(), 900) == []

    @pytest.mark.parametrize(
        ("code", "sign", "hint", "kwargs"),
        [
            ("rain_on_the_way", "+", "rain_timing", dict(pending=[PENDING])),
            ("warm_zone", "+", "faster_response", dict(warm=True)),
            ("temperature_drop", "+", "drop_after_rain", dict(shock=1.1)),
            ("dry_soil", "-", "shaded_valleys_near_water", dict(moisture=40)),
            ("drying_wind", "-", "sheltered_from_wind", dict(drying=0.76, dry_days=3)),
            ("heat", "-", "north_and_higher_under_trees", dict(heat=0.64)),
            ("too_warm", "-", "north_and_higher", dict(temperature=40, air=18.0)),
            ("too_cold", "-", "south_and_lower", dict(temperature=40, air=8.0)),
            ("cold_soil", "-", "south_and_lower", dict(soil=1.0)),
            ("estimated", "-", None, dict(estimated=True)),
        ],
    )
    def test_each_signal_gives_its_condition_sign_and_hint(self, code, sign, hint, kwargs):
        c = _by_code(build_conditions(_result(**kwargs), _recent(), 900), code)
        assert (c["sign"], c["hint"]) == (sign, hint)

    def test_rain_on_the_way_says_when_it_shows_and_peaks(self):
        conditions = build_conditions(_result(pending=[PENDING]), _recent(), 900)
        c = _by_code(conditions, "rain_on_the_way")
        assert c["values"]["shows_from"] == PENDING.shows_from
        assert c["values"]["peak"] == PENDING.peak and c["values"]["total_mm"] == 26.6

    def test_a_temperature_condition_needs_the_temperature_factor_below_50(self):
        assert build_conditions(_result(temperature=60, air=18.0), _recent(), 900) == []

    def test_frost_carries_its_date_and_minimum(self):
        recent = _recent()
        recent[7] = _day(7, temp_min_c=-2.4)
        c = _by_code(build_conditions(_result(frost=0.75), recent, 900), "frost")
        assert c["values"]["temp_min_c"] == -2.4
        assert c["values"]["date"] == D0 + timedelta(days=7)
        assert c["hint"] == "protected_under_trees"

    def test_a_cold_snap_without_frost_is_a_message_only_condition(self):
        recent = _recent(4)
        recent[0] = _day(0, temp_max_c=21.0, temp_avg_c=15.0)
        recent[3] = _day(3, temp_max_c=11.0, temp_avg_c=6.0, temp_min_c=2.0)
        c = _by_code(build_conditions(_result(), recent, 900), "cold_snap")
        assert c["values"]["drop_c"] == 10.0 and c["values"]["temp_min_c"] == 2.0

    def test_with_frost_the_condition_is_frost_not_cold_snap(self):
        recent = _recent(4)
        recent[0] = _day(0, temp_max_c=21.0, temp_avg_c=15.0)
        recent[3] = _day(3, temp_max_c=11.0, temp_avg_c=6.0, temp_min_c=-1.0)
        codes = _codes(build_conditions(_result(frost=0.75), recent, 900))
        assert "frost" in codes and "cold_snap" not in codes

    def test_a_small_drop_is_not_a_cold_snap(self):
        recent = _recent(4)
        recent[3] = _day(3, temp_max_c=15.0, temp_avg_c=9.0, temp_min_c=2.0)
        assert "cold_snap" not in _codes(build_conditions(_result(), recent, 900))


class TestSeason:
    def test_late_season_needs_the_season_below_0_8_after_the_bands_peak(self):
        late = _result(on=date(2026, 11, 20), season=0.6)
        c = _by_code(build_conditions(late, _recent(), 1000), "late_season")  # mountain, peak Oct
        assert c["hint"] == "lower_altitude"

    def test_before_the_peak_it_is_early_not_late(self):
        early = _result(on=date(2026, 8, 5), season=0.45)
        assert "late_season" not in _codes(build_conditions(early, _recent(), 1000))

    def test_a_species_outside_its_months_is_out_of_season(self):
        sp = SpeciesParams(5.0, 14.0, 22.0, months=(9, 10))
        r = _result(on=date(2026, 12, 10), season=0.1)
        codes = _codes(build_conditions(r, _recent(), 1000, sp))
        assert "out_of_season" in codes and "late_season" not in codes
        c = _by_code(build_conditions(r, _recent(), 1000, sp), "out_of_season")
        assert c["values"]["months"] == [9, 10] and c["hint"] == "species_months"

    def test_the_species_optimum_decides_too_warm_or_cold(self):
        sp = SpeciesParams(8.0, 20.0, 28.0)
        r = _result(temperature=40, air=16.0)  # warm for the generic model, cold for this species
        assert "too_cold" in _codes(build_conditions(r, _recent(), 900, sp))
        assert "too_warm" in _codes(build_conditions(r, _recent(), 900))


class TestOrder:
    def test_what_limits_most_goes_first_then_negatives_then_positives(self):
        r = _result(moisture=30, temperature=45, air=8.0, heat=0.8, warm=True, pending=[PENDING])
        # limiting factor is moisture (30 < 45 < 80)
        assert r.limiting_factor == "moisture"
        order = _codes(build_conditions(r, _recent(), 900))
        assert order[0] == "dry_soil"
        assert set(order[1:3]) == {"heat", "too_cold"}
        assert order[3:] == ["rain_on_the_way", "warm_zone"]

    def test_a_positive_and_a_negative_can_coexist(self):
        r = _result(frost=0.75, pending=[PENDING])
        codes = _codes(build_conditions(r, _recent(), 900))
        assert "rain_on_the_way" in codes and "frost" in codes


class TestExplanation:
    def test_a_low_score_with_some_activation_is_not_nothing(self):
        assert build_explanation(_result(score=12, activation=20)) == "low_but_possible_in_spots"

    def test_no_activation_and_no_rain_on_the_way_means_the_weather_does_not_help(self):
        assert build_explanation(_result(score=0, activation=0)) == "weather_does_not_help"

    def test_no_activation_but_rain_on_the_way_is_not_hopeless(self):
        assert build_explanation(_result(score=0, activation=0, pending=[PENDING])) is None

    def test_a_good_score_needs_no_extra_explanation(self):
        assert build_explanation(_result(score=65)) is None
