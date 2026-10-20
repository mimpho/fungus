"""Substrate classes: ICGC lithological chemistry -> acidity, and the pH fit of a species."""
import pytest

from app.services.substrate_classes import SUBSTRATE_CLASSES, ph_fit, substrate_class


class TestSubstrateClass:
    @pytest.mark.parametrize("chem,cls", [
        ("Q/Si", "acid"), ("Si/Q", "acid"),                      # granite, gneiss, slate
        ("Ca", "calcareous"), ("Ca/Do", "calcareous"), ("Do", "calcareous"),
        ("Mx/Ca", "calcareous"), ("Si/Ca", "calcareous"),        # marls
        ("Ca/Si", "calcareous"), ("Mx/Su", "calcareous"), ("Cl", "calcareous"),
        ("Mx", "mixed"), ("Pl", "mixed"), ("Pl/Mo", "mixed"), ("Mx/Mo", "mixed"),
        ("Si", "mixed"),                                         # basalt, gabbro
    ])
    def test_classes(self, chem, cls):
        assert substrate_class(chem) == cls

    @pytest.mark.parametrize("chem", ["", "  ", "/"])
    def test_water_and_empty_have_no_class(self, chem):
        assert substrate_class(chem) is None


class TestPhFit:
    def test_order_follows_the_classes(self):
        assert SUBSTRATE_CLASSES == ("acid", "mixed", "calcareous")

    def test_an_acid_loving_species_does_not_fit_calcareous_soil(self):
        assert ph_fit(4.5, 6.5) == [1.0, 0.714, 0.0]

    def test_a_calcicole_does_not_fit_acid_soil(self):
        assert ph_fit(7.0, 8.5)[0] == 0.0

    def test_a_wide_range_fits_every_class_partly_or_fully(self):
        acid, mixed, calc = ph_fit(5.5, 7.5)
        assert mixed == 1.0 and 0 < acid < 1 and 0 < calc < 1

    @pytest.mark.parametrize("lo,hi", [(None, 7), (5, None), (None, None), (7, 5)])
    def test_unknown_or_inverted_range_has_no_fit(self, lo, hi):
        assert ph_fit(lo, hi) is None
