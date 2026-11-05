"""Class rasters from the private bucket (feat/observatory-raster-storage): the start-up download
against an in-memory storage (no network), the checks on what arrives, the degraded mode with its
retry, and the REST `get` of the Supabase client against a mocked transport."""
import json
import logging

import httpx
import pytest

from app.config import Settings
from app.services import raster_loader
from app.services.photo_storage import StorageError, SupabasePhotoStorage
from app.services.point_habitat import load_raster
from app.services.raster_loader import RasterError, RasterLoader, validate_raster
from tests.unit.fakes import FakePhotoStorage

BOUNDS = {"north": 42.0, "south": 41.0, "west": 1.0, "east": 2.0}


def _raster(classes=("a", "b"), width=3, height=2, size=None):
    description = json.dumps(
        {"version": 1, "classes": list(classes), "width": width, "height": height,
         "bounds": BOUNDS}
    ).encode()
    return description, bytes(size if size is not None else len(classes) * width * height)


def _stocked(**overrides) -> FakePhotoStorage:
    """A storage holding both rasters, each replaceable by (description, data) in `overrides`."""
    storage = FakePhotoStorage()
    for kind, stem in (("forest", "forest-catalonia"), ("substrate", "substrate-catalonia")):
        description, data = overrides.get(kind) or _raster()
        storage.objects[f"{kind}/{stem}.json"] = description
        storage.objects[f"{kind}/{stem}.bin"] = data
    return storage


@pytest.fixture
def cfg(tmp_path):
    """Settings that never touch the shared singleton: dirs point at nothing until a load."""
    return Settings(
        _env_file=None,
        forest_raster_dir=str(tmp_path / "no-forest"),
        substrate_raster_dir=str(tmp_path / "no-substrate"),
        supabase_url="https://proj.supabase.co",
        supabase_service_key="service-key-secret",
        rasters_bucket="geo-rasters",
        rasters_cache_dir=str(tmp_path / "cache"),
    )


@pytest.fixture(autouse=True)
def _reset_loader():
    raster_loader._loader = None
    yield
    raster_loader._loader = None


async def _no_sleep(_seconds: float) -> None:
    return None


def _loader(storage, cfg, tmp_path, **kwargs) -> RasterLoader:
    return RasterLoader(
        storage, tmp_path / "cache", app_settings=cfg, sleep=_no_sleep, **kwargs
    )


class TestValidate:
    def test_a_raster_whose_bytes_match_its_description_passes(self):
        validate_raster(*_raster())

    def test_a_truncated_raster_is_refused(self):
        description, _ = _raster()
        with pytest.raises(RasterError, match="bytes"):
            validate_raster(description, bytes(5))

    def test_a_raster_with_more_classes_than_bytes_is_refused(self):
        # the gotcha: classes changed in the description but the .bin was not rebuilt
        description, data = _raster(classes=("a", "b"))
        other, _ = _raster(classes=("a", "b", "c"))
        with pytest.raises(RasterError):
            validate_raster(other, data)
        validate_raster(description, data)

    @pytest.mark.parametrize("description", [b"not json", b"{}", b'{"classes": []}', b"\xff\xfe"])
    def test_an_unreadable_or_incomplete_description_is_refused(self, description):
        with pytest.raises(RasterError):
            validate_raster(description, b"")

    def test_a_description_without_bounds_is_refused(self):
        description = json.dumps({"classes": ["a"], "width": 1, "height": 1}).encode()
        with pytest.raises(RasterError):
            validate_raster(description, b"\x00")


class TestDownload:
    async def test_both_rasters_are_written_and_the_settings_point_at_them(self, cfg, tmp_path):
        loader = _loader(_stocked(), cfg, tmp_path)
        await loader.run()

        assert loader.status == "ok" and loader.missing == []
        assert cfg.forest_raster_dir == str(tmp_path / "cache" / "forest")
        assert cfg.substrate_raster_dir == str(tmp_path / "cache" / "substrate")
        for kind, stem in (("forest", "forest-catalonia"), ("substrate", "substrate-catalonia")):
            for ext in ("bin", "json"):
                assert (tmp_path / "cache" / kind / f"{stem}.{ext}").is_file()
        assert not list((tmp_path / "cache").rglob("*.part"))

    async def test_what_is_written_is_what_point_habitat_reads(self, cfg, tmp_path):
        await _loader(_stocked(), cfg, tmp_path).run()
        raster = load_raster(cfg.forest_raster_dir, "forest-catalonia")
        assert raster is not None and raster.classes == ("a", "b")

    async def test_a_cached_not_there_does_not_shadow_a_late_raster(self, cfg, tmp_path):
        # same folder before and after: the lru_cache of point_habitat would keep the None
        cfg.forest_raster_dir = str(tmp_path / "cache" / "forest")
        assert load_raster(cfg.forest_raster_dir, "forest-catalonia") is None
        await _loader(_stocked(), cfg, tmp_path).run()
        assert load_raster(cfg.forest_raster_dir, "forest-catalonia") is not None

    async def test_a_transient_failure_is_retried_with_a_growing_pause(self, cfg, tmp_path):
        pauses = []

        async def record(seconds):
            pauses.append(seconds)

        storage = _stocked()
        storage.get_failures = 2
        loader = RasterLoader(
            storage, tmp_path / "cache", app_settings=cfg, sleep=record, base_delay=2.0
        )
        await loader.run()

        assert loader.status == "ok"
        assert pauses and pauses[0] == 2.0 and all(b >= a for a, b in zip(pauses, pauses[1:]))

    async def test_a_down_storage_leaves_the_api_degraded_and_the_dirs_untouched(
        self, cfg, tmp_path, caplog
    ):
        storage = _stocked()
        storage.fail = True
        before = (cfg.forest_raster_dir, cfg.substrate_raster_dir)
        loader = _loader(storage, cfg, tmp_path)
        with caplog.at_level(logging.ERROR):
            await loader.run()

        assert loader.status == "degraded" and loader.missing == ["forest", "substrate"]
        assert (cfg.forest_raster_dir, cfg.substrate_raster_dir) == before
        assert "NOT loaded" in caplog.text

    async def test_a_missing_file_is_a_failure_not_a_crash(self, cfg, tmp_path):
        storage = _stocked()
        del storage.objects["forest/forest-catalonia.bin"]
        loader = _loader(storage, cfg, tmp_path)
        await loader.run()
        assert loader.missing == ["forest"]
        assert loader.loaded == {"substrate"}

    async def test_a_truncated_download_is_not_written_or_used(self, cfg, tmp_path):
        loader = _loader(_stocked(forest=_raster(size=5)), cfg, tmp_path)
        await loader.run()

        assert loader.missing == ["forest"]
        assert not (tmp_path / "cache" / "forest").exists()
        assert cfg.forest_raster_dir == str(tmp_path / "no-forest")
        assert cfg.substrate_raster_dir == str(tmp_path / "cache" / "substrate")

    async def test_the_attempts_are_bounded(self, cfg, tmp_path):
        storage = _stocked()
        storage.fail = True
        await _loader(storage, cfg, tmp_path, attempts=3).run()
        # two rasters, each stops at its first failing request of every attempt
        assert len(storage.get_calls) == 6

    async def test_a_slow_download_is_cut_off_and_counts_as_missing(self, cfg, tmp_path):
        import asyncio

        class Slow(FakePhotoStorage):
            async def get(self, key):
                await asyncio.sleep(10)

        loader = _loader(Slow(), cfg, tmp_path)
        await loader.run(timeout=0.05)
        assert loader.missing == ["forest", "substrate"]

    async def test_without_credentials_the_rasters_are_missing(self, cfg, tmp_path):
        loader = _loader(None, cfg, tmp_path)
        await loader.run()
        assert loader.status == "degraded"


class TestStartup:
    async def test_no_bucket_changes_nothing_even_with_credentials(self, cfg, tmp_path):
        cfg.rasters_bucket = ""
        storage = _stocked()
        before = (cfg.forest_raster_dir, cfg.substrate_raster_dir)

        await raster_loader.startup_load(cfg, storage)

        assert (cfg.forest_raster_dir, cfg.substrate_raster_dir) == before
        assert storage.get_calls == []
        assert raster_loader.raster_status() == ("off", [])

    async def test_with_a_bucket_it_downloads_and_reports_ok(self, cfg, tmp_path):
        await raster_loader.startup_load(cfg, _stocked())
        assert raster_loader.raster_status() == ("ok", [])
        assert cfg.forest_raster_dir == str(tmp_path / "cache" / "forest")

    async def test_a_failed_download_still_starts_by_default(self, cfg, caplog, monkeypatch):
        monkeypatch.setattr(raster_loader, "BASE_DELAY_SECONDS", 0)
        storage = _stocked()
        storage.fail = True
        monkeypatch.setattr(raster_loader, "RasterLoader", _no_wait_loader(raster_loader))
        with caplog.at_level(logging.ERROR):
            await raster_loader.startup_load(cfg, storage)

        assert raster_loader.raster_status() == ("degraded", ["forest", "substrate"])
        assert "RASTERS MISSING" in caplog.text

    async def test_required_aborts_the_start_when_the_download_fails(self, cfg, monkeypatch):
        cfg.rasters_required = True
        storage = _stocked()
        storage.fail = True
        monkeypatch.setattr(raster_loader, "RasterLoader", _no_wait_loader(raster_loader))
        with pytest.raises(RuntimeError, match="Refusing to start"):
            await raster_loader.startup_load(cfg, storage)

    async def test_required_does_not_abort_when_everything_loads(self, cfg):
        cfg.rasters_required = True
        await raster_loader.startup_load(cfg, _stocked())
        assert raster_loader.raster_status()[0] == "ok"

    async def test_the_retry_job_recovers_what_failed(self, cfg, monkeypatch, caplog):
        monkeypatch.setattr(raster_loader, "RasterLoader", _no_wait_loader(raster_loader))
        storage = _stocked()
        storage.fail = True
        await raster_loader.startup_load(cfg, storage)
        assert raster_loader.raster_status()[0] == "degraded"

        storage.fail = False
        with caplog.at_level(logging.WARNING):
            await raster_loader.retry_missing()

        assert raster_loader.raster_status() == ("ok", [])
        assert "recovered" in caplog.text

    async def test_the_retry_job_does_nothing_when_off_or_complete(self, cfg):
        await raster_loader.retry_missing()  # off
        storage = _stocked()
        await raster_loader.startup_load(cfg, storage)
        calls = len(storage.get_calls)
        await raster_loader.retry_missing()  # complete
        assert len(storage.get_calls) == calls


def _no_wait_loader(module):
    """RasterLoader without pauses between attempts (the class is built inside startup_load)."""
    real = module.RasterLoader

    def build(storage, cache_dir, **kwargs):
        return real(storage, cache_dir, sleep=_no_sleep, **kwargs)

    return build


class TestHealth:
    async def test_health_reports_the_raster_state(self, cfg, monkeypatch):
        from app.routers import health as health_router

        storage = _stocked()
        del storage.objects["forest/forest-catalonia.bin"]
        monkeypatch.setattr(raster_loader, "RasterLoader", _no_wait_loader(raster_loader))
        await raster_loader.startup_load(cfg, storage)

        assert health_router.raster_status() == ("degraded", ["forest"])


URL = "https://proj.supabase.co"
BUCKET = "geo-rasters"
KEY = "service-key-secret"


def _supabase(handler):
    client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    return SupabasePhotoStorage(URL, KEY, BUCKET, client=client)


class TestSupabaseGet:
    async def test_get_reads_a_private_object_with_the_service_key(self):
        seen = {}

        def handler(request: httpx.Request) -> httpx.Response:
            seen.update(
                method=request.method, url=str(request.url),
                auth=request.headers["authorization"], apikey=request.headers["apikey"],
            )
            return httpx.Response(200, content=b"RASTER")

        data = await _supabase(handler).get("forest/forest-catalonia.bin")

        assert data == b"RASTER"
        assert seen["method"] == "GET"
        assert seen["url"] == (
            f"{URL}/storage/v1/object/authenticated/{BUCKET}/forest/forest-catalonia.bin"
        )
        assert seen["auth"] == f"Bearer {KEY}" and seen["apikey"] == KEY

    async def test_a_missing_object_raises_storage_error_without_the_key(self):
        storage = _supabase(lambda r: httpx.Response(404, json={"error": "not_found"}))
        with pytest.raises(StorageError) as caught:
            await storage.get("forest/forest-catalonia.bin")
        assert "404" in str(caught.value) and KEY not in str(caught.value)

    async def test_an_unreachable_storage_raises_storage_error(self):
        def handler(request):
            raise httpx.ConnectError("boom")

        with pytest.raises(StorageError, match="unreachable"):
            await _supabase(handler).get("x")

    async def test_a_body_shorter_than_declared_is_refused(self):
        storage = _supabase(
            lambda r: httpx.Response(200, content=b"abc", headers={"content-length": "10"})
        )
        with pytest.raises(StorageError, match="truncated"):
            await storage.get("x")

    async def test_the_download_gets_more_time_than_a_photo_call(self):
        seen = {}

        def handler(request: httpx.Request) -> httpx.Response:
            seen["read"] = request.extensions["timeout"]["read"]
            return httpx.Response(200, content=b"ok")

        await _supabase(handler).get("x")
        assert seen["read"] >= 60
