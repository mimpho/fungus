"""Pydantic schemas of the corner photos endpoints."""
from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.services.corner_photos import PHOTO_SPECIES_MAX, PhotoRecord


def clean_species_ids(value: list[str]) -> list[str]:
    if len(value) > PHOTO_SPECIES_MAX:
        raise ValueError(f"at most {PHOTO_SPECIES_MAX} species per photo")
    return list(dict.fromkeys(value))  # no duplicates, order kept


class PhotoSpeciesUpdate(BaseModel):
    """Replaces the species tagged on the photo (an empty list clears them)."""

    model_config = ConfigDict(extra="forbid")

    species_ids: list[str]

    @field_validator("species_ids")
    @classmethod
    def _check(cls, value: list[str]) -> list[str]:
        return clean_species_ids(value)


class PhotoOut(BaseModel):
    """The storage keys never leave the server: the client gets short-lived signed URLs, which
    are null for an object that could not be signed."""

    id: int
    position: int
    thumb_url: str | None
    large_url: str | None
    species_ids: list[str] = Field(description="Catalogue species tagged on the photo")


def to_out(record: PhotoRecord, urls: dict[str, str]) -> PhotoOut:
    return PhotoOut(
        id=record.id, position=record.position,
        thumb_url=urls.get(record.thumb_key), large_url=urls.get(record.large_key),
        species_ids=list(record.species_ids),
    )
