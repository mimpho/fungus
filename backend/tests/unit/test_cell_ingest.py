"""Server-side cell ingestion: discover, load, refresh. Fakes for the store, resolver, loader."""

from datetime import UTC, date, datetime, timedelta

import httpx

from app.connectors.base import ProviderUnavailable
from app.models.climate_cell import cell_id as make_cell_id
from app.models.climate_cell import lookup_key
from app.services.cell_discovery import probe_lattice
from app.services.cell_ingest import (
    LOAD_COST,
    PROBE_BATCH,
    REFRESH_COST,
    catalonia_cells,
    discover,
    holes,
    load_pending,
    refresh_all,
)
from app.services.cell_provider import CellInfo

NOW = datetime(2026, 10, 18, 5, 45, tzinfo=UTC)


async def no_sleep(_seconds: float) -> None:
    return None


class FakeStore:
    def __init__(self, cells: list[CellInfo] | None = None) -> None:
        self.cells = {c.id: c for c in cells or []}
        self.lookups: dict[tuple[int, int], str] = {}

    async def known_lookup_keys(self, keys):
        return set(keys) & set(self.lookups)

    async def get_cell(self, cell_id):
        return self.cells.get(cell_id)

    async def create_cell(self, cell):
        self.cells.setdefault(cell.id, cell)

    async def save_lookup(self, key, cell_id):
        self.lookups[key] = cell_id

    async def list_cells(self):
        return sorted(self.cells.values(), key=lambda c: c.id)


GRID_LAT, GRID_LON = 0.0703, 0.1272  # cell size measured on 2026-10-18


def snap(lat: float, lon: float) -> tuple[float, float]:
    return round(round(lat / GRID_LAT) * GRID_LAT, 4), round(round(lon / GRID_LON) * GRID_LON, 4)


def grid_resolver():
    """A regular grid with Open-Meteo's cell size, as a stand-in; records every request."""
    requests: list[int] = []

    async def resolve(points):
        requests.append(len(points))
        return [(*snap(lat, lon), 500.0) for lat, lon in points]

    resolve.requests = requests
    return resolve


def catalonia_grid_cells(loaded: bool = False) -> list[CellInfo]:
    centres = {snap(lat, lon) for lat, lon in probe_lattice(0.02, 0.02, margin=0.15)}
    done = date(2026, 10, 17) if loaded else None
    return [
        CellInfo(make_cell_id(la, lo), la, lo, 500.0, loaded_to=done) for la, lo in sorted(centres)
    ]


class FakeLoader:
    def __init__(self, fail: dict[str, Exception] | None = None) -> None:
        self.loaded: list[str] = []
        self.refreshed: list[str] = []
        self.fail = fail or {}

    async def load(self, store, cell_id):
        if cell_id in self.fail:
            raise self.fail[cell_id]
        self.loaded.append(cell_id)

    async def refresh_recent(self, store, cell_id):
        if cell_id in self.fail:
            raise self.fail[cell_id]
        self.refreshed.append(cell_id)


def too_many_requests() -> httpx.HTTPStatusError:
    req = httpx.Request("GET", "https://archive-api.open-meteo.com/v1/archive")
    return httpx.HTTPStatusError("429", request=req, response=httpx.Response(429, request=req))


class TestDiscover:
    async def test_stores_each_distinct_cell_once_and_every_probed_bucket(self):
        store, resolve = FakeStore(), grid_resolver()
        points = probe_lattice()
        stats = await discover(store, resolve, points, max_calls=10_000, sleep=no_sleep, pace=False)
        assert stats.probed == len(points)
        assert 0 < stats.new_cells == len(store.cells) <= len(points)
        assert all(lookup_key(*p) in store.lookups for p in points)
        assert all(n <= PROBE_BATCH for n in resolve.requests)
        assert stats.stopped is None and stats.pending == 0

    async def test_second_run_probes_nothing(self):
        store, resolve = FakeStore(), grid_resolver()
        points = probe_lattice()
        await discover(store, resolve, points, 10_000, sleep=no_sleep, pace=False)
        again = await discover(store, resolve, points, 10_000, sleep=no_sleep, pace=False)
        assert again.probed == 0 and again.calls == 0 and again.new_cells == 0

    async def test_stops_at_the_budget_and_resumes_where_it_left(self):
        store, resolve = FakeStore(), grid_resolver()
        points = probe_lattice()
        first = await discover(store, resolve, points, 120, sleep=no_sleep, pace=False)
        assert first.stopped == "budget" and first.calls <= 120 and first.pending > 0
        second = await discover(store, resolve, points, 10_000, sleep=no_sleep, pace=False)
        assert first.probed + second.probed == len(points)
        assert second.stopped is None

    async def test_rate_limit_stops_without_losing_what_was_stored(self):
        store = FakeStore()
        calls = 0

        async def flaky(points):
            nonlocal calls
            calls += 1
            if calls == 2:
                raise too_many_requests()
            return await grid_resolver()(points)

        stats = await discover(
            store, flaky, probe_lattice(), 10_000, sleep=no_sleep, pace=False
        )
        assert stats.stopped == "rate-limit"
        assert stats.probed == PROBE_BATCH and len(store.lookups) == PROBE_BATCH

    async def test_provider_error_stops_as_failure(self):
        async def down(points):
            raise ProviderUnavailable("down")

        stats = await discover(
            FakeStore(), down, probe_lattice(), 10_000, sleep=no_sleep, pace=False
        )
        assert stats.stopped == "failures" and stats.probed == 0


class TestCataloniaCells:
    def test_border_cells_in_the_sea_or_france_are_left_out(self):
        cells = catalonia_grid_cells()
        chosen = catalonia_cells(
            cells + [CellInfo("far", 38.0, -3.0, 600.0), CellInfo("far2", 44.0, 2.0, 600.0)]
        )
        ids = {c.id for c in chosen}
        assert "far" not in ids and "far2" not in ids
        assert 340 <= len(chosen) <= 440

    def test_too_few_cells_select_nothing(self):
        assert catalonia_cells([CellInfo("a", 41.5, 1.5, 500.0)]) == []


class TestLoad:
    async def test_loads_only_unloaded_cells_in_catalonia(self):
        cells = catalonia_grid_cells()
        cells[0].loaded_to = date(2026, 10, 17)
        cells.append(CellInfo("far", 38.0, -3.0, 600.0))
        loader = FakeLoader()
        stats = await load_pending(FakeStore(cells), loader, 10**6, sleep=no_sleep, pace=False)
        inside = {c.id for c in catalonia_cells(cells)}
        assert set(loader.loaded) == inside - {cells[0].id}
        assert stats.loaded == len(loader.loaded) and stats.calls == stats.loaded * LOAD_COST

    async def test_budget_stops_before_overspending(self):
        cells = catalonia_grid_cells()
        loader = FakeLoader()
        stats = await load_pending(
            FakeStore(cells), loader, LOAD_COST * 10 + 5, sleep=no_sleep, pace=False
        )
        assert stats.loaded == 10 and stats.stopped == "budget" and stats.calls == LOAD_COST * 10
        assert stats.pending > 0

    async def test_limit_caps_the_cells_of_a_run(self):
        loader = FakeLoader()
        stats = await load_pending(
            FakeStore(catalonia_grid_cells()), loader, 10**6, limit=10, sleep=no_sleep, pace=False
        )
        assert stats.loaded == 10 and stats.stopped is None

    async def test_rate_limit_stops_the_run(self):
        cells = catalonia_grid_cells()
        first = catalonia_cells(cells)[1].id
        loader = FakeLoader({first: too_many_requests()})
        stats = await load_pending(FakeStore(cells), loader, 10**6, sleep=no_sleep, pace=False)
        assert stats.stopped == "rate-limit" and stats.loaded == 1 and stats.failed == 0

    async def test_one_failing_cell_does_not_stop_the_rest(self):
        cells = catalonia_grid_cells()
        bad = catalonia_cells(cells)[2].id
        loader = FakeLoader({bad: ProviderUnavailable("boom")})
        stats = await load_pending(
            FakeStore(cells), loader, 10**6, limit=6, sleep=no_sleep, pace=False
        )
        assert stats.failed == 1 and stats.loaded == 5 and bad not in loader.loaded

    async def test_five_failures_in_a_row_stop_the_run(self):
        cells = catalonia_grid_cells()
        chosen = catalonia_cells(cells)
        loader = FakeLoader({c.id: ProviderUnavailable("down") for c in chosen})
        stats = await load_pending(FakeStore(cells), loader, 10**6, sleep=no_sleep, pace=False)
        assert stats.failed == 5 and stats.stopped == "failures"


class TestRefresh:
    async def test_least_recently_refreshed_go_first(self):
        base = catalonia_grid_cells(loaded=True)[:4]
        base[0].refreshed_at = NOW - timedelta(days=1)
        base[1].refreshed_at = NOW - timedelta(days=5)
        base[2].refreshed_at = None
        base[3].refreshed_at = NOW - timedelta(days=3)
        loader = FakeLoader()
        await refresh_all(FakeStore(base), loader, 10**6, sleep=no_sleep)
        assert loader.refreshed == [base[2].id, base[1].id, base[3].id, base[0].id]

    async def test_budget_rotates_instead_of_starving(self):
        cells = catalonia_grid_cells(loaded=True)[:6]
        loader = FakeLoader()
        stats = await refresh_all(FakeStore(cells), loader, REFRESH_COST * 2, sleep=no_sleep)
        assert stats.refreshed == 2 and stats.stopped == "budget" and stats.pending == 4

    async def test_unloaded_cells_are_not_refreshed(self):
        cells = catalonia_grid_cells(loaded=False)[:5]
        loader = FakeLoader()
        stats = await refresh_all(FakeStore(cells), loader, 10**6, sleep=no_sleep)
        assert loader.refreshed == [] and stats.refreshed == 0

    async def test_zero_budget_does_nothing(self):
        cells = catalonia_grid_cells(loaded=True)[:3]
        stats = await refresh_all(FakeStore(cells), FakeLoader(), 0, sleep=no_sleep)
        assert stats.refreshed == 0 and stats.stopped == "budget"


class TestHoles:
    async def test_probing_the_holes_completes_the_grid(self):
        store, resolve = FakeStore(), grid_resolver()
        await discover(store, resolve, probe_lattice(), 10_000, sleep=no_sleep, pace=False)
        for _ in range(3):  # a ring of holes per round; the lattice leaves at most a few
            todo = holes(await store.list_cells())
            if not todo:
                break
            await discover(store, resolve, todo, 10_000, sleep=no_sleep, pace=False)
        assert holes(await store.list_cells()) == []
        truth = {c.id for c in catalonia_cells(catalonia_grid_cells())}
        assert {c.id for c in catalonia_cells(await store.list_cells())} == truth
