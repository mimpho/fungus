"""
Check of the probability layer against the real database. Read-only: it writes nothing.

Runs what GET /observatory/layer/probability and /probability-excellent do (the cell query, the
history window, the scoring) outside the web server and prints how long each step takes, how much
history there is per cell and how big the answers are, for today and for older dates (an old date
reads more rows and its window may fall outside what is stored).

Usage:
    cd backend
    python -m scripts.check_layer_probability
    python -m scripts.check_layer_probability --dates 2026-10-01,2026-07-15 --species <id>

Point DATABASE_URL (the .env the backend uses) at the database to check: the disposable one on
port 55432 or the normal one on 5433. Nothing is printed about the connection itself.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import time
from datetime import UTC, date, datetime, timedelta


def _ms(t0: float) -> str:
    return f"{(time.perf_counter() - t0) * 1000:,.0f} ms"


async def main(args: argparse.Namespace) -> None:
    from sqlalchemy import select

    from app.database import AsyncSessionLocal, engine
    from app.models.species import Species
    from app.services.cell_store import SqlCellStore
    from app.services.layer_probability import (
        CellClimate,
        excellent_layer,
        history_start,
        species_layer,
    )
    from app.services.point_species import EXCELLENT, SpeciesRecord

    engine.echo = False
    today = datetime.now(UTC).date()
    dates = [None] + [date.fromisoformat(d) for d in args.dates.split(",") if d]

    async with AsyncSessionLocal() as db:
        store = SqlCellStore(db)

        t0 = time.perf_counter()
        cells = await store.list_cells()
        loaded = [c for c in cells if c.loaded_to is not None]
        print(f"cells: {len(cells)} stored, {len(loaded)} loaded ({_ms(t0)})")
        if loaded:
            starts = [c.loaded_from for c in loaded if c.loaded_from]
            hi = min(c.loaded_to for c in loaded)
            print(f"history loaded: from {min(starts) if starts else '?'} (oldest) "
                  f"to {hi} (the cell that lags most)")
            lagging = [c.id for c in loaded if c.loaded_to < today - timedelta(days=3)]
            print(f"cells more than 3 days behind today: {len(lagging)}")

        t0 = time.perf_counter()
        print(f"data_signature (layer cache key): {await store.data_signature()} ({_ms(t0)})")

        rows = (await db.scalars(select(Species))).all()
        records = [SpeciesRecord.from_row(r) for r in rows]
        excellent = [
            SpeciesRecord.from_row(r) for r in rows if (r.edibility or "").lower() in EXCELLENT
        ]
        print(f"species: {len(records)} in the catalogue, {len(excellent)} excellent")
        one = next((s for s in records if s.id == args.species), None) if args.species else None
        one = one or (excellent[0] if excellent else (records[0] if records else None))

        for on in dates:
            label = "last day with data" if on is None else on.isoformat()
            since = history_start(today, on)
            print(f"\n== {label} (history from {since}) ==")
            t0 = time.perf_counter()
            stored = await store.loaded_cells_climate(since)
            n_rows = sum(len(r) for _, r in stored)
            print(f"loaded_cells_climate: {len(stored)} cells, {n_rows:,} rows ({_ms(t0)})")
            if not stored:
                continue
            days = sorted(len(r) for _, r in stored)
            print(f"days per cell: min {days[0]}, median {days[len(days) // 2]}, max {days[-1]}")
            data = [CellClimate(c.id, c.lat, c.lon, c.elevation_m, r) for c, r in stored]

            if one:
                t0 = time.perf_counter()
                out = species_layer(data, today, one, on)
                size = len(json.dumps(out, default=str)) / 1024
                scored = sum(1 for c in out["cells"] if c["status"] == "scored")
                print(
                    f"species_layer({one.id}): {scored}/{len(out['cells'])} scored, "
                    f"date {out['date']}, in_season {out['in_season']}, "
                    f"{size:,.0f} KB ({_ms(t0)})"
                )
            if excellent:
                t0 = time.perf_counter()
                out = excellent_layer(data, today, excellent, on)
                size = len(json.dumps(out, default=str)) / 1024
                scored = sum(1 for c in out["cells"] if c["status"] == "scored")
                print(
                    f"excellent_layer({len(excellent)} species): {scored}/{len(out['cells'])} "
                    f"scored, date {out['date']}, in_season {out['in_season']}, "
                    f"{size:,.0f} KB ({_ms(t0)})"
                )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("--dates", default="", help="comma-separated older dates to check too")
    parser.add_argument("--species", default=None, help="species id for the single-species layer")
    asyncio.run(main(parser.parse_args()))
