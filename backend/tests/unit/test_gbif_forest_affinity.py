"""scripts/gbif_forest_affinity.py: forest weights of a species from its GBIF records.

Pure parts only (no network, no real raster): paging, cleaning, the observed-vs-available
comparison and the stability of the weights."""
import random

import pytest

from scripts.gbif_forest_affinity import (
    bootstrap_ranges,
    clean_records,
    count_occurrences,
    dedupe_by_cell,
    fetch_occurrences,
    lifts,
    share_of_mass,
    species_key,
    weights_from,
)

CLASSES = ("pinar", "encinar", "hayedo", "robledal", "otro")


def occ(lat, lon, **kw):
    return {"decimalLatitude": lat, "decimalLongitude": lon, "coordinateUncertaintyInMeters": 30.0,
            "year": 2020, **kw}


class TestFetch:
    def test_it_pages_until_the_end(self):
        pages = [
            {"results": [occ(41.0, 2.0)] * 3, "endOfRecords": False},
            {"results": [occ(41.1, 2.1)] * 2, "endOfRecords": True},
        ]
        calls = []

        def get(url, params):
            calls.append(params["offset"])
            return pages[len(calls) - 1]

        out = fetch_occurrences(get, 123, page_size=3)
        assert len(out) == 5 and calls == [0, 3]

    def test_it_stops_at_the_api_offset_limit(self):
        def get(url, params):
            return {"results": [occ(41.0, 2.0)], "endOfRecords": False}

        out = fetch_occurrences(get, 1, page_size=1, max_offset=3)
        assert len(out) == 3

    def test_it_asks_for_catalonia_and_good_coordinates(self):
        seen = {}

        def get(url, params):
            seen.update(params)
            return {"results": [], "endOfRecords": True}

        fetch_occurrences(get, 77)
        assert seen["taxonKey"] == 77 and seen["hasCoordinate"] == "true"
        assert seen["hasGeospatialIssue"] == "false"
        assert seen["decimalLatitude"].count(",") == 1 and seen["decimalLongitude"].count(",") == 1
        assert seen["coordinateUncertaintyInMeters"] == "0,500"


class TestSpeciesKey:
    def test_it_takes_the_fungus_match(self):
        get = lambda url, params: {"usageKey": 5, "kingdom": "Fungi", "matchType": "EXACT"}  # noqa: E731
        assert species_key(get, "Boletus aereus") == 5

    @pytest.mark.parametrize("answer", [
        {"matchType": "NONE"},
        {"usageKey": 5, "kingdom": "Plantae", "matchType": "EXACT"},
    ])
    def test_no_match_or_not_a_fungus_is_none(self, answer):
        assert species_key(lambda url, params: answer, "x") is None


class TestClean:
    def test_it_drops_missing_and_imprecise_coordinates(self):
        rows = [
            occ(41.5, 2.0),
            {"decimalLatitude": None, "decimalLongitude": 2.0},
            occ(41.6, 2.1, coordinateUncertaintyInMeters=5000.0),
            {"decimalLatitude": 41.7, "decimalLongitude": 2.2},  # no uncertainty stated
        ]
        out = clean_records(rows)
        assert [(r["lat"], r["lon"]) for r in out] == [(41.5, 2.0)]

    def test_it_keeps_only_the_catalonia_box(self):
        out = clean_records([occ(41.5, 2.0), occ(39.0, 2.0), occ(41.5, 5.0)])
        assert len(out) == 1


class TestDedupe:
    def test_one_record_per_cell(self):
        recs = [{"lat": 41.5001, "lon": 2.0001}, {"lat": 41.5002, "lon": 2.0002},
                {"lat": 41.9, "lon": 2.5}]
        assert len(dedupe_by_cell(recs, 0.0025, 0.0030)) == 2

    def test_it_is_stable_on_the_cell_edge(self):
        recs = [{"lat": 41.0, "lon": 2.0}, {"lat": 41.0, "lon": 2.0}]
        assert len(dedupe_by_cell(recs, 0.0025, 0.0030)) == 1


class TestShareOfMass:
    def test_it_adds_the_forest_around_each_record(self):
        shares = [{"hayedo": 0.8, "robledal": 0.2}, {"hayedo": 0.4, "robledal": 0.4}]
        out, n = share_of_mass(shares, CLASSES)
        assert n == 2
        assert round(out["hayedo"], 3) == round(1.2 / 1.8, 3)
        assert round(sum(out.values()), 6) == 1.0

    def test_records_with_no_forest_around_do_not_count(self):
        shares = [{"hayedo": 0.9}, {"hayedo": 0.02}, {}]
        out, n = share_of_mass(shares, CLASSES)
        assert n == 1 and out["hayedo"] == 1.0

    def test_nothing_in_forest_gives_none(self):
        assert share_of_mass([{}], CLASSES) == (None, 0)


class TestLifts:
    def test_a_class_found_more_than_it_is_available_has_lift_over_one(self):
        out = lifts({"hayedo": 0.5, "robledal": 0.5}, {"hayedo": 0.1, "robledal": 0.9})
        assert round(out["hayedo"], 2) == 5.0 and round(out["robledal"], 2) == 0.56

    def test_a_class_that_is_almost_absent_has_no_lift(self):
        out = lifts({"hayedo": 0.5, "pinar": 0.0}, {"hayedo": 0.5, "pinar": 0.004})
        assert out["pinar"] is None

    def test_weights_are_relative_to_the_best_class(self):
        w = weights_from({"hayedo": 4.0, "robledal": 2.0, "pinar": 0.0, "encinar": None})
        assert w == {"hayedo": 1.0, "robledal": 0.5, "pinar": 0.0, "encinar": None}

    def test_no_positive_lift_gives_no_weights(self):
        assert weights_from({"hayedo": 0.0, "pinar": None}) == {"hayedo": None, "pinar": None}


class TestBootstrap:
    def test_a_clear_preference_has_a_narrow_range(self):
        shares = [{"hayedo": 1.0}] * 60
        base = {"hayedo": 0.2, "robledal": 0.8}
        rng = bootstrap_ranges(shares, base, CLASSES, n=50, rng=random.Random(1))
        assert rng["hayedo"] == (1.0, 1.0)

    def test_a_mixed_sample_has_a_wider_range_than_a_pure_one(self):
        mixed = [{"hayedo": 1.0}] * 20 + [{"robledal": 1.0}] * 20
        base = {"hayedo": 0.5, "robledal": 0.5}
        lo, hi = bootstrap_ranges(mixed, base, CLASSES, n=100, rng=random.Random(2))["robledal"]
        assert hi - lo > 0.1

    def test_it_is_repeatable_with_the_same_seed(self):
        shares = [{"hayedo": 0.7, "robledal": 0.3}] * 10 + [{"robledal": 1.0}] * 10
        base = {"hayedo": 0.3, "robledal": 0.7}
        a = bootstrap_ranges(shares, base, CLASSES, n=30, rng=random.Random(3))
        b = bootstrap_ranges(shares, base, CLASSES, n=30, rng=random.Random(3))
        assert a == b


class TestPrecisionFilter:
    def test_the_precision_limit_goes_to_the_query(self):
        seen = {}

        def get(url, params):
            seen.update(params)
            return {"results": [], "endOfRecords": True}

        fetch_occurrences(get, 1, max_uncertainty=1000)
        assert seen["coordinateUncertaintyInMeters"] == "0,1000"

    def test_clean_uses_the_same_limit(self):
        rows = [occ(41.5, 2.0, coordinateUncertaintyInMeters=800.0)]
        assert clean_records(rows) == []
        assert len(clean_records(rows, max_uncertainty=1000)) == 1


class TestCount:
    def test_it_asks_for_the_count_only(self):
        seen = {}

        def get(url, params):
            seen.update(params)
            return {"count": 4321, "results": []}

        assert count_occurrences(get, 9) == 4321
        assert seen["limit"] == 0 and "coordinateUncertaintyInMeters" not in seen

    def test_it_can_limit_the_uncertainty(self):
        seen = {}

        def get(url, params):
            seen.update(params)
            return {"count": 10}

        count_occurrences(get, 9, max_uncertainty=2000)
        assert seen["coordinateUncertaintyInMeters"] == "0,2000"
