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
from datetime import UTC, date, datetime, timedelta

from sqlalchemy import func, select, text
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.connectors.base import DailyWeatherData, ProviderUnavailable
from app.connectors.open_meteo import OpenMeteoConnector
from app.models.climate_history import ClimateHistory
from app.models.scores_cache import ScoresCache
from app.models.zone import Zone
from app.services.zone_scores import V2_WINDOW_DAYS, ZoneScoreRow, build_score_row

log = logging.getLogger(__name__)


# ── Public entry points ───────────────────────────────────────────────────────

async def run_daily_ingest(db: AsyncSession) -> dict:
    """
    Fetch the last `ingest_lookback_days` days (ending yesterday) for all active
    zones and refresh the scores cache. Re-fetching a few days back fills any day
    a previous run missed; upserts make it idempotent.
    Returns a summary dict for the /health endpoint.
    """
    yesterday = date.today() - timedelta(days=1)
    start = yesterday - timedelta(days=max(settings.ingest_lookback_days, 1) - 1)
    log.info("Starting daily ingest for %s → %s", start, yesterday)

    zones = await _get_active_zones(db)
    results = await _ingest_date_range(db, zones, start=start, end=yesterday)

    await _refresh_scores_cache(db, zones)

    stale = await get_stale_zones(db)
    if stale:
        await _alert_stale_zones(stale, results["errors"])

    summary = {
        "date": yesterday.isoformat(),
        "from": start.isoformat(),
        "zones_processed": len(zones),
        "rows_upserted": results["upserted"],
        "errors": results["errors"],
        "stale_zones": [z["zone_id"] for z in stale],
        "completed_at": datetime.now(UTC).isoformat(),
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


# ── Staleness monitoring ──────────────────────────────────────────────────────

async def get_stale_zones(db: AsyncSession, max_age_days: int | None = None) -> list[dict]:
    """
    Active zones whose latest climate_history day is older than `max_age_days`
    (default settings.stale_zone_days), or that have no data at all.

    The daily run re-fetches the last `ingest_lookback_days`, so a zone that
    stays stale longer than that starts losing days for good — this is what
    the alert and /health surface.
    """
    max_age = settings.stale_zone_days if max_age_days is None else max_age_days
    cutoff = date.today() - timedelta(days=max_age)
    # Correlated max() per zone: uses the (zone_id, date) index → ~10 ms for 214
    # zones, vs ~1 s for a JOIN + GROUP BY over the whole table.
    last_day = (
        select(func.max(ClimateHistory.date))
        .where(ClimateHistory.zone_id == Zone.id)
        .correlate(Zone)
        .scalar_subquery()
    )
    per_zone = (
        select(Zone.id, Zone.name, last_day.label("last_date"))
        .where(Zone.active == True)  # noqa: E712
        .subquery()
    )
    result = await db.execute(
        select(per_zone)
        .where((per_zone.c.last_date.is_(None)) | (per_zone.c.last_date < cutoff))
        .order_by(per_zone.c.id)
    )
    return [
        {"zone_id": r.id, "name": r.name, "last_date": r.last_date}
        for r in result
    ]


async def _alert_stale_zones(stale: list[dict], errors: list[dict]) -> None:
    """Email the stale zones (and today's errors for them) to ALERT_EMAIL."""
    from app.services.email import send_ops_alert  # local import: avoid cycles

    err_by_zone = {e["zone_id"]: e["error"] for e in errors}
    lookback = settings.ingest_lookback_days
    rows = []
    for z in stale:
        last = z["last_date"]
        days = (date.today() - last).days if last else None
        risk = " ⚠️ perdiendo días" if days is None or days > lookback else ""
        since = f" (hace {days} días)" if days is not None else ""
        err = err_by_zone.get(z["zone_id"])
        err_html = f"<br/><small>{err}</small>" if err else ""
        rows.append(
            f"<li><b>{z['zone_id']}</b> {z['name']} — último dato: "
            f"{last.isoformat() if last else 'nunca'}{since}{risk}{err_html}</li>"
        )
    html = (
        f"<p>{len(stale)} zona(s) sin datos recientes tras la ingesta diaria. "
        f"La ingesta vuelve a pedir los últimos {lookback} días, así que pasado ese "
        "plazo los días perdidos ya no se recuperan solos.</p>"
        f"<ul>{''.join(rows)}</ul>"
        "<p>Relanzar a mano: <code>python -m scripts.backfill --from AAAA-MM-DD "
        f"--to AAAA-MM-DD --zones {','.join(z['zone_id'] for z in stale)}</code></p>"
    )
    await send_ops_alert(f"Fungus — {len(stale)} zona(s) sin datos recientes", html)


# ── Core ingestion logic ──────────────────────────────────────────────────────

async def _ingest_date_range(
    db: AsyncSession,
    zones: list[Zone],
    start: date,
    end: date,
) -> dict:
    """
    Fetch from the provider concurrently, then write to the DB sequentially.

    An AsyncSession does not allow concurrent operations, so the HTTP calls run in
    parallel (bounded by the semaphore) but every DB write goes through one task at
    a time. Each zone is committed on its own, so one failing zone never rolls back
    the others.
    """
    sem = asyncio.Semaphore(settings.ingest_max_concurrency)
    db_lock = asyncio.Lock()
    upserted = 0
    errors = []

    async def ingest_zone(zone: Zone) -> None:
        nonlocal upserted
        try:
            async with sem:
                connector = _get_connector(zone)
                rows = await connector.fetch_range(start, end)
        except ProviderUnavailable as exc:
            log.error("Zone %s: provider unavailable — %s", zone.id, exc)
            errors.append({"zone_id": zone.id, "error": str(exc)})
            return
        except Exception as exc:
            log.exception("Zone %s: fetch failed — %s", zone.id, exc)
            errors.append({"zone_id": zone.id, "error": str(exc)})
            return

        async with db_lock:
            try:
                for row in rows:
                    await _upsert_climate_row(db, row)
                await db.commit()
                upserted += len(rows)
                log.debug("Zone %s: %d rows ingested (%s→%s)", zone.id, len(rows), start, end)
            except Exception as exc:
                await db.rollback()
                log.exception("Zone %s: DB write failed — %s", zone.id, exc)
                errors.append({"zone_id": zone.id, "error": str(exc)})

    await asyncio.gather(*[ingest_zone(z) for z in zones])
    if errors:
        log.warning(
            "Ingest %s→%s: %d/%d zones failed: %s",
            start, end, len(errors), len(zones), [e["zone_id"] for e in errors],
        )
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
    """Recompute and persist today's score for all zones (see services/zone_scores.py)."""
    today = date.today()
    valid_until = datetime.now(UTC).replace(hour=0, minute=0, second=0, microsecond=0)
    valid_until = valid_until.replace(hour=5) + timedelta(days=1)  # next day at 05:00 UTC

    for zone in zones:
        try:
            row = await _compute_scores_for_zone(db, zone, today)
            if row is None:
                log.debug("Zone %s: no climate data, skipping score", zone.id)
                continue
            values = {
                "score_oi": row.score_oi,
                "model_version": row.model_version,
                "score_detail": row.score_detail,
                "calculated_at": datetime.now(UTC),
                "valid_until": valid_until,
            }
            stmt = (
                pg_insert(ScoresCache)
                .values(zone_id=zone.id, **values)
                .on_conflict_do_update(index_elements=["zone_id"], set_=values)
            )
            await db.execute(stmt)
        except Exception as exc:
            # One zone failing never blocks the rest; the previous cache row is kept.
            log.error("Failed to compute score for zone %s: %s", zone.id, exc)

    await db.commit()


async def _compute_scores_for_zone(
    db: AsyncSession, zone: Zone, ref_date: date
) -> ZoneScoreRow | None:
    """Read the climate window the models need (100 days) and build the cache row."""
    cutoff = ref_date - timedelta(days=V2_WINDOW_DAYS)
    rows_result = await db.execute(
        select(ClimateHistory)
        .where(ClimateHistory.zone_id == zone.id)
        .where(ClimateHistory.date >= cutoff)
        .where(ClimateHistory.date <= ref_date)
        .order_by(ClimateHistory.date)
    )
    rows: list[ClimateHistory] = list(rows_result.scalars())
    if not rows:
        return None
    return build_score_row(rows, ref_date, zone.elevation_m)


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
