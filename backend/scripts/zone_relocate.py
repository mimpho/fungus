"""
Propose better coordinates for zones whose point is not in their forest.

The original zones came from early mock data with approximate points (a village, the middle
of a comarca…); for many, the terrain at the point is far from the stored altitude, and the
climate is fetched there. For each zone this script:

1. finds the named place with Nominatim (OpenStreetMap geocoder): "Hayedo de Ordesa, Huesca";
2. inside that place (or a few km around it), lists the OpenStreetMap forests and scores them:
   leaf type and genus matching the zone's forest type, size, distance to the named place;
3. proposes the centre of the best one, with its altitude from OpenTopoData, and how sure it is.

Read-only: it prints a table and writes a CSV to review (map links included). Applying the
new coordinates is a separate, reviewed step.

Usage:
    cd backend
    python -m scripts.zone_relocate --zones zone-021,zone-161 --out ~/Desktop/relocate.csv
    python -m scripts.zone_relocate --min-diff 150 --out ~/Desktop/relocate.csv   # misplaced only
"""

from __future__ import annotations

import argparse
import asyncio
import csv
import math
import re
import sys
import time
from dataclasses import dataclass

import httpx

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
OVERPASS_URLS = (
    "https://overpass-api.de/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
)
ELEVATION_URL = "https://api.opentopodata.org/v1/eudem25m,srtm30m"
HEADERS = {"User-Agent": "fungus-zone-relocate/1.0 (+https://github.com/mimpho/fungus)"}
KM_PER_DEGREE_LAT = 111.32
SEARCH_MIN_KM = 4  # half-size of the search box around a point-like place
SEARCH_MAX_KM = 15  # cap for big places (a whole sierra)
MIN_FOREST_HA = 5
MAX_PLACE_KM = 50  # a place this far from the current point is another place with the same name

# What OpenStreetMap tags say about each forest type: leaf type and genus/species.
FOREST_HINTS = {
    "pinar": {"leaf_type": "needleleaved", "genus": ("pinus",)},
    "hayedo": {"leaf_type": "broadleaved", "genus": ("fagus",)},
    "robledal": {"leaf_type": "broadleaved", "genus": ("quercus",)},
    "encinar": {"leaf_type": "broadleaved", "genus": ("quercus",)},
    "mixto": {"leaf_type": None, "genus": ()},
}
# Nominatim result kinds that name a natural place (better than a village or a road).
NATURAL_KINDS = {
    ("boundary", "protected_area"),
    ("boundary", "national_park"),
    ("leisure", "nature_reserve"),
    ("natural", "wood"),
    ("landuse", "forest"),
    ("natural", "mountain_range"),
    ("natural", "ridge"),
    ("natural", "peak"),
    ("natural", "valley"),
    ("place", "locality"),
}


# ── Pure functions (tested) ───────────────────────────────────────────────────


def km_between(a: tuple[float, float], b: tuple[float, float]) -> float:
    dy = (a[0] - b[0]) * KM_PER_DEGREE_LAT
    dx = (a[1] - b[1]) * KM_PER_DEGREE_LAT * math.cos(math.radians((a[0] + b[0]) / 2))
    return math.hypot(dx, dy)


def search_box(place: dict) -> tuple[float, float, float, float]:
    """(south, west, north, east) to look for forests: the place's own box, within limits."""
    lat, lon = float(place["lat"]), float(place["lon"])
    s, n, w, e = (float(v) for v in place["boundingbox"])
    half_y = min(max((n - s) / 2 * KM_PER_DEGREE_LAT, SEARCH_MIN_KM), SEARCH_MAX_KM)
    km_lon = KM_PER_DEGREE_LAT * math.cos(math.radians(lat))
    half_x = min(max((e - w) / 2 * km_lon, SEARCH_MIN_KM), SEARCH_MAX_KM)
    dy, dx = half_y / KM_PER_DEGREE_LAT, half_x / km_lon
    return lat - dy, lon - dx, lat + dy, lon + dx


# Results that are never the place of a forest zone.
REJECTED_CATEGORIES = {"highway", "amenity", "shop", "railway", "building", "office", "tourism"}
FOREST_WORDS = re.compile(
    r"^(hayedo|pinar|robledal|encinar|bosque|selva|monte|fageda|pineda|roureda|alzinar)"
    r"\s+(de\s+la\s+|de\s+los\s+|de\s+las\s+|del\s+|de\s+l'|de\s+|d')?",
    re.IGNORECASE,
)


def name_variants(name: str) -> list[str]:
    """The zone name, then the place alone: "Pinar de la Cerdanya" → "Cerdanya"."""
    bare = FOREST_WORDS.sub("", name).strip()
    return [name] if not bare or bare == name else [name, bare]


def pick_place(results: list[dict], current: tuple[float, float] | None = None) -> dict | None:
    """Prefer natural places (park, forest, sierra), then towns; never roads, stops or shops.

    With the zone's current point, places further than MAX_PLACE_KM are dropped (a name can
    exist elsewhere: "Ordesa" is also a spot in Los Monegros) and the closest wins a tie.
    """
    usable = [r for r in results if r.get("category") not in REJECTED_CATEGORIES]
    if current is not None:
        usable = [
            r for r in usable
            if km_between(current, (float(r["lat"]), float(r["lon"]))) <= MAX_PLACE_KM
        ]  # fmt: skip
        usable.sort(key=lambda r: km_between(current, (float(r["lat"]), float(r["lon"]))))
    if not usable:
        return None
    natural = [r for r in usable if (r.get("category"), r.get("type")) in NATURAL_KINDS]
    return (natural or usable)[0]


def around_point(lat: float, lon: float) -> dict:
    """A pseudo-place at the zone's current point, when no named place is found nearby."""
    return {
        "lat": str(lat),
        "lon": str(lon),
        "boundingbox": [str(lat), str(lat), str(lon), str(lon)],
        "category": "zone",
        "type": "current_point",
        "display_name": "(around the current point)",
    }


@dataclass(frozen=True)
class Forest:
    lat: float
    lon: float
    hectares: float
    match: str  # genus | leaf | none | conflict
    tags: str


def type_match(tags: dict, forest_type: str) -> str:
    hints = FOREST_HINTS.get(forest_type, FOREST_HINTS["mixto"])
    text = " ".join(str(tags.get(k, "")) for k in ("genus", "species", "taxon", "wood")).lower()
    if hints["genus"] and any(g in text for g in hints["genus"]):
        return "genus"
    leaf = tags.get("leaf_type")
    if not leaf and tags.get("wood") in ("coniferous", "deciduous"):
        leaf = "needleleaved" if tags["wood"] == "coniferous" else "broadleaved"
    if hints["leaf_type"] and leaf:
        return "leaf" if leaf == hints["leaf_type"] else "conflict"
    return "none"


def forests_from_overpass(elements: list[dict], forest_type: str) -> list[Forest]:
    out = []
    for el in elements:
        bounds = el.get("bounds")
        if not bounds:
            continue
        center = el.get("center") or {
            "lat": (bounds["minlat"] + bounds["maxlat"]) / 2,
            "lon": (bounds["minlon"] + bounds["maxlon"]) / 2,
        }
        h = (bounds["maxlat"] - bounds["minlat"]) * KM_PER_DEGREE_LAT
        w = (
            (bounds["maxlon"] - bounds["minlon"])
            * KM_PER_DEGREE_LAT
            * math.cos(math.radians(center["lat"]))
        )
        hectares = h * w * 100 * 0.5  # a bounding box overstates the area: rough half
        if hectares < MIN_FOREST_HA:
            continue
        tags = el.get("tags", {})
        keep = ("leaf_type", "genus", "species", "wood", "name")
        out.append(
            Forest(
                center["lat"],
                center["lon"],
                hectares,
                type_match(tags, forest_type),
                ";".join(f"{k}={tags[k]}" for k in keep if k in tags),
            )
        )
    return out


MATCH_WEIGHT = {"genus": 3.0, "leaf": 2.0, "none": 1.0, "conflict": 0.2}


def best_forest(forests: list[Forest], near: tuple[float, float]) -> Forest | None:
    """Type match first, then size, then closeness to the named place."""
    if not forests:
        return None

    def score(f: Forest) -> float:
        return (
            MATCH_WEIGHT[f.match]
            * math.log1p(f.hectares)
            / (1 + km_between(near, (f.lat, f.lon)) / 5)
        )

    return max(forests, key=score)


def confidence(place: dict | None, forest: Forest | None) -> str:
    if place is None or forest is None:
        return "low"
    natural = (place.get("category"), place.get("type")) in NATURAL_KINDS
    if forest.match in ("genus", "leaf") and natural:
        return "high"
    if forest.match == "conflict":
        return "low"
    return "medium"


def osm_link(lat: float, lon: float) -> str:
    return (
        f"https://www.openstreetmap.org/?mlat={lat:.5f}&mlon={lon:.5f}#map=14/{lat:.5f}/{lon:.5f}"
    )


# ── I/O ───────────────────────────────────────────────────────────────────────


class Throttle:
    """Keep at least `seconds` between calls to one service (Nominatim: 1 request/s)."""

    def __init__(self, seconds: float):
        self.seconds, self.last = seconds, 0.0

    async def wait(self) -> None:
        delay = self.last + self.seconds - time.monotonic()
        if delay > 0:
            await asyncio.sleep(delay)
        self.last = time.monotonic()


async def geocode(client, throttle, name, province) -> list[dict]:
    await throttle.wait()
    resp = await client.get(
        NOMINATIM_URL,
        params={
            "q": f"{name}, {province}",
            "format": "jsonv2",
            "countrycodes": "es",
            "limit": 5,
            "accept-language": "es",
        },
    )
    resp.raise_for_status()
    return resp.json()


async def overpass_forests(client, box) -> list[dict]:
    s, w, n, e = box
    q = f"""[out:json][timeout:45][bbox:{s},{w},{n},{e}];
(way["landuse"="forest"]; way["natural"="wood"];
 relation["landuse"="forest"]; relation["natural"="wood"];);
out bb;"""
    last: Exception | None = None
    for url in OVERPASS_URLS:
        try:
            resp = await client.post(url, data={"data": q}, timeout=60)
            if resp.status_code == 200:
                data = resp.json()
                if data.get("remark"):
                    print(f"          overpass remark: {data['remark'][:150]}", file=sys.stderr)
                return data.get("elements", [])
            last = httpx.HTTPStatusError(f"{resp.status_code}", request=resp.request, response=resp)
        except httpx.TransportError as exc:
            last = exc
        await asyncio.sleep(5)
    raise last or RuntimeError("Overpass unavailable")


async def elevations(client, throttle, points) -> list[float | None]:
    await throttle.wait()
    resp = await client.get(
        ELEVATION_URL, params={"locations": "|".join(f"{p[0]},{p[1]}" for p in points)}
    )
    resp.raise_for_status()
    return [r["elevation"] for r in resp.json()["results"]]


COLUMNS = [
    "zone_id", "name", "province", "forest_type", "stored_m", "dem_now_m", "confidence",
    "place_found", "place_kind", "new_lat", "new_lon", "dem_new_m", "moved_km",
    "forest_match", "forest_ha", "forest_tags", "map_now", "map_new",
]  # fmt: skip


async def main(args: argparse.Namespace) -> None:
    from sqlalchemy import select

    from app.database import AsyncSessionLocal, engine
    from app.models.zone import Zone

    engine.echo = False
    async with AsyncSessionLocal() as db:
        zones = (
            await db.execute(
                select(
                    Zone.id,
                    Zone.name,
                    Zone.province,
                    Zone.lat,
                    Zone.lon,
                    Zone.elevation_m,
                    Zone.forest_type,
                )  # fmt: skip
                .where(Zone.active.is_(True))
                .order_by(Zone.id)
            )
        ).all()
    wanted = set(args.zones.split(",")) if args.zones else None
    zones = [z for z in zones if not wanted or z.id in wanted]

    out = open(args.out, "w", newline="") if args.out else sys.stdout  # noqa: SIM115
    writer = csv.writer(out)
    writer.writerow(COLUMNS)
    nominatim, topo = Throttle(1.1), Throttle(1.1)
    async with httpx.AsyncClient(timeout=30, headers=HEADERS) as client:
        for z in zones:
            try:
                (dem_now,) = await elevations(client, topo, [(z.lat, z.lon)])
                if (
                    args.min_diff
                    and z.elevation_m is not None
                    and dem_now is not None
                    and abs(dem_now - z.elevation_m) <= args.min_diff
                ):
                    continue  # the point already matches its altitude
                place = None
                for variant in name_variants(z.name):
                    candidate = pick_place(
                        await geocode(client, nominatim, variant, z.province), (z.lat, z.lon)
                    )
                    if candidate and (
                        place is None
                        or (candidate.get("category"), candidate.get("type")) in NATURAL_KINDS
                    ):
                        place = candidate
                    if place and (place.get("category"), place.get("type")) in NATURAL_KINDS:
                        break
                forest = None
                if place is None:
                    place = around_point(z.lat, z.lon)
                if place:
                    elements = await overpass_forests(client, search_box(place))
                    near = (float(place["lat"]), float(place["lon"]))
                    forest = best_forest(forests_from_overpass(elements, z.forest_type), near)
                dem_new = None
                if forest:
                    (dem_new,) = await elevations(client, topo, [(forest.lat, forest.lon)])
            except (httpx.HTTPError, RuntimeError) as exc:
                print(f"{z.id:9} ERROR {exc}", file=sys.stderr, flush=True)
                continue
            conf = confidence(place, forest)
            row = [
                z.id, z.name, z.province, z.forest_type, z.elevation_m,
                round(dem_now) if dem_now is not None else "", conf,
                place.get("display_name", "")[:80] if place else "",
                f"{place.get('category')}/{place.get('type')}" if place else "",
                f"{forest.lat:.5f}" if forest else "", f"{forest.lon:.5f}" if forest else "",
                round(dem_new) if dem_new is not None else "",
                round(km_between((z.lat, z.lon), (forest.lat, forest.lon)), 1) if forest else "",
                forest.match if forest else "", round(forest.hectares) if forest else "",
                forest.tags if forest else "", osm_link(z.lat, z.lon),
                osm_link(forest.lat, forest.lon) if forest else "",
            ]  # fmt: skip
            writer.writerow(row)
            if out is not sys.stdout:
                out.flush()
            print(
                f"{z.id:9} {conf:6} stored {z.elevation_m}  now {row[5]}  new {row[11]}  "
                f"moved {row[12]} km  {row[13]}  {z.name}",
                file=sys.stderr,
                flush=True,
            )
    if out is not sys.stdout:
        out.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Propose zone coordinates inside their forest")
    parser.add_argument("--zones", default=None, help="Comma-separated zone IDs (default: all)")
    parser.add_argument(
        "--min-diff",
        type=float,
        default=None,
        help="Only zones whose stored altitude differs from the terrain by more than this (m)",
    )
    parser.add_argument("--out", default=None, help="CSV file (default: stdout)")
    asyncio.run(main(parser.parse_args()))
