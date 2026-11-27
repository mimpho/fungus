"""Rain layer: accumulated rain per stored cell. Pure, no DB.

Scenarios 1.1-1.11 of memory/observatory-meteo-plan.md.
"""
from datetime import UTC, datetime, time, timedelta
from types import SimpleNamespace

import pytest

from app.services.layer_probability import (
    CellClimate,
    forecast_fresh_since,
    forecast_limit,
)
from app.services.layer_rain import MIN_NEIGHBOURS, history_since, rain_layer
from tests.unit.test_point_series import TODAY

REF = TODAY - timedelta(days=1)  # last past day
FROM = forecast_fresh_since(TODAY)


def _at(d, hour=0, minute=40):
    return datetime.combine(d, time(hour, minute), tzinfo=UTC)


def _row(d, mm=1.0, source="archive", fetched=None):
    """A stored day. By default it was downloaded the night after it ended."""
    return SimpleNamespace(
        date=d, temp_max_c=18.0, temp_min_c=8.0, temp_avg_c=13.0, soil_temp_c=12.0,
        precipitation_mm=mm, humidity_pct=80, wind_kmh=8, source=source,
        fetched_at=fetched if fetched is not None else _at(d + timedelta(days=1)),
    )


def _past(n=30, mm=1.0, skip=()):
    days = (REF - timedelta(days=i) for i in range(n))
    return [_row(d, mm) for d in days if d not in skip]


def _forecast(n=16, mm=2.0, skip=(), fetched=None):
    days = (TODAY + timedelta(days=i) for i in range(n))
    return [
        _row(d, mm, "forecast", fetched or _at(TODAY)) for d in days if d not in skip
    ]


def _cell(cid, i, j, rows):
    return CellClimate(cid, 41.60 + 0.07 * i, 2.00 + 0.127 * j, 667.0, rows)


def _block(size=3, rows_of=None):
    """A size x size block of cells named «ij», so the grid gives their size."""
    return [
        _cell(f"{i}{j}", i, j, rows_of(i, j) if rows_of else _past())
        for i in range(size)
        for j in range(size)
    ]


def _layer(cells, window="7d", on=None, fresh_since=FROM):
    return rain_layer(cells, TODAY, window, on, fresh_since)


def _by_id(result):
    return {c["id"]: c for c in result["cells"]}


def _one(rows, **kw):
    return _layer([_cell("a", 0, 0, rows)], **kw)["cells"][0]


class TestWindow:
    def test_seven_days_end_on_the_asked_day_and_count_both_ends(self):
        on = REF - timedelta(days=3)
        rows = _past()
        by_date = {r.date: r for r in rows}
        for i in range(7):
            by_date[on - timedelta(days=i)].precipitation_mm = 10.0
        by_date[on - timedelta(days=7)].precipitation_mm = 500.0
        by_date[on + timedelta(days=1)].precipitation_mm = 500.0
        r = _layer([_cell("a", 0, 0, rows)], "7d", on)
        assert r["cells"][0]["mm"] == 70.0 and r["cells"][0]["status"] == "measured"
        assert r["window"] == "7d" and r["window_days"] == 7
        assert r["window_from"] == (on - timedelta(days=6)).isoformat()
        assert r["date"] == on.isoformat()

    @pytest.mark.parametrize(("window", "days"), [("24h", 1), ("21d", 21)])
    def test_the_other_windows_sum_their_own_days(self, window, days):
        r = _layer([_cell("a", 0, 0, _past(mm=2.5))], window)
        assert r["window_days"] == days and r["cells"][0]["mm"] == 2.5 * days

    def test_without_a_date_it_ends_on_the_last_past_day(self):
        r = _layer([_cell("a", 0, 0, [*_past(), *_forecast()])])
        assert r["date"] == r["last_data_date"] == REF.isoformat()
        assert r["basis"] == "real" and r["clamped"] is False
        assert r["includes_forecast"] is False

    def test_zero_millimetres_is_a_measurement(self):
        got = _one(_past(mm=0.0))
        assert got["status"] == "measured" and got["mm"] == 0.0

    def test_the_sum_is_not_corrected_by_the_cells_elevation(self):
        high = CellClimate("h", 42.3, 1.9, 2300.0, _past(mm=3.0))
        assert _layer([high])["cells"][0]["mm"] == 21.0

    def test_the_history_it_asks_for_reaches_the_longest_window_with_room_to_spare(self):
        assert history_since(TODAY, None) <= TODAY - timedelta(days=40)
        on = TODAY - timedelta(days=25)
        assert history_since(TODAY, on) <= on - timedelta(days=40)
        assert history_since(TODAY, TODAY + timedelta(days=5)) == history_since(TODAY, None)


class TestForecast:
    def test_a_future_day_adds_observed_and_forecast_days(self):
        on = TODAY + timedelta(days=2)
        r = _layer([_cell("a", 0, 0, [*_past(mm=1.0), *_forecast(mm=10.0)])], "7d", on)
        assert r["cells"][0]["mm"] == 4 * 1.0 + 3 * 10.0
        assert r["basis"] == "forecast" and r["forecast_from"] == TODAY.isoformat()
        assert r["includes_forecast"] is True
        assert r["last_data_date"] == REF.isoformat()
        assert r["max_date"] == forecast_limit(TODAY).isoformat()

    def test_today_is_already_a_forecast(self):
        r = _layer([_cell("a", 0, 0, [*_past(), *_forecast()])], "24h", TODAY)
        assert r["basis"] == "forecast" and r["cells"][0]["mm"] == 2.0

    def test_a_stale_forecast_does_not_count(self):
        old = _forecast(fetched=FROM - timedelta(hours=1))
        good = [_cell("b", 0, 1, [*_past(), *_forecast()])]
        r = _layer([_cell("a", 0, 0, [*_past(), *old]), *good], "7d", TODAY)
        assert _by_id(r)["a"]["status"] == "no_data" and _by_id(r)["a"]["mm"] is None
        assert _by_id(r)["b"]["status"] == "measured"

    def test_a_hole_in_the_forecast_spoils_the_days_after_it(self):
        holed = _forecast(skip=(TODAY + timedelta(days=1),))
        cells = [
            _cell("a", 0, 0, [*_past(), *holed]),
            _cell("b", 0, 1, [*_past(), *_forecast()]),
        ]
        r = _layer(cells, "24h", TODAY + timedelta(days=3))
        assert _by_id(r)["a"]["status"] == "no_data"
        assert _by_id(r)["b"]["status"] == "measured"

    def test_a_date_beyond_a_week_ahead_is_limited_and_says_so(self):
        r = _layer(
            [_cell("a", 0, 0, [*_past(), *_forecast()])], "7d", TODAY + timedelta(days=12)
        )
        assert r["date"] == forecast_limit(TODAY).isoformat() and r["clamped"] is True

    def test_a_date_beyond_every_forecast_is_limited_to_the_last_one(self):
        r = _layer(
            [_cell("a", 0, 0, [*_past(), *_forecast(n=3)])], "7d", TODAY + timedelta(days=6)
        )
        assert r["date"] == r["max_date"] == (TODAY + timedelta(days=2)).isoformat()
        assert r["clamped"] is True and r["cells"][0]["status"] == "measured"


class TestPastDays:
    """P3: a past day downloaded after it ended is what happened. One downloaded on the day or up
    to 2 days before still counts, and the window says it includes forecast. Older is missing."""

    def _rows_with(self, fetched, mm=5.0):
        rows = _past()
        rows[0] = _row(REF, mm, "forecast", fetched)
        return rows

    def _two_cells(self, fetched):
        return [_cell("a", 0, 0, self._rows_with(fetched)), _cell("b", 0, 1, _past())]

    def test_a_forecast_row_downloaded_after_its_day_counts_and_is_not_flagged(self):
        rows = self._rows_with(_at(TODAY))
        r = _layer([_cell("a", 0, 0, rows)], "7d", REF)
        assert r["cells"][0]["mm"] == 6 * 1.0 + 5.0
        assert r["basis"] == "real" and r["includes_forecast"] is False

    @pytest.mark.parametrize("days_before", [0, 1, 2])
    def test_one_downloaded_shortly_before_it_ended_counts_and_is_flagged(self, days_before):
        rows = self._rows_with(_at(REF - timedelta(days=days_before)))
        r = _layer([_cell("a", 0, 0, rows)], "7d", REF)
        assert r["cells"][0]["status"] == "measured" and r["cells"][0]["mm"] == 11.0
        assert r["includes_forecast"] is True
        # the date is still a past one: only the flag says part of it was forecast
        assert r["basis"] == "real" and r["last_data_date"] == REF.isoformat()

    def test_one_downloaded_three_days_before_is_missing_and_flags_nothing(self):
        r = _layer(self._two_cells(_at(REF - timedelta(days=3))), "7d", REF)
        assert _by_id(r)["a"]["status"] == "no_data"
        assert _by_id(r)["b"]["status"] == "measured" and r["includes_forecast"] is False

    def test_a_window_that_leaves_the_day_out_is_not_flagged(self):
        r = _layer(self._two_cells(_at(REF)), "7d", REF - timedelta(days=1))
        assert r["includes_forecast"] is False

    def test_a_cell_that_is_not_added_up_does_not_flag_the_window(self):
        rows = self._rows_with(_at(REF))
        del rows[3]  # another day missing: the cell shows no sum of its own
        r = _layer([_cell("a", 0, 0, rows), _cell("b", 0, 1, _past())], "7d", REF)
        assert _by_id(r)["a"]["status"] == "no_data" and r["includes_forecast"] is False

    def test_the_day_is_judged_in_utc(self):
        from datetime import timezone

        madrid = timezone(timedelta(hours=2))
        late = datetime.combine(TODAY, time(1, 30), tzinfo=madrid)  # still REF in UTC
        assert _layer(self._two_cells(late), "7d", REF)["includes_forecast"] is True

    def test_a_day_no_cell_can_count_is_not_offered(self):
        r = _layer([_cell("a", 0, 0, self._rows_with(_at(REF - timedelta(days=3))))], "7d", REF)
        assert r["date"] == r["max_date"] == (REF - timedelta(days=1)).isoformat()
        assert r["clamped"] is True and r["cells"][0]["status"] == "measured"

    def test_an_archive_row_counts_whenever_it_was_downloaded_and_is_not_flagged(self):
        rows = _past()
        rows[0] = _row(REF, 1.0, "archive", _at(REF - timedelta(days=9)))
        r = _layer([_cell("a", 0, 0, rows)], "7d", REF)
        assert r["cells"][0]["status"] == "measured" and r["includes_forecast"] is False

    def test_the_night_before_the_refresh_does_not_empty_the_coming_days(self):
        # yesterday as the previous night's refresh left it, today's refresh not run yet
        rows = [*self._rows_with(_at(REF)), *_forecast(fetched=_at(REF))]
        r = _layer([_cell("a", 0, 0, rows)], "7d", TODAY + timedelta(days=2))
        assert r["cells"][0]["status"] == "measured" and r["includes_forecast"] is True


class TestGaps:
    """1.8-1.10: estimates from the neighbours."""

    GAP = REF - timedelta(days=2)

    def _rows_of(self, values, missing=()):
        """Per cell «ij»: the same millimetres every day; those in `missing` lack GAP."""

        def rows_of(i, j):
            cid = f"{i}{j}"
            skip = (self.GAP,) if cid in missing else ()
            return _past(mm=values.get(cid, 1.0), skip=skip)

        return rows_of

    def test_the_weighted_mean_of_the_neighbours_replaces_the_partial_sum(self):
        # 7 days each. Sides (distance 2, weight 1/4) and diagonals (distance² 8, weight 1/8)
        values = {"10": 4.0, "12": 4.0, "01": 4.0, "21": 4.0,
                  "00": 1.0, "02": 1.0, "20": 1.0, "22": 1.0, "11": 100.0}
        r = _layer(_block(rows_of=self._rows_of(values, missing={"11"})))
        got = _by_id(r)["11"]
        expected = (4 * 28.0 / 4 + 4 * 7.0 / 8) / (4 / 4 + 4 / 8)
        assert got["status"] == "estimated" and got["mm"] == round(expected, 1)
        assert (_by_id(r)["00"]["status"], _by_id(r)["00"]["mm"]) == ("measured", 7.0)

    def test_with_exactly_the_minimum_of_neighbours_it_is_estimated(self):
        kept = {"00", "01", "02"}
        assert len(kept) == MIN_NEIGHBOURS == 3
        missing = {f"{i}{j}" for i in range(3) for j in range(3)} - kept
        r = _layer(_block(rows_of=self._rows_of({}, missing)))
        assert _by_id(r)["11"]["status"] == "estimated"
        assert _by_id(r)["11"]["mm"] == 7.0

    def test_with_two_neighbours_it_has_no_data(self):
        kept = {"00", "01"}
        missing = {f"{i}{j}" for i in range(3) for j in range(3)} - kept
        got = _by_id(_layer(_block(rows_of=self._rows_of({}, missing))))["11"]
        assert got["status"] == "no_data" and got["mm"] is None

    def test_an_estimate_never_feeds_another_one(self):
        # 5 x 5 with a 3 x 3 hole: its rim has measured neighbours, its centre only estimates
        hole = {f"{i}{j}" for i in (1, 2, 3) for j in (1, 2, 3)}
        got = _by_id(_layer(_block(5, self._rows_of({}, hole))))
        assert got["11"]["status"] == got["12"]["status"] == "estimated"
        assert got["22"]["status"] == "no_data" and got["22"]["mm"] is None

    def test_cells_further_than_the_ring_around_are_not_neighbours(self):
        # only the outer ring of a 5 x 5 has data: nothing within reach of the centre
        inner = {f"{i}{j}" for i in (1, 2, 3) for j in (1, 2, 3)}
        assert _by_id(_layer(_block(5, self._rows_of({}, inner))))["22"]["status"] == "no_data"

    def test_when_no_cell_has_the_whole_window_nothing_is_invented(self):
        everyone = {f"{i}{j}" for i in range(3) for j in range(3)}
        r = _layer(_block(rows_of=self._rows_of({}, everyone)), "7d", REF)
        assert all(c["status"] == "no_data" and c["mm"] is None for c in r["cells"])
        assert len(r["cells"]) == 9

    def test_too_few_cells_to_tell_the_grid_means_no_estimate(self):
        got = _one(_past(skip=(self.GAP,)), on=REF)
        assert got["status"] == "no_data" and got["half_lat"] is None


class TestShape:
    def test_every_cell_says_where_it_is(self):
        got = _by_id(_layer(_block()))["11"]
        assert set(got) == {
            "id", "lat", "lon", "half_lat", "half_lon", "elevation_m", "status", "mm"}
        assert got["half_lat"] > 0 and got["half_lon"] > 0

    def test_without_cells_it_answers_empty(self):
        r = _layer([])
        assert r["cells"] == [] and r["date"] is None and r["window_from"] is None
        assert r["basis"] is None and r["clamped"] is False
        assert r["includes_forecast"] is False

    def test_a_cell_without_rows_has_no_data(self):
        r = _layer([_cell("a", 0, 0, []), _cell("b", 0, 1, _past())])
        assert _by_id(r)["a"]["status"] == "no_data"
