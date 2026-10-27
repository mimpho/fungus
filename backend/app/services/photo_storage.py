"""Corner photos: object storage behind a small protocol.

Production uses a private Supabase Storage bucket reached by REST with the service key (never
in the frontend). Tests use an in-memory fake (tests/unit/fakes.py). The key is only ever sent
in the Authorization header and never ends up in an error message.
"""
import uuid
from dataclasses import dataclass
from typing import Protocol

import httpx

TIMEOUT = httpx.Timeout(20.0, connect=5.0)


class StorageError(Exception):
    """The storage did not do what was asked (down, refused, unexpected answer)."""


class PhotoStorage(Protocol):
    async def put(self, key: str, data: bytes, content_type: str) -> None: ...
    async def delete(self, keys: list[str]) -> None:
        """Missing keys are not an error (deleting is idempotent: a retry is safe)."""
        ...
    async def signed_urls(self, keys: list[str], *, expires_in: int) -> dict[str, str]:
        """Short-lived absolute URLs. A key that cannot be signed is left out."""
        ...


@dataclass(frozen=True)
class PhotoKeys:
    thumb: str
    large: str


def photo_keys(user_id: int, point_id: int) -> PhotoKeys:
    """Fresh, unguessable keys for the two copies of a photo."""
    stem = f"corners/{user_id}/{point_id}/{uuid.uuid4().hex}"
    return PhotoKeys(thumb=f"{stem}-thumb.webp", large=f"{stem}-large.webp")


class SupabasePhotoStorage:
    def __init__(
        self, url: str, service_key: str, bucket: str, *, client: httpx.AsyncClient | None = None
    ) -> None:
        self._base = f"{url.rstrip('/')}/storage/v1"
        self._bucket = bucket
        # Both headers: the legacy service_role JWT is read from Authorization, the newer secret
        # keys (sb_secret_...) from apikey. Sending the same value in both works for either.
        self._headers = {"apikey": service_key, "Authorization": f"Bearer {service_key}"}
        self._client = client or httpx.AsyncClient(timeout=TIMEOUT)

    async def _send(self, method: str, url: str, **kwargs) -> httpx.Response:
        try:
            response = await self._client.request(
                method, url, headers={**self._headers, **kwargs.pop("headers", {})}, **kwargs
            )
        except httpx.HTTPError as exc:
            raise StorageError(f"storage unreachable ({type(exc).__name__})") from exc
        if response.status_code >= 400:
            raise StorageError(f"storage answered {response.status_code}")
        return response

    async def put(self, key: str, data: bytes, content_type: str) -> None:
        await self._send(
            "POST", f"{self._base}/object/{self._bucket}/{key}", content=data,
            headers={"Content-Type": content_type, "x-upsert": "false"},
        )

    async def delete(self, keys: list[str]) -> None:
        if not keys:
            return
        await self._send(
            "DELETE", f"{self._base}/object/{self._bucket}", json={"prefixes": keys}
        )

    async def signed_urls(self, keys: list[str], *, expires_in: int) -> dict[str, str]:
        if not keys:
            return {}
        response = await self._send(
            "POST", f"{self._base}/object/sign/{self._bucket}",
            json={"expiresIn": expires_in, "paths": keys},
        )
        try:
            items = response.json()
            return {
                item["path"]: f"{self._base}{item['signedURL']}"
                for item in items
                if item.get("signedURL")
            }
        except (ValueError, KeyError, TypeError, AttributeError) as exc:
            raise StorageError("unexpected answer signing URLs") from exc
