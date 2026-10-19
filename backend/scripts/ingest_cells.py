"""
Server-side ingestion of the Open-Meteo cells that cover Catalonia (backlog item 7a).

Run it from your machine (the free quota is per IP, so it does not compete with Render's own
ingest). It writes to the database `DATABASE_URL` / `backend/.env` points at: the cells, their
500 m lookup buckets and their history. It never migrates. Every step is resumable and takes
`--max-calls`, a budget in weighted Open-Meteo calls (free tier: 600/min, 5,000/hour,
10,000/day).

Steps, in order:

    cd backend
    python -m scripts.ingest_cells plan                       # offline: probes and cost estimate
    python -m scripts.ingest_cells discover --max-calls 800   # probe the lattice, store the cells
    python -m scripts.ingest_cells status                     # cells found, holes left
    python -m scripts.ingest_cells discover --holes           # probe the holes; repeat until 0
    python -m scripts.ingest_cells load --limit 10            # 10 cells first: measure the cost
    python -m scripts.ingest_cells load --max-calls 4000      # then the rest, in as many days
                                                              # as the budget needs

Costs are estimates (days / 14 per request); check your real use against the Open-Meteo
account page after the first 10 cells before raising the budget.
"""
import argparse
import asyncio
import logging
import sys

from sqlalchemy.exc import ProgrammingError

from app.connectors.open_meteo import resolve_grid_batch
from app.database import AsyncSessionLocal, dispose_engine
from app.services.cell_discovery import DEFAULT_STEP_LAT, DEFAULT_STEP_LON, probe_lattice
from app.services.cell_ingest import (
    LOAD_COST,
    PROBE_BATCH,
    REFRESH_COST,
    catalonia_cells,
    discover,
    holes,
    load_pending,
)
from app.services.cell_provider import CellProvider
from app.services.cell_store import SqlCellStore

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s — %(message)s")
log = logging.getLogger("ingest_cells")


def cmd_plan(step_lat: float, step_lon: float) -> None:
    points = probe_lattice(step_lat, step_lon)
    print(f"Probe lattice at {step_lat} x {step_lon} deg: {len(points)} points "
          f"({-(-len(points) // PROBE_BATCH)} requests of up to {PROBE_BATCH}).")
    print(f"  discover costs ~{len(points)} weighted calls (one per point) if none is known yet.")
    print(f"  load costs ~{LOAD_COST} per cell: ~{LOAD_COST * 390} for ~390 cells (PRD estimate).")
    print(f"  the daily refresh costs ~{REFRESH_COST} per cell: ~{REFRESH_COST * 390} a day.")
    print("  Free quota: 10,000/day. Split `load` over days with --max-calls if needed.")


async def cmd_discover(step_lat: float, step_lon: float, max_calls: int, only_holes: bool) -> None:
    async with AsyncSessionLocal() as db:
        store = SqlCellStore(db)
        lattice = probe_lattice(step_lat, step_lon)
        points = holes(await store.list_cells()) if only_holes else lattice
        stats = await discover(store, resolve_grid_batch, points, max_calls)
    print("discover:", stats.summary())


async def cmd_load(max_calls: int, limit: int | None) -> None:
    async with AsyncSessionLocal() as db:
        store = SqlCellStore(db)
        stats = await load_pending(store, CellProvider(), max_calls, limit=limit)
    print("load:", stats.summary())


async def cmd_status() -> None:
    async with AsyncSessionLocal() as db:
        cells = await SqlCellStore(db).list_cells()
    inside = catalonia_cells(cells)
    loaded = [c for c in inside if c.loaded_to is not None]
    print(f"stored cells: {len(cells)}; touching Catalonia: {len(inside)}; "
          f"loaded: {len(loaded)}; still to load: {len(inside) - len(loaded)}")
    print(f"holes (neighbours expected but not found): {len(holes(cells))}")
    if inside:
        print(f"first cells: {', '.join(c.id for c in inside[:3])} ...")


async def main(args: argparse.Namespace) -> None:
    try:
        if args.command == "discover":
            await cmd_discover(args.step_lat, args.step_lon, args.max_calls, args.holes)
        elif args.command == "load":
            await cmd_load(args.max_calls, args.limit)
        elif args.command == "status":
            await cmd_status()
    except ProgrammingError as exc:
        if "does not exist" not in str(exc):
            raise
        # Nothing was fetched from Open-Meteo: the first query already failed.
        print(
            "\nThe database has no `cells` / `cell_lookup` tables: migrations 017 and 018 "
            "(and 019 for the rest of the Observatory) are not applied there. Apply them "
            "first (a disposable database to test, or the real one after the deploy), or "
            "point DATABASE_URL at one that has them.",
            file=sys.stderr,
        )
        sys.exit(2)
    finally:
        await dispose_engine()


def _add_steps(p: argparse.ArgumentParser) -> None:
    p.add_argument("--step-lat", type=float, default=DEFAULT_STEP_LAT)
    p.add_argument("--step-lon", type=float, default=DEFAULT_STEP_LON)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    sub = parser.add_subparsers(dest="command", required=True)
    _add_steps(sub.add_parser("plan"))
    p = sub.add_parser("discover")
    _add_steps(p)
    p.add_argument("--max-calls", type=int, default=800)
    p.add_argument("--holes", action="store_true",
                   help="probe only where a neighbouring cell is expected but missing")
    p = sub.add_parser("load")
    p.add_argument("--max-calls", type=int, default=4000)
    p.add_argument("--limit", type=int, default=None, help="max cells this run")
    sub.add_parser("status")
    ns = parser.parse_args()
    if ns.command == "plan":
        cmd_plan(ns.step_lat, ns.step_lon)
    else:
        asyncio.run(main(ns))
