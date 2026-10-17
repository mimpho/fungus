"""/docs in development: Swagger UI with a dark theme. No DB, no network."""
import httpx

from app.main import app


def _client():
    return httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://t")


async def test_docs_is_swagger_ui_with_the_dark_theme():
    async with _client() as c:
        res = await c.get("/docs")
    assert res.status_code == 200
    assert "swagger-ui" in res.text and "/openapi.json" in res.text
    assert "invert(" in res.text  # the dark stylesheet


async def test_oauth2_redirect_page_still_exists():
    async with _client() as c:
        res = await c.get("/docs/oauth2-redirect")
    assert res.status_code == 200
