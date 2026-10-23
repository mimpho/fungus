"""Saved points ("corners") of the free-map Observatory: coordinates a user named and keeps.

Login required; every point is private to its owner (someone else's id is a 404). What is
stored is what the user writes (name, notes, kind, tagged species) plus the coordinates and
the elevation; the climate, the forest, the soil and the toponym are never stored: they come
from /observatory/point/* when the corner is opened.
"""
import asyncio
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.routers import observatory as obs
from app.schemas.saved_point import SavedPointCreate, SavedPointOut, SavedPointUpdate, to_out
from app.services.cell_provider import CellProvider, CellStore
from app.services.point_elevation import point_elevation
from app.services.point_forest import fetch_toponym
from app.services.saved_point_store import SqlSavedPointStore
from app.services.saved_points import (
    DuplicatePoint,
    NewPoint,
    PointContext,
    SavedPointLimitExceeded,
    SavedPointRecord,
    SavedPointStore,
    create_saved_point,
    default_name,
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


async def _check_species(store: SavedPointStore, ids: list[str]) -> None:
    """Every tagged species must exist in the catalogue: an unknown id is a 422."""
    unknown = sorted(set(ids) - await store.known_species(ids))
    if unknown:
        raise HTTPException(422, detail=f"Unknown species: {unknown}")


@router.post("", response_model=SavedPointOut, status_code=status.HTTP_201_CREATED)
async def create_point(
    body: SavedPointCreate,
    user: User = Depends(get_current_user),
    store: SavedPointStore = Depends(get_saved_point_store),
) -> SavedPointOut:
    """Save a point. Toponym and elevation are looked up here, never taken from the client. The
    name defaults to the nearest toponym."""
    await _check_species(store, body.species_ids)

    async def context(lat: float, lon: float) -> PointContext:
        toponym, elevation = await asyncio.gather(
            fetch_toponym(lat, lon), point_elevation(lat, lon)
        )
        return PointContext(toponym, elevation)

    try:
        record = await create_saved_point(
            store, user.id,
            NewPoint(
                body.lat, body.lon, body.name, body.notes, body.kind, tuple(body.species_ids)
            ),
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
            detail="Send at least one of name, notes, kind, species_ids",
        )
    if "species_ids" in changes:
        await _check_species(store, changes["species_ids"])
    if changes.get("name") == "":  # blank name: the default one again, as when it was saved
        current = await _found(store, user, point_id)
        changes["name"] = default_name(
            current.lat, current.lon, await fetch_toponym(current.lat, current.lon)
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
    """Same as /observatory/point/species, for the saved coordinates, judged by the same map
    sources as any other point (forest and soil rasters, ICGC land cover asked now)."""
    record = await _found(points, user, point_id)
    return await obs.build_species_response(
        obs.PointQuery(lat=record.lat, lon=record.lon), on, user, db, cells, provider
    )
