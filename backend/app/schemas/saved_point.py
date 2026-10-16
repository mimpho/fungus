"""Pydantic schemas of the saved points endpoints."""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.services.geo_bounds import LAT_RANGE, LON_RANGE
from app.services.saved_points import FOREST_TYPES, NAME_MAX, NOTES_MAX, SavedPointRecord


def _name(value: str) -> str:
    value = value.strip()
    if not value or len(value) > NAME_MAX:
        raise ValueError(f"name must have 1 to {NAME_MAX} characters")
    return value


def _forest_types(value: list[str] | None) -> list[str] | None:
    if value is None:
        return None
    if not value:
        raise ValueError("use null, not an empty list, to go back to the derived forest types")
    unknown = [v for v in value if v not in FOREST_TYPES]
    if unknown:
        raise ValueError(f"unknown forest types {unknown}; valid: {list(FOREST_TYPES)}")
    return list(dict.fromkeys(value))  # no duplicates, order kept


class SavedPointCreate(BaseModel):
    """What the client sends. Provenance (land cover, toponym, elevation, cell, composition)
    is filled in by the server: sending it is a 422."""

    model_config = ConfigDict(extra="forbid")

    lat: float = Field(ge=LAT_RANGE[0], le=LAT_RANGE[1])
    lon: float = Field(ge=LON_RANGE[0], le=LON_RANGE[1])
    name: str | None = Field(None, description="Default: the nearest toponym")
    notes: str | None = Field(None, max_length=NOTES_MAX)
    forest_types: list[str] | None = Field(
        None, description="The author's forest types; they win over the land cover"
    )

    @field_validator("name")
    @classmethod
    def _check_name(cls, value: str | None) -> str | None:
        return None if value is None else _name(value)

    @field_validator("forest_types")
    @classmethod
    def _check_types(cls, value: list[str] | None) -> list[str] | None:
        return _forest_types(value)


class SavedPointUpdate(BaseModel):
    """Only these can change. Coordinates cannot: moving a point means saving another one."""

    model_config = ConfigDict(extra="forbid")

    name: str | None = None
    notes: str | None = Field(None, max_length=NOTES_MAX)
    forest_types: list[str] | None = None

    @field_validator("name")
    @classmethod
    def _check_name(cls, value: str | None) -> str:
        if value is None:
            raise ValueError("name cannot be null")
        return _name(value)

    @field_validator("forest_types")
    @classmethod
    def _check_types(cls, value: list[str] | None) -> list[str] | None:
        return _forest_types(value)


class LandCoverOut(BaseModel):
    layer: str | None
    code: int | None
    name: str | None
    retrieved_at: datetime | None


class ToponymOut(BaseModel):
    name: str | None
    label: str | None


class SavedPointOut(BaseModel):
    id: int
    lat: float
    lon: float
    name: str
    notes: str | None
    forest_types: list[str] | None
    elevation_m: float | None
    cell_id: str | None
    land_cover: LandCoverOut | None
    toponym: ToponymOut | None
    composition: dict | None
    created_at: datetime
    updated_at: datetime


def to_out(r: SavedPointRecord) -> SavedPointOut:
    return SavedPointOut(
        id=r.id, lat=r.lat, lon=r.lon, name=r.name, notes=r.notes,
        forest_types=r.forest_types, elevation_m=r.elevation_m, cell_id=r.cell_id,
        land_cover=None if r.land_cover_name is None else LandCoverOut(
            layer=r.land_cover_layer, code=r.land_cover_code, name=r.land_cover_name,
            retrieved_at=r.land_cover_retrieved_at,
        ),
        toponym=None if r.toponym_name is None else ToponymOut(
            name=r.toponym_name, label=r.toponym_label
        ),
        composition=r.composition, created_at=r.created_at, updated_at=r.updated_at,
    )
