"""The ensemble: the mean of the excellent edibles of a point, as the map paints it. No DB."""
from dataclasses import replace
from datetime import date, timedelta
from types import SimpleNamespace

from app.services.point_calendar import build_calendar
from app.services.point_ensemble import Ensemble, Member, mean_result, score_series
from app.services.point_series import build_series, build_snapshot
from app.services.scoring_v2 import ClimateDay, SpeciesParams, compute_v2_series

TODAY = date(2026, 10, 14)
WARM = SpeciesParams(temp_min_c=10, temp_opt_c=17, temp_max_c=24)
COLD = SpeciesParams(temp_min_c=2, temp_opt_c=8, temp_max_c=14)


def _rows(n=150):
    last = TODAY - timedelta(days=1)
    return [
        SimpleNamespace(
            date=last - timedelta(days=n - 1 - i), temp_max_c=21.0, temp_min_c=9.0,
            temp_avg_c=15.0, soil_temp_c=14.0,
            precipitation_mm=12.0 if i % 6 == 0 else 0.0, humidity_pct=75, wind_kmh=10,
        )
        for i in range(n)
    ]


def _days():
    return [d for r in _rows() if (d := ClimateDay.from_row(r))]


def _last(species):
    return score_series(_days(), 667, species, output_from=TODAY - timedelta(days=1))[-1]


class TestScoreSeries:
    def test_a_single_species_is_scored_as_before(self):
        days = _days()
        assert score_series(days, 667, WARM) == compute_v2_series(days, 667, WARM)
        assert score_series(days, 667, None) == compute_v2_series(days, 667, None)

    def test_the_ensemble_scores_the_mean_of_its_members(self):
        one, two = _last(WARM).score, _last(COLD).score
        assert one != two  # the test says nothing if both species score the same
        mean = _last(Ensemble((Member(WARM), Member(COLD))))
        assert mean.score == round((one + two) / 2 + 1e-9)

    def test_each_member_counts_with_its_own_habitat_fit(self):
        poor = replace(WARM, fit_parts=(("forest", 0.5),))
        alone = _last(poor).score
        assert alone < _last(WARM).score
        assert _last(Ensemble((Member(poor),))).score == alone

    def test_a_member_out_of_its_months_does_not_count(self):
        in_season = Member(WARM, fruiting_months=(10,))
        out = Member(COLD, fruiting_months=(4,))
        assert _last(Ensemble((in_season, out))).score == _last(WARM).score

    def test_only_species_that_grow_in_forest_count(self):
        from app.services.point_ensemble import counts_in_ensemble

        assert counts_in_ensemble(["pinar", "prado"]) is True
        assert counts_in_ensemble(["prado", "jardin"]) is False
        assert counts_in_ensemble([]) is False

    def test_nothing_in_season_scores_zero(self):
        assert _last(Ensemble((Member(WARM, (4,)),))).score == 0

    def test_no_members_gives_the_general_climate_score(self):
        assert _last(Ensemble(())).score == _last(None).score

    def test_the_climate_behind_the_score_is_the_same_for_all(self):
        mean, one = _last(Ensemble((Member(WARM), Member(COLD)))), _last(WARM)
        assert (mean.soil_water_mm, mean.dry_days, mean.pending_rains) == (
            one.soil_water_mm, one.dry_days, one.pending_rains)

    def test_mean_result_averages_the_species_dependent_factors(self):
        a, b = _last(WARM), _last(COLD)
        m = mean_result([a, b])
        assert m.factors.temperature == round((a.factors.temperature + b.factors.temperature) / 2)


class TestBuilders:
    def test_the_snapshot_series_and_calendar_take_an_ensemble(self):
        ens = Ensemble((Member(WARM), Member(COLD)))
        snap = build_snapshot(_rows(), TODAY, 667, 667, species=ens)
        singles = [build_snapshot(_rows(), TODAY, 667, 667, species=sp)["score"]
                   for sp in (WARM, COLD)]
        assert snap["score"] == round(sum(singles) / 2 + 1e-9) and snap["conditions"] == []
        series = build_series(_rows(), TODAY, 667, 667, species=ens)
        singles = [build_series(_rows(), TODAY, 667, 667, species=sp).days[-1]["v2"]["score"]
                   for sp in (WARM, COLD)]
        assert series.days[-1]["v2"]["score"] == round(sum(singles) / 2 + 1e-9)
        cal = build_calendar(_rows(), TODAY, 667, 667, species=ens)
        scores = [e["score"] for e in cal["days"] if e["score"] is not None]
        assert scores and all(0 <= v <= 100 for v in scores)


class TestEnsembleWithAffinity:
    def test_a_species_with_affinity_counts_even_without_forest_types(self):
        from app.services.point_ensemble import counts_in_ensemble

        assert counts_in_ensemble([], {"hayedo": 0.8}) is True
        assert counts_in_ensemble(["prado"], {"hayedo": 0.8}) is True
        assert counts_in_ensemble(["prado"], None) is False
