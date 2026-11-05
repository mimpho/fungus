"""
Audit of the stored climate against a fresh Open-Meteo pull. Read-only: it writes nothing.

For each zone it asks the archive API for the same days at the zone's *current* coordinates (the
way the backfill does, through OpenMeteoConnector) and compares them with climate_history. A zone
whose stored series differs from the fresh one was fetched at other coordinates or through
another pipeline (forecast API instead of archive), and its history should be rebuilt.

The last --seam-days days (14 by default) of the window are reported apart: they are
expected to differ (the daily ingest stores them from the forecast API, the archive
replaces them later). The verdict only looks at the older days.

Default zones: the active zones with a verified altitude range (the curated Catalan ones).
Cost: about days / 14 API calls per zone (a 180-day window is ~13 calls per zone).

Usage:
    cd backend
    python -m scripts.audit_zone_climate
    python -m scripts.audit_zone_climate --days 365 --zones zone-201,zone-003 --out ../audit.json
"""

from __future__ import annotations

import argparse
import asyncio
import json
import math
import sys
from datetime import date, timedelta

FIELDS = [
    ("tmax", "temp_max_c"), ("tmin", "temp_min_c"), ("tmean", "temp_avg_c"),
    ("rain", "precipitation_mm"), ("wind", "wind_kmh"), ("soil", "soil_temp_c"),
    ("rh", "humidity_pct"),
]  # fmt: skip
# mean absolute difference above which a zone is flagged (stored values are rounded to 0.1)
LIMITS = {"tmean": 0.3, "tmax": 0.5, "tmin": 0.5, "soil": 0.7, "rh": 3.0, "wind": 1.0}
RAIN_REL_LIMIT = 0.05  # relative difference of the rain total
SEAM_DAYS = 14
MIN_DAYS = 30


def _num(value):
    return None if value is None else float(value)


def stats(stored, fresh, attr, days):
    """{'n', 'bias' (stored - fresh), 'mae'} over the days both have, or None."""
    diffs = []
    for d in days:
        a, b = _num(getattr(stored[d], attr)), _num(getattr(fresh[d], attr))
        if a is not None and b is not None:
            diffs.append(a - b)
    if not diffs:
        return None
    return {
        "n": len(diffs),
        "bias": sum(diffs) / len(diffs),
        "mae": sum(abs(x) for x in diffs) / len(diffs),
    }


def summarize_zone(stored: dict, fresh: dict, seam_from: date) -> dict:
    """Compare two {date: row} dicts. Older days drive the verdict, recent ones are the seam."""
    days = sorted(set(stored) & set(fresh))
    old = [d for d in days if d < seam_from]
    recent = [d for d in days if d >= seam_from]
    out = {"n": len(old), "n_seam": len(recent), "vars": {}, "seam": {}}
    for key, attr in FIELDS:
        out["vars"][key] = stats(stored, fresh, attr, old)
        out["seam"][key] = stats(stored, fresh, attr, recent)
    out["rain_total"] = [
        sum(_num(stored[d].precipitation_mm) or 0.0 for d in old),
        sum(_num(fresh[d].precipitation_mm) or 0.0 for d in old),
    ]
    return out


def verdict(summary: dict) -> tuple[str, list[str]]:
    if summary["n"] < MIN_DAYS:
        return "FEW DAYS", [f"only {summary['n']} comparable days"]
    reasons = []
    for key, limit in LIMITS.items():
        s = summary["vars"][key]
        if s and s["mae"] > limit:
            reasons.append(f"{key} mae {s['mae']:.2f}")
    rain_s, rain_f = summary["rain_total"]
    if rain_f > 20 and abs(rain_s - rain_f) / rain_f > RAIN_REL_LIMIT:
        reasons.append(f"rain {rain_s:.0f} vs {rain_f:.0f} mm")
    return ("DIFFERS", reasons) if reasons else ("OK", [])


def km(lat1, lon1, lat2, lon2) -> float:
    dy = (lat1 - lat2) * 111.2
    dx = (lon1 - lon2) * 111.2 * math.cos(math.radians((lat1 + lat2) / 2))
    return math.hypot(dx, dy)


def fmt(s, key="mae"):
    return "n/a" if not s else f"{s[key]:.2f}"


async def main(args: argparse.Namespace) -> None:
    from sqlalchemy import select

    from app.connectors.open_meteo import OpenMeteoConnector
    from app.database import AsyncSessionLocal, engine
    from app.models.climate_history import ClimateHistory
    from app.models.zone import Zone

    engine.echo = False
    end = date.fromisoformat(args.end) if args.end else date.today() - timedelta(days=7)
    start = end - timedelta(days=args.days - 1)
    seam_from = end - timedelta(days=args.seam_days - 1)

    async with AsyncSessionLocal() as db:
        query = select(Zone).where(Zone.active.is_(True))
        if args.zones:
            query = query.where(Zone.id.in_([z.strip() for z in args.zones.split(",")]))
        else:
            query = query.where(Zone.elevation_min_m.is_not(None))
        zones = list((await db.execute(query.order_by(Zone.id))).scalars())
        ids = [z.id for z in zones]
        rows = (await db.execute(
            select(ClimateHistory).where(
                ClimateHistory.zone_id.in_(ids),
                ClimateHistory.date >= start,
                ClimateHistory.date <= end,
            )
        )).scalars()
        stored: dict[str, dict] = {zid: {} for zid in ids}
        for r in rows:
            stored[r.zone_id][r.date] = r

    calls = len(zones) * max(1.0, args.days / 14)
    print(f"{len(zones)} zones, {start} .. {end} ({args.days} days), ~{calls:.0f} API calls")
    if calls > args.max_calls:
        sys.exit(f"Over --max-calls {args.max_calls}; lower --days or pass --max-calls")

    results = []
    for z in zones:
        conn = OpenMeteoConnector(z.id, z.lat, z.lon)
        try:
            raw = await conn._request(start, end, archive=True)
            fresh = {r.date: r for r in conn._parse(raw, start, end)}
        except Exception as exc:  # keep going: one zone must not stop the audit
            reason = f"{type(exc).__name__}: {exc}"
            print(f"{z.id}: FAILED ({reason})")
            results.append({"zone": z.id, "error": reason})
            continue
        summary = summarize_zone(stored[z.id], fresh, seam_from)
        label, reasons = verdict(summary)
        cell = (raw.get("latitude"), raw.get("longitude"), raw.get("elevation"))
        v, sm = summary["vars"], summary["seam"]
        rain_s, rain_f = summary["rain_total"]
        print(
            f"{z.id:9s} {(z.name or '')[:22]:22s} n={summary['n']:3d} "
            f"tmean {fmt(v['tmean'], 'bias')}/{fmt(v['tmean'])} tmax {fmt(v['tmax'])} "
            f"soil {fmt(v['soil'])} rh {fmt(v['rh'])} rain {rain_s:.0f}/{rain_f:.0f} mm "
            f"-> {label} {', '.join(reasons)} | seam {summary['n_seam']}d: "
            f"tmean {fmt(sm['tmean'])} soil {fmt(sm['soil'])}"
        )
        results.append({
            "zone": z.id, "name": z.name, "lat": z.lat, "lon": z.lon,
            "stored_elevation_m": z.elevation_m, "grid": cell,
            "grid_km": round(km(z.lat, z.lon, cell[0], cell[1]), 1) if cell[0] else None,
            "verdict": label, "reasons": reasons, "summary": summary,
        })  # fmt: skip
        await asyncio.sleep(args.pace)

    ok = [r["zone"] for r in results if r.get("verdict") == "OK"]
    bad = [r["zone"] for r in results if r.get("verdict") in ("DIFFERS", "FEW DAYS")]
    print(f"\nOK: {len(ok)}  DIFFERS/FEW DAYS: {len(bad)}  failed: "
          f"{sum(1 for r in results if 'error' in r)}")
    if bad:
        print("To rebuild:", ", ".join(bad))
    if args.out:
        with open(args.out, "w", encoding="utf-8") as fh:
            json.dump(results, fh, indent=2, default=str)
        print("Results written to", args.out)


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="Stored climate vs a fresh Open-Meteo archive pull")
    ap.add_argument("--zones", help="comma list; default: active zones with an altitude range")
    ap.add_argument("--days", type=int, default=180)
    ap.add_argument("--end", help="last day to compare (default: today - 7, archive lag)")
    ap.add_argument("--seam-days", type=int, default=SEAM_DAYS,
                    help="last N days of the window reported apart (default 14)")
    ap.add_argument("--pace", type=float, default=0.5, help="seconds between requests")
    ap.add_argument("--max-calls", type=int, default=3000)
    ap.add_argument("--out", help="write the full result to this JSON file")
    asyncio.run(main(ap.parse_args()))
