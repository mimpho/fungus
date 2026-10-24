"""
Seed script (Phase 2): imports zones and species from the frontend mock data into PostgreSQL.

Reads the JS mock files via a Node.js export step, then upserts rows into the DB.
Run after the initial migration and before the first backfill.

Usage:
    cd backend
    python -m scripts.seed_catalog                         # default: ../src/data
    python -m scripts.seed_catalog --mock-dir ../src/data  # explicit path
    python -m scripts.seed_catalog --dry-run               # print without writing

Guard rails (2026-10-24: a run from a terminal without DATABASE_URL read backend/.env, which
points at production, and overwrote the curated zones and wiped the species' extra_data):
  * It writes only to a LOCAL database (localhost / 127.0.0.1 / ::1). A remote one needs
    --allow-remote, and the host it is about to write to is always printed first.
  * Zones are insert-only: an existing zone is left as it is. --overwrite-zones replaces the
    mock's fields (name, coordinates, elevation, forest type, description) of the zones it lists.
  * A species' extra_data is merged over the stored one: keys the mock does not have (synonyms,
    confusions, translations, fruiting conditions) are kept. The numeric columns still come
    from the mock.
"""
import argparse
import asyncio
import json
import logging
import subprocess
import sys
from pathlib import Path

from sqlalchemy import cast, func, literal
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.engine import make_url

from app.config import settings
from app.database import AsyncSessionLocal
from app.models.species import Species
from app.models.zone import Zone

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s — %(message)s")
log = logging.getLogger("seed")

# ── Node.js export helper ──────────────────────────────────────────────────────

def _export_mock_to_json(mock_dir: Path) -> tuple[list[dict], list[dict]]:
    """
    Use Node.js to evaluate the ESM mock files and export them to JSON.
    The export script is written to /tmp with absolute import paths so it
    can be executed from anywhere without EPERM issues on the mounted source.
    Requires Node.js >= 18 in PATH.
    """
    out_zones = Path("/tmp/fungus_zones_export.json")
    out_species = Path("/tmp/fungus_species_export.json")
    export_script = Path("/tmp/fungus_seed_export.mjs")

    # Use absolute file:// URLs for imports — required when script is outside mock_dir
    zones_abs = mock_dir / "zones.js"
    species_abs = mock_dir / "species.js"
    script = (
        f"import {{ mockZones }} from 'file://{zones_abs}';\n"
        f"import {{ mockSpecies }} from 'file://{species_abs}';\n"
        f"import {{ writeFileSync }} from 'fs';\n"
        f"writeFileSync('{out_zones}', JSON.stringify(mockZones, null, 2));\n"
        f"writeFileSync('{out_species}', JSON.stringify(mockSpecies, null, 2));\n"
    )
    export_script.write_text(script)

    result = subprocess.run(
        ["node", str(export_script)],
        capture_output=True,
        text=True,
    )
    export_script.unlink(missing_ok=True)

    if result.returncode != 0:
        log.error("Node export failed:\n%s", result.stderr)
        sys.exit(1)

    zones_data = json.loads(out_zones.read_text())
    species_data = json.loads(out_species.read_text())
    out_zones.unlink(missing_ok=True)
    out_species.unlink(missing_ok=True)

    return zones_data, species_data


# ── Guard rails ────────────────────────────────────────────────────────────────

LOCAL_HOSTS = ("localhost", "127.0.0.1", "::1")


def check_target(database_url: str, allow_remote: bool) -> str:
    """Name the database about to be written (host and name only, never user or password) and
    refuse a remote one unless `allow_remote`. A URL without a host is a local socket."""
    url = make_url(database_url)
    host = url.host or "local socket"
    where = f"{host}/{url.database or ''}"
    local = url.host is None or url.host in LOCAL_HOSTS
    if local:
        log.info("Target database: %s (local)", where)
        return host
    if not allow_remote:
        log.error(
            "Refusing to write to a REMOTE database (%s). Point DATABASE_URL at a local one, "
            "or pass --allow-remote if you really mean it.", where,
        )
        raise SystemExit(2)
    log.warning("Target database: %s (REMOTE, --allow-remote given)", where)
    return host


def zone_statement(values: dict, overwrite: bool):
    """Insert a zone; an existing one is left alone unless `overwrite`."""
    stmt = pg_insert(Zone).values(**values)
    if not overwrite:
        return stmt.on_conflict_do_nothing(index_elements=["id"])
    fields = ("name", "province", "region", "lat", "lon", "elevation_m", "forest_type",
              "description")
    return stmt.on_conflict_do_update(
        index_elements=["id"], set_={f: values[f] for f in fields}
    )


def species_statement(values: dict):
    """Upsert a species. `extra_data` is merged over the stored one (the mock's keys win, any
    other key survives); the other columns come from the mock."""
    stmt = pg_insert(Species).values(**values)
    set_ = {k: v for k, v in values.items() if k not in ("id", "extra_data")}
    empty = cast(literal("{}"), JSONB)
    set_["extra_data"] = func.coalesce(Species.extra_data, empty).op("||")(stmt.excluded.extra_data)
    return stmt.on_conflict_do_update(index_elements=["id"], set_=set_)


# ── Seeders ────────────────────────────────────────────────────────────────────

async def seed_zones(
    db, zones_data: list[dict], dry_run: bool = False, overwrite: bool = False
) -> int:
    """
    Insert zones from mock data (existing ones untouched unless `overwrite`).

    Field mapping (mock → DB):
      id          → id
      name        → name
      province    → province
      region      → region
      lat         → lat
      lng         → lon          (mock uses 'lng', DB uses 'lon')
      elevation   → elevation_m
      forestType  → forest_type  (camelCase → snake_case)
      description → extra_data.description
    """
    count = 0
    for z in zones_data:
        values = dict(
            id=z["id"],
            name=z["name"],
            province=z.get("province", ""),
            region=z.get("region", ""),
            lat=z["lat"],
            lon=z["lng"],
            elevation_m=z.get("elevation"),
            forest_type=z.get("forestType"),
            description=z.get("description"),
            active=True,
        )
        if dry_run:
            log.info("[DRY-RUN] zone %s — %s", values["id"], values["name"])
        else:
            stmt = zone_statement(values, overwrite)
            await db.execute(stmt)
        count += 1

    if not dry_run:
        await db.commit()
    return count


async def seed_species(db, species_data: list[dict], dry_run: bool = False) -> int:
    """
    Upsert species from mock data.

    OI biological field mapping (mock → DB):
      temp_optima_min          → temp_min_c
      temp_optima_max          → temp_max_c
      (temp_optima_min+max)/2  → temp_opt_c   (derived midpoint)
      precip_14dias_min        → rain_min_mm
      precip_14dias_max        → rain_opt_mm   (best-effort: upper bound as optimum)
      dias_hasta_fructificacion→ cycle_days
      altitud_min              → elevation_min_m
      altitud_max              → elevation_max_m

    Everything else goes to extra_data (photos, morphology, confusions, etc.).
    """
    count = 0
    for s in species_data:
        temp_min = s.get("temp_optima_min")
        temp_max = s.get("temp_optima_max")
        temp_opt = (
            round((temp_min + temp_max) / 2, 1)
            if temp_min is not None and temp_max is not None
            else None
        )
        precip_min = s.get("precip_14dias_min")
        precip_max = s.get("precip_14dias_max")

        extra: dict = {}
        for field in (
            "commonNames", "photo", "photos",
            "description", "sporePrint", "distribucion",
            "cap", "stem", "flesh",
            "humedad_min", "humedad_optima",
            "ph_suelo_min", "ph_suelo_max",
            "requiere_helada", "requiere_choque_termico",
        ):
            value = s.get(field)
            if value is not None:
                extra[field] = value

        values = dict(
            id=s["id"],
            scientific_name=s.get("scientificName", ""),
            family=s.get("family", ""),
            edibility=s.get("edibility", "unknown"),
            temp_min_c=temp_min,
            temp_opt_c=temp_opt,
            temp_max_c=temp_max,
            rain_min_mm=int(precip_min) if precip_min is not None else None,
            rain_opt_mm=int(precip_max) if precip_max is not None else None,
            cycle_days=s.get("dias_hasta_fructificacion"),
            forest_types=s.get("forestTypes", []),
            fruiting_months=s.get("fruitingMonths", []),
            elevation_min_m=s.get("altitud_min"),
            elevation_max_m=s.get("altitud_max"),
            extra_data=extra or None,
        )

        if dry_run:
            log.info(
                "[DRY-RUN] species %s — %s (temp %.1f–%.1f °C, cycle %s d)",
                values["id"],
                values["scientific_name"],
                temp_min or 0,
                temp_max or 0,
                values["cycle_days"],
            )
        else:
            stmt = species_statement(values)
            await db.execute(stmt)
        count += 1

    if not dry_run:
        await db.commit()
    return count


# ── Entrypoint ─────────────────────────────────────────────────────────────────

async def main(
    mock_dir: Path, dry_run: bool, allow_remote: bool = False, overwrite_zones: bool = False
) -> None:
    log.info("Reading mock data from %s", mock_dir)
    zones_data, species_data = _export_mock_to_json(mock_dir)
    log.info("Loaded %d zones, %d species from mock", len(zones_data), len(species_data))

    if dry_run:
        log.info("--- DRY RUN — no DB writes ---")
        await seed_zones(None, zones_data, dry_run=True)
        await seed_species(None, species_data, dry_run=True)
        return

    check_target(settings.database_url, allow_remote)
    async with AsyncSessionLocal() as db:
        z_count = await seed_zones(db, zones_data, overwrite=overwrite_zones)
        s_count = await seed_species(db, species_data)

    log.info("✓ Seeded %d zones and %d species", z_count, s_count)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed PostgreSQL from frontend mock data")
    parser.add_argument(
        "--mock-dir",
        default="../src/data",
        help="Path to the frontend src/data/ directory (default: ../src/data)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print what would be seeded without touching the DB",
    )
    parser.add_argument(
        "--allow-remote",
        action="store_true",
        help="Allow writing to a database that is not local (default: refused)",
    )
    parser.add_argument(
        "--overwrite-zones",
        action="store_true",
        help="Replace the mock's fields of zones that already exist (default: leave them)",
    )
    args = parser.parse_args()
    asyncio.run(
        main(Path(args.mock_dir).resolve(), args.dry_run, args.allow_remote, args.overwrite_zones)
    )
