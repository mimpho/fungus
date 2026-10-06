"""Unit tests for the daily ingestion pipeline and the Open-Meteo connector.

No database or network: the HTTP client and the DB session are faked.
"""
import asyncio
from datetime import date, timedelta
from types import SimpleNamespace

import httpx
import pytest
from tenacity import wait_none

from app.connectors import open_meteo
from app.connectors.base import DailyWeatherData
from app.connectors.open_meteo import ARCHIVE_CUTOFF_DAYS, OpenMeteoConnector
from app.services import ingest


def _payload(start: date, end: date, soil_key: str = "soil_temperature_0cm") -> dict:
    days = [(start + timedelta(days=i)).isoformat() for i in range((end - start).days + 1)]
    hours = [f"{d}T{h:02d}:00" for d in days for h in range(24)]
    n = len(days)
    return {
        "daily": {
            "time": days,
            "temperature_2m_max": [20.0] * n,
            "temperature_2m_min": [8.0] * n,
            "temperature_2m_mean": [14.0] * n,
            "precipitation_sum": [3.0] * n,
            "windspeed_10m_max": [10.0] * n,
        },
        "hourly": {
            "time": hours,
            soil_key: [12.0] * len(hours),
            "relativehumidity_2m": [80] * len(hours),
        },
    }


# ── Connector: archive / forecast split ───────────────────────────────────────

class TestFetchRangeSplit:
    async def _run(self, monkeypatch, start, end):
        calls = []

        async def fake_request(self, s, e, archive=False):
            calls.append((s, e, archive))
            soil = "soil_temperature_0_to_7cm" if archive else "soil_temperature_0cm"
            return _payload(s, e, soil)

        monkeypatch.setattr(OpenMeteoConnector, "_request", fake_request)
        rows = await OpenMeteoConnector("zone-x", 42.0, 2.0).fetch_range(start, end)
        return calls, rows

    async def test_recent_range_uses_forecast_only(self, monkeypatch):
        y = date.today() - timedelta(days=1)
        calls, rows = await self._run(monkeypatch, y - timedelta(days=6), y)
        assert [c[2] for c in calls] == [False]
        assert len(rows) == 7

    async def test_old_range_uses_archive_only(self, monkeypatch):
        calls, rows = await self._run(monkeypatch, date(2024, 1, 1), date(2024, 12, 31))
        assert [c[2] for c in calls] == [True]
        assert len(rows) == 366
        assert rows[0].soil_temp_c == 12.0  # archive soil key is parsed

    async def test_spanning_range_is_split_without_gaps_or_overlap(self, monkeypatch):
        cutoff = date.today() - timedelta(days=ARCHIVE_CUTOFF_DAYS)
        start, end = cutoff - timedelta(days=10), date.today() - timedelta(days=1)
        calls, rows = await self._run(monkeypatch, start, end)
        assert [c[2] for c in calls] == [True, False]
        assert calls[0][1] == cutoff and calls[1][0] == cutoff + timedelta(days=1)
        dates = [r.date for r in rows]
        assert dates == sorted(set(dates)) and len(dates) == (end - start).days + 1


# ── Connector: retries ────────────────────────────────────────────────────────

class _FakeClient:
    def __init__(self, statuses):
        self.statuses = statuses

    async def __aenter__(self):
        return self

    async def __aexit__(self, *a):
        return False

    async def get(self, url, params=None):
        status = self.statuses.pop(0)
        req = httpx.Request("GET", url)
        if status == 200:
            s, e = date.fromisoformat(params["start_date"]), date.fromisoformat(params["end_date"])
            return httpx.Response(200, json=_payload(s, e), request=req)
        return httpx.Response(status, request=req)


class TestRetries:
    @pytest.fixture(autouse=True)
    def no_wait(self, monkeypatch):
        # Skip tenacity's exponential wait
        monkeypatch.setattr(OpenMeteoConnector._request.retry, "wait", wait_none())

    def _client(self, monkeypatch, statuses):
        monkeypatch.setattr(open_meteo.httpx, "AsyncClient", lambda **kw: _FakeClient(statuses))

    async def test_429_is_retried(self, monkeypatch):
        self._client(monkeypatch, [429, 200])
        y = date.today() - timedelta(days=1)
        rows = await OpenMeteoConnector("zone-x", 42.0, 2.0).fetch_range(y, y)
        assert len(rows) == 1

    async def test_400_is_not_retried(self, monkeypatch):
        statuses = [400, 200]
        self._client(monkeypatch, statuses)
        y = date.today() - timedelta(days=1)
        with pytest.raises(ingest.ProviderUnavailable):
            await OpenMeteoConnector("zone-x", 42.0, 2.0).fetch_range(y, y)
        assert statuses == [200]  # only one call made


# ── Ingest: no concurrent use of the DB session ───────────────────────────────

class _StrictSession:
    """Fails like AsyncSession does if two operations overlap."""

    def __init__(self, fail_zone=None):
        self.busy = False
        self.rows = []
        self.commits = 0
        self.fail_zone = fail_zone

    async def _op(self):
        if self.busy:
            raise RuntimeError("concurrent operations are not permitted")
        self.busy = True
        await asyncio.sleep(0)  # yield, like a real round-trip
        self.busy = False

    async def execute(self, stmt):
        await self._op()

    async def commit(self):
        await self._op()
        self.commits += 1

    async def rollback(self):
        pass


class _FakeConnector:
    def __init__(self, zone_id):
        self.zone_id = zone_id

    async def fetch_range(self, start, end):
        await asyncio.sleep(0)
        return [
            DailyWeatherData(
                zone_id=self.zone_id, date=start + timedelta(days=i),
                temp_max_c=None, temp_min_c=None, temp_avg_c=None, soil_temp_c=None,
                precipitation_mm=0.0, humidity_pct=None, wind_kmh=None, source="open-meteo",
            )
            for i in range((end - start).days + 1)
        ]


async def test_ingest_range_writes_all_zones_without_session_conflicts(monkeypatch):
    zones = [SimpleNamespace(id=f"zone-{i:03d}", lat=42.0, lon=2.0) for i in range(30)]
    db = _StrictSession()
    written = []

    async def fake_upsert(session, row):
        await session.execute(None)
        written.append(row.zone_id)

    monkeypatch.setattr(ingest, "_get_connector", lambda z: _FakeConnector(z.id))
    monkeypatch.setattr(ingest, "_upsert_climate_row", fake_upsert)

    y = date.today() - timedelta(days=1)
    result = await ingest._ingest_date_range(db, zones, start=y - timedelta(days=6), end=y)

    assert result["errors"] == []
    assert result["upserted"] == 30 * 7
    assert set(written) == {z.id for z in zones}
    assert db.commits == 30  # one commit per zone


async def test_one_failing_zone_does_not_stop_the_rest(monkeypatch):
    zones = [SimpleNamespace(id=f"zone-{i:03d}", lat=42.0, lon=2.0) for i in range(5)]
    db = _StrictSession()

    async def fake_upsert(session, row):
        if row.zone_id == "zone-002":
            raise ValueError("bad row")
        await session.execute(None)

    monkeypatch.setattr(ingest, "_get_connector", lambda z: _FakeConnector(z.id))
    monkeypatch.setattr(ingest, "_upsert_climate_row", fake_upsert)

    y = date.today() - timedelta(days=1)
    result = await ingest._ingest_date_range(db, zones, start=y, end=y)

    assert [e["zone_id"] for e in result["errors"]] == ["zone-002"]
    assert result["upserted"] == 4
