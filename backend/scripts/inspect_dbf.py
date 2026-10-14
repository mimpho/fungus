"""Inspect a shapefile's .dbf (stdlib only): fields, distinct values, species-like classes.

    python3 backend/scripts/inspect_dbf.py ~/Downloads/mcsc_test          # folder or .dbf
    python3 backend/scripts/inspect_dbf.py sheet.mmz   # .mmz/.zip: unzipped to temp
    python3 backend/scripts/inspect_dbf.py file.dbf --top 40
"""

from __future__ import annotations

import argparse
import glob
import os
import struct
import sys
import tempfile
import zipfile
from collections import Counter

KEYWORDS = ("pi blanc", "pinastre", "pinassa", "pi roig", "pi negre", "pi pinyer", "avet",
            "alzin", "sureda", "fag", "castany", "bedoll", "roure", "freix", "avellan",
            "pineda", "pinus", "quercus", "fagus", "abies")


def read_dbf(path: str):
    with open(path, "rb") as fh:
        head = fh.read(32)
        nrec, hlen, rlen = struct.unpack("<IHH", head[4:12])
        fields = []
        while True:
            desc = fh.read(32)
            if not desc or desc[0] == 0x0D:
                break
            name = desc[:11].split(b"\x00")[0].decode("ascii", "replace")
            fields.append((name, chr(desc[11]), desc[16]))
        fh.seek(hlen)
        rows = []
        for _ in range(nrec):
            rec = fh.read(rlen)
            if not rec or rec[0:1] == b"*":
                continue
            pos, row = 1, {}
            for name, _t, size in fields:
                raw = rec[pos:pos + size]
                pos += size
                try:
                    row[name] = raw.decode("utf-8").strip()
                except UnicodeDecodeError:
                    row[name] = raw.decode("latin-1").strip()
            rows.append(row)
    return fields, rows


def unpack(path: str, dest: str) -> list[str]:
    """Extract a .mmz/.zip (a MiraMon map is a ZIP) safely; return the files inside."""
    out = []
    with zipfile.ZipFile(path) as zf:
        for info in zf.infolist():
            target = os.path.realpath(os.path.join(dest, info.filename))
            if not target.startswith(os.path.realpath(dest) + os.sep) or info.is_dir():
                continue
            zf.extract(info, dest)
            out.append(info.filename)
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("path", help=".dbf file or a folder containing one")
    ap.add_argument("--top", type=int, default=25)
    args = ap.parse_args()
    path = os.path.expanduser(args.path)
    if path.lower().endswith((".mmz", ".zip")):
        dest = tempfile.mkdtemp(prefix="mmz_")
        names = unpack(path, dest)
        print(f"{path}: {len(names)} files unpacked to {dest}")
        print("  " + ", ".join(sorted(names)[:40]))
        path = dest
    files = [path] if path.lower().endswith(".dbf") else sorted(
        glob.glob(os.path.join(path, "**", "*.dbf"), recursive=True))
    if os.path.isdir(path):
        zips = glob.glob(os.path.join(path, "*.mmz")) + glob.glob(os.path.join(path, "*.zip"))
        for z in sorted(zips):
            dest = tempfile.mkdtemp(prefix="mmz_")
            unpack(z, dest)
            files += sorted(glob.glob(os.path.join(dest, "**", "*.dbf"), recursive=True))
    if not files:
        print("No .dbf found; send me the file list printed above")
        return 1
    for f in files:
        fields, rows = read_dbf(f)
        print(f"\n=== {f}: {len(rows)} records, {len(fields)} fields")
        print("fields:", ", ".join(f"{n}({t}{s})" for n, t, s in fields))
        for name, t, _s in fields:
            if t != "C":
                continue
            counts = Counter(r[name] for r in rows)
            if len(counts) > 400:
                continue
            hits = [v for v in counts if any(k in v.lower() for k in KEYWORDS)]
            print(f"\n-- {name}: {len(counts)} distinct; species-like: {len(hits)}")
            for val, n in counts.most_common(args.top):
                print(f"   {n:7} {val[:90]}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
