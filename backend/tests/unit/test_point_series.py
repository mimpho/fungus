"""Series and snapshot for a point (pure builders). No DB, no network."""
from datetime import date, timedelta
from types import SimpleNamespace

import pytest

from app.services.point_series import DEFAULT_DAYS, build_series, build_snapshot

TODAY = date(2026, 10, 14)


def _rows(n=150, last=TODAY - timedelta(days=1), skip=()):
    rows = []
    for i in range(n):
        d = last - timedelta(days=n - 1 - i)
        if d in skip:
            continue
        rows.append(
            SimpleNamespace(
                date=d, temp_max_c=21.0, temp_min_c=9.0, temp_avg_c=15.0, soil_temp_c=14.0,
                precipitation_mm=12.0 if d.day % 6 == 0 else 0.0, humidity_pct=75, wind_kmh=10,
            )
        )
    return rows


class TestSeries:
    def test_a_window_ends_on_the_requested_date_with_consecutive_days(self):
        to = TODAY - timedelta(days=4)
        w = build_series(_rows(), TODAY, 667, 667, to=to, days=20)
        dates = [d["date"] for d in w.days]
        assert len(dates) == 20 and dates[-1] == to.isoformat()
        assert dates == [(to - timedelta(days=19 - i)).isoformat() for i in range(20)]

    def test_each_day_has_climate_v1_v2_and_factors(self):
        day = build_series(_rows(), TODAY, 667, 667).days[-1]
        assert set(day["climate"]) >= {
            "temp_max_c", "temp_min_c", "temp_avg_c", "soil_temp_c",
            "precipitation_mm", "humidity_pct", "wind_kmh",
        }
        assert 0 <= day["v1"]["score"] <= 100 and day["v1"]["label"]
        assert 0 <= day["v2"]["score"] <= 100
        assert set(day["v2"]["factors"]) == {
            "activation", "moisture", "temperature", "season", "drying", "heat", "frost", "shock",
            "needs", "fit",
        }

    def test_defaults_end_on_the_last_day_with_data_and_have_20_days(self):
        w = build_series(_rows(), TODAY, 667, 667)
        assert len(w.days) == DEFAULT_DAYS
        assert w.to == w.last_data_date == TODAY - timedelta(days=1)
        assert w.clamped is False

    def test_a_date_after_the_last_data_is_clamped_and_says_so(self):
        w = build_series(_rows(), TODAY, 667, 667, to=TODAY + timedelta(days=5))
        assert w.to == TODAY - timedelta(days=1) and w.clamped is True

    def test_today_and_forecast_rows_are_not_part_of_the_series(self):
        rows = _rows(last=TODAY + timedelta(days=10))  # provisional days stored in the cell
        w = build_series(rows, TODAY, 667, 667)
        assert w.last_data_date == TODAY - timedelta(days=1)
        assert all(d["date"] < TODAY.isoformat() for d in w.days)

    def test_days_before_the_history_have_no_climate_and_no_score(self):
        w = build_series(_rows(n=10), TODAY, 667, 667, days=30)
        first, last = w.days[0], w.days[-1]
        assert first["climate"] is None and first["v1"] is None and first["v2"] is None
        assert last["climate"] is not None and last["v2"] is not None

    def test_a_gap_in_the_middle_has_null_climate(self):
        gap = TODAY - timedelta(days=3)
        w = build_series(_rows(skip={gap}), TODAY, 667, 667)
        entry = next(d for d in w.days if d["date"] == gap.isoformat())
        assert entry["climate"] is None and entry["v1"] is None

    def test_no_rows_gives_an_empty_window(self):
        w = build_series([], TODAY, 667, 667)
        assert w.days == [] and w.last_data_date is None

    def test_the_climate_is_shifted_to_the_point_elevation(self):
        flat = build_series(_rows(), TODAY, 667, 667).days[-1]["climate"]
        high = build_series(_rows(), TODAY, 667, 1167).days[-1]["climate"]
        assert high["temp_avg_c"] == pytest.approx(flat["temp_avg_c"] - 3.25, abs=0.1)
        assert high["soil_temp_c"] == pytest.approx(flat["soil_temp_c"] - 3.25, abs=0.1)
        assert high["precipitation_mm"] == flat["precipitation_mm"]
        assert high["wind_kmh"] == flat["wind_kmh"]

    def test_an_unknown_point_elevation_leaves_the_cell_values(self):
        a = build_series(_rows(), TODAY, 667, None).days[-1]["climate"]
        b = build_series(_rows(), TODAY, 667, 667).days[-1]["climate"]
        assert a == b


class TestSnapshot:
    def test_it_reports_the_thermometer_for_the_last_day(self):
        s = build_snapshot(_rows(), TODAY, 667, 667)
        assert s["date"] == s["last_data_date"] == (TODAY - timedelta(days=1)).isoformat()
        assert s["label"] in {"Poor", "Fair", "Good", "Very good", "Excellent"}
        assert s["limiting_factor"] in {"activation", "moisture", "temperature", "drying"}
        assert set(s["key_facts"]) == {
            "soil_water_mm", "soil_temp_7d_c", "air_temp_20d_c", "last_night_min_c", "dry_days",
        }
        assert s["v1"] is not None and isinstance(s["pending_rains"], list)

    def test_it_follows_the_requested_date(self):
        on = TODAY - timedelta(days=20)
        assert build_snapshot(_rows(), TODAY, 667, 667, on=on)["date"] == on.isoformat()

    def test_a_date_after_the_data_is_clamped(self):
        s = build_snapshot(_rows(), TODAY, 667, 667, on=TODAY + timedelta(days=9))
        assert s["clamped"] is True and s["date"] == s["last_data_date"]

    def test_the_point_elevation_changes_the_season_factor(self):
        low = build_snapshot(_rows(), TODAY, 667, 600)["factors"]["season"]
        high = build_snapshot(_rows(), TODAY, 667, 1700)["factors"]["season"]
        assert low != high

    def test_no_data_means_no_snapshot(self):
        assert build_snapshot([], TODAY, 667, 667) is None

    def test_a_missing_day_scores_as_the_nearest_one_before_it(self):
        gap = TODAY - timedelta(days=10)
        s = build_snapshot(_rows(skip={gap}), TODAY, 667, 667, on=gap)
        assert s is not None and s["date"] == (gap - timedelta(days=1)).isoformat()

    def test_a_date_before_the_first_day_has_no_snapshot(self):
        assert build_snapshot(_rows(n=30), TODAY, 667, 667, on=TODAY - timedelta(days=90)) is None


class TestEventsAndConditionsInTheResponse:
    def test_the_series_lists_events_and_the_lowest_minimum(self):
        rows = _rows()
        rows[-3].temp_min_c = -1.0
        rows[-6].precipitation_mm = 30.0
        w = build_series(rows, TODAY, 667, 667)
        assert {e["type"] for e in w.events} >= {"brake_frost", "trigger"}
        assert [e["n"] for e in w.events] == list(range(1, len(w.events) + 1))
        assert w.lowest_min["temp_min_c"] == -1.0

    def test_events_follow_the_elevation_correction(self):
        w = build_series(_rows(), TODAY, 667, 667 + 1500)  # ~ -9.75 C: nights below zero
        assert any(e["type"] == "brake_frost" for e in w.events)

    def test_the_snapshot_lists_conditions_and_an_explanation_field(self):
        s = build_snapshot(_rows(), TODAY, 667, 667)
        assert isinstance(s["conditions"], list)
        for c in s["conditions"]:
            assert set(c) == {"code", "sign", "values", "hint"} and c["sign"] in ("+", "-")
        assert "explanation" in s
