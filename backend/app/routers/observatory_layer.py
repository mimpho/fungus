"""Layers of the interactive map: one answer for every stored cell of Catalonia.

Login required. Reads only what is already stored (no Open-Meteo calls, no new-cell budget).
"""
import asyncio
from datetime import UTC, date, datetime
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.dependencies import get_current_user
from app.models.species import Species
from app.services import layer_cache
from app.services.cell_store import SqlCellStore
from app.services.layer_probability import (
    CellClimate,
    excellent_layer,
    forecast_fresh_since,
    history_start,
    species_layer,
)
from app.services.point_ensemble import counts_in_ensemble
from app.services.point_species import EXCELLENT, SpeciesRecord

router = APIRouter(
    prefix="/observatory/layer",
    tags=["Observatory"],
    dependencies=[Depends(get_current_user)],
)


def get_layer_store(db: AsyncSession = Depends(get_db)) -> SqlCellStore:
    return SqlCellStore(db)


def get_forest_dir() -> Path:
    return Path(settings.forest_raster_dir)


def get_substrate_dir() -> Path:
    return Path(settings.substrate_raster_dir)


def _today() -> date:
    return datetime.now(UTC).date()


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
    stored = await store.loaded_cells_climate(history_start(today, on))
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
    rows = (await db.scalars(select(Species).where(Species.edibility.in_(sorted(EXCELLENT))))).all()
    records = (SpeciesRecord.from_row(r) for r in rows)
    species = [sp for sp in records if counts_in_ensemble(sp.forest_types, sp.forest_affinity)]
    today = _today()
    key = ("excellent", today, on, await store.data_signature(), tuple(species))
    if (cached := layer_cache.answers.get(key)) is not None:
        return cached
    stored = await store.loaded_cells_climate(history_start(today, on))
    cells = [CellClimate(c.id, c.lat, c.lon, c.elevation_m, r) for c, r in stored]
    return layer_cache.answers.put(
        key,
        await asyncio.to_thread(
            excellent_layer, cells, today, species, on, forecast_fresh_since(today)
        ),
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
