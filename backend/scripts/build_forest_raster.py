"""Build the forest raster of the probability layer from the MCSC-4 grid.

    cd backend
    python -m scripts.build_forest_raster          # needs numpy: pip install numpy

Reads `../local-data/mcsc-grid` (see mcsc_preprocess) and the extent of the elevation raster
(`../public/data/elevation-catalonia.json`), and writes `../local-data/forest/forest-catalonia.bin`
and `.json`. These files derive from CREAF data whose licence is unconfirmed: they stay in
`local-data/` (never committed, never in `public/`) and the API serves them behind login.
"""
from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path

from app.services.forest_classes import CLASSES
from app.services.forest_raster import forest_fractions, load_tiles

SOURCE = "CREAF MCSC-4 (2009), 25 m grid"


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--grid", default="../local-data/mcsc-grid")
    ap.add_argument("--dem-meta", default="../public/data/elevation-catalonia.json")
    ap.add_argument("--out", default="../local-data/forest")
    args = ap.parse_args(argv)

    dem = json.loads(Path(args.dem_meta).read_text())
    width, height, bounds = dem["width"], dem["height"], dem["bounds"]
    tiles, codes = load_tiles(args.grid)
    print(f"{len(tiles)} tiles, {len(codes)} codes, raster {width}x{height}")
    t0 = time.time()
    data = forest_fractions(tiles, codes, bounds, width, height)
    print(f"aggregated in {time.time() - t0:.0f} s")

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    (out / "forest-catalonia.bin").write_bytes(data.tobytes())
    meta = {
        "version": 1, "source": SOURCE, "classes": list(CLASSES), "width": width,
        "height": height, "bounds": bounds,
        "encoding": "uint8 share*255, class after class: [class][row][column]",
    }
    (out / "forest-catalonia.json").write_text(json.dumps(meta, indent=1) + "\n")
    land = (data.sum(axis=0) > 0)
    for k, name in enumerate(CLASSES):
        print(f"{name:9s} mean share where there is forest data: "
              f"{data[k][land].mean() / 255:.3f}  ({(data[k] > 25).sum()} px with >10 %)")
    print(f"written to {out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
