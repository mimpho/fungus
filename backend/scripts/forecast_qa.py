"""
QA of the stored forecast on a few zones, through the same code path as the daily ingest
(`_ingest_date_range` with the daily window and forecast), without touching the other zones
or the scores cache. Writes only climate_history (idempotent upserts of the last days) and
zone_forecast for the chosen zones, then checks what was stored.

Needs migration 016 applied (`alembic upgrade head`; local runs do not migrate by themselves).
Costs one Open-Meteo call per zone.

Usage:
    cd backend
    python -m scripts.forecast_qa --zones zone-205,zone-207,zone-233
    python -m scripts.forecast_qa --zones zone-205 --show      # prints the 16 days
"""

from __future__ import annotations

import argparse
import asyncio
import sys
from datetime import date, timedelta

from sqlalchemy import func, select

from app.config import settings
from app.database import AsyncSessionLocal
from app.models.climate_history import ClimateHistory
from app.models.zone import Zone
from app.models.zone_forecast import ZoneForecast
from app.services import forecast as fc
from app.services import ingest


async def main(args: argparse.Namespace) -> int:
    ids = [z.strip() for z in args.zones.split(",") if z.strip()]
    today = date.today()
    yesterday = today - timedelta(days=1)
    start = yesterday - timedelta(days=max(settings.ingest_lookback_days, 1) - 1)

    async with AsyncSessionLocal() as db:
        zones = list((await db.execute(select(Zone).where(Zone.id.in_(ids)))).scalars())
        missing = set(ids) - {z.id for z in zones}
        if missing:
            print(f"Zones not found: {sorted(missing)}", file=sys.stderr)
        res = await ingest._ingest_date_range(
            db, zones, start=start, end=yesterday, forecast_days=settings.forecast_days
        )
        print(f"Ingest: {res['upserted']} observed rows, {res['forecast_rows']} forecast rows, "
              f"errors: {res['errors'] or 'none'}\n")

        failures = 0
        for z in sorted(zones, key=lambda z: z.id):
            rows = await fc.load_zone_forecast(db, z.id, today)
            days = fc.build_forecast_days(rows, today)
            future_in_history = (await db.execute(
                select(func.count()).select_from(ClimateHistory)
                .where(ClimateHistory.zone_id == z.id, ClimateHistory.date >= today)
            )).scalar_one()
            stale = (await db.execute(
                select(func.count()).select_from(ZoneForecast)
                .where(ZoneForecast.zone_id == z.id, ZoneForecast.date < today)
            )).scalar_one()
            expected = [today + timedelta(days=i) for i in range(settings.forecast_days)]
            checks = {
                "16 consecutive days from today": [d.day for d in days] == expected,
                "no forecast day in climate_history": future_in_history == 0,
                "no past day left in zone_forecast": stale == 0,
                "temperatures present": all(d.temp_max_c is not None and d.temp_min_c is not None for d in days),
                "rain probability present": all(d.precip_prob_pct is not None for d in days),
                "max ≥ min every day": all(d.temp_max_c >= d.temp_min_c for d in days if d.temp_max_c is not None),
            }
            print(f"{z.id} {z.name} ({z.elevation_m} m)")
            for name, ok in checks.items():
                print(f"  {'OK  ' if ok else 'FAIL'} {name}")
                failures += 0 if ok else 1
            if args.show:
                for d in days:
                    print(f"    {d.day} {d.temp_min_c:>5}/{d.temp_max_c:<5} °C  {d.precipitation_mm:>5.1f} mm "
                          f"{d.precip_prob_pct if d.precip_prob_pct is not None else '-':>3} %  {','.join(d.warnings)}")
            print()
    print("QA OK" if failures == 0 else f"QA: {failures} check(s) failed")
    return 1 if failures else 0


if __name__ == "__main__":
    p = argparse.ArgumentParser(description="Stored forecast QA on a few zones")
    p.add_argument("--zones", default="zone-205,zone-207,zone-233")
    p.add_argument("--show", action="store_true")
    sys.exit(asyncio.run(main(p.parse_args())))
