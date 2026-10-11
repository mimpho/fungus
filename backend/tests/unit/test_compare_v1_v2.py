"""scripts/compare_v1_v2.py: one CSV row per day, same numbers as the cache row would hold."""

from datetime import date

from scripts.compare_v1_v2 import COLUMNS, rows_for_zone
from tests.unit.test_zone_scores import rows_of


def test_one_row_per_day_with_v1_and_v2():
    el, rows = rows_of("zone-201")
    out = rows_for_zone(rows, el, date(2026, 9, 20), date(2026, 10, 6))
    assert len(out) == 17
    assert all(len(r) == len(COLUMNS) for r in out)
    last = dict(zip(COLUMNS, out[-1], strict=True))
    assert last["date"] == "2026-10-06"
    assert last["v2"] == 7
    assert last["state"] == "cold"
    first = dict(zip(COLUMNS, out[0], strict=True))
    assert first["v2"] == 10  # reference case of 20 Sep
