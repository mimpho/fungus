"""
Compute the altitude band of each zone: between which altitudes there is forest.

A zone is stored as one point, but its forest spans a range of altitudes. This script:

1. samples a grid of points in a circle around the zone (3 km by default, wider for zones
   listed in ZONE_RADIUS_KM);
2. keeps only the points that fall inside a forest in OpenStreetMap (landuse=forest or
   natural=wood, via the Overpass API), so meadows, rock, summits and villages do not count;
3. gets their altitude from the Open-Meteo Elevation API (Copernicus DEM, ~90 m);
4. takes the central band (p10–p90), caps it at the usual upper limit of the zone's forest
   type and makes sure the zone's own point is inside.

If OpenStreetMap has too few forest points around a zone, the band is computed on every
point and the line is flagged, so it can be checked by hand.

Dry run by default: prints the proposal (works before migration 014 is deployed). --apply
writes elevation_min_m / elevation_max_m (and elevation_m with --update-point) and needs
migration 014 applied to that database. Cost per zone: 1 Overpass query and 2–3 Open-Meteo
calls, from the same daily Open-Meteo budget as the ingest.

Usage:
    cd backend
    python -m scripts.zone_elevation_ranges --zones zone-030,zone-201,zone-202
    python -m scripts.zone_elevation_ranges --zones zone-030 --apply
    python -m scripts.zone_elevation_ranges --apply            # every active zone
"""

from __future__ import annotations

import argparse
import asyncio
import logging
import math
from collections.abc import Iterable
from dataclasses import dataclass

import httpx

ELEVATION_URL = "https://api.open-meteo.com/v1/elevation"
OVERPASS_URL = "https://overpass-api.de/api/interpreter"
# Overpass answers 406 to generic client User-Agents: identify the app.
HEADERS = {"User-Agent": "fungus-zone-elevation/1.0 (+https://github.com/mimpho/fungus)"}
MAX_POINTS_PER_CALL = 100
MAX_GRID_POINTS = 200  # the grid spacing grows with the radius to stay under this
MIN_STEP_M = 500
MIN_FOREST_POINTS = 10  # fewer forest points than this → use every point and flag it
KM_PER_DEGREE_LAT = 111.32
DEFAULT_RADIUS_KM = 3.0

# Zones whose forest spreads further than the default circle. Keep the reason next to it.
ZONE_RADIUS_KM = {
    # Setcases: the point is at Vallter (1,885 m); the forest goes down the valley to the
    # village (~1,280 m), about 5 km away. Decided 2026-10-10.
    "zone-030": 6.0,
}

# Rough upper limit of each forest type in the Iberian mountains (m). A safety cap on top of
# the forest mask; the zone's own point always stays inside its band.
FOREST_MAX_M = {
    "pinar": 2300,  # Pinus uncinata reaches ~2,300–2,400 m in the Pyrenees
    "mixto": 2000,
    "hayedo": 1800,
    "robledal": 1800,
    "encinar": 1500,
}
ROUND_TO_M = 50

log = logging.getLogger("zone_elevation_ranges")

Point = tuple[float, float]  # (lat, lon)
Segment = tuple[Point, Point]


# ── Pure functions (tested) ───────────────────────────────────────────────────


def grid_step_m(radius_km: float) -> float:
    """Grid spacing that keeps a circle of `radius_km` under MAX_GRID_POINTS points."""
    step = radius_km * 1000 * math.sqrt(math.pi / MAX_GRID_POINTS)
    return max(MIN_STEP_M, math.ceil(step / 50) * 50)


def grid_points(lat: float, lon: float, radius_km: float, step_m: float) -> list[Point]:
    """Points on a square grid of `step_m`, inside a circle of `radius_km` around (lat, lon)."""
    step_km = step_m / 1000
    n = int(radius_km / step_km)
    km_per_degree_lon = KM_PER_DEGREE_LAT * math.cos(math.radians(lat))
    points = []
    for i in range(-n, n + 1):
        for j in range(-n, n + 1):
            dy, dx = i * step_km, j * step_km
            if dx * dx + dy * dy <= radius_km**2 + 1e-9:
                points.append(
                    (round(lat + dy / KM_PER_DEGREE_LAT, 5), round(lon + dx / km_per_degree_lon, 5))
                )
    return points


def forest_shapes(overpass_elements: Iterable[dict]) -> list[list[Segment]]:
    """Forest areas from an Overpass `out geom` answer, each as a list of boundary segments.

    A closed way is one area. A multipolygon relation is one area made of all its member
    ways (outer and inner): with the even-odd rule, inner rings become holes and outer rings
    split into several ways still close up together, so no ring assembly is needed.
    """
    shapes = []
    for el in overpass_elements:
        if el.get("type") == "way":
            ways = [el.get("geometry") or []]
        elif el.get("type") == "relation":
            ways = [
                m.get("geometry") or [] for m in el.get("members", []) if m.get("type") == "way"
            ]
        else:
            continue
        segments = [
            ((a["lat"], a["lon"]), (b["lat"], b["lon"]))
            for geometry in ways
            for a, b in zip(geometry, geometry[1:], strict=False)
        ]
        if segments:
            shapes.append(segments)
    return shapes


def inside(point: Point, segments: list[Segment]) -> bool:
    """Even-odd ray casting: is the point inside the area bounded by these segments?"""
    y, x = point
    crossings = 0
    for (y1, x1), (y2, x2) in segments:
        if (y1 > y) != (y2 > y):
            x_at = x1 + (y - y1) * (x2 - x1) / (y2 - y1)
            if x_at > x:
                crossings += 1
    return crossings % 2 == 1


def in_forest(points: list[Point], shapes: list[list[Segment]]) -> list[Point]:
    return [p for p in points if any(inside(p, s) for s in shapes)]


def percentile(values: list[float], pct: float) -> float:
    """Linear-interpolated percentile (pct 0–100)."""
    v = sorted(values)
    if not v:
        raise ValueError("no values")
    k = (len(v) - 1) * pct / 100
    lo, hi = math.floor(k), math.ceil(k)
    return v[lo] + (v[hi] - v[lo]) * (k - lo)


@dataclass(frozen=True)
class Band:
    min_m: int
    max_m: int
    capped: bool  # the forest-type cap lowered the top


def elevation_band(
    elevations: list[float],
    point_m: float,
    forest_type: str | None,
    low_pct: float = 10,
    high_pct: float = 90,
) -> Band:
    """Central band of the samples, capped by forest type, always containing the zone point."""
    lo = percentile(elevations, low_pct)
    hi = percentile(elevations, high_pct)
    cap = FOREST_MAX_M.get(forest_type or "")
    capped = cap is not None and hi > cap
    if capped:
        hi = cap
    lo, hi = min(lo, point_m), max(hi, point_m)
    lo = math.floor(lo / ROUND_TO_M) * ROUND_TO_M
    hi = math.ceil(hi / ROUND_TO_M) * ROUND_TO_M
    return Band(int(lo), int(hi), capped)


# ── I/O ───────────────────────────────────────────────────────────────────────


async def fetch_elevations(client: httpx.AsyncClient, points: list[Point]) -> list[float]:
    out: list[float] = []
    for k in range(0, len(points), MAX_POINTS_PER_CALL):
        chunk = points[k : k + MAX_POINTS_PER_CALL]
        resp = await client.get(
            ELEVATION_URL,
            params={
                "latitude": ",".join(f"{p[0]}" for p in chunk),
                "longitude": ",".join(f"{p[1]}" for p in chunk),
            },
        )
        resp.raise_for_status()
        out += [float(e) for e in resp.json()["elevation"]]
    return out


async def fetch_forests(
    client: httpx.AsyncClient, lat: float, lon: float, radius_km: float
) -> list[list[Segment]]:
    r = int(radius_km * 1000)
    query = f"""[out:json][timeout:90];
(
  way["landuse"="forest"](around:{r},{lat},{lon});
  way["natural"="wood"](around:{r},{lat},{lon});
  relation["landuse"="forest"](around:{r},{lat},{lon});
  relation["natural"="wood"](around:{r},{lat},{lon});
);
out geom;"""
    resp = await client.post(OVERPASS_URL, data={"data": query}, timeout=120)
    resp.raise_for_status()
    return forest_shapes(resp.json().get("elements", []))


async def main(args: argparse.Namespace) -> None:
    from sqlalchemy import select, update

    from app.database import AsyncSessionLocal
    from app.models.zone import Zone

    # Only the columns this script reads: the dry run must work before migration 014 is deployed.
    async with AsyncSessionLocal() as db:
        zones = (
            await db.execute(
                select(Zone.id, Zone.name, Zone.lat, Zone.lon, Zone.elevation_m, Zone.forest_type)
                .where(Zone.active.is_(True))
                .order_by(Zone.id)
            )
        ).all()
    wanted = set(args.zones.split(",")) if args.zones else None
    zones = [z for z in zones if not wanted or z.id in wanted]
    if wanted and len(zones) != len(wanted):
        missing = wanted - {z.id for z in zones}
        log.warning("Not found or inactive: %s", ",".join(sorted(missing)))

    print(
        f"{'zone':9} {'forest':9} {'r km':>4} {'pts':>7} {'stored':>6} {'dem':>6}  "
        f"{'proposal':>11}  {'p10':>5} {'p50':>5} {'p90':>5} {'min':>5} {'max':>5}  name"
    )
    results = []
    async with httpx.AsyncClient(timeout=30, headers=HEADERS) as client:
        for z in zones:
            radius = args.radius_km or ZONE_RADIUS_KM.get(z.id, DEFAULT_RADIUS_KM)
            grid = grid_points(z.lat, z.lon, radius, grid_step_m(radius))
            try:
                forest = in_forest(grid, await fetch_forests(client, z.lat, z.lon, radius))
                masked = len(forest) >= MIN_FOREST_POINTS
                sample = forest if masked else grid
                (point_m,) = await fetch_elevations(client, [(z.lat, z.lon)])
                elevations = await fetch_elevations(client, sample)
            except httpx.HTTPError as exc:
                log.error("%s: request failed: %s", z.id, exc)
                continue
            band = elevation_band(elevations, point_m, z.forest_type, args.low_pct, args.high_pct)
            results.append((z, point_m, band))
            p10, p50, p90 = (percentile(elevations, q) for q in (10, 50, 90))
            stored = str(z.elevation_m or "-")
            pts = f"{len(forest)}/{len(grid)}" + ("" if masked else "!")
            print(
                f"{z.id:9} {(z.forest_type or '-'):9} {radius:4.0f} {pts:>7} {stored:>6} "
                f"{point_m:6.0f}  {band.min_m:>5}–{band.max_m:<5}{'*' if band.capped else ' '} "
                f"{p10:5.0f} {p50:5.0f} {p90:5.0f} {min(elevations):5.0f} {max(elevations):5.0f}  "
                f"{z.name}"
            )
            await asyncio.sleep(1.0)  # be gentle with the public Overpass server
    print("pts = forest points / grid points; ! = too few forest points in OpenStreetMap, ")
    print("      band computed on every point: check by hand")
    print("*   = top lowered to the forest type's usual limit")

    if not args.apply:
        print("\nDry run: nothing written. Re-run with --apply to save.")
        return
    async with AsyncSessionLocal() as db:
        for z, point_m, band in results:
            values = {"elevation_min_m": band.min_m, "elevation_max_m": band.max_m}
            if args.update_point:
                values["elevation_m"] = round(point_m)
            await db.execute(update(Zone).where(Zone.id == z.id).values(**values))
        await db.commit()
    print(f"\nSaved {len(results)} zones.")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s — %(message)s")
    parser = argparse.ArgumentParser(description="Compute zone altitude bands (forest only)")
    parser.add_argument("--zones", default=None, help="Comma-separated zone IDs (default: all)")
    parser.add_argument(
        "--radius-km",
        type=float,
        default=None,
        help=f"Sampling radius for every zone (default {DEFAULT_RADIUS_KM} km or ZONE_RADIUS_KM)",
    )
    parser.add_argument("--low-pct", type=float, default=10, help="Bottom percentile (default 10)")
    parser.add_argument("--high-pct", type=float, default=90, help="Top percentile (default 90)")
    parser.add_argument("--apply", action="store_true", help="Write the proposal to the database")
    parser.add_argument(
        "--update-point", action="store_true", help="Also overwrite elevation_m with the DEM value"
    )
    asyncio.run(main(parser.parse_args()))
