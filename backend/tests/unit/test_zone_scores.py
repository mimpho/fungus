"""Zone score in scores_cache: scenarios of feat/observatory-ingest-v2 (observatory-plan.md)."""

import json
from datetime import date
from pathlib import Path
from types import SimpleNamespace

import pytest

from app.services.zone_scores import build_score_row, v1_from_rows, v2_from_rows

FIXTURES = Path(__file__).resolve().parents[1] / "fixtures" / "climate"
REF = date(2026, 10, 6)
# The scores_cache values of "6 Oct" were written by the 7 Oct ingest: its "today" had no row
# yet (archive lag), so v1 summed 16 Sep – 6 Oct and v2 scores the last day with data.
INGEST_DAY = date(2026, 10, 7)


def until(rows, day):
    return [r for r in rows if r.date <= day]


def rows_of(zone_id: str) -> tuple[int, list[SimpleNamespace]]:
    """climate_history-like rows (same attribute names as the ORM model)."""
    doc = json.loads((FIXTURES / f"{zone_id}.json").read_text())
    cols = doc["columns"]
    rows = []
    for r in doc["rows"]:
        values = dict(zip(cols, r, strict=True))
        values["date"] = date.fromisoformat(values["date"])
        rows.append(SimpleNamespace(**values))
    return doc["elevation_m"], rows


@pytest.mark.parametrize(
    "zone_id, v1", [("zone-003", 58), ("zone-201", 75), ("zone-030", 76), ("zone-202", 81)]
)
def test_v1_parity_compute_oi_reproduces_scores_cache_on_2026_10_06(zone_id, v1):
    _, rows = rows_of(zone_id)
    assert v1_from_rows(until(rows, REF), INGEST_DAY).score == v1


@pytest.mark.parametrize(
    "zone_id, v2", [("zone-003", 49), ("zone-201", 7), ("zone-030", 16), ("zone-202", 20)]
)
def test_score_oi_is_v2_with_both_versions_in_the_detail(zone_id, v2):
    el, rows = rows_of(zone_id)
    row = build_score_row(until(rows, REF), INGEST_DAY, el)
    assert row.score_oi == v2
    assert row.score_detail["v2"]["date"] == "2026-10-06"
    assert row.model_version == "2.1"
    assert set(row.score_detail) == {"v1", "v2"}
    assert row.score_detail["v2"]["score"] == v2
    assert {"pa21", "thermal", "seasonal", "ripening", "humidity"} <= set(row.score_detail["v1"])
    json.dumps(row.score_detail)  # JSON-ready for the JSONB column


def test_the_detail_carries_the_rains_on_the_way():
    el, rows = rows_of("zone-201")
    pending = build_score_row(until(rows, REF), INGEST_DAY, el).score_detail["v2"]["pending_rains"]
    biggest = max(pending, key=lambda p: p["total_mm"])
    assert (biggest["shows_from"], biggest["peak"]) == ("2026-10-18", "2026-10-25")


def test_the_ingest_reads_100_days_not_21():
    el, rows = rows_of("zone-003")
    only_100 = [r for r in rows if (REF - r.date).days <= 100]
    assert v2_from_rows(rows, REF, el).score == v2_from_rows(only_100, REF, el).score == 49


def test_v2_scores_the_last_day_with_data_when_today_has_none():
    el, rows = rows_of("zone-003")
    row = build_score_row(until(rows, REF), date(2026, 10, 8), el)  # two days of lag
    assert row.model_version == "2.1"
    assert row.score_detail["v2"]["date"] == "2026-10-06"
    assert row.score_oi == 49


def test_the_ingest_never_scores_with_future_rows():
    el, rows = rows_of("zone-003")
    assert build_score_row(rows, REF, el).score_detail["v2"]["date"] == "2026-10-06"


def test_a_zone_without_climate_data_has_no_score():
    assert build_score_row([], REF, 1000) is None
