"""Saved points of the free-map Observatory: coordinates a user named and keeps.

Login required; every point is private to its owner (someone else's id is a 404). The server
records where the derived data came from (land cover, toponym, elevation, cell); the climate
is never stored: it comes from the point's cell through /observatory/point/*.
"""
import asyncio
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.dependencies import get_current_user
from app.models.climate_cell import lookup_key
from app.models.user import User
from app.routers import observatory as obs
from app.schemas.saved_point import SavedPointCreate, SavedPointOut, SavedPointUpdate, to_out
from app.services.cell_provider import CellProvider, CellStore
from app.services.point_elevation import point_elevation
from app.services.point_forest import fetch_toponym, land_cover
from app.services.saved_point_store import SqlSavedPointStore
from app.services.saved_points import (
    DuplicatePoint,
    NewPoint,
    PointContext,
    SavedPointLimitExceeded,
    SavedPointRecord,
    SavedPointStore,
    author_forest_types,
    create_saved_point,
    stored_cover,
)

router = APIRouter(
    prefix="/observatory/saved-points",
    tags=["Observatory"],
    dependencies=[Depends(get_current_user)],
)


def get_saved_point_store(db: AsyncSession = Depends(get_db)) -> SavedPointStore:
    return SqlSavedPointStore(db)


async def _found(store: SavedPointStore, user: User, point_id: int) -> SavedPointRecord:
    record = await store.get(user.id, point_id)
    if record is None:  # someone else's point looks the same as a missing one
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Saved point not found")
    return record


@router.get("", response_model=list[SavedPointOut])
async def list_saved_points(
    user: User = Depends(get_current_user),
    store: SavedPointStore = Depends(get_saved_point_store),
) -> list[SavedPointOut]:
    return [to_out(r) for r in await store.list_for_user(user.id)]


@router.post("", response_model=SavedPointOut, status_code=status.HTTP_201_CREATED)
async def create_point(
    body: SavedPointCreate,
    user: User = Depends(get_current_user),
    store: SavedPointStore = Depends(get_saved_point_store),
    cells: CellStore = Depends(obs.get_cell_store),
) -> SavedPointOut:
    """Save a point. Land cover, toponym, elevation and cell are looked up here, never taken
    from the client. The name defaults to the nearest toponym."""

    async def context(lat: float, lon: float) -> PointContext:
        toponym, cover, elevation = await asyncio.gather(
            fetch_toponym(lat, lon), land_cover(lat, lon), point_elevation(lat, lon)
        )
        cell_id = await cells.get_lookup(lookup_key(lat, lon))  # no network, no new cell
        # composition: None until the MCSC-4 grid exists
        return PointContext(cover, toponym, elevation, cell_id, None)

    try:
        record = await create_saved_point(
            store, user.id,
            NewPoint(body.lat, body.lon, body.name, body.notes, body.forest_types),
            context, max_per_user=settings.observatory_max_saved_points_per_user,
        )
    except DuplicatePoint as exc:
        raise HTTPException(
            status.HTTP_409_CONFLICT, detail="You already saved a point at these coordinates"
        ) from exc
    except SavedPointLimitExceeded as exc:
        raise HTTPException(
            status.HTTP_409_CONFLICT, detail=f"Limit of {exc.limit} saved points reached"
        ) from exc
    return to_out(record)


@router.get("/{point_id}", response_model=SavedPointOut)
async def get_point(
    point_id: int,
    user: User = Depends(get_current_user),
    store: SavedPointStore = Depends(get_saved_point_store),
) -> SavedPointOut:
    return to_out(await _found(store, user, point_id))


@router.patch("/{point_id}", response_model=SavedPointOut)
async def update_point(
    point_id: int,
    body: SavedPointUpdate,
    user: User = Depends(get_current_user),
    store: SavedPointStore = Depends(get_saved_point_store),
) -> SavedPointOut:
    changes = body.model_dump(exclude_unset=True)
    if not changes:
        raise HTTPException(
            422,
            detail="Send at least one of name, notes, forest_types",
        )
    record = await store.update(user.id, point_id, changes)
    if record is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Saved point not found")
    return to_out(record)


@router.delete("/{point_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_point(
    point_id: int,
    user: User = Depends(get_current_user),
    store: SavedPointStore = Depends(get_saved_point_store),
) -> Response:
    if not await store.delete(user.id, point_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Saved point not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/{point_id}/species")
async def saved_point_species(
    point_id: int,
    on: date | None = Query(None, alias="date", description="Default: last day with data"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    points: SavedPointStore = Depends(get_saved_point_store),
    cells: CellStore = Depends(obs.get_cell_store),
    provider: CellProvider = Depends(obs.get_cell_provider),
) -> dict:
    """Same as /observatory/point/species, for the saved coordinates. The author's forest
    types win over the land cover (even over "no forest"); without them, the land cover stored
    when saving decides, read again, so the ICGC is asked only if it had failed then."""
    record = await _found(points, user, point_id)
    cover = stored_cover(record)
    stored_info = None if cover is None else {
        "layer": record.land_cover_layer, "code": record.land_cover_code,
        "name": record.land_cover_name,
        "retrieved_at": record.land_cover_retrieved_at,
    }
    return await obs.build_species_response(
        obs.PointQuery(lat=record.lat, lon=record.lon), on, user, db, cells, provider,
        author_types=author_forest_types(record.forest_types) if record.forest_types else None,
        stored_cover=cover, stored_land_cover=stored_info,
    )
