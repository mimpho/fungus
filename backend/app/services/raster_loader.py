"""Class rasters (forest, soil) from a private Supabase bucket, downloaded at start-up.

The rasters derive from CREAF MCSC-4 (licence unconfirmed), so they are neither in git nor in
the image: production keeps them in a private bucket and this module copies them to a temporary
folder when the API starts, then points `forest_raster_dir` / `substrate_raster_dir` at it. The
rest of the back end keeps reading plain folders (point_habitat, the layer router).

- No `RASTERS_BUCKET`: nothing happens (local runs read `local-data/` as before).
- A download that fails (storage down, file missing, wrong size) is retried with a growing pause;
  if it still fails the API starts without that raster (scores without that habitat factor), says
  so in the log at ERROR level and in /health, and the scheduler retries every few minutes.
  With `RASTERS_REQUIRED` the start-up aborts instead.
- A raster is only used if its description and its bytes agree (classes x width x height), the
  same check point_habitat does when reading; files are written under a temporary name and
  renamed, so a half-written file is never read.
"""
from __future__ import annotations

import asyncio
import json
import logging
import os
import tempfile
from collections.abc import Awaitable, Callable
from dataclasses import dataclass
from pathlib import Path

from app.config import Settings, settings
from app.services.photo_storage import PhotoStorage, StorageError, SupabasePhotoStorage
from app.services.point_habitat import clear_raster_cache

log = logging.getLogger(__name__)

STARTUP_TIMEOUT_SECONDS = 60.0  # all downloads together; over it the rest count as failed
ATTEMPTS = 3
BASE_DELAY_SECONDS = 2.0  # pause before attempt 2; doubles after each failure


class RasterError(Exception):
    """A raster could not be fetched or is not usable. The message never carries a secret."""


@dataclass(frozen=True)
class RasterSpec:
    kind: str  # also the folder in the bucket and in the cache dir
    stem: str  # file name without extension, as the build scripts write it
    setting: str  # Settings attribute that holds the folder the back end reads


SPECS = (
    RasterSpec("forest", "forest-catalonia", "forest_raster_dir"),
    RasterSpec("substrate", "substrate-catalonia", "substrate_raster_dir"),
)


def validate_raster(description: bytes, data: bytes) -> None:
    """Raise RasterError unless the description parses and `data` has exactly the bytes it
    announces (one byte per class, row and column)."""
    try:
        meta = json.loads(description)
        classes = meta["classes"]
        width, height = int(meta["width"]), int(meta["height"])
        for side in ("north", "south", "west", "east"):
            float(meta["bounds"][side])
    except (ValueError, KeyError, TypeError) as exc:
        raise RasterError("the raster description is unreadable") from exc
    if not isinstance(classes, list) or not classes or width <= 0 or height <= 0:
        raise RasterError("the raster description is incomplete")
    expected = len(classes) * width * height
    if len(data) != expected:
        raise RasterError(f"the raster has {len(data)} bytes, its description says {expected}")


def _write_atomic(folder: Path, stem: str, description: bytes, data: bytes) -> None:
    folder.mkdir(parents=True, exist_ok=True)
    for ext, content in (("bin", data), ("json", description)):  # json last: it is the "ready" mark
        target = folder / f"{stem}.{ext}"
        part = target.with_name(target.name + ".part")
        part.write_bytes(content)
        os.replace(part, target)


class RasterLoader:
    def __init__(
        self,
        storage: PhotoStorage | None,
        cache_dir: Path,
        *,
        app_settings: Settings = settings,
        attempts: int = ATTEMPTS,
        base_delay: float = BASE_DELAY_SECONDS,
        sleep: Callable[[float], Awaitable[None]] = asyncio.sleep,
    ) -> None:
        self._storage = storage
        self._cache_dir = cache_dir
        self._settings = app_settings
        self._attempts = attempts
        self._base_delay = base_delay
        self._sleep = sleep
        self.loaded: set[str] = set()

    @property
    def missing(self) -> list[str]:
        return [spec.kind for spec in SPECS if spec.kind not in self.loaded]

    @property
    def status(self) -> str:
        return "ok" if not self.missing else "degraded"

    async def _fetch(self, spec: RasterSpec) -> None:
        if self._storage is None:
            raise RasterError(
                "RASTERS_BUCKET is set but SUPABASE_URL / SUPABASE_SERVICE_KEY are not"
            )
        last: Exception | None = None
        for attempt in range(1, self._attempts + 1):
            try:
                description = await self._storage.get(f"{spec.kind}/{spec.stem}.json")
                data = await self._storage.get(f"{spec.kind}/{spec.stem}.bin")
                validate_raster(description, data)
                await asyncio.to_thread(
                    _write_atomic, self._cache_dir / spec.kind, spec.stem, description, data
                )
                return
            except (StorageError, RasterError, OSError) as exc:
                last = exc
                log.warning(
                    "Raster %s: attempt %d/%d failed: %s", spec.kind, attempt, self._attempts, exc
                )
                if attempt < self._attempts:
                    await self._sleep(self._base_delay * 2 ** (attempt - 1))
        raise RasterError(str(last)) from last

    async def _load_one(self, spec: RasterSpec) -> None:
        try:
            await self._fetch(spec)
        except RasterError as exc:
            log.error("Raster %s NOT loaded: %s", spec.kind, exc)
            return
        setattr(self._settings, spec.setting, str(self._cache_dir / spec.kind))
        self.loaded.add(spec.kind)
        clear_raster_cache()
        log.info("Raster %s loaded from the bucket", spec.kind)

    async def run(self, timeout: float | None = STARTUP_TIMEOUT_SECONDS) -> None:
        """Download what is not loaded yet, in parallel. Never raises for a failed download."""
        pending = [spec for spec in SPECS if spec.kind not in self.loaded]
        try:
            await asyncio.wait_for(asyncio.gather(*(self._load_one(s) for s in pending)), timeout)
        except TimeoutError:
            log.error("Raster download timed out after %.0f s", timeout or 0)


_loader: RasterLoader | None = None


def raster_status() -> tuple[str, list[str]]:
    """('off' | 'ok' | 'degraded', kinds still missing) for /health."""
    if _loader is None:
        return "off", []
    return _loader.status, _loader.missing


def _build_storage(app_settings: Settings) -> PhotoStorage | None:
    if not app_settings.has_photo_storage:
        return None
    return SupabasePhotoStorage(
        app_settings.supabase_url, app_settings.supabase_service_key, app_settings.rasters_bucket
    )


async def startup_load(
    app_settings: Settings = settings, storage: PhotoStorage | None = None
) -> None:
    """Called once by the lifespan, before serving. Raises RuntimeError only with
    RASTERS_REQUIRED and a failed download."""
    global _loader
    _loader = None
    if not app_settings.has_raster_bucket:
        log.info("Rasters: no RASTERS_BUCKET, reading %s and %s as they are",
                 app_settings.forest_raster_dir, app_settings.substrate_raster_dir)
        return
    cache_dir = Path(
        app_settings.rasters_cache_dir or Path(tempfile.gettempdir()) / "fungus-rasters"
    )
    _loader = RasterLoader(
        storage or _build_storage(app_settings), cache_dir, app_settings=app_settings
    )
    await _loader.run()
    if _loader.missing:
        log.error(
            "RASTERS MISSING (%s): the API starts WITHOUT them, so scores leave out that habitat "
            "factor. /health shows rasters=degraded; a retry runs every few minutes.",
            ", ".join(_loader.missing),
        )
        if app_settings.rasters_required:
            raise RuntimeError(
                f"RASTERS_REQUIRED is on and {', '.join(_loader.missing)} could not be loaded. "
                "Refusing to start."
            )


async def retry_missing() -> None:
    """Scheduler job: try again whatever failed at start-up. Cheap when nothing is missing."""
    if _loader is None or not _loader.missing:
        return
    await _loader.run()
    if not _loader.missing:
        log.warning("Rasters recovered: forest and soil are back in the scores")
