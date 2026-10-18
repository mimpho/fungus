"""Weekly rain over the territory grid. Pure builders and the cache rules; no DB, no network."""

import asyncio
from datetime import UTC, date, datetime, timedelta
from types import SimpleNamespace

import pytest

from app.connectors.base import ProviderUnavailable
from app.services.territory_grid import GRID
from app.services.territory_rain import (
    CACHE_MAX_AGE,
    build_territory_rain,
    compute_territory_rain,
    is_fresh,
    label_points,
    week_starts,
    weekly_totals,
)

TODAY = date(2026, 10, 18)  # Sunday; the last complete day is Saturday the 17th


class TestGrid:
    def test_it_is_a_regular_sample_of_catalonia(self):
        assert 40 <= len(GRID) <= 70
        assert all(40.5 <= lat <= 42.9 and 0.15 <= lon <= 3.35 for lat, lon in GRID)
        assert len(set(GRID)) == len(GRID)


class TestWeeks:
    def test_weeks_run_monday_to_sunday_and_end_on_the_last_complete_week(self):
        starts = week_starts(TODAY, 3)
        assert [s.weekday() for s in starts] == [0, 0, 0]
        assert starts[-1] == date(2026, 10, 12)

    def test_it_adds_the_days_of_each_week(self):
        daily = {date(2026, 10, 12): 2.0, date(2026, 10, 14): 3.5, date(2026, 10, 7): 1.0}
        assert weekly_totals(daily, TODAY, weeks=2) == [1.0, 5.5]

    def test_a_week_without_data_is_null_and_a_dry_week_is_zero(self):
        assert weekly_totals({date(2026, 10, 13): 0.0}, TODAY, weeks=2) == [None, 0.0]

    def test_today_and_the_future_are_not_counted(self):
        daily = {TODAY: 9.0, TODAY + timedelta(days=2): 9.0}
        assert weekly_totals(daily, TODAY, weeks=1) == [None]


class TestPayload:
    def test_it_lists_every_point_with_its_weeks_label_and_elevation(self):
        out = build_territory_rain(
            [(42.0, 2.0), (41.0, 1.0)],
            [{date(2026, 10, 13): 4.0}, {}],
            [812.4, None],
            ["Osona", None],
            TODAY,
            weeks=1,
        )
        assert out["last_data_date"] == "2026-10-17"
        assert len(out["weeks"]) == 1
        assert out["points"][0] == {
            "lat": 42.0,
            "lon": 2.0,
            "elevation_m": 812,
            "label": "Osona",
            "mm": [4.0],
        }
        assert out["points"][1]["elevation_m"] is None and out["points"][1]["mm"] == [None]


class TestLabels:
    def test_a_point_takes_the_region_of_the_nearest_zone_within_30_km(self):
        zones = [
            SimpleNamespace(lat=42.01, lon=2.01, region="Osona"),
            SimpleNamespace(lat=42.2, lon=2.0, region="Ripollès"),
        ]
        assert label_points([(42.0, 2.0)], zones) == ["Osona"]

    def test_a_point_far_from_every_zone_has_no_label(self):
        assert label_points(
            [(40.6, 0.3)], [SimpleNamespace(lat=42.0, lon=2.0, region="Osona")]
        ) == [None]


class TestCompute:
    def test_it_asks_for_the_whole_grid_in_one_range_and_builds_the_payload(self):
        calls = []

        async def fetcher(points, start, end):
            calls.append((len(points), start, end))
            return [{} for _ in points], [None] * len(points)

        out = asyncio.run(compute_territory_rain([], TODAY, fetcher))
        assert calls == [(len(GRID), week_starts(TODAY)[0], TODAY - timedelta(days=1))]
        assert len(out["points"]) == len(GRID) and len(out["weeks"]) == 26

    def test_a_provider_failure_goes_up(self):
        async def fetcher(points, start, end):
            raise ProviderUnavailable("down")

        with pytest.raises(ProviderUnavailable):
            asyncio.run(compute_territory_rain([], TODAY, fetcher))


class TestFreshness:
    def test_it_is_fresh_under_20_hours(self):
        now = datetime(2026, 10, 18, 12, tzinfo=UTC)
        assert is_fresh(now - CACHE_MAX_AGE + timedelta(minutes=1), now)
        assert not is_fresh(now - CACHE_MAX_AGE - timedelta(minutes=1), now)


class TestOpenMeteoPull:
    def _client(self, monkeypatch, handler):
        import httpx

        from app.services import territory_rain as mod

        real = httpx.AsyncClient
        monkeypatch.setattr(
            mod.httpx,
            "AsyncClient",
            lambda **kw: real(transport=httpx.MockTransport(handler), **kw),
        )
        return mod

    def test_it_batches_the_locations_and_reads_rain_and_elevation(self, monkeypatch):
        import httpx

        seen = []

        def handler(request: httpx.Request) -> httpx.Response:
            q = request.url.params
            seen.append((request.url.host, len(q["latitude"].split(","))))
            n = len(q["latitude"].split(","))
            day = q["start_date"]
            return httpx.Response(
                200,
                json=[
                    {
                        "elevation": 100.0 + k,
                        "daily": {"time": [day], "precipitation_sum": [float(k)]},
                    }
                    for k in range(n)
                ],
            )

        mod = self._client(monkeypatch, handler)
        points = [(41.0 + i * 0.01, 1.0) for i in range(25)]
        start = date.today() - timedelta(days=30)
        daily, elev = asyncio.run(
            mod.fetch_grid_rain(points, start, date.today() - timedelta(days=1))
        )
        # 25 points = batches of 20 + 5, each asked to the archive and to the forecast API
        assert sorted(seen) == sorted(
            [
                ("archive-api.open-meteo.com", 20),
                ("api.open-meteo.com", 20),
                ("archive-api.open-meteo.com", 5),
                ("api.open-meteo.com", 5),
            ]
        )
        assert elev[3] == 103.0 and elev[21] == 101.0
        assert daily[3][start] == 3.0

    def test_a_wrong_number_of_locations_is_an_error(self, monkeypatch):
        import httpx

        mod = self._client(monkeypatch, lambda r: httpx.Response(200, json=[{"daily": {}}]))
        with pytest.raises(ProviderUnavailable):
            asyncio.run(
                mod.fetch_grid_rain(
                    [(41.0, 1.0), (41.1, 1.0)],
                    date.today() - timedelta(days=3),
                    date.today() - timedelta(days=1),
                )
            )

    def test_a_client_error_is_a_provider_failure_without_retries(self, monkeypatch):
        import httpx

        calls = []

        def handler(request):
            calls.append(1)
            return httpx.Response(400, text="bad")

        mod = self._client(monkeypatch, handler)
        with pytest.raises(ProviderUnavailable):
            asyncio.run(
                mod.fetch_grid_rain(
                    [(41.0, 1.0)],
                    date.today() - timedelta(days=3),
                    date.today() - timedelta(days=1),
                )
            )
        assert len(calls) == 1


class _Row:
    def __init__(self, computed_at, payload):
        self.computed_at, self.payload = computed_at, payload


class _Db:
    """Just enough of an AsyncSession for the store: one cache row, optionally a broken table."""

    def __init__(self, row=None, broken=False):
        self.row, self.broken, self.writes, self.rollbacks = row, broken, 0, 0

    async def get(self, model, pk):
        from sqlalchemy.exc import ProgrammingError

        if self.broken:
            raise ProgrammingError("select", {}, Exception("relation does not exist"))
        return self.row

    async def execute(self, stmt):
        from sqlalchemy.exc import ProgrammingError

        if self.broken:
            raise ProgrammingError("insert", {}, Exception("relation does not exist"))
        self.writes += 1
        return SimpleNamespace(scalars=lambda: [])

    async def commit(self):
        pass

    async def rollback(self):
        self.rollbacks += 1


class TestStore:
    NOW = datetime(2026, 10, 18, 12, tzinfo=UTC)

    @pytest.fixture(autouse=True)
    def _clean(self):
        from app.services.territory_rain_store import clear_memory

        clear_memory()
        yield
        clear_memory()

    def _compute(self, calls, payload=None):
        async def compute(zones, today, previous=None):
            calls.append(today)
            return payload or {"points": [], "weeks": []}

        return compute

    def _run(self, db, compute, **kw):
        from app.services import territory_rain_store as store

        async def zones(_db):
            return []

        store._catalonia_zones = zones
        return asyncio.run(store.get_territory_rain(db, TODAY, now=self.NOW, compute=compute, **kw))

    def test_a_fresh_row_is_served_without_asking_open_meteo(self):
        calls = []
        row = _Row(self.NOW - timedelta(hours=3), {"cached": True})
        assert self._run(_Db(row), self._compute(calls)) == {"cached": True}
        assert calls == []

    def test_an_old_row_is_rebuilt_and_written(self):
        calls = []
        db = _Db(_Row(self.NOW - timedelta(hours=30), {"cached": True}))
        out = self._run(db, self._compute(calls, {"fresh": True}))
        assert out == {"fresh": True} and len(calls) == 1 and db.writes == 1

    def test_if_the_rebuild_fails_the_old_answer_is_served_as_stale(self):
        async def compute(zones, today, previous=None):
            raise ProviderUnavailable("down")

        db = _Db(_Row(self.NOW - timedelta(hours=30), {"cached": True}))
        assert self._run(db, compute) == {"cached": True, "stale": True}

    def test_with_nothing_stored_a_failure_goes_up(self):
        async def compute(zones, today, previous=None):
            raise ProviderUnavailable("down")

        with pytest.raises(ProviderUnavailable):
            self._run(_Db(None), compute)

    def test_without_the_table_it_still_answers_and_remembers_in_memory(self):
        calls = []
        db = _Db(broken=True)
        assert self._run(db, self._compute(calls, {"fresh": True})) == {"fresh": True}
        assert self._run(db, self._compute(calls, {"again": True})) == {"fresh": True}
        assert len(calls) == 1 and db.rollbacks >= 1

    def test_force_rebuilds_even_when_fresh(self):
        calls = []
        db = _Db(_Row(self.NOW - timedelta(hours=1), {"cached": True}))
        assert self._run(db, self._compute(calls, {"fresh": True}), force=True) == {"fresh": True}


class TestIncremental:
    def _previous(self, today, mm=7.0, reached=None):
        starts = week_starts(today)
        return {
            "last_data_date": (reached or today - timedelta(days=1)).isoformat(),
            "weeks": [
                {"start": s.isoformat(), "end": (s + timedelta(days=6)).isoformat()} for s in starts
            ],
            "points": [
                {
                    "lat": lat,
                    "lon": lon,
                    "elevation_m": 500,
                    "label": None,
                    "mm": [mm] * len(starts),
                }
                for lat, lon in GRID
            ],
        }

    def _compute(self, today, previous):
        calls = []

        async def fetcher(points, start, end):
            calls.append(start)
            return [{end: 2.0} for _ in points], [None] * len(points)

        out = asyncio.run(compute_territory_rain([], today, fetcher, previous=previous))
        return out, calls

    def test_it_asks_only_for_the_last_three_weeks_and_keeps_the_older_ones(self):
        out, calls = self._compute(TODAY, self._previous(TODAY))
        starts = week_starts(TODAY)
        assert calls == [starts[-3]]
        mm = out["points"][0]["mm"]
        assert mm[:-3] == [7.0] * 23  # kept as they were
        assert mm[-3:] == [None, None, 2.0]  # asked again (only the last day has rain here)
        assert out["points"][0]["elevation_m"] == 500

    def test_next_week_the_weeks_shift_and_the_ones_kept_come_from_the_right_place(self):
        previous = self._previous(TODAY)
        previous["points"][0]["mm"][1] = 99.0  # week starting 7 days after the first
        later = TODAY + timedelta(days=7)
        out, calls = self._compute(later, previous)
        assert calls == [week_starts(later)[-3]]
        assert out["points"][0]["mm"][0] == 99.0  # that week is now the first one

    def test_it_asks_for_everything_without_a_previous_answer(self):
        _, calls = self._compute(TODAY, None)
        assert calls == [week_starts(TODAY)[0]]

    def test_it_asks_for_everything_if_the_previous_answer_is_too_old(self):
        old = TODAY - timedelta(days=40)
        _, calls = self._compute(TODAY, self._previous(old, reached=old - timedelta(days=1)))
        assert calls == [week_starts(TODAY)[0]]

    def test_it_asks_for_everything_if_the_grid_changed(self):
        previous = self._previous(TODAY)
        previous["points"][0]["lat"] += 0.5
        _, calls = self._compute(TODAY, previous)
        assert calls == [week_starts(TODAY)[0]]
