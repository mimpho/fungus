"""Abstract interface for all weather connectors."""
from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import date


class ProviderUnavailable(Exception):
    """Raised when a weather provider does not respond or returns an error."""
    pass


@dataclass
class DailyWeatherData:
    """Aggregated daily weather data, provider-agnostic."""
    zone_id: str
    date: date
    temp_max_c: float | None
    temp_min_c: float | None
    temp_avg_c: float | None
    soil_temp_c: float | None      # soil_temperature_0cm from hourly data
    precipitation_mm: float
    humidity_pct: int | None
    wind_kmh: int | None
    source: str                    # 'open-meteo' | 'aemet' | 'meteocat' | …
    station_id: str | None = None
    station_dist_km: float | None = None
    interpolated: bool = False
    precip_prob_pct: int | None = None  # forecast days only (max probability of the day)


class WeatherConnector(ABC):
    """
    Contract all connectors must implement.

    Typical usage in the ingestion service:
        connector = OpenMeteoConnector(zone_id='zone-001', lat=41.98, lon=-2.85)
        data = await connector.fetch_yesterday()
        history = await connector.fetch_range(start, end)
    """

    SOURCE: str  # provider identifier; must be set in each subclass

    @abstractmethod
    async def fetch_yesterday(self) -> DailyWeatherData:
        """Return aggregated data for the previous calendar day (Spain local time)."""
        ...

    @abstractmethod
    async def fetch_range(self, start: date, end: date) -> list[DailyWeatherData]:
        """
        Return daily data for the inclusive range [start, end].
        Used during the initial backfill and failure recovery.
        """
        ...

    async def fetch_range_and_forecast(
        self, start: date, end: date, forecast_days: int = 0
    ) -> tuple[list[DailyWeatherData], list[DailyWeatherData]]:
        """
        Return (history for [start, end], forecast from the day after `end` for up to
        `forecast_days` days counting today). Providers without a forecast return [].
        """
        return await self.fetch_range(start, end), []

    async def health_check(self) -> None:
        """
        Verify the provider is reachable.
        Raises ProviderUnavailable if it does not respond.
        Default implementation tries fetch_yesterday; subclasses may override.
        """
        await self.fetch_yesterday()
