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

    # Seguridad — legacy (mantener por compatibilidad)
    secret_key: str = "dev-secret-key-change-in-production"

    # JWT Auth (v5)
    jwt_secret_key: str = "dev-jwt-secret-change-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60        # 1 hour
    refresh_token_expire_days: int = 30          # 30 days

    # Google OAuth2 (v7)
    google_client_id: str = ""

    # Email — Resend (v7.1)
    resend_api_key: str = ""
    # From address — use onboarding@resend.dev while testing; set your verified
    # domain address (e.g. noreply@fungus-app.com) before going to production.
    email_from: str = "Fungus <onboarding@resend.dev>"
    # Base URL of the frontend — used to build the verification link in emails.
    frontend_url: str = "http://localhost:5173"
    # Base URL for static assets embedded in emails (logo, etc.).
    # Must be a publicly reachable URL — mail clients cannot load localhost or
    # data URIs. Points to the FastAPI backend (/static/) so the SPA rewrites
    # on Vercel don't interfere. In dev, emails use the Render production URL.
    email_assets_url: str = "https://fungus-api.onrender.com"

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
    def has_resend(self) -> bool:
        return bool(self.resend_api_key)

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
