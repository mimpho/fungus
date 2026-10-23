"""Pydantic schemas of the saved points ("corners") endpoints."""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.services.geo_bounds import LAT_RANGE, LON_RANGE
from app.services.saved_points import (
    DEFAULT_KIND,
    KINDS,
    NAME_MAX,
    NOTES_MAX,
    SPECIES_MAX,
    SavedPointRecord,
    all_species_ids,
)


def _name(value: str) -> str:
    """Trimmed name. Blank is allowed: it asks for the default one (the nearest toponym)."""
    value = value.strip()
    if len(value) > NAME_MAX:
        raise ValueError(f"name must have at most {NAME_MAX} characters")
    return value


def _kind(value: str) -> str:
    if value not in KINDS:
        raise ValueError(f"unknown kind {value!r}; valid: {list(KINDS)}")
    return value


def _species_ids(value: list[str]) -> list[str]:
    if len(value) > SPECIES_MAX:
        raise ValueError(f"at most {SPECIES_MAX} species per corner")
    return list(dict.fromkeys(value))  # no duplicates, order kept


class SavedPointCreate(BaseModel):
    """What the client sends. The elevation is filled in by the server: sending it (or anything
    else not listed here) is a 422."""

    model_config = ConfigDict(extra="forbid")

    lat: float = Field(ge=LAT_RANGE[0], le=LAT_RANGE[1])
    lon: float = Field(ge=LON_RANGE[0], le=LON_RANGE[1])
    name: str | None = Field(None, description="Default (also when blank): the nearest toponym")
    notes: str | None = Field(None, max_length=NOTES_MAX)
    kind: str = Field(DEFAULT_KIND, description=f"One of {list(KINDS)}")
    species_ids: list[str] = Field(
        default_factory=list, description="Catalogue species tagged on the corner"
    )

    @field_validator("name")
    @classmethod
    def _check_name(cls, value: str | None) -> str | None:
        return None if value is None else (_name(value) or None)

    @field_validator("kind")
    @classmethod
    def _check_kind(cls, value: str) -> str:
        return _kind(value)

    @field_validator("species_ids")
    @classmethod
    def _check_species(cls, value: list[str]) -> list[str]:
        return _species_ids(value)


class SavedPointUpdate(BaseModel):
    """Only these can change. Coordinates cannot: moving a point means saving another one.
    A blank `name` puts the default one back (the nearest toponym). `species_ids` replaces the
    whole list (an empty list clears it)."""

    model_config = ConfigDict(extra="forbid")

    name: str | None = None
    notes: str | None = Field(None, max_length=NOTES_MAX)
    kind: str | None = None
    species_ids: list[str] | None = None

    @field_validator("name")
    @classmethod
    def _check_name(cls, value: str | None) -> str:
        if value is None:
            raise ValueError("name cannot be null")
        return _name(value)

    @field_validator("kind")
    @classmethod
    def _check_kind(cls, value: str | None) -> str:
        if value is None:
            raise ValueError("kind cannot be null")
        return _kind(value)

    @field_validator("species_ids")
    @classmethod
    def _check_species(cls, value: list[str] | None) -> list[str]:
        if value is None:
            raise ValueError("species_ids cannot be null; send [] to clear it")
        return _species_ids(value)


class SavedPointOut(BaseModel):
    id: int
    lat: float
    lon: float
    name: str
    notes: str | None
    kind: str
    elevation_m: float | None
    species_ids: list[str] = Field(description="Tagged on the corner itself (what a change writes)")
    all_species_ids: list[str] = Field(
        description="Those plus the ones tagged on its photos, once each"
    )
    created_at: datetime
    updated_at: datetime


def to_out(r: SavedPointRecord) -> SavedPointOut:
    return SavedPointOut(
        id=r.id, lat=r.lat, lon=r.lon, name=r.name, notes=r.notes, kind=r.kind,
        elevation_m=r.elevation_m, species_ids=list(r.species_ids),
        all_species_ids=all_species_ids(r), created_at=r.created_at, updated_at=r.updated_at,
    )
