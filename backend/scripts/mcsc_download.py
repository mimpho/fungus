"""Download the CREAF MCSC-4 shapefile sheets of Catalonia (one zip per sheet).

    cd backend
    python -m scripts.mcsc_download --dest ../local-data/mcsc            # all the sheets
    python -m scripts.mcsc_download --dest ../local-data/mcsc --only 36321 36322
    python -m scripts.mcsc_download --list                              # names only, no network

Each zip is unpacked into `<dest>/<sheet>/`, where `mcsc_preprocess` finds its `.shp`. It
resumes: a sheet whose folder already holds a `.shp` is skipped, so it can be stopped and
relaunched. A failed sheet is retried and, if it still fails, listed at the end (exit code 1).
Standard library only. The sheets are never committed (licence unconfirmed, see
memory/decisions.md): keep `--dest` inside `local-data/`.

The names come from the clickable map of https://www.mcsc.creaf.cat/map-mcscshp4.htm: the 296
sheets that have their own zip (9 more are included in a neighbouring sheet).
"""

from __future__ import annotations

import argparse
import shutil
import sys
import time
import urllib.error
import urllib.request
import zipfile
from collections.abc import Sequence
from pathlib import Path

BASE_URL = "https://www.mcsc.creaf.cat/shp4/"
USER_AGENT = "fungus-mcsc-download/1.0 (personal project; one request at a time)"
TIMEOUT_S = 120
RETRIES = 3
PAUSE_S = 0.5

SHEETS = (
    "118B22", "14821", "14822", "14911", "14912", "14921", "14922", "15012", "15022",
    "18021", "18022", "18111", "18112", "18121", "18122", "18211", "18212", "18221",
    "18222", "21321", "21322", "21411", "21412", "21421", "21422", "21511", "21512",
    "21521", "21522", "21611", "21612", "21621", "21622", "21711", "21712", "21721",
    "21722", "21811", "21812", "21822", "21912", "21921", "21922", "22011", "22012",
    "22021", "22022", "22111", "22112", "25121", "25122", "25211", "25212", "25221",
    "25222", "25311", "25312", "25321", "25322", "25411", "25412", "25421", "25422",
    "25511", "25512", "25521", "25522", "25611", "25612", "25621", "25622", "25711",
    "25712", "25721", "25722", "25811", "25812", "25821", "25822", "25911", "25912",
    "28921", "28922", "29011", "29012", "29021", "29022", "29111", "29112", "29121",
    "29122", "29211", "29212", "29221", "29222", "29311", "29312", "29321", "29322",
    "29411", "29412", "29421", "29422", "29511", "29512", "29521", "29522", "29611",
    "29612", "29621", "29622", "29711", "29712", "32711", "32712", "32721", "32722",
    "32811", "32812", "32821", "32822", "32911", "32912", "32921", "32922", "33011",
    "33012", "33021", "33022", "33111", "33112", "33121", "33122", "33211", "33212",
    "33221", "33222", "33311", "33312", "33321", "33322", "33411", "33412", "33421",
    "33422", "33511", "33512", "35821", "35822", "35911", "35912", "35921", "35922",
    "36011", "36012", "36021", "36022", "36111", "36112", "36121", "36122", "36211",
    "36212", "36221", "36222", "36311", "36312", "36321", "36322", "36411", "36412",
    "36421", "36422", "36511", "36512", "36521", "36522", "36611", "36612", "36621",
    "38721", "38722", "38811", "38812", "38821", "38822", "38911", "38912", "38921",
    "38922", "39011", "39012", "39021", "39022", "39111", "39112", "39121", "39122",
    "39211", "39212", "39221", "39222", "39311", "39312", "39321", "39322", "39411",
    "39412", "39421", "41521", "41522", "41611", "41612", "41621", "41622", "41711",
    "41712", "41721", "41722", "41811", "41812", "41821", "41822", "41911", "41912",
    "41921", "41922", "42011", "42012", "42021", "42022", "42111", "42112", "42121",
    "44321", "44322", "44411", "44412", "44421", "44422", "44511", "44512", "44521",
    "44522", "44611", "44612", "44621", "44622", "44711", "44712", "44721", "44722",
    "44811", "44812", "44821", "47011", "47012", "47021", "47022", "47111", "47112",
    "47121", "47122", "47211", "47212", "47221", "47222", "47311", "47312", "47321",
    "49611", "49612", "49621", "49622", "49711", "49712", "49721", "49722", "49811",
    "49812", "52111", "52112", "52121", "52122", "52211", "52212", "52221", "52222",
    "52312", "54611", "54621", "54622", "54711", "54712", "54721", "54722",
)


def is_done(folder: Path) -> bool:
    return folder.is_dir() and any(folder.glob("**/*.shp"))


def safe_extract(archive: zipfile.ZipFile, folder: Path) -> None:
    """Unpack, refusing any member that would land outside `folder`."""
    root = folder.resolve()
    for member in archive.infolist():
        target = (folder / member.filename).resolve()
        if root != target and root not in target.parents:
            raise ValueError(f"unsafe path in zip: {member.filename}")
    archive.extractall(folder)


def fetch(sheet: str, dest: Path) -> str:
    """Download and unpack one sheet; returns a short note. Raises on failure."""
    folder = dest / sheet
    zip_path = dest / f"{sheet}.zip.part"
    request = urllib.request.Request(f"{BASE_URL}{sheet}.zip", headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=TIMEOUT_S) as resp, open(zip_path, "wb") as out:
        shutil.copyfileobj(resp, out)
    try:
        with zipfile.ZipFile(zip_path) as archive:
            if archive.testzip() is not None:
                raise zipfile.BadZipFile("corrupt member")
            if folder.exists():
                shutil.rmtree(folder)
            safe_extract(archive, folder)
    finally:
        zip_path.unlink(missing_ok=True)
    shapes = list(folder.glob("**/*.shp"))
    if not shapes:
        raise ValueError("no .shp inside the zip")
    missing = [p.name for p in shapes if not p.with_suffix(".prj").exists()]
    return f"{len(shapes)} shp" + (f", NO .prj for {', '.join(missing)}" if missing else "")


def download(sheets: Sequence[str], dest: Path) -> list[str]:
    dest.mkdir(parents=True, exist_ok=True)
    failed: list[str] = []
    todo = [s for s in sheets if not is_done(dest / s)]
    print(f"{len(sheets)} sheets, {len(sheets) - len(todo)} already there, {len(todo)} to download")
    for n, sheet in enumerate(todo, start=1):
        for attempt in range(1, RETRIES + 1):
            try:
                note = fetch(sheet, dest)
                print(f"[{n}/{len(todo)}] {sheet}: ok ({note})", flush=True)
                break
            except (urllib.error.URLError, OSError, ValueError, zipfile.BadZipFile) as err:
                print(f"[{n}/{len(todo)}] {sheet}: attempt {attempt}/{RETRIES} failed: {err}",
                      flush=True)
                time.sleep(2 * attempt)
        else:
            failed.append(sheet)
        time.sleep(PAUSE_S)
    return failed


def main(argv: Sequence[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--dest", default="../local-data/mcsc", help="folder for the sheets")
    ap.add_argument("--only", nargs="+", metavar="SHEET", help="only these sheets")
    ap.add_argument("--list", action="store_true", help="print the sheet names and exit")
    args = ap.parse_args(argv)
    sheets = SHEETS
    if args.only:
        unknown = sorted(set(args.only) - set(SHEETS))
        if unknown:
            ap.error(f"unknown sheets: {', '.join(unknown)}")
        sheets = tuple(args.only)
    if args.list:
        print("\n".join(sheets))
        return 0
    failed = download(sheets, Path(args.dest).expanduser())
    if failed:
        print(f"\n{len(failed)} failed (run again to retry): {' '.join(failed)}")
        return 1
    print("\nAll sheets downloaded. Next: python -m scripts.mcsc_preprocess "
          f"--dirs {args.dest} --out ../local-data/mcsc-grid")
    return 0


if __name__ == "__main__":
    sys.exit(main())
