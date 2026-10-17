"""
Raw climate export for the Observatory prototype: for each zone, the stored daily climate of the
last two years plus the Open-Meteo forecast (up to 16 days, today included). Nothing is written to the database.

Usage:
    cd backend
    python -m scripts.export_zone_climate --out ../observatory_raw.json
    python -m scripts.export_zone_climate --zones zone-205,zone-207 --out ~/raw.json
"""

from __future__ import annotations

import argparse
import asyncio
import json
import sys
from datetime import UTC, datetime, timedelta

from sqlalchemy import select

from app.connectors.open_meteo import OpenMeteoConnector
from app.database import AsyncSessionLocal
from app.models.climate_history import ClimateHistory
from app.models.zone import Zone

DEFAULT_ZONES = "zone-201,zone-204,zone-029,zone-030,zone-202,zone-205,zone-233,zone-003,zone-207"
FIELDS = ("temp_max_c", "temp_min_c", "temp_avg_c", "soil_temp_c", "precipitation_mm", "humidity_pct", "wind_kmh")


def pack(r) -> dict:
    out = {"date": r.date.isoformat()}
    for f in FIELDS:
        v = getattr(r, f)
        out[f] = None if v is None else float(v)
    return out


async def main(args: argparse.Namespace) -> None:
    # Open-Meteo counts days in UTC: the local date can be a day ahead (00:00-02:00 in Madrid)
    # and its forecast limit would reject the range.
    today = datetime.now(UTC).date()
    ids = [z.strip() for z in args.zones.split(",") if z.strip()]
    async with AsyncSessionLocal() as db:
        zones = {z.id: z for z in (await db.execute(select(Zone).where(Zone.id.in_(ids)))).scalars()}
    out: dict[str, dict] = {}
    for zid in ids:
        z = zones.get(zid)
        if z is None:
            print(f"{zid}: not found", file=sys.stderr)
            continue
        try:
            async with AsyncSessionLocal() as db:
                res = await db.execute(
                    select(ClimateHistory)
                    .where(ClimateHistory.zone_id == zid, ClimateHistory.date >= today - timedelta(days=args.history_days))
                    .order_by(ClimateHistory.date)
                )
                hist = list(res.scalars())
            start = hist[-1].date + timedelta(days=1)
            fc = await OpenMeteoConnector(zid, float(z.lat), float(z.lon)).fetch_range(start, today + timedelta(days=15))
        except Exception as exc:
            print(f"{zid}: {exc}", file=sys.stderr)
            continue
        out[zid] = {
            "name": z.name, "region": z.region, "province": z.province, "lat": float(z.lat), "lon": float(z.lon),
            "elevation_m": z.elevation_m, "forest_type": z.forest_type,
            "history": [pack(r) for r in hist], "forecast": [pack(r) for r in fc],
        }
        print(f"{zid} {z.name}: {len(hist)} real days, {len(fc)} forecast days")
    with open(args.out, "w", encoding="utf-8") as fh:
        json.dump({"generated": today.isoformat(), "zones": out}, fh, ensure_ascii=False)
    print(f"Written to {args.out}")


if __name__ == "__main__":
    p = argparse.ArgumentParser(description="Raw climate + forecast export")
    p.add_argument("--zones", default=DEFAULT_ZONES)
    p.add_argument("--history-days", type=int, default=800)
    p.add_argument("--out", required=True)
    asyncio.run(main(p.parse_args()))
