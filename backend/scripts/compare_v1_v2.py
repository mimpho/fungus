"""
v1 and v2 side by side for every zone and day, for calibration. Read-only, no API calls.

Reads climate_history (plus the 100 days before --from that v2 needs) and writes one CSV
row per zone and day: v1 score, v2 score and its factors, zone state, limiting factor,
whether v2 is estimated. Pair it with the field-trip log to tune the model.

Usage:
    cd backend
    python -m scripts.compare_v1_v2 --from 2024-10-01 > v1_v2.csv
    python -m scripts.compare_v1_v2 --from 2026-09-01 --to 2026-10-09 --zones zone-030,zone-201
"""

from __future__ import annotations

import argparse
import asyncio
import csv
import sys
from datetime import date, timedelta

from app.services.scoring_v2 import ClimateDay, compute_v2_series
from app.services.zone_scores import V2_WINDOW_DAYS, v1_from_rows

COLUMNS = [
    "zone_id", "date", "elevation_m", "v1", "v2", "activation", "moisture", "temperature",
    "season", "drying", "heat", "frost", "shock", "state", "limiting", "estimated",
]  # fmt: skip


def rows_for_zone(rows, elevation_m, start: date, end: date) -> list[list]:
    """CSV rows for one zone. `rows` = its climate_history from start − 100 days to end."""
    days = [d for r in rows if (d := ClimateDay.from_row(r))]
    by_date = sorted(rows, key=lambda r: r.date)
    out = []
    for r in compute_v2_series(days, elevation_m, output_from=start):
        if r.date > end:
            break
        v1 = v1_from_rows(by_date, r.date)
        f = r.factors
        out.append([
            None, r.date.isoformat(), elevation_m, v1.score if v1 else "", r.score,
            f.activation, f.moisture, f.temperature, round(f.season, 3), round(f.drying, 3),
            round(f.heat, 3), round(f.frost, 3), f.shock, "warm" if r.warm else "cold",
            r.limiting_factor, int(r.estimated),
        ])  # fmt: skip
    return out


async def main(args: argparse.Namespace) -> None:
    from sqlalchemy import select

    from app.database import AsyncSessionLocal, engine
    from app.models.climate_history import ClimateHistory
    from app.models.zone import Zone

    engine.echo = False
    start = date.fromisoformat(args.start)
    end = date.fromisoformat(args.end) if args.end else date.today()
    wanted = set(args.zones.split(",")) if args.zones else None

    writer = csv.writer(sys.stdout)
    writer.writerow(COLUMNS)
    async with AsyncSessionLocal() as db:
        zones = (
            await db.execute(
                select(Zone.id, Zone.elevation_m).where(Zone.active.is_(True)).order_by(Zone.id)
            )
        ).all()
        for z in zones:
            if wanted and z.id not in wanted:
                continue
            rows = list(
                (
                    await db.execute(
                        select(ClimateHistory)
                        .where(ClimateHistory.zone_id == z.id)
                        .where(ClimateHistory.date >= start - timedelta(days=V2_WINDOW_DAYS))
                        .where(ClimateHistory.date <= end)
                    )
                ).scalars()
            )
            for row in rows_for_zone(rows, z.elevation_m, start, end):
                row[0] = z.id
                writer.writerow(row)
            print(f"{z.id} done", file=sys.stderr, flush=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="v1 vs v2 for every zone and day (CSV)")
    parser.add_argument("--from", dest="start", required=True, help="First day YYYY-MM-DD")
    parser.add_argument("--to", dest="end", default=None, help="Last day (default: today)")
    parser.add_argument("--zones", default=None, help="Comma-separated zone IDs (default: all)")
    asyncio.run(main(parser.parse_args()))
