"""
Backfill script: load historical climate data from Open-Meteo.

Days older than ~8 days come from the archive API (years of history), recent
days from the forecast API — see OpenMeteoConnector.fetch_range.

Open-Meteo free tier: 600 calls/min, 5,000/hour, 10,000/day, and a request for
more than 2 weeks of data counts as (days / 14) calls. One year for one zone is
~26 calls, so the script processes zones in small batches and waits between
them to stay under the hourly budget. Keep each run under ~9,000 calls (e.g.
one year for all zones) and run the next year another day.

Usage:
    cd backend
    python -m scripts.backfill --from 2025-10-01 --to 2026-09-30
    python -m scripts.backfill --from 2025-10-01 --to 2026-09-30 --zones zone-001,zone-002
"""
import argparse
import asyncio
import logging
import math
import time
from datetime import date

from app.database import AsyncSessionLocal
from app.services.ingest import _get_active_zones, run_backfill

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s — %(message)s")
log = logging.getLogger("backfill")

CALLS_PER_MINUTE_BUDGET = 70   # 5,000/hour ≈ 83/min, with margin
DAILY_BUDGET = 9_000           # 10,000/day, with margin


async def main(start: date, end: date, zone_ids: list[str] | None) -> None:
    async with AsyncSessionLocal() as db:
        zones = await _get_active_zones(db)
    ids = [z.id for z in zones if not zone_ids or z.id in zone_ids]

    weight = max(1.0, ((end - start).days + 1) / 14)   # API calls per zone
    total = weight * len(ids)
    if total > DAILY_BUDGET:
        raise SystemExit(
            f"~{total:,.0f} API calls for {len(ids)} zones exceeds the daily budget "
            f"({DAILY_BUDGET:,}). Split the date range or the zone list."
        )
    batch = max(1, math.floor(CALLS_PER_MINUTE_BUDGET / weight))
    minutes = math.ceil(len(ids) / batch)
    log.info(
        "Backfill %s → %s: %d zones, ~%.0f API calls, %d zones/min, ~%d min",
        start, end, len(ids), total, batch, minutes,
    )

    upserted, errors = 0, []
    for i in range(0, len(ids), batch):
        t0 = time.monotonic()
        chunk = ids[i : i + batch]
        async with AsyncSessionLocal() as db:
            summary = await run_backfill(db, start=start, end=end, zone_ids=chunk)
        upserted += summary["rows_upserted"]
        errors += summary["errors"]
        log.info("%d/%d zones done (%d rows)", min(i + batch, len(ids)), len(ids), upserted)
        if i + batch < len(ids):
            await asyncio.sleep(max(0.0, 60 - (time.monotonic() - t0)))

    log.info("Backfill complete: %d rows, %d errors", upserted, len(errors))
    if errors:
        failed = ",".join(sorted({e["zone_id"] for e in errors}))
        log.warning("Failed zones — re-run with: --zones %s", failed)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Backfill climate history from Open-Meteo")
    parser.add_argument("--from", dest="start", required=True, help="Start date YYYY-MM-DD")
    parser.add_argument("--to", dest="end", required=True, help="End date YYYY-MM-DD")
    parser.add_argument(
        "--zones",
        default=None,
        help="Comma-separated zone IDs to backfill (default: all active zones)",
    )
    args = parser.parse_args()

    start_date = date.fromisoformat(args.start)
    end_date = date.fromisoformat(args.end)
    ids = [z.strip() for z in args.zones.split(",")] if args.zones else None

    asyncio.run(main(start_date, end_date, ids))
