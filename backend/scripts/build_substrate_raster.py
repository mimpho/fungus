"""Build the substrate raster of the probability layer from the ICGC lithological groups map.

    cd backend
    python -m scripts.build_substrate_raster          # needs numpy

Reads the shapefile of the ICGC "Mapa de grups litològics de Catalunya 1:250.000" (CC BY 4.0;
download: https://datacloud.icgc.cat/datacloud/descarregues-web/bd/icgc_mgl250mv01_etrs89.zip,
unzipped into `../local-data/geology`) and the extent of the elevation raster, and writes
`../local-data/substrate/substrate-catalonia.bin` and `.json`: for every pixel the share of
each acidity class (acid, mixed, calcareous; see app/services/substrate_classes.py), one byte
each, class after class, on the same grid as the elevation and forest rasters.
"""
from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path

import numpy as np

from app.services.forest_raster import class_fractions, rasterize
from app.services.substrate_classes import SUBSTRATE_CLASSES, substrate_class
from scripts.mcsc_lookup import read_dbf, read_shp

SOURCE = "ICGC lithological groups 1:250,000 (CC BY 4.0)"
CELL_M = 100.0  # the map is 1:250,000: 100 m cells lose nothing


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--shp", default="../local-data/geology/mgl250mv01p_etrs89")
    ap.add_argument("--dem-meta", default="../public/data/elevation-catalonia.json")
    ap.add_argument("--out", default="../local-data/substrate")
    args = ap.parse_args(argv)

    dem = json.loads(Path(args.dem_meta).read_text())
    width, height, bounds = dem["width"], dem["height"], dem["bounds"]
    fields, rows = read_dbf(args.shp + ".dbf")
    chem_field = next(f for f in fields if f in ("QUIMISME", "CHEMISME"))
    shapes = read_shp(args.shp + ".shp")

    t0 = time.time()
    records, skipped = [], []
    for row, shape in zip(rows, shapes, strict=True):
        cls = substrate_class(row[chem_field])
        if cls is None or shape is None:
            skipped.append(row.get("EPI_LITO_1", "?"))
            continue
        records.append((shape[1], SUBSTRATE_CLASSES.index(cls) + 1))
    xs = [p[0] for rings, _ in records for ring in rings for p in ring[::50]]
    ys = [p[1] for rings, _ in records for ring in rings for p in ring[::50]]
    bbox = (min(xs) - 100, min(ys) - 100, max(xs) + 100, max(ys) + 100)
    _, lookup = rasterize(records, bbox, CELL_M)
    print(f"polygons rasterised in {time.time() - t0:.0f} s; left out: {skipped}")

    cls_of = np.array([255] + list(range(len(SUBSTRATE_CLASSES))), dtype=np.uint8)
    weight_of = np.array([0] + [1] * len(SUBSTRATE_CLASSES), dtype=np.float32)
    n = len(SUBSTRATE_CLASSES)
    data = class_fractions(lookup, cls_of, weight_of, n, bounds, width, height, 4)

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    (out / "substrate-catalonia.bin").write_bytes(data.tobytes())
    meta = {
        "version": 1, "source": SOURCE, "classes": list(SUBSTRATE_CLASSES), "width": width,
        "height": height, "bounds": bounds,
        "encoding": "uint8 share*255, class after class: [class][row][column]",
    }
    (out / "substrate-catalonia.json").write_text(json.dumps(meta, indent=1) + "\n")
    land = data.sum(axis=0) > 0
    for k, name in enumerate(SUBSTRATE_CLASSES):
        print(f"{name:11s} share of the pixels with data: {(data[k][land] / 255).mean():.3f}")
    print(f"written to {out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
