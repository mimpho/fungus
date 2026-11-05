"""
Projected score of a few zones for the next days: real climate up to yesterday plus the
Open-Meteo forecast, scored with the v2 model.

Prints one line per day (score, band, limiting factor, rain and minimum temperature) and
marks the days that rest on the forecast. Nothing is written to the database. With --json
it also writes the same numbers to a file (for the Observatory prototype).

Reads climate_history, so it needs the database, and one Open-Meteo call per zone.
Open-Meteo's free tier is non-commercial use only; a few zones are a few calls.

Usage:
    cd backend
    python -m scripts.zone_forecast
    python -m scripts.zone_forecast --zones zone-205,zone-207,zone-235 --days 10
    python -m scripts.zone_forecast --json ~/forecast.json
"""

from __future__ import annotations

import argparse
import asyncio
import json
import sys
from datetime import date, timedelta

from sqlalchemy import select

from app.connectors.open_meteo import OpenMeteoConnector
from app.database import AsyncSessionLocal
from app.models.climate_history import ClimateHistory
from app.models.zone import Zone
from app.services.zone_projection import ProjectedDay, project_scores

# The four zones of the Observatory prototype
DEFAULT_ZONES = ["zone-003", "zone-030", "zone-201", "zone-202"]
HISTORY_DAYS = 100  # the v2 window


async def project_zone(zone: Zone, today: date, days: int) -> list[ProjectedDay]:
    cutoff = today - timedelta(days=HISTORY_DAYS)
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(ClimateHistory)
            .where(ClimateHistory.zone_id == zone.id, ClimateHistory.date >= cutoff)
            .order_by(ClimateHistory.date)
        )
        history = list(result.scalars())
    if not history:
        return []
    start = history[-1].date + timedelta(days=1)  # the day after the last real one
    connector = OpenMeteoConnector(zone.id, float(zone.lat), float(zone.lon))
    forecast = await connector.fetch_range(start, today + timedelta(days=days))
    return project_scores(history, forecast, zone.elevation_m, from_date=today - timedelta(days=1))


async def main(args: argparse.Namespace) -> None:
    today = date.today()
    ids = [z.strip() for z in args.zones.split(",") if z.strip()]
    async with AsyncSessionLocal() as db:
        zones = {z.id: z for z in (await db.execute(select(Zone).where(Zone.id.in_(ids)))).scalars()}

    out: dict[str, dict] = {}
    for zone_id in ids:
        zone = zones.get(zone_id)
        if zone is None:
            print(f"{zone_id}: not found", file=sys.stderr)
            continue
        try:
            rows = await project_zone(zone, today, args.days)
        except Exception as exc:  # one failing zone must not stop the rest
            print(f"{zone_id}: {exc}", file=sys.stderr)
            continue
        print(f"\n{zone.name} ({zone.id}, {zone.elevation_m} m)")
        if not rows:
            print("  no climate history")
            continue
        for r in rows:
            mark = "forecast" if r.forecast else "real    "
            rain = " ".join(f"rain {p.shows_from:%d/%m}" for p in r.pending_rains[:1])
            print(
                f"  {r.day:%a %d/%m}  {r.score:3d}  {r.label:<9}  {r.limiting_factor:<11} "
                f"{r.precipitation_mm:5.1f} mm  min {r.temp_min_c:5.1f}  {mark} {rain}"
            )
        out[zone.id] = {
            "name": zone.name,
            "elevation_m": zone.elevation_m,
            "days": [
                {
                    "date": r.day.isoformat(),
                    "score": r.score,
                    "limiting_factor": r.limiting_factor,
                    "forecast": r.forecast,
                    "precipitation_mm": r.precipitation_mm,
                    "temp_min_c": r.temp_min_c,
                }
                for r in rows
            ],
        }

    if args.json:
        with open(args.json, "w", encoding="utf-8") as fh:
            json.dump(out, fh, ensure_ascii=False, indent=2)
        print(f"\nWritten to {args.json}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Projected v2 score for the next days")
    parser.add_argument("--zones", default=",".join(DEFAULT_ZONES), help="Comma-separated IDs")
    parser.add_argument("--days", type=int, default=7, help="Forecast days to score (max 16)")
    parser.add_argument("--json", default=None, help="Also write the result to this file")
    asyncio.run(main(parser.parse_args()))
