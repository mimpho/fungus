"""Reads and rebuilds the cached territory rain map (see territory_rain).

Two levels: the process memory (the answer of the last 20 hours) and the `territory_rain_cache`
row, which survives restarts and is shared by workers. If the table cannot be used (migration 020
not applied yet), the memory level alone keeps the endpoint working.
"""

import logging
from datetime import date, datetime

import httpx
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.connectors.base import ProviderUnavailable
from app.models.territory_rain_cache import TerritoryRainCache
from app.models.zone import Zone
from app.services.geo_bounds import LAT_RANGE, LON_RANGE
from app.services.territory_rain import _refresh_lock, compute_territory_rain, is_fresh, now_utc

log = logging.getLogger(__name__)

_memory: tuple[datetime, dict] | None = None


def clear_memory() -> None:
    global _memory
    _memory = None


async def _catalonia_zones(db: AsyncSession) -> list[Zone]:
    stmt = select(Zone).where(
        Zone.active.is_(True), Zone.lat.between(*LAT_RANGE), Zone.lon.between(*LON_RANGE)
    )
    return list((await db.execute(stmt)).scalars())


async def _read_row(db: AsyncSession) -> TerritoryRainCache | None:
    try:
        return await db.get(TerritoryRainCache, 1)
    except SQLAlchemyError as exc:
        await db.rollback()
        log.warning("territory_rain_cache not readable (migration 020 applied?): %s", exc)
        return None


async def _write_row(db: AsyncSession, now: datetime, payload: dict) -> None:
    try:
        stmt = insert(TerritoryRainCache).values(id=1, computed_at=now, payload=payload)
        await db.execute(
            stmt.on_conflict_do_update(
                index_elements=["id"], set_={"computed_at": now, "payload": payload}
            )
        )
        await db.commit()
    except SQLAlchemyError as exc:
        await db.rollback()
        log.warning("territory_rain_cache not writable (migration 020 applied?): %s", exc)


async def get_territory_rain(
    db: AsyncSession,
    today: date,
    now: datetime | None = None,
    compute=compute_territory_rain,
    force: bool = False,
) -> dict:
    """The cached map when it is under 20 hours old; otherwise rebuilt from Open-Meteo. If the
    rebuild fails and an older answer exists, that one is served with `stale: true`."""
    global _memory
    now = now or now_utc()
    if _memory and not force and is_fresh(_memory[0], now):
        return _memory[1]
    row = await _read_row(db)
    if row and not force and is_fresh(row.computed_at, now):
        _memory = (row.computed_at, row.payload)
        return row.payload
    async with _refresh_lock:
        if _memory and not force and is_fresh(_memory[0], now):
            return _memory[1]  # another request rebuilt it while this one waited
        older = row.payload if row else (_memory[1] if _memory else None)
        try:
            payload = await compute(await _catalonia_zones(db), today, previous=older)
        except (ProviderUnavailable, httpx.HTTPError) as exc:
            log.warning("Territory rain rebuild failed: %s", exc)
            if older:
                return {**older, "stale": True}
            raise
        _memory = (now, payload)
        await _write_row(db, now, payload)
        return payload
