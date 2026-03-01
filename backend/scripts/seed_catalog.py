"""
Seed script (Phase 2): imports zones and species from the frontend mock data into PostgreSQL.

Reads the JS mock files via a small JSON export step, then inserts rows into the DB.
Run after the initial migration and before the first backfill.

Usage:
    cd backend
    python -m scripts.seed_catalog --mock-dir ../src/data
"""
import argparse
import asyncio
import json
import logging
import subprocess
import sys
from pathlib import Path

from sqlalchemy.dialects.postgresql import insert as pg_insert

from app.database import AsyncSessionLocal
from app.models.zone import Zone
from app.models.species import Species

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s — %(message)s")
log = logging.getLogger("seed")


def _export_mock_to_json(mock_dir: Path, output_dir: Path) -> None:
    """
    Use Node.js to export the JS mock files to JSON.
    Requires Node.js available in PATH.
    """
    script = """
    import { mockZones } from './zones.js';
    import { mockSpecies } from './species.js';
    import { writeFileSync } from 'fs';
    writeFileSync('zones.json', JSON.stringify(mockZones, null, 2));
    writeFileSync('species.json', JSON.stringify(mockSpecies, null, 2));
    console.log('Exported zones and species to JSON');
    """
    export_path = output_dir / "_export_mock.mjs"
    export_path.write_text(script)
    result = subprocess.run(
        ["node", str(export_path)],
        cwd=str(mock_dir),
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        log.error("Node export failed:\n%s", result.stderr)
        sys.exit(1)
    export_path.unlink()


async def seed_zones(db, zones_data: list[dict]) -> int:
    inserted = 0
    for z in zones_data:
        stmt = (
            pg_insert(Zone)
            .values(
                id=z["id"],
                name=z["name"],
                province=z.get("province", ""),
                region=z.get("region", ""),
                lat=z["lat"],
                lon=z["lng"],  # mock uses 'lng', DB uses 'lon'
                elevation_m=z.get("elevation"),
                forest_type=z.get("forestType"),
                active=True,
            )
            .on_conflict_do_nothing()
        )
        await db.execute(stmt)
        inserted += 1
    await db.commit()
    return inserted


async def seed_species(db, species_data: list[dict]) -> int:
    inserted = 0
    for s in species_data:
        stmt = (
            pg_insert(Species)
            .values(
                id=s["id"],
                scientific_name=s.get("scientificName", ""),
                family=s.get("family", ""),
                edibility=s.get("edibility", "unknown"),
                temp_min_c=s.get("optimalConditions", {}).get("tempMin"),
                temp_opt_c=s.get("optimalConditions", {}).get("tempOpt"),
                temp_max_c=s.get("optimalConditions", {}).get("tempMax"),
                rain_min_mm=s.get("optimalConditions", {}).get("rainMin"),
                forest_types=s.get("forestTypes", []),
                fruiting_months=s.get("fruitingMonths", []),
                elevation_min_m=s.get("elevationMin"),
                elevation_max_m=s.get("elevationMax"),
                extra_data={
                    "commonNames": s.get("commonNames", []),
                    "photo": s.get("photo"),
                    "photos": s.get("photos", []),
                    "morphology": s.get("morphology"),
                    "confusions": s.get("confusions", []),
                    "description": s.get("description"),
                },
            )
            .on_conflict_do_nothing()
        )
        await db.execute(stmt)
        inserted += 1
    await db.commit()
    return inserted


async def main(mock_dir: Path) -> None:
    tmp = Path("/tmp/fungus_seed")
    tmp.mkdir(exist_ok=True)
    _export_mock_to_json(mock_dir, tmp)

    zones_data = json.loads((mock_dir / "zones.json").read_text())
    species_data = json.loads((mock_dir / "species.json").read_text())

    async with AsyncSessionLocal() as db:
        z_count = await seed_zones(db, zones_data)
        s_count = await seed_species(db, species_data)

    log.info("Seeded %d zones and %d species", z_count, s_count)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed DB from frontend mock data")
    parser.add_argument(
        "--mock-dir",
        default="../src/data",
        help="Path to the frontend src/data/ directory",
    )
    args = parser.parse_args()
    asyncio.run(main(Path(args.mock_dir).resolve()))
