"""Forest weights of a species from where it has been recorded in Catalonia (GBIF).

For each species it downloads the public GBIF records inside Catalonia, drops the imprecise ones
and keeps one record per ~250 m pixel (so a spot visited every year counts once), and looks at
the forest around each record in the same CREAF raster the Observatory uses (mean of the pixels
within 500 m, as the model does). It then compares how the records are spread across the five
forest classes with how the forest of Catalonia is spread:

    lift   = share of the records in a class / share of Catalonia's forest in that class
    weight = lift / the highest lift (so the class where the species is found most, in
             proportion to what is there, weighs 1)

A bootstrap (resampling the records) gives a range per weight, so a number that would change a
lot with a few more records is flagged as unstable. This measures WHERE the species is recorded,
not how much it fruits there; people record where they walk, so read it as an indication to
compare with field knowledge and the literature, not as the final value. Nothing is written to
the database: the output is a CSV and a JSON proposal in local-data/gbif/ (git-ignored).

    python3 backend/scripts/gbif_forest_affinity.py                      # the 14 default species
    python3 backend/scripts/gbif_forest_affinity.py --species "Boletus aereus"
    python3 backend/scripts/gbif_forest_affinity.py --refresh            # ignore the cache

It needs network access to api.gbif.org and the forest raster (local-data/forest, built by
build_forest_raster.py). Downloads are cached in local-data/gbif/raw/, so a rerun is quick.
"""

from __future__ import annotations

import argparse
import csv
import json
import math
import random
import sys
import time
from collections.abc import Callable, Iterable, Sequence
from pathlib import Path

GBIF = "https://api.gbif.org/v1"
BBOX_LAT = (40.5, 42.9)  # Catalonia's box; records outside the raster's forest count nothing
BBOX_LON = (0.15, 3.35)
PAGE_SIZE = 300  # GBIF's maximum
MAX_OFFSET = 100_000  # GBIF refuses deeper paging
MAX_UNCERTAINTY_M = 500
FOREST_MIN_TOTAL = 0.10  # a record with less forest than this around it says nothing about forest
MIN_BASE_SHARE = 0.01  # a class under 1 % of the forest has too few places to judge
MIN_RECORDS = 30
UNSTABLE_WIDTH = 0.4  # a weight whose 10-90 % range is wider than this is flagged
CLASSES = ("pinar", "encinar", "hayedo", "robledal", "otro")

DEFAULT_SPECIES = (
    "Boletus edulis", "Boletus aereus", "Boletus pinophilus", "Boletus reticulatus",
    "Imleria badia", "Russula virescens", "Russula cyanoxantha", "Lactarius deliciosus",
    "Lactarius sanguifluus", "Cantharellus cibarius", "Craterellus cornucopioides",
    "Amanita caesarea", "Tuber melanosporum", "Butyriboletus regius",
)

Get = Callable[[str, dict], dict]


# ── GBIF ─────────────────────────────────────────────────────────────────────

def species_key(get: Get, name: str) -> int | None:
    """GBIF backbone key of a fungus species name; None if it does not match one."""
    out = get(f"{GBIF}/species/match", {"name": name, "kingdom": "Fungi"})
    if out.get("matchType") in (None, "NONE") or out.get("kingdom") != "Fungi":
        return None
    return out.get("usageKey")


def _search_params(key: int, max_uncertainty: float | None) -> dict:
    params = {
        "taxonKey": key, "hasCoordinate": "true", "hasGeospatialIssue": "false",
        "occurrenceStatus": "PRESENT",
        "decimalLatitude": f"{BBOX_LAT[0]},{BBOX_LAT[1]}",
        "decimalLongitude": f"{BBOX_LON[0]},{BBOX_LON[1]}",
    }
    if max_uncertainty is not None:
        params["coordinateUncertaintyInMeters"] = f"0,{max_uncertainty:g}"
    return params


def count_occurrences(get: Get, key: int, max_uncertainty: float | None = None) -> int:
    """How many records GBIF has for the taxon in Catalonia's box (no download)."""
    out = get(f"{GBIF}/occurrence/search", {**_search_params(key, max_uncertainty), "limit": 0})
    return int(out.get("count", 0))


def fetch_occurrences(
    get: Get, key: int, page_size: int = PAGE_SIZE, max_offset: int = MAX_OFFSET,
    sleep: float = 0.0, max_uncertainty: float = MAX_UNCERTAINTY_M,
) -> list[dict]:
    """Every record of the taxon inside Catalonia's box with usable coordinates, page by page."""
    out: list[dict] = []
    offset = 0
    while offset < max_offset:
        page = get(f"{GBIF}/occurrence/search", {
            **_search_params(key, max_uncertainty), "limit": page_size, "offset": offset,
        })
        rows = page.get("results", [])
        out.extend(rows)
        if page.get("endOfRecords") or not rows:
            break
        offset += page_size
        if sleep:
            time.sleep(sleep)
    return out[: max_offset]


def clean_records(rows: Iterable[dict], max_uncertainty: float = MAX_UNCERTAINTY_M) -> list[dict]:
    """{lat, lon, year} of the records with a stated, small uncertainty inside the box."""
    out = []
    for r in rows:
        lat, lon = r.get("decimalLatitude"), r.get("decimalLongitude")
        unc = r.get("coordinateUncertaintyInMeters")
        if lat is None or lon is None or unc is None or unc > max_uncertainty:
            continue
        if not (BBOX_LAT[0] <= lat <= BBOX_LAT[1] and BBOX_LON[0] <= lon <= BBOX_LON[1]):
            continue
        out.append({"lat": float(lat), "lon": float(lon), "year": r.get("year")})
    return out


def dedupe_by_cell(records: Sequence[dict], dlat: float, dlon: float) -> list[dict]:
    """One record per cell of dlat x dlon degrees (the first seen)."""
    seen: set[tuple[int, int]] = set()
    out = []
    for r in records:
        cell = (math.floor(r["lat"] / dlat), math.floor(r["lon"] / dlon))
        if cell not in seen:
            seen.add(cell)
            out.append(r)
    return out


# ── The comparison ───────────────────────────────────────────────────────────

def share_of_mass(
    shares: Iterable[dict[str, float]], classes: Sequence[str], min_total: float = FOREST_MIN_TOTAL,
) -> tuple[dict[str, float] | None, int]:
    """How the forest around a set of places is spread across the classes (sums to 1), and
    how many places had forest. Places with less than `min_total` forest around them are left
    out. (None, 0) if there is none."""
    totals = dict.fromkeys(classes, 0.0)
    n = 0
    for s in shares:
        if sum(s.get(c, 0.0) for c in classes) < min_total:
            continue
        n += 1
        for c in classes:
            totals[c] += s.get(c, 0.0)
    whole = sum(totals.values())
    if not n or whole <= 0:
        return None, 0
    return {c: v / whole for c, v in totals.items()}, n


def lifts(
    observed: dict[str, float], baseline: dict[str, float], min_base: float = MIN_BASE_SHARE,
) -> dict[str, float | None]:
    """Observed share / available share per class; None where almost no forest of it exists."""
    return {
        c: (observed.get(c, 0.0) / baseline[c] if baseline.get(c, 0.0) >= min_base else None)
        for c in observed
    }


def weights_from(lift: dict[str, float | None]) -> dict[str, float | None]:
    """Lifts relative to the highest one; all None if no class has a positive lift."""
    top = max((v for v in lift.values() if v is not None), default=0.0)
    if top <= 0:
        return dict.fromkeys(lift)
    return {c: (None if v is None else v / top) for c, v in lift.items()}


def bootstrap_ranges(
    shares: Sequence[dict[str, float]], baseline: dict[str, float], classes: Sequence[str],
    n: int = 200, rng: random.Random | None = None,
) -> dict[str, tuple[float, float] | None]:
    """10th and 90th percentile of each class' weight over `n` resamples of the records."""
    rng = rng or random.Random(0)
    runs: dict[str, list[float]] = {c: [] for c in classes}
    for _ in range(n):
        sample = [shares[rng.randrange(len(shares))] for _ in shares]
        observed, _count = share_of_mass(sample, classes)
        if observed is None:
            continue
        for c, w in weights_from(lifts(observed, baseline)).items():
            if w is not None:
                runs[c].append(w)
    out: dict[str, tuple[float, float] | None] = {}
    for c, vals in runs.items():
        if not vals:
            out[c] = None
            continue
        vals.sort()
        out[c] = (vals[int(0.1 * (len(vals) - 1))], vals[int(0.9 * (len(vals) - 1))])
    return out


# ── Running it ───────────────────────────────────────────────────────────────

def _http_get() -> Get:
    import httpx

    client = httpx.Client(timeout=60, headers={"User-Agent": "fungus-forest-affinity/1.0"})

    def get(url: str, params: dict) -> dict:
        for attempt in range(4):
            try:
                resp = client.get(url, params=params)
                resp.raise_for_status()
                return resp.json()
            except httpx.HTTPError as exc:
                if attempt == 3:
                    raise
                print(f"  retry {attempt + 1} ({exc})", file=sys.stderr)
                time.sleep(2 * (attempt + 1))
        return {}

    return get


def _background(raster, n: int, seed: int, radius_m: float) -> list[dict[str, float]]:
    """Forest around `n` random places of the raster that have forest: what is available."""
    rng = random.Random(seed)
    out: list[dict[str, float]] = []
    tries = 0
    while len(out) < n and tries < n * 30:
        tries += 1
        lat = rng.uniform(raster.south, raster.north)
        lon = rng.uniform(raster.west, raster.east)
        s = raster.mean_shares(lat, lon, radius_m)
        if s and sum(s.values()) >= FOREST_MIN_TOTAL:
            out.append(s)
    return out


def _records_for(
    name: str, get: Get, raw_dir: Path, refresh: bool, sleep: float, max_uncertainty: float,
) -> list[dict]:
    cache = raw_dir / f"{name.replace(' ', '_')}_u{max_uncertainty:g}.json"
    if cache.exists() and not refresh:
        return json.loads(cache.read_text())
    key = species_key(get, name)
    if key is None:
        print(f"  {name}: no match in GBIF backbone", file=sys.stderr)
        return []
    rows = fetch_occurrences(get, key, sleep=sleep, max_uncertainty=max_uncertainty)
    keep = [{k: r.get(k) for k in (
        "decimalLatitude", "decimalLongitude", "coordinateUncertaintyInMeters", "year")}
        for r in rows]
    raw_dir.mkdir(parents=True, exist_ok=True)
    cache.write_text(json.dumps(keep))
    return keep


def diagnose(get: Get, names: Iterable[str]) -> None:
    """How many GBIF records each species has in Catalonia at different precisions, to choose
    `--max-uncertainty` knowing what is lost. Downloads nothing."""
    print(f"{'species':30s} {'all':>7s} {'<=500m':>7s} {'<=1km':>7s} {'<=2km':>7s} {'<=5km':>7s}")
    for name in names:
        key = species_key(get, name)
        if key is None:
            print(f"{name:30s} no match in GBIF backbone")
            continue
        counts = [count_occurrences(get, key, u) for u in (None, 500, 1000, 2000, 5000)]
        print(f"{name:30s} " + " ".join(f"{c:7d}" for c in counts))
    print("\n'all' includes records with no stated uncertainty (they cannot be placed on a ~250 m "
          "forest map).")


def main(argv: Sequence[str] | None = None) -> int:
    repo = Path(__file__).resolve().parents[2]
    ap = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawTextHelpFormatter)
    ap.add_argument("--species", action="append", help="scientific name (repeatable)")
    ap.add_argument("--raster-dir", default=str(repo / "local-data" / "forest"))
    ap.add_argument("--out", default=str(repo / "local-data" / "gbif"))
    ap.add_argument("--min-records", type=int, default=MIN_RECORDS)
    ap.add_argument("--background", type=int, default=20000, help="places for the baseline")
    ap.add_argument("--bootstrap", type=int, default=200)
    ap.add_argument("--sleep", type=float, default=0.2, help="seconds between GBIF pages")
    ap.add_argument("--refresh", action="store_true", help="download again even if cached")
    ap.add_argument("--max-uncertainty", type=float, default=MAX_UNCERTAINTY_M,
                    help="drop records less precise than this many metres (default %(default)s)")
    ap.add_argument("--diagnose", action="store_true",
                    help="only count records per species and precision, then exit")
    args = ap.parse_args(argv)

    if args.diagnose:
        diagnose(_http_get(), args.species or DEFAULT_SPECIES)
        return 0

    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
    from app.services.point_habitat import HABITAT_RADIUS_M, load_raster

    raster = load_raster(args.raster_dir, "forest-catalonia")
    if raster is None:
        print(f"No forest raster in {args.raster_dir} (see build_forest_raster.py)",
              file=sys.stderr)
        return 1
    classes = tuple(raster.classes)
    dlat = (raster.north - raster.south) / raster.height
    dlon = (raster.east - raster.west) / raster.width

    print(f"Baseline: {args.background} random forest places...", flush=True)
    base_shares = _background(raster, args.background, seed=1, radius_m=HABITAT_RADIUS_M)
    baseline, n_base = share_of_mass(base_shares, classes)
    if baseline is None:
        print("The raster has no forest to compare with", file=sys.stderr)
        return 1
    print("  available forest: " + ", ".join(f"{c} {baseline[c]:.0%}" for c in classes))

    get = _http_get()
    out_dir = Path(args.out)
    rows_out: list[list] = []
    proposal: dict[str, dict] = {}
    for name in args.species or DEFAULT_SPECIES:
        print(f"{name}", flush=True)
        raw = _records_for(
            name, get, out_dir / "raw", args.refresh, args.sleep, args.max_uncertainty)
        recs = dedupe_by_cell(clean_records(raw, args.max_uncertainty), dlat, dlon)
        shares = [
            s for r in recs
            if (s := raster.mean_shares(r["lat"], r["lon"], HABITAT_RADIUS_M))
        ]
        observed, n_forest = share_of_mass(shares, classes)
        notes = []
        if observed is None or n_forest < args.min_records:
            notes.append(f"few records ({n_forest} in forest; at least {args.min_records})")
        print(f"  {len(raw)} records, {len(recs)} places, {n_forest} with forest around")
        if observed is None:
            continue
        lift = lifts(observed, baseline)
        weight = weights_from(lift)
        ranges = bootstrap_ranges(
            [s for s in shares if sum(s.values()) >= FOREST_MIN_TOTAL],
            baseline, classes, n=args.bootstrap, rng=random.Random(7))
        unstable = [c for c, rg in ranges.items() if rg and rg[1] - rg[0] > UNSTABLE_WIDTH]
        if unstable:
            notes.append("unstable: " + ", ".join(unstable))
        for c in classes:
            rg = ranges.get(c)
            rows_out.append([
                name, len(raw), len(recs), n_forest, c, round(observed[c], 3),
                round(baseline[c], 3), None if lift[c] is None else round(lift[c], 2),
                None if weight[c] is None else round(weight[c], 2),
                None if not rg else round(rg[0], 2), None if not rg else round(rg[1], 2),
                "; ".join(notes),
            ])
            w = weight[c]
            print(f"  {c:9s} found {observed[c]:5.0%}  available {baseline[c]:5.0%}  "
                  f"weight {'-' if w is None else f'{w:.2f}'}"
                  f"{'' if not rg else f'  ({rg[0]:.2f}-{rg[1]:.2f})'}")
        if not notes:
            proposal[name] = {c: round(w, 1) for c, w in weight.items() if w and w >= 0.1}
        elif notes:
            print("  ! " + "; ".join(notes))

    out_dir.mkdir(parents=True, exist_ok=True)
    with (out_dir / "affinity.csv").open("w", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(["species", "gbif_records", "places", "places_in_forest", "class",
                    "found_share", "available_share", "lift", "weight", "weight_p10",
                    "weight_p90", "notes"])
        w.writerows(rows_out)
    (out_dir / "affinity_proposal.json").write_text(
        json.dumps(proposal, indent=2, ensure_ascii=False))
    print(f"\nWrote {out_dir / 'affinity.csv'} and {out_dir / 'affinity_proposal.json'} "
          f"({len(proposal)} species with enough stable data)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
