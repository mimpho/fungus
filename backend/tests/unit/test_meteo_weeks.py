"""Weekly figures of the Meteo day bar. Pure, no DB.

Scenarios D1.1-D1.4 of memory/observatory-meteo-plan.md («Day selector»).
"""
from datetime import date, timedelta

import pytest

from app.services.layer_probability import forecast_fresh_since
from app.services.meteo_weeks import first_bar_day, rain_daily, weekly, weeks_answer
from tests.unit.test_layer_rain import REF, _at, _cell, _forecast, _past, _row
from tests.unit.test_point_series import TODAY

FROM = forecast_fresh_since(TODAY)
MONDAY = date(2026, 11, 23)
SUNDAY = date(2026, 11, 29)


def _days(first, last, value=1.0):
    return {first + timedelta(days=i): value for i in range((last - first).days + 1)}


class TestRange:
    @pytest.mark.parametrize("today", [MONDAY, date(2026, 11, 27), SUNDAY])
    def test_it_starts_on_the_monday_26_weeks_before_the_current_one(self, today):
        assert first_bar_day(today) == MONDAY - timedelta(weeks=26)
        assert first_bar_day(today).weekday() == 0

    def test_on_a_monday_the_last_week_holds_the_one_day_a_week_ahead(self):
        out = weekly({}, MONDAY, MONDAY + timedelta(days=7), sum)
        assert (out[0]["from"], out[-1]["from"], out[-1]["to"]) == (
            first_bar_day(MONDAY).isoformat(), "2026-11-30", "2026-11-30")
        assert len(out) == 28

    def test_on_a_sunday_the_week_ahead_is_whole(self):
        out = weekly({}, SUNDAY, SUNDAY + timedelta(days=7), sum)
        assert (out[-1]["from"], out[-1]["to"]) == ("2026-11-30", "2026-12-06")
        assert all(date.fromisoformat(w["from"]).weekday() == 0 for w in out)


class TestWeekly:
    def test_the_current_week_is_split_at_today_and_today_is_forecast(self):
        today = date(2026, 11, 27)  # a Friday
        daily = _days(MONDAY, today - timedelta(days=1), 2.0) | _days(today, SUNDAY, 5.0)
        week = next(w for w in weekly(daily, today, SUNDAY, sum) if w["from"] == "2026-11-23")
        assert week["real"] == {"days": 4, "value": 8.0}
        assert week["forecast"] == {"days": 3, "value": 15.0}

    def test_a_week_with_no_day_has_no_value_and_is_not_zero(self):
        week = weekly({}, MONDAY, MONDAY, sum)[0]
        assert week["real"] == {"days": 0, "value": None}

    def test_days_without_a_figure_do_not_count(self):
        daily = {first_bar_day(MONDAY): 4.0, first_bar_day(MONDAY) + timedelta(days=1): None}
        assert weekly(daily, MONDAY, MONDAY, sum)[0]["real"] == {"days": 1, "value": 4.0}

    def test_the_answer_says_its_range(self):
        out = weeks_answer({TODAY - timedelta(days=1): 1.0}, TODAY, sum)
        assert out["first_date"] == first_bar_day(TODAY).isoformat()
        assert out["forecast_from"] == TODAY.isoformat()
        assert out["max_date"] == (TODAY - timedelta(days=1)).isoformat()


class TestRainDaily:
    def _daily(self, cells):
        return rain_daily(cells, TODAY, FROM)

    def test_a_day_is_the_mean_over_the_cells(self):
        cells = [_cell("a", 0, 0, _past(mm=2.0)), _cell("b", 0, 1, _past(mm=6.0))]
        assert self._daily(cells)[REF] == 4.0

    def test_a_week_of_rain_adds_up_the_daily_means(self):
        cells = [_cell("a", 0, 0, _past(n=40, mm=2.0)), _cell("b", 0, 1, _past(n=40, mm=6.0))]
        full = weeks_answer(self._daily(cells), TODAY, sum)["weeks"][-3]
        assert full["real"] == {"days": 7, "value": 28.0}

    def test_a_day_missing_in_some_cells_uses_the_ones_that_have_it(self):
        cells = [_cell("a", 0, 0, _past(mm=2.0, skip={REF})), _cell("b", 0, 1, _past(mm=6.0))]
        assert self._daily(cells)[REF] == 6.0

    def test_a_day_no_cell_has_is_absent(self):
        cells = [_cell("a", 0, 0, _past(skip={REF}))]
        assert REF not in self._daily(cells)

    def test_a_fresh_forecast_counts(self):
        daily = self._daily([_cell("a", 0, 0, _past() + _forecast(mm=3.0))])
        assert daily[TODAY] == 3.0 and daily[TODAY + timedelta(days=7)] == 3.0
        assert TODAY + timedelta(days=8) not in daily

    def test_a_stale_forecast_does_not(self):
        old = _at(TODAY - timedelta(days=3))
        daily = self._daily([_cell("a", 0, 0, _past() + _forecast(fetched=old))])
        assert max(daily) == REF

    def test_a_past_day_never_replaced_since_long_before_it_does_not(self):
        stale = _row(REF, 9.0, "forecast", _at(REF - timedelta(days=5)))
        daily = self._daily([_cell("a", 0, 0, _past(skip={REF}) + [stale])])
        assert REF not in daily
