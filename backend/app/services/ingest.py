"""
Daily ingestion service.

Fetches yesterday's weather for all active zones, persists it in climate_history,
then recomputes and caches the Outbreak Index for each zone.

Entry points:
    run_daily_ingest(db)   — called by the APScheduler cron
    run_backfill(db, ...)  — called by scripts/backfill.py
"""
import asyncio
import logging
from datetime import date, datetime, timedelta, timezone

from sqlalchemy import select, text
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.connectors.base import DailyWeatherData, ProviderUnavailable
from app.connectors.open_meteo import OpenMeteoConnector
from app.models.climate_history import ClimateHistory
from app.models.scores_cache import ScoresCache
from app.models.zone import Zone
from app.services.scoring import OIResult, compute_oi
from app.config import settings

log = logging.getLogger(__name__)


# ── Public entry points ───────────────────────────────────────────────────────

async def run_daily_ingest(db: AsyncSession) -> dict:
    """
    Fetch yesterday's data for all active zones and refresh the scores cache.
    Returns a summary dict for the /health endpoint.
    """
    yesterday = date.today() - timedelta(days=1)
    log.info("Starting daily ingest for %s", yesterday)

    zones = await _get_active_zones(db)
    results = await _ingest_date_range(db, zones, start=yesterday, end=yesterday)

    await _refresh_scores_cache(db, zones)

    summary = {
        "date": yesterday.isoformat(),
        "zones_processed": len(zones),
        "rows_upserted": results["upserted"],
        "errors": results["errors"],
        "completed_at": datetime.now(timezone.utc).isoformat(),
    }
    log.info("Ingest complete: %s", summary)
    return summary


async def run_backfill(
    db: AsyncSession,
    start: date,
    end: date,
    zone_ids: list[str] | None = None,
) -> dict:
    """
    Load historical data from Open-Meteo for a date range.
    Used to populate climate_history on first setup.
    """
    log.info("Starting backfill %s → %s", start, end)
    zones = await _get_active_zones(db)
    if zone_ids:
        zones = [z for z in zones if z.id in zone_ids]

    results = await _ingest_date_range(db, zones, start=start, end=end)
    await _refresh_scores_cache(db, zones)

    return {
        "start": start.isoformat(),
        "end": end.isoformat(),
        "zones_processed": len(zones),
        "rows_upserted": results["upserted"],
        "errors": results["errors"],
    }


# ── Core ingestion logic ──────────────────────────────────────────────────────

async def _ingest_date_range(
    db: AsyncSession,
    zones: list[Zone],
    start: date,
    end: date,
) -> dict:
    sem = asyncio.Semaphore(settings.ingest_max_concurrency)
    upserted = 0
    errors = []

    async def ingest_zone(zone: Zone) -> None:
        nonlocal upserted
        async with sem:
            try:
                connector = _get_connector(zone)
                rows = await connector.fetch_range(start, end)
                for row in rows:
                    await _upsert_climate_row(db, row)
                    upserted += 1
                log.debug("Zone %s: %d rows ingested (%s→%s)", zone.id, len(rows), start, end)
            except ProviderUnavailable as exc:
                log.error("Zone %s: provider unavailable — %s", zone.id, exc)
                errors.append({"zone_id": zone.id, "error": str(exc)})
            except Exception as exc:
                log.exception("Zone %s: unexpected error — %s", zone.id, exc)
                errors.append({"zone_id": zone.id, "error": str(exc)})

    await asyncio.gather(*[ingest_zone(z) for z in zones])
    await db.commit()
    return {"upserted": upserted, "errors": errors}


async def _upsert_climate_row(db: AsyncSession, row: DailyWeatherData) -> None:
    """
    Insert or update a climate_history row.
    Upgrade rule: never overwrite a higher-quality source with a lower one.
    Priority: meteocat / aemet > open-meteo
    """
    stmt = (
        pg_insert(ClimateHistory)
        .values(
            zone_id=row.zone_id,
            date=row.date,
            temp_max_c=row.temp_max_c,
            temp_min_c=row.temp_min_c,
            temp_avg_c=row.temp_avg_c,
            soil_temp_c=row.soil_temp_c,
            precipitation_mm=row.precipitation_mm,
            humidity_pct=row.humidity_pct,
            wind_kmh=row.wind_kmh,
            source=row.source,
            station_id=row.station_id,
            station_dist_km=row.station_dist_km,
            interpolated=row.interpolated,
        )
        .on_conflict_do_update(
            constraint="uq_climate_zone_date",
            set_={
                "temp_max_c": row.temp_max_c,
                "temp_min_c": row.temp_min_c,
                "temp_avg_c": row.temp_avg_c,
                "soil_temp_c": row.soil_temp_c,
                "precipitation_mm": row.precipitation_mm,
                "humidity_pct": row.humidity_pct,
                "wind_kmh": row.wind_kmh,
                "source": row.source,
                "station_id": row.station_id,
                "station_dist_km": row.station_dist_km,
                "interpolated": row.interpolated,
            },
            # Only update if the incoming source is better quality
            where=text(
                "climate_history.source = 'open-meteo' AND :new_source != 'open-meteo'"
            ).bindparams(new_source=row.source),
        )
    )
    await db.execute(stmt)


# ── Scores cache ──────────────────────────────────────────────────────────────

async def _refresh_scores_cache(db: AsyncSession, zones: list[Zone]) -> None:
    """Recompute and persist the Outbreak Index for all zones."""
    today = date.today()
    valid_until = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    valid_until = valid_until.replace(hour=5) + timedelta(days=1)  # next day at 05:00 UTC

    for zone in zones:
        try:
            oi = await _compute_oi_for_zone(db, zone, today)
            if oi is None:
                continue

            stmt = (
                pg_insert(ScoresCache)
                .values(
                    zone_id=zone.id,
                    score_oi=oi.score,
                    score_detail={
                        "pa21": oi.pa21,
                        "thermal": oi.thermal,
                        "seasonal": oi.seasonal,
                        "ripening": oi.ripening,
                        "humidity": oi.humidity,
                        "pa21_mm": oi.pa21_mm,
                        "days_since_rain": oi.days_since_rain,
                    },
                    calculated_at=datetime.now(timezone.utc),
                    valid_until=valid_until,
                )
                .on_conflict_do_update(
                    index_elements=["zone_id"],
                    set_={
                        "score_oi": oi.score,
                        "score_detail": {
                            "pa21": oi.pa21,
                            "thermal": oi.thermal,
                            "seasonal": oi.seasonal,
                            "ripening": oi.ripening,
                            "humidity": oi.humidity,
                            "pa21_mm": oi.pa21_mm,
                            "days_since_rain": oi.days_since_rain,
                        },
                        "calculated_at": datetime.now(timezone.utc),
                        "valid_until": valid_until,
                    },
                )
            )
            await db.execute(stmt)
        except Exception as exc:
            log.error("Failed to compute OI for zone %s: %s", zone.id, exc)

    await db.commit()


async def _compute_oi_for_zone(
    db: AsyncSession, zone: Zone, ref_date: date
) -> OIResult | None:
    """Pull the last 21 days of climate data and compute the Outbreak Index."""
    cutoff = ref_date - timedelta(days=21)

    rows_result = await db.execute(
        select(ClimateHistory)
        .where(ClimateHistory.zone_id == zone.id)
        .where(ClimateHistory.date >= cutoff)
        .where(ClimateHistory.date <= ref_date)
        .order_by(ClimateHistory.date.desc())
    )
    rows: list[ClimateHistory] = list(rows_result.scalars())

    if not rows:
        log.debug("Zone %s: no climate data, skipping OI", zone.id)
        return None

    # ── Derived inputs ────────────────────────────────────────────────────────
    pa21_mm = sum(float(r.precipitation_mm or 0) for r in rows)

    recent_7 = rows[:7]
    temp_avg_7d = _avg([float(r.temp_avg_c) for r in recent_7 if r.temp_avg_c is not None])

    # Frost hours: rows with temp_min < 0 in last 3 days × 12 (rough estimate, daily granularity)
    recent_3 = rows[:3]
    frost_hours = sum(
        12 for r in recent_3 if r.temp_min_c is not None and float(r.temp_min_c) < 0
    )

    # Days since last significant rain event (≥10 mm)
    days_since_rain = 0
    for i, r in enumerate(rows):
        if float(r.precipitation_mm or 0) >= 10:
            days_since_rain = i
            break
    else:
        days_since_rain = len(rows)  # no significant rain in the window

    humidity_pct = _avg(
        [r.humidity_pct for r in recent_7 if r.humidity_pct is not None]
    )

    return compute_oi(
        reference_date=ref_date,
        pa21_mm=pa21_mm,
        temp_avg_7d=temp_avg_7d or 10.0,
        frost_hours_72h=frost_hours,
        days_since_rain=days_since_rain,
        humidity_pct=round(humidity_pct or 70),
    )


# ── Provider selection ────────────────────────────────────────────────────────

def _get_connector(zone: Zone):
    """
    Return the best available connector for a zone.
    Currently only Open-Meteo (P3). P1/P2 connectors will be plugged in here
    once API keys are available (see app/connectors/).
    """
    return OpenMeteoConnector(zone_id=zone.id, lat=zone.lat, lon=zone.lon)


# ── DB helpers ────────────────────────────────────────────────────────────────

async def _get_active_zones(db: AsyncSession) -> list[Zone]:
    result = await db.execute(select(Zone).where(Zone.active == True))  # noqa: E712
    return list(result.scalars())


def _avg(values: list[float | int]) -> float | None:
    clean = [v for v in values if v is not None]
    return sum(clean) / len(clean) if clean else None
