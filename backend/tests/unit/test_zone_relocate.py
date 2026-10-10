"""Pure parts of scripts/zone_relocate.py: place choice, search box, forest scoring."""

import pytest

from scripts.zone_relocate import (
    SEARCH_MAX_KM,
    SEARCH_MIN_KM,
    Forest,
    best_forest,
    confidence,
    forests_from_overpass,
    km_between,
    name_variants,
    pick_place,
    search_box,
    type_match,
)

VILLAGE = {"category": "place", "type": "village", "lat": "42.6", "lon": "0.0"}
PARK = {"category": "boundary", "type": "protected_area", "lat": "42.65", "lon": "0.03"}


def test_roads_and_stops_are_never_the_place():
    stop = {"category": "highway", "type": "bus_stop"}
    assert pick_place([stop]) is None
    assert pick_place([stop, VILLAGE]) is VILLAGE


@pytest.mark.parametrize(
    "name, variants",
    [
        ("Pinar de la Cerdanya", ["Pinar de la Cerdanya", "Cerdanya"]),
        ("Hayedo del Berguedà", ["Hayedo del Berguedà", "Berguedà"]),
        ("Robledal de Gredos", ["Robledal de Gredos", "Gredos"]),
        ("Pinar de la Vall d'Àneu", ["Pinar de la Vall d'Àneu", "Vall d'Àneu"]),
        ("Sierra Tejeda", ["Sierra Tejeda"]),
        ("Aiako Harria", ["Aiako Harria"]),
    ],
)
def test_name_variants(name, variants):
    assert name_variants(name) == variants


def test_a_natural_place_beats_a_village():
    assert pick_place([VILLAGE, PARK]) is PARK
    assert pick_place([VILLAGE]) is VILLAGE
    assert pick_place([]) is None


@pytest.mark.parametrize(
    "box, half_km",
    [
        (["42.649", "42.651", "0.029", "0.031"], SEARCH_MIN_KM),  # a point: widened
        (["42.0", "43.4", "-0.6", "0.6"], SEARCH_MAX_KM),  # a whole sierra: capped
    ],
)
def test_the_search_box_stays_within_limits(box, half_km):
    s, w, n, e = search_box({**PARK, "boundingbox": box})
    assert km_between((s, 0.03), (n, 0.03)) == pytest.approx(2 * half_km, rel=0.01)


@pytest.mark.parametrize(
    "tags, forest_type, match",
    [
        ({"genus": "Fagus"}, "hayedo", "genus"),
        ({"species": "Pinus sylvestris"}, "pinar", "genus"),
        ({"leaf_type": "needleleaved"}, "pinar", "leaf"),
        ({"wood": "deciduous"}, "robledal", "leaf"),
        ({"leaf_type": "broadleaved"}, "pinar", "conflict"),
        ({}, "hayedo", "none"),
        ({"leaf_type": "needleleaved"}, "mixto", "none"),
    ],
)
def test_type_match(tags, forest_type, match):
    assert type_match(tags, forest_type) == match


def _element(lat, lon, size_deg, tags):
    return {
        "center": {"lat": lat, "lon": lon},
        "bounds": {
            "minlat": lat - size_deg,
            "maxlat": lat + size_deg,
            "minlon": lon - size_deg,
            "maxlon": lon + size_deg,
        },
        "tags": tags,
    }


def test_tiny_woods_are_ignored():
    forests = forests_from_overpass([_element(42.6, 0.0, 0.0001, {})], "hayedo")
    assert forests == []


def test_a_matching_forest_wins_over_a_bigger_unknown_one():
    near = (42.65, 0.03)
    forests = forests_from_overpass(
        [
            _element(42.66, 0.04, 0.02, {"genus": "Fagus"}),
            _element(42.64, 0.02, 0.05, {}),
            _element(42.65, 0.03, 0.05, {"leaf_type": "needleleaved"}),
        ],
        "hayedo",
    )
    assert best_forest(forests, near).match == "genus"


def test_confidence():
    beech = Forest(42.6, 0.0, 300, "genus", "")
    unknown = Forest(42.6, 0.0, 300, "none", "")
    wrong = Forest(42.6, 0.0, 300, "conflict", "")
    assert confidence(PARK, beech) == "high"
    assert confidence(VILLAGE, beech) == "medium"
    assert confidence(PARK, unknown) == "medium"
    assert confidence(PARK, wrong) == "low"
    assert confidence(None, beech) == "low"
    assert confidence(PARK, None) == "low"
