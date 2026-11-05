"""Batched grid probing of the Open-Meteo connector, with the HTTP client replaced."""

import pytest

from app.connectors.base import ProviderUnavailable
from app.connectors.open_meteo import resolve_grid_batch


def _client(payload, seen):
    class _Resp:
        def raise_for_status(self): ...
        def json(self):
            return payload

    class _Client:
        def __init__(self, *a, **k): ...
        async def __aenter__(self):
            return self

        async def __aexit__(self, *a): ...
        async def get(self, url, params):
            seen.append((url, params))
            return _Resp()

    return _Client


def _answer(lat, lon, elev):
    return {"latitude": lat, "longitude": lon, "elevation": elev, "daily": {"time": []}}


class TestResolveGridBatch:
    async def test_one_request_for_all_the_points_in_order(self, monkeypatch):
        seen = []
        payload = [_answer(41.7, 1.5, 480.0), _answer(41.8, 1.6, 900.0)]
        monkeypatch.setattr("app.connectors.open_meteo.httpx.AsyncClient", _client(payload, seen))
        out = await resolve_grid_batch([(41.71, 1.52), (41.79, 1.58)])
        assert out == [(41.7, 1.5, 480.0), (41.8, 1.6, 900.0)]
        assert len(seen) == 1
        params = seen[0][1]
        assert params["latitude"] == "41.7100,41.7900" and params["longitude"] == "1.5200,1.5800"
        # Open-Meteo answers 400 unless there is one elevation per coordinate.
        assert params["elevation"] == "nan,nan" and "archive" in seen[0][0]

    async def test_a_single_point_comes_back_as_an_object(self, monkeypatch):
        monkeypatch.setattr(
            "app.connectors.open_meteo.httpx.AsyncClient",
            _client(_answer(41.7, 1.5, 480.0), []),
        )
        assert await resolve_grid_batch([(41.71, 1.52)]) == [(41.7, 1.5, 480.0)]

    async def test_no_points_no_request(self, monkeypatch):
        seen = []
        monkeypatch.setattr("app.connectors.open_meteo.httpx.AsyncClient", _client([], seen))
        assert await resolve_grid_batch([]) == []
        assert seen == []

    async def test_wrong_number_of_answers_fails_cleanly(self, monkeypatch):
        monkeypatch.setattr(
            "app.connectors.open_meteo.httpx.AsyncClient",
            _client([_answer(41.7, 1.5, 480.0)], []),
        )
        with pytest.raises(ProviderUnavailable):
            await resolve_grid_batch([(41.71, 1.52), (41.79, 1.58)])

    async def test_answer_without_a_cell_fails_cleanly(self, monkeypatch):
        monkeypatch.setattr(
            "app.connectors.open_meteo.httpx.AsyncClient",
            _client([{"daily": {}}, {"daily": {}}], []),
        )
        with pytest.raises(ProviderUnavailable):
            await resolve_grid_batch([(41.71, 1.52), (41.79, 1.58)])
