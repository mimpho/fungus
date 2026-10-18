"""
Server-side ingestion of the Open-Meteo cells that cover Catalonia (backlog item 7a).

Until now a cell existed only after someone clicked on it. The map layers need the whole region,
so three jobs fill and keep the cache without depending on clicks or on the per-user limit:

  discover  probe a lattice of points, one batched request per 50, and store the distinct
            cells with their 500 m lookup buckets (resumable: probed buckets are skipped);
  load      full history of every discovered cell that touches Catalonia and has none yet;
  refresh   last days + forecast of every loaded cell (the daily job; `refresh_recent` had
            no caller before this).

Every step takes a `max_calls` budget in weighted Open-Meteo calls (a request over two weeks
counts as days / 14) and stops cleanly when the next unit would pass it, so a run can be split
over several days. Costs are estimates, see LOAD_COST and REFRESH_COST. No network or database
here: the resolver, the provider and the store are injected.
"""
import asyncio
import logging
from collections.abc import Awaitable, Callable, Sequence
from dataclasses import dataclass
from typing import Protocol

import httpx

from app.connectors.base import ProviderUnavailable
from app.models.climate_cell import cell_id as make_cell_id
from app.models.climate_cell import lookup_key
from app.services.cell_discovery import (
    Point,
    batches,
    missing_neighbours,
    select_cells,
    weighted_calls,
)
from app.services.cell_provider import FORECAST_DAYS, HISTORY_DAYS, REFRESH_WINDOW_DAYS, CellInfo

log = logging.getLogger(__name__)

PROBE_BATCH = 50  # locations per probing request
CALLS_PER_MINUTE = 70  # the free tier allows 5,000/hour; same margin as scripts/backfill.py
MAX_CONSECUTIVE_FAILURES = 5

# Weighted calls per cell. History: an archive request over HISTORY_DAYS days plus one forecast
# request; the project once measured ~7 for 280 days, but the documented rule (days / 14) says
# 20, so the safe figure is used for budgets. Refresh: a short archive request plus the
# forecast request.
LOAD_COST = weighted_calls(HISTORY_DAYS) + 1
REFRESH_COST = weighted_calls(REFRESH_WINDOW_DAYS) + weighted_calls(FORECAST_DAYS + 1)

Resolver = Callable[[Sequence[Point]], Awaitable[list[tuple[float, float, float]]]]
Sleep = Callable[[float], Awaitable[None]]


class IngestStore(Protocol):
    async def known_lookup_keys(self, keys: list[tuple[int, int]]) -> set[tuple[int, int]]: ...
    async def get_cell(self, cell_id: str) -> CellInfo | None: ...
    async def create_cell(self, cell: CellInfo) -> None: ...
    async def save_lookup(self, key: tuple[int, int], cell_id: str) -> None: ...
    async def list_cells(self) -> list[CellInfo]: ...


class CellLoader(Protocol):
    async def load(self, store, cell_id: str) -> None: ...
    async def refresh_recent(self, store, cell_id: str) -> None: ...


@dataclass
class IngestStats:
    calls: int = 0  # weighted calls spent (estimated)
    probed: int = 0
    new_cells: int = 0
    loaded: int = 0
    refreshed: int = 0
    failed: int = 0
    pending: int = 0  # still to do when the run ended
    stopped: str | None = None  # "budget" | "rate-limit" | "failures" | None (finished)

    def summary(self) -> str:
        return (
            f"calls~{self.calls} probed={self.probed} new_cells={self.new_cells} "
            f"loaded={self.loaded} refreshed={self.refreshed} failed={self.failed} "
            f"pending={self.pending} stopped={self.stopped or 'no'}"
        )


def _rate_limited(exc: Exception) -> bool:
    return isinstance(exc, httpx.HTTPStatusError) and exc.response.status_code == 429


# ── discover ──────────────────────────────────────────────────────────────────

async def discover(
    store: IngestStore,
    resolve: Resolver,
    points: Sequence[Point],
    max_calls: int,
    *,
    sleep: Sleep = asyncio.sleep,
    pace: bool = True,
) -> IngestStats:
    """Probe the points whose 500 m bucket is not known yet and store the cells they fall in."""
    stats = IngestStats()
    keyed = {lookup_key(lat, lon): (lat, lon) for lat, lon in points}
    known = await store.known_lookup_keys(list(keyed))
    todo = [p for k, p in keyed.items() if k not in known]
    stats.pending = len(todo)
    for batch in batches(todo, PROBE_BATCH):
        if stats.calls + len(batch) > max_calls:
            stats.stopped = "budget"
            break
        try:
            answers = await resolve(batch)
        except Exception as exc:
            stats.stopped = "rate-limit" if _rate_limited(exc) else "failures"
            log.warning("Probing stopped: %s", exc)
            break
        stats.calls += len(batch)
        stats.probed += len(batch)
        stats.pending -= len(batch)
        for (lat, lon), (glat, glon, elevation) in zip(batch, answers, strict=True):
            cell_id = make_cell_id(glat, glon)
            if await store.get_cell(cell_id) is None:
                await store.create_cell(CellInfo(cell_id, glat, glon, elevation))
                stats.new_cells += 1
            await store.save_lookup(lookup_key(lat, lon), cell_id)
        if pace:
            await sleep(60 * len(batch) / CALLS_PER_MINUTE)
    return stats


# ── which cells to work on ────────────────────────────────────────────────────

def catalonia_cells(cells: Sequence[CellInfo]) -> list[CellInfo]:
    """Cells whose footprint touches Catalonia. The cell size is inferred from the stored
    cells; with too few to tell, nothing is selected (run `discover` first)."""
    chosen = set(select_cells((c.lat, c.lon) for c in cells))
    return [c for c in cells if (c.lat, c.lon) in chosen]


def holes(cells: Sequence[CellInfo]) -> list[Point]:
    """Points to probe to close gaps in the grid found so far (see `missing_neighbours`)."""
    return missing_neighbours((c.lat, c.lon) for c in cells)


# ── load / refresh ────────────────────────────────────────────────────────────

async def _work(
    store,
    loader: CellLoader,
    cells: Sequence[CellInfo],
    cost: int,
    max_calls: int,
    action: Callable[[str], Awaitable[None]],
    stats: IngestStats,
    done_field: str,
    sleep: Sleep,
    pace: bool,
) -> None:
    stats.pending = len(cells)
    failures = 0
    for cell in cells:
        if stats.calls + cost > max_calls:
            stats.stopped = "budget"
            return
        try:
            await action(cell.id)
        except (ProviderUnavailable, httpx.HTTPError) as exc:
            stats.calls += cost  # the request may have been counted even if it failed
            if _rate_limited(exc):
                stats.stopped = "rate-limit"
                log.warning("Open-Meteo rate limit reached; stopping")
                return
            stats.failed += 1
            failures += 1
            log.warning("Cell %s failed: %s", cell.id, exc)
            if failures >= MAX_CONSECUTIVE_FAILURES:
                stats.stopped = "failures"
                return
            continue
        failures = 0
        stats.calls += cost
        stats.pending -= 1
        setattr(stats, done_field, getattr(stats, done_field) + 1)
        if pace:
            await sleep(60 * cost / CALLS_PER_MINUTE)


async def load_pending(
    store: IngestStore,
    loader: CellLoader,
    max_calls: int,
    *,
    limit: int | None = None,
    sleep: Sleep = asyncio.sleep,
    pace: bool = True,
) -> IngestStats:
    """Full history for the Catalonia cells that have none. `limit` caps the number of cells
    (use 10 first to measure the real cost)."""
    stats = IngestStats()
    cells = [c for c in catalonia_cells(await store.list_cells()) if c.loaded_to is None]
    if limit is not None:
        cells = cells[:limit]
    await _work(
        store, loader, cells, LOAD_COST, max_calls, lambda cid: loader.load(store, cid),
        stats, "loaded", sleep, pace,
    )
    return stats


async def refresh_all(
    store: IngestStore,
    loader: CellLoader,
    max_calls: int,
    *,
    sleep: Sleep = asyncio.sleep,
    pace: bool = False,
) -> IngestStats:
    """Last days and forecast of every loaded cell, least recently refreshed first, so a
    budget that falls short rotates through the cells instead of starving the same ones."""
    stats = IngestStats()
    loaded = [c for c in await store.list_cells() if c.loaded_to is not None]
    loaded.sort(key=lambda c: (c.refreshed_at is not None, c.refreshed_at or 0, c.id))
    await _work(
        store, loader, loaded, REFRESH_COST, max_calls,
        lambda cid: loader.refresh_recent(store, cid), stats, "refreshed", sleep, pace,
    )
    return stats
