"""Cell cache tables (T1 of feat/observatory-api). No DB."""
import importlib.util
from datetime import date
from pathlib import Path

from sqlalchemy import CheckConstraint

from app.models import Cell, ClimateCellHistory
from app.models.climate_cell import CELL_SOURCES, cell_id

MIGRATION = Path(__file__).parents[2] / "migrations" / "versions" / "017_climate_cells.py"


def _load_migration():
    spec = importlib.util.spec_from_file_location("m017", MIGRATION)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_cell_id_is_stable_and_uses_four_decimals():
    assert cell_id(41.7743, 2.4482) == "41.7743_2.4482"
    assert cell_id(41.77, 2.4) == "41.7700_2.4000"
    assert cell_id(41.7743, 2.4482) == cell_id(41.77430001, 2.44819999)


def test_a_cell_has_one_row_per_day():
    pk = [c.name for c in ClimateCellHistory.__table__.primary_key.columns]
    assert pk == ["cell_id", "date"]


def test_history_belongs_to_a_cell_and_follows_its_deletion():
    fk = next(iter(ClimateCellHistory.__table__.c.cell_id.foreign_keys))
    assert fk.column.table.name == Cell.__tablename__
    assert fk.ondelete == "CASCADE"


def test_source_is_restricted_to_archive_or_forecast():
    assert CELL_SOURCES == ("archive", "forecast")
    checks = [c for c in ClimateCellHistory.__table__.constraints if isinstance(c, CheckConstraint)]
    assert any("archive" in str(c.sqltext) and "forecast" in str(c.sqltext) for c in checks)


def test_metrics_match_the_zone_history_columns():
    from app.models import ClimateHistory

    metrics = {"temp_max_c", "temp_min_c", "temp_avg_c", "soil_temp_c",
               "precipitation_mm", "humidity_pct", "wind_kmh"}
    cell_cols = set(ClimateCellHistory.__table__.c.keys())
    assert metrics <= cell_cols
    assert metrics <= set(ClimateHistory.__table__.c.keys())


def test_cell_keeps_the_mean_elevation_for_the_altitude_correction():
    assert not Cell.__table__.c.elevation_m.nullable


def test_migration_017_follows_016():
    m = _load_migration()
    assert (m.revision, m.down_revision) == ("017", "016")
    assert callable(m.upgrade) and callable(m.downgrade)


def test_lookup_maps_a_bucket_to_a_cell_and_follows_its_deletion():
    from app.models import CellLookup

    pk = [c.name for c in CellLookup.__table__.primary_key.columns]
    assert pk == ["lat_key", "lon_key"]
    fk = next(iter(CellLookup.__table__.c.cell_id.foreign_keys))
    assert fk.column.table.name == "cells" and fk.ondelete == "CASCADE"


def test_the_sql_upsert_never_replaces_archive_with_forecast():
    from sqlalchemy.dialects import postgresql

    from app.services.cell_store import upsert_rows_statement

    row = {"cell_id": "c", "date": date(2026, 10, 1), "precipitation_mm": 1.0, "source": "forecast"}
    compiled = upsert_rows_statement([row]).compile(dialect=postgresql.dialect())
    sql = str(compiled)
    assert "ON CONFLICT (cell_id, date) DO UPDATE" in sql
    assert "WHERE NOT (climate_cell_history.source = " in sql
    assert "AND excluded.source = " in sql
    assert {"archive", "forecast"} <= set(compiled.params.values())
