"""Probe T7: forest type and nearest place name for coordinates in Catalonia.

Stdlib only. Checks three public services, none of which are called by the app yet:
  G1  ICGC reverse geocoder (nearest toponyms, radius 1 / 3 / 5 km)
  G2  Mapa Forestal de España (MFE) WMS: GetCapabilities + GetFeatureInfo at the point
  G3  ICGC land cover WMS (cobertes del sol): GetFeatureInfo at the point

Run from the repo root (needs internet):
    python3 backend/scripts/probe_geo.py --out probe_geo.json
    python3 backend/scripts/probe_geo.py --csv my_points.csv   # name,lat,lon,expected
    python3 backend/scripts/probe_geo.py --only g1             # g1 | g2 | g3
    python3 backend/scripts/probe_geo.py --mfe-ca accomp.pem   # MFE server omits its intermediate
    python3 backend/scripts/probe_geo.py --cobertes-check --csv zones.csv  # forest type vs stored
    python3 backend/scripts/probe_geo.py --only g3 --layer cobertes_2009   # older land cover layer
    python3 backend/scripts/probe_geo.py --selftest            # no network

Output is read by a person: it prints raw (truncated) service answers on purpose, because
the field names of the WMS answers are not known in advance.
"""

from __future__ import annotations

import argparse
import csv
import collections
import json
import math
import re
import ssl
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

ICGC_INVERS = "https://eines.icgc.cat/geocodificador/invers"
MFE_WMS = "https://wms.mapama.gob.es/sig/Biodiversidad/MFE"
COBERTES_WMS = "https://geoserveis.icgc.cat/servei/catalunya/cobertes-sol/wms"
COBERTES_LAYER = "cobertes_2024"
UA = "fungus-probe/1.0 (personal project; contact: mimpho@gmail.com)"
TIMEOUT = 25
RAW_CHARS = 700
INFO_FORMATS = ["application/json", "text/plain", "text/html", "application/vnd.ogc.gml"]

# name, lat, lon, expected (a hint from general knowledge; check on the ground if it matters)
POINTS = [
    ("Fageda d'en Jordà", 42.1456, 2.5128, "fageda (haya)"),
    ("Santa Fe del Montseny", 41.7745, 2.4350, "fageda / bosque caducifolio"),
    ("Pla de Beret", 42.7003, 0.9478, "pino negro / abeto, subalpino"),
    ("Montnegre", 41.6580, 2.6050, "alzinar / alcornocal / pinar"),
    ("Les Gavarres", 41.9400, 2.9700, "alcornocal"),
    ("Sant Llorenç del Munt", 41.6400, 2.0200, "pino blanco + encina"),
    ("Muntanyes de Prades", 41.3100, 1.0000, "encinar / pinar"),
    ("Ports de Tortosa-Beseit", 40.8000, 0.2800, "pino / matorral"),
    ("Cadí (Tuixent)", 42.2000, 1.6000, "pino negro / abeto"),
    ("Cap de Creus", 42.3200, 3.3100, "matorral, sin bosque"),
    ("Vic (centro)", 41.9301, 2.2549, "URBANO"),
    ("Llano de Lleida (cultivo)", 41.6200, 0.6200, "AGRÍCOLA"),
]


def mercator(lat: float, lon: float) -> tuple[float, float]:
    """WGS84 -> EPSG:3857 (x, y) in metres."""
    r = 6378137.0
    x = math.radians(lon) * r
    y = math.log(math.tan(math.pi / 4 + math.radians(lat) / 2)) * r
    return x, y


def bbox_3857(lat: float, lon: float, half: float = 50.0) -> str:
    x, y = mercator(lat, lon)
    return f"{x - half:.2f},{y - half:.2f},{x + half:.2f},{y + half:.2f}"


MFE_CTX: ssl.SSLContext | None = None


def build_mfe_context(path: str) -> ssl.SSLContext:
    """Default trust store plus one extra intermediate CA (PEM or DER). Verification stays on.

    wms.mapama.gob.es sends only its own certificate, not the FNMT intermediate that signed it,
    so the chain cannot be built. The intermediate is public (see the AIA field of the cert).
    """
    ctx = ssl.create_default_context()
    with open(path, "rb") as fh:
        data = fh.read()
    if b"BEGIN CERTIFICATE" in data:
        ctx.load_verify_locations(cadata=data.decode("ascii"))
    else:
        ctx.load_verify_locations(cadata=data)
    return ctx


class Counter:
    requests = 0
    failures = 0


def get(url: str, params: dict | None = None, retries: int = 1) -> tuple[int, str, float]:
    """GET returning (status, body text, seconds). status 0 = network error (body = reason)."""
    full = url + ("?" + urllib.parse.urlencode(params) if params else "")
    last = (0, "", 0.0)
    for attempt in range(retries + 1):
        Counter.requests += 1
        t0 = time.time()
        try:
            req = urllib.request.Request(full, headers={"User-Agent": UA})
            ctx = MFE_CTX if MFE_CTX is not None and url.startswith(MFE_WMS) else None
            with urllib.request.urlopen(req, timeout=TIMEOUT, context=ctx) as resp:
                body = resp.read().decode("utf-8", errors="replace")
                return resp.status, body, time.time() - t0
        except urllib.error.HTTPError as exc:
            body = exc.read().decode("utf-8", errors="replace")
            last = (exc.code, body, time.time() - t0)
            if exc.code < 500:
                break
        except Exception as exc:  # noqa: BLE001 - probe script, report anything
            last = (0, f"{type(exc).__name__}: {exc}", time.time() - t0)
        time.sleep(1.0 + attempt)
    Counter.failures += 1
    return last


def short(text: str, n: int = RAW_CHARS) -> str:
    text = " ".join(text.split())
    return text if len(text) <= n else text[:n] + " ..."


# ---------------------------------------------------------------- G1 reverse geocoder


def g1_point(lat: float, lon: float) -> dict:
    out: dict = {"radii": {}}
    for radius in (1, 3, 5):
        status, body, secs = get(
            ICGC_INVERS,
            {
                "lat": lat,
                "lon": lon,
                "layers": "topo1,topo2",
                "size": 8,
                "boundary.circle.radius": radius,
            },
        )
        entry: dict = {"status": status, "secs": round(secs, 2), "names": []}
        if status == 200:
            try:
                entry["names"] = parse_geocoder(json.loads(body))
            except ValueError:
                entry["raw"] = short(body)
        else:
            entry["raw"] = short(body)
        out["radii"][radius] = entry
        if entry["names"]:
            break  # the smallest radius that answers is the interesting one
    return out


def parse_geocoder(data: dict) -> list[dict]:
    """Pelias-style FeatureCollection: label, layer, distance when present."""
    names = []
    for feat in data.get("features", []):
        props = feat.get("properties", {})
        names.append(
            {
                "name": props.get("etiqueta") or props.get("label") or props.get("name"),
                "layer": props.get("layer") or props.get("tipus") or props.get("source"),
                "dist_km": props.get("distance"),
            }
        )
    return names


# ---------------------------------------------------------------- WMS helpers


def parse_capabilities(xml_text: str) -> list[dict]:
    """Return [{name, title, queryable}] for every named layer (namespace agnostic)."""
    root = ET.fromstring(xml_text)
    layers = []
    for el in root.iter():
        if el.tag.split("}")[-1] != "Layer":
            continue
        name = title = None
        for child in el:
            tag = child.tag.split("}")[-1]
            if tag == "Name":
                name = (child.text or "").strip()
            elif tag == "Title":
                title = (child.text or "").strip()
        if name:
            layers.append(
                {"name": name, "title": title, "queryable": el.attrib.get("queryable") == "1"}
            )
    return layers


def feature_info(wms: str, layer: str, lat: float, lon: float, crs: str = "EPSG:3857") -> dict:
    """GetFeatureInfo at a point; tries several info formats until one gives a body."""
    base = {
        "SERVICE": "WMS",
        "VERSION": "1.3.0",
        "REQUEST": "GetFeatureInfo",
        "LAYERS": layer,
        "QUERY_LAYERS": layer,
        "STYLES": "",
        "CRS": crs,
        "BBOX": bbox_3857(lat, lon),
        "WIDTH": 101,
        "HEIGHT": 101,
        "I": 50,
        "J": 50,
        "FORMAT": "image/png",
        "FEATURE_COUNT": 3,
    }
    tried = []
    for fmt in INFO_FORMATS:
        status, body, secs = get(wms, {**base, "INFO_FORMAT": fmt}, retries=0)
        tried.append(f"{fmt}:{status}")
        if status == 200 and body.strip() and "ServiceException" not in body[:400]:
            return {"format": fmt, "secs": round(secs, 2), "raw": short(body), "tried": tried}
    return {"format": None, "raw": short(body), "tried": tried}


# ---------------------------------------------------------------- G2 / G3


def g2_capabilities() -> dict:
    """Try the documented endpoint and the usual wms.aspx variant; keep the first with layers."""
    last: dict = {"status": 0, "raw": "", "layers": [], "endpoint": MFE_WMS}
    for endpoint in (MFE_WMS, MFE_WMS + "/wms.aspx"):
        status, body, secs = get(
            endpoint, {"SERVICE": "WMS", "VERSION": "1.3.0", "REQUEST": "GetCapabilities"}
        )
        last = {"status": status, "secs": round(secs, 2), "endpoint": endpoint,
                "raw": short(body, 500), "layers": []}
        if status != 200:
            continue
        try:
            last["layers"] = parse_capabilities(body)
        except ET.ParseError as exc:
            last["raw"] = f"XML error: {exc}. Body: {short(body, 400)}"
        if last["layers"]:
            break
    return last


def pick_mfe_layers(layers: list[dict], limit: int = 3) -> list[str]:
    """Queryable layers first; prefer names that look like the forest map itself."""
    queryable = [x for x in layers if x["queryable"]] or layers
    queryable.sort(key=lambda x: 0 if "mfe" in (x["name"] + (x["title"] or "")).lower() else 1)
    return [x["name"] for x in queryable[:limit]]


# ---------------------------------------------------------------- cobertes check

CLASS_RE = re.compile(r"class = '(.*?)' red = ")
EXPECTED_MACRO = {
    "pinar": "conifera",
    "encinar": "esclerofilo",
    "robledal": "caducifolio",
    "hayedo": "caducifolio",
}
# about 150 m around the click: centre first, then N, S, E, W
OFFSETS = [(0.0, 0.0), (0.00135, 0.0), (-0.00135, 0.0), (0.0, 0.0018), (0.0, -0.0018)]


def parse_class(raw: str) -> str | None:
    """Class name of the first feature in a GetFeatureInfo text answer."""
    found = CLASS_RE.search(raw)
    if not found:
        return None
    name = found.group(1)
    return name.split(") ", 1)[-1].strip()


def macrotype(class_name: str | None) -> str:
    if not class_name:
        return "sin_dato"
    low = class_name.lower()
    if "aciculifol" in low:
        return "conifera"
    if "esclerofil" in low:
        return "esclerofilo"
    if "caducifol" in low:
        return "caducifolio"
    if low.startswith("bosc"):
        return "bosque_otro"
    return "no_bosque"


def cobertes_vote(lat: float, lon: float) -> dict:
    classes, macros = [], []
    for dlat, dlon in OFFSETS:
        info = feature_info(COBERTES_WMS, COBERTES_LAYER, lat + dlat, lon + dlon)
        cls = parse_class(info["raw"]) if info["format"] else None
        classes.append(cls)
        macros.append(macrotype(cls))
    tally = collections.Counter(macros)
    top, top_n = tally.most_common(1)[0]
    vote = macros[0] if list(tally.values()).count(top_n) > 1 else top
    return {"classes": classes, "macros": macros, "center": macros[0], "vote": vote}


def run_check(args: argparse.Namespace) -> dict:
    points = load_points(args.csv)
    rows, hit_center, hit_vote, graded = [], 0, 0, 0
    for name, lat, lon, expected in points:
        res = cobertes_vote(lat, lon)
        want = EXPECTED_MACRO.get(expected.strip().lower())
        ok_c = want is not None and res["center"] == want
        ok_v = want is not None and res["vote"] == want
        if want is not None:
            graded += 1
            hit_center += ok_c
            hit_vote += ok_v
        mark = "-" if want is None else ("OK " if ok_v else "NO ")
        print(f"{mark} {name[:34]:34} stored={expected:9} centre={res['center']:12} "
              f"vote={res['vote']:12} {res['classes'][0]}")
        rows.append({"name": name, "lat": lat, "lon": lon, "expected": expected,
                     "want": want, **res})
        time.sleep(args.pace)
    print(f"\nGraded {graded}: centre matches {hit_center}, vote matches {hit_vote}")
    print(f"Requests: {Counter.requests}, failed: {Counter.failures}")
    return {"rows": rows, "graded": graded, "hit_center": hit_center, "hit_vote": hit_vote}


# ---------------------------------------------------------------- main


def load_points(path: str | None) -> list[tuple[str, float, float, str]]:
    if not path:
        return POINTS
    with open(path, newline="", encoding="utf-8") as fh:
        rows = csv.DictReader(fh)
        return [
            (r["name"], float(r["lat"]), float(r["lon"]), r.get("expected", "")) for r in rows
        ]


def show(label: str, text: str) -> None:
    print(f"    {label}: {text}")


def run(args: argparse.Namespace) -> dict:
    points = load_points(args.csv)
    want = (args.only or "g1,g2,g3").split(",")
    result: dict = {"points": []}

    mfe_layers: list[str] = []
    mfe_url = MFE_WMS
    if "g2" in want:
        print("G2  MFE GetCapabilities ...")
        caps = g2_capabilities()
        result["mfe_capabilities"] = caps
        mfe_url = caps["endpoint"]
        if caps["layers"]:
            for lay in caps["layers"][:25]:
                q = "Q" if lay["queryable"] else "-"
                print(f"    [{q}] {lay['name']}  {lay['title']}")
            mfe_layers = pick_mfe_layers(caps["layers"])
            print(f"    queried layers: {mfe_layers}")
        else:
            print(f"    no layers at {caps['endpoint']}: HTTP {caps['status']}")
            print(f"    body: {caps.get('raw', '')}")
            if "CERTIFICATE" in str(caps.get("raw", "")):
                print("    hint: server omits its intermediate CA; use --mfe-ca (see docstring)")

    for name, lat, lon, expected in points:
        print(f"\n== {name} ({lat}, {lon})  esperado: {expected}")
        row: dict = {"name": name, "lat": lat, "lon": lon, "expected": expected}
        if "g1" in want:
            g1 = g1_point(lat, lon)
            row["g1"] = g1
            for radius, entry in g1["radii"].items():
                names = ", ".join(
                    f"{n['name']} [{n['layer']}]" for n in entry["names"][:5]
                ) or entry.get("raw", "sin resultados")
                show(f"G1 radio {radius} km ({entry['secs']}s, HTTP {entry['status']})", names)
        if "g2" in want:
            row["g2"] = {}
            for layer in mfe_layers:
                info = feature_info(mfe_url, layer, lat, lon)
                row["g2"][layer] = info
                show(f"G2 {layer} [{info['format']}]", info["raw"])
        if "g3" in want:
            info = feature_info(COBERTES_WMS, COBERTES_LAYER, lat, lon)
            row["g3"] = info
            show(f"G3 {COBERTES_LAYER} [{info['format']}]", info["raw"])
        result["points"].append(row)
        time.sleep(args.pace)

    print(f"\nRequests: {Counter.requests}, failed: {Counter.failures}")
    return result


def selftest() -> int:
    x, y = mercator(0.0, 0.0)
    assert abs(x) < 1e-6 and abs(y) < 1e-6
    x, y = mercator(41.9, 2.5)
    assert 278000 < x < 279000 and 5100000 < y < 5200000, (x, y)
    parts = bbox_3857(41.9, 2.5).split(",")
    assert len(parts) == 4 and float(parts[2]) - float(parts[0]) == 100.0
    xml = (
        '<WMS_Capabilities xmlns="http://www.opengis.net/wms"><Capability>'
        '<Layer><Title>root</Title><Layer queryable="1"><Name>MFE_x</Name><Title>MFE</Title>'
        '</Layer><Layer><Name>other</Name><Title>o</Title></Layer></Layer>'
        "</Capability></WMS_Capabilities>"
    )
    layers = parse_capabilities(xml)
    assert [x["name"] for x in layers] == ["MFE_x", "other"], layers
    assert pick_mfe_layers(layers) == ["MFE_x"]
    geo = {"features": [{"properties": {"etiqueta": "Turó", "layer": "topo2"}}]}
    assert parse_geocoder(geo)[0]["name"] == "Turó"
    raw = ("GetFeatureInfo results: Layer 'cobertes_2024' Feature 0: x = '1' y = '2' value_0 = '7' "
           "class = '221. (7) Boscos densos d'aciculifolis' red = '51' green = '204'")
    assert parse_class(raw) == "Boscos densos d'aciculifolis"
    assert macrotype(parse_class(raw)) == "conifera"
    assert macrotype("Prats i herbassars") == "no_bosque" and macrotype(None) == "sin_dato"
    assert macrotype("Boscos densos d'esclerofil\u00b7les i laurifolis") == "esclerofilo"
    print("selftest OK")
    return 0


def main() -> int:
    global COBERTES_LAYER
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--out", help="write full results as JSON")
    ap.add_argument("--csv", help="CSV with columns name,lat,lon[,expected]")
    ap.add_argument("--only", help="comma list of g1,g2,g3")
    ap.add_argument("--pace", type=float, default=0.5, help="seconds between points")
    ap.add_argument("--mfe-ca", help="PEM/DER file with the FNMT intermediate CA (MFE host only)")
    ap.add_argument("--cobertes-check", action="store_true", help="compare macrotype to CSV")
    ap.add_argument("--layer", default="cobertes_2024", help="land cover WMS layer for G3")
    ap.add_argument("--selftest", action="store_true")
    args = ap.parse_args()
    if args.selftest:
        return selftest()
    COBERTES_LAYER = args.layer
    if args.mfe_ca:
        global MFE_CTX
        MFE_CTX = build_mfe_context(args.mfe_ca)
    result = run_check(args) if args.cobertes_check else run(args)
    if args.out:
        with open(args.out, "w", encoding="utf-8") as fh:
            json.dump(result, fh, ensure_ascii=False, indent=2)
        print(f"Results written to {args.out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
