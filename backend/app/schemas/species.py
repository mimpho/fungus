"""Pydantic schemas for species endpoints."""
from typing import Literal

from pydantic import BaseModel, ConfigDict


class SpeciesConfusion(BaseModel):
    """A species that can be confused with another."""
    with_species_id: str
    diff: str


class SpeciesListItem(BaseModel):
    """Lightweight item for GET /species — replaces mockSpecies on list views."""
    model_config = ConfigDict(from_attributes=True)

    id: str
    scientific_name: str
    family: str
    edibility: str
    forest_types: list[str] | None
    fruiting_months: list[int] | None
    elevation_min_m: int | None
    elevation_max_m: int | None
    # From extra_data — exposed at top level for frontend convenience
    common_names: list[str] | None = None
    photo_url: str | None = None
    # description, synonyms, confusions NOT here — only in SpeciesDetail


class SpeciesOIParams(BaseModel):
    """Biological parameters used by the Outbreak Index."""
    temp_min_c: float | None
    temp_opt_c: float | None
    temp_max_c: float | None
    rain_min_mm: int | None
    rain_opt_mm: int | None
    cycle_days: int | None


class SpeciesDetail(SpeciesListItem):
    """Full species detail for GET /species/{id} — replaces ZoneModal species data."""
    oi_params: SpeciesOIParams
    description: str | None = None
    synonyms: list[str] | None = None
    confusions: list[SpeciesConfusion] | None = None
    # Fruiting conditions — language-resolved by _extra_str (cond_*_es/ca/en in extra_data)
    cond_temp: str | None = None
    cond_precip: str | None = None
    cond_suelo: str | None = None
    cond_req: str | None = None
    # Full extra_data blob: morphology, all photos, etc.
    extra_data: dict | None = None


class SpeciesImageUpdate(BaseModel):
    """Body for PATCH /species/{id}/images — save a generated image to a slot."""

    slot: Literal["main", "photo1", "photo2"]
    """Target slot: main photo, or gallery photo 1 / 2."""

    image_base64: str
    """Raw base64-encoded image bytes (no data: URI prefix)."""

    mime_type: str = "image/jpeg"
    """MIME type of the image (e.g. 'image/jpeg', 'image/webp', 'image/png')."""


class SlotReorderBody(BaseModel):
    """Body for POST /species/{id}/images/reorder — rearrange existing slot images."""

    main: Literal["main", "photo1", "photo2"] = "main"
    """Which current slot should become the new 'main' image."""

    photo1: Literal["main", "photo1", "photo2"] = "photo1"
    """Which current slot should become the new 'photo1' image."""

    photo2: Literal["main", "photo1", "photo2"] = "photo2"
    """Which current slot should become the new 'photo2' image."""


class SetPhotosOrderBody(BaseModel):
    """Body for POST /species/{id}/images/set-order — write an ordered photo list.

    Replaces ALL photos for the species.  The first URL becomes the main photo
    (``extra_data.photo.url``); the rest fill ``extra_data.photos``.
    URLs may be static asset paths (``/assets/...``) or ``data:`` URIs from the
    generator.  An empty list clears all photos.
    """

    photos: list[str]
    """Ordered list of photo URLs (first = main, rest = gallery)."""
