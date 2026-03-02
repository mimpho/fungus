"""
Configuración centralizada via pydantic-settings.
Todas las variables de entorno se leen aquí — nunca os.environ directamente.
"""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Base de datos
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/fungus"

    # Seguridad
    secret_key: str = "dev-secret-key-change-in-production"

    # APIs meteorológicas opcionales (P1)
    meteocat_api_key: str = ""
    aemet_api_key: str = ""

    # Entorno
    environment: str = "development"
    log_level: str = "INFO"

    # CORS
    cors_origins: str = "http://localhost:5173"

    # Ingesta
    ingest_cron_hour: int = 5
    ingest_max_concurrency: int = 6

    # Versión de la API
    api_version: str = "v1"

    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    @property
    def has_meteocat(self) -> bool:
        return bool(self.meteocat_api_key)

    @property
    def has_aemet(self) -> bool:
        return bool(self.aemet_api_key)


@lru_cache
def get_settings() -> Settings:
    """Singleton de settings. Usar como dependencia FastAPI o importar directamente."""
    return Settings()


settings = get_settings()
