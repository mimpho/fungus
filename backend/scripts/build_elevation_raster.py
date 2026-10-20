"""
Elevation map of Catalonia for the probability layer (7b). Run once; the app never runs it.

Reads the Copernicus DEM GLO-30 (30 m) tiles that cover Catalonia, reduces them to a coarse
grid (~250 m) and writes two small files for the browser:

    public/data/elevation-catalonia.bin    elevation of every pixel, one byte each
    public/data/elevation-catalonia.json   where the grid sits and how to read it

The map is never drawn. The front reads the elevation of each pixel from it and gives the pixel
the score of the matching elevation band (see app/services/layer_probability.py).

Encoding: one unsigned byte per pixel, row by row from the north-west corner,
    elevation in metres = byte * 16        (so +-8 m; the sea and anything below 0 is 0)
Raw bytes, not an image: a browser canvas can alter the colours it reads back (some privacy
settings do it on purpose), which would corrupt an elevation hidden in a picture.

Needs: pip install rasterio numpy   (only for this script, not for the backend)

Usage (from backend/):
    python -m scripts.build_elevation_raster --check     # do the 12 tiles exist? (no download)
    python -m scripts.build_elevation_raster             # build the files
    python -m scripts.build_elevation_raster --source ./tiles   # tiles already on disk

The tiles are read from the public Copernicus DEM bucket without an account. Only the reduced
version of each tile is fetched (they are cloud-optimised GeoTIFFs with overviews).
Licence and attribution of the Copernicus DEM: to be confirmed before publishing.
"""
import argparse
import json
import math
import sys
import urllib.error
import urllib.request
from pathlib import Path

DEFAULT_SOURCE = "https://copernicus-dem-30m.s3.amazonaws.com"
OUT_DIR = Path(__file__).resolve().parents[2] / "public" / "data"
OUT_NAME = "elevation-catalonia"

# Tiles are 1 x 1 degree and named by their south-west corner. These twelve cover Catalonia
# (latitude 40.5-42.9, longitude 0.15-3.35, see src/lib/catalonia.js).
LAT_TILES = (40, 41, 42)
LON_TILES = (0, 1, 2, 3)
TOP, LEFT = 43.0, 0.0  # north and west edge of the twelve tiles
# What is kept of them: Catalonia's box with a small margin
KEEP_LAT = (40.45, 42.95)
KEEP_LON = (0.10, 3.40)

# A few well-known summits and places to compare by eye (each pixel is an average of ~250 m,
# so peaks come out lower than their summit height)
CHECK_POINTS = [
    ("Puigmal (2,910 m)", 42.3833, 2.1167),
    ("Sant Jeroni, Montserrat (1,236 m)", 41.6061, 1.8115),
    ("Turo de l'Home, Montseny (1,706 m)", 41.7746, 2.4376),
    ("Barcelona centre (~15 m)", 41.3874, 2.1686),
    ("Mar (0 m)", 41.0, 3.0),
]


def tile_name(lat: int, lon: int) -> str:
    return f"Copernicus_DSM_COG_10_N{lat:02d}_00_E{lon:03d}_00_DEM"


def tile_location(source: str, lat: int, lon: int) -> str:
    """URL (for GDAL) or path of one tile."""
    name = tile_name(lat, lon)
    if source.startswith(("http://", "https://")):
        return f"/vsicurl/{source.rstrip('/')}/{name}/{name}.tif"
    return str(Path(source) / f"{name}.tif")


def all_tiles() -> list[tuple[int, int]]:
    return [(la, lo) for la in LAT_TILES for lo in LON_TILES]


def check(source: str) -> int:
    """Ask the server (or the disk) whether each tile exists. Nothing is downloaded."""
    missing = 0
    for la, lo in all_tiles():
        loc = tile_location(source, la, lo)
        if source.startswith(("http://", "https://")):
            url = loc.removeprefix("/vsicurl/")
            try:
                req = urllib.request.Request(url, method="HEAD")
                with urllib.request.urlopen(req, timeout=20) as r:
                    size = int(r.headers.get("Content-Length", 0)) / 1e6
                    status = f"{r.status} ({size:.0f} MB)"
            except urllib.error.HTTPError as exc:
                status = f"{exc.code}"
                missing += 1
            except OSError as exc:
                status = f"error: {exc}"
                missing += 1
        else:
            ok = Path(loc).exists()
            status = "found" if ok else "missing"
            missing += 0 if ok else 1
        print(f"  {tile_name(la, lo)}: {status}")
    total = len(all_tiles())
    print(f"{total - missing} of {total} tiles reachable. A tile that is only sea may "
          "legitimately not exist; it is filled with 0.")
    return 0 if missing < len(all_tiles()) else 1


def build_mosaic(source: str, rows: int, cols: int):
    """Elevation (uint16, metres) of the twelve tiles, `rows` x `cols` pixels per degree."""
    import numpy as np
    import rasterio
    from rasterio.enums import Resampling

    mosaic = np.zeros((len(LAT_TILES) * rows, len(LON_TILES) * cols), dtype=np.uint16)
    env = rasterio.Env(
        GDAL_DISABLE_READDIR_ON_OPEN="EMPTY_DIR",
        CPL_VSIL_CURL_ALLOWED_EXTENSIONS=".tif",
        GDAL_HTTP_MAX_RETRY="3",
        GDAL_HTTP_RETRY_DELAY="2",
    )
    with env:
        for la, lo in all_tiles():
            loc = tile_location(source, la, lo)
            top = (TOP - (la + 1)) * rows
            left = (lo - LEFT) * cols
            try:
                with rasterio.open(loc) as src:
                    b = src.bounds
                    if abs(b.left - lo) > 0.01 or abs(b.bottom - la) > 0.01:
                        print(f"  warning: {tile_name(la, lo)} covers {tuple(b)}, expected "
                              f"[{lo}, {la}, {lo + 1}, {la + 1}]")
                    data = src.read(
                        1, out_shape=(rows, cols), resampling=Resampling.average, masked=True
                    )
                data = np.ma.filled(data.astype("float32"), 0.0)
                state = "ok"
            except rasterio.errors.RasterioIOError as exc:
                why = str(exc).splitlines()[0]
                print(f"  {tile_name(la, lo)}: not read ({why}); filled with 0")
                data, state = np.zeros((rows, cols), dtype="float32"), "empty"
            mosaic[int(top):int(top) + rows, int(left):int(left) + cols] = np.clip(
                np.rint(data), 0, 65535
            ).astype(np.uint16)
            print(f"  {tile_name(la, lo)}: {state}")
    return mosaic


def crop(mosaic, rows: int, cols: int):
    """Keep Catalonia's box; return the cut and its exact bounds."""
    r0 = math.floor((TOP - KEEP_LAT[1]) * rows)
    r1 = math.ceil((TOP - KEEP_LAT[0]) * rows)
    c0 = math.floor((KEEP_LON[0] - LEFT) * cols)
    c1 = math.ceil((KEEP_LON[1] - LEFT) * cols)
    bounds = {
        "north": round(TOP - r0 / rows, 6), "south": round(TOP - r1 / rows, 6),
        "west": round(LEFT + c0 / cols, 6), "east": round(LEFT + c1 / cols, 6),
    }
    return mosaic[r0:r1, c0:c1], bounds


STEP_M = 16  # metres per byte: 255 * 16 = 4,080 m, above Catalonia's highest ground


def encode_bytes(elev):
    """Elevation in metres (uint16) to one byte per pixel."""
    import numpy as np

    return np.clip(np.rint(elev / STEP_M), 0, 255).astype(np.uint8)


def sample(elev, bounds: dict, lat: float, lon: float) -> int:
    h, w = elev.shape
    row = int((bounds["north"] - lat) / (bounds["north"] - bounds["south"]) * h)
    col = int((lon - bounds["west"]) / (bounds["east"] - bounds["west"]) * w)
    return int(elev[min(max(row, 0), h - 1), min(max(col, 0), w - 1)])


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawTextHelpFormatter)
    ap.add_argument("--source", default=DEFAULT_SOURCE,
                    help="base URL of the Copernicus DEM bucket, or a folder with the .tif tiles")
    ap.add_argument("--check", action="store_true", help="only check that the tiles exist")
    ap.add_argument("--rows", type=int, default=444, help="pixels per degree of latitude (~250 m)")
    ap.add_argument("--cols", type=int, default=333, help="pixels per degree of longitude (~250 m)")
    ap.add_argument("--out", type=Path, default=OUT_DIR, help="output folder")
    args = ap.parse_args()

    if args.check:
        return check(args.source)

    print(f"Reading {len(all_tiles())} tiles from {args.source} ...")
    mosaic = build_mosaic(args.source, args.rows, args.cols)
    elev, bounds = crop(mosaic, args.rows, args.cols)

    args.out.mkdir(parents=True, exist_ok=True)
    binary, meta = args.out / f"{OUT_NAME}.bin", args.out / f"{OUT_NAME}.json"
    coded = encode_bytes(elev)
    binary.write_bytes(coded.tobytes())
    height, width = elev.shape
    lat_m = (bounds["north"] - bounds["south"]) * 111_320 / height
    mid_lat = (bounds["north"] + bounds["south"]) / 2
    lon_m = (bounds["east"] - bounds["west"]) * 111_320 * math.cos(math.radians(mid_lat)) / width
    meta.write_text(json.dumps({
        "version": 1,
        "source": "Copernicus DEM GLO-30, averaged to a coarser grid",
        "encoding": "uint8, row-major from the north-west corner; elevation_m = byte * step_m",
        "step_m": STEP_M,
        "bounds": bounds,
        "width": width,
        "height": height,
        "pixel_size_m": [round(lon_m), round(lat_m)],
    }, indent=2) + "\n")

    print(f"\nWrote {binary} ({binary.stat().st_size / 1e6:.2f} MB) and {meta.name}")
    print(f"Size {width} x {height}, pixel ~{lon_m:.0f} x {lat_m:.0f} m, "
          f"elevation {int(elev.min())}-{int(elev.max())} m")
    print("Sanity check (compare by eye; a pixel averages ~250 m, so peaks come out lower):")
    for name, la, lo in CHECK_POINTS:
        print(f"  {name}: {sample(coded.astype(int) * STEP_M, bounds, la, lo)} m")
    return 0


if __name__ == "__main__":
    sys.exit(main())
