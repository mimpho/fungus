"""Species for a point (T6 of feat/observatory-api). Pure, no DB."""
from dataclasses import replace
from datetime import date, timedelta
from types import SimpleNamespace

import pytest

from app.services.point_species import (
    SpeciesRecord,
    best_window,
    grade,
    species_for_point,
)
from app.services.scoring_v2 import PendingRain
from tests.unit.test_point_series import TODAY, _rows

REF = TODAY - timedelta(days=1)  # last day with data: 2026-10-13


def _sp(**kw) -> SpeciesRecord:
    base = dict(
        id="esp-1", scientific_name="Boletus edulis", edibility="good",
        temp_min_c=5.0, temp_opt_c=14.0, temp_max_c=22.0, rain_min_mm=30.0, rain_opt_mm=80.0,
        cycle_days=10, forest_types=("pinar",), fruiting_months=(9, 10, 11),
        elevation_min_m=400, elevation_max_m=1500,
    )
    return SpeciesRecord(**{**base, **kw})


def _run(catalogue, rows=None, point_elev=667, **kw):
    return species_for_point(rows or _rows(), TODAY, 667, point_elev, catalogue, **kw)


def _ids(result):
    return [i["id"] for i in result["species"]]


def _item(result, sid="esp-1"):
    return next(i for i in result["species"] if i["id"] == sid)


def _rain_only_on(day: date, mm=15.0):
    rows = _rows()
    for r in rows:
        r.precipitation_mm = mm if r.date == day else 0.0
    return rows


# ── Grade ─────────────────────────────────────────────────────────────────────

@pytest.mark.parametrize(
    ("score", "name"),
    [(100, "probable"), (70, "probable"), (69, "possible"), (55, "possible"),
     (54, "early"), (25, "early"), (24, "unlikely"), (0, "unlikely")],
)
def test_grade_of_a_score(score, name):
    assert grade(score) == name


# ── Compatibility ─────────────────────────────────────────────────────────────

class TestCompatibility:
    def test_a_species_that_fits_is_listed_with_a_score_and_a_grade(self):
        item = _item(_run([_sp()]))
        assert 0 <= item["score"] <= 100 and item["grade"] in {
            "probable", "possible", "early", "unlikely"}
        assert item["altitude"]["fit"] in {"inside", "partial"}

    def test_a_species_far_from_the_points_altitude_is_not_listed(self):
        assert _ids(_run([_sp(elevation_min_m=100, elevation_max_m=300)])) == []

    def test_at_the_150_m_margin_it_is_listed_with_its_score_times_0_85(self):
        full = _item(_run([_sp()]))
        limit_sp = _sp(id="esp-2", elevation_min_m=300, elevation_max_m=520)  # 147 m below
        limit = _item(_run([_sp(), limit_sp]), "esp-2")
        assert limit["altitude"]["fit"] == "limit"
        assert abs(limit["score"] - full["score"] * 0.85) <= 1
        assert limit["conditions"]["altitude"]["status"] == "not_met"

    def test_a_species_without_altitude_data_is_never_filtered_by_altitude(self):
        assert _ids(_run([_sp(elevation_min_m=None, elevation_max_m=None)])) == ["esp-1"]

    def test_a_species_outside_its_fruiting_months_is_not_listed(self):
        assert _ids(_run([_sp(fruiting_months=(5, 6))])) == []

    def test_a_species_without_months_is_not_filtered_by_month(self):
        assert _ids(_run([_sp(fruiting_months=())])) == ["esp-1"]

    def test_the_catalogue_without_thermal_data_falls_back_to_the_generic_model(self):
        sp = _sp(temp_min_c=None, temp_opt_c=None, temp_max_c=None)
        item = _item(_run([sp]))
        assert item["conditions"]["temperature"]["status"] == "pending"


class TestForest:
    def test_unknown_forest_excludes_nobody_and_the_condition_is_pending(self):
        item = _item(_run([_sp()], forest_types=None))
        assert item["conditions"]["forest"]["status"] == "pending"

    def test_a_species_of_another_forest_is_not_listed(self):
        assert _ids(_run([_sp()], forest_types=["hayedo"])) == []

    def test_a_shared_forest_type_is_met(self):
        item = _item(_run([_sp()], forest_types=["hayedo", "pinar"]))
        assert item["conditions"]["forest"]["status"] == "met"

    def test_a_species_without_forest_data_is_never_excluded_by_forest(self):
        assert _ids(_run([_sp(forest_types=())], forest_types=["hayedo"])) == ["esp-1"]


# ── Conditions ────────────────────────────────────────────────────────────────

class TestConditions:
    def test_temperature_compares_the_7_day_mean_with_the_species_range(self):
        ok = _item(_run([_sp()]))["conditions"]["temperature"]
        cold = _item(_run([_sp(temp_min_c=16.0, temp_opt_c=18.0, temp_max_c=24.0)]))[
            "conditions"]["temperature"]
        assert ok["status"] == "met" and ok["values"]["mean_7d_c"] == 15.0
        assert cold["status"] == "not_met"

    def test_rain_compares_21_days_with_the_species_minimum_and_optimum(self):
        rows = _rain_only_on(REF - timedelta(days=5), 40.0)
        c = _item(_run([_sp(rain_min_mm=30, rain_opt_mm=80)], rows))["conditions"]["rain"]
        assert c["status"] == "met" and c["values"]["total_21d_mm"] == 40.0
        assert c["values"]["reached_opt"] is False
        enough = _item(_run([_sp(rain_min_mm=10, rain_opt_mm=30)], rows))["conditions"]["rain"]
        assert enough["values"]["reached_opt"] is True

    def test_rain_below_the_minimum_is_not_met(self):
        rows = _rain_only_on(REF - timedelta(days=40), 40.0)
        c = _item(_run([_sp(rain_min_mm=30)], rows))["conditions"]["rain"]
        assert c["status"] == "not_met"

    def test_the_cycle_is_met_once_the_days_since_the_rain_reach_it(self):
        rows = _rain_only_on(REF - timedelta(days=12))
        c = _item(_run([_sp(cycle_days=10)], rows))["conditions"]["cycle"]
        assert c["status"] == "met" and c["values"]["days_since_rain"] == 12

    def test_the_cycle_is_pending_before_that_and_says_when_it_ends(self):
        rain_day = REF - timedelta(days=4)
        rows = _rain_only_on(rain_day)
        c = _item(_run([_sp(cycle_days=10)], rows))["conditions"]["cycle"]
        assert c["status"] == "pending"
        assert c["values"]["expected_date"] == rain_day + timedelta(days=10)

    def test_no_significant_rain_means_the_cycle_is_not_met(self):
        rows = _rain_only_on(REF - timedelta(days=20), 3.0)  # under 10 mm
        assert _item(_run([_sp()], rows))["conditions"]["cycle"]["status"] == "not_met"

    def test_altitude_season_and_forest_are_listed_too(self):
        assert set(_item(_run([_sp()]))["conditions"]) == {
            "forest", "altitude", "season", "temperature", "rain", "cycle"}


# ── Best window ───────────────────────────────────────────────────────────────

def _rain(shows_from: date, peak: date) -> PendingRain:
    return PendingRain(shows_from - timedelta(days=14), shows_from - timedelta(days=12),
                       26.6, shows_from, peak)


class TestWindow:
    def test_without_pending_rain_there_is_no_window(self):
        assert best_window([], (9, 10)) is None

    def test_it_goes_from_the_start_to_the_peak_plus_7_days(self):
        w = best_window([_rain(date(2026, 10, 5), date(2026, 10, 12))], (9, 10, 11))
        assert w == {"from": date(2026, 10, 5), "to": date(2026, 10, 19), "status": "open"}

    def test_it_is_cut_at_the_end_of_the_species_last_month(self):
        w = best_window([_rain(date(2026, 10, 20), date(2026, 10, 27))], (9, 10))
        assert w == {"from": date(2026, 10, 20), "to": date(2026, 10, 31),
                     "status": "cut_by_season"}

    def test_if_the_season_ends_before_the_start_it_says_so(self):
        w = best_window([_rain(date(2026, 11, 5), date(2026, 11, 12))], (9, 10))
        assert w["status"] == "season_ends_before_start" and w["to"] is None

    def test_a_species_without_months_has_an_open_window(self):
        w = best_window([_rain(date(2026, 12, 5), date(2026, 12, 12))], ())
        assert w["status"] == "open"

    def test_the_biggest_pending_rain_sets_the_window(self):
        small = replace(_rain(date(2026, 10, 3), date(2026, 10, 8)), total_mm=6.0)
        big = _rain(date(2026, 10, 9), date(2026, 10, 14))
        assert best_window([small, big], (9, 10, 11))["from"] == date(2026, 10, 9)


# ── The list ──────────────────────────────────────────────────────────────────

class TestOrder:
    def test_followed_species_come_first_even_with_a_lower_score(self):
        hot = _sp(id="esp-a", scientific_name="A", temp_min_c=5, temp_opt_c=14, temp_max_c=22)
        cold = _sp(id="esp-b", scientific_name="B", temp_min_c=-5, temp_opt_c=-2, temp_max_c=2)
        plain = _run([hot, cold])
        assert plain["species"][0]["id"] == "esp-a" and plain["species"][0]["score"] > _item(
            plain, "esp-b")["score"]
        first = _run([hot, cold], followed={"esp-b"})
        assert _ids(first)[0] == "esp-b" and _item(first, "esp-b")["followed"] is True
        assert _item(first, "esp-a")["followed"] is False

    def test_excellent_edibles_also_come_in_their_own_list_by_score(self):
        a = _sp(id="esp-a", scientific_name="A", edibility="excellent")
        b = _sp(id="esp-b", scientific_name="B", edibility="excellent",
                temp_min_c=-5, temp_opt_c=-2, temp_max_c=2)
        c = _sp(id="esp-c", scientific_name="C", edibility="toxic")
        res = _run([b, c, a], followed={"esp-b"})
        assert [i["id"] for i in res["excellent"]] == ["esp-a", "esp-b"]  # by score, not followed
        assert "esp-c" in _ids(res) and "esp-c" not in [i["id"] for i in res["excellent"]]

    def test_an_empty_catalogue_gives_empty_lists(self):
        res = _run([])
        assert res["species"] == [] and res["excellent"] == []

    def test_without_climate_data_there_is_no_answer(self):
        assert species_for_point([], TODAY, 667, 667, [_sp()]) is None

    def test_a_date_after_the_data_is_clamped(self):
        res = _run([_sp()], on=TODAY + timedelta(days=9))
        assert res["clamped"] is True and res["date"] == REF.isoformat()

    def test_the_catalogue_row_can_be_an_orm_like_object(self):
        row = SimpleNamespace(
            id="esp-9", scientific_name="X", edibility="good", temp_min_c="5.0",
            temp_opt_c="14.0", temp_max_c="22.0", rain_min_mm=30, rain_opt_mm=80, cycle_days=10,
            forest_types=["pinar"], fruiting_months=[9, 10], elevation_min_m=400,
            elevation_max_m=1500,
        )
        rec = SpeciesRecord.from_row(row)
        assert rec.temp_opt_c == 14.0 and rec.fruiting_months == (9, 10)
        assert _ids(_run([rec])) == ["esp-9"]
