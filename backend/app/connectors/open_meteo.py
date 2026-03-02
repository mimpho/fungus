"""
Open-Meteo connector (P3 — universal fallback, no API key required).

Replicates the same API call structure used in the frontend weatherService.js,
but runs server-side, aggregates hourly data to daily, and supports full date ranges.

API docs: https://open-meteo.com/en/docs
"""
import logging
from datetime import date, timedelta

import httpx
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

from app.connectors.base import DailyWeatherData, ProviderUnavailable, WeatherConnector

log = logging.getLogger(__name__)

BASE_URL = "https://api.open-meteo.com/v1/forecast"

# Open-Meteo variables we need
DAILY_VARS = (
    "temperature_2m_max,temperature_2m_min,temperature_2m_mean,"
    "precipitation_sum,windspeed_10m_max"
)
HOURLY_VARS = "soil_temperature_0cm,relativehumidity_2m"


class OpenMeteoConnector(WeatherConnector):
    SOURCE = "open-meteo"

    def __init__(self, zone_id: str, lat: float, lon: float) -> None:
        self.zone_id = zone_id
        self.lat = lat
        self.lon = lon

    # ── Public interface ──────────────────────────────────────────────────────

    async def fetch_yesterday(self) -> DailyWeatherData:
        yesterday = date.today() - timedelta(days=1)
        results = await self.fetch_range(yesterday, yesterday)
        return results[0]

    async def fetch_range(self, start: date, end: date) -> list[DailyWeatherData]:
        raw = await self._request(start, end)
        return self._parse(raw, start, end)

    # ── Internal ──────────────────────────────────────────────────────────────

    @retry(
        retry=retry_if_exception_type(httpx.HTTPError),
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True,
    )
    async def _request(self, start: date, end: date) -> dict:
        params = {
            "latitude": self.lat,
            "longitude": self.lon,
            "daily": DAILY_VARS,
            "hourly": HOURLY_VARS,
            "start_date": start.isoformat(),
            "end_date": end.isoformat(),
            "timezone": "Europe/Madrid",
        }
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.get(BASE_URL, params=params)
                resp.raise_for_status()
                return resp.json()
        except httpx.HTTPStatusError as exc:
            raise ProviderUnavailable(
                f"Open-Meteo HTTP {exc.response.status_code} for zone {self.zone_id}"
            ) from exc
        except httpx.HTTPError as exc:
            log.warning("Open-Meteo request failed for %s: %s", self.zone_id, exc)
            raise

    def _parse(self, raw: dict, start: date, end: date) -> list[DailyWeatherData]:
        """Convert Open-Meteo response to list of DailyWeatherData."""
        daily = raw.get("daily", {})
        hourly = raw.get("hourly", {})

        dates = daily.get("time", [])
        temp_max = daily.get("temperature_2m_max", [])
        temp_min = daily.get("temperature_2m_min", [])
        temp_avg = daily.get("temperature_2m_mean", [])
        precip = daily.get("precipitation_sum", [])
        wind = daily.get("windspeed_10m_max", [])

        # Hourly data: aggregate to daily averages
        hourly_times = hourly.get("time", [])
        hourly_soil = hourly.get("soil_temperature_0cm", [])
        hourly_humidity = hourly.get("relativehumidity_2m", [])

        # Build per-day dictionaries from hourly data
        soil_by_day: dict[str, list[float]] = {}
        humidity_by_day: dict[str, list[float]] = {}
        for i, ts in enumerate(hourly_times):
            day_str = ts[:10]  # 'YYYY-MM-DD'
            if hourly_soil and i < len(hourly_soil) and hourly_soil[i] is not None:
                soil_by_day.setdefault(day_str, []).append(hourly_soil[i])
            if hourly_humidity and i < len(hourly_humidity) and hourly_humidity[i] is not None:
                humidity_by_day.setdefault(day_str, []).append(hourly_humidity[i])

        results: list[DailyWeatherData] = []
        for i, day_str in enumerate(dates):
            soil_values = soil_by_day.get(day_str, [])
            hum_values = humidity_by_day.get(day_str, [])

            results.append(
                DailyWeatherData(
                    zone_id=self.zone_id,
                    date=date.fromisoformat(day_str),
                    temp_max_c=_safe_float(temp_max, i),
                    temp_min_c=_safe_float(temp_min, i),
                    temp_avg_c=_safe_float(temp_avg, i),
                    soil_temp_c=round(sum(soil_values) / len(soil_values), 1)
                    if soil_values
                    else None,
                    precipitation_mm=_safe_float(precip, i) or 0.0,
                    humidity_pct=round(sum(hum_values) / len(hum_values))
                    if hum_values
                    else None,
                    wind_kmh=round(_safe_float(wind, i) or 0),
                    source=self.SOURCE,
                )
            )

        return results


# ── Helpers ───────────────────────────────────────────────────────────────────

def _safe_float(lst: list, idx: int) -> float | None:
    try:
        val = lst[idx]
        return float(val) if val is not None else None
    except (IndexError, TypeError):
        return None
