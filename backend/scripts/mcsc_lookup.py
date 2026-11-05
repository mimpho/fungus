"""Look up the MCSC-4 (CREAF 2009) land cover class at a coordinate. Stdlib only.

Reads the shapefile sheets downloaded from mcsc.creaf.cat (map-mcscshp4.htm): polygons in
36411.shp + 36411.dbf (field C_SIMPLE holds the level-5 code: bqi20 = alzinar >= 20% cover...).

    python3 backend/scripts/mcsc_lookup.py --dirs ~/Downloads/36411 ~/Downloads/36412 \
        --lat 41.7745 --lon 2.435
    python3 backend/scripts/mcsc_lookup.py --dirs ~/Downloads/36411 ~/Downloads/36412 \
        --csv zones_curated.csv --out mcsc_check.csv
    python3 backend/scripts/mcsc_lookup.py --selftest        # no data needed

Coordinates are WGS84 lat/lon; they are projected to UTM 31N (ETRS89, EPSG:25831), which is
what the sheets use (the .prj is checked and a warning is printed otherwise).
"""

from __future__ import annotations

import argparse
import csv
import glob
import math
import os
import re
import struct
import sys
import tempfile

# code (without the 20 / 5 canopy suffix) -> (Catalan name, macrotype)
FOREST = {
    "bqi": ("Alzinar", "esclerofilo"),
    "bqh": ("Roureda de roure martinenc", "caducifolio"),
    "bps": ("Pineda de pi roig", "conifera"),
    "bpp": ("Pineda de pi pinyer", "conifera"),
    "bqs": ("Sureda (Quercus suber; inferred code)", "esclerofilo"),
    "bqp": ("Roureda de roure penol (Quercus pubescens; inferred code)", "caducifolio"),
    "bph": ("Pineda de pi blanc", "conifera"),
    "bfs": ("Fageda (Fagus sylvatica; assumed, not in the legend text)", "caducifolio"),
    "bribc": ("Bosc caducifoli de ribera", "caducifolio"),
    "bcad": ("Altres caducifolis", "caducifolio"),
}
OTHER = {
    "m": "Matollars", "r": "Roquissars", "p": "Prats i herbassars", "ch": "Altres conreus herbacis",
    "chr": "Conreus herbacis de regadiu", "mel": "Matollars en linies electriques",
    "pel": "Prats en linies electriques", "t": "Tarteres", "mr": "Matollars de ribera",
    "wb": "Basses agricoles", "ppo": "Plantacions de pollancres", "nna": "Sol nu antropic",
}
# stored zone forest_type -> species codes that count as a species match
EXPECTED = {
    "pinar": {"bps", "bpp", "bph"}, "encinar": {"bqi"}, "robledal": {"bqh", "bqp"},
    "hayedo": {"bfs"},
}
EXPECTED_MACRO = {"pinar": "conifera", "encinar": "esclerofilo", "robledal": "caducifolio",
                  "hayedo": "caducifolio"}
OFFSETS = ((0, 0), (150, 0), (-150, 0), (0, 150), (0, -150))  # metres east, north


def decode(code: str) -> dict:
    base = re.sub(r"\d+$", "", code)
    cover = re.search(r"(\d+)$", code)
    if base in FOREST:
        name, macro = FOREST[base]
        return {"code": code, "base": base, "name": name, "macro": macro,
                "cover": cover.group(1) if cover else "", "forest": True}
    if base.startswith("b") and base not in OTHER:  # a forest-style code we do not know yet
        return {"code": code, "base": base, "name": f"{code} (code not in dictionary)",
                "macro": "bosque_otro", "cover": "", "forest": True}
    return {"code": code, "base": base, "name": OTHER.get(code, code), "macro": "no_bosque",
            "cover": "", "forest": False}


# ---- projection: WGS84 lat/lon -> UTM 31N -------------------------------------------------
def to_utm31(lat: float, lon: float) -> tuple[float, float]:
    a, f, k0, lon0 = 6378137.0, 1 / 298.257222101, 0.9996, math.radians(3.0)
    n = f / (2 - f)
    big_a = a / (1 + n) * (1 + n * n / 4 + n ** 4 / 64)
    alpha = (n / 2 - 2 * n ** 2 / 3 + 5 * n ** 3 / 16, 13 * n ** 2 / 48 - 3 * n ** 3 / 5,
             61 * n ** 3 / 240)
    phi, dl = math.radians(lat), math.radians(lon) - lon0
    c = 2 * math.sqrt(n) / (1 + n)
    t = math.sinh(math.atanh(math.sin(phi)) - c * math.atanh(c * math.sin(phi)))
    xi = math.atan2(t, math.cos(dl))
    eta = math.atanh(math.sin(dl) / math.sqrt(1 + t * t))
    x = eta + sum(al * math.cos(2 * (j + 1) * xi) * math.sinh(2 * (j + 1) * eta)
                  for j, al in enumerate(alpha))
    y = xi + sum(al * math.sin(2 * (j + 1) * xi) * math.cosh(2 * (j + 1) * eta)
                 for j, al in enumerate(alpha))
    return 500000.0 + k0 * big_a * x, k0 * big_a * y


# ---- shapefile + dbf readers --------------------------------------------------------------
def read_shp(path: str) -> list[tuple[tuple[float, float, float, float], list[list]] | None]:
    """One entry per record: (bbox, rings) or None for null shapes. Polygon types 5/15/25."""
    out = []
    with open(path, "rb") as fh:
        data = fh.read()
    pos = 100
    while pos + 8 <= len(data):
        length = struct.unpack(">i", data[pos + 4:pos + 8])[0] * 2
        rec = data[pos + 8:pos + 8 + length]
        pos += 8 + length
        shape_type = struct.unpack("<i", rec[:4])[0]
        if shape_type == 0:
            out.append(None)
            continue
        if shape_type not in (5, 15, 25):
            raise ValueError(f"unsupported shape type {shape_type} (expected polygons)")
        bbox = struct.unpack("<4d", rec[4:36])
        nparts, npoints = struct.unpack("<2i", rec[36:44])
        parts = list(struct.unpack(f"<{nparts}i", rec[44:44 + 4 * nparts]))
        off = 44 + 4 * nparts
        pts = struct.unpack(f"<{2 * npoints}d", rec[off:off + 16 * npoints])
        coords = list(zip(pts[0::2], pts[1::2]))
        parts.append(npoints)
        out.append((bbox, [coords[parts[i]:parts[i + 1]] for i in range(nparts)]))
    return out


def read_dbf(path: str) -> tuple[list[str], list[dict]]:
    with open(path, "rb") as fh:
        head = fh.read(32)
        nrec, hlen, rlen = struct.unpack("<IHH", head[4:12])
        fields = []
        while True:
            desc = fh.read(32)
            if not desc or desc[0] == 0x0D:
                break
            fields.append((desc[:11].split(b"\x00")[0].decode("ascii", "replace"), desc[16]))
        fh.seek(hlen)
        rows = []
        for _ in range(nrec):
            rec = fh.read(rlen)
            pos, row = 1, {}
            for name, size in fields:
                row[name] = rec[pos:pos + size].decode("latin-1").strip()
                pos += size
            rows.append(row)
    return [n for n, _ in fields], rows


def inside(x: float, y: float, rings: list[list]) -> bool:
    """Even-odd rule over all rings, so holes work."""
    hit = False
    for ring in rings:
        j = len(ring) - 1
        for i in range(len(ring)):
            xi, yi = ring[i]
            xj, yj = ring[j]
            if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi:
                hit = not hit
            j = i
    return hit


class Sheet:
    def __init__(self, shp_path: str):
        self.name = os.path.splitext(os.path.basename(shp_path))[0]
        base = os.path.splitext(shp_path)[0]
        self.shapes = read_shp(shp_path)
        _, self.rows = read_dbf(base + ".dbf")
        if len(self.rows) != len(self.shapes):
            print(f"warning: {self.name}: {len(self.shapes)} shapes vs {len(self.rows)} rows")
        prj = base + ".prj"
        if os.path.exists(prj):
            text = open(prj, encoding="latin-1").read()
            if "31" not in text or ("UTM" not in text.upper() and "25831" not in text):
                print(f"warning: {self.name}: .prj is not UTM 31N, results may be wrong:\n"
                      f"  {text[:200]}")
        boxes = [s[0] for s in self.shapes if s]
        self.bbox = (min(b[0] for b in boxes), min(b[1] for b in boxes),
                     max(b[2] for b in boxes), max(b[3] for b in boxes))

    def find(self, x: float, y: float) -> dict | None:
        b = self.bbox
        if not (b[0] <= x <= b[2] and b[1] <= y <= b[3]):
            return None
        for shape, row in zip(self.shapes, self.rows):
            if shape and shape[0][0] <= x <= shape[0][2] and shape[0][1] <= y <= shape[0][3]:
                if inside(x, y, shape[1]):
                    return row
        return None


def load_sheets(dirs: list[str]) -> list[Sheet]:
    sheets = []
    for d in dirs:
        for shp in sorted(glob.glob(os.path.join(os.path.expanduser(d), "**", "*.shp"),
                                    recursive=True)):
            sheets.append(Sheet(shp))
    return sheets


def lookup(sheets: list[Sheet], lat: float, lon: float) -> dict | None:
    x, y = to_utm31(lat, lon)
    for sheet in sheets:
        row = sheet.find(x, y)
        if row is not None:
            code = row.get("C_SIMPLE") or row.get("CODI_FUSIO") or ""
            res = decode(code)
            res["sheet"] = sheet.name
            return res
    return None


def judge(res: dict | None, expected: str) -> str:
    if res is None:
        return "no_sheet"
    want = EXPECTED.get(expected.strip().lower())
    if want is None:
        return "no_type"
    if not res["forest"]:
        return "no_forest"
    if res["base"] in want:
        return "species_match"
    if res["macro"] == EXPECTED_MACRO[expected.strip().lower()]:
        return "macro_match"
    return "mismatch"


def nearby_hit(sheets: list[Sheet], lat: float, lon: float, expected: str) -> str:
    """First of the 4 sample points 150 m away whose species matches the expected type."""
    want = EXPECTED.get(expected.strip().lower(), set())
    x, y = to_utm31(lat, lon)
    for dx, dy in OFFSETS[1:]:
        for sh in sheets:
            row = sh.find(x + dx, y + dy)
            if row is not None:
                if decode(row.get("C_SIMPLE", ""))["base"] in want:
                    return row["C_SIMPLE"]
                break
    return ""


def composition(sheets: list[Sheet], lat: float, lon: float, radius: float,
                step: float) -> dict[str, float]:
    """Share (0-1) of each class on a regular grid of points within `radius` metres."""
    x0, y0 = to_utm31(lat, lon)
    counts: dict[str, int] = {}
    total = 0
    n = int(radius // step)
    for i in range(-n, n + 1):
        for j in range(-n, n + 1):
            if math.hypot(i * step, j * step) > radius:
                continue
            for sh in sheets:
                row = sh.find(x0 + i * step, y0 + j * step)
                if row is not None:
                    code = decode(row.get("C_SIMPLE") or row.get("CODI_FUSIO") or "")
                    key = code["base"] if code["forest"] else "(no bosque)"
                    counts[key] = counts.get(key, 0) + 1
                    total += 1
                    break
    return {k: v / total for k, v in sorted(counts.items(), key=lambda kv: -kv[1])} if total else {}


def fmt_comp(comp: dict[str, float], min_share: float) -> str:
    parts = []
    for k, v in comp.items():
        if v >= min_share:
            label = FOREST[k][0].split(" (")[0] if k in FOREST else k
            parts.append(f"{label} {v:.0%}")
    return "; ".join(parts)


def run_csv(sheets: list[Sheet], path: str, out: str, radius: float = 0, step: float = 50,
            min_share: float = 0.10) -> None:
    rows = []
    with open(path, newline="", encoding="utf-8") as fh:
        for r in csv.DictReader(fh):
            lat, lon = float(r["lat"]), float(r["lon"])
            res = lookup(sheets, lat, lon)
            x, y = to_utm31(lat, lon)
            around = []
            for dx, dy in OFFSETS[1:]:
                s2 = None
                for sh in sheets:
                    s2 = sh.find(x + dx, y + dy)
                    if s2 is not None:
                        break
                around.append((s2 or {}).get("C_SIMPLE", "-"))
            verdict = judge(res, r["expected"])
            if verdict in ("mismatch", "macro_match", "no_forest") and nearby_hit(
                    sheets, lat, lon, r["expected"]):
                verdict = "nearby_match"
            rows.append({"name": r["name"], "lat": lat, "lon": lon, "expected": r["expected"],
                         "sheet": res["sheet"] if res else "", "code": res["code"] if res else "",
                         "class": res["name"] if res else "", "verdict": verdict,
                         "around": " ".join(around)})
            if radius and res is not None:
                comp = composition(sheets, lat, lon, radius, step)
                rows[-1]["composition"] = fmt_comp(comp, min_share)
            print(f"{verdict:14} {r['name'][:38]:38} {r['expected']:9} "
                  f"{(res or {}).get('code', '-'):9} around: {' '.join(around)}")
            if radius and res is not None:
                print(f"{'':14}   composition {radius:.0f} m: {rows[-1]['composition']}")
    if rows:
        with open(out, "w", newline="", encoding="utf-8") as fh:
            cols = list(dict.fromkeys(k for r in rows for k in r))
            w = csv.DictWriter(fh, fieldnames=cols, restval="")
            w.writeheader()
            w.writerows(rows)
    tally: dict[str, int] = {}
    for r in rows:
        tally[r["verdict"]] = tally.get(r["verdict"], 0) + 1
    print(f"\n{tally}\nWritten to {out}")


def selftest() -> int:
    e, n = to_utm31(0.0, 3.0)
    assert abs(e - 500000) < 1e-3 and abs(n) < 1e-3, (e, n)
    e, n = to_utm31(41.3874, 2.1686)  # Barcelona centre, approx 430.3 km E, 4582.0 km N
    assert abs(e - 430300) < 1500 and abs(n - 4582000) < 1500, (e, n)
    sq = [(0, 0), (0, 10), (10, 10), (10, 0), (0, 0)]
    hole = [(4, 4), (6, 4), (6, 6), (4, 6), (4, 4)]
    assert inside(2, 2, [sq, hole]) and not inside(5, 5, [sq, hole]) and not inside(11, 5, [sq])
    assert decode("bqi20")["macro"] == "esclerofilo" and decode("bph5")["cover"] == "5"
    assert decode("m")["forest"] is False and decode("bfs20")["macro"] == "caducifolio"
    # synthetic shapefile with 1 polygon and 1 null record
    tmp = tempfile.mkdtemp()
    ring = [(0.0, 0.0), (0.0, 10.0), (10.0, 10.0), (10.0, 0.0), (0.0, 0.0)]
    pts = b"".join(struct.pack("<2d", *p) for p in ring)
    body = (struct.pack("<i", 5) + struct.pack("<4d", 0, 0, 10, 10) + struct.pack("<2i", 1, 5)
            + struct.pack("<i", 0) + pts)
    shp = b"\x00" * 100 + struct.pack(">2i", 1, len(body) // 2) + body
    shp += struct.pack(">2i", 2, 2) + struct.pack("<i", 0)
    open(os.path.join(tmp, "t.shp"), "wb").write(shp)
    got = read_shp(os.path.join(tmp, "t.shp"))
    assert got[1] is None and got[0][1][0] == ring and got[0][0] == (0, 0, 10, 10)
    print("selftest OK")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--dirs", nargs="+", help="folders with the unzipped sheets (.shp/.dbf)")
    ap.add_argument("--lat", type=float)
    ap.add_argument("--lon", type=float)
    ap.add_argument("--csv", help="CSV with name,lat,lon,expected")
    ap.add_argument("--out", default="mcsc_check.csv")
    ap.add_argument("--radius", type=float, default=0, help="metres: also print composition")
    ap.add_argument("--step", type=float, default=50, help="grid step for the composition")
    ap.add_argument("--min-share", type=float, default=0.10)
    ap.add_argument("--selftest", action="store_true")
    args = ap.parse_args()
    if args.selftest:
        return selftest()
    if not args.dirs:
        ap.error("--dirs is required")
    sheets = load_sheets(args.dirs)
    if not sheets:
        print("No .shp found")
        return 1
    print(f"{len(sheets)} sheets loaded: {', '.join(s.name for s in sheets)}")
    if args.csv:
        run_csv(sheets, args.csv, args.out, args.radius, args.step, args.min_share)
    elif args.lat is not None and args.lon is not None:
        print(lookup(sheets, args.lat, args.lon) or "point is outside the loaded sheets")
        if args.radius:
            comp = composition(sheets, args.lat, args.lon, args.radius, args.step)
            print(f"composition {args.radius:.0f} m: {fmt_comp(comp, args.min_share)}")
    else:
        ap.error("give --lat/--lon or --csv")
    return 0


if __name__ == "__main__":
    sys.exit(main())
