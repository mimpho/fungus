"""
Motor asíncrono SQLAlchemy + sesión de base de datos.
Usar `get_db` como dependencia en los routers FastAPI.
"""
import logging
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

log = logging.getLogger(__name__)

# ── Motor ────────────────────────────────────────────────────────────────────

engine = create_async_engine(
    settings.database_url,
    echo=not settings.is_production,   # SQL logging en dev
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,                # reconecta si la conexión está muerta
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


# ── Base declarativa ─────────────────────────────────────────────────────────

class Base(DeclarativeBase):
    pass


# ── Dependencia FastAPI ───────────────────────────────────────────────────────

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependencia de FastAPI. Uso:

        @router.get("/ejemplo")
        async def ejemplo(db: AsyncSession = Depends(get_db)):
            ...
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


# ── Helpers ───────────────────────────────────────────────────────────────────

async def create_all_tables() -> None:
    """Crea las tablas si no existen. Solo para desarrollo/tests; en producción usar Alembic."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    log.info("Tablas creadas/verificadas en la base de datos")


async def dispose_engine() -> None:
    """Cierra el pool de conexiones. Llamar en el shutdown de la app."""
    await engine.dispose()
    log.info("Pool de conexiones cerrado")
