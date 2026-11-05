"""Observatory by coordinates: the climate and score of any point in Catalonia.

Login required. A point is resolved to its Open-Meteo grid cell; the cell's history is loaded
on the first request (source "live") and served from the database afterwards ("stored").
"""
import asyncio
import logging
from dataclasses import replace
from datetime import UTC, date, datetime
from functools import lru_cache

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.connectors.base import ProviderUnavailable
from app.database import get_db
from app.dependencies import get_current_user
from app.models.species import Species
from app.models.user import User, UserFavSpecies
from app.services.cell_provider import (
    CellBudgetExceeded,
    CellProvider,
    CellResult,
    CellStore,
    UserCellLimitExceeded,
)
from app.services.cell_store import SqlCellStore
from app.services.geo_bounds import LAT_RANGE, LON_RANGE
from app.services.point_calendar import build_calendar
from app.services.point_elevation import point_elevation
from app.services.point_ensemble import ENSEMBLE_SPECIES, Ensemble, Member, counts_in_ensemble
from app.services.point_forecast import build_forecast
from app.services.point_forest import (
    DEFAULT_RADIUS_M,
    MAX_RADIUS_M,
    MIN_RADIUS_M,
    cover_dict,
    fetch_toponym,
    forest_block,
    land_cover,
    species_forest_types,
)
from app.services.point_habitat import MIN_FACTOR, Habitat, habitat_at
from app.services.point_series import (
    DEFAULT_DAYS,
    MAX_DAYS,
    MIN_DAYS,
    build_series,
    build_snapshot,
)
from app.services.point_species import EXCELLENT, SpeciesRecord, fit_parts, species_for_point
from app.services.scoring_v2 import SpeciesParams

log = logging.getLogger(__name__)

router = APIRouter(
    prefix="/observatory/point",
    tags=["Observatory"],
    dependencies=[Depends(get_current_user)],
)


@lru_cache
def get_cell_provider() -> CellProvider:
    return CellProvider(
        max_new_cells_per_day=settings.observatory_max_new_cells_per_day,
        max_new_cells_per_user_per_day=settings.observatory_max_new_cells_per_user_per_day,
    )


class PointQuery:
    """lat/lon of the clicked point, validated to Catalonia (422 outside)."""

    def __init__(
        self,
        lat: float = Query(..., ge=LAT_RANGE[0], le=LAT_RANGE[1], description="Latitude"),
        lon: float = Query(..., ge=LON_RANGE[0], le=LON_RANGE[1], description="Longitude"),
    ) -> None:
        self.lat, self.lon = lat, lon


def get_cell_store(db: AsyncSession = Depends(get_db)) -> CellStore:
    return SqlCellStore(db)


async def _cell_and_rows(
    point: PointQuery, store: CellStore, provider: CellProvider, user: User
) -> tuple[CellResult, list]:
    try:
        result = await provider.get(store, point.lat, point.lon, user_id=user.id)
    except UserCellLimitExceeded as exc:
        raise HTTPException(
            status.HTTP_429_TOO_MANY_REQUESTS,
            detail=(
                f"Daily limit of {exc.limit} new areas per user reached; "
                "areas already opened keep working. Try again after midnight UTC"
            ),
            headers={"Retry-After": str(exc.retry_after)},
        ) from exc
    except CellBudgetExceeded as exc:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Too many new areas loaded today; try again later",
            headers={"Retry-After": str(exc.retry_after)},
        ) from exc
    except ProviderUnavailable as exc:
        log.warning("Open-Meteo unavailable for %s,%s: %s", point.lat, point.lon, exc)
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="The weather provider is not available; try again in a few minutes",
            headers={"Retry-After": "60"},
        ) from exc
    return result, await store.history(result.cell.id)


async def _species_record(db: AsyncSession, species_id: str | None) -> SpeciesRecord | None:
    if species_id is None:
        return None
    sp = await db.get(Species, species_id)
    if sp is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=f"Unknown species {species_id!r}")
    if sp.temp_min_c is None or sp.temp_opt_c is None or sp.temp_max_c is None:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Species has no temperature range"
        )
    return SpeciesRecord.from_row(sp)


def _species_params(
    record: SpeciesRecord | None, point: PointQuery, elevation: float | None, cell_elevation: float
) -> SpeciesParams | None:
    """The species' thermal range and what it asks of the weather, plus how well this point
    suits it (altitude, forest, soil), so every score of the point is the species' own."""
    if record is None:
        return None
    where = elevation if elevation is not None else cell_elevation
    parts = fit_parts(record, where, _habitat(point))
    return replace(record.params, fit_parts=parts)


async def _scored_species(
    db: AsyncSession,
    species_id: str | None,
    point: PointQuery,
    elevation: float | None,
    cell_elevation: float,
) -> SpeciesParams | Ensemble | None:
    """What a point is scored as: one species, the generic model (None) or, for
    `species=excellent`, the ensemble of the excellent edibles that grow here: the same set and
    the same mean the map paints before a species is chosen."""
    if species_id != ENSEMBLE_SPECIES:
        record = await _species_record(db, species_id)
        return _species_params(record, point, elevation, cell_elevation)
    rows = (await db.scalars(select(Species).where(Species.edibility.in_(sorted(EXCELLENT))))).all()
    where = elevation if elevation is not None else cell_elevation
    habitat = _habitat(point)
    members = []
    for row in rows:
        if row.temp_min_c is None or row.temp_opt_c is None or row.temp_max_c is None:
            continue
        record = SpeciesRecord.from_row(row)
        if not counts_in_ensemble(record.forest_types, record.forest_affinity):
            continue
        parts = fit_parts(record, where, habitat)
        if any(f == 0 for name, f in parts if name == "altitude"):
            continue
        product = 1.0
        for _, f in parts:
            product *= f
        if product < MIN_FACTOR:
            continue
        members.append(Member(replace(record.params, fit_parts=parts), record.fruiting_months))
    return Ensemble(tuple(members))


def _ensemble_block(ensemble: Ensemble, day: str) -> dict:
    """How many members the day's mean is made of: those in their fruiting months that day
    (the same ones the map counts), not every excellent species that fits the point.
    `climate_only`: no excellent species fits the place (altitude, forest, soil), so the
    thermometer reads the general climate."""
    month = date.fromisoformat(day).month
    count = sum(1 for m in ensemble.members if not m.fruiting_months or month in m.fruiting_months)
    return {"count": count, "climate_only": not ensemble.members}


def _point_block(point: PointQuery, cell: CellResult, elevation: float | None) -> dict:
    delta = None if elevation is None else round(elevation - cell.cell.elevation_m)
    return {
        "point": {"lat": point.lat, "lon": point.lon, "elevation_m": elevation},
        "cell": {
            "id": cell.cell.id,
            "lat": cell.cell.lat,
            "lon": cell.cell.lon,
            "elevation_m": round(cell.cell.elevation_m),
        },
        "elevation_delta_m": delta,
        "elevation_corrected": elevation is not None,
        "source": cell.source,
    }


def _today() -> date:
    return datetime.now(UTC).date()


def _habitat(point: PointQuery) -> Habitat:
    """Forest and soil shares at the point from the class rasters (empty where they are not
    built)."""
    return habitat_at(
        point.lat, point.lon, settings.forest_raster_dir, settings.substrate_raster_dir
    )


@router.get("/forest")
async def point_forest(
    point: PointQuery = Depends(),
    radius: int = Query(
        DEFAULT_RADIUS_M, ge=MIN_RADIUS_M, le=MAX_RADIUS_M,
        description="Metres around the point for the species composition (not available yet)",
    ),
    raw: bool = Query(False, description="Include the services' answers untouched (debugging)"),
) -> dict:
    """Nearest toponym, elevation and forest at the point. `forest` comes from the 2024 land
    cover (false for urban, crops, rock, scrub; null if the service did not answer);
    `composition` (species within `radius`) stays null until the MCSC-4 grid exists. The
    toponym is null if the geocoder fails: never an error."""
    toponym, cover, elevation = await asyncio.gather(
        fetch_toponym(point.lat, point.lon),
        land_cover(point.lat, point.lon),
        point_elevation(point.lat, point.lon),
    )
    habitat = _habitat(point)
    block = forest_block(cover, toponym, radius, include_raw=raw)
    around = habitat.forest_around()
    if around is not None:
        # Forest is judged around the point (the CREAF raster), not on the exact spot: a field
        # beside a wood has forest. What is under the pin stays in `land_cover`.
        block["forest_under_point"] = block["forest"]
        block["forest"] = around
        block["reason"] = None if around else "no_forest"
    return {
        "point": {"lat": point.lat, "lon": point.lon, "elevation_m": elevation},
        **block,
        "habitat": habitat.as_dict(),
    }


@router.get("/series")
async def point_series(
    point: PointQuery = Depends(),
    to: date | None = Query(None, description="Last day of the window (default: last with data)"),
    days: int = Query(DEFAULT_DAYS, ge=MIN_DAYS, le=MAX_DAYS),
    species: str | None = Query(None, description="Species id; absent = generic model"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    store: CellStore = Depends(get_cell_store),
    provider: CellProvider = Depends(get_cell_provider),
) -> dict:
    if species not in (None, ENSEMBLE_SPECIES):
        await _species_record(db, species)  # unknown species: 404 before the cell is loaded
    cell, rows = await _cell_and_rows(point, store, provider, user)
    elevation = await point_elevation(point.lat, point.lon)
    params = await _scored_species(db, species, point, elevation, cell.cell.elevation_m)
    window = build_series(
        rows, _today(), cell.cell.elevation_m, elevation, to=to, days=days, species=params
    )
    return {
        **_point_block(point, cell, elevation),
        "species": species,
        "last_data_date": window.last_data_date,
        "to": window.to,
        "clamped": window.clamped,
        "days": window.days,
        "events": window.events,
        "lowest_min": window.lowest_min,
    }


@router.get("/snapshot")
async def point_snapshot(
    point: PointQuery = Depends(),
    on: date | None = Query(None, alias="date", description="Default: last day with data"),
    species: str | None = Query(None),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    store: CellStore = Depends(get_cell_store),
    provider: CellProvider = Depends(get_cell_provider),
) -> dict:
    if species not in (None, ENSEMBLE_SPECIES):
        await _species_record(db, species)  # unknown species: 404 before the cell is loaded
    cell, rows = await _cell_and_rows(point, store, provider, user)
    elevation = await point_elevation(point.lat, point.lon)
    params = await _scored_species(db, species, point, elevation, cell.cell.elevation_m)
    snap = build_snapshot(rows, _today(), cell.cell.elevation_m, elevation, on=on, species=params)
    if snap is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="No climate data for this point yet")
    # One thermometer per point: the climate is the same whatever forest types surround it.
    # The forest only changes which species are listed (/point/species).
    cover = await land_cover(point.lat, point.lon)
    around = _habitat(point).forest_around()
    return {
        **_point_block(point, cell, elevation),
        "species": species,
        "ensemble": _ensemble_block(params, snap["date"]) if isinstance(params, Ensemble) else None,
        "forest": around if around is not None else (None if cover is None else cover.forest),
        "land_cover": cover_dict(cover),
        **snap,
    }


async def build_species_response(
    point: PointQuery,
    on: date | None,
    user: User,
    db: AsyncSession,
    store: CellStore,
    provider: CellProvider,
) -> dict:
    """Species that fit a point on a date. Shared by /point/species and a saved point's species.

    Forest types come from the land cover, asked to the ICGC now. `forest_source` says whether
    it decided ("land_cover") or not (null: unknown, nobody is excluded by forest)."""
    cell, rows = await _cell_and_rows(point, store, provider, user)
    elevation = await point_elevation(point.lat, point.lon)
    cover = await land_cover(point.lat, point.lon)
    forest_types = species_forest_types(cover)
    source = "land_cover" if forest_types is not None else None
    cover_info = cover_dict(cover)
    habitat = _habitat(point)
    around = habitat.forest_around()
    # Forest is judged around the point when the CREAF raster covers it, else on the exact spot
    if around is not None:
        no_forest = not around
    else:
        no_forest = cover is not None and cover.forest is False
    if no_forest and around is None:
        # no CREAF raster here and the land cover says no forest: the climate still answers;
        # species do not. With the raster, no forest around still lists the species the forest
        # cannot judge (meadow, garden, riparian): they are not in the mean, but can be picked.
        return {
            **_point_block(point, cell, elevation),
            "forest_known": True, "forest": False, "land_cover": cover_info,
            "forest_source": "land_cover", "reason": "no_forest",
            "species": [], "excellent": [],
        }
    catalogue = [SpeciesRecord.from_row(r) for r in (await db.scalars(select(Species))).all()]
    followed = set(
        (
            await db.scalars(
                select(UserFavSpecies.species_id).where(UserFavSpecies.user_id == user.id)
            )
        ).all()
    )
    data = species_for_point(
        rows, _today(), cell.cell.elevation_m, elevation, catalogue, on=on, followed=followed,
        forest_types=forest_types, habitat=habitat,
    )
    if data is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="No climate data for this point yet")
    return {
        **_point_block(point, cell, elevation),
        "forest_known": forest_types is not None,
        "forest": around if around is not None else (None if cover is None else cover.forest),
        "forest_under_point": None if cover is None else cover.forest,
        "land_cover": cover_info,
        "forest_source": source,
        "habitat": habitat.as_dict(),
        "reason": "no_forest" if no_forest and not data["species"] else None, **data,
    }


@router.get("/species")
async def point_species(
    point: PointQuery = Depends(),
    on: date | None = Query(None, alias="date", description="Default: last day with data"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    store: CellStore = Depends(get_cell_store),
    provider: CellProvider = Depends(get_cell_provider),
) -> dict:
    """Species that fit the point on a date (altitude, month; forest once it is known), with
    score, grade, conditions and best window. Followed species first; the excellent edibles
    again in their own list, by score."""
    return await build_species_response(point, on, user, db, store, provider)


@router.get("/calendar")
async def point_calendar(
    point: PointQuery = Depends(),
    on: date | None = Query(None, alias="date", description="Default: last day with data"),
    species: str | None = Query(None),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    store: CellStore = Depends(get_cell_store),
    provider: CellProvider = Depends(get_cell_provider),
) -> dict:
    """The last 7 real days and the next 35: the cell's forecast as far as it reaches, then an
    estimate without forecast (no rain, last week's means). Each day says which one it is."""
    if species not in (None, ENSEMBLE_SPECIES):
        await _species_record(db, species)  # unknown species: 404 before the cell is loaded
    cell, rows = await _cell_and_rows(point, store, provider, user)
    elevation = await point_elevation(point.lat, point.lon)
    params = await _scored_species(db, species, point, elevation, cell.cell.elevation_m)
    data = build_calendar(
        rows, _today(), cell.cell.elevation_m, elevation, on=on, species=params
    )
    if data is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="No climate data for this point yet")
    return {**_point_block(point, cell, elevation), "species": species, **data}


@router.get("/forecast")
async def point_forecast(
    point: PointQuery = Depends(),
    user: User = Depends(get_current_user),
    store: CellStore = Depends(get_cell_store),
    provider: CellProvider = Depends(get_cell_provider),
) -> dict:
    """The weather the cell's stored forecast announces, from today and up to 16 days, shifted to
    the point's elevation. `days` is empty when the cell has no forecast yet."""
    cell, rows = await _cell_and_rows(point, store, provider, user)
    elevation = await point_elevation(point.lat, point.lon)
    data = build_forecast(rows, _today(), cell.cell.elevation_m, elevation)
    return {**_point_block(point, cell, elevation), **data}
