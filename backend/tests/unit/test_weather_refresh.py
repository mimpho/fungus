"""weather_cache refresh job: budget, circuit breaker, max age. No DB or network."""
from datetime import UTC, datetime, timedelta
from types import SimpleNamespace

import pytest

from app.routers.zones import _build_zone_weather
from app.services import weather_cache, weather_refresh
from app.services.weather_cache import CallBudget, WeatherFetchError, valid_until_for


def _zones(n):
    return [SimpleNamespace(id=f"zone-{i:03d}", lat=42.0, lon=2.0) for i in range(n)]


@pytest.fixture
def job(monkeypatch):
    """Patch the job's DB and network edges; return the recorded writes and alerts."""
    state = {"zones": _zones(5), "stored": [], "alerts": [], "outdated": []}
    monkeypatch.setattr(weather_refresh, "RETRY_DELAY_S", 0)
    monkeypatch.setattr(weather_cache, "budget", CallBudget(1000))
    monkeypatch.setattr(weather_refresh, "_last_alert_day", None)

    async def fake_zones(db):
        return state["zones"]

    async def fake_store(zone_id, provider, data, db):
        state["stored"].append(zone_id)

    async def fake_outdated(db):
        return state["outdated"]

    async def fake_alert(subject, html):
        state["alerts"].append(subject)
        return True

    from app.services import email

    monkeypatch.setattr(weather_refresh, "_get_active_zones", fake_zones)
    monkeypatch.setattr(weather_cache, "store_weather_cache", fake_store)
    monkeypatch.setattr(weather_refresh, "get_outdated_weather_zones", fake_outdated)
    monkeypatch.setattr(email, "send_ops_alert", fake_alert)
    return state


def _fetch_with(monkeypatch, fail):
    """fail: zone index → WeatherFetchError to raise for that zone (by call order)."""
    calls = []

    async def fake_fetch(lat, lon, client=None):
        i = len(calls)
        calls.append(i)
        if i in fail:
            raise fail[i]
        return {"temp_min": 5.0, "collected_at": datetime.now(UTC)}

    monkeypatch.setattr(weather_cache, "fetch_weather", fake_fetch)
    return calls


async def test_stores_every_zone_when_all_succeed(job, monkeypatch):
    _fetch_with(monkeypatch, {})
    summary = await weather_refresh.refresh_weather_cache(db=None)
    assert job["stored"] == [z.id for z in job["zones"]]
    assert summary["stopped"] is None and summary["failed"] == 0
    assert job["alerts"] == []


async def test_failed_zone_keeps_its_previous_row(job, monkeypatch):
    _fetch_with(monkeypatch, {1: WeatherFetchError(502, "Bad Gateway")})
    summary = await weather_refresh.refresh_weather_cache(db=None)
    assert "zone-001" not in job["stored"]          # not overwritten with empty data
    assert len(job["stored"]) == 4
    assert summary["failures_by_status"] == {"502": 1}


async def test_429_opens_the_circuit_breaker(job, monkeypatch):
    limit = WeatherFetchError(429, "Daily API request limit exceeded")
    calls = _fetch_with(monkeypatch, {2: limit})
    summary = await weather_refresh.refresh_weather_cache(db=None)
    assert len(calls) == 3                          # no call after the 429
    assert job["stored"] == ["zone-000", "zone-001"]
    assert "429" in summary["stopped"] and summary["skipped"] == 2


async def test_concurrency_429_is_retried_once(job, monkeypatch):
    busy = WeatherFetchError(429, '{"error":true,"reason":"Too many concurrent requests"}')
    calls = _fetch_with(monkeypatch, {1: busy})
    summary = await weather_refresh.refresh_weather_cache(db=None)
    assert len(calls) == 6                          # zone-001 retried, run not stopped
    assert job["stored"] == [z.id for z in job["zones"]]
    assert summary["stopped"] is None


async def test_network_error_is_retried_once_then_skipped(job, monkeypatch):
    timeout = WeatherFetchError(None, "ConnectTimeout: ")
    calls = _fetch_with(monkeypatch, {1: timeout, 2: timeout})
    summary = await weather_refresh.refresh_weather_cache(db=None)
    assert len(calls) == 6                          # zone-001: 2 attempts, then next zone
    assert "zone-001" not in job["stored"] and len(job["stored"]) == 4
    assert summary["stopped"] is None and summary["failures_by_status"] == {"network": 1}


async def test_concurrency_429_twice_opens_the_breaker(job, monkeypatch):
    busy = WeatherFetchError(429, "Too many concurrent requests")
    calls = _fetch_with(monkeypatch, {1: busy, 2: busy})
    summary = await weather_refresh.refresh_weather_cache(db=None)
    assert len(calls) == 3 and job["stored"] == ["zone-000"]
    assert "429" in summary["stopped"]


async def test_budget_stops_the_run_before_the_limit(job, monkeypatch):
    monkeypatch.setattr(weather_cache, "budget", CallBudget(3 * weather_cache.CALL_COST))
    calls = _fetch_with(monkeypatch, {})
    summary = await weather_refresh.refresh_weather_cache(db=None)
    assert len(calls) == 3
    assert "budget" in summary["stopped"] and summary["skipped"] == 2


def test_budget_resets_each_utc_day():
    b = CallBudget(2)
    assert b.try_spend(1) and b.try_spend(1) and not b.try_spend(1)
    b._day = b._day - timedelta(days=1)              # simulate the next day
    assert b.try_spend(1)


async def test_alerts_once_per_day_when_zones_are_outdated(job, monkeypatch):
    _fetch_with(monkeypatch, {0: WeatherFetchError(None, "ConnectTimeout: ")})  # retried OK
    job["outdated"] = ["zone-000"]
    await weather_refresh.refresh_weather_cache(db=None)
    await weather_refresh.refresh_weather_cache(db=None)
    assert job["alerts"] == ["Fungus — 1 zona(s) sin tiempo actual"]


def test_max_age_cut_off(monkeypatch):
    monkeypatch.setattr(weather_cache.settings, "weather_max_age_hours", 6)
    now = datetime.now(UTC)

    def row(hours_old):
        collected = now - timedelta(hours=hours_old)
        return SimpleNamespace(
            provider_id="open-meteo", temp_min=5.0, temp_max=12.0, humidity=80,
            rainfall14d=3.0, wind=10, soil_temp=11.0,
            collected_at=collected, valid_until=valid_until_for(collected),
        )

    assert _build_zone_weather([row(5.9)]) is not None
    assert _build_zone_weather([row(6.1)]) is None   # older than 6 h → "–", never stale data


async def test_refresh_can_target_only_some_zones(job, monkeypatch):
    calls = _fetch_with(monkeypatch, {})
    await weather_refresh.refresh_weather_cache(db=None, zone_ids=["zone-001", "zone-003"])
    assert len(calls) == 2 and job["stored"] == ["zone-001", "zone-003"]
