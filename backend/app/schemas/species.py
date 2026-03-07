"""Pydantic schemas for species endpoints."""
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
    description: str | None = None
    synonyms: list[str] | None = None
    confusions: list[SpeciesConfusion] | None = None


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
    # Full extra_data blob: morphology, confusions, all photos, etc.
    extra_data: dict | None = None
