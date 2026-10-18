"""Observatory by coordinates: the climate and score of any point in Catalonia.

Login required. A point is resolved to its Open-Meteo grid cell; the cell's history is loaded
on the first request (source "live") and served from the database afterwards ("stored").
"""
import asyncio
import logging
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
from app.services.point_forecast import build_forecast
from app.services.point_forest import (
    DEFAULT_RADIUS_M,
    MAX_RADIUS_M,
    MIN_RADIUS_M,
    LandCover,
    cover_dict,
    fetch_toponym,
    forest_block,
    land_cover,
    species_forest_types,
)
from app.services.point_series import (
    DEFAULT_DAYS,
    MAX_DAYS,
    MIN_DAYS,
    build_series,
    build_snapshot,
)
from app.services.point_species import SpeciesRecord, species_for_point
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


async def _species_params(db: AsyncSession, species_id: str | None) -> SpeciesParams | None:
    if species_id is None:
        return None
    sp = await db.get(Species, species_id)
    if sp is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=f"Unknown species {species_id!r}")
    if sp.temp_min_c is None or sp.temp_opt_c is None or sp.temp_max_c is None:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Species has no temperature range"
        )
    return SpeciesParams(
        float(sp.temp_min_c),
        float(sp.temp_opt_c),
        float(sp.temp_max_c),
        tuple(sp.fruiting_months or ()),
    )


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
    return {
        "point": {"lat": point.lat, "lon": point.lon, "elevation_m": elevation},
        **forest_block(cover, toponym, radius, include_raw=raw),
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
    params = await _species_params(db, species)
    cell, rows = await _cell_and_rows(point, store, provider, user)
    elevation = await point_elevation(point.lat, point.lon)
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
    params = await _species_params(db, species)
    cell, rows = await _cell_and_rows(point, store, provider, user)
    elevation = await point_elevation(point.lat, point.lon)
    snap = build_snapshot(rows, _today(), cell.cell.elevation_m, elevation, on=on, species=params)
    if snap is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="No climate data for this point yet")
    # One thermometer per point: the climate is the same whatever forest types surround it.
    # The forest only changes which species are listed (/point/species).
    cover = await land_cover(point.lat, point.lon)
    return {
        **_point_block(point, cell, elevation),
        "species": species,
        "forest": None if cover is None else cover.forest,
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
    *,
    author_types: frozenset[str] | None = None,
    stored_cover: LandCover | None = None,
    stored_land_cover: dict | None = None,
) -> dict:
    """Species that fit a point on a date. Shared by /point/species and a saved point's species.

    Forest types come from, in this order: `author_types` (a saved point's, they win even over
    "no forest"), the land cover (`stored_cover` of a saved point, else asked to the ICGC now).
    `forest_source` says which one decided: "author", "land_cover" or null (unknown, nobody is
    excluded by forest)."""
    cell, rows = await _cell_and_rows(point, store, provider, user)
    elevation = await point_elevation(point.lat, point.lon)
    if author_types:
        cover, forest_types, source = stored_cover, author_types, "author"
    else:
        cover = stored_cover or await land_cover(point.lat, point.lon)
        forest_types = species_forest_types(cover)
        source = "land_cover" if forest_types is not None else None
    cover_info = stored_land_cover if stored_cover else cover_dict(cover)
    if not author_types and cover is not None and cover.forest is False:
        # the climate still answers; species do not
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
        forest_types=forest_types,
    )
    if data is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="No climate data for this point yet")
    return {
        **_point_block(point, cell, elevation),
        "forest_known": forest_types is not None,
        "forest": None if cover is None else cover.forest,
        "land_cover": cover_info,
        "forest_source": source,
        "reason": None, **data,
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
    params = await _species_params(db, species)
    cell, rows = await _cell_and_rows(point, store, provider, user)
    elevation = await point_elevation(point.lat, point.lon)
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
