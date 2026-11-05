"""Forest classes of the probability layer: MCSC-4 codes and species fit."""
import pytest

from app.services.forest_classes import CLASSES, GROUPS, classes_for, classify

GROUPS_PINAR = GROUPS["pinar"]
GROUPS_OTRO = GROUPS["otro"]


class TestClassify:
    @pytest.mark.parametrize("code,cls", [
        ("bph20", "pinar_carrasco"), ("bps20", "pinar_silvestre"), ("bpn20", "pinar_pinassa"),
        ("bpu5", "pinar_negro"), ("bpp20", "pinar_otros"), ("bpm5", "pinar_otros"),
        ("baa20", "pinar_otros"), ("bcon5", "pinar_otros"),
        ("bqi20", "encinar"), ("bqs20", "encinar"), ("barb5", "encinar"),
        ("bfs20", "hayedo"),
        ("bqh20", "robledal"), ("bqf5", "robledal"), ("bqpy20", "robledal"),
        ("bcs20", "castanar"), ("bribc20", "ribera"),
        ("bcad5", "caducifolio_otro"), ("bfe20", "caducifolio_otro"),
        ("bbp20", "caducifolio_otro"), ("bca5", "caducifolio_otro"),
    ])
    def test_forest_bases(self, code, cls):
        assert classify(code)[0] == cls

    def test_dense_counts_full_and_sparse_half(self):
        assert classify("bqi20") == ("encinar", 1.0)
        assert classify("bqi5") == ("encinar", 0.5)

    # variants: f = protection strip, p = plantation, r = regrowth
    @pytest.mark.parametrize("code,cls", [
        ("bphf", "pinar_carrasco"), ("bphp", "pinar_carrasco"), ("bphr", "pinar_carrasco"),
        ("bqff", "robledal"), ("bqir", "encinar"), ("bfsr", "hayedo"),
        ("bcadp", "caducifolio_otro"), ("baar", "pinar_otros"),
        ("bbpr", "caducifolio_otro"), ("bppp", "pinar_otros"), ("bcsp", "castanar"),
        ("bpnr", "pinar_pinassa"),
    ])
    def test_variants_count_as_their_base_with_full_weight(self, code, cls):
        assert classify(code) == (cls, 1.0)

    @pytest.mark.parametrize(
        "code", ["m", "ch", "chr", "p", "r", "ppo", "cv", "wb", "mar", "", "b"]
    )
    def test_non_forest_has_no_class(self, code):
        assert classify(code) is None

    def test_every_class_has_a_code(self):
        found = {classify(c)[0] for c in (
            "bph20", "bps20", "bpn20", "bpu20", "bpp20", "bqi20", "bfs20", "bqh20",
            "bcs20", "bribc20", "bcad20")}
        assert found == set(CLASSES)

    def test_groups_cover_their_classes(self):
        from app.services.forest_classes import GROUP_OF, GROUPS

        assert set(GROUPS["pinar"]) == {c for c in CLASSES if c.startswith("pinar_")}
        assert set(GROUPS["otro"]) == {"castanar", "ribera", "caducifolio_otro"}
        assert set(GROUP_OF) == set(GROUPS["pinar"]) | set(GROUPS["otro"])

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
        assert classes_for(["pinar"]) == list(GROUPS_PINAR)
        assert classes_for(["encinar"]) == ["encinar"]

    def test_mixto_fits_every_forest(self):
        assert classes_for(["mixto"]) == list(CLASSES)

    def test_broadleaf_species_also_fit_other_broadleaves(self):
        assert classes_for(["hayedo"]) == ["hayedo", *GROUPS_OTRO]
        assert classes_for(["robledal"]) == ["robledal", *GROUPS_OTRO]

    def test_several_types_in_class_order(self):
        assert classes_for(["hayedo", "pinar"]) == [*GROUPS_PINAR, "hayedo", *GROUPS_OTRO]

    @pytest.mark.parametrize("types", [None, [], ["prados"], ["jardines", "ribera"]])
    def test_what_the_land_cover_cannot_judge_has_no_filter(self, types):
        assert classes_for(types) is None

    def test_a_forest_type_next_to_unjudged_ones_still_filters(self):
        assert classes_for(["prados", "encinar"]) == ["encinar"]


class TestClassWeights:
    """`forest_affinity` (species.extra_data): how well the species fruits under each forest
    class, 0-1. Without it every class the forest types fit weighs 1, as before."""

    def test_without_affinity_every_fitted_class_weighs_one(self):
        from app.services.forest_classes import class_weights_for

        assert class_weights_for(["pinar"]) == dict.fromkeys(GROUPS_PINAR, 1.0)
        assert class_weights_for(["hayedo"]) == {"hayedo": 1.0, **dict.fromkeys(GROUPS_OTRO, 1.0)}
        assert class_weights_for(["prados"]) is None

    def test_affinity_defines_the_weights_and_overrides_the_types(self):
        from app.services.forest_classes import class_weights_for

        affinity = {"hayedo": 1.0, "robledal": 0.6}
        assert class_weights_for(["encinar", "robledal"], affinity) == {
            "robledal": 0.6, "hayedo": 1.0}

    def test_weights_come_in_class_order(self):
        from app.services.forest_classes import class_weights_for

        out = class_weights_for([], {"castanar": 0.5, "pinar_negro": 1.0, "hayedo": 0.7})
        assert list(out) == ["pinar_negro", "hayedo", "castanar"]

    def test_a_species_with_affinity_is_judged_even_without_forest_types(self):
        from app.services.forest_classes import class_weights_for

        assert class_weights_for([], {"hayedo": 0.8}) == {"hayedo": 0.8}
        assert class_weights_for(None, {"hayedo": 0.8}) == {"hayedo": 0.8}

    def test_values_are_clamped_and_bad_entries_dropped(self):
        from app.services.forest_classes import class_weights_for

        out = class_weights_for(
            [],
            {"pinar_negro": 1.7, "hayedo": 0, "robledal": -1, "alien": 0.5, "ribera": "x",
             "encinar": 0.4},
        )
        assert out == {"pinar_negro": 1.0, "encinar": 0.4}

    def test_an_affinity_with_nothing_usable_falls_back_to_the_types(self):
        from app.services.forest_classes import class_weights_for

        assert class_weights_for(["pinar"], {"alien": 1.0, "hayedo": 0}) == dict.fromkeys(
            GROUPS_PINAR, 1.0)
        assert class_weights_for(["prados"], {}) is None

    def test_classes_for_follows_the_affinity(self):
        assert classes_for(["encinar"], {"hayedo": 1.0, "robledal": 0.6}) == ["hayedo", "robledal"]
        assert classes_for(["encinar"], None) == ["encinar"]

    def test_the_pairs_form_of_the_record_works_too(self):
        from app.services.forest_classes import class_weights_for

        assert class_weights_for([], (("hayedo", 0.8), ("pinar_negro", 1.0))) == {
            "pinar_negro": 1.0, "hayedo": 0.8}


class TestGroupWeights:
    """`pinar` and `otro` in a `forest_affinity` are groups: they weigh every class of the group
    that has no weight of its own, so species saved before the split keep their behaviour."""

    def test_a_group_weight_covers_all_its_classes(self):
        from app.services.forest_classes import class_weights_for

        assert class_weights_for([], {"pinar": 0.8, "hayedo": 1.0}) == {
            **dict.fromkeys(GROUPS_PINAR, 0.8), "hayedo": 1.0}
        assert class_weights_for([], {"otro": 0.9}) == dict.fromkeys(GROUPS_OTRO, 0.9)

    def test_a_class_weight_beats_the_group_weight(self):
        from app.services.forest_classes import class_weights_for

        out = class_weights_for([], {"pinar": 1.0, "pinar_carrasco": 0.2, "pinar_otros": 0.5})
        assert out == {"pinar_carrasco": 0.2, "pinar_silvestre": 1.0, "pinar_pinassa": 1.0,
                       "pinar_negro": 1.0, "pinar_otros": 0.5}

    def test_a_class_with_weight_zero_stays_out_even_if_its_group_has_one(self):
        from app.services.forest_classes import class_weights_for

        out = class_weights_for([], {"pinar": 1.0, "pinar_carrasco": 0})
        assert "pinar_carrasco" not in out and len(out) == 4

    def test_bad_group_weight_is_dropped(self):
        from app.services.forest_classes import class_weights_for

        assert class_weights_for(["encinar"], {"pinar": "x", "otro": True}) == {"encinar": 1.0}
