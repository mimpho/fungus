"""Habitat at a point: class rasters and species fit. Pure, files in tmp_path."""
import json

from app.services.point_habitat import (
    Habitat,
    forest_factor,
    forest_fit,
    habitat_at,
    load_raster,
    soil_fit,
)


def _write(folder, stem, classes, w, h, fill):
    folder.mkdir(parents=True, exist_ok=True)
    meta = {"classes": classes, "width": w, "height": h,
            "bounds": {"north": 42.0, "south": 41.0, "west": 2.0, "east": 3.0}}
    (folder / f"{stem}.json").write_text(json.dumps(meta))
    (folder / f"{stem}.bin").write_bytes(bytes(fill))


class TestRaster:
    def test_reads_the_share_of_the_pixel_holding_the_point(self, tmp_path):
        # 2x2 pixels, 2 classes: class a = 255 on the north-west pixel only, b = the rest
        a = [255, 0, 0, 0]
        b = [0, 255, 255, 255]
        _write(tmp_path / "f", "forest-catalonia", ["a", "b"], 2, 2, a + b)
        r = load_raster(tmp_path / "f", "forest-catalonia")
        assert r.shares_at(41.9, 2.1) == {"a": 1.0, "b": 0.0}
        assert r.shares_at(41.1, 2.9) == {"a": 0.0, "b": 1.0}
        assert r.shares_at(40.0, 2.5) is None

    def test_missing_or_malformed_rasters_are_none(self, tmp_path):
        assert load_raster(tmp_path / "nope", "x") is None
        _write(tmp_path / "bad", "x", ["a"], 2, 2, [1, 2, 3])  # size does not match
        assert load_raster(tmp_path / "bad", "x") is None

    def test_habitat_at_without_rasters_is_empty(self, tmp_path):
        h = habitat_at(41.5, 2.5, tmp_path / "a", tmp_path / "b")
        assert h.forest is None and h.soil is None
        d = h.as_dict()
        assert d["forest"] is None and d["soil"] is None
        assert d["soil_ph"]["calcareous"] == [7.0, 8.3]


class TestFit:
    def test_forest_factor_ramps_between_10_and_40_percent(self):
        assert forest_factor(0.05) == 0 and forest_factor(0.4) == 1
        assert round(forest_factor(0.25), 3) == 0.5

    def test_forest_fit_sums_the_classes_the_species_fits(self):
        fit = forest_fit(("encinar",), {"pinar": 0.5, "encinar": 0.3, "hayedo": 0.2})
        assert fit["classes"] == ["encinar"] and fit["share"] == 0.3
        assert forest_fit(("pradera",), {"pinar": 1.0}) is None
        assert forest_fit(("pinar",), None) is None

    def test_soil_fit_weights_each_class_by_its_share(self):
        shares = {"acid": 0.5, "mixed": 0.0, "calcareous": 0.5}
        fit = soil_fit(4.5, 5.8, shares)  # fits acid fully, calcareous not at all
        assert fit["factor"] == 0.5
        assert soil_fit(None, None, shares) is None
        assert soil_fit(4.5, 5.8, {"acid": 0.0, "mixed": 0.0, "calcareous": 0.0}) is None


def _fine_raster(tmp_path, centre_forest, ring_forest):
    """5x5 pixels of ~300 m (0.0027 deg x 0.0036 deg): class `a` is forest, `b` the rest. The
    middle pixel has `centre_forest`, the 8 around it `ring_forest`, the outer ring none."""
    folder = tmp_path / "fine"
    share = [[0] * 5 for _ in range(5)]
    share[2][2] = centre_forest
    for r in range(1, 4):
        for c in range(1, 4):
            if (r, c) != (2, 2):
                share[r][c] = ring_forest
    a = [v for row in share for v in row]
    b = [255 - v for v in a]
    folder.mkdir(parents=True, exist_ok=True)
    north, west = 42.0, 2.0
    meta = {"classes": ["a", "b"], "width": 5, "height": 5,
            "bounds": {"north": north, "south": north - 5 * 0.0027,
                       "west": west, "east": west + 5 * 0.0036}}
    (folder / "fine.json").write_text(json.dumps(meta))
    (folder / "fine.bin").write_bytes(bytes(a + b))
    return load_raster(folder, "fine"), (north - 2.5 * 0.0027, west + 2.5 * 0.0036)


class TestSurroundings:
    def test_a_field_beside_a_wood_has_the_wood_around_it(self, tmp_path):
        raster, (lat, lon) = _fine_raster(tmp_path, centre_forest=0, ring_forest=255)
        assert raster.shares_at(lat, lon)["a"] == 0.0  # the pixel itself: no forest
        around = raster.mean_shares(lat, lon, 500)
        assert round(around["a"], 3) == round(8 / 9, 3)  # the 8 neighbours, 300-424 m away
        assert round(sum(around.values()), 6) == 1.0

    def test_pixels_beyond_the_radius_do_not_count(self, tmp_path):
        raster, (lat, lon) = _fine_raster(tmp_path, centre_forest=0, ring_forest=255)
        assert raster.mean_shares(lat, lon, 100)["a"] == 0.0  # only its own pixel
        assert raster.mean_shares(lat, lon, 0)["a"] == 0.0
        # the outer ring (no forest) is 600 m away: with a 700 m radius it dilutes the mean
        assert raster.mean_shares(lat, lon, 700)["a"] < 8 / 9

    def test_it_is_none_outside_the_raster(self, tmp_path):
        raster, _ = _fine_raster(tmp_path, 0, 0)
        assert raster.mean_shares(10.0, 10.0, 500) is None

    def test_habitat_at_looks_for_the_forest_around_but_the_soil_is_the_pixel(self, tmp_path):
        _fine_raster(tmp_path / "f", centre_forest=0, ring_forest=255)
        folder = tmp_path / "f" / "fine"
        (folder / "forest-catalonia.json").write_text((folder / "fine.json").read_text())
        (folder / "forest-catalonia.bin").write_bytes((folder / "fine.bin").read_bytes())
        h = habitat_at(42.0 - 2.5 * 0.0027, 2.0 + 2.5 * 0.0036, folder, tmp_path / "nosoil")
        assert h.forest_around() is True and round(h.forest["a"], 3) == round(8 / 9, 3)
        assert h.soil is None and h.as_dict()["forest_radius_m"] == 500

    def test_forest_around_needs_a_tenth_of_forest(self):
        assert Habitat(forest={"a": 0.05, "b": 0.04}).forest_around() is False
        assert Habitat(forest={"a": 0.06, "b": 0.05}).forest_around() is True
        assert Habitat(forest=None).forest_around() is None


class TestFitWithAffinity:
    AFFINITY = {"robledal": 1.0, "hayedo": 0.6}

    def test_a_pure_stand_of_a_lesser_host_still_gets_full_factor(self):
        fit = forest_fit(("robledal",), {"hayedo": 1.0}, self.AFFINITY)
        assert fit["share"] == 0.6 and fit["factor"] == 1.0

    def test_a_minority_of_the_lesser_host_weighs_less(self):
        fit = forest_fit(("robledal",), {"hayedo": 0.3, "pinar": 0.7}, self.AFFINITY)
        assert fit["share"] == 0.18
        assert round(fit["factor"], 2) == 0.27

    def test_hosts_add_up_with_their_weights(self):
        shares = {"robledal": 0.1, "hayedo": 0.2, "pinar": 0.7}
        fit = forest_fit(("robledal",), shares, self.AFFINITY)
        assert fit["share"] == 0.22
        assert fit["weights"] == {"robledal": 1.0, "hayedo": 0.6}

    def test_without_affinity_the_answer_is_what_it_was(self):
        fit = forest_fit(("encinar",), {"pinar": 0.5, "encinar": 0.3, "hayedo": 0.2})
        assert fit["share"] == 0.3 and fit["weights"] == {"encinar": 1.0}

    def test_the_share_never_goes_over_one(self):
        fit = forest_fit(("robledal",), {"robledal": 0.8, "hayedo": 0.8}, self.AFFINITY)
        assert fit["share"] == 1.0
