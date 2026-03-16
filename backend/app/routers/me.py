"""Me router — followed zones and favourite species for the authenticated user."""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User, UserFavSpecies, UserFollowedZone

router = APIRouter(prefix="/me", tags=["me"])


# ── Schemas (local, simple) ────────────────────────────────────────────────────

class ZoneIdBody(BaseModel):
    zone_id: str


class SpeciesIdBody(BaseModel):
    species_id: str


class FollowedZoneOut(BaseModel):
    zone_id: str
    model_config = {"from_attributes": True}


class FavSpeciesOut(BaseModel):
    species_id: str
    model_config = {"from_attributes": True}


# ── Followed zones ─────────────────────────────────────────────────────────────

@router.get("/followed-zones", response_model=list[FollowedZoneOut])
async def get_followed_zones(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[UserFollowedZone]:
    result = await db.execute(
        select(UserFollowedZone).where(UserFollowedZone.user_id == current_user.id)
    )
    return list(result.scalars().all())


@router.post("/followed-zones", status_code=status.HTTP_201_CREATED)
async def follow_zone(
    body: ZoneIdBody,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    # Idempotent — ignore if already following
    existing = await db.execute(
        select(UserFollowedZone).where(
            UserFollowedZone.user_id == current_user.id,
            UserFollowedZone.zone_id == body.zone_id,
        )
    )
    if existing.scalar_one_or_none() is not None:
        return {"zone_id": body.zone_id, "followed": True}

    db.add(UserFollowedZone(user_id=current_user.id, zone_id=body.zone_id))
    await db.commit()
    return {"zone_id": body.zone_id, "followed": True}


@router.delete("/followed-zones/{zone_id}", status_code=status.HTTP_204_NO_CONTENT)
async def unfollow_zone(
    zone_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    result = await db.execute(
        select(UserFollowedZone).where(
            UserFollowedZone.user_id == current_user.id,
            UserFollowedZone.zone_id == zone_id,
        )
    )
    entry = result.scalar_one_or_none()
    if entry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Zone not followed")
    await db.delete(entry)
    await db.commit()


# ── Favourite species ──────────────────────────────────────────────────────────

@router.get("/fav-species", response_model=list[FavSpeciesOut])
async def get_fav_species(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[UserFavSpecies]:
    result = await db.execute(
        select(UserFavSpecies).where(UserFavSpecies.user_id == current_user.id)
    )
    return list(result.scalars().all())


@router.post("/fav-species", status_code=status.HTTP_201_CREATED)
async def add_fav_species(
    body: SpeciesIdBody,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    # Idempotent — ignore if already favourited
    existing = await db.execute(
        select(UserFavSpecies).where(
            UserFavSpecies.user_id == current_user.id,
            UserFavSpecies.species_id == body.species_id,
        )
    )
    if existing.scalar_one_or_none() is not None:
        return {"species_id": body.species_id, "favourited": True}

    db.add(UserFavSpecies(user_id=current_user.id, species_id=body.species_id))
    await db.commit()
    return {"species_id": body.species_id, "favourited": True}


@router.delete("/fav-species/{species_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_fav_species(
    species_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    result = await db.execute(
        select(UserFavSpecies).where(
            UserFavSpecies.user_id == current_user.id,
            UserFavSpecies.species_id == species_id,
        )
    )
    entry = result.scalar_one_or_none()
    if entry is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Species not favourited"
        )
    await db.delete(entry)
    await db.commit()
