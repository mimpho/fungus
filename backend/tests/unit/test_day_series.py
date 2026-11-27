"""The stored daily series of Condiciones and the job that fills it. Pure and fake stores, no DB.

Scenarios D1.5-D1.9, D1.11 (the series computed when asked) and D1.14 of
memory/observatory-meteo-plan.md («Day selector»).
"""
from datetime import UTC, datetime, time, timedelta
from pathlib import Path
from types import SimpleNamespace

import pytest

from app.services import day_series
from app.services.day_series import (
    CHUNK_DAYS,
    EXCELLENT_SERIES,
    day_figures,
    inputs_hash,
    pending_days,
    served_daily,
    species_daily,
    update_day_series,
)
from app.services.layer_probability import (
    forecast_fresh_since,
    forecast_limit,
    scores_at_many,
    species_layer,
)
from app.services.meteo_weeks import first_bar_day
from tests.unit.test_layer_probability import _cell, _sp
from tests.unit.test_point_series import TODAY, _rows

FROM = forecast_fresh_since(TODAY)
REF = TODAY - timedelta(days=1)
A = _sp(id="a")
B = _sp(id="b", temp_opt_c=9.0, temp_max_c=15.0, elevation_min_m=1200, elevation_max_m=2200)
SPECIES = [A, B]
CELLS = [_cell("low", 41.60, 2.00, 600.0), _cell("high", 41.67, 2.00, 1700.0),
         _cell("mid", 41.74, 2.00, 1350.0)]


def _now(d=TODAY, hour=1):
    return datetime.combine(d, time(hour), tzinfo=UTC)


class TestDayFigures:
    def test_each_cell_counts_the_figure_the_map_computes_at_its_elevation(self):
        got = day_figures(CELLS, TODAY, SPECIES, REF, FROM)
        per_cell = [scores_at_many(c, TODAY, SPECIES, REF, c.elevation_m, [True, True], FROM)
                    for c in CELLS]
        for i, sp in enumerate(SPECIES):
            values = [s[i] for s in per_cell if s[i] is not None]
            assert got[sp.id].cells == len(values) > 0
            assert got[sp.id].mean == pytest.approx(sum(values) / len(values))
        means = [sum(v) / len(v) for v in ([x for x in s if x is not None] for s in per_cell) if v]
        assert got[EXCELLENT_SERIES].cells == len(means) == 3
        assert got[EXCELLENT_SERIES].mean == pytest.approx(sum(means) / len(means))

    def test_p90_is_the_figure_the_best_tenth_reaches_or_passes(self):
        figure = day_series._figure([float(v) for v in range(21)])
        assert (figure.mean, figure.p90, figure.cells) == (10.0, 18.0, 21)

    def test_out_of_season_there_is_no_value_and_not_a_zero(self):
        spring = _sp(id="s", fruiting_months=(4, 5))
        got = day_figures(CELLS, TODAY, [spring], REF, FROM)
        for key in ("s", EXCELLENT_SERIES):
            assert (got[key].mean, got[key].p90, got[key].cells) == (None, None, 0)

    def test_a_species_no_cell_reaches_has_no_value(self):
        alpine = _sp(id="z", elevation_min_m=2900, elevation_max_m=3100)
        got = day_figures(CELLS, TODAY, [A, alpine], REF, FROM)
        assert got["z"].mean is None and got[EXCELLENT_SERIES].mean == got["a"].mean


def _state(computed, inputs="h"):
    return (inputs, computed)


class TestPending:
    FIRST = first_bar_day(TODAY)
    ALL = (forecast_limit(TODAY) - FIRST).days + 1

    def _done(self, at=None):
        days = [self.FIRST + timedelta(days=i) for i in range(self.ALL)]
        return {d: _state(at or _now()) for d in days}

    def test_with_nothing_stored_every_day_of_the_bar_is_pending_newest_first(self):
        got = pending_days(TODAY, {}, "h", None)
        assert len(got) == self.ALL and got[0] == forecast_limit(TODAY) and got[-1] == self.FIRST

    def test_with_everything_computed_after_the_last_data_nothing_is(self):
        assert pending_days(TODAY, self._done(), "h", _now(hour=0)) == []

    def test_new_data_makes_only_the_days_a_refresh_rewrites_pending(self):
        got = pending_days(TODAY, self._done(), "h", _now(hour=2))
        assert (min(got), max(got)) == (TODAY - timedelta(days=11), forecast_limit(TODAY))

    def test_a_change_of_species_or_model_makes_every_day_pending(self):
        assert len(pending_days(TODAY, self._done(), "other", None)) == self.ALL

    def test_a_past_day_still_as_it_was_forecast_is_pending(self):
        done = self._done()
        old = TODAY - timedelta(days=20)
        done[old] = _state(_now(old - timedelta(days=1)))
        assert pending_days(TODAY, done, "h", _now(hour=0)) == [old]

    def test_the_hash_follows_the_species_not_their_order(self):
        assert inputs_hash([A, B]) == inputs_hash([B, A])
        assert inputs_hash([A, B]) != inputs_hash([A, _sp(id="b")])


class _Climate:
    def __init__(self, cells=CELLS):
        self.cells, self.reads = cells, []

    async def list_cells(self):
        return [SimpleNamespace(id=c.id, loaded_to=REF) for c in self.cells]

    async def loaded_cells_climate(self, since, *, until=None, recent_from=None, cell_ids=None):
        self.reads.append((since, until, None if cell_ids is None else len(cell_ids)))
        return [
            (SimpleNamespace(id=c.id, lat=c.lat, lon=c.lon, elevation_m=c.elevation_m),
             [r for r in c.rows if r.date >= since
              and (until is None or r.date <= until
                   or (recent_from is not None and r.date >= recent_from))])
            for c in self.cells if cell_ids is None or c.id in cell_ids
        ]


class _Series:
    def __init__(self, changed=None, fail_after=None):
        self.saved, self.changed, self.fail_after, self.writes = {}, changed, fail_after, []

    async def stored_state(self):
        return {d: (rows[EXCELLENT_SERIES][0], rows[EXCELLENT_SERIES][1])
                for d, rows in self.saved.items()}

    async def data_changed_at(self):
        return self.changed

    async def save_day(self, day, figures, inputs, computed_at):
        if self.fail_after is not None and len(self.writes) >= self.fail_after:
            raise RuntimeError("restart")
        self.writes.append(day)
        self.saved[day] = {k: (inputs, computed_at, f) for k, f in figures.items()}


@pytest.fixture
def short_bar(monkeypatch):
    """The bar cut to two weeks, so the job's tests do not score half a year."""
    first = TODAY - timedelta(days=14)
    monkeypatch.setattr(day_series, "first_bar_day", lambda _today: first)
    return (forecast_limit(TODAY) - first).days + 1


class TestJob:
    async def _run(self, series, climate=None, species=SPECIES):
        return await update_day_series(
            climate or _Climate(), series, species, TODAY, clock=lambda: _now())

    async def test_it_stores_every_day_with_every_series(self, short_bar):
        series = _Series()
        stats = await self._run(series)
        assert stats.computed == short_bar == len(series.saved)
        assert set(series.saved[REF]) == {EXCELLENT_SERIES, "a", "b"}
        assert series.saved[REF]["a"][2] == day_figures(CELLS, TODAY, SPECIES, REF, FROM)["a"]

    async def test_cut_half_way_it_keeps_what_is_done_and_then_computes_the_rest(self, short_bar):
        series = _Series(fail_after=5)
        with pytest.raises(RuntimeError):
            await self._run(series)
        assert len(series.saved) == 5
        series.fail_after = None
        assert (await self._run(series)).computed == short_bar - 5
        assert len(series.writes) == short_bar

    async def test_run_again_with_no_new_data_it_does_nothing_and_reads_no_climate(self, short_bar):
        series = _Series(changed=_now(hour=0))
        await self._run(series)
        climate = _Climate()
        assert (await self._run(series, climate)).computed == 0 and climate.reads == []

    async def test_with_other_species_every_day_is_computed_again(self, short_bar):
        series = _Series()
        await self._run(series)
        assert (await self._run(series, species=[A])).computed == short_bar

    async def test_it_reads_the_history_in_pieces(self, short_bar):
        climate = _Climate()
        await self._run(_Series(), climate)
        assert len(climate.reads) == -(-short_bar // CHUNK_DAYS)
        assert all((until - since).days < 107 + CHUNK_DAYS for since, until, _ in climate.reads)

    async def test_with_no_loaded_cell_it_stores_nothing(self, short_bar):
        series = _Series()
        assert (await self._run(series, _Climate([]))).computed == 0 and series.saved == {}


class TestServed:
    def _row(self, day, computed, mean=50.0):
        return SimpleNamespace(day=day, mean=mean, computed_at=computed)

    def test_a_forecast_day_computed_three_days_ago_does_not_count(self):
        old, fresh = _now(TODAY - timedelta(days=3)), _now(TODAY - timedelta(days=2))
        tomorrow = TODAY + timedelta(days=1)
        assert served_daily([self._row(tomorrow, old)], TODAY, FROM) == {}
        assert served_daily([self._row(tomorrow, fresh)], TODAY, FROM) == {tomorrow: 50.0}

    def test_a_past_day_computed_long_before_it_does_not_count_either(self):
        day = TODAY - timedelta(days=5)
        early = _now(day - timedelta(days=3))
        assert served_daily([self._row(day, early)], TODAY, FROM) == {}
        assert served_daily([self._row(day, _now(day))], TODAY, FROM) == {day: 50.0}

    def test_a_day_with_no_value_is_left_out(self):
        assert served_daily([self._row(REF, _now(), None)], TODAY, FROM) == {}


class TestSpeciesComputedWhenAsked:
    async def _daily(self, sp, climate=None):
        return await species_daily(climate or _Climate(), TODAY, sp, batch=2)

    async def test_from_the_same_history_it_gives_what_the_map_computes(self):
        # 90 days, fewer than the map's window: both start on the same row. With more history the
        # single pass starts earlier and a cell can differ (memory/gotchas.md, «warm» state)
        cell = _cell("one", 41.6, 2.0, rows=_rows(n=90))
        daily = await self._daily(A, _Climate([cell]))
        want = species_layer([cell], TODAY, A, REF)["cells"][0]["score"]
        assert daily[REF] == want

    async def test_the_cells_are_read_in_batches(self):
        climate = _Climate()
        await self._daily(A, climate)
        assert [n for _, _, n in climate.reads] == [2, 1]

    async def test_out_of_its_months_there_is_no_day(self):
        assert await self._daily(_sp(fruiting_months=(4,))) == {}

    async def test_it_goes_on_with_the_stored_forecast(self):
        rows = _rows()
        ahead = [SimpleNamespace(**{**vars(rows[-1]), "date": TODAY + timedelta(days=i),
                                    "source": "forecast", "fetched_at": _now()})
                 for i in range(10)]
        past = [r for r in rows if r.date < TODAY]
        daily = await self._daily(A, _Climate([_cell("one", 41.6, 2.0, rows=past + ahead)]))
        assert max(daily) == forecast_limit(TODAY)


@pytest.mark.parametrize("module", ["day_series", "meteo_weeks", "day_series_store"])
def test_nothing_in_the_series_can_call_open_meteo(module):
    source = (Path(day_series.__file__).parent / f"{module}.py").read_text()
    calls = ("connectors", "httpx", "open_meteo", "get_cell_provider")
    assert not any(word in source for word in calls)
