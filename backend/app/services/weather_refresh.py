"""
Scheduled refresh of weather_cache (current weather shown in the zone list and card).

Runs every 3 h for all active zones (plus once at startup when rows are missing),
so the API never has to call Open-Meteo on a user request. Guards, so the free
Open-Meteo limit (10,000 calls/day, shared with the ingest and backfills) is never
exceeded and stale data is never shown as current:

- Daily call budget (`weather_cache.budget`): the run stops before going over.
- One request at a time: Open-Meteo answers 429 "Too many concurrent requests"
  to parallel calls from one IP. That 429 and network errors (timeouts) are
  retried once after a pause.
- Circuit breaker on any other 429 (daily/hourly/minutely limit): the run stops at
  once; nothing is written for the remaining zones, so their rows age out ("–").
- A failed zone keeps its previous row (never overwritten with empty data).
- Alert email (ALERT_EMAIL, at most once per UTC day) when zones are left with
  weather older than WEATHER_MAX_AGE_HOURS. The count is also in /health.
"""
import asyncio
import logging
from collections import Counter
from datetime import UTC, date, datetime

from sqlalchemy import exists, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.weather_cache import WeatherCache
from app.models.zone import Zone
from app.services import weather_cache
from app.services.weather_cache import DEFAULT_PROVIDER, WeatherFetchError

log = logging.getLogger(__name__)

# Sequential: Open-Meteo rejects concurrent calls from the same IP (429). ~214
# zones x ~0.3 s ≈ 1–2 min per run, well under the 600 calls/min free limit.
CONCURRENCY = 1
RETRY_DELAY_S = 3.0

_last_alert_day: date | None = None


def _is_retryable(exc: WeatherFetchError) -> bool:
    """Network error (no status) or 429 for concurrency — not a quota limit."""
    return exc.status is None or (exc.rate_limited and "concurrent" in exc.detail.lower())


async def refresh_weather_cache(db: AsyncSession, zone_ids: list[str] | None = None) -> dict:
    """
    Fetch current weather for all active zones (or only `zone_ids`) and store it.
    Returns a summary.
    """
    zones = await _get_active_zones(db)
    if zone_ids is not None:
        wanted = set(zone_ids)
        zones = [z for z in zones if z.id in wanted]
    sem = asyncio.Semaphore(CONCURRENCY)
    stopped: list[str] = []          # reason the run stopped early, if any
    fetched: dict[str, dict] = {}
    failed: list[dict] = []
    skipped = 0

    async def refresh_zone(zone: Zone) -> None:
        nonlocal skipped
        async with sem:
            if stopped:
                skipped += 1
                return
            for attempt in (1, 2):
                if not weather_cache.budget.try_spend():
                    stopped.append("daily call budget reached")
                    skipped += 1
                    return
                try:
                    fetched[zone.id] = await weather_cache.fetch_weather(
                        zone.lat, zone.lon, client
                    )
                    return
                except WeatherFetchError as exc:
                    if attempt == 1 and _is_retryable(exc):
                        await asyncio.sleep(RETRY_DELAY_S)
                        continue
                    failed.append(
                        {"zone_id": zone.id, "status": exc.status, "detail": exc.detail}
                    )
                    if exc.rate_limited and not stopped:
                        stopped.append(f"HTTP 429 (circuit breaker): {exc.detail[:80]}")
                    return

    # One client (one keep-alive connection) for the whole run
    async with weather_cache.new_client() as client:
        await asyncio.gather(*(refresh_zone(z) for z in zones))

    # One AsyncSession does not allow overlapping operations: write sequentially.
    for zone_id, data in fetched.items():
        await weather_cache.store_weather_cache(zone_id, DEFAULT_PROVIDER, data, db)

    outdated = await get_outdated_weather_zones(db)
    summary = {
        "zones": len(zones),
        "stored": len(fetched),
        "failed": len(failed),
        "skipped": skipped,
        "stopped": stopped[0] if stopped else None,
        "failures_by_status": dict(Counter(str(f["status"] or "network") for f in failed)),
        "outdated": len(outdated),
        "budget_used_today": round(weather_cache.budget.used, 1),
    }
    if failed:
        # Diagnosis: status code and body of the first failures
        for f in failed[:3]:
            log.warning(
                "weather refresh: %s failed — HTTP %s: %s",
                f["zone_id"], f["status"] or "-", f["detail"][:200],
            )
    log.info("Weather refresh finished: %s", summary)

    if outdated:
        await _alert_outdated(outdated, summary, failed)
    return summary


async def get_outdated_weather_zones(db: AsyncSession) -> list[str]:
    """Active zones with no weather row younger than WEATHER_MAX_AGE_HOURS."""
    fresh = exists().where(
        WeatherCache.zone_id == Zone.id,
        WeatherCache.provider_id == DEFAULT_PROVIDER,
        WeatherCache.valid_until > func.now(),
    )
    result = await db.execute(
        select(Zone.id).where(Zone.active == True, ~fresh).order_by(Zone.id)  # noqa: E712
    )
    return list(result.scalars())


async def _get_active_zones(db: AsyncSession) -> list[Zone]:
    result = await db.execute(select(Zone).where(Zone.active == True))  # noqa: E712
    return list(result.scalars())


async def _alert_outdated(outdated: list[str], summary: dict, failed: list[dict]) -> None:
    """Email ALERT_EMAIL at most once per UTC day."""
    global _last_alert_day
    today = datetime.now(UTC).date()
    if _last_alert_day == today:
        return
    from app.services.email import send_ops_alert  # local import: avoid cycles

    examples = "".join(
        f"<li><b>{f['zone_id']}</b> — HTTP {f['status'] or '-'}: "
        f"<small>{f['detail'][:200]}</small></li>"
        for f in failed[:5]
    )
    html = (
        f"<p>{len(outdated)} zona(s) sin tiempo actual de menos de "
        f"{settings.weather_max_age_hours} h (la app muestra «–»).</p>"
        f"<p>Último refresco: {summary['stored']}/{summary['zones']} guardadas, "
        f"{summary['failed']} fallidas, {summary['skipped']} sin pedir"
        f"{' — parado: ' + summary['stopped'] if summary['stopped'] else ''}. "
        f"Llamadas hoy: {summary['budget_used_today']} de "
        f"{settings.weather_daily_call_budget}.</p>"
        + (f"<p>Primeros fallos:</p><ul>{examples}</ul>" if examples else "")
        + f"<p><small>{', '.join(outdated[:50])}</small></p>"
    )
    if await send_ops_alert(f"Fungus — {len(outdated)} zona(s) sin tiempo actual", html):
        _last_alert_day = today
