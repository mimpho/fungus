"""
Backfill script: load historical climate data from Open-Meteo.

Populates climate_history with data going back up to 2 years.
Run once on first deployment, then the daily cron takes over.

Usage:
    cd backend
    python -m scripts.backfill --from 2024-01-01 --to 2026-02-28
    python -m scripts.backfill --from 2024-01-01 --to 2026-02-28 --zones zone-001,zone-002
"""
import argparse
import asyncio
import logging
from datetime import date

from app.database import AsyncSessionLocal
from app.services.ingest import run_backfill

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s — %(message)s")
log = logging.getLogger("backfill")


async def main(start: date, end: date, zone_ids: list[str] | None) -> None:
    async with AsyncSessionLocal() as db:
        summary = await run_backfill(db, start=start, end=end, zone_ids=zone_ids)
    log.info("Backfill complete: %s", summary)


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
