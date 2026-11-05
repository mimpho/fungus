"""Corner photos, image processing (feat/observatory-corners-photos): any input format in, two
WebP copies out (thumbnail ~600 px, large ~1200 px on the long side), EXIF orientation applied
and all metadata (GPS included) dropped. No network, no DB."""
import io

import pytest
from PIL import Image

from app.services.photo_images import (
    LARGE_PX,
    THUMB_PX,
    ImageTooLarge,
    InvalidImage,
    process_photo,
)

MAX_PIXELS = 60_000_000


def _encode(size=(2000, 1000), fmt="JPEG", color=(180, 90, 40), mode="RGB", **save):
    buf = io.BytesIO()
    Image.new(mode, size, color).save(buf, fmt, **save)
    return buf.getvalue()


def _open(data):
    img = Image.open(io.BytesIO(data))
    img.load()
    return img


def _gps_exif(orientation=1):
    exif = Image.Exif()
    exif[0x0112] = orientation
    exif.get_ifd(0x8825)[1] = "N"  # GPS IFD: latitude ref
    exif.get_ifd(0x8825)[2] = (41.0, 46.0, 28.0)
    return exif


class TestOutput:
    def test_it_returns_two_webp_copies_with_the_long_side_capped(self):
        out = process_photo(_encode((3000, 2000)), max_pixels=MAX_PIXELS)
        thumb, large = _open(out.thumb), _open(out.large)
        assert thumb.format == large.format == "WEBP"
        assert max(thumb.size) == THUMB_PX and max(large.size) == LARGE_PX
        assert (THUMB_PX, LARGE_PX) == (600, 1200)

    def test_the_aspect_ratio_is_kept(self):
        out = process_photo(_encode((3000, 1500)), max_pixels=MAX_PIXELS)
        assert _open(out.large).size == (1200, 600)

    def test_a_small_image_is_never_enlarged(self):
        out = process_photo(_encode((400, 300)), max_pixels=MAX_PIXELS)
        assert _open(out.thumb).size == _open(out.large).size == (400, 300)

    @pytest.mark.parametrize("fmt", ["PNG", "WEBP", "GIF", "BMP", "TIFF"])
    def test_common_formats_are_accepted(self, fmt):
        out = process_photo(_encode((900, 700), fmt), max_pixels=MAX_PIXELS)
        assert _open(out.large).format == "WEBP"

    def test_heic_is_accepted(self):
        from pillow_heif import register_heif_opener

        register_heif_opener()
        data = _encode((1500, 1000), "HEIF")
        out = process_photo(data, max_pixels=MAX_PIXELS)
        assert max(_open(out.large).size) == LARGE_PX

    def test_transparency_does_not_break_the_conversion(self):
        data = _encode((800, 600), "PNG", mode="RGBA", color=(0, 0, 0, 0))
        assert _open(process_photo(data, max_pixels=MAX_PIXELS).large).size == (800, 600)

    def test_a_palette_image_is_converted(self):
        data = _encode((800, 600), "GIF", mode="P", color=3)
        assert _open(process_photo(data, max_pixels=MAX_PIXELS).large).size == (800, 600)


class TestMetadata:
    def test_exif_orientation_is_applied(self):
        # Stored 2000x1000 with "rotate 90": it is a portrait photo
        data = _encode((2000, 1000), exif=_gps_exif(orientation=6))
        out = process_photo(data, max_pixels=MAX_PIXELS)
        w, h = _open(out.large).size
        assert h > w and h == LARGE_PX

    def test_gps_and_every_other_exif_tag_are_dropped(self):
        data = _encode((2000, 1000), exif=_gps_exif())
        assert _open(data).getexif().get_ifd(0x8825)  # the input does carry GPS
        out = process_photo(data, max_pixels=MAX_PIXELS)
        for copy in (out.thumb, out.large):
            img = _open(copy)
            assert len(img.getexif()) == 0 and not img.getexif().get_ifd(0x8825)
            assert b"Exif" not in copy


class TestRejected:
    def test_bytes_that_are_not_an_image(self):
        with pytest.raises(InvalidImage):
            process_photo(b"this is not a picture", max_pixels=MAX_PIXELS)

    def test_empty_bytes(self):
        with pytest.raises(InvalidImage):
            process_photo(b"", max_pixels=MAX_PIXELS)

    def test_a_truncated_file(self):
        with pytest.raises(InvalidImage):
            process_photo(_encode((3000, 2000))[:300], max_pixels=MAX_PIXELS)

    def test_more_pixels_than_the_limit_is_refused_before_decoding(self):
        with pytest.raises(ImageTooLarge):
            process_photo(_encode((4000, 3000)), max_pixels=10_000_000)

    def test_a_decompression_bomb_is_refused_even_far_over_the_limit(self):
        # 20000 x 20000 solid colour: a few KB on the wire, 400 Mpx once decoded
        data = _encode((20000, 20000), "PNG", color=(1, 2, 3))
        with pytest.raises(ImageTooLarge):
            process_photo(data, max_pixels=MAX_PIXELS)

    def test_zero_turns_the_pixel_limit_off(self):
        out = process_photo(_encode((4000, 3000)), max_pixels=0)
        assert max(_open(out.large).size) == LARGE_PX
