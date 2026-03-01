"""Zone routes: list, detail, and map scores."""
import logging
from datetime import timezone, datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.zone import Zone
from app.models.scores_cache import ScoresCache
from app.schemas.zone import MapPoint, ScoreDetail, ZoneDetail, ZoneListItem, ZoneScore
from app.services.scoring import score_label

log = logging.getLogger(__name__)
router = APIRouter(prefix="/zones", tags=["Zones"])


# ── Helpers ───────────────────────────────────────────────────────────────────

def _build_zone_score(cache: ScoresCache | None) -> ZoneScore | None:
    if cache is None:
        return None
    detail = cache.score_detail or {}
    return ZoneScore(
        score_oi=cache.score_oi,
        score_detail=ScoreDetail(
            pa21=detail.get("pa21", 0),
            thermal=detail.get("thermal", 0),
            seasonal=detail.get("seasonal", 0),
            ripening=detail.get("ripening", 0),
            humidity=detail.get("humidity", 0),
            pa21_mm=detail.get("pa21_mm", 0.0),
            days_since_rain=detail.get("days_since_rain", 0),
        ),
        label=score_label(cache.score_oi),
        calculated_at=cache.calculated_at,
        valid_until=cache.valid_until,
    )


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("", response_model=list[ZoneListItem])
async def list_zones(
    region: str | None = Query(None, description="Filter by autonomous community"),
    forest_type: str | None = Query(None, description="Filter by forest type"),
    min_score: int | None = Query(None, ge=0, le=100, description="Minimum OI score"),
    db: AsyncSession = Depends(get_db),
) -> list[ZoneListItem]:
    """
    Return all active zones with their cached Outbreak Index.
    Replaces the mockZones import in the frontend.

    Cache-Control: public, max-age=3600 (set in middleware).
    """
    stmt = (
        select(Zone)
        .options(selectinload(Zone.score_cache))
        .where(Zone.active == True)  # noqa: E712
        .order_by(Zone.name)
    )
    if region:
        stmt = stmt.where(Zone.region == region)
    if forest_type:
        stmt = stmt.where(Zone.forest_type == forest_type)

    result = await db.execute(stmt)
    zones = result.scalars().all()

    items: list[ZoneListItem] = []
    for z in zones:
        score = _build_zone_score(z.score_cache)
        if min_score is not None and (score is None or score.score_oi < min_score):
            continue
        items.append(
            ZoneListItem(
                id=z.id,
                name=z.name,
                province=z.province,
                region=z.region,
                lat=z.lat,
                lon=z.lon,
                elevation_m=z.elevation_m,
                forest_type=z.forest_type,
                score=score,
            )
        )

    return items


@router.get("/map-scores", response_model=list[MapPoint])
async def map_scores(db: AsyncSession = Depends(get_db)) -> list[MapPoint]:
    """
    Lightweight endpoint for the Leaflet heatmap.
    Returns [{zone_id, lat, lon, score, name}] for all zones with a cached score.

    Cache-Control: public, max-age=3600 (set in middleware).
    """
    result = await db.execute(
        select(Zone, ScoresCache)
        .join(ScoresCache, Zone.id == ScoresCache.zone_id)
        .where(Zone.active == True)  # noqa: E712
    )
    rows = result.all()

    return [
        MapPoint(
            zone_id=z.id,
            lat=z.lat,
            lon=z.lon,
            score=sc.score_oi,
            name=z.name,
        )
        for z, sc in rows
    ]


@router.get("/{zone_id}", response_model=ZoneDetail)
async def get_zone(zone_id: str, db: AsyncSession = Depends(get_db)) -> ZoneDetail:
    """
    Full zone detail: metadata + current Outbreak Index breakdown.
    zone_id uses the same format as the mock ('zone-001', …).
    """
    result = await db.execute(
        select(Zone)
        .options(selectinload(Zone.score_cache))
        .where(Zone.id == zone_id)
    )
    zone = result.scalar_one_or_none()

    if zone is None:
        raise HTTPException(status_code=404, detail=f"Zone '{zone_id}' not found")

    return ZoneDetail(
        id=zone.id,
        name=zone.name,
        province=zone.province,
        region=zone.region,
        lat=zone.lat,
        lon=zone.lon,
        elevation_m=zone.elevation_m,
        forest_type=zone.forest_type,
        soil_type=zone.soil_type,
        active=zone.active,
        created_at=zone.created_at,
        score=_build_zone_score(zone.score_cache),
    )
