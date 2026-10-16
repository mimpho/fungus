"""
Forest at a clicked point: nearest toponym (ICGC reverse geocoder) and land cover (ICGC
"cobertes del sòl" 2024, WMS point query).

Both services are public and Catalonia-only. Neither may break an endpoint: a failure gives
None and the caller carries on (the toponym is cosmetic; with the forest unknown nobody is
excluded by forest). The species composition (CREAF MCSC-4) is not here yet: `composition`
stays None until its grid exists.

Parsing is pure and separate from the HTTP calls, so it is tested with real answers.
"""
import logging
import math
import re
from collections import OrderedDict
from collections.abc import Awaitable, Callable
from dataclasses import dataclass, field, replace
from datetime import UTC, datetime

import httpx

log = logging.getLogger(__name__)

GEOCODER_URL = "https://eines.icgc.cat/geocodificador/invers"
COVER_URL = "https://geoserveis.icgc.cat/servei/catalunya/cobertes-sol/wms"
COVER_LAYER = "cobertes_2024"
PROVIDER = "ICGC"
COVER_LICENCE = "CC BY 4.0"  # the geocoder declares none: reported as null
TIMEOUT_S = 5.0
GEOCODER_RADIUS_KM = 1

MIN_RADIUS_M, DEFAULT_RADIUS_M, MAX_RADIUS_M = 100, 300, 1000

CONIFER, SCLEROPHYLL, BROADLEAF, OTHER_FOREST = (
    "conifera", "esclerofilo", "caducifolio", "bosque_otro",
)

# Catalogue forest types (species.forest_types) that fit each land-cover macrotype. "mixto"
# fits any forest. "prados", "jardines" and "ribera" never come from the land cover.
SPECIES_FOREST_TYPES = {
    CONIFER: frozenset({"pinar", "mixto"}),
    SCLEROPHYLL: frozenset({"encinar", "mixto"}),
    BROADLEAF: frozenset({"robledal", "hayedo", "mixto"}),
}


# Toponym kinds that are not places a forager would name: buildings and public facilities.
# "Disseminat" (scattered houses, farms) is kept: it often names the place ("Can Robert").
EXCLUDED_KINDS = frozenset({"Edificació", "Edificació Històrica", "Equipament"})


@dataclass(frozen=True)
class Toponym:
    name: str
    label: str
    kind: str | None
    layer: str | None
    municipality: str | None
    comarca: str | None
    distance_km: float | None
    raw: dict | None = field(default=None, compare=False)  # the feature as the service sent it
    fetched_at: str | None = field(default=None, compare=False)

    def as_dict(self) -> dict:
        return {
            "name": self.name, "label": self.label, "kind": self.kind, "layer": self.layer,
            "municipality": self.municipality, "comarca": self.comarca,
            "distance_km": self.distance_km,
            "provider": PROVIDER, "service": GEOCODER_URL, "licence": None,
            "retrieved_at": self.fetched_at,
        }


@dataclass(frozen=True)
class LandCover:
    code: int | None
    name: str
    macrotype: str | None  # conifera | esclerofilo | caducifolio | bosque_otro; None = no forest
    forest: bool | None  # None: the map has no data here (sea, outside Catalonia)
    raw: str | None = field(default=None, compare=False)  # the service's text answer, whole
    fetched_at: str | None = field(default=None, compare=False)

    def as_dict(self) -> dict:
        """What the ICGC said (class code and name) and where it comes from, next to the
        macrotype we derive, so the data can be reinterpreted later without asking again."""
        return {
            "provider": PROVIDER, "service": COVER_URL, "layer": COVER_LAYER,
            "code": self.code, "name": self.name, "licence": COVER_LICENCE,
            "retrieved_at": self.fetched_at,
        }


# ── Parsing ───────────────────────────────────────────────────────────────────

def parse_toponym(data: object) -> Toponym | None:
    """Nearest feature of a geocoder FeatureCollection, across both layers, buildings excluded.

    The service lists topo1 (population centres) before topo2 (other toponyms), each sorted
    by distance, so the nearest overall is not the first one. Buildings and facilities
    (EXCLUDED_KINDS) are skipped, so in a town the name is the town's. None for an empty answer
    (outside Catalonia, at sea), one with only buildings, or one that does not look like a
    FeatureCollection."""
    if not isinstance(data, dict):
        return None
    best: tuple[float, Toponym] | None = None
    for feat in data.get("features") or []:
        props = feat.get("properties") if isinstance(feat, dict) else None
        if not isinstance(props, dict) or not props.get("nom"):
            continue
        dist = props.get("distancia")
        dist = float(dist) if isinstance(dist, int | float) else None
        addendum = props.get("addendum") if isinstance(props.get("addendum"), dict) else {}
        if addendum.get("tipus") in EXCLUDED_KINDS:
            continue
        top = Toponym(
            name=props["nom"],
            label=props.get("etiqueta") or props["nom"],
            kind=addendum.get("tipus"),
            layer=props.get("layer"),
            municipality=props.get("municipi"),
            comarca=props.get("comarca"),
            distance_km=dist,
            raw=feat,
        )
        rank = math.inf if dist is None else dist
        if best is None or rank < best[0]:
            best = (rank, top)
    return best[1] if best else None


_CLASS_RE = re.compile(r"class = '(.*)'\s*$", re.MULTILINE)
_CODE_RE = re.compile(r"^(?:(\d+)\.\s*)?\((\d+)\)\s*(.+)$")


def macrotype_of(class_name: str) -> str | None:
    """Forest macrotype of a land-cover class name, None when it is not forest.

    Forest classes start with "Bosc" (dense forests) or are scrub/meadow/rock/urban/crop
    classes that do not."""
    low = class_name.lower()
    if not low.startswith("bosc"):
        return None
    if "aciculifol" in low or "conifer" in low:
        return CONIFER
    if "esclerofil" in low:
        return SCLEROPHYLL
    if "caducifol" in low:
        return BROADLEAF
    return OTHER_FOREST


def parse_cover(text: str) -> LandCover | None:
    """First feature of a GetFeatureInfo `text/plain` answer.

    None when the answer is not parseable or has no results (point outside the map's extent).
    A class "0. (0) Sense dades" (sea) is a LandCover with forest None."""
    if not isinstance(text, str):
        return None
    found = _CLASS_RE.search(text)
    if not found:
        return None
    raw = found.group(1).strip()
    match = _CODE_RE.match(raw)
    code, name = (int(match.group(2)), match.group(3).strip()) if match else (None, raw)
    if code == 0:
        return LandCover(0, name, None, None, raw=text)
    macro = macrotype_of(name)
    return LandCover(code, name, macro, macro is not None, raw=text)


def species_forest_types(cover: LandCover | None) -> frozenset[str] | None:
    """Catalogue forest types that fit the land cover, or None when they are not known
    (no data, failed call, or a forest of a type we cannot map): nobody is excluded then."""
    if cover is None or not cover.forest or cover.macrotype is None:
        return None
    return SPECIES_FOREST_TYPES.get(cover.macrotype)


# ── HTTP ──────────────────────────────────────────────────────────────────────

def _bbox_3857(lat: float, lon: float, half_m: float = 50.0) -> str:
    r = 6378137.0
    x = math.radians(lon) * r
    y = math.log(math.tan(math.pi / 4 + math.radians(lat) / 2)) * r
    return f"{x - half_m:.2f},{y - half_m:.2f},{x + half_m:.2f},{y + half_m:.2f}"


def _now_iso() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds")


async def fetch_toponym(lat: float, lon: float) -> Toponym | None:
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT_S) as client:
            resp = await client.get(
                GEOCODER_URL,
                params={"lat": lat, "lon": lon, "layers": "topo1,topo2", "size": 8,
                        "boundary.circle.radius": GEOCODER_RADIUS_KM},
            )
            resp.raise_for_status()
            top = parse_toponym(resp.json())
            return None if top is None else replace(top, fetched_at=_now_iso())
    except (httpx.HTTPError, ValueError) as exc:
        log.warning("ICGC geocoder failed for %s,%s: %s", lat, lon, exc)
        return None


async def fetch_cover(lat: float, lon: float) -> LandCover | None:
    params = {
        "SERVICE": "WMS", "VERSION": "1.3.0", "REQUEST": "GetFeatureInfo",
        "LAYERS": COVER_LAYER, "QUERY_LAYERS": COVER_LAYER, "STYLES": "",
        "CRS": "EPSG:3857", "BBOX": _bbox_3857(lat, lon), "WIDTH": 101, "HEIGHT": 101,
        "I": 50, "J": 50, "FORMAT": "image/png", "FEATURE_COUNT": 1,
        # The service only answers text/plain; application/json is a ServiceException.
        "INFO_FORMAT": "text/plain",
    }
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT_S) as client:
            resp = await client.get(COVER_URL, params=params)
            resp.raise_for_status()
            cover = parse_cover(resp.text)
            return None if cover is None else replace(cover, fetched_at=_now_iso())
    except httpx.HTTPError as exc:
        log.warning("ICGC land cover failed for %s,%s: %s", lat, lon, exc)
        return None


# Land cover hardly changes: cache per ~10 m, failures excluded so the next click retries.
_CACHE_SIZE = 5000
_cover_cache: OrderedDict[tuple[float, float], LandCover] = OrderedDict()


async def land_cover(
    lat: float, lon: float,
    fetch: Callable[[float, float], Awaitable[LandCover | None]] = fetch_cover,
) -> LandCover | None:
    key = (round(lat, 4), round(lon, 4))
    if key in _cover_cache:
        _cover_cache.move_to_end(key)
        return _cover_cache[key]
    value = await fetch(lat, lon)
    if value is not None:
        _cover_cache[key] = value
        while len(_cover_cache) > _CACHE_SIZE:
            _cover_cache.popitem(last=False)
    return value


def cover_dict(cover: LandCover | None) -> dict | None:
    return None if cover is None else cover.as_dict()


def forest_block(
    cover: LandCover | None,
    toponym: Toponym | None,
    radius_m: int,
    composition: list[dict] | None = None,
    include_raw: bool = False,
) -> dict:
    """Body of /point/forest (without the point block).

    `forest` is True/False from the land cover, None when it is unknown. `composition` is the
    species mix within `radius_m` (MCSC-4); None until that grid exists."""
    block = {
        "toponym": toponym.as_dict() if toponym else None,
        "radius_m": radius_m,
        "forest": None if cover is None else cover.forest,
        "macrotype": None if cover is None else cover.macrotype,
        "land_cover": cover_dict(cover),
        "composition": composition,
        "species_forest_types": sorted(species_forest_types(cover) or []) or None,
        "reason": "no_forest" if cover is not None and cover.forest is False else None,
    }
    if include_raw:  # the services' answers untouched, for debugging and audits only
        block["raw"] = {
            "land_cover": None if cover is None else cover.raw,
            "toponym": None if toponym is None else toponym.raw,
        }
    return block

