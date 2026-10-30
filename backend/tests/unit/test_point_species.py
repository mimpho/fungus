"""Species for a point (T6 of feat/observatory-api). Pure, no DB."""
from dataclasses import replace
from datetime import date, timedelta
from types import SimpleNamespace

import pytest

from app.services.point_habitat import Habitat
from app.services.point_species import (
    SpeciesRecord,
    best_window,
    fit_parts,
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
            "forest", "soil", "altitude", "season", "temperature", "rain", "cycle"}


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

    def test_the_catalogues_spanish_value_counts_as_excellent(self):
        res = _run([_sp(id="esp-e", edibility="excelente"), _sp(id="esp-g", edibility="bueno")])
        assert [i["id"] for i in res["excellent"]] == ["esp-e"]

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


# ── Habitat: forest shares and soil ───────────────────────────────────────────

def _habitat(forest=None, soil=None):
    return Habitat(forest=forest, soil=soil)


class TestHabitat:
    def test_without_habitat_nothing_changes(self):
        plain = _item(_run([_sp()]))
        assert plain["habitat"] == {"forest_factor": 1.0, "soil_factor": 1.0}
        assert plain["conditions"]["soil"]["status"] == "pending"

    def test_forest_shares_replace_the_land_cover_types(self):
        sp = _sp(forest_types=("pinar",))
        # the land cover says pinar, the MCSC raster says almost no pinar here
        res = _run([sp], forest_types={"pinar"},
                   habitat=_habitat(forest={"pinar_silvestre": 0.05, "encinar": 0.9}))
        assert res["species"] == []

    def test_a_partial_forest_lowers_the_score_in_proportion(self):
        base = _item(_run([_sp()]))["score"]
        half = _run([_sp()], habitat=_habitat(forest={"pinar_silvestre": 0.25}))  # factor 0.5
        item = _item(half)
        assert item["conditions"]["forest"]["values"]["share"] == 0.25
        assert item["habitat"]["forest_factor"] == 0.5
        assert item["score"] == pytest.approx(base * 0.5, abs=1)

    def test_soil_ph_multiplies_the_score_and_is_a_condition(self):
        calcareous = _habitat(soil={"acid": 0.0, "mixed": 0.0, "calcareous": 1.0})
        acid = _habitat(soil={"acid": 1.0, "mixed": 0.0, "calcareous": 0.0})
        sp = _sp(ph_min=4.5, ph_max=7.2)  # tolerates lime a little
        on_lime = _item(_run([sp], habitat=calcareous))
        on_acid = _item(_run([sp], habitat=acid))
        assert on_lime["score"] < on_acid["score"]
        assert on_lime["conditions"]["soil"]["status"] == "not_met"
        assert on_acid["conditions"]["soil"]["status"] == "met"
        assert on_acid["conditions"]["soil"]["values"]["factor"] == 1.0

    def test_a_soil_that_does_not_fit_at_all_leaves_the_species_out(self):
        lime = _habitat(soil={"acid": 0.0, "mixed": 0.0, "calcareous": 1.0})
        assert _run([_sp(ph_min=4.0, ph_max=5.0)], habitat=lime)["species"] == []

    def test_unknown_ph_or_no_soil_data_do_not_punish(self):
        nothing = _habitat(soil=dict.fromkeys(("acid", "mixed", "calcareous"), 0.0))
        item = _item(_run([_sp()], habitat=nothing))
        assert item["habitat"]["soil_factor"] == 1.0
        item = _item(_run([_sp(ph_min=None, ph_max=None)],
                          habitat=_habitat(soil={"acid": 1.0, "mixed": 0.0, "calcareous": 0.0})))
        assert item["conditions"]["soil"]["status"] == "pending"

    def test_species_the_forest_cannot_judge_keep_the_land_cover_logic(self):
        sp = _sp(forest_types=("pradera",))
        res = _run([sp], forest_types={"pinar"}, habitat=_habitat(forest={"pinar_silvestre": 1.0}))
        assert res["species"] == []  # land cover pinar vs meadow species, as before


class TestWeatherNeeds:
    def test_only_the_needs_a_species_has_are_conditions(self):
        plain = _item(_run([_sp()]))["conditions"]
        assert not {"frost", "shock", "humidity"} & set(plain)
        sp = _sp(needs_frost=True, needs_shock=True, humidity_min_pct=60.0, humidity_opt_pct=78.0)
        c = _item(_run([sp]))["conditions"]
        assert {"frost", "shock", "humidity"} <= set(c)
        assert c["humidity"]["values"]["min_pct"] == 60.0

    def test_the_catalogue_extras_become_species_fields(self):
        row = SimpleNamespace(
            id="x", scientific_name="X", edibility="good", temp_min_c=5, temp_opt_c=14,
            temp_max_c=22, rain_min_mm=30, rain_opt_mm=80, cycle_days=10, forest_types=[],
            fruiting_months=[10], elevation_min_m=0, elevation_max_m=2000,
            extra_data={"humedad_min": 60, "humedad_optima": 78, "requiere_helada": True,
                        "requiere_choque_termico": False},
        )
        rec = SpeciesRecord.from_row(row)
        assert (rec.humidity_min_pct, rec.humidity_opt_pct) == (60.0, 78.0)
        assert rec.needs_frost is True and rec.needs_shock is False
        assert rec.params.needs_frost is True and rec.params.humidity_min_pct == 60.0


class TestFitParts:
    def test_parts_are_altitude_forest_and_soil_each_0_to_1(self):
        from app.services.point_species import fit_parts

        sp = _sp(forest_types=("pinar",), ph_min=4.5, ph_max=7.2)
        habitat = _habitat(forest={"pinar_silvestre": 0.25},
                           soil={"acid": 0.0, "mixed": 0.0, "calcareous": 1.0})
        parts = dict(fit_parts(sp, 667, habitat))
        assert parts["altitude"] == 1.0 and parts["forest"] == 0.5 and 0 < parts["soil"] < 0.5

    def test_outside_its_altitude_the_factor_is_zero_and_unknowns_do_not_punish(self):
        from app.services.point_species import fit_parts

        assert dict(fit_parts(_sp(), 100, None))["altitude"] == 0.0
        assert dict(fit_parts(_sp(), 667, None)) == {"altitude": 1.0, "forest": 1.0, "soil": 1.0}

    def test_the_point_score_of_a_species_matches_its_list_score(self):
        from dataclasses import replace

        from app.services.point_series import build_snapshot
        from app.services.point_species import fit_parts

        sp = _sp()
        habitat = _habitat(forest={"pinar_silvestre": 0.25})
        listed = _item(_run([sp], habitat=habitat))["score"]
        params = replace(sp.params, fit_parts=fit_parts(sp, 667, habitat))
        snap = build_snapshot(_rows(), TODAY, 667, 667, species=params)
        assert abs(snap["score"] - listed) <= 1
        codes = [c["code"] for c in snap["conditions"]]
        assert "habitat_forest" in codes


class TestForestAffinityInTheRecord:
    def _row(self, **extra):
        return SimpleNamespace(
            id="esp-9", scientific_name="X", edibility="good", temp_min_c="5.0",
            temp_opt_c="14.0", temp_max_c="22.0", rain_min_mm=30, rain_opt_mm=80, cycle_days=10,
            forest_types=["encinar"], fruiting_months=[9, 10], elevation_min_m=400,
            elevation_max_m=1500, extra_data=extra,
        )

    def test_it_reads_the_affinity_from_extra_data(self):
        rec = SpeciesRecord.from_row(self._row(forest_affinity={"hayedo": 1.0, "robledal": 0.6}))
        assert dict(rec.forest_affinity) == {"hayedo": 1.0, "robledal": 0.6}

    def test_missing_or_malformed_means_none(self):
        assert SpeciesRecord.from_row(self._row()).forest_affinity == ()
        assert SpeciesRecord.from_row(self._row(forest_affinity="hayedo")).forest_affinity == ()
        assert SpeciesRecord.from_row(self._row(forest_affinity=[1, 2])).forest_affinity == ()

    def test_the_record_stays_hashable(self):
        rec = SpeciesRecord.from_row(self._row(forest_affinity={"hayedo": 1.0}))
        assert isinstance(hash(rec), int)

    def test_a_beech_forest_no_longer_zeroes_a_species_that_fruits_there(self):
        beech = Habitat(
            forest={"hayedo": 0.9, "pinar_silvestre": 0.1}, soil=None, forest_radius_m=500)
        without = SpeciesRecord.from_row(self._row())
        affinity = {"hayedo": 1.0, "robledal": 0.6}
        with_it = SpeciesRecord.from_row(self._row(forest_affinity=affinity))
        assert dict(fit_parts(without, 700, beech))["forest"] == 0.0
        assert dict(fit_parts(with_it, 700, beech))["forest"] == 1.0
