"""Species routes: list and detail.

GET /species           → paginated list (replaces mockSpecies on frontend)
GET /species/{id}      → full detail (replaces SpeciesModal data)
"""
import logging

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.species import Species
from app.schemas.species import SpeciesDetail, SpeciesListItem, SpeciesOIParams

log = logging.getLogger(__name__)
router = APIRouter(prefix="/species", tags=["Species"])

# Max items per page — keeps response size predictable
_PAGE_SIZE = 50


# ── Helpers ────────────────────────────────────────────────────────────────────

def _extra_str(species: Species, key: str) -> str | None:
    """Safely extract a string field from the JSONB extra_data blob."""
    if not species.extra_data:
        return None
    return species.extra_data.get(key)


def _extra_list(species: Species, key: str) -> list | None:
    """Safely extract a list field from the JSONB extra_data blob."""
    if not species.extra_data:
        return None
    return species.extra_data.get(key)


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


def _to_list_item(s: Species) -> SpeciesListItem:
    return SpeciesListItem(
        id=s.id,
        scientific_name=s.scientific_name,
        family=s.family,
        edibility=s.edibility,
        forest_types=s.forest_types,
        fruiting_months=s.fruiting_months,
        elevation_min_m=s.elevation_min_m,
        elevation_max_m=s.elevation_max_m,
        common_names=_extra_list(s, "commonNames"),
        photo_url=_photo_url(s),
        # description, synonyms, confusions excluded from list — see _to_detail()
    )


def _to_detail(s: Species) -> SpeciesDetail:
    return SpeciesDetail(
        id=s.id,
        scientific_name=s.scientific_name,
        family=s.family,
        edibility=s.edibility,
        forest_types=s.forest_types,
        fruiting_months=s.fruiting_months,
        elevation_min_m=s.elevation_min_m,
        elevation_max_m=s.elevation_max_m,
        common_names=_extra_list(s, "commonNames"),
        photo_url=_photo_url(s),
        description=_extra_str(s, "description"),
        synonyms=_synonyms(s),
        confusions=_confusions(s),
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
    return [_to_list_item(s) for s in rows]


@router.get("/{species_id}", response_model=SpeciesDetail)
async def get_species(
    species_id: str, db: AsyncSession = Depends(get_db)
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

    return _to_detail(species)
