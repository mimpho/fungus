"""Preprocess CREAF MCSC-4 sheets (shapefiles) into the 25 m tile grid used by the API.

    cd backend
    python -m scripts.mcsc_preprocess --dirs ../local-data/mcsc --out ../local-data/mcsc-grid

Every `.shp` under the folders is read (UTM 31N required, field C_SIMPLE). The code table is
shared by all sheets; where sheets overlap the first one in name order keeps the cell. The
output (tiles + manifest.json) is deterministic. Never commit the sheets or the tiles: the
licence is unconfirmed (see memory/decisions.md).
"""

from __future__ import annotations

import argparse
import sys
from collections.abc import Sequence
from pathlib import Path

from app.services.mcsc_grid import MANIFEST, GridBuilder, build_code_table, write_grid
from scripts.mcsc_lookup import read_dbf, read_shp

CODE_FIELD = "C_SIMPLE"


def find_sheets(dirs: Sequence[str | Path]) -> list[Path]:
    found = {p for d in dirs for p in Path(d).expanduser().glob("**/*.shp")}
    return sorted(found, key=lambda p: (p.stem, str(p)))


def is_utm31n(prj_text: str) -> bool:
    upper = prj_text.upper()
    return "UTM" in upper and "31" in upper


def _codes(dbf: Path) -> list[str]:
    _, rows = read_dbf(str(dbf))
    return [(row.get(CODE_FIELD) or "").strip() for row in rows]


def build_grid(
    dirs: Sequence[str | Path], out_dir: str | Path, overwrite: bool = False
) -> dict:
    sheets = find_sheets(dirs)
    if not sheets:
        raise ValueError(f"no .shp files found in {', '.join(map(str, dirs))}")
    out = Path(out_dir)
    if (out / MANIFEST).exists() and not overwrite:
        raise FileExistsError(f"{out} already holds a grid; pass overwrite=True / --overwrite")
    for shp in sheets:
        prj = shp.with_suffix(".prj")
        if prj.exists() and not is_utm31n(prj.read_text(encoding="latin-1")):
            raise ValueError(f"{shp.name}: .prj is not UTM 31N (ETRS89); refusing to continue")

    table = build_code_table(c for shp in sheets for c in _codes(shp.with_suffix(".dbf")) if c)
    builder = GridBuilder(table)
    polygons = skipped = 0
    for shp in sheets:
        codes = _codes(shp.with_suffix(".dbf"))
        shapes = read_shp(str(shp))
        if len(codes) != len(shapes):
            raise ValueError(f"{shp.name}: {len(shapes)} shapes but {len(codes)} records")
        for shape, code in zip(shapes, codes, strict=True):
            if shape is None or not code:
                skipped += 1
                continue
            builder.fill_polygon(shape[1], code)
            polygons += 1
    if out.exists():  # a rebuild must not leave tiles from an older run
        for stale in out.glob("*.lzma"):
            stale.unlink()
    tiles = write_grid(builder, out, meta={"sheets": [s.stem for s in sheets]})
    size = sum(f.stat().st_size for f in out.glob("*.lzma"))
    return {
        "sheets": len(sheets), "polygons": polygons, "skipped": skipped,
        "codes": len(table.codes), "tiles": tiles, "bytes": size,
        "bytes_per_cell": table.bytes_per_cell,
    }


def main(argv: Sequence[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--dirs", nargs="+", required=True, help="folders with the unzipped sheets")
    ap.add_argument("--out", required=True, help="folder for the tiles and manifest.json")
    ap.add_argument("--overwrite", action="store_true", help="replace an existing grid")
    args = ap.parse_args(argv)
    summary = build_grid(args.dirs, args.out, overwrite=args.overwrite)
    print(", ".join(f"{k}={v}" for k, v in summary.items()))
    return 0


if __name__ == "__main__":
    sys.exit(main())
