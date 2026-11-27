"""An old date reads less of the history and answers the same (D1.13). No DB."""
from datetime import UTC, datetime, time, timedelta
from types import SimpleNamespace

import httpx
import pytest
from fastapi import FastAPI

from app.database import get_db
from app.dependencies import get_current_user
from app.routers import observatory_layer as layer
from app.services import layer_cache
from tests.unit.test_layer_probability import _cell, _Db, _row, _sp
from tests.unit.test_point_series import TODAY, _rows

OLD = TODAY - timedelta(days=150)
URLS = ["probability-excellent", "probability?species=esp-1", "rain?window=21d"]


def _history():
    """300 observed days and a fresh forecast, with a different weather by cell and stretch."""
    past = _rows(n=300)
    ahead = [
        SimpleNamespace(**{**vars(past[-1]), "date": TODAY + timedelta(days=i)}) for i in range(10)
    ]
    for r in past:
        r.source, r.fetched_at = "archive", datetime.combine(TODAY, time(1), tzinfo=UTC)
    for r in ahead:
        r.source, r.fetched_at = "forecast", datetime.combine(TODAY, time(1), tzinfo=UTC)
    return past + ahead


CELLS = [_cell(f"c{i}{j}", 41.60 + 0.07 * i, 2.00 + 0.127 * j, 600.0 + 100 * j, _history())
         for i in range(2) for j in range(3)]


class _Store:
    def __init__(self, bounded):
        self.bounded, self.rows_read = bounded, 0

    async def data_signature(self):
        return ("v1", self.bounded)

    async def loaded_cells_climate(self, since, *, until=None, recent_from=None, cell_ids=None):
        out = []
        for c in CELLS:
            rows = [r for r in c.rows if r.date >= since]
            if self.bounded and until is not None:
                rows = [r for r in rows if r.date <= until
                        or (recent_from is not None and r.date >= recent_from)]
            self.rows_read += len(rows)
            out.append((SimpleNamespace(
                id=c.id, lat=c.lat, lon=c.lon, elevation_m=c.elevation_m), rows))
        return out


async def _answer(url, store, monkeypatch, on):
    layer_cache.answers.clear()
    app = FastAPI()
    app.include_router(layer.router, prefix="/api/v1")
    app.dependency_overrides[get_db] = lambda: _Db(_row(_sp(
        edibility="excelente", fruiting_months=())))
    app.dependency_overrides[layer.get_layer_store] = lambda: store
    app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(id=1)
    monkeypatch.setattr(layer, "_today", lambda: TODAY)
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://t/api/v1") as c:
        sep = "&" if "?" in url else "?"
        r = await c.get(f"/observatory/layer/{url}{sep}date={on.isoformat()}")
    assert r.status_code == 200
    return r.json()


@pytest.mark.parametrize("url", URLS)
async def test_an_old_date_answers_the_same_with_fewer_rows(url, monkeypatch):
    full, bounded = _Store(False), _Store(True)
    want = await _answer(url, full, monkeypatch, OLD)
    got = await _answer(url, bounded, monkeypatch, OLD)
    assert got == want and got["date"] == OLD.isoformat()
    assert got["last_data_date"] == (TODAY - timedelta(days=1)).isoformat()
    assert got["max_date"] == (TODAY + timedelta(days=7)).isoformat()
    assert bounded.rows_read < full.rows_read * 0.7


@pytest.mark.parametrize("url", URLS)
async def test_a_recent_date_reads_without_an_upper_bound(url, monkeypatch):
    bounded, full = _Store(True), _Store(False)
    await _answer(url, bounded, monkeypatch, TODAY - timedelta(days=5))
    await _answer(url, full, monkeypatch, TODAY - timedelta(days=5))
    assert bounded.rows_read == full.rows_read
    layer_cache.answers.clear()
