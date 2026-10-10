"""Stale-zone alert after the daily ingest. No DB or network."""
from datetime import date, timedelta

from app.services import email, ingest


def _stale(zone_id, days_ago):
    last = date.today() - timedelta(days=days_ago) if days_ago is not None else None
    return {"zone_id": zone_id, "name": f"Zona {zone_id}", "last_date": last}


async def test_alert_lists_zones_and_marks_data_loss(monkeypatch):
    sent = {}

    async def fake_send(subject, html):
        sent["subject"], sent["html"] = subject, html
        return True

    monkeypatch.setattr(email, "send_ops_alert", fake_send)
    stale = [_stale("zone-003", 3), _stale("zone-099", 10), _stale("zone-201", None)]
    await ingest._alert_stale_zones(stale, [{"zone_id": "zone-003", "error": "HTTP 503"}])

    assert sent["subject"] == "Fungus — 3 zona(s) sin datos recientes"
    html = sent["html"]
    assert "zone-003" in html and "HTTP 503" in html
    assert "hace 10 días" in html and "perdiendo días" in html   # beyond the 7-day lookback
    assert "nunca" in html                                      # zone without any data
    assert "--zones zone-003,zone-099,zone-201" in html


async def test_daily_ingest_alerts_only_when_stale(monkeypatch):
    calls = []

    async def fake_zones(db):
        return []

    async def fake_range(db, zones, start, end):
        return {"upserted": 0, "errors": []}

    async def fake_refresh(db, zones):
        return None

    async def fake_alert(stale, errors):
        calls.append(stale)

    monkeypatch.setattr(ingest, "_get_active_zones", fake_zones)
    monkeypatch.setattr(ingest, "_ingest_date_range", fake_range)
    monkeypatch.setattr(ingest, "_refresh_scores_cache", fake_refresh)
    monkeypatch.setattr(ingest, "_alert_stale_zones", fake_alert)

    async def none_stale(db):
        return []

    monkeypatch.setattr(ingest, "get_stale_zones", none_stale)
    summary = await ingest.run_daily_ingest(None)
    assert calls == [] and summary["stale_zones"] == []

    async def some_stale(db):
        return [_stale("zone-003", 3)]

    monkeypatch.setattr(ingest, "get_stale_zones", some_stale)
    summary = await ingest.run_daily_ingest(None)
    assert len(calls) == 1 and summary["stale_zones"] == ["zone-003"]


async def test_send_ops_alert_skips_without_config(monkeypatch):
    monkeypatch.setattr(email.settings, "alert_email", "")
    assert await email.send_ops_alert("x", "y") is False
