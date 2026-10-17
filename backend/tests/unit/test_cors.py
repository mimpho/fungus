"""CORS: a browser on another origin can read the headers the frontend needs. No DB, no network."""
import httpx
import pytest

from app.main import app

ORIGINS = ["http://localhost:5173", "https://fungus-ashen.vercel.app"]


@pytest.mark.parametrize("origin", ORIGINS)
async def test_retry_after_is_readable_from_the_browser(origin):
    """The 429/503 answers of the Observatory say when to try again in Retry-After; without it
    in Access-Control-Expose-Headers the browser hides it from the page's JavaScript."""
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://t") as c:
        res = await c.head("/api/v1/health", headers={"Origin": origin})
    assert res.headers["access-control-allow-origin"] == origin
    header = res.headers.get("access-control-expose-headers", "")
    exposed = [h.strip().lower() for h in header.split(",")]
    assert "retry-after" in exposed
