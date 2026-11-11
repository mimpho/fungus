"""Unit tests never read the developer's local class rasters (local-data/): without them the
species of a point are judged as before, and the tests that want a habitat pass one in."""
import pytest

from app.config import settings
from app.connectors import open_meteo


@pytest.fixture(autouse=True)
def _no_local_rasters(monkeypatch, tmp_path):
    monkeypatch.setattr(settings, "forest_raster_dir", str(tmp_path / "no-forest"))
    monkeypatch.setattr(settings, "substrate_raster_dir", str(tmp_path / "no-substrate"))


@pytest.fixture(autouse=True)
def _no_open_meteo_pause():
    """The pause after a 429 is process-wide: one test's 429 must not block the next test."""
    open_meteo.reset_rate_limit_pause()
    yield
    open_meteo.reset_rate_limit_pause()
