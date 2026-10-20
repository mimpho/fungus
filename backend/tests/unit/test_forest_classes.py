"""Forest classes of the probability layer: MCSC-4 codes and species fit."""
import pytest

from app.services.forest_classes import CLASSES, classes_for, classify


class TestClassify:
    @pytest.mark.parametrize("code,cls", [
        ("bph20", "pinar"), ("bpu5", "pinar"), ("baa20", "pinar"), ("bcon5", "pinar"),
        ("bqi20", "encinar"), ("bqs20", "encinar"), ("barb5", "encinar"),
        ("bfs20", "hayedo"),
        ("bqh20", "robledal"), ("bqf5", "robledal"), ("bqpy20", "robledal"),
        ("bribc20", "otro"), ("bcad5", "otro"), ("bfe20", "otro"), ("bbp20", "otro"),
    ])
    def test_forest_bases(self, code, cls):
        assert classify(code)[0] == cls

    def test_dense_counts_full_and_sparse_half(self):
        assert classify("bqi20") == ("encinar", 1.0)
        assert classify("bqi5") == ("encinar", 0.5)

    @pytest.mark.parametrize("code,cls", [
        ("bphf", "pinar"), ("bphp", "pinar"), ("bphr", "pinar"),   # strip, plantation, regrowth
        ("bqff", "robledal"), ("bqir", "encinar"), ("bfsr", "hayedo"),
        ("bcadp", "otro"), ("baar", "pinar"), ("bbpr", "otro"), ("bppp", "pinar"),
    ])
    def test_variants_count_as_their_base_with_full_weight(self, code, cls):
        assert classify(code) == (cls, 1.0)

    @pytest.mark.parametrize(
        "code", ["m", "ch", "chr", "p", "r", "ppo", "cv", "wb", "mar", "", "b"]
    )
    def test_non_forest_has_no_class(self, code):
        assert classify(code) is None

    def test_every_class_has_a_code(self):
        found = {classify(c)[0] for c in ("bph20", "bqi20", "bfs20", "bqh20", "bcad20")}
        assert found == set(CLASSES)

    def test_every_forest_code_of_the_real_grid_is_known(self):
        # the b* codes found in the 296 sheets of Catalonia (188 codes in all)
        real = ("baa20 baa5 baar bap20 bap5 barb20 barb5 bbp20 bbp5 bbpr bca20 bca5 bcad20 bcad5 "
                "bcadp bcon20 bcon5 bcs20 bcs5 bcsp bfe20 bfe5 bfs20 bfs5 bfsr bph20 bph5 bphf "
                "bphp bphr bpm20 bpm5 bpmf bpmp bpmr bpn20 bpn5 bpnf bpnp bpnr bpp20 bpp5 bppf "
                "bppp bps20 bps5 bpsf bpsp bpsr bpu20 bpu5 bpup bpur bqc20 bqc5 bqf20 bqf5 bqff "
                "bqfr bqh20 bqh5 bqhf bqhr bqi20 bqi5 bqif bqir bqp20 bqp5 bqpy20 bqpy5 bqr20 "
                "bqr5 bqs20 bqs5 bqsf bqsp bribc20 bribc5").split()
        assert [c for c in real if classify(c) is None] == []


class TestClassesFor:
    def test_single_type(self):
        assert classes_for(["pinar"]) == ["pinar"]

    def test_mixto_fits_every_forest(self):
        assert classes_for(["mixto"]) == list(CLASSES)

    def test_broadleaf_species_also_fit_other_broadleaves(self):
        assert classes_for(["hayedo"]) == ["hayedo", "otro"]
        assert classes_for(["robledal"]) == ["robledal", "otro"]

    def test_several_types_in_class_order(self):
        assert classes_for(["hayedo", "pinar"]) == ["pinar", "hayedo", "otro"]

    @pytest.mark.parametrize("types", [None, [], ["prados"], ["jardines", "ribera"]])
    def test_what_the_land_cover_cannot_judge_has_no_filter(self, types):
        assert classes_for(types) is None

    def test_a_forest_type_next_to_unjudged_ones_still_filters(self):
        assert classes_for(["prados", "encinar"]) == ["encinar"]
