"""Probe Open-Meteo to check the "any point in Catalonia" Observatory idea.

Read-only: it only calls Open-Meteo and prints a report (no DB, no app code). Run it from a
machine that can reach Open-Meteo, from the repo root:

    python3 backend/scripts/probe_open_meteo.py --out probe_open_meteo.json

It spends roughly 110 "API calls" of the free daily quota (a request longer than 14 days counts
as several calls, see https://open-meteo.com/en/pricing). Checks:

  T1  one forecast call with past_days=92 plus the archive API rebuild a 100-day window, and
      the two sources agree on the days they share.
  T2  grid snapping: which requested points fall in the same model cell (elevation=nan).
  T3  elevation downscaling: how temperature, soil temperature, humidity, wind and rain change
      with the `elevation` parameter (change per +100 m).
  T4  cache model: cell series (elevation=nan) plus a per-100-m correction vs a direct call at
      the point, for a few Catalan points.
  T5  (run it alone: --only t5, ~65 calls) seam between the archive and the forecast API on
      the same past days at 6 points, three ways of requesting the forecast for a cell, and
      where forecast(past_days=92) has null days.

`--selftest` runs everything on synthetic data (no network) to check the script itself.
Coordinates of the T4 places are approximate on purpose: only their spread matters.
"""

import argparse
import json
import math
import statistics as st
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import date, timedelta

FORECAST = "https://api.open-meteo.com/v1/forecast"
ARCHIVE = "https://archive-api.open-meteo.com/v1/archive"
TZ = "Europe/Madrid"
DAILY = (
    "temperature_2m_max,temperature_2m_min,temperature_2m_mean,"
    "precipitation_sum,windspeed_10m_max"
)
HOURLY_FC = "soil_temperature_0cm,relativehumidity_2m"
HOURLY_AR = "soil_temperature_0_to_7cm,relativehumidity_2m"
KEYS = ["tmax", "tmin", "tmean", "rain", "wind", "soil", "rh"]
CORRECTED = ["tmax", "tmin", "tmean", "soil", "rh"]

POINTS = [  # name, lat, lon (approximate)
    ("La Molina", 42.336, 1.946),
    ("Setcases", 42.366, 2.300),
    ("Santa Fe del Montseny", 41.777, 2.444),
    ("Vic", 41.930, 2.255),
    ("Rupit", 42.030, 2.490),
    ("Montserrat", 41.593, 1.838),
]

POINTS5 = [  # name, lat, lon (approximate): mountain, pre-coast, massif, plain, coast, Pyrenees
    ("La Molina", 42.336, 1.946),
    ("Vic", 41.930, 2.255),
    ("Montserrat", 41.593, 1.838),
    ("Lleida", 41.617, 0.620),
    ("L'Escala", 42.134, 3.130),
    ("Vielha", 42.703, 0.795),
]

STATS = {"requests": 0, "weight": 0.0}
FAKE = False


# ---------------------------------------------------------------- HTTP
def _ssl_ctx():
    import ssl

    try:
        import certifi

        return ssl.create_default_context(cafile=certifi.where())
    except Exception:
        return ssl.create_default_context()


def http_get(url, params):
    full = url + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(full, headers={"User-Agent": "fungus-probe/1.0"})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=40, context=_ssl_ctx()) as resp:
                return json.loads(resp.read())
        except urllib.error.HTTPError as exc:
            body = exc.read().decode("utf-8", "replace")[:200]
            if exc.code in (429, 500, 502, 503, 504) and attempt < 3:
                time.sleep(5 * (attempt + 1))
                continue
            raise RuntimeError(f"HTTP {exc.code}: {body}") from exc
        except urllib.error.URLError as exc:
            if attempt < 3:
                time.sleep(3)
                continue
            raise RuntimeError(f"network error: {exc.reason}") from exc


def api(url, **params):
    """One request; counts the estimated call weight (days / 14, minimum 1)."""
    if "start_date" in params:
        d0 = date.fromisoformat(params["start_date"])
        d1 = date.fromisoformat(params["end_date"])
        days = (d1 - d0).days + 1
    else:
        days = params.get("past_days", 0) + params.get("forecast_days", 7)
    STATS["requests"] += 1
    STATS["weight"] += max(1.0, days / 14)
    if FAKE:
        return fake_get(url, params)
    time.sleep(0.25)
    return http_get(url, params)


# ---------------------------------------------------------------- parsing helpers
def _mean(values):
    vals = [v for v in values if v is not None]
    return sum(vals) / len(vals) if vals else None


def parse(data):
    """Daily rows keyed by date; soil and humidity are the mean of the hourly values."""
    d, h = data["daily"], data.get("hourly", {})
    rows = {}
    for i, day in enumerate(d["time"]):
        rows[day] = {
            "tmax": d["temperature_2m_max"][i],
            "tmin": d["temperature_2m_min"][i],
            "tmean": d["temperature_2m_mean"][i],
            "rain": d["precipitation_sum"][i],
            "wind": d["windspeed_10m_max"][i],
        }
    soil_key = next((k for k in h if k.startswith("soil_temperature")), None)
    by_day = {"soil": {}, "rh": {}}
    for i, ts in enumerate(h.get("time", [])):
        if soil_key:
            by_day["soil"].setdefault(ts[:10], []).append(h[soil_key][i])
        by_day["rh"].setdefault(ts[:10], []).append(h["relativehumidity_2m"][i])
    for day, row in rows.items():
        row["soil"] = _mean(by_day["soil"].get(day, []))
        row["rh"] = _mean(by_day["rh"].get(day, []))
    return rows


def compare(a, b, key):
    """(n, bias a-b, mean abs diff) over the days both series have."""
    diffs = [
        a[d][key] - b[d][key]
        for d in sorted(a)
        if d in b and a[d][key] is not None and b[d][key] is not None
    ]
    if not diffs:
        return 0, None, None
    return len(diffs), st.mean(diffs), st.mean(abs(x) for x in diffs)


def f(x, nd=2):
    return "n/a" if x is None else f"{x:.{nd}f}"


def iso(d):
    return d.isoformat()


# ---------------------------------------------------------------- T1
def t1(today):
    print("\n== T1  100-day window: forecast(past_days=92) + archive ==")
    lat, lon = 42.34, 1.95
    fc = api(FORECAST, latitude=lat, longitude=lon, daily=DAILY, hourly=HOURLY_FC,
             past_days=92, forecast_days=16, timezone=TZ)
    fr = parse(fc)
    days = sorted(fr)
    nulls = {k: sum(1 for d in days if fr[d][k] is None) for k in KEYS}
    print(f"forecast call: {len(days)} days {days[0]} .. {days[-1]} "
          f"(grid {fc['latitude']},{fc['longitude']} elev {fc['elevation']})")
    print("  days with null values:", {k: v for k, v in nulls.items() if v} or "none")
    ar = api(ARCHIVE, latitude=lat, longitude=lon, daily=DAILY, hourly=HOURLY_AR,
             start_date=iso(today - timedelta(days=100)), end_date=iso(today - timedelta(days=9)),
             timezone=TZ)
    arows = parse(ar)
    adays = sorted(arows)
    a_nulls = {k: sum(1 for d in adays if arows[d][k] is None) for k in KEYS}
    print(f"archive call:  {len(adays)} days {adays[0]} .. {adays[-1]} "
          f"(grid {ar['latitude']},{ar['longitude']} elev {ar['elevation']})")
    print("  days with null values:", {k: v for k, v in a_nulls.items() if v} or "none")
    print("  overlap archive - forecast (bias / mean abs diff):")
    res = {}
    for k in KEYS:
        n, bias, mae = compare(arows, fr, k)
        res[k] = {"n": n, "bias": bias, "mae": mae}
        print(f"    {k:6s} n={n:3d} bias {f(bias)}  mae {f(mae)}")
    ra = sum(arows[d]["rain"] or 0 for d in adays if d in fr)
    rf = sum(fr[d]["rain"] or 0 for d in adays if d in fr)
    print(f"  rain over the overlap: archive {ra:.0f} mm vs forecast API {rf:.0f} mm")
    first_fc = today - timedelta(days=92)
    stitched = [d for d in adays if d < iso(first_fc)] + [d for d in days if d >= iso(first_fc)]
    print(f"  stitched window: {len(stitched)} days (100 past days + 16 from today = 116 expected)")
    return {"forecast_days": len(days), "archive_days": len(adays), "overlap": res,
            "stitched": len(stitched), "rain_overlap": [ra, rf]}


# ---------------------------------------------------------------- T2
def t2(today):
    print("\n== T2  grid snapping (archive, elevation=nan, 14 days) ==")
    end = today - timedelta(days=10)
    start = end - timedelta(days=13)
    pts = [(round(41.90 + 0.02 * i, 2), 2.25) for i in range(11)]
    pts += [(42.00, round(2.15 + 0.02 * i, 2)) for i in range(11)]
    rows, cells = [], {}
    for la, lo in pts:
        d = api(ARCHIVE, latitude=la, longitude=lo, daily="temperature_2m_mean,precipitation_sum",
                start_date=iso(start), end_date=iso(end), elevation="nan", timezone=TZ)
        rain = round(sum(v or 0 for v in d["daily"]["precipitation_sum"]), 1)
        cell = (d["latitude"], d["longitude"])
        cells.setdefault(cell, []).append((la, lo))
        rows.append({"req": [la, lo], "cell": list(cell), "elev": d["elevation"], "rain14": rain})
        print(f"  req {la:.2f},{lo:.2f} -> cell {cell[0]},{cell[1]} elev {d['elevation']} "
              f"rain14 {rain}")
    lats = sorted({c[0] for c in cells})
    lons = sorted({c[1] for c in cells})
    dlat = min((b - a for a, b in zip(lats, lats[1:])), default=None)
    dlon = min((b - a for a, b in zip(lons, lons[1:])), default=None)
    print(f"  {len(pts)} requested points -> {len(cells)} distinct cells; "
          f"min grid step: lat {f(dlat, 3)} deg, lon {f(dlon, 3)} deg")
    return {"points": rows, "distinct_cells": len(cells), "dlat": dlat, "dlon": dlon}


# ---------------------------------------------------------------- T3
def t3(today):
    print("\n== T3  elevation downscaling (archive, 60 days) ==")
    end = today - timedelta(days=10)
    start = end - timedelta(days=59)
    lat, lon = 42.336, 1.946
    common = dict(latitude=lat, longitude=lon, daily=DAILY, hourly=HOURLY_AR,
                  start_date=iso(start), end_date=iso(end), timezone=TZ)
    base_raw = api(ARCHIVE, elevation="nan", **common)
    z0 = base_raw["elevation"]
    base = parse(base_raw)
    print(f"  cell (elevation=nan): grid {base_raw['latitude']},{base_raw['longitude']} "
          f"mean elevation {z0} m")
    slopes = {k: [] for k in KEYS}
    for e in (800, 1200, 1600, 2000):
        rows = parse(api(ARCHIVE, elevation=e, **common))
        dz100 = (e - z0) / 100
        line = []
        for k in KEYS:
            _, bias, _ = compare(rows, base, k)
            if bias is not None and dz100:
                slopes[k].append(bias / dz100)
            line.append(f"{k} {f(bias / dz100 if bias is not None and dz100 else None)}")
        print(f"  elevation {e:4d} m (dz {e - z0:+.0f}): change per +100 m -> " + ", ".join(line))
    mean_slope = {k: (st.mean(v) if v else None) for k, v in slopes.items()}
    print("  mean change per +100 m:", {k: f(v) for k, v in mean_slope.items()})
    return {"cell_elevation": z0, "slope_per_100m": mean_slope}


# ---------------------------------------------------------------- T4
def t4(today, slopes):
    print("\n== T4  cell + correction vs direct call at the point (archive, 60 days) ==")
    end = today - timedelta(days=10)
    start = end - timedelta(days=59)
    out = []
    for name, lat, lon in POINTS:
        common = dict(latitude=lat, longitude=lon, daily=DAILY, hourly=HOURLY_AR,
                      start_date=iso(start), end_date=iso(end), timezone=TZ)
        cell_raw = api(ARCHIVE, elevation="nan", **common)
        direct_raw = api(ARCHIVE, **common)
        cell, direct = parse(cell_raw), parse(direct_raw)
        dz100 = (direct_raw["elevation"] - cell_raw["elevation"]) / 100
        corrected = {}
        for day, row in cell.items():
            new = dict(row)
            for k in CORRECTED:
                if row[k] is not None and slopes.get(k) is not None:
                    v = row[k] + slopes[k] * dz100
                    new[k] = min(100.0, max(0.0, v)) if k == "rh" else v
            corrected[day] = new
        same_cell = (cell_raw["latitude"], cell_raw["longitude"]) == (
            direct_raw["latitude"], direct_raw["longitude"])
        print(f"  {name}: point elev {direct_raw['elevation']} m, cell elev "
              f"{cell_raw['elevation']} m (dz {dz100 * 100:+.0f} m), same grid cell: {same_cell}")
        rec = {"name": name, "dz_m": dz100 * 100, "same_cell": same_cell, "vars": {}}
        for k in KEYS:
            _, b0, m0 = compare(cell, direct, k)
            _, b1, m1 = compare(corrected, direct, k)
            rec["vars"][k] = {"raw_bias": b0, "raw_mae": m0, "corr_bias": b1, "corr_mae": m1}
            tail = f"   corrected bias {f(b1)} mae {f(m1)}" if k in CORRECTED else ""
            print(f"    {k:6s} cell-only bias {f(b0)} mae {f(m0)}{tail}")
        out.append(rec)
    return out


def null_ranges(rows, key):
    out = []
    for day in sorted(rows):
        if rows[day][key] is not None:
            continue
        if out and (date.fromisoformat(day) - date.fromisoformat(out[-1][1])).days == 1:
            out[-1][1] = day
        else:
            out.append([day, day])
    return [f"{a}..{b}" if a != b else a for a, b in out]


def t5(today):
    print("\n== T5  seam: archive vs forecast API on the same past days (30 days) ==")
    end = today - timedelta(days=9)
    start = end - timedelta(days=29)
    common = dict(daily=DAILY, start_date=iso(start), end_date=iso(end), timezone=TZ)
    names = ["V1 @point elev=nan", "V2 @cell elev=nan", "V3 @cell elev=cell mean"]
    agg = {v: {k: [] for k in KEYS} for v in names}
    ratio = {v: [] for v in names}
    valid = {v: 0 for v in names}
    per_point = []
    for name, lat, lon in POINTS5:
        a_raw = api(ARCHIVE, latitude=lat, longitude=lon, hourly=HOURLY_AR,
                    elevation="nan", **common)
        arch = parse(a_raw)
        glat, glon, z = a_raw["latitude"], a_raw["longitude"], a_raw["elevation"]
        print(f"  {name}: archive cell {glat:.4f},{glon:.4f}, mean elevation {z} m")
        variants = {
            names[0]: dict(latitude=lat, longitude=lon, elevation="nan"),
            names[1]: dict(latitude=glat, longitude=glon, elevation="nan"),
            names[2]: dict(latitude=glat, longitude=glon, elevation=z),
        }
        rec = {"name": name, "cell": [glat, glon], "cell_elev": z, "variants": {}}
        for v, extra in variants.items():
            try:
                fr = parse(api(FORECAST, hourly=HOURLY_FC, **extra, **common))
            except RuntimeError as exc:
                print(f"    {v}: failed ({exc})")
                rec["variants"][v] = {"error": str(exc)}
                continue
            n_ok = sum(1 for d in arch if fr.get(d, {}).get("tmean") is not None)
            valid[v] += n_ok
            stats = {}
            for k in KEYS:
                _, bias, mae = compare(fr, arch, k)
                stats[k] = (bias, mae)
                if bias is not None:
                    agg[v][k].append((bias, mae))
            both = [d for d in arch if d in fr and fr[d]["rain"] is not None
                    and arch[d]["rain"] is not None]
            ra = sum(arch[d]["rain"] for d in both)
            rf = sum(fr[d]["rain"] for d in both)
            rr = rf / ra if ra > 0 else None
            if rr is not None:
                ratio[v].append(rr)
            print(f"    {v}: valid {n_ok}/{len(arch)} days, rain F/A {f(rr)} "
                  f"({rf:.0f} vs {ra:.0f} mm), tmean {f(stats['tmean'][0])}, "
                  f"tmin {f(stats['tmin'][0])}, soil {f(stats['soil'][0])}, "
                  f"rh {f(stats['rh'][0])}")
            rec["variants"][v] = {"valid": n_ok, "rain_ratio": rr, "stats": stats}
        per_point.append(rec)
    print("\n  Mean over points (forecast - archive), bias/mean abs diff; rain = sum F / sum A")
    summary = {}
    for v in names:
        row = {}
        for k in KEYS:
            vals = agg[v][k]
            row[k] = (st.mean(b for b, _ in vals), st.mean(m for _, m in vals)) if vals else None
        rr = st.mean(ratio[v]) if ratio[v] else None
        summary[v] = {"stats": row, "rain_ratio": rr, "valid_days": valid[v]}
        cells = ", ".join(f"{k} {f(row[k][0])}/{f(row[k][1])}" for k in KEYS if row[k])
        print(f"  {v} (valid days {valid[v]}): rain F/A {f(rr)}; {cells}")

    print("\n  Null days in the forecast API's past (La Molina, elevation=nan):")
    base = dict(latitude=42.336, longitude=1.946, daily=DAILY, hourly=HOURLY_FC,
                elevation="nan", timezone=TZ)
    attempts = {
        "past_days=92": dict(past_days=92, forecast_days=1),
        "start/end (today-92 .. today-1)": dict(
            start_date=iso(today - timedelta(days=92)), end_date=iso(today - timedelta(days=1))),
    }
    nulls = {}
    for label, extra in attempts.items():
        try:
            rows = parse(api(FORECAST, **base, **extra))
        except RuntimeError as exc:
            print(f"    {label}: failed ({exc})")
            nulls[label] = {"error": str(exc)}
            continue
        n_null = sum(1 for r in rows.values() if r["tmean"] is None)
        r_t, r_s = null_ranges(rows, "tmean"), null_ranges(rows, "soil")
        print(f"    {label}: {len(rows)} days; tmean null on {n_null}: {r_t or 'none'}; "
              f"soil null: {r_s or 'none'}")
        nulls[label] = {"days": len(rows), "tmean_null": r_t, "soil_null": r_s}
    return {"summary": summary, "per_point": per_point, "nulls": nulls}


# ---------------------------------------------------------------- synthetic data (--selftest)
def fake_get(url, params):
    lat, lon = float(params["latitude"]), float(params["longitude"])
    glat, glon = round(round(lat / 0.1) * 0.1, 2), round(round(lon / 0.1) * 0.1, 2)
    cell_elev = 1200 + 300 * math.sin(glat * 10)
    if params.get("elevation") == "nan":
        elev = cell_elev
    elif "elevation" in params:
        elev = float(params["elevation"])
    else:
        elev = cell_elev + 150 * math.cos(lon * 20)
    if "start_date" in params:
        d0, d1 = date.fromisoformat(params["start_date"]), date.fromisoformat(params["end_date"])
        dates = [d0 + timedelta(days=i) for i in range((d1 - d0).days + 1)]
    else:
        today = date.today()
        n_past, n_fc = params.get("past_days", 0), params.get("forecast_days", 7)
        dates = [today + timedelta(days=i) for i in range(-n_past, n_fc)]
    daily = {"time": [iso(d) for d in dates]}
    seas = [d.toordinal() for d in dates]
    tm = [12 - 0.0065 * elev + 3 * math.sin(o / 5) for o in seas]
    daily["temperature_2m_mean"] = tm
    daily["temperature_2m_max"] = [t + 4 for t in tm]
    daily["temperature_2m_min"] = [t - 4 for t in tm]
    daily["precipitation_sum"] = [8.0 if (o + int(glat * 100)) % 7 == 0 else 0.0 for o in seas]
    daily["windspeed_10m_max"] = [20 + 0.001 * elev for _ in seas]
    out = {"latitude": glat, "longitude": glon, "elevation": round(elev), "daily": daily}
    if "hourly" in params:
        keys = params["hourly"].split(",")
        hours = [f"{iso(d)}T{h:02d}:00" for d in dates for h in range(24)]
        hourly = {"time": hours}
        for key in keys:
            if key.startswith("soil"):
                hourly[key] = [tm[i // 24] + 1 for i in range(len(hours))]
            else:
                hourly[key] = [70 + 0.004 * elev for _ in hours]
        out["hourly"] = hourly
    if url == FORECAST:
        daily["precipitation_sum"] = [v * 0.7 for v in daily["precipitation_sum"]]
        if len(dates) > 60:
            for key in daily:
                if key != "time":
                    for i in range(5):
                        daily[key][i] = None
            for key in out.get("hourly", {}):
                if key != "time":
                    for i in range(5 * 24):
                        out["hourly"][key][i] = None
    return out


# ---------------------------------------------------------------- main
def main():
    global FAKE
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--out", help="write all results to this JSON file")
    ap.add_argument("--only", default="t1,t2,t3,t4", help="comma list, e.g. t1,t3")
    ap.add_argument("--selftest", action="store_true", help="synthetic data, no network")
    args = ap.parse_args()
    FAKE = args.selftest
    only = {s.strip().lower() for s in args.only.split(",")}
    today = date.today()
    results = {"date": iso(today), "selftest": FAKE}
    slopes = None
    if "t1" in only:
        results["t1"] = t1(today)
    if "t2" in only:
        results["t2"] = t2(today)
    if "t3" in only or "t4" in only:
        results["t3"] = t3(today)
        slopes = results["t3"]["slope_per_100m"]
    if "t4" in only:
        results["t4"] = t4(today, slopes)
    if "t5" in only:
        results["t5"] = t5(today)
    print(f"\nRequests: {STATS['requests']}, estimated call weight: {STATS['weight']:.0f}")
    if args.out:
        with open(args.out, "w", encoding="utf-8") as fh:
            json.dump(results, fh, indent=2, default=str)
        print("Results written to", args.out)


if __name__ == "__main__":
    main()
