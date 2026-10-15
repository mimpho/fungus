"""Forest at a point (T8 of feat/observatory-forest): ICGC toponym and land cover.

Parsing is tested with real answers recorded on 2026-10-15 (trimmed to the fields we read).
No network.
"""

import pytest

from app.services import point_forest as pf
from app.services.point_forest import LandCover


def _feat(
    layer,
    nom,
    distancia,
    tipus="Cim",
    municipi="Fogars de Montclús",
    comarca="Vallès Oriental",
    etiqueta=None,
):
    return {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [2.43, 41.77]},
        "properties": {
            "layer": layer,
            "addendum": {"tipus": tipus},
            "nom": nom,
            "municipi": municipi,
            "comarca": comarca,
            "distancia": distancia,
            "etiqueta": etiqueta or f"{nom}, {municipi}",
        },
    }


def _collection(*features):
    return {"type": "FeatureCollection", "features": list(features), "crs": {}}


def _cover_text(klass):
    return (
        "GetFeatureInfo results:\n\nLayer 'cobertes_2024'\n  Feature 0: \n"
        "    x = '271062.11'\n    y = '5127263.7'\n    value_0 = '18'\n"
        f"    class = '{klass}'\n    red = '121'\n    green = '121'\n    blue = '122'\n"
    )


class TestToponym:
    def test_santa_fe_gives_the_nearest_topo2_name(self):
        data = _collection(
            _feat("topo2", "Coll Pregon", 0.136, "Orografia"),
            _feat("topo2", "Turó de l'Home", 0.222),
            _feat("topo2", "Puig Sesolles", 0.286),
        )
        top = pf.parse_toponym(data)
        assert (top.name, top.label, top.kind) == (
            "Coll Pregon",
            "Coll Pregon, Fogars de Montclús",
            "Orografia",
        )
        assert (top.municipality, top.comarca, top.distance_km) == (
            "Fogars de Montclús",
            "Vallès Oriental",
            0.136,
        )

    def test_the_nearest_overall_wins_even_though_topo1_is_listed_first(self):
        # Vic: the service lists the topo1 centre (0.064 km) before the topo2 town hall (0.024 km)
        data = _collection(
            _feat("topo1", "Vic", 0.064, "Cap de municipi", "Vic", "Osona", etiqueta="Vic"),
            _feat("topo2", "Ajuntament de Vic", 0.024, "Edificació", "Vic", "Osona"),
        )
        assert pf.parse_toponym(data).name == "Ajuntament de Vic"

    @pytest.mark.parametrize("data", [_collection(), {}, None, [], "x", {"features": None}])
    def test_empty_or_odd_answers_give_none(self, data):
        # outside Catalonia or at sea the service answers an empty collection
        assert pf.parse_toponym(data) is None

    def test_features_without_a_name_are_ignored(self):
        bad = _feat("topo2", "", 0.01)
        assert (
            pf.parse_toponym(_collection(bad, _feat("topo2", "Font Beç", 0.4))).name == "Font Beç"
        )

    def test_a_missing_distance_ranks_last(self):
        no_dist = _feat("topo2", "Sense distància", None)
        no_dist["properties"].pop("distancia")
        assert (
            pf.parse_toponym(_collection(no_dist, _feat("topo2", "Amb distància", 0.9))).name
            == "Amb distància"
        )


class TestLandCover:
    @pytest.mark.parametrize(
        ("klass", "macro"),
        [
            ("223. (9) Boscos densos d'esclerofil·les i laurifolis", "esclerofilo"),
            ("221. (7) Boscos densos d'aciculifolis", "conifera"),
            ("222. (8) Boscos densos de caducifolis", "caducifolio"),
            ("224. (10) Boscos clars", "bosque_otro"),
        ],
    )
    def test_forest_classes_give_their_macrotype(self, klass, macro):
        cover = pf.parse_cover(_cover_text(klass))
        assert cover.forest is True and cover.macrotype == macro

    @pytest.mark.parametrize(
        "klass",
        ["232. (18) Roquissars i congestes", "341. (21) Casc urbà", "342. (22) Eixample"],
    )
    def test_rock_and_urban_are_not_forest(self, klass):
        cover = pf.parse_cover(_cover_text(klass))
        assert cover.forest is False and cover.macrotype is None

    def test_the_code_and_name_are_split(self):
        cover = pf.parse_cover(_cover_text("341. (21) Casc urbà"))
        assert (cover.code, cover.name) == (21, "Casc urbà")

    def test_the_sea_has_no_data_which_is_not_the_same_as_no_forest(self):
        cover = pf.parse_cover(_cover_text("0. (0) Sense dades"))
        assert cover.forest is None and cover.code == 0

    def test_outside_the_map_the_answer_has_no_results(self):
        assert pf.parse_cover("GetFeatureInfo results:\n\n  Search returned no results.\n") is None

    def test_a_service_exception_is_not_a_cover(self):
        assert (
            pf.parse_cover(
                "<ServiceExceptionReport>Unsupported INFO_FORMAT</ServiceExceptionReport>"
            )
            is None
        )
        assert pf.parse_cover(None) is None

    def test_a_class_without_the_numbering_keeps_its_name(self):
        cover = pf.parse_cover(_cover_text("Boscos densos d'aciculifolis"))
        assert cover.code is None and cover.macrotype == "conifera"


class TestSpeciesForestTypes:
    @pytest.mark.parametrize(
        ("macro", "expected"),
        [
            ("conifera", {"pinar", "mixto"}),
            ("esclerofilo", {"encinar", "mixto"}),
            ("caducifolio", {"robledal", "hayedo", "mixto"}),
        ],
    )
    def test_each_macrotype_maps_to_catalogue_forest_types(self, macro, expected):
        assert pf.species_forest_types(LandCover(1, "x", macro, True)) == expected

    @pytest.mark.parametrize(
        "cover",
        [
            None,
            LandCover(0, "Sense dades", None, None),
            LandCover(9, "x", "bosque_otro", True),
            LandCover(21, "Casc urbà", None, False),
        ],
    )
    def test_unknown_or_unmappable_excludes_nobody(self, cover):
        assert pf.species_forest_types(cover) is None


class TestForestBlock:
    def test_a_forest_point(self):
        cover = LandCover(9, "Boscos densos d'esclerofil·les i laurifolis", "esclerofilo", True)
        block = pf.forest_block(cover, None, 300)
        assert block["forest"] is True and block["macrotype"] == "esclerofilo"
        assert block["composition"] is None and block["reason"] is None
        assert block["species_forest_types"] == ["encinar", "mixto"]
        assert block["toponym"] is None  # a failing geocoder is never an error
        assert block["radius_m"] == 300

    def test_no_forest_says_so(self):
        block = pf.forest_block(LandCover(21, "Casc urbà", None, False), None, 300)
        assert block["forest"] is False and block["reason"] == "no_forest"
        assert block["species_forest_types"] is None

    def test_an_unknown_cover_is_not_no_forest(self):
        block = pf.forest_block(None, None, 300)
        assert block["forest"] is None and block["reason"] is None and block["land_cover"] is None


class TestFetchWrappers:
    async def test_the_cover_is_cached_and_failures_are_not(self):
        pf._cover_cache.clear()
        calls = []
        cover = LandCover(9, "x", "esclerofilo", True)

        async def fetch(lat, lon):
            calls.append((lat, lon))
            return cover if len(calls) > 1 else None

        assert await pf.land_cover(41.7745, 2.4350, fetch) is None  # failure, not cached
        assert await pf.land_cover(41.7745, 2.4350, fetch) is cover  # retried
        assert await pf.land_cover(41.77451, 2.43501, fetch) is cover  # same ~10 m key
        assert len(calls) == 2


class TestSnapshotEntries:
    SNAP = {"score": 42, "date": "2026-10-13"}

    def test_two_types_come_sorted_by_share_each_with_the_same_shape(self):
        # zone-003 coordinates: esclerofilo 50 %, conifera 46 %
        composition = [
            {"forest_type": "conifera", "share": 46},
            {"forest_type": "esclerofilo", "share": 50},
        ]
        entries = pf.snapshot_entries(self.SNAP, None, composition)
        assert [(e["forest_type"], e["share"]) for e in entries] == [
            ("esclerofilo", 50),
            ("conifera", 46),
        ]
        assert all(e["score"] == 42 for e in entries)

    def test_without_composition_the_macrotype_is_the_single_entry(self):
        cover = LandCover(9, "x", "esclerofilo", True)
        assert pf.snapshot_entries(self.SNAP, cover) == [
            {"forest_type": "esclerofilo", "share": None, **self.SNAP}
        ]

    @pytest.mark.parametrize("cover", [None, LandCover(21, "Casc urbà", None, False)])
    def test_no_or_unknown_forest_gives_one_generic_entry(self, cover):
        assert pf.snapshot_entries(self.SNAP, cover) == [
            {"forest_type": None, "share": None, **self.SNAP}
        ]
