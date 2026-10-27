"""Corner photos: turn whatever the user uploads into two WebP copies.

The original is only read to generate the copies and is never kept. Both copies have the EXIF
orientation applied and no metadata at all (GPS included: a photo of a mushroom spot must not
leak where it was taken). HEIC is accepted through pillow-heif. Pure CPU work on bytes: callers
run it in a worker thread.
"""
import io
from dataclasses import dataclass

from PIL import Image, ImageOps, UnidentifiedImageError
from pillow_heif import register_heif_opener

register_heif_opener()

THUMB_PX = 600  # long side
LARGE_PX = 1200
WEBP_QUALITY = 82
CONTENT_TYPE = "image/webp"


class InvalidImage(Exception):
    """Not an image Pillow can read (or a truncated one)."""


class ImageTooLarge(Exception):
    """More pixels than the configured limit (checked from the header, before decoding)."""


@dataclass(frozen=True)
class ProcessedPhoto:
    thumb: bytes
    large: bytes


def _fit(img: Image.Image, long_side: int) -> Image.Image:
    """A copy with the long side at most `long_side` (never enlarged)."""
    copy = img.copy()
    copy.thumbnail((long_side, long_side), Image.Resampling.LANCZOS)
    return copy


def _webp(img: Image.Image) -> bytes:
    buf = io.BytesIO()
    # No exif= / xmp=: nothing from the source is carried over
    img.save(buf, "WEBP", quality=WEBP_QUALITY, method=4)
    return buf.getvalue()


def process_photo(data: bytes, *, max_pixels: int) -> ProcessedPhoto:
    """Thumbnail (~600 px) and large (~1200 px) WebP copies. `max_pixels` 0 = no limit.

    Raises InvalidImage (unreadable or truncated) or ImageTooLarge."""
    if not data:
        raise InvalidImage("empty file")
    try:
        with Image.open(io.BytesIO(data)) as img:
            width, height = img.size  # from the header: nothing decoded yet
            if max_pixels and width * height > max_pixels:
                raise ImageTooLarge(f"{width}x{height} px exceeds {max_pixels}")
            img.load()
            oriented = ImageOps.exif_transpose(img)
            if oriented.mode not in ("RGB", "RGBA"):
                oriented = oriented.convert("RGBA" if "transparency" in oriented.info else "RGB")
            # Drop the metadata the source carried; the pixels are all that is kept
            clean = Image.new(oriented.mode, oriented.size)
            clean.paste(oriented)
    except (ImageTooLarge, InvalidImage):
        raise
    except Image.DecompressionBombError as exc:
        raise ImageTooLarge(str(exc)) from exc
    except (UnidentifiedImageError, OSError, SyntaxError, ValueError) as exc:
        raise InvalidImage(str(exc)) from exc
    return ProcessedPhoto(
        thumb=_webp(_fit(clean, THUMB_PX)), large=_webp(_fit(clean, LARGE_PX))
    )
