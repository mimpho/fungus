"""Layers of the interactive map: one answer for every stored cell of Catalonia.

Login required. Reads only what is already stored (no Open-Meteo calls, no new-cell budget).
"""
import asyncio
from datetime import UTC, date, datetime, timedelta
from pathlib import Path
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.dependencies import get_current_user
from app.models.species import Species
from app.services import layer_cache
from app.services.cell_store import SqlCellStore
from app.services.day_series import EXCELLENT_SERIES, served_daily, species_daily
from app.services.day_series_store import SqlDaySeriesStore, excellent_species
from app.services.layer_probability import (
    CellClimate,
    excellent_layer,
    forecast_fresh_since,
    forecast_limit,
    history_start,
    species_layer,
)
from app.services.layer_rain import DEFAULT_RAIN_WINDOW, history_since, rain_layer
from app.services.meteo_weeks import first_bar_day, mean, rain_daily, weeks_answer
from app.services.point_species import SpeciesRecord

router = APIRouter(
    prefix="/observatory/layer",
    tags=["Observatory"],
    dependencies=[Depends(get_current_user)],
)


def get_layer_store(db: AsyncSession = Depends(get_db)) -> SqlCellStore:
    return SqlCellStore(db)


def get_series_store(db: AsyncSession = Depends(get_db)) -> SqlDaySeriesStore:
    return SqlDaySeriesStore(db)


# One species computed when asked at a time: each reads the whole history of every cell
_species_series_lock = asyncio.Lock()


def get_forest_dir() -> Path:
    return Path(settings.forest_raster_dir)


def get_substrate_dir() -> Path:
    return Path(settings.substrate_raster_dir)


def _today() -> date:
    return datetime.now(UTC).date()


# The last days, always read: they tell the last day with data and how far the forecast goes
RECENT_DAYS = 30


def _until(today: date, on: date | None) -> dict:
    """For a date older than the recent days, read the history only up to it (plus those days):
    otherwise every later day is read and prepared for nothing."""
    recent_from = today - timedelta(days=RECENT_DAYS)
    if on is None or on >= recent_from:
        return {}
    return {"until": on, "recent_from": recent_from}


@router.get("/probability")
async def probability_layer(
    species: str = Query(..., description="Species id; one at a time"),
    on: date | None = Query(None, alias="date", description="Default: last day with data"),
    db: AsyncSession = Depends(get_db),
    store: SqlCellStore = Depends(get_layer_store),
) -> dict:
    """Probability (0-100) of one species in every stored cell on a date: the v2 index with the
    species' thermal range, times the altitude factor at the cell's mean elevation. The date can
    be up to a week after today: from today on the days come from the stored forecast (`basis`
    says "forecast"; `max_date` is the last day that can be asked, `clamped` that the one asked
    was beyond it). Cells the species does not reach by altitude come without score; out of its
    fruiting months nothing is scored (`in_season` false). `species.forest_classes` says which
    forest classes the species fits (null = no forest filter); the forest itself is the raster
    of `/forest-raster`."""
    row = await db.get(Species, species)
    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=f"Unknown species {species!r}")
    today = _today()
    record = SpeciesRecord.from_row(row)
    key = ("species", today, on, await store.data_signature(), record)
    if (cached := layer_cache.answers.get(key)) is not None:
        return cached
    stored = await store.loaded_cells_climate(history_start(today, on), **_until(today, on))
    cells = [CellClimate(c.id, c.lat, c.lon, c.elevation_m, rows) for c, rows in stored]
    # ~420 cells of pure arithmetic: off the event loop so other requests keep answering
    return layer_cache.answers.put(
        key,
        await asyncio.to_thread(
            species_layer, cells, today, record, on, forecast_fresh_since(today)
        ),
    )


@router.get("/probability-excellent")
async def probability_excellent_layer(
    on: date | None = Query(None, alias="date", description="Default: last day with data"),
    db: AsyncSession = Depends(get_db),
    store: SqlCellStore = Depends(get_layer_store),
) -> dict:
    """What the map shows before a species is chosen: the score of every excellent edible in
    every stored cell on a date, per species (see `excellent_layer`). The client averages, at
    each pixel, the species that grow there (altitude, forest and soil judged per pixel). One
    pass shares the part of the model that does not depend on the species, so all of them cost
    little more than one. Answers are remembered while the stored data does not change."""
    species = await excellent_species(db)
    today = _today()
    key = ("excellent", today, on, await store.data_signature(), tuple(species))
    if (cached := layer_cache.answers.get(key)) is not None:
        return cached
    stored = await store.loaded_cells_climate(history_start(today, on), **_until(today, on))
    cells = [CellClimate(c.id, c.lat, c.lon, c.elevation_m, r) for c, r in stored]
    return layer_cache.answers.put(
        key,
        await asyncio.to_thread(
            excellent_layer, cells, today, species, on, forecast_fresh_since(today)
        ),
    )


@router.get("/rain")
async def rain(
    window: Literal["24h", "7d", "14d", "21d"] = Query(
        DEFAULT_RAIN_WINDOW, description="1, 7, 14 or 21 days, ending on `date`"
    ),
    on: date | None = Query(None, alias="date", description="Default: last day with data"),
    store: SqlCellStore = Depends(get_layer_store),
) -> dict:
    """Accumulated rain (mm) of every stored cell over the window that ends on a date, up to a
    week after today: from today on the days come from the stored forecast (`basis` says
    "forecast"; `clamped` that the date asked was beyond `max_date`). `includes_forecast` says
    some day of the window is forecast, which for the last past days can also happen before the
    daily refresh.
    A cell with a day missing comes as "estimated" from the cells around it, or as "no_data"
    (`mm` null); see `rain_layer`."""
    today = _today()
    key = ("rain", today, on, window, await store.data_signature())
    if (cached := layer_cache.answers.get(key)) is not None:
        return cached
    stored = await store.loaded_cells_climate(history_since(today, on), **_until(today, on))
    cells = [CellClimate(c.id, c.lat, c.lon, c.elevation_m, rows) for c, rows in stored]
    return layer_cache.answers.put(
        key,
        await asyncio.to_thread(
            rain_layer, cells, today, window, on, forecast_fresh_since(today)
        ),
    )


@router.get("/weeks")
async def weeks(
    layer: Literal["rain", "conditions"] = Query(..., description="Which bars"),
    species: str | None = Query(
        None, description="Conditions only; default: the excellent edibles together"
    ),
    db: AsyncSession = Depends(get_db),
    store: SqlCellStore = Depends(get_layer_store),
    series_store: SqlDaySeriesStore = Depends(get_series_store),
) -> dict:
    """The day selector's weekly figures for all of Catalonia, from the Monday 26 weeks before
    the current week to the last day with a figure (`max_date`). Each week has a `real` part
    (before today) and a `forecast` one, each with its number of `days` and its `value` (null
    with none). Rain: mm, the days' means over the cells added up; computed when asked.
    Conditions: the mean over the days of the mean over the cells (see `day_series`), stored for
    the excellent edibles, together (`series` "excellent") and one by one; any other species is
    computed when asked, which takes a few seconds the first time."""
    today = _today()
    if layer == "rain":
        key = ("rain-weeks", today, await store.data_signature())
        if (cached := layer_cache.answers.get(key)) is not None:
            return cached
        stored = await store.loaded_cells_rain(first_bar_day(today), today)
        cells = [CellClimate(c.id, c.lat, c.lon, c.elevation_m, rows) for c, rows in stored]
        daily = await asyncio.to_thread(rain_daily, cells, today, forecast_fresh_since(today))
        return layer_cache.answers.put(
            key, {"layer": layer, "series": None, **weeks_answer(daily, today, sum)}
        )

    if species is None or species in {sp.id for sp in await excellent_species(db)}:
        series = species or EXCELLENT_SERIES
        rows = await series_store.series_rows(series, first_bar_day(today), forecast_limit(today))
        daily = served_daily(rows, today, forecast_fresh_since(today))
        return {"layer": layer, "series": series, **weeks_answer(daily, today, mean)}

    row = await db.get(Species, species)
    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=f"Unknown species {species!r}")
    record = SpeciesRecord.from_row(row)
    key = ("species-weeks", today, await store.data_signature(), record)
    async with _species_series_lock:
        # looked up inside the lock: whoever waited finds what the other one computed
        if (cached := layer_cache.answers.get(key)) is not None:
            return cached
        daily = await species_daily(store, today, record)
        return layer_cache.answers.put(
            key, {"layer": layer, "series": record.id, **weeks_answer(daily, today, mean)}
        )


# The class rasters (forest from CREAF MCSC-4, whose licence is unconfirmed; substrate from ICGC)
# are not public static files: they go through login and browsers may keep them, but shared
# caches may not.
_RASTER_CACHE = {"Cache-Control": "private, max-age=86400"}


def _raster_file(folder: Path, stem: str, ext: str) -> FileResponse:
    path = folder / f"{stem}.{ext}"
    if not path.is_file():
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Raster not available")
    media_type = "application/json" if ext == "json" else "application/octet-stream"
    return FileResponse(path, media_type=media_type, headers=_RASTER_CACHE)


@router.get("/forest-raster/meta")
async def forest_raster_meta(folder: Path = Depends(get_forest_dir)) -> FileResponse:
    """Where the forest raster sits (bounds, size) and its classes, in order."""
    return _raster_file(folder, "forest-catalonia", "json")


@router.get("/forest-raster")
async def forest_raster(folder: Path = Depends(get_forest_dir)) -> FileResponse:
    """Forest raster, same extent and pixel grid as the elevation raster: share*255 of each
    class, class after class ([class][row][column])."""
    return _raster_file(folder, "forest-catalonia", "bin")


@router.get("/substrate-raster/meta")
async def substrate_raster_meta(folder: Path = Depends(get_substrate_dir)) -> FileResponse:
    """Where the substrate raster sits and its classes (acid, mixed, calcareous), in order."""
    return _raster_file(folder, "substrate-catalonia", "json")


@router.get("/substrate-raster")
async def substrate_raster(folder: Path = Depends(get_substrate_dir)) -> FileResponse:
    """Substrate raster, same layout as the forest one: share*255 of each acidity class."""
    return _raster_file(folder, "substrate-catalonia", "bin")
