"""Weekly rain over a regular grid of Catalonia, for the territory heat map.

The map must show where it has rained, so it does not depend on the catalogue zones (which are
places picked for other reasons): it samples the territory with a regular grid (territory_grid)
and asks Open-Meteo for the daily rain of every point in a few batched requests. The answer is
kept in one cache row and rebuilt once a day (a heavy call: ~55 locations x 26 weeks).

Weeks run Monday to Sunday and only count complete days (before `today`); the last week may be
partial. A week with no data for a point is null, so the map paints only what it has.
"""

import asyncio
import logging
import math
from collections.abc import Awaitable, Callable, Sequence
from datetime import UTC, date, datetime, timedelta
from typing import Any

import httpx
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

from app.connectors.base import ProviderUnavailable
from app.connectors.open_meteo import ARCHIVE_CUTOFF_DAYS, ARCHIVE_URL, BASE_URL, RETRYABLE_STATUS
from app.services.territory_grid import GRID

log = logging.getLogger(__name__)

WEEKS = 26
REFETCH_WEEKS = 3  # the current week and the two before: the forecast days get revised by ERA5
BATCH = 20  # locations per request
CACHE_MAX_AGE = timedelta(hours=20)
LABEL_MAX_KM = 30.0

DailyRain = dict[date, float]
# (points) -> (daily rain per point, elevation per point), for a range of days
Fetcher = Callable[
    [Sequence[tuple[float, float]], date, date],
    Awaitable[tuple[list[DailyRain], list[float | None]]],
]


def _monday(d: date) -> date:
    return d - timedelta(days=d.weekday())


def week_starts(today: date, weeks: int = WEEKS) -> list[date]:
    first = _monday(today - timedelta(days=1)) - timedelta(weeks=weeks - 1)
    return [first + timedelta(weeks=i) for i in range(weeks)]


def weekly_totals(daily: DailyRain, today: date, weeks: int = WEEKS) -> list[float | None]:
    starts = week_starts(today, weeks)
    last_day = today - timedelta(days=1)
    sums: list[float | None] = [None] * weeks
    for day, mm in daily.items():
        if mm is None or day > last_day or day < starts[0]:
            continue
        i = (day - starts[0]).days // 7
        sums[i] = (sums[i] or 0.0) + float(mm)
    return [None if v is None else round(v, 1) for v in sums]


def _km(a: tuple[float, float], b: tuple[float, float]) -> float:
    rad = math.radians
    dlat, dlon = rad(b[0] - a[0]), rad(b[1] - a[1])
    h = (
        math.sin(dlat / 2) ** 2
        + math.cos(rad(a[0])) * math.cos(rad(b[0])) * math.sin(dlon / 2) ** 2
    )
    return 2 * 6371 * math.asin(math.sqrt(h))


def label_points(points: Sequence[tuple[float, float]], zones: Sequence[Any]) -> list[str | None]:
    """Name of each point: the `region` (comarca) of the nearest catalogue zone within 30 km."""
    labels: list[str | None] = []
    for p in points:
        best, best_km = None, LABEL_MAX_KM
        for z in zones:
            d = _km(p, (z.lat, z.lon))
            if d <= best_km and z.region:
                best, best_km = z.region, d
        labels.append(best)
    return labels


def build_territory_rain(
    points: Sequence[tuple[float, float]],
    daily: Sequence[DailyRain],
    elevations: Sequence[float | None],
    labels: Sequence[str | None],
    today: date,
    weeks: int = WEEKS,
) -> dict:
    starts = week_starts(today, weeks)
    return {
        "last_data_date": (today - timedelta(days=1)).isoformat(),
        "weeks": [
            {"start": s.isoformat(), "end": (s + timedelta(days=6)).isoformat()} for s in starts
        ],
        "points": [
            {
                "lat": lat,
                "lon": lon,
                "elevation_m": None if elevations[i] is None else round(elevations[i]),
                "label": labels[i],
                "mm": weekly_totals(daily[i], today, weeks),
            }
            for i, (lat, lon) in enumerate(points)
        ],
    }


# ── Open-Meteo ────────────────────────────────────────────────────────────────


@retry(
    retry=retry_if_exception_type(httpx.HTTPError),
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    reraise=True,
)
async def _request(client: httpx.AsyncClient, url: str, params: dict) -> Any:
    try:
        resp = await client.get(url, params=params)
        resp.raise_for_status()
        return resp.json()
    except httpx.HTTPStatusError as exc:
        if exc.response.status_code in RETRYABLE_STATUS:
            raise
        raise ProviderUnavailable(
            f"Open-Meteo HTTP {exc.response.status_code}: {exc.response.text[:200].strip()}"
        ) from exc


def _parse(raw: Any, n: int) -> list[dict]:
    items = raw if isinstance(raw, list) else [raw]
    if len(items) != n:
        raise ProviderUnavailable(f"Open-Meteo answered {len(items)} locations for {n}")
    return items


async def fetch_grid_rain(
    points: Sequence[tuple[float, float]], start: date, end: date
) -> tuple[list[DailyRain], list[float | None]]:
    """Daily rain of every point for [start, end]: the archive (ERA5, ~5 days late) for the old
    days and the forecast API for the last ones. Batches of 20 locations."""
    cutoff = date.today() - timedelta(days=ARCHIVE_CUTOFF_DAYS)
    ranges = []
    if start <= cutoff:
        ranges.append((ARCHIVE_URL, start, min(end, cutoff)))
    if end > cutoff:
        ranges.append((BASE_URL, max(start, cutoff + timedelta(days=1)), end))

    daily: list[DailyRain] = [{} for _ in points]
    elevations: list[float | None] = [None] * len(points)
    async with httpx.AsyncClient(timeout=60.0) as client:
        for i in range(0, len(points), BATCH):
            chunk = points[i : i + BATCH]
            for url, a, b in ranges:
                params = {
                    "latitude": ",".join(str(p[0]) for p in chunk),
                    "longitude": ",".join(str(p[1]) for p in chunk),
                    "daily": "precipitation_sum",
                    "start_date": a.isoformat(),
                    "end_date": b.isoformat(),
                    "timezone": "Europe/Madrid",
                }
                for k, item in enumerate(_parse(await _request(client, url, params), len(chunk))):
                    times = item.get("daily", {}).get("time", [])
                    mm = item.get("daily", {}).get("precipitation_sum", [])
                    for t, v in zip(times, mm, strict=False):
                        if v is not None:
                            daily[i + k][date.fromisoformat(t)] = float(v)
                    if item.get("elevation") is not None:
                        elevations[i + k] = float(item["elevation"])
    return daily, elevations


# ── Cache ─────────────────────────────────────────────────────────────────────

_refresh_lock = asyncio.Lock()


def reusable_weeks(
    previous: dict | None, points: Sequence[tuple[float, float]], today: date, weeks: int = WEEKS
) -> bool:
    """Can the older weeks of `previous` be kept as they are? Yes when it covers the same grid and
    its data reached the day before the first week that is asked again (so every week kept was
    complete) and it holds every week that is kept."""
    if not previous or len(previous.get("points", [])) != len(points):
        return False
    if any(
        (p["lat"], p["lon"]) != tuple(q) for p, q in zip(previous["points"], points, strict=True)
    ):
        return False
    starts = week_starts(today, weeks)
    cut = starts[-REFETCH_WEEKS]
    try:
        reached = date.fromisoformat(previous["last_data_date"])
    except (KeyError, TypeError, ValueError):
        return False
    if reached < cut - timedelta(days=1):
        return False
    have = {w["start"] for w in previous.get("weeks", [])}
    return all(s.isoformat() in have for s in starts if s < cut)


def keep_old_weeks(payload: dict, previous: dict, today: date) -> dict:
    """Fills the weeks before the refetched ones from `previous` (and the elevation if the
    refetch did not bring it)."""
    starts = week_starts(today, len(payload["weeks"]))
    cut = starts[-REFETCH_WEEKS]
    old_index = {w["start"]: k for k, w in enumerate(previous["weeks"])}
    for new, old in zip(payload["points"], previous["points"], strict=True):
        for j, start in enumerate(starts):
            if start < cut:
                new["mm"][j] = old["mm"][old_index[start.isoformat()]]
        if new["elevation_m"] is None:
            new["elevation_m"] = old.get("elevation_m")
    return payload


async def compute_territory_rain(
    zones: Sequence[Any],
    today: date,
    fetcher: Fetcher = fetch_grid_rain,
    previous: dict | None = None,
) -> dict:
    """The whole map from Open-Meteo, or, when `previous` still holds the older weeks (they never
    change), only the last 3 weeks: ~100 calls a day instead of ~800."""
    points = list(GRID)
    starts = week_starts(today)
    incremental = reusable_weeks(previous, points, today)
    start = starts[-REFETCH_WEEKS] if incremental else starts[0]
    daily, elevations = await fetcher(points, start, today - timedelta(days=1))
    payload = build_territory_rain(points, daily, elevations, label_points(points, zones), today)
    return keep_old_weeks(payload, previous, today) if incremental else payload


def is_fresh(computed_at: datetime, now: datetime) -> bool:
    if computed_at.tzinfo is None:
        computed_at = computed_at.replace(tzinfo=UTC)
    return now - computed_at < CACHE_MAX_AGE


def now_utc() -> datetime:
    return datetime.now(UTC)
