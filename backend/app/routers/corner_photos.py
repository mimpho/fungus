"""Photos of a saved point ("corner"): up to five per corner, two WebP copies each in a private
bucket, shown through short-lived signed URLs. Login required; someone else's corner is a 404.
"""
from fastapi import APIRouter, Depends, File, Form, HTTPException, Response, UploadFile, status

from app.config import settings
from app.dependencies import get_current_user
from app.models.user import User
from app.routers.saved_points import (
    _found,
    daily_limit_error,
    get_photo_storage,
    get_photo_store,
    get_saved_point_store,
    get_usage_log,
    storage_error,
)
from app.schemas.corner_photo import PhotoOut, PhotoSpeciesUpdate, clean_species_ids, to_out
from app.services.corner_photos import (
    EVENT_PHOTO_UPLOAD,
    DailyLimitExceeded,
    PhotoLimitReached,
    PhotoRecord,
    PhotoStore,
    UsageLog,
    check_daily_limit,
    store_photo,
)
from app.services.photo_images import ImageTooLarge, InvalidImage
from app.services.photo_storage import PhotoStorage, StorageError
from app.services.saved_points import SavedPointStore

router = APIRouter(
    prefix="/observatory/saved-points",
    tags=["Observatory"],
    dependencies=[Depends(get_current_user)],
)


async def _check_species(store: SavedPointStore, ids: list[str]) -> None:
    unknown = sorted(set(ids) - await store.known_species(ids))
    if unknown:
        raise HTTPException(422, detail=f"Unknown species: {unknown}")


async def _signed(storage: PhotoStorage | None, records: list[PhotoRecord]) -> list[PhotoOut]:
    keys = [k for r in records for k in (r.thumb_key, r.large_key)]
    if not keys:
        return []
    if storage is None:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, detail="Photos are not enabled")
    try:
        urls = await storage.signed_urls(keys, expires_in=settings.corner_photo_url_ttl_seconds)
    except StorageError as exc:
        raise storage_error(exc) from exc
    return [to_out(r, urls) for r in records]


@router.get("/{point_id}/photos", response_model=list[PhotoOut])
async def list_photos(
    point_id: int,
    user: User = Depends(get_current_user),
    points: SavedPointStore = Depends(get_saved_point_store),
    photos: PhotoStore = Depends(get_photo_store),
    storage: PhotoStorage | None = Depends(get_photo_storage),
) -> list[PhotoOut]:
    await _found(points, user, point_id)
    return await _signed(storage, await photos.list_photos(point_id))


@router.post("/{point_id}/photos", response_model=PhotoOut, status_code=status.HTTP_201_CREATED)
async def upload_photo(
    point_id: int,
    file: UploadFile = File(..., description="Any image format, HEIC included"),
    species_ids: list[str] = Form(default_factory=list, description="Species tagged on it"),
    user: User = Depends(get_current_user),
    points: SavedPointStore = Depends(get_saved_point_store),
    photos: PhotoStore = Depends(get_photo_store),
    storage: PhotoStorage | None = Depends(get_photo_storage),
    usage: UsageLog = Depends(get_usage_log),
) -> PhotoOut:
    """Upload a photo. The original is discarded after making the thumbnail (~600 px) and large
    (~1200 px) WebP copies, without EXIF/GPS. Checks, cheapest first: ownership, storage on,
    uploads of the day, species, size, full corner, readable image, pixels."""
    await _found(points, user, point_id)
    if storage is None:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, detail="Photos are not enabled")
    try:
        await check_daily_limit(
            usage, user.id, EVENT_PHOTO_UPLOAD, settings.corner_photo_uploads_per_user_per_day
        )
    except DailyLimitExceeded as exc:
        raise daily_limit_error(exc) from exc
    try:
        species = clean_species_ids(species_ids)
    except ValueError as exc:
        raise HTTPException(422, detail=str(exc)) from exc
    await _check_species(points, species)

    limit = settings.corner_photo_max_bytes
    data = await file.read(limit + 1 if limit > 0 else -1)  # never read more than the limit + 1
    if limit > 0 and len(data) > limit:
        raise HTTPException(
            status.HTTP_413_CONTENT_TOO_LARGE,
            detail=f"The photo is larger than {limit // (1024 * 1024)} MB",
        )
    try:
        record = await store_photo(
            photos, storage, usage, user_id=user.id, point_id=point_id, data=data,
            species_ids=species, max_photos=settings.corner_photos_max_per_corner,
            max_pixels=settings.corner_photo_max_pixels,
        )
    except PhotoLimitReached as exc:
        raise HTTPException(status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    except InvalidImage as exc:
        raise HTTPException(
            status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail="The file is not a readable image"
        ) from exc
    except ImageTooLarge as exc:
        raise HTTPException(
            status.HTTP_413_CONTENT_TOO_LARGE, detail="The image has too many pixels"
        ) from exc
    except StorageError as exc:
        raise storage_error(exc) from exc
    return (await _signed(storage, [record]))[0]


@router.patch("/{point_id}/photos/{photo_id}", response_model=PhotoOut)
async def tag_photo(
    point_id: int,
    photo_id: int,
    body: PhotoSpeciesUpdate,
    user: User = Depends(get_current_user),
    points: SavedPointStore = Depends(get_saved_point_store),
    photos: PhotoStore = Depends(get_photo_store),
    storage: PhotoStorage | None = Depends(get_photo_storage),
) -> PhotoOut:
    """Replace the species tagged on a photo."""
    await _found(points, user, point_id)
    if await photos.get_photo(point_id, photo_id) is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Photo not found")
    await _check_species(points, body.species_ids)
    record = await photos.set_photo_species(point_id, photo_id, body.species_ids)
    return (await _signed(storage, [record]))[0]


@router.delete("/{point_id}/photos/{photo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_photo(
    point_id: int,
    photo_id: int,
    user: User = Depends(get_current_user),
    points: SavedPointStore = Depends(get_saved_point_store),
    photos: PhotoStore = Depends(get_photo_store),
    storage: PhotoStorage | None = Depends(get_photo_storage),
) -> Response:
    """Delete a photo: the objects first, then the row. If the storage fails the row stays and
    the call can be repeated (deleting a missing object is not an error)."""
    await _found(points, user, point_id)
    record = await photos.get_photo(point_id, photo_id)
    if record is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Photo not found")
    if storage is None:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, detail="Photos are not enabled")
    try:
        await storage.delete([record.thumb_key, record.large_key])
    except StorageError as exc:
        raise storage_error(exc) from exc
    await photos.delete_photo(point_id, photo_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
