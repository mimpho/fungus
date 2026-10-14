"""Suggest corrected coordinates for zones whose point does not fall in the stored forest type.

Stdlib only; reuses probe_geo.py (same folder). For every row of a CSV (name,lat,lon,expected)
it checks the ICGC land cover around the point; when the stored type is not found there, it
looks for the nearest stand of that type within --radius metres (rings of 8 directions) and
writes a proposal. Nothing is changed in the database: a person validates every row.

    python3 backend/scripts/suggest_forest_points.py --csv zones_curated.csv \
        --out forest_suggestions.csv
    python3 backend/scripts/suggest_forest_points.py --selftest      # no network

Statuses in the output:
    ok          the point is already in a stand of the stored type (nothing to do)
    moved       a stand of the stored type exists nearby: new_lat/new_lon is a proposal
    no_match    forest of another type, or none, within the radius: review the stored type
    no_type     the stored type has no land-cover equivalent (not checked)
"""

from __future__ import annotations

import argparse
import csv
import math
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import probe_geo as pg  # noqa: E402

RINGS_M = (150, 300, 500, 750, 1000)
BEARINGS = tuple(range(0, 360, 45))
MIN_INSIDE = 4  # of the 5 sample points around a candidate must show the wanted type
MAX_TRIES = 4  # candidates verified per zone, nearest first


def offset_point(lat: float, lon: float, metres: float, bearing_deg: float) -> tuple[float, float]:
    """Point `metres` away from (lat, lon) towards `bearing_deg` (0 = north, 90 = east)."""
    rad = math.radians(bearing_deg)
    dlat = metres * math.cos(rad) / 111320.0
    dlon = metres * math.sin(rad) / (111320.0 * math.cos(math.radians(lat)))
    return lat + dlat, lon + dlon


def distance_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    dy = (lat2 - lat1) * 111320.0
    dx = (lon2 - lon1) * 111320.0 * math.cos(math.radians((lat1 + lat2) / 2))
    return math.hypot(dx, dy)


def ring_points(lat: float, lon: float, radius_m: float) -> list[tuple[float, float, int, int]]:
    """(lat, lon, ring metres, bearing) for every ring up to radius_m, nearest ring first."""
    points = []
    for ring in RINGS_M:
        if ring > radius_m:
            break
        for bearing in BEARINGS:
            la, lo = offset_point(lat, lon, ring, bearing)
            points.append((la, lo, ring, bearing))
    return points


def single_macro(lat: float, lon: float) -> tuple[str, str | None]:
    info = pg.feature_info(pg.COBERTES_WMS, pg.COBERTES_LAYER, lat, lon)
    cls = pg.parse_class(info["raw"]) if info["format"] else None
    return pg.macrotype(cls), cls


def inside_stand(lat: float, lon: float, want: str) -> tuple[bool, str | None]:
    """True when at least MIN_INSIDE of the 5 sample points show the wanted macrotype."""
    res = pg.cobertes_vote(lat, lon)
    return res["macros"].count(want) >= MIN_INSIDE, res["classes"][0]


def process(name: str, lat: float, lon: float, expected: str, args: argparse.Namespace) -> dict:
    row = {"name": name, "old_lat": lat, "old_lon": lon, "expected": expected, "status": "",
           "new_lat": "", "new_lon": "", "dist_m": "", "found_class": "", "note": ""}
    want = pg.EXPECTED_MACRO.get(expected.strip().lower())
    if want is None:
        row["status"] = "no_type"
        return row
    here = pg.cobertes_vote(lat, lon)
    if here["vote"] == want:
        row["status"], row["found_class"] = "ok", here["classes"][0] or ""
        return row
    hits = []
    seen_other = set()
    for la, lo, ring, bearing in ring_points(lat, lon, args.radius):
        macro, cls = single_macro(la, lo)
        time.sleep(args.pace)
        if macro == want:
            hits.append((ring, bearing, la, lo))
        elif macro in ("conifera", "esclerofilo", "caducifolio", "bosque_otro"):
            seen_other.add(macro)
        if len(hits) >= MAX_TRIES * 2:
            break
    for ring, bearing, la, lo in hits[:MAX_TRIES]:
        ok, cls = inside_stand(la, lo, want)
        if ok:
            row.update(status="moved", new_lat=round(la, 5), new_lon=round(lo, 5),
                       dist_m=round(distance_m(lat, lon, la, lo)), found_class=cls or "",
                       note=f"{ring} m towards {bearing} deg")
            return row
    row["status"] = "no_match"
    other = ", ".join(sorted(seen_other)) or "no forest"
    row["note"] = f"no {want} stand inside {args.radius} m; saw: {other}"
    return row


def selftest() -> int:
    la, lo = offset_point(42.0, 2.0, 1000, 0)
    assert abs(distance_m(42.0, 2.0, la, lo) - 1000) < 5
    la, lo = offset_point(42.0, 2.0, 500, 90)
    assert abs(distance_m(42.0, 2.0, la, lo) - 500) < 5 and lo > 2.0
    pts = ring_points(42.0, 2.0, 500)
    assert len(pts) == 3 * 8 and pts[0][2] == 150, len(pts)
    assert len(ring_points(42.0, 2.0, 1000)) == 5 * 8
    print("selftest OK")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--csv", help="CSV with columns name,lat,lon,expected")
    ap.add_argument("--out", default="forest_suggestions.csv")
    ap.add_argument("--radius", type=int, default=1000, help="search radius in metres")
    ap.add_argument("--pace", type=float, default=0.15, help="seconds between requests")
    ap.add_argument("--selftest", action="store_true")
    args = ap.parse_args()
    if args.selftest:
        return selftest()
    if not args.csv:
        ap.error("--csv is required")
    rows = []
    for name, lat, lon, expected in pg.load_points(args.csv):
        row = process(name, lat, lon, expected, args)
        rows.append(row)
        extra = ""
        if row["new_lat"] != "":
            extra = f" -> {row['new_lat']}, {row['new_lon']} ({row['dist_m']} m)"
        print(f"{row['status']:9} {name[:40]:40} {expected:9}{extra} {row['note']}")
    cols = list(rows[0].keys()) + ["maps_old", "maps_new"]
    with open(args.out, "w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=cols)
        writer.writeheader()
        for row in rows:
            row["maps_old"] = f"https://www.google.com/maps?q={row['old_lat']},{row['old_lon']}"
            row["maps_new"] = (f"https://www.google.com/maps?q={row['new_lat']},{row['new_lon']}"
                               if row["new_lat"] != "" else "")
            writer.writerow(row)
    tally = {s: sum(1 for r in rows if r["status"] == s) for s in
             ("ok", "moved", "no_match", "no_type")}
    print(f"\n{tally}  requests: {pg.Counter.requests}, failed: {pg.Counter.failures}")
    print(f"Written to {args.out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
