"""Layer with forecast (7b-bis): the reference day can go up to a week after today. No DB."""
from datetime import UTC, datetime, timedelta
from types import SimpleNamespace

from app.services.cell_store import forecast_signature_statement
from app.services.layer_probability import (
    FORECAST_LAYER_DAYS,
    CellClimate,
    excellent_layer,
    forecast_fresh_since,
    forecast_limit,
    species_layer,
)
from app.services.point_calendar import build_calendar
from app.services.point_series import prepare_climate
from app.services.scoring_v2 import compute_v2_series, round_half_up
from app.services.zone_scores import V2_WINDOW_DAYS
from tests.unit.test_layer_probability import REF, _by_id, _sp
from tests.unit.test_point_series import TODAY, _rows

FRESH = datetime(2026, 10, 14, 6, 0, tzinfo=UTC)  # fetched this morning
FROM = forecast_fresh_since(TODAY)


def _forecast(n=10, start=TODAY, skip=(), fetched=FRESH):
    rows = []
    for i in range(n):
        d = start + timedelta(days=i)
        if d in skip:
            continue
        rows.append(SimpleNamespace(
            date=d, temp_max_c=20.0 - i * 0.5, temp_min_c=8.0, temp_avg_c=14.0,
            soil_temp_c=13.0, precipitation_mm=15.0 if i == 2 else 0.0, humidity_pct=80,
            wind_kmh=8, fetched_at=fetched,
        ))
    return rows


def _cells(forecast):
    rows = [*_rows(), *forecast]
    return [CellClimate(f"c{i}", 41.60 + 0.07 * (i // 3), 2.0 + 0.127 * (i % 3), 667.0, rows)
            for i in range(6)]


def _layer(forecast, on=None, fresh_since=FROM):
    return species_layer(_cells(forecast), TODAY, _sp(), on, fresh_since)


class TestReferenceDay:
    def test_a_day_of_the_forecast_is_scored_and_says_it_is_one(self):
        on = TODAY + timedelta(days=3)
        r = _layer(_forecast(), on)
        assert r["date"] == on.isoformat() and r["basis"] == "forecast" and r["clamped"] is False
        assert r["last_data_date"] == REF.isoformat()
        assert r["forecast_from"] == TODAY.isoformat()
        assert r["max_date"] == forecast_limit(TODAY).isoformat()
        assert all(c["status"] == "scored" and c["score"] is not None for c in r["cells"])

    def test_today_is_already_a_forecast(self):
        assert _layer(_forecast(), TODAY)["basis"] == "forecast"

    def test_an_observed_day_is_real(self):
        r = _layer(_forecast(), REF - timedelta(days=5))
        assert r["basis"] == "real" and r["max_date"] == forecast_limit(TODAY).isoformat()

    def test_without_a_date_it_is_still_the_last_observed_day(self):
        r = _layer(_forecast())
        assert r["date"] == REF.isoformat() and r["basis"] == "real"

    def test_it_stops_a_week_after_today_even_if_the_forecast_goes_on(self):
        r = _layer(_forecast(n=16), TODAY + timedelta(days=9))
        assert r["date"] == forecast_limit(TODAY).isoformat() and r["clamped"] is True
        assert forecast_limit(TODAY) == TODAY + timedelta(days=FORECAST_LAYER_DAYS)

    def test_without_forecast_the_last_observed_day_is_the_limit(self):
        r = _layer([], TODAY + timedelta(days=2))
        assert r["date"] == REF.isoformat() and r["max_date"] == REF.isoformat()
        assert r["clamped"] is True and r["basis"] == "real"

    def test_a_hole_in_the_forecast_ends_it_there(self):
        r = _layer(_forecast(skip=(TODAY + timedelta(days=2),)), TODAY + timedelta(days=5))
        assert r["max_date"] == (TODAY + timedelta(days=1)).isoformat()
        assert r["date"] == r["max_date"] and r["clamped"] is True

    def test_a_cell_without_forecast_has_no_score_for_a_future_day(self):
        cells = _cells(_forecast())
        lone = CellClimate("lone", 42.0, 2.0, 667.0, _rows())  # no forecast at all
        r = species_layer([*cells, lone], TODAY, _sp(), TODAY + timedelta(days=2), FROM)
        assert _by_id(r)["lone"]["status"] == "no_data" and _by_id(r)["lone"]["score"] is None
        assert _by_id(r)["c0"]["status"] == "scored"


class TestFreshness:
    def test_a_forecast_fetched_within_two_days_counts(self):
        edge = FROM  # UTC midnight two days before today
        assert _layer(_forecast(fetched=edge), TODAY + timedelta(days=2))["basis"] == "forecast"

    def test_an_older_forecast_does_not_count(self):
        old = FROM - timedelta(seconds=1)
        r = _layer(_forecast(fetched=old), TODAY + timedelta(days=2))
        assert r["max_date"] == REF.isoformat() and r["clamped"] is True

    def test_rows_without_a_fetch_time_count(self):
        rows = _forecast()
        for row in rows:
            del row.fetched_at
        assert _layer(rows, TODAY + timedelta(days=2))["basis"] == "forecast"


class TestCloseToTheCalendar:
    def test_a_forecast_day_scores_close_to_what_the_points_calendar_says(self):
        """Not equal on purpose: the layer starts the model's window 100 days before the chosen
        day (as the thermometer does for any day) and the calendar 100 days before the last
        observed one, and the model is sensitive to where the window starts (2 points here)."""
        forecast = _forecast()
        sp = _sp()
        cal = build_calendar([*_rows(), *forecast], TODAY, 667.0, 667.0, species=sp.params)
        by_day = {d["date"]: d for d in cal["days"]}
        for ahead in (0, 2, 5, 7):
            on = TODAY + timedelta(days=ahead)
            cell = _by_id(_layer(forecast, on))["c0"]
            assert by_day[on.isoformat()]["basis"] == "forecast"
            assert abs(cell["score"] - by_day[on.isoformat()]["score"]) <= 3

    def test_a_forecast_day_scores_as_the_model_does_over_its_own_window(self):
        forecast = _forecast()
        sp = _sp()
        on = TODAY + timedelta(days=3)
        days, elevation = prepare_climate(
            [*_rows(), *forecast], TODAY, 667.0, 667.0, on, FROM
        )
        window = [d for d in days if on - timedelta(days=V2_WINDOW_DAYS) <= d.date <= on]
        expected = compute_v2_series(window, elevation, sp.params, output_from=on)[-1].score
        assert _by_id(_layer(forecast, on))["c0"]["score"] == round_half_up(expected)

    def test_the_excellent_layer_agrees_with_the_single_species_one(self):
        forecast = _forecast()
        on = TODAY + timedelta(days=4)
        many = excellent_layer(_cells(forecast), TODAY, [_sp()], on, FROM)
        one = _by_id(_layer(forecast, on))
        assert many["date"] == on.isoformat() and many["basis"] == "forecast"
        assert many["max_date"] == forecast_limit(TODAY).isoformat()
        for cell in many["cells"]:
            assert cell["score"][0] == one[cell["id"]]["score"]


class TestPrepareClimate:
    def test_the_forecast_goes_on_from_today_only_when_asked(self):
        rows = [*_rows(), *_forecast()]
        plain = prepare_climate(rows, TODAY, 667, 667)[0]
        asked = prepare_climate(rows, TODAY, 667, 667, TODAY + timedelta(days=7), FROM)[0]
        assert plain[-1].date == REF
        assert asked[-1].date == TODAY + timedelta(days=7)

    def test_without_yesterday_there_is_no_forecast_to_continue(self):
        rows = [*_rows(last=REF - timedelta(days=2)), *_forecast()]  # cell two days behind
        asked = prepare_climate(rows, TODAY, 667, 667, TODAY + timedelta(days=7), FROM)[0]
        assert asked[-1].date == REF - timedelta(days=2)


class TestSignature:
    def test_it_asks_for_the_last_download_of_the_forecast_rows(self):
        sql = str(forecast_signature_statement().compile(compile_kwargs={"literal_binds": True}))
        assert "max(climate_cell_history.fetched_at)" in sql
        assert "climate_cell_history.source = 'forecast'" in sql
