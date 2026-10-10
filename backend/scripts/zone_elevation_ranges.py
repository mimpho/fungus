"""
Compute the altitude band of each zone from a terrain model.

A zone is stored as one point, but a forest spans a range of altitudes. This script samples
a grid of points around the zone with the Open-Meteo Elevation API (Copernicus DEM, ~90 m),
keeps the central band of elevations (percentiles, so the deepest valley and the summit do
not count) and caps it at the usual upper limit of the zone's forest type (no pines on a
2,700 m summit).

Dry run by default: prints the proposal (works before migration 014 is deployed). --apply
writes elevation_min_m / elevation_max_m (and elevation_m with --update-point) and needs
migration 014 applied to that database. Each zone costs ceil(points / 100) API calls
(2 with the defaults), from the same daily Open-Meteo budget as the ingest.

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
from dataclasses import dataclass

import httpx

ELEVATION_URL = "https://api.open-meteo.com/v1/elevation"
MAX_POINTS_PER_CALL = 100
KM_PER_DEGREE_LAT = 111.32

# Rough upper limit of each forest type in the Iberian mountains (m). A cap, not a fact about
# the zone: the zone's own point always stays inside its band. Adjust when a zone needs it.
FOREST_MAX_M = {
    "pinar": 2300,  # Pinus uncinata reaches ~2,300–2,400 m in the Pyrenees
    "mixto": 2000,
    "hayedo": 1800,
    "robledal": 1800,
    "encinar": 1500,
}
ROUND_TO_M = 50

log = logging.getLogger("zone_elevation_ranges")


# ── Pure functions (tested) ───────────────────────────────────────────────────


def grid_points(
    lat: float, lon: float, radius_km: float, step_m: float
) -> list[tuple[float, float]]:
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


async def fetch_elevations(
    client: httpx.AsyncClient, points: list[tuple[float, float]]
) -> list[float]:
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
        f"{'zone':9} {'forest':9} {'stored':>6} {'dem':>6}  {'proposal':>11}  "
        f"{'p10':>5} {'p50':>5} {'p90':>5} {'min':>5} {'max':>5}  name"
    )
    results = []
    async with httpx.AsyncClient(timeout=30) as client:
        for z in zones:
            try:
                (point_m,) = await fetch_elevations(client, [(z.lat, z.lon)])
                elevations = await fetch_elevations(
                    client, grid_points(z.lat, z.lon, args.radius_km, args.step_m)
                )
            except httpx.HTTPError as exc:
                log.error("%s: elevation request failed: %s", z.id, exc)
                continue
            band = elevation_band(elevations, point_m, z.forest_type, args.low_pct, args.high_pct)
            results.append((z, point_m, band))
            p10, p50, p90 = (percentile(elevations, q) for q in (10, 50, 90))
            stored = str(z.elevation_m or "-")
            print(
                f"{z.id:9} {(z.forest_type or '-'):9} {stored:>6} {point_m:6.0f}  "
                f"{band.min_m:>5}–{band.max_m:<5}{'*' if band.capped else ' '} "
                f"{p10:5.0f} {p50:5.0f} {p90:5.0f} {min(elevations):5.0f} {max(elevations):5.0f}  "
                f"{z.name}"
            )
            await asyncio.sleep(0.2)  # well under Open-Meteo's 600 calls/min
    print("* top lowered to the forest type's usual limit")

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
    parser = argparse.ArgumentParser(description="Compute zone altitude bands from a terrain model")
    parser.add_argument(
        "--zones", default=None, help="Comma-separated zone IDs (default: all active)"
    )
    parser.add_argument(
        "--radius-km", type=float, default=3.0, help="Sampling radius (default 3 km)"
    )
    parser.add_argument("--step-m", type=float, default=500, help="Grid spacing (default 500 m)")
    parser.add_argument("--low-pct", type=float, default=10, help="Bottom percentile (default 10)")
    parser.add_argument("--high-pct", type=float, default=90, help="Top percentile (default 90)")
    parser.add_argument("--apply", action="store_true", help="Write the proposal to the database")
    parser.add_argument(
        "--update-point", action="store_true", help="Also overwrite elevation_m with the DEM value"
    )
    asyncio.run(main(parser.parse_args()))
