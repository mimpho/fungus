"""Species routes: list and detail.

GET /species                          → paginated list (replaces mockSpecies on frontend)
GET /species/{id}                     → full detail (replaces SpeciesModal data)
GET /species/{id}/visual-prompt       → structured visual DNA for image generation (admin)
PATCH /species/{id}/images            → save generated image to a slot (admin only)
POST /species/{id}/images/reorder     → rearrange existing slot images (admin only)
POST /species/{id}/images/set-order   → write ordered photo list (admin only)
PUT  /species/{id}/visual-prompt      → upsert visual prompt data (admin only)
"""
import copy
import logging

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm.attributes import flag_modified

from app.database import get_db
from app.dependencies import get_admin_user
from app.models.mushroom_visual_prompt import MushroomVisualPrompt
from app.models.species import Species
from app.models.user import User
from app.schemas.species import (
    SetPhotosOrderBody,
    SlotReorderBody,
    SpeciesDetail,
    SpeciesImageUpdate,
    SpeciesListItem,
    SpeciesOIParams,
    VisualPromptData,
    VisualPromptUpsertBody,
)

log = logging.getLogger(__name__)
router = APIRouter(prefix="/species", tags=["Species"])

# Max items per page — keeps response size predictable
_PAGE_SIZE = 50

# Supported i18n locales
_LANGS = {"es", "ca", "en"}


# ── Helpers ────────────────────────────────────────────────────────────────────

def _extra_str(species: Species, key: str, lang: str = "es") -> str | None:
    """Safely extract a string field from extra_data, with i18n fallback.

    Lookup order:
    - Non-ES: ``{key}_{lang}`` (e.g. ``cond_temp_ca``) → ``{key}_es`` → ``{key}``
    - ES:     ``{key}_es`` (explicit suffix, used by Gemini migrations) → ``{key}``
    Always returns None if extra_data is absent.
    """
    if not species.extra_data:
        return None
    if lang != "es":
        val = species.extra_data.get(f"{key}_{lang}")
        if val:
            return val
    # Try explicit _es key (Gemini migrations store cond_*_es, not cond_*)
    # then fall back to the canonical unsuffixed key (description, commonNames…)
    return species.extra_data.get(f"{key}_es") or species.extra_data.get(key)


def _extra_list(species: Species, key: str, lang: str = "es") -> list | None:
    """Safely extract a list field from extra_data, with i18n fallback.

    Same lookup order as _extra_str: ``{key}_{lang}`` → ``{key}_es`` → ``{key}``.
    """
    if not species.extra_data:
        return None
    if lang != "es":
        val = species.extra_data.get(f"{key}_{lang}")
        if val:
            return val
    return species.extra_data.get(f"{key}_es") or species.extra_data.get(key)


def _photo_url(species: Species) -> str | None:
    """Extract the main photo URL from extra_data."""
    if not species.extra_data:
        return None
    photo = species.extra_data.get("photo")
    if isinstance(photo, dict):
        return photo.get("url")
    return None


def _synonyms(species: Species) -> list[str] | None:
    """Extract synonyms from extra_data JSONB field."""
    if not species.extra_data:
        return None
    return species.extra_data.get("synonyms")


def _confusions(species: Species) -> list[dict] | None:
    """Extract confusions from extra_data JSONB field."""
    if not species.extra_data:
        return None
    return species.extra_data.get("confusions")


def _to_list_item(s: Species, lang: str = "es") -> SpeciesListItem:
    return SpeciesListItem(
        id=s.id,
        scientific_name=s.scientific_name,
        family=s.family,
        edibility=s.edibility,
        forest_types=s.forest_types,
        fruiting_months=s.fruiting_months,
        elevation_min_m=s.elevation_min_m,
        elevation_max_m=s.elevation_max_m,
        common_names=_extra_list(s, "commonNames", lang),
        photo_url=_photo_url(s),
        # description, synonyms, confusions excluded from list — see _to_detail()
    )


def _to_detail(s: Species, lang: str = "es") -> SpeciesDetail:
    return SpeciesDetail(
        id=s.id,
        scientific_name=s.scientific_name,
        family=s.family,
        edibility=s.edibility,
        forest_types=s.forest_types,
        fruiting_months=s.fruiting_months,
        elevation_min_m=s.elevation_min_m,
        elevation_max_m=s.elevation_max_m,
        common_names=_extra_list(s, "commonNames", lang),
        photo_url=_photo_url(s),
        description=_extra_str(s, "description", lang),
        synonyms=_synonyms(s),
        confusions=_confusions(s),
        cond_temp=_extra_str(s, "cond_temp", lang),
        cond_precip=_extra_str(s, "cond_precip", lang),
        cond_suelo=_extra_str(s, "cond_suelo", lang),
        cond_req=_extra_str(s, "cond_req", lang),
        oi_params=SpeciesOIParams(
            temp_min_c=float(s.temp_min_c) if s.temp_min_c is not None else None,
            temp_opt_c=float(s.temp_opt_c) if s.temp_opt_c is not None else None,
            temp_max_c=float(s.temp_max_c) if s.temp_max_c is not None else None,
            rain_min_mm=s.rain_min_mm,
            rain_opt_mm=s.rain_opt_mm,
            cycle_days=s.cycle_days,
        ),
        extra_data=s.extra_data,
    )


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("", response_model=list[SpeciesListItem])
async def list_species(
    lang: str = Query("es", pattern="^(es|ca|en)$", description="Response language (es/ca/en)"),
    family: str | None = Query(None, description="Filter by family name"),
    edibility: str | None = Query(None, description="Filter by edibility level"),
    forest_type: str | None = Query(
        None, description="Filter to species that grow in this forest type"
    ),
    fruiting_month: int | None = Query(
        None, ge=1, le=12, description="Filter to species that fruit in this month (1-12)"
    ),
    cursor: str | None = Query(
        None, description="Cursor-based pagination: pass the last `id` from the previous page"
    ),
    limit: int = Query(_PAGE_SIZE, ge=1, le=500, description="Items per page"),
    db: AsyncSession = Depends(get_db),
) -> list[SpeciesListItem]:
    """
    Return species catalog with optional filtering and cursor-based pagination.
    Replaces the mockSpecies import in the frontend catalog view.

    Filters:
    - family: exact match (e.g. 'Boletaceae')
    - edibility: exact match (e.g. 'excelente', 'toxico')
    - forest_type: species whose forest_types array contains this value
    - fruiting_month: species active in this month (1-12)

    Pagination: pass the `id` of the last item as `cursor` to get the next page.

    Cache-Control: public, max-age=3600 (set in middleware).
    """
    stmt = select(Species).order_by(Species.id)

    if family:
        stmt = stmt.where(Species.family == family)
    if edibility:
        stmt = stmt.where(Species.edibility == edibility)
    if forest_type:
        # PostgreSQL array operator: forest_type = ANY(forest_types)
        stmt = stmt.where(Species.forest_types.contains([forest_type]))
    if fruiting_month:
        stmt = stmt.where(Species.fruiting_months.contains([fruiting_month]))
    if cursor:
        stmt = stmt.where(Species.id > cursor)

    stmt = stmt.limit(limit)

    result = await db.execute(stmt)
    rows = result.scalars().all()
    return [_to_list_item(s, lang) for s in rows]


@router.get("/{species_id}", response_model=SpeciesDetail)
async def get_species(
    species_id: str,
    lang: str = Query("es", pattern="^(es|ca|en)$", description="Response language (es/ca/en)"),
    db: AsyncSession = Depends(get_db),
) -> SpeciesDetail:
    """
    Full species detail: biological parameters, morphology, confusions, photos.
    species_id uses the same format as the mock ('esp-001', …).

    Cache-Control: public, max-age=3600 (set in middleware).
    """
    result = await db.execute(select(Species).where(Species.id == species_id))
    species = result.scalar_one_or_none()

    if species is None:
        raise HTTPException(status_code=404, detail=f"Species '{species_id}' not found")

    return _to_detail(species, lang)


@router.patch("/{species_id}/images", response_model=SpeciesDetail)
async def update_species_image(
    species_id: str,
    body: SpeciesImageUpdate,
    _admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
) -> SpeciesDetail:
    """
    Save a generated image to a species photo slot (admin only).

    Stores the image as a ``data:`` URI inside ``extra_data`` JSONB so it is
    immediately served without requiring a separate file-hosting deploy step.

    Slots:
    - ``main``   → ``extra_data.photo.url``
    - ``photo1`` → ``extra_data.photos[0].url``
    - ``photo2`` → ``extra_data.photos[1].url``

    The ``image_base64`` field must contain raw base64 bytes (no ``data:`` prefix).
    """
    result = await db.execute(select(Species).where(Species.id == species_id))
    species = result.scalar_one_or_none()

    if species is None:
        raise HTTPException(status_code=404, detail=f"Species '{species_id}' not found")

    data_url = f"data:{body.mime_type};base64,{body.image_base64}"

    # Deep-copy to avoid mutating the cached dict that SQLAlchemy has already tracked
    extra = copy.deepcopy(species.extra_data or {})

    if body.slot == "main":
        if not isinstance(extra.get("photo"), dict):
            extra["photo"] = {}
        extra["photo"]["url"] = data_url

    elif body.slot == "photo1":
        photos = extra.get("photos")
        if not isinstance(photos, list):
            photos = []
        if len(photos) == 0:
            photos.append({"url": data_url, "caption": ""})
        else:
            photos[0] = {**photos[0], "url": data_url}
        extra["photos"] = photos

    elif body.slot == "photo2":
        photos = extra.get("photos")
        if not isinstance(photos, list):
            photos = []
        if len(photos) == 0:
            photos.append({"url": "", "caption": ""})
        if len(photos) == 1:
            photos.append({"url": data_url, "caption": ""})
        else:
            photos[1] = {**photos[1], "url": data_url}
        extra["photos"] = photos

    species.extra_data = extra
    flag_modified(species, "extra_data")
    await db.commit()
    await db.refresh(species)

    log.info("Admin saved generated image to %s slot=%s", species_id, body.slot)
    return _to_detail(species)


@router.post("/{species_id}/images/reorder", response_model=SpeciesDetail)
async def reorder_species_images(
    species_id: str,
    body: SlotReorderBody,
    _admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
) -> SpeciesDetail:
    """
    Rearrange existing slot images without re-encoding them (admin only).

    The body maps each *new* slot to the *current* slot that should fill it.
    Example: ``{"main": "photo1", "photo1": "main", "photo2": "photo2"}``
    swaps the main and photo1 images while leaving photo2 unchanged.

    Works for both static asset URLs and data: URIs stored from the generator.
    """
    result = await db.execute(select(Species).where(Species.id == species_id))
    species = result.scalar_one_or_none()

    if species is None:
        raise HTTPException(status_code=404, detail=f"Species '{species_id}' not found")

    extra = copy.deepcopy(species.extra_data or {})

    # Snapshot current URLs before any writes
    def _get_url(slot: str) -> str | None:
        if slot == "main":
            ph = extra.get("photo")
            return ph.get("url") if isinstance(ph, dict) else None
        idx = 0 if slot == "photo1" else 1
        photos = extra.get("photos")
        if isinstance(photos, list) and len(photos) > idx:
            return photos[idx].get("url") if isinstance(photos[idx], dict) else None
        return None

    snapshot = {
        "main": _get_url("main"),
        "photo1": _get_url("photo1"),
        "photo2": _get_url("photo2"),
    }

    # Apply new mapping: new_slot ← url from body.<new_slot> (= current slot name)
    new_urls = {
        "main":   snapshot[body.main],
        "photo1": snapshot[body.photo1],
        "photo2": snapshot[body.photo2],
    }

    # Write main
    if not isinstance(extra.get("photo"), dict):
        extra["photo"] = {}
    if new_urls["main"] is not None:
        extra["photo"]["url"] = new_urls["main"]
    elif "url" in extra.get("photo", {}):
        extra["photo"].pop("url", None)

    # Write photo1 / photo2
    photos = extra.get("photos")
    if not isinstance(photos, list):
        photos = []

    for i, slot_key in enumerate(["photo1", "photo2"]):
        url = new_urls[slot_key]
        if url is not None:
            while len(photos) <= i:
                photos.append({"url": "", "caption": ""})
            photos[i] = {**photos[i], "url": url}
        else:
            # Ensure the slot exists but is empty (don't leave stale URL)
            if len(photos) > i:
                photos[i] = {**photos[i], "url": ""}

    extra["photos"] = photos
    species.extra_data = extra
    flag_modified(species, "extra_data")
    await db.commit()
    await db.refresh(species)

    log.info(
        "Admin reordered images for %s: main←%s photo1←%s photo2←%s",
        species_id, body.main, body.photo1, body.photo2,
    )
    return _to_detail(species)


@router.post("/{species_id}/images/set-order", response_model=SpeciesDetail)
async def set_species_photos_order(
    species_id: str,
    body: SetPhotosOrderBody,
    _admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
) -> SpeciesDetail:
    """
    Write an ordered list of photo URLs for a species, replacing all existing photos (admin only).

    The first URL in ``photos`` becomes the main photo (``extra_data.photo.url``).
    Remaining URLs fill ``extra_data.photos`` as gallery items, preserving existing
    captions where a matching URL is found.  An empty list clears all photos.

    Supports unlimited photos — not capped at the legacy 3-slot limit.
    Works for both static asset paths and ``data:`` URIs from the generator.
    """
    result = await db.execute(select(Species).where(Species.id == species_id))
    species = result.scalar_one_or_none()

    if species is None:
        raise HTTPException(status_code=404, detail=f"Species '{species_id}' not found")

    extra = copy.deepcopy(species.extra_data or {})

    # Build a metadata lookup from existing photos so we don't lose captions,
    # largeUrl, or other photo attributes on reorder.
    meta_by_url: dict[str, dict] = {}
    existing_main = extra.get("photo")
    if isinstance(existing_main, dict) and existing_main.get("url"):
        url = existing_main["url"]
        meta_by_url[url] = {k: v for k, v in existing_main.items() if k != "url"}
    for item in extra.get("photos") or []:
        if isinstance(item, dict) and item.get("url"):
            url = item["url"]
            meta_by_url[url] = {k: v for k, v in item.items() if k != "url"}

    if body.photos:
        # First URL → main photo
        main_url = body.photos[0]
        if not isinstance(extra.get("photo"), dict):
            extra["photo"] = {}
        extra["photo"] = {"url": main_url, **meta_by_url.get(main_url, {})}

        # Remaining URLs → gallery array
        extra["photos"] = [
            {"url": url, **meta_by_url.get(url, {})}
            for url in body.photos[1:]
        ]
    else:
        # Empty list: clear all photos
        if isinstance(extra.get("photo"), dict):
            extra["photo"].pop("url", None)
            extra["photo"].pop("caption", None)
        extra["photos"] = []

    species.extra_data = extra
    flag_modified(species, "extra_data")
    await db.commit()
    await db.refresh(species)

    log.info("Admin set photo order for %s: %d photo(s)", species_id, len(body.photos))
    return _to_detail(species)


# ── Myco-Engine visual prompt (structured image-model data) ───────────────────

@router.get("/{species_id}/visual-prompt", response_model=VisualPromptData | None)
async def get_species_visual_prompt(
    species_id: str,
    _admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
) -> VisualPromptData | None:
    """
    Return the structured visual DNA for a species (admin only).

    Used by the Myco-Engine (ImageGenerator) to assemble deterministic,
    botanically-accurate prompts for text-to-image models.

    Returns null (HTTP 200 with null body) if no entry exists yet for this
    species — the frontend falls back to the Gemini-only pipeline in that case.
    """
    # Verify the species exists
    sp = await db.execute(select(Species.id).where(Species.id == species_id))
    if sp.scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail=f"Species '{species_id}' not found")

    result = await db.execute(
        select(MushroomVisualPrompt).where(MushroomVisualPrompt.species_id == species_id)
    )
    row = result.scalar_one_or_none()
    if row is None:
        return None

    return VisualPromptData.model_validate(row)


@router.put("/{species_id}/visual-prompt", response_model=VisualPromptData)
async def upsert_species_visual_prompt(
    species_id: str,
    body: VisualPromptUpsertBody,
    _admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
) -> VisualPromptData:
    """
    Create or update the visual prompt data for a species (admin only).

    Full replace semantics: all provided fields overwrite existing values.
    Fields omitted from the body are set to null.
    """
    # Verify the species exists
    sp = await db.execute(select(Species.id).where(Species.id == species_id))
    if sp.scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail=f"Species '{species_id}' not found")

    result = await db.execute(
        select(MushroomVisualPrompt).where(MushroomVisualPrompt.species_id == species_id)
    )
    row = result.scalar_one_or_none()

    if row is None:
        row = MushroomVisualPrompt(species_id=species_id)
        db.add(row)

    row.cap_description = body.cap_description
    row.stipe_description = body.stipe_description
    row.hymenium_description = body.hymenium_description
    row.extra_morphology_visual = body.extra_morphology_visual
    row.extra_morphology_gemini = body.extra_morphology_gemini
    row.preferred_substrate = body.preferred_substrate
    row.habitat_context = body.habitat_context
    row.associated_fauna = body.associated_fauna
    row.is_validated = body.is_validated

    await db.commit()
    await db.refresh(row)

    log.info(
        "Admin upserted visual prompt for %s (validated=%s)", species_id, row.is_validated
    )
    return VisualPromptData.model_validate(row)
