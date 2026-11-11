"""Open-Meteo quota refusals (HTTP 429): never retried, a process-wide pause, the same point not
asked again right after a failure, and a 503 with Retry-After from the Observatory, never a 500.

No network: the HTTP client is replaced."""
from datetime import UTC, date, datetime, timedelta

import httpx
import pytest
from tenacity import wait_none

from app.connectors import open_meteo
from app.connectors.base import ProviderRateLimited, ProviderUnavailable
from app.connectors.open_meteo import OpenMeteoConnector, resolve_grid_batch, retry_after_seconds
from app.routers import observatory as obs
from app.services.cell_provider import FAILURE_TTL_S, CellProvider
from tests.unit.test_cell_provider import NOW, SANTA_FE, TODAY, FakeConnector, FakeStore
from tests.unit.test_observatory_router import SANTA_FE as SANTA_FE_PARAMS
from tests.unit.test_observatory_router import _client, _logged_in, env  # noqa: F401

DAILY = {"error": True, "reason": "Daily API request limit exceeded. Please try again tomorrow."}
MINUTELY = {"error": True, "reason": "Minutely API request limit exceeded. Please try again."}
CONCURRENT = {"error": True, "reason": "Too many concurrent requests"}


class _Client:
    """Answers with the queued responses, in order; counts the calls."""

    def __init__(self, answers):
        self.answers = answers
        self.calls = 0

    def __call__(self, **kw):
        return self

    async def __aenter__(self):
        return self

    async def __aexit__(self, *a):
        return False

    async def get(self, url, params=None):
        self.calls += 1
        answer = self.answers.pop(0)
        if isinstance(answer, Exception):
            raise answer
        status, body = answer
        return httpx.Response(status, json=body, request=httpx.Request("GET", url))


@pytest.fixture(autouse=True)
def no_wait(monkeypatch):
    monkeypatch.setattr(open_meteo._send.retry, "wait", wait_none())


def _install(monkeypatch, answers) -> _Client:
    client = _Client(answers)
    monkeypatch.setattr(open_meteo.httpx, "AsyncClient", client)
    return client


OK = (200, {"latitude": 41.78, "longitude": 2.44, "elevation": 667.0, "daily": {"time": []}})


class TestConnector:
    async def test_a_quota_429_is_one_call_and_says_when_to_come_back(self, monkeypatch):
        client = _install(monkeypatch, [(429, MINUTELY), OK])
        with pytest.raises(ProviderRateLimited) as exc:
            await OpenMeteoConnector("r", 41.77, 2.43).resolve_grid()
        assert client.calls == 1
        assert exc.value.retry_after == 60 and "Minutely" in exc.value.reason

    async def test_after_a_429_no_request_leaves_until_the_pause_ends(self, monkeypatch):
        client = _install(monkeypatch, [(429, DAILY), OK, OK])
        with pytest.raises(ProviderRateLimited):
            await OpenMeteoConnector("a", 41.77, 2.43).resolve_grid()
        with pytest.raises(ProviderRateLimited) as again:
            await OpenMeteoConnector("b", 42.20, 1.80).resolve_grid()  # another point, too
        with pytest.raises(ProviderRateLimited):
            await resolve_grid_batch([(41.0, 1.0)])  # and the ingest's batched probe
        assert client.calls == 1
        assert 0 < again.value.retry_after <= 24 * 3600
        open_meteo.reset_rate_limit_pause()
        assert await OpenMeteoConnector("c", 41.77, 2.43).resolve_grid() == (41.78, 2.44, 667.0)

    async def test_a_concurrency_429_is_retried(self, monkeypatch):
        client = _install(monkeypatch, [(429, CONCURRENT), OK])
        assert await OpenMeteoConnector("r", 41.77, 2.43).resolve_grid() == (41.78, 2.44, 667.0)
        assert client.calls == 2 and open_meteo.rate_limit_pause() == 0

    async def test_server_errors_end_as_provider_unavailable_not_httpx(self, monkeypatch):
        client = _install(monkeypatch, [(503, {}), (502, {}), (500, {})])
        with pytest.raises(ProviderUnavailable) as exc:
            await OpenMeteoConnector("r", 41.77, 2.43).resolve_grid()
        assert not isinstance(exc.value, ProviderRateLimited) and client.calls == 3

    async def test_network_errors_end_as_provider_unavailable(self, monkeypatch):
        boom = httpx.ConnectTimeout("timeout")
        _install(monkeypatch, [boom, boom, boom])
        y = date.today() - timedelta(days=1)
        with pytest.raises(ProviderUnavailable):
            await OpenMeteoConnector("z", 41.77, 2.43).fetch_range(y, y)


class TestRetryAfter:
    NOW = datetime(2026, 11, 11, 22, 59, 30, tzinfo=UTC)

    def test_daily_waits_until_utc_midnight(self):
        assert retry_after_seconds(DAILY["reason"], None, self.NOW) == 3600 + 30

    def test_hourly_waits_until_the_next_hour(self):
        assert retry_after_seconds("Hourly API request limit exceeded", None, self.NOW) == 30

    def test_minutely_waits_a_minute(self):
        assert retry_after_seconds(MINUTELY["reason"], "5", self.NOW) == 60

    def test_unknown_reason_uses_the_header_or_a_minute(self):
        assert retry_after_seconds("", "120", self.NOW) == 120
        assert retry_after_seconds("", None, self.NOW) == 60


class _Clock:
    def __init__(self):
        self.now = NOW

    def __call__(self):
        return self.now


class _RateLimitedConnector(FakeConnector):
    async def resolve_grid(self):
        if self.log.get("limited", True):
            self.log["resolve"].append((self.lat, self.lon))
            raise ProviderRateLimited("429", retry_after=300, reason="Hourly")
        return await super().resolve_grid()


def _provider(clock, limited=True):
    log = {"resolve": [], "fetch": [], "limited": limited}
    provider = CellProvider(
        connector_factory=lambda cid, lat, lon, e: _RateLimitedConnector(log, cid, lat, lon, e),
        today=lambda: TODAY,
        now=clock,
    )
    return provider, log


class TestNegativeCache:
    async def test_a_point_that_just_failed_is_not_asked_again(self):
        clock = _Clock()
        provider, log = _provider(clock)
        store = FakeStore()
        for _ in range(5):  # the five point endpoints of one page
            with pytest.raises(ProviderRateLimited):
                await provider.get(store, *SANTA_FE, user_id=1)
        assert len(log["resolve"]) == 1

    async def test_the_remembered_failure_keeps_counting_down(self):
        clock = _Clock()
        provider, _ = _provider(clock)
        store = FakeStore()
        with pytest.raises(ProviderRateLimited):
            await provider.get(store, *SANTA_FE)
        clock.now = NOW + timedelta(seconds=200)
        with pytest.raises(ProviderRateLimited) as exc:
            await provider.get(store, *SANTA_FE)
        assert exc.value.retry_after == 100

    async def test_once_the_wait_is_over_the_point_is_asked_again(self):
        clock = _Clock()
        provider, log = _provider(clock)
        store = FakeStore()
        with pytest.raises(ProviderRateLimited):
            await provider.get(store, *SANTA_FE)
        log["limited"] = False
        clock.now = NOW + timedelta(seconds=301)
        assert (await provider.get(store, *SANTA_FE)).source == "live"
        assert len(log["resolve"]) == 2

    async def test_a_failed_load_is_remembered_for_a_minute(self):
        clock = _Clock()
        log = {"resolve": [], "fetch": []}
        provider = CellProvider(
            connector_factory=lambda cid, lat, lon, e: FakeConnector(
                log, cid, lat, lon, e, fail=True
            ),
            today=lambda: TODAY,
            now=clock,
        )
        store = FakeStore()
        for _ in range(3):
            with pytest.raises(ProviderUnavailable):
                await provider.get(store, *SANTA_FE)
        assert len(log["fetch"]) == 1
        clock.now = NOW + timedelta(seconds=FAILURE_TTL_S + 1)
        with pytest.raises(ProviderUnavailable):
            await provider.get(store, *SANTA_FE)
        assert len(log["fetch"]) == 2


class TestEndpoints:
    @pytest.mark.parametrize(
        "path", ["series", "snapshot", "species", "calendar", "forecast"]
    )
    async def test_a_429_from_open_meteo_is_503_with_its_retry_after(self, env, path):  # noqa: F811
        provider, _ = _provider(_Clock())
        env.app.dependency_overrides[obs.get_cell_provider] = lambda: provider
        _logged_in(env)
        async with _client(env.app) as c:
            r = await c.get(f"/observatory/point/{path}", params=SANTA_FE_PARAMS)
        assert r.status_code == 503
        assert r.headers["Retry-After"] == "300"
