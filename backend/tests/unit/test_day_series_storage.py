"""The table of the daily series, its migration and the SQL of the stores. No DB."""
from datetime import UTC, date, datetime

from sqlalchemy.dialects import postgresql

from app.models import MeteoDaySeries
from app.services.cell_store import climate_statement, rain_statement
from app.services.day_series import DayFigure
from app.services.day_series_store import save_day_statement
from tests.unit.test_climate_cell_model import VERSIONS, _load_migration

DAY = date(2026, 10, 1)


def _sql(statement) -> str:
    return str(statement.compile(dialect=postgresql.dialect()))


class TestTable:
    def test_one_row_per_day_and_series(self):
        assert [c.name for c in MeteoDaySeries.__table__.primary_key.columns] == ["day", "series"]

    def test_a_day_with_no_cell_is_stored_without_a_value(self):
        cols = MeteoDaySeries.__table__.c
        assert cols.mean.nullable and cols.p90.nullable and not cols.cells.nullable

    def test_migration_023_follows_022_and_is_the_only_head(self):
        m = _load_migration(VERSIONS / "023_meteo_day_series.py")
        assert (m.revision, m.down_revision) == ("023", "022")
        assert not list(VERSIONS.glob("024_*.py"))

    def test_the_migration_builds_the_columns_of_the_model_and_enables_rls(self, monkeypatch):
        m = _load_migration(VERSIONS / "023_meteo_day_series.py")
        made, run = {}, []
        monkeypatch.setattr(m.op, "create_table", lambda name, *items: made.update({name: items}))
        monkeypatch.setattr(m.op, "execute", run.append)
        m.upgrade()
        columns = {i.name for i in made["meteo_day_series"] if hasattr(i, "type")}
        assert columns == set(MeteoDaySeries.__table__.c.keys())
        assert run == ["ALTER TABLE meteo_day_series ENABLE ROW LEVEL SECURITY"]


class TestSql:
    def test_saving_a_day_replaces_what_it_had(self):
        sql = _sql(save_day_statement(
            DAY, {"excellent": DayFigure(1.0, 2.0, 3)}, "h", datetime(2026, 10, 2, tzinfo=UTC)))
        assert "ON CONFLICT (day, series) DO UPDATE" in sql and "computed_at" in sql

    def test_the_whole_history_has_no_upper_bound(self):
        sql = _sql(climate_statement(DAY))
        assert "date >=" in sql and "date <=" not in sql

    def test_an_old_date_reads_up_to_it_and_the_recent_days(self):
        sql = _sql(climate_statement(DAY, until=DAY, recent_from=date(2026, 11, 1)))
        assert "date <=" in sql and " OR " in sql

    def test_a_batch_reads_only_its_cells(self):
        assert "cell_id IN" in _sql(climate_statement(DAY, cell_ids=["a", "b"]))

    def test_the_past_rain_reads_four_columns_and_not_the_whole_climate(self):
        sql = _sql(rain_statement(DAY, date(2026, 10, 14)))
        assert "precipitation_mm" in sql and "temp_max_c" not in sql and "date <" in sql
