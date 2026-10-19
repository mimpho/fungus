"""
Per-cell climate provider for the free-map Observatory.

A click is resolved to an Open-Meteo grid cell (memory LRU -> cell_lookup table -> one cheap
API call), and the cell's history is loaded on demand the first time anybody asks for it.
Cached cells are served from the database with no network. Open-Meteo is the source of truth;
everything stored here can be rebuilt.

Storage goes through the CellStore protocol so the logic is testable without a database.
"""
import asyncio
import logging
from collections import OrderedDict
from collections.abc import Awaitable, Callable
from dataclasses import dataclass
from datetime import UTC, date, datetime, timedelta
from typing import Protocol

from app.connectors.base import DailyWeatherData
from app.connectors.open_meteo import ARCHIVE_CUTOFF_DAYS, OpenMeteoConnector
from app.models.climate_cell import cell_id as make_cell_id
from app.models.climate_cell import lookup_key

log = logging.getLogger(__name__)

HISTORY_DAYS = 280  # 180 of timeline + 100 of calculation warm-up
FORECAST_DAYS = 16
REFRESH_WINDOW_DAYS = 10  # recent days re-fetched by the daily refresh
LOOKUP_CACHE_SIZE = 5000


class CellBudgetExceeded(Exception):
    """Too many new cells loaded today; cached cells keep working."""

    def __init__(self, retry_after: int) -> None:
        super().__init__("Daily budget of new cells reached")
        self.retry_after = retry_after


class UserCellLimitExceeded(Exception):
    """This user has already opened their share of new cells today; cached cells keep working."""

    def __init__(self, retry_after: int, limit: int) -> None:
        super().__init__(f"Daily limit of {limit} new cells per user reached")
        self.retry_after = retry_after
        self.limit = limit


@dataclass
class CellInfo:
    id: str
    lat: float
    lon: float
    elevation_m: float
    loaded_from: date | None = None
    loaded_to: date | None = None
    created_by: int | None = None  # user whose click created the cell
    refreshed_at: datetime | None = None  # last time the daily job (or the load) fetched it


@dataclass
class CellResult:
    cell: CellInfo
    source: str  # "stored" | "live"


class CellStore(Protocol):
    async def get_lookup(self, key: tuple[int, int]) -> str | None: ...
    async def save_lookup(self, key: tuple[int, int], cell_id: str) -> None: ...
    async def get_cell(self, cell_id: str) -> CellInfo | None: ...
    async def create_cell(self, cell: CellInfo) -> None: ...
    async def count_cells_created_since(self, since: datetime) -> int: ...
    async def count_cells_created_by_since(self, user_id: int, since: datetime) -> int: ...
    async def upsert_rows(self, rows: list[dict]) -> None: ...
    async def history(self, cell_id: str) -> list: ...
    async def mark_loaded(
        self, cell_id: str, loaded_from: date, loaded_to: date, at: datetime
    ) -> None: ...


ConnectorFactory = Callable[[str, float, float, float | str | None], OpenMeteoConnector]


def _default_factory(cell_id, lat, lon, elevation):
    return OpenMeteoConnector(cell_id, lat, lon, elevation)


# ── Pure helpers ──────────────────────────────────────────────────────────────

def should_overwrite(existing_source: str | None, incoming_source: str) -> bool:
    """A final archive day is never replaced by a provisional forecast day."""
    return not (existing_source == "archive" and incoming_source == "forecast")


def build_rows(
    cell_id: str,
    history: list[DailyWeatherData],
    forecast: list[DailyWeatherData],
    today: date,
) -> list[dict]:
    """Rows for climate_cell_history. Days up to the archive cutoff are final ('archive');
    the most recent days and the forecast are provisional ('forecast')."""
    cutoff = today - timedelta(days=ARCHIVE_CUTOFF_DAYS)

    def row(r: DailyWeatherData, final: bool) -> dict:
        return {
            "cell_id": cell_id,
            "date": r.date,
            "temp_max_c": r.temp_max_c,
            "temp_min_c": r.temp_min_c,
            "temp_avg_c": r.temp_avg_c,
            "soil_temp_c": r.soil_temp_c,
            "precipitation_mm": r.precipitation_mm,
            "humidity_pct": r.humidity_pct,
            "wind_kmh": r.wind_kmh,
            "source": "archive" if final else "forecast",
        }

    rows = [row(r, r.date <= cutoff) for r in history]
    rows += [row(r, False) for r in forecast]
    return rows


def _seconds_to_next_utc_midnight(now: datetime) -> int:
    nxt = (now + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
    return max(1, int((nxt - now).total_seconds()))


# ── Provider ──────────────────────────────────────────────────────────────────

class CellProvider:
    """Process-wide: holds the in-flight loads and the lookup LRU."""

    def __init__(
        self,
        connector_factory: ConnectorFactory = _default_factory,
        max_new_cells_per_day: int = 60,
        max_new_cells_per_user_per_day: int = 10,
        today: Callable[[], date] = date.today,
        now: Callable[[], datetime] = lambda: datetime.now(UTC),
    ) -> None:
        self._factory = connector_factory
        self._max_new = max_new_cells_per_day
        self._max_new_per_user = max_new_cells_per_user_per_day  # 0 = no per-user limit
        self._today = today
        self._now = now
        self._lru: OrderedDict[tuple[int, int], str] = OrderedDict()
        self._resolving: dict[tuple[int, int], asyncio.Future] = {}
        self._loading: dict[str, asyncio.Future] = {}
        self._create_lock = asyncio.Lock()

    async def get(
        self, store: CellStore, lat: float, lon: float, user_id: int | None = None
    ) -> CellResult:
        """Cell of a point, loading its history first if nobody has asked for it yet.

        `user_id` is who pays for a cell created by this call (per-user daily limit); without
        it (jobs) only the global budget applies. Cells that already exist are never limited."""
        cell_id = await self._resolve(store, lat, lon, user_id)
        cell = await store.get_cell(cell_id)
        if cell is not None and cell.loaded_to is not None:
            return CellResult(cell, "stored")
        await self._single_flight(self._loading, cell_id, lambda: self._load(store, cell_id))
        return CellResult(await store.get_cell(cell_id), "live")

    async def load(self, store: CellStore, cell_id: str) -> None:
        """Loads the full history of a cell that already exists (the initial ingest of the
        server uses it; clicks go through `get`). Concurrent callers share one load."""
        await self._single_flight(self._loading, cell_id, lambda: self._load(store, cell_id))

    async def refresh_recent(self, store: CellStore, cell_id: str) -> None:
        """Daily job: re-fetch the last days and the forecast. Archive days replace provisional
        ones; provisional days never replace archive ones."""
        cell = await store.get_cell(cell_id)
        today = self._today()
        start, end = today - timedelta(days=REFRESH_WINDOW_DAYS), today - timedelta(days=1)
        history, forecast = await self._fetch(cell, start, end)
        await store.upsert_rows(build_rows(cell_id, history, forecast, today))
        await store.mark_loaded(
            cell_id, cell.loaded_from or start, max(end, cell.loaded_to or end), self._now()
        )

    # ── Resolution ────────────────────────────────────────────────────────────

    async def _resolve(self, store: CellStore, lat: float, lon: float, user_id: int | None) -> str:
        key = lookup_key(lat, lon)
        if key in self._lru:
            self._lru.move_to_end(key)
            return self._lru[key]
        # Keyed by user too: a refusal (limit) must not be shared with another user who asks
        # for the same new point at the same time. The creation lock below keeps it to one cell.
        cell_id = await self._single_flight(
            self._resolving,
            (key, user_id),
            lambda: self._resolve_uncached(store, key, lat, lon, user_id),
        )
        self._lru[key] = cell_id
        while len(self._lru) > LOOKUP_CACHE_SIZE:
            self._lru.popitem(last=False)
        return cell_id

    async def _resolve_uncached(
        self, store: CellStore, key: tuple[int, int], lat: float, lon: float, user_id: int | None
    ) -> str:
        known = await store.get_lookup(key)
        if known:
            return known
        glat, glon, elev = await self._factory("resolve", lat, lon, "nan").resolve_grid()
        cell_id = make_cell_id(glat, glon)
        async with self._create_lock:
            if await store.get_cell(cell_id) is None:
                await self._check_user_limit(store, user_id)
                await self._check_budget(store)
                await store.create_cell(CellInfo(cell_id, glat, glon, elev, created_by=user_id))
        await store.save_lookup(key, cell_id)
        return cell_id

    async def _check_user_limit(self, store: CellStore, user_id: int | None) -> None:
        if user_id is None or self._max_new_per_user <= 0:
            return
        now = self._now()
        midnight = now.replace(hour=0, minute=0, second=0, microsecond=0)
        if await store.count_cells_created_by_since(user_id, midnight) >= self._max_new_per_user:
            raise UserCellLimitExceeded(_seconds_to_next_utc_midnight(now), self._max_new_per_user)

    async def _check_budget(self, store: CellStore) -> None:
        now = self._now()
        midnight = now.replace(hour=0, minute=0, second=0, microsecond=0)
        if await store.count_cells_created_since(midnight) >= self._max_new:
            raise CellBudgetExceeded(_seconds_to_next_utc_midnight(now))

    # ── Loading ───────────────────────────────────────────────────────────────

    async def _load(self, store: CellStore, cell_id: str) -> None:
        cell = await store.get_cell(cell_id)
        today = self._today()
        start, end = today - timedelta(days=HISTORY_DAYS), today - timedelta(days=1)
        history, forecast = await self._fetch(cell, start, end)
        await store.upsert_rows(build_rows(cell_id, history, forecast, today))
        # Marked loaded only after the rows are in: a failure above leaves the cell to retry.
        await store.mark_loaded(cell_id, start, end, self._now())

    async def _fetch(self, cell: CellInfo, start: date, end: date):
        connector = self._factory(cell.id, cell.lat, cell.lon, cell.elevation_m)
        return await connector.fetch_range_and_forecast(start, end, forecast_days=FORECAST_DAYS)

    @staticmethod
    async def _single_flight(registry: dict, key, make: Callable[[], Awaitable]):
        """Concurrent callers for the same key share one execution (and its failure)."""
        fut = registry.get(key)
        if fut is None:
            fut = asyncio.ensure_future(make())
            registry[key] = fut
            fut.add_done_callback(lambda _f: registry.pop(key, None))
        return await asyncio.shield(fut)
