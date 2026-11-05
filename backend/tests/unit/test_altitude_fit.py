"""Zone × species altitude fit: scenarios of feat/observatory-bands-elevation."""

import pytest

from app.services.altitude_fit import Fit, altitude_fit, zone_band

SETCASES = (1300, 1900)


def test_overlap_tells_between_which_altitudes_to_look():
    r = altitude_fit(SETCASES, 800, 1800)  # rovelló-like top at 1,800 m
    assert r.fit is Fit.PARTIAL
    assert (r.look_from_m, r.look_to_m) == (1300, 1800)
    assert r.compatible and r.score_factor == 1.0


def test_a_species_covering_the_whole_zone():
    r = altitude_fit(SETCASES, 400, 2000)
    assert r.fit is Fit.INSIDE
    assert (r.look_from_m, r.look_to_m) == SETCASES


def test_within_the_150_m_margin_is_at_the_limit():
    r = altitude_fit((1885, 1885), None, 1800)
    assert r.fit is Fit.LIMIT
    assert r.compatible
    assert r.score_factor == 0.85


@pytest.mark.parametrize("top, fit", [(1735, Fit.LIMIT), (1734, Fit.OUTSIDE)])
def test_the_margin_edge(top, fit):
    assert altitude_fit((1885, 1885), 0, top).fit is fit


def test_beyond_the_margin_does_not_fit():
    r = altitude_fit((1885, 1885), 0, 1700)
    assert r.fit is Fit.OUTSIDE
    assert not r.compatible


def test_the_margin_works_below_too():
    assert altitude_fit((300, 500), 600, 1500).fit is Fit.LIMIT
    assert altitude_fit((300, 500), 700, 1500).fit is Fit.OUTSIDE


def test_no_altitude_data_never_filters():
    assert altitude_fit(None, 400, 2000).fit is Fit.UNKNOWN
    assert altitude_fit(SETCASES, None, None).compatible


def test_a_zone_without_band_uses_its_point():
    assert zone_band(1000, None, None) == (1000, 1000)
    assert zone_band(1885, 1300, 1900) == (1300, 1900)
    assert zone_band(None, None, None) is None
